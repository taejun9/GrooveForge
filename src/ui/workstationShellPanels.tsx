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
  QuickActionPinnedResult,
  QuickActionRecent,
  QuickActionRecentResult,
  QuickActionResult,
  QuickActionScopeId,
  QuickActionScopeOption,
  QuickActionScopeResult,
  QuickActionSearchHintResult,
  QuickActionSearchRecoveryResult,
  QuickActionSearchResult,
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
  const parts = quickActionGuideSuggestionNonCompletionParts(detail);
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
  const detailParts = quickActionGuideSuggestionNonCompletionParts(detail);
  const metricParts = detailParts.slice(-2);

  return metricParts.length > 0 ? `Metric: ${metricParts.join(" / ")}` : "Metric: current guide signal";
}

function quickActionGuideSuggestionCompletion(detail: string): string {
  return quickActionGuideSuggestionParts(detail).find((part) => part.startsWith("Completion ")) ?? "Completion: not scored";
}

function quickActionGuideSuggestionBreakdown(detail: string): string {
  return quickActionGuideSuggestionParts(detail).find((part) => part.startsWith("Breakdown ")) ?? "Breakdown: not scored";
}

function quickActionGuideSuggestionBottleneck(detail: string): string {
  return quickActionGuideSuggestionParts(detail).find((part) => part.startsWith("Bottleneck ")) ?? "Bottleneck: not scored";
}

function quickActionGuideSuggestionNonCompletionParts(detail: string): string[] {
  return quickActionGuideSuggestionParts(detail).filter(
    (part) => !part.startsWith("Completion ") && !part.startsWith("Breakdown ") && !part.startsWith("Bottleneck ")
  );
}

