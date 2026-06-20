import {
  ArrowRight,
  CircleHelp,
  Copy,
  KeyboardMusic,
  Pin,
  PinOff,
  Play,
  Save,
  Search,
  Target,
  Trash2,
  Undo2,
  X
} from "lucide-react";
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import type { PatternSlot, ProjectState } from "../domain/workstation";
import { arrangementTotalBars, maxProjectSnapshotNameLength, maxProjectSnapshots, projectSnapshotSummary } from "../domain/workstation";
import type { PlaybackMode } from "../audio/scheduler";
import type {
  BeatReadinessCheck,
  BeatReadinessCheckId,
  BeatReadinessFocusResult,
  BeatReadinessFocusSummary,
  LayerStarterId,
  LayerStarterOption,
  LayerStarterPrioritySummary,
  LocalDraftRecovery,
  PatternCompareDecisionSummary,
  PatternCompareSummary,
  QuickAction,
  QuickActionRecent,
  QuickActionResult,
  QuickActionScopeId,
  QuickActionScopeOption,
  QuickActionSpotlightSummary,
  SnapshotCompareFocusId,
  SnapshotCompareFocusItem,
  SnapshotCompareFocusResult,
  SnapshotCompareFocusSummary,
  SnapshotCompareSummary,
  SnapshotSlotRoleSummary
} from "./workstationUiModel";
import { beatReadinessPriorityCheck, layerStarterPriorityOption, maxQuickActionPins, snapshotCompareFocusItem } from "./workstationUiModel";
import { barCountLabel, formatLocalDraftSavedAt } from "./workstationPatternTools";

function quickActionGuideSuggestionReason(detail: string): string {
  const parts = detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
  const reasonParts = parts.slice(1);

  return reasonParts.length > 0 ? `Why now: ${reasonParts.join(" / ")}` : "Why now: current guide target";
}

function quickActionGuideSuggestionTarget(title: string, detail: string): string {
  const titleTarget = title.includes(":") ? title.split(":").slice(1).join(":").trim() : "";

  if (titleTarget) {
    return `Target: ${titleTarget}`;
  }

  const detailParts = detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
  return `Target: ${detailParts[1] ?? detailParts[0] ?? "Guide"}`;
}

function quickActionGuideSuggestionMetric(detail: string): string {
  const detailParts = detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
  const metricParts = detailParts.slice(-2);

  return metricParts.length > 0 ? `Metric: ${metricParts.join(" / ")}` : "Metric: current guide signal";
}

function quickActionGuideSuggestionAfterRun(detail: string): string {
  const source = detail.split(" / ")[0]?.trim();

  switch (source) {
    case "First Beat Path":
      return "After run: inspect the focused path step before editing.";
    case "Session Pass":
      return "After run: review the focused pass before choosing a fix.";
    case "Workflow Spotlight":
      return "After run: check the highlighted workflow zone before changing the beat.";
    default:
      return "After run: inspect the focused guide target before editing.";
  }
}

function quickActionPinnedInspectorTarget(action: QuickAction): string {
  const detailTarget = action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean)[0];

  return `Target: ${detailTarget ?? action.title}`;
}

function quickActionRecentInspectorTarget(action: QuickAction): string {
  const detailTarget = action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean)[0];

  return `Target: ${detailTarget ?? action.title}`;
}

function quickActionRecentInspectorResult(recent: QuickActionRecent): string {
  return `Last result: ${recent.status}`;
}

type CommandReferenceItem = {
  id: string;
  command: string;
  shortcut: string;
  target: string;
};

type CommandReferenceSection = {
  id: string;
  title: string;
  items: CommandReferenceItem[];
};

type CommandReferenceFilterId =
  | "all"
  | "desktop-shortcuts"
  | "project-edit"
  | "guide-fast-path"
  | "compose-fast-path"
  | "sound-fast-path"
  | "arrange-fast-path"
  | "mix-fast-path"
  | "finish-fast-path"
  | "deliver-fast-path"
  | "beat-terms";

type CommandReferenceFilterOption = {
  id: CommandReferenceFilterId;
  label: string;
};

type BeatTermItem = {
  id: string;
  term: string;
  meaning: string;
  target: string;
};

type CommandReferenceSearchSpotlight = {
  id: string;
  status: string;
  label: string;
  detail: string;
  context: string;
  title: string;
};

