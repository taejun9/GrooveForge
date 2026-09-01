/**
 * 스타일 변경 전에 BPM·스윙·사운드·패턴 차이를 보여 주고 적용 여부를 확인하는 모달이다.
 * preview가 있을 때만 렌더링하며 적용/취소는 상위 상태를 변경하는 콜백으로 위임한다.
 * 포커스 트랩, Escape, 배경 클릭을 한 취소 경로로 모아 키보드 사용자가 모달 뒤 UI를 조작하지 못하게 한다.
 */
import { Check, RefreshCcw, X } from "lucide-react";
import { useRef, type ReactElement } from "react";
import { useLocalization } from "./localization";
import type { StyleChangePreview } from "./styleChangePreview";
import { useModalFocusTrap } from "./useModalFocusTrap";

export function StyleChangeDialog({
  preview,
  onApply,
  onCancel
}: {
  preview: StyleChangePreview | null;
  onApply: () => void;
  onCancel: () => void;
}): ReactElement | null {
  const { t } = useLocalization();
  const dialogRef = useRef<HTMLElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  useModalFocusTrap(preview !== null, dialogRef, cancelRef);

  if (!preview) {
    return null;
  }

  return (
    <div
      className="project-change-overlay"
      data-testid="style-change-preview"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <section
        aria-describedby="style-change-description"
        aria-labelledby="style-change-title"
        aria-modal="true"
        className="project-change-dialog"
        data-testid="style-change-dialog"
        id="style-change-dialog"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onCancel();
          }
        }}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="project-change-heading">
          <span aria-hidden="true">
            <RefreshCcw size={18} />
          </span>
          <div>
            <small>{t("style.review")}</small>
            <h2 id="style-change-title">
              {preview.currentStyleName} → {preview.targetStyleName}
            </h2>
          </div>
          <button aria-label={t("style.keepAria")} data-testid="style-change-close" onClick={onCancel} type="button">
            <X size={15} aria-hidden="true" />
          </button>
        </header>

        <p id="style-change-description" className="project-change-description">
          {t("style.description")}
        </p>

        <div className="style-change-comparison" data-testid="style-change-comparison">
          <div>
            <span>{t("style.currentBeat")}</span>
            <strong>{preview.currentStyleName}</strong>
            <small>{t("style.summary", { bpm: preview.currentBpm, swing: preview.currentSwingPercent, sound: preview.currentSoundLabel })}</small>
            <em>{t("style.currentEvents", { events: preview.beforeEventTotal, pattern: preview.selectedPatternBefore })}</em>
          </div>
          <RefreshCcw size={17} aria-hidden="true" />
          <div className="target">
            <span>{t("style.afterApply")}</span>
            <strong>{preview.targetStyleName}</strong>
            <small>{t("style.summary", { bpm: preview.targetBpm, swing: preview.targetSwingPercent, sound: preview.targetSoundLabel })}</small>
            <em>{t("style.nextEvents", { events: preview.afterEventTotal })}</em>
          </div>
        </div>

        <div className="style-change-patterns" aria-label={t("style.patternPreview")}>
          {preview.patterns.map((pattern) => (
            <div data-testid={`style-change-pattern-${pattern.slot}`} key={pattern.slot}>
              <span>Pattern {pattern.slot}</span>
              <strong>
                {pattern.beforeEvents} → {pattern.afterEvents}
              </strong>
              <small>{t("style.eventsRebuilt")}</small>
            </div>
          ))}
        </div>

        <div className="project-change-safety" data-testid="style-change-safety">
          <Check size={15} aria-hidden="true" />
          <span>
            <strong>{t("style.undoable")}</strong>
            <small>{t("style.undoableDetail")}</small>
          </span>
        </div>

        <footer className="project-change-actions">
          <button ref={cancelRef} data-testid="style-change-cancel" onClick={onCancel} type="button">
            {t("style.keep")}
          </button>
          <button className="primary" data-testid="style-change-apply" onClick={onApply} type="button">
            <RefreshCcw size={15} aria-hidden="true" />
            {t("style.apply", { style: preview.targetStyleName })}
          </button>
        </footer>
      </section>
    </div>
  );
}
