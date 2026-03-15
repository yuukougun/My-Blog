

"use client";
import Toc from "@/components/article/Toc";
import TocButton from "@/components/article/TocButton";
import type { TocItem } from "@/types/article";
import { useEffect, useState } from "react";

type ArticleLayoutProps = {
  coverImage: string;
  title: string;
  summaryHtml: string;
  toc: TocItem[];
  html: string;
};

export default function ArticleLayout({ coverImage, title, summaryHtml, toc, html }: ArticleLayoutProps) {
  const isEmpty = !html || html.trim() === "" || /^(<p>)?(No content|# Coming soon)(<\/p>)?$/i.test(html.trim());
  // 1200px以上をデスクトップ扱い
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1200);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // スクロールで現在の見出しid（h2/h3両方）を検出
  useEffect(() => {
    if (!toc || toc.length === 0) return;
    const headingIds = toc.map((item) => item.id);
    const onScroll = () => {
      let minDiff = Number.POSITIVE_INFINITY;
      let currentId = headingIds[0];
      for (const id of headingIds) {
        const el = document.getElementById(id);
        if (el) {
          const rectTop = el.getBoundingClientRect().top;
          // 120pxはヘッダー等の高さ分オフセット
          const diff = Math.abs(rectTop - 120);
          if (rectTop - 120 <= 0 && diff < minDiff) {
            minDiff = diff;
            currentId = id;
          }
        }
      }
      setActiveId(currentId);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [toc]);

  return (
    <div className="page-2col">
      <article className="article-layout">
        <img src={coverImage} alt={title} className="article-cover" />
        <header className="article-header">
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>{title}</h1>
          {summaryHtml && (
            <div className="znc" style={{ fontSize: "1.25rem", fontWeight: 600 }} dangerouslySetInnerHTML={{ __html: summaryHtml }} />
          )}
        </header>
        <section className="article-body">
          {isEmpty ? (
            <div className="article-fallback">No content or unsupported block.</div>
          ) : (
            <div className="znc" dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </section>
      </article>
      {isDesktop ? <Toc items={toc} className="aside-layout" activeId={activeId} /> : <TocButton items={toc} />}
    </div>
  );
}
