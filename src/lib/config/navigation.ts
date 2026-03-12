export type NavItem = {
  label: string;
  href: string;
};

export const navigationItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "DevLog", href: "/devlog" },
  { label: "About", href: "/about" },
];