const commandReferenceSections: CommandReferenceSection[] = [
  {
    id: "desktop-shortcuts",
    title: "Desktop",
    items: [
      { id: "reference", command: "Command Reference", shortcut: "? / CmdOrCtrl+/", target: "Help" },
      { id: "actions", command: "Quick Actions", shortcut: "CmdOrCtrl+K", target: "Command palette" },
      { id: "playback", command: "Play / Stop", shortcut: "Space", target: "Selected loop" },
      { id: "patterns", command: "Pattern A/B/C", shortcut: "1 / 2 / 3", target: "Edit focus" },
      { id: "delete", command: "Delete selected event", shortcut: "Backspace / Delete", target: "Selected event" }
    ]
  },
  {
    id: "project-edit",
    title: "Project",
    items: [
      { id: "save", command: "Save project", shortcut: "CmdOrCtrl+S", target: ".grooveforge.json" },
      { id: "open", command: "Open project", shortcut: "CmdOrCtrl+O", target: "Project file" },
      { id: "project-safety-readout", command: "Project Safety Readout", shortcut: "Readout", target: "Draft / file / unsaved edits" },
      { id: "project-file-result", command: "Project File Result", shortcut: "Result", target: "Save / open feedback" },
      { id: "restore-draft", command: "Restore Draft", shortcut: "Quick Actions", target: "Local recovery" },
      { id: "clear-draft", command: "Clear Draft", shortcut: "Quick Actions", target: "Local recovery" },
      { id: "undo", command: "Undo", shortcut: "CmdOrCtrl+Z", target: "Edit history" },
      { id: "redo", command: "Redo", shortcut: "Shift+CmdOrCtrl+Z / CmdOrCtrl+Y", target: "Edit history" }
    ]
  },
  {
    id: "guide-fast-path",
    title: "Guide",
    items: [
      { id: "guide-quick-start", command: "Guide Quick Start", shortcut: "Quick Actions", target: "Current path / session / workflow target" },
      { id: "first-beat-path", command: "First Beat Path", shortcut: "Quick Actions", target: "Setup / compose / arrange / mix / deliver" },
      { id: "beat-spine", command: "Beat Spine", shortcut: "Quick Actions", target: "Setup / drums / 808 / sound / finish" },
      { id: "mode-focus", command: "Mode Focus", shortcut: "Quick Actions", target: "Guided / Studio orientation" },
      { id: "mode-switch", command: "Mode Switch", shortcut: "Quick Actions", target: "Guided / Studio mode" },
      { id: "session-pass", command: "Session Pass", shortcut: "Quick Actions", target: "Setup / risk / delivery" },
      { id: "session-brief-compass", command: "Session Brief Compass", shortcut: "Quick Actions", target: "Direction / reference / handoff" },
      { id: "composer-guide", command: "Composer Guide", shortcut: "Quick Actions", target: "Drums / 808 / harmony / melody" },
      { id: "key-compass", command: "Key Compass", shortcut: "Quick Actions", target: "Scale / cadence / chords" },
      { id: "groove-compass", command: "Groove Compass", shortcut: "Quick Actions", target: "Pocket / timing / anchors" },
      { id: "listening-pass", command: "Listening Pass", shortcut: "Quick Actions", target: "Compose / arrange / mix / deliver" },
      { id: "beat-passport", command: "Beat Passport", shortcut: "Quick Actions", target: "Identity / readiness / export" },
      { id: "production-snapshot", command: "Production Snapshot", shortcut: "Quick Actions", target: "Target / form / mix / handoff" },
      { id: "beat-readiness", command: "Beat Readiness", shortcut: "Quick Actions", target: "Drums / 808 / melody / export" },
      { id: "review-queue", command: "Review Queue", shortcut: "Quick Actions", target: "Issues / focus / fixes" },
      { id: "workflow-navigator", command: "Workflow Navigator", shortcut: "Quick Actions", target: "Stage jumps" },
      { id: "workflow-spotlight", command: "Workflow Spotlight", shortcut: "Readout", target: "Current command target" },
      { id: "next-move", command: "Next Move", shortcut: "Quick Actions", target: "One explicit next step" }
    ]
  },
  {
    id: "compose-fast-path",
    title: "Create",
    items: [
      { id: "keyboard-capture", command: "Keyboard Capture", shortcut: "Quick Actions", target: "808 / Synth notes" },
      { id: "capture-step-mode", command: "Capture Step Mode", shortcut: "Quick Actions", target: "Next / Replace" },
      { id: "midi-input", command: "MIDI Input", shortcut: "Quick Actions", target: "Controller notes" },
      { id: "editor-audition", command: "Editor Audition", shortcut: "Quick Actions", target: "Selected events" },
      { id: "blueprints", command: "Beat Blueprints", shortcut: "Quick Actions", target: "Sample-free starts" },
      { id: "composer-actions", command: "Composer Actions", shortcut: "Quick Actions", target: "Guided writing moves" },
      { id: "style-goal-cues", command: "Style Goal Cues", shortcut: "Quick Actions", target: "Pattern / Song loop" },
      { id: "style-goal-actions", command: "Style Goal Actions", shortcut: "Quick Actions", target: "Drums / 808 / Harmony / Melody" },
      { id: "layer-starter", command: "Layer Starter", shortcut: "Quick Actions", target: "Drums / 808 / Chords / Synth" },
      { id: "pattern-stack", command: "Pattern Stack", shortcut: "Quick Actions", target: "808 / chords / synth sketch" },
      { id: "pattern-compare", command: "Pattern Compare", shortcut: "Quick Actions", target: "Cue / use Pattern A/B/C" },
      { id: "pattern-compare-decision", command: "Pattern Compare Decision", shortcut: "Quick Actions", target: "Current Cue / Use recommendation" },
      { id: "pattern-variation", command: "Pattern Variation", shortcut: "Quick Actions", target: "Hook / breakdown variation" },
      { id: "pattern-fill", command: "Pattern Fill", shortcut: "Quick Actions", target: "Tail moves" },
      { id: "pattern-clone", command: "Pattern Clone", shortcut: "Quick Actions", target: "Clone to A/B/C" },
      { id: "pattern-copy-clear", command: "Pattern Copy / Clear", shortcut: "Quick Actions", target: "Copy / reset Patterns" },
      { id: "drum-move", command: "Drum Move", shortcut: "Quick Actions", target: "Foundation / feel / accent" },
      { id: "808-move", command: "808 Move", shortcut: "Quick Actions", target: "Bassline / glide / contour" },
      { id: "melody-move", command: "Melody Move", shortcut: "Quick Actions", target: "Motif / accent / contour" },
      { id: "chord-move", command: "Chord Move", shortcut: "Quick Actions", target: "Pads / rhythm / voicing" },
      { id: "selected-event-tools", command: "Selected Event Tools", shortcut: "Quick Actions", target: "Drum / note / chord edits" },
      { id: "pattern-playback-readout", command: "Pattern Playback Readout", shortcut: "Readout", target: "Edit vs heard Pattern" },
      { id: "audible-pattern-follow", command: "Audible Pattern Follow", shortcut: "Quick Actions", target: "Heard Pattern" }
    ]
  },
  {
    id: "sound-fast-path",
    title: "Sound",
    items: [
      { id: "sound-preset", command: "Sound Preset", shortcut: "Quick Actions", target: "Full-tone presets" },
      { id: "drum-kit", command: "Drum Kit", shortcut: "Quick Actions", target: "Kick / clap / hat tone" },
      { id: "sound-focus", command: "Sound Focus", shortcut: "Quick Actions", target: "808 / Synth / Chords" },
      { id: "timbre-check", command: "Timbre Check", shortcut: "Readout", target: "Drums / 808 / air / width" },
      { id: "sound-snapshot-ab", command: "Sound Snapshot A/B", shortcut: "Quick Actions", target: "Tone-pass compare" },
      { id: "space-fx", command: "Space FX", shortcut: "Quick Actions", target: "Dry / room / wide / wash" }
    ]
  },
  {
    id: "arrange-fast-path",
    title: "Arrange",
    items: [
      { id: "pattern-chain", command: "Pattern Chain", shortcut: "Quick Actions", target: "8-bar sketch" },
      { id: "chain-expand", command: "Chain Expand", shortcut: "Quick Actions", target: "16-bar outline" },
      { id: "arrangement-template", command: "Arrangement Template", shortcut: "Quick Actions", target: "Song form" },
      { id: "arrangement-arc", command: "Arrangement Arc", shortcut: "Quick Actions", target: "Energy shape" },
      { id: "arrangement-focus", command: "Arrangement Focus", shortcut: "Quick Actions", target: "Selected block" },
      { id: "arrangement-move", command: "Arrangement Move", shortcut: "Quick Actions", target: "Drop / build / hook lift" },
      { id: "section-locator", command: "Section Locator", shortcut: "Quick Actions", target: "Intro / verse / hook" },
      { id: "song-form-overview", command: "Song Form Overview", shortcut: "Readout", target: "Sections / patterns" },
      { id: "arrangement-mute-map", command: "Arrangement Mute Map", shortcut: "Quick Actions", target: "Layer dropouts" },
      { id: "arrangement-transition-map", command: "Arrangement Transition Map", shortcut: "Quick Actions", target: "Section handoffs" },
      { id: "arrangement-playback-readout", command: "Arrangement Playback Readout", shortcut: "Readout", target: "Edit vs heard Block" },
      { id: "audible-arrangement-follow", command: "Audible Arrangement Follow", shortcut: "Quick Actions", target: "Heard Block" }
    ]
  },
  {
    id: "mix-fast-path",
    title: "Mix",
    items: [
      { id: "stem-audition-readout", command: "Stem Audition Readout", shortcut: "Readout", target: "Full Mix / stems" },
      { id: "stem-audition", command: "Stem Audition", shortcut: "Quick Actions", target: "Full Mix / Drums / 808 / Synth / Chords" },
      { id: "mix-balance", command: "Mix Balance", shortcut: "Quick Actions", target: "Rough balance pads" },
      { id: "mix-coach", command: "Mix Coach", shortcut: "Quick Actions", target: "Headroom / balance" }
    ]
  },
  {
    id: "finish-fast-path",
    title: "Finish",
    items: [
      { id: "master-finish", command: "Master Finish", shortcut: "Quick Actions", target: "Output posture" },
      { id: "master-automation", command: "Master Automation", shortcut: "Quick Actions", target: "Fade in / out" },
      { id: "handoff-pack", command: "Handoff Pack", shortcut: "Quick Actions", target: "WAV / stems / MIDI / sheet" }
    ]
  },
  {
    id: "deliver-fast-path",
    title: "Deliver",
    items: [
      { id: "export-format-readout", command: "Export Format Readout", shortcut: "Readout", target: "WAV / stems / MIDI / sheet" },
      { id: "handoff-package-check", command: "Handoff Package Check", shortcut: "Quick Actions", target: "File set / send order" },
      { id: "handoff-next-export", command: "Handoff Next Export", shortcut: "Quick Actions", target: "Next deliverable" },
      { id: "direct-exports", command: "Direct Exports", shortcut: "Quick Actions", target: "WAV / stems / MIDI / sheet" }
    ]
  }
];

const beatTermItems: BeatTermItem[] = [
  { id: "pattern", term: "Pattern", meaning: "A/B/C loop with editable drum, 808, chord, and synth events.", target: "Compose" },
  { id: "drums", term: "Drums", meaning: "Kick, clap/snare, hats, perc, timing, chance, and pocket.", target: "Groove" },
  { id: "bass-808", term: "808/Bass", meaning: "Synth low-end notes with glide, drive, decay, and kick duck.", target: "Low end" },
  { id: "chords", term: "Chords", meaning: "Harmony bed, cadence, voicing, rhythm, velocity, and chance.", target: "Harmony" },
  { id: "sound", term: "Sound", meaning: "Preset, kit, focus, timbre, and A/B tone passes.", target: "Tone" },
  { id: "arrangement", term: "Arrangement", meaning: "Song sections, pattern blocks, energy, mutes, and transitions.", target: "Song" },
  { id: "mix-master", term: "Mix / Master", meaning: "Channel balance, space, headroom, dynamics, fades, and output.", target: "Finish" },
  { id: "handoff", term: "Handoff", meaning: "WAV, stems, MIDI, session notes, target, and delivery order.", target: "Deliver" }
];