function quickActionGuideSuggestionParts(detail: string): string[] {
  return detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
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
  context?: string;
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
      {
        id: "transport-position",
        command: "Transport Position Readout",
        shortcut: "Quick Actions / Readout",
        target: "Bar / beat / loop scope",
        context:
          "Current Bar/Beat/Step, section, Pattern, loop scope, selected block, BPM, local result metric, audition cue, and next position check before playback or timing edits."
      },
      {
        id: "loop-scope",
        command: "Loop Scope",
        shortcut: "Quick Actions / Readout",
        target: "Song / Block / Turn / Pattern loop",
        context:
          "Current Song, Block, Turn, or Pattern loop-scope context with selected Pattern, selected block, BPM, metronome state, local result metric, audition cue, and next loop check before playback."
      },
      {
        id: "metronome",
        command: "Metronome",
        shortcut: "Quick Actions / Readout",
        target: "Realtime click / grid",
        context:
          "Current click on/off state, BPM, loop scope, selected Pattern, selected block, local result metric, audition cue, and export-clean posture before playback or timing edits."
      },
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
      { id: "restore-draft", command: "Restore Draft", shortcut: "Quick Actions / Readout", target: "Local recovery" },
      { id: "clear-draft", command: "Clear Draft", shortcut: "Quick Actions / Readout", target: "Local recovery" },
      { id: "project-snapshots", command: "Project Snapshots", shortcut: "Quick Actions / Readout", target: "Local idea slots" },
      { id: "snapshot-compare", command: "Snapshot Compare", shortcut: "Quick Actions / Readout", target: "Saved take comparison" },
      { id: "undo", command: "Undo", shortcut: "CmdOrCtrl+Z", target: "Edit history" },
      { id: "redo", command: "Redo", shortcut: "Shift+CmdOrCtrl+Z / CmdOrCtrl+Y", target: "Edit history" }
    ]
  },
  {
    id: "guide-fast-path",
    title: "Guide",
    items: [
      {
        id: "guide-quick-start",
        command: "Guide Quick Start",
        shortcut: "Quick Actions / Readout",
        target: "Destination / metric / next check",
        context: "Path, Session, and Workflow context with audition cue, completion breakdown, and bottleneck posture before Run Guide."
      },
      {
        id: "guide-bottleneck-focus",
        command: "Guide Bottleneck Focus",
        shortcut: "Quick Actions",
        target: "Lowest completion lane / destination",
        context: "Bottleneck metric, current context, audition cue, next check, completion breakdown, and bottleneck posture before focus."
      },
      {
        id: "first-beat-path",
        command: "First Beat Path",
        shortcut: "Quick Actions / Readout",
        target: "Setup / compose / arrange / mix / deliver",
        context:
          "Setup, Compose, Arrange, Mix, and Deliver path context with destination, path metric, audition cue, and next check before First Beat Path commands run."
      },
      {
        id: "beat-spine",
        command: "Beat Spine",
        shortcut: "Quick Actions / Readout",
        target: "Jump / apply core axis",
        context:
          "Setup, Drums, 808/Bass, Harmony, Melody, Sound, Arrange, and Finish context with destination/action, beat-core metric, scope, audition cue, and next check before Beat Spine commands run."
      },
      {
        id: "mode-focus",
        command: "Mode Focus",
        shortcut: "Quick Actions / Readout",
        target: "Guided / Studio orientation jump",
        context:
          "Guided and Studio orientation context with destination, mode metric, local context, audition cue, and next check before Mode Focus commands run."
      },
      {
        id: "mode-switch",
        command: "Mode Switch",
        shortcut: "Quick Actions",
        target: "Guided / Studio workflow switch",
        context:
          "Guided and Studio switch context with destination, current mode, target mode, transition, audition cue, and next check before Mode Switch commands run."
      },
      {
        id: "session-pass",
        command: "Session Pass",
        shortcut: "Quick Actions / Readout",
        target: "Guided / Studio / Finish / Delivery focus",
        context:
          "Guided, Studio, Finish, and Delivery context with destination, session metric, pass context, audition cue, and next check before Session Pass commands run."
      },
      {
        id: "session-brief-compass",
        command: "Session Brief Compass",
        shortcut: "Quick Actions / Readout",
        target: "Direction / reference / handoff",
        context:
          "Direction, Reference, Artist/Vocal Context, Handoff Readiness Cards, Brief Compass Focus Route, Direct Brief Card Commands, Focus Result Feedback, Delivery Target, Export Readiness, Package Readiness, Audition Cue, and Next Brief/Handoff Check context before Session Brief Compass commands run."
      },
      {
        id: "reference-alignment",
        command: "Reference Alignment",
        shortcut: "Quick Actions / Readout",
        target: "Reference / form / mix / handoff",
        context:
          "Written Reference Fit, Direction, Arrangement Form, Mix Posture, Listen Cue, Handoff Readiness, Reference Alignment Focus Route, Direct Alignment Card Commands, Focus Result Feedback, Delivery Target, Export/Stem/Package Readiness, Audition Cue, and Next Listening/Handoff Check context before Reference Alignment commands run."
      },
      {
        id: "composer-guide",
        command: "Composer Guide",
        shortcut: "Quick Actions / Readout",
        target: "Drums / 808 / harmony / melody / arrange / finish",
        context:
          "Drums, 808/Bass, Harmony, Melody, Arrange, and Finish writing focus context with destination, guide metric, audition cue, and next check before Composer Guide commands run."
      },
      {
        id: "key-compass",
        command: "Key Compass",
        shortcut: "Quick Actions / Readout",
        target: "Scale / cadence / chords / 808-bass / melody / selected focus",
        context:
          "Scale, Cadence, Chords, 808/Bass, Melody, and Selected Note/Chord harmony context with destination, key metric, audition cue, and next check before Key Compass commands run."
      },
      {
        id: "groove-compass",
        command: "Groove Compass",
        shortcut: "Quick Actions / Readout",
        target: "Density / anchors / hats / timing / chance / pocket / selected drum",
        context:
          "Density, Anchors, Hat Motion, Timing, Chance, Pocket Balance, and Selected Drum context with destination, groove metric, audition cue, cue action, and next check before Groove Compass commands run."
      },
      {
        id: "listening-pass",
        command: "Listening Pass",
        shortcut: "Quick Actions / Readout",
        target: "Composition / arrangement / mix / delivery audition",
        context:
          "Composition, Arrangement, Mix, and Delivery audition checkpoint context with destination, listening metric, audition cue, and next check before Listening Pass commands run."
      },
      {
        id: "beat-passport",
        command: "Beat Passport",
        shortcut: "Quick Actions / Readout",
        target: "Target / length / Pattern A-B-C / readiness / export / stems / master",
        context:
          "Target, Length, Pattern A/B/C, Readiness, Export, Stems, and Master identity context with destination, passport metric, audition cue, and next check before Beat Passport commands run."
      },
      {
        id: "production-snapshot",
        command: "Production Snapshot",
        shortcut: "Quick Actions / Readout",
        target: "Target / form / Pattern A-B-C / mix / handoff",
        context:
          "Target, Form, Pattern A/B/C, Mix, and Handoff session-scan context with destination, snapshot metric, audition cue, and next check before Production Snapshot commands run."
      },
      {
        id: "hook-readiness",
        command: "Hook Readiness",
        shortcut: "Quick Actions / Readout",
        target: "Hook section / motif / contrast / mix support / handoff",
        context:
          "Hook Section, Motif, Contrast, Mix Support, and Handoff hook-quality context with destination, hook metric, audition cue, loop/fix cue, and next check before Hook Readiness commands run."
      },
      {
        id: "topline-space",
        command: "Topline Space",
        shortcut: "Quick Actions / Readout",
        target: "Rhythm pocket / lead room / vocal window / mix headroom / artist cue",
        context:
          "Rhythm Pocket, Lead Room, Vocal Window, Mix Headroom, and Artist Cue context with destination, topline metric, audition cue, loop/fix cue, and next check before Topline Space commands run."
      },
      {
        id: "beat-readiness",
        command: "Beat Readiness",
        shortcut: "Quick Actions / Readout",
        target: "Drums / 808 / melody-chords / arrangement / export",
        context:
          "Drums, 808/Bass, Melody/Chords, Arrangement, and Export readiness context with destination, readiness metric, audition cue, and next check before Beat Readiness commands run."
      },
      {
        id: "review-queue",
        command: "Review Queue",
        shortcut: "Quick Actions / Readout",
        target: "Composition / arrangement / mix-master / target / handoff issues",
        context:
          "Issue Priority, Focus/Fix Actions, Queue Readiness, and Review Fix Preview context with destination, review metric, audition cue, fix action, and next check before Review Queue commands run."
      },
      {
        id: "workflow-navigator",
        command: "Workflow Navigator",
        shortcut: "Quick Actions / Readout",
        target: "Compose / arrange / mix / deliver workflow zones",
        context:
          "Compose, Arrange, Mix, and Deliver workflow-zone context with destination, readiness metric, zone context, audition cue, jump action, and next check before Workflow Navigator commands run."
      },
      {
        id: "workflow-spotlight",
        command: "Workflow Spotlight",
        shortcut: "Quick Actions / Readout",
        target: "Current command target",
        context:
          "Current Command Target, Derived Workflow Zone, Decision Readout, Visible Jump Route, Workflow Navigator Counts, Search Spotlight Relation, Pinned Command Context, Jump Result Feedback, Audition Cue, and Next Workflow Check context before Workflow Spotlight commands run."
      },
      {
        id: "beat-map",
        command: "Beat Map",
        shortcut: "Quick Actions / Readout",
        target: "Workflow stages / song-pattern / export-stem / producer overview",
        context:
          "Start, Compose, Arrange, Polish, Deliver, Song/Pattern Metrics, Export/Stems, Delivery Target, Completion Posture, Action Route, Audition Cue, and Next Check context before Beat Map commands run."
      },
      {
        id: "structure-lens",
        command: "Structure Lens",
        shortcut: "Quick Actions / Readout",
        target: "Target fit / section coverage / hook contrast / energy arc",
        context:
          "Target Fit, Section Coverage, Hook Contrast, Energy Arc, Arrangement Action, Action Route, Audition Cue, and Next Check context before Structure Lens commands run."
      },
      {
        id: "next-move",
        command: "Next Move",
        shortcut: "Quick Actions / Readout",
        target: "Recommendation / route / readiness / export / stems",
        context:
          "Recommended Action, Route, Before/After Posture, Delivery Target, Readiness, Export/Stems, Audition Cue, and Next Check context before Next Move commands run."
      }
    ]
  },
  {
    id: "compose-fast-path",
    title: "Create",
    items: [
      {
        id: "tap-tempo",
        command: "Tap Tempo",
        shortcut: "Quick Actions / Readout",
        target: "Tap pulse / BPM",
        context:
          "Tap Pulse, Tap Tempo Readout Command, BPM Estimate, Delayed Commit, Manual BPM Boundaries, Local Result Metric, Result Feedback, Audition Cue, and Next Tempo Check context before Tap Tempo commands run."
      },
      {
        id: "tempo-nudge",
        command: "Tempo Nudge",
        shortcut: "Quick Actions / Readout",
        target: "-1 / +1 / half / double BPM",
        context:
          "Current BPM, Tempo Nudge Readout Command, -1/+1/Half/Double Routes, Route Metric, Bounded Tempo Result, Tap Reset, Result Feedback, Audition Cue, and Next Tempo Check context before Tempo Nudge commands run."
      },
      {
        id: "swing-feel",
        command: "Swing Feel",
        shortcut: "Quick Actions / Readout",
        target: "Straight / Tight / Laid / Loose",
        context:
          "Swing Feel Readout Command, Straight, Tight, Laid, Loose, Style Default, Current Swing, Target Metric, Result Feedback, Audition Cue, and Next Groove Check context before Swing Feel commands run."
      },
      {
        id: "key-retarget",
        command: "Key Retarget",
        shortcut: "Quick Actions / Readout",
        target: "Project key / event retarget",
        context:
          "Key Retarget Readout Command, Project Key, Key Options, Key Target Metric, Pattern A/B/C Event Retarget, Before/After Result, Edit Pattern, Audition Cue, and Next Key Check context before Key Retarget commands run."
      },
      {
        id: "style-quick-picks",
        command: "Style Quick Picks",
        shortcut: "Quick Actions / Readout",
        target: "Style direction",
        context:
          "Style Direction Readout Command, Style Direction, Style Targets, BPM Range, Swing Default, Bass/Melody Roles, Sound Preset, Pattern/Arrangement Fit, Style Target Metric, Result Feedback, Audition Cue, and Next Style Check context before Style Quick Picks commands run."
      },
      {
        id: "keyboard-capture",
        command: "Keyboard Capture",
        shortcut: "Quick Actions / Readout",
        target: "808 / Synth notes",
        context:
          "Keyboard Capture Armed State, 808/Synth Target, Degree Key Map, Octave/Length/Velocity/Glide Defaults, Capture Result Feedback, Audition Cue, and Next Input Check context before Keyboard Capture commands run."
      },
      {
        id: "capture-step-mode",
        command: "Capture Step Mode",
        shortcut: "Quick Actions / Readout",
        target: "Next / Replace",
        context:
          "Next/Replace Placement Mode, Selected Pattern, Selected Step, Capture Defaults, Input Result Feedback, Audition Cue, and Next Placement Check context before Capture Step Mode commands run."
      },
      {
        id: "midi-input",
        command: "MIDI Input",
        shortcut: "Quick Actions / Readout",
        target: "Controller notes",
        context:
          "Web MIDI Permission, MIDI Armed State, MIDI Input Status, Selected 808/Synth Target, Capture Defaults, Input Result Feedback, Audition Cue, and Next MIDI Check context before MIDI Input commands run."
      },
      {
        id: "editor-audition",
        command: "Editor Audition",
        shortcut: "Quick Actions / Readout",
        target: "Selected events",
        context:
          "Selected Drum/808/Synth/Chord Event, Selected Pattern, One-Shot Audition Route, Runtime Fallback, Audition Result Feedback, and Next Listening Check context before Editor Audition commands run."
      },
      {
        id: "blueprints",
        command: "Beat Blueprints",
        shortcut: "Quick Actions / Readout",
        target: "Sample-free starts",
        context:
          "Sample-Free Style Starts, Current-Style Match, Preview Decision, Preview Listening Cue, Direct Preview/Apply Commands, Blueprint Result Feedback, Audition Cue, and Next Preview/Apply Check context before Beat Blueprints commands run."
      },
      {
        id: "style-inspector",
        command: "Style Inspector",
        shortcut: "Quick Actions / Readout",
        target: "Genre fit / goals / density",
        context:
          "Genre Fit, BPM/Swing, Bass/Melody Roles, Sound Preset, Style Goal Progress, Pattern Density, Focus Result Feedback, Audition Cue, and Next Style Check context before Style Inspector commands run."
      },
      {
        id: "composer-actions",
        command: "Composer Actions",
        shortcut: "Quick Actions / Readout",
        target: "Guided writing moves",
        context:
          "Style-Aware Writing Moves, Route, Scope, Impact, Undo Posture, Direct Composer Action Commands, Result Feedback, Audition Cue, and Next Composer-Action Check context before Composer Actions commands run."
      },
      {
        id: "style-goal-cues",
        command: "Style Goal Cues",
        shortcut: "Quick Actions / Readout",
        target: "Pattern / Song loop",
        context:
          "Pattern/Song Loop Cue, Style Goal Progress, Cue Result Feedback, Matching Result Action, Audition Cue, and Next Style-Goal Check context before Style Goal Cues commands run."
      },
      {
        id: "style-goal-actions",
        command: "Style Goal Actions",
        shortcut: "Quick Actions / Readout",
        target: "Drums / 808 / Harmony / Melody",
        context:
          "Drums, 808/Bass, Harmony, and Melody Goal Actions, Composer Action Route, Style Goal Action Result, Audition Cue, and Next Writing Check context before Style Goal Actions commands run."
      },
      {
        id: "layer-starter",
        command: "Layer Starter",
        shortcut: "Quick Actions / Readout",
        target: "Drums / 808 / Chords / Synth",
        context:
          "Selected Pattern Layer Readiness, Drums/808/Chords/Synth Priority, Visible Priority Action, Direct Layer Starter Commands, Layer Starter Result Feedback, Audition Cue, and Next Layer Check context before Layer Starter commands run."
      },
      {
        id: "pattern-stack",
        command: "Pattern Stack",
        shortcut: "Quick Actions / Readout",
        target: "808 / chords / synth sketch",
        context:
          "Selected Pattern 808/Chord/Synth Posture, Pattern Stack Preview, Suggested Stack, Direct Stack Pad Commands, Pattern Stack Result Feedback, Audition Cue, and Next Stack Check context before Pattern Stack commands run."
      },
      {
        id: "pattern-compare",
        command: "Pattern Compare",
        shortcut: "Quick Actions / Readout",
        target: "Cue / use Pattern A/B/C",
        context:
          "Pattern A/B/C Cue/Use Cards, Selected/Cued Pattern, Selected-Block Placement, Direct Pattern Cue/Switch/Use Commands, Pattern Compare Result Feedback, Audition Cue, and Next Pattern Check context before Pattern Compare commands run."
      },
      {
        id: "pattern-compare-decision",
        command: "Pattern Compare Decision",
        shortcut: "Quick Actions / Readout",
        target: "Current Cue / Use recommendation",
        context:
          "Cue/Use Recommendation, Selected Pattern A/B/C, Selected-Block Placement, Visible Readout Action, Pattern Compare Decision Command, Pattern Compare Result Feedback, Audition Cue, and Next Decision Check context before Pattern Compare Decision commands run."
      },
      {
        id: "pattern-dna",
        command: "Pattern DNA",
        shortcut: "Quick Actions / Readout",
        target: "Layers / density / variation",
        context:
          "Selected Pattern Layers, Density, Dynamics, Variation, Arrangement Use, Focus Readout, Direct Pattern DNA Card Commands, Focus Result Feedback, Audition Cue, and Next Loop Check context before Pattern DNA commands run."
      },
      {
        id: "pattern-variation",
        command: "Pattern Variation",
        shortcut: "Quick Actions / Readout",
        target: "Hook / breakdown variation",
        context:
          "Selected Pattern Variation Suggestion, Subtle/Hook/Break Target, Pattern Variation Preview, Direct Variation Commands, Pattern Variation Result Feedback, Audition Cue, and Next Variation Check context before Pattern Variation commands run."
      },
      {
        id: "pattern-fill",
        command: "Pattern Fill",
        shortcut: "Quick Actions / Readout",
        target: "Tail moves",
        context:
          "Selected Pattern Tail-Move Suggestion, Drum Fill/808 Pickup/Melody Turn/Clear Tail Target, Pattern Fill Preview, Direct Fill Commands, Pattern Fill Result Feedback, Audition Cue, and Next Tail Check context before Pattern Fill commands run."
      },
      {
        id: "pattern-clone",
        command: "Pattern Clone",
        shortcut: "Quick Actions / Readout",
        target: "Clone to A/B/C",
        context:
          "Selected Pattern Clone Suggestion, Safest Target Slot, Hook/Breakdown Variation, Direct Clone-to-A/B/C Commands, Pattern Clone Result Feedback, Audition Cue, and Next Clone Check context before Pattern Clone commands run."
      },
      {
        id: "pattern-copy-clear",
        command: "Pattern Copy / Clear",
        shortcut: "Quick Actions / Readout",
        target: "Copy / reset Patterns",
        context:
          "Selected Pattern Copy/Clear Commands, Source/Target Pattern, Selected-Pattern Clear, Pattern Edit Result Feedback, Audition Cue, and Next Pattern Edit Check context before Pattern Copy/Clear commands run."
      },
      {
        id: "drum-move",
        command: "Drum Move",
        shortcut: "Quick Actions / Readout",
        target: "Foundation / feel / accent",
        context:
          "Drum Foundation/Groove Feel/Drum Accent Preview, Current Drum Move Target, Direct Drum Move Command, Drum Move Result Feedback, Selected Pattern, Audition Cue, and Next Drum Check context before Drum Move commands run."
      },
      {
        id: "808-move",
        command: "808 Move",
        shortcut: "Quick Actions / Readout",
        target: "Bassline / glide / contour",
        context:
          "808 Bassline/Glide/Contour Preview, Current 808 Move Target, Direct 808 Move Command, 808 Move Result Feedback, Selected Pattern, Audition Cue, and Next Bass Check context before 808 Move commands run."
      },
      {
        id: "melody-move",
        command: "Melody Move",
        shortcut: "Quick Actions / Readout",
        target: "Motif / accent / contour",
        context:
          "Melody Motif/Accent/Contour Preview, Current Melody Move Target, Direct Melody Move Command, Melody Move Result Feedback, Selected Pattern, Audition Cue, and Next Melody Check context before Melody Move commands run."
      },
      {
        id: "chord-move",
        command: "Chord Move",
        shortcut: "Quick Actions / Readout",
        target: "Pads / rhythm / voicing",
        context:
          "Chord Pads/Rhythm/Voicing Preview, Current Chord Move Target, Direct Chord Move Command, Chord Move Result Feedback, Selected Pattern, Audition Cue, and Next Harmony Check context before Chord Move commands run."
      },
      {
        id: "selected-event-tools",
        command: "Selected Event Tools",
        shortcut: "Quick Actions / Readout",
        target: "Drum / note / chord edits",
        context:
          "Selected Drum Pocket, Selected Note Degree/Role, Selected Chord Harmonic Readout, Direct Selected-Event Edit/Reset/Velocity/Audition Commands, Delete Feedback, Audition Cue, and Next Manual Edit Check context before Selected Event Tools commands run."
      },
      {
        id: "pattern-playback-readout",
        command: "Pattern Playback Readout",
        shortcut: "Quick Actions / Readout",
        target: "Edit vs heard Pattern",
        context:
          "Edit-vs-Heard Pattern Readout, Selected Editing Pattern, Audible Pattern, Event-Count Context, Pattern Playback Readout Command, Local Result Metric, Audible Pattern Follow Action, Follow Command, Audition Cue, and Next Listening Check context before Pattern Playback Readout commands run."
      },
      {
        id: "audible-pattern-follow",
        command: "Audible Pattern Follow",
        shortcut: "Quick Actions / Readout",
        target: "Heard Pattern",
        context:
          "Pattern Playback Readout Context, Heard Pattern Target, Explicit Follow Action, Audible Pattern Follow Command, Follow Result Feedback, Audition Cue, and Next Edit-Focus Check context before Audible Pattern Follow commands run."
      }
    ]
  },
  {
    id: "sound-fast-path",
    title: "Sound",
    items: [
      {
        id: "sound-preset-decision",
        command: "Sound Preset Decision",
        shortcut: "Quick Actions / Readout",
        target: "Suggested full-tone preset",
        context:
          "Sound Preset Preview Decision Readout, Suggested Full-Tone Preset, Current/Direct Sound Preset Commands, Before/After Tone Posture, Result Metrics, Audition Cue, and Next Tone Check context before Sound Preset Decision commands run."
      },
      {
        id: "sound-preset",
        command: "Sound Preset",
        shortcut: "Quick Actions / Readout",
        target: "Full-tone presets",
        context:
          "Sound Preset Preview, Explicit Apply Path, Current/Direct Full-Tone Preset Commands, Before/After Drums/808/Duck/Synth/Chords Posture, Result Feedback, Audition Cue, and Next Tone Check context before Sound Preset commands run."
      },
      {
        id: "drum-kit-decision",
        command: "Drum Kit Decision",
        shortcut: "Quick Actions / Readout",
        target: "Suggested drum kit",
        context:
          "Drum Kit Preview Decision Readout, Suggested Built-In Kick/Clap/Hat Kit, Current/Direct Drum Kit Commands, Drum Rack Posture, Result Metrics, Audition Cue, and Next Kit Check context before Drum Kit Decision commands run."
      },
      {
        id: "drum-kit",
        command: "Drum Kit",
        shortcut: "Quick Actions / Readout",
        target: "Kick / clap / hat tone",
        context:
          "Drum Kit Preview, Explicit Pad Apply Path, Current/Direct Built-In Kit Commands, Before/After Kick/Clap/Hat Tone, Drum Rack Posture, Result Feedback, Audition Cue, and Next Kit Check context before Drum Kit commands run."
      },
      {
        id: "sound-focus-decision",
        command: "Sound Focus Decision",
        shortcut: "Quick Actions / Readout",
        target: "Suggested tone focus",
        context:
          "Sound Focus Preview Decision Readout, Suggested 808/Synth/Chords Tone-Focus Target, Current/Direct Sound Focus Commands, Before/After Tone Posture, Result Metrics, Audition Cue, and Next Focus Check context before Sound Focus Decision commands run."
      },
      {
        id: "sound-focus",
        command: "Sound Focus",
        shortcut: "Quick Actions / Readout",
        target: "808 / Synth / Chords",
        context:
          "Sound Focus Preview, Explicit Pad Apply Path, Current/Direct 808/Synth/Chords Focus Commands, Before/After Tone Posture, Result Feedback, Audition Cue, and Next Focus Check context before Sound Focus commands run."
      },
      {
        id: "timbre-check",
        command: "Timbre Check",
        shortcut: "Quick Actions / Readout",
        target: "Drums / 808 / air / width",
        context:
          "Timbre Check Drums/808/Air/Width/Warmth Balance, Focus Suggestion, Existing Sound Focus Apply Route, Result Metric, Audition Cue, and Next Tone Check context before Timbre Check commands run."
      },
      {
        id: "sound-snapshot-decision",
        command: "Sound Snapshot A/B Decision",
        shortcut: "Quick Actions / Readout",
        target: "Capture / recall recommendation",
        context:
          "Sound Snapshot A/B Readout Action, Capture/Recall Recommendation, A/B Slot State, Capture/Recall/Clear Commands, Tone-Pass Comparison Metrics, Audition Cue, and Next Snapshot Check context before Sound Snapshot A/B Decision commands run."
      },
      {
        id: "sound-snapshot-ab",
        command: "Sound Snapshot A/B",
        shortcut: "Quick Actions / Readout",
        target: "Tone-pass compare",
        context:
          "Sound Snapshot A/B Comparison, A/B Slot State, Capture/Recall/Clear Commands, Preset/Drum/808/Synth/Chords Comparison, Result Feedback, Audition Cue, and Next Snapshot Check context before Sound Snapshot A/B commands run."
      },
      {
        id: "space-fx-decision",
        command: "Space FX Decision",
        shortcut: "Quick Actions / Readout",
        target: "Suggested send space",
        context:
          "Space FX Preview Decision Readout, Suggested Dry/Room/Wide/Wash Send Posture, Current/Direct Space FX Commands, Result Metrics, Audition Cue, and Next Space Check context before Space FX Decision commands run."
      },
      {
        id: "space-fx",
        command: "Space FX",
        shortcut: "Quick Actions / Readout",
        target: "Dry / room / wide / wash",
        context:
          "Space FX Preview, Dry/Room/Wide/Wash Pad Posture, Current/Direct Space FX Commands, Send-Change Preview, Result Feedback, Audition Cue, and Next Space Check context before Space FX commands run."
      }
    ]
  },
  {
    id: "arrange-fast-path",
    title: "Arrange",
    items: [
      {
        id: "pattern-chain",
        command: "Pattern Chain",
        shortcut: "Quick Actions / Readout",
        target: "8-bar sketch",
        context:
          "Pattern Chain Preview, Preview Decision Readout, Priority Readout, Direct Pattern Chain Commands, Pattern A/B/C Sequence, Chain Expand Access, Result Feedback, Audition Cue, and Next Chain Check context before Pattern Chain commands run."
      },
      {
        id: "chain-expand",
        command: "Chain Expand",
        shortcut: "Quick Actions / Readout",
        target: "16-bar outline",
        context:
          "Pattern Chain Preview Expand Target, 16-Bar Song-Form Outline, Priority Readout Context, Quick Actions Chain Expand Command, Before/After Arrangement Sequence, Pattern Chain Result Feedback, Audition Cue, and Next Expand Check context before Chain Expand commands run."
      },
      {
        id: "arrangement-template",
        command: "Arrangement Template",
        shortcut: "Quick Actions / Readout",
        target: "Song form",
        context:
          "Arrangement Template Preview, Preview Decision Readout, Priority Readout, Current/Direct Template Commands, Section Flow Before/After, Result Feedback, Audition Cue, and Next Template Check context before Arrangement Template commands run."
      },
      {
        id: "arrangement-arc",
        command: "Arrangement Arc",
        shortcut: "Quick Actions / Readout",
        target: "Energy shape",
        context:
          "Arrangement Arc Preview, Preview Decision Readout, Priority Readout, Current/Direct Arc Commands, Section Energy Before/After, Result Feedback, Audition Cue, and Next Arc Check context before Arrangement Arc commands run."
      },
      {
        id: "arrangement-focus",
        command: "Arrangement Focus",
        shortcut: "Quick Actions / Readout",
        target: "Selected block",
        context:
          "Arrangement Focus Preview, Preview Decision Readout, Priority Readout, Current/Direct Focus Commands, Selected-Block Before/After, Result Feedback, Audition Cue, and Next Focus Check context before Arrangement Focus commands run."
      },
      {
        id: "arrangement-move",
        command: "Arrangement Move",
        shortcut: "Quick Actions / Readout",
        target: "Drop / build / hook lift",
        context:
          "Arrangement Move Preview Decision Readout, Priority Readout, Current Drop/Build/Hook Lift Move, Selected-Block Energy/Mute Before/After, Result Feedback, Audition Cue, and Next Move Check context before Arrangement Move commands run."
      },
      {
        id: "section-locator",
        command: "Section Locator",
        shortcut: "Quick Actions / Readout",
        target: "Intro / verse / hook",
        context:
          "Section Locator Cue Decision Readout, Priority Readout, Direct Intro/Verse/Hook/Bridge/Outro Cue Commands, Arrangement Block Cue Feedback, Section Cue Result, Audition Cue, and Next Section Check context before Section Locator commands run."
      },
      {
        id: "song-form-overview",
        command: "Song Form Overview",
        shortcut: "Quick Actions / Readout",
        target: "Section flow / Pattern A/B/C / energy / mutes / transitions",
        context:
          "Section Flow, Pattern A/B/C Usage, Bar Ranges, Energy, Muted Tracks, Transition Posture, Priority Action, Action Route, Audition Cue, and Next Check context before Song Form Overview commands run."
      },
      {
        id: "arrangement-mute-map",
        command: "Arrangement Mute Map",
        shortcut: "Quick Actions / Readout",
        target: "Layer dropouts / mute-live posture / priority lane",
        context:
          "Layer Dropout, Section Mute/Live Posture, Priority Lane, Focus Route, Audition Cue, and Next Check context before Arrangement Mute Map commands run."
      },
      {
        id: "arrangement-transition-map",
        command: "Arrangement Transition Map",
        shortcut: "Quick Actions / Readout",
        target: "Section handoffs / energy / mutes / transition cue",
        context:
          "Section Handoff, Pattern A/B/C, Energy Change, Muted-Layer Change, Event Density, Priority Handoff, Focus/Cue Route, Audition Cue, and Next Check context before Arrangement Transition Map commands run."
      },
      {
        id: "arrangement-playback-readout",
        command: "Arrangement Playback Readout",
        shortcut: "Quick Actions / Readout",
        target: "Edit block / heard block / Pattern A/B/C / bar context",
        context:
          "Edit-vs-Heard Block, Selected Block, Audible Block, Pattern A/B/C, Bar Context, Arrangement Playback Readout Command, Local Result Metric, Follow Action, Audition Cue, and Next Check context before Arrangement Playback Readout commands run."
      },
      {
        id: "audible-arrangement-follow",
        command: "Audible Arrangement Follow",
        shortcut: "Quick Actions / Readout",
        target: "Heard block / explicit follow / edit alignment",
        context:
          "Heard Block, Current Edit Block, Pattern Assignment, Bar Range, Follow Route, Follow Result, Audition Cue, and Next Check context before Audible Arrangement Follow commands run."
      }
    ]
  },
  {
    id: "mix-fast-path",
    title: "Mix",
    items: [
      {
        id: "stem-audition-readout",
        command: "Stem Audition Readout",
        shortcut: "Quick Actions / Readout",
        target: "Full Mix / stem posture / solo-mute state",
        context:
          "Full Mix, Soloed Stem, Manual Audition State, Mixer Solo/Mute Posture, Decision Target, Audition Cue, and Next Check context before Stem Audition Readout commands run."
      },
      {
        id: "stem-audition-decision",
        command: "Stem Audition Decision",
        shortcut: "Quick Actions / Readout",
        target: "Next full-mix or stem comparison",
        context:
          "Next Full Mix or Stem Target, Decision Action, Direct Stem Routes, Current Audition Posture, Audition Cue, and Next Check context before Stem Audition Decision commands run."
      },
      {
        id: "stem-audition",
        command: "Stem Audition",
        shortcut: "Quick Actions / Readout",
        target: "Full Mix / Drums / 808 / Synth / Chords audition",
        context:
          "Full Mix, Drums, 808/Bass, Synth, and Chords audition routes with current posture, mixer solo/mute state, result feedback, audition cue, and next check before Stem Audition commands run."
      },
      {
        id: "mix-snapshot-decision",
        command: "Mix Snapshot A/B Decision",
        shortcut: "Quick Actions / Readout",
        target: "Capture / recall / listen-next recommendation",
        context:
          "Decision Target, A/B Slot State, Capture/Recall/Clear Route, Current Mix/Export Posture, Audition Cue, and Next Check context before Mix Snapshot A/B Decision commands run."
      },
      {
        id: "mix-snapshot-ab",
        command: "Mix Snapshot A/B",
        shortcut: "Quick Actions / Readout",
        target: "Headroom / balance / master / stem-pass compare",
        context:
          "Headroom, Balance, Master Output, Stem-Pass Comparison, A/B Slot State, Capture/Recall/Clear Commands, Audition Cue, and Next Check context before Mix Snapshot A/B commands run."
      },
      {
        id: "mix-balance-decision",
        command: "Mix Balance Decision",
        shortcut: "Quick Actions / Readout",
        target: "Suggested rough-balance preview / apply route",
        context:
          "Suggested Rough-Balance Target, Preview/Apply Posture, Editable Channel Scope, Drums/808/Synth/Chords Channel Posture, Direct Pad Route, Audition Cue, and Next Check context before Mix Balance Decision commands run."
      },
      {
        id: "mix-balance",
        command: "Mix Balance",
        shortcut: "Quick Actions / Readout",
        target: "Current rough-balance target / direct balance pads",
        context:
          "Current Rough-Balance Target, Direct Balance Pad Routes, Editable Channel Scope, Drums/808/Synth/Chords Channel Posture, Result Feedback, Audition Cue, and Next Check context before Mix Balance commands run."
      },
      {
        id: "mix-coach",
        command: "Mix Coach",
        shortcut: "Quick Actions / Readout",
        target: "Priority mix metric / focus diagnostics",
        context:
          "Priority Mix Metric, Headroom, Balance, Limiter, Dynamics, Stem-Spread Diagnostics, Focus Route, Audition Cue, and Next Check context before Mix Coach commands run."
      },
      {
        id: "mix-fix",
        command: "Mix Fix",
        shortcut: "Quick Actions / Readout",
        target: "Headroom / stem balance / low-end apply route",
        context:
          "Mix Coach Priority, Mix Fix Preview, Headroom/Stem Balance/Low End Apply Routes, Result Feedback, Editable Mixer/Master Scope, Audition Cue, and Manual-Trim Next Check context before Mix Fix commands run."
      }
    ]
  },
  {
    id: "finish-fast-path",
    title: "Finish",
    items: [
      {
        id: "master-finish-decision",
        command: "Master Finish Decision",
        shortcut: "Quick Actions / Readout",
        target: "Suggested output posture / finish apply route",
        context:
          "Suggested Output Posture, Current Finish Target, Preset, Ceiling, Output Gain, Direct Finish Pad Route, Audition Cue, and Export/Manual-Trim Next Check context before Master Finish Decision commands run."
      },
      {
        id: "master-finish",
        command: "Master Finish",
        shortcut: "Quick Actions / Readout",
        target: "Current output posture / direct finish pads",
        context:
          "Current Output Posture, Preset, Ceiling, Output Gain, Direct Finish Pad Routes, Result Feedback, Audition Cue, and Export/Manual-Trim Next Check context before Master Finish commands run."
      },
      {
        id: "master-automation-decision",
        command: "Master Automation Decision",
        shortcut: "Quick Actions / Readout",
        target: "Suggested fade posture / automation apply route",
        context:
          "Suggested Fade Posture, Current Automation Target, Editable Fade Event Range, Direct Fade Pad Route, Playback/Export Gain Scope, Audition Cue, and Export/Manual-Trim Next Check context before Master Automation Decision commands run."
      },
      {
        id: "master-automation",
        command: "Master Automation",
        shortcut: "Quick Actions / Readout",
        target: "Current fade posture / direct fade pads",
        context:
          "Current Fade Posture, Automation Target, Editable Fade Event Range, Direct Fade Pad Routes, Playback/Export Gain Scope, Result Feedback, Audition Cue, and Export/Manual-Trim Next Check context before Master Automation commands run."
      },
      {
        id: "export-meter",
        command: "Export Meter",
        shortcut: "Readout",
        target: "Peak / RMS / dynamics / headroom / limiter",
        context:
          "Peak, RMS, Dynamics, Headroom, Limiter Activity, Master Ceiling, Arrangement Duration, Mix Coach Follow-Up, Export Preflight Route, Audition Cue, and Manual-Trim Next Check context before Export Meter review."
      },
      {
        id: "master-output-role",
        command: "Master Output Role",
        shortcut: "Readout",
        target: "Preset / export status / ceiling / output gain / headroom",
        context:
          "Master Preset, Export Status, Master Ceiling, Output Gain, Headroom, Limiter Activity, Export Meter Review, Mix Coach Follow-Up, Handoff Sheet Context, Audition Cue, and Manual-Trim Next Check context before Master Output Role review."
      },
      {
        id: "finish-checklist",
        command: "Finish Checklist",
        shortcut: "Quick Actions / Readout",
        target: "Finish readiness / priority focus route",
        context:
          "Compose, Arrange, Mix, Master, Master Automation, Handoff Readiness, Priority Readout, Direct Checklist Card Routes, Focus Result, Audition Cue, and Export/Manual-Trim Next Check context before Finish Checklist commands run."
      },
      {
        id: "handoff-pack",
        command: "Handoff Pack",
        shortcut: "Quick Actions / Readout",
        target: "Deliverable set / send-order route",
        context:
          "WAV, Stems, MIDI, Handoff Sheet, Handoff Route, Manifest Readiness, Latest Export Receipt, Export Format, Package Check, Send Order, Next Export, Review Handoff Pack command, local result metric, Audition Cue, and Next Delivery Check context before Handoff Pack commands run."
      }
    ]
  },
  {
    id: "deliver-fast-path",
    title: "Deliver",
    items: [
      {
        id: "delivery-target-alignment",
        command: "Delivery Target Alignment",
        shortcut: "Quick Actions / Readout",
        target: "Target fit / alignment preview route",
        context:
          "Selected Target, Target Fit, Target Length, Arrangement Length, Master Posture, Mix Posture, Stem Expectation, Session Brief Context, Package Readiness, Audition Cue, and Next Delivery Check context before Delivery Target Alignment commands run."
      },
      {
        id: "export-preflight",
        command: "Export Preflight",
        shortcut: "Quick Actions / Readout",
        target: "Readiness / mix / handoff risk",
        context:
          "Selected Delivery Target, Export Readiness, Mix/Master Risk, Master Automation Posture, WAV/Stem/MIDI Deliverables, Session Brief/Handoff Sheet Context, Package Readiness, Priority Readout, Audition Cue, and Next Export Preflight Check context before Export Preflight commands run."
      },
      {
        id: "export-format-readout",
        command: "Export Format Readout",
        shortcut: "Quick Actions / Readout",
        target: "WAV / stems / MIDI / sheet",
        context:
          "WAV Format, Duration, Full-Mix File, Stem Count, Audible Stems, MIDI Scope, Handoff Sheet Context, Export Format Priority, Direct Metric Routes, Handoff Pack Follow-Up, Audition Cue, and Next Export Check context before Export Format Readout commands run."
      },
      {
        id: "handoff-send-order",
        command: "Handoff Send Order",
        shortcut: "Quick Actions / Readout",
        target: "WAV -> stems -> MIDI -> sheet",
        context:
          "WAV/Stems/MIDI/Handoff Sheet Sequence, Current Next Deliverable, Send Order Status, Package Readiness, Latest Export Receipt, Handoff Next Export Target, Handoff Pack Follow-Up, Direct Export Scope, Audition Cue, and Next Handoff Check context before Handoff Send Order commands run."
      },
      {
        id: "handoff-manifest-audit",
        command: "Handoff Manifest Audit",
        shortcut: "Quick Actions / Readout",
        target: "Planned files / readiness",
        context:
          "Planned WAV/Stems/MIDI/Handoff Sheet Readiness, Latest Export Receipt Context, Next Missing Delivery Step, Manifest Status, Package Readiness, Handoff Pack Follow-Up, Focus Route, Audition Cue, and Next Manifest Check context before Handoff Manifest Audit commands run."
      },
      {
        id: "handoff-export-receipt",
        command: "Handoff Export Receipt",
        shortcut: "Quick Actions / Readout",
        target: "Latest export receipt",
        context:
          "Latest Explicit WAV/Stem/MIDI/Handoff Sheet Receipt, Deliverable/File Context, Receipt Focus Route, Direct Export Result Metrics, Package Readiness, Handoff Pack Follow-Up, Audition Cue, and Next Receipt Check context before Handoff Export Receipt commands run."
      },
      {
        id: "handoff-package-check",
        command: "Handoff Package Check",
        shortcut: "Quick Actions / Readout",
        target: "File set / send order",
        context:
          "File-Set Readiness, Send Order Status, Latest Export Receipt, Session Brief Context, Package Priority, Focus Route, Direct Package Result Metrics, Audition Cue, and Next Package Check context before Handoff Package Check commands run."
      },
      {
        id: "handoff-next-export",
        command: "Handoff Next Export",
        shortcut: "Quick Actions / Readout",
        target: "Next deliverable",
        context:
          "Current Next WAV/Stem/MIDI/Handoff Sheet Deliverable, Explicit Export Route, Deliverable/File Context, Delivery Target, Package Readiness, Send Order Status, Latest Export Receipt, Audition Cue, and Next Handoff Step context before Handoff Next Export commands run."
      },
      {
        id: "direct-exports",
        command: "Direct Exports",
        shortcut: "Quick Actions / Readout",
        target: "WAV / stems / MIDI / sheet",
        context:
          "Explicit WAV/Stem/MIDI/Handoff Sheet Commands, Deliverable/File Context, Delivery Target, Direct Export Result Metrics, Latest Export Receipt, Package Readiness, Send Order Next Step, Audition Cue, and Next Handoff Check context before Direct Exports commands run."
      }
    ]
  }
];

