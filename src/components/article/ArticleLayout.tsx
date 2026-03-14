import Toc from "@/components/article/Toc";
import type { TocItem } from "@/types/article";

type ArticleLayoutProps = {
  coverImage: string;
  title: string;
  summaryHtml: string;
  toc: TocItem[];
  html: string;
};

export default function ArticleLayout({ coverImage, title, summaryHtml, toc, html }: ArticleLayoutProps) {
  const isEmpty = !html || html.trim() === "" || /^(<p>)?(No content|# Coming soon)(<\/p>)?$/i.test(html.trim());
  return (
    <article className="article-layout">
      <img src={coverImage} alt={title} className="article-cover" />
      <header className="article-header">
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>{title}</h1>
        {summaryHtml && (
          <div className="znc" style={{ fontSize: "1.25rem", fontWeight: 600 }} dangerouslySetInnerHTML={{ __html: summaryHtml }} />
        )}
      </header>
      <Toc items={toc} />
      <section className="article-body">
        {isEmpty ? (
          <div className="article-fallback">No content or unsupported block.</div>
        ) : (
          <div className="znc" dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </section>
    </article>
  );
}
