import CardGrid from "@/components/cards/CardGrid";
import { toCardItem } from "@/lib/content/mapper";
import { fetchDevLogs } from "@/lib/content/devlog-source";

export default async function DevLogPage() {
  const devLogs = await fetchDevLogs();
  devLogs.forEach((item) => {
    // デバッグ: tagsの値を出力
    // eslint-disable-next-line no-console
    console.log("DevLog", item.title, item.tags);
  });
  const cards = devLogs.map((item) => toCardItem(item, "/devlog"));

  return (
    <main className="page-wrap">
      <section className="hero-panel">
        <h1>DevLog</h1>
        <p>現在進行中の開発記録と試行錯誤をまとめています。</p>
      </section>
      <section className="section-panel">
        <CardGrid items={cards} emptyMessage="No DevLog entries available." />
      </section>
    </main>
  );
}
