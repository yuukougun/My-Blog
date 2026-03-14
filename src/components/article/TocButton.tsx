"use client";
import { useState } from "react";
import Toc from "@/components/article/Toc";
import type { TocItem } from "@/types/article";

type TocButtonProps = {
  items: TocItem[];
};

export default function TocButton({ items }: TocButtonProps) {
  const [open, setOpen] = useState(false);
  if (!items || items.length === 0) return null;

  // 目次内リンククリック時に目次を閉じる
  const handleLinkClick = () => setOpen(false);

  return (
    <>
      {!open && (
        <button
          className="toc-fab"
          aria-label="目次を開く"
          onClick={() => setOpen(true)}
        >
          目次
        </button>
      )}
      {open && (
        <Toc
          items={items}
          mode="dialog"
          onClose={() => setOpen(false)}
          onLinkClick={handleLinkClick}
        />
      )}
    </>
  );
}
