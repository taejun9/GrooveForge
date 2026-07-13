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
