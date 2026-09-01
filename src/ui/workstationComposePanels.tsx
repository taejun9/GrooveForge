/**
 * Compose 페이지의 드럼·베이스·멜로디·코드·사운드 디자인 편집 패널을 모은 프레젠테이션 계층이다.
 * ProjectState를 직접 소유하지 않고 선택값·미리보기·콜백을 받아 그리드, 인스펙터, 패드와 결과 스트립을 렌더링한다.
 * 그리드 키보드 탐색, MIDI/컴퓨터 키보드 캡처, 중첩 버튼 이벤트의 포커스 경계를 지키는 것이 주요 상호작용 책임이다.
 */
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Copy, Drum, ListChecks, Music2, Play, Plus, RotateCcw, Save, SlidersHorizontal, Trash2, Waves, X } from "lucide-react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactElement, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { BassNote, ChordEvent, ChordProgressionPreset, ChordQuality, DrumLane, MelodyNote, NoteTrack, PatternSlot, PatternVariationPreset, ProjectState, SoundDesign } from "../domain/workstation";
import { chordInversions, chordInversionLabel, chordProgressionPresetIds, chordProgressionPresetLabel, chordQualities, drumStepProbability, drumStepTimingMs, drumStepVelocity, hatRepeatCount, maxDrumTimingMs, minDrumTimingMs, normalizeChordInversion, normalizeDrumProbability, normalizeDrumTimingMs, normalizeDrumVelocity, normalizeEventProbability, normalizeHatRepeat, scalePitchNames, soundPresetIds, soundPresetLabel, steps } from "../domain/workstation";
import type { BassContourId, BassContourOption, BassGlidePadId, BassGlidePadOption, BassMovePreviewSummary, BassMoveResult, BasslinePadId, BasslinePadOption, ChordClipboard, ChordHarmonicSummary, ChordMovePreviewSummary, ChordMoveResult, ChordPadId, ChordPadOption, ChordRhythmId, ChordRhythmOption, ChordVoicingId, ChordVoicingOption, DrumAccentId, DrumAccentOption, DrumClipboard, DrumFoundationId, DrumFoundationOption, DrumKitPadId, DrumKitPadOption, DrumKitPreviewDecisionSummary, DrumKitPreviewSummary, DrumKitResult, DrumMovePreviewSummary, DrumMoveResult, DrumPocketSummary, GrooveFeelId, GrooveFeelOption, KeyboardCaptureDefaults, KeyboardCaptureKeyMapItem, KeyboardCaptureStepMode, MelodyAccentId, MelodyAccentOption, MelodyContourId, MelodyContourOption, MelodyMovePreviewSummary, MelodyMoveResult, MelodyMotifId, MelodyMotifOption, MidiCaptureStatus, MidiCaptureSummary, MidiInputOption, NoteClipboard, NoteDegreeSummary, NoteView, PatternClonePadOption, PatternCloneSuggestionSummary, PatternCloneResult, PatternFillPreviewSummary, PatternFillSuggestionSummary, PatternFillResult, PatternStackId, PatternStackOption, PatternStackPreviewSummary, PatternStackResult, PatternVariationPreviewSummary, PatternVariationSuggestionSummary, PatternVariationResult, SelectedDrumStep, SelectedNote, SoundFocusPadId, SoundFocusPadOption, SoundFocusPreviewDecisionSummary, SoundFocusPreviewSummary, SoundFocusResult, SoundPresetPreviewDecisionSummary, SoundPresetPreviewSummary, SoundPresetResult, SoundPresetTarget, SoundSnapshot, SoundSnapshotComparisonSummary, SoundSnapshotSlotId, SoundSnapshotSlotMap, SoundTimbreCheckSummary, SwingFeelResult } from "./workstationUiModel";
import { drumLabels, keyboardCaptureKeyLabels } from "./workstationUiModel";
import {
  isNoteGridActivationKey,
  isNoteGridNavigationKey,
  noteGridEntryCell,
  noteGridNavigationTarget
} from "./noteGridKeyboardNavigation";
import { chanceBadgeLabel, clampStepStart, compactChanceBadgeLabel, nextEmptyChordStep, percentLabel, pitchParts, timingLabel, trackOctaveRange } from "./workstationPatternTools";
import type { StudioToneBaseline, StudioToneBaselineResult, StudioToneDriftSummary, StudioToneResetResult } from "./studioToneTools";
import { studioToneControls, studioToneResetNextCheck } from "./studioToneTools";
import { handleChordCardKeyboardActivation } from "./chordCardKeyboardActivation";
import { useLocalization } from "./localization";

export function DrumStepInspector({
  selectedStep,
  drumClipboard,
  active,
  velocity,
  timingMs,
  probability,
  hatRepeat,
  beatDuplicateStep,
  previousBeatDuplicateStep,
  onVelocityChange,
  onProbabilityChange,
  onTimingChange,
  onHatRepeatChange,
  onAudition,
  onCopy,
  onPaste,
  onDuplicateBeat,
  onDuplicatePreviousBeat
}: {
  selectedStep: SelectedDrumStep | null;
  drumClipboard: DrumClipboard | null;
  active: boolean;
  velocity?: number;
  timingMs: number;
  probability?: number;
  hatRepeat: number;
  beatDuplicateStep: number | null;
  previousBeatDuplicateStep: number | null;
  onVelocityChange: (velocity: number) => void;
  onProbabilityChange: (probability: number) => void;
  onTimingChange: (timingMs: number) => void;
  onHatRepeatChange: (repeat: number) => void;
  onAudition: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicateBeat: () => void;
  onDuplicatePreviousBeat: () => void;
}): ReactElement {
  const { t } = useLocalization();
  const velocityValue = velocity ?? 0.75;
  const probabilityValue = probability ?? 1;
  const timingValue = normalizeDrumTimingMs(timingMs);
  const timingTextValue = `${timingValue}`;
  const [timingText, setTimingText] = useState(timingTextValue);
  const [isEditingTiming, setIsEditingTiming] = useState(false);
  const skipNextTimingBlurCommit = useRef(false);
  const label = selectedStep ? `${drumLabels[selectedStep.lane]} ${selectedStep.step + 1}` : t("compose.panel.noStep");
  const clipboardLabel = drumClipboard ? `${drumLabels[drumClipboard.lane]} ${drumClipboard.step + 1}` : t("compose.panel.empty");
  const pocketSummary =
    selectedStep && active ? selectedDrumPocketSummary(selectedStep, velocityValue, probabilityValue, timingValue, hatRepeat) : null;

  useEffect(() => {
    if (!isEditingTiming) {
      setTimingText(timingTextValue);
    }
  }, [isEditingTiming, timingTextValue]);

  function commitTimingInput(inputText: string): void {
    const nextText = inputText.trim();
    const parsed = nextText === "" ? timingValue : Number(nextText);
    const nextTiming = normalizeDrumTimingMs(parsed);

    setIsEditingTiming(false);
    setTimingText(`${nextTiming}`);
    if (nextTiming !== timingValue) {
      onTimingChange(nextTiming);
    }
  }

  return (
    <div className="drum-step-inspector" aria-label={t("compose.panel.drums.dynamicsAria")}>
      <div className="inspector-heading">
        <span>{t("compose.panel.drums.dynamics")}</span>
        <strong data-testid="drum-step-readout">
          {selectedStep
            ? `${label} ${active ? `${percentLabel(velocityValue)} / ${percentLabel(probabilityValue)} ${t("compose.panel.chance")} / ${timingLabel(timingValue)}` : t("compose.panel.off")}`
            : t("compose.panel.drums.selectStep")}
        </strong>
      </div>
      {pocketSummary && (
        <div className={pocketSummary.isShaped ? "drum-pocket-readout shaped" : "drum-pocket-readout"} data-testid="drum-pocket-readout">
          <span data-testid="drum-pocket-position">{pocketSummary.positionLabel}</span>
          <strong data-testid="drum-pocket-role">{pocketSummary.roleLabel}</strong>
          <small data-testid="drum-pocket-detail">{pocketSummary.detailLabel}</small>
        </div>
      )}
      <label>
        <span>{t("compose.panel.velocity")} {active ? percentLabel(velocityValue) : "--"}</span>
        <div className="drum-value-row">
          <input
            aria-label={t("compose.panel.drums.velocityAria")}
            data-testid="drum-velocity"
            disabled={!selectedStep || !active}
            max={1}
            min={0.15}
            onChange={(event) => onVelocityChange(Number(event.target.value))}
            step={0.01}
            type="range"
            value={velocityValue}
          />
          <input
            aria-label={t("compose.panel.drums.velocityPercentAria")}
            data-testid="drum-velocity-input"
            disabled={!selectedStep || !active}
            max={100}
            min={15}
            onChange={(event) => onVelocityChange(Number(event.target.value) / 100)}
            step={1}
            type="number"
            value={Math.round(velocityValue * 100)}
          />
        </div>
      </label>
      <label>
        <span>{t("compose.panel.chance")} {active ? percentLabel(probabilityValue) : "--"}</span>
        <div className="drum-value-row">
          <input
            aria-label={t("compose.panel.drums.probabilityAria")}
            data-testid="drum-probability"
            disabled={!selectedStep || !active}
            max={1}
            min={0}
            onChange={(event) => onProbabilityChange(Number(event.target.value))}
            step={0.01}
            type="range"
            value={probabilityValue}
          />
          <input
            aria-label={t("compose.panel.drums.probabilityPercentAria")}
            data-testid="drum-probability-input"
            disabled={!selectedStep || !active}
            max={100}
            min={0}
            onChange={(event) => onProbabilityChange(Number(event.target.value) / 100)}
            step={1}
            type="number"
            value={Math.round(probabilityValue * 100)}
          />
        </div>
      </label>
      <label>
        <span>{t("compose.panel.drums.timing")} {active ? timingLabel(timingValue) : "--"}</span>
        <div className="timing-row" aria-label={t("compose.panel.drums.timingAria")}>
          {[
            { label: t("compose.panel.drums.early"), timing: -15, testId: "drum-timing-early" },
            { label: t("compose.panel.drums.onGrid"), timing: 0, testId: "drum-timing-on" },
            { label: t("compose.panel.drums.late"), timing: 15, testId: "drum-timing-late" }
          ].map((option) => (
            <button
              className={timingValue === option.timing ? "selected" : ""}
              data-testid={option.testId}
              disabled={!selectedStep || !active}
              key={option.label}
              onClick={() => onTimingChange(option.timing)}
              type="button"
            >
              {option.label}
            </button>
          ))}
          <input
            aria-label={t("compose.panel.drums.timingMsAria")}
            data-testid="drum-timing-input"
            disabled={!selectedStep || !active}
            max={maxDrumTimingMs}
            min={minDrumTimingMs}
            onBlur={(event) => {
              if (skipNextTimingBlurCommit.current) {
                skipNextTimingBlurCommit.current = false;
                return;
              }
              commitTimingInput(event.currentTarget.value);
            }}
            onChange={(event) => {
              setIsEditingTiming(true);
              setTimingText(event.target.value);
            }}
            onFocus={() => {
              setIsEditingTiming(true);
              setTimingText(timingTextValue);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                skipNextTimingBlurCommit.current = true;
                commitTimingInput(event.currentTarget.value);
                event.currentTarget.blur();
              }
              if (event.key === "Escape") {
                skipNextTimingBlurCommit.current = true;
                setIsEditingTiming(false);
                setTimingText(timingTextValue);
                event.currentTarget.blur();
              }
            }}
            step={1}
            type="number"
            value={isEditingTiming ? timingText : timingTextValue}
          />
        </div>
      </label>
      {selectedStep?.lane === "hat" && (
        <div className="repeat-row" aria-label={t("compose.panel.drums.hatRepeatAria")}>
          {[1, 2, 3, 4].map((repeat) => (
            <button
              className={hatRepeat === repeat ? "selected" : ""}
              data-testid={`hat-repeat-${repeat}`}
              disabled={!active}
              key={repeat}
              onClick={() => onHatRepeatChange(repeat)}
              type="button"
            >
              {repeat}x
            </button>
          ))}
        </div>
      )}
      <div className="drum-clipboard-row" aria-label={t("compose.panel.drums.hitToolsAria")}>
        <button
          aria-label={t("compose.panel.drums.auditionHit")}
          data-testid="drum-audition"
          disabled={!selectedStep || !active}
          onClick={onAudition}
          title={t("compose.panel.drums.auditionHit")}
          type="button"
        >
          <Play size={14} aria-hidden="true" />
          <span>{t("compose.panel.audition")}</span>
        </button>
        <button
          aria-label={t("compose.panel.drums.copyHitShape")}
          data-testid="drum-copy"
          disabled={!selectedStep || !active}
          onClick={onCopy}
          title={t("compose.panel.drums.copyHitShape")}
          type="button"
        >
          <Copy size={14} aria-hidden="true" />
          <span>{t("compose.panel.drums.copyHit")}</span>
        </button>
        <button
          aria-label={t("compose.panel.drums.pasteHitNext")}
          data-testid="drum-paste"
          disabled={!drumClipboard}
          onClick={onPaste}
          title={t("compose.panel.drums.pasteHitNext")}
          type="button"
        >
          <Plus size={14} aria-hidden="true" />
          <span>{t("compose.panel.drums.pasteNext")}</span>
        </button>
        <button
          aria-label={t("compose.panel.drums.duplicatePrevious")}
          data-testid="drum-duplicate-previous-beat"
          disabled={!selectedStep || !active || previousBeatDuplicateStep === null}
          onClick={onDuplicatePreviousBeat}
          title={
            previousBeatDuplicateStep === null
              ? t("compose.panel.drums.noEarlierSlot")
              : t("compose.panel.drums.duplicateToStep", { step: previousBeatDuplicateStep + 1 })
          }
          type="button"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>{t("compose.panel.previousBeat")}</span>
        </button>
        <button
          aria-label={t("compose.panel.drums.duplicateNext")}
          data-testid="drum-duplicate-beat"
          disabled={!selectedStep || !active || beatDuplicateStep === null}
          onClick={onDuplicateBeat}
          title={beatDuplicateStep === null ? t("compose.panel.drums.noLaterSlot") : t("compose.panel.drums.duplicateToStep", { step: beatDuplicateStep + 1 })}
          type="button"
        >
          <ArrowRight size={14} aria-hidden="true" />
          <span>{t("compose.panel.nextBeat")}</span>
        </button>
        <small data-testid="drum-clipboard-detail">
          {drumClipboard ? t("compose.panel.clipboardValue", { value: clipboardLabel }) : t("compose.panel.clipboardEmpty")}
        </small>
      </div>
    </div>
  );
}

export function DrumMovePreview({ preview }: { preview: DrumMovePreviewSummary }): ReactElement {
  return (
    <div
      className={`drum-move-preview ${preview.tone}`}
      data-preview-drum-accent={preview.accentId}
      data-preview-drum-feel={preview.feelId}
      data-preview-drum-foundation={preview.foundationId}
      data-testid="drum-move-preview"
      title={preview.detailTitle}
    >
      <span data-testid="drum-move-preview-status">{preview.statusLabel}</span>
      <strong data-testid="drum-move-preview-pattern">{preview.patternLabel}</strong>
      <small data-testid="drum-move-preview-foundation">{preview.foundationLabel}</small>
      <small data-testid="drum-move-preview-feel">{preview.feelLabel}</small>
      <small data-testid="drum-move-preview-accent">{preview.accentLabel}</small>
      <small data-testid="drum-move-preview-moves">{preview.moveLabel}</small>
    </div>
  );
}

