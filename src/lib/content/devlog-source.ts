import { fetchDevLogBySlugFromMarkdown, fetchDevLogsFromMarkdown } from "@/lib/content/markdown";
import { fetchDevLogBySlugFromZenn, fetchDevLogsFromZenn } from "@/lib/content/zenn";
import type { DevLogItem } from "@/types/content";

function getSourcePreference() {
  const source = process.env.DEVLOG_SOURCE;
  if (source === "zenn" || source === "markdown") {
    return source;
  }
  return "markdown" as const;
}

export async function fetchDevLogs(): Promise<DevLogItem[]> {
  const source = getSourcePreference();

  if (source === "zenn") {
    const zennLogs = await fetchDevLogsFromZenn();
    if (zennLogs.length > 0) {
      return zennLogs;
    }
  }

  return fetchDevLogsFromMarkdown();
}

export async function fetchDevLogBySlug(slug: string): Promise<DevLogItem | null> {
  const source = getSourcePreference();

  if (source === "zenn") {
    const fromZenn = await fetchDevLogBySlugFromZenn(slug);
    if (fromZenn) {
      return fromZenn;
    }
  }

  return fetchDevLogBySlugFromMarkdown(slug);
}

export async function getStaticDevLogParams(): Promise<Array<{ id: string }>> {
  const logs = await fetchDevLogs();
  return logs.map((log) => ({ id: log.slug }));
}