const beatTermItems: BeatTermItem[] = [
  { id: "pattern", term: "Pattern", meaning: "A/B/C loop with editable drum, 808, chord, and synth events.", target: "Compose" },
  { id: "drums", term: "Drums", meaning: "Kick, clap/snare, hats, perc, timing, chance, and pocket.", target: "Groove" },
  { id: "bass-808", term: "808/Bass", meaning: "Synth low-end notes with glide, drive, decay, and kick duck.", target: "Low end" },
  { id: "chords", term: "Chords", meaning: "Harmony bed, cadence, voicing, rhythm, velocity, and chance.", target: "Harmony" },
  { id: "swing", term: "Swing", meaning: "Timing offset that changes groove feel without changing BPM.", target: "Groove" },
  { id: "velocity-chance", term: "Velocity / Chance", meaning: "Per-event loudness and probability used to shape dynamics and variation.", target: "Events" },
  { id: "style-profile", term: "Style Profile", meaning: "Editable genre direction for BPM, swing, bass role, melody role, and sound goals.", target: "Style" },
  { id: "beat-blueprint", term: "Beat Blueprint", meaning: "Sample-free starter beat for a style that stays fully editable after Apply.", target: "Start" },
  { id: "sound", term: "Sound", meaning: "Preset, kit, focus, timbre, and A/B tone passes.", target: "Tone" },
  { id: "arrangement", term: "Arrangement", meaning: "Song sections, pattern blocks, energy, mutes, and transitions.", target: "Song" },
  { id: "section", term: "Section", meaning: "Arrangement block role such as intro, verse, hook, bridge, or outro.", target: "Arrange" },
  { id: "hook", term: "Hook", meaning: "Memorable section or motif that carries the beat's main idea.", target: "Arrange" },
  { id: "pattern-chain", term: "Pattern Chain", meaning: "Sequence of Pattern A/B/C choices that turns a loop into song form.", target: "Arrange" },
  { id: "space-fx", term: "Space FX", meaning: "Shared room, wide, or wash send that places tracks in a mix space.", target: "Sound" },
  { id: "stem", term: "Stem", meaning: "A separate exported track group such as Drums, 808, Synth, or Chords.", target: "Mix" },
  { id: "headroom", term: "Headroom", meaning: "Output space before clipping or limiting, checked before mix and export decisions.", target: "Mix" },
  { id: "mix-master", term: "Mix / Master", meaning: "Channel balance, space, headroom, dynamics, fades, and output.", target: "Finish" },
  { id: "export-meter", term: "Export Meter", meaning: "Peak, RMS, dynamics, and headroom readout used before delivery.", target: "Mix" },
  { id: "master-automation", term: "Master Automation", meaning: "Editable master volume fades that affect playback, full-mix WAV, and stem exports.", target: "Finish" },
  { id: "beat-readiness", term: "Beat Readiness", meaning: "Local checks for drums, 808/bass, melody/chords, arrangement, and export signal.", target: "Guide" },
  { id: "delivery-target", term: "Delivery Target", meaning: "Local release or handoff goal that shapes arrangement, mix, stem, and brief checks.", target: "Deliver" },
  { id: "midi", term: "MIDI", meaning: "Exported note data for drums, 808, synth, and chords without audio files.", target: "Deliver" },
  { id: "handoff-sheet", term: "Handoff Sheet", meaning: "Local text summary of beat settings, brief, arrangement, and export notes.", target: "Deliver" },
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
  return commandReferenceMatchesQuery([section.title, item.command, item.shortcut, item.target, item.context ?? ""], query);
}

