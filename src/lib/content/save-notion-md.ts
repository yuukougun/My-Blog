import fs from "fs/promises";
import path from "path";

/**
 * Notionから取得したMarkdownをローカルに保存する
 * @param pageId NotionページID
 * @param markdown Markdown文字列
 */
export async function saveNotionMarkdown(pageId: string, markdown: string) {
  const dir = path.join(process.cwd(), "notion-md-cache");
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${pageId}.md`);
  await fs.writeFile(filePath, markdown, "utf-8");
  return filePath;
}
