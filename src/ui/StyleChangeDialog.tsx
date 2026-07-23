import { Check, RefreshCcw, X } from "lucide-react";
import { useRef, type ReactElement } from "react";
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
            <small>Review before applying</small>
            <h2 id="style-change-title">
              {preview.currentStyleName} → {preview.targetStyleName}
            </h2>
          </div>
          <button aria-label="Keep current beat" data-testid="style-change-close" onClick={onCancel} type="button">
            <X size={15} aria-hidden="true" />
          </button>
        </header>

        <p id="style-change-description" className="project-change-description">
          Applying this style rebuilds the beat's BPM, swing, sound, and all three editable patterns. Nothing has changed yet.
        </p>

        <div className="style-change-comparison" data-testid="style-change-comparison">
          <div>
            <span>Current beat</span>
            <strong>{preview.currentStyleName}</strong>
            <small>
              {preview.currentBpm} BPM · {preview.currentSwingPercent}% swing · {preview.currentSoundLabel}
            </small>
            <em>
              {preview.beforeEventTotal} events · editing Pattern {preview.selectedPatternBefore}
            </em>
          </div>
          <RefreshCcw size={17} aria-hidden="true" />
          <div className="target">
            <span>After Apply</span>
            <strong>{preview.targetStyleName}</strong>
            <small>
              {preview.targetBpm} BPM · {preview.targetSwingPercent}% swing · {preview.targetSoundLabel}
            </small>
            <em>{preview.afterEventTotal} events · opens Pattern A</em>
          </div>
        </div>

        <div className="style-change-patterns" aria-label="Pattern replacement preview">
          {preview.patterns.map((pattern) => (
            <div data-testid={`style-change-pattern-${pattern.slot}`} key={pattern.slot}>
              <span>Pattern {pattern.slot}</span>
              <strong>
                {pattern.beforeEvents} → {pattern.afterEvents}
              </strong>
              <small>events rebuilt</small>
            </div>
          ))}
        </div>

        <div className="project-change-safety" data-testid="style-change-safety">
          <Check size={15} aria-hidden="true" />
          <span>
            <strong>Explicit and undoable</strong>
            <small>Apply creates one edit. Undo restores the current beat.</small>
          </span>
        </div>

        <footer className="project-change-actions">
          <button ref={cancelRef} data-testid="style-change-cancel" onClick={onCancel} type="button">
            Keep current beat
          </button>
          <button className="primary" data-testid="style-change-apply" onClick={onApply} type="button">
            <RefreshCcw size={15} aria-hidden="true" />
            Apply {preview.targetStyleName}
          </button>
        </footer>
      </section>
    </div>
  );
}
