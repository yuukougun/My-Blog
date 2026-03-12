export const siteConfig = {
  title: "My Blog",
  description: "Portfolio and DevLog website",
  iconPath: "/image/icon_whale.png",
  footerMessage: "Building in public, one commit at a time.",
  socialLinks: [
    {
      label: "GitHub",
      href: "https://github.com/yuukougun",
    },
    {
      label: "X",
      href: "https://x.com/",
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
