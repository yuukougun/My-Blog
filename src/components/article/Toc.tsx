import type { TocItem } from "@/types/article";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";

type TocProps = {
  items: TocItem[];
  mode?: "panel" | "dialog";
  onClose?: () => void;
  onLinkClick?: () => void;
};


// 階層化: h2ごとにh3を子ulでネスト
function nestToc(items: TocItem[]) {
  const nested: any[] = [];
  let currentH2: any = null;
  for (const item of items) {
    if (item.level === 2) {
      currentH2 = { ...item, children: [] };
      nested.push(currentH2);
    } else if (item.level === 3 && currentH2) {
      currentH2.children.push(item);
    }
  }
  return nested;
}

function TocList({ toc, onLinkClick, activeId }: { toc: ReturnType<typeof nestToc>, onLinkClick?: () => void, activeId?: string | null }) {
  return (
    <ul>
      {toc.map((item) => (
        <li key={item.id} className={`toc-level-2${activeId === item.id ? " active" : ""}`}>
          <a href={`#${item.id}`} onClick={onLinkClick}>{item.text}</a>
          {item.children && item.children.length > 0 && (
            <ul>
              {item.children.map((child: TocItem) => (
                <li key={child.id} className={`toc-level-3${activeId === child.id ? " active" : ""}`}>
                  <a href={`#${child.id}`} onClick={onLinkClick}>{child.text}</a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function Toc({ items, mode = "panel", onClose, onLinkClick, className, activeId }: TocProps & { className?: string, activeId?: string | null }) {
  if (items.length === 0) return null;

  useEscapeKey(mode === "dialog" && Boolean(onClose), () => {
    onClose?.();
  });

  const nested = nestToc(items);

  if (mode === "dialog") {
    return (
      <div className="toc-dialog-layer" role="dialog" aria-modal="true" aria-label="目次">
        <button className="toc-dialog-overlay" aria-label="目次を閉じる" onClick={onClose} />
        <aside className="toc-panel toc-dialog-panel">
          <button className="toc-dialog-close" aria-label="目次を閉じる" onClick={onClose}>&times;</button>
          <p>目次</p>
          <TocList toc={nested} onLinkClick={onLinkClick} activeId={activeId} />
        </aside>
      </div>
    );
  }

  // panel（従来通り）
  return (
    <aside className={`toc-panel${className ? ` ${className}` : ""}`} aria-label="目次">
      <p>目次</p>
      <TocList toc={nested} onLinkClick={onLinkClick} activeId={activeId} />
    </aside>
  );
}
