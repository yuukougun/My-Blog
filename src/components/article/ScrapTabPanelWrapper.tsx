"use client";
import React, { useState } from "react";
import { ScrapTabPanel, ScrapTabSelector } from "@/components/article/ScrapTabPanel";
import type { ScrapSection } from "@/lib/content/scrap-extract";

export default function ScrapTabPanelWrapper({ sections }: { sections: ScrapSection[] }) {
  const [tab, setTab] = useState(0);
  // タブごとにクラス名を分岐
  let panelClass = "section-panel";
  if (tab === 0 || tab === 1) panelClass += " section-panel-main";
  else if (tab === 2) panelClass += " section-panel-log";

  return (
    <div className="scrap-tab-panel-wrap" >
      <div className="scrap-tab" style={{
         marginBottom: 0,
         display: 'flex',
        }}
      >
        <div style={{
            background: '#ffffff',
            borderRadius: '12px 12px 0 0',
            borderBottom: '1px solid #d6e3ed',
          }}
        >
          <ScrapTabSelector tab={tab} setTab={setTab} />
        </div>
      </div>
      <section className={panelClass}>
        <ScrapTabPanel sections={sections} title="Zenn Scrap" tab={tab} setTab={setTab} />
      </section>
    </div>
  );
}