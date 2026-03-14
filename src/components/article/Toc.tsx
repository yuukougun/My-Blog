import type { TocItem } from "@/types/article";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";

type TocProps = {
  items: TocItem[];
  mode?: "panel" | "dialog";
  onClose?: () => void;
  onLinkClick?: () => void;
};

export default function Toc({ items, mode = "panel", onClose, onLinkClick }: TocProps) {
  if (items.length === 0) return null;

  useEscapeKey(mode === "dialog" && Boolean(onClose), () => {
    onClose?.();
  });

  if (mode === "dialog") {
    return (
      <div className="toc-dialog-layer" role="dialog" aria-modal="true" aria-label="目次">
        <button className="toc-dialog-overlay" aria-label="目次を閉じる" onClick={onClose} />
        <aside className="toc-panel toc-dialog-panel">
          <button className="toc-dialog-close" aria-label="目次を閉じる" onClick={onClose}>&times;</button>
          <p>目次</p>
          <ul>
            {items.map((item) => (
              <li key={item.id} className={`toc-level-${item.level}`}>
                <a
                  href={`#${item.id}`}
                  onClick={onLinkClick}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    );
  }

  // panel（従来通り）
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
