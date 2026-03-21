"use client";
import React, { useState } from "react";
import type { ScrapSection } from "@/types/scrap";




// アコーディオン（その他タブ用）
export function ScrapThreadAccordion({ displaySections }: { displaySections: ScrapSection[] }) {
  const [openIndexes, setOpenIndexes] = useState<{ [key: number]: boolean }>({});
  const toggleAccordion = (idx: number) => {
    setOpenIndexes((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };
  return (
    <div className="znc">
      {displaySections.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: '1.1rem' }}>該当する内容がありません</div>
      ) : (
        displaySections.map((section, i) => {
          const isOpen = !!openIndexes[i];
          return (
            <div className="ScrapThread_item__zTzyN" key={i}>
              <div
                className={`scrap-accordion-header${isOpen ? ' open' : ''}`}
                onClick={() => toggleAccordion(i)}
              >
                <span className="scrap-accordion-icon">{isOpen ? '▼' : '▶'}</span>
                <span>{section.title}</span>
                {section.date && (
                  <span className="scrap-thread-date" style={{ marginLeft: 'auto', color: '#888', fontSize: '0.95em' }}>{section.date}</span>
                )}
              </div>
              {isOpen && (
                <article className="ThreadItemContent_parentItem__2BweX scrap-accordion-content">
                  <div className="ThreadItemContent_content__Ivb_O">
                    <div
                      className="BodyCommentContent_bodyCommentContainer__PFlLd"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                  {section.children.length > 0 && (
                    <div className="ThreadItemContent_children__xggXO">
                      {section.children.map((child, j) => (
                        <React.Fragment key={j}>
                          <article className="ThreadItemContent_childItem__TC_O8">
                            <div className="ThreadItemContent_content__Ivb_O">
                              <div
                                className="BodyCommentContent_bodyCommentContainer__PFlLd"
                                dangerouslySetInnerHTML={{ __html: child.content }}
                              />
                            </div>
                          </article>
                          {j < section.children.length - 1 && <hr className="scrap-child-hr" />}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </article>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// リスト（要件・やること用）
export function ScrapThreadList({ displaySections }: { displaySections: ScrapSection[] }) {
  return (
    <div className="znc">
      {displaySections.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: '1.1rem' }}>該当する内容がありません</div>
      ) : (
        displaySections.map((section, i) => (
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
                    <React.Fragment key={j}>
                      <article className="ThreadItemContent_childItem__TC_O8">
                        <div className="ThreadItemContent_content__Ivb_O">
                          <div
                            className="BodyCommentContent_bodyCommentContainer__PFlLd"
                            dangerouslySetInnerHTML={{ __html: child.content }}
                          />
                        </div>
                      </article>
                      {j < section.children.length - 1 && <hr className="scrap-child-hr" />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </article>
          </div>
        ))
      )}
    </div>
  );
}
