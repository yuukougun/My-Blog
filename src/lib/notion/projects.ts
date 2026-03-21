import {
  assertNotionEnv,
  getNotionClient,
  getTextFromTitleProperty,
  getTextFromRichTextProperty,
  getMultiSelectNames,
} from "@/lib/notion/client";
import { mapNotionProject } from "@/lib/content/mapper";
import { fetchProjectPageMarkdown } from "@/lib/notion/markdown";
import { saveNotionMarkdown } from "@/lib/content/save-notion-md";
import { withRetry } from "@/lib/content/retry";
import {
  extractOverviewSection,
  removeOverviewSection,
} from "@/lib/content/extractOverviewSection";
import { generateTopImage } from "@/lib/content/generateTopImage";
import type { ProjectItem } from "@/types/content";

// ── Types ──

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

// ── Mock data ──

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

// ── Notion page → RawNotionProject ──

async function normalizeRawPageWithMarkdown(
  page: NotionPageResult,
): Promise<RawNotionProject> {
  const properties = page.properties ?? {};

  // Markdown本文取得
  let bodyMarkdown = "";
  try {
    bodyMarkdown = await fetchProjectPageMarkdown(page.id);
    await saveNotionMarkdown(page.id, bodyMarkdown);
  } catch {
    bodyMarkdown = "";
  }

  // publishedAt
  let publishedAt: string | undefined = undefined;
  const publishedAtProp = properties.publishedAt;
  if (
    publishedAtProp &&
    typeof publishedAtProp === "object" &&
    "created_time" in publishedAtProp
  ) {
    publishedAt = (publishedAtProp as { created_time: string }).created_time;
  }

  // summary: 概要見出し直下を抽出
  let summary: string | undefined = undefined;
  let bodyWithoutOverview = bodyMarkdown;
  if (bodyMarkdown) {
    summary = extractOverviewSection(bodyMarkdown);
    if (summary) {
      bodyWithoutOverview = removeOverviewSection(bodyMarkdown);
    } else {
      // fallback: 最初の段落
      const match = bodyMarkdown.match(/^(.*?)(\n|$)/);
      summary = match ? match[1].replace(/^#+\s*/, "").trim() : undefined;
      bodyWithoutOverview = bodyMarkdown;
    }
  }

  // title
  let title = getTextFromTitleProperty(properties.page);
  if (!title) title = "Untitled";

  const slug = getTextFromRichTextProperty(properties.slug) || page.id;

  // カバー画像生成
  const imagePath = `public/image/project/${slug}.png`;
  try {
    await generateTopImage(title, imagePath, { seed: slug });
  } catch {
    // 画像生成失敗時は何もしない
  }

  return {
    id: page.id,
    slug,
    title,
    summary,
    coverImage: `/image/project/${slug}.png`,
    publishedAt,
    tags: getMultiSelectNames(properties.tags),
    bodyMarkdown: bodyWithoutOverview,
    repositoryUrl: undefined,
    demoUrl: undefined,
  };
}

// ── Public API ──

export async function fetchProjects(): Promise<ProjectItem[]> {
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_PROJECTS_DATABASE_ID) {
    if (process.env.NOTION_ALLOW_MOCK === "true") {
      return getMockProjects();
    }
    assertNotionEnv([
      "NOTION_TOKEN",
      "NOTION_PROJECTS_DATABASE_ID",
    ]);
  }

  const notion = getNotionClient();
  const databaseId = process.env.NOTION_PROJECTS_DATABASE_ID!;

  const response = await withRetry(
    () =>
      notion.databases.query({
        database_id: databaseId,
        page_size: 100,
      }),
    { maxAttempts: 3, initialDelayMs: 400 },
  );

  const rawPages = (response as { results: NotionPageResult[] }).results;
  const projects: ProjectItem[] = [];
  for (const page of rawPages) {
    const raw = await normalizeRawPageWithMarkdown(page);
    projects.push(mapNotionProject(raw));
  }
  return projects;
}

export async function fetchProjectBySlug(
  slug: string,
): Promise<ProjectItem | null> {
  const projects = await fetchProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function getStaticProjectParams(): Promise<
  Array<{ id: string }>
> {
  const projects = await fetchProjects();
  return projects.map((project) => ({ id: project.slug }));
}