export function SwingFeelResultStrip({ result }: { result: SwingFeelResult }): ReactElement {
  const { t } = useLocalization();
  return (
    <div className={`quick-action-result ${result.tone}`} data-result-swing-feel={result.padId} data-testid="swing-feel-result" aria-live="polite">
      <div className="quick-action-result-main">
        <span data-testid="swing-feel-result-status">{result.status}</span>
        <strong data-testid="swing-feel-result-title">{result.title}</strong>
        <small data-testid="swing-feel-result-detail">{result.detail}</small>
      </div>
      <div className={`quick-action-result-metric ${result.metric.tone}`} data-testid="swing-feel-result-metric">
        <span>{result.metric.label}</span>
        <strong data-testid="swing-feel-result-metric-value">
          {result.metric.before} -&gt; {result.metric.after}
        </strong>
      </div>
      <div className="quick-action-result-followup" data-testid="swing-feel-result-followup">
        <span>
          <b>{t("compose.panel.audition")}</b>
          <em data-testid="swing-feel-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>{t("compose.panel.nextCheck")}</b>
          <em data-testid="swing-feel-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function DrumMoveResultStrip({ result }: { result: DrumMoveResult }): ReactElement {
  return (
    <div className={`drum-move-result ${result.tone}`} data-result-drum-move={result.moveId} data-testid="drum-move-result" aria-live="polite">
      <div className="drum-move-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="drum-move-result-title">{result.title}</strong>
          <small data-testid="drum-move-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="drum-move-result-meta">
        <span data-testid="drum-move-result-status">{result.status}</span>
        <span data-testid="drum-move-result-scope">{result.scope}</span>
        <span data-testid="drum-move-result-impact">{result.impact}</span>
      </div>
      <div className="drum-move-result-metrics" data-testid="drum-move-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`drum-move-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="drum-move-result-followup" data-testid="drum-move-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="drum-move-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="drum-move-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function GrooveFeelPads({
  feels,
  onApply
}: {
  feels: GrooveFeelOption[];
  onApply: (feel: GrooveFeelId) => void;
}): ReactElement {
  const { t } = useLocalization();
  return (
    <div className="groove-feel-panel" data-testid="groove-feel-pads">
      <div className="groove-feel-heading">
        <span>{t("compose.panel.grooveFeel.title")}</span>
        <strong>{t("compose.panel.grooveFeel.detail")}</strong>
      </div>
      <div className="groove-feel-row" aria-label={t("compose.panel.grooveFeel.padsAria")}>
        {feels.map((feel) => {
          const label = t(`compose.panel.grooveFeel.${feel.id}`);
          const detail = t(`compose.panel.grooveFeel.${feel.id}Detail`);
          return (
            <button
              data-testid={`groove-feel-${feel.id}`}
              key={feel.id}
              onClick={() => onApply(feel.id)}
              title={`${label} ${feel.timingPreview}`}
              type="button"
            >
              <span>{label}</span>
              <strong>{feel.timingPreview}</strong>
              <small>{feel.chancePreview} / {detail}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DrumAccentPads({
  accents,
  onApply
}: {
  accents: DrumAccentOption[];
  onApply: (accent: DrumAccentId) => void;
}): ReactElement {
  const { t } = useLocalization();
  return (
    <div className="drum-accent-panel" data-testid="drum-accent-pads">
      <div className="drum-accent-heading">
        <span>{t("compose.panel.drumAccents.title")}</span>
        <strong>{t("compose.panel.drumAccents.detail")}</strong>
      </div>
      <div className="drum-accent-row" aria-label={t("compose.panel.drumAccents.padsAria")}>
        {accents.map((accent) => {
          const label = t(`compose.panel.drumAccents.${accent.id}`);
          const detail = t(`compose.panel.drumAccents.${accent.id}Detail`);
          return (
            <button
              data-testid={`drum-accent-${accent.id}`}
              key={accent.id}
              onClick={() => onApply(accent.id)}
              title={`${label} ${accent.preview}`}
              type="button"
            >
              <span>{label}</span>
              <strong>{accent.preview}</strong>
              <small>{detail}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PatternClonePads({
  clones,
  onApply
}: {
  clones: PatternClonePadOption[];
  onApply: (target: PatternSlot, preset: PatternVariationPreset) => void;
}): ReactElement {
  return (
    <div className="pattern-clone-panel" data-testid="pattern-clone-pads">
      <div className="pattern-clone-heading">
        <span>Pattern Clone Pads</span>
        <strong>A/B/C Variation</strong>
      </div>
      <div className="pattern-clone-row" aria-label="Pattern Clone Pads">
        {clones.map((clone) => (
          <button
            data-testid={`pattern-clone-${clone.target}-${clone.preset}`}
            key={clone.id}
            onClick={() => onApply(clone.target, clone.preset)}
            title={`${clone.detail} as ${clone.preview}`}
            type="button"
          >
            <span>{clone.label}</span>
            <strong>{clone.preview}</strong>
            <small>{clone.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PatternCloneSuggestion({ summary }: { summary: PatternCloneSuggestionSummary }): ReactElement {
  return (
    <div
      className={`pattern-clone-suggestion ${summary.tone}`}
      data-suggested-pattern-clone={`${summary.source}-${summary.target}-${summary.preset}`}
      data-testid="pattern-clone-suggestion"
      title={summary.detailTitle}
    >
      <span data-testid="pattern-clone-suggestion-status">{summary.statusLabel}</span>
      <strong data-testid="pattern-clone-suggestion-route">{summary.routeLabel}</strong>
      <small data-testid="pattern-clone-suggestion-preset">{summary.presetLabel}</small>
      <small data-testid="pattern-clone-suggestion-detail">{summary.detailLabel}</small>
      <small data-testid="pattern-clone-suggestion-moves">{summary.moveLabel}</small>
    </div>
  );
}

export function PatternStackPreview({ preview }: { preview: PatternStackPreviewSummary }): ReactElement {
  return (
    <div
      className={`pattern-stack-preview ${preview.tone}`}
      data-preview-pattern-stack={preview.stackId}
      data-testid="pattern-stack-preview"
      title={preview.detailTitle}
    >
      <span data-testid="pattern-stack-preview-status">{preview.statusLabel}</span>
      <strong data-testid="pattern-stack-preview-pattern">{preview.patternLabel}</strong>
      <small data-testid="pattern-stack-preview-stack">{preview.stackLabel}</small>
      <small data-testid="pattern-stack-preview-bass">{preview.bassLabel}</small>
      <small data-testid="pattern-stack-preview-chord">{preview.chordLabel}</small>
      <small data-testid="pattern-stack-preview-melody">{preview.melodyLabel}</small>
      <small data-testid="pattern-stack-preview-moves">{preview.moveLabel}</small>
    </div>
  );
}

export function PatternVariationPreview({ preview }: { preview: PatternVariationPreviewSummary }): ReactElement {
  return (
    <div
      className={`pattern-stack-preview pattern-variation-preview ${preview.tone}`}
      data-preview-pattern-variation={`${preview.pattern}-${preview.preset}`}
      data-testid="pattern-variation-preview"
      title={preview.detailTitle}
    >
      <span data-testid="pattern-variation-preview-status">{preview.statusLabel}</span>
      <strong data-testid="pattern-variation-preview-pattern">{preview.patternLabel}</strong>
      <small data-testid="pattern-variation-preview-preset">{preview.presetLabel}</small>
      <small data-testid="pattern-variation-preview-drums">{preview.drumsLabel}</small>
      <small data-testid="pattern-variation-preview-bass">{preview.bassLabel}</small>
      <small data-testid="pattern-variation-preview-chord">{preview.chordLabel}</small>
      <small data-testid="pattern-variation-preview-melody">{preview.melodyLabel}</small>
      <small data-testid="pattern-variation-preview-moves">{preview.moveLabel}</small>
    </div>
  );
}

export function PatternVariationSuggestion({ summary }: { summary: PatternVariationSuggestionSummary }): ReactElement {
  return (
    <div
      className={`pattern-variation-suggestion ${summary.tone}`}
      data-suggested-pattern-variation={summary.preset}
      data-testid="pattern-variation-suggestion"
      title={summary.detailTitle}
    >
      <span data-testid="pattern-variation-suggestion-status">{summary.statusLabel}</span>
      <strong data-testid="pattern-variation-suggestion-preset">{summary.presetLabel}</strong>
      <small data-testid="pattern-variation-suggestion-pattern">{summary.patternLabel}</small>
      <small data-testid="pattern-variation-suggestion-detail">{summary.detailLabel}</small>
      <small data-testid="pattern-variation-suggestion-moves">{summary.moveLabel}</small>
    </div>
  );
}

export function PatternFillSuggestion({ summary }: { summary: PatternFillSuggestionSummary }): ReactElement {
  return (
    <div
      className={`pattern-fill-suggestion ${summary.tone}`}
      data-suggested-pattern-fill={summary.preset}
      data-testid="pattern-fill-suggestion"
      title={summary.detailTitle}
    >
      <span data-testid="pattern-fill-suggestion-status">{summary.statusLabel}</span>
      <strong data-testid="pattern-fill-suggestion-preset">{summary.presetLabel}</strong>
      <small data-testid="pattern-fill-suggestion-pattern">{summary.patternLabel}</small>
      <small data-testid="pattern-fill-suggestion-detail">{summary.detailLabel}</small>
      <small data-testid="pattern-fill-suggestion-moves">{summary.moveLabel}</small>
    </div>
  );
}

export function PatternFillPreview({ preview }: { preview: PatternFillPreviewSummary }): ReactElement {
  return (
    <div
      className={`pattern-stack-preview pattern-fill-preview ${preview.tone}`}
      data-preview-pattern-fill={`${preview.pattern}-${preview.preset}`}
      data-testid="pattern-fill-preview"
      title={preview.detailTitle}
    >
      <span data-testid="pattern-fill-preview-status">{preview.statusLabel}</span>
      <strong data-testid="pattern-fill-preview-pattern">{preview.patternLabel}</strong>
      <small data-testid="pattern-fill-preview-preset">{preview.presetLabel}</small>
      <small data-testid="pattern-fill-preview-drums">{preview.drumsLabel}</small>
      <small data-testid="pattern-fill-preview-bass">{preview.bassLabel}</small>
      <small data-testid="pattern-fill-preview-chord">{preview.chordLabel}</small>
      <small data-testid="pattern-fill-preview-melody">{preview.melodyLabel}</small>
      <small data-testid="pattern-fill-preview-moves">{preview.moveLabel}</small>
    </div>
  );
}

export function PatternStackResultStrip({ result }: { result: PatternStackResult }): ReactElement {
  return (
    <div
      className={`pattern-stack-result ${result.tone}`}
      data-result-pattern-stack={result.stackId}
      data-testid="pattern-stack-result"
      aria-live="polite"
    >
      <div className="pattern-stack-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="pattern-stack-result-title">{result.title}</strong>
          <small data-testid="pattern-stack-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="pattern-stack-result-meta">
        <span data-testid="pattern-stack-result-status">{result.status}</span>
        <span data-testid="pattern-stack-result-scope">{result.scope}</span>
        <span data-testid="pattern-stack-result-impact">{result.impact}</span>
      </div>
      <div className="pattern-stack-result-metrics" data-testid="pattern-stack-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`pattern-stack-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="pattern-stack-result-followup" data-testid="pattern-stack-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="pattern-stack-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="pattern-stack-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function PatternStackPads({
  stacks,
  onApply
}: {
  stacks: PatternStackOption[];
  onApply: (stack: PatternStackId) => void;
}): ReactElement {
  return (
    <div className="pattern-stack-panel" data-testid="pattern-stack-pads">
      <div className="pattern-stack-heading">
        <span>Pattern Stacks</span>
        <strong>808 + Chords + Synth</strong>
      </div>
      <div className="pattern-stack-row" aria-label="Pattern Stack Pads">
        {stacks.map((stack) => (
          <button
            data-testid={`pattern-stack-${stack.id}`}
            key={stack.id}
            onClick={() => onApply(stack.id)}
            title={`${stack.label} ${stack.preview}`}
            type="button"
          >
            <span>{stack.label}</span>
            <strong>{stack.preview}</strong>
            <small>{stack.bassCount} 808 / {stack.chordCount} chords / {stack.melodyCount} synth</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function DrumFoundationPads({
  foundations,
  onApply
}: {
  foundations: DrumFoundationOption[];
  onApply: (foundation: DrumFoundationId) => void;
}): ReactElement {
  return (
    <div className="drum-foundation-panel" data-testid="drum-foundation-pads">
      <div className="drum-foundation-heading">
        <span>Drum Foundation</span>
        <strong>Kick / Clap / Hat</strong>
      </div>
      <div className="drum-foundation-row" aria-label="Drum Foundation Pads">
        {foundations.map((foundation) => (
          <button
            data-testid={`drum-foundation-${foundation.id}`}
            key={foundation.id}
            onClick={() => onApply(foundation.id)}
            title={`${foundation.label} ${foundation.preview}`}
            type="button"
          >
            <span>{foundation.label}</span>
            <strong>{foundation.preview}</strong>
            <small>{foundation.hitCount} hits / {foundation.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function BassMovePreview({ preview }: { preview: BassMovePreviewSummary }): ReactElement {
  return (
    <div
      className={`bass-move-preview ${preview.tone}`}
      data-preview-bass-contour={preview.contourId}
      data-preview-bass-glide={preview.glideId}
      data-preview-bassline={preview.basslineId}
      data-testid="bass-move-preview"
      title={preview.detailTitle}
    >
      <span data-testid="bass-move-preview-status">{preview.statusLabel}</span>
      <strong data-testid="bass-move-preview-phrase">{preview.phraseLabel}</strong>
      <small data-testid="bass-move-preview-bassline">{preview.basslineLabel}</small>
      <small data-testid="bass-move-preview-glide">{preview.glideLabel}</small>
      <small data-testid="bass-move-preview-contour">{preview.contourLabel}</small>
      <small data-testid="bass-move-preview-moves">{preview.moveLabel}</small>
    </div>
  );
}

export function BassMoveResultStrip({ result }: { result: BassMoveResult }): ReactElement {
  return (
    <div
      className={`bass-move-result ${result.tone}`}
      data-result-bass-move={result.moveId}
      data-testid="bass-move-result"
      aria-live="polite"
    >
      <div className="bass-move-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="bass-move-result-title">{result.title}</strong>
          <small data-testid="bass-move-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="bass-move-result-meta">
        <span data-testid="bass-move-result-status">{result.status}</span>
        <span data-testid="bass-move-result-scope">{result.scope}</span>
        <span data-testid="bass-move-result-impact">{result.impact}</span>
      </div>
      <div className="bass-move-result-metrics" data-testid="bass-move-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`bass-move-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="bass-move-result-followup" data-testid="bass-move-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="bass-move-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="bass-move-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function BasslinePads({
  pads,
  onApply
}: {
  pads: BasslinePadOption[];
  onApply: (pad: BasslinePadId) => void;
}): ReactElement {
  const { t } = useLocalization();
  return (
    <div className="bassline-pad-panel" data-testid="bassline-pads">
      <div className="bassline-pad-heading">
        <span>{t("compose.panel.basslines.title")}</span>
        <strong>{t("compose.panel.basslines.detail")}</strong>
      </div>
      <div className="bassline-pad-row" aria-label={t("compose.panel.basslines.padsAria")}>
        {pads.map((pad) => {
          const label = t(`compose.panel.basslines.${pad.id}`);
          const detail = t(`compose.panel.basslines.${pad.id}Detail`);
          return (
            <button
              data-testid={`bassline-pad-${pad.id}`}
              key={pad.id}
              onClick={() => onApply(pad.id)}
              title={`${label} ${pad.preview}`}
              type="button"
            >
              <span>{label}</span>
              <strong>{pad.preview}</strong>
              <small>
                {t("compose.panel.noteCount", { count: pad.eventCount })} / {t("compose.panel.glideCount", { count: pad.glideCount })} / {detail}
              </small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BassGlidePads({
  pads,
  onApply
}: {
  pads: BassGlidePadOption[];
  onApply: (pad: BassGlidePadId) => void;
}): ReactElement {
  const { t } = useLocalization();
  return (
    <div className="bass-glide-panel" data-testid="bass-glide-pads">
      <div className="bass-glide-heading">
        <span>{t("compose.panel.bassGlide.title")}</span>
        <strong>{t("compose.panel.bassGlide.detail")}</strong>
      </div>
      <div className="bass-glide-row" aria-label={t("compose.panel.bassGlide.padsAria")}>
        {pads.map((pad) => {
          const label = t(`compose.panel.bassGlide.${pad.id}`);
          const detail = t(`compose.panel.bassGlide.${pad.id}Detail`);
          return (
            <button
              data-testid={`bass-glide-${pad.id}`}
              key={pad.id}
              onClick={() => onApply(pad.id)}
              title={`${label} ${pad.preview}`}
              type="button"
            >
              <span>{label}</span>
              <strong>{pad.preview}</strong>
              <small>{t("compose.panel.glideCount", { count: pad.glideCount })} / {detail}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BassContourPads({
  contours,
  onApply
}: {
  contours: BassContourOption[];
  onApply: (contour: BassContourId) => void;
}): ReactElement {
  return (
    <div className="bass-contour-panel" data-testid="bass-contour-pads">
      <div className="bass-contour-heading">
        <span>Bass Contour</span>
        <strong>Pitch Shape</strong>
      </div>
      <div className="bass-contour-row" aria-label="Bass Contour Pads">
        {contours.map((contour) => (
          <button
            data-testid={`bass-contour-${contour.id}`}
            key={contour.id}
            onClick={() => onApply(contour.id)}
            title={`${contour.label} ${contour.preview}`}
            type="button"
          >
            <span>{contour.label}</span>
            <strong>{contour.preview}</strong>
            <small>{contour.pitchSpan} / {contour.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MelodyMovePreview({ preview }: { preview: MelodyMovePreviewSummary }): ReactElement {
  return (
    <div
      className={`melody-move-preview ${preview.tone}`}
      data-preview-melody-accent={preview.accentId}
      data-preview-melody-contour={preview.contourId}
      data-preview-melody-motif={preview.motifId}
      data-testid="melody-move-preview"
      title={preview.detailTitle}
    >
      <span data-testid="melody-move-preview-status">{preview.statusLabel}</span>
      <strong data-testid="melody-move-preview-phrase">{preview.phraseLabel}</strong>
      <small data-testid="melody-move-preview-motif">{preview.motifLabel}</small>
      <small data-testid="melody-move-preview-accent">{preview.accentLabel}</small>
      <small data-testid="melody-move-preview-contour">{preview.contourLabel}</small>
      <small data-testid="melody-move-preview-moves">{preview.moveLabel}</small>
    </div>
  );
}

export function MelodyMoveResultStrip({ result }: { result: MelodyMoveResult }): ReactElement {
  return (
    <div
      className={`melody-move-result ${result.tone}`}
      data-result-melody-move={result.moveId}
      data-testid="melody-move-result"
      aria-live="polite"
    >
      <div className="melody-move-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="melody-move-result-title">{result.title}</strong>
          <small data-testid="melody-move-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="melody-move-result-meta">
        <span data-testid="melody-move-result-status">{result.status}</span>
        <span data-testid="melody-move-result-scope">{result.scope}</span>
        <span data-testid="melody-move-result-impact">{result.impact}</span>
      </div>
      <div className="melody-move-result-metrics" data-testid="melody-move-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`melody-move-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="melody-move-result-followup" data-testid="melody-move-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="melody-move-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="melody-move-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function MelodyMotifPads({
  motifs,
  onApply
}: {
  motifs: MelodyMotifOption[];
  onApply: (motif: MelodyMotifId) => void;
}): ReactElement {
  const { t } = useLocalization();
  return (
    <div className="melody-motif-panel" data-testid="melody-motif-pads">
      <div className="melody-motif-heading">
        <span>{t("compose.panel.melodyMotifs.title")}</span>
        <strong>{t("compose.panel.melodyMotifs.detail")}</strong>
      </div>
      <div className="melody-motif-row" aria-label={t("compose.panel.melodyMotifs.padsAria")}>
        {motifs.map((motif) => {
          const label = t(`compose.panel.melodyMotifs.${motif.id}`);
          const detail = t(`compose.panel.melodyMotifs.${motif.id}Detail`);
          return (
            <button
              data-testid={`melody-motif-${motif.id}`}
              key={motif.id}
              onClick={() => onApply(motif.id)}
              title={`${label} ${motif.preview}`}
              type="button"
            >
              <span>{label}</span>
              <strong>{motif.preview}</strong>
              <small>{t("compose.panel.noteCount", { count: motif.eventCount })} / {detail}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MelodyAccentPads({
  accents,
  onApply
}: {
  accents: MelodyAccentOption[];
  onApply: (accent: MelodyAccentId) => void;
}): ReactElement {
  return (
    <div className="melody-accent-panel" data-testid="melody-accent-pads">
      <div className="melody-accent-heading">
        <span>Melody Accents</span>
        <strong>Velocity + Chance</strong>
      </div>
      <div className="melody-accent-row" aria-label="Melody Accent Pads">
        {accents.map((accent) => (
          <button
            data-testid={`melody-accent-${accent.id}`}
            key={accent.id}
            onClick={() => onApply(accent.id)}
            title={`${accent.label} ${accent.preview}`}
            type="button"
          >
            <span>{accent.label}</span>
            <strong>{accent.preview}</strong>
            <small>{accent.chanceCount} chance edit / {accent.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MelodyContourPads({
  contours,
  onApply
}: {
  contours: MelodyContourOption[];
  onApply: (contour: MelodyContourId) => void;
}): ReactElement {
  return (
    <div className="melody-contour-panel" data-testid="melody-contour-pads">
      <div className="melody-contour-heading">
        <span>Melody Contour</span>
        <strong>Pitch Shape</strong>
      </div>
      <div className="melody-contour-row" aria-label="Melody Contour Pads">
        {contours.map((contour) => (
          <button
            data-testid={`melody-contour-${contour.id}`}
            key={contour.id}
            onClick={() => onApply(contour.id)}
            title={`${contour.label} ${contour.preview}`}
            type="button"
          >
            <span>{contour.label}</span>
            <strong>{contour.preview}</strong>
            <small>{contour.pitchSpan} / {contour.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function KeyboardCapturePanel({
  defaults,
  enabled,
  target,
  stepMode,
  nextStep,
  playheadStep,
  keyMap,
  selectedNote,
  onDefaultsChange,
  onEnabledChange,
  onStepModeChange,
  onTargetChange
}: {
  defaults: KeyboardCaptureDefaults;
  enabled: boolean;
  target: NoteTrack;
  stepMode: KeyboardCaptureStepMode;
  nextStep: number;
  playheadStep: number | null;
  keyMap: KeyboardCaptureKeyMapItem[];
  selectedNote: SelectedNote | null;
  onDefaultsChange: (update: Partial<KeyboardCaptureDefaults>) => void;
  onEnabledChange: (enabled: boolean) => void;
  onStepModeChange: (mode: KeyboardCaptureStepMode) => void;
  onTargetChange: (target: NoteTrack) => void;
}): ReactElement {
  const { t } = useLocalization();
  const selectedLabel = selectedNote
    ? `${selectedNote.track === "bass" ? "808" : "Synth"} ${selectedNote.pitch}.${selectedNote.step + 1}`
    : t("compose.panel.none");
  const velocityPercent = Math.round(defaults.velocity * 100);
  const [minOctave, maxOctave] = trackOctaveRange(target);

  return (
    <div className="keyboard-capture" data-testid="keyboard-capture">
      <div className="keyboard-capture-heading">
        <div>
          <span>{t("compose.panel.keyboard.title")}</span>
          <strong>{enabled ? t("compose.panel.keyboard.armedLower") : t("compose.panel.off")}</strong>
        </div>
        <button
          aria-pressed={enabled}
          className={enabled ? "mini-toggle selected" : "mini-toggle"}
          data-testid="keyboard-capture-toggle"
          onClick={() => onEnabledChange(!enabled)}
          type="button"
        >
          {enabled ? t("compose.panel.on") : t("compose.panel.offTitle")}
        </button>
      </div>
      <div className="keyboard-capture-controls">
        <div className="capture-target-row" aria-label={t("compose.panel.keyboard.targetAria")}>
          <button
            className={target === "bass" ? "selected" : ""}
            data-testid="keyboard-capture-target-bass"
            onClick={() => onTargetChange("bass")}
            type="button"
          >
            808
          </button>
          <button
            className={target === "melody" ? "selected" : ""}
            data-testid="keyboard-capture-target-melody"
            onClick={() => onTargetChange("melody")}
            type="button"
          >
            Synth
          </button>
        </div>
        <div className="capture-readout">
          <span>{stepMode === "playhead" ? t("compose.panel.keyboard.playhead") : t("compose.panel.next")}</span>
          <strong>{stepMode === "playhead" ? (playheadStep === null ? t("compose.panel.keyboard.waiting") : playheadStep + 1) : nextStep + 1}</strong>
        </div>
        <div className="capture-readout">
          <span>{t("compose.panel.keyboard.stepMode")}</span>
          <strong>{stepMode === "next-free" ? t("compose.panel.next") : stepMode === "replace-selected" ? t("compose.panel.keyboard.replace") : t("compose.panel.keyboard.overdub")}</strong>
        </div>
        <div className="capture-readout">
          <span>{t("compose.panel.selected")}</span>
          <strong>{selectedLabel}</strong>
        </div>
      </div>
      <div className="capture-step-mode-row" aria-label={t("compose.panel.keyboard.stepModeAria")}>
        <button
          aria-pressed={stepMode === "next-free"}
          className={stepMode === "next-free" ? "selected" : ""}
          data-testid="keyboard-capture-step-mode-next"
          onClick={() => onStepModeChange("next-free")}
          type="button"
        >
          <span>{t("compose.panel.next")}</span>
          <small>{t("compose.panel.keyboard.emptyStep")}</small>
        </button>
        <button
          aria-pressed={stepMode === "replace-selected"}
          className={stepMode === "replace-selected" ? "selected" : ""}
          data-testid="keyboard-capture-step-mode-replace"
          onClick={() => onStepModeChange("replace-selected")}
          type="button"
        >
          <span>{t("compose.panel.keyboard.replace")}</span>
          <small>{t("compose.panel.keyboard.selectedStep")}</small>
        </button>
        <button
          aria-pressed={stepMode === "playhead"}
          className={stepMode === "playhead" ? "selected" : ""}
          data-testid="keyboard-capture-step-mode-playhead"
          onClick={() => onStepModeChange("playhead")}
          title={t("compose.panel.keyboard.overdubTitle")}
          type="button"
        >
          <span>{t("compose.panel.keyboard.overdub")}</span>
          <small>{t("compose.panel.keyboard.livePlayhead")}</small>
        </button>
      </div>
      <div className="capture-defaults" aria-label={t("compose.panel.keyboard.defaultsAria")}>
        <label className="capture-default-field">
          <span>{t("compose.panel.octave")}</span>
          <input
            data-testid="keyboard-capture-octave"
            max={maxOctave}
            min={minOctave}
            onChange={(event) => onDefaultsChange({ octave: Number(event.currentTarget.value) })}
            step={1}
            type="number"
            value={defaults.octave}
          />
        </label>
        <label className="capture-default-field">
          <span>{t("compose.panel.length")}</span>
          <input
            data-testid="keyboard-capture-length"
            max={16}
            min={1}
            onChange={(event) => onDefaultsChange({ length: Number(event.currentTarget.value) })}
            step={1}
            type="number"
            value={defaults.length}
          />
        </label>
        <label className="capture-default-field velocity">
          <span>{t("compose.panel.velocity")}</span>
          <input
            data-testid="keyboard-capture-velocity"
            max={100}
            min={0}
            onChange={(event) => onDefaultsChange({ velocity: Number(event.currentTarget.value) / 100 })}
            step={1}
            type="range"
            value={velocityPercent}
          />
          <strong data-testid="keyboard-capture-velocity-value">{velocityPercent}%</strong>
        </label>
        {target === "bass" && (
          <button
            aria-pressed={defaults.glide}
            className={defaults.glide ? "mini-toggle selected" : "mini-toggle"}
            data-testid="keyboard-capture-glide"
            onClick={() => onDefaultsChange({ glide: !defaults.glide })}
            title={t("compose.panel.keyboard.glideTitle")}
            type="button"
          >
            {t("compose.panel.glide")} {defaults.glide ? t("compose.panel.on") : t("compose.panel.offTitle")}
          </button>
        )}
      </div>
      <div className="capture-key-map" aria-label={t("compose.panel.keyboard.keyMapAria")}>
        {keyMap.map((item) => (
          <kbd
            className={item.pitch ? "" : "muted"}
            aria-label={`${keyboardCaptureKeyLabels[item.key]} ${item.pitch ?? t("compose.panel.keyboard.outOfRange")} ${item.degreeLabel ?? ""}`.trim()}
            data-testid={`keyboard-capture-key-${item.key}`}
            key={item.key}
          >
            <span>{keyboardCaptureKeyLabels[item.key]}</span>
            <strong>{item.pitch ?? "-"}</strong>
            <em data-testid={`keyboard-capture-degree-${item.key}`}>{item.degreeLabel ?? "-"}</em>
          </kbd>
        ))}
      </div>
    </div>
  );
}

export function MidiCapturePanel({
  armed,
  inputOptions,
  lastNoteLabel,
  selectedInputId,
  status,
  summary,
  target,
  onArmChange,
  onInputChange,
  onRefresh,
  onRequestAccess
}: {
  armed: boolean;
  inputOptions: MidiInputOption[];
  lastNoteLabel: string;
  selectedInputId: string;
  status: MidiCaptureStatus;
  summary: MidiCaptureSummary;
  target: NoteTrack;
  onArmChange: (armed: boolean) => void;
  onInputChange: (inputId: string) => void;
  onRefresh: () => void;
  onRequestAccess: () => void;
}): ReactElement {
  const { t } = useLocalization();
  const hasInputs = inputOptions.length > 0;
  const hasConnectedInput = inputOptions.some((input) => input.connected);
  const canArm = status !== "unsupported" && status !== "requesting" && status !== "denied" && hasConnectedInput;
  const targetLabel = target === "bass" ? "808" : "Synth";

  return (
    <div className={`midi-capture ${summary.tone}`} data-testid="midi-capture">
      <div className="midi-capture-heading">
        <div>
          <span>{t("compose.panel.midi.title")}</span>
          <strong data-testid="midi-capture-status">{summary.statusLabel}</strong>
        </div>
        <div className="midi-capture-actions">
          <button
            className="mini-toggle"
            data-testid="midi-capture-request"
            disabled={status === "requesting"}
            onClick={onRequestAccess}
            type="button"
          >
            {status === "requesting" ? t("compose.panel.midi.requesting") : t("compose.panel.midi.connect")}
          </button>
          <button
            className={armed ? "mini-toggle selected" : "mini-toggle"}
            aria-pressed={armed}
            data-testid="midi-capture-arm"
            disabled={!canArm}
            onClick={() => onArmChange(!armed)}
            type="button"
          >
            {armed ? t("compose.panel.midi.armed") : t("compose.panel.midi.arm")}
          </button>
        </div>
      </div>
      <div className="midi-capture-controls">
        <label className="midi-input-field">
          <span>{t("compose.panel.midi.input")}</span>
          <select
            data-testid="midi-input-select"
            disabled={!hasInputs}
            value={selectedInputId}
            onChange={(event) => onInputChange(event.currentTarget.value)}
          >
            <option value="all">{t("compose.panel.midi.allInputs")}</option>
            {inputOptions.map((input) => (
              <option key={input.id} value={input.id}>
                {input.label}
              </option>
            ))}
          </select>
        </label>
        <div className="midi-capture-readout" data-testid="midi-capture-target">
          <span>{t("compose.panel.midi.target")}</span>
          <strong>{targetLabel}</strong>
        </div>
        <div className="midi-capture-readout" data-testid="midi-capture-last-note">
          <span>{t("compose.panel.midi.latest")}</span>
          <strong>{lastNoteLabel}</strong>
        </div>
        <button className="mini-toggle" data-testid="midi-capture-refresh" onClick={onRefresh} type="button">
          {t("compose.panel.midi.refresh")}
        </button>
      </div>
      <small data-testid="midi-capture-detail">{summary.detailLabel}</small>
    </div>
  );
}

export function NoteEditor({
  title,
  track,
  notes,
  pitches,
  color,
  currentStep,
  selectedNote,
  onSelect,
  onToggle
}: {
  title: string;
  track: NoteTrack;
  notes: NoteView[];
  pitches: string[];
  color: string;
  currentStep: number | null;
  selectedNote: SelectedNote | null;
  onSelect: (note: SelectedNote) => void;
  onToggle: (step: number, pitch: string) => void;
}): ReactElement {
  const { t } = useLocalization();
  const displayPitches = [...pitches].reverse();
  const tabStop = noteGridEntryCell(track, displayPitches, selectedNote);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, step: number, pitch: string): void {
    if (isNoteGridActivationKey(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.click();
      return;
    }
    if (!isNoteGridNavigationKey(event.key)) {
      return;
    }
    event.preventDefault();
    const target = noteGridNavigationTarget({ track, step, pitch }, event.key, displayPitches);
    onSelect(target);
    const gridButtons = event.currentTarget.closest(".piano-grid")?.querySelectorAll<HTMLButtonElement>("button") ?? [];
    Array.from(gridButtons)
      .find((button) => button.dataset.notePitch === target.pitch && button.dataset.noteStep === `${target.step}`)
      ?.focus();
  }

  return (
    <div className="note-lane">
      <div className="lane-header">
        <span>{title}</span>
        <strong>{t("compose.panel.eventCount", { count: notes.length })}</strong>
      </div>
      <p className="note-grid-keyboard-help" id={`note-grid-keyboard-help-${track}`}>
        {t("compose.panel.notes.keyboardHelp")}
      </p>
      <div
        aria-describedby={`note-grid-keyboard-help-${track}`}
        aria-label={t("compose.panel.notes.sequencerAria", { title })}
        className="piano-grid"
        data-testid={`note-grid-${track}`}
        role="group"
        style={{ "--note": color } as CSSProperties}
      >
        {displayPitches.map((pitch) => (
          <div className="piano-row" key={pitch}>
            <span>{pitch}</span>
            <div>
              {steps.map((step) => {
                const note = notes.find((candidate) => candidate.step === step && candidate.pitch === pitch);
                const selected =
                  selectedNote?.track === track && selectedNote.step === step && selectedNote.pitch === pitch;
                const velocityPercent = Math.min(100, Math.max(0, Math.round((note?.velocity ?? 0.82) * 100)));
                return (
                  <button
                    aria-label={`${title} ${pitch} ${t("compose.panel.step")} ${step + 1}${
                      note && note.probability !== undefined && note.probability < 1 ? ` ${chanceBadgeLabel(note.probability)} ${t("compose.panel.chance")}` : ""
                    }${note ? ` ${velocityPercent}% ${t("compose.panel.velocityLower")}` : ""}`}
                    aria-pressed={Boolean(note)}
                    className={["note", note ? "active" : "", currentStep === step ? "playhead" : "", selected ? "selected" : ""]
                      .filter(Boolean)
                      .join(" ")}
                    data-note-pitch={pitch}
                    data-note-step={step}
                    data-note-track={track}
                    data-testid={`note-step-${track}-${step}-${pitch}`}
                    key={`${pitch}-${step}`}
                    onClick={() => onToggle(step, pitch)}
                    onKeyDown={(event) => handleKeyDown(event, step, pitch)}
                    tabIndex={tabStop.pitch === pitch && tabStop.step === step ? 0 : -1}
                    type="button"
                  >
                    {note && <span className="note-length-fill" style={{ inlineSize: `${Math.min(100, note.length * 25)}%` }} />}
                    {note && (
                      <>
                        <span className="note-velocity-meter" style={{ inlineSize: `${velocityPercent}%` }} />
                        <strong className="note-velocity-label" data-testid={`note-velocity-label-${track}-${step}-${pitch}`}>
                          {velocityPercent}
                        </strong>
                      </>
                    )}
                    {note?.glide && <em>G</em>}
                    {note && note.probability !== undefined && note.probability < 1 && (
                      <small className="chance-badge" data-testid={`note-chance-badge-${track}-${step}-${pitch}`}>
                        {compactChanceBadgeLabel(note.probability)}
                      </small>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NoteInspector({
  currentKey,
  selectedNote,
  noteClipboard,
  bassNote,
  melodyNote,
  beatDuplicateStep,
  previousBeatDuplicateStep,
  onLengthChange,
  onGlideChange,
  onVelocityChange,
  onProbabilityChange,
  onStepMove,
  onPitchMove,
  onOctaveMove,
  onAudition,
  onCopy,
  onPaste,
  onDuplicate,
  onDuplicateBeat,
  onDuplicatePreviousBeat
}: {
  currentKey: string;
  selectedNote: SelectedNote | null;
  noteClipboard: NoteClipboard | null;
  bassNote?: BassNote;
  melodyNote?: MelodyNote;
  beatDuplicateStep: number | null;
  previousBeatDuplicateStep: number | null;
  onLengthChange: (length: number) => void;
  onGlideChange: (glide: boolean) => void;
  onVelocityChange: (velocity: number) => void;
  onProbabilityChange: (probability: number) => void;
  onStepMove: (direction: -1 | 1) => void;
  onPitchMove: (direction: -1 | 1) => void;
  onOctaveMove: (direction: -1 | 1) => void;
  onAudition: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDuplicateBeat: () => void;
  onDuplicatePreviousBeat: () => void;
}): ReactElement {
  const { t } = useLocalization();
  const activeNote = bassNote ?? melodyNote;
  const label = selectedNote ? `${selectedNote.track === "bass" ? "808" : "Synth"} ${selectedNote.pitch}.${selectedNote.step + 1}` : t("compose.panel.none");
  const degreeSummary = selectedNote ? selectedNoteDegreeSummary(currentKey, selectedNote.pitch) : null;
  const clipboardLabel = noteClipboard
    ? `${noteClipboard.track === "bass" ? "808" : "Synth"} ${noteClipboard.note.pitch}.${noteClipboard.note.step + 1}`
    : t("compose.panel.empty");
  const probabilityValue = activeNote ? normalizeEventProbability(activeNote.probability) : 1;
  const velocityValue = activeNote?.velocity ?? 0.82;
  return (
    <div className="note-inspector">
      <div className="inspector-heading">
        <span>{t("compose.panel.selected")}</span>
        <strong>{activeNote ? `${label} / ${percentLabel(probabilityValue)} ${t("compose.panel.chance")}` : t("compose.panel.none")}</strong>
      </div>
      {activeNote && (
        <>
          {degreeSummary && (
            <div className={degreeSummary.inKey ? "note-degree-readout" : "note-degree-readout warn"} data-testid="note-degree-readout">
              <span>{t("compose.panel.notes.degree")}</span>
              <strong data-testid="note-degree-label">{degreeSummary.degreeLabel}</strong>
              <small data-testid="note-degree-role">
                {degreeSummary.roleLabel} / {degreeSummary.pitchLabel}
              </small>
            </div>
          )}
          <div className="note-action-row" aria-label={t("compose.panel.notes.toolsAria")}>
            <button
              aria-label={t("compose.panel.notes.stepLeftTitle")}
              data-testid="note-nudge-left"
              onClick={() => onStepMove(-1)}
              title={t("compose.panel.notes.stepLeftTitle")}
              type="button"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              <span>{t("compose.panel.stepLeft")}</span>
            </button>
            <button
              aria-label={t("compose.panel.notes.stepRightTitle")}
              data-testid="note-nudge-right"
              onClick={() => onStepMove(1)}
              title={t("compose.panel.notes.stepRightTitle")}
              type="button"
            >
              <ArrowRight size={14} aria-hidden="true" />
              <span>{t("compose.panel.stepRight")}</span>
            </button>
            <button
              aria-label={t("compose.panel.notes.pitchDownTitle")}
              data-testid="note-pitch-down"
              onClick={() => onPitchMove(-1)}
              title={t("compose.panel.notes.pitchDownTitle")}
              type="button"
            >
              <ArrowDown size={14} aria-hidden="true" />
              <span>{t("compose.panel.notes.pitchDown")}</span>
            </button>
            <button
              aria-label={t("compose.panel.notes.pitchUpTitle")}
              data-testid="note-pitch-up"
              onClick={() => onPitchMove(1)}
              title={t("compose.panel.notes.pitchUpTitle")}
              type="button"
            >
              <ArrowUp size={14} aria-hidden="true" />
              <span>{t("compose.panel.notes.pitchUp")}</span>
            </button>
            <button
              aria-label={t("compose.panel.notes.octaveDownTitle")}
              data-testid="note-octave-down"
              onClick={() => onOctaveMove(-1)}
              title={t("compose.panel.notes.octaveDownTitle")}
              type="button"
            >
              <ArrowDown size={14} aria-hidden="true" />
              <span>{t("compose.panel.notes.octaveDown")}</span>
            </button>
            <button
              aria-label={t("compose.panel.notes.octaveUpTitle")}
              data-testid="note-octave-up"
              onClick={() => onOctaveMove(1)}
              title={t("compose.panel.notes.octaveUpTitle")}
              type="button"
            >
              <ArrowUp size={14} aria-hidden="true" />
              <span>{t("compose.panel.notes.octaveUp")}</span>
            </button>
            <button
              aria-label={t("compose.panel.notes.duplicateTitle")}
              data-testid="note-duplicate"
              onClick={onDuplicate}
              title={t("compose.panel.notes.duplicateTitle")}
              type="button"
            >
              <Copy size={14} aria-hidden="true" />
              <span>{t("compose.panel.duplicate")}</span>
            </button>
            <button
              aria-label={t("compose.panel.notes.duplicatePrevious")}
              data-testid="note-duplicate-previous-beat"
              disabled={previousBeatDuplicateStep === null}
              onClick={onDuplicatePreviousBeat}
              title={
                previousBeatDuplicateStep === null
                  ? t("compose.panel.notes.noEarlierSlot")
                  : t("compose.panel.notes.duplicateToStep", { step: previousBeatDuplicateStep + 1 })
              }
              type="button"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              <span>{t("compose.panel.previousBeatShort")}</span>
            </button>
            <button
              aria-label={t("compose.panel.notes.duplicateNext")}
              data-testid="note-duplicate-beat"
              disabled={beatDuplicateStep === null}
              onClick={onDuplicateBeat}
              title={beatDuplicateStep === null ? t("compose.panel.notes.noLaterSlot") : t("compose.panel.notes.duplicateToStep", { step: beatDuplicateStep + 1 })}
              type="button"
            >
              <ArrowRight size={14} aria-hidden="true" />
              <span>{t("compose.panel.nextBeat")}</span>
            </button>
            <button
              aria-label={t("compose.panel.notes.auditionTitle")}
              data-testid="note-audition"
              onClick={onAudition}
              title={t("compose.panel.notes.auditionTitle")}
              type="button"
            >
              <Play size={14} aria-hidden="true" />
              <span>{t("compose.panel.audition")}</span>
            </button>
          </div>
          <div className="inspector-grid">
            <label>
              <span>{t("compose.panel.length")}</span>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={activeNote.length}
                onChange={(event) => onLengthChange(Number(event.target.value))}
              />
            </label>
            {bassNote && (
              <label className="toggle-row">
                <span>{t("compose.panel.glide")}</span>
                <input type="checkbox" checked={bassNote.glide} onChange={(event) => onGlideChange(event.target.checked)} />
              </label>
            )}
            <label>
              <span>{t("compose.panel.velocity")} {percentLabel(velocityValue)}</span>
              <input
                aria-label={t("compose.panel.notes.velocityAria")}
                data-testid="note-velocity"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={velocityValue}
                onChange={(event) => onVelocityChange(Number(event.target.value))}
              />
            </label>
            <label>
              <span>{t("compose.panel.chance")} {percentLabel(probabilityValue)}</span>
              <input
                aria-label={t("compose.panel.notes.probabilityAria")}
                data-testid="note-probability"
                max={1}
                min={0}
                onChange={(event) => onProbabilityChange(Number(event.target.value))}
                step={0.01}
                type="range"
                value={probabilityValue}
              />
            </label>
            <label>
              <span>{t("compose.panel.chancePercent")}</span>
              <input
                aria-label={t("compose.panel.notes.probabilityPercentAria")}
                data-testid="note-probability-input"
                inputMode="numeric"
                onChange={(event) => onProbabilityChange(Number(event.target.value) / 100)}
                pattern="[0-9]*"
                step={1}
                type="text"
                value={`${Math.round(probabilityValue * 100)}`}
              />
            </label>
          </div>
        </>
      )}
      <div className="note-clipboard-row" aria-label={t("compose.panel.notes.clipboardAria")}>
        <button data-testid="note-copy" disabled={!activeNote} onClick={onCopy} title={t("compose.panel.notes.copyTitle")} type="button">
          <Copy size={14} aria-hidden="true" />
          <span>{t("compose.panel.copy")}</span>
        </button>
        <button data-testid="note-paste" disabled={!noteClipboard} onClick={onPaste} title={t("compose.panel.notes.pasteTitle")} type="button">
          <Plus size={14} aria-hidden="true" />
          <span>{t("compose.panel.paste")}</span>
        </button>
        <small data-testid="note-clipboard-detail">
          {noteClipboard ? t("compose.panel.clipboardValue", { value: clipboardLabel }) : t("compose.panel.clipboardEmpty")}
        </small>
      </div>
    </div>
  );
}

export function Device({
  icon,
  name,
  value,
  color
}: {
  icon: ReactNode;
  name: string;
  value: string;
  color: string;
}): ReactElement {
  return (
    <button className="device" style={{ "--device": color } as CSSProperties} type="button">
      {icon}
      <span>{name}</span>
      <strong>{value}</strong>
    </button>
  );
}

export function SoundDesigner({
  drumKitPads,
  drumKitPreview,
  drumKitResult,
  focusPreview,
  focusPads,
  focusResult,
  mode,
  presetPreview,
  presetPreviewId,
  presetResult,
  sound,
  soundSnapshots,
  soundSnapshotSummary,
  studioToneBaseline,
  studioToneBaselineResult,
  studioToneDrift,
  studioToneResetResult,
  timbreCheck,
  onApplyPreset,
  onDrumKitPad,
  onFocusPad,
  onCaptureSoundSnapshot,
  onRecallSoundSnapshot,
  onClearSoundSnapshots,
  onCaptureStudioToneBaseline,
  onPreviewPreset,
  onResetLargestStudioToneDrift,
  onStudioToneResetResult,
  onChange
}: {
  drumKitPads: DrumKitPadOption[];
  drumKitPreview: DrumKitPreviewSummary;
  drumKitResult: DrumKitResult | null;
  focusPreview: SoundFocusPreviewSummary;
  focusPads: SoundFocusPadOption[];
  focusResult: SoundFocusResult | null;
  mode: ProjectState["mode"];
  presetPreview: SoundPresetPreviewSummary;
  presetPreviewId: SoundPresetTarget;
  presetResult: SoundPresetResult | null;
  sound: SoundDesign;
  soundSnapshots: SoundSnapshotSlotMap;
  soundSnapshotSummary: SoundSnapshotComparisonSummary;
  studioToneBaseline: StudioToneBaseline;
  studioToneBaselineResult: StudioToneBaselineResult | null;
  studioToneDrift: StudioToneDriftSummary;
  studioToneResetResult: StudioToneResetResult | null;
  timbreCheck: SoundTimbreCheckSummary;
  onApplyPreset: (preset?: SoundPresetTarget) => void;
  onDrumKitPad: (pad: DrumKitPadId) => void;
  onFocusPad: (pad: SoundFocusPadId) => void;
  onCaptureSoundSnapshot: (slot: SoundSnapshotSlotId) => void;
  onRecallSoundSnapshot: (slot: SoundSnapshotSlotId) => void;
  onClearSoundSnapshots: () => void;
  onCaptureStudioToneBaseline: () => void;
  onPreviewPreset: (preset: SoundPresetTarget) => void;
  onResetLargestStudioToneDrift: () => void;
  onStudioToneResetResult: (result: StudioToneResetResult) => void;
  onChange: (update: Partial<Omit<SoundDesign, "preset">>) => void;
}): ReactElement {
  const { t } = useLocalization();
  const presetBaseline = studioToneBaseline.sound;
  const presetDecision = createSoundPresetPreviewDecision(presetPreview);

  return (
    <div className="sound-designer">
      <div className="lane-header">
        <span>{t("compose.panel.sound.tone")}</span>
        <strong data-testid="sound-preset-readout">{soundPresetLabel(sound.preset)}</strong>
      </div>
      <div className="sound-preset-row" aria-label={t("compose.panel.sound.presetsAria")}>
        {soundPresetIds.map((preset) => (
          <button
            className={presetPreviewId === preset ? "selected" : sound.preset === preset ? "current" : ""}
            data-testid={`sound-preset-${preset}`}
            key={preset}
            onClick={() => onPreviewPreset(preset)}
            title={t("compose.panel.sound.previewPreset", { preset: soundPresetLabel(preset) })}
            type="button"
          >
            {soundPresetLabel(preset)}
          </button>
        ))}
      </div>
      <SoundPresetPreview summary={presetPreview} onApply={() => onApplyPreset(presetPreviewId)} />
      <SoundPresetPreviewDecision summary={presetDecision} onApply={() => onApplyPreset(presetDecision.presetId)} />
      {presetResult && <SoundPresetResultStrip result={presetResult} />}
      <DrumKitPads pads={drumKitPads} preview={drumKitPreview} result={drumKitResult} onApply={onDrumKitPad} />
      <SoundFocusPads pads={focusPads} preview={focusPreview} result={focusResult} onApply={onFocusPad} />
      <SoundTimbreCheck summary={timbreCheck} focusPreview={focusPreview} onApplyFocus={onFocusPad} />
      <SoundSnapshotAB
        snapshots={soundSnapshots}
        summary={soundSnapshotSummary}
        onCapture={onCaptureSoundSnapshot}
        onRecall={onRecallSoundSnapshot}
        onClear={onClearSoundSnapshots}
      />
      <div className="sound-readout" aria-label={t("compose.panel.sound.stateAria")}>
        <span data-testid="sound-kick-readout">{t("compose.panel.sound.kick")} {percentLabel(sound.kickPunch)}</span>
        <span data-testid="sound-bass-readout">808 {percentLabel(sound.bassDrive)}</span>
        <span data-testid="sound-duck-readout">{t("compose.panel.sound.duck")} {percentLabel(sound.sidechainDuck)}</span>
        <span data-testid="sound-synth-readout">Synth {percentLabel(sound.synthBrightness)}</span>
        <span data-testid="sound-chord-readout">{t("compose.panel.sound.chord")} {percentLabel(sound.chordWarmth)}</span>
      </div>
      {mode === "studio" && (
        <>
          <div className="studio-tone-baseline-source" data-testid="studio-tone-baseline-source">
            <span>{t("compose.panel.sound.resetBaseline")}</span>
            <strong data-testid="studio-tone-baseline-source-label">{studioToneBaseline.sourceLabel}</strong>
            <button
              data-testid="studio-tone-baseline-capture"
              onClick={onCaptureStudioToneBaseline}
              title={t("compose.panel.sound.captureBaselineTitle")}
              type="button"
            >
              <Save size={12} aria-hidden="true" />
              <span>{t("compose.panel.capture")}</span>
            </button>
          </div>
          {studioToneBaselineResult && <StudioToneBaselineResultStrip result={studioToneBaselineResult} />}
          <StudioToneDriftSummaryStrip summary={studioToneDrift} onResetLargest={onResetLargestStudioToneDrift} />
          <div className="sound-control-grid">
            {studioToneControls.map((control) => (
              <SoundControl
                baseline={presetBaseline[control.parameter]}
                baselineSourceLabel={studioToneBaseline.sourceLabel}
                id={control.id}
                key={control.id}
                label={control.label}
                value={sound[control.parameter]}
                onChange={(value) => onChange({ [control.parameter]: value } as Partial<Omit<SoundDesign, "preset">>)}
                onResetResult={onStudioToneResetResult}
              />
            ))}
          </div>
          {studioToneResetResult && <StudioToneResetResultStrip result={studioToneResetResult} />}
        </>
      )}
    </div>
  );
}

export function SoundTimbreCheck({
  focusPreview,
  summary,
  onApplyFocus
}: {
  focusPreview: SoundFocusPreviewSummary;
  summary: SoundTimbreCheckSummary;
  onApplyFocus: (pad: SoundFocusPadId) => void;
}): ReactElement {
  const { t } = useLocalization();
  const focusReady = focusPreview.tone !== "good";

  return (
    <div
      className={`sound-timbre-check ${summary.tone}`}
      data-testid="sound-timbre-check"
      title={summary.detailTitle}
    >
      <div className="sound-timbre-heading">
        <span>{t("compose.panel.sound.timbreCheck")}</span>
        <strong data-testid="sound-timbre-status">{summary.statusLabel}</strong>
      </div>
      <div className="sound-timbre-summary">
        <span>
          <b data-testid="sound-timbre-headline">{summary.headline}</b>
          <em data-testid="sound-timbre-detail">{summary.detail}</em>
        </span>
        <strong data-testid="sound-timbre-balance">{summary.balanceLabel}</strong>
      </div>
      <div className="sound-timbre-metrics" aria-label={t("compose.panel.sound.timbreMetricsAria")}>
        {summary.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`sound-timbre-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <strong>{metric.value}</strong>
            <em>{metric.detail}</em>
          </span>
        ))}
      </div>
      <div
        className={`sound-timbre-focus-suggestion ${focusPreview.tone}`}
        data-focus-sound-focus={focusPreview.padId}
        data-testid="sound-timbre-focus-suggestion"
        title={focusPreview.detailTitle}
      >
        <div>
          <span data-testid="sound-timbre-focus-status">
            {focusReady ? t("compose.panel.sound.suggestedFocus") : t("compose.panel.sound.focusMatched")}
          </span>
          <strong data-testid="sound-timbre-focus-pad">{focusPreview.padLabel}</strong>
          <small data-testid="sound-timbre-focus-target">{focusPreview.focusLabel}</small>
          <small data-testid="sound-timbre-focus-parameters">{focusPreview.parameterLabel}</small>
          <small data-testid="sound-timbre-focus-changes">{focusPreview.changeLabel}</small>
        </div>
        <button
          data-testid="sound-timbre-focus-apply"
          disabled={!focusReady}
          onClick={() => onApplyFocus(focusPreview.padId)}
          title={focusReady ? t("compose.panel.sound.applyFocusTitle", { focus: focusPreview.padLabel }) : t("compose.panel.sound.focusMatchedTitle")}
          type="button"
        >
          <SlidersHorizontal size={13} aria-hidden="true" />
          <span>{t("compose.panel.sound.applyFocus")}</span>
        </button>
      </div>
      <small data-testid="sound-timbre-next-check">{summary.nextCheck}</small>
    </div>
  );
}

export function SoundSnapshotAB({
  snapshots,
  summary,
  onCapture,
  onRecall,
  onClear
}: {
  snapshots: SoundSnapshotSlotMap;
  summary: SoundSnapshotComparisonSummary;
  onCapture: (slot: SoundSnapshotSlotId) => void;
  onRecall: (slot: SoundSnapshotSlotId) => void;
  onClear: () => void;
}): ReactElement {
  const { t } = useLocalization();
  const slotIds: SoundSnapshotSlotId[] = ["A", "B"];
  const actionIsCapture = summary.actionId.startsWith("capture");

  function runSnapshotAction(): void {
    switch (summary.actionId) {
      case "capture-a":
        onCapture("A");
        return;
      case "capture-b":
        onCapture("B");
        return;
      case "recall-a":
        onRecall("A");
        return;
      case "recall-b":
        onRecall("B");
        return;
    }
  }

  return (
    <div className={`sound-snapshot-ab ${summary.tone}`} data-testid="sound-snapshot-ab">
      <div className="sound-snapshot-head">
        <span>{t("compose.panel.sound.snapshotTitle")}</span>
        <strong>{t("compose.panel.sound.compareTone")}</strong>
        <div className="sound-snapshot-actions" aria-label={t("compose.panel.sound.snapshotActionsAria")}>
          <button
            data-testid="sound-snapshot-capture-a"
            onClick={() => onCapture("A")}
            title={t("compose.panel.sound.captureSnapshotTitle", { slot: "A" })}
            type="button"
          >
            <Save size={13} aria-hidden="true" />
            <span>{t("compose.panel.captureSlot", { slot: "A" })}</span>
          </button>
          <button
            data-testid="sound-snapshot-capture-b"
            onClick={() => onCapture("B")}
            title={t("compose.panel.sound.captureSnapshotTitle", { slot: "B" })}
            type="button"
          >
            <Copy size={13} aria-hidden="true" />
            <span>{t("compose.panel.captureSlot", { slot: "B" })}</span>
          </button>
          <button
            data-testid="sound-snapshot-recall-a"
            disabled={!snapshots.A}
            onClick={() => onRecall("A")}
            title={snapshots.A ? t("compose.panel.sound.recallSnapshotTitle", { slot: "A" }) : t("compose.panel.sound.captureBeforeRecall", { slot: "A" })}
            type="button"
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>{t("compose.panel.recallSlot", { slot: "A" })}</span>
          </button>
          <button
            data-testid="sound-snapshot-recall-b"
            disabled={!snapshots.B}
            onClick={() => onRecall("B")}
            title={snapshots.B ? t("compose.panel.sound.recallSnapshotTitle", { slot: "B" }) : t("compose.panel.sound.captureBeforeRecall", { slot: "B" })}
            type="button"
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>{t("compose.panel.recallSlot", { slot: "B" })}</span>
          </button>
          <button
            data-testid="sound-snapshot-clear"
            disabled={!snapshots.A && !snapshots.B}
            onClick={onClear}
            title={snapshots.A || snapshots.B ? t("compose.panel.sound.clearSnapshotsTitle") : t("compose.panel.sound.snapshotsClearTitle")}
            type="button"
          >
            <X size={13} aria-hidden="true" />
            <span>{t("compose.panel.clear")}</span>
          </button>
        </div>
      </div>
      <div className={`sound-snapshot-status ${summary.tone}`} data-testid="sound-snapshot-status-card" title={summary.detailTitle}>
        <span data-testid="sound-snapshot-status">{summary.statusLabel}</span>
        <strong data-testid="sound-snapshot-winner">{summary.winnerLabel}</strong>
        <small data-testid="sound-snapshot-detail">{summary.detailLabel}</small>
        <button
          className="sound-snapshot-action"
          data-sound-snapshot-action={summary.actionId}
          data-testid="sound-snapshot-run"
          onClick={runSnapshotAction}
          title={t("compose.panel.runActionTitle", { action: summary.actionLabel, detail: summary.detailTitle })}
          type="button"
        >
          {actionIsCapture ? (
            <Save size={13} aria-hidden="true" />
          ) : (
            <RotateCcw size={13} aria-hidden="true" />
          )}
          <span>{summary.actionLabel}</span>
        </button>
      </div>
      <div className="sound-snapshot-slots">
        {slotIds.map((slot) => (
          <SoundSnapshotSlotCard key={slot} snapshot={snapshots[slot]} slot={slot} />
        ))}
      </div>
      <div className="sound-snapshot-metrics" data-testid="sound-snapshot-metrics">
        {summary.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`sound-snapshot-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em data-testid={`sound-snapshot-metric-${metric.id}-a`}>A {metric.aLabel}</em>
            <em data-testid={`sound-snapshot-metric-${metric.id}-b`}>B {metric.bLabel}</em>
          </span>
        ))}
      </div>
    </div>
  );
}

function SoundSnapshotSlotCard({
  snapshot,
  slot
}: {
  snapshot: SoundSnapshot | null;
  slot: SoundSnapshotSlotId;
}): ReactElement {
  const { t } = useLocalization();
  const testSlot = slot.toLowerCase();
  if (!snapshot) {
    return (
      <div className="sound-snapshot-slot empty" data-testid={`sound-snapshot-slot-${testSlot}`}>
        <span data-testid={`sound-snapshot-slot-${testSlot}-time`}>{t("compose.panel.sound.slot", { slot })}</span>
        <strong data-testid={`sound-snapshot-slot-${testSlot}-preset`}>{t("compose.panel.emptySlot")}</strong>
        <small data-testid={`sound-snapshot-slot-${testSlot}-timbre`}>{t("compose.panel.sound.noTonePass")}</small>
        <small data-testid={`sound-snapshot-slot-${testSlot}-drums`}>{t("compose.panel.sound.noDrumTone")}</small>
        <small data-testid={`sound-snapshot-slot-${testSlot}-bass`}>{t("compose.panel.sound.noBassTone")}</small>
      </div>
    );
  }

  return (
    <div className={`sound-snapshot-slot ${snapshot.tone}`} data-testid={`sound-snapshot-slot-${testSlot}`}>
      <span data-testid={`sound-snapshot-slot-${testSlot}-time`}>{t("compose.panel.sound.slotTime", { slot, time: snapshot.capturedAtLabel })}</span>
      <strong data-testid={`sound-snapshot-slot-${testSlot}-preset`}>{snapshot.presetLabel}</strong>
      <small data-testid={`sound-snapshot-slot-${testSlot}-timbre`}>{snapshot.timbreLabel}</small>
      <small data-testid={`sound-snapshot-slot-${testSlot}-drums`}>{snapshot.drumLabel}</small>
      <small data-testid={`sound-snapshot-slot-${testSlot}-bass`}>{snapshot.bassLabel}</small>
    </div>
  );
}

export function SoundPresetPreview({
  summary,
  onApply
}: {
  summary: SoundPresetPreviewSummary;
  onApply: () => void;
}): ReactElement {
  const { t } = useLocalization();
  return (
    <div
      className={`sound-preset-preview ${summary.tone}`}
      data-preview-sound-preset={summary.presetId}
      data-testid="sound-preset-preview"
      title={summary.detailTitle}
    >
      <span data-testid="sound-preset-preview-status">{summary.statusLabel}</span>
      <strong data-testid="sound-preset-preview-preset">{summary.presetLabel}</strong>
      <small data-testid="sound-preset-preview-tone">{summary.toneLabel}</small>
      <small data-testid="sound-preset-preview-changes">{summary.changeLabel}</small>
      <button data-testid="sound-preset-apply" onClick={onApply} type="button">
        {t("compose.panel.apply")}
      </button>
    </div>
  );
}

export function SoundPresetPreviewDecision({
  summary,
  onApply
}: {
  summary: SoundPresetPreviewDecisionSummary;
  onApply: () => void;
}): ReactElement {
  const { t } = useLocalization();
  return (
    <div
      className={`sound-preset-decision ${summary.tone}`}
      data-sound-preset-decision={summary.presetId}
      data-testid="sound-preset-decision"
      title={summary.detailTitle}
    >
      <span data-testid="sound-preset-decision-status">{summary.statusLabel}</span>
      <strong data-testid="sound-preset-decision-label">{summary.presetLabel}</strong>
      <small data-testid="sound-preset-decision-metric">{summary.metricLabel}</small>
      <small data-testid="sound-preset-decision-detail">{summary.detailLabel}</small>
      <button
        className="sound-preset-decision-run"
        data-sound-preset-decision-action={summary.actionId}
        data-testid="sound-preset-decision-run"
        disabled={summary.disabled}
        onClick={onApply}
        title={summary.disabled ? t("compose.panel.sound.previewMatchedTitle") : t("compose.panel.applyTarget", { target: summary.presetLabel })}
        type="button"
      >
        <SlidersHorizontal size={12} aria-hidden="true" />
        <span data-testid="sound-preset-decision-action">{summary.actionLabel}</span>
      </button>
    </div>
  );
}

function createSoundPresetPreviewDecision(summary: SoundPresetPreviewSummary): SoundPresetPreviewDecisionSummary {
  const aligned = summary.changedMoves === 0;

  return {
    presetId: summary.presetId,
    actionId: aligned ? "aligned" : "apply-preview",
    statusLabel: aligned ? "Preset aligned" : "Ready to apply",
    presetLabel: summary.presetLabel,
    metricLabel: summary.changeLabel,
    detailLabel: aligned ? "Current editable tone already matches this preview." : summary.toneLabel,
    actionLabel: aligned ? "Aligned" : "Apply Preview",
    disabled: aligned,
    detailTitle: aligned
      ? `${summary.detailTitle} No Sound Preset action is needed.`
      : `${summary.detailTitle} Apply only after this full-tone target fits the beat.`,
    tone: aligned ? "good" : summary.tone
  };
}

export function SoundPresetResultStrip({ result }: { result: SoundPresetResult }): ReactElement {
  const { t } = useLocalization();
  return (
    <div
      className={`sound-preset-result ${result.tone}`}
      data-result-sound-preset={result.presetId}
      data-testid="sound-preset-result"
      aria-live="polite"
    >
      <div className="sound-preset-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="sound-preset-result-title">{result.title}</strong>
          <small data-testid="sound-preset-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="sound-preset-result-meta">
        <span data-testid="sound-preset-result-status">{result.status}</span>
        <span data-testid="sound-preset-result-scope">{result.scope}</span>
        <span data-testid="sound-preset-result-impact">{result.impact}</span>
      </div>
      <div className="sound-preset-result-metrics" data-testid="sound-preset-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`sound-preset-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="sound-preset-result-followup" data-testid="sound-preset-result-followup">
        <span>
          <b>{t("compose.panel.audition")}</b>
          <em data-testid="sound-preset-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>{t("compose.panel.nextCheck")}</b>
          <em data-testid="sound-preset-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function DrumKitPads({
  pads,
  preview,
  result,
  onApply
}: {
  pads: DrumKitPadOption[];
  preview: DrumKitPreviewSummary;
  result: DrumKitResult | null;
  onApply: (pad: DrumKitPadId) => void;
}): ReactElement {
  const { t } = useLocalization();
  const decision = createDrumKitPreviewDecision(preview);

  return (
    <div className="drum-kit-panel" data-testid="drum-kit-pads">
      <div className="drum-kit-heading">
        <span>{t("compose.panel.sound.drumKit")}</span>
        <strong>{t("compose.panel.sound.drumKitDetail")}</strong>
      </div>
      <div
        className={`drum-kit-preview ${preview.tone}`}
        data-preview-drum-kit={preview.padId}
        data-testid="drum-kit-preview"
        title={preview.detailTitle}
      >
        <span data-testid="drum-kit-preview-status">{preview.statusLabel}</span>
        <strong data-testid="drum-kit-preview-kit">{preview.kitLabel}</strong>
        <small data-testid="drum-kit-preview-drums">{preview.drumLabel}</small>
        <small data-testid="drum-kit-preview-rack">{preview.rackLabel}</small>
        <small data-testid="drum-kit-preview-moves">{preview.moveLabel}</small>
      </div>
      <DrumKitPreviewDecision summary={decision} onApply={() => onApply(decision.padId)} />
      <div className="drum-kit-row" aria-label={t("compose.panel.sound.drumKitPadsAria")}>
        {pads.map((pad) => (
          <button
            data-testid={`drum-kit-${pad.id}`}
            key={pad.id}
            onClick={() => onApply(pad.id)}
            title={`${pad.label} ${pad.preview}`}
            type="button"
          >
            <span>{pad.label}</span>
            <strong>{pad.preview}</strong>
            <small>{t("compose.panel.moveCount", { count: pad.changedCount })} / {pad.detail}</small>
          </button>
        ))}
      </div>
      {result && <DrumKitResultStrip result={result} />}
    </div>
  );
}

export function DrumKitPreviewDecision({
  summary,
  onApply
}: {
  summary: DrumKitPreviewDecisionSummary;
  onApply: () => void;
}): ReactElement {
  const { t } = useLocalization();
  return (
    <div
      className={`drum-kit-decision ${summary.tone}`}
      data-drum-kit-decision={summary.padId}
      data-testid="drum-kit-decision"
      title={summary.detailTitle}
    >
      <span data-testid="drum-kit-decision-status">{summary.statusLabel}</span>
      <strong data-testid="drum-kit-decision-label">{summary.kitLabel}</strong>
      <small data-testid="drum-kit-decision-metric">{summary.metricLabel}</small>
      <small data-testid="drum-kit-decision-detail">{summary.detailLabel}</small>
      <button
        className="drum-kit-decision-run"
        data-drum-kit-decision-action={summary.actionId}
        data-testid="drum-kit-decision-run"
        disabled={summary.disabled}
        onClick={onApply}
        title={summary.disabled ? t("compose.panel.sound.kitMatchedTitle") : t("compose.panel.applyTarget", { target: summary.kitLabel })}
        type="button"
      >
        <Drum size={12} aria-hidden="true" />
        <span data-testid="drum-kit-decision-action">{summary.actionLabel}</span>
      </button>
    </div>
  );
}

function createDrumKitPreviewDecision(summary: DrumKitPreviewSummary): DrumKitPreviewDecisionSummary {
  const aligned = summary.changedMoves === 0;

  return {
    padId: summary.padId,
    actionId: aligned ? "aligned" : "apply-suggested",
    statusLabel: aligned ? "Kit aligned" : "Ready to apply",
    kitLabel: summary.kitLabel,
    metricLabel: summary.moveLabel,
    detailLabel: aligned ? "Current drum tone and rack already match this kit." : `${summary.drumLabel} / ${summary.rackLabel}`,
    actionLabel: aligned ? "Aligned" : "Apply Suggested Kit",
    disabled: aligned,
    detailTitle: aligned
      ? `${summary.detailTitle} No Drum Kit action is needed.`
      : `${summary.detailTitle} Apply only after the suggested kit fits the drum and 808 balance.`,
    tone: aligned ? "good" : summary.tone
  };
}

export function DrumKitResultStrip({ result }: { result: DrumKitResult }): ReactElement {
  const { t } = useLocalization();
  return (
    <div
      className={`drum-kit-result ${result.tone}`}
      data-result-drum-kit={result.padId}
      data-testid="drum-kit-result"
      aria-live="polite"
    >
      <div className="drum-kit-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="drum-kit-result-title">{result.title}</strong>
          <small data-testid="drum-kit-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="drum-kit-result-meta">
        <span data-testid="drum-kit-result-status">{result.status}</span>
        <span data-testid="drum-kit-result-scope">{result.scope}</span>
        <span data-testid="drum-kit-result-impact">{result.impact}</span>
      </div>
      <div className="drum-kit-result-metrics" data-testid="drum-kit-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`drum-kit-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="drum-kit-result-followup" data-testid="drum-kit-result-followup">
        <span>
          <b>{t("compose.panel.audition")}</b>
          <em data-testid="drum-kit-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>{t("compose.panel.nextCheck")}</b>
          <em data-testid="drum-kit-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function SoundFocusPads({
  pads,
  preview,
  result,
  onApply
}: {
  pads: SoundFocusPadOption[];
  preview: SoundFocusPreviewSummary;
  result: SoundFocusResult | null;
  onApply: (pad: SoundFocusPadId) => void;
}): ReactElement {
  const { t } = useLocalization();
  const decision = createSoundFocusPreviewDecision(preview);

  return (
    <div className="sound-focus-panel" data-testid="sound-focus-pads">
      <div className="sound-focus-heading">
        <span>{t("compose.panel.sound.focus")}</span>
        <strong>{t("compose.panel.sound.tonePosture")}</strong>
      </div>
      <div
        className={`sound-focus-preview ${preview.tone}`}
        data-preview-sound-focus={preview.padId}
        data-testid="sound-focus-preview"
        title={preview.detailTitle}
      >
        <span data-testid="sound-focus-preview-status">{preview.statusLabel}</span>
        <strong data-testid="sound-focus-preview-pad">{preview.padLabel}</strong>
        <small data-testid="sound-focus-preview-focus">{preview.focusLabel}</small>
        <small data-testid="sound-focus-preview-parameters">{preview.parameterLabel}</small>
        <small data-testid="sound-focus-preview-changes">{preview.changeLabel}</small>
      </div>
      <SoundFocusPreviewDecision summary={decision} onApply={() => onApply(decision.padId)} />
      {result && <SoundFocusResultStrip result={result} />}
      <div className="sound-focus-row" aria-label={t("compose.panel.sound.focusPadsAria")}>
        {pads.map((pad) => (
          <button
            data-testid={`sound-focus-${pad.id}`}
            key={pad.id}
            onClick={() => onApply(pad.id)}
            title={`${pad.label} ${pad.preview}`}
            type="button"
          >
            <span>{pad.label}</span>
            <strong>{pad.preview}</strong>
            <small>{t("compose.panel.moveCount", { count: pad.changedCount })} / {pad.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SoundFocusPreviewDecision({
  summary,
  onApply
}: {
  summary: SoundFocusPreviewDecisionSummary;
  onApply: () => void;
}): ReactElement {
  const { t } = useLocalization();
  return (
    <div
      className={`sound-focus-decision ${summary.tone}`}
      data-sound-focus-decision={summary.padId}
      data-testid="sound-focus-decision"
      title={summary.detailTitle}
    >
      <span data-testid="sound-focus-decision-status">{summary.statusLabel}</span>
      <strong data-testid="sound-focus-decision-label">{summary.padLabel}</strong>
      <small data-testid="sound-focus-decision-metric">{summary.metricLabel}</small>
      <small data-testid="sound-focus-decision-detail">{summary.detailLabel}</small>
      <button
        className="sound-focus-decision-run"
        data-sound-focus-decision-action={summary.actionId}
        data-testid="sound-focus-decision-run"
        disabled={summary.disabled}
        onClick={onApply}
        title={summary.disabled ? t("compose.panel.sound.focusMatchedTitle") : t("compose.panel.applyTarget", { target: summary.padLabel })}
        type="button"
      >
        <SlidersHorizontal size={12} aria-hidden="true" />
        <span data-testid="sound-focus-decision-action">{summary.actionLabel}</span>
      </button>
    </div>
  );
}

function createSoundFocusPreviewDecision(summary: SoundFocusPreviewSummary): SoundFocusPreviewDecisionSummary {
  const aligned = summary.changedMoves === 0;

  return {
    padId: summary.padId,
    actionId: aligned ? "aligned" : "apply-suggested",
    statusLabel: aligned ? "Focus aligned" : "Ready to apply",
    padLabel: summary.padLabel,
    metricLabel: summary.changeLabel,
    detailLabel: aligned ? "Current editable tone already matches this focus." : `${summary.focusLabel} / ${summary.parameterLabel}`,
    actionLabel: aligned ? "Aligned" : "Apply Suggested Focus",
    disabled: aligned,
    detailTitle: aligned
      ? `${summary.detailTitle} No Sound Focus action is needed.`
      : `${summary.detailTitle} Apply only after this focused tone posture fits the beat.`,
    tone: aligned ? "good" : summary.tone
  };
}

export function SoundFocusResultStrip({ result }: { result: SoundFocusResult }): ReactElement {
  const { t } = useLocalization();
  return (
    <div
      className={`sound-focus-result ${result.tone}`}
      data-result-sound-focus={result.moveId}
      data-testid="sound-focus-result"
      aria-live="polite"
    >
      <div className="sound-focus-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="sound-focus-result-title">{result.title}</strong>
          <small data-testid="sound-focus-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="sound-focus-result-meta">
        <span data-testid="sound-focus-result-status">{result.status}</span>
        <span data-testid="sound-focus-result-scope">{result.scope}</span>
        <span data-testid="sound-focus-result-impact">{result.impact}</span>
      </div>
      <div className="sound-focus-result-metrics" data-testid="sound-focus-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`sound-focus-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="sound-focus-result-followup" data-testid="sound-focus-result-followup">
        <span>
          <b>{t("compose.panel.audition")}</b>
          <em data-testid="sound-focus-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>{t("compose.panel.nextCheck")}</b>
          <em data-testid="sound-focus-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function SoundControl({
  baseline,
  baselineSourceLabel,
  id,
  label,
  value,
  onChange,
  onResetResult
}: {
  baseline: number;
  baselineSourceLabel: string;
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  onResetResult?: (result: StudioToneResetResult) => void;
}): ReactElement {
  const { t } = useLocalization();
  const percentValue = `${Math.round(value * 100)}`;
  const baselinePercent = Math.round(baseline * 100);
  const currentPercent = Math.round(value * 100);
  const deltaPercent = currentPercent - baselinePercent;
  const deltaLabel = t("compose.panel.sound.delta", { value: deltaPercent === 0 ? "0" : `${deltaPercent > 0 ? "+" : ""}${deltaPercent}` });
  const resetDisabled = currentPercent === baselinePercent;
  const [percentText, setPercentText] = useState(percentValue);
  const [isEditingPercent, setIsEditingPercent] = useState(false);
  const skipNextBlurCommit = useRef(false);

  useEffect(() => {
    if (!isEditingPercent) {
      setPercentText(percentValue);
    }
  }, [isEditingPercent, percentValue]);

  function commitPercentInput(inputText: string): void {
    const nextText = inputText.trim();
    const parsed = nextText === "" ? Math.round(value * 100) : Number(nextText);
    const nextPercent = Number.isFinite(parsed) ? Math.min(100, Math.max(0, Math.round(parsed))) : Math.round(value * 100);
    const nextValue = nextPercent / 100;

    setIsEditingPercent(false);
    setPercentText(`${nextPercent}`);
    if (nextValue !== value) {
      onChange(nextValue);
    }
  }

  return (
    <div className="sound-control">
      <span>
        {label} {percentLabel(value)}
      </span>
      <div className="sound-control-inputs">
        <input
          aria-label={label}
          data-testid={`sound-${id}`}
          max={1}
          min={0}
          onChange={(event) => {
            const nextValue = Number(event.target.value);
            setIsEditingPercent(false);
            setPercentText(`${Math.round(nextValue * 100)}`);
            onChange(nextValue);
          }}
          step={0.01}
          type="range"
          value={value}
        />
        <input
          aria-label={t("compose.panel.percentAria", { label })}
          data-testid={`sound-${id}-input`}
          max={100}
          min={0}
          onBlur={(event) => {
            if (skipNextBlurCommit.current) {
              skipNextBlurCommit.current = false;
              return;
            }
            commitPercentInput(event.currentTarget.value);
          }}
          onChange={(event) => {
            setIsEditingPercent(true);
            setPercentText(event.target.value);
          }}
          onFocus={() => {
            setIsEditingPercent(true);
            setPercentText(percentValue);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              skipNextBlurCommit.current = true;
              commitPercentInput(event.currentTarget.value);
              event.currentTarget.blur();
            }
            if (event.key === "Escape") {
              skipNextBlurCommit.current = true;
              setIsEditingPercent(false);
              setPercentText(percentValue);
              event.currentTarget.blur();
            }
          }}
          step={1}
          type="number"
          value={isEditingPercent ? percentText : percentValue}
        />
      </div>
      <div className="sound-control-reference" data-testid={`sound-${id}-reference`}>
        <span data-testid={`sound-${id}-baseline`} title={t("compose.panel.sound.baselineFrom", { source: baselineSourceLabel })}>
          {t("compose.panel.sound.baselineValue", { value: percentLabel(baseline) })}
        </span>
        <span data-testid={`sound-${id}-delta`}>{deltaLabel}</span>
        <button
          data-testid={`sound-${id}-reset`}
          disabled={resetDisabled}
          onClick={() => {
            setIsEditingPercent(false);
            setPercentText(`${baselinePercent}`);
            onResetResult?.({
              id,
              label,
              beforeLabel: percentLabel(value),
              baselineLabel: percentLabel(baseline),
              baselineSourceLabel,
              deltaLabel: `${deltaLabel} -> 0`,
              nextCheck: studioToneResetNextCheck(label)
            });
            onChange(baseline);
          }}
          title={resetDisabled
            ? t("compose.panel.sound.resetMatched", { label, source: baselineSourceLabel })
            : t("compose.panel.sound.resetTo", { label, source: baselineSourceLabel })}
          type="button"
        >
          <RotateCcw size={12} aria-hidden="true" />
          <span>{t("compose.panel.reset")}</span>
        </button>
      </div>
    </div>
  );
}

function StudioToneResetResultStrip({ result }: { result: StudioToneResetResult }): ReactElement {
  const { t } = useLocalization();
  return (
    <div className="studio-tone-reset-result" data-testid="studio-tone-reset-result">
      <div className="studio-tone-reset-result-main">
        <ListChecks size={15} aria-hidden="true" />
        <span>
          <b data-testid="studio-tone-reset-title">{t("compose.panel.resetTarget", { target: result.label })}</b>
          <em data-testid="studio-tone-reset-detail">
            {result.beforeLabel}
            {" -> "}
            {result.baselineLabel}
          </em>
        </span>
      </div>
      <div className="studio-tone-reset-result-meta">
        <span data-testid="studio-tone-reset-baseline">
          {t("compose.panel.sound.baselineResult", { source: result.baselineSourceLabel, value: result.baselineLabel })}
        </span>
        <span data-testid="studio-tone-reset-delta">{result.deltaLabel}</span>
      </div>
      <p className="studio-tone-reset-result-next" data-testid="studio-tone-reset-next-check">
        {result.nextCheck}
      </p>
    </div>
  );
}

function StudioToneBaselineResultStrip({ result }: { result: StudioToneBaselineResult }): ReactElement {
  return (
    <div className="studio-tone-baseline-result" data-testid="studio-tone-baseline-result">
      <div className="studio-tone-baseline-result-main">
        <Save size={14} aria-hidden="true" />
        <span>
          <b data-testid="studio-tone-baseline-result-title">{result.sourceLabel}</b>
          <em data-testid="studio-tone-baseline-result-tone">{result.toneLabel}</em>
        </span>
      </div>
      <p data-testid="studio-tone-baseline-result-next-check">{result.nextCheck}</p>
    </div>
  );
}

function StudioToneDriftSummaryStrip({
  summary,
  onResetLargest
}: {
  summary: StudioToneDriftSummary;
  onResetLargest: () => void;
}): ReactElement {
  const { t } = useLocalization();
  return (
    <div className="studio-tone-drift-summary" data-testid="studio-tone-drift-summary">
      <div className="studio-tone-drift-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <b data-testid="studio-tone-drift-posture">{summary.postureLabel}</b>
          <em data-testid="studio-tone-drift-count">
            {t("compose.panel.sound.controlsChanged", { changed: summary.changedCount, total: summary.totalCount })}
          </em>
        </span>
      </div>
      <div className="studio-tone-drift-meta">
        <span data-testid="studio-tone-drift-largest">{summary.largestLabel}</span>
        <span data-testid="studio-tone-drift-direction">{summary.directionLabel}</span>
      </div>
      <button
        data-testid="studio-tone-drift-reset-largest"
        disabled={!summary.resetTarget}
        onClick={onResetLargest}
        title={summary.resetTarget ? t("compose.panel.sound.resetToBaseline", { label: summary.resetTarget.label }) : t("compose.panel.sound.noDrift")}
        type="button"
      >
        <RotateCcw size={12} aria-hidden="true" />
        <span>{t("compose.panel.sound.resetLargest")}</span>
      </button>
      <p data-testid="studio-tone-drift-next-check">{summary.nextCheck}</p>
    </div>
  );
}

export function ChordEditor({
  advancedOpen,
  chordPads,
  chordClipboard,
  chordMovePreview,
  chordMoveResult,
  chordRhythms,
  chordVoicings,
  chords,
  currentKey,
  currentStep,
  rootOptions,
  selectedIndex,
  beatDuplicateStep,
  previousBeatDuplicateStep,
  onAdd,
  onAdvancedOpenChange,
  onChange,
  onCopy,
  onDelete,
  onDuplicate,
  onDuplicateBeat,
  onDuplicatePreviousBeat,
  onInvert,
  onMoveStep,
  onAudition,
  onPad,
  onPaste,
  onPreset,
  onRhythm,
  onSelect,
  onVoicing
}: {
  advancedOpen: boolean;
  chordPads: ChordPadOption[];
  chordClipboard: ChordClipboard | null;
  chordMovePreview: ChordMovePreviewSummary;
  chordMoveResult: ChordMoveResult | null;
  chordRhythms: ChordRhythmOption[];
  chordVoicings: ChordVoicingOption[];
  chords: ChordEvent[];
  currentKey: string;
  currentStep: number | null;
  rootOptions: string[];
  selectedIndex: number | null;
  beatDuplicateStep: number | null;
  previousBeatDuplicateStep: number | null;
  onAdd: () => void;
  onAdvancedOpenChange: (open: boolean) => void;
  onChange: (index: number, update: Partial<ChordEvent>) => boolean;
  onCopy: () => void;
  onDelete: (index: number) => boolean;
  onDuplicate: () => void;
  onDuplicateBeat: () => void;
  onDuplicatePreviousBeat: () => void;
  onInvert: (direction: -1 | 1) => void;
  onMoveStep: (direction: -1 | 1) => void;
  onAudition: () => void;
  onPad: (pad: ChordPadId) => void;
  onPaste: () => void;
  onPreset: (preset: ChordProgressionPreset) => void;
  onRhythm: (rhythm: ChordRhythmId) => void;
  onSelect: (index: number) => void;
  onVoicing: (voicing: ChordVoicingId) => void;
}): ReactElement {
  const { t } = useLocalization();
  const selectedChord = selectedIndex === null ? undefined : chords[selectedIndex];
  const selectedInversion = selectedChord ? normalizeChordInversion(selectedChord.inversion) : 0;
  const harmonicSummary = selectedChord ? selectedChordHarmonicSummary(currentKey, selectedChord) : null;
  const chordClipboardLabel = chordClipboard ? `${chordClipboard.root}${chordClipboard.quality}.${chordClipboard.step + 1}` : t("compose.panel.empty");
  const canMoveLeft =
    selectedIndex !== null &&
    selectedChord !== undefined &&
    selectedChord.step > 0 &&
    !chords.some((chord, index) => index !== selectedIndex && chord.step === selectedChord.step - 1);
  const canMoveRight =
    selectedIndex !== null &&
    selectedChord !== undefined &&
    selectedChord.step < 15 &&
    !chords.some((chord, index) => index !== selectedIndex && chord.step === selectedChord.step + 1);
  const canDuplicate = selectedChord ? nextEmptyChordStep(chords, selectedChord.step) !== null : false;
  const canPaste = chordClipboard ? nextEmptyChordStep(chords, chordClipboard.step) !== null : false;

  return (
    <div className="chord-editor">
      <div className="lane-header">
        <span>{t("compose.panel.chords.title")}</span>
        <strong>{t("compose.panel.eventCount", { count: chords.length })}</strong>
      </div>
      <div className="chord-primary-tools" aria-label={t("compose.panel.chords.eventActionsAria")} data-testid="chord-primary-actions">
        <button data-testid="chord-add" onClick={onAdd} title={t("compose.panel.chords.addTitle")} type="button">
          <Plus size={14} aria-hidden="true" />
          <span>{t("compose.panel.chords.add")}</span>
        </button>
      </div>
      {harmonicSummary && (
        <div className={harmonicSummary.inKey ? "chord-harmonic-readout" : "chord-harmonic-readout warn"} data-testid="chord-harmonic-readout">
          <span>{t("compose.panel.chords.function")}</span>
          <strong data-testid="chord-harmonic-label">{harmonicSummary.romanLabel}</strong>
          <small data-testid="chord-harmonic-role">
            {harmonicSummary.degreeLabel} / {harmonicSummary.roleLabel} / {harmonicSummary.detailLabel}
          </small>
        </div>
      )}
      <div className="chord-edit-row" aria-label={t("compose.panel.chords.editToolsAria")} data-testid="chord-edit-tools">
        <button
          aria-label={t("compose.panel.chords.auditionTitle")}
          data-testid="chord-audition"
          disabled={!selectedChord}
          onClick={onAudition}
          title={t("compose.panel.chords.auditionTitle")}
          type="button"
        >
          <Play size={13} aria-hidden="true" />
          <span>{t("compose.panel.audition")}</span>
        </button>
        <button
          aria-label={t("compose.panel.chords.stepLeftTitle")}
          data-testid="chord-move-left"
          disabled={!canMoveLeft}
          onClick={() => onMoveStep(-1)}
          title={t("compose.panel.chords.stepLeftTitle")}
          type="button"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          <span>{t("compose.panel.stepLeft")}</span>
        </button>
        <button
          aria-label={t("compose.panel.chords.stepRightTitle")}
          data-testid="chord-move-right"
          disabled={!canMoveRight}
          onClick={() => onMoveStep(1)}
          title={t("compose.panel.chords.stepRightTitle")}
          type="button"
        >
          <ArrowRight size={13} aria-hidden="true" />
          <span>{t("compose.panel.stepRight")}</span>
        </button>
        <button
          aria-label={t("compose.panel.chords.duplicateTitle")}
          data-testid="chord-duplicate"
          disabled={!canDuplicate}
          onClick={onDuplicate}
          title={t("compose.panel.chords.duplicateTitle")}
          type="button"
        >
          <Copy size={13} aria-hidden="true" />
          <span>{t("compose.panel.duplicate")}</span>
        </button>
        <button
          aria-label={t("compose.panel.chords.duplicatePrevious")}
          data-testid="chord-duplicate-previous-beat"
          disabled={previousBeatDuplicateStep === null}
          onClick={onDuplicatePreviousBeat}
          title={
            previousBeatDuplicateStep === null
              ? t("compose.panel.chords.noEarlierSlot")
              : t("compose.panel.chords.duplicateToStep", { step: previousBeatDuplicateStep + 1 })
          }
          type="button"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          <span>{t("compose.panel.previousBeatShort")}</span>
        </button>
        <button
          aria-label={t("compose.panel.chords.duplicateNext")}
          data-testid="chord-duplicate-beat"
          disabled={beatDuplicateStep === null}
          onClick={onDuplicateBeat}
          title={beatDuplicateStep === null ? t("compose.panel.chords.noLaterSlot") : t("compose.panel.chords.duplicateToStep", { step: beatDuplicateStep + 1 })}
          type="button"
        >
          <ArrowRight size={13} aria-hidden="true" />
          <span>{t("compose.panel.nextBeat")}</span>
        </button>
        <button
          aria-label={t("compose.panel.chords.voiceDownTitle")}
          data-testid="chord-invert-down"
          disabled={!selectedChord || selectedInversion <= 0}
          onClick={() => onInvert(-1)}
          title={t("compose.panel.chords.voiceDownTitle")}
          type="button"
        >
          <ArrowDown size={13} aria-hidden="true" />
          <span>{t("compose.panel.chords.voiceDown")}</span>
        </button>
        <button
          aria-label={t("compose.panel.chords.voiceUpTitle")}
          data-testid="chord-invert-up"
          disabled={!selectedChord || selectedInversion >= chordInversions[chordInversions.length - 1]}
          onClick={() => onInvert(1)}
          title={t("compose.panel.chords.voiceUpTitle")}
          type="button"
        >
          <ArrowUp size={13} aria-hidden="true" />
          <span>{t("compose.panel.chords.voiceUp")}</span>
        </button>
      </div>
      <div className="chord-clipboard-row" aria-label={t("compose.panel.chords.clipboardAria")}>
        <button data-testid="chord-copy" disabled={!selectedChord} onClick={onCopy} title={t("compose.panel.chords.copyTitle")} type="button">
          <Copy size={13} aria-hidden="true" />
          <span>{t("compose.panel.copy")}</span>
        </button>
        <button data-testid="chord-paste" disabled={!canPaste} onClick={onPaste} title={t("compose.panel.chords.pasteTitle")} type="button">
          <Plus size={13} aria-hidden="true" />
          <span>{t("compose.panel.paste")}</span>
        </button>
        <small data-testid="chord-clipboard-detail">
          {chordClipboard ? t("compose.panel.clipboardValue", { value: chordClipboardLabel }) : t("compose.panel.clipboardEmpty")}
        </small>
      </div>
      <div className="chord-slots" data-testid="chord-event-grid">
        {chords.map((chord, index) => {
          const selected = selectedIndex === index;
          const playing = currentStep !== null && currentStep >= chord.step && currentStep < chord.step + chord.length;
          const chordVelocityPercent = Math.min(100, Math.max(0, Math.round(chord.velocity * 100)));
          const chordProbability = normalizeEventProbability(chord.probability);
          return (
            <div
              aria-current={playing ? "step" : undefined}
              aria-label={`${t("compose.panel.chords.chord")} ${index + 1} ${chord.root}${chord.quality} ${t("compose.panel.step")} ${chord.step + 1} ${chordVelocityPercent}% ${t("compose.panel.velocityLower")} ${t("compose.panel.lengthLower")} ${
                chord.length
              }${chordProbability < 1 ? ` ${chanceBadgeLabel(chordProbability)} ${t("compose.panel.chance")}` : ""}`}
              aria-controls={`chord-event-editor-${index}`}
              aria-expanded={selected}
              className={["chord-slot", selected ? "selected" : "", playing ? "playing" : ""].filter(Boolean).join(" ")}
              data-editor-open={selected ? "true" : "false"}
              data-playing={playing ? "true" : "false"}
              data-testid={`chord-slot-${index}`}
              key={`${chord.step}-${index}`}
              onClick={() => onSelect(index)}
              onFocusCapture={() => onSelect(index)}
              onKeyDown={(event) => {
                handleChordCardKeyboardActivation(event, () => onSelect(index));
              }}
              onPointerDownCapture={() => onSelect(index)}
              role="group"
              tabIndex={0}
            >
              <div className="chord-slot-heading">
                <span>{chord.step + 1}</span>
                <strong>
                  {chord.root}
                  {chord.quality}
                </strong>
                <small data-testid={`chord-inversion-badge-${index}`}>{chordInversionLabel(normalizeChordInversion(chord.inversion))}</small>
                {chord.probability < 1 && (
                  <small className="chance-badge" data-testid={`chord-chance-badge-${index}`}>
                    {chanceBadgeLabel(chord.probability)}
                  </small>
                )}
                <button
                  data-testid={`chord-delete-${index}`}
                  disabled={chords.length <= 1}
                  onClick={() => onDelete(index)}
                  title={t("compose.panel.chords.deleteTitle")}
                  type="button"
                >
                  <Trash2 size={13} aria-hidden="true" />
                </button>
              </div>
              <div className="chord-velocity-readout" aria-hidden="true">
                <span className="chord-velocity-meter">
                  <span style={{ inlineSize: `${chordVelocityPercent}%` }} />
                </span>
                <strong className="chord-velocity-label" data-testid={`chord-velocity-label-${index}`}>
                  {chordVelocityPercent}
                </strong>
              </div>
              <div className="chord-slot-summary" data-testid={`chord-summary-${index}`}>
                <span>
                  <small>{t("compose.panel.length")}</small>
                  <strong>{chord.length}</strong>
                </span>
                <span>
                  <small>{t("compose.panel.velocity")}</small>
                  <strong>{chordVelocityPercent}%</strong>
                </span>
                <span>
                  <small>{t("compose.panel.chance")}</small>
                  <strong>{percentLabel(chordProbability)}</strong>
                </span>
                <small className="chord-slot-edit-state" data-testid={`chord-edit-state-${index}`}>
                  {selected ? t("compose.panel.chords.editing") : t("compose.panel.chords.selectToEdit")}
                </small>
              </div>
              <div
                aria-hidden={!selected}
                className="chord-slot-editor"
                data-testid={`chord-event-editor-${index}`}
                id={`chord-event-editor-${index}`}
              >
                <label>
                  <span>{t("compose.panel.step")}</span>
                  <input
                    data-testid={`chord-step-${index}`}
                    max={16}
                    min={1}
                    onChange={(event) => onChange(index, { step: clampStepStart(Number(event.target.value) - 1) })}
                    step={1}
                    type="number"
                    value={chord.step + 1}
                  />
                </label>
              <label>
                <span>{t("compose.panel.chords.root")}</span>
                <select
                  data-testid={`chord-root-${index}`}
                  value={chord.root}
                  onChange={(event) => onChange(index, { root: event.target.value })}
                >
                  {rootOptions.map((root) => (
                    <option key={root} value={root}>
                      {root}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>{t("compose.panel.chords.quality")}</span>
                <select
                  data-testid={`chord-quality-${index}`}
                  value={chord.quality}
                  onChange={(event) => onChange(index, { quality: event.target.value as ChordQuality })}
                >
                  {chordQualities.map((quality) => (
                    <option key={quality} value={quality}>
                      {quality}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>{t("compose.panel.chords.voicing")} {chordInversionLabel(normalizeChordInversion(chord.inversion))}</span>
                <div className="chord-inversion-row" aria-label={t("compose.panel.chords.inversionAria", { index: index + 1 })}>
                  {chordInversions.map((inversion) => (
                    <button
                      className={normalizeChordInversion(chord.inversion) === inversion ? "selected" : ""}
                      data-testid={`chord-inversion-${index}-${inversion}`}
                      key={inversion}
                      onClick={() => onChange(index, { inversion })}
                      type="button"
                    >
                      {chordInversionLabel(inversion)}
                    </button>
                  ))}
                </div>
              </label>
              <label>
                <span>{t("compose.panel.length")} {chord.length}</span>
                <div className="chord-value-inputs">
                  <input
                    data-testid={`chord-length-${index}`}
                    max={8}
                    min={1}
                    onChange={(event) => onChange(index, { length: Number(event.target.value) })}
                    step={1}
                    type="range"
                    value={chord.length}
                  />
                  <input
                    aria-label={t("compose.panel.chords.lengthAria", { index: index + 1 })}
                    data-testid={`chord-length-input-${index}`}
                    max={8}
                    min={1}
                    onChange={(event) => onChange(index, { length: Number(event.target.value) })}
                    step={1}
                    type="number"
                    value={chord.length}
                  />
                </div>
              </label>
              <label>
                <span>{t("compose.panel.velocity")} {Math.round(chord.velocity * 100)}%</span>
                <div className="chord-value-inputs">
                  <input
                    data-testid={`chord-velocity-${index}`}
                    max={1}
                    min={0.1}
                    onChange={(event) => onChange(index, { velocity: Number(event.target.value) })}
                    step={0.01}
                    type="range"
                    value={chord.velocity}
                  />
                  <input
                    aria-label={t("compose.panel.chords.velocityPercentAria", { index: index + 1 })}
                    data-testid={`chord-velocity-input-${index}`}
                    max={100}
                    min={10}
                    onChange={(event) => onChange(index, { velocity: Number(event.target.value) / 100 })}
                    step={1}
                    type="number"
                    value={Math.round(chord.velocity * 100)}
                  />
                </div>
              </label>
              <label>
                <span>{t("compose.panel.chance")} {percentLabel(chord.probability)}</span>
                <div className="chord-value-inputs">
                  <input
                    aria-label={t("compose.panel.chords.probabilityAria", { index: index + 1 })}
                    data-testid={`chord-probability-${index}`}
                    max={1}
                    min={0}
                    onChange={(event) => onChange(index, { probability: Number(event.target.value) })}
                    step={0.01}
                    type="range"
                    value={normalizeEventProbability(chord.probability)}
                  />
                  <input
                    aria-label={t("compose.panel.chords.probabilityPercentAria", { index: index + 1 })}
                    data-testid={`chord-probability-input-${index}`}
                    inputMode="numeric"
                    onChange={(event) => onChange(index, { probability: Number(event.target.value) / 100 })}
                    pattern="[0-9]*"
                    step={1}
                    type="text"
                    value={`${Math.round(normalizeEventProbability(chord.probability) * 100)}`}
                  />
                </div>
              </label>
              </div>
            </div>
          );
        })}
      </div>
      <details
        className="harmony-moves"
        data-testid="harmony-moves"
        open={advancedOpen}
      >
        <summary
          className="harmony-moves-summary"
          data-testid="harmony-moves-toggle"
          onClick={(event) => {
            event.preventDefault();
            onAdvancedOpenChange(!advancedOpen);
          }}
        >
          <span className="harmony-moves-copy">
            <strong>{t("compose.panel.chords.harmonyMoves")}</strong>
            <small>{t("compose.panel.chords.harmonyMovesDetail")}</small>
          </span>
          <span className="harmony-moves-context">
            {selectedChord
              ? t("compose.panel.chords.selectedChord", { chord: `${selectedChord.root}${selectedChord.quality}` })
              : t("compose.panel.chords.selectChord")} · {t("compose.panel.eventCount", { count: chords.length })}
          </span>
          <ArrowDown className="harmony-moves-chevron" size={16} aria-hidden="true" />
        </summary>
        <div className="harmony-moves-content" data-testid="harmony-moves-content">
          <div className="chord-preset-row" aria-label={t("compose.panel.chords.progressionPresetsAria")}>
            {chordProgressionPresetIds.map((preset) => (
              <button
                data-testid={`chord-preset-${preset}`}
                key={preset}
                onClick={() => onPreset(preset)}
                type="button"
              >
                {chordProgressionPresetLabel(preset)}
              </button>
            ))}
          </div>
          <div
            className={`chord-move-preview ${chordMovePreview.tone}`}
            data-preview-chord-pad={chordMovePreview.padId}
            data-preview-chord-rhythm={chordMovePreview.rhythmId}
            data-preview-chord-voicing={chordMovePreview.voicingId}
            data-testid="chord-move-preview"
            title={chordMovePreview.detailTitle}
          >
            <span data-testid="chord-move-preview-status">{chordMovePreview.statusLabel}</span>
            <strong data-testid="chord-move-preview-selected">{chordMovePreview.selectedLabel}</strong>
            <small data-testid="chord-move-preview-harmonic">{chordMovePreview.harmonicLabel}</small>
            <small data-testid="chord-move-preview-rhythm">{chordMovePreview.rhythmLabel}</small>
            <small data-testid="chord-move-preview-voicing">{chordMovePreview.voicingLabel}</small>
            <small data-testid="chord-move-preview-moves">{chordMovePreview.moveLabel}</small>
          </div>
          {chordMoveResult && <ChordMoveResultStrip result={chordMoveResult} />}
          <div className="chord-pad-row" aria-label={t("compose.panel.chords.padsAria")}>
            {chordPads.map((pad) => (
              <button
                className={pad.selected ? "selected" : ""}
                data-testid={`chord-pad-${pad.id}`}
                disabled={!selectedChord}
                key={pad.id}
                onClick={() => onPad(pad.id)}
                title={`${pad.label} ${pad.root}${pad.quality}`}
                type="button"
              >
                <span>{pad.label}</span>
                <strong>
                  {pad.root}
                  {pad.quality}
                </strong>
                <small>{pad.detail}</small>
              </button>
            ))}
          </div>
          <div className="chord-rhythm-panel" data-testid="chord-rhythm-pads">
            <div className="chord-rhythm-heading">
              <span>{t("compose.panel.chords.rhythm")}</span>
              <strong>{t("compose.panel.chords.rhythmDetail")}</strong>
            </div>
            <div className="chord-rhythm-row" aria-label={t("compose.panel.chords.rhythmPadsAria")}>
              {chordRhythms.map((rhythm) => (
                <button
                  data-testid={`chord-rhythm-${rhythm.id}`}
                  disabled={chords.length === 0}
                  key={rhythm.id}
                  onClick={() => onRhythm(rhythm.id)}
                  title={`${rhythm.label} ${rhythm.preview}`}
                  type="button"
                >
                  <span>{rhythm.label}</span>
                  <strong>{rhythm.preview}</strong>
                  <small>{t("compose.panel.chords.chanceEditCount", { count: rhythm.chanceCount })} / {rhythm.detail}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="chord-voicing-panel" data-testid="chord-voicing-pads">
            <div className="chord-voicing-heading">
              <span>{t("compose.panel.chords.voicingTitle")}</span>
              <strong>{t("compose.panel.chords.voicingDetail")}</strong>
            </div>
            <div className="chord-voicing-row" aria-label={t("compose.panel.chords.voicingPadsAria")}>
              {chordVoicings.map((voicing) => (
                <button
                  className={voicing.selected ? "selected" : ""}
                  data-testid={`chord-voicing-${voicing.id}`}
                  disabled={!selectedChord}
                  key={voicing.id}
                  onClick={() => onVoicing(voicing.id)}
                  title={`${voicing.label} ${voicing.preview}`}
                  type="button"
                >
                  <span>{voicing.label}</span>
                  <strong>{voicing.preview}</strong>
                  <small>{voicing.detail}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}

export function ChordMoveResultStrip({ result }: { result: ChordMoveResult }): ReactElement {
  const { t } = useLocalization();
  return (
    <div
      className={`chord-move-result ${result.tone}`}
      data-result-chord-move={result.moveId}
      data-testid="chord-move-result"
      aria-live="polite"
    >
      <div className="chord-move-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="chord-move-result-title">{result.title}</strong>
          <small data-testid="chord-move-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="chord-move-result-meta">
        <span data-testid="chord-move-result-status">{result.status}</span>
        <span data-testid="chord-move-result-scope">{result.scope}</span>
        <span data-testid="chord-move-result-impact">{result.impact}</span>
      </div>
      <div className="chord-move-result-metrics" data-testid="chord-move-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`chord-move-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="chord-move-result-followup" data-testid="chord-move-result-followup">
        <span>
          <b>{t("compose.panel.audition")}</b>
          <em data-testid="chord-move-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>{t("compose.panel.nextCheck")}</b>
          <em data-testid="chord-move-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

function selectedDrumPocketSummary(
  selectedStep: SelectedDrumStep,
  velocity: number,
  chance: number,
  timingMs: number,
  repeat: number
): DrumPocketSummary {
  const normalizedVelocity = normalizeDrumVelocity(velocity);
  const normalizedChance = normalizeDrumProbability(chance);
  const normalizedTiming = normalizeDrumTimingMs(timingMs);
  const normalizedRepeat = selectedStep.lane === "hat" ? normalizeHatRepeat(repeat) : 1;

  return {
    positionLabel: `${drumLabels[selectedStep.lane]} ${selectedStep.step + 1} / ${drumPocketPositionLabel(selectedStep.step)}`,
    roleLabel: drumPocketRoleLabel(selectedStep.lane, selectedStep.step, normalizedRepeat),
    detailLabel: `${percentLabel(normalizedVelocity)} vel / ${percentLabel(normalizedChance)} chance / ${timingLabel(normalizedTiming)}${
      selectedStep.lane === "hat" ? ` / x${normalizedRepeat}` : " / single"
    }`,
    isShaped: normalizedChance < 1 || normalizedTiming !== 0 || normalizedRepeat > 1 || normalizedVelocity >= 0.9
  };
}

function drumPocketPositionLabel(step: number): string {
  const beat = Math.floor(step / 4) + 1;
  const slot = (step % 4) + 1;
  return slot === 1 ? `Beat ${beat}` : `Beat ${beat}.${slot}`;
}

function drumPocketRoleLabel(lane: DrumLane, step: number, repeat: number): string {
  const slot = step % 4;
  if (lane === "clap") {
    if (step === 4 || step === 12) {
      return "Backbeat";
    }
    return slot === 0 ? "Clap anchor" : "Clap fill";
  }
  if (lane === "kick") {
    if (step === 0) {
      return "Downbeat";
    }
    if (slot === 0) {
      return "Anchor";
    }
    return slot === 3 ? "Pickup" : "Kick pocket";
  }
  if (lane === "hat") {
    if (repeat > 1) {
      return "Hat roll";
    }
    return step % 2 === 0 ? "Pulse" : "Offbeat";
  }
  return slot === 3 ? "Pickup" : step % 2 === 0 ? "Texture" : "Syncopation";
}

function selectedNoteDegreeSummary(key: string, pitch: string): NoteDegreeSummary {
  const parts = pitchParts(pitch);
  if (!parts) {
    return {
      degreeLabel: "Out",
      roleLabel: "Outside scale",
      pitchLabel: pitch,
      inKey: false
    };
  }

  const degree = keyCompassScaleDegree(key, parts.name);
  if (degree === null) {
    return {
      degreeLabel: "Out",
      roleLabel: "Outside scale",
      pitchLabel: `${parts.name}${parts.octave}`,
      inKey: false
    };
  }

  return {
    degreeLabel: `D${degree + 1}`,
    roleLabel: scaleDegreeRoleLabel(degree),
    pitchLabel: `${parts.name}${parts.octave}`,
    inKey: true
  };
}

function scaleDegreeRoleLabel(degree: number): string {
  return ["Root", "Step", "Color", "Lift", "Anchor", "Mood", "Lead"][degree] ?? "Scale";
}

function selectedChordHarmonicSummary(key: string, chord: ChordEvent): ChordHarmonicSummary {
  const inversion = chordInversions.includes(chord.inversion) ? chord.inversion : 0;
  const detailLabel = `${chord.root}${chord.quality} / ${chordInversionLabel(inversion)}`;
  const degree = keyCompassScaleDegree(key, chord.root);
  if (degree === null) {
    return {
      degreeLabel: "Out",
      romanLabel: "Out",
      roleLabel: "Outside key",
      detailLabel,
      inKey: false
    };
  }

  return {
    degreeLabel: `D${degree + 1}`,
    romanLabel: romanChordLabel(degree, chord.quality),
    roleLabel: chordDegreeRoleLabel(degree),
    detailLabel,
    inKey: true
  };
}

function romanChordLabel(degree: number, quality: ChordQuality): string {
  const base = ["I", "II", "III", "IV", "V", "VI", "VII"][degree] ?? "I";
  if (quality === "min") {
    return base.toLowerCase();
  }
  if (quality === "m7") {
    return `${base.toLowerCase()}7`;
  }
  if (quality === "dim") {
    return `${base.toLowerCase()}dim`;
  }
  if (quality === "7") {
    return `${base}7`;
  }
  if (quality === "sus2" || quality === "sus4") {
    return `${base}${quality}`;
  }
  return base;
}

function chordDegreeRoleLabel(degree: number): string {
  return ["Home", "Step", "Color", "Lift", "Tension", "Mood", "Lead"][degree] ?? "Function";
}

function keyCompassScaleDegree(key: string, pitchName: string): number | null {
  const scaleNotes = scalePitchNames(key);
  const normalizedPitchName = normalizePitchNameForCompass(pitchName);
  const index = scaleNotes.findIndex((note) => normalizePitchNameForCompass(note) === normalizedPitchName);
  return index >= 0 ? index : null;
}

function normalizePitchNameForCompass(pitchName: string): string {
  const enharmonic: Record<string, string> = {
    Db: "C#",
    Eb: "D#",
    Gb: "F#",
    Ab: "G#",
    Bb: "A#"
  };
  return enharmonic[pitchName] ?? pitchName;
}
