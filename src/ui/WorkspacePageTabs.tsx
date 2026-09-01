/**
 * 작업 공간을 큰 단일 페이지 대신 접근 가능한 탭 페이지로 전환하는 공용 내비게이션 컴포넌트다.
 * 선택 상태를 상위 컴포넌트에서 받아 tab/tabpanel 식별자와 roving tab stop을 일관되게 연결한다.
 * 방향키 포커스 이동과 좁은 화면의 자동 스크롤은 DOM 부수효과이며 콘텐츠 상태 자체는 이 컴포넌트가 소유하지 않는다.
 */
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
    // items 배열은 호출자가 인라인으로 다시 만들 수 있으므로 선택 인덱스만 의존해 불필요한 스크롤 effect를 막는다.
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
    // Enter/Space의 기본 button 활성화는 유지하되 상위 전역 단축키로 전파되는 것만 차단한다.
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
    // roving tab stop의 선택과 실제 DOM 포커스를 함께 옮겨 스크린리더와 시각적 페이지를 동기화한다.
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
