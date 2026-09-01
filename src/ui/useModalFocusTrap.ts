/**
 * 열려 있는 모달 안에 키보드 포커스를 가두고 닫힐 때 이전 포커스를 복원하는 공용 React 훅이다.
 * 렌더 완료 다음 프레임에 선호 컨트롤을 포커스하고, 문서 수준 Tab/Shift+Tab을 첫·마지막 요소 사이로 순환시킨다.
 * 정리 함수에서 이벤트와 예약 프레임을 반드시 해제해 닫힌 모달이 이후 키 입력을 가로채지 않게 한다.
 */
import { useEffect, type RefObject } from "react";

const focusableSelector = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

function focusableElements(dialog: HTMLElement): HTMLElement[] {
  return Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => element.getAttribute("aria-hidden") !== "true" && element.getClientRects().length > 0
  );
}

export function useModalFocusTrap(
  open: boolean,
  dialogRef: RefObject<HTMLElement | null>,
  preferredFocusRef?: RefObject<HTMLElement | null>
): void {
  useEffect(() => {
    if (!open) {
      return;
    }

    // DOM이 실제로 배치된 다음 프레임에 포커스해야 조건부 렌더링 직후의 null ref를 피할 수 있다.
    const frame = window.requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }
      const preferred = preferredFocusRef?.current;
      const target =
        preferred && !preferred.matches(":disabled") && dialog.contains(preferred)
          ? preferred
          : focusableElements(dialog)[0] ?? dialog;
      target.focus();
    });

    function trapTab(event: KeyboardEvent): void {
      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }
      const elements = focusableElements(dialog);
      // 포커스 가능한 자식이 없어도 대화상자 자체에 머물러 배경 컨트롤로 빠지지 않게 한다.
      if (elements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const activeElement = document.activeElement;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!dialog.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && (activeElement === first || activeElement === dialog)) {
        event.preventDefault();
        last.focus();
      }
    }

    document.addEventListener("keydown", trapTab, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", trapTab, true);
    };
  }, [dialogRef, open, preferredFocusRef]);
}
