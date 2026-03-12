import Link from "next/link";
import { siteConfig } from "@/lib/config/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>{siteConfig.footerMessage}</p>
        <ul>
          {siteConfig.socialLinks.map((link) => (
            <li key={link.label}>
              <Link href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
