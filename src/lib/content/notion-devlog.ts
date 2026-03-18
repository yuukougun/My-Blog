import { Client } from "@notionhq/client";
import { mapDevLog } from "@/lib/content/mapper";
import { fetchProjectPageMarkdown } from "@/lib/content/notion-md";
import { saveNotionMarkdown } from "@/lib/content/save-notion-md";
import { extractOverviewSection } from "@/lib/content/extractOverviewSection";
import type { DevLogItem } from "@/types/content";

const REQUIRED_NOTION_ENV = ["NOTION_TOKEN", "NOTION_DEVLOG_DATABASE_ID"] as const;

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

export async function fetchDevLogsFromNotion(): Promise<DevLogItem[]> {
  const notion = getNotionClient();
  const databaseId = process.env.NOTION_DEVLOG_DATABASE_ID!;
  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  });
  const rawPages = (response as { results: any[] }).results;
  const devlogs: DevLogItem[] = [];
  for (const page of rawPages) {
    const properties = page.properties ?? {};
    const id = page.id;
    const slug = getTextFromRichTextProperty(properties.slug) || id;
    const title = getTextFromTitleProperty(properties.page) || "Untitled";
    // Notionページ本文Markdownを取得
    let bodyMarkdown = "";
    try {
      bodyMarkdown = await fetchProjectPageMarkdown(id);
      await saveNotionMarkdown(id, bodyMarkdown);
    } catch {
      bodyMarkdown = "";
    }
    // 概要見出しからsummary抽出＆本文から除去
    let summary = extractOverviewSection(bodyMarkdown) || "";
    let bodyWithoutOverview = bodyMarkdown;
    if (bodyMarkdown && summary) {
      const unified = (await import("unified")).unified;
      const remarkParse = (await import("remark-parse")).default;
      const remarkStringify = (await import("remark-stringify")).default;
      const tree = unified().use(remarkParse).parse(bodyMarkdown);
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
    }
    const coverImage = undefined;
    const publishedAt = properties.publishedAt?.created_time || "";
    const tags = getMultiSelectNames(properties.tags);
    // scrap-linkプロパティの型を問わず値を取得
    let scrapLink: string | undefined = undefined;
    const prop = properties["scrap-link"] || properties.scrapLink;
    if (prop) {
      if (typeof prop === "object" && prop !== null && "url" in prop && typeof prop.url === "string") {
        scrapLink = prop.url;
      } else if (typeof prop === "object") {
        // RichText型など
        scrapLink = getTextFromRichTextProperty(prop);
      } else if (typeof prop === "string") {
        scrapLink = prop;
      }
    }
    devlogs.push(
      mapDevLog({
        id,
        slug,
        title,
        summary,
        coverImage,
        publishedAt,
        tags,
        bodyMarkdown: bodyWithoutOverview,
        source: "markdown",
        scrapLink,
      })
    );
  }
  return devlogs;
}
