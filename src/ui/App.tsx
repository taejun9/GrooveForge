import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CircleStop,
  Copy,
  Disc3,
  Download,
  Drum,
  FolderOpen,
  Gauge,
  KeyboardMusic,
  Music2,
  Play,
  Plus,
  Redo2,
  Save,
  Scissors,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Undo2,
  Waves,
  X
} from "lucide-react";
import type { ChangeEvent, CSSProperties, ReactElement, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { exportMidi } from "../audio/midi";
import {
  analyzeExport,
  analyzeStemExports,
  ExportAnalysis,
  exportStems,
  exportWav,
  StemExportAnalyses,
  stemTrackIds,
  stemTrackLabel,
  StemTrackId
} from "../audio/render";
import { PlaybackController, PlaybackMode, PlaybackSnapshot, startRealtimePlayback } from "../audio/scheduler";
import {
  ArrangementBlock,
  ArrangementMovePreset,
  ArrangementMuteTrack,
  ArrangementSection,
  ArrangementTemplateId,
  BassNote,
  BeatBlueprintId,
  ChordEvent,
  ChordInversion,
  ChordProgressionPreset,
  ChordQuality,
  CustomDeliveryTarget,
  DeliveryTarget,
  DeliveryTargetId,
  DrumGroovePreset,
  DrumLane,
  MixPosture,
  applyDrumGroovePreset,
  chordProgressionPresetIds,
  chordProgressionPresetLabel,
  getStyle,
  MasterPreset,
  MelodyNote,
  MixerChannel,
  NoteTrack,
  PatternData,
  PatternFillPreset,
  PatternChainId,
  PatternSlot,
  ProjectSnapshot,
  PatternVariationPreset,
  ProjectState,
  SoundDesign,
  activeDeliveryTarget,
  activePattern,
  applyBeatBlueprint,
  applyDeliveryTarget,
  applyArrangementMovePreset,
  applyPatternFillPreset,
  arrangementSections,
  arrangementEnergyGain,
  arrangementMovePresetIds,
  arrangementMovePresetLabel,
  arrangementMuteTrackIds,
  arrangementMuteTrackLabel,
  arrangementTemplateIds,
  arrangementTemplateLabel,
  arrangementTotalBars,
  bassPitchLanes,
  beatBlueprints,
  chordInversions,
  chordInversionLabel,
  chordQualities,
  clonePatternData,
  createChordProgressionPreset,
  createArrangementTemplate,
  createNextChordEvent,
  createPatternChain,
  createPatternVariation,
  createStylePatternSet,
  createEmptyPatternData,
  defaultCustomDeliveryTarget,
  defaultDrumVelocity,
  deleteProjectSnapshot,
  deliveryTargets,
  deliveryTargetForId,
  drumStepProbability,
  drumStepTimingMs,
  drumStepVelocity,
  drumGroovePresetIds,
  drumGroovePresetLabel,
  defaultSessionBrief,
  expandPatternChainArrangement,
  hatRepeatCount,
  masterPresetCeilingDb,
  masterPresets,
  maxCustomDeliveryTargetFocusLength,
  maxCustomDeliveryTargetNameLength,
  maxDeliveryTargetBars,
  maxDeliveryTargetStemGoal,
  maxSessionBriefFieldLength,
  maxSessionBriefNotesLength,
  melodyPitchLanes,
  maxProjectSnapshotNameLength,
  maxProjectSnapshots,
  minDeliveryTargetBars,
  minDeliveryTargetStemGoal,
  minArrangementBars,
  minDrumTimingMs,
  maxArrangementBars,
  maxDrumTimingMs,
  normalizeArrangementEnergy,
  normalizeArrangementMutedTracks,
  normalizeArrangementBars,
  normalizeDrumProbability,
  normalizeDrumTimingMs,
  normalizeDrumVelocity,
  normalizeChordInversion,
  normalizeDeliveryTargetBars,
  normalizeDeliveryTargetStemGoal,
  normalizeEventProbability,
  normalizeHatRepeat,
  normalizeMixerEq,
  normalizeProjectSnapshotName,
  parseProjectFile,
  patternSlots,
  patternChainIds,
  patternChainLabel,
  patternFillPresetIds,
  patternFillPresetLabel,
  patternVariationPresetIds,
  patternVariationPresetLabel,
  nextProjectSnapshotName,
  projectFileName,
  projectSnapshotSummary,
  renameProjectSnapshot,
  retargetProjectKey,
  restoreProjectSnapshot,
  scalePitches,
  scalePitchNames,
  serializeProjectFile,
  SessionBrief,
  saveProjectSnapshot,
  soundPresetDesign,
  soundPresetIds,
  soundPresetLabel,
  StyleProfile,
  styleSoundPreset,
  starterProject,
  steps,
  styleProfiles
} from "../domain/workstation";

const drumLabels: Record<DrumLane, string> = {
  kick: "Kick",
  clap: "Clap",
  hat: "Hat",
  perc: "Perc"
};

const mixPostureOptions: { id: MixPosture; label: string }[] = [
  { id: "loose", label: "Loose sketch" },
  { id: "vocal_headroom", label: "Vocal headroom" },
  { id: "balanced", label: "Balanced" },
  { id: "club_forward", label: "Club forward" }
];

const mixBalancePadDefinitions: MixBalancePadDefinition[] = [
  {
    id: "clean",
    label: "Clean",
    detail: "rough",
    channels: {
      drum_rack: { volumeDb: -5, pan: 0, lowCut: 0.08, air: 0.22, drive: 0.12, glue: 0.2, send: 0.1 },
      bass_808: { volumeDb: -6.5, pan: 0, lowCut: 0, air: 0.08, drive: 0.18, glue: 0.16, send: 0.03 },
      synth: { volumeDb: -9, pan: -12, lowCut: 0.2, air: 0.34, drive: 0.06, glue: 0.1, send: 0.22 },
      chord: { volumeDb: -10, pan: 16, lowCut: 0.16, air: 0.28, drive: 0.05, glue: 0.16, send: 0.28 }
    }
  },
  {
    id: "vocal",
    label: "Vocal",
    detail: "space",
    channels: {
      drum_rack: { volumeDb: -5.5, pan: 0, lowCut: 0.08, air: 0.2, drive: 0.1, glue: 0.22, send: 0.08 },
      bass_808: { volumeDb: -7.5, pan: 0, lowCut: 0, air: 0.06, drive: 0.16, glue: 0.14, send: 0.02 },
      synth: { volumeDb: -11, pan: -10, lowCut: 0.28, air: 0.3, drive: 0.04, glue: 0.08, send: 0.18 },
      chord: { volumeDb: -12, pan: 14, lowCut: 0.26, air: 0.26, drive: 0.04, glue: 0.12, send: 0.22 }
    }
  },
  {
    id: "club",
    label: "Club",
    detail: "knock",
    channels: {
      drum_rack: { volumeDb: -3.8, pan: 0, lowCut: 0.06, air: 0.28, drive: 0.22, glue: 0.34, send: 0.08 },
      bass_808: { volumeDb: -4.8, pan: 0, lowCut: 0, air: 0.08, drive: 0.3, glue: 0.26, send: 0.02 },
      synth: { volumeDb: -8.5, pan: -18, lowCut: 0.16, air: 0.4, drive: 0.08, glue: 0.12, send: 0.2 },
      chord: { volumeDb: -9.2, pan: 18, lowCut: 0.14, air: 0.34, drive: 0.08, glue: 0.18, send: 0.22 }
    }
  },
  {
    id: "wide",
    label: "Wide",
    detail: "hook",
    channels: {
      drum_rack: { volumeDb: -4.8, pan: 0, lowCut: 0.08, air: 0.24, drive: 0.14, glue: 0.22, send: 0.12 },
      bass_808: { volumeDb: -6.2, pan: 0, lowCut: 0, air: 0.08, drive: 0.2, glue: 0.18, send: 0.03 },
      synth: { volumeDb: -9.5, pan: -28, lowCut: 0.22, air: 0.46, drive: 0.08, glue: 0.12, send: 0.34 },
      chord: { volumeDb: -10, pan: 28, lowCut: 0.18, air: 0.42, drive: 0.06, glue: 0.16, send: 0.38 }
    }
  }
];

const soundFocusPadDefinitions: SoundFocusPadDefinition[] = [
  {
    id: "punch",
    label: "Punch",
    detail: "front",
    values: {
      kickPunch: 0.9,
      snareSnap: 0.82,
      hatBrightness: 0.62,
      bassDrive: 0.68,
      bassDecay: 0.52,
      sidechainDuck: 0.72,
      synthBrightness: 0.58,
      synthRelease: 0.36,
      chordWarmth: 0.5,
      chordWidth: 0.46
    }
  },
  {
    id: "warm",
    label: "Warm",
    detail: "round",
    values: {
      kickPunch: 0.64,
      snareSnap: 0.56,
      hatBrightness: 0.38,
      bassDrive: 0.54,
      bassDecay: 0.7,
      sidechainDuck: 0.46,
      synthBrightness: 0.42,
      synthRelease: 0.64,
      chordWarmth: 0.86,
      chordWidth: 0.62
    }
  },
  {
    id: "air",
    label: "Air",
    detail: "bright",
    values: {
      kickPunch: 0.58,
      snareSnap: 0.72,
      hatBrightness: 0.88,
      bassDrive: 0.42,
      bassDecay: 0.58,
      sidechainDuck: 0.4,
      synthBrightness: 0.86,
      synthRelease: 0.7,
      chordWarmth: 0.55,
      chordWidth: 0.72
    }
  },
  {
    id: "space",
    label: "Space",
    detail: "wide",
    values: {
      kickPunch: 0.52,
      snareSnap: 0.58,
      hatBrightness: 0.72,
      bassDrive: 0.44,
      bassDecay: 0.74,
      sidechainDuck: 0.5,
      synthBrightness: 0.68,
      synthRelease: 0.86,
      chordWarmth: 0.7,
      chordWidth: 0.9
    }
  }
];

const masterFinishPadDefinitions: MasterFinishPadDefinition[] = [
  {
    id: "demo",
    label: "Demo",
    detail: "clean",
    preset: "Clean Demo",
    ceilingDb: -0.8,
    masterVolumeDb: -1.4
  },
  {
    id: "vocal",
    label: "Vocal",
    detail: "headroom",
    preset: "Headroom for Vocal",
    ceilingDb: -3,
    masterVolumeDb: -2.4
  },
  {
    id: "store",
    label: "Store",
    detail: "balanced",
    preset: "Streaming Safe",
    ceilingDb: -1,
    masterVolumeDb: -1.1
  },
  {
    id: "club",
    label: "Club",
    detail: "preview",
    preset: "Clean Demo",
    ceilingDb: -0.8,
    masterVolumeDb: -0.6
  }
];

const keys = ["F minor", "A minor", "C minor", "D minor", "E minor", "G minor", "C major", "D dorian"];
const historyLimit = 50;
const keyboardCaptureKeys = ["a", "s", "d", "f", "g", "h", "j", "k"] as const;
type KeyboardCaptureKey = (typeof keyboardCaptureKeys)[number];

const keyboardCaptureKeyLabels: Record<KeyboardCaptureKey, string> = {
  a: "A",
  s: "S",
  d: "D",
  f: "F",
  g: "G",
  h: "H",
  j: "J",
  k: "K"
};

function isStemTrackId(track: MixerChannel["id"]): track is StemTrackId {
  return (stemTrackIds as readonly string[]).includes(track);
}

type SelectedNote = {
  track: NoteTrack;
  step: number;
  pitch: string;
};

type MixCoachTone = "good" | "warn" | "danger";

type MixCoachCheck = {
  id: string;
  label: string;
  status: string;
  detail: string;
  tone: MixCoachTone;
};

type MixFixPreset = "headroom" | "stem_balance" | "low_end";

type MixFixAction = {
  preset: MixFixPreset;
  label: string;
  detail: string;
  tone: MixCoachTone;
};

type MixBalancePadId = "clean" | "vocal" | "club" | "wide";

type MixBalanceChannelUpdate = Partial<
  Pick<MixerChannel, "volumeDb" | "pan" | "lowCut" | "air" | "drive" | "glue" | "send">
>;

type MixBalancePadDefinition = {
  id: MixBalancePadId;
  label: string;
  detail: string;
  channels: Partial<Record<MixerChannel["id"], MixBalanceChannelUpdate>>;
};

type MixBalancePadOption = MixBalancePadDefinition & {
  preview: string;
  changedCount: number;
};

type SoundFocusPadId = "punch" | "warm" | "air" | "space";

type SoundFocusParameter = Exclude<keyof SoundDesign, "preset">;

type SoundFocusPadDefinition = {
  id: SoundFocusPadId;
  label: string;
  detail: string;
  values: Partial<Record<SoundFocusParameter, number>>;
};

type SoundFocusPadOption = SoundFocusPadDefinition & {
  preview: string;
  changedCount: number;
};

type MasterFinishPadId = "demo" | "vocal" | "store" | "club";

type MasterFinishPadDefinition = {
  id: MasterFinishPadId;
  label: string;
  detail: string;
  preset: MasterPreset;
  ceilingDb: number;
  masterVolumeDb: number;
};

type MasterFinishPadOption = MasterFinishPadDefinition & {
  preview: string;
  changedCount: number;
};

type TransportLoopScope = "arrangement" | "block" | "pattern";

type QuickAction = {
  id: string;
  title: string;
  detail: string;
  group: string;
  keywords: string;
  disabled?: boolean;
  run: () => void | Promise<void>;
};

type BeatReadinessCheck = {
  id: string;
  label: string;
  status: string;
  detail: string;
  tone: MixCoachTone;
};

type PatternCompareSummary = {
  slot: PatternSlot;
  eventCount: number;
  drumHits: number;
  bassNotes: number;
  melodyNotes: number;
  chordEvents: number;
  arrangedBlocks: number;
  arrangedBars: number;
};

type StylePatternDensity = {
  slot: PatternSlot;
  label: string;
  eventCount: number;
  detail: string;
};

type StyleInspectorSummary = {
  profile: StyleProfile;
  bpm: string;
  swing: string;
  bass: string;
  melody: string;
  soundPreset: string;
  totalEvents: number;
  patterns: StylePatternDensity[];
};

type BasslinePadId = "root" | "bounce" | "slide" | "offbeat";

type BasslinePadStep = {
  step: number;
  degree: number;
  length: number;
  glide: boolean;
  probability?: number;
};

type BasslinePadDefinition = {
  id: BasslinePadId;
  label: string;
  detail: string;
  steps: BasslinePadStep[];
};

type BasslinePadOption = BasslinePadDefinition & {
  preview: string;
  eventCount: number;
  glideCount: number;
};

type BassGlidePadId = "clean" | "bounce" | "slide" | "hold";

type BassGlidePadDefinition = {
  id: BassGlidePadId;
  label: string;
  detail: string;
};

type BassGlidePadOption = BassGlidePadDefinition & {
  preview: string;
  glideCount: number;
};

type PatternStackId = "pocket" | "hook" | "lift" | "break";

type PatternStackDefinition = {
  id: PatternStackId;
  label: string;
  detail: string;
  bassline: BasslinePadId;
  chordPreset: ChordProgressionPreset;
  motif: MelodyMotifId;
};

type PatternStackEvents = {
  bassNotes: BassNote[];
  chordEvents: ChordEvent[];
  melodyNotes: MelodyNote[];
};

type PatternStackOption = PatternStackDefinition & {
  preview: string;
  bassCount: number;
  chordCount: number;
  melodyCount: number;
};

type GrooveFeelId = "tight" | "pocket" | "push" | "lazy";

type GrooveFeelDefinition = {
  id: GrooveFeelId;
  label: string;
  detail: string;
  musicChance: number;
  chordChance: number;
  hatChance: number;
  percChance: number;
};

type GrooveFeelOption = GrooveFeelDefinition & {
  timingPreview: string;
  chancePreview: string;
};

type DrumAccentId = "soft" | "knock" | "ghost" | "lift";

type DrumAccentDefinition = {
  id: DrumAccentId;
  label: string;
  detail: string;
};

type DrumAccentOption = DrumAccentDefinition & {
  preview: string;
};

type MelodyMotifId = "hook" | "pocket" | "rise" | "answer";

type MelodyMotifStep = {
  step: number;
  degree: number;
  length: number;
  velocity: number;
};

type MelodyMotifDefinition = {
  id: MelodyMotifId;
  label: string;
  detail: string;
  steps: MelodyMotifStep[];
};

type MelodyMotifOption = MelodyMotifDefinition & {
  preview: string;
  eventCount: number;
};

type MelodyAccentId = "soft" | "lead" | "pulse" | "fade";

type MelodyAccentDefinition = {
  id: MelodyAccentId;
  label: string;
  detail: string;
};

type MelodyAccentOption = MelodyAccentDefinition & {
  preview: string;
  chanceCount: number;
};

type MelodyContourId = "rise" | "fall" | "answer" | "anchor";

type MelodyContourDefinition = {
  id: MelodyContourId;
  label: string;
  detail: string;
};

type MelodyContourOption = MelodyContourDefinition & {
  preview: string;
  pitchSpan: string;
};

type ChordPadId = "home" | "lift" | "tension" | "color";

type ChordPadDefinition = {
  id: ChordPadId;
  label: string;
  detail: string;
  degree: number;
  quality?: ChordQuality;
  inversion: ChordInversion;
};

type ChordPadOption = ChordPadDefinition & {
  root: string;
  quality: ChordQuality;
  selected: boolean;
};

type ChordRhythmId = "held" | "pulse" | "stab" | "ghost";

type ChordRhythmDefinition = {
  id: ChordRhythmId;
  label: string;
  detail: string;
};

type ChordRhythmOption = ChordRhythmDefinition & {
  preview: string;
  chanceCount: number;
};

type ChordVoicingId = "open" | "deep" | "tension" | "air";

type ChordVoicingDefinition = {
  id: ChordVoicingId;
  label: string;
  detail: string;
  quality?: ChordQuality;
  inversion: ChordInversion;
  length: number;
  velocity: number;
  probability: number;
};

type ChordVoicingOption = ChordVoicingDefinition & {
  quality: ChordQuality;
  preview: string;
  selected: boolean;
};

type ArrangementFocusPresetId = "intro_space" | "verse_pocket" | "hook_peak" | "bridge_drop" | "outro_release";

type ArrangementFocusPreset = {
  id: ArrangementFocusPresetId;
  label: string;
  detail: string;
  section: ArrangementSection;
  pattern: PatternSlot;
  bars: number;
  energy: number;
  mutedTracks: ArrangementMuteTrack[];
};

type ArrangementFocusSummary = {
  blockNumber: number;
  section: ArrangementSection;
  pattern: PatternSlot;
  bars: number;
  energy: number;
  eventCount: number;
  mutedLabel: string;
  suggestedPreset: ArrangementFocusPresetId;
};

type NextMoveCommand =
  | { kind: "blueprint"; blueprintId: BeatBlueprintId }
  | { kind: "patternFill"; preset: PatternFillPreset }
  | { kind: "arrangementMove"; preset: ArrangementMovePreset }
  | { kind: "patternChain"; chain: PatternChainId }
  | { kind: "chainExpand" }
  | { kind: "arrangementTemplate"; template: ArrangementTemplateId }
  | { kind: "deliveryTarget"; target: DeliveryTargetId }
  | { kind: "masterFinish"; pad: MasterFinishPadId }
  | { kind: "snapshot" }
  | { kind: "reviewMix" };

type NextMoveAction = {
  id: string;
  title: string;
  detail: string;
  buttonLabel: string;
  tone: MixCoachTone;
  command: NextMoveCommand;
};

type BeatMapStage = {
  id: string;
  label: string;
  status: string;
  detail: string;
  tone: MixCoachTone;
};

type BeatMapMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: MixCoachTone;
};

type BeatMapSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  stages: BeatMapStage[];
  metrics: BeatMapMetric[];
};

type StructureLensSignal = {
  id: "target" | "sections" | "hook" | "arc";
  label: string;
  value: string;
  detail: string;
  tone: MixCoachTone;
};

type StructureLensSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  signals: StructureLensSignal[];
};

type BeatPassportMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: MixCoachTone;
};

type BeatPassportSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  metrics: BeatPassportMetric[];
};

type HandoffPackItem = {
  id: "wav" | "stems" | "midi" | "sheet";
  label: string;
  value: string;
  detail: string;
  tone: MixCoachTone;
  buttonLabel: string;
  run: () => void;
};

type SelectedDrumStep = {
  lane: DrumLane;
  step: number;
};

type NoteView = {
  step: number;
  pitch: string;
  length: number;
  velocity?: number;
  glide?: boolean;
  probability?: number;
};

type KeyboardCaptureKeyMapItem = {
  key: KeyboardCaptureKey;
  pitch: string | null;
};

const arrangementFocusPresets: ArrangementFocusPreset[] = [
  {
    id: "intro_space",
    label: "Intro Space",
    detail: "Open with room before the low end lands.",
    section: "Intro",
    pattern: "A",
    bars: 2,
    energy: 0.54,
    mutedTracks: ["bass_808"]
  },
  {
    id: "verse_pocket",
    label: "Verse Pocket",
    detail: "Keep the groove clear for topline or rap.",
    section: "Verse",
    pattern: "A",
    bars: 4,
    energy: 0.72,
    mutedTracks: ["synth"]
  },
  {
    id: "hook_peak",
    label: "Hook Peak",
    detail: "Fullest version of the idea for the main section.",
    section: "Hook",
    pattern: "B",
    bars: 4,
    energy: 0.94,
    mutedTracks: []
  },
  {
    id: "bridge_drop",
    label: "Bridge Drop",
    detail: "Pull rhythm and bass away for contrast.",
    section: "Bridge",
    pattern: "C",
    bars: 2,
    energy: 0.38,
    mutedTracks: ["drum_rack", "bass_808"]
  },
  {
    id: "outro_release",
    label: "Outro Release",
    detail: "Exit with a lighter version of the beat.",
    section: "Outro",
    pattern: "C",
    bars: 2,
    energy: 0.46,
    mutedTracks: ["drum_rack", "bass_808"]
  }
];

const chordPadDefinitions: ChordPadDefinition[] = [
  { id: "home", label: "Home", detail: "center", degree: 0, inversion: 0 },
  { id: "lift", label: "Lift", detail: "open", degree: 5, inversion: 1 },
  { id: "tension", label: "Tension", detail: "pull", degree: 4, quality: "7", inversion: 0 },
  { id: "color", label: "Color", detail: "float", degree: 3, quality: "sus2", inversion: 1 }
];

const chordRhythmDefinitions: ChordRhythmDefinition[] = [
  { id: "held", label: "Held", detail: "wide" },
  { id: "pulse", label: "Pulse", detail: "bounce" },
  { id: "stab", label: "Stab", detail: "short" },
  { id: "ghost", label: "Ghost", detail: "air" }
];

const chordVoicingDefinitions: ChordVoicingDefinition[] = [
  { id: "open", label: "Open", detail: "wide top", inversion: 2, length: 6, velocity: 0.62, probability: 1 },
  { id: "deep", label: "Deep", detail: "root weight", inversion: 0, length: 4, velocity: 0.72, probability: 1 },
  { id: "tension", label: "Tension", detail: "dominant pull", quality: "7", inversion: 1, length: 3, velocity: 0.78, probability: 0.98 },
  { id: "air", label: "Air", detail: "suspended ghost", quality: "sus2", inversion: 2, length: 2, velocity: 0.48, probability: 0.9 }
];

const basslinePadDefinitions: BasslinePadDefinition[] = [
  {
    id: "root",
    label: "Root",
    detail: "anchor",
    steps: [
      { step: 0, degree: 0, length: 3, glide: false },
      { step: 4, degree: 0, length: 2, glide: false, probability: 0.92 },
      { step: 8, degree: 0, length: 3, glide: false },
      { step: 12, degree: 4, length: 2, glide: false, probability: 0.92 },
      { step: 14, degree: 0, length: 2, glide: false }
    ]
  },
  {
    id: "bounce",
    label: "Bounce",
    detail: "pocket",
    steps: [
      { step: 0, degree: 0, length: 2, glide: false },
      { step: 3, degree: 0, length: 1, glide: false },
      { step: 6, degree: 2, length: 2, glide: false },
      { step: 8, degree: 0, length: 2, glide: false },
      { step: 11, degree: 5, length: 1, glide: true, probability: 0.9 },
      { step: 14, degree: 4, length: 2, glide: false }
    ]
  },
  {
    id: "slide",
    label: "Slide",
    detail: "glide",
    steps: [
      { step: 0, degree: 0, length: 2, glide: false },
      { step: 3, degree: 1, length: 1, glide: true, probability: 0.92 },
      { step: 4, degree: 2, length: 2, glide: true },
      { step: 8, degree: 0, length: 2, glide: false },
      { step: 12, degree: 5, length: 1, glide: true, probability: 0.92 },
      { step: 13, degree: 4, length: 3, glide: true }
    ]
  },
  {
    id: "offbeat",
    label: "Offbeat",
    detail: "sync",
    steps: [
      { step: 2, degree: 0, length: 2, glide: false },
      { step: 6, degree: 2, length: 2, glide: false },
      { step: 10, degree: 0, length: 2, glide: false },
      { step: 14, degree: 5, length: 2, glide: true }
    ]
  }
];

const bassGlidePadDefinitions: BassGlidePadDefinition[] = [
  { id: "clean", label: "Clean", detail: "tight/no glide" },
  { id: "bounce", label: "Bounce", detail: "short pocket" },
  { id: "slide", label: "Slide", detail: "connected glide" },
  { id: "hold", label: "Hold", detail: "long sustain" }
];

const melodyMotifDefinitions: MelodyMotifDefinition[] = [
  {
    id: "hook",
    label: "Hook",
    detail: "lead",
    steps: [
      { step: 0, degree: 4, length: 2, velocity: 0.74 },
      { step: 3, degree: 4, length: 1, velocity: 0.68 },
      { step: 6, degree: 2, length: 2, velocity: 0.7 },
      { step: 8, degree: 0, length: 2, velocity: 0.74 },
      { step: 11, degree: 2, length: 1, velocity: 0.66 },
      { step: 14, degree: 4, length: 2, velocity: 0.72 }
    ]
  },
  {
    id: "pocket",
    label: "Pocket",
    detail: "space",
    steps: [
      { step: 1, degree: 0, length: 2, velocity: 0.58 },
      { step: 5, degree: 2, length: 1, velocity: 0.64 },
      { step: 9, degree: 1, length: 2, velocity: 0.58 },
      { step: 13, degree: 5, length: 1, velocity: 0.62 }
    ]
  },
  {
    id: "rise",
    label: "Rise",
    detail: "build",
    steps: [
      { step: 0, degree: 0, length: 1, velocity: 0.58 },
      { step: 2, degree: 1, length: 1, velocity: 0.62 },
      { step: 4, degree: 2, length: 1, velocity: 0.66 },
      { step: 6, degree: 3, length: 1, velocity: 0.7 },
      { step: 8, degree: 4, length: 1, velocity: 0.74 },
      { step: 10, degree: 5, length: 1, velocity: 0.78 },
      { step: 12, degree: 6, length: 2, velocity: 0.82 }
    ]
  },
  {
    id: "answer",
    label: "Answer",
    detail: "reply",
    steps: [
      { step: 8, degree: 5, length: 2, velocity: 0.7 },
      { step: 10, degree: 4, length: 1, velocity: 0.66 },
      { step: 12, degree: 2, length: 1, velocity: 0.64 },
      { step: 14, degree: 0, length: 2, velocity: 0.7 }
    ]
  }
];

const melodyAccentDefinitions: MelodyAccentDefinition[] = [
  { id: "soft", label: "Soft", detail: "lighter" },
  { id: "lead", label: "Lead", detail: "front" },
  { id: "pulse", label: "Pulse", detail: "bounce" },
  { id: "fade", label: "Fade", detail: "tail" }
];

const melodyContourDefinitions: MelodyContourDefinition[] = [
  { id: "rise", label: "Rise", detail: "lift line" },
  { id: "fall", label: "Fall", detail: "resolve down" },
  { id: "answer", label: "Answer", detail: "call reply" },
  { id: "anchor", label: "Anchor", detail: "center hook" }
];

const patternStackDefinitions: PatternStackDefinition[] = [
  { id: "pocket", label: "Pocket", detail: "verse", bassline: "bounce", chordPreset: "sparse", motif: "pocket" },
  { id: "hook", label: "Hook", detail: "main", bassline: "slide", chordPreset: "moody", motif: "hook" },
  { id: "lift", label: "Lift", detail: "pre", bassline: "root", chordPreset: "lift", motif: "rise" },
  { id: "break", label: "Break", detail: "space", bassline: "offbeat", chordPreset: "bounce", motif: "answer" }
];

const grooveFeelDefinitions: GrooveFeelDefinition[] = [
  { id: "tight", label: "Tight", detail: "grid", musicChance: 1, chordChance: 1, hatChance: 1, percChance: 0.96 },
  { id: "pocket", label: "Pocket", detail: "behind", musicChance: 0.94, chordChance: 0.96, hatChance: 0.94, percChance: 0.86 },
  { id: "push", label: "Push", detail: "ahead", musicChance: 1, chordChance: 1, hatChance: 1, percChance: 0.92 },
  { id: "lazy", label: "Lazy", detail: "loose", musicChance: 0.82, chordChance: 0.9, hatChance: 0.88, percChance: 0.78 }
];

const drumAccentDefinitions: DrumAccentDefinition[] = [
  { id: "soft", label: "Soft", detail: "lighter" },
  { id: "knock", label: "Knock", detail: "front" },
  { id: "ghost", label: "Ghost", detail: "depth" },
  { id: "lift", label: "Lift", detail: "rise" }
];

