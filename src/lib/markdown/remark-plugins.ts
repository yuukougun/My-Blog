// summary用: 段落ごとに最後以外の行末に<br>を付与し、Markdown→HTML変換
export async function renderSummaryMarkdown(markdown: string): Promise<string> {
  // 段落ごとに最後以外の行末に<br>を付与
  let preprocessed = preprocessMessageBlocks(addBrToParagraphs(markdown));
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeBrInParagraphs)
    .use(rehypeSanitize, {
      tagNames: [
        "div", "p", "a", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "strong", "em", "img", "hr",
        "table", "thead", "tbody", "tr", "th", "td", "del", "br"
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
        del: [],
      },
      clobberPrefix: "",
    })
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(preprocessed);
  return String(result);
}
// 段落ごとに最後以外の行末に<br>を付与する関数
function addBrToParagraphs(markdown: string): string {
  return markdown
    .split(/\n\s*\n/)
    .map(paragraph => {
      const lines = paragraph.split('\n');
      // 全行がブロック要素なら除外
      const isBlock = lines.every(line =>
        /^\s*(\||- |\* |\d+\. |> |# )/.test(line)
      );
      if (isBlock) return paragraph;
      return lines.map((line, idx) =>
        idx < lines.length - 1 ? line + '<br>' : line
      ).join('\n');
    })
    .join('\n\n');
}
// pタグ内のテキストノードに含まれる<br>をbrノードに変換するrehypeプラグイン
function rehypeBrInParagraphs() {
  return (tree: Root) => {
    visit(tree, "element", (node: any) => {
      if (node.tagName === "p" && Array.isArray(node.children)) {
        let newChildren: any[] = [];
        node.children.forEach((child: any) => {
          if (child.type === "text" && typeof child.value === "string" && child.value.includes("<br>")) {
            const parts: string[] = child.value.split("<br>");
            parts.forEach((part: string, idx: number) => {
              if (part) newChildren.push({ type: "text", value: part });
              if (idx < parts.length - 1) newChildren.push({ type: "element", tagName: "br", properties: {}, children: [] });
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
    // h2, h3両方抽出
    const match = /^(###?)\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const level = match[1] === "##" ? 2 : 3;
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
  let idx = 0;
  return (tree: Root) => {
    if (!tree) return;
    visit(tree, "element", (node) => {
      if (!node || typeof node !== "object" || !("tagName" in node)) return;
      if (node.tagName === "h2" || node.tagName === "h3") {
        // h2/h3のテキストからid生成
        const text = (node.children || [])
          .filter((c: any) => c.type === "text" && typeof c.value === "string")
          .map((c: any) => c.value)
          .join("");
        const id = generateIdFromText(text, idx);
        node.properties = node.properties || {};
        node.properties.id = id;
        idx++;
      }
    });
  };
}
export async function renderMarkdown(markdown: string): Promise<{ html: string; toc: TocItem[] }> {
  // 段落ごとに最後以外の行末に<br>を付与
  let preprocessed = preprocessMessageBlocks(addBrToParagraphs(markdown));
  const toc = extractToc(preprocessed);

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(() => rehypeAddHeadingIds())
    .use(rehypeBrInParagraphs) // 追加: pタグ内の<br>をbrノードに変換
    .use(rehypeSanitize, {
      tagNames: [
        "div", "p", "a", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "strong", "em", "img", "hr",
        "table", "thead", "tbody", "tr", "th", "td", "del", "br"
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
        del: [],
      },
      clobberPrefix: "",
    })
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(preprocessed);

  return { html: String(result), toc };
}
