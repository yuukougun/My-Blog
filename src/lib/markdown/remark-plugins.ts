import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Root } from "hast";
import type { TocItem } from "@/types/article";

// ── Shared sanitize schema ──

const SANITIZE_SCHEMA = {
  tagNames: [
    "div", "p", "a", "code", "pre",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li", "blockquote",
    "strong", "em", "img", "hr",
    "table", "thead", "tbody", "tr", "th", "td",
    "del", "br",
  ],
  attributes: {
    h2: ["id"],
    h3: ["id"],
    div: ["className"],
    a: ["href", "target", "rel"],
    img: ["src", "alt"],
    code: ["className"],
    table: ["className"],
    th: ["colspan", "rowspan", "scope"],
    td: ["colspan", "rowspan"],
    del: [] as string[],
  },
  clobberPrefix: "",
};

// ── Preprocessing ──

/**
 * :::message 記法を HTML div に変換
 */
function preprocessMessageBlocks(markdown: string): string {
  const pattern = /:::message(?:\s+(\w+))?\n([\s\S]*?)\n:::/g;
  return markdown.replace(pattern, (_, variant: string | undefined, body: string) => {
    const tone = variant ?? "info";
    return `<div class="message-block message-${tone}">\n${body.trim()}\n</div>`;
  });
}

/**
 * 段落ごとに最後以外の行末に <br> を付与
 */
function addBrToParagraphs(markdown: string): string {
  return markdown
    .split(/\n\s*\n/)
    .map((paragraph) => {
      const lines = paragraph.split("\n");
      const isBlock = lines.every((line) =>
        /^\s*(\||- |\* |\d+\. |> |# )/.test(line),
      );
      if (isBlock) return paragraph;
      return lines
        .map((line, idx) => (idx < lines.length - 1 ? line + "<br>" : line))
        .join("\n");
    })
    .join("\n\n");
}

// ── Rehype plugins ──

/**
 * p タグ内のテキストに含まれる <br> を br ノードに変換
 */
function rehypeBrInParagraphs() {
  return (tree: Root) => {
    visit(tree, "element", (node: any) => {
      if (node.tagName === "p" && Array.isArray(node.children)) {
        const newChildren: any[] = [];
        node.children.forEach((child: any) => {
          if (
            child.type === "text" &&
            typeof child.value === "string" &&
            child.value.includes("<br>")
          ) {
            const parts: string[] = child.value.split("<br>");
            parts.forEach((part: string, idx: number) => {
              if (part) newChildren.push({ type: "text", value: part });
              if (idx < parts.length - 1) {
                newChildren.push({
                  type: "element",
                  tagName: "br",
                  properties: {},
                  children: [],
                });
              }
            });
          } else {
            newChildren.push(child);
          }
        });
        node.children = newChildren;
      }
    });
  };
}

// ── TOC extraction ──

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
    const match = /^(###?)\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const level = match[1] === "##" ? 2 : 3;
    const text = match[2].trim();
    items.push({ id: generateIdFromText(text, idx), text, level });
    idx++;
  }
  return items;
}

/**
 * h2/h3 に id 属性を付与する rehype プラグイン
 */
function rehypeAddHeadingIds() {
  let idx = 0;
  return (tree: Root) => {
    if (!tree) return;
    visit(tree, "element", (node) => {
      if (
        !node ||
        typeof node !== "object" ||
        !("tagName" in node)
      ) {
        return;
      }
      if (node.tagName === "h2" || node.tagName === "h3") {
        const text = (node.children || [])
          .filter(
            (c: any) => c.type === "text" && typeof c.value === "string",
          )
          .map((c: any) => c.value)
          .join("");
        node.properties = node.properties || {};
        node.properties.id = generateIdFromText(text, idx);
        idx++;
      }
    });
  };
}

// ── Shared pipeline builder ──

function createPipeline(options: { addHeadingIds: boolean }) {
  let pipeline = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw);

  if (options.addHeadingIds) {
    pipeline = pipeline.use(() => rehypeAddHeadingIds());
  }

  return pipeline
    .use(rehypeBrInParagraphs)
    .use(rehypeSanitize, SANITIZE_SCHEMA)
    .use(rehypeHighlight)
    .use(rehypeStringify);
}

// ── Public API ──

/**
 * Markdown を HTML に変換し、TOC も抽出する（記事本文用）
 */
export async function renderMarkdown(
  markdown: string,
): Promise<{ html: string; toc: TocItem[] }> {
  const preprocessed = addBrToParagraphs(preprocessMessageBlocks(markdown));
  const toc = extractToc(preprocessed);
  const result = await createPipeline({ addHeadingIds: true }).process(
    preprocessed,
  );
  return { html: String(result), toc };
}

/**
 * Summary 用 Markdown → HTML 変換（TOC 不要、heading id 付与なし）
 */
export async function renderSummaryMarkdown(
  markdown: string,
): Promise<string> {
  const preprocessed = addBrToParagraphs(preprocessMessageBlocks(markdown));
  const result = await createPipeline({ addHeadingIds: false }).process(
    preprocessed,
  );
  return String(result);
}
