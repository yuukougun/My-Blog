import {
  getNotionClient,
  assertNotionEnv,
  getTextFromTitleProperty,
  getTextFromRichTextProperty,
  getMultiSelectNames,
} from "@/lib/notion/client";
import { mapDevLog } from "@/lib/content/mapper";
import { fetchProjectPageMarkdown } from "@/lib/notion/markdown";
import { saveNotionMarkdown } from "@/lib/content/save-notion-md";
import {
  extractOverviewSection,
  removeOverviewSection,
} from "@/lib/content/extractOverviewSection";
import { generateTopImage } from "@/lib/content/generateTopImage";
import type { DevLogItem } from "@/types/content";

const DEVLOG_REQUIRED_ENV = [
  "NOTION_TOKEN",
  "NOTION_DEVLOG_DATABASE_ID",
] as const;

export async function fetchDevLogsFromNotion(): Promise<DevLogItem[]> {
  assertNotionEnv(DEVLOG_REQUIRED_ENV);
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

    // Notionページ本文のMarkdown取得
    let bodyMarkdown = "";
    try {
      bodyMarkdown = await fetchProjectPageMarkdown(id);
      await saveNotionMarkdown(id, bodyMarkdown);
    } catch {
      bodyMarkdown = "";
    }

    // 概要見出しからsummary抽出 & 本文から除去
    const summary = extractOverviewSection(bodyMarkdown) || "";
    const bodyWithoutOverview =
      bodyMarkdown && summary
        ? removeOverviewSection(bodyMarkdown)
        : bodyMarkdown;

    // カバー画像生成
    let coverImage: string | undefined = undefined;
    try {
      const imagePath = `public/image/devlog/${slug}.png`;
      await generateTopImage(title, imagePath, { seed: slug });
      coverImage = `/image/devlog/${slug}.png`;
    } catch {
      // 画像生成失敗時はundefinedのまま
    }

    const publishedAt = properties.publishedAt?.created_time || "";
    const tags = getMultiSelectNames(properties.tags);

    // scrap-linkプロパティの値を取得
    let scrapLink: string | undefined = undefined;
    const prop = properties["scrap-link"] || properties.scrapLink;
    if (prop) {
      if (
        typeof prop === "object" &&
        prop !== null &&
        "url" in prop &&
        typeof prop.url === "string"
      ) {
        scrapLink = prop.url;
      } else if (typeof prop === "object") {
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
      }),
    );
  }
  return devlogs;
}
