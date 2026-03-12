import { notFound } from "next/navigation";
import ArticleLayout from "@/components/article/ArticleLayout";
import { fetchDevLogBySlug } from "@/lib/content/devlog-source";
import { renderArticleHtml } from "@/lib/markdown/rehype-plugins";
import { generateStaticDevLogParams } from "./generateStaticParams";

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

  const article = await renderArticleHtml(entry.bodyMarkdown);

  return (
    <main className="page-wrap">
      <ArticleLayout
        coverImage={entry.coverImage}
        title={entry.title}
        summary={entry.summary}
        toc={article.toc}
        html={article.html}
      />
    </main>
  );
}
