import { mapDevLog } from "@/lib/content/mapper";
import type { DevLogItem } from "@/types/content";

type ZennFeedItem = {
  id: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  link?: string;
};

export async function fetchDevLogsFromZenn(): Promise<DevLogItem[]> {
  const endpoint = process.env.ZENN_FEED_ENDPOINT;
  if (!endpoint) {
    return [];
  }

  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`[Zenn] Failed to fetch feed: ${response.status}`);
  }

  const items = (await response.json()) as ZennFeedItem[];

  return items.map((item) => {
    const scrapLink = item.link;

    return mapDevLog({
      id: item.id,
      slug: item.id,
      title: item.title,
      summary: item.summary,
      coverImage: "/image/icon_sky.png",
      publishedAt: item.publishedAt,
      bodyMarkdown: item.summary ?? "",
      source: "zenn",
      scrapLink,
    });
  });
}

export async function fetchDevLogBySlugFromZenn(slug: string): Promise<DevLogItem | null> {
  const logs = await fetchDevLogsFromZenn();
  return logs.find((log) => log.slug === slug) ?? null;
}
