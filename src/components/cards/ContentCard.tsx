import Image from "next/image";
import Link from "next/link";
import type { CardItem } from "@/types/content";

type ContentCardProps = {
  item: CardItem;
};

export default function ContentCard({ item }: ContentCardProps) {
  const kind = item.href.startsWith("/projects") ? "Project" : "DevLog";

  return (
    <article className="content-card">
      <Link href={item.href} className="content-card-link" aria-label={`${item.title} へ移動`}>
        <div className="content-card-image-wrap">
          <Image src={item.image} alt={item.title} width={640} height={360} className="content-card-image" />
        </div>
        <div className="content-card-body">
          <div className="content-card-meta">
            <span className="content-card-kind">{kind}</span>
            <p className="content-card-date">{item.publishedAt}</p>
          </div>
          <h3>{item.title}</h3>
          <p>{item.summary}</p>
        </div>
      </Link>
    </article>
  );
}
