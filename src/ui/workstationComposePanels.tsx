import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Copy, Drum, ListChecks, Music2, Play, Plus, SlidersHorizontal, Trash2, Waves } from "lucide-react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { BassNote, ChordEvent, ChordProgressionPreset, ChordQuality, DrumLane, MelodyNote, NoteTrack, PatternSlot, PatternVariationPreset, ProjectState, SoundDesign } from "../domain/workstation";
import { chordInversions, chordInversionLabel, chordProgressionPresetIds, chordProgressionPresetLabel, chordQualities, drumStepProbability, drumStepTimingMs, drumStepVelocity, hatRepeatCount, maxDrumTimingMs, minDrumTimingMs, normalizeChordInversion, normalizeDrumProbability, normalizeDrumTimingMs, normalizeDrumVelocity, normalizeEventProbability, normalizeHatRepeat, scalePitchNames, soundPresetIds, soundPresetLabel, steps } from "../domain/workstation";
import type { BassContourId, BassContourOption, BassGlidePadId, BassGlidePadOption, BassMovePreviewSummary, BassMoveResult, BasslinePadId, BasslinePadOption, ChordClipboard, ChordHarmonicSummary, ChordMovePreviewSummary, ChordMoveResult, ChordPadId, ChordPadOption, ChordRhythmId, ChordRhythmOption, ChordVoicingId, ChordVoicingOption, DrumAccentId, DrumAccentOption, DrumClipboard, DrumFoundationId, DrumFoundationOption, DrumKitPadId, DrumKitPadOption, DrumKitPreviewSummary, DrumKitResult, DrumMovePreviewSummary, DrumMoveResult, DrumPocketSummary, GrooveFeelId, GrooveFeelOption, KeyboardCaptureDefaults, KeyboardCaptureKeyMapItem, KeyboardCaptureStepMode, MelodyAccentId, MelodyAccentOption, MelodyContourId, MelodyContourOption, MelodyMovePreviewSummary, MelodyMoveResult, MelodyMotifId, MelodyMotifOption, MidiCaptureStatus, MidiCaptureSummary, MidiInputOption, NoteClipboard, NoteDegreeSummary, NoteView, PatternClonePadOption, PatternCloneResult, PatternFillPreviewSummary, PatternFillResult, PatternStackId, PatternStackOption, PatternStackPreviewSummary, PatternStackResult, PatternVariationPreviewSummary, PatternVariationResult, SelectedDrumStep, SelectedNote, SoundFocusPadId, SoundFocusPadOption, SoundFocusPreviewSummary, SoundFocusResult, SoundPresetPreviewSummary, SoundPresetResult, SoundPresetTarget, SwingFeelResult } from "./workstationUiModel";
import { drumLabels, keyboardCaptureKeyLabels } from "./workstationUiModel";
import { chanceBadgeLabel, clampStepStart, compactChanceBadgeLabel, nextEmptyChordStep, percentLabel, pitchParts, timingLabel, trackOctaveRange } from "./workstationPatternTools";

