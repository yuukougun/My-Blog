import type { TocItem } from "@/types/article";

type TocProps = {
  items: TocItem[];
};

export default function Toc({ items }: TocProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="toc-panel" aria-label="目次">
      <p>目次</p>
      <ul>
        {items.map((item) => (
          <li key={item.id} className={`toc-level-${item.level}`}>
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
