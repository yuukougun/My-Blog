import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { mapDevLog } from "@/lib/content/mapper";
import type { DevLogItem } from "@/types/content";

const DEVLOG_CONTENT_DIR = path.join(process.cwd(), "src/content/devlog");

export async function fetchDevLogsFromMarkdown(): Promise<DevLogItem[]> {
  const files = await fs.readdir(DEVLOG_CONTENT_DIR).catch(() => []);
  const markdownFiles = files.filter((file) => file.endsWith(".md"));

  const items = await Promise.all(
    markdownFiles.map(async (fileName) => {
      const fullPath = path.join(DEVLOG_CONTENT_DIR, fileName);
      const fileContent = await fs.readFile(fullPath, "utf8");
      const parsed = matter(fileContent);
      const slug = fileName.replace(/\.md$/, "");

      return mapDevLog({
        id: slug,
        slug,
        title: typeof parsed.data.title === "string" ? parsed.data.title : slug,
        summary: typeof parsed.data.summary === "string" ? parsed.data.summary : "",
        coverImage: typeof parsed.data.coverImage === "string" ? parsed.data.coverImage : undefined,
        publishedAt: typeof parsed.data.publishedAt === "string" ? parsed.data.publishedAt : undefined,
        tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : undefined,
        bodyMarkdown: parsed.content,
        source: "markdown",
        status: parsed.data.status,
      });
    }),
  );

  return items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function fetchDevLogBySlugFromMarkdown(slug: string): Promise<DevLogItem | null> {
  const logs = await fetchDevLogsFromMarkdown();
  return logs.find((log) => log.slug === slug) ?? null;
}
