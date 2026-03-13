import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

const REQUIRED_NOTION_ENV = ["NOTION_TOKEN", "NOTION_PROJECTS_DATABASE_ID"] as const;

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

export async function fetchProjectPageMarkdown(pageId: string): Promise<string> {
  const notion = getNotionClient();
  const n2m = new NotionToMarkdown({ notionClient: notion });
  // notion-to-mdは再帰的に全ブロックを取得しMarkdownへ変換
  const mdBlocks = await n2m.pageToMarkdown(pageId);
  // toMarkdownStringの戻り値はMdStringObject型。parentプロパティが本文string
  return n2m.toMarkdownString(mdBlocks).parent;
}

// 作品紹介ページのNotionページIDを取得するロジックは既存のfetchProjects()等と連携して利用
