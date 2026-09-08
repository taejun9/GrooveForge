/**
 * 데스크톱 작업 화면의 우측 상단에 고정되는 공용 액션 도크다.
 * 마우스 hover와 click, 키보드 메뉴 탐색을 같은 단일-open 상태로 묶어 export와 프로젝트 기능이 겹치지 않게 한다.
 */
import type { KeyboardEvent, PointerEvent, ReactElement, ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type HeaderActionMenuItem = {
  id: string;
  label: string;
  detail: string;
  icon: ReactNode;
  testId: string;
  title: string;
  disabled?: boolean;
  keyShortcuts?: string;
  onSelect: () => void;
};

type HeaderMenuId = "utility" | "export";
type HeaderMenuState = { id: HeaderMenuId; reason: "hover" | "pinned" } | null;

function enabledMenuItems(menu: HTMLElement | null): HTMLButtonElement[] {
  return menu
    ? Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'))
    : [];
}

export function HeaderActionDock({
  canRedo,
  canUndo,
  exportDetail,
  exportItems,
  exportLabel,
  redoLabel,
  redoTitle,
  undoLabel,
  undoTitle,
  utilityDetail,
  utilityItems,
  utilityLabel,
  onRedo,
  onUndo,
  exportIcon,
  utilityIcon,
  redoIcon,
  undoIcon
}: {
  canRedo: boolean;
  canUndo: boolean;
  exportDetail: string;
  exportItems: HeaderActionMenuItem[];
  exportLabel: string;
  redoLabel: string;
  redoTitle: string;
  undoLabel: string;
  undoTitle: string;
  utilityDetail: string;
  utilityItems: HeaderActionMenuItem[];
  utilityLabel: string;
  onRedo: () => void;
  onUndo: () => void;
  exportIcon: ReactNode;
  utilityIcon: ReactNode;
  redoIcon: ReactNode;
  undoIcon: ReactNode;
}): ReactElement {
  const [menuState, setMenuState] = useState<HeaderMenuState>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const pendingFocusRef = useRef<{ id: HeaderMenuId; edge: "first" | "last" } | null>(null);
  const triggerRefs = useRef<Record<HeaderMenuId, HTMLButtonElement | null>>({ utility: null, export: null });
  const menuRefs = useRef<Record<HeaderMenuId, HTMLDivElement | null>>({ utility: null, export: null });

  const clearCloseTimer = (): void => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const closeMenu = (restoreFocus = false): void => {
    const activeId = menuState?.id ?? null;
    clearCloseTimer();
    pendingFocusRef.current = null;
    setMenuState(null);
    if (restoreFocus && activeId) {
      window.requestAnimationFrame(() => triggerRefs.current[activeId]?.focus());
    }
  };

  const closeMenuAndMoveFocus = (id: HeaderMenuId, reverse: boolean): void => {
    const trigger = triggerRefs.current[id];
    const menu = menuRefs.current[id];
    const focusable = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], summary, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      (element) =>
        element.getClientRects().length > 0 &&
        element.getAttribute("aria-hidden") !== "true" &&
        !menu?.contains(element)
    );
    const triggerIndex = trigger ? focusable.indexOf(trigger) : -1;
    const target = triggerIndex >= 0 ? focusable[triggerIndex + (reverse ? -1 : 1)] : null;
    clearCloseTimer();
    pendingFocusRef.current = null;
    setMenuState(null);
    window.requestAnimationFrame(() => (target ?? trigger)?.focus());
  };

  const pinMenu = (id: HeaderMenuId, focusEdge?: "first" | "last"): void => {
    clearCloseTimer();
    if (menuState?.id === id && menuState.reason === "pinned") {
      pendingFocusRef.current = null;
      setMenuState(null);
      return;
    }
    pendingFocusRef.current = focusEdge ? { id, edge: focusEdge } : null;
    setMenuState({ id, reason: "pinned" });
  };

  const handlePointerEnter = (id: HeaderMenuId, event: PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType && event.pointerType !== "mouse") {
      return;
    }
    clearCloseTimer();
    setMenuState((current) => (current?.id === id && current.reason === "pinned" ? current : { id, reason: "hover" }));
  };

  const handlePointerLeave = (id: HeaderMenuId, event: PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType && event.pointerType !== "mouse") {
      return;
    }
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setMenuState((current) => (current?.id === id && current.reason === "hover" ? null : current));
      closeTimerRef.current = null;
    }, 180);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>, id: HeaderMenuId): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      pinMenu(id, "first");
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      pendingFocusRef.current = { id, edge: event.key === "ArrowDown" ? "first" : "last" };
      setMenuState({ id, reason: "pinned" });
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeMenu(true);
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>, id: HeaderMenuId): void => {
    // 메뉴 위의 글자·숫자·Delete 입력이 전역 Pattern 선택/삭제/재생 단축키로 새지 않게 한다.
    event.stopPropagation();
    const items = enabledMenuItems(menuRefs.current[id]);
    const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);
    let nextIndex: number | null = null;
    if (event.key === "ArrowDown") {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
    } else if (event.key === "ArrowUp") {
      nextIndex = currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = items.length - 1;
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeMenu(true);
      return;
    } else if (event.key === "Tab") {
      event.preventDefault();
      closeMenuAndMoveFocus(id, event.shiftKey);
      return;
    } else {
      return;
    }

    if (nextIndex !== null && items[nextIndex]) {
      event.preventDefault();
      items[nextIndex].focus();
    }
  };

  const runMenuItem = (menuId: HeaderMenuId, item: HeaderActionMenuItem): void => {
    // 대화상자가 현재 menuitem이 아니라 영구 trigger로 포커스를 돌려줄 수 있도록 실행 전에 기준점을 옮긴다.
    triggerRefs.current[menuId]?.focus();
    pendingFocusRef.current = null;
    setMenuState(null);
    item.onSelect();
  };

  useEffect(() => {
    if (!menuState) {
      return;
    }

    const dismissOutside = (event: globalThis.PointerEvent): void => {
      if (!dockRef.current?.contains(event.target as Node)) {
        pendingFocusRef.current = null;
        setMenuState(null);
      }
    };
    const dismissMenuWithEscape = (event: globalThis.KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }
      clearCloseTimer();
      pendingFocusRef.current = null;
      setMenuState(null);
    };
    document.addEventListener("pointerdown", dismissOutside, true);
    document.addEventListener("keydown", dismissMenuWithEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside, true);
      document.removeEventListener("keydown", dismissMenuWithEscape);
    };
  }, [menuState]);

  useLayoutEffect(() => {
    const pendingFocus = pendingFocusRef.current;
    if (!pendingFocus || menuState?.id !== pendingFocus.id) {
      return;
    }
    const items = enabledMenuItems(menuRefs.current[pendingFocus.id]);
    items[pendingFocus.edge === "first" ? 0 : items.length - 1]?.focus();
    pendingFocusRef.current = null;
  }, [menuState]);

  useEffect(() => () => clearCloseTimer(), []);

  const renderMenu = (
    id: HeaderMenuId,
    label: string,
    detail: string,
    icon: ReactNode,
    items: HeaderActionMenuItem[]
  ): ReactElement => {
    const open = menuState?.id === id;
    return (
      <div
        className={`header-action-menu ${id === "export" ? "primary" : ""}`}
        data-open={open}
        data-open-reason={open ? menuState.reason : "closed"}
        onPointerEnter={(event) => handlePointerEnter(id, event)}
        onPointerLeave={(event) => handlePointerLeave(id, event)}
      >
        <button
          aria-controls={`header-${id}-menu`}
          aria-expanded={open}
          aria-haspopup="menu"
          className="header-action-menu-trigger"
          data-testid={`header-${id}-trigger`}
          onClick={(event) => {
            pinMenu(id, event.detail === 0 ? "first" : undefined);
          }}
          onKeyDown={(event) => handleTriggerKeyDown(event, id)}
          ref={(node) => {
            triggerRefs.current[id] = node;
          }}
          title={detail}
          type="button"
        >
          {icon}
          <span>{label}</span>
        </button>
        {open && (
          <div
            aria-label={label}
            className="header-action-menu-popover"
            data-testid={`header-${id}-menu`}
            id={`header-${id}-menu`}
            onKeyDown={(event) => handleMenuKeyDown(event, id)}
            ref={(node) => {
              menuRefs.current[id] = node;
            }}
            role="menu"
          >
            <header>
              <strong>{label}</strong>
              <small>{detail}</small>
            </header>
            <div className="header-action-menu-items">
              {items.map((item) => (
                <button
                  aria-keyshortcuts={item.keyShortcuts}
                  data-testid={item.testId}
                  disabled={item.disabled}
                  key={item.id}
                  onClick={() => runMenuItem(id, item)}
                  role="menuitem"
                  title={item.title}
                  type="button"
                >
                  <span className="header-action-menu-item-icon" aria-hidden="true">{item.icon}</span>
                  <span className="header-action-menu-item-copy">
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div aria-label={utilityDetail} className="header-action-dock" data-testid="header-action-dock" ref={dockRef} role="toolbar">
      <button
        aria-keyshortcuts="Control+Z Meta+Z"
        aria-label={undoLabel}
        className="header-action-direct"
        data-testid="undo-button"
        disabled={!canUndo}
        onClick={() => {
          closeMenu();
          onUndo();
        }}
        title={undoTitle}
        type="button"
      >
        {undoIcon}
      </button>
      <button
        aria-keyshortcuts="Control+Y Meta+Y Control+Shift+Z Meta+Shift+Z"
        aria-label={redoLabel}
        className="header-action-direct"
        data-testid="redo-button"
        disabled={!canRedo}
        onClick={() => {
          closeMenu();
          onRedo();
        }}
        title={redoTitle}
        type="button"
      >
        {redoIcon}
      </button>
      {renderMenu("utility", utilityLabel, utilityDetail, utilityIcon, utilityItems)}
      {renderMenu("export", exportLabel, exportDetail, exportIcon, exportItems)}
    </div>
  );
}
