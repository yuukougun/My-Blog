import { Client } from "@notionhq/client";
import { mapNotionProject } from "@/lib/content/mapper";
import { fetchProjectPageMarkdown } from "@/lib/content/notion-md";
import { withRetry } from "@/lib/content/retry";
import type { ProjectItem } from "@/types/content";

const REQUIRED_NOTION_ENV = ["NOTION_TOKEN", "NOTION_PROJECTS_DATABASE_ID"] as const;

type RawNotionProject = {
  id: string;
  slug?: string;
  title?: string;
  summary?: string;
  coverImage?: string;
  publishedAt?: string;
  tags?: string[];
  bodyMarkdown?: string;
  repositoryUrl?: string;
  demoUrl?: string;
};

type NotionPageResult = {
  id: string;
  properties?: Record<string, unknown>;
  cover?: {
    external?: { url?: string };
    file?: { url?: string };
  };
  parent?: {
    database_id?: string;
  };
};

function assertNotionEnv() {
  const missing = REQUIRED_NOTION_ENV.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `[Notion] Missing required environment variables: ${missing.join(", ")}. Configure these before running static build.`,
    );
  }
}

function getNotionClient() {
  assertNotionEnv();
  return new Client({ auth: process.env.NOTION_TOKEN });
}

function getMockProjects(): ProjectItem[] {
  return [
    mapNotionProject({
      id: "project-sample-1",
      slug: "project-sample-1",
      title: "Project Sample",
      summary: "Notion credentials未設定時のローカル開発用サンプルです。",
      coverImage: "/image/icon_sky.png",
      publishedAt: "2026-03-12",
      bodyMarkdown: "## Overview\n\nLocal mock project body.",
    }),
  ];
}

function getTextFromTitleProperty(property: unknown): string | undefined {
  if (!property || typeof property !== "object" || !("title" in property)) {
    return undefined;
  }

  const title = (property as { title?: Array<{ plain_text?: string }> }).title;
  if (!title || title.length === 0) {
    return undefined;
  }

  return title.map((item) => item.plain_text ?? "").join("");
}

function getTextFromRichTextProperty(property: unknown): string | undefined {
  if (!property || typeof property !== "object" || !("rich_text" in property)) {
    return undefined;
  }

  const richText = (property as { rich_text?: Array<{ plain_text?: string }> }).rich_text;
  if (!richText || richText.length === 0) {
    return undefined;
  }

  return richText.map((item) => item.plain_text ?? "").join("");
}

function getMultiSelectNames(property: unknown): string[] | undefined {
  if (!property || typeof property !== "object" || !("multi_select" in property)) {
    return undefined;
  }

  const value = (property as { multi_select?: Array<{ name?: string }> }).multi_select;
  if (!value || value.length === 0) {
    return undefined;
  }

  return value.map((item) => item.name).filter((name): name is string => typeof name === "string");
}


// ページ型プロパティからリンク先ページIDを取得
function getLinkedPageId(property: unknown): string | undefined {
  if (!property || typeof property !== "object" || !("relation" in property)) return undefined;
  const rel = (property as { relation?: Array<{ id: string }> }).relation;
  if (Array.isArray(rel) && rel.length > 0 && rel[0].id) return rel[0].id;
  // ページ型プロパティがrelationでない場合（Notion API v2022-06-28以降はpage_id型）
  if (Array.isArray(property) && property.length > 0 && property[0].id) return property[0].id;
  if ((property as any).id) return (property as any).id;
  return undefined;
}

async function normalizeRawPageWithMarkdown(page: NotionPageResult): Promise<RawNotionProject> {
  const properties = page.properties ?? {};
  let bodyMarkdown = "";
  try {
    bodyMarkdown = await fetchProjectPageMarkdown(page.id);
  } catch (e) {
    bodyMarkdown = "";
  }
  // publishedAt（日付型）
  let publishedAt: string | undefined = undefined;
  const publishedAtProp = properties.publishedAt as any;
  if (publishedAtProp && typeof publishedAtProp === "object" && "date" in publishedAtProp && publishedAtProp.date?.start) {
    publishedAt = publishedAtProp.date.start;
  }
  return {
    id: page.id,
    slug: getTextFromRichTextProperty(properties.slug),
    title: getTextFromTitleProperty(properties.title),
    summary: undefined, // 概要は本文から抽出するためここでは空
    coverImage: page.cover?.external?.url ?? page.cover?.file?.url,
    publishedAt,
    tags: getMultiSelectNames(properties.tags),
    bodyMarkdown,
    repositoryUrl: undefined,
    demoUrl: undefined,
  };
}

export async function fetchProjects(): Promise<ProjectItem[]> {
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_PROJECTS_DATABASE_ID) {
    if (process.env.NOTION_ALLOW_MOCK === "true") {
      return getMockProjects();
    }
    assertNotionEnv();
  }

  const notion = getNotionClient();
  const databaseId = process.env.NOTION_PROJECTS_DATABASE_ID!;

  // notion.databases.queryでDB直指定
  const response = await withRetry(
    () =>
      (notion as any).databases.query({
        database_id: databaseId,
        page_size: 100,
        // 必要ならfilter/sort追加
      }),
    { maxAttempts: 3, initialDelayMs: 400 },
  );

  // 型アサーションで型エラーを回避
  const rawPages = (response as { results: NotionPageResult[] }).results;
  const projects: ProjectItem[] = [];
  for (const page of rawPages) {
    const raw = await normalizeRawPageWithMarkdown(page);
    projects.push(mapNotionProject(raw));
  }
  return projects;
}

export async function fetchProjectBySlug(slug: string): Promise<ProjectItem | null> {
  const projects = await fetchProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function getStaticProjectParams(): Promise<Array<{ id: string }>> {
  const projects = await fetchProjects();
  return projects.map((project) => ({ id: project.slug }));
}
