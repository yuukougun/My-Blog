import { fetchAboutMarkdown } from "@/lib/content/about";
import { renderMarkdown } from "@/lib/markdown/remark-plugins";

export default async function AboutPage() {
  const markdown = await fetchAboutMarkdown();
  const article = await renderMarkdown(markdown);

  return (
    <main className="page-wrap">
      <article className="section-panel prose-zenn" dangerouslySetInnerHTML={{ __html: article.html }} />
    </main>
  );
}
