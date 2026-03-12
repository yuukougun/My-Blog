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
  return (
    <article className="article-layout">
      <img src={coverImage} alt={title} className="article-cover" />
      <header className="article-header">
        <h1>{title}</h1>
        <p>{summary}</p>
      </header>
      <Toc items={toc} />
      <section className="article-body prose-zenn" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