const commandReferenceFilterOptions: CommandReferenceFilterOption[] = [
  { id: "all", label: "All" },
  { id: "desktop-shortcuts", label: "Desktop" },
  { id: "project-edit", label: "Project" },
  { id: "guide-fast-path", label: "Guide" },
  { id: "compose-fast-path", label: "Create" },
  { id: "sound-fast-path", label: "Sound" },
  { id: "arrange-fast-path", label: "Arrange" },
  { id: "mix-fast-path", label: "Mix" },
  { id: "finish-fast-path", label: "Finish" },
  { id: "deliver-fast-path", label: "Deliver" },
  { id: "beat-terms", label: "Beat Terms" }
];

function commandReferenceFilterCount(filterId: CommandReferenceFilterId): number {
  if (filterId === "all") {
    return commandReferenceSections.reduce((total, section) => total + section.items.length, beatTermItems.length);
  }
  if (filterId === "beat-terms") {
    return beatTermItems.length;
  }
  return commandReferenceSections.find((section) => section.id === filterId)?.items.length ?? 0;
}

function commandReferenceMatchesQuery(values: string[], query: string): boolean {
  if (!query) {
    return true;
  }
  return values.some((value) => value.toLocaleLowerCase().includes(query));
}

function commandReferenceItemMatchesQuery(section: CommandReferenceSection, item: CommandReferenceItem, query: string): boolean {
  return commandReferenceMatchesQuery([section.title, item.command, item.shortcut, item.target], query);
}

function beatTermMatchesQuery(item: BeatTermItem, query: string): boolean {
  return commandReferenceMatchesQuery([item.term, item.meaning, item.target], query);
}

function createCommandReferenceSearchSpotlight(
  visibleSections: CommandReferenceSection[],
  visibleBeatTerms: BeatTermItem[],
  query: string
): CommandReferenceSearchSpotlight | null {
  const hasSearchQuery = query.length > 0;
  const firstSection = visibleSections[0];
  const firstCommand = firstSection?.items[0] ?? null;

  if (firstSection && firstCommand) {
    const status = hasSearchQuery ? "Top command match" : "First visible command";
    const detail = `${firstSection.title} / ${firstCommand.shortcut}`;
    const context = firstCommand.target;

    return {
      id: `command-${firstCommand.id}`,
      status,
      label: firstCommand.command,
      detail,
      context,
      title: `${status}: ${firstCommand.command} / ${detail} / ${context}`
    };
  }

  const firstTerm = visibleBeatTerms[0] ?? null;

  if (firstTerm) {
    const status = hasSearchQuery ? "Top Beat Terms match" : "First visible Beat Term";
    const detail = `Beat Terms / ${firstTerm.target}`;
    const context = firstTerm.meaning;

    return {
      id: `term-${firstTerm.id}`,
      status,
      label: firstTerm.term,
      detail,
      context,
      title: `${status}: ${firstTerm.term} / ${detail} / ${context}`
    };
  }

  return null;
}

export function PanelTitle({ icon, title, meta }: { icon: ReactNode; title: string; meta: string }): ReactElement {
  return (
    <div className="panel-title">
      <div>
        {icon}
        <h2>{title}</h2>
      </div>
      <span>{meta}</span>
    </div>
  );
}

