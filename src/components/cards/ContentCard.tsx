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
        if (!ignore) setSummaryHtml(html.replace(/\n/g, '<br />'));
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
          <div className="content-card-meta-title-row" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>{item.title}</h3>
            <span className="content-card-date" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="14" height="14" viewBox="0 0 512 512" style={{ display: 'inline', verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"><g><rect x="119.256" y="222.607" width="50.881" height="50.885" fill="#94a3b8"/><rect x="341.863" y="222.607" width="50.881" height="50.885" fill="#94a3b8"/><rect x="267.662" y="222.607" width="50.881" height="50.885" fill="#94a3b8"/><rect x="119.256" y="302.11" width="50.881" height="50.885" fill="#94a3b8"/><rect x="267.662" y="302.11" width="50.881" height="50.885" fill="#94a3b8"/><rect x="193.46" y="302.11" width="50.881" height="50.885" fill="#94a3b8"/><rect x="341.863" y="381.612" width="50.881" height="50.885" fill="#94a3b8"/><rect x="267.662" y="381.612" width="50.881" height="50.885" fill="#94a3b8"/><rect x="193.46" y="381.612" width="50.881" height="50.885" fill="#94a3b8"/><path d="M439.277,55.046h-41.376v39.67c0,14.802-12.195,26.84-27.183,26.84h-54.025c-14.988,0-27.182-12.038-27.182-26.84v-39.67h-67.094v39.297c0,15.008-12.329,27.213-27.484,27.213h-53.424c-15.155,0-27.484-12.205-27.484-27.213V55.046H72.649c-26.906,0-48.796,21.692-48.796,48.354v360.246c0,26.661,21.89,48.354,48.796,48.354h366.628c26.947,0,48.87-21.692,48.87-48.354V103.4C488.147,76.739,466.224,55.046,439.277,55.046z M453.167,462.707c0,8.56-5.751,14.309-14.311,14.309H73.144c-8.56,0-14.311-5.749-14.311-14.309V178.089h394.334V462.707z" fill="#94a3b8"/><path d="M141.525,102.507h53.392c4.521,0,8.199-3.653,8.199-8.144v-73.87c0-11.3-9.27-20.493-20.666-20.493h-28.459c-11.395,0-20.668,9.192-20.668,20.493v73.87C133.324,98.854,137.002,102.507,141.525,102.507z" fill="#94a3b8"/><path d="M316.693,102.507h54.025c4.348,0,7.884-3.513,7.884-7.826V20.178C378.602,9.053,369.474,0,358.251,0H329.16c-11.221,0-20.349,9.053-20.349,20.178v74.503C308.81,98.994,312.347,102.507,316.693,102.507z" fill="#94a3b8"/></g></svg>
              {item.publishedAt}
            </span>
          </div>
          {summaryHtml && (
            <div
              style={{ fontSize: "1.1rem", fontWeight: 500, whiteSpace: "pre-line" }}
              className="content-card-summary znc"
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
            />
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="content-card-tags">
              {item.tags.map((tag) => {
                const key = tag.toLowerCase();
                const iconUrl = deviconMap[key];
                return (
                  <span key={tag} className="content-card-tag">
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
