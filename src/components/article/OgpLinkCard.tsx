type OgpLinkCardProps = {
  href: string;
  title?: string;
  description?: string;
};

export default function OgpLinkCard({ href, title, description }: OgpLinkCardProps) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="ogp-link-card">
      <strong>{title ?? href}</strong>
      {description ? <span>{description}</span> : null}
    </a>
  );
}