export function App(): ReactElement {
  const [project, setProject] = useState<ProjectState>(starterProject);
  const [undoStack, setUndoStack] = useState<ProjectState[]>([]);
  const [redoStack, setRedoStack] = useState<ProjectState[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("arrangement");
  const [transportLoopScope, setTransportLoopScope] = useState<TransportLoopScope>("arrangement");
  const [playbackPosition, setPlaybackPosition] = useState<PlaybackSnapshot | null>(null);
  const [selectedNote, setSelectedNote] = useState<SelectedNote | null>(null);
  const [keyboardCaptureEnabled, setKeyboardCaptureEnabled] = useState(false);
  const [keyboardCaptureTarget, setKeyboardCaptureTarget] = useState<NoteTrack>("bass");
  const [selectedDrumStep, setSelectedDrumStep] = useState<SelectedDrumStep | null>(null);
  const [selectedChordIndex, setSelectedChordIndex] = useState<number | null>(0);
  const [selectedArrangementIndex, setSelectedArrangementIndex] = useState(0);
  const [splitAfterBars, setSplitAfterBars] = useState(1);
  const [snapshotNameDrafts, setSnapshotNameDrafts] = useState<Record<string, string>>({});
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [quickActionQuery, setQuickActionQuery] = useState("");
  const [projectStatus, setProjectStatus] = useState("Demo project");
  const projectRef = useRef<ProjectState>(starterProject);
  const controllerRef = useRef<PlaybackController | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const masterPanelRef = useRef<HTMLElement | null>(null);
  const style = getStyle(project);
  const deliveryTarget = activeDeliveryTarget(project);
  const currentPattern = activePattern(project);
  const exportAnalysis = useMemo(() => analyzeExport(project), [project]);
  const stemAnalyses = useMemo(() => analyzeStemExports(project), [project]);
  const beatReadinessChecks = useMemo(() => createBeatReadinessChecks(project, exportAnalysis), [project, exportAnalysis]);
  const nextMoveActions = useMemo(
    () => createNextMoveActions(project, beatReadinessChecks, exportAnalysis),
    [project, beatReadinessChecks, exportAnalysis]
  );
  const beatMapSummary = useMemo(
    () => createBeatMapSummary(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const beatMapActions = useMemo(
    () => createBeatMapActions(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const structureLensSummary = useMemo(() => createStructureLensSummary(project), [project]);
  const structureLensActions = useMemo(() => createStructureLensActions(project), [project]);
  const beatPassportSummary = useMemo(
    () => createBeatPassportSummary(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const patternCompareSummaries = useMemo(() => createPatternCompareSummaries(project), [project]);
  const styleInspectorSummary = useMemo(
    () => createStyleInspectorSummary(project, style, patternCompareSummaries),
    [patternCompareSummaries, project, style]
  );
  const activeChannels = useMemo(() => {
    const soloActive = project.mixer.some((channel) => channel.id !== "master" && channel.solo);
    return project.mixer.filter(
      (channel) => channel.id !== "master" && !channel.muted && (!soloActive || channel.solo)
    ).length;
  }, [project.mixer]);
  const activeChannelLabel = `${activeChannels} active ${activeChannels === 1 ? "channel" : "channels"}`;
  const mixBalancePadOptions = useMemo(() => createMixBalancePadOptions(project.mixer), [project.mixer]);
  const soundFocusPadOptions = useMemo(() => createSoundFocusPadOptions(project.sound), [project.sound]);
  const masterFinishPadOptions = useMemo(() => createMasterFinishPadOptions(project), [project]);
  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;
  const currentPatternStep = playbackPosition ? playbackPosition.loopStep % 16 : null;
  const selectedArrangementBlock = project.arrangement[selectedArrangementIndex] ?? project.arrangement[0];
  const selectedArrangementBars = selectedArrangementBlock ? normalizeArrangementBars(selectedArrangementBlock.bars) : 1;
  const selectedArrangementStartBar = arrangementStartBar(project, selectedArrangementIndex);
  const transportLoopMode = transportLoopScope === "pattern" ? "pattern" : "arrangement";
  const transportLoopBars =
    transportLoopScope === "pattern" ? 2 : transportLoopScope === "block" ? selectedArrangementBars : undefined;
  const transportLoopStartBar = transportLoopScope === "block" ? selectedArrangementStartBar : 0;
  const transportLoopReadout = transportLoopStatus(project, transportLoopScope, selectedArrangementIndex);
  const transportPrimary = isPlaying
    ? playbackPosition?.mode === "pattern"
      ? `Pattern ${playbackPosition.pattern} ${playbackPosition.bar}.${playbackPosition.beat}`
      : `${playbackPosition?.section ?? "Arrangement"} ${playbackPosition?.bar ?? 1}.${playbackPosition?.beat ?? 1}`
    : "Ready";
  const transportSecondary = isPlaying
    ? `${transportLoopLabel(transportLoopScope)} / Pattern ${playbackPosition?.pattern ?? project.selectedPattern} / Step ${(currentPatternStep ?? 0) + 1}`
    : transportLoopReadout;
  const selectedArrangementNextBlock = project.arrangement[selectedArrangementIndex + 1];
  const selectedArrangementNextBars = selectedArrangementNextBlock ? normalizeArrangementBars(selectedArrangementNextBlock.bars) : 0;
  const selectedArrangementFocus = useMemo(
    () => createArrangementFocusSummary(project, selectedArrangementIndex),
    [project, selectedArrangementIndex]
  );
  const canSplitArrangementBlock = selectedArrangementBars > 1;
  const canMergeArrangementBlock =
    Boolean(selectedArrangementNextBlock) && selectedArrangementBars + selectedArrangementNextBars <= maxArrangementBars;
  const bassPitches = useMemo(
    () => mergePitchLanes(bassPitchLanes(project.key), currentPattern.bassNotes.map((note) => note.pitch)),
    [currentPattern.bassNotes, project.key]
  );
  const melodyPitches = useMemo(
    () => mergePitchLanes(melodyPitchLanes(project.key), currentPattern.melodyNotes.map((note) => note.pitch)),
    [currentPattern.melodyNotes, project.key]
  );
  const keyboardCaptureKeyMap = useMemo(
    () => createKeyboardCaptureKeyMap(keyboardCaptureTarget === "bass" ? bassPitchLanes(project.key) : melodyPitchLanes(project.key)),
    [keyboardCaptureTarget, project.key]
  );
  const basslinePadOptions = useMemo(() => createBasslinePadOptions(project.key), [project.key]);
  const bassGlidePadOptions = useMemo(() => createBassGlidePadOptions(currentPattern.bassNotes), [currentPattern.bassNotes]);
  const melodyMotifOptions = useMemo(() => createMelodyMotifOptions(project.key), [project.key]);
  const melodyAccentOptions = useMemo(() => createMelodyAccentOptions(currentPattern.melodyNotes), [currentPattern.melodyNotes]);
  const melodyContourOptions = useMemo(
    () => createMelodyContourOptions(project.key, currentPattern.melodyNotes),
    [project.key, currentPattern.melodyNotes]
  );
  const patternStackOptions = useMemo(() => createPatternStackOptions(project.key), [project.key]);
  const grooveFeelOptions = useMemo(() => createGrooveFeelOptions(), []);
  const drumAccentOptions = useMemo(() => createDrumAccentOptions(), []);
  const keyboardCaptureNextStep = nextKeyboardCaptureStep(
    currentPattern,
    keyboardCaptureTarget,
    selectedNote?.track === keyboardCaptureTarget ? selectedNote.step + 1 : 0
  );
  const chordRootOptions = useMemo(
    () => mergeChordRoots(scalePitchNames(project.key), currentPattern.chordEvents.map((event) => event.root)),
    [currentPattern.chordEvents, project.key]
  );
  const selectedBassNote =
    selectedNote?.track === "bass"
      ? currentPattern.bassNotes.find((note) => note.step === selectedNote.step && note.pitch === selectedNote.pitch)
      : undefined;
  const selectedMelodyNote =
    selectedNote?.track === "melody"
      ? currentPattern.melodyNotes.find((note) => note.step === selectedNote.step && note.pitch === selectedNote.pitch)
      : undefined;
  const selectedDrumActive = selectedDrumStep
    ? currentPattern.drumPattern[selectedDrumStep.lane][selectedDrumStep.step]
    : false;
  const selectedChord =
    selectedChordIndex === null ? undefined : currentPattern.chordEvents[selectedChordIndex];
  const chordPadOptions = useMemo(
    () => createChordPadOptions(project.key, selectedChord),
    [project.key, selectedChord]
  );
  const chordRhythmOptions = useMemo(
    () => createChordRhythmOptions(currentPattern.chordEvents),
    [currentPattern.chordEvents]
  );
  const chordVoicingOptions = useMemo(
    () => createChordVoicingOptions(selectedChord),
    [selectedChord]
  );
  const selectedDrumVelocity =
    selectedDrumStep && selectedDrumActive
      ? drumStepVelocity(currentPattern, selectedDrumStep.lane, selectedDrumStep.step)
      : undefined;
  const selectedDrumTiming =
    selectedDrumStep && selectedDrumActive
      ? drumStepTimingMs(currentPattern, selectedDrumStep.lane, selectedDrumStep.step)
      : 0;
  const selectedDrumProbability =
    selectedDrumStep && selectedDrumActive
      ? drumStepProbability(currentPattern, selectedDrumStep.lane, selectedDrumStep.step)
      : undefined;
  const selectedHatRepeat =
    selectedDrumStep && selectedDrumStep.lane === "hat" && selectedDrumActive
      ? hatRepeatCount(currentPattern, selectedDrumStep.step)
      : 1;

  useEffect(() => {
    return () => {
      controllerRef.current?.stop();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    setSelectedArrangementIndex((index) => Math.min(index, Math.max(0, project.arrangement.length - 1)));
  }, [project.arrangement.length]);

  useEffect(() => {
    setSplitAfterBars((value) => clampSplitAfterBars(value, selectedArrangementBars));
  }, [selectedArrangementBars, selectedArrangementIndex]);

  useEffect(() => {
    setSelectedChordIndex((index) => {
      if (currentPattern.chordEvents.length === 0) {
        return null;
      }
      return index === null ? 0 : Math.min(index, currentPattern.chordEvents.length - 1);
    });
  }, [currentPattern.chordEvents.length, project.selectedPattern]);

  useEffect(() => {
    const snapshotIds = new Set(project.snapshots.map((snapshot) => snapshot.id));
    setSnapshotNameDrafts((current) => {
      const nextDrafts = Object.fromEntries(Object.entries(current).filter(([snapshotId]) => snapshotIds.has(snapshotId)));
      return Object.keys(nextDrafts).length === Object.keys(current).length ? current : nextDrafts;
    });
  }, [project.snapshots]);

  useEffect(() => {
    window.addEventListener("keydown", handleDesktopShortcut);
    return () => window.removeEventListener("keydown", handleDesktopShortcut);
  }, [
    project,
    undoStack,
    redoStack,
    isPlaying,
    playbackMode,
    selectedNote,
    selectedDrumStep,
    selectedDrumActive,
    selectedChordIndex,
    quickActionsOpen,
    keyboardCaptureEnabled,
    keyboardCaptureTarget
  ]);

  function handleDesktopShortcut(event: KeyboardEvent): void {
    if (isEditableShortcutTarget(event.target)) {
      return;
    }

    const key = event.key.toLowerCase();
    const withCommandModifier = event.metaKey || event.ctrlKey;
    const wantsQuickActions = withCommandModifier && !event.shiftKey && key === "k";
    const wantsUndo = withCommandModifier && !event.shiftKey && key === "z";
    const wantsRedo = withCommandModifier && ((event.shiftKey && key === "z") || key === "y");
    const wantsSave = withCommandModifier && !event.shiftKey && key === "s";
    const wantsOpen = withCommandModifier && !event.shiftKey && key === "o";

    if (wantsQuickActions) {
      event.preventDefault();
      openQuickActions();
      return;
    }

    if (quickActionsOpen) {
      if (key === "escape") {
        event.preventDefault();
        closeQuickActions();
      }
      return;
    }

    if (wantsUndo || wantsRedo || wantsSave || wantsOpen) {
      event.preventDefault();
      if (wantsUndo) {
        undoProject();
        return;
      }
      if (wantsRedo) {
        redoProject();
        return;
      }
      if (wantsSave) {
        void handleSaveProject();
        return;
      }
      void handleOpenProject();
      return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      if (!event.repeat) {
        togglePlayback();
      }
      return;
    }

    if (keyboardCaptureEnabled && isKeyboardCaptureKey(key)) {
      event.preventDefault();
      if (!event.repeat) {
        captureKeyboardNote(key);
      }
      return;
    }

    const patternShortcut: Record<string, PatternSlot> = { "1": "A", "2": "B", "3": "C" };
    const nextPattern = patternShortcut[key];
    if (nextPattern) {
      event.preventDefault();
      selectPattern(nextPattern);
      return;
    }

    if (key === "backspace" || key === "delete") {
      event.preventDefault();
      if (!event.repeat) {
        deleteSelectedEvent();
      }
    }
  }

  function updateProject(update: (current: ProjectState) => ProjectState, status = "Unsaved changes"): boolean {
    const current = projectRef.current;
    const nextProject = update(current);
    if (nextProject === current) {
      return false;
    }

    projectRef.current = nextProject;
    setUndoStack((history) => appendHistory(history, current));
    setRedoStack([]);
    setProject(nextProject);
    setProjectStatus(status);
    return true;
  }

  function updateProjectView(update: (current: ProjectState) => ProjectState, status: string): void {
    const current = projectRef.current;
    const nextProject = update(current);
    if (nextProject !== current) {
      projectRef.current = nextProject;
      setProject(nextProject);
    }
    setProjectStatus(status);
  }

  function replaceProject(nextProject: ProjectState, status: string): void {
    projectRef.current = nextProject;
    setProject(nextProject);
    setUndoStack([]);
    setRedoStack([]);
    setSelectedArrangementIndex((index) => Math.min(index, Math.max(0, nextProject.arrangement.length - 1)));
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    setProjectStatus(status);
  }

  function restoreProjectFromHistory(nextProject: ProjectState, status: string): void {
    projectRef.current = nextProject;
    setProject(nextProject);
    setSelectedArrangementIndex((index) => Math.min(index, Math.max(0, nextProject.arrangement.length - 1)));
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    setPlaybackPosition(null);
    setProjectStatus(status);
  }

  function undoProject(): void {
    const previousProject = undoStack[undoStack.length - 1];
    if (!previousProject) {
      setProjectStatus("Nothing to undo");
      return;
    }

    const current = projectRef.current;
    setUndoStack((history) => history.slice(0, -1));
    setRedoStack((history) => prependFuture(history, current));
    restoreProjectFromHistory(previousProject, "Undo applied");
  }

  function redoProject(): void {
    const nextProject = redoStack[0];
    if (!nextProject) {
      setProjectStatus("Nothing to redo");
      return;
    }

    const current = projectRef.current;
    setRedoStack((history) => history.slice(1));
    setUndoStack((history) => appendHistory(history, current));
    restoreProjectFromHistory(nextProject, "Redo applied");
  }

  function saveCurrentSnapshot(): void {
    const snapshotName = nextProjectSnapshotName(projectRef.current);
    updateProject((current) => saveProjectSnapshot(current), `Saved snapshot ${snapshotName}`);
  }

  function restoreSavedSnapshot(snapshotId: string): void {
    const snapshot = projectRef.current.snapshots.find((candidate) => candidate.id === snapshotId);
    if (!snapshot) {
      setProjectStatus("Snapshot not found");
      return;
    }
    const changed = updateProject((current) => restoreProjectSnapshot(current, snapshotId), `Restored snapshot ${snapshot.name}`);
    if (changed) {
      setSelectedArrangementIndex(0);
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setPlaybackPosition(null);
    }
  }

  function deleteSavedSnapshot(snapshotId: string): void {
    const snapshot = projectRef.current.snapshots.find((candidate) => candidate.id === snapshotId);
    if (!snapshot) {
      setProjectStatus("Snapshot not found");
      return;
    }
    updateProject((current) => deleteProjectSnapshot(current, snapshotId), `Deleted snapshot ${snapshot.name}`);
  }

  function updateSnapshotNameDraft(snapshotId: string, name: string): void {
    setSnapshotNameDrafts((current) => ({
      ...current,
      [snapshotId]: name
    }));
  }

  function clearSnapshotNameDraft(snapshotId: string): void {
    setSnapshotNameDrafts((current) => {
      if (!(snapshotId in current)) {
        return current;
      }
      const nextDrafts = { ...current };
      delete nextDrafts[snapshotId];
      return nextDrafts;
    });
  }

  function commitSnapshotName(snapshotId: string, name: string): void {
    const snapshot = projectRef.current.snapshots.find((candidate) => candidate.id === snapshotId);
    if (!snapshot) {
      clearSnapshotNameDraft(snapshotId);
      setProjectStatus("Snapshot not found");
      return;
    }

    const normalizedName = normalizeProjectSnapshotName(name);
    if (!normalizedName) {
      clearSnapshotNameDraft(snapshotId);
      setProjectStatus("Snapshot name required");
      return;
    }

    if (snapshot.name === normalizedName) {
      clearSnapshotNameDraft(snapshotId);
      return;
    }

    const changed = updateProject(
      (current) => renameProjectSnapshot(current, snapshotId, normalizedName),
      `Renamed snapshot ${normalizedName}`
    );
    if (changed) {
      clearSnapshotNameDraft(snapshotId);
    }
  }

  function updateCurrentPattern(update: (pattern: PatternData) => PatternData, status = "Unsaved changes"): boolean {
    return updateProject((current) => {
      const currentPatternData = current.patterns[current.selectedPattern];
      const nextPatternData = update(currentPatternData);
      if (nextPatternData === currentPatternData) {
        return current;
      }
      return {
        ...current,
        patterns: {
          ...current.patterns,
          [current.selectedPattern]: nextPatternData
        }
      };
    }, status);
  }

  function selectPattern(pattern: PatternSlot): void {
    updateProjectView(
      (current) => (current.selectedPattern === pattern ? current : { ...current, selectedPattern: pattern }),
      `Editing Pattern ${pattern}`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(0);
  }

  function cuePattern(pattern: PatternSlot): void {
    updateProjectView(
      (current) => (current.selectedPattern === pattern ? current : { ...current, selectedPattern: pattern }),
      `Cue Pattern ${pattern}`
    );
    selectTransportLoopScope("pattern", false);
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(0);
  }

  function selectTransportLoopScope(scope: TransportLoopScope, showStatus = true): void {
    setTransportLoopScope(scope);
    setPlaybackMode(scope === "pattern" ? "pattern" : "arrangement");
    if (showStatus) {
      setProjectStatus(`${transportLoopLabel(scope)} loop`);
    }
  }

  function usePatternInSelectedBlock(pattern: PatternSlot): void {
    const block = projectRef.current.arrangement[selectedArrangementIndex];
    if (!block) {
      setProjectStatus("Select an arrangement block");
      return;
    }
    const changed = updateArrangementBlock(
      selectedArrangementIndex,
      { pattern },
      `Block ${selectedArrangementIndex + 1} uses Pattern ${pattern}`
    );
    if (changed) {
      selectTransportLoopScope("arrangement", false);
    }
  }

  function copySelectedPattern(target: PatternSlot): void {
    const sourceSlot = projectRef.current.selectedPattern;
    updateProject(
      (current) => ({
        ...current,
        selectedPattern: target,
        patterns: {
          ...current.patterns,
          [target]: clonePatternData(current.patterns[current.selectedPattern])
        }
      }),
      `Copied Pattern ${sourceSlot} to ${target}`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(0);
  }

  function clearSelectedPattern(): void {
    const sourceSlot = projectRef.current.selectedPattern;
    updateProject(
      (current) => ({
        ...current,
        patterns: {
          ...current.patterns,
          [current.selectedPattern]: createEmptyPatternData()
        }
      }),
      `Cleared Pattern ${sourceSlot}`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function applyPatternVariation(preset: PatternVariationPreset): void {
    const sourceSlot = projectRef.current.selectedPattern;
    updateCurrentPattern(
      (pattern) => createPatternVariation(pattern, preset),
      `${patternVariationPresetLabel(preset)} variation applied to Pattern ${sourceSlot}`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function applyPatternFill(preset: PatternFillPreset): void {
    const sourceSlot = projectRef.current.selectedPattern;
    updateCurrentPattern(
      (pattern) => applyPatternFillPreset(pattern, preset, projectRef.current.key),
      `${patternFillPresetLabel(preset)} applied to Pattern ${sourceSlot}`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function deleteSelectedEvent(): void {
    if (deleteSelectedNote()) {
      return;
    }
    if (clearSelectedDrumStep()) {
      return;
    }
    if (deleteSelectedChordEvent()) {
      return;
    }
    setProjectStatus("Select a step, note, or chord to delete");
  }

  function deleteSelectedNote(): boolean {
    if (!selectedNote) {
      return false;
    }

    const target = selectedNote;
    const changed = updateCurrentPattern(
      (pattern) => {
        if (target.track === "bass") {
          const bassNotes = pattern.bassNotes.filter(
            (note) => note.step !== target.step || note.pitch !== target.pitch
          );
          return bassNotes.length === pattern.bassNotes.length ? pattern : { ...pattern, bassNotes };
        }

        const melodyNotes = pattern.melodyNotes.filter(
          (note) => note.step !== target.step || note.pitch !== target.pitch
        );
        return melodyNotes.length === pattern.melodyNotes.length ? pattern : { ...pattern, melodyNotes };
      },
      `Deleted ${target.track === "bass" ? "808" : "Synth"} ${target.pitch}.${target.step + 1}`
    );

    if (changed) {
      setSelectedNote(null);
    }
    return changed;
  }

  function deleteSelectedChordEvent(): boolean {
    if (selectedChordIndex === null) {
      return false;
    }
    return deleteChordEvent(selectedChordIndex);
  }

  function clearSelectedDrumStep(): boolean {
    if (!selectedDrumStep) {
      return false;
    }

    const target = selectedDrumStep;
    const changed = updateCurrentPattern(
      (pattern) => {
        if (!pattern.drumPattern[target.lane][target.step]) {
          return pattern;
        }

        return {
          ...pattern,
          drumPattern: {
            ...pattern.drumPattern,
            [target.lane]: pattern.drumPattern[target.lane].map((enabled, index) =>
              index === target.step ? false : enabled
            )
          },
          drumTimings: {
            ...pattern.drumTimings,
            [target.lane]: pattern.drumTimings[target.lane].map((timing, index) =>
              index === target.step ? 0 : timing
            )
          },
          hatRepeats:
            target.lane === "hat"
              ? pattern.hatRepeats.map((repeat, index) => (index === target.step ? 1 : repeat))
              : pattern.hatRepeats
        };
      },
      `Deleted ${drumLabels[target.lane]} step ${target.step + 1}`
    );

    if (changed) {
      setSelectedDrumStep(null);
    }
    return changed;
  }

  function selectArrangementBlock(index: number): void {
    const block = project.arrangement[index];
    if (!block) {
      return;
    }

    setSelectedArrangementIndex(index);
    updateProjectView((current) => ({ ...current, selectedPattern: block.pattern }), `Arranging ${block.section}`);
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function updateArrangementBlock(index: number, update: Partial<ArrangementBlock>, status = "Unsaved changes"): boolean {
    const changed = updateProject((current) => {
      const block = current.arrangement[index];
      if (!block) {
        return current;
      }
      const nextBlock: ArrangementBlock = {
        ...block,
        ...update,
        energy: update.energy === undefined ? block.energy : normalizeArrangementEnergy(update.energy),
        bars: update.bars === undefined ? block.bars : normalizeArrangementBars(update.bars),
        mutedTracks:
          update.mutedTracks === undefined
            ? block.mutedTracks
            : normalizeArrangementMutedTracks(update.mutedTracks)
      };
      return {
        ...current,
        selectedPattern: nextBlock.pattern,
        arrangement: current.arrangement.map((candidate, candidateIndex) => (candidateIndex === index ? nextBlock : candidate))
      };
    }, status);
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
    return changed;
  }

  function cyclePatternChainStep(index: number): void {
    const block = projectRef.current.arrangement[index];
    if (!block) {
      setProjectStatus("Chain step not found");
      return;
    }
    const nextPattern = nextPatternSlot(block.pattern);
    const changed = updateArrangementBlock(index, { pattern: nextPattern }, `Step ${index + 1} Pattern ${nextPattern}`);
    if (changed) {
      setSelectedArrangementIndex(index);
    }
  }

  function applyArrangementMoveToSelected(preset: ArrangementMovePreset): void {
    const block = projectRef.current.arrangement[selectedArrangementIndex];
    if (!block) {
      setProjectStatus("Select an arrangement block");
      return;
    }
    const nextBlock = applyArrangementMovePreset(block, preset);
    updateArrangementBlock(
      selectedArrangementIndex,
      {
        energy: nextBlock.energy,
        mutedTracks: nextBlock.mutedTracks
      },
      `Applied ${arrangementMovePresetLabel(preset)} move`
    );
  }

  function applyArrangementFocusPreset(presetId: ArrangementFocusPresetId): void {
    const preset = arrangementFocusPresets.find((candidate) => candidate.id === presetId);
    const block = projectRef.current.arrangement[selectedArrangementIndex];
    if (!preset || !block) {
      setProjectStatus("Select an arrangement block");
      return;
    }

    const changed = updateArrangementBlock(
      selectedArrangementIndex,
      {
        section: preset.section,
        pattern: preset.pattern,
        bars: preset.bars,
        energy: preset.energy,
        mutedTracks: [...preset.mutedTracks]
      },
      `Applied ${preset.label} focus`
    );
    if (changed) {
      selectTransportLoopScope("block", false);
    }
  }

  function toggleArrangementTrackMute(track: ArrangementMuteTrack): void {
    const block = projectRef.current.arrangement[selectedArrangementIndex];
    if (!block) {
      return;
    }
    const mutedTracks = block.mutedTracks.includes(track)
      ? block.mutedTracks.filter((mutedTrack) => mutedTrack !== track)
      : [...block.mutedTracks, track];
    updateArrangementBlock(selectedArrangementIndex, { mutedTracks });
  }

  function applyArrangementTemplate(template: ArrangementTemplateId): void {
    const arrangement = createArrangementTemplate(template);
    const firstBlock = arrangement[0];
    const changed = updateProject(
      (current) => ({
        ...current,
        selectedPattern: firstBlock.pattern,
        arrangement
      }),
      `Applied ${arrangementTemplateLabel(template)} arrangement`
    );
    if (changed) {
      setSelectedArrangementIndex(0);
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
  }

  function applyPatternChain(chain: PatternChainId): void {
    const arrangement = createPatternChain(chain);
    const firstBlock = arrangement[0];
    const changed = updateProject(
      (current) => ({
        ...current,
        selectedPattern: firstBlock.pattern,
        arrangement
      }),
      `Applied ${patternChainLabel(chain)}`
    );
    if (changed) {
      setSelectedArrangementIndex(0);
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
  }

  function expandPatternChain(): void {
    const arrangement = expandPatternChainArrangement(projectRef.current.arrangement);
    const firstBlock = arrangement[0];
    const changed = updateProject(
      (current) => ({
        ...current,
        selectedPattern: firstBlock.pattern,
        arrangement
      }),
      "Expanded chain to song form"
    );
    if (changed) {
      setSelectedArrangementIndex(0);
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
  }

  function updateMixerChannel(id: MixerChannel["id"], update: Partial<MixerChannel>): void {
    const nextUpdate: Partial<MixerChannel> = { ...update };
    if (update.lowCut !== undefined) {
      nextUpdate.lowCut = normalizeMixerEq(update.lowCut);
    }
    if (update.air !== undefined) {
      nextUpdate.air = normalizeMixerEq(update.air);
    }
    if (update.drive !== undefined) {
      nextUpdate.drive = normalizeMixerEq(update.drive);
    }
    if (update.glue !== undefined) {
      nextUpdate.glue = normalizeMixerEq(update.glue);
    }
    if (update.send !== undefined) {
      nextUpdate.send = normalizeMixerEq(update.send);
    }
    updateProject((current) => ({
      ...current,
      mixer: current.mixer.map((track) => (track.id === id ? { ...track, ...nextUpdate } : track))
    }));
  }

  function applyMasterPreset(preset: MasterPreset): void {
    updateProject((current) => ({
      ...current,
      masterPreset: preset,
      masterCeilingDb: masterPresetCeilingDb(preset)
    }));
  }

  function applyMasterFinishPad(padId: MasterFinishPadId): void {
    const pad = masterFinishPadDefinitions.find((definition) => definition.id === padId);
    if (!pad) {
      setProjectStatus("Master finish pad not found");
      return;
    }

    const changed = updateProject((current) => applyMasterFinishPadToProject(current, pad), `${pad.label} master finish applied`);
    if (!changed) {
      setProjectStatus(`${pad.label} master finish already selected`);
    }
  }

  function applyMixFixPreset(preset: MixFixPreset): void {
    const stemSnapshot = analyzeStemExports(projectRef.current);
    updateProject(
      (current) => applyMixFixToProject(current, preset, stemSnapshot),
      `Applied ${mixFixPresetLabel(preset)} mix fix`
    );
  }

  function applyMixBalancePad(padId: MixBalancePadId): void {
    const pad = mixBalancePadDefinitions.find((definition) => definition.id === padId);
    if (!pad) {
      setProjectStatus("Mix balance pad not found");
      return;
    }

    const changed = updateProject((current) => {
      const mixer = applyMixBalancePadToMixer(current.mixer, pad);
      return sameMixerChannels(current.mixer, mixer) ? current : { ...current, mixer };
    }, `${pad.label} mix balance applied`);

    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    } else {
      setProjectStatus(`${pad.label} mix balance already selected`);
    }
  }

  function applySoundPreset(preset: (typeof soundPresetIds)[number]): void {
    updateProject((current) => ({
      ...current,
      sound: soundPresetDesign(preset)
    }));
  }

  function applySoundFocusPad(padId: SoundFocusPadId): void {
    const pad = soundFocusPadDefinitions.find((definition) => definition.id === padId);
    if (!pad) {
      setProjectStatus("Sound focus pad not found");
      return;
    }

    const changed = updateProject((current) => {
      const sound = applySoundFocusPadToSound(current.sound, pad);
      return sameSoundDesign(current.sound, sound) ? current : { ...current, sound };
    }, `${pad.label} sound focus applied`);

    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    } else {
      setProjectStatus(`${pad.label} sound focus already selected`);
    }
  }

  function updateSoundDesign(update: Partial<Omit<SoundDesign, "preset">>): void {
    updateProject((current) => ({
      ...current,
      sound: {
        ...current.sound,
        ...Object.fromEntries(Object.entries(update).map(([key, value]) => [key, clampUnit(value)])),
        preset: "custom"
      }
    }));
  }

  function duplicateArrangementBlock(): void {
    const changed = updateProject((current) => {
      const source = current.arrangement[selectedArrangementIndex] ?? current.arrangement[0];
      if (!source) {
        return current;
      }
      const nextIndex = Math.min(selectedArrangementIndex + 1, current.arrangement.length);
      setSelectedArrangementIndex(nextIndex);
      return {
        ...current,
        selectedPattern: source.pattern,
        arrangement: [
          ...current.arrangement.slice(0, nextIndex),
          { ...source, mutedTracks: [...source.mutedTracks] },
          ...current.arrangement.slice(nextIndex)
        ]
      };
    }, "Duplicated arrangement block");
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
  }

  function splitArrangementBlock(): void {
    const changed = updateProject((current) => {
      const block = current.arrangement[selectedArrangementIndex];
      if (!block) {
        return current;
      }
      const blockBars = normalizeArrangementBars(block.bars);
      if (blockBars <= 1) {
        return current;
      }
      const firstBars = clampSplitAfterBars(splitAfterBars, blockBars);
      const secondBars = blockBars - firstBars;
      if (secondBars < 1) {
        return current;
      }
      const firstBlock: ArrangementBlock = {
        ...block,
        bars: firstBars,
        mutedTracks: [...block.mutedTracks]
      };
      const secondBlock: ArrangementBlock = {
        ...block,
        bars: secondBars,
        mutedTracks: [...block.mutedTracks]
      };
      const nextIndex = selectedArrangementIndex + 1;
      setSelectedArrangementIndex(nextIndex);
      setSplitAfterBars(clampSplitAfterBars(1, secondBars));
      return {
        ...current,
        selectedPattern: secondBlock.pattern,
        arrangement: [
          ...current.arrangement.slice(0, selectedArrangementIndex),
          firstBlock,
          secondBlock,
          ...current.arrangement.slice(selectedArrangementIndex + 1)
        ]
      };
    }, "Split arrangement block");
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    if (!changed) {
      setProjectStatus("Block needs 2+ bars to split");
    }
  }

  function mergeArrangementBlock(): void {
    const changed = updateProject((current) => {
      const block = current.arrangement[selectedArrangementIndex];
      const nextBlock = current.arrangement[selectedArrangementIndex + 1];
      if (!block || !nextBlock) {
        return current;
      }
      const mergedBars = normalizeArrangementBars(block.bars) + normalizeArrangementBars(nextBlock.bars);
      if (mergedBars > maxArrangementBars) {
        return current;
      }
      const mergedBlock: ArrangementBlock = {
        ...block,
        bars: mergedBars,
        mutedTracks: [...block.mutedTracks]
      };
      setSelectedArrangementIndex(selectedArrangementIndex);
      setSplitAfterBars(clampSplitAfterBars(1, mergedBars));
      return {
        ...current,
        selectedPattern: mergedBlock.pattern,
        arrangement: [
          ...current.arrangement.slice(0, selectedArrangementIndex),
          mergedBlock,
          ...current.arrangement.slice(selectedArrangementIndex + 2)
        ]
      };
    }, "Merged arrangement blocks");
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    if (!changed) {
      setProjectStatus("Merge needs a next block within 16 bars");
    }
  }

  function moveArrangementBlock(direction: -1 | 1): void {
    const changed = updateProject((current) => {
      const fromIndex = selectedArrangementIndex;
      const toIndex = fromIndex + direction;
      const movingBlock = current.arrangement[fromIndex];
      if (!movingBlock || toIndex < 0 || toIndex >= current.arrangement.length) {
        return current;
      }

      const arrangement = [...current.arrangement];
      arrangement.splice(fromIndex, 1);
      arrangement.splice(toIndex, 0, movingBlock);
      setSelectedArrangementIndex(toIndex);
      return {
        ...current,
        selectedPattern: movingBlock.pattern,
        arrangement
      };
    }, direction < 0 ? "Moved block left" : "Moved block right");
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
  }

  function deleteArrangementBlock(): void {
    const changed = updateProject((current) => {
      if (current.arrangement.length <= 1) {
        return current;
      }

      const arrangement = current.arrangement.filter((_, index) => index !== selectedArrangementIndex);
      const nextIndex = Math.min(selectedArrangementIndex, arrangement.length - 1);
      const nextBlock = arrangement[nextIndex];
      setSelectedArrangementIndex(nextIndex);
      return {
        ...current,
        selectedPattern: nextBlock.pattern,
        arrangement
      };
    }, "Deleted arrangement block");
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    if (!changed) {
      setProjectStatus("Arrangement needs one block");
    }
  }

  function toggleStep(lane: DrumLane, step: number): void {
    const selectedSameStep = selectedDrumStep?.lane === lane && selectedDrumStep.step === step;
    const active = currentPattern.drumPattern[lane][step];
    setSelectedDrumStep({ lane, step });
    setSelectedNote(null);
    setSelectedChordIndex(null);
    if (active && !selectedSameStep) {
      return;
    }

    updateCurrentPattern((pattern) => {
      const nextActive = active ? false : true;
      return {
        ...pattern,
        drumPattern: {
          ...pattern.drumPattern,
          [lane]: pattern.drumPattern[lane].map((enabled, index) => (index === step ? nextActive : enabled))
        },
        drumVelocities: {
          ...pattern.drumVelocities,
          [lane]: pattern.drumVelocities[lane].map((velocity, index) =>
            index === step && nextActive ? normalizeDrumVelocity(velocity || defaultDrumVelocity(lane, step)) : velocity
          )
        },
        drumTimings: {
          ...pattern.drumTimings,
          [lane]: pattern.drumTimings[lane].map((timing, index) =>
            index === step ? (nextActive ? normalizeDrumTimingMs(timing) : 0) : timing
          )
        },
        drumProbabilities: {
          ...pattern.drumProbabilities,
          [lane]: pattern.drumProbabilities[lane].map((probability, index) =>
            index === step && nextActive ? normalizeDrumProbability(probability) : probability
          )
        },
        hatRepeats:
          lane === "hat"
            ? pattern.hatRepeats.map((repeat, index) => (index === step && !nextActive ? 1 : repeat))
            : pattern.hatRepeats
      };
    });
  }

  function updateSelectedDrumVelocity(velocity: number): void {
    if (!selectedDrumStep || !selectedDrumActive) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      drumVelocities: {
        ...pattern.drumVelocities,
        [selectedDrumStep.lane]: pattern.drumVelocities[selectedDrumStep.lane].map((currentVelocity, index) =>
          index === selectedDrumStep.step ? normalizeDrumVelocity(velocity) : currentVelocity
        )
      }
    }));
  }

  function updateSelectedDrumProbability(probability: number): void {
    if (!selectedDrumStep || !selectedDrumActive) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      drumProbabilities: {
        ...pattern.drumProbabilities,
        [selectedDrumStep.lane]: pattern.drumProbabilities[selectedDrumStep.lane].map((currentProbability, index) =>
          index === selectedDrumStep.step ? normalizeDrumProbability(probability) : currentProbability
        )
      }
    }));
  }

  function updateSelectedHatRepeat(repeat: number): void {
    if (!selectedDrumStep || selectedDrumStep.lane !== "hat" || !selectedDrumActive) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      hatRepeats: pattern.hatRepeats.map((currentRepeat, index) =>
        index === selectedDrumStep.step ? normalizeHatRepeat(repeat) : currentRepeat
      )
    }));
  }

  function updateSelectedDrumTiming(timingMs: number): void {
    if (!selectedDrumStep || !selectedDrumActive) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      drumTimings: {
        ...pattern.drumTimings,
        [selectedDrumStep.lane]: pattern.drumTimings[selectedDrumStep.lane].map((currentTiming, index) =>
          index === selectedDrumStep.step ? normalizeDrumTimingMs(timingMs) : currentTiming
        )
      }
    }));
  }

  function applySelectedDrumGroove(preset: DrumGroovePreset): void {
    updateCurrentPattern(
      (pattern) => applyDrumGroovePreset(pattern, preset),
      `${drumGroovePresetLabel(preset)} groove applied to Pattern ${projectRef.current.selectedPattern}`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function toggleBassNote(step: number, pitch: string): void {
    const exists = currentPattern.bassNotes.some((note) => note.step === step && note.pitch === pitch);
    const selectedSameNote = selectedNote?.track === "bass" && selectedNote.step === step && selectedNote.pitch === pitch;
    setSelectedNote({ track: "bass", step, pitch });
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    if (exists && !selectedSameNote) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      bassNotes: exists
        ? pattern.bassNotes.filter((note) => note.step !== step || note.pitch !== pitch)
        : sortBassNotes([...pattern.bassNotes, { step, pitch, length: 2, glide: false, probability: 1 }])
    }));
    setSelectedNote(exists ? null : { track: "bass", step, pitch });
  }

  function toggleMelodyNote(step: number, pitch: string): void {
    const exists = currentPattern.melodyNotes.some((note) => note.step === step && note.pitch === pitch);
    const selectedSameNote = selectedNote?.track === "melody" && selectedNote.step === step && selectedNote.pitch === pitch;
    setSelectedNote({ track: "melody", step, pitch });
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    if (exists && !selectedSameNote) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      melodyNotes: exists
        ? pattern.melodyNotes.filter((note) => note.step !== step || note.pitch !== pitch)
        : sortMelodyNotes([...pattern.melodyNotes, { step, pitch, length: 1, velocity: 0.68, probability: 1 }])
    }));
    setSelectedNote(exists ? null : { track: "melody", step, pitch });
  }

  function captureKeyboardNote(key: KeyboardCaptureKey): void {
    const current = projectRef.current;
    const pattern = activePattern(current);
    const target = keyboardCaptureTarget;
    const pitch = keyboardCapturePitchForKey(
      key,
      target === "bass" ? bassPitchLanes(current.key) : melodyPitchLanes(current.key)
    );
    if (!pitch) {
      setProjectStatus("Keyboard Capture key is out of range");
      return;
    }

    const step = nextKeyboardCaptureStep(
      pattern,
      target,
      selectedNote?.track === target ? selectedNote.step + 1 : 0
    );
    const changed = updateCurrentPattern(
      (currentPatternData) => addKeyboardCaptureNote(currentPatternData, target, step, pitch),
      `Captured ${target === "bass" ? "808" : "Synth"} ${pitch}.${step + 1} on Pattern ${current.selectedPattern}`
    );

    if (!changed) {
      setProjectStatus("Keyboard Capture note already exists");
      return;
    }

    setSelectedNote({ track: target, step, pitch });
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function applyPatternStack(stackId: PatternStackId): void {
    const stack = patternStackDefinitions.find((candidate) => candidate.id === stackId);
    if (!stack) {
      setProjectStatus("Pattern stack not found");
      return;
    }

    const stackEvents = createPatternStackEvents(projectRef.current.key, stack);
    const changed = updateCurrentPattern(
      (pattern) => (samePatternStackEvents(pattern, stackEvents) ? pattern : { ...pattern, ...stackEvents }),
      `${stack.label} pattern stack applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setProjectStatus(`${stack.label} pattern stack already selected`);
      return;
    }

    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(0);
  }

  function applyGrooveFeel(feelId: GrooveFeelId): void {
    const feel = grooveFeelDefinitions.find((candidate) => candidate.id === feelId);
    if (!feel) {
      setProjectStatus("Groove feel not found");
      return;
    }

    const changed = updateCurrentPattern(
      (pattern) => {
        const nextPatternData = applyGrooveFeelToPattern(pattern, feel);
        return sameGrooveFeelState(pattern, nextPatternData) ? pattern : nextPatternData;
      },
      `${feel.label} groove feel applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setProjectStatus(`${feel.label} groove feel already selected`);
    }
  }

  function applyDrumAccent(accentId: DrumAccentId): void {
    const accent = drumAccentDefinitions.find((candidate) => candidate.id === accentId);
    if (!accent) {
      setProjectStatus("Drum accent not found");
      return;
    }

    const changed = updateCurrentPattern(
      (pattern) => {
        const nextPatternData = applyDrumAccentToPattern(pattern, accent.id);
        return sameDrumAccentState(pattern, nextPatternData) ? pattern : nextPatternData;
      },
      `${accent.label} drum accent applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setProjectStatus(`${accent.label} drum accent already selected`);
    }
  }

  function applyBasslinePad(padId: BasslinePadId): void {
    const pad = basslinePadDefinitions.find((candidate) => candidate.id === padId);
    if (!pad) {
      setProjectStatus("808 bassline pad not found");
      return;
    }

    const bassNotes = createBasslinePadNotes(projectRef.current.key, pad);
    const changed = updateCurrentPattern(
      (pattern) => (sameBassNotes(pattern.bassNotes, bassNotes) ? pattern : { ...pattern, bassNotes }),
      `${pad.label} 808 bassline applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setProjectStatus(`${pad.label} 808 bassline already selected`);
      return;
    }

    const firstNote = bassNotes[0];
    setSelectedNote(firstNote ? { track: "bass", step: firstNote.step, pitch: firstNote.pitch } : null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function applyBassGlidePad(padId: BassGlidePadId): void {
    const pad = bassGlidePadDefinitions.find((candidate) => candidate.id === padId);
    if (!pad) {
      setProjectStatus("808 glide pad not found");
      return;
    }

    const currentBassNotes = projectRef.current.patterns[projectRef.current.selectedPattern].bassNotes;
    if (currentBassNotes.length === 0) {
      setProjectStatus(`Add an 808 note before using ${pad.label} glide`);
      return;
    }

    const bassNotes = applyBassGlidePadToNotes(currentBassNotes, pad.id);
    const changed = updateCurrentPattern(
      (pattern) => (sameBassNotes(pattern.bassNotes, bassNotes) ? pattern : { ...pattern, bassNotes }),
      `${pad.label} 808 glide applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setProjectStatus(`${pad.label} 808 glide already selected`);
      return;
    }

    const firstNote = bassNotes[0];
    setSelectedNote(firstNote ? { track: "bass", step: firstNote.step, pitch: firstNote.pitch } : null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function applyMelodyMotif(motifId: MelodyMotifId): void {
    const motif = melodyMotifDefinitions.find((candidate) => candidate.id === motifId);
    if (!motif) {
      setProjectStatus("Melody motif not found");
      return;
    }

    const melodyNotes = createMelodyMotifNotes(projectRef.current.key, motif);
    const changed = updateCurrentPattern(
      (pattern) => (sameMelodyNotes(pattern.melodyNotes, melodyNotes) ? pattern : { ...pattern, melodyNotes }),
      `${motif.label} melody motif applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setProjectStatus(`${motif.label} melody motif already selected`);
      return;
    }

    const firstNote = melodyNotes[0];
    setSelectedNote(firstNote ? { track: "melody", step: firstNote.step, pitch: firstNote.pitch } : null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function applyMelodyAccent(accentId: MelodyAccentId): void {
    const accent = melodyAccentDefinitions.find((candidate) => candidate.id === accentId);
    if (!accent) {
      setProjectStatus("Melody accent pad not found");
      return;
    }

    const currentMelodyNotes = projectRef.current.patterns[projectRef.current.selectedPattern].melodyNotes;
    if (currentMelodyNotes.length === 0) {
      setProjectStatus(`Add a Synth note before using ${accent.label} accent`);
      return;
    }

    const melodyNotes = applyMelodyAccentToNotes(currentMelodyNotes, accent.id);
    const changed = updateCurrentPattern(
      (pattern) => (sameMelodyNotes(pattern.melodyNotes, melodyNotes) ? pattern : { ...pattern, melodyNotes }),
      `${accent.label} melody accent applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setProjectStatus(`${accent.label} melody accent already selected`);
      return;
    }

    const firstNote = melodyNotes[0];
    setSelectedNote(firstNote ? { track: "melody", step: firstNote.step, pitch: firstNote.pitch } : null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function applyMelodyContour(contourId: MelodyContourId): void {
    const contour = melodyContourDefinitions.find((candidate) => candidate.id === contourId);
    if (!contour) {
      setProjectStatus("Melody contour pad not found");
      return;
    }

    const currentMelodyNotes = projectRef.current.patterns[projectRef.current.selectedPattern].melodyNotes;
    if (currentMelodyNotes.length === 0) {
      setProjectStatus(`Add a Synth note before using ${contour.label} contour`);
      return;
    }

    const melodyNotes = applyMelodyContourToNotes(projectRef.current.key, currentMelodyNotes, contour.id);
    const changed = updateCurrentPattern(
      (pattern) => (sameMelodyNotes(pattern.melodyNotes, melodyNotes) ? pattern : { ...pattern, melodyNotes }),
      `${contour.label} melody contour applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setProjectStatus(`${contour.label} melody contour already selected`);
      return;
    }

    const firstNote = melodyNotes[0];
    setSelectedNote(firstNote ? { track: "melody", step: firstNote.step, pitch: firstNote.pitch } : null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function updateSelectedLength(length: number): void {
    if (!selectedNote) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      bassNotes:
        selectedNote.track === "bass"
          ? pattern.bassNotes.map((note) =>
              note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, length } : note
            )
          : pattern.bassNotes,
      melodyNotes:
        selectedNote.track === "melody"
          ? pattern.melodyNotes.map((note) =>
              note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, length } : note
            )
          : pattern.melodyNotes
    }));
  }

  function updateSelectedGlide(glide: boolean): void {
    if (!selectedNote || selectedNote.track !== "bass") {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      bassNotes: pattern.bassNotes.map((note) =>
        note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, glide } : note
      )
    }));
  }

  function updateSelectedVelocity(velocity: number): void {
    if (!selectedNote || selectedNote.track !== "melody") {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      melodyNotes: pattern.melodyNotes.map((note) =>
        note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, velocity } : note
      )
    }));
  }

  function updateSelectedNoteProbability(probability: number): void {
    if (!selectedNote) {
      return;
    }

    const nextProbability = normalizeEventProbability(probability);
    updateCurrentPattern((pattern) => ({
      ...pattern,
      bassNotes:
        selectedNote.track === "bass"
          ? pattern.bassNotes.map((note) =>
              note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, probability: nextProbability } : note
            )
          : pattern.bassNotes,
      melodyNotes:
        selectedNote.track === "melody"
          ? pattern.melodyNotes.map((note) =>
              note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, probability: nextProbability } : note
            )
          : pattern.melodyNotes
    }));
  }

  function moveSelectedNoteStep(direction: -1 | 1): void {
    if (!selectedNote) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    const nextStep = clampStepStart(selectedNote.step + direction);
    moveSelectedNoteTo(nextStep, selectedNote.pitch, direction < 0 ? "Moved note left" : "Moved note right");
  }

  function moveSelectedNotePitch(direction: -1 | 1): void {
    if (!selectedNote) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    const current = projectRef.current;
    const pattern = activePattern(current);
    const usedPitches =
      selectedNote.track === "bass"
        ? pattern.bassNotes.map((note) => note.pitch)
        : pattern.melodyNotes.map((note) => note.pitch);
    const nextPitch = adjacentTrackPitch(selectedNote.track, current.key, selectedNote.pitch, direction, usedPitches);
    if (!nextPitch) {
      setProjectStatus(direction < 0 ? "Note is at the low pitch edge" : "Note is at the high pitch edge");
      return;
    }

    moveSelectedNoteTo(selectedNote.step, nextPitch, direction < 0 ? "Moved note down" : "Moved note up");
  }

  function moveSelectedNoteOctave(direction: -1 | 1): void {
    if (!selectedNote) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    const nextPitch = octaveShiftPitch(selectedNote.track, selectedNote.pitch, direction);
    if (!nextPitch) {
      setProjectStatus(direction < 0 ? "Note is at the low octave edge" : "Note is at the high octave edge");
      return;
    }

    moveSelectedNoteTo(selectedNote.step, nextPitch, direction < 0 ? "Moved note down an octave" : "Moved note up an octave");
  }

  function moveSelectedNoteTo(step: number, pitch: string, status: string): void {
    const target = selectedNote;
    if (!target) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }
    if (target.step === step && target.pitch === pitch) {
      setProjectStatus("Note is already there");
      return;
    }

    const pattern = activePattern(projectRef.current);
    const sourceExists =
      target.track === "bass"
        ? pattern.bassNotes.some((note) => matchesSelectedNote(note, target))
        : pattern.melodyNotes.some((note) => matchesSelectedNote(note, target));
    if (!sourceExists) {
      setProjectStatus("Select an active note");
      return;
    }

    const occupied =
      target.track === "bass"
        ? pattern.bassNotes.some((note) => !matchesSelectedNote(note, target) && note.step === step && note.pitch === pitch)
        : pattern.melodyNotes.some((note) => !matchesSelectedNote(note, target) && note.step === step && note.pitch === pitch);
    if (occupied) {
      setProjectStatus("Target note already exists");
      return;
    }

    const changed = updateCurrentPattern(
      (currentPatternData) => ({
        ...currentPatternData,
        bassNotes:
          target.track === "bass"
            ? sortBassNotes(
                currentPatternData.bassNotes.map((note) =>
                  matchesSelectedNote(note, target) ? { ...note, step, pitch } : note
                )
              )
            : currentPatternData.bassNotes,
        melodyNotes:
          target.track === "melody"
            ? sortMelodyNotes(
                currentPatternData.melodyNotes.map((note) =>
                  matchesSelectedNote(note, target) ? { ...note, step, pitch } : note
                )
              )
            : currentPatternData.melodyNotes
      }),
      status
    );

    if (changed) {
      setSelectedNote({ ...target, step, pitch });
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
  }

  function duplicateSelectedNote(): void {
    const target = selectedNote;
    if (!target) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    const pattern = activePattern(projectRef.current);
    if (target.track === "bass") {
      const source = pattern.bassNotes.find((note) => matchesSelectedNote(note, target));
      if (!source) {
        setProjectStatus("Select an active note");
        return;
      }
      const nextStep = nextEmptyStepForPitch(pattern.bassNotes, source.pitch, source.step);
      if (nextStep === null) {
        setProjectStatus("No empty step for duplicate");
        return;
      }
      const changed = updateCurrentPattern(
        (currentPatternData) => ({
          ...currentPatternData,
          bassNotes: sortBassNotes([...currentPatternData.bassNotes, { ...source, step: nextStep }])
        }),
        "Duplicated 808 note"
      );
      if (changed) {
        setSelectedNote({ ...target, step: nextStep });
        setSelectedDrumStep(null);
        setSelectedChordIndex(null);
      }
      return;
    }

    const source = pattern.melodyNotes.find((note) => matchesSelectedNote(note, target));
    if (!source) {
      setProjectStatus("Select an active note");
      return;
    }
    const nextStep = nextEmptyStepForPitch(pattern.melodyNotes, source.pitch, source.step);
    if (nextStep === null) {
      setProjectStatus("No empty step for duplicate");
      return;
    }
    const changed = updateCurrentPattern(
      (currentPatternData) => ({
        ...currentPatternData,
        melodyNotes: sortMelodyNotes([...currentPatternData.melodyNotes, { ...source, step: nextStep }])
      }),
      "Duplicated Synth note"
    );
    if (changed) {
      setSelectedNote({ ...target, step: nextStep });
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
  }

  function selectChordEvent(index: number): void {
    if (!currentPattern.chordEvents[index]) {
      return;
    }
    setSelectedChordIndex(index);
    setSelectedNote(null);
    setSelectedDrumStep(null);
  }

  function updateChordEvent(index: number, update: Partial<ChordEvent>, status = "Edited chord event"): boolean {
    let nextSelectedIndex: number | null = null;
    let rejectedStatus = "";
    const changed = updateCurrentPattern((pattern) => {
      const source = pattern.chordEvents[index];
      if (!source) {
        return pattern;
      }
      const nextEvent = chordEventWithUpdate(source, update);
      if (
        update.step !== undefined &&
        pattern.chordEvents.some((event, eventIndex) => eventIndex !== index && event.step === nextEvent.step)
      ) {
        rejectedStatus = "Target chord step already exists";
        return pattern;
      }
      if (sameChordEvent(source, nextEvent)) {
        return pattern;
      }
      const chordEvents = sortChordEvents(
        pattern.chordEvents.map((event, eventIndex) => (eventIndex === index ? nextEvent : event))
      );
      nextSelectedIndex = findChordEventIndex(chordEvents, nextEvent);
      return {
        ...pattern,
        chordEvents
      };
    }, status);

    if (changed) {
      setSelectedChordIndex(nextSelectedIndex);
      setSelectedNote(null);
      setSelectedDrumStep(null);
    } else if (rejectedStatus) {
      setProjectStatus(rejectedStatus);
    }
    return changed;
  }

  function applyChordProgressionPreset(preset: ChordProgressionPreset): void {
    const changed = updateCurrentPattern(
      (pattern) => ({
        ...pattern,
        chordEvents: createChordProgressionPreset(preset, projectRef.current.key)
      }),
      `${chordProgressionPresetLabel(preset)} chords applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (changed) {
      setSelectedChordIndex(0);
      setSelectedNote(null);
      setSelectedDrumStep(null);
    }
  }

  function applyChordPad(padId: ChordPadId): void {
    if (selectedChordIndex === null || !selectedChord) {
      setProjectStatus("Select a chord event");
      return;
    }

    const option = createChordPadOptions(projectRef.current.key, selectedChord).find((pad) => pad.id === padId);
    if (!option) {
      setProjectStatus("Chord pad not found");
      return;
    }

    const changed = updateChordEvent(
      selectedChordIndex,
      { root: option.root, quality: option.quality, inversion: option.inversion },
      `${option.label} chord pad applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setProjectStatus(`${option.label} chord pad already selected`);
    }
  }

  function applyChordRhythm(rhythmId: ChordRhythmId): void {
    const rhythm = chordRhythmDefinitions.find((definition) => definition.id === rhythmId);
    if (!rhythm) {
      setProjectStatus("Chord rhythm not found");
      return;
    }

    let nextSelectedIndex: number | null = selectedChordIndex;
    const changed = updateCurrentPattern((pattern) => {
      if (pattern.chordEvents.length === 0) {
        return pattern;
      }
      const chordEvents = applyChordRhythmToEvents(pattern.chordEvents, rhythmId);
      if (sameChordEvents(pattern.chordEvents, chordEvents)) {
        return pattern;
      }
      if (selectedChordIndex !== null) {
        nextSelectedIndex = chordEvents[selectedChordIndex] ? selectedChordIndex : 0;
      } else {
        nextSelectedIndex = 0;
      }
      return {
        ...pattern,
        chordEvents
      };
    }, `${rhythm.label} chord rhythm applied to Pattern ${projectRef.current.selectedPattern}`);

    if (changed) {
      setSelectedChordIndex(nextSelectedIndex);
      setSelectedNote(null);
      setSelectedDrumStep(null);
    } else {
      setProjectStatus(`${rhythm.label} chord rhythm already selected`);
    }
  }

  function applyChordVoicingPad(voicingId: ChordVoicingId): void {
    if (selectedChordIndex === null || !selectedChord) {
      setProjectStatus("Select a chord event");
      return;
    }

    const option = createChordVoicingOptions(selectedChord).find((voicing) => voicing.id === voicingId);
    if (!option) {
      setProjectStatus("Chord voicing pad not found");
      return;
    }

    const changed = updateChordEvent(
      selectedChordIndex,
      {
        quality: option.quality,
        inversion: option.inversion,
        length: option.length,
        velocity: option.velocity,
        probability: option.probability
      },
      `${option.label} chord voicing applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setProjectStatus(`${option.label} chord voicing already selected`);
    }
  }

  function addChordEvent(): void {
    let nextSelectedIndex: number | null = null;
    const changed = updateCurrentPattern(
      (pattern) => {
        const chord = createNextChordEvent(projectRef.current.key, pattern.chordEvents);
        const chordEvents = sortChordEvents([...pattern.chordEvents, chord]);
        nextSelectedIndex = findChordEventIndex(chordEvents, chord);
        return {
          ...pattern,
          chordEvents
        };
      },
      `Added chord to Pattern ${projectRef.current.selectedPattern}`
    );
    if (changed) {
      setSelectedChordIndex(nextSelectedIndex);
      setSelectedNote(null);
      setSelectedDrumStep(null);
    }
  }

  function deleteChordEvent(index: number): boolean {
    const currentChords = activePattern(projectRef.current).chordEvents;
    if (currentChords.length <= 1) {
      setProjectStatus("Chord progression needs one chord");
      return false;
    }

    let nextSelectedIndex: number | null = null;
    const changed = updateCurrentPattern(
      (pattern) => {
        if (!pattern.chordEvents[index]) {
          return pattern;
        }
        const chordEvents = pattern.chordEvents.filter((_, eventIndex) => eventIndex !== index);
        nextSelectedIndex = Math.min(index, chordEvents.length - 1);
        return {
          ...pattern,
          chordEvents
        };
      },
      `Deleted chord ${index + 1} from Pattern ${projectRef.current.selectedPattern}`
    );
    if (changed) {
      setSelectedChordIndex(nextSelectedIndex);
      setSelectedNote(null);
      setSelectedDrumStep(null);
    }
    return changed;
  }

  function moveSelectedChordStep(direction: -1 | 1): void {
    if (selectedChordIndex === null || !selectedChord) {
      setProjectStatus("Select a chord event");
      return;
    }
    const nextStep = clampStepStart(selectedChord.step + direction);
    if (nextStep === selectedChord.step) {
      setProjectStatus(direction < 0 ? "Chord is at the first step" : "Chord is at the last step");
      return;
    }
    updateChordEvent(
      selectedChordIndex,
      { step: nextStep },
      direction < 0 ? "Moved chord left" : "Moved chord right"
    );
  }

  function duplicateSelectedChord(): void {
    if (selectedChordIndex === null) {
      setProjectStatus("Select a chord event");
      return;
    }
    let nextSelectedIndex: number | null = null;
    let rejectedStatus = "";
    const changed = updateCurrentPattern((pattern) => {
      const source = pattern.chordEvents[selectedChordIndex];
      if (!source) {
        return pattern;
      }
      const nextStep = nextEmptyChordStep(pattern.chordEvents, source.step);
      if (nextStep === null) {
        rejectedStatus = "No empty step for duplicate chord";
        return pattern;
      }
      const duplicate: ChordEvent = { ...source, step: nextStep };
      const chordEvents = sortChordEvents([...pattern.chordEvents, duplicate]);
      nextSelectedIndex = findChordEventIndex(chordEvents, duplicate);
      return {
        ...pattern,
        chordEvents
      };
    }, "Duplicated chord event");
    if (changed) {
      setSelectedChordIndex(nextSelectedIndex);
      setSelectedNote(null);
      setSelectedDrumStep(null);
    } else if (rejectedStatus) {
      setProjectStatus(rejectedStatus);
    }
  }

  function moveSelectedChordInversion(direction: -1 | 1): void {
    if (selectedChordIndex === null || !selectedChord) {
      setProjectStatus("Select a chord event");
      return;
    }
    const inversionIndex = chordInversions.indexOf(normalizeChordInversion(selectedChord.inversion));
    const nextInversion = chordInversions[inversionIndex + direction];
    if (nextInversion === undefined) {
      setProjectStatus(direction < 0 ? "Chord is already root voicing" : "Chord is at top voicing");
      return;
    }
    updateChordEvent(
      selectedChordIndex,
      { inversion: nextInversion },
      direction < 0 ? "Moved chord voicing down" : "Moved chord voicing up"
    );
  }

  function togglePlayback(): void {
    if (isPlaying) {
      controllerRef.current?.stop();
      controllerRef.current = null;
      setPlaybackPosition(null);
      return;
    }

    try {
      setIsPlaying(true);
      controllerRef.current = startRealtimePlayback(project, {
        mode: transportLoopMode,
        bars: transportLoopBars,
        startBar: transportLoopStartBar,
        getProject: () => projectRef.current,
        onStep: setPlaybackPosition,
        onStop: () => {
          controllerRef.current = null;
          setPlaybackPosition(null);
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error(error);
      setIsPlaying(false);
      setPlaybackPosition(null);
    }
  }

  async function handleSaveProject(): Promise<void> {
    const contents = serializeProjectFile(project);
    const defaultName = projectFileName(project);

    try {
      const result = await window.grooveforge?.saveProject?.(contents, defaultName);
      if (result) {
        setProjectStatus(result.canceled ? "Save canceled" : `Saved ${fileDisplayName(result.filePath)}`);
        return;
      }

      downloadProjectFile(contents, defaultName);
      setProjectStatus(`Downloaded ${defaultName}`);
    } catch (error) {
      console.error(error);
      setProjectStatus("Save failed");
    }
  }

  async function handleOpenProject(): Promise<void> {
    try {
      const result = await window.grooveforge?.openProject?.();
      if (result) {
        if (result.canceled || !result.contents) {
          setProjectStatus("Open canceled");
          return;
        }
        loadProjectText(result.contents, fileDisplayName(result.filePath));
        return;
      }

      importInputRef.current?.click();
    } catch (error) {
      console.error(error);
      setProjectStatus("Open failed");
    }
  }

  function handleImportFile(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) {
      return;
    }

    void file
      .text()
      .then((contents) => loadProjectText(contents, file.name))
      .catch((error: unknown) => {
        console.error(error);
        setProjectStatus("Open failed");
      });
  }

  function loadProjectText(contents: string, sourceName: string): void {
    try {
      const nextProject = parseProjectFile(contents);
      controllerRef.current?.stop();
      controllerRef.current = null;
      replaceProject(nextProject, `Loaded ${sourceName}`);
      setPlaybackPosition(null);
      setIsPlaying(false);
    } catch (error) {
      console.error(error);
      setProjectStatus("Invalid project file");
    }
  }

  function handleExportWav(): void {
    try {
      exportWav(project);
      setProjectStatus("Exported mix WAV");
    } catch (error) {
      console.error(error);
      setProjectStatus("WAV export failed");
    }
  }

  function handleExportStems(): void {
    try {
      const fileNames = exportStems(project);
      setProjectStatus(`Exported ${fileNames.length} stems`);
    } catch (error) {
      console.error(error);
      setProjectStatus("Stem export failed");
    }
  }

  function handleExportMidi(): void {
    try {
      exportMidi(project);
      setProjectStatus("Exported MIDI");
    } catch (error) {
      console.error(error);
      setProjectStatus("MIDI export failed");
    }
  }

  function handleExportHandoffSheet(): void {
    try {
      const contents = createHandoffSheet(project, exportAnalysis, stemAnalyses);
      const fileName = handoffSheetFileName(project);
      downloadTextFile(contents, fileName);
      setProjectStatus(`Exported ${fileName}`);
    } catch (error) {
      console.error(error);
      setProjectStatus("Sheet export failed");
    }
  }

  function toggleMetronome(): void {
    updateProject(
      (current) => ({ ...current, metronomeEnabled: !current.metronomeEnabled }),
      projectRef.current.metronomeEnabled ? "Metronome off" : "Metronome on"
    );
  }

  function applyProjectKey(key: string): void {
    const changed = updateProject((current) => retargetProjectKey(current, key), `Retargeted project to ${key}`);
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
  }

  function selectStyle(styleId: ProjectState["styleId"]): void {
    const nextStyle = styleProfiles.find((candidate) => candidate.id === styleId);
    if (!nextStyle) {
      return;
    }
    updateProject(
      (current) => {
        const soundPreset = styleSoundPreset(styleId);
        return {
          ...current,
          styleId,
          selectedPattern: "A",
          bpm: nextStyle.defaultBpm,
          swing: nextStyle.defaultSwing,
          sound: soundPresetDesign(soundPreset),
          patterns: createStylePatternSet(styleId, current.key)
        };
      },
      `Applied ${nextStyle.name} groove`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(0);
  }

  function applySelectedBeatBlueprint(blueprintId: BeatBlueprintId): void {
    const blueprint = beatBlueprints.find((candidate) => candidate.id === blueprintId);
    const changed = updateProject(
      (current) => applyBeatBlueprint(current, blueprintId),
      blueprint ? `Applied ${blueprint.name} blueprint` : "Applied beat blueprint"
    );
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(0);
      setSelectedArrangementIndex(0);
      selectTransportLoopScope("arrangement", false);
    }
  }

  function selectDeliveryTarget(targetId: DeliveryTargetId): void {
    const target = deliveryTargetForId(targetId, projectRef.current.customDeliveryTarget);
    updateProject((current) => {
      const resolvedTarget = deliveryTargetForId(targetId, current.customDeliveryTarget);
      if (current.deliveryTarget === resolvedTarget.id) {
        return current;
      }
      return { ...current, deliveryTarget: resolvedTarget.id };
    }, `Set ${target.name} target`);
  }

  function alignDeliveryTarget(targetId: DeliveryTargetId): void {
    const target = deliveryTargetForId(targetId, projectRef.current.customDeliveryTarget);
    const changed = updateProject((current) => applyDeliveryTarget(current, target.id), `Aligned ${target.name} target`);
    if (changed) {
      setSelectedArrangementIndex(0);
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      selectTransportLoopScope("arrangement", false);
    }
  }

  function updateCustomDeliveryTarget(update: Partial<CustomDeliveryTarget>): void {
    const preview = {
      ...projectRef.current.customDeliveryTarget,
      ...update
    };
    updateProject((current) => {
      const nextTarget = {
        ...current.customDeliveryTarget,
        ...update
      };
      if (sameCustomDeliveryTarget(current.customDeliveryTarget, nextTarget)) {
        return current;
      }
      return {
        ...current,
        customDeliveryTarget: nextTarget
      };
    }, `Updated ${deliveryTargetForId("custom", preview).name} target`);
  }

  function updateSessionBrief(field: keyof SessionBrief, value: string): void {
    const maxLength = field === "notes" ? maxSessionBriefNotesLength : maxSessionBriefFieldLength;
    const nextValue = boundedSessionBriefText(value, maxLength);
    updateProject((current) => {
      if (current.sessionBrief[field] === nextValue) {
        return current;
      }
      return {
        ...current,
        sessionBrief: {
          ...current.sessionBrief,
          [field]: nextValue
        }
      };
    }, `Updated ${sessionBriefFieldLabel(field)} brief`);
  }

  function clearSessionBrief(): void {
    updateProject((current) => {
      if (sessionBriefFilledFields(current.sessionBrief) === 0) {
        return current;
      }
      return {
        ...current,
        sessionBrief: { ...defaultSessionBrief }
      };
    }, "Cleared session brief");
  }

  function runNextMove(action: NextMoveAction): void {
    switch (action.command.kind) {
      case "blueprint":
        applySelectedBeatBlueprint(action.command.blueprintId);
        return;
      case "patternFill":
        applyPatternFill(action.command.preset);
        return;
      case "arrangementMove":
        applyArrangementMoveToSelected(action.command.preset);
        return;
      case "patternChain":
        applyPatternChain(action.command.chain);
        return;
      case "chainExpand":
        expandPatternChain();
        return;
      case "arrangementTemplate":
        applyArrangementTemplate(action.command.template);
        return;
      case "deliveryTarget":
        alignDeliveryTarget(action.command.target);
        return;
      case "masterFinish":
        applyMasterFinishPad(action.command.pad);
        return;
      case "snapshot":
        saveCurrentSnapshot();
        return;
      case "reviewMix":
        masterPanelRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
        setProjectStatus("Review Mix Coach");
        return;
    }
  }

  function openQuickActions(): void {
    setQuickActionQuery("");
    setQuickActionsOpen(true);
  }

  function closeQuickActions(): void {
    setQuickActionsOpen(false);
    setQuickActionQuery("");
  }

  function runQuickAction(action: QuickAction): void {
    if (action.disabled) {
      return;
    }
    closeQuickActions();
    try {
      void Promise.resolve(action.run()).catch((error: unknown) => {
        console.error(error);
        setProjectStatus("Quick action failed");
      });
    } catch (error) {
      console.error(error);
      setProjectStatus("Quick action failed");
    }
  }

  const quickActions = createQuickActions({
    canRedo,
    canUndo,
    isPlaying,
    playbackMode,
    project,
    selectedArrangementIndex,
    transportLoopScope,
    onApplyArrangementMove: applyArrangementMoveToSelected,
    onApplyArrangementFocus: applyArrangementFocusPreset,
    onApplyBlueprint: applySelectedBeatBlueprint,
    onApplyMasterFinish: applyMasterFinishPad,
    onApplyMixFix: applyMixFixPreset,
    onApplyPatternChain: applyPatternChain,
    onApplyPatternFill: applyPatternFill,
    onExportHandoffSheet: handleExportHandoffSheet,
    onExportMidi: handleExportMidi,
    onExportStems: handleExportStems,
    onExportWav: handleExportWav,
    onOpenProject: handleOpenProject,
    onRedo: redoProject,
    onSaveProject: handleSaveProject,
    onSaveSnapshot: saveCurrentSnapshot,
    onSelectTransportLoopScope: selectTransportLoopScope,
    onTogglePlayback: togglePlayback,
    onUndo: undoProject
  });
  const filteredQuickActions = filterQuickActions(quickActions, quickActionQuery);

  return (
    <main className="app-shell">
      <header className="transport-band">
        <div className="brand-lockup">
          <Disc3 size={28} aria-hidden="true" />
          <div>
            <h1>GrooveForge</h1>
            <span>{window.grooveforge?.appKind ?? "desktop"} workstation</span>
          </div>
        </div>

        <div className="transport-controls">
          <label className="field title-field">
            <span>Title</span>
            <input
              type="text"
              value={project.title}
              onChange={(event) => updateProject((current) => ({ ...current, title: event.target.value }))}
            />
          </label>
          <label className="field compact">
            <span>BPM</span>
            <input
              type="number"
              min={60}
              max={220}
              value={project.bpm}
              onChange={(event) =>
                updateProject((current) => ({ ...current, bpm: Number(event.target.value) || current.bpm }))
              }
            />
          </label>
          <label className="field">
            <span>Key</span>
            <select value={project.key} onChange={(event) => applyProjectKey(event.target.value)}>
              {keys.map((key) => (
                <option key={key}>{key}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Style</span>
            <select
              aria-label="Style"
              data-testid="style-select"
              value={project.styleId}
              onChange={(event) => selectStyle(event.target.value as ProjectState["styleId"])}
            >
              {styleProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="command-strip">
          <div className="transport-status" aria-live="polite">
            <strong>{transportPrimary}</strong>
            <span>{transportSecondary}</span>
          </div>
          <div className="segmented playback-mode-row" aria-label="Transport loop">
            <button
              className={transportLoopScope === "arrangement" ? "selected" : ""}
              data-testid="playback-mode-arrangement"
              disabled={isPlaying && transportLoopScope !== "arrangement"}
              onClick={() => selectTransportLoopScope("arrangement")}
              title="Loop the full arrangement timeline"
              type="button"
            >
              Song
            </button>
            <button
              className={transportLoopScope === "block" ? "selected" : ""}
              data-testid="transport-loop-block"
              disabled={isPlaying && transportLoopScope !== "block"}
              onClick={() => selectTransportLoopScope("block")}
              title="Loop the selected arrangement block"
              type="button"
            >
              Block
            </button>
            <button
              className={transportLoopScope === "pattern" ? "selected" : ""}
              data-testid="playback-mode-pattern"
              disabled={isPlaying && transportLoopScope !== "pattern"}
              onClick={() => selectTransportLoopScope("pattern")}
              title="Loop the selected Pattern A/B/C"
              type="button"
            >
              Pattern
            </button>
          </div>
          <button
            aria-pressed={project.metronomeEnabled}
            className={`icon-button ${project.metronomeEnabled ? "selected" : ""}`}
            data-testid="metronome-toggle"
            type="button"
            title={project.metronomeEnabled ? "Turn metronome off" : "Turn metronome on"}
            onClick={toggleMetronome}
          >
            <Gauge size={18} aria-hidden="true" />
            <span>Click</span>
          </button>
          <button className="icon-button" data-testid="quick-actions-open" type="button" title="Open Quick Actions" onClick={openQuickActions}>
            <KeyboardMusic size={18} aria-hidden="true" />
            <span>Actions</span>
          </button>
          <button className="icon-button primary" type="button" title={`Play ${transportLoopLabel(transportLoopScope).toLowerCase()} loop`} onClick={togglePlayback}>
            {isPlaying ? <CircleStop size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            <span>{isPlaying ? "Stop" : "Play"}</span>
          </button>
          <button
            className="icon-button"
            data-testid="undo-button"
            type="button"
            title="Undo last edit"
            disabled={!canUndo}
            onClick={undoProject}
          >
            <Undo2 size={18} aria-hidden="true" />
            <span>Undo</span>
          </button>
          <button
            className="icon-button"
            data-testid="redo-button"
            type="button"
            title="Redo last undone edit"
            disabled={!canRedo}
            onClick={redoProject}
          >
            <Redo2 size={18} aria-hidden="true" />
            <span>Redo</span>
          </button>
          <button className="icon-button" type="button" title="Open project" onClick={() => void handleOpenProject()}>
            <FolderOpen size={18} aria-hidden="true" />
            <span>Open</span>
          </button>
          <button className="icon-button" type="button" title="Save project" onClick={() => void handleSaveProject()}>
            <Save size={18} aria-hidden="true" />
            <span>Save</span>
          </button>
          <button className="icon-button" type="button" title="Export WAV" onClick={handleExportWav}>
            <Download size={18} aria-hidden="true" />
            <span>WAV</span>
          </button>
          <button className="icon-button" data-testid="export-stems" type="button" title="Export stem WAVs" onClick={handleExportStems}>
            <Download size={18} aria-hidden="true" />
            <span>Stems</span>
          </button>
          <button className="icon-button" data-testid="export-midi" type="button" title="Export MIDI" onClick={handleExportMidi}>
            <Download size={18} aria-hidden="true" />
            <span>MIDI</span>
          </button>
          <button className="icon-button" data-testid="export-handoff-sheet" type="button" title="Export handoff sheet" onClick={handleExportHandoffSheet}>
            <Download size={18} aria-hidden="true" />
            <span>Sheet</span>
          </button>
        </div>
      </header>

      <QuickActions
        actions={filteredQuickActions}
        open={quickActionsOpen}
        query={quickActionQuery}
        onClose={closeQuickActions}
        onQueryChange={setQuickActionQuery}
        onRun={runQuickAction}
      />

      <section className="mode-row" aria-label="Mode">
        <input
          ref={importInputRef}
          className="file-input"
          type="file"
          accept=".json,.grooveforge.json,application/json"
          onChange={handleImportFile}
        />
        <div className="segmented">
          <button
            className={project.mode === "guided" ? "selected" : ""}
            type="button"
            onClick={() => updateProject((current) => ({ ...current, mode: "guided" }))}
          >
            Guided
          </button>
          <button
            className={project.mode === "studio" ? "selected" : ""}
            type="button"
            onClick={() => updateProject((current) => ({ ...current, mode: "studio" }))}
          >
            Studio
          </button>
        </div>
        <div className="session-meter">
          <span style={{ "--accent": style.color } as CSSProperties}>{style.name}</span>
          <span>{deliveryTarget.name}</span>
          <span>{project.key}</span>
          <span>{activeChannelLabel}</span>
          <span>{project.masterPreset}</span>
          <span>{projectStatus}</span>
        </div>
      </section>

      <StyleInspector
        onSelectStyle={selectStyle}
        selectedStyleId={project.styleId}
        summary={styleInspectorSummary}
      />

      <BeatBlueprints project={project} onApply={applySelectedBeatBlueprint} />

      <DeliveryTargets
        project={project}
        onApply={alignDeliveryTarget}
        onCustomChange={updateCustomDeliveryTarget}
        onSelect={selectDeliveryTarget}
      />

      <SessionBriefPanel brief={project.sessionBrief} onChange={updateSessionBrief} onClear={clearSessionBrief} />

      <BeatPassport summary={beatPassportSummary} />

      <HandoffPack
        analysis={exportAnalysis}
        project={project}
        stemAnalyses={stemAnalyses}
        onExportHandoffSheet={handleExportHandoffSheet}
        onExportMidi={handleExportMidi}
        onExportStems={handleExportStems}
        onExportWav={handleExportWav}
      />

      <BeatReadiness checks={beatReadinessChecks} />

      <BeatMap summary={beatMapSummary} actions={beatMapActions} onRun={runNextMove} />

      <StructureLens summary={structureLensSummary} actions={structureLensActions} onRun={runNextMove} />

      <NextMove actions={nextMoveActions} onRun={runNextMove} />

      <ProjectSnapshots
        nameDrafts={snapshotNameDrafts}
        project={project}
        onDelete={deleteSavedSnapshot}
        onNameCommit={commitSnapshotName}
        onNameDraftChange={updateSnapshotNameDraft}
        onNameDraftReset={clearSnapshotNameDraft}
        onRestore={restoreSavedSnapshot}
        onSave={saveCurrentSnapshot}
      />

      <section className="workspace-grid">
        <section className="panel pattern-panel" aria-label="Pattern editor">
          <PanelTitle icon={<Drum size={18} />} title="Drums" meta="16 step rack" />
          <div className="pattern-tabs" aria-label="Pattern">
            {patternSlots.map((pattern) => (
              <button
                key={pattern}
                className={project.selectedPattern === pattern ? "selected" : ""}
                type="button"
                onClick={() => selectPattern(pattern)}
              >
                <span>{pattern}</span>
                <small>{patternEventCount(project.patterns[pattern])}</small>
              </button>
            ))}
          </div>
          <PatternCompareStrip
            playbackMode={playbackMode}
            selectedBlockPattern={selectedArrangementBlock?.pattern ?? project.selectedPattern}
            selectedPattern={project.selectedPattern}
            summaries={patternCompareSummaries}
            onCue={cuePattern}
            onUse={usePatternInSelectedBlock}
          />
          <PatternStackPads stacks={patternStackOptions} onApply={applyPatternStack} />
          <GrooveFeelPads feels={grooveFeelOptions} onApply={applyGrooveFeel} />
          <DrumAccentPads accents={drumAccentOptions} onApply={applyDrumAccent} />
          <div className="pattern-tools" aria-label="Pattern tools">
            {patternVariationPresetIds.map((preset) => (
              <button
                key={preset}
                data-testid={`pattern-variation-${preset}`}
                type="button"
                title={`Apply ${patternVariationPresetLabel(preset)} variation to Pattern ${project.selectedPattern}`}
                onClick={() => applyPatternVariation(preset)}
              >
                <Sparkles size={14} aria-hidden="true" />
                <span>{patternVariationPresetLabel(preset)}</span>
              </button>
            ))}
            {patternSlots
              .filter((pattern) => pattern !== project.selectedPattern)
              .map((pattern) => (
                <button
                  key={pattern}
                  data-testid={`pattern-copy-${pattern}`}
                  type="button"
                  title={`Copy selected pattern to Pattern ${pattern}`}
                  onClick={() => copySelectedPattern(pattern)}
                >
                  <Copy size={14} aria-hidden="true" />
                  <span>Copy to {pattern}</span>
                </button>
              ))}
            <button
              className="danger"
              data-testid="pattern-clear"
              type="button"
              title={`Clear Pattern ${project.selectedPattern}`}
              onClick={clearSelectedPattern}
            >
              <Trash2 size={14} aria-hidden="true" />
              <span>Clear {project.selectedPattern}</span>
            </button>
          </div>
          <div className="pattern-fill-row" aria-label="Pattern fills">
            {patternFillPresetIds.map((preset) => {
              const isClear = preset === "clear_tail";
              return (
                <button
                  className={isClear ? "danger" : ""}
                  key={preset}
                  data-testid={`pattern-fill-${preset}`}
                  type="button"
                  title={`Apply ${patternFillPresetLabel(preset)} to Pattern ${project.selectedPattern}`}
                  onClick={() => applyPatternFill(preset)}
                >
                  {isClear ? <Scissors size={14} aria-hidden="true" /> : <Sparkles size={14} aria-hidden="true" />}
                  <span>{patternFillPresetLabel(preset)}</span>
                </button>
              );
            })}
          </div>
          <div className="step-grid">
            {(Object.keys(drumLabels) as DrumLane[]).map((lane) => (
              <div className="step-row" key={lane}>
                <div className="lane-name">{drumLabels[lane]}</div>
                {steps.map((step) => {
                  const active = currentPattern.drumPattern[lane][step];
                  const velocity = drumStepVelocity(currentPattern, lane, step);
                  const probability = drumStepProbability(currentPattern, lane, step);
                  const hasChanceBadge = probability < 1;
                  const repeat = lane === "hat" ? hatRepeatCount(currentPattern, step) : 1;
                  const timing = drumStepTimingMs(currentPattern, lane, step);
                  const stepBadge = [
                    hasChanceBadge ? compactChanceBadgeLabel(probability) : "",
                    lane === "hat" && repeat > 1 ? `${repeat}x` : "",
                    timing === 0 ? "" : timingBadge(timing)
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <button
                      aria-label={`${drumLabels[lane]} step ${step + 1}`}
                      className={[
                        "step",
                        active ? "active" : "",
                        selectedDrumStep?.lane === lane && selectedDrumStep.step === step ? "selected" : "",
                        currentPatternStep === step ? "playhead" : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      data-testid={`drum-step-${lane}-${step}`}
                      key={step}
                      onClick={() => toggleStep(lane, step)}
                      style={
                        {
                          "--lane-color": laneColor(lane),
                          "--step-velocity": `${Math.round(velocity * 100)}%`
                        } as CSSProperties
                      }
                      type="button"
                    >
                      <span>{step + 1}</span>
                      {active && stepBadge && (
                        <small
                          className={hasChanceBadge ? "chance-badge" : undefined}
                          data-testid={hasChanceBadge ? `drum-chance-badge-${lane}-${step}` : undefined}
                        >
                          {stepBadge}
                        </small>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="micro-controls">
            <label>
              <span>Swing</span>
              <input
                type="range"
                min={0}
                max={0.24}
                step={0.01}
                value={project.swing}
                onChange={(event) => updateProject((current) => ({ ...current, swing: Number(event.target.value) }))}
              />
            </label>
            <div className="groove-row" aria-label="Groove humanize">
              <span>Groove</span>
              <div>
                {drumGroovePresetIds.map((preset) => (
                  <button
                    data-testid={`groove-preset-${preset}`}
                    key={preset}
                    onClick={() => applySelectedDrumGroove(preset)}
                    type="button"
                  >
                    {drumGroovePresetLabel(preset)}
                  </button>
                ))}
              </div>
            </div>
            <DrumStepInspector
              selectedStep={selectedDrumStep}
              active={selectedDrumActive}
              velocity={selectedDrumVelocity}
              timingMs={selectedDrumTiming}
              probability={selectedDrumProbability}
              hatRepeat={selectedHatRepeat}
              onVelocityChange={updateSelectedDrumVelocity}
              onProbabilityChange={updateSelectedDrumProbability}
              onTimingChange={updateSelectedDrumTiming}
              onHatRepeatChange={updateSelectedHatRepeat}
            />
          </div>
        </section>

        <section className="panel piano-panel" aria-label="Bass and melody editor">
          <PanelTitle icon={<KeyboardMusic size={18} />} title="808 / Melody" meta="scale locked grid" />
          <KeyboardCapturePanel
            enabled={keyboardCaptureEnabled}
            keyMap={keyboardCaptureKeyMap}
            nextStep={keyboardCaptureNextStep}
            onEnabledChange={setKeyboardCaptureEnabled}
            onTargetChange={setKeyboardCaptureTarget}
            selectedNote={selectedNote}
            target={keyboardCaptureTarget}
          />
          <BasslinePads pads={basslinePadOptions} onApply={applyBasslinePad} />
          <BassGlidePads pads={bassGlidePadOptions} onApply={applyBassGlidePad} />
          <MelodyMotifPads motifs={melodyMotifOptions} onApply={applyMelodyMotif} />
          <MelodyAccentPads accents={melodyAccentOptions} onApply={applyMelodyAccent} />
          <MelodyContourPads contours={melodyContourOptions} onApply={applyMelodyContour} />
          <div className="note-lanes">
            <NoteEditor
              title="808"
              track="bass"
              notes={currentPattern.bassNotes.map((note) => ({ ...note, velocity: note.glide ? 0.95 : 0.82 }))}
              pitches={bassPitches}
              color="#ff7a4f"
              currentStep={currentPatternStep}
              selectedNote={selectedNote}
              onToggle={toggleBassNote}
            />
            <NoteEditor
              title="Synth"
              track="melody"
              notes={currentPattern.melodyNotes}
              pitches={melodyPitches}
              color="#8aa8ff"
              currentStep={currentPatternStep}
              selectedNote={selectedNote}
              onToggle={toggleMelodyNote}
            />
          </div>
          {project.mode === "studio" && (
            <NoteInspector
              selectedNote={selectedNote}
              bassNote={selectedBassNote}
              melodyNote={selectedMelodyNote}
              onLengthChange={updateSelectedLength}
              onGlideChange={updateSelectedGlide}
              onVelocityChange={updateSelectedVelocity}
              onProbabilityChange={updateSelectedNoteProbability}
              onStepMove={moveSelectedNoteStep}
              onPitchMove={moveSelectedNotePitch}
              onOctaveMove={moveSelectedNoteOctave}
              onDuplicate={duplicateSelectedNote}
            />
          )}
        </section>

        <section className="panel instrument-panel" aria-label="Instrument panel">
          <PanelTitle icon={<Sparkles size={18} />} title="Instruments" meta={project.mode === "guided" ? "curated" : "editable"} />
          <div className="device-list">
            <Device icon={<Drum size={17} />} name="Drum Rack" value={`${soundPresetLabel(project.sound.preset)} kit`} color="#78f0c8" />
            <Device
              icon={<Waves size={17} />}
              name="808 Engine"
              value={`drive ${percentLabel(project.sound.bassDrive)} / duck ${percentLabel(project.sound.sidechainDuck)}`}
              color="#ff7a4f"
            />
            <Device icon={<Music2 size={17} />} name="Synth" value={`${style.melodyStyle} / bright ${percentLabel(project.sound.synthBrightness)}`} color="#8aa8ff" />
            <Device icon={<SlidersHorizontal size={17} />} name="Chord Tone" value={`warm ${percentLabel(project.sound.chordWarmth)}`} color="#d58cff" />
          </div>
          <SoundDesigner
            focusPads={soundFocusPadOptions}
            mode={project.mode}
            sound={project.sound}
            onChange={updateSoundDesign}
            onFocusPad={applySoundFocusPad}
            onPreset={applySoundPreset}
          />
          <ChordEditor
            chordPads={chordPadOptions}
            chordRhythms={chordRhythmOptions}
            chordVoicings={chordVoicingOptions}
            chords={currentPattern.chordEvents}
            rootOptions={chordRootOptions}
            selectedIndex={selectedChordIndex}
            onAdd={addChordEvent}
            onChange={updateChordEvent}
            onDelete={deleteChordEvent}
            onDuplicate={duplicateSelectedChord}
            onInvert={moveSelectedChordInversion}
            onMoveStep={moveSelectedChordStep}
            onPad={applyChordPad}
            onPreset={applyChordProgressionPreset}
            onRhythm={applyChordRhythm}
            onSelect={selectChordEvent}
            onVoicing={applyChordVoicingPad}
          />
        </section>

        <section className="panel arrangement-panel" aria-label="Arrangement">
          <PanelTitle icon={<Music2 size={18} />} title="Arrangement" meta={`${project.arrangement.length} blocks / ${barCountLabel(arrangementTotalBars(project))}`} />
          <div className="arrangement-template-row" aria-label="Arrangement templates">
            {arrangementTemplateIds.map((template) => {
              const templateBlocks = createArrangementTemplate(template);
              const templateBars = templateBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
              return (
                <button
                  data-testid={`arrangement-template-${template}`}
                  key={template}
                  onClick={() => applyArrangementTemplate(template)}
                  title={`Apply ${arrangementTemplateLabel(template)} arrangement`}
                  type="button"
                >
                  <span>{arrangementTemplateLabel(template)}</span>
                  <small>{templateBlocks.length} blocks / {barCountLabel(templateBars)}</small>
                </button>
              );
            })}
          </div>
          <div className="pattern-chain-row" aria-label="Pattern chain">
            <div className="pattern-chain-heading">
              <span>Chain</span>
              <strong data-testid="pattern-chain-current">{patternChainReadout(project.arrangement)}</strong>
            </div>
            <button
              className="pattern-chain-expand"
              data-testid="pattern-chain-expand"
              onClick={expandPatternChain}
              title="Expand the current chain into a longer song form"
              type="button"
            >
              <ArrowRight size={14} aria-hidden="true" />
              <span>Expand</span>
              <small>{barCountLabel(16)} song form</small>
            </button>
            <div className="pattern-chain-actions">
              {patternChainIds.map((chain) => {
                const chainBlocks = createPatternChain(chain);
                const chainBars = chainBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
                return (
                  <button
                    data-testid={`pattern-chain-${chain}`}
                    key={chain}
                    onClick={() => applyPatternChain(chain)}
                    title={`Apply ${patternChainLabel(chain)}`}
                    type="button"
                  >
                    <ArrowRight size={14} aria-hidden="true" />
                    <span>{patternChainLabel(chain)}</span>
                    <small>{patternChainReadout(chainBlocks)} / {barCountLabel(chainBars)}</small>
                  </button>
                );
              })}
            </div>
            <div className="pattern-chain-editor" aria-label="Pattern chain step editor" data-testid="pattern-chain-step-editor">
              {project.arrangement.slice(0, 8).map((block, index) => {
                const nextPattern = nextPatternSlot(block.pattern);
                return (
                  <button
                    aria-label={`Chain step ${index + 1} ${block.section} Pattern ${block.pattern}, ${barCountLabel(block.bars)}. Switch to Pattern ${nextPattern}`}
                    className={selectedArrangementIndex === index ? "selected" : ""}
                    data-testid={`pattern-chain-step-${index}`}
                    key={`${block.section}-${index}-${block.pattern}`}
                    onClick={() => cyclePatternChainStep(index)}
                    title={`Switch step ${index + 1} to Pattern ${nextPattern}`}
                    type="button"
                  >
                    <span>Step {index + 1}</span>
                    <strong data-testid={`pattern-chain-step-pattern-${index}`}>{block.pattern}</strong>
                    <small>
                      {block.section} {normalizeArrangementBars(block.bars)}b
                    </small>
                  </button>
                );
              })}
            </div>
          </div>
          <ArrangementFocusPanel summary={selectedArrangementFocus} onApply={applyArrangementFocusPreset} />
          <div className="arrangement-track">
            {project.arrangement.map((block, index) => (
              <button
                aria-label={`Block ${index + 1} ${block.section} Pattern ${block.pattern} ${barCountLabel(block.bars)}`}
                aria-pressed={selectedArrangementIndex === index}
                className={["arrangement-block", selectedArrangementIndex === index ? "selected" : ""]
                  .filter(Boolean)
                  .join(" ")}
                data-testid={`arrangement-block-${index}`}
                key={`${block.section}-${index}`}
                onClick={() => selectArrangementBlock(index)}
                type="button"
              >
                <span>{block.section}</span>
                <strong>{block.pattern}</strong>
                <small>{barCountLabel(block.bars)}</small>
                {block.mutedTracks.length > 0 && <em>{block.mutedTracks.length} mute</em>}
                <i style={{ inlineSize: `${Math.max(18, block.energy * 100)}%` }} />
              </button>
            ))}
          </div>
          {selectedArrangementBlock && (
            <div className="arrangement-editor" aria-label="Selected arrangement block editor">
              <div className="arrangement-editor-heading">
                <span>Block {selectedArrangementIndex + 1}</span>
                <strong>
                  {selectedArrangementBlock.section} / Pattern {selectedArrangementBlock.pattern}
                </strong>
                <small>{barCountLabel(selectedArrangementBlock.bars)}</small>
              </div>
              <label>
                <span>Section</span>
                <select
                  data-testid="arrangement-section-select"
                  value={selectedArrangementBlock.section}
                  onChange={(event) =>
                    updateArrangementBlock(selectedArrangementIndex, { section: event.target.value as ArrangementSection })
                  }
                >
                  {arrangementSections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </label>
              <div className="block-pattern-row" aria-label="Block pattern">
                {patternSlots.map((pattern) => (
                  <button
                    key={pattern}
                    className={selectedArrangementBlock.pattern === pattern ? "selected" : ""}
                    data-testid={`arrangement-pattern-${pattern}`}
                    type="button"
                    onClick={() => updateArrangementBlock(selectedArrangementIndex, { pattern })}
                  >
                    <span>{pattern}</span>
                    <small>{patternEventCount(project.patterns[pattern])}</small>
                  </button>
                ))}
              </div>
              <div className="arrangement-mute-row" aria-label="Block track mutes">
                {arrangementMuteTrackIds.map((track) => {
                  const muted = selectedArrangementBlock.mutedTracks.includes(track);
                  return (
                    <button
                      aria-pressed={muted}
                      className={muted ? "selected" : ""}
                      data-testid={`arrangement-track-mute-${track}`}
                      key={track}
                      onClick={() => toggleArrangementTrackMute(track)}
                      title={`${muted ? "Unmute" : "Mute"} ${arrangementMuteTrackLabel(track)} in this block`}
                      type="button"
                    >
                      {arrangementMuteTrackLabel(track)}
                    </button>
                  );
                })}
              </div>
              <div className="arrangement-move-row" aria-label="Arrangement moves">
                {arrangementMovePresetIds.map((preset) => (
                  <button
                    data-testid={`arrangement-move-${preset}`}
                    key={preset}
                    onClick={() => applyArrangementMoveToSelected(preset)}
                    title={`Apply ${arrangementMovePresetLabel(preset)} move to selected block`}
                    type="button"
                  >
                    {arrangementMovePresetLabel(preset)}
                  </button>
                ))}
              </div>
              <label>
                <span>Bars</span>
                <input
                  aria-label="Arrangement block bars"
                  data-testid="arrangement-bars-input"
                  type="number"
                  min={minArrangementBars}
                  max={maxArrangementBars}
                  step={1}
                  value={selectedArrangementBlock.bars}
                  onChange={(event) =>
                    updateArrangementBlock(selectedArrangementIndex, { bars: Number(event.target.value) })
                  }
                />
              </label>
              <label>
                <span>Split after</span>
                <input
                  aria-label="Split arrangement block after bars"
                  data-testid="arrangement-split-after"
                  disabled={!canSplitArrangementBlock}
                  type="number"
                  min={1}
                  max={Math.max(1, selectedArrangementBars - 1)}
                  step={1}
                  value={clampSplitAfterBars(splitAfterBars, selectedArrangementBars)}
                  onChange={(event) => setSplitAfterBars(clampSplitAfterBars(Number(event.target.value), selectedArrangementBars))}
                />
              </label>
              <label>
                <span title={`${arrangementEnergyGain(selectedArrangementBlock.energy).toFixed(2)}x gain`}>
                  Energy {Math.round(selectedArrangementBlock.energy * 100)}%
                </span>
                <div className="energy-inputs">
                  <input
                    data-testid="arrangement-energy-slider"
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={selectedArrangementBlock.energy}
                    onChange={(event) =>
                      updateArrangementBlock(selectedArrangementIndex, { energy: Number(event.target.value) })
                    }
                  />
                  <input
                    aria-label="Arrangement energy percent"
                    data-testid="arrangement-energy-input"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(selectedArrangementBlock.energy * 100)}
                    onChange={(event) =>
                      updateArrangementBlock(selectedArrangementIndex, { energy: Number(event.target.value) / 100 })
                    }
                  />
                </div>
              </label>
              <div className="arrangement-actions" aria-label="Arrangement structure actions">
                <button
                  data-testid="arrangement-move-left"
                  disabled={selectedArrangementIndex === 0}
                  onClick={() => moveArrangementBlock(-1)}
                  title="Move selected block left"
                  type="button"
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  <span>Move</span>
                </button>
                <button
                  data-testid="arrangement-move-right"
                  disabled={selectedArrangementIndex >= project.arrangement.length - 1}
                  onClick={() => moveArrangementBlock(1)}
                  title="Move selected block right"
                  type="button"
                >
                  <ArrowRight size={15} aria-hidden="true" />
                  <span>Move</span>
                </button>
                <button
                  data-testid="arrangement-duplicate"
                  onClick={duplicateArrangementBlock}
                  title="Duplicate selected block"
                  type="button"
                >
                  <Copy size={15} aria-hidden="true" />
                  <span>Duplicate</span>
                </button>
                <button
                  data-testid="arrangement-split"
                  disabled={!canSplitArrangementBlock}
                  onClick={splitArrangementBlock}
                  title="Split selected block"
                  type="button"
                >
                  <Scissors size={15} aria-hidden="true" />
                  <span>Split</span>
                </button>
                <button
                  data-testid="arrangement-merge"
                  disabled={!canMergeArrangementBlock}
                  onClick={mergeArrangementBlock}
                  title="Merge selected block with next block"
                  type="button"
                >
                  <Plus size={15} aria-hidden="true" />
                  <span>Merge</span>
                </button>
                <button
                  data-testid="arrangement-delete"
                  disabled={project.arrangement.length <= 1}
                  onClick={deleteArrangementBlock}
                  title="Delete selected block"
                  type="button"
                >
                  <Trash2 size={15} aria-hidden="true" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="panel mixer-panel" aria-label="Mixer">
          <PanelTitle icon={<SlidersHorizontal size={18} />} title="Mixer" meta={`${activeChannels} audible`} />
          <MixBalancePads pads={mixBalancePadOptions} onApply={applyMixBalancePad} />
          <div className="mixer-strips">
            {project.mixer.map((channel) => (
              <div className="strip" key={channel.id} style={{ "--strip": channel.accent } as CSSProperties}>
                <div className="strip-top">
                  <span>{channel.name}</span>
                  <div className="strip-toggles">
                    <button
                      className={channel.muted ? "mini-toggle active" : "mini-toggle"}
                      data-testid={`mixer-mute-${channel.id}`}
                      type="button"
                      onClick={() => updateMixerChannel(channel.id, { muted: !channel.muted })}
                    >
                      M
                    </button>
                    <button
                      className={channel.solo ? "mini-toggle active solo" : "mini-toggle"}
                      data-testid={`mixer-solo-${channel.id}`}
                      disabled={channel.id === "master"}
                      type="button"
                      onClick={() => updateMixerChannel(channel.id, { solo: !channel.solo })}
                    >
                      S
                    </button>
                  </div>
                </div>
                <label className="strip-control">
                  <span>Volume</span>
                  <input
                    aria-label={`${channel.name} volume`}
                    data-testid={`mixer-volume-${channel.id}`}
                    max={3}
                    min={-36}
                    onChange={(event) => updateMixerChannel(channel.id, { volumeDb: Number(event.target.value) })}
                    step={0.1}
                    type="range"
                    value={channel.volumeDb}
                  />
                </label>
                <label className="strip-control">
                  <span>Pan</span>
                  <div className="pan-inputs">
                    <input
                      aria-label={`${channel.name} pan`}
                      data-testid={`mixer-pan-${channel.id}`}
                      max={100}
                      min={-100}
                      onChange={(event) => updateMixerChannel(channel.id, { pan: clampPan(Number(event.target.value)) })}
                      step={1}
                      type="range"
                      value={channel.pan}
                    />
                    <input
                      aria-label={`${channel.name} pan value`}
                      data-testid={`mixer-pan-input-${channel.id}`}
                      max={100}
                      min={-100}
                      onChange={(event) => updateMixerChannel(channel.id, { pan: clampPan(Number(event.target.value)) })}
                      step={1}
                      type="number"
                      value={channel.pan}
                    />
                  </div>
                </label>
                {isStemTrackId(channel.id) && (
                  <StemLevelMeter analysis={stemAnalyses[channel.id]} trackId={channel.id} />
                )}
                {channel.id !== "master" && (
                  <div className="eq-controls" aria-label={`${channel.name} channel EQ`}>
                    <label className="strip-control">
                      <span>Low cut</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={`${channel.name} low cut`}
                          data-testid={`mixer-low-cut-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { lowCut: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.lowCut}
                        />
                        <input
                          aria-label={`${channel.name} low cut percent`}
                          data-testid={`mixer-low-cut-input-${channel.id}`}
                          max={100}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { lowCut: Number(event.target.value) / 100 })}
                          step={1}
                          type="number"
                          value={Math.round(channel.lowCut * 100)}
                        />
                      </div>
                    </label>
                    <label className="strip-control">
                      <span>Air</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={`${channel.name} air`}
                          data-testid={`mixer-air-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { air: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.air}
                        />
                        <input
                          aria-label={`${channel.name} air percent`}
                          data-testid={`mixer-air-input-${channel.id}`}
                          max={100}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { air: Number(event.target.value) / 100 })}
                          step={1}
                          type="number"
                          value={Math.round(channel.air * 100)}
                        />
                      </div>
                    </label>
                    <label className="strip-control">
                      <span>Drive</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={`${channel.name} drive`}
                          data-testid={`mixer-drive-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { drive: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.drive}
                        />
                        <input
                          aria-label={`${channel.name} drive percent`}
                          data-testid={`mixer-drive-input-${channel.id}`}
                          max={100}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { drive: Number(event.target.value) / 100 })}
                          step={1}
                          type="number"
                          value={Math.round(channel.drive * 100)}
                        />
                      </div>
                    </label>
                    <label className="strip-control">
                      <span>Glue</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={`${channel.name} glue`}
                          data-testid={`mixer-glue-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { glue: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.glue}
                        />
                        <input
                          aria-label={`${channel.name} glue percent`}
                          data-testid={`mixer-glue-input-${channel.id}`}
                          max={100}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { glue: Number(event.target.value) / 100 })}
                          step={1}
                          type="number"
                          value={Math.round(channel.glue * 100)}
                        />
                      </div>
                    </label>
                    <label className="strip-control">
                      <span>Space</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={`${channel.name} space send`}
                          data-testid={`mixer-send-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { send: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.send}
                        />
                        <input
                          aria-label={`${channel.name} space send percent`}
                          data-testid={`mixer-send-input-${channel.id}`}
                          max={100}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { send: Number(event.target.value) / 100 })}
                          step={1}
                          type="number"
                          value={Math.round(channel.send * 100)}
                        />
                      </div>
                    </label>
                  </div>
                )}
                <div className="strip-readout">
                  <span>{channel.volumeDb} dB</span>
                  <span>{panLabel(channel.pan)}</span>
                  {channel.id !== "master" && (
                    <>
                      <span>Cut {percentLabel(channel.lowCut)}</span>
                      <span>Air {percentLabel(channel.air)}</span>
                      <span>Drive {percentLabel(channel.drive)}</span>
                      <span>Glue {percentLabel(channel.glue)}</span>
                      <span>Space {percentLabel(channel.send)}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel master-panel" aria-label="Master" ref={masterPanelRef}>
          <PanelTitle icon={<Gauge size={18} />} title="Master" meta="export ready" />
          <div className="master-readout">
            <strong>{project.masterPreset}</strong>
            <span>{project.masterCeilingDb} dB ceiling</span>
          </div>
          <ExportMeter analysis={exportAnalysis} />
          <MixCoach analysis={exportAnalysis} stemAnalyses={stemAnalyses} onApplyFix={applyMixFixPreset} />
          <MasterFinishPads pads={masterFinishPadOptions} onApply={applyMasterFinishPad} />
          <label>
            <span>Ceiling</span>
            <input
              data-testid="master-ceiling"
              type="range"
              min={-6}
              max={0}
              step={0.1}
              value={project.masterCeilingDb}
              onChange={(event) =>
                updateProject((current) => ({ ...current, masterCeilingDb: Number(event.target.value) }))
              }
            />
          </label>
          <div className="preset-row">
            {masterPresets.map((preset) => (
              <button
                key={preset}
                className={project.masterPreset === preset ? "selected" : ""}
                data-testid={`master-preset-${preset}`}
                type="button"
                onClick={() => applyMasterPreset(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function PanelTitle({ icon, title, meta }: { icon: ReactNode; title: string; meta: string }): ReactElement {
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

function StyleInspector({
  onSelectStyle,
  selectedStyleId,
  summary
}: {
  onSelectStyle: (styleId: ProjectState["styleId"]) => void;
  selectedStyleId: ProjectState["styleId"];
  summary: StyleInspectorSummary;
}): ReactElement {
  const metrics = [
    { label: "BPM range", value: summary.bpm },
    { label: "Swing", value: summary.swing },
    { label: "Bass role", value: summary.bass },
    { label: "Melody role", value: summary.melody },
    { label: "Sound", value: summary.soundPreset }
  ];

  return (
    <section
      aria-label="Style inspector"
      className="style-inspector"
      data-testid="style-inspector"
      style={{ "--style-color": summary.profile.color } as CSSProperties}
    >
      <div className="style-inspector-heading">
        <div>
          <Sparkles size={17} aria-hidden="true" />
          <span>Style Inspector</span>
        </div>
        <strong data-testid="style-inspector-name">{summary.profile.name}</strong>
        <p>{summary.totalEvents} editable Pattern A/B/C events from local style data</p>
      </div>
      <div className="style-inspector-metrics">
        {metrics.map((metric) => (
          <div className="style-inspector-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>
      <div className="style-quick-picks" aria-label="Style quick picks" data-testid="style-quick-picks">
        {styleProfiles.map((profile) => {
          const selected = profile.id === selectedStyleId;
          return (
            <button
              aria-pressed={selected}
              className={selected ? "selected" : ""}
              data-testid={`style-quick-${profile.id}`}
              key={profile.id}
              onClick={() => onSelectStyle(profile.id)}
              style={{ "--quick-style-color": profile.color } as CSSProperties}
              title={`Apply ${profile.name} groove`}
              type="button"
            >
              <span>{profile.name}</span>
              <strong>{profile.defaultBpm} BPM</strong>
              <small>
                {bassStyleRoleLabel(profile.bassStyle)} / {melodyStyleRoleLabel(profile.melodyStyle)}
              </small>
            </button>
          );
        })}
      </div>
      <div className="style-inspector-patterns" aria-label="Pattern density">
        {summary.patterns.map((pattern) => (
          <div className="style-inspector-pattern" data-testid={`style-density-${pattern.slot}`} key={pattern.slot}>
            <span>Pattern {pattern.slot}</span>
            <strong>{pattern.label}</strong>
            <small>{pattern.detail}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function BeatBlueprints({
  project,
  onApply
}: {
  project: ProjectState;
  onApply: (blueprintId: BeatBlueprintId) => void;
}): ReactElement {
  return (
    <section className="blueprint-row" data-testid="beat-blueprints" aria-label="Beat blueprints">
      <div className="blueprint-heading">
        <div>
          <Sparkles size={17} aria-hidden="true" />
          <span>Beat Blueprints</span>
        </div>
        <strong data-testid="beat-blueprint-current">
          {project.bpm} BPM / {project.key}
        </strong>
      </div>
      <div className="blueprint-list">
        {beatBlueprints.map((blueprint) => {
          const selected =
            project.styleId === blueprint.styleId &&
            project.key === blueprint.key &&
            project.bpm === blueprint.bpm;
          const styleName = styleProfiles.find((profile) => profile.id === blueprint.styleId)?.name ?? blueprint.styleId;
          return (
            <button
              className={selected ? "selected" : ""}
              data-testid={`beat-blueprint-${blueprint.id}`}
              key={blueprint.id}
              onClick={() => onApply(blueprint.id)}
              title={`Apply ${blueprint.name} blueprint`}
              type="button"
            >
              <span>{blueprint.name}</span>
              <strong>{blueprint.focus}</strong>
              <small>
                {styleName} / {blueprint.key} / {blueprint.bpm} BPM / {arrangementTemplateLabel(blueprint.arrangementTemplate)}
              </small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PatternCompareStrip({
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

function ArrangementFocusPanel({
  onApply,
  summary
}: {
  onApply: (preset: ArrangementFocusPresetId) => void;
  summary: ArrangementFocusSummary | null;
}): ReactElement | null {
  if (!summary) {
    return null;
  }

  return (
    <section className="arrangement-focus" data-testid="arrangement-focus" aria-label="Arrangement focus">
      <div className="arrangement-focus-summary">
        <span>Focus</span>
        <strong data-testid="arrangement-focus-summary">
          Block {summary.blockNumber} / {summary.section} / Pattern {summary.pattern}
        </strong>
        <small>
          {barCountLabel(summary.bars)} / {Math.round(summary.energy * 100)}% energy / {summary.eventCount} events / {summary.mutedLabel}
        </small>
      </div>
      <div className="arrangement-focus-actions">
        {arrangementFocusPresets.map((preset) => (
          <button
            className={summary.suggestedPreset === preset.id ? "suggested" : ""}
            data-testid={`arrangement-focus-${preset.id}`}
            key={preset.id}
            onClick={() => onApply(preset.id)}
            title={`${preset.label}: ${preset.detail}`}
            type="button"
          >
            <Waves size={14} aria-hidden="true" />
            <span>{preset.label}</span>
            <small>
              Pattern {preset.pattern} / {barCountLabel(preset.bars)} / {Math.round(preset.energy * 100)}%
            </small>
          </button>
        ))}
      </div>
    </section>
  );
}

function DeliveryTargets({
  onApply,
  onCustomChange,
  onSelect,
  project
}: {
  onApply: (targetId: DeliveryTargetId) => void;
  onCustomChange: (update: Partial<CustomDeliveryTarget>) => void;
  onSelect: (targetId: DeliveryTargetId) => void;
  project: ProjectState;
}): ReactElement {
  const currentTarget = activeDeliveryTarget(project);
  const customTarget = deliveryTargetForId("custom", project.customDeliveryTarget);
  const customSelected = project.deliveryTarget === "custom";
  const customAligned = isDeliveryTargetAligned(project, customTarget);
  const customName = project.customDeliveryTarget.name || defaultCustomDeliveryTarget.name;
  const customFocus = project.customDeliveryTarget.focus || defaultCustomDeliveryTarget.focus;
  return (
    <section className="delivery-target-row" data-testid="delivery-targets" aria-label="Delivery targets">
      <div className="delivery-target-heading">
        <div>
          <Gauge size={17} aria-hidden="true" />
          <span>Delivery Target</span>
        </div>
        <strong data-testid="delivery-target-current">{currentTarget.name}</strong>
        <small>{barCountLabel(currentTarget.targetBars)} / {currentTarget.stemGoal} stems</small>
      </div>
      <div className="delivery-target-stack">
        <div className="delivery-target-list">
          {deliveryTargets.map((target) => {
            const selected = project.deliveryTarget === target.id;
            const aligned = isDeliveryTargetAligned(project, target);
            return (
              <div className={selected ? "selected" : ""} data-testid={`delivery-target-${target.id}`} key={target.id}>
                <button
                  className="delivery-target-select"
                  data-testid={`delivery-target-set-${target.id}`}
                  onClick={() => onSelect(target.id)}
                  title={`Set ${target.name} target`}
                  type="button"
                >
                  <span>{target.name}</span>
                  <strong>{target.focus}</strong>
                  <small>{arrangementTemplateLabel(target.preferredTemplate)} / {target.preferredMasterPreset}</small>
                </button>
                <button
                  className={aligned ? "delivery-target-align aligned" : "delivery-target-align"}
                  data-testid={`delivery-target-align-${target.id}`}
                  onClick={() => onApply(target.id)}
                  title={`Align project to ${target.name}`}
                  type="button"
                >
                  {aligned ? "Aligned" : "Align"}
                </button>
              </div>
            );
          })}
        </div>
        <div
          className={customSelected ? "custom-delivery-panel selected" : "custom-delivery-panel"}
          data-testid="delivery-target-custom"
        >
          <div className="custom-delivery-copy">
            <span>Custom Target</span>
            <strong>{customTarget.name}</strong>
            <small>{customTarget.focus}</small>
          </div>
          <div className="custom-delivery-fields">
            <label className="custom-delivery-field">
              <span>Name</span>
              <input
                data-testid="custom-target-name"
                maxLength={maxCustomDeliveryTargetNameLength}
                onChange={(event) =>
                  onCustomChange({
                    name: boundedCustomDeliveryText(event.currentTarget.value, maxCustomDeliveryTargetNameLength)
                  })
                }
                value={customName}
              />
            </label>
            <label className="custom-delivery-field wide">
              <span>Focus</span>
              <input
                data-testid="custom-target-focus"
                maxLength={maxCustomDeliveryTargetFocusLength}
                onChange={(event) =>
                  onCustomChange({
                    focus: boundedCustomDeliveryText(event.currentTarget.value, maxCustomDeliveryTargetFocusLength)
                  })
                }
                value={customFocus}
              />
            </label>
            <label className="custom-delivery-field">
              <span>Bars</span>
              <input
                data-testid="custom-target-bars"
                max={maxDeliveryTargetBars}
                min={minDeliveryTargetBars}
                onChange={(event) => onCustomChange({ targetBars: normalizeDeliveryTargetBars(event.currentTarget.valueAsNumber) })}
                type="number"
                value={project.customDeliveryTarget.targetBars}
              />
            </label>
            <label className="custom-delivery-field">
              <span>Stems</span>
              <input
                data-testid="custom-target-stems"
                max={maxDeliveryTargetStemGoal}
                min={minDeliveryTargetStemGoal}
                onChange={(event) => onCustomChange({ stemGoal: normalizeDeliveryTargetStemGoal(event.currentTarget.valueAsNumber) })}
                type="number"
                value={project.customDeliveryTarget.stemGoal}
              />
            </label>
            <label className="custom-delivery-field">
              <span>Template</span>
              <select
                data-testid="custom-target-template"
                onChange={(event) => onCustomChange({ preferredTemplate: event.currentTarget.value as ArrangementTemplateId })}
                value={project.customDeliveryTarget.preferredTemplate}
              >
                {arrangementTemplateIds.map((template) => (
                  <option key={template} value={template}>
                    {arrangementTemplateLabel(template)}
                  </option>
                ))}
              </select>
            </label>
            <label className="custom-delivery-field">
              <span>Master</span>
              <select
                data-testid="custom-target-master"
                onChange={(event) => onCustomChange({ preferredMasterPreset: event.currentTarget.value as MasterPreset })}
                value={project.customDeliveryTarget.preferredMasterPreset}
              >
                {masterPresets.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </select>
            </label>
            <label className="custom-delivery-field">
              <span>Posture</span>
              <select
                data-testid="custom-target-posture"
                onChange={(event) => onCustomChange({ mixPosture: event.currentTarget.value as MixPosture })}
                value={project.customDeliveryTarget.mixPosture}
              >
                {mixPostureOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="custom-delivery-actions">
            <button
              className="delivery-target-select"
              data-testid="delivery-target-set-custom"
              onClick={() => onSelect("custom")}
              title="Set custom target"
              type="button"
            >
              Set Custom
            </button>
            <button
              className={customAligned ? "delivery-target-align aligned" : "delivery-target-align"}
              data-testid="delivery-target-align-custom"
              onClick={() => onApply("custom")}
              title="Align project to custom target"
              type="button"
            >
              {customAligned ? "Aligned" : "Align"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SessionBriefPanel({
  brief,
  onChange,
  onClear
}: {
  brief: SessionBrief;
  onChange: (field: keyof SessionBrief, value: string) => void;
  onClear: () => void;
}): ReactElement {
  const filledFields = sessionBriefFilledFields(brief);

  return (
    <section className="session-brief-row" data-testid="session-brief" aria-label="Session brief">
      <div className="session-brief-heading">
        <div>
          <Music2 size={17} aria-hidden="true" />
          <span>Session Brief</span>
        </div>
        <strong data-testid="session-brief-summary">{filledFields}/4 fields</strong>
        <small>{sessionBriefStatus(brief).value}</small>
      </div>
      <div className="session-brief-fields">
        <label className="session-brief-field">
          <span>Artist</span>
          <input
            data-testid="session-brief-artist"
            maxLength={maxSessionBriefFieldLength}
            onChange={(event) => onChange("artist", event.target.value)}
            placeholder="Artist or client"
            type="text"
            value={brief.artist}
          />
        </label>
        <label className="session-brief-field">
          <span>Vibe</span>
          <input
            data-testid="session-brief-vibe"
            maxLength={maxSessionBriefFieldLength}
            onChange={(event) => onChange("vibe", event.target.value)}
            placeholder="Mood or energy"
            type="text"
            value={brief.vibe}
          />
        </label>
        <label className="session-brief-field">
          <span>Reference</span>
          <input
            data-testid="session-brief-reference"
            maxLength={maxSessionBriefFieldLength}
            onChange={(event) => onChange("reference", event.target.value)}
            placeholder="Track or scene"
            type="text"
            value={brief.reference}
          />
        </label>
        <label className="session-brief-field notes">
          <span>Notes</span>
          <textarea
            data-testid="session-brief-notes"
            maxLength={maxSessionBriefNotesLength}
            onChange={(event) => onChange("notes", event.target.value)}
            placeholder="Handoff notes"
            rows={2}
            value={brief.notes}
          />
        </label>
      </div>
      <button
        className="session-brief-clear"
        data-testid="session-brief-clear"
        disabled={filledFields === 0}
        onClick={onClear}
        title="Clear Session Brief"
        type="button"
      >
        <X size={14} aria-hidden="true" />
        <span>Clear</span>
      </button>
    </section>
  );
}

function QuickActions({
  actions,
  open,
  query,
  onClose,
  onQueryChange,
  onRun
}: {
  actions: QuickAction[];
  open: boolean;
  query: string;
  onClose: () => void;
  onQueryChange: (query: string) => void;
  onRun: (action: QuickAction) => void;
}): ReactElement | null {
  if (!open) {
    return null;
  }

  const firstRunnableAction = actions.find((action) => !action.disabled);

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
        <div className="quick-actions-list" data-testid="quick-actions-list">
          {actions.length === 0 ? (
            <div className="quick-action-empty" data-testid="quick-actions-empty">
              No matching actions
            </div>
          ) : (
            actions.map((action) => (
              <button
                data-testid={`quick-action-${action.id}`}
                disabled={action.disabled}
                key={action.id}
                onClick={() => onRun(action)}
                title={action.detail}
                type="button"
              >
                <span>{action.group}</span>
                <strong>{action.title}</strong>
                <small>{action.detail}</small>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function ProjectSnapshots({
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

function BeatReadiness({ checks }: { checks: BeatReadinessCheck[] }): ReactElement {
  const readyCount = checks.filter((check) => check.tone === "good").length;

  return (
    <section className="beat-readiness" data-testid="beat-readiness" aria-label="Beat readiness">
      <div className="beat-readiness-heading">
        <span>Beat Readiness</span>
        <strong data-testid="beat-readiness-summary">
          {readyCount}/{checks.length} ready
        </strong>
      </div>
      <div className="beat-readiness-list">
        {checks.map((check) => (
          <div className={`beat-readiness-card ${check.tone}`} data-testid={`beat-readiness-check-${check.id}`} key={check.id}>
            <span>{check.label}</span>
            <strong>{check.status}</strong>
            <p>{check.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BeatPassport({ summary }: { summary: BeatPassportSummary }): ReactElement {
  return (
    <section className={`beat-passport ${summary.tone}`} data-testid="beat-passport" aria-label="Beat passport">
      <div className="beat-passport-heading">
        <div>
          <Gauge size={17} aria-hidden="true" />
          <span>Beat Passport</span>
        </div>
        <strong data-testid="beat-passport-headline">{summary.headline}</strong>
        <small data-testid="beat-passport-detail">{summary.detail}</small>
      </div>
      <div className="beat-passport-grid" data-testid="beat-passport-grid">
        {summary.metrics.map((metric) => (
          <div className={`beat-passport-card ${metric.tone}`} data-testid={`beat-passport-${metric.id}`} key={metric.id}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function HandoffPack({
  analysis,
  project,
  stemAnalyses,
  onExportHandoffSheet,
  onExportMidi,
  onExportStems,
  onExportWav
}: {
  analysis: ExportAnalysis;
  project: ProjectState;
  stemAnalyses: StemExportAnalyses;
  onExportHandoffSheet: () => void;
  onExportMidi: () => void;
  onExportStems: () => void;
  onExportWav: () => void;
}): ReactElement {
  const items = createHandoffPackItems({
    analysis,
    project,
    stemAnalyses,
    onExportHandoffSheet,
    onExportMidi,
    onExportStems,
    onExportWav
  });
  const readyCount = items.filter((item) => item.tone === "good").length;
  const tone = weakestTone(items.map((item) => item.tone));

  return (
    <section className={`handoff-pack ${tone}`} data-testid="handoff-pack" aria-label="Handoff pack">
      <div className="handoff-pack-heading">
        <div>
          <Download size={17} aria-hidden="true" />
          <span>Handoff Pack</span>
        </div>
        <strong data-testid="handoff-pack-summary">
          {readyCount}/{items.length} ready
        </strong>
        <small data-testid="handoff-pack-detail">
          {handoffSheetFileName(project)}
        </small>
      </div>
      <div className="handoff-pack-grid" data-testid="handoff-pack-grid">
        {items.map((item) => (
          <div className={`handoff-pack-card ${item.tone}`} data-testid={`handoff-pack-${item.id}`} key={item.id}>
            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
            </div>
            <button
              className={item.tone}
              data-testid={`handoff-pack-action-${item.id}`}
              onClick={item.run}
              title={item.detail}
              type="button"
            >
              <Download size={14} aria-hidden="true" />
              <span>{item.buttonLabel}</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function BeatMap({
  actions,
  onRun,
  summary
}: {
  actions: NextMoveAction[];
  onRun: (action: NextMoveAction) => void;
  summary: BeatMapSummary;
}): ReactElement {
  return (
    <section className={`beat-map ${summary.tone}`} data-testid="beat-map" aria-label="Beat map">
      <div className="beat-map-heading">
        <div>
          <Music2 size={17} aria-hidden="true" />
          <span>Beat Map</span>
        </div>
        <strong data-testid="beat-map-headline">{summary.headline}</strong>
        <p data-testid="beat-map-detail">{summary.detail}</p>
      </div>
      <div className="beat-map-stages" data-testid="beat-map-stages">
        {summary.stages.map((stage) => (
          <div className={`beat-map-stage ${stage.tone}`} data-testid={`beat-map-stage-${stage.id}`} key={stage.id}>
            <span>{stage.label}</span>
            <strong>{stage.status}</strong>
            <small>{stage.detail}</small>
          </div>
        ))}
      </div>
      <div className="beat-map-metrics" data-testid="beat-map-metrics">
        {summary.metrics.map((metric) => (
          <div className={`beat-map-metric ${metric.tone}`} data-testid={`beat-map-metric-${metric.id}`} key={metric.id}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </div>
        ))}
      </div>
      <div className="beat-map-actions" aria-label="Beat map actions">
        {actions.map((action) => (
          <button
            className={action.tone}
            data-testid={`beat-map-action-${action.id}`}
            key={action.id}
            onClick={() => onRun(action)}
            title={action.title}
            type="button"
          >
            {nextMoveIcon(action)}
            <span>{action.buttonLabel}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function StructureLens({
  actions,
  onRun,
  summary
}: {
  actions: NextMoveAction[];
  onRun: (action: NextMoveAction) => void;
  summary: StructureLensSummary;
}): ReactElement {
  return (
    <section className={`structure-lens ${summary.tone}`} data-testid="structure-lens" aria-label="Structure lens">
      <div className="structure-lens-heading">
        <div>
          <Waves size={17} aria-hidden="true" />
          <span>Structure Lens</span>
        </div>
        <strong data-testid="structure-lens-headline">{summary.headline}</strong>
        <small data-testid="structure-lens-detail">{summary.detail}</small>
      </div>
      <div className="structure-lens-signals" data-testid="structure-lens-signals">
        {summary.signals.map((signal) => (
          <div className={`structure-lens-signal ${signal.tone}`} data-testid={`structure-lens-${signal.id}`} key={signal.id}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
            <small>{signal.detail}</small>
          </div>
        ))}
      </div>
      <div className="structure-lens-actions" aria-label="Structure lens actions">
        {actions.map((action) => (
          <button
            className={action.tone}
            data-testid={`structure-lens-action-${action.id}`}
            key={action.id}
            onClick={() => onRun(action)}
            title={action.title}
            type="button"
          >
            {nextMoveIcon(action)}
            <span>{action.buttonLabel}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function NextMove({
  actions,
  onRun
}: {
  actions: NextMoveAction[];
  onRun: (action: NextMoveAction) => void;
}): ReactElement {
  const [primaryAction, ...secondaryActions] = actions;

  return (
    <section className={`next-move ${primaryAction.tone}`} data-testid="next-move" aria-label="Next move">
      <div className="next-move-heading">
        <div>
          <Sparkles size={17} aria-hidden="true" />
          <span>Next Move</span>
        </div>
        <strong data-testid="next-move-title">{primaryAction.title}</strong>
        <p data-testid="next-move-detail">{primaryAction.detail}</p>
      </div>
      <div className="next-move-actions">
        <button
          className="primary"
          data-testid={`next-move-action-${primaryAction.id}`}
          onClick={() => onRun(primaryAction)}
          title={primaryAction.title}
          type="button"
        >
          {nextMoveIcon(primaryAction)}
          <span>{primaryAction.buttonLabel}</span>
        </button>
        {secondaryActions.map((action) => (
          <button
            data-testid={`next-move-action-${action.id}`}
            key={action.id}
            onClick={() => onRun(action)}
            title={action.title}
            type="button"
          >
            {nextMoveIcon(action)}
            <span>{action.buttonLabel}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function createQuickActions({
  canRedo,
  canUndo,
  isPlaying,
  playbackMode,
  project,
  selectedArrangementIndex,
  transportLoopScope,
  onApplyArrangementMove,
  onApplyArrangementFocus,
  onApplyBlueprint,
  onApplyMasterFinish,
  onApplyMixFix,
  onApplyPatternChain,
  onApplyPatternFill,
  onExportHandoffSheet,
  onExportMidi,
  onExportStems,
  onExportWav,
  onOpenProject,
  onRedo,
  onSaveProject,
  onSaveSnapshot,
  onSelectTransportLoopScope,
  onTogglePlayback,
  onUndo
}: {
  canRedo: boolean;
  canUndo: boolean;
  isPlaying: boolean;
  playbackMode: PlaybackMode;
  project: ProjectState;
  selectedArrangementIndex: number;
  transportLoopScope: TransportLoopScope;
  onApplyArrangementMove: (preset: ArrangementMovePreset) => void;
  onApplyArrangementFocus: (preset: ArrangementFocusPresetId) => void;
  onApplyBlueprint: (blueprintId: BeatBlueprintId) => void;
  onApplyMasterFinish: (pad: MasterFinishPadId) => void;
  onApplyMixFix: (preset: MixFixPreset) => void;
  onApplyPatternChain: (chain: PatternChainId) => void;
  onApplyPatternFill: (preset: PatternFillPreset) => void;
  onExportHandoffSheet: () => void;
  onExportMidi: () => void;
  onExportStems: () => void;
  onExportWav: () => void;
  onOpenProject: () => Promise<void>;
  onRedo: () => void;
  onSaveProject: () => Promise<void>;
  onSaveSnapshot: () => void;
  onSelectTransportLoopScope: (scope: TransportLoopScope) => void;
  onTogglePlayback: () => void;
  onUndo: () => void;
}): QuickAction[] {
  const suggestedBlueprint = suggestedBlueprintId(project);
  const suggestedBlueprintName = beatBlueprints.find((blueprint) => blueprint.id === suggestedBlueprint)?.name ?? "Beat Blueprint";
  const selectedBlock = project.arrangement[selectedArrangementIndex] ?? project.arrangement[0];

  return [
    {
      id: "toggle-playback",
      title: isPlaying ? "Stop playback" : `Play ${transportLoopLabel(transportLoopScope)} loop`,
      detail: transportLoopStatus(project, transportLoopScope, selectedArrangementIndex),
      group: "Transport",
      keywords: "play stop space transport preview arrangement pattern",
      run: onTogglePlayback
    },
    {
      id: "loop-song",
      title: "Loop full song",
      detail: `${barCountLabel(arrangementTotalBars(project))} arrangement loop.`,
      group: "Transport",
      keywords: "loop song arrangement full transport",
      disabled: isPlaying && transportLoopScope !== "arrangement",
      run: () => onSelectTransportLoopScope("arrangement")
    },
    {
      id: "loop-block",
      title: "Loop selected block",
      detail: selectedBlock
        ? `Block ${Math.min(selectedArrangementIndex + 1, project.arrangement.length)} ${selectedBlock.section} / Pattern ${selectedBlock.pattern}.`
        : "No arrangement block selected.",
      group: "Transport",
      keywords: "loop selected block arrangement section transport",
      disabled: (isPlaying && transportLoopScope !== "block") || !selectedBlock,
      run: () => onSelectTransportLoopScope("block")
    },
    {
      id: "loop-pattern",
      title: "Loop selected pattern",
      detail: `Pattern ${project.selectedPattern} two-bar preview.`,
      group: "Transport",
      keywords: "loop pattern preview selected a b c transport",
      disabled: isPlaying && transportLoopScope !== "pattern",
      run: () => onSelectTransportLoopScope("pattern")
    },
    {
      id: "save-project",
      title: "Save project",
      detail: "Write the current .grooveforge.json project.",
      group: "Project",
      keywords: "save project file json download",
      run: onSaveProject
    },
    {
      id: "open-project",
      title: "Open project",
      detail: "Load a saved GrooveForge project file.",
      group: "Project",
      keywords: "open load import project json",
      run: onOpenProject
    },
    {
      id: "save-snapshot",
      title: "Save snapshot",
      detail: `${project.snapshots.length}/${maxProjectSnapshots} local idea slots saved.`,
      group: "Project",
      keywords: "snapshot slot idea save version compare",
      run: onSaveSnapshot
    },
    {
      id: "undo",
      title: "Undo",
      detail: "Undo the last project edit.",
      group: "Edit",
      keywords: "undo edit history revert",
      disabled: !canUndo,
      run: onUndo
    },
    {
      id: "redo",
      title: "Redo",
      detail: "Redo the last undone project edit.",
      group: "Edit",
      keywords: "redo edit history",
      disabled: !canRedo,
      run: onRedo
    },
    {
      id: "blueprint",
      title: `Apply ${suggestedBlueprintName}`,
      detail: "Start from an editable beat with drums, 808, harmony, arrangement, and mix.",
      group: "Create",
      keywords: "blueprint starter beat drums 808 chords arrangement mix",
      run: () => onApplyBlueprint(suggestedBlueprint)
    },
    {
      id: "fill-drums",
      title: "Apply Drum Fill",
      detail: `Add an editable tail move to Pattern ${project.selectedPattern}.`,
      group: "Create",
      keywords: "drum fill pattern tail variation",
      run: () => onApplyPatternFill("drum_fill")
    },
    {
      id: "fill-bass",
      title: "Apply 808 Pickup",
      detail: `Add a bass pickup to Pattern ${project.selectedPattern}.`,
      group: "Create",
      keywords: "808 bass pickup fill pattern",
      run: () => onApplyPatternFill("bass_pickup")
    },
    {
      id: "fill-melody",
      title: "Apply Melody Turn",
      detail: `Add a melodic turn to Pattern ${project.selectedPattern}.`,
      group: "Create",
      keywords: "melody turn fill pattern synth",
      run: () => onApplyPatternFill("melody_turn")
    },
    {
      id: "hook-lift",
      title: "Apply Hook Lift",
      detail: "Push arrangement energy and mutes on the selected block.",
      group: "Arrange",
      keywords: "hook lift arrangement energy mute build drop",
      run: () => onApplyArrangementMove("hook_lift")
    },
    {
      id: "hook-peak-focus",
      title: "Apply Hook Peak Focus",
      detail: "Set the selected block to a full-energy Hook using Pattern B.",
      group: "Arrange",
      keywords: "arrangement focus hook peak pattern b energy selected block",
      run: () => onApplyArrangementFocus("hook_peak")
    },
    {
      id: "pattern-chain",
      title: "Apply 8 Bar Chain",
      detail: "Turn Pattern A/B/C variations into an editable 8-bar arrangement.",
      group: "Arrange",
      keywords: "pattern chain arrangement structure sketch a b c song",
      run: () => onApplyPatternChain("eight_bar")
    },
    {
      id: "mix-headroom",
      title: "Mix Fix Headroom",
      detail: "Set a vocal-safe ceiling and reduce master gain.",
      group: "Mix",
      keywords: "mix fix headroom master ceiling vocal limiter",
      run: () => onApplyMixFix("headroom")
    },
    {
      id: "mix-stem-balance",
      title: "Mix Fix Stem Balance",
      detail: "Nudge core stem volumes toward a rough balance.",
      group: "Mix",
      keywords: "mix fix stem balance volume drums bass synth chords",
      run: () => onApplyMixFix("stem_balance")
    },
    {
      id: "mix-low-end",
      title: "Mix Fix Low End",
      detail: "Tighten the 808 and drum relationship.",
      group: "Mix",
      keywords: "mix fix low end 808 drums bass glue",
      run: () => onApplyMixFix("low_end")
    },
    ...masterFinishPadDefinitions.map((pad): QuickAction => ({
      id: `master-finish-${pad.id}`,
      title: `${pad.label} master finish`,
      detail: `${pad.preset} at ${formatDb(pad.ceilingDb)} ceiling / ${formatDb(pad.masterVolumeDb)} output.`,
      group: "Mix",
      keywords: `master finish ${pad.id} ${pad.label} ${pad.detail} output ceiling demo vocal store club`,
      run: () => onApplyMasterFinish(pad.id)
    })),
    {
      id: "export-wav",
      title: "Export WAV",
      detail: "Render the full arrangement as a mix WAV.",
      group: "Export",
      keywords: "export render wav mix audio",
      run: onExportWav
    },
    {
      id: "export-stems",
      title: "Export stems",
      detail: "Render drum, 808, synth, and chord WAV stems.",
      group: "Export",
      keywords: "export render stems wav drums 808 synth chord",
      run: onExportStems
    },
    {
      id: "export-midi",
      title: "Export MIDI",
      detail: "Write arrangement MIDI for DAW handoff.",
      group: "Export",
      keywords: "export midi daw handoff arrangement",
      run: onExportMidi
    },
    {
      id: "export-handoff-sheet",
      title: "Export handoff sheet",
      detail: "Write a local text summary for collaboration or review.",
      group: "Export",
      keywords: "export sheet handoff notes session brief delivery target mix stems",
      run: onExportHandoffSheet
    }
  ];
}

function filterQuickActions(actions: QuickAction[], query: string): QuickAction[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return actions.slice(0, 12);
  }
  const terms = normalizedQuery.split(/\s+/);
  return actions
    .filter((action) => {
      const tokens = quickActionSearchTokens(action);
      return terms.every((term) => tokens.some((token) => token.startsWith(term)));
    })
    .slice(0, 12);
}

function quickActionSearchTokens(action: QuickAction): string[] {
  return `${action.group} ${action.title} ${action.detail} ${action.keywords}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function nextMoveIcon(action: NextMoveAction): ReactElement {
  switch (action.command.kind) {
    case "snapshot":
      return <Save size={14} aria-hidden="true" />;
    case "reviewMix":
      return <Gauge size={14} aria-hidden="true" />;
    case "deliveryTarget":
    case "masterFinish":
      return <Gauge size={14} aria-hidden="true" />;
    case "arrangementMove":
    case "patternChain":
    case "chainExpand":
    case "arrangementTemplate":
      return <Waves size={14} aria-hidden="true" />;
    case "blueprint":
    case "patternFill":
      return <Sparkles size={14} aria-hidden="true" />;
  }
}

function createNextMoveActions(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis
): NextMoveAction[] {
  const primary = primaryNextMoveAction(project, checks, analysis);
  const arrangementNeedsStructure = readinessCheckForId(checks, "arrangement")?.tone === "warn";
  const target = activeDeliveryTarget(project);
  const candidates: NextMoveAction[] = [
    primary,
    ...(!isDeliveryTargetAligned(project, target) ? [deliveryTargetNextMoveAction(project)] : []),
    ...(arrangementNeedsStructure ? [fullArrangementNextMoveAction()] : []),
    masterFinishNextMoveAction(project, analysis),
    patternFillNextMoveAction(project),
    arrangementLiftNextMoveAction(project),
    snapshotNextMoveAction(project),
    mixReviewNextMoveAction(analysis)
  ];

  const uniqueActions = new Map<string, NextMoveAction>();
  for (const action of candidates) {
    if (!uniqueActions.has(action.id)) {
      uniqueActions.set(action.id, action);
    }
  }

  return [...uniqueActions.values()].slice(0, 4);
}

function primaryNextMoveAction(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis
): NextMoveAction {
  const drums = readinessCheckForId(checks, "drums");
  const bass = readinessCheckForId(checks, "bass");
  const harmony = readinessCheckForId(checks, "harmony");
  const arrangement = readinessCheckForId(checks, "arrangement");
  const exportCheck = readinessCheckForId(checks, "export");

  if ([drums, bass, harmony].some((check) => check?.tone === "danger")) {
    return blueprintNextMoveAction(project);
  }

  if (arrangement?.tone === "warn") {
    return patternChainNextMoveAction();
  }

  if (exportCheck?.tone !== "good" || analysis.status !== "Ready") {
    return mixReviewNextMoveAction(analysis);
  }

  if (project.snapshots.length === 0) {
    return snapshotNextMoveAction(project);
  }

  return arrangementLiftNextMoveAction(project);
}

function readinessCheckForId(checks: BeatReadinessCheck[], id: string): BeatReadinessCheck | undefined {
  return checks.find((check) => check.id === id);
}

function blueprintNextMoveAction(project: ProjectState): NextMoveAction {
  const blueprintId = suggestedBlueprintId(project);
  const blueprint = beatBlueprints.find((candidate) => candidate.id === blueprintId);
  return {
    id: "blueprint",
    title: "Start from an editable beat",
    detail: `${blueprint?.name ?? "Beat"} / drums, 808, chords, arrangement, mix.`,
    buttonLabel: "Blueprint",
    tone: "danger",
    command: { kind: "blueprint", blueprintId }
  };
}

function suggestedBlueprintId(project: ProjectState): BeatBlueprintId {
  switch (project.styleId) {
    case "rnb":
      return "rnb_pocket";
    case "house":
    case "jersey":
    case "garage":
      return "club_bounce";
    case "boom_bap":
    case "lofi":
      return "warm_loop";
    case "trap":
    case "drill":
    case "phonk":
    case "experimental":
      return "dark_808";
  }
}

function patternFillNextMoveAction(project: ProjectState): NextMoveAction {
  const pattern = activePattern(project);
  const preset: PatternFillPreset =
    pattern.bassNotes.length < 3 ? "bass_pickup" : pattern.melodyNotes.length < 3 ? "melody_turn" : "drum_fill";
  return {
    id: `pattern-${preset}`,
    title: `${patternFillPresetLabel(preset)} on Pattern ${project.selectedPattern}`,
    detail: `Tail variation for Pattern ${project.selectedPattern}.`,
    buttonLabel: patternFillPresetLabel(preset),
    tone: "good",
    command: { kind: "patternFill", preset }
  };
}

function patternChainNextMoveAction(): NextMoveAction {
  return {
    id: "pattern-chain",
    title: "Sketch an 8-bar Pattern Chain",
    detail: "Use Pattern A/B/C as an editable song outline.",
    buttonLabel: "8 Bar Chain",
    tone: "warn",
    command: { kind: "patternChain", chain: "eight_bar" }
  };
}

function fullArrangementNextMoveAction(): NextMoveAction {
  return {
    id: "full-arrangement",
    title: "Build a full beat structure",
    detail: "Full Beat template from current Pattern A/B/C data.",
    buttonLabel: "Full Beat",
    tone: "warn",
    command: { kind: "arrangementTemplate", template: "full" }
  };
}

function arrangementLiftNextMoveAction(project: ProjectState): NextMoveAction {
  return {
    id: "hook-lift",
    title: "Lift the selected song block",
    detail: `Energy and mute lift for Pattern ${project.selectedPattern}.`,
    buttonLabel: "Hook Lift",
    tone: "good",
    command: { kind: "arrangementMove", preset: "hook_lift" }
  };
}

function snapshotNextMoveAction(project: ProjectState): NextMoveAction {
  return {
    id: "save-snapshot",
    title: "Save this beat state",
    detail: `${project.snapshots.length}/${maxProjectSnapshots} local idea slots are saved in this project.`,
    buttonLabel: "Save Slot",
    tone: project.snapshots.length === 0 ? "good" : "warn",
    command: { kind: "snapshot" }
  };
}

function mixReviewNextMoveAction(analysis: ExportAnalysis): NextMoveAction {
  const tone: MixCoachTone = analysis.status === "Ready" ? "good" : "warn";
  return {
    id: "mix-review",
    title: "Check export polish",
    detail: `${analysis.status} render with ${formatDb(analysis.headroomDb)} headroom.`,
    buttonLabel: "Mix Check",
    tone,
    command: { kind: "reviewMix" }
  };
}

function deliveryTargetNextMoveAction(project: ProjectState): NextMoveAction {
  const target = activeDeliveryTarget(project);
  return {
    id: `delivery-target-${target.id}`,
    title: `Align ${target.name} target`,
    detail: `${barCountLabel(target.targetBars)} target with ${target.preferredMasterPreset} posture.`,
    buttonLabel: "Align Target",
    tone: "warn",
    command: { kind: "deliveryTarget", target: target.id }
  };
}

function suggestedMasterFinishPad(project: ProjectState): MasterFinishPadId {
  const target = activeDeliveryTarget(project);

  switch (target.id) {
    case "vocal_session":
      return "vocal";
    case "beat_store":
      return "store";
    case "club_demo":
      return "club";
    case "starter_sketch":
    case "custom":
      if (target.mixPosture === "vocal_headroom") {
        return "vocal";
      }
      if (target.mixPosture === "club_forward") {
        return "club";
      }
      return target.preferredMasterPreset === "Streaming Safe" ? "store" : "demo";
  }
}

function masterFinishNextMoveAction(project: ProjectState, analysis: ExportAnalysis): NextMoveAction {
  const padId = suggestedMasterFinishPad(project);
  const pad = masterFinishPadDefinitions.find((definition) => definition.id === padId) ?? masterFinishPadDefinitions[0];
  const tone: MixCoachTone = analysis.status === "Ready" ? "good" : "warn";
  return {
    id: `master-finish-${pad.id}`,
    title: `${pad.label} finish posture`,
    detail: `${pad.preset} / ${formatDb(pad.ceilingDb)} ceiling / ${formatDb(pad.masterVolumeDb)} output.`,
    buttonLabel: `${pad.label} Finish`,
    tone,
    command: { kind: "masterFinish", pad: pad.id }
  };
}

function chainExpandNextMoveAction(): NextMoveAction {
  return {
    id: "chain-expand",
    title: "Expand to song form",
    detail: "Turn the current chain into a 16-bar intro, verse, hook, bridge, hook, and outro outline.",
    buttonLabel: "Expand",
    tone: "warn",
    command: { kind: "chainExpand" }
  };
}

function isDeliveryTargetAligned(project: ProjectState, target: DeliveryTarget): boolean {
  return (
    project.deliveryTarget === target.id &&
    project.masterPreset === target.preferredMasterPreset &&
    arrangementTotalBars(project) >= target.targetBars
  );
}

const sessionBriefFields: (keyof SessionBrief)[] = ["artist", "vibe", "reference", "notes"];

function sessionBriefStatus(brief: SessionBrief): Pick<BeatMapMetric, "value" | "detail" | "tone"> {
  const filledFields = sessionBriefFilledFields(brief);
  const hasVibe = brief.vibe.trim().length > 0;
  const hasContext = [brief.artist, brief.reference, brief.notes].some((value) => value.trim().length > 0);

  if (hasVibe && hasContext) {
    return {
      value: "Usable",
      detail: `${filledFields}/4 fields captured`,
      tone: "good"
    };
  }

  if (filledFields > 0) {
    return {
      value: `${filledFields}/4 fields`,
      detail: hasVibe ? "Add artist, reference, or notes" : "Add vibe for direction",
      tone: "warn"
    };
  }

  return {
    value: "Empty",
    detail: "Add artist, vibe, reference, or notes",
    tone: "warn"
  };
}

function sessionBriefFilledFields(brief: SessionBrief): number {
  return sessionBriefFields.filter((field) => brief[field].trim().length > 0).length;
}

function boundedSessionBriefText(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").slice(0, maxLength);
}

function boundedCustomDeliveryText(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").slice(0, maxLength);
}

function sameCustomDeliveryTarget(left: CustomDeliveryTarget, right: CustomDeliveryTarget): boolean {
  return (
    left.name === right.name &&
    left.focus === right.focus &&
    left.targetBars === right.targetBars &&
    left.preferredTemplate === right.preferredTemplate &&
    left.preferredMasterPreset === right.preferredMasterPreset &&
    left.stemGoal === right.stemGoal &&
    left.mixPosture === right.mixPosture
  );
}

function sessionBriefFieldLabel(field: keyof SessionBrief): string {
  const labels: Record<keyof SessionBrief, string> = {
    artist: "artist",
    vibe: "vibe",
    reference: "reference",
    notes: "notes"
  };
  return labels[field];
}

function createBeatPassportSummary(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): BeatPassportSummary {
  const styleName = styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const slots = usedPatternSlots(project);
  const readyCount = checks.filter((check) => check.tone === "good").length;
  const audibleStems = audibleStemTracks(stemAnalyses);
  const readinessTone = weakestTone(checks.map((check) => check.tone));
  const lengthTone: MixCoachTone = bars >= target.targetBars ? "good" : bars >= 8 ? "warn" : "danger";
  const patternTone: MixCoachTone = slots.length >= 3 ? "good" : slots.length >= 2 ? "warn" : "danger";
  const exportTone: MixCoachTone = analysis.status === "Ready" ? "good" : analysis.status === "Silent" ? "danger" : "warn";
  const stemTone: MixCoachTone =
    audibleStems.length >= target.stemGoal ? "good" : audibleStems.length >= 2 ? "warn" : "danger";
  const masterTone: MixCoachTone = project.masterPreset === target.preferredMasterPreset ? "good" : "warn";
  const tone = weakestTone([lengthTone, patternTone, readinessTone, exportTone, stemTone, masterTone]);
  const patternLabel = slots.length > 0 ? slots.join("/") : project.selectedPattern;
  const stemLabel = audibleStems.length > 0 ? audibleStems.map(stemTrackLabel).join("/") : "No stems";
  const checksLeft = checks.length - readyCount;

  return {
    headline: `${target.name} / ${barCountLabel(bars)} / Pattern ${patternLabel}`,
    detail: `${styleName} / ${project.key} / ${project.bpm} BPM / ${project.masterPreset}`,
    tone,
    metrics: [
      {
        id: "target",
        label: "Target",
        value: target.name,
        detail: target.focus,
        tone: isDeliveryTargetAligned(project, target) ? "good" : "warn"
      },
      {
        id: "length",
        label: "Length",
        value: barCountLabel(bars),
        detail: `${barCountLabel(target.targetBars)} target`,
        tone: lengthTone
      },
      {
        id: "patterns",
        label: "Patterns",
        value: patternLabel,
        detail: `${slots.length}/3 slots used`,
        tone: patternTone
      },
      {
        id: "readiness",
        label: "Ready",
        value: `${readyCount}/${checks.length}`,
        detail: checksLeft === 0 ? "All checks green" : `${checksLeft} checks left`,
        tone: readinessTone
      },
      {
        id: "export",
        label: "Export",
        value: analysis.status,
        detail: `${formatDb(analysis.headroomDb)} headroom`,
        tone: exportTone
      },
      {
        id: "stems",
        label: "Stems",
        value: `${audibleStems.length}/${target.stemGoal}`,
        detail: stemLabel,
        tone: stemTone
      },
      {
        id: "master",
        label: "Master",
        value: project.masterPreset,
        detail: `${formatDb(project.masterCeilingDb)} ceiling / ${formatDb(masterChannelVolumeDb(project.mixer))} output`,
        tone: masterTone
      }
    ]
  };
}

function createHandoffPackItems({
  analysis,
  project,
  stemAnalyses,
  onExportHandoffSheet,
  onExportMidi,
  onExportStems,
  onExportWav
}: {
  analysis: ExportAnalysis;
  project: ProjectState;
  stemAnalyses: StemExportAnalyses;
  onExportHandoffSheet: () => void;
  onExportMidi: () => void;
  onExportStems: () => void;
  onExportWav: () => void;
}): HandoffPackItem[] {
  const bars = arrangementTotalBars(project);
  const audibleStems = audibleStemTracks(stemAnalyses);
  const target = activeDeliveryTarget(project);
  const briefFields = sessionBriefFilledFields(project.sessionBrief);
  const exportTone: MixCoachTone = analysis.status === "Ready" ? "good" : analysis.status === "Silent" ? "danger" : "warn";
  const stemTone: MixCoachTone =
    audibleStems.length === stemTrackIds.length ? "good" : audibleStems.length >= Math.min(2, stemTrackIds.length) ? "warn" : "danger";
  const midiTone: MixCoachTone = bars >= 8 ? "good" : bars >= 4 ? "warn" : "danger";
  const sheetTone: MixCoachTone = briefFields >= 2 ? "good" : briefFields >= 1 ? "warn" : "danger";
  const audibleStemLabel = audibleStems.length > 0 ? audibleStems.map(stemTrackLabel).join("/") : "No audible stems";

  return [
    {
      id: "wav",
      label: "Mix WAV",
      value: analysis.status,
      detail: `${barCountLabel(bars)} / ${formatDb(analysis.peakDb)} peak`,
      tone: exportTone,
      buttonLabel: "WAV",
      run: onExportWav
    },
    {
      id: "stems",
      label: "Stem WAVs",
      value: `${audibleStems.length}/${stemTrackIds.length}`,
      detail: audibleStemLabel,
      tone: stemTone,
      buttonLabel: "Stems",
      run: onExportStems
    },
    {
      id: "midi",
      label: "Arrangement MIDI",
      value: barCountLabel(bars),
      detail: `Pattern ${usedPatternSlots(project).join("/") || project.selectedPattern} handoff`,
      tone: midiTone,
      buttonLabel: "MIDI",
      run: onExportMidi
    },
    {
      id: "sheet",
      label: "Handoff Sheet",
      value: `${briefFields}/4 brief`,
      detail: `${target.name} / ${handoffSheetFileName(project)}`,
      tone: sheetTone,
      buttonLabel: "Sheet",
      run: onExportHandoffSheet
    }
  ];
}

function createBeatMapSummary(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): BeatMapSummary {
  const stages = createBeatMapStages(project, checks, analysis, stemAnalyses);
  const metrics = createBeatMapMetrics(project, analysis, stemAnalyses);
  const tone = weakestTone([...stages.map((stage) => stage.tone), ...metrics.map((metric) => metric.tone)]);
  const bars = arrangementTotalBars(project);
  const patternUsage = usedPatternSlots(project).join("/");
  const target = activeDeliveryTarget(project);
  const headline =
    tone === "danger" ? `${target.name} target needs a starter move` : tone === "warn" ? `${target.name} target in progress` : `${target.name} target ready`;
  const detail = `${barCountLabel(bars)} of ${barCountLabel(target.targetBars)} / Pattern ${patternUsage} / ${analysis.status} export`;

  return {
    headline,
    detail,
    tone,
    stages,
    metrics
  };
}

function createBeatMapStages(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): BeatMapStage[] {
  const styleName = styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
  const drums = readinessCheckForId(checks, "drums");
  const bass = readinessCheckForId(checks, "bass");
  const harmony = readinessCheckForId(checks, "harmony");
  const compositionTone = weakestTone([drums?.tone ?? "danger", bass?.tone ?? "danger", harmony?.tone ?? "danger"]);
  const bars = arrangementTotalBars(project);
  const target = activeDeliveryTarget(project);
  const arrangementTone: MixCoachTone = bars >= target.targetBars ? "good" : bars >= 8 ? "warn" : "danger";
  const mixTone = weakestTone(createMixCoachChecks(analysis, stemAnalyses).map((check) => check.tone));
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const deliveryTone: MixCoachTone =
    analysis.status === "Silent" ? "danger" : analysis.status !== "Ready" || audibleStemCount < target.stemGoal ? "warn" : "good";

  return [
    {
      id: "start",
      label: "Start",
      status: target.name,
      detail: `${styleName} / ${project.key} / ${project.bpm} BPM`,
      tone: "good"
    },
    {
      id: "compose",
      label: "Compose",
      status: compositionTone === "good" ? "Playable" : compositionTone === "warn" ? "Sketch" : "Needs core",
      detail: `${drums?.status ?? "Drums"} / ${bass?.status ?? "808"} / ${harmony?.status ?? "Harmony"}`,
      tone: compositionTone
    },
    {
      id: "arrange",
      label: "Arrange",
      status: bars >= target.targetBars ? "Target met" : bars >= 8 ? "In range" : "Short",
      detail: `${barCountLabel(bars)} of ${barCountLabel(target.targetBars)} target`,
      tone: arrangementTone
    },
    {
      id: "polish",
      label: "Polish",
      status: mixTone === "good" ? "Balanced" : mixTone === "warn" ? "Check mix" : "Needs signal",
      detail: `${formatDb(analysis.headroomDb)} headroom`,
      tone: mixTone
    },
    {
      id: "deliver",
      label: "Deliver",
      status: deliveryTone === "good" ? "Ready" : deliveryTone === "warn" ? "Check exports" : "No signal",
      detail: `${audibleStemCount}/${target.stemGoal} target stems audible`,
      tone: deliveryTone
    }
  ];
}

function createBeatMapMetrics(
  project: ProjectState,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): BeatMapMetric[] {
  const bars = arrangementTotalBars(project);
  const target = activeDeliveryTarget(project);
  const slots = usedPatternSlots(project);
  const audibleStems = audibleStemTracks(stemAnalyses);
  const spread = stemSpreadDb(stemAnalyses);
  const songTone: MixCoachTone = bars >= target.targetBars ? "good" : bars >= 8 ? "warn" : "danger";
  const patternTone: MixCoachTone = slots.length >= 3 ? "good" : slots.length >= 2 ? "warn" : "danger";
  const exportTone: MixCoachTone = analysis.status === "Ready" ? "good" : analysis.status === "Silent" ? "danger" : "warn";
  const stemTone: MixCoachTone =
    audibleStems.length >= target.stemGoal ? "good" : audibleStems.length >= 2 ? "warn" : "danger";
  const briefStatus = sessionBriefStatus(project.sessionBrief);

  return [
    {
      id: "brief",
      label: "Brief",
      value: briefStatus.value,
      detail: briefStatus.detail,
      tone: briefStatus.tone
    },
    {
      id: "song",
      label: "Song",
      value: barCountLabel(bars),
      detail: `${barCountLabel(target.targetBars)} ${target.name} target`,
      tone: songTone
    },
    {
      id: "patterns",
      label: "Patterns",
      value: `${slots.length}/3 used`,
      detail: `Pattern ${slots.join("/")}`,
      tone: patternTone
    },
    {
      id: "export",
      label: "Export",
      value: analysis.status,
      detail: `${formatDb(analysis.peakDb)} peak`,
      tone: exportTone
    },
    {
      id: "stems",
      label: "Stems",
      value: `${audibleStems.length}/${target.stemGoal}`,
      detail: spread === null ? "Need two audible stems" : `${spread.toFixed(1)} dB spread`,
      tone: stemTone
    }
  ];
}

function createBeatMapActions(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): NextMoveAction[] {
  const drums = readinessCheckForId(checks, "drums");
  const bass = readinessCheckForId(checks, "bass");
  const harmony = readinessCheckForId(checks, "harmony");
  const compositionTone = weakestTone([drums?.tone ?? "danger", bass?.tone ?? "danger", harmony?.tone ?? "danger"]);
  const bars = arrangementTotalBars(project);
  const target = activeDeliveryTarget(project);
  const mixTone = weakestTone(createMixCoachChecks(analysis, stemAnalyses).map((check) => check.tone));
  const candidates: NextMoveAction[] = [
    !isDeliveryTargetAligned(project, target) ? deliveryTargetNextMoveAction(project) : arrangementLiftNextMoveAction(project),
    compositionTone === "danger" ? blueprintNextMoveAction(project) : patternFillNextMoveAction(project),
    bars < 8 ? patternChainNextMoveAction() : bars < target.targetBars ? chainExpandNextMoveAction() : arrangementLiftNextMoveAction(project),
    masterFinishNextMoveAction(project, analysis),
    mixTone === "good" && analysis.status === "Ready" ? snapshotNextMoveAction(project) : mixReviewNextMoveAction(analysis),
    project.snapshots.length === 0 ? snapshotNextMoveAction(project) : mixReviewNextMoveAction(analysis)
  ];
  const uniqueActions = new Map<string, NextMoveAction>();

  for (const action of candidates) {
    if (!uniqueActions.has(action.id)) {
      uniqueActions.set(action.id, action);
    }
  }

  return [...uniqueActions.values()].slice(0, 4);
}

function createStructureLensSummary(project: ProjectState): StructureLensSummary {
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const sectionLabels = arrangementSections.filter((section) => project.arrangement.some((block) => block.section === section));
  const hasVerse = sectionLabels.includes("Verse");
  const hasHook = sectionLabels.includes("Hook");
  const targetTone: MixCoachTone = bars >= target.targetBars ? "good" : bars >= Math.min(8, target.targetBars) ? "warn" : "danger";
  const sectionTone: MixCoachTone =
    hasVerse && hasHook && sectionLabels.length >= 4 ? "good" : hasHook && sectionLabels.length >= 3 ? "warn" : "danger";
  const hookSignal = structureHookSignal(project);
  const arcSignal = structureArcSignal(project);
  const signals: StructureLensSignal[] = [
    {
      id: "target",
      label: "Target Fit",
      value: `${bars}/${target.targetBars} bars`,
      detail: target.name,
      tone: targetTone
    },
    {
      id: "sections",
      label: "Sections",
      value: `${sectionLabels.length}/${arrangementSections.length}`,
      detail: sectionLabels.length > 0 ? sectionLabels.join("/") : "No arrangement blocks",
      tone: sectionTone
    },
    hookSignal,
    arcSignal
  ];
  const tone = weakestTone(signals.map((signal) => signal.tone));
  const headline =
    tone === "good" ? "Song shape reads clearly" : tone === "warn" ? "Song shape needs contrast" : "Build a clearer song shape";
  const detail = `${barCountLabel(bars)} / ${target.name} / ${usedPatternSlots(project).join("/") || project.selectedPattern}`;

  return {
    headline,
    detail,
    tone,
    signals
  };
}

function createStructureLensActions(project: ProjectState): NextMoveAction[] {
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const candidates: NextMoveAction[] = [
    !isDeliveryTargetAligned(project, target) ? deliveryTargetNextMoveAction(project) : arrangementLiftNextMoveAction(project),
    bars < 8 ? patternChainNextMoveAction() : chainExpandNextMoveAction(),
    fullArrangementNextMoveAction(),
    arrangementLiftNextMoveAction(project),
    patternChainNextMoveAction()
  ];
  const uniqueActions = new Map<string, NextMoveAction>();

  for (const action of candidates) {
    if (!uniqueActions.has(action.id)) {
      uniqueActions.set(action.id, action);
    }
  }

  return [...uniqueActions.values()].slice(0, 4);
}

function structureHookSignal(project: ProjectState): StructureLensSignal {
  const hookBlocks = project.arrangement.filter((block) => block.section === "Hook");
  if (hookBlocks.length === 0) {
    return {
      id: "hook",
      label: "Hook",
      value: "Missing",
      detail: "Add a main section",
      tone: "danger"
    };
  }

  const hookEnergy = Math.max(...hookBlocks.map((block) => normalizeArrangementEnergy(block.energy)));
  const nonHookBlocks = project.arrangement.filter((block) => block.section !== "Hook");
  const comparisonBlocks = nonHookBlocks.length > 0 ? nonHookBlocks : project.arrangement;
  const comparisonEnergy =
    comparisonBlocks.reduce((total, block) => total + normalizeArrangementEnergy(block.energy), 0) / comparisonBlocks.length;
  const contrast = hookEnergy - comparisonEnergy;
  const tone: MixCoachTone = hookEnergy >= 0.86 && contrast >= 0.12 ? "good" : hookEnergy >= 0.74 && contrast >= 0.04 ? "warn" : "danger";

  return {
    id: "hook",
    label: "Hook",
    value: percentLabel(hookEnergy),
    detail: `${signedPercentLabel(contrast)} over other sections`,
    tone
  };
}

function structureArcSignal(project: ProjectState): StructureLensSignal {
  const energies = project.arrangement.map((block) => normalizeArrangementEnergy(block.energy));
  const low = Math.min(...energies);
  const high = Math.max(...energies);
  const spread = high - low;
  const first = energies[0] ?? 0;
  const last = energies[energies.length - 1] ?? first;
  const hasRelease = last <= high - 0.18 || project.arrangement.some((block) => block.section === "Outro");
  const tone: MixCoachTone = spread >= 0.36 && high >= 0.86 && hasRelease ? "good" : spread >= 0.22 ? "warn" : "danger";

  return {
    id: "arc",
    label: "Energy Arc",
    value: `${Math.round(spread * 100)}% spread`,
    detail: `low ${percentLabel(low)} / high ${percentLabel(high)}`,
    tone
  };
}

function usedPatternSlots(project: ProjectState): PatternSlot[] {
  const slots = new Set(project.arrangement.map((block) => block.pattern));
  return patternSlots.filter((slot) => slots.has(slot));
}

function arrangementStartBar(project: ProjectState, selectedIndex: number): number {
  return project.arrangement
    .slice(0, Math.max(0, selectedIndex))
    .reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
}

function transportLoopLabel(scope: TransportLoopScope): string {
  switch (scope) {
    case "arrangement":
      return "Song";
    case "block":
      return "Block";
    case "pattern":
      return "Pattern";
  }
}

function transportLoopStatus(project: ProjectState, scope: TransportLoopScope, selectedIndex: number): string {
  if (scope === "pattern") {
    return `Pattern ${project.selectedPattern} / ${barCountLabel(2)} loop`;
  }

  if (scope === "block") {
    const block = project.arrangement[selectedIndex] ?? project.arrangement[0];
    if (!block) {
      return "Block loop unavailable";
    }
    return `Block ${Math.min(selectedIndex + 1, project.arrangement.length)} ${block.section} / Pattern ${block.pattern} / ${barCountLabel(block.bars)}`;
  }

  return `${barCountLabel(arrangementTotalBars(project))} song loop`;
}

function createArrangementFocusSummary(project: ProjectState, selectedIndex: number): ArrangementFocusSummary | null {
  const block = project.arrangement[selectedIndex] ?? project.arrangement[0];
  if (!block) {
    return null;
  }

  const pattern = project.patterns[block.pattern];
  const mutedLabels = block.mutedTracks.map(arrangementMuteTrackLabel);
  return {
    blockNumber: Math.min(selectedIndex + 1, project.arrangement.length),
    section: block.section,
    pattern: block.pattern,
    bars: normalizeArrangementBars(block.bars),
    energy: normalizeArrangementEnergy(block.energy),
    eventCount: drumHitCount(pattern) + pattern.bassNotes.length + pattern.melodyNotes.length + pattern.chordEvents.length,
    mutedLabel: mutedLabels.length === 0 ? "no mutes" : `${mutedLabels.join(", ")} muted`,
    suggestedPreset: suggestedArrangementFocusPreset(block)
  };
}

function suggestedArrangementFocusPreset(block: ArrangementBlock): ArrangementFocusPresetId {
  switch (block.section) {
    case "Intro":
      return "intro_space";
    case "Hook":
      return "hook_peak";
    case "Bridge":
      return "bridge_drop";
    case "Outro":
      return "outro_release";
    case "Verse":
      return "verse_pocket";
  }
}

function createPatternCompareSummaries(project: ProjectState): PatternCompareSummary[] {
  return patternSlots.map((slot) => {
    const pattern = project.patterns[slot];
    const arrangedBlocks = project.arrangement.filter((block) => block.pattern === slot);
    const arrangedBars = arrangedBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
    const drumHits = drumHitCount(pattern);
    const bassNotes = pattern.bassNotes.length;
    const melodyNotes = pattern.melodyNotes.length;
    const chordEvents = pattern.chordEvents.length;
    return {
      slot,
      eventCount: drumHits + bassNotes + melodyNotes + chordEvents,
      drumHits,
      bassNotes,
      melodyNotes,
      chordEvents,
      arrangedBlocks: arrangedBlocks.length,
      arrangedBars
    };
  });
}

function createStyleInspectorSummary(
  project: ProjectState,
  profile: StyleProfile,
  patternSummaries: PatternCompareSummary[]
): StyleInspectorSummary {
  const totalEvents = patternSummaries.reduce((total, pattern) => total + pattern.eventCount, 0);
  const soundPreset = styleSoundPreset(profile.id);

  return {
    profile,
    bpm: `${project.bpm} active / ${profile.bpmRange[0]}-${profile.bpmRange[1]}`,
    swing: `${percentLabel(project.swing)} active / ${percentLabel(profile.defaultSwing)} default`,
    bass: bassStyleRoleLabel(profile.bassStyle),
    melody: melodyStyleRoleLabel(profile.melodyStyle),
    soundPreset: soundPresetLabel(soundPreset),
    totalEvents,
    patterns: patternSummaries.map((pattern) => ({
      slot: pattern.slot,
      label: styleDensityLabel(pattern.eventCount),
      eventCount: pattern.eventCount,
      detail: `${pattern.eventCount} events / ${pattern.drumHits} drums / ${pattern.bassNotes + pattern.melodyNotes} notes`
    }))
  };
}

function styleDensityLabel(eventCount: number): string {
  if (eventCount >= 30) {
    return "Dense";
  }
  if (eventCount >= 20) {
    return "Full";
  }
  if (eventCount >= 12) {
    return "Pocket";
  }
  return "Open";
}

function bassStyleRoleLabel(style: StyleProfile["bassStyle"]): string {
  switch (style) {
    case "808":
      return "808 lead";
    case "sub":
      return "Sub anchor";
    case "walking":
      return "Walking bass";
    case "pluck":
      return "Pluck groove";
    case "reese":
      return "Reese weight";
    case "minimal":
      return "Minimal low end";
  }
}

function melodyStyleRoleLabel(style: StyleProfile["melodyStyle"]): string {
  switch (style) {
    case "riff":
      return "Riff hook";
    case "chordal":
      return "Chord focus";
    case "loop":
      return "Loop motif";
    case "ambient":
      return "Ambient texture";
    case "none":
      return "Rhythm first";
  }
}

function audibleStemTracks(stemAnalyses: StemExportAnalyses): StemTrackId[] {
  return stemTrackIds.filter((track) => Number.isFinite(stemAnalyses[track].rmsDb));
}

function weakestTone(tones: MixCoachTone[]): MixCoachTone {
  if (tones.includes("danger")) {
    return "danger";
  }
  if (tones.includes("warn")) {
    return "warn";
  }
  return "good";
}

function createBeatReadinessChecks(project: ProjectState, analysis: ExportAnalysis): BeatReadinessCheck[] {
  const arrangedPatterns = arrangedPatternData(project);
  const drumHits = arrangedPatterns.reduce((total, pattern) => total + drumHitCount(pattern), 0);
  const hasKick = arrangedPatterns.some((pattern) => pattern.drumPattern.kick.some(Boolean));
  const hasClap = arrangedPatterns.some((pattern) => pattern.drumPattern.clap.some(Boolean));
  const bassCount = arrangedPatterns.reduce((total, pattern) => total + pattern.bassNotes.length, 0);
  const melodyCount = arrangedPatterns.reduce((total, pattern) => total + pattern.melodyNotes.length, 0);
  const chordCount = arrangedPatterns.reduce((total, pattern) => total + pattern.chordEvents.length, 0);
  const bars = arrangementTotalBars(project);

  return [
    drumReadinessCheck(drumHits, hasKick, hasClap),
    bassReadinessCheck(bassCount),
    harmonyReadinessCheck(melodyCount, chordCount),
    arrangementReadinessCheck(project.arrangement.length, bars),
    exportReadinessCheck(analysis)
  ];
}

function arrangedPatternData(project: ProjectState): PatternData[] {
  const slots = new Set(project.arrangement.map((block) => block.pattern));
  const arrangedSlots = slots.size > 0 ? [...slots] : [project.selectedPattern];
  return arrangedSlots.map((slot) => project.patterns[slot]);
}

function drumHitCount(pattern: PatternData): number {
  const baseHits = Object.values(pattern.drumPattern).reduce(
    (total, laneSteps) => total + laneSteps.filter(Boolean).length,
    0
  );
  const repeatedHats = pattern.drumPattern.hat.reduce(
    (total, enabled, step) => total + (enabled ? hatRepeatCount(pattern, step) - 1 : 0),
    0
  );
  return baseHits + repeatedHats;
}

function drumReadinessCheck(drumHits: number, hasKick: boolean, hasClap: boolean): BeatReadinessCheck {
  if (drumHits <= 0) {
    return {
      id: "drums",
      label: "Drums",
      status: "Empty",
      detail: "No arranged drum hits detected.",
      tone: "danger"
    };
  }
  if (!hasKick || !hasClap || drumHits < 8) {
    return {
      id: "drums",
      label: "Drums",
      status: "Sparse",
      detail: `${drumHits} arranged hits across the used patterns.`,
      tone: "warn"
    };
  }
  return {
    id: "drums",
    label: "Drums",
    status: "Set",
    detail: `${drumHits} arranged hits with kick and clap anchors.`,
    tone: "good"
  };
}

function bassReadinessCheck(bassCount: number): BeatReadinessCheck {
  if (bassCount <= 0) {
    return {
      id: "bass",
      label: "808",
      status: "Missing",
      detail: "No arranged 808 or bass notes detected.",
      tone: "danger"
    };
  }
  if (bassCount < 3) {
    return {
      id: "bass",
      label: "808",
      status: "Light",
      detail: `${bassCount} arranged bass note${bassCount === 1 ? "" : "s"} detected.`,
      tone: "warn"
    };
  }
  return {
    id: "bass",
    label: "808",
    status: "Set",
    detail: `${bassCount} arranged bass notes detected.`,
    tone: "good"
  };
}

function harmonyReadinessCheck(melodyCount: number, chordCount: number): BeatReadinessCheck {
  if (melodyCount <= 0 && chordCount <= 0) {
    return {
      id: "harmony",
      label: "Melody/chords",
      status: "Missing",
      detail: "No arranged melody or chord events detected.",
      tone: "danger"
    };
  }
  if (melodyCount < 3 && chordCount < 2) {
    return {
      id: "harmony",
      label: "Melody/chords",
      status: "Sketch",
      detail: `${melodyCount} melody events and ${chordCount} chord events detected.`,
      tone: "warn"
    };
  }
  return {
    id: "harmony",
    label: "Melody/chords",
    status: "Set",
    detail: `${melodyCount} melody events and ${chordCount} chord events detected.`,
    tone: "good"
  };
}

function arrangementReadinessCheck(blockCount: number, bars: number): BeatReadinessCheck {
  if (bars < 8) {
    return {
      id: "arrangement",
      label: "Arrangement",
      status: "Short",
      detail: `${barCountLabel(bars)} across ${blockCount} block${blockCount === 1 ? "" : "s"}.`,
      tone: "warn"
    };
  }
  if (blockCount < 2) {
    return {
      id: "arrangement",
      label: "Arrangement",
      status: "Loop ready",
      detail: `${barCountLabel(bars)} in one arrangement block.`,
      tone: "good"
    };
  }
  return {
    id: "arrangement",
    label: "Arrangement",
    status: "Structured",
    detail: `${barCountLabel(bars)} across ${blockCount} blocks.`,
    tone: "good"
  };
}

function exportReadinessCheck(analysis: ExportAnalysis): BeatReadinessCheck {
  if (analysis.status === "Silent") {
    return {
      id: "export",
      label: "Export",
      status: "Silent",
      detail: "Rendered arrangement output has no signal.",
      tone: "danger"
    };
  }
  if (analysis.status === "Limiter active") {
    return {
      id: "export",
      label: "Export",
      status: "Limited",
      detail: `${formatPercent(analysis.limitedPercent)} limiter activity at export.`,
      tone: "warn"
    };
  }
  if (analysis.headroomDb < 0.5) {
    return {
      id: "export",
      label: "Export",
      status: "Hot",
      detail: `${formatDb(analysis.headroomDb)} headroom before the ceiling.`,
      tone: "warn"
    };
  }
  return {
    id: "export",
    label: "Export",
    status: "Ready",
    detail: `${formatDb(analysis.headroomDb)} headroom before the ceiling.`,
    tone: "good"
  };
}

function MixBalancePads({
  pads,
  onApply
}: {
  pads: MixBalancePadOption[];
  onApply: (pad: MixBalancePadId) => void;
}): ReactElement {
  return (
    <div className="mix-balance-panel" data-testid="mix-balance-pads">
      <div className="mix-balance-heading">
        <span>Mix Balance</span>
        <strong>Rough posture</strong>
      </div>
      <div className="mix-balance-row" aria-label="Mix Balance Pads">
        {pads.map((pad) => (
          <button
            data-testid={`mix-balance-${pad.id}`}
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

function MasterFinishPads({
  pads,
  onApply
}: {
  pads: MasterFinishPadOption[];
  onApply: (pad: MasterFinishPadId) => void;
}): ReactElement {
  return (
    <div className="master-finish-panel" data-testid="master-finish-pads">
      <div className="master-finish-heading">
        <span>Master Finish</span>
        <strong>Output posture</strong>
      </div>
      <div className="master-finish-row" aria-label="Master Finish Pads">
        {pads.map((pad) => (
          <button
            data-testid={`master-finish-${pad.id}`}
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

function ExportMeter({ analysis }: { analysis: ExportAnalysis }): ReactElement {
  const peakPercent = meterPercent(analysis.peakDb, analysis.ceilingDb);
  const rmsPercent = meterPercent(analysis.rmsDb, analysis.ceilingDb);
  return (
    <div className="export-meter" data-testid="export-meter">
      <div className={`meter-status ${analysis.status.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
        <span>Export meter</span>
        <strong data-testid="export-meter-status">{analysis.status}</strong>
      </div>
      <div className="meter-bars">
        <MeterBar label="Peak" percent={peakPercent} value={formatDb(analysis.peakDb)} testId="export-peak-db" />
        <MeterBar label="RMS" percent={rmsPercent} value={formatDb(analysis.rmsDb)} testId="export-rms-db" />
      </div>
      <div className="meter-stats">
        <span data-testid="export-headroom-db">Headroom {formatDb(analysis.headroomDb)}</span>
        <span data-testid="export-limiter-percent">Limiter {formatPercent(analysis.limitedPercent)}</span>
        <span>{analysis.durationSeconds.toFixed(1)} sec</span>
      </div>
    </div>
  );
}

function MixCoach({
  analysis,
  stemAnalyses,
  onApplyFix
}: {
  analysis: ExportAnalysis;
  stemAnalyses: StemExportAnalyses;
  onApplyFix: (preset: MixFixPreset) => void;
}): ReactElement {
  const checks = createMixCoachChecks(analysis, stemAnalyses);
  const fixes = createMixFixActions(analysis, stemAnalyses);

  return (
    <div className="mix-coach" data-testid="mix-coach">
      <div className="mix-coach-heading">
        <span>Mix Coach</span>
        <strong data-testid="mix-coach-summary">{mixCoachSummary(checks)}</strong>
      </div>
      <div className="mix-coach-list">
        {checks.map((check) => (
          <div className={`mix-coach-card ${check.tone}`} data-testid={`mix-coach-check-${check.id}`} key={check.id}>
            <span>{check.label}</span>
            <strong>{check.status}</strong>
            <p>{check.detail}</p>
          </div>
        ))}
      </div>
      <div className="mix-fix-row" aria-label="Mix fixes">
        {fixes.map((fix) => (
          <button
            className={fix.tone}
            data-testid={`mix-fix-${fix.preset}`}
            key={fix.preset}
            onClick={() => onApplyFix(fix.preset)}
            title={fix.detail}
            type="button"
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            <span>{fix.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function createMixFixActions(analysis: ExportAnalysis, stemAnalyses: StemExportAnalyses): MixFixAction[] {
  const lowEndDelta = lowEndDeltaDb(stemAnalyses);
  const headroomTone: MixCoachTone = analysis.headroomDb < 0.5 || analysis.limitedSamples > 0 ? "warn" : "good";
  const lowEndTone: MixCoachTone =
    lowEndDelta === null ? "danger" : lowEndDelta > 6 || lowEndDelta < -12 ? "warn" : "good";
  const spread = stemSpreadDb(stemAnalyses);
  const balanceTone: MixCoachTone = spread === null ? "danger" : spread > 18 ? "warn" : "good";

  return [
    {
      preset: "headroom",
      label: "Headroom",
      detail: `Set vocal-safe ceiling and master gain from ${formatDb(analysis.headroomDb)} headroom.`,
      tone: headroomTone
    },
    {
      preset: "stem_balance",
      label: "Stem Balance",
      detail: spread === null ? "Nudge core stem levels after at least two stems have signal." : `Nudge ${spread.toFixed(1)} dB stem spread toward a rough balance.`,
      tone: balanceTone
    },
    {
      preset: "low_end",
      label: "Low End",
      detail:
        lowEndDelta === null
          ? "Set drum and 808 mixer values for comparison."
          : `Tighten 808/drum relation at ${lowEndDelta.toFixed(1)} dB RMS delta.`,
      tone: lowEndTone
    }
  ];
}

function createMixCoachChecks(analysis: ExportAnalysis, stemAnalyses: StemExportAnalyses): MixCoachCheck[] {
  const audibleStems = stemTrackIds
    .map((track) => ({ track, analysis: stemAnalyses[track] }))
    .filter((entry) => Number.isFinite(entry.analysis.rmsDb));
  const loudestStem = audibleStems.reduce<(typeof audibleStems)[number] | undefined>(
    (loudest, entry) => (!loudest || entry.analysis.rmsDb > loudest.analysis.rmsDb ? entry : loudest),
    undefined
  );
  const quietestStem = audibleStems.reduce<(typeof audibleStems)[number] | undefined>(
    (quietest, entry) => (!quietest || entry.analysis.rmsDb < quietest.analysis.rmsDb ? entry : quietest),
    undefined
  );
  const stemSpread =
    loudestStem && quietestStem ? Math.max(0, loudestStem.analysis.rmsDb - quietestStem.analysis.rmsDb) : 0;
  const drums = stemAnalyses.drum_rack;
  const bass = stemAnalyses.bass_808;
  const lowEndDelta =
    Number.isFinite(drums.rmsDb) && Number.isFinite(bass.rmsDb) ? bass.rmsDb - drums.rmsDb : null;

  return [
    masterHeadroomCheck(analysis),
    limiterCheck(analysis),
    stemBalanceCheck(loudestStem, quietestStem, stemSpread),
    lowEndBlendCheck(lowEndDelta)
  ];
}

function createMixBalancePadOptions(mixer: MixerChannel[]): MixBalancePadOption[] {
  return mixBalancePadDefinitions.map((pad) => {
    const transformed = applyMixBalancePadToMixer(mixer, pad);
    return {
      ...pad,
      preview: mixBalancePreview(pad),
      changedCount: transformed.filter((channel, index) => !sameMixerChannel(channel, mixer[index])).length
    };
  });
}

function mixBalancePreview(pad: MixBalancePadDefinition): string {
  const drumVolume = pad.channels.drum_rack?.volumeDb ?? 0;
  const bassVolume = pad.channels.bass_808?.volumeDb ?? 0;
  return `D ${compactMixDb(drumVolume)} / 8 ${compactMixDb(bassVolume)}`;
}

function compactMixDb(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function createMasterFinishPadOptions(project: ProjectState): MasterFinishPadOption[] {
  return masterFinishPadDefinitions.map((pad) => {
    const nextProject = applyMasterFinishPadToProject(project, pad);
    return {
      ...pad,
      preview: masterFinishPreview(pad),
      changedCount: masterFinishChangedCount(project, nextProject)
    };
  });
}

function masterFinishPreview(pad: MasterFinishPadDefinition): string {
  return `C ${compactMixDb(pad.ceilingDb)} / O ${compactMixDb(pad.masterVolumeDb)}`;
}

function masterFinishChangedCount(current: ProjectState, nextProject: ProjectState): number {
  return [
    current.masterPreset !== nextProject.masterPreset,
    current.masterCeilingDb !== nextProject.masterCeilingDb,
    masterChannelVolumeDb(current.mixer) !== masterChannelVolumeDb(nextProject.mixer)
  ].filter(Boolean).length;
}

function applyMasterFinishPadToProject(project: ProjectState, pad: MasterFinishPadDefinition): ProjectState {
  const masterVolumeDb = clampMixFixVolume(pad.masterVolumeDb);
  const masterCeilingDb = clampMasterCeilingDb(pad.ceilingDb);
  const mixer = project.mixer.map((channel) =>
    channel.id === "master" ? { ...channel, volumeDb: masterVolumeDb } : channel
  );
  const nextProject = {
    ...project,
    masterPreset: pad.preset,
    masterCeilingDb,
    mixer
  };
  return masterFinishChangedCount(project, nextProject) === 0 ? project : nextProject;
}

function masterChannelVolumeDb(mixer: MixerChannel[]): number {
  return mixer.find((channel) => channel.id === "master")?.volumeDb ?? -1;
}

function applyMixBalancePadToMixer(mixer: MixerChannel[], pad: MixBalancePadDefinition): MixerChannel[] {
  return mixer.map((channel) => {
    const update = pad.channels[channel.id];
    if (!update) {
      return { ...channel, muted: false, solo: false };
    }
    return {
      ...channel,
      volumeDb: update.volumeDb === undefined ? channel.volumeDb : clampMixFixVolume(update.volumeDb),
      pan: update.pan === undefined ? channel.pan : clampPan(update.pan),
      lowCut: update.lowCut === undefined ? channel.lowCut : normalizeMixerEq(update.lowCut),
      air: update.air === undefined ? channel.air : normalizeMixerEq(update.air),
      drive: update.drive === undefined ? channel.drive : normalizeMixerEq(update.drive),
      glue: update.glue === undefined ? channel.glue : normalizeMixerEq(update.glue),
      send: update.send === undefined ? channel.send : normalizeMixerEq(update.send),
      muted: false,
      solo: false
    };
  });
}

function sameMixerChannels(first: MixerChannel[], second: MixerChannel[]): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((channel, index) => sameMixerChannel(channel, second[index]));
}

function sameMixerChannel(first: MixerChannel | undefined, second: MixerChannel | undefined): boolean {
  return (
    first !== undefined &&
    second !== undefined &&
    first.id === second.id &&
    first.volumeDb === second.volumeDb &&
    first.pan === second.pan &&
    first.lowCut === second.lowCut &&
    first.air === second.air &&
    first.drive === second.drive &&
    first.glue === second.glue &&
    first.send === second.send &&
    first.muted === second.muted &&
    first.solo === second.solo
  );
}

const soundFocusParameters: SoundFocusParameter[] = [
  "kickPunch",
  "snareSnap",
  "hatBrightness",
  "bassDrive",
  "bassDecay",
  "sidechainDuck",
  "synthBrightness",
  "synthRelease",
  "chordWarmth",
  "chordWidth"
];

function createSoundFocusPadOptions(sound: SoundDesign): SoundFocusPadOption[] {
  return soundFocusPadDefinitions.map((pad) => {
    const transformed = applySoundFocusPadToSound(sound, pad);
    return {
      ...pad,
      preview: soundFocusPreview(pad),
      changedCount: soundFocusParameters.filter((parameter) => transformed[parameter] !== sound[parameter]).length
    };
  });
}

function soundFocusPreview(pad: SoundFocusPadDefinition): string {
  return `K ${compactUnitPercent(pad.values.kickPunch)} / 8 ${compactUnitPercent(pad.values.bassDrive)}`;
}

function compactUnitPercent(value: number | undefined): string {
  return `${Math.round(clampUnit(value ?? 0) * 100)}`;
}

function applySoundFocusPadToSound(sound: SoundDesign, pad: SoundFocusPadDefinition): SoundDesign {
  const nextSound: SoundDesign = {
    ...sound,
    preset: "custom"
  };
  soundFocusParameters.forEach((parameter) => {
    const value = pad.values[parameter];
    if (value !== undefined) {
      nextSound[parameter] = clampUnit(value);
    }
  });
  return nextSound;
}

function sameSoundDesign(first: SoundDesign, second: SoundDesign): boolean {
  return first.preset === second.preset && soundFocusParameters.every((parameter) => first[parameter] === second[parameter]);
}

function applyMixFixToProject(
  project: ProjectState,
  preset: MixFixPreset,
  stemAnalyses: StemExportAnalyses
): ProjectState {
  switch (preset) {
    case "headroom":
      return {
        ...project,
        masterPreset: "Headroom for Vocal",
        masterCeilingDb: masterPresetCeilingDb("Headroom for Vocal"),
        mixer: project.mixer.map((channel) =>
          channel.id === "master"
            ? { ...channel, volumeDb: Math.min(channel.volumeDb, -2) }
            : {
                ...channel,
                drive: normalizeMixerEq(channel.drive * 0.9),
                glue: normalizeMixerEq(channel.glue * 0.95)
              }
        )
      };
    case "stem_balance":
      return {
        ...project,
        mixer: project.mixer.map((channel) => {
          const target = roughStemVolumeTarget(channel.id);
          return target === null ? channel : { ...channel, volumeDb: nudgeMixFixVolume(channel.volumeDb, target) };
        })
      };
    case "low_end": {
      const lowEndDelta = lowEndDeltaDb(stemAnalyses);
      const bassShift = lowEndDelta === null ? 0 : lowEndDelta > 6 ? -2 : lowEndDelta < -12 ? 2 : 0;
      const drumShift = lowEndDelta === null ? 0 : lowEndDelta > 6 ? 0.8 : lowEndDelta < -12 ? -0.8 : 0;
      return {
        ...project,
        mixer: project.mixer.map((channel) => {
          if (channel.id === "bass_808") {
            return {
              ...channel,
              volumeDb: clampMixFixVolume(channel.volumeDb + bassShift),
              lowCut: 0,
              air: normalizeMixerEq(Math.min(channel.air, 0.12)),
              drive: normalizeMixerEq(Math.max(channel.drive, 0.2)),
              glue: normalizeMixerEq(Math.max(channel.glue, 0.2)),
              send: normalizeMixerEq(Math.min(channel.send, 0.04))
            };
          }
          if (channel.id === "drum_rack") {
            return {
              ...channel,
              volumeDb: clampMixFixVolume(channel.volumeDb + drumShift),
              lowCut: normalizeMixerEq(Math.max(channel.lowCut, 0.08)),
              glue: normalizeMixerEq(Math.max(channel.glue, 0.24))
            };
          }
          return channel;
        })
      };
    }
  }
}

function mixFixPresetLabel(preset: MixFixPreset): string {
  switch (preset) {
    case "headroom":
      return "Headroom";
    case "stem_balance":
      return "Stem Balance";
    case "low_end":
      return "Low End";
  }
}

function roughStemVolumeTarget(trackId: MixerChannel["id"]): number | null {
  switch (trackId) {
    case "drum_rack":
      return -5;
    case "bass_808":
      return -6.5;
    case "synth":
      return -9;
    case "chord":
      return -9.5;
    default:
      return null;
  }
}

function nudgeMixFixVolume(current: number, target: number): number {
  return clampMixFixVolume(current + (target - current) * 0.65);
}

function clampMixFixVolume(value: number): number {
  if (!Number.isFinite(value)) {
    return -6;
  }
  return Math.min(3, Math.max(-36, Math.round(value * 10) / 10));
}

function lowEndDeltaDb(stemAnalyses: StemExportAnalyses): number | null {
  const drums = stemAnalyses.drum_rack;
  const bass = stemAnalyses.bass_808;
  return Number.isFinite(drums.rmsDb) && Number.isFinite(bass.rmsDb) ? bass.rmsDb - drums.rmsDb : null;
}

function stemSpreadDb(stemAnalyses: StemExportAnalyses): number | null {
  const audibleStems = stemTrackIds
    .map((track) => stemAnalyses[track])
    .filter((analysis) => Number.isFinite(analysis.rmsDb));
  if (audibleStems.length < 2) {
    return null;
  }
  const levels = audibleStems.map((analysis) => analysis.rmsDb);
  return Math.max(...levels) - Math.min(...levels);
}

function masterHeadroomCheck(analysis: ExportAnalysis): MixCoachCheck {
  if (analysis.status === "Silent") {
    return {
      id: "headroom",
      label: "Master headroom",
      status: "No signal",
      detail: "Add or unmute musical events before judging the master.",
      tone: "danger"
    };
  }
  if (analysis.headroomDb < 0.5) {
    return {
      id: "headroom",
      label: "Master headroom",
      status: "Tight",
      detail: `Only ${formatDb(analysis.headroomDb)} remains before the ceiling.`,
      tone: "warn"
    };
  }
  return {
    id: "headroom",
    label: "Master headroom",
    status: "Open",
    detail: `${formatDb(analysis.headroomDb)} remains before the ceiling.`,
    tone: "good"
  };
}

function limiterCheck(analysis: ExportAnalysis): MixCoachCheck {
  if (analysis.limitedSamples > 0) {
    return {
      id: "limiter",
      label: "Limiter activity",
      status: "Catching peaks",
      detail: `${formatPercent(analysis.limitedPercent)} of rendered samples hit the ceiling.`,
      tone: analysis.limitedPercent > 0.1 ? "warn" : "good"
    };
  }
  return {
    id: "limiter",
    label: "Limiter activity",
    status: "Clear",
    detail: "No rendered samples hit the ceiling.",
    tone: "good"
  };
}

function stemBalanceCheck(
  loudestStem: { track: StemTrackId; analysis: ExportAnalysis } | undefined,
  quietestStem: { track: StemTrackId; analysis: ExportAnalysis } | undefined,
  stemSpread: number
): MixCoachCheck {
  if (!loudestStem || !quietestStem) {
    return {
      id: "stem-balance",
      label: "Stem balance",
      status: "No signal",
      detail: "Unmute at least two core stems before comparing balance.",
      tone: "danger"
    };
  }
  if (stemSpread > 18) {
    return {
      id: "stem-balance",
      label: "Stem balance",
      status: "Wide spread",
      detail: `RMS spread is ${stemSpread.toFixed(1)} dB from ${stemTrackLabel(loudestStem.track)} to ${stemTrackLabel(quietestStem.track)}.`,
      tone: "warn"
    };
  }
  return {
    id: "stem-balance",
    label: "Stem balance",
    status: "Connected",
    detail: `RMS spread is ${stemSpread.toFixed(1)} dB from ${stemTrackLabel(loudestStem.track)} to ${stemTrackLabel(quietestStem.track)}.`,
    tone: "good"
  };
}

function lowEndBlendCheck(lowEndDelta: number | null): MixCoachCheck {
  if (lowEndDelta === null) {
    return {
      id: "low-end",
      label: "Low-end blend",
      status: "No comparison",
      detail: "Drums and 808 both need signal for low-end balance.",
      tone: "danger"
    };
  }
  if (lowEndDelta > 6) {
    return {
      id: "low-end",
      label: "Low-end blend",
      status: "808 forward",
      detail: `808 is ${lowEndDelta.toFixed(1)} dB RMS above drums.`,
      tone: "warn"
    };
  }
  if (lowEndDelta < -12) {
    return {
      id: "low-end",
      label: "Low-end blend",
      status: "Drums forward",
      detail: `Drums are ${Math.abs(lowEndDelta).toFixed(1)} dB RMS above 808.`,
      tone: "warn"
    };
  }
  return {
    id: "low-end",
    label: "Low-end blend",
    status: "Balanced",
    detail: `808 is ${lowEndDelta.toFixed(1)} dB RMS relative to drums.`,
    tone: "good"
  };
}

function mixCoachSummary(checks: MixCoachCheck[]): string {
  const warningCount = checks.filter((check) => check.tone !== "good").length;
  if (warningCount === 0) {
    return "Ready checks";
  }
  return `${warningCount} check${warningCount === 1 ? "" : "s"} to review`;
}

function MeterBar({
  label,
  percent,
  value,
  testId
}: {
  label: string;
  percent: number;
  value: string;
  testId: string;
}): ReactElement {
  return (
    <div className="meter-bar">
      <span>{label}</span>
      <i>
        <b style={{ inlineSize: `${percent}%` }} />
      </i>
      <strong data-testid={testId}>{value}</strong>
    </div>
  );
}

function StemLevelMeter({
  trackId,
  analysis
}: {
  trackId: StemTrackId;
  analysis: ExportAnalysis;
}): ReactElement {
  const peakPercent = meterPercent(analysis.peakDb, analysis.ceilingDb);
  const rmsPercent = meterPercent(analysis.rmsDb, analysis.ceilingDb);
  const statusClass = analysis.status.toLowerCase().replace(/[^a-z]+/g, "-");

  return (
    <div className="stem-meter" data-testid={`stem-level-meter-${trackId}`}>
      <div className={`stem-meter-status ${statusClass}`}>
        <span>Stem</span>
        <strong data-testid={`stem-status-${trackId}`}>{analysis.status}</strong>
      </div>
      <div className="stem-meter-bars">
        <MeterBar label="Pk" percent={peakPercent} value={formatDb(analysis.peakDb)} testId={`stem-peak-db-${trackId}`} />
        <MeterBar label="RMS" percent={rmsPercent} value={formatDb(analysis.rmsDb)} testId={`stem-rms-db-${trackId}`} />
      </div>
      <div className="stem-meter-stats">
        <span data-testid={`stem-headroom-db-${trackId}`}>Headroom {formatDb(analysis.headroomDb)}</span>
      </div>
    </div>
  );
}

function DrumStepInspector({
  selectedStep,
  active,
  velocity,
  timingMs,
  probability,
  hatRepeat,
  onVelocityChange,
  onProbabilityChange,
  onTimingChange,
  onHatRepeatChange
}: {
  selectedStep: SelectedDrumStep | null;
  active: boolean;
  velocity?: number;
  timingMs: number;
  probability?: number;
  hatRepeat: number;
  onVelocityChange: (velocity: number) => void;
  onProbabilityChange: (probability: number) => void;
  onTimingChange: (timingMs: number) => void;
  onHatRepeatChange: (repeat: number) => void;
}): ReactElement {
  const velocityValue = velocity ?? 0.75;
  const probabilityValue = probability ?? 1;
  const timingValue = normalizeDrumTimingMs(timingMs);
  const timingTextValue = `${timingValue}`;
  const [timingText, setTimingText] = useState(timingTextValue);
  const [isEditingTiming, setIsEditingTiming] = useState(false);
  const skipNextTimingBlurCommit = useRef(false);
  const label = selectedStep ? `${drumLabels[selectedStep.lane]} ${selectedStep.step + 1}` : "No step";

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
    </div>
  );
}

function GrooveFeelPads({
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

function DrumAccentPads({
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

function PatternStackPads({
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

function BasslinePads({
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

function BassGlidePads({
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

function MelodyMotifPads({
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

function MelodyAccentPads({
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

function MelodyContourPads({
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

function KeyboardCapturePanel({
  enabled,
  target,
  nextStep,
  keyMap,
  selectedNote,
  onEnabledChange,
  onTargetChange
}: {
  enabled: boolean;
  target: NoteTrack;
  nextStep: number;
  keyMap: KeyboardCaptureKeyMapItem[];
  selectedNote: SelectedNote | null;
  onEnabledChange: (enabled: boolean) => void;
  onTargetChange: (target: NoteTrack) => void;
}): ReactElement {
  const selectedLabel = selectedNote
    ? `${selectedNote.track === "bass" ? "808" : "Synth"} ${selectedNote.pitch}.${selectedNote.step + 1}`
    : "None";
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
          <span>Selected</span>
          <strong>{selectedLabel}</strong>
        </div>
      </div>
      <div className="capture-key-map" aria-label="Keyboard Capture key map">
        {keyMap.map((item) => (
          <kbd
            className={item.pitch ? "" : "muted"}
            data-testid={`keyboard-capture-key-${item.key}`}
            key={item.key}
          >
            <span>{keyboardCaptureKeyLabels[item.key]}</span>
            <strong>{item.pitch ?? "-"}</strong>
          </kbd>
        ))}
      </div>
    </div>
  );
}

function NoteEditor({
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

function NoteInspector({
  selectedNote,
  bassNote,
  melodyNote,
  onLengthChange,
  onGlideChange,
  onVelocityChange,
  onProbabilityChange,
  onStepMove,
  onPitchMove,
  onOctaveMove,
  onDuplicate
}: {
  selectedNote: SelectedNote | null;
  bassNote?: BassNote;
  melodyNote?: MelodyNote;
  onLengthChange: (length: number) => void;
  onGlideChange: (glide: boolean) => void;
  onVelocityChange: (velocity: number) => void;
  onProbabilityChange: (probability: number) => void;
  onStepMove: (direction: -1 | 1) => void;
  onPitchMove: (direction: -1 | 1) => void;
  onOctaveMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
}): ReactElement {
  const activeNote = bassNote ?? melodyNote;
  const label = selectedNote ? `${selectedNote.track === "bass" ? "808" : "Synth"} ${selectedNote.pitch}.${selectedNote.step + 1}` : "None";
  const probabilityValue = activeNote ? normalizeEventProbability(activeNote.probability) : 1;
  return (
    <div className="note-inspector">
      <div className="inspector-heading">
        <span>Selected</span>
        <strong>{activeNote ? `${label} / ${percentLabel(probabilityValue)} chance` : "None"}</strong>
      </div>
      {activeNote && (
        <>
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
            {melodyNote && (
              <label>
                <span>Velocity</span>
                <input
                  type="range"
                  min={0.2}
                  max={1}
                  step={0.01}
                  value={melodyNote.velocity}
                  onChange={(event) => onVelocityChange(Number(event.target.value))}
                />
              </label>
            )}
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
    </div>
  );
}

function Device({
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

function SoundDesigner({
  focusPads,
  mode,
  sound,
  onFocusPad,
  onPreset,
  onChange
}: {
  focusPads: SoundFocusPadOption[];
  mode: ProjectState["mode"];
  sound: SoundDesign;
  onFocusPad: (pad: SoundFocusPadId) => void;
  onPreset: (preset: (typeof soundPresetIds)[number]) => void;
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
            className={sound.preset === preset ? "selected" : ""}
            data-testid={`sound-preset-${preset}`}
            key={preset}
            onClick={() => onPreset(preset)}
            type="button"
          >
            {soundPresetLabel(preset)}
          </button>
        ))}
      </div>
      <SoundFocusPads pads={focusPads} onApply={onFocusPad} />
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

function SoundFocusPads({
  pads,
  onApply
}: {
  pads: SoundFocusPadOption[];
  onApply: (pad: SoundFocusPadId) => void;
}): ReactElement {
  return (
    <div className="sound-focus-panel" data-testid="sound-focus-pads">
      <div className="sound-focus-heading">
        <span>Sound Focus</span>
        <strong>Tone posture</strong>
      </div>
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

function SoundControl({
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

function ChordEditor({
  chordPads,
  chordRhythms,
  chordVoicings,
  chords,
  rootOptions,
  selectedIndex,
  onAdd,
  onChange,
  onDelete,
  onDuplicate,
  onInvert,
  onMoveStep,
  onPad,
  onPreset,
  onRhythm,
  onSelect,
  onVoicing
}: {
  chordPads: ChordPadOption[];
  chordRhythms: ChordRhythmOption[];
  chordVoicings: ChordVoicingOption[];
  chords: ChordEvent[];
  rootOptions: string[];
  selectedIndex: number | null;
  onAdd: () => void;
  onChange: (index: number, update: Partial<ChordEvent>) => boolean;
  onDelete: (index: number) => boolean;
  onDuplicate: () => void;
  onInvert: (direction: -1 | 1) => void;
  onMoveStep: (direction: -1 | 1) => void;
  onPad: (pad: ChordPadId) => void;
  onPreset: (preset: ChordProgressionPreset) => void;
  onRhythm: (rhythm: ChordRhythmId) => void;
  onSelect: (index: number) => void;
  onVoicing: (voicing: ChordVoicingId) => void;
}): ReactElement {
  const selectedChord = selectedIndex === null ? undefined : chords[selectedIndex];
  const selectedInversion = selectedChord ? normalizeChordInversion(selectedChord.inversion) : 0;
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
      <div className="chord-edit-row" aria-label="Selected chord edit tools">
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
          <span>Copy</span>
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
      <div className="chord-slots">
        {chords.map((chord, index) => (
          <div
            aria-label={`Chord ${index + 1} ${chord.root}${chord.quality} step ${chord.step + 1}`}
            className={["chord-slot", selectedIndex === index ? "selected" : ""].filter(Boolean).join(" ")}
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
        ))}
      </div>
    </div>
  );
}

function laneColor(lane: DrumLane): string {
  const colors: Record<DrumLane, string> = {
    kick: "#78f0c8",
    clap: "#ff7a4f",
    hat: "#f0c36a",
    perc: "#8aa8ff"
  };
  return colors[lane];
}

function mergePitchLanes(scalePitches: string[], usedPitches: string[]): string[] {
  return Array.from(new Set([...scalePitches, ...usedPitches]));
}

function createKeyboardCaptureKeyMap(pitches: string[]): KeyboardCaptureKeyMapItem[] {
  return keyboardCaptureKeys.map((key, index) => ({
    key,
    pitch: pitches[index] ?? null
  }));
}

function keyboardCapturePitchForKey(key: KeyboardCaptureKey, pitches: string[]): string | null {
  return pitches[keyboardCaptureKeys.indexOf(key)] ?? null;
}

function isKeyboardCaptureKey(key: string): key is KeyboardCaptureKey {
  return (keyboardCaptureKeys as readonly string[]).includes(key);
}

function nextKeyboardCaptureStep(pattern: PatternData, track: NoteTrack, startStep: number): number {
  const notes = track === "bass" ? pattern.bassNotes : pattern.melodyNotes;
  const normalizedStart = normalizeStepModulo(startStep);
  for (let offset = 0; offset < steps.length; offset += 1) {
    const step = (normalizedStart + offset) % steps.length;
    if (!notes.some((note) => note.step === step)) {
      return step;
    }
  }
  return normalizedStart;
}

function addKeyboardCaptureNote(pattern: PatternData, track: NoteTrack, step: number, pitch: string): PatternData {
  if (track === "bass") {
    if (pattern.bassNotes.some((note) => note.step === step && note.pitch === pitch)) {
      return pattern;
    }
    return {
      ...pattern,
      bassNotes: sortBassNotes([
        ...pattern.bassNotes.filter((note) => note.step !== step),
        { step, pitch, length: 2, glide: false, probability: 1 }
      ])
    };
  }

  if (pattern.melodyNotes.some((note) => note.step === step && note.pitch === pitch)) {
    return pattern;
  }
  return {
    ...pattern,
    melodyNotes: sortMelodyNotes([
      ...pattern.melodyNotes,
      { step, pitch, length: 1, velocity: 0.68, probability: 1 }
    ])
  };
}

function createGrooveFeelOptions(): GrooveFeelOption[] {
  return grooveFeelDefinitions.map((feel) => {
    const kickTiming = grooveFeelTimingMs("kick", 6, feel.id);
    const clapTiming = grooveFeelTimingMs("clap", 4, feel.id);
    return {
      ...feel,
      timingPreview: `${timingBadge(kickTiming)} / ${timingBadge(clapTiming)} ms`,
      chancePreview: `${Math.round(feel.musicChance * 100)}% notes`
    };
  });
}

function applyGrooveFeelToPattern(pattern: PatternData, feel: GrooveFeelDefinition): PatternData {
  const nextPatternData = clonePatternData(pattern);
  (Object.keys(drumLabels) as DrumLane[]).forEach((lane) => {
    nextPatternData.drumTimings[lane] = nextPatternData.drumTimings[lane].map((current, step) =>
      nextPatternData.drumPattern[lane][step] ? grooveFeelTimingMs(lane, step, feel.id) : 0
    );
    nextPatternData.drumProbabilities[lane] = nextPatternData.drumProbabilities[lane].map((current, step) =>
      nextPatternData.drumPattern[lane][step] ? grooveFeelDrumProbability(lane, step, feel) : normalizeDrumProbability(current)
    );
  });
  nextPatternData.bassNotes = sortBassNotes(
    nextPatternData.bassNotes.map((note, index) => ({
      ...note,
      probability: grooveFeelMusicProbability("bass", index, feel)
    }))
  );
  nextPatternData.melodyNotes = sortMelodyNotes(
    nextPatternData.melodyNotes.map((note, index) => ({
      ...note,
      probability: grooveFeelMusicProbability("melody", index, feel)
    }))
  );
  nextPatternData.chordEvents = nextPatternData.chordEvents.map((event, index) => ({
    ...event,
    probability: index <= 1 ? normalizeEventProbability(Math.max(feel.chordChance, 0.94)) : normalizeEventProbability(feel.chordChance)
  }));
  return nextPatternData;
}

function grooveFeelTimingMs(lane: DrumLane, step: number, feel: GrooveFeelId): number {
  if (feel === "tight") {
    const timing = lane === "clap" ? 4 : lane === "hat" ? (step % 2 === 0 ? -2 : 3) : lane === "perc" ? (step % 4 === 0 ? -3 : 4) : 0;
    return normalizeDrumTimingMs(timing);
  }
  if (feel === "pocket") {
    const timing = lane === "clap" ? 15 : lane === "hat" ? (step % 2 === 0 ? 5 : 10) : lane === "perc" ? 12 : step % 8 === 0 ? 0 : -4;
    return normalizeDrumTimingMs(timing);
  }
  if (feel === "push") {
    const timing = lane === "clap" ? -6 : lane === "hat" ? (step % 2 === 0 ? -11 : -7) : lane === "perc" ? -9 : step % 8 === 0 ? -3 : -7;
    return normalizeDrumTimingMs(timing);
  }
  const timing = lane === "clap" ? 20 : lane === "hat" ? (step % 2 === 0 ? 9 : 15) : lane === "perc" ? 18 : step % 8 === 0 ? 4 : 10;
  return normalizeDrumTimingMs(timing);
}

function grooveFeelDrumProbability(lane: DrumLane, step: number, feel: GrooveFeelDefinition): number {
  if (lane === "kick" || lane === "clap") {
    return normalizeDrumProbability(feel.id === "lazy" && step % 8 !== 0 ? 0.94 : 1);
  }
  if (lane === "hat") {
    return normalizeDrumProbability(step % 4 === 0 ? Math.max(feel.hatChance, 0.94) : feel.hatChance);
  }
  return normalizeDrumProbability(step % 8 === 0 ? Math.max(feel.percChance, 0.9) : feel.percChance);
}

function grooveFeelMusicProbability(track: NoteTrack, index: number, feel: GrooveFeelDefinition): number {
  if (feel.id === "tight" || feel.id === "push") {
    return normalizeEventProbability(1);
  }
  const accent = track === "bass" ? index % 2 === 0 : index % 3 === 0;
  return normalizeEventProbability(accent ? Math.max(feel.musicChance, 0.94) : feel.musicChance);
}

function sameGrooveFeelState(first: PatternData, second: PatternData): boolean {
  const lanes = Object.keys(drumLabels) as DrumLane[];
  const sameDrums = lanes.every((lane) =>
    first.drumTimings[lane].every(
      (timing, step) =>
        normalizeDrumTimingMs(timing) === normalizeDrumTimingMs(second.drumTimings[lane][step] ?? 0) &&
        normalizeDrumProbability(first.drumProbabilities[lane][step] ?? 1) ===
          normalizeDrumProbability(second.drumProbabilities[lane][step] ?? 1)
    )
  );
  if (!sameDrums) {
    return false;
  }
  return (
    sameNoteProbabilities(first.bassNotes, second.bassNotes) &&
    sameNoteProbabilities(first.melodyNotes, second.melodyNotes) &&
    sameChordProbabilities(first.chordEvents, second.chordEvents)
  );
}

function sameNoteProbabilities(first: Array<BassNote | MelodyNote>, second: Array<BassNote | MelodyNote>): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((note, index) => normalizeEventProbability(note.probability) === normalizeEventProbability(second[index]?.probability ?? 1));
}

function sameChordProbabilities(first: ChordEvent[], second: ChordEvent[]): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((event, index) => normalizeEventProbability(event.probability) === normalizeEventProbability(second[index]?.probability ?? 1));
}

function createDrumAccentOptions(): DrumAccentOption[] {
  return drumAccentDefinitions.map((accent) => {
    const kick = drumAccentVelocity("kick", 0, accent.id);
    const hat = drumAccentVelocity("hat", 2, accent.id);
    return {
      ...accent,
      preview: `K ${Math.round(kick * 100)} / H ${Math.round(hat * 100)}`
    };
  });
}

function applyDrumAccentToPattern(pattern: PatternData, accent: DrumAccentId): PatternData {
  const nextPatternData = clonePatternData(pattern);
  (Object.keys(drumLabels) as DrumLane[]).forEach((lane) => {
    nextPatternData.drumVelocities[lane] = nextPatternData.drumVelocities[lane].map((current, step) =>
      nextPatternData.drumPattern[lane][step] ? drumAccentVelocity(lane, step, accent) : normalizeDrumVelocity(current)
    );
  });
  return nextPatternData;
}

function drumAccentVelocity(lane: DrumLane, step: number, accent: DrumAccentId): number {
  if (accent === "soft") {
    const base = lane === "kick" ? 0.76 : lane === "clap" ? 0.72 : lane === "hat" ? 0.48 : 0.44;
    const motion = step % 4 === 0 ? 0.06 : step % 2 === 0 ? 0.02 : -0.03;
    return normalizeDrumVelocity(base + motion);
  }
  if (accent === "knock") {
    const base = lane === "kick" ? 0.98 : lane === "clap" ? 0.92 : lane === "hat" ? 0.64 : 0.6;
    const anchor = step % 4 === 0 ? 0.05 : step % 2 === 0 ? 0.01 : -0.04;
    return normalizeDrumVelocity(base + anchor);
  }
  if (accent === "ghost") {
    if (lane === "kick" || lane === "clap") {
      return normalizeDrumVelocity((lane === "kick" ? 0.88 : 0.84) + (step % 8 === 0 ? 0.08 : 0));
    }
    const ghostBase = lane === "hat" ? 0.38 : 0.34;
    const ghostLift = step % 4 === 0 ? 0.26 : step % 2 === 0 ? 0.08 : 0;
    return normalizeDrumVelocity(ghostBase + ghostLift);
  }
  const progress = step / 15;
  const base = lane === "kick" ? 0.78 : lane === "clap" ? 0.74 : lane === "hat" ? 0.5 : 0.46;
  const lift = progress * (lane === "hat" || lane === "perc" ? 0.24 : 0.16);
  const pulse = step % 4 === 0 ? 0.08 : step % 2 === 0 ? 0.03 : -0.02;
  return normalizeDrumVelocity(base + lift + pulse);
}

function sameDrumAccentState(first: PatternData, second: PatternData): boolean {
  return (Object.keys(drumLabels) as DrumLane[]).every((lane) =>
    first.drumVelocities[lane].every(
      (velocity, step) => normalizeDrumVelocity(velocity) === normalizeDrumVelocity(second.drumVelocities[lane][step] ?? defaultDrumVelocity(lane, step))
    )
  );
}

function createPatternStackOptions(key: string): PatternStackOption[] {
  return patternStackDefinitions.map((stack) => {
    const events = createPatternStackEvents(key, stack);
    const firstBass = events.bassNotes[0]?.pitch ?? "-";
    const firstChord = events.chordEvents[0]?.root ?? "-";
    return {
      ...stack,
      preview: `${firstBass} / ${firstChord}`,
      bassCount: events.bassNotes.length,
      chordCount: events.chordEvents.length,
      melodyCount: events.melodyNotes.length
    };
  });
}

function createPatternStackEvents(key: string, stack: PatternStackDefinition): PatternStackEvents {
  const bassline = basslinePadDefinitions.find((pad) => pad.id === stack.bassline) ?? basslinePadDefinitions[0];
  const motif = melodyMotifDefinitions.find((candidate) => candidate.id === stack.motif) ?? melodyMotifDefinitions[0];
  return {
    bassNotes: bassline ? createBasslinePadNotes(key, bassline) : [],
    chordEvents: createChordProgressionPreset(stack.chordPreset, key),
    melodyNotes: motif ? createMelodyMotifNotes(key, motif) : []
  };
}

function samePatternStackEvents(pattern: PatternData, events: PatternStackEvents): boolean {
  return (
    sameBassNotes(pattern.bassNotes, events.bassNotes) &&
    sameChordEvents(pattern.chordEvents, events.chordEvents) &&
    sameMelodyNotes(pattern.melodyNotes, events.melodyNotes)
  );
}

function createBasslinePadOptions(key: string): BasslinePadOption[] {
  return basslinePadDefinitions.map((pad) => {
    const notes = createBasslinePadNotes(key, pad);
    return {
      ...pad,
      preview: notes[0]?.pitch ?? "-",
      eventCount: notes.length,
      glideCount: notes.filter((note) => note.glide).length
    };
  });
}

function createBasslinePadNotes(key: string, pad: BasslinePadDefinition): BassNote[] {
  const pitches = bassPitchLanes(key);
  return sortBassNotes(
    pad.steps.map((padStep) => {
      const step = clampStepStart(padStep.step);
      return {
        step,
        pitch: pitches[positiveIndex(padStep.degree, pitches.length)] ?? pitches[0] ?? "C1",
        length: Math.min(clampStepLength(padStep.length), 16 - step),
        glide: padStep.glide,
        probability: normalizeEventProbability(padStep.probability ?? 1)
      };
    })
  );
}

function createBassGlidePadOptions(notes: BassNote[]): BassGlidePadOption[] {
  return bassGlidePadDefinitions.map((pad) => {
    const transformed = applyBassGlidePadToNotes(notes, pad.id);
    const glideCount = transformed.filter((note) => note.glide).length;
    const averageLength =
      transformed.length === 0
        ? 0
        : transformed.reduce((total, note) => total + note.length, 0) / transformed.length;
    return {
      ...pad,
      preview: transformed.length === 0 ? "add 808" : `${averageLength.toFixed(1)} step`,
      glideCount
    };
  });
}

function applyBassGlidePadToNotes(notes: BassNote[], padId: BassGlidePadId): BassNote[] {
  const noteCount = notes.length;
  return sortBassNotes(
    notes.map((note, index) => ({
      ...note,
      length: bassGlidePadLength(note, index, noteCount, padId),
      glide: bassGlidePadEnabled(index, noteCount, padId),
      probability: bassGlidePadProbability(index, noteCount, padId)
    }))
  );
}

function bassGlidePadLength(note: BassNote, index: number, noteCount: number, padId: BassGlidePadId): number {
  const maxLength = Math.max(1, 16 - note.step);
  let targetLength: number;
  if (padId === "clean") {
    targetLength = index % 2 === 0 ? Math.min(note.length, 2) : 1;
  } else if (padId === "bounce") {
    targetLength = index % 4 === 3 ? 3 : index % 2 === 0 ? 2 : 1;
  } else if (padId === "slide") {
    targetLength = index === 0 ? 2 : index % 3 === 0 ? 3 : 2;
  } else {
    targetLength = noteCount <= 2 ? 6 : index % 2 === 0 ? 4 : 3;
  }
  return Math.min(clampStepLength(targetLength), maxLength);
}

function bassGlidePadEnabled(index: number, noteCount: number, padId: BassGlidePadId): boolean {
  if (padId === "bounce") {
    return noteCount > 1 && index % 3 === 1;
  }
  if (padId === "slide") {
    return noteCount > 1 && index > 0;
  }
  return false;
}

function bassGlidePadProbability(index: number, noteCount: number, padId: BassGlidePadId): number {
  if (padId === "bounce") {
    return normalizeEventProbability(index % 2 === 0 ? 1 : 0.93);
  }
  if (padId === "slide") {
    return normalizeEventProbability(index === 0 ? 1 : 0.96);
  }
  if (padId === "hold") {
    return normalizeEventProbability(index === noteCount - 1 ? 0.96 : 1);
  }
  return normalizeEventProbability(1);
}

function sameBassNotes(first: BassNote[], second: BassNote[]): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((note, index) => {
    const candidate = second[index];
    return (
      candidate !== undefined &&
      note.step === candidate.step &&
      note.pitch === candidate.pitch &&
      note.length === candidate.length &&
      note.glide === candidate.glide &&
      normalizeEventProbability(note.probability) === normalizeEventProbability(candidate.probability)
    );
  });
}

function sameChordEvents(first: ChordEvent[], second: ChordEvent[]): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((event, index) => {
    const candidate = second[index];
    return (
      candidate !== undefined &&
      event.step === candidate.step &&
      event.root === candidate.root &&
      event.quality === candidate.quality &&
      normalizeChordInversion(event.inversion) === normalizeChordInversion(candidate.inversion) &&
      event.length === candidate.length &&
      event.velocity === candidate.velocity &&
      normalizeEventProbability(event.probability) === normalizeEventProbability(candidate.probability)
    );
  });
}

function createMelodyMotifOptions(key: string): MelodyMotifOption[] {
  return melodyMotifDefinitions.map((motif) => {
    const notes = createMelodyMotifNotes(key, motif);
    return {
      ...motif,
      preview: notes[0]?.pitch ?? "-",
      eventCount: notes.length
    };
  });
}

function createMelodyMotifNotes(key: string, motif: MelodyMotifDefinition): MelodyNote[] {
  const pitches = melodyPitchLanes(key);
  return sortMelodyNotes(
    motif.steps.map((motifStep) => {
      const step = clampStepStart(motifStep.step);
      return {
        step,
        pitch: pitches[positiveIndex(motifStep.degree, pitches.length)] ?? pitches[0] ?? "C4",
        length: Math.min(clampStepLength(motifStep.length), 16 - step),
        velocity: clampVelocity(motifStep.velocity),
        probability: 1
      };
    })
  );
}

function createMelodyAccentOptions(notes: MelodyNote[]): MelodyAccentOption[] {
  return melodyAccentDefinitions.map((accent) => {
    const transformed = applyMelodyAccentToNotes(notes, accent.id);
    const averageVelocity =
      transformed.length === 0
        ? 0
        : transformed.reduce((total, note) => total + note.velocity, 0) / transformed.length;
    return {
      ...accent,
      preview: transformed.length === 0 ? "add synth" : `${Math.round(averageVelocity * 100)}% vel`,
      chanceCount: transformed.filter((note) => normalizeEventProbability(note.probability) < 1).length
    };
  });
}

function createMelodyContourOptions(key: string, notes: MelodyNote[]): MelodyContourOption[] {
  return melodyContourDefinitions.map((contour) => {
    const transformed = applyMelodyContourToNotes(key, notes, contour.id);
    return {
      ...contour,
      preview: transformed.length === 0 ? "add synth" : `${transformed[0]?.pitch ?? "-"}>${transformed[transformed.length - 1]?.pitch ?? "-"}`,
      pitchSpan: melodyPitchSpanLabel(transformed)
    };
  });
}

function applyMelodyContourToNotes(key: string, notes: MelodyNote[], contourId: MelodyContourId): MelodyNote[] {
  const pitches = melodyPitchLanes(key);
  if (notes.length === 0 || pitches.length === 0) {
    return notes;
  }

  const orderedNotes = sortMelodyNotes(notes);
  const center = Math.floor((pitches.length - 1) / 2);
  return sortMelodyNotes(
    orderedNotes.map((note, index) => {
      const pitchIndex = melodyContourPitchIndex(note, index, orderedNotes.length, pitches, center, contourId);
      const length = melodyContourLength(note, index, contourId);
      return {
        ...note,
        pitch: pitches[pitchIndex] ?? note.pitch,
        length,
        velocity: melodyContourVelocity(index, orderedNotes.length, contourId),
        probability: melodyContourProbability(index, orderedNotes.length, contourId)
      };
    })
  );
}

function melodyContourPitchIndex(
  note: MelodyNote,
  index: number,
  noteCount: number,
  pitches: string[],
  center: number,
  contourId: MelodyContourId
): number {
  const current = Math.max(0, pitches.indexOf(note.pitch));
  if (contourId === "rise") {
    return Math.min(pitches.length - 1, Math.max(0, center - 2 + index));
  }
  if (contourId === "fall") {
    return Math.min(pitches.length - 1, Math.max(0, center + 2 - index));
  }
  if (contourId === "answer") {
    const half = Math.max(1, Math.ceil(noteCount / 2));
    return index < half
      ? Math.min(pitches.length - 1, center + (index % 3))
      : Math.max(0, center - ((index - half) % 3));
  }
  return Math.min(pitches.length - 1, Math.max(0, current === 0 ? center : Math.round((current + center) / 2)));
}

function melodyContourLength(note: MelodyNote, index: number, contourId: MelodyContourId): number {
  const maxLength = Math.max(1, 16 - note.step);
  if (contourId === "anchor") {
    return Math.min(maxLength, Math.max(note.length, index % 2 === 0 ? 2 : 1));
  }
  if (contourId === "answer") {
    return Math.min(maxLength, index % 2 === 0 ? 2 : 1);
  }
  return Math.min(maxLength, Math.max(1, note.length));
}

function melodyContourVelocity(index: number, noteCount: number, contourId: MelodyContourId): number {
  if (contourId === "rise") {
    const progress = noteCount <= 1 ? 1 : index / Math.max(1, noteCount - 1);
    return clampVelocity(0.58 + progress * 0.24);
  }
  if (contourId === "fall") {
    const progress = noteCount <= 1 ? 0 : index / Math.max(1, noteCount - 1);
    return clampVelocity(0.8 - progress * 0.2);
  }
  if (contourId === "answer") {
    return clampVelocity(index % 2 === 0 ? 0.76 : 0.62);
  }
  return clampVelocity(index % 3 === 0 ? 0.78 : 0.64);
}

function melodyContourProbability(index: number, noteCount: number, contourId: MelodyContourId): number {
  if (contourId === "answer") {
    return normalizeEventProbability(index >= Math.ceil(noteCount / 2) ? 0.94 : 1);
  }
  if (contourId === "anchor") {
    return normalizeEventProbability(index % 4 === 3 ? 0.92 : 1);
  }
  return normalizeEventProbability(1);
}

function melodyPitchSpanLabel(notes: MelodyNote[]): string {
  if (notes.length === 0) {
    return "0 notes";
  }
  const uniquePitches = new Set(notes.map((note) => note.pitch));
  return `${uniquePitches.size} pitches`;
}

function applyMelodyAccentToNotes(notes: MelodyNote[], accentId: MelodyAccentId): MelodyNote[] {
  const noteCount = notes.length;
  return sortMelodyNotes(
    notes.map((note, index) => ({
      ...note,
      velocity: melodyAccentVelocity(index, noteCount, accentId),
      probability: melodyAccentProbability(index, noteCount, accentId)
    }))
  );
}

function melodyAccentVelocity(index: number, noteCount: number, accentId: MelodyAccentId): number {
  if (accentId === "soft") {
    return clampVelocity(index % 2 === 0 ? 0.58 : 0.54);
  }
  if (accentId === "lead") {
    return clampVelocity(index % 4 === 0 ? 0.86 : index % 2 === 0 ? 0.76 : 0.68);
  }
  if (accentId === "pulse") {
    return clampVelocity(index % 2 === 0 ? 0.82 : 0.54);
  }
  if (noteCount <= 1) {
    return clampVelocity(0.72);
  }
  const progress = index / Math.max(1, noteCount - 1);
  return clampVelocity(0.84 - progress * 0.28);
}

function melodyAccentProbability(index: number, noteCount: number, accentId: MelodyAccentId): number {
  if (accentId === "pulse") {
    return normalizeEventProbability(index % 2 === 0 ? 1 : 0.94);
  }
  if (accentId === "fade") {
    return normalizeEventProbability(index >= Math.max(0, noteCount - 2) ? 0.96 : 1);
  }
  return normalizeEventProbability(1);
}

function sameMelodyNotes(first: MelodyNote[], second: MelodyNote[]): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((note, index) => {
    const candidate = second[index];
    return (
      candidate !== undefined &&
      note.step === candidate.step &&
      note.pitch === candidate.pitch &&
      note.length === candidate.length &&
      note.velocity === candidate.velocity &&
      normalizeEventProbability(note.probability) === normalizeEventProbability(candidate.probability)
    );
  });
}

function mergeChordRoots(scaleRoots: string[], usedRoots: string[]): string[] {
  return Array.from(new Set([...scaleRoots, ...usedRoots]));
}

function createChordPadOptions(key: string, selectedChord?: ChordEvent): ChordPadOption[] {
  const roots = scalePitchNames(key);
  return chordPadDefinitions.map((pad) => {
    const root = roots[positiveIndex(pad.degree, roots.length)] ?? roots[0] ?? "C";
    const quality = pad.quality ?? chordPadQualityFromDegree(key, pad.degree);
    const selected =
      selectedChord !== undefined &&
      selectedChord.root === root &&
      selectedChord.quality === quality &&
      normalizeChordInversion(selectedChord.inversion) === pad.inversion;
    return {
      ...pad,
      root,
      quality,
      selected
    };
  });
}

function createChordRhythmOptions(chords: ChordEvent[]): ChordRhythmOption[] {
  return chordRhythmDefinitions.map((rhythm) => {
    const transformed = applyChordRhythmToEvents(chords, rhythm.id);
    const averageLength =
      transformed.length === 0
        ? 0
        : transformed.reduce((total, chord) => total + chord.length, 0) / transformed.length;
    return {
      ...rhythm,
      preview: transformed.length === 0 ? "add chords" : `${Math.round(averageLength)} step`,
      chanceCount: transformed.filter((chord) => normalizeEventProbability(chord.probability) < 1).length
    };
  });
}

function createChordVoicingOptions(selectedChord?: ChordEvent): ChordVoicingOption[] {
  return chordVoicingDefinitions.map((definition) => {
    if (!selectedChord) {
      return {
        ...definition,
        quality: definition.quality ?? "maj",
        preview: "Select chord",
        selected: false
      };
    }

    const update = chordVoicingUpdate(selectedChord, definition);
    const nextChord = chordEventWithUpdate(selectedChord, update);
    return {
      ...definition,
      quality: nextChord.quality,
      inversion: nextChord.inversion,
      length: nextChord.length,
      velocity: nextChord.velocity,
      probability: nextChord.probability,
      preview: `${nextChord.quality} ${chordInversionLabel(nextChord.inversion)} / ${nextChord.length} step`,
      selected: sameChordEvent(selectedChord, nextChord)
    };
  });
}

function chordVoicingUpdate(
  chord: ChordEvent,
  definition: ChordVoicingDefinition
): Pick<ChordEvent, "quality" | "inversion" | "length" | "velocity" | "probability"> {
  return {
    quality: definition.quality ?? chord.quality,
    inversion: definition.inversion,
    length: Math.min(definition.length, Math.max(1, 16 - chord.step)),
    velocity: definition.velocity,
    probability: definition.probability
  };
}

function applyChordRhythmToEvents(chords: ChordEvent[], rhythmId: ChordRhythmId): ChordEvent[] {
  const chordCount = chords.length;
  return sortChordEvents(
    chords.map((chord, index) => ({
      ...chord,
      length: chordRhythmLength(chord, index, rhythmId),
      velocity: chordRhythmVelocity(index, chordCount, rhythmId),
      probability: chordRhythmProbability(index, chordCount, rhythmId)
    }))
  );
}

function chordRhythmLength(chord: ChordEvent, index: number, rhythmId: ChordRhythmId): number {
  const maxLength = Math.max(1, 16 - chord.step);
  if (rhythmId === "held") {
    return Math.min(maxLength, Math.max(chord.length, 4));
  }
  if (rhythmId === "pulse") {
    return Math.min(maxLength, index % 2 === 0 ? 3 : 2);
  }
  if (rhythmId === "stab") {
    return Math.min(maxLength, 1);
  }
  return Math.min(maxLength, index % 2 === 0 ? 2 : 1);
}

function chordRhythmVelocity(index: number, chordCount: number, rhythmId: ChordRhythmId): number {
  if (rhythmId === "held") {
    return clampVelocity(0.58);
  }
  if (rhythmId === "pulse") {
    return clampVelocity(index % 2 === 0 ? 0.68 : 0.5);
  }
  if (rhythmId === "stab") {
    return clampVelocity(index % 4 === 0 ? 0.76 : 0.62);
  }
  if (chordCount <= 1) {
    return clampVelocity(0.42);
  }
  const progress = index / Math.max(1, chordCount - 1);
  return clampVelocity(0.54 - progress * 0.16);
}

function chordRhythmProbability(index: number, chordCount: number, rhythmId: ChordRhythmId): number {
  if (rhythmId === "pulse") {
    return normalizeEventProbability(index % 2 === 0 ? 1 : 0.94);
  }
  if (rhythmId === "ghost") {
    return normalizeEventProbability(index >= Math.max(0, chordCount - 2) ? 0.9 : 0.96);
  }
  return normalizeEventProbability(1);
}

function chordPadQualityFromDegree(key: string, degree: number): ChordQuality {
  const [, mode = "minor"] = key.split(" ");
  const majorQualities: ChordQuality[] = ["maj", "min", "min", "maj", "maj", "min", "dim"];
  const dorianQualities: ChordQuality[] = ["min", "min", "maj", "maj", "min", "dim", "maj"];
  const minorQualities: ChordQuality[] = ["min", "dim", "maj", "min", "min", "maj", "maj"];
  const qualities = mode === "major" ? majorQualities : mode === "dorian" ? dorianQualities : minorQualities;
  return qualities[positiveIndex(degree, qualities.length)] ?? "min";
}

function positiveIndex(value: number, length: number): number {
  if (length <= 0) {
    return 0;
  }
  return ((value % length) + length) % length;
}

function chordEventWithUpdate(event: ChordEvent, update: Partial<ChordEvent>): ChordEvent {
  const step = update.step === undefined ? event.step : clampStepStart(update.step);
  const length = Math.min(update.length === undefined ? event.length : clampStepLength(update.length), 16 - step);
  return {
    ...event,
    ...update,
    step,
    length,
    inversion: update.inversion === undefined ? event.inversion : normalizeChordInversion(update.inversion),
    velocity: update.velocity === undefined ? event.velocity : clampVelocity(update.velocity),
    probability: update.probability === undefined ? event.probability : normalizeEventProbability(update.probability)
  };
}

function sameChordEvent(first: ChordEvent, second: ChordEvent): boolean {
  return (
    first.step === second.step &&
    first.root === second.root &&
    first.quality === second.quality &&
    normalizeChordInversion(first.inversion) === normalizeChordInversion(second.inversion) &&
    first.length === second.length &&
    first.velocity === second.velocity &&
    normalizeEventProbability(first.probability) === normalizeEventProbability(second.probability)
  );
}

function findChordEventIndex(chords: ChordEvent[], target: ChordEvent): number | null {
  const index = chords.findIndex((chord) => sameChordEvent(chord, target));
  return index < 0 ? null : index;
}

function nextEmptyChordStep(chords: ChordEvent[], startStep: number): number | null {
  for (let offset = 1; offset < steps.length; offset += 1) {
    const step = (startStep + offset) % steps.length;
    if (!chords.some((chord) => chord.step === step)) {
      return step;
    }
  }
  return null;
}

function matchesSelectedNote(note: BassNote | MelodyNote, selectedNote: SelectedNote): boolean {
  return note.step === selectedNote.step && note.pitch === selectedNote.pitch;
}

function nextEmptyStepForPitch(notes: Array<BassNote | MelodyNote>, pitch: string, startStep: number): number | null {
  for (let offset = 1; offset < steps.length; offset += 1) {
    const step = (startStep + offset) % steps.length;
    if (!notes.some((note) => note.step === step && note.pitch === pitch)) {
      return step;
    }
  }
  return null;
}

function adjacentTrackPitch(
  track: NoteTrack,
  key: string,
  pitch: string,
  direction: -1 | 1,
  usedPitches: string[]
): string | null {
  const pitches = trackScalePitches(track, key, usedPitches);
  const index = pitches.indexOf(pitch);
  if (index < 0) {
    return null;
  }
  return pitches[index + direction] ?? null;
}

function octaveShiftPitch(track: NoteTrack, pitch: string, direction: -1 | 1): string | null {
  const parts = pitchParts(pitch);
  if (!parts) {
    return null;
  }
  const [minOctave, maxOctave] = trackOctaveRange(track);
  const octave = parts.octave + direction;
  if (octave < minOctave || octave > maxOctave) {
    return null;
  }
  return `${parts.name}${octave}`;
}

function trackScalePitches(track: NoteTrack, key: string, usedPitches: string[]): string[] {
  const [minOctave, maxOctave] = trackOctaveRange(track);
  const pitches: string[] = [];
  for (let octave = minOctave; octave <= maxOctave; octave += 1) {
    pitches.push(...scalePitches(key, octave).slice(0, -1));
  }
  return Array.from(new Set([...pitches, ...usedPitches])).sort((first, second) => pitchMidi(first) - pitchMidi(second));
}

function trackOctaveRange(track: NoteTrack): [number, number] {
  return track === "bass" ? [0, 3] : [3, 6];
}

function pitchParts(pitch: string): { name: string; octave: number } | null {
  const match = /^([A-G](?:#|b)?)(-?\d+)$/.exec(pitch);
  if (!match) {
    return null;
  }
  return { name: match[1], octave: Number(match[2]) };
}

function pitchMidi(pitch: string): number {
  const parts = pitchParts(pitch);
  if (!parts) {
    return 0;
  }
  const semitones: Record<string, number> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11
  };
  return (parts.octave + 1) * 12 + (semitones[parts.name] ?? 0);
}

function patternEventCount(pattern: PatternData): string {
  const drumHits = Object.values(pattern.drumPattern).reduce(
    (total, laneSteps) => total + laneSteps.filter(Boolean).length,
    0
  );
  const repeatedHats = pattern.drumPattern.hat.reduce(
    (total, enabled, step) => total + (enabled ? hatRepeatCount(pattern, step) - 1 : 0),
    0
  );
  return `${drumHits + repeatedHats + pattern.bassNotes.length + pattern.melodyNotes.length + pattern.chordEvents.length} events`;
}

function patternChainReadout(arrangement: ArrangementBlock[]): string {
  return arrangement.map((block) => block.pattern).join("-");
}

function nextPatternSlot(pattern: PatternSlot): PatternSlot {
  const index = patternSlots.indexOf(pattern);
  return patternSlots[(index + 1) % patternSlots.length] ?? "A";
}

function barCountLabel(bars: number): string {
  return `${bars} ${bars === 1 ? "bar" : "bars"}`;
}

function panLabel(pan: number): string {
  if (pan === 0) {
    return "C";
  }
  return pan < 0 ? `L ${Math.abs(pan)}` : `R ${pan}`;
}

function percentLabel(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function signedPercentLabel(value: number): string {
  const percent = Math.round(value * 100);
  return `${percent >= 0 ? "+" : ""}${percent}%`;
}

function chanceBadgeLabel(value: number): string {
  return percentLabel(normalizeEventProbability(value));
}

function compactChanceBadgeLabel(value: number): string {
  return `${Math.round(normalizeEventProbability(value) * 100)}`;
}

function timingLabel(value: number): string {
  const timing = normalizeDrumTimingMs(value);
  if (timing === 0) {
    return "On grid";
  }
  return timing > 0 ? `Late +${timing} ms` : `Early ${timing} ms`;
}

function timingBadge(value: number): string {
  const timing = normalizeDrumTimingMs(value);
  return timing > 0 ? `+${timing}` : `${timing}`;
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return "0.00%";
  }
  return `${value.toFixed(2)}%`;
}

function formatDb(value: number): string {
  if (!Number.isFinite(value)) {
    return "-inf dB";
  }
  return `${value.toFixed(1)} dB`;
}

function createHandoffSheet(
  project: ProjectState,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): string {
  const styleName = styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const patternUsage = usedPatternSlots(project).join("/") || project.selectedPattern;
  const brief = project.sessionBrief;
  const arrangementLines = project.arrangement.map(
    (block, index) =>
      `${index + 1}. ${block.section} / Pattern ${block.pattern} / ${barCountLabel(block.bars)} / Energy ${percentLabel(block.energy)} / Muted ${block.mutedTracks.length === 0 ? "None" : block.mutedTracks.map(arrangementMuteTrackLabel).join(", ")}`
  );
  const stemLines = stemTrackIds.map((track) => {
    const stem = stemAnalyses[track];
    const audible = Number.isFinite(stem.rmsDb);
    return `${stemTrackLabel(track)}: ${audible ? "Audible" : "Silent"} / Peak ${formatDb(stem.peakDb)} / RMS ${formatDb(stem.rmsDb)} / Headroom ${formatDb(stem.headroomDb)}`;
  });
  const sections = [
    "GrooveForge Handoff Sheet",
    "",
    "Project",
    `Title: ${project.title}`,
    `Style: ${styleName}`,
    `BPM: ${project.bpm}`,
    `Key: ${project.key}`,
    `Selected Pattern: ${project.selectedPattern}`,
    `Arrangement: ${barCountLabel(bars)} / Pattern ${patternUsage}`,
    "",
    "Delivery Target",
    `Name: ${target.name}`,
    `Focus: ${target.focus}`,
    `Target Length: ${barCountLabel(target.targetBars)}`,
    `Target Stems: ${target.stemGoal}`,
    `Master Preset: ${project.masterPreset}`,
    `Master Ceiling: ${formatDb(project.masterCeilingDb)}`,
    "",
    "Session Brief",
    `Artist: ${handoffValue(brief.artist)}`,
    `Vibe: ${handoffValue(brief.vibe)}`,
    `Reference: ${handoffValue(brief.reference)}`,
    `Notes: ${handoffValue(brief.notes)}`,
    "",
    "Arrangement Blocks",
    ...arrangementLines,
    "",
    "Export Meter",
    `Status: ${analysis.status}`,
    `Duration: ${analysis.durationSeconds.toFixed(2)} sec`,
    `Peak: ${formatDb(analysis.peakDb)}`,
    `RMS: ${formatDb(analysis.rmsDb)}`,
    `Headroom: ${formatDb(analysis.headroomDb)}`,
    `Limiter Activity: ${formatPercent(analysis.limitedPercent)}`,
    "",
    "Stem Meter",
    ...stemLines,
    "",
    "Notes",
    "Peak, RMS, headroom, and limiter activity are local render checks, not platform-compliance, true-peak, LUFS, publishing, or mastering guarantees.",
    "This sheet is generated from local project data and does not include audio media."
  ];

  return `${sections.join("\n")}\n`;
}

function handoffValue(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "Not set";
}

function handoffSheetFileName(project: ProjectState): string {
  return `${projectFileName(project).replace(/\.grooveforge\.json$/, "") || "grooveforge-project"}-handoff.txt`;
}

function meterPercent(valueDb: number, ceilingDb: number): number {
  if (!Number.isFinite(valueDb)) {
    return 0;
  }
  const floorDb = -48;
  const clamped = Math.min(ceilingDb, Math.max(floorDb, valueDb));
  return Math.round(((clamped - floorDb) / (ceilingDb - floorDb)) * 100);
}

function clampMasterCeilingDb(value: number): number {
  if (!Number.isFinite(value)) {
    return -1;
  }
  return Math.min(0, Math.max(-6, Math.round(value * 10) / 10));
}

function clampSplitAfterBars(value: number, blockBars: number): number {
  const bars = normalizeArrangementBars(blockBars);
  const maxSplit = Math.max(1, bars - 1);
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(maxSplit, Math.max(1, Math.round(value)));
}

function clampUnit(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0.5;
  }
  return Math.min(1, Math.max(0, value));
}

function clampPan(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(-100, Math.round(value)));
}

function clampStepLength(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(16, Math.max(1, Math.round(value)));
}

function clampVelocity(value: number): number {
  if (!Number.isFinite(value)) {
    return 0.5;
  }
  return Math.min(1, Math.max(0, value));
}

function sortBassNotes(notes: BassNote[]): BassNote[] {
  return [...notes].sort((first, second) => first.step - second.step || first.pitch.localeCompare(second.pitch));
}

function sortMelodyNotes(notes: MelodyNote[]): MelodyNote[] {
  return [...notes].sort((first, second) => first.step - second.step || first.pitch.localeCompare(second.pitch));
}

function sortChordEvents(events: ChordEvent[]): ChordEvent[] {
  return [...events].sort((first, second) => first.step - second.step || first.root.localeCompare(second.root));
}

function clampStepStart(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(15, Math.max(0, Math.round(value)));
}

function normalizeStepModulo(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const rounded = Math.round(value);
  return ((rounded % steps.length) + steps.length) % steps.length;
}

function appendHistory(history: ProjectState[], project: ProjectState): ProjectState[] {
  return [...history, project].slice(-historyLimit);
}

function prependFuture(history: ProjectState[], project: ProjectState): ProjectState[] {
  return [project, ...history].slice(0, historyLimit);
}

function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
}

function downloadProjectFile(contents: string, fileName: string): void {
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadTextFile(contents: string, fileName: string): void {
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function fileDisplayName(filePath?: string): string {
  if (!filePath) {
    return "project file";
  }
  return filePath.split(/[\\/]/).pop() || "project file";
}
