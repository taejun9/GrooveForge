import type { KeyboardEvent, ReactElement, ReactNode } from "react";
import { useEffect, useRef } from "react";

export type WorkspacePageTabItem<PageId extends string> = {
  id: PageId;
  label: string;
  detail: string;
  meta: string;
  icon: ReactNode;
};

export function WorkspacePageTabs<PageId extends string>({
  activePage,
  ariaLabel,
  idPrefix,
  items,
  onSelect,
  title
}: {
  activePage: PageId;
  ariaLabel: string;
  idPrefix: string;
  items: WorkspacePageTabItem<PageId>[];
  onSelect: (page: PageId) => void;
  title: string;
}): ReactElement {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tablistRef = useRef<HTMLDivElement | null>(null);
  const activeItem = items.find((item) => item.id === activePage) ?? items[0];
  const activeIndex = items.findIndex((item) => item.id === activePage);

  useEffect(() => {
    const activeTab = activeIndex >= 0 ? tabRefs.current[activeIndex] : null;
    const tablist = tablistRef.current;
    if (!activeTab || !tablist || tablist.scrollWidth <= tablist.clientWidth + 1) {
      return;
    }
    const listRect = tablist.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    if (tabRect.left < listRect.left || tabRect.right > listRect.right) {
      activeTab.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" });
    }
  }, [activeIndex]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number): void {
    if (event.key === " " || event.key === "Enter") {
      event.stopPropagation();
      return;
    }

    let nextIndex: number;
    switch (event.key) {
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    const nextItem = items[nextIndex];
    if (!nextItem) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onSelect(nextItem.id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <section
      aria-label={ariaLabel}
      className="workspace-page-tabs"
      data-active-workspace-page={activePage}
      data-testid={`${idPrefix}-page-tabs`}
    >
      <header className="workspace-page-tabs-heading">
        <span>FOCUSED PAGE</span>
        <strong>{title}</strong>
        <small>{activeItem ? `${activeItem.label} · ${activeItem.detail}` : "Choose a page"}</small>
      </header>
      <div
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        className="workspace-page-tablist"
        ref={tablistRef}
        role="tablist"
      >
        {items.map((item, index) => {
          const selected = item.id === activePage;
          return (
            <button
              aria-controls={`${idPrefix}-page-panel-${item.id}`}
              aria-selected={selected}
              className="workspace-page-tab"
              data-testid={`${idPrefix}-page-tab-${item.id}`}
              id={`${idPrefix}-page-tab-${item.id}`}
              key={item.id}
              onClick={() => onSelect(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onKeyUp={(event) => {
                if (event.key === " " || event.key === "Enter") {
                  event.stopPropagation();
                }
              }}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              role="tab"
              tabIndex={selected ? 0 : -1}
              title={`Open ${item.label} page: ${item.detail}`}
              type="button"
            >
              <span className="workspace-page-tab-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="workspace-page-tab-copy">
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </span>
              <span className="workspace-page-tab-meta">{selected ? "OPEN" : item.meta}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
