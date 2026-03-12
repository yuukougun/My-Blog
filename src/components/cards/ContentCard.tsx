import Image from "next/image";
import Link from "next/link";
import type { CardItem } from "@/types/content";

type ContentCardProps = {
  item: CardItem;
};

export default function ContentCard({ item }: ContentCardProps) {
  return (
    <article className="content-card">
      <Link href={item.href}>
        <div className="content-card-image-wrap">
          <Image src={item.image} alt={item.title} width={640} height={360} className="content-card-image" />
        </div>
        <div className="content-card-body">
          <p className="content-card-date">{item.publishedAt}</p>
          <h3>{item.title}</h3>
          <p>{item.summary}</p>
        </div>
      </Link>
    </article>
  );
}
