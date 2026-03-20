"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { navigationItems } from "@/lib/config/navigation";
import { siteConfig } from "@/lib/config/site";
import MobileMenu from "@/components/layout/MobileMenu";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [whaleAnim, setWhaleAnim] = useState(false);
  const [whaleOnce, setWhaleOnce] = useState(false);
  const whaleHovering = useRef(false);
  const pendingOnce = useRef(false);

  const handleMouseEnter = () => {
    whaleHovering.current = true;
    pendingOnce.current = false;
    setWhaleOnce(false);
    setWhaleAnim(true);
  };

  const handleMouseLeave = () => {
    whaleHovering.current = false;
    pendingOnce.current = true;
  };

  const handleAnimationIteration = () => {
    if (!whaleHovering.current && pendingOnce.current) {
      setWhaleOnce(true); // 次の周期から1回だけ再生
      setWhaleAnim(true); // クラス切り替えのため再セット
      pendingOnce.current = false;
    }
  };

  const handleAnimationEnd = () => {
    if (!whaleHovering.current && whaleOnce) {
      setWhaleAnim(false);
      setWhaleOnce(false);
    }
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand" aria-label="Go to homepage">
          <span
            className="site-brand-icon"
            style={{ position: "relative", width: 40, height: 40, display: "inline-block", borderRadius: "50%", border: "1.2px solid #b6d4f7", boxSizing: "border-box", background: "#fff", overflow: "hidden" }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* 一番奥: sky（背景全体, 枠線に1px被せる） */}
              <Image src="/image/icon_sky.png" alt="sky" width={40} height={40} style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 1, objectFit: "contain" }} loading="eager" priority />
            {/* 中央: whale（中央寄せ、やや大きめ） */}
              <Image
                src="/image/icon_whale.png"
                alt="whale"
                width={33}
                height={33}
                className={
                  "whale-icon" +
                  (whaleAnim
                    ? whaleOnce
                      ? " whale-animating-once"
                      : " whale-animating"
                    : "")
                }
                style={{ position: "absolute", left: "50%", top: "54%", transform: "translate(-50%, -56%)", zIndex: 2 }}
                loading="eager"
                priority
                onAnimationEnd={handleAnimationEnd}
                onAnimationIteration={handleAnimationIteration}
              />
            {/* 手前: sea（下部やや小さめ） */}
              <Image src="/image/icon_sea.png" alt="sea" width={34} height={34} style={{ position: "absolute", left: "49%", bottom: 0, transform: "translateX(-50%)", zIndex: 3 }} loading="eager" priority />
          </span>
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