export function PatternCompareStrip({
  onCue,
  onUse,
  playbackMode,
  selectedBlockPattern,
  selectedPattern,
  summaries
}: {
  onCue: (pattern: PatternSlot) => void;
  onUse: (pattern: PatternSlot) => void;
  playbackMode: PlaybackMode;
  selectedBlockPattern: PatternSlot;
  selectedPattern: PatternSlot;
  summaries: PatternCompareSummary[];
}): ReactElement {
  return (
    <div className="pattern-compare" data-testid="pattern-compare" aria-label="Pattern compare">
      {summaries.map((summary) => {
        const selected = selectedPattern === summary.slot;
        const cued = selected && playbackMode === "pattern";
        const usedInBlock = selectedBlockPattern === summary.slot;
        return (
          <div
            className={["pattern-compare-card", selected ? "selected" : "", cued ? "cued" : ""]
              .filter(Boolean)
              .join(" ")}
            data-testid={`pattern-compare-${summary.slot}`}
            key={summary.slot}
          >
            <div className="pattern-compare-head">
              <span>Pattern {summary.slot}</span>
              <strong>{summary.eventCount} events</strong>
            </div>
            <div className="pattern-compare-metrics">
              <span>{summary.drumHits} drums</span>
              <span>{summary.bassNotes + summary.melodyNotes} notes</span>
              <span>{summary.chordEvents} chords</span>
            </div>
            <small>
              {barCountLabel(summary.arrangedBars)} / {summary.arrangedBlocks} block{summary.arrangedBlocks === 1 ? "" : "s"}
            </small>
            <div className="pattern-compare-actions">
              <button
                className={cued ? "selected" : ""}
                data-testid={`pattern-cue-${summary.slot}`}
                onClick={() => onCue(summary.slot)}
                title={`Cue Pattern ${summary.slot} for preview`}
                type="button"
              >
                <Play size={13} aria-hidden="true" />
                <span>Cue</span>
              </button>
              <button
                className={usedInBlock ? "selected" : ""}
                data-testid={`pattern-use-${summary.slot}`}
                disabled={usedInBlock}
                onClick={() => onUse(summary.slot)}
                title={`Use Pattern ${summary.slot} in selected block`}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>{usedInBlock ? "Used" : "Use"}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PatternCompareDecision({
  onRun,
  summary
}: {
  onRun: (action: PatternCompareDecisionSummary["action"], pattern: PatternSlot) => void;
  summary: PatternCompareDecisionSummary;
}): ReactElement {
  const Icon = summary.action === "use" ? ArrowRight : Play;
  const runLabel = summary.action === "use" ? `Use ${summary.target}` : `Cue ${summary.target}`;

  return (
    <div
      className={`pattern-compare-decision ${summary.tone}`}
      data-suggested-pattern-compare={`${summary.action}-${summary.target}`}
      data-testid="pattern-compare-decision"
      title={summary.detailTitle}
    >
      <span data-testid="pattern-compare-decision-status">{summary.statusLabel}</span>
      <strong data-testid="pattern-compare-decision-target">{summary.targetLabel}</strong>
      <small data-testid="pattern-compare-decision-action">{summary.actionLabel}</small>
      <small data-testid="pattern-compare-decision-detail">{summary.detailLabel}</small>
      <small data-testid="pattern-compare-decision-metric">{summary.metricLabel}</small>
      <button
        data-testid="pattern-compare-decision-run"
        onClick={() => onRun(summary.action, summary.target)}
        title={`${summary.actionLabel}: ${summary.targetLabel}`}
        type="button"
      >
        <Icon size={13} aria-hidden="true" />
        {runLabel}
      </button>
    </div>
  );
}

export function LayerStarterPads({
  options,
  onApply
}: {
  options: LayerStarterOption[];
  onApply: (starterId: LayerStarterId) => void;
}): ReactElement {
  const prioritySummary = createLayerStarterPrioritySummary(options);
  const priorityOption = options.find((option) => option.id === prioritySummary.optionId) ?? null;
  const priorityActionDisabled = priorityOption === null;

  return (
    <div className="layer-starter-panel" data-testid="layer-starter-pads">
      <div className="layer-starter-heading">
        <span>Layer Starter</span>
        <strong>Selected Pattern</strong>
      </div>
      <div
        className={`layer-starter-priority-readout ${prioritySummary.tone}`}
        data-layer-starter-priority-readout={prioritySummary.optionId ?? "none"}
        data-testid="layer-starter-priority-readout"
        title={prioritySummary.detailTitle}
      >
        <span data-testid="layer-starter-priority-status">{prioritySummary.statusLabel}</span>
        <strong data-testid="layer-starter-priority-label">{prioritySummary.layerLabel}</strong>
        <small data-testid="layer-starter-priority-detail">{prioritySummary.detailLabel}</small>
        <button
          data-testid="layer-starter-priority-run"
          disabled={priorityActionDisabled}
          onClick={() => {
            if (priorityOption) {
              onApply(priorityOption.id);
            }
          }}
          title={priorityOption ? `Start ${priorityOption.label}: ${priorityOption.actionLabel}` : prioritySummary.detailTitle}
          type="button"
        >
          {prioritySummary.actionLabel}
        </button>
      </div>
      <div className="layer-starter-row" aria-label="Layer Starter Pads">
        {options.map((option) => (
          <button
            className={option.tone}
            data-testid={`layer-starter-${option.id}`}
            key={option.id}
            onClick={() => onApply(option.id)}
            title={`${option.label}: ${option.detail}`}
            type="button"
          >
            <span>{option.status}</span>
            <strong>{option.label}</strong>
            <small>{option.actionLabel}</small>
            <em>{option.countLabel} / {option.targetLabel}</em>
          </button>
        ))}
      </div>
    </div>
  );
}

function createLayerStarterPrioritySummary(options: LayerStarterOption[]): LayerStarterPrioritySummary {
  const option = layerStarterPriorityOption(options);

  if (!option) {
    return {
      optionId: null,
      actionLabel: "Ready",
      statusLabel: "Layers ready",
      layerLabel: "All starter layers ready",
      detailLabel: "No missing or thin layer in selected Pattern",
      detailTitle: "Layer Starter has no missing or thin layer to prioritize.",
      tone: "good"
    };
  }

  const statusLabel = option.tone === "danger" ? "Layer missing" : "Layer thin";
  const detailLabel = `${option.countLabel} / ${option.targetLabel} / ${option.actionLabel}`;

  return {
    optionId: option.id,
    actionLabel: "Start layer",
    statusLabel,
    layerLabel: `${option.label}: ${option.status}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${option.label}: ${option.status} / ${detailLabel}`,
    tone: option.tone
  };
}

export function LocalDraftRecoveryBanner({
  draft,
  onClear,
  onRestore
}: {
  draft: LocalDraftRecovery;
  onClear: () => void;
  onRestore: () => void;
}): ReactElement {
  const bars = arrangementTotalBars(draft.project);

  return (
    <section className="local-draft-recovery" data-testid="local-draft-recovery" aria-label="Local draft recovery">
      <div>
        <strong data-testid="local-draft-title">Local draft found: {draft.project.title}</strong>
        <span data-testid="local-draft-detail">
          {formatLocalDraftSavedAt(draft.savedAt)} / {draft.project.bpm} BPM / {draft.project.key} / {barCountLabel(bars)} / local only
        </span>
      </div>
      <div className="local-draft-actions">
        <button className="icon-button primary" data-testid="restore-local-draft" onClick={onRestore} title="Restore local draft" type="button">
          <Undo2 size={16} aria-hidden="true" />
          <span>Restore Draft</span>
        </button>
        <button className="icon-button" data-testid="clear-local-draft" onClick={onClear} title="Clear local draft recovery" type="button">
          <Trash2 size={16} aria-hidden="true" />
          <span>Clear Draft</span>
        </button>
      </div>
    </section>
  );
}

export function QuickActions({
  actions,
  inspectedPinnedActionId,
  inspectedRecentActionId,
  open,
  pinnedActionIds,
  query,
  recentActionSource,
  recents,
  scope,
  scopeOptions,
  onClose,
  onInspectPinnedAction,
  onInspectRecentAction,
  onQueryChange,
  onRun,
  onScopeChange,
  onTogglePin
}: {
  actions: QuickAction[];
  inspectedPinnedActionId: string | null;
  inspectedRecentActionId: string | null;
  open: boolean;
  pinnedActionIds: string[];
  query: string;
  recentActionSource: QuickAction[];
  recents: QuickActionRecent[];
  scope: QuickActionScopeId;
  scopeOptions: QuickActionScopeOption[];
  onClose: () => void;
  onInspectPinnedAction: (actionId: string | null) => void;
  onInspectRecentAction: (actionId: string | null) => void;
  onQueryChange: (query: string) => void;
  onRun: (action: QuickAction) => void;
  onScopeChange: (scope: QuickActionScopeId) => void;
  onTogglePin: (action: QuickAction) => void;
}): ReactElement | null {
  if (!open) {
    return null;
  }

  const firstRunnableAction = actions.find((action) => !action.disabled);
  const spotlight = createQuickActionSpotlightSummary(actions, firstRunnableAction, scope, scopeOptions, query);
  const pinnedActions = createQuickActionPinnedOptions(pinnedActionIds, recentActionSource);
  const recentActions = createQuickActionRecentOptions(recents, recentActionSource);
  const inspectedPinnedAction = pinnedActions.find((action) => action.id === inspectedPinnedActionId) ?? null;
  const inspectedRecentAction = recentActions.find(({ action }) => action.id === inspectedRecentActionId) ?? null;
  const guideSuggestionAction =
    query.trim().length === 0 && (scope === "all" || scope === "project")
      ? recentActionSource.find((action) => action.id === "guide-quick-start") ?? null
      : null;
  const guideSuggestionPinned = guideSuggestionAction ? pinnedActionIds.includes(guideSuggestionAction.id) : false;
  const guideSuggestionSource = guideSuggestionAction ? guideSuggestionAction.detail.split(" / ")[0] || "Guide" : "Guide";
  const guideSuggestionReason = guideSuggestionAction
    ? quickActionGuideSuggestionReason(guideSuggestionAction.detail)
    : "Why now: current guide target";
  const guideSuggestionTarget = guideSuggestionAction
    ? quickActionGuideSuggestionTarget(guideSuggestionAction.title, guideSuggestionAction.detail)
    : "Target: Guide";
  const guideSuggestionMetric = guideSuggestionAction
    ? quickActionGuideSuggestionMetric(guideSuggestionAction.detail)
    : "Metric: current guide signal";
  const guideSuggestionAfterRun = guideSuggestionAction
    ? quickActionGuideSuggestionAfterRun(guideSuggestionAction.detail)
    : "After run: inspect the focused guide target before editing.";

  return (
    <div
      className="quick-actions-overlay"
      data-testid="quick-actions"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="quick-actions-panel" role="dialog" aria-modal="true" aria-label="Quick Actions">
        <div className="quick-actions-heading">
          <div>
            <KeyboardMusic size={18} aria-hidden="true" />
            <span>Quick Actions</span>
          </div>
          <button data-testid="quick-actions-close" onClick={onClose} title="Close Quick Actions" type="button">
            <X size={14} aria-hidden="true" />
          </button>
        </div>
        <input
          aria-label="Search Quick Actions"
          autoFocus
          data-testid="quick-actions-search"
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              onClose();
            }
            if (event.key === "Enter" && firstRunnableAction) {
              event.preventDefault();
              onRun(firstRunnableAction);
            }
          }}
          placeholder="Search commands"
          type="search"
          value={query}
        />
        <div className="quick-actions-scope-bar" data-testid="quick-actions-scope-bar" aria-label="Quick Action scopes">
          {scopeOptions.map((option) => (
            <button
              aria-pressed={scope === option.id}
              data-testid={`quick-actions-scope-${option.id}`}
              key={option.id}
              onClick={() => onScopeChange(option.id)}
              title={`${option.label}: ${option.count} matching command${option.count === 1 ? "" : "s"}`}
              type="button"
            >
              <span>{option.label}</span>
              <strong data-testid={`quick-actions-scope-count-${option.id}`}>{option.count}</strong>
            </button>
          ))}
        </div>
        <div className="quick-actions-count" data-testid="quick-actions-count">
          {actions.length} shown / {scopeOptions.find((option) => option.id === scope)?.count ?? 0} matching
        </div>
        <div
          aria-label={spotlight.detailTitle}
          className={`quick-actions-spotlight ${spotlight.tone}`}
          data-spotlight-action={spotlight.actionId ?? "none"}
          data-testid="quick-actions-spotlight"
          title={spotlight.detailTitle}
        >
          <span data-testid="quick-actions-spotlight-status">{spotlight.statusLabel}</span>
          <strong data-testid="quick-actions-spotlight-title">{spotlight.titleLabel}</strong>
          <small data-testid="quick-actions-spotlight-detail">{spotlight.detailLabel}</small>
          <small data-testid="quick-actions-spotlight-context">{spotlight.contextLabel}</small>
        </div>
        {guideSuggestionAction && (
          <div
            className={`quick-actions-guide-suggestion ${guideSuggestionAction.disabled ? "warn" : "good"}`}
            data-guide-action={guideSuggestionAction.id}
            data-testid="quick-actions-guide-suggestion"
            title={`${guideSuggestionAction.title}: ${guideSuggestionAction.detail}`}
          >
            <div>
              <span data-testid="quick-actions-guide-suggestion-status">
                {guideSuggestionAction.disabled ? "Guide unavailable" : "Guide ready"}
              </span>
              <strong data-testid="quick-actions-guide-suggestion-title">{guideSuggestionAction.title}</strong>
              <small data-testid="quick-actions-guide-suggestion-detail">{guideSuggestionAction.detail}</small>
              <small className="quick-actions-guide-suggestion-reason" data-testid="quick-actions-guide-suggestion-reason">
                {guideSuggestionReason}
              </small>
              <small className="quick-actions-guide-suggestion-next" data-testid="quick-actions-guide-suggestion-next">
                {guideSuggestionAfterRun}
              </small>
              <span className="quick-actions-guide-suggestion-meta" data-testid="quick-actions-guide-suggestion-meta">
                <span data-testid="quick-actions-guide-suggestion-source">{guideSuggestionSource}</span>
                <span data-testid="quick-actions-guide-suggestion-target">{guideSuggestionTarget}</span>
                <span data-testid="quick-actions-guide-suggestion-metric">{guideSuggestionMetric}</span>
                <span data-testid="quick-actions-guide-suggestion-pin-state">
                  {guideSuggestionPinned ? "Pinned command" : "Not pinned"}
                </span>
              </span>
            </div>
            <button
              data-testid="quick-actions-guide-suggestion-run"
              disabled={guideSuggestionAction.disabled}
              onClick={() => onRun(guideSuggestionAction)}
              title={`Run ${guideSuggestionAction.title}: ${guideSuggestionAction.detail}`}
              type="button"
            >
              <Target size={14} aria-hidden="true" />
              <span>Run guide</span>
            </button>
            <button
              aria-label={`${guideSuggestionPinned ? "Unpin" : "Pin"} ${guideSuggestionAction.title}`}
              aria-pressed={guideSuggestionPinned}
              className={guideSuggestionPinned ? "selected" : ""}
              data-testid={`quick-actions-guide-suggestion-${guideSuggestionPinned ? "unpin" : "pin"}`}
              onClick={() => onTogglePin(guideSuggestionAction)}
              title={`${guideSuggestionPinned ? "Unpin" : "Pin"} ${guideSuggestionAction.title}`}
              type="button"
            >
              {guideSuggestionPinned ? <PinOff size={14} aria-hidden="true" /> : <Pin size={14} aria-hidden="true" />}
              <span>{guideSuggestionPinned ? "Unpin" : "Pin"}</span>
            </button>
          </div>
        )}
        <div className="quick-actions-pinned" data-testid="quick-actions-pinned" aria-label="Pinned Quick Actions">
          <div className="quick-actions-pinned-head">
            <span data-testid="quick-actions-pinned-status">
              {pinnedActions.length}/{maxQuickActionPins} pinned
            </span>
            <strong data-testid="quick-actions-pinned-title">Pinned commands</strong>
            <small data-testid="quick-actions-pinned-detail">
              {pinnedActions.length > 0 ? "Explicit run only" : "Pin visible commands for reuse"}
            </small>
          </div>
          <div className="quick-actions-pinned-list" data-testid="quick-actions-pinned-list">
            {pinnedActions.length === 0 ? (
              <span className="quick-actions-pinned-empty" data-testid="quick-actions-pinned-empty">
                No pinned commands in this session
              </span>
            ) : (
              pinnedActions.map((action) => (
                <div className="quick-actions-pinned-card" data-testid={`quick-actions-pinned-card-${action.id}`} key={action.id}>
                  <button
                    data-testid={`quick-actions-pinned-${action.id}`}
                    disabled={action.disabled}
                    onClick={() => onRun(action)}
                    title={`Run pinned: ${action.detail}`}
                    type="button"
                  >
                    <span>{action.group}</span>
                    <strong>{action.title}</strong>
                    <small>{action.disabled ? "Unavailable now" : "Pinned"}</small>
                  </button>
                  <button
                    aria-label={`Inspect ${action.title}`}
                    aria-pressed={inspectedPinnedAction?.id === action.id}
                    className={`quick-action-pin-toggle ${inspectedPinnedAction?.id === action.id ? "selected" : ""}`}
                    data-testid={`quick-actions-pinned-inspect-${action.id}`}
                    onClick={() => onInspectPinnedAction(inspectedPinnedAction?.id === action.id ? null : action.id)}
                    title={`Inspect ${action.title}`}
                    type="button"
                  >
                    <CircleHelp size={14} aria-hidden="true" />
                    <span>Info</span>
                  </button>
                  <button
                    aria-label={`Unpin ${action.title}`}
                    className="quick-action-pin-toggle selected"
                    data-testid={`quick-actions-pinned-unpin-${action.id}`}
                    onClick={() => onTogglePin(action)}
                    title={`Unpin ${action.title}`}
                    type="button"
                  >
                    <PinOff size={14} aria-hidden="true" />
                    <span>Unpin</span>
                  </button>
                </div>
              ))
            )}
          </div>
          {inspectedPinnedAction && (
            <div
              className={`quick-actions-pinned-inspector ${inspectedPinnedAction.disabled ? "warn" : "good"}`}
              data-inspected-action={inspectedPinnedAction.id}
              data-testid="quick-actions-pinned-inspector"
            >
              <div>
                <span data-testid="quick-actions-pinned-inspector-status">
                  {inspectedPinnedAction.disabled ? "Unavailable pinned command" : "Pinned command ready"}
                </span>
                <strong data-testid="quick-actions-pinned-inspector-title">{inspectedPinnedAction.title}</strong>
                <small data-testid="quick-actions-pinned-inspector-detail">
                  {inspectedPinnedAction.group} / {inspectedPinnedAction.detail}
                </small>
                <span className="quick-actions-pinned-inspector-meta" data-testid="quick-actions-pinned-inspector-meta">
                  <span data-testid="quick-actions-pinned-inspector-group">Group: {inspectedPinnedAction.group}</span>
                  <span data-testid="quick-actions-pinned-inspector-target">
                    {quickActionPinnedInspectorTarget(inspectedPinnedAction)}
                  </span>
                </span>
              </div>
              <button
                data-testid="quick-actions-pinned-inspector-run"
                disabled={inspectedPinnedAction.disabled}
                onClick={() => onRun(inspectedPinnedAction)}
                title={`Run inspected pinned command: ${inspectedPinnedAction.detail}`}
                type="button"
              >
                <Play size={14} aria-hidden="true" />
                <span>Run</span>
              </button>
            </div>
          )}
        </div>
        <div className="quick-actions-recents" data-testid="quick-actions-recents" aria-label="Recent Quick Actions">
          <div className="quick-actions-recents-head">
            <span data-testid="quick-actions-recents-status">
              {recentActions.length > 0 ? `${recentActions.length} recent` : "No recent"}
            </span>
            <strong data-testid="quick-actions-recents-title">Recent commands</strong>
            <small data-testid="quick-actions-recents-detail">
              {recentActions.length > 0 ? "Explicit rerun only" : "Run a command to fill this row"}
            </small>
          </div>
          <div className="quick-actions-recents-list" data-testid="quick-actions-recents-list">
            {recentActions.length === 0 ? (
              <span className="quick-actions-recent-empty" data-testid="quick-actions-recent-empty">
                No command history in this session
              </span>
            ) : (
              recentActions.map(({ action, recent }) => (
                <div className="quick-actions-recent-card" data-testid={`quick-actions-recent-card-${action.id}`} key={action.id}>
                  <button
                    className={recent.tone}
                    data-testid={`quick-actions-recent-${action.id}`}
                    disabled={action.disabled}
                    onClick={() => onRun(action)}
                    title={`${recent.status}: ${action.detail}`}
                    type="button"
                  >
                    <span>{action.group}</span>
                    <strong>{action.title}</strong>
                    <small>{recent.status}</small>
                  </button>
                  <button
                    aria-label={`Inspect recent ${action.title}`}
                    aria-pressed={inspectedRecentAction?.action.id === action.id}
                    className={`quick-action-pin-toggle ${inspectedRecentAction?.action.id === action.id ? "selected" : ""}`}
                    data-testid={`quick-actions-recent-inspect-${action.id}`}
                    onClick={() => onInspectRecentAction(inspectedRecentAction?.action.id === action.id ? null : action.id)}
                    title={`Inspect recent ${action.title}`}
                    type="button"
                  >
                    <CircleHelp size={14} aria-hidden="true" />
                    <span>Info</span>
                  </button>
                </div>
              ))
            )}
          </div>
          {inspectedRecentAction && (
            <div
              className={`quick-actions-recent-inspector ${inspectedRecentAction.action.disabled ? "warn" : inspectedRecentAction.recent.tone}`}
              data-inspected-action={inspectedRecentAction.action.id}
              data-testid="quick-actions-recent-inspector"
            >
              <div>
                <span data-testid="quick-actions-recent-inspector-status">
                  {inspectedRecentAction.action.disabled ? "Unavailable recent command" : "Recent command ready"}
                </span>
                <strong data-testid="quick-actions-recent-inspector-title">{inspectedRecentAction.action.title}</strong>
                <small data-testid="quick-actions-recent-inspector-detail">
                  {inspectedRecentAction.action.group} / {inspectedRecentAction.action.detail}
                </small>
                <span className="quick-actions-recent-inspector-meta" data-testid="quick-actions-recent-inspector-meta">
                  <span data-testid="quick-actions-recent-inspector-group">Group: {inspectedRecentAction.action.group}</span>
                  <span data-testid="quick-actions-recent-inspector-target">
                    {quickActionRecentInspectorTarget(inspectedRecentAction.action)}
                  </span>
                  <span data-testid="quick-actions-recent-inspector-result">
                    {quickActionRecentInspectorResult(inspectedRecentAction.recent)}
                  </span>
                </span>
              </div>
              <button
                data-testid="quick-actions-recent-inspector-run"
                disabled={inspectedRecentAction.action.disabled}
                onClick={() => onRun(inspectedRecentAction.action)}
                title={`Rerun inspected recent command: ${inspectedRecentAction.action.detail}`}
                type="button"
              >
                <Play size={14} aria-hidden="true" />
                <span>Rerun</span>
              </button>
            </div>
          )}
        </div>
        <div className="quick-actions-list" data-testid="quick-actions-list">
          {actions.length === 0 ? (
            <div className="quick-action-empty" data-testid="quick-actions-empty">
              No matching actions
            </div>
          ) : (
            actions.map((action) => {
              const pinned = pinnedActionIds.includes(action.id);
              return (
                <div className={`quick-action-row ${pinned ? "pinned" : ""}`} key={action.id}>
                  <button
                    className="quick-action-run"
                    data-testid={`quick-action-${action.id}`}
                    disabled={action.disabled}
                    onClick={() => onRun(action)}
                    title={action.detail}
                    type="button"
                  >
                    <span>{action.group}</span>
                    <strong>{action.title}</strong>
                    <small>{action.detail}</small>
                  </button>
                  <button
                    aria-label={`${pinned ? "Unpin" : "Pin"} ${action.title}`}
                    aria-pressed={pinned}
                    className={`quick-action-pin-toggle ${pinned ? "selected" : ""}`}
                    data-testid={`quick-action-${pinned ? "unpin" : "pin"}-${action.id}`}
                    onClick={() => onTogglePin(action)}
                    title={`${pinned ? "Unpin" : "Pin"} ${action.title}`}
                    type="button"
                  >
                    {pinned ? <PinOff size={14} aria-hidden="true" /> : <Pin size={14} aria-hidden="true" />}
                    <span>{pinned ? "Unpin" : "Pin"}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export function CommandReferenceDialog({ open, onClose }: { open: boolean; onClose: () => void }): ReactElement | null {
  const [selectedFilterId, setSelectedFilterId] = useState<CommandReferenceFilterId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase();
  const filteredSections =
    selectedFilterId === "all"
      ? commandReferenceSections
      : commandReferenceSections.filter((section) => section.id === selectedFilterId);
  const visibleSections = filteredSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => commandReferenceItemMatchesQuery(section, item, normalizedSearchQuery))
    }))
    .filter((section) => section.items.length > 0);
  const showBeatTerms = selectedFilterId === "all" || selectedFilterId === "beat-terms";
  const visibleBeatTerms = showBeatTerms
    ? beatTermItems.filter((item) => beatTermMatchesQuery(item, normalizedSearchQuery))
    : [];
  const visibleCommandCount = visibleSections.reduce((total, section) => total + section.items.length, 0);
  const visibleResultCount = visibleCommandCount + visibleBeatTerms.length;
  const hasVisibleResults = visibleResultCount > 0;
  const commandReferenceSearchSpotlight = createCommandReferenceSearchSpotlight(
    visibleSections,
    visibleBeatTerms,
    searchQuery.trim()
  );

  useEffect(() => {
    if (!open) {
      setSelectedFilterId("all");
      setSearchQuery("");
      return;
    }
    searchInputRef.current?.focus();
  }, [open]);

  function clearCommandReferenceSearch(): void {
    setSearchQuery("");
    searchInputRef.current?.focus();
  }

  function resetCommandReferenceSearch(): void {
    setSelectedFilterId("all");
    setSearchQuery("");
    searchInputRef.current?.focus();
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="quick-actions-overlay command-reference-overlay"
      data-testid="command-reference"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="command-reference-panel" role="dialog" aria-modal="true" aria-label="Command Reference">
        <div className="quick-actions-heading command-reference-heading">
          <div>
            <CircleHelp size={18} aria-hidden="true" />
            <span>Command Reference</span>
          </div>
          <button data-testid="command-reference-close" onClick={onClose} title="Close Command Reference" type="button">
            <X size={14} aria-hidden="true" />
          </button>
        </div>
        <div className="command-reference-body" data-testid="command-reference-body">
          <div className="command-reference-filter-bar" data-testid="command-reference-filter-bar" aria-label="Command Reference sections">
            {commandReferenceFilterOptions.map((option) => (
              <button
                aria-pressed={selectedFilterId === option.id}
                data-testid={`command-reference-filter-${option.id}`}
                key={option.id}
                onClick={() => setSelectedFilterId(option.id)}
                type="button"
              >
                <span>{option.label}</span>
                <strong data-testid={`command-reference-filter-count-${option.id}`}>{commandReferenceFilterCount(option.id)}</strong>
              </button>
            ))}
          </div>
          <div className="command-reference-search" data-testid="command-reference-search">
            <Search size={14} aria-hidden="true" />
            <input
              aria-label="Search Command Reference"
              data-testid="command-reference-search-input"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search commands or terms"
              ref={searchInputRef}
              type="search"
              value={searchQuery}
            />
            {searchQuery ? (
              <button
                className="command-reference-search-clear"
                data-testid="command-reference-search-clear"
                onClick={clearCommandReferenceSearch}
                title="Clear Command Reference search"
                type="button"
              >
                <X size={12} aria-hidden="true" />
              </button>
            ) : null}
            <span data-testid="command-reference-search-count">{visibleResultCount} shown</span>
          </div>
          {commandReferenceSearchSpotlight ? (
            <div
              aria-label={commandReferenceSearchSpotlight.title}
              className="command-reference-spotlight"
              data-command-reference-spotlight={commandReferenceSearchSpotlight.id}
              data-testid="command-reference-spotlight"
              title={commandReferenceSearchSpotlight.title}
            >
              <span data-testid="command-reference-spotlight-status">{commandReferenceSearchSpotlight.status}</span>
              <strong data-testid="command-reference-spotlight-label">{commandReferenceSearchSpotlight.label}</strong>
              <small data-testid="command-reference-spotlight-detail">{commandReferenceSearchSpotlight.detail}</small>
              <small data-testid="command-reference-spotlight-context">{commandReferenceSearchSpotlight.context}</small>
            </div>
          ) : null}
          <div className="command-reference-grid" data-testid="command-reference-grid">
            {visibleSections.map((section) => (
              <div
                className="command-reference-section"
                data-testid={`command-reference-section-${section.id}`}
                key={section.id}
              >
                <div className="command-reference-section-title">
                  <span>{section.title}</span>
                  <strong>{section.items.length}</strong>
                </div>
                <div className="command-reference-items">
                  {section.items.map((item) => (
                    <div className="command-reference-item" data-testid={`command-reference-item-${item.id}`} key={item.id}>
                      <kbd>{item.shortcut}</kbd>
                      <strong>{item.command}</strong>
                      <small>{item.target}</small>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {showBeatTerms && visibleBeatTerms.length > 0 ? (
            <div className="command-reference-terms" data-testid="command-reference-terms" aria-label="Beat terms">
              <div className="command-reference-section-title">
                <span>Beat Terms</span>
                <strong>{visibleBeatTerms.length}</strong>
              </div>
              <div className="command-reference-terms-grid">
                {visibleBeatTerms.map((item) => (
                  <div className="command-reference-term" data-testid={`command-reference-term-${item.id}`} key={item.id}>
                    <span>{item.target}</span>
                    <strong>{item.term}</strong>
                    <small>{item.meaning}</small>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {!hasVisibleResults ? (
            <div className="command-reference-empty" data-testid="command-reference-empty">
              <strong>No command reference matches</strong>
              <small>Try another command, shortcut, production term, or section filter.</small>
              <div>
                <button data-testid="command-reference-empty-clear" onClick={clearCommandReferenceSearch} type="button">
                  Clear Search
                </button>
                <button data-testid="command-reference-empty-show-all" onClick={resetCommandReferenceSearch} type="button">
                  Show All
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function QuickActionResultStrip({ result }: { result: QuickActionResult }): ReactElement {
  return (
    <section className={`quick-action-result ${result.tone}`} data-testid="quick-action-result" aria-live="polite">
      <div className="quick-action-result-main">
        <span data-testid="quick-action-result-status">{result.status}</span>
        <strong data-testid="quick-action-result-title">{result.title}</strong>
        <small data-testid="quick-action-result-detail">{result.group} / {result.detail}</small>
      </div>
      <div className={`quick-action-result-metric ${result.metric.tone}`} data-testid="quick-action-result-metric">
        <span>{result.metric.label}</span>
        <strong data-testid="quick-action-result-metric-value">
          {result.metric.before} -&gt; {result.metric.after}
        </strong>
      </div>
      <div className="quick-action-result-followup" data-testid="quick-action-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="quick-action-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="quick-action-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </section>
  );
}

export function ProjectSnapshots({
  nameDrafts,
  project,
  onDelete,
  onNameCommit,
  onNameDraftChange,
  onNameDraftReset,
  onRestore,
  onSave
}: {
  nameDrafts: Record<string, string>;
  project: ProjectState;
  onDelete: (snapshotId: string) => void;
  onNameCommit: (snapshotId: string, name: string) => void;
  onNameDraftChange: (snapshotId: string, name: string) => void;
  onNameDraftReset: (snapshotId: string) => void;
  onRestore: (snapshotId: string) => void;
  onSave: () => void;
}): ReactElement {
  const roleSummary = createSnapshotSlotRoleSummary(project);

  return (
    <section className="snapshot-row" data-testid="project-snapshots" aria-label="Project snapshots">
      <div className="snapshot-heading">
        <div>
          <Save size={17} aria-hidden="true" />
          <span>Snapshots</span>
        </div>
        <strong data-testid="snapshot-count">
          {project.snapshots.length}/{maxProjectSnapshots} slots
        </strong>
        <div
          className={`snapshot-slot-role-readout ${roleSummary.tone}`}
          data-testid="snapshot-slot-role-readout"
          title={roleSummary.detailTitle}
        >
          <span data-testid="snapshot-slot-role-status">{roleSummary.statusLabel}</span>
          <strong data-testid="snapshot-slot-role-label">{roleSummary.roleLabel}</strong>
          <small data-testid="snapshot-slot-role-detail">{roleSummary.detailLabel}</small>
        </div>
        <button data-testid="snapshot-save" onClick={onSave} title="Save current project snapshot" type="button">
          <Save size={14} aria-hidden="true" />
          <span>Save Slot</span>
        </button>
      </div>
      <div className="snapshot-list">
        {project.snapshots.length === 0 ? (
          <div className="snapshot-empty" data-testid="snapshot-empty">
            <span>No slots saved</span>
          </div>
        ) : (
          project.snapshots.map((snapshot) => {
            const displayName = nameDrafts[snapshot.id] ?? snapshot.name;
            return (
              <div className="snapshot-item" data-testid={`snapshot-item-${snapshot.id}`} key={snapshot.id}>
                <div>
                  <input
                    aria-label={`Rename ${snapshot.name}`}
                    className="snapshot-name-input"
                    data-testid={`snapshot-name-${snapshot.id}`}
                    maxLength={maxProjectSnapshotNameLength}
                    onBlur={(event) => onNameCommit(snapshot.id, event.currentTarget.value)}
                    onChange={(event) => onNameDraftChange(snapshot.id, event.currentTarget.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        onNameCommit(snapshot.id, event.currentTarget.value);
                        event.currentTarget.blur();
                      }
                      if (event.key === "Escape") {
                        event.preventDefault();
                        onNameDraftReset(snapshot.id);
                      }
                    }}
                    title={`Rename ${snapshot.name}`}
                    type="text"
                    value={displayName}
                  />
                  <span>{projectSnapshotSummary(snapshot)}</span>
                </div>
                <div className="snapshot-actions">
                  <button data-testid={`snapshot-restore-${snapshot.id}`} onClick={() => onRestore(snapshot.id)} title={`Restore ${snapshot.name}`} type="button">
                    <Undo2 size={14} aria-hidden="true" />
                    <span>Restore</span>
                  </button>
                  <button className="danger" data-testid={`snapshot-delete-${snapshot.id}`} onClick={() => onDelete(snapshot.id)} title={`Delete ${snapshot.name}`} type="button">
                    <Trash2 size={14} aria-hidden="true" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export function SnapshotCompare({
  focusedMetricId,
  focusSummary,
  onFocus,
  result,
  summary
}: {
  focusedMetricId: SnapshotCompareFocusId | null;
  focusSummary: SnapshotCompareFocusSummary;
  onFocus: (item: SnapshotCompareFocusItem) => void;
  result: SnapshotCompareFocusResult | null;
  summary: SnapshotCompareSummary;
}): ReactElement {
  return (
    <section className={`snapshot-compare ${summary.tone}`} data-testid="snapshot-compare" aria-label="Snapshot compare">
      <div className="snapshot-compare-heading">
        <div>
          <Copy size={16} aria-hidden="true" />
          <span>Snapshot Compare</span>
        </div>
        <strong data-testid="snapshot-compare-headline">{summary.headline}</strong>
        <small data-testid="snapshot-compare-detail">{summary.detail}</small>
      </div>
      <div className={`snapshot-compare-focus-readout ${focusSummary.tone}`} data-testid="snapshot-compare-focus-readout" title={focusSummary.detailTitle}>
        <span data-testid="snapshot-compare-focus-status">{focusSummary.statusLabel}</span>
        <strong data-testid="snapshot-compare-focus-label">{focusSummary.areaLabel}</strong>
        <small data-testid="snapshot-compare-focus-detail">{focusSummary.detailLabel}</small>
      </div>
      {result && <SnapshotCompareFocusResultStrip result={result} />}
      {summary.cards.length === 0 ? (
        <div className="snapshot-compare-empty" data-testid="snapshot-compare-empty">
          <span>Save a slot to compare takes</span>
        </div>
      ) : (
        <div className="snapshot-compare-grid" data-testid="snapshot-compare-grid">
          {summary.cards.map((card) => (
            <div className={`snapshot-compare-card ${card.tone}`} data-testid={`snapshot-compare-${card.id}`} key={card.id}>
              <div className="snapshot-compare-card-heading">
                <strong>{card.name}</strong>
                <small>{card.detail}</small>
              </div>
              <div className="snapshot-compare-metrics">
                {card.metrics.map((metric) => {
                  const focusItem = snapshotCompareFocusItem(card, metric);
                  const focused = focusedMetricId === focusItem.focusId;

                  return (
                    <div
                      className={["snapshot-compare-metric", metric.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
                      data-focused={focused ? "true" : "false"}
                      data-testid={`snapshot-compare-${card.id}-${metric.id}`}
                      key={metric.id}
                    >
                      <span>{metric.label}</span>
                      <strong>{metric.snapshot}</strong>
                      <button
                        aria-pressed={focused}
                        className="snapshot-compare-focus-button"
                        data-testid={`snapshot-compare-focus-${card.id}-${metric.id}`}
                        onClick={() => onFocus(focusItem)}
                        title={`Focus ${metric.focusLabel}: ${metric.snapshot}`}
                        type="button"
                      >
                        <ArrowRight size={13} aria-hidden="true" />
                        <span>{metric.focusLabel}</span>
                      </button>
                      <small>{metric.detail}</small>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SnapshotCompareFocusResultStrip({ result }: { result: SnapshotCompareFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`snapshot-compare-result ${result.tone}`}
      data-result-snapshot-compare={result.focusId}
      data-testid="snapshot-compare-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="snapshot-compare-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="snapshot-compare-result-title">{result.title}</strong>
          <small data-testid="snapshot-compare-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="snapshot-compare-result-destination" data-testid="snapshot-compare-result-destination">
        <span>{result.status}</span>
        <strong>{result.destination}</strong>
      </div>
      <div className="snapshot-compare-result-metric" data-testid="snapshot-compare-result-metric">
        <span data-testid="snapshot-compare-result-status">{result.metricLabel}</span>
        <strong data-testid="snapshot-compare-result-value">{result.metricValue}</strong>
      </div>
      <div className="snapshot-compare-result-followup" data-testid="snapshot-compare-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function BeatReadiness({
  checks,
  focusedCheckId,
  result,
  onFocus
}: {
  checks: BeatReadinessCheck[];
  focusedCheckId: BeatReadinessCheckId | null;
  result: BeatReadinessFocusResult | null;
  onFocus: (check: BeatReadinessCheck) => void;
}): ReactElement {
  const readyCount = checks.filter((check) => check.tone === "good").length;
  const focusSummary = createBeatReadinessFocusSummary(checks, focusedCheckId);

  return (
    <section
      aria-label="Beat readiness"
      className={["beat-readiness", result ? "has-result" : ""].filter(Boolean).join(" ")}
      data-testid="beat-readiness"
    >
      <div className="beat-readiness-heading">
        <span>Beat Readiness</span>
        <strong data-testid="beat-readiness-summary">
          {readyCount}/{checks.length} ready
        </strong>
      </div>
      <div
        className={`beat-readiness-focus-readout ${focusSummary.tone}`}
        data-beat-readiness-focus-readout={focusSummary.checkId ?? "none"}
        data-testid="beat-readiness-focus-readout"
        title={focusSummary.detailTitle}
      >
        <span data-testid="beat-readiness-focus-status">{focusSummary.statusLabel}</span>
        <strong data-testid="beat-readiness-focus-label">{focusSummary.areaLabel}</strong>
        <small data-testid="beat-readiness-focus-detail">{focusSummary.detailLabel}</small>
      </div>
      {result && <BeatReadinessFocusResultStrip result={result} />}
      <div className="beat-readiness-list">
        {checks.map((check) => {
          const focused = focusedCheckId === check.id;
          return (
            <div
              className={`beat-readiness-card ${check.tone} ${focused ? "focused" : ""}`}
              data-testid={`beat-readiness-check-${check.id}`}
              key={check.id}
            >
              <span>{check.label}</span>
              <strong>{check.status}</strong>
              <button
                aria-pressed={focused}
                className="beat-readiness-focus-button"
                data-testid={`beat-readiness-focus-${check.id}`}
                onClick={() => onFocus(check)}
                title={`Focus ${check.label}: ${check.detail}`}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>{check.focusLabel}</span>
              </button>
              <p>{check.detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function createBeatReadinessFocusSummary(checks: BeatReadinessCheck[], focusedCheckId: BeatReadinessCheckId | null): BeatReadinessFocusSummary {
  const focusedCheck = focusedCheckId ? checks.find((check) => check.id === focusedCheckId) ?? null : null;
  const check = focusedCheck ?? beatReadinessPriorityCheck(checks);

  if (!check) {
    return {
      checkId: null,
      statusLabel: "Readiness ready",
      areaLabel: "No readiness checks",
      detailLabel: "No Beat Readiness checks available",
      detailTitle: "Beat Readiness has no checks to focus.",
      tone: "good"
    };
  }

  const statusLabel = focusedCheck ? "Focused Readiness" : beatReadinessFocusStatusLabel(check.tone);
  const detailLabel = `${check.focusLabel} panel / ${check.detail}`;

  return {
    checkId: check.id,
    statusLabel,
    areaLabel: `${check.label}: ${check.status}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${check.label}: ${check.status} / ${detailLabel}`,
    tone: check.tone
  };
}

function beatReadinessFocusStatusLabel(tone: BeatReadinessCheck["tone"]): string {
  if (tone === "danger") {
    return "Readiness blocker";
  }

  if (tone === "warn") {
    return "Readiness review";
  }

  return "Readiness ready";
}

function BeatReadinessFocusResultStrip({ result }: { result: BeatReadinessFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`beat-readiness-result ${result.tone}`}
      data-result-beat-readiness={result.checkId}
      data-testid="beat-readiness-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="beat-readiness-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="beat-readiness-result-title">{result.title}</strong>
          <small data-testid="beat-readiness-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="beat-readiness-result-destination" data-testid="beat-readiness-result-destination">
        <span>{result.status}</span>
        <strong>{result.destination}</strong>
      </div>
      <div className="beat-readiness-result-metric" data-testid="beat-readiness-result-metric">
        <span data-testid="beat-readiness-result-status">{result.metricLabel}</span>
        <strong data-testid="beat-readiness-result-value">{result.metricValue}</strong>
      </div>
      <div className="beat-readiness-result-followup" data-testid="beat-readiness-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

function createQuickActionSpotlightSummary(
  actions: QuickAction[],
  firstRunnableAction: QuickAction | undefined,
  scope: QuickActionScopeId,
  scopeOptions: QuickActionScopeOption[],
  query: string
): QuickActionSpotlightSummary {
  const scopeLabel = scopeOptions.find((option) => option.id === scope)?.label ?? "All";
  const matchingCount = scopeOptions.find((option) => option.id === scope)?.count ?? 0;
  const queryLabel = query.trim().length > 0 ? `Search "${query.trim()}"` : "No search";
  const contextLabel = `${scopeLabel} scope / ${actions.length} shown / ${matchingCount} matching / ${queryLabel}`;

  if (!firstRunnableAction) {
    const detailLabel =
      actions.length > 0 ? "Visible commands are disabled in the current state" : "No visible command matches the current scope and search";
    return {
      actionId: null,
      statusLabel: "No Enter target",
      titleLabel: "No command ready",
      detailLabel,
      contextLabel,
      detailTitle: `No Enter target / ${detailLabel} / ${contextLabel}`,
      tone: "warn"
    };
  }

  const detailLabel = `${firstRunnableAction.group} / ${firstRunnableAction.detail}`;
  return {
    actionId: firstRunnableAction.id,
    statusLabel: "Enter target",
    titleLabel: firstRunnableAction.title,
    detailLabel,
    contextLabel,
    detailTitle: `Enter target / ${firstRunnableAction.title} / ${detailLabel} / ${contextLabel}`,
    tone: "good"
  };
}

function createQuickActionRecentOptions(
  recents: QuickActionRecent[],
  actions: QuickAction[]
): Array<{ recent: QuickActionRecent; action: QuickAction }> {
  return recents.flatMap((recent) => {
    const action = actions.find((candidate) => candidate.id === recent.actionId);
    return action ? [{ recent, action }] : [];
  });
}

function normalizeShellQuickActionPinnedIds(pinnedIds: string[], actions: QuickAction[]): string[] {
  const actionIds = new Set(actions.map((action) => action.id));
  return pinnedIds.filter((id, index) => actionIds.has(id) && pinnedIds.indexOf(id) === index).slice(0, maxQuickActionPins);
}

function createQuickActionPinnedOptions(pinnedIds: string[], actions: QuickAction[]): QuickAction[] {
  const normalizedIds = normalizeShellQuickActionPinnedIds(pinnedIds, actions);
  return normalizedIds.flatMap((id) => {
    const action = actions.find((candidate) => candidate.id === id);
    return action ? [action] : [];
  });
}

function createSnapshotSlotRoleSummary(project: ProjectState): SnapshotSlotRoleSummary {
  const savedCount = project.snapshots.length;
  const statusLabel = `${savedCount}/${maxProjectSnapshots} slots`;
  const latestSnapshot = project.snapshots[0];

  if (savedCount === 0) {
    return {
      roleLabel: "Save first take",
      statusLabel,
      detailLabel: "Next Save Slot",
      detailTitle: `${statusLabel} / Save a local version before major edits`,
      tone: "warn"
    };
  }

  if (savedCount >= maxProjectSnapshots) {
    return {
      roleLabel: "Slot bank full",
      statusLabel,
      detailLabel: "Compare or clear",
      detailTitle: `${statusLabel} / Latest ${latestSnapshot?.name ?? "saved take"} / Delete a stale slot before saving more`,
      tone: "warn"
    };
  }

  if (savedCount === 1) {
    return {
      roleLabel: "Compare ready",
      statusLabel,
      detailLabel: latestSnapshot ? latestSnapshot.name : "1 saved take",
      detailTitle: `${statusLabel} / Latest ${latestSnapshot?.name ?? "saved take"} / Use Snapshot Compare before big edits`,
      tone: "good"
    };
  }

  return {
    roleLabel: "Version bank",
    statusLabel,
    detailLabel: `${savedCount} takes ready`,
    detailTitle: `${statusLabel} / Latest ${latestSnapshot?.name ?? "saved take"} / Compare takes before restore or delete`,
    tone: "good"
  };
}
