import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import type { Root, Content, Heading } from "mdast";

/**
 * Markdownから「# 概要」見出し直下から次の見出しまでの全ブロックを抽出
 * @param markdown 対象Markdown
 * @returns 概要部分のMarkdown
 */
export function extractOverviewSection(markdown: string): string | undefined {
  const tree = unified().use(remarkParse).parse(markdown) as Root;
  const children = tree.children as Content[];
  let found = false;
  const overviewBlocks: Content[] = [];
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (!found) {
      if (
        node.type === "heading" &&
        node.depth >= 1 && node.depth <= 4 &&
        node.children &&
        node.children.length > 0 &&
        node.children[0].type === "text" &&
        ((node.children[0] as any).value === "概要" || (node.children[0] as any).value.toLowerCase() === "overview")
      ) {
        found = true;
      }
      continue;
    } else {
      // 概要見出しの直後から次の見出しまで
      if (node.type === "heading" && node.depth >= 1 && node.depth <= 4) {
        break;
      }
      overviewBlocks.push(node);
    }
  }
  if (overviewBlocks.length === 0) return undefined;
  // 概要部分だけをMarkdownに戻す（remark-stringifyで正確に）
  const overviewTree: Root = { type: "root", children: overviewBlocks };
  return unified().use(remarkStringify).stringify(overviewTree).trim();
}
