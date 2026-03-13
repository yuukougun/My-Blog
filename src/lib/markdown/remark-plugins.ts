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
  let idx = 0;
  for (const line of lines) {
    const match = /^(#{2,4})\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const level = Math.min(4, Math.max(2, match[1].length)) as 2 | 3 | 4;
    const text = match[2].trim();
    let id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    if (!id) id = `toc-${idx}`;
    items.push({ id, text, level });
    idx++;
  }
  return items;
}

// rehypeプラグイン: h2/h3/h4にid属性を付与
import { visit } from "unist-util-visit";
function rehypeAddHeadingIds(toc: TocItem[]) {
  let idx = 0;
  return (tree: any) => {
    if (!tree) return;
    visit(tree, "element", (node: any) => {
      if (!node || typeof node !== "object" || !("tagName" in node)) return;
      if (["h2", "h3", "h4"].includes(node.tagName)) {
        const tocItem = toc[idx];
        if (tocItem) {
          node.properties = node.properties || {};
          node.properties.id = tocItem.id;
          idx++;
        }
      }
    });
  };
}
export async function renderMarkdown(markdown: string): Promise<{ html: string; toc: TocItem[] }> {
  const preprocessed = preprocessMessageBlocks(markdown);
  const toc = extractToc(preprocessed);

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeAddHeadingIds(toc))
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
