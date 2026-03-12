import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export async function fetchAboutMarkdown(): Promise<string> {
  const aboutPath = path.join(process.cwd(), "src/content/about.md");
  const source = await fs.readFile(aboutPath, "utf8");
  const parsed = matter(source);
  return parsed.content;
}
