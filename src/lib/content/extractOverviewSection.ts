import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import type { Root, Content } from "mdast";

// ── Internal helpers ──

function isOverviewHeading(node: Content): boolean {
  if (node.type !== "heading" || node.depth < 1 || node.depth > 4) {
    return false;
  }
  const firstChild = node.children?.[0];
  if (!firstChild || firstChild.type !== "text") return false;
  const value = (firstChild as { value: string }).value;
  return value === "概要" || value.toLowerCase() === "overview";
}

function isSectionHeading(node: Content): boolean {
  return node.type === "heading" && node.depth >= 1 && node.depth <= 4;
}

/**
 * 概要見出しのインデックスと、次の見出しのインデックスを返す
 */
function findOverviewRange(
  children: Content[],
): { start: number; end: number } | null {
  let overviewIdx = -1;
  for (let i = 0; i < children.length; i++) {
    if (isOverviewHeading(children[i])) {
      overviewIdx = i;
      break;
    }
  }
  if (overviewIdx === -1) return null;

  let nextHeadingIdx = children.length;
  for (let i = overviewIdx + 1; i < children.length; i++) {
    if (isSectionHeading(children[i])) {
      nextHeadingIdx = i;
      break;
    }
  }
  return { start: overviewIdx, end: nextHeadingIdx };
}

// ── Public API ──

/**
 * Markdownから「# 概要」見出し直下〜次の見出しまでの全ブロックを抽出
 * @returns 概要部分のMarkdown（見出しなし）
 */
export function extractOverviewSection(markdown: string): string | undefined {
  const tree = unified().use(remarkParse).parse(markdown) as Root;
  const children = tree.children as Content[];
  const range = findOverviewRange(children);
  if (!range) return undefined;

  const overviewBlocks = children.slice(range.start + 1, range.end);
  if (overviewBlocks.length === 0) return undefined;

  const overviewTree: Root = { type: "root", children: overviewBlocks };
  return unified().use(remarkStringify).stringify(overviewTree).trim();
}

/**
 * Markdownから概要見出し+その配下を除去したMarkdownを返す
 */
export function removeOverviewSection(markdown: string): string {
  const tree = unified().use(remarkParse).parse(markdown) as Root;
  const children = tree.children as Content[];
  const range = findOverviewRange(children);
  if (!range) return markdown;

  tree.children = [
    ...children.slice(0, range.start),
    ...children.slice(range.end),
  ];
  return unified().use(remarkStringify).stringify(tree).trim();
}
