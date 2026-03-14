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

function generateIdFromText(text: string, idx: number): string {
  let id = text
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
  if (!id) id = `toc-${idx}`;
  return id;
}

function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = markdown.split("\n");
  let idx = 0;
  for (const line of lines) {
    const match = /^(##)\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const level = 2 as 2;
    const text = match[2].trim();
    const id = generateIdFromText(text, idx);
    items.push({ id, text, level });
    idx++;
  }
  return items;
}

// rehypeプラグイン: h2/h3/h4にid属性を付与
import { visit } from "unist-util-visit";
import type { Root } from "hast";
function rehypeAddHeadingIds() {
  let h2Count = 0;
  return (tree: Root) => {
    if (!tree) return;
    visit(tree, "element", (node) => {
      if (!node || typeof node !== "object" || !("tagName" in node)) return;
      if (node.tagName === "h2") {
        // h2のテキストからid生成（type==='text'のvalueを連結）
        const text = (node.children || [])
          .filter((c: any) => c.type === "text" && typeof c.value === "string")
          .map((c: any) => c.value)
          .join("");
        const id = generateIdFromText(text, h2Count);
        node.properties = node.properties || {};
        node.properties.id = id;
        h2Count++;
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
    .use(() => rehypeAddHeadingIds())
    .use(rehypeSanitize, {
      tagNames: [
        "div", "p", "a", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "strong", "em", "img", "hr",
        "table", "thead", "tbody", "tr", "th", "td", "del"
      ],
      attributes: {
        h2: ["id"],
        div: ["className"],
        a: ["href", "target", "rel"],
        img: ["src", "alt"],
        code: ["className"],
        table: ["className"],
        th: ["colspan", "rowspan", "scope"],
        td: ["colspan", "rowspan"],
        del: [],
      },
      clobberPrefix: "",
    })
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(preprocessed);

  return { html: String(result), toc };
}
