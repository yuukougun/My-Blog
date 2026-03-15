"use client";


import Image from "next/image";
import Link from "next/link";
import type { CardItem } from "@/types/content";
import { deviconMap } from "@/lib/content/deviconMap";
import { useEffect, useState } from "react";
import { renderMarkdown } from "@/lib/markdown/remark-plugins";


type ContentCardProps = {
  item: CardItem;
};

export default function ContentCard({ item }: ContentCardProps) {
  const kind = item.href.startsWith("/projects") ? "Project" : "DevLog";
  const [summaryHtml, setSummaryHtml] = useState<string>("");

  useEffect(() => {
    let ignore = false;
    async function convert() {
      if (item.summary) {
        const { html } = await renderMarkdown(item.summary);
        if (!ignore) setSummaryHtml(html);
      } else {
        setSummaryHtml("");
      }
    }
    convert();
    return () => { ignore = true; };
  }, [item.summary]);

  return (
    <article className="content-card">
      <Link href={item.href} className="content-card-link" aria-label={`${item.title} へ移動`}>
        <div className="content-card-image-wrap">
          <Image src={item.image} alt={item.title} width={640} height={360} className="content-card-image" loading="eager" priority />
        </div>
        <div className="content-card-body">
          <div className="content-card-meta">
            <span className="content-card-kind">{kind}</span>
            <p className="content-card-date">{item.publishedAt}</p>
          </div>
          <h3 style={{ fontSize: "1.35rem", fontWeight: 700 }}>{item.title}</h3>
          {summaryHtml && (
            <div style={{ fontSize: "1.1rem", fontWeight: 500 }}
              className="content-card-summary znc"
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
            />
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="content-card-tags" style={{ marginTop: 8, display: "flex", gap: 6 }}>
              {item.tags.map((tag) => {
                const key = tag.toLowerCase();
                const iconUrl = deviconMap[key];
                return (
                  <span key={tag} className="content-card-tag" style={{ background: "#e0e7ef", color: "#3b4252", borderRadius: 6, padding: "2px 10px", fontSize: 12, display: "flex", alignItems: "center" }}>
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
      </Link>
    </article>
  );
}
