import Toc from "@/components/article/Toc";
import type { TocItem } from "@/types/article";

type ArticleLayoutProps = {
  coverImage: string;
  title: string;
  summary: string;
  toc: TocItem[];
  html: string;
};

export default function ArticleLayout({ coverImage, title, summary, toc, html }: ArticleLayoutProps) {
  const isEmpty = !html || html.trim() === "" || /^(<p>)?(No content|# Coming soon)(<\/p>)?$/i.test(html.trim());
  return (
    <article className="article-layout">
      <img src={coverImage} alt={title} className="article-cover" />
      <header className="article-header">
        <h1>{title}</h1>
        <p>{summary}</p>
      </header>
      <Toc items={toc} />
      <section className="article-body prose-zenn">
        {isEmpty ? (
          <div className="article-fallback">No content or unsupported block.</div>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </section>
    </article>
  );
}
