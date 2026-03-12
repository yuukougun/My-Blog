import type { CardItem, DevLogItem, ProjectItem } from "@/types/content";

const FALLBACK_IMAGE = "/image/icon_whale.png";

function ensureString(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return fallback;
}

export function mapNotionProject(input: {
  id: string;
  slug?: string;
  title?: string;
  summary?: string;
  coverImage?: string;
  publishedAt?: string;
  tags?: string[];
  bodyMarkdown?: string;
  repositoryUrl?: string;
  demoUrl?: string;
}): ProjectItem {
  const title = ensureString(input.title, "Untitled Project");
  const slug = ensureString(input.slug, input.id);

  return {
    id: input.id,
    slug,
    title,
    summary: ensureString(input.summary, "No summary available."),
    coverImage: ensureString(input.coverImage, FALLBACK_IMAGE),
    publishedAt: ensureString(input.publishedAt, new Date().toISOString().slice(0, 10)),
    tags: input.tags,
    source: "notion",
    repositoryUrl: input.repositoryUrl,
    demoUrl: input.demoUrl,
    bodyMarkdown: ensureString(input.bodyMarkdown, "# Coming soon"),
  };
}

export function mapDevLog(input: {
  id: string;
  slug?: string;
  title?: string;
  summary?: string;
  coverImage?: string;
  publishedAt?: string;
  tags?: string[];
  bodyMarkdown?: string;
  source: "zenn" | "markdown";
  status?: "idea" | "in-progress" | "done";
}): DevLogItem {
  return {
    id: input.id,
    slug: ensureString(input.slug, input.id),
    title: ensureString(input.title, "Untitled DevLog"),
    summary: ensureString(input.summary, "No summary available."),
    coverImage: ensureString(input.coverImage, FALLBACK_IMAGE),
    publishedAt: ensureString(input.publishedAt, new Date().toISOString().slice(0, 10)),
    tags: input.tags,
    source: input.source,
    status: input.status,
    bodyMarkdown: ensureString(input.bodyMarkdown, "# Coming soon"),
  };
}

export function toCardItem(input: Pick<ProjectItem | DevLogItem, "id" | "title" | "summary" | "coverImage" | "publishedAt" | "slug">, basePath: "/projects" | "/devlog"): CardItem {
  return {
    id: input.id,
    title: input.title,
    summary: input.summary,
    image: input.coverImage,
    publishedAt: input.publishedAt,
    href: `${basePath}/${input.slug}`,
  };
}
