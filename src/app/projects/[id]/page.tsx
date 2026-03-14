import { notFound } from "next/navigation";
import ArticleLayout from "@/components/article/ArticleLayout";
import { renderArticleHtml } from "@/lib/markdown/rehype-plugins";
import { renderMarkdown } from "@/lib/markdown/remark-plugins";
import { fetchProjectBySlug } from "@/lib/content/notion";
import { generateStaticProjectParams } from "./generateStaticParams";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return generateStaticProjectParams();
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await fetchProjectBySlug(id);

  if (!project) {
    notFound();
  }

  const article = await renderArticleHtml(project.bodyMarkdown);

  // summaryもMarkdown→HTML変換
  const summaryHtml = project.summary ? (await renderMarkdown(project.summary)).html : "";
  return (
    <main className="page-wrap">
      <ArticleLayout
        coverImage={project.coverImage}
        title={project.title}
        summaryHtml={summaryHtml}
        toc={article.toc}
        html={article.html}
      />
    </main>
  );
}
