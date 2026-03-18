import { notFound } from "next/navigation";
import ArticleLayout from "@/components/article/ArticleLayout";
import { fetchDevLogBySlug } from "@/lib/content/devlog-source";
import { renderMarkdown } from "@/lib/markdown/remark-plugins";
import { generateStaticDevLogParams } from "./generateStaticParams";
import { ScrapThread } from "@/components/article/ScrapThread";
import { extractScrapSections } from "@/lib/content/scrap-extract";
import type { ScrapSection } from "@/lib/content/scrap-extract";

type DevLogDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return generateStaticDevLogParams();
}

export default async function DevLogDetailPage({ params }: DevLogDetailPageProps) {
  const { id } = await params;
  const entry = await fetchDevLogBySlug(id);

  if (!entry) {
    notFound();
  }

  const article = await renderMarkdown(entry.bodyMarkdown);
  // summaryにも改行処理を適用
  const { renderSummaryMarkdown } = await import("@/lib/markdown/remark-plugins");
  const summaryHtml = entry.summary ? await renderSummaryMarkdown(entry.summary) : "";

  // scrap-linkがあればHTMLを取得してパース
  let scrapSections: ScrapSection[] = [];
  if (entry.scrapLink) {
    try {
      const res = await fetch(entry.scrapLink);
      const html = await res.text();
      scrapSections = await extractScrapSections(html);
    } catch (e) {
      // 取得失敗時は何もしない
    }
  }

  return (
    <main className="page-wrap devlog-detail-flex">
      <ArticleLayout
        coverImage={entry.coverImage}
        title={entry.title}
        summaryHtml={summaryHtml}
        toc={article.toc}
        html={article.html}
      />
      {scrapSections.length > 0 && (
        <section className="section-panel">
          <h2>Zenn Scrap</h2>
          <ScrapThread sections={scrapSections} />
        </section>
      )}
    </main>
  );
}
