import { fetchDevLogsFromNotion } from "@/lib/content/notion-devlog";
import type { DevLogItem } from "@/types/content";

export async function fetchDevLogs(): Promise<DevLogItem[]> {
  return await fetchDevLogsFromNotion();
}

export async function fetchDevLogBySlug(slug: string): Promise<DevLogItem | null> {
  const logs = await fetchDevLogsFromNotion();
  return logs.find((log) => log.slug === slug) ?? null;
}

export async function getStaticDevLogParams(): Promise<Array<{ id: string }>> {
  const logs = await fetchDevLogsFromNotion();
  return logs.map((log) => ({ id: log.slug }));
}
