"use client";
import Toc from "@/components/article/Toc";
import TocButton from "@/components/article/TocButton";
import type { TocItem } from "@/types/article";
import { useEffect, useState } from "react";
import { deviconMap } from "@/lib/content/deviconMap";

type ArticleLayoutProps = {
  coverImage: string;
  title: string;
  summaryHtml: string;
  toc: TocItem[];
  html: string;
  publishedAt?: string;
  tags?: string[];
};

export default function ArticleLayout({ coverImage, title, summaryHtml, toc, html, publishedAt, tags }: ArticleLayoutProps) {
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
          {(tags && tags.length > 0) || publishedAt ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {tags && tags.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {tags.map((tag) => {
                    const key = tag.toLowerCase();
                    const iconUrl = deviconMap[key];
                    return (
                      <span key={tag} style={{ background: "#e0e7ef", color: "#3b4252", borderRadius: 6, padding: "2px 10px", fontSize: 12, display: "flex", alignItems: "center" }}>
                        {iconUrl && (
                          <img src={iconUrl} alt={tag} width={16} height={16} style={{ marginRight: 4, verticalAlign: "middle" }} />
                        )}
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}
              {publishedAt && (
                <span className="content-card-date" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1.4rem', marginLeft: 'auto' }}>
                  <svg width="18" height="18" viewBox="0 0 512 512" style={{ display: 'inline', verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"><g><rect x="119.256" y="222.607" width="50.881" height="50.885" fill="#94a3b8"/><rect x="341.863" y="222.607" width="50.881" height="50.885" fill="#94a3b8"/><rect x="267.662" y="222.607" width="50.881" height="50.885" fill="#94a3b8"/><rect x="119.256" y="302.11" width="50.881" height="50.885" fill="#94a3b8"/><rect x="267.662" y="302.11" width="50.881" height="50.885" fill="#94a3b8"/><rect x="193.46" y="302.11" width="50.881" height="50.885" fill="#94a3b8"/><rect x="341.863" y="381.612" width="50.881" height="50.885" fill="#94a3b8"/><rect x="267.662" y="381.612" width="50.881" height="50.885" fill="#94a3b8"/><rect x="193.46" y="381.612" width="50.881" height="50.885" fill="#94a3b8"/><path d="M439.277,55.046h-41.376v39.67c0,14.802-12.195,26.84-27.183,26.84h-54.025c-14.988,0-27.182-12.038-27.182-26.84v-39.67h-67.094v39.297c0,15.008-12.329,27.213-27.484,27.213h-53.424c-15.155,0-27.484,12.205-27.484,27.213V55.046H72.649c-26.906,0-48.796,21.692-48.796,48.354v360.246c0,26.661,21.89,48.354,48.796,48.354h366.628c26.947,0,48.87-21.692,48.87-48.354V103.4C488.147,76.739,466.224,55.046,439.277,55.046z M453.167,462.707c0,8.56-5.751,14.309-14.311,14.309H73.144c-8.56,0-14.311-5.749-14.311-14.309V178.089h394.334V462.707z" fill="#94a3b8"/><path d="M141.525,102.507h53.392c4.521,0,8.199-3.653,8.199-8.144v-73.87c0-11.3-9.27-20.493-20.666-20.493h-28.459c-11.395,0-20.668,9.192-20.668,20.493v73.87C133.324,98.854,137.002,102.507,141.525,102.507z" fill="#94a3b8"/><path d="M316.693,102.507h54.025c4.348,0,7.884-3.513,7.884-7.826V20.178C378.602,9.053,369.474,0,358.251,0H329.16c-11.221,0-20.349,9.053-20.349,20.178v74.503C308.81,98.994,312.347,102.507,316.693,102.507z" fill="#94a3b8"/></g></svg>
                  {publishedAt.split('T')[0]}
                </span>
              )}
            </div>
          ) : null}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 800, margin: 0 }}>{title}</h1>
          </div>
          {summaryHtml && (
            <div
              className="znc"
              style={{ fontSize: "1.25rem", fontWeight: 600, whiteSpace: "pre-line" }}
              dangerouslySetInnerHTML={{ __html: summaryHtml.replace(/\n/g, '<br />') }}
            />
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
