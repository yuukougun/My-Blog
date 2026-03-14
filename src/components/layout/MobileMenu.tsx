"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { NavItem } from "@/lib/config/navigation";

type MobileMenuProps = {
  isOpen: boolean;
  items: NavItem[];
  onClose: () => void;
};

export default function MobileMenu({ isOpen, items, onClose }: MobileMenuProps) {



  // Escapeキーで閉じる
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="mobile-menu-layer" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button
        type="button"
        className="mobile-menu-overlay"
        aria-label="Close menu overlay"
        onClick={onClose}
      />
      <nav id="mobile-menu" className="mobile-menu-panel" aria-label="Mobile main navigation">
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={onClose}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
