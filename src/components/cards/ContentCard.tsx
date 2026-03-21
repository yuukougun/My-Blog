"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CalendarIcon from "@/components/icons/CalendarIcon";
import { deviconMap } from "@/lib/content/deviconMap";
import { renderMarkdown } from "@/lib/markdown/remark-plugins";
import type { CardItem } from "@/types/content";

type ContentCardProps = {
  item: CardItem;
};

export default function ContentCard({ item }: ContentCardProps) {
  const [summaryHtml, setSummaryHtml] = useState<string>("");

  useEffect(() => {
    let ignore = false;
    async function convert() {
      if (item.summary) {
        const { html } = await renderMarkdown(item.summary);
        if (!ignore) setSummaryHtml(html.replace(/\n/g, "<br />"));
      } else {
        setSummaryHtml("");
      }
    }
    convert();
    return () => {
      ignore = true;
    };
  }, [item.summary]);

  return (
    <article className="content-card">
      <Link
        href={item.href}
        className="content-card-link"
        aria-label={`${item.title} へ移動`}
      >
        <div className="content-card-image-wrap">
          <Image
            src={item.image}
            alt={item.title}
            width={640}
            height={360}
            className="content-card-image"
            loading="eager"
            priority
          />
        </div>
        <div className="content-card-body">
          <div className="content-card-meta-title-row">
            <h3 className="content-card-title">{item.title}</h3>
            <span className="content-card-date">
              <CalendarIcon size={14} />
              {item.publishedAt}
            </span>
          </div>
          {summaryHtml && (
            <div
              className="content-card-summary znc"
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
            />
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="content-card-tags">
              {item.tags.map((tag) => {
                const iconUrl = deviconMap[tag.toLowerCase()];
                return (
                  <span key={tag} className="content-card-tag">
                    {iconUrl && (
                      <img
                        src={iconUrl}
                        alt={tag}
                        width={16}
                        height={16}
                        className="content-card-tag-icon"
                      />
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
