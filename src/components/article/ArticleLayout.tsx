"use client";

import { useEffect, useState } from "react";
import Toc from "@/components/article/Toc";
import TocButton from "@/components/article/TocButton";
import CalendarIcon from "@/components/icons/CalendarIcon";
import { deviconMap } from "@/lib/content/deviconMap";
import type { TocItem } from "@/types/article";

type ArticleLayoutProps = {
  coverImage: string;
  title: string;
  summaryHtml: string;
  toc: TocItem[];
  html: string;
  publishedAt?: string;
  tags?: string[];
  hideToc?: boolean;
};

export default function ArticleLayout({
  coverImage,
  title,
  summaryHtml,
  toc,
  html,
  publishedAt,
  tags,
  hideToc,
}: ArticleLayoutProps) {
  const isEmpty =
    !html ||
    html.trim() === "" ||
    /^(<p>)?(No content|# Coming soon)(<\/p>)?$/i.test(html.trim());

  const [isDesktop, setIsDesktop] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 1200px以上をデスクトップ扱い
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1200);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // スクロールで現在の見出しidを検出
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

  const layoutClass = hideToc ? "page-2col devlog-intro" : "page-2col";

  return (
    <div className={layoutClass}>
      <article className="article-layout">
        <img src={coverImage} alt={title} className="article-cover" />
        <header className="article-header">
          {(tags && tags.length > 0) || publishedAt ? (
            <div className="article-meta-row">
              {tags && tags.length > 0 && (
                <div className="article-tags">
                  {tags.map((tag) => {
                    const iconUrl = deviconMap[tag.toLowerCase()];
                    return (
                      <span key={tag} className="article-tag">
                        {iconUrl && (
                          <img
                            src={iconUrl}
                            alt={tag}
                            width={16}
                            height={16}
                            className="article-tag-icon"
                          />
                        )}
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}
              {publishedAt && (
                <span className="content-card-date article-date">
                  <CalendarIcon size={18} />
                  {publishedAt.split("T")[0]}
                </span>
              )}
            </div>
          ) : null}
          <h1 className="article-title">{title}</h1>
          {summaryHtml && (
            <div
              className="znc article-summary"
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
            />
          )}
        </header>
        <section className="article-body">
          {isEmpty ? (
            <div className="article-fallback">
              No content or unsupported block.
            </div>
          ) : (
            <div
              className="znc"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </section>
      </article>
      {!hideToc &&
        (isDesktop ? (
          <Toc
            items={toc}
            className="aside-layout"
            activeId={activeId}
          />
        ) : (
          <TocButton items={toc} />
        ))}
    </div>
  );
}
