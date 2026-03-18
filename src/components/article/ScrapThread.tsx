import React from "react";
import type { ScrapSection } from "@/lib/content/scrap-extract";

export function ScrapThread({ sections }: { sections: ScrapSection[] }) {
  return (
    <div className="znc">
      {sections.map((section, i) => (
        <div className="ScrapThread_item__zTzyN" key={i}>
          <article className="ThreadItemContent_parentItem__2BweX">
            <div className="ThreadItemContent_content__Ivb_O">
              <div
                className="BodyCommentContent_bodyCommentContainer__PFlLd"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </div>
            {section.children.length > 0 && (
              <div className="ThreadItemContent_children__xggXO">
                {section.children.map((child, j) => (
                  <article className="ThreadItemContent_childItem__TC_O8" key={j}>
                    <div className="ThreadItemContent_content__Ivb_O">
                      <div
                        className="BodyCommentContent_bodyCommentContainer__PFlLd"
                        dangerouslySetInnerHTML={{ __html: child.content }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>
        </div>
      ))}
    </div>
  );
}
