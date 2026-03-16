import { Client } from "@notionhq/client";
import { mapNotionProject } from "@/lib/content/mapper";
import { fetchProjectPageMarkdown } from "@/lib/content/notion-md";
import { saveNotionMarkdown } from "@/lib/content/save-notion-md";
import { withRetry } from "@/lib/content/retry";
import { extractOverviewSection } from "./extractOverviewSection";
import { generateProjectTopImage } from "@/lib/content/generateProjectTopImage";
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


async function normalizeRawPageWithMarkdown(page: NotionPageResult): Promise<RawNotionProject> {
  const properties = page.properties ?? {};
  let bodyMarkdown = "";
  try {
    bodyMarkdown = await fetchProjectPageMarkdown(page.id);
    // 取得したMarkdownをローカルに保存
    await saveNotionMarkdown(page.id, bodyMarkdown);
  } catch {
    bodyMarkdown = "";
  }
  // publishedAt: created_time型から取得
  let publishedAt: string | undefined = undefined;
  const publishedAtProp = properties.publishedAt;
  if (publishedAtProp && typeof publishedAtProp === "object" && "created_time" in publishedAtProp) {
    publishedAt = (publishedAtProp as { created_time: string }).created_time;
  }
  // summary: Markdownをパースして「概要」見出し直下から次の見出しまでを抽出
  let summary = undefined;
  let bodyWithoutOverview = bodyMarkdown;
  if (bodyMarkdown) {
    summary = extractOverviewSection(bodyMarkdown);
    if (summary) {
      // ASTで概要部分を除去
      const unified = (await import("unified")).unified;
      const remarkParse = (await import("remark-parse")).default;
      const remarkStringify = (await import("remark-stringify")).default;
      const tree = unified().use(remarkParse).parse(bodyMarkdown);
      // 概要見出しのインデックスを特定
      const children = tree.children;
      let overviewIdx = -1;
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        if (
          node.type === "heading" &&
          node.depth >= 1 && node.depth <= 4 &&
          node.children &&
          node.children.length > 0 &&
          node.children[0].type === "text" &&
          (node.children[0].value === "概要" || node.children[0].value.toLowerCase() === "overview")
        ) {
          overviewIdx = i;
          break;
        }
      }
      let nextHeadingIdx = -1;
      if (overviewIdx !== -1) {
        for (let i = overviewIdx + 1; i < children.length; i++) {
          const node = children[i];
          if (node.type === "heading" && node.depth >= 1 && node.depth <= 4) {
            nextHeadingIdx = i;
            break;
          }
        }
      }
      let newChildren;
      if (overviewIdx !== -1) {
        if (nextHeadingIdx !== -1) {
          newChildren = [
            ...children.slice(0, overviewIdx),
            ...children.slice(nextHeadingIdx)
          ];
        } else {
          newChildren = children.slice(0, overviewIdx);
        }
      } else {
        newChildren = children;
      }
      tree.children = newChildren;
      bodyWithoutOverview = unified().use(remarkStringify).stringify(tree).trim();
    } else {
      // fallback: 最初の段落
      const match = bodyMarkdown.match(/^(.*?)(\n|$)/);
      summary = match ? match[1].replace(/^#+\s*/, "").trim() : undefined;
      bodyWithoutOverview = bodyMarkdown;
    }
  }
  // title: pageカラム（Notionのタイトル列）
  let title = getTextFromTitleProperty(properties.page);
  if (!title) title = "Untitled";
  const slug = getTextFromRichTextProperty(properties.slug) || page.id;
  // 画像はprojectフォルダに保存、seedはslug
  const imagePath = `public/image/project/${slug}.png`;
  try {
    await generateProjectTopImage(title, imagePath, { seed: slug });
  } catch (e) {
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
      notion.databases.query({
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
