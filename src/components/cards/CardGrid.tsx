import ContentCard from "@/components/cards/ContentCard";
import type { CardItem } from "@/types/content";

type CardGridProps = {
  items: CardItem[];
  emptyMessage?: string;
};

export default function CardGrid({ items, emptyMessage = "No items found." }: CardGridProps) {
  if (items.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <div className="card-grid">
      {items.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  );
}
