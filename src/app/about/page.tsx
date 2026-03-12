import { fetchAboutMarkdown } from "@/lib/content/about";
import { renderArticleHtml } from "@/lib/markdown/rehype-plugins";

export default async function AboutPage() {
  const markdown = await fetchAboutMarkdown();
  const article = await renderArticleHtml(markdown);

  return (
    <main className="page-wrap">
      <article className="section-panel prose-zenn" dangerouslySetInnerHTML={{ __html: article.html }} />
    </main>
  );
}
