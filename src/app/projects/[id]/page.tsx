import { notFound } from "next/navigation";
import ArticleLayout from "@/components/article/ArticleLayout";
import { renderArticleHtml } from "@/lib/markdown/rehype-plugins";
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

  return (
    <main className="page-wrap">
      <ArticleLayout
        coverImage={project.coverImage}
        title={project.title}
        summary={project.summary}
        toc={article.toc}
        html={article.html}
      />
    </main>
  );
}