function commandReferenceItemLabel(section: CommandReferenceSection, item: CommandReferenceItem): string {
  return `${section.title}: ${item.command} / ${item.shortcut} / ${item.target}${item.context ? ` / ${item.context}` : ""}`;
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
    const context = firstCommand.context ? `${firstCommand.target} / ${firstCommand.context}` : firstCommand.target;

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
  pinnedResult,
  query,
  recentActionSource,
  recentResult,
  recents,
  searchHintResult,
  searchRecoveryResult,
  searchResult,
  scope,
  scopeResult,
  scopeOptions,
  onClose,
  onApplySearchHint,
  onInspectPinnedAction,
  onInspectRecentAction,
  onQueryChange,
  onRecoverSearchClear,
  onRecoverSearchScope,
  onRun,
  onScopeChange,
  onTogglePin
}: {
  actions: QuickAction[];
  inspectedPinnedActionId: string | null;
  inspectedRecentActionId: string | null;
  open: boolean;
  pinnedActionIds: string[];
  pinnedResult: QuickActionPinnedResult | null;
  query: string;
  recentActionSource: QuickAction[];
  recentResult: QuickActionRecentResult | null;
  recents: QuickActionRecent[];
  searchHintResult: QuickActionSearchHintResult | null;
  searchRecoveryResult: QuickActionSearchRecoveryResult | null;
  searchResult: QuickActionSearchResult | null;
  scope: QuickActionScopeId;
  scopeResult: QuickActionScopeResult | null;
  scopeOptions: QuickActionScopeOption[];
  onClose: () => void;
  onApplySearchHint: (term: string) => void;
  onInspectPinnedAction: (actionId: string | null) => void;
  onInspectRecentAction: (actionId: string | null) => void;
  onQueryChange: (query: string) => void;
  onRecoverSearchClear: () => void;
  onRecoverSearchScope: (scope: QuickActionScopeId) => void;
  onRun: (action: QuickAction) => void;
  onScopeChange: (scope: QuickActionScopeId) => void;
  onTogglePin: (action: QuickAction) => void;
}): ReactElement | null {
  if (!open) {
    return null;
  }

  const firstRunnableAction = actions.find((action) => !action.disabled);
  const spotlight = createQuickActionSpotlightSummary(actions, firstRunnableAction, scope, scopeOptions, query);
  const searchRecovery = createQuickActionSearchRecovery(query, scope, scopeOptions, actions.length);
  const searchHints = createQuickActionSearchHints(query, scope, recentActionSource);
  const pinnedActions = createQuickActionPinnedOptions(pinnedActionIds, recentActionSource);
  const recentActions = createQuickActionRecentOptions(recents, recentActionSource);
  const inspectedPinnedAction = pinnedActions.find((action) => action.id === inspectedPinnedActionId) ?? null;
  const inspectedRecentAction = recentActions.find(({ action }) => action.id === inspectedRecentActionId) ?? null;
  const guideSuggestionAction =
    query.trim().length === 0 && (scope === "all" || scope === "project")
      ? recentActionSource.find((action) => action.id === "guide-quick-start") ?? null
      : null;
  const guideBottleneckSuggestionAction =
    query.trim().length === 0 && (scope === "all" || scope === "project")
      ? recentActionSource.find((action) => action.id === "guide-bottleneck-focus") ?? null
      : null;
  const guideSuggestionPinned = guideSuggestionAction ? pinnedActionIds.includes(guideSuggestionAction.id) : false;
  const guideBottleneckSuggestionPinned = guideBottleneckSuggestionAction
    ? pinnedActionIds.includes(guideBottleneckSuggestionAction.id)
    : false;
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
  const guideSuggestionCompletion = guideSuggestionAction
    ? quickActionGuideSuggestionCompletion(guideSuggestionAction.detail)
    : "Completion: not scored";
  const guideSuggestionBreakdown = guideSuggestionAction
    ? quickActionGuideSuggestionBreakdown(guideSuggestionAction.detail)
    : "Breakdown: not scored";
  const guideSuggestionBottleneck = guideSuggestionAction
    ? quickActionGuideSuggestionBottleneck(guideSuggestionAction.detail)
    : "Bottleneck: not scored";
  const guideSuggestionAfterRun = guideSuggestionAction
    ? quickActionGuideSuggestionAfterRun(guideSuggestionAction.detail)
    : "After run: inspect the focused guide target before editing.";
  const guideBottleneckSuggestionTarget = guideBottleneckSuggestionAction
    ? quickActionGuideSuggestionTarget(guideBottleneckSuggestionAction.title, guideBottleneckSuggestionAction.detail)
    : "Bottleneck command: unavailable";
  const guideBottleneckSuggestionLabel = guideBottleneckSuggestionAction
    ? `Bottleneck command: ${guideBottleneckSuggestionTarget.replace("Target: ", "")}`
    : "Bottleneck command: unavailable";
  const guideBottleneckSuggestionMetric = guideBottleneckSuggestionAction
    ? quickActionGuideSuggestionMetric(guideBottleneckSuggestionAction.detail).replace("Metric: ", "Bottleneck metric: ")
    : "Bottleneck metric: unavailable";
  const guideBottleneckSuggestionCheck = guideBottleneckSuggestionAction
    ? quickActionGuideSuggestionAfterRun(guideBottleneckSuggestionAction.detail).replace("After run: ", "Bottleneck check: ")
    : "Bottleneck check: unavailable";
  const guideSuggestionPinCapacity = `Pin slots: ${pinnedActions.length}/${maxQuickActionPins} used`;
  const guideSuggestionPinHint =
    pinnedActions.length >= maxQuickActionPins
      ? "Pin hint: next new pin keeps the newest session commands."
      : "Pin hint: guide and bottleneck pins stay session-local.";
  const guideSuggestionRecent = recentActions.find(
    ({ action }) => action.id === "guide-quick-start" || action.id === "guide-bottleneck-focus"
  );
  const guideSuggestionRecentState = guideSuggestionRecent
    ? `Recent guide run: ${guideSuggestionRecent.action.title} / ${guideSuggestionRecent.recent.status}`
    : "Recent guide run: none this session";
  const guideSuggestionRecentTarget = guideSuggestionRecent
    ? `Recent target: ${quickActionGuideSuggestionTarget(guideSuggestionRecent.action.title, guideSuggestionRecent.action.detail).replace(
        "Target: ",
        ""
      )}`
    : "Recent target: none";

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
        {searchHints.length > 0 && (
          <div className="quick-actions-search-hints" data-testid="quick-actions-search-hints">
            <span data-testid="quick-actions-search-hints-label">Search hints</span>
            {searchHints.map((hint) => (
              <button
                data-search-hint={hint.term}
                data-testid={`quick-actions-search-hint-${hint.term}`}
                key={hint.term}
                onClick={() => onApplySearchHint(hint.term)}
                title={`${hint.label}: ${hint.detail}`}
                type="button"
              >
                <strong>{hint.label}</strong>
                <small data-testid={`quick-actions-search-hint-count-${hint.term}`}>{hint.detail}</small>
              </button>
            ))}
          </div>
        )}
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
        {searchResult && <QuickActionSearchResultStrip result={searchResult} />}
        {searchHintResult && <QuickActionSearchHintResultStrip result={searchHintResult} />}
        {searchRecoveryResult && <QuickActionSearchRecoveryResultStrip result={searchRecoveryResult} />}
        {scopeResult && <QuickActionScopeResultStrip result={scopeResult} />}
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
              <small className="quick-actions-guide-suggestion-breakdown" data-testid="quick-actions-guide-suggestion-breakdown">
                {guideSuggestionBreakdown}
              </small>
              <small className="quick-actions-guide-suggestion-bottleneck" data-testid="quick-actions-guide-suggestion-bottleneck">
                {guideSuggestionBottleneck}
              </small>
              <small
                className="quick-actions-guide-suggestion-bottleneck-check"
                data-testid="quick-actions-guide-suggestion-bottleneck-check"
              >
                {guideBottleneckSuggestionCheck}
              </small>
              <small className="quick-actions-guide-suggestion-next" data-testid="quick-actions-guide-suggestion-next">
                {guideSuggestionAfterRun}
              </small>
              <small className="quick-actions-guide-suggestion-pin-hint" data-testid="quick-actions-guide-suggestion-pin-hint">
                {guideSuggestionPinHint}
              </small>
              <small className="quick-actions-guide-suggestion-recent" data-testid="quick-actions-guide-suggestion-recent">
                {guideSuggestionRecentState}
              </small>
              <span className="quick-actions-guide-suggestion-meta" data-testid="quick-actions-guide-suggestion-meta">
                <span data-testid="quick-actions-guide-suggestion-source">{guideSuggestionSource}</span>
                <span data-testid="quick-actions-guide-suggestion-target">{guideSuggestionTarget}</span>
                <span data-testid="quick-actions-guide-suggestion-metric">{guideSuggestionMetric}</span>
                <span data-testid="quick-actions-guide-suggestion-pin-capacity">{guideSuggestionPinCapacity}</span>
                <span
                  className="quick-actions-guide-suggestion-completion"
                  data-testid="quick-actions-guide-suggestion-completion"
                >
                  {guideSuggestionCompletion}
                </span>
                <span data-testid="quick-actions-guide-suggestion-pin-state">
                  {guideSuggestionPinned ? "Pinned command" : "Not pinned"}
                </span>
                <span data-testid="quick-actions-guide-suggestion-bottleneck-pin-state">
                  {guideBottleneckSuggestionPinned ? "Pinned bottleneck" : "Not pinned bottleneck"}
                </span>
                <span data-testid="quick-actions-guide-suggestion-bottleneck-action">
                  {guideBottleneckSuggestionLabel}
                </span>
                <span data-testid="quick-actions-guide-suggestion-bottleneck-metric">
                  {guideBottleneckSuggestionMetric}
                </span>
                <span data-testid="quick-actions-guide-suggestion-recent-target">
                  {guideSuggestionRecentTarget}
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
              className="quick-actions-guide-suggestion-bottleneck-run"
              data-testid="quick-actions-guide-suggestion-bottleneck-run"
              disabled={!guideBottleneckSuggestionAction || guideBottleneckSuggestionAction.disabled}
              onClick={() => {
                if (guideBottleneckSuggestionAction) {
                  onRun(guideBottleneckSuggestionAction);
                }
              }}
              title={
                guideBottleneckSuggestionAction
                  ? `Run ${guideBottleneckSuggestionAction.title}: ${guideBottleneckSuggestionAction.detail}`
                  : "Guide Bottleneck Focus unavailable"
              }
              type="button"
            >
              <ArrowRight size={14} aria-hidden="true" />
              <span>Bottleneck</span>
            </button>
            <div className="quick-actions-guide-suggestion-pin-stack" data-testid="quick-actions-guide-suggestion-pin-stack">
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
                <span>{guideSuggestionPinned ? "Unpin guide" : "Pin guide"}</span>
              </button>
              <button
                aria-label={`${guideBottleneckSuggestionPinned ? "Unpin" : "Pin"} Guide Bottleneck Focus`}
                aria-pressed={guideBottleneckSuggestionPinned}
                className={guideBottleneckSuggestionPinned ? "selected" : ""}
                data-testid={`quick-actions-guide-suggestion-bottleneck-${guideBottleneckSuggestionPinned ? "unpin" : "pin"}`}
                disabled={!guideBottleneckSuggestionAction}
                onClick={() => {
                  if (guideBottleneckSuggestionAction) {
                    onTogglePin(guideBottleneckSuggestionAction);
                  }
                }}
                title={
                  guideBottleneckSuggestionAction
                    ? `${guideBottleneckSuggestionPinned ? "Unpin" : "Pin"} ${guideBottleneckSuggestionAction.title}`
                    : "Guide Bottleneck Focus unavailable"
                }
                type="button"
              >
                {guideBottleneckSuggestionPinned ? <PinOff size={14} aria-hidden="true" /> : <Pin size={14} aria-hidden="true" />}
                <span>{guideBottleneckSuggestionPinned ? "Unpin bottleneck" : "Pin bottleneck"}</span>
              </button>
            </div>
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
          {pinnedResult && <QuickActionPinnedResultStrip result={pinnedResult} />}
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
          {recentResult && <QuickActionRecentResultStrip result={recentResult} />}
        </div>
        <div className="quick-actions-list" data-testid="quick-actions-list">
          {actions.length === 0 ? (
            <div className="quick-action-empty" data-testid="quick-actions-empty">
              {searchRecovery && (
                <QuickActionSearchRecoveryCard
                  recovery={searchRecovery}
                  onClearSearch={onRecoverSearchClear}
                  onSwitchScope={onRecoverSearchScope}
                />
              )}
              <span>No matching actions</span>
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

function QuickActionSearchHintResultStrip({ result }: { result: QuickActionSearchHintResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`quick-actions-search-hint-result ${result.tone}`}
      data-search-hint-result={result.term || "empty"}
      data-testid="quick-actions-search-hint-result"
    >
      <div>
        <span data-testid="quick-actions-search-hint-result-status">{result.status}</span>
        <strong data-testid="quick-actions-search-hint-result-title">{result.title}</strong>
        <small data-testid="quick-actions-search-hint-result-detail">{result.detail}</small>
      </div>
      <div>
        <span data-testid="quick-actions-search-hint-result-metric-label">{result.metricLabel}</span>
        <strong data-testid="quick-actions-search-hint-result-metric-value">{result.metricValue}</strong>
      </div>
      <div>
        <span>Next check</span>
        <strong data-testid="quick-actions-search-hint-result-next-check">{result.nextCheck}</strong>
      </div>
    </div>
  );
}

type QuickActionSearchHint = {
  term: string;
  label: string;
  count: number;
  detail: string;
};

const quickActionSearchHintTerms: Record<QuickActionScopeId, string[]> = {
  all: ["guide", "blueprint", "export", "mix"],
  transport: ["play", "loop", "tempo", "metronome"],
  compose: ["blueprint", "drum", "808", "melody"],
  arrange: ["block", "section", "pattern", "arrange"],
  mix: ["mix", "headroom", "balance", "snapshot"],
  master: ["master", "finish", "fade", "limiter"],
  project: ["save", "draft", "snapshot", "handoff"],
  export: ["wav", "stems", "midi", "handoff"]
};

function createQuickActionSearchHints(
  query: string,
  scope: QuickActionScopeId,
  actions: QuickAction[]
): QuickActionSearchHint[] {
  if (query.trim().length > 0) {
    return [];
  }

  return quickActionSearchHintTerms[scope]
    .map((term) => {
      const count = actions.filter((action) => quickActionHintMatchesScope(action, scope) && quickActionHintMatchesTerm(action, term)).length;
      return {
        term,
        label: term,
        count,
        detail: `${count} match${count === 1 ? "" : "es"}`
      };
    })
    .filter((hint) => hint.count > 0)
    .slice(0, 4);
}

function quickActionHintMatchesScope(action: QuickAction, scope: QuickActionScopeId): boolean {
  switch (scope) {
    case "all":
      return true;
    case "transport":
      return action.group === "Transport";
    case "compose":
      return action.group === "Create";
    case "arrange":
      return action.group === "Arrange";
    case "mix":
      return action.group === "Mix" && action.id !== "master-finish" && !action.id.startsWith("master-finish-");
    case "master":
      return action.id === "master-finish" || action.id.startsWith("master-finish-") || action.title.toLowerCase().includes("master");
    case "project":
      return action.group === "Project" || action.group === "Edit";
    case "export":
      return action.group === "Export";
  }
}

function quickActionHintMatchesTerm(action: QuickAction, term: string): boolean {
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) {
    return false;
  }
  return quickActionHintTokens(action).some((token) => token.startsWith(normalizedTerm));
}

function quickActionHintTokens(action: QuickAction): string[] {
  return `${action.group} ${action.title} ${action.detail} ${action.keywords}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function QuickActionSearchRecoveryResultStrip({ result }: { result: QuickActionSearchRecoveryResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`quick-actions-search-recovery-result ${result.tone}`}
      data-search-recovery-result={result.action}
      data-testid="quick-actions-search-recovery-result"
    >
      <div>
        <span data-testid="quick-actions-search-recovery-result-status">{result.status}</span>
        <strong data-testid="quick-actions-search-recovery-result-title">{result.title}</strong>
        <small data-testid="quick-actions-search-recovery-result-detail">{result.detail}</small>
      </div>
      <div>
        <span data-testid="quick-actions-search-recovery-result-metric-label">{result.metricLabel}</span>
        <strong data-testid="quick-actions-search-recovery-result-metric-value">{result.metricValue}</strong>
      </div>
      <div>
        <span>Next check</span>
        <strong data-testid="quick-actions-search-recovery-result-next-check">{result.nextCheck}</strong>
      </div>
    </div>
  );
}

type QuickActionSearchRecovery = {
  status: string;
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  nextCheck: string;
  query: string;
  suggestedScope: QuickActionScopeOption | null;
};

function createQuickActionSearchRecovery(
  query: string,
  scope: QuickActionScopeId,
  scopeOptions: QuickActionScopeOption[],
  shownCount: number
): QuickActionSearchRecovery | null {
  if (shownCount > 0) {
    return null;
  }

  const trimmedQuery = query.trim();
  const currentScope = scopeOptions.find((option) => option.id === scope);
  const suggestedScope =
    scopeOptions
      .filter((option) => option.id !== scope && option.count > 0)
      .sort((left, right) => right.count - left.count)[0] ?? null;
  const scopeLabel = currentScope?.label ?? scope;
  const searchLabel = trimmedQuery ? `"${trimmedQuery}"` : "empty search";

  return {
    status: "No match recovery",
    title: trimmedQuery ? `Recover search ${searchLabel}` : `Recover ${scopeLabel} scope`,
    detail: `${scopeLabel} scope / ${searchLabel} / 0 shown`,
    metricLabel: suggestedScope ? "Best scope" : "Recovery",
    metricValue: suggestedScope ? `${suggestedScope.label} / ${suggestedScope.count} matching` : "Clear search",
    nextCheck: suggestedScope
      ? `Switch to ${suggestedScope.label} or clear search before running a command.`
      : trimmedQuery
        ? "Clear search, then use Scope Filters before running a command."
        : "Choose another scope before running a command.",
    query: trimmedQuery,
    suggestedScope
  };
}

function QuickActionSearchRecoveryCard({
  recovery,
  onClearSearch,
  onSwitchScope
}: {
  recovery: QuickActionSearchRecovery;
  onClearSearch: () => void;
  onSwitchScope: (scope: QuickActionScopeId) => void;
}): ReactElement {
  return (
    <div
      aria-live="polite"
      className="quick-actions-search-recovery"
      data-search-recovery={recovery.query || "empty"}
      data-testid="quick-actions-search-recovery"
    >
      <div>
        <span data-testid="quick-actions-search-recovery-status">{recovery.status}</span>
        <strong data-testid="quick-actions-search-recovery-title">{recovery.title}</strong>
        <small data-testid="quick-actions-search-recovery-detail">{recovery.detail}</small>
      </div>
      <div>
        <span data-testid="quick-actions-search-recovery-metric-label">{recovery.metricLabel}</span>
        <strong data-testid="quick-actions-search-recovery-metric-value">{recovery.metricValue}</strong>
        <small data-testid="quick-actions-search-recovery-next-check">{recovery.nextCheck}</small>
      </div>
      <div className="quick-actions-search-recovery-actions">
        <button
          data-testid="quick-actions-search-recovery-clear"
          disabled={recovery.query.length === 0}
          onClick={onClearSearch}
          title="Clear Quick Actions search"
          type="button"
        >
          <X size={14} aria-hidden="true" />
          <span>Clear</span>
        </button>
        <button
          data-testid="quick-actions-search-recovery-scope"
          disabled={!recovery.suggestedScope}
          onClick={() => {
            if (recovery.suggestedScope) {
              onSwitchScope(recovery.suggestedScope.id);
            }
          }}
          title={recovery.suggestedScope ? `Switch to ${recovery.suggestedScope.label} scope` : "No matching scope"}
          type="button"
        >
          <Target size={14} aria-hidden="true" />
          <span>{recovery.suggestedScope ? recovery.suggestedScope.label : "Scope"}</span>
        </button>
      </div>
    </div>
  );
}

function QuickActionSearchResultStrip({ result }: { result: QuickActionSearchResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`quick-actions-search-result ${result.tone}`}
      data-search-result={result.query || "empty"}
      data-testid="quick-actions-search-result"
    >
      <div>
        <span data-testid="quick-actions-search-result-status">{result.status}</span>
        <strong data-testid="quick-actions-search-result-title">{result.title}</strong>
        <small data-testid="quick-actions-search-result-detail">{result.detail}</small>
      </div>
      <div>
        <span data-testid="quick-actions-search-result-metric-label">{result.metricLabel}</span>
        <strong data-testid="quick-actions-search-result-metric-value">{result.metricValue}</strong>
      </div>
      <div>
        <span>Next check</span>
        <strong data-testid="quick-actions-search-result-next-check">{result.nextCheck}</strong>
      </div>
    </div>
  );
}

function QuickActionScopeResultStrip({ result }: { result: QuickActionScopeResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`quick-actions-scope-result ${result.tone}`}
      data-scope-result={result.scope}
      data-testid="quick-actions-scope-result"
    >
      <div>
        <span data-testid="quick-actions-scope-result-status">{result.status}</span>
        <strong data-testid="quick-actions-scope-result-title">{result.title}</strong>
        <small data-testid="quick-actions-scope-result-detail">{result.detail}</small>
      </div>
      <div>
        <span data-testid="quick-actions-scope-result-metric-label">{result.metricLabel}</span>
        <strong data-testid="quick-actions-scope-result-metric-value">{result.metricValue}</strong>
      </div>
      <div>
        <span>Next check</span>
        <strong data-testid="quick-actions-scope-result-next-check">{result.nextCheck}</strong>
      </div>
    </div>
  );
}

function QuickActionPinnedResultStrip({ result }: { result: QuickActionPinnedResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`quick-actions-pinned-result ${result.tone}`}
      data-pinned-result-action={result.actionId}
      data-pinned-result-kind={result.kind}
      data-testid="quick-actions-pinned-result"
    >
      <div>
        <span data-testid="quick-actions-pinned-result-status">{result.status}</span>
        <strong data-testid="quick-actions-pinned-result-title">{result.title}</strong>
        <small data-testid="quick-actions-pinned-result-detail">{result.detail}</small>
      </div>
      <div>
        <span data-testid="quick-actions-pinned-result-metric-label">{result.metricLabel}</span>
        <strong data-testid="quick-actions-pinned-result-metric-value">{result.metricValue}</strong>
      </div>
      <div>
        <span>Next check</span>
        <strong data-testid="quick-actions-pinned-result-next-check">{result.nextCheck}</strong>
      </div>
    </div>
  );
}

function QuickActionRecentResultStrip({ result }: { result: QuickActionRecentResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`quick-actions-recent-result ${result.tone}`}
      data-recent-result-action={result.actionId}
      data-testid="quick-actions-recent-result"
    >
      <div>
        <span data-testid="quick-actions-recent-result-status">{result.status}</span>
        <strong data-testid="quick-actions-recent-result-title">{result.title}</strong>
        <small data-testid="quick-actions-recent-result-detail">{result.detail}</small>
      </div>
      <div>
        <span data-testid="quick-actions-recent-result-metric-label">{result.metricLabel}</span>
        <strong data-testid="quick-actions-recent-result-metric-value">{result.metricValue}</strong>
      </div>
      <div>
        <span>Next check</span>
        <strong data-testid="quick-actions-recent-result-next-check">{result.nextCheck}</strong>
      </div>
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
                <div className="command-reference-items" role="list">
                  {section.items.map((item) => {
                    const itemLabel = commandReferenceItemLabel(section, item);
                    return (
                      <div
                        aria-label={itemLabel}
                        className="command-reference-item"
                        data-testid={`command-reference-item-${item.id}`}
                        key={item.id}
                        role="listitem"
                        title={itemLabel}
                      >
                        <kbd>{item.shortcut}</kbd>
                        <strong>{item.command}</strong>
                        <div className="command-reference-item-target" data-testid={`command-reference-item-${item.id}-target`}>
                          <small>{item.target}</small>
                          {item.context ? (
                            <small
                              className="command-reference-item-context"
                              data-testid={`command-reference-item-${item.id}-context`}
                            >
                              {item.context}
                            </small>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
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
  const focusCheck = focusSummary.checkId ? checks.find((check) => check.id === focusSummary.checkId) ?? null : null;

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
        <button
          className="beat-readiness-focus-action"
          data-testid="beat-readiness-focus-run"
          disabled={!focusCheck}
          onClick={() => {
            if (focusCheck) {
              onFocus(focusCheck);
            }
          }}
          title={
            focusCheck
              ? `Open ${focusCheck.focusLabel}: ${focusCheck.label} ${focusCheck.status}`
              : "No Beat Readiness check to focus."
          }
          type="button"
        >
          <ArrowRight size={13} aria-hidden="true" />
          <span>{focusSummary.actionLabel}</span>
        </button>
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
      actionLabel: "Ready",
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
    actionLabel: `Open ${check.focusLabel}`,
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
