
import { notFound } from "next/navigation";
import ArticleLayout from "@/components/article/ArticleLayout";
import { renderMarkdown } from "@/lib/markdown/remark-plugins";
import { fetchProjectBySlug } from "@/lib/content/notion";
import { generateStaticProjectParams } from "./generateStaticParams";
import { deviconMap } from "@/lib/content/deviconMap";

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

  const article = await renderMarkdown(project.bodyMarkdown);

  const summaryHtml = project.summary ? (await renderMarkdown(project.summary)).html : "";
  return (
    <main className="page-wrap">
      <div style={{ marginBottom: 16 }}>
        {project.tags && project.tags.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {project.tags.map((tag) => {
              const key = tag.toLowerCase();
              const iconUrl = deviconMap[key];
              return (
                <span key={tag} style={{ background: "#e0e7ef", color: "#3b4252", borderRadius: 6, padding: "2px 12px", fontSize: 13, display: "flex", alignItems: "center" }}>
                  {iconUrl && (
                    <img src={iconUrl} alt={tag} width={16} height={16} style={{ marginRight: 4, verticalAlign: "middle" }} />
                  )}
                  {tag}
                </span>
              );
            })}
          </div>
        )}
      </div>
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
