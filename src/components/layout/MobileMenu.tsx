"use client";

import Link from "next/link";
import type { NavItem } from "@/lib/config/navigation";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";

type MobileMenuProps = {
  isOpen: boolean;
  items: NavItem[];
  onClose: () => void;
};

export default function MobileMenu({ isOpen, items, onClose }: MobileMenuProps) {
  useEscapeKey(isOpen, onClose);

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
