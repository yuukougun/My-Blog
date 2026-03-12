import { Client } from "@notionhq/client";
import { mapNotionProject } from "@/lib/content/mapper";
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

function normalizeRawPage(page: NotionPageResult): RawNotionProject {
  const properties = page.properties ?? {};

  return {
    id: page.id,
    slug: getTextFromRichTextProperty(properties.slug),
    title: getTextFromTitleProperty(properties.title),
    summary: getTextFromRichTextProperty(properties.summary),
    coverImage: page.cover?.external?.url ?? page.cover?.file?.url,
    publishedAt: getTextFromRichTextProperty(properties.publishedAt),
    tags: getMultiSelectNames(properties.tags),
    bodyMarkdown: getTextFromRichTextProperty(properties.bodyMarkdown),
    repositoryUrl: getTextFromRichTextProperty(properties.repositoryUrl),
    demoUrl: getTextFromRichTextProperty(properties.demoUrl),
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

  const response = await withRetry(
    () =>
      notion.search({
        query: "",
        page_size: 100,
        filter: {
          property: "object",
          value: "page",
        },
      }),
    { maxAttempts: 3, initialDelayMs: 400 },
  );

  const rawProjects = (response.results as NotionPageResult[])
    .filter((entry) => entry.parent?.database_id === databaseId)
    .map(normalizeRawPage);
  return rawProjects.map(mapNotionProject);
}

export async function fetchProjectBySlug(slug: string): Promise<ProjectItem | null> {
  const projects = await fetchProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function getStaticProjectParams(): Promise<Array<{ id: string }>> {
  const projects = await fetchProjects();
  return projects.map((project) => ({ id: project.slug }));
}
