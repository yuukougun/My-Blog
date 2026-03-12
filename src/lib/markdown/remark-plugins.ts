import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import type { TocItem } from "@/types/article";

function preprocessMessageBlocks(markdown: string): string {
  const pattern = /:::message(?:\s+(\w+))?\n([\s\S]*?)\n:::/g;
  return markdown.replace(pattern, (_, variant: string | undefined, body: string) => {
    const tone = variant ?? "info";
    return `<div class="message-block message-${tone}">\n${body.trim()}\n</div>`;
  });
}

function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    const match = /^(#{2,4})\s+(.+)$/.exec(line.trim());
    if (!match) {
      continue;
    }

    const level = Math.min(4, Math.max(2, match[1].length)) as 2 | 3 | 4;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    items.push({ id, text, level });
  }

  return items;
}

export async function renderMarkdown(markdown: string): Promise<{ html: string; toc: TocItem[] }> {
  const preprocessed = preprocessMessageBlocks(markdown);
  const toc = extractToc(preprocessed);

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, {
      tagNames: ["div", "p", "a", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "strong", "em", "img", "hr"],
      attributes: {
        div: ["className"],
        a: ["href", "target", "rel"],
        img: ["src", "alt"],
        code: ["className"],
      },
    })
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(preprocessed);

  return { html: String(result), toc };
}
