"use client";
import React, { useState } from "react";
import { ScrapTabPanel, ScrapTabSelector } from "@/components/article/ScrapTabPanel";
import type { ScrapSection } from "@/types/scrap";

export default function ScrapTabPanelWrapper({ sections }: { sections: ScrapSection[] }) {
  const [tab, setTab] = useState(0);

  let panelClass = "section-panel";
  if (tab === 0 || tab === 1) panelClass += " section-panel-main";
  else if (tab === 2) panelClass += " section-panel-log";

  return (
    <div className="scrap-tab-panel-wrap">
      <div className="scrap-tab">
        <div className="scrap-tab-inner">
          <ScrapTabSelector tab={tab} setTab={setTab} />
        </div>
      </div>
      <section className={panelClass}>
        <ScrapTabPanel sections={sections} title="Zenn Scrap" tab={tab} setTab={setTab} />
      </section>
    </div>
  );
}