export function DrumStepInspector({
  selectedStep,
  drumClipboard,
  active,
  velocity,
  timingMs,
  probability,
  hatRepeat,
  onVelocityChange,
  onProbabilityChange,
  onTimingChange,
  onHatRepeatChange,
  onAudition,
  onCopy,
  onPaste
}: {
  selectedStep: SelectedDrumStep | null;
  drumClipboard: DrumClipboard | null;
  active: boolean;
  velocity?: number;
  timingMs: number;
  probability?: number;
  hatRepeat: number;
  onVelocityChange: (velocity: number) => void;
  onProbabilityChange: (probability: number) => void;
  onTimingChange: (timingMs: number) => void;
  onHatRepeatChange: (repeat: number) => void;
  onAudition: () => void;
  onCopy: () => void;
  onPaste: () => void;
}): ReactElement {
  const velocityValue = velocity ?? 0.75;
  const probabilityValue = probability ?? 1;
  const timingValue = normalizeDrumTimingMs(timingMs);
  const timingTextValue = `${timingValue}`;
  const [timingText, setTimingText] = useState(timingTextValue);
  const [isEditingTiming, setIsEditingTiming] = useState(false);
  const skipNextTimingBlurCommit = useRef(false);
  const label = selectedStep ? `${drumLabels[selectedStep.lane]} ${selectedStep.step + 1}` : "No step";
  const clipboardLabel = drumClipboard ? `${drumLabels[drumClipboard.lane]} ${drumClipboard.step + 1}` : "Empty";
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
    <div className="drum-step-inspector" aria-label="Drum step dynamics">
      <div className="inspector-heading">
        <span>Dynamics</span>
        <strong data-testid="drum-step-readout">
          {selectedStep
            ? `${label} ${active ? `${percentLabel(velocityValue)} / ${percentLabel(probabilityValue)} chance / ${timingLabel(timingValue)}` : "off"}`
            : "Select step"}
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
        <span>Velocity {active ? percentLabel(velocityValue) : "--"}</span>
        <div className="drum-value-row">
          <input
            aria-label="Drum velocity"
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
            aria-label="Drum velocity percent"
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
        <span>Chance {active ? percentLabel(probabilityValue) : "--"}</span>
        <div className="drum-value-row">
          <input
            aria-label="Drum probability"
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
            aria-label="Drum probability percent"
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
        <span>Timing {active ? timingLabel(timingValue) : "--"}</span>
        <div className="timing-row" aria-label="Drum timing">
          {[
            { label: "Early", timing: -15, testId: "drum-timing-early" },
            { label: "On", timing: 0, testId: "drum-timing-on" },
            { label: "Late", timing: 15, testId: "drum-timing-late" }
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
            aria-label="Drum timing milliseconds"
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
        <div className="repeat-row" aria-label="Hat repeat">
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
      <div className="drum-clipboard-row" aria-label="Drum hit clipboard">
        <button data-testid="drum-audition" disabled={!selectedStep || !active} onClick={onAudition} title="Audition selected drum hit" type="button">
          <Play size={14} aria-hidden="true" />
          <span>Audition</span>
        </button>
        <button data-testid="drum-copy" disabled={!selectedStep || !active} onClick={onCopy} title="Copy selected drum hit shape" type="button">
          <Copy size={14} aria-hidden="true" />
          <span>Copy</span>
        </button>
        <button data-testid="drum-paste" disabled={!drumClipboard} onClick={onPaste} title="Paste copied hit to the next empty step" type="button">
          <Plus size={14} aria-hidden="true" />
          <span>Paste</span>
        </button>
        <small data-testid="drum-clipboard-detail">{drumClipboard ? `Clipboard ${clipboardLabel}` : "Clipboard empty"}</small>
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
          <b>Audition</b>
          <em data-testid="swing-feel-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
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
  return (
    <div className="groove-feel-panel" data-testid="groove-feel-pads">
      <div className="groove-feel-heading">
        <span>Groove Feel</span>
        <strong>Timing + Chance</strong>
      </div>
      <div className="groove-feel-row" aria-label="Groove Feel Pads">
        {feels.map((feel) => (
          <button
            data-testid={`groove-feel-${feel.id}`}
            key={feel.id}
            onClick={() => onApply(feel.id)}
            title={`${feel.label} ${feel.timingPreview}`}
            type="button"
          >
            <span>{feel.label}</span>
            <strong>{feel.timingPreview}</strong>
            <small>{feel.chancePreview} / {feel.detail}</small>
          </button>
        ))}
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
  return (
    <div className="drum-accent-panel" data-testid="drum-accent-pads">
      <div className="drum-accent-heading">
        <span>Drum Accents</span>
        <strong>Velocity Shape</strong>
      </div>
      <div className="drum-accent-row" aria-label="Drum Accent Pads">
        {accents.map((accent) => (
          <button
            data-testid={`drum-accent-${accent.id}`}
            key={accent.id}
            onClick={() => onApply(accent.id)}
            title={`${accent.label} ${accent.preview}`}
            type="button"
          >
            <span>{accent.label}</span>
            <strong>{accent.preview}</strong>
            <small>{accent.detail}</small>
          </button>
        ))}
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
  return (
    <div className="bassline-pad-panel" data-testid="bassline-pads">
      <div className="bassline-pad-heading">
        <span>808 Basslines</span>
        <strong>Low end</strong>
      </div>
      <div className="bassline-pad-row" aria-label="808 Bassline Pads">
        {pads.map((pad) => (
          <button
            data-testid={`bassline-pad-${pad.id}`}
            key={pad.id}
            onClick={() => onApply(pad.id)}
            title={`${pad.label} ${pad.preview}`}
            type="button"
          >
            <span>{pad.label}</span>
            <strong>{pad.preview}</strong>
            <small>{pad.eventCount} notes / {pad.glideCount} glide / {pad.detail}</small>
          </button>
        ))}
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
  return (
    <div className="bass-glide-panel" data-testid="bass-glide-pads">
      <div className="bass-glide-heading">
        <span>808 Glide</span>
        <strong>Length + Chance</strong>
      </div>
      <div className="bass-glide-row" aria-label="808 Glide Pads">
        {pads.map((pad) => (
          <button
            data-testid={`bass-glide-${pad.id}`}
            key={pad.id}
            onClick={() => onApply(pad.id)}
            title={`${pad.label} ${pad.preview}`}
            type="button"
          >
            <span>{pad.label}</span>
            <strong>{pad.preview}</strong>
            <small>{pad.glideCount} glide / {pad.detail}</small>
          </button>
        ))}
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
        <span>808 Contour</span>
        <strong>Pitch Shape</strong>
      </div>
      <div className="bass-contour-row" aria-label="808 Contour Pads">
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
  return (
    <div className="melody-motif-panel" data-testid="melody-motif-pads">
      <div className="melody-motif-heading">
        <span>Melody Motifs</span>
        <strong>Synth</strong>
      </div>
      <div className="melody-motif-row" aria-label="Melody Motif Pads">
        {motifs.map((motif) => (
          <button
            data-testid={`melody-motif-${motif.id}`}
            key={motif.id}
            onClick={() => onApply(motif.id)}
            title={`${motif.label} ${motif.preview}`}
            type="button"
          >
            <span>{motif.label}</span>
            <strong>{motif.preview}</strong>
            <small>{motif.eventCount} notes / {motif.detail}</small>
          </button>
        ))}
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
  keyMap: KeyboardCaptureKeyMapItem[];
  selectedNote: SelectedNote | null;
  onDefaultsChange: (update: Partial<KeyboardCaptureDefaults>) => void;
  onEnabledChange: (enabled: boolean) => void;
  onStepModeChange: (mode: KeyboardCaptureStepMode) => void;
  onTargetChange: (target: NoteTrack) => void;
}): ReactElement {
  const selectedLabel = selectedNote
    ? `${selectedNote.track === "bass" ? "808" : "Synth"} ${selectedNote.pitch}.${selectedNote.step + 1}`
    : "None";
  const velocityPercent = Math.round(defaults.velocity * 100);
  const [minOctave, maxOctave] = trackOctaveRange(target);

  return (
    <div className="keyboard-capture" data-testid="keyboard-capture">
      <div className="keyboard-capture-heading">
        <div>
          <span>Keyboard Capture</span>
          <strong>{enabled ? "armed" : "off"}</strong>
        </div>
        <button
          aria-pressed={enabled}
          className={enabled ? "mini-toggle selected" : "mini-toggle"}
          data-testid="keyboard-capture-toggle"
          onClick={() => onEnabledChange(!enabled)}
          type="button"
        >
          {enabled ? "On" : "Off"}
        </button>
      </div>
      <div className="keyboard-capture-controls">
        <div className="capture-target-row" aria-label="Keyboard Capture target">
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
          <span>Next</span>
          <strong>{nextStep + 1}</strong>
        </div>
        <div className="capture-readout">
          <span>Step Mode</span>
          <strong>{stepMode === "next-free" ? "Next" : "Replace"}</strong>
        </div>
        <div className="capture-readout">
          <span>Selected</span>
          <strong>{selectedLabel}</strong>
        </div>
      </div>
      <div className="capture-step-mode-row" aria-label="Keyboard Capture step mode">
        <button
          aria-pressed={stepMode === "next-free"}
          className={stepMode === "next-free" ? "selected" : ""}
          data-testid="keyboard-capture-step-mode-next"
          onClick={() => onStepModeChange("next-free")}
          type="button"
        >
          <span>Next</span>
          <small>empty step</small>
        </button>
        <button
          aria-pressed={stepMode === "replace-selected"}
          className={stepMode === "replace-selected" ? "selected" : ""}
          data-testid="keyboard-capture-step-mode-replace"
          onClick={() => onStepModeChange("replace-selected")}
          type="button"
        >
          <span>Replace</span>
          <small>selected step</small>
        </button>
      </div>
      <div className="capture-defaults" aria-label="Keyboard Capture defaults">
        <label className="capture-default-field">
          <span>Octave</span>
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
          <span>Length</span>
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
          <span>Velocity</span>
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
            title="Toggle captured 808 glide"
            type="button"
          >
            Glide {defaults.glide ? "On" : "Off"}
          </button>
        )}
      </div>
      <div className="capture-key-map" aria-label="Keyboard Capture key map">
        {keyMap.map((item) => (
          <kbd
            className={item.pitch ? "" : "muted"}
            aria-label={`${keyboardCaptureKeyLabels[item.key]} ${item.pitch ?? "out of range"} ${item.degreeLabel ?? ""}`.trim()}
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
  const hasInputs = inputOptions.length > 0;
  const hasConnectedInput = inputOptions.some((input) => input.connected);
  const canArm = status !== "unsupported" && status !== "requesting" && status !== "denied" && hasConnectedInput;
  const targetLabel = target === "bass" ? "808" : "Synth";

  return (
    <div className={`midi-capture ${summary.tone}`} data-testid="midi-capture">
      <div className="midi-capture-heading">
        <div>
          <span>Web MIDI Input</span>
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
            {status === "requesting" ? "Requesting" : "Connect"}
          </button>
          <button
            className={armed ? "mini-toggle selected" : "mini-toggle"}
            aria-pressed={armed}
            data-testid="midi-capture-arm"
            disabled={!canArm}
            onClick={() => onArmChange(!armed)}
            type="button"
          >
            {armed ? "Armed" : "Arm"}
          </button>
        </div>
      </div>
      <div className="midi-capture-controls">
        <label className="midi-input-field">
          <span>Input</span>
          <select
            data-testid="midi-input-select"
            disabled={!hasInputs}
            value={selectedInputId}
            onChange={(event) => onInputChange(event.currentTarget.value)}
          >
            <option value="all">All connected inputs</option>
            {inputOptions.map((input) => (
              <option key={input.id} value={input.id}>
                {input.label}
              </option>
            ))}
          </select>
        </label>
        <div className="midi-capture-readout" data-testid="midi-capture-target">
          <span>Target</span>
          <strong>{targetLabel}</strong>
        </div>
        <div className="midi-capture-readout" data-testid="midi-capture-last-note">
          <span>Latest</span>
          <strong>{lastNoteLabel}</strong>
        </div>
        <button className="mini-toggle" data-testid="midi-capture-refresh" onClick={onRefresh} type="button">
          Refresh
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
  onToggle
}: {
  title: string;
  track: NoteTrack;
  notes: NoteView[];
  pitches: string[];
  color: string;
  currentStep: number | null;
  selectedNote: SelectedNote | null;
  onToggle: (step: number, pitch: string) => void;
}): ReactElement {
  const displayPitches = [...pitches].reverse();
  return (
    <div className="note-lane">
      <div className="lane-header">
        <span>{title}</span>
        <strong>{notes.length} events</strong>
      </div>
      <div className="piano-grid" style={{ "--note": color } as CSSProperties}>
        {displayPitches.map((pitch) => (
          <div className="piano-row" key={pitch}>
            <span>{pitch}</span>
            <div>
              {steps.map((step) => {
                const note = notes.find((candidate) => candidate.step === step && candidate.pitch === pitch);
                const selected =
                  selectedNote?.track === track && selectedNote.step === step && selectedNote.pitch === pitch;
                return (
                  <button
                    aria-label={`${title} ${pitch} step ${step + 1}${
                      note && note.probability !== undefined && note.probability < 1 ? ` ${chanceBadgeLabel(note.probability)} chance` : ""
                    }`}
                    aria-pressed={Boolean(note)}
                    className={["note", note ? "active" : "", currentStep === step ? "playhead" : "", selected ? "selected" : ""]
                      .filter(Boolean)
                      .join(" ")}
                    key={`${pitch}-${step}`}
                    onClick={() => onToggle(step, pitch)}
                    type="button"
                  >
                    {note && <span style={{ inlineSize: `${Math.min(100, note.length * 25)}%` }} />}
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
  onDuplicate
}: {
  currentKey: string;
  selectedNote: SelectedNote | null;
  noteClipboard: NoteClipboard | null;
  bassNote?: BassNote;
  melodyNote?: MelodyNote;
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
}): ReactElement {
  const activeNote = bassNote ?? melodyNote;
  const label = selectedNote ? `${selectedNote.track === "bass" ? "808" : "Synth"} ${selectedNote.pitch}.${selectedNote.step + 1}` : "None";
  const degreeSummary = selectedNote ? selectedNoteDegreeSummary(currentKey, selectedNote.pitch) : null;
  const clipboardLabel = noteClipboard
    ? `${noteClipboard.track === "bass" ? "808" : "Synth"} ${noteClipboard.note.pitch}.${noteClipboard.note.step + 1}`
    : "Empty";
  const probabilityValue = activeNote ? normalizeEventProbability(activeNote.probability) : 1;
  const velocityValue = activeNote?.velocity ?? 0.82;
  return (
    <div className="note-inspector">
      <div className="inspector-heading">
        <span>Selected</span>
        <strong>{activeNote ? `${label} / ${percentLabel(probabilityValue)} chance` : "None"}</strong>
      </div>
      {activeNote && (
        <>
          {degreeSummary && (
            <div className={degreeSummary.inKey ? "note-degree-readout" : "note-degree-readout warn"} data-testid="note-degree-readout">
              <span>Degree</span>
              <strong data-testid="note-degree-label">{degreeSummary.degreeLabel}</strong>
              <small data-testid="note-degree-role">
                {degreeSummary.roleLabel} / {degreeSummary.pitchLabel}
              </small>
            </div>
          )}
          <div className="note-action-row" aria-label="Selected note tools">
            <button data-testid="note-nudge-left" onClick={() => onStepMove(-1)} title="Move selected note one step left" type="button">
              <ArrowLeft size={14} aria-hidden="true" />
              <span>Step</span>
            </button>
            <button data-testid="note-nudge-right" onClick={() => onStepMove(1)} title="Move selected note one step right" type="button">
              <ArrowRight size={14} aria-hidden="true" />
              <span>Step</span>
            </button>
            <button data-testid="note-pitch-down" onClick={() => onPitchMove(-1)} title="Move selected note down in scale" type="button">
              <ArrowDown size={14} aria-hidden="true" />
              <span>Pitch</span>
            </button>
            <button data-testid="note-pitch-up" onClick={() => onPitchMove(1)} title="Move selected note up in scale" type="button">
              <ArrowUp size={14} aria-hidden="true" />
              <span>Pitch</span>
            </button>
            <button data-testid="note-octave-down" onClick={() => onOctaveMove(-1)} title="Move selected note down an octave" type="button">
              <ArrowDown size={14} aria-hidden="true" />
              <span>Oct</span>
            </button>
            <button data-testid="note-octave-up" onClick={() => onOctaveMove(1)} title="Move selected note up an octave" type="button">
              <ArrowUp size={14} aria-hidden="true" />
              <span>Oct</span>
            </button>
            <button data-testid="note-duplicate" onClick={onDuplicate} title="Duplicate selected note to the next empty step" type="button">
              <Copy size={14} aria-hidden="true" />
              <span>Dup</span>
            </button>
            <button data-testid="note-audition" onClick={onAudition} title="Audition selected 808 or Synth note" type="button">
              <Play size={14} aria-hidden="true" />
              <span>Aud</span>
            </button>
          </div>
          <div className="inspector-grid">
            <label>
              <span>Length</span>
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
                <span>Glide</span>
                <input type="checkbox" checked={bassNote.glide} onChange={(event) => onGlideChange(event.target.checked)} />
              </label>
            )}
            <label>
              <span>Velocity {percentLabel(velocityValue)}</span>
              <input
                aria-label="Note velocity"
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
              <span>Chance {percentLabel(probabilityValue)}</span>
              <input
                aria-label="Note probability"
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
              <span>Chance %</span>
              <input
                aria-label="Note probability percent"
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
      <div className="note-clipboard-row" aria-label="Note clipboard">
        <button data-testid="note-copy" disabled={!activeNote} onClick={onCopy} title="Copy selected note shape" type="button">
          <Copy size={14} aria-hidden="true" />
          <span>Copy</span>
        </button>
        <button data-testid="note-paste" disabled={!noteClipboard} onClick={onPaste} title="Paste copied note to the next empty step" type="button">
          <Plus size={14} aria-hidden="true" />
          <span>Paste</span>
        </button>
        <small data-testid="note-clipboard-detail">{noteClipboard ? `Clipboard ${clipboardLabel}` : "Clipboard empty"}</small>
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
  onApplyPreset,
  onDrumKitPad,
  onFocusPad,
  onPreviewPreset,
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
  onApplyPreset: (preset?: SoundPresetTarget) => void;
  onDrumKitPad: (pad: DrumKitPadId) => void;
  onFocusPad: (pad: SoundFocusPadId) => void;
  onPreviewPreset: (preset: SoundPresetTarget) => void;
  onChange: (update: Partial<Omit<SoundDesign, "preset">>) => void;
}): ReactElement {
  return (
    <div className="sound-designer">
      <div className="lane-header">
        <span>Tone</span>
        <strong data-testid="sound-preset-readout">{soundPresetLabel(sound.preset)}</strong>
      </div>
      <div className="sound-preset-row" aria-label="Sound presets">
        {soundPresetIds.map((preset) => (
          <button
            className={presetPreviewId === preset ? "selected" : sound.preset === preset ? "current" : ""}
            data-testid={`sound-preset-${preset}`}
            key={preset}
            onClick={() => onPreviewPreset(preset)}
            title={`Preview ${soundPresetLabel(preset)} sound preset`}
            type="button"
          >
            {soundPresetLabel(preset)}
          </button>
        ))}
      </div>
      <SoundPresetPreview summary={presetPreview} onApply={() => onApplyPreset(presetPreviewId)} />
      {presetResult && <SoundPresetResultStrip result={presetResult} />}
      <DrumKitPads pads={drumKitPads} preview={drumKitPreview} result={drumKitResult} onApply={onDrumKitPad} />
      <SoundFocusPads pads={focusPads} preview={focusPreview} result={focusResult} onApply={onFocusPad} />
      <div className="sound-readout" aria-label="Sound design state">
        <span data-testid="sound-kick-readout">Kick {percentLabel(sound.kickPunch)}</span>
        <span data-testid="sound-bass-readout">808 {percentLabel(sound.bassDrive)}</span>
        <span data-testid="sound-duck-readout">Duck {percentLabel(sound.sidechainDuck)}</span>
        <span data-testid="sound-synth-readout">Synth {percentLabel(sound.synthBrightness)}</span>
        <span data-testid="sound-chord-readout">Chord {percentLabel(sound.chordWarmth)}</span>
      </div>
      {mode === "studio" && (
        <div className="sound-control-grid">
          <SoundControl
            id="kick-punch"
            label="Kick punch"
            value={sound.kickPunch}
            onChange={(value) => onChange({ kickPunch: value })}
          />
          <SoundControl
            id="snare-snap"
            label="Snare snap"
            value={sound.snareSnap}
            onChange={(value) => onChange({ snareSnap: value })}
          />
          <SoundControl
            id="hat-brightness"
            label="Hat bright"
            value={sound.hatBrightness}
            onChange={(value) => onChange({ hatBrightness: value })}
          />
          <SoundControl
            id="bass-drive"
            label="808 drive"
            value={sound.bassDrive}
            onChange={(value) => onChange({ bassDrive: value })}
          />
          <SoundControl
            id="bass-decay"
            label="808 decay"
            value={sound.bassDecay}
            onChange={(value) => onChange({ bassDecay: value })}
          />
          <SoundControl
            id="sidechain-duck"
            label="Kick duck"
            value={sound.sidechainDuck}
            onChange={(value) => onChange({ sidechainDuck: value })}
          />
          <SoundControl
            id="synth-brightness"
            label="Synth bright"
            value={sound.synthBrightness}
            onChange={(value) => onChange({ synthBrightness: value })}
          />
          <SoundControl
            id="synth-release"
            label="Synth release"
            value={sound.synthRelease}
            onChange={(value) => onChange({ synthRelease: value })}
          />
          <SoundControl
            id="chord-warmth"
            label="Chord warm"
            value={sound.chordWarmth}
            onChange={(value) => onChange({ chordWarmth: value })}
          />
          <SoundControl
            id="chord-width"
            label="Chord width"
            value={sound.chordWidth}
            onChange={(value) => onChange({ chordWidth: value })}
          />
        </div>
      )}
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
        Apply
      </button>
    </div>
  );
}

export function SoundPresetResultStrip({ result }: { result: SoundPresetResult }): ReactElement {
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
          <b>Audition</b>
          <em data-testid="sound-preset-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
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
  return (
    <div className="drum-kit-panel" data-testid="drum-kit-pads">
      <div className="drum-kit-heading">
        <span>Drum Kit</span>
        <strong>Kick / Clap / Hat</strong>
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
      <div className="drum-kit-row" aria-label="Drum Kit Pads">
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
            <small>{pad.changedCount} moves / {pad.detail}</small>
          </button>
        ))}
      </div>
      {result && <DrumKitResultStrip result={result} />}
    </div>
  );
}

export function DrumKitResultStrip({ result }: { result: DrumKitResult }): ReactElement {
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
          <b>Audition</b>
          <em data-testid="drum-kit-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
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
  return (
    <div className="sound-focus-panel" data-testid="sound-focus-pads">
      <div className="sound-focus-heading">
        <span>Sound Focus</span>
        <strong>Tone posture</strong>
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
      {result && <SoundFocusResultStrip result={result} />}
      <div className="sound-focus-row" aria-label="Sound Focus Pads">
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
            <small>{pad.changedCount} moves / {pad.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SoundFocusResultStrip({ result }: { result: SoundFocusResult }): ReactElement {
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
          <b>Audition</b>
          <em data-testid="sound-focus-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="sound-focus-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function SoundControl({
  id,
  label,
  value,
  onChange
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}): ReactElement {
  const percentValue = `${Math.round(value * 100)}`;
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
    <label className="sound-control">
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
          aria-label={`${label} percent`}
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
    </label>
  );
}

export function ChordEditor({
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
  onAdd,
  onChange,
  onCopy,
  onDelete,
  onDuplicate,
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
  onAdd: () => void;
  onChange: (index: number, update: Partial<ChordEvent>) => boolean;
  onCopy: () => void;
  onDelete: (index: number) => boolean;
  onDuplicate: () => void;
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
  const selectedChord = selectedIndex === null ? undefined : chords[selectedIndex];
  const selectedInversion = selectedChord ? normalizeChordInversion(selectedChord.inversion) : 0;
  const harmonicSummary = selectedChord ? selectedChordHarmonicSummary(currentKey, selectedChord) : null;
  const chordClipboardLabel = chordClipboard ? `${chordClipboard.root}${chordClipboard.quality}.${chordClipboard.step + 1}` : "Empty";
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
        <span>Chords</span>
        <strong>{chords.length} events</strong>
      </div>
      <div className="chord-tools" aria-label="Chord progression tools">
        <div className="chord-preset-row" aria-label="Chord progression presets">
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
        <button data-testid="chord-add" onClick={onAdd} title="Add chord event" type="button">
          <Plus size={14} aria-hidden="true" />
          <span>Add chord</span>
        </button>
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
      <div className="chord-pad-row" aria-label="Chord Pads">
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
          <span>Chord Rhythm</span>
          <strong>Length + Chance</strong>
        </div>
        <div className="chord-rhythm-row" aria-label="Chord Rhythm Pads">
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
              <small>{rhythm.chanceCount} chance edit / {rhythm.detail}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="chord-voicing-panel" data-testid="chord-voicing-pads">
        <div className="chord-voicing-heading">
          <span>Chord Voicing</span>
          <strong>Color + Shape</strong>
        </div>
        <div className="chord-voicing-row" aria-label="Chord Voicing Pads">
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
      {harmonicSummary && (
        <div className={harmonicSummary.inKey ? "chord-harmonic-readout" : "chord-harmonic-readout warn"} data-testid="chord-harmonic-readout">
          <span>Function</span>
          <strong data-testid="chord-harmonic-label">{harmonicSummary.romanLabel}</strong>
          <small data-testid="chord-harmonic-role">
            {harmonicSummary.degreeLabel} / {harmonicSummary.roleLabel} / {harmonicSummary.detailLabel}
          </small>
        </div>
      )}
      <div className="chord-edit-row" aria-label="Selected chord edit tools">
        <button
          data-testid="chord-audition"
          disabled={!selectedChord}
          onClick={onAudition}
          title="Audition selected chord"
          type="button"
        >
          <Play size={13} aria-hidden="true" />
          <span>Aud</span>
        </button>
        <button
          data-testid="chord-move-left"
          disabled={!canMoveLeft}
          onClick={() => onMoveStep(-1)}
          title="Move selected chord left"
          type="button"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          <span>Step</span>
        </button>
        <button
          data-testid="chord-move-right"
          disabled={!canMoveRight}
          onClick={() => onMoveStep(1)}
          title="Move selected chord right"
          type="button"
        >
          <ArrowRight size={13} aria-hidden="true" />
          <span>Step</span>
        </button>
        <button
          data-testid="chord-duplicate"
          disabled={!canDuplicate}
          onClick={onDuplicate}
          title="Duplicate selected chord to the next empty step"
          type="button"
        >
          <Copy size={13} aria-hidden="true" />
          <span>Dup</span>
        </button>
        <button
          data-testid="chord-invert-down"
          disabled={!selectedChord || selectedInversion <= 0}
          onClick={() => onInvert(-1)}
          title="Move selected chord voicing down"
          type="button"
        >
          <ArrowDown size={13} aria-hidden="true" />
          <span>Voice</span>
        </button>
        <button
          data-testid="chord-invert-up"
          disabled={!selectedChord || selectedInversion >= chordInversions[chordInversions.length - 1]}
          onClick={() => onInvert(1)}
          title="Move selected chord voicing up"
          type="button"
        >
          <ArrowUp size={13} aria-hidden="true" />
          <span>Voice</span>
        </button>
      </div>
      <div className="chord-clipboard-row" aria-label="Chord clipboard">
        <button data-testid="chord-copy" disabled={!selectedChord} onClick={onCopy} title="Copy selected chord shape" type="button">
          <Copy size={13} aria-hidden="true" />
          <span>Copy</span>
        </button>
        <button data-testid="chord-paste" disabled={!canPaste} onClick={onPaste} title="Paste copied chord to the next empty step" type="button">
          <Plus size={13} aria-hidden="true" />
          <span>Paste</span>
        </button>
        <small data-testid="chord-clipboard-detail">{chordClipboard ? `Clipboard ${chordClipboardLabel}` : "Clipboard empty"}</small>
      </div>
      <div className="chord-slots">
        {chords.map((chord, index) => {
          const selected = selectedIndex === index;
          const playing = currentStep !== null && currentStep >= chord.step && currentStep < chord.step + chord.length;
          return (
            <div
              aria-current={playing ? "step" : undefined}
              aria-label={`Chord ${index + 1} ${chord.root}${chord.quality} step ${chord.step + 1}`}
              className={["chord-slot", selected ? "selected" : "", playing ? "playing" : ""].filter(Boolean).join(" ")}
              data-playing={playing ? "true" : "false"}
              data-testid={`chord-slot-${index}`}
              key={`${chord.step}-${index}`}
              onClick={() => onSelect(index)}
              onFocusCapture={() => onSelect(index)}
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
                  title="Delete chord event"
                  type="button"
                >
                  <Trash2 size={13} aria-hidden="true" />
                </button>
              </div>
              <label>
                <span>Step</span>
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
                <span>Root</span>
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
                <span>Quality</span>
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
                <span>Voicing {chordInversionLabel(normalizeChordInversion(chord.inversion))}</span>
                <div className="chord-inversion-row" aria-label={`Chord ${index + 1} inversion`}>
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
                <span>Length {chord.length}</span>
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
                    aria-label={`Chord ${index + 1} length`}
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
                <span>Velocity {Math.round(chord.velocity * 100)}%</span>
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
                    aria-label={`Chord ${index + 1} velocity percent`}
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
                <span>Chance {percentLabel(chord.probability)}</span>
                <div className="chord-value-inputs">
                  <input
                    aria-label={`Chord ${index + 1} probability`}
                    data-testid={`chord-probability-${index}`}
                    max={1}
                    min={0}
                    onChange={(event) => onChange(index, { probability: Number(event.target.value) })}
                    step={0.01}
                    type="range"
                    value={normalizeEventProbability(chord.probability)}
                  />
                  <input
                    aria-label={`Chord ${index + 1} probability percent`}
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
          );
        })}
      </div>
    </div>
  );
}

export function ChordMoveResultStrip({ result }: { result: ChordMoveResult }): ReactElement {
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
          <b>Audition</b>
          <em data-testid="chord-move-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
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
