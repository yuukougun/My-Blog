"use client";
import React, { useState } from "react";
import type { ScrapSection } from "@/lib/content/scrap-extract";
import { ScrapThreadAccordion, ScrapThreadList } from "@/components/article/ScrapThread";
import { redirect } from "next/dist/server/api-utils";

const TAB_LABELS = ["要件", "やること", "Log"];

type Props = { sections: ScrapSection[]; title: string; tab: number; setTab: (n: number) => void };

export function ScrapTabPanel({ sections, title, tab, setTab }: Props) {
  let displaySections: ScrapSection[] = [];
  if (tab === 0 && sections[0]) {
    displaySections = [sections[0]];
  } else if (tab === 1 && sections[1]) {
    displaySections = [sections[1]];
  } else if (tab === 2 && sections.length > 2) {
    displaySections = sections.slice(2);
  }
  if (tab === 2) {
    // その他タブのみアコーディオン
    return <ScrapThreadAccordion displaySections={displaySections} />;
  } else {
    // 要件・やることはリスト表示
    return <ScrapThreadList displaySections={displaySections} />;
  }
}

export function ScrapTabSelector({ tab, setTab }: { tab: number; setTab: (n: number) => void }) {
  return (
    <div className="scrap-tab-selector" style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
      {TAB_LABELS.map((label, idx) => (
        <button
          key={label}
          type="button"
          className={`scrap-tab-btn${tab === idx ? ' active' : ''}`}
          onClick={() => setTab(idx)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
