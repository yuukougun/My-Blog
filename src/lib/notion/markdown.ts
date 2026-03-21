import { NotionToMarkdown } from "notion-to-md";
import { getNotionClient } from "@/lib/notion/client";

/**
 * NotionページIDを指定し、ページ本文をMarkdown文字列として取得する
 */
export async function fetchProjectPageMarkdown(
  pageId: string,
): Promise<string> {
  const notion = getNotionClient();
  const n2m = new NotionToMarkdown({ notionClient: notion });
  const mdBlocks = await n2m.pageToMarkdown(pageId);
  return n2m.toMarkdownString(mdBlocks).parent;
}
