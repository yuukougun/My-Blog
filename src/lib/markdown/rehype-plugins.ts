import { renderMarkdown } from "@/lib/markdown/remark-plugins";

export async function renderArticleHtml(markdown: string) {
  return renderMarkdown(markdown);
}
