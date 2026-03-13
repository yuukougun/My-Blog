"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { navigationItems } from "@/lib/config/navigation";
import { siteConfig } from "@/lib/config/site";
import MobileMenu from "@/components/layout/MobileMenu";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand" aria-label="Go to homepage">
          <Image src={siteConfig.iconPath} alt="Site icon" width={28} height={28} />
          <span>{siteConfig.title}</span>
        </Link>
        <nav className="site-nav-desktop" aria-label="Main navigation">
          <ul>
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          className="menu-trigger"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Open main menu"
          onClick={() => setIsMenuOpen((state) => !state)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <MobileMenu isOpen={isMenuOpen} items={navigationItems} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
}
