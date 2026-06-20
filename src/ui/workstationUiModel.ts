import type {
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
  DrumLane,
  DrumGroovePreset,
  MelodyNote,
  MasterAutomationPresetId,
  MasterPreset,
  MixerChannel,
  MixPosture,
  NoteTrack,
  PatternData,
  PatternChainId,
  PatternFillPreset,
  PatternSlot,
  PatternVariationPreset,
  ProjectSnapshot,
  ProjectState,
  SessionBrief,
  SoundDesign,
  StyleId,
  StyleProfile
} from "../domain/workstation";
import { soundPresetIds } from "../domain/workstation";
import type { ExportAnalysis, StemExportAnalyses, StemTrackId } from "../audio/render";
import { stemTrackIds } from "../audio/render";

export const drumLabels: Record<DrumLane, string> = {
  kick: "Kick",
  clap: "Clap",
  hat: "Hat",
  perc: "Perc"
};

export const localDraftStorageKey = "grooveforge.localDraft.v1";
export const localDraftRecordVersion = 1;
export const localDraftMaxCharacters = 1_500_000;
export const minProjectBpm = 60;
export const maxProjectBpm = 220;
export const tapTempoWindowMs = 2500;
export const tapTempoMaxTaps = 6;
export const tapTempoCommitDelayMs = 650;
export const tempoNudgePads: TempoNudgePadDefinition[] = [
  { id: "down", label: "-1", title: "Lower tempo by 1 BPM" },
  { id: "up", label: "+1", title: "Raise tempo by 1 BPM" },
  { id: "half", label: "1/2", title: "Set half-time BPM" },
  { id: "double", label: "x2", title: "Set double-time BPM" }
];

export const swingFeelPads: SwingFeelPadDefinition[] = [
  { id: "straight", label: "Straight", detail: "grid feel", value: 0 },
  { id: "tight", label: "Tight", detail: "small push", value: 0.06 },
  { id: "laid", label: "Laid", detail: "back pocket", value: 0.12 },
  { id: "loose", label: "Loose", detail: "wide shuffle", value: 0.18 },
  { id: "style", label: "Style", detail: "profile default", value: "style" }
];

export const mixPostureOptions: { id: MixPosture; label: string }[] = [
  { id: "loose", label: "Loose sketch" },
  { id: "vocal_headroom", label: "Vocal headroom" },
  { id: "balanced", label: "Balanced" },
  { id: "club_forward", label: "Club forward" }
];

export const mixBalancePadDefinitions: MixBalancePadDefinition[] = [
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

export const spaceFxPadDefinitions: SpaceFxPadDefinition[] = [
  {
    id: "dry",
    label: "Dry",
    detail: "front",
    sends: { drum_rack: 0.04, bass_808: 0.01, synth: 0.08, chord: 0.1 }
  },
  {
    id: "room",
    label: "Room",
    detail: "glue",
    sends: { drum_rack: 0.1, bass_808: 0.02, synth: 0.18, chord: 0.22 }
  },
  {
    id: "wide",
    label: "Wide",
    detail: "hook",
    sends: { drum_rack: 0.12, bass_808: 0.03, synth: 0.34, chord: 0.38 }
  },
  {
    id: "wash",
    label: "Wash",
    detail: "ambient",
    sends: { drum_rack: 0.22, bass_808: 0.06, synth: 0.48, chord: 0.52 }
  }
];

export const stemAuditionPadDefinitions: StemAuditionPadDefinition[] = [
  { id: "full", label: "Full", detail: "all stems", trackId: null },
  { id: "drum_rack", label: "Drums", detail: "rhythm", trackId: "drum_rack" },
  { id: "bass_808", label: "808", detail: "low end", trackId: "bass_808" },
  { id: "synth", label: "Synth", detail: "lead", trackId: "synth" },
  { id: "chord", label: "Chords", detail: "harmony", trackId: "chord" }
];

export const soundFocusPadDefinitions: SoundFocusPadDefinition[] = [
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

export const drumKitPadDefinitions: DrumKitPadDefinition[] = [
  {
    id: "clean",
    label: "Clean",
    detail: "balanced",
    sound: { kickPunch: 0.58, snareSnap: 0.58, hatBrightness: 0.64 },
    mixer: { volumeDb: -5, lowCut: 0.08, air: 0.22, drive: 0.08, glue: 0.18, send: 0.08 }
  },
  {
    id: "knock",
    label: "Knock",
    detail: "front",
    sound: { kickPunch: 0.9, snareSnap: 0.78, hatBrightness: 0.58 },
    mixer: { volumeDb: -3.8, lowCut: 0.06, air: 0.22, drive: 0.22, glue: 0.34, send: 0.06 }
  },
  {
    id: "dust",
    label: "Dust",
    detail: "warm",
    sound: { kickPunch: 0.52, snareSnap: 0.44, hatBrightness: 0.34 },
    mixer: { volumeDb: -5.6, lowCut: 0.14, air: 0.08, drive: 0.2, glue: 0.3, send: 0.18 }
  },
  {
    id: "air",
    label: "Air",
    detail: "bright",
    sound: { kickPunch: 0.46, snareSnap: 0.64, hatBrightness: 0.9 },
    mixer: { volumeDb: -5.2, lowCut: 0.1, air: 0.42, drive: 0.1, glue: 0.16, send: 0.22 }
  }
];

export const masterFinishPadDefinitions: MasterFinishPadDefinition[] = [
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

export const masterAutomationPadDefinitions: MasterAutomationPadDefinition[] = [
  {
    id: "none",
    label: "None",
    detail: "manual level",
    description: "No master fade automation is applied."
  },
  {
    id: "fade_in",
    label: "Fade In",
    detail: "first bar",
    description: "Ramp the master from silence into the first bar."
  },
  {
    id: "fade_out",
    label: "Fade Out",
    detail: "last bar",
    description: "Ramp the master down across the final bar."
  },
  {
    id: "intro_outro",
    label: "Intro/Outro",
    detail: "first + last",
    description: "Fade in over bar one and fade out over the final bar."
  }
];

export const keys = ["F minor", "A minor", "C minor", "D minor", "E minor", "G minor", "C major", "D dorian"];
export const historyLimit = 50;
export const keyboardCaptureKeys = ["a", "s", "d", "f", "g", "h", "j", "k"] as const;
export type KeyboardCaptureKey = (typeof keyboardCaptureKeys)[number];
export const keyboardCaptureStepModes = ["next-free", "replace-selected"] as const;
export type KeyboardCaptureStepMode = (typeof keyboardCaptureStepModes)[number];

export const keyboardCaptureKeyLabels: Record<KeyboardCaptureKey, string> = {
  a: "A",
  s: "S",
  d: "D",
  f: "F",
  g: "G",
  h: "H",
  j: "J",
  k: "K"
};

export function isStemTrackId(track: MixerChannel["id"]): track is StemTrackId {
  return (stemTrackIds as readonly string[]).includes(track);
}

export type SelectedNote = {
  track: NoteTrack;
  step: number;
  pitch: string;
};

export type NoteClipboard =
  | {
      track: "bass";
      note: BassNote;
    }
  | {
      track: "melody";
      note: MelodyNote;
    };

export type MixCoachTone = "good" | "warn" | "danger";

export type BeatBlueprintPreviewMetricId = "style" | "key" | "tempo" | "arrangement" | "sound" | "master";

export type BeatBlueprintPreviewMetric = {
  id: BeatBlueprintPreviewMetricId;
  label: string;
  value: string;
  detail: string;
  status: "Keep" | "Change";
  tone: MixCoachTone;
};

export type BeatBlueprintPreviewSummary = {
  blueprintId: BeatBlueprintId;
  name: string;
  focus: string;
  statusLabel: string;
  detailLabel: string;
  applyLabel: string;
  tone: MixCoachTone;
  metrics: BeatBlueprintPreviewMetric[];
};

export type BeatBlueprintResultMetric = {
  id: BeatBlueprintPreviewMetricId;
  label: string;
  before: string;
  after: string;
  changed: boolean;
  tone: MixCoachTone;
};

export type BeatBlueprintResult = {
  blueprintId: BeatBlueprintId;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: BeatBlueprintResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type DeliveryTargetAlignmentPreviewSummary = {
  targetId: DeliveryTargetId;
  statusLabel: string;
  targetLabel: string;
  lengthLabel: string;
  masterLabel: string;
  mixLabel: string;
  stemLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type DeliveryTargetAlignmentResultMetric = {
  id: "target" | "length" | "master" | "mix" | "stems";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type DeliveryTargetAlignmentResult = {
  targetId: DeliveryTargetId;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: DeliveryTargetAlignmentResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export const beatBlueprintPreviewMetricTestIds: Record<BeatBlueprintPreviewMetricId, string> = {
  style: "beat-blueprint-preview-style",
  key: "beat-blueprint-preview-key",
  tempo: "beat-blueprint-preview-tempo",
  arrangement: "beat-blueprint-preview-arrangement",
  sound: "beat-blueprint-preview-sound",
  master: "beat-blueprint-preview-master"
};

export type LocalDraftRecovery = {
  savedAt: string;
  project: ProjectState;
  characterCount: number;
};

export type LocalDraftRecoveryResultAction = "restore" | "clear";

export type LocalDraftRecoveryResult = {
  action: LocalDraftRecoveryResultAction;
  targetId: string;
  status: "Restored" | "Cleared";
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  safetyCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type MixCoachCheck = {
  id: string;
  label: string;
  status: string;
  detail: string;
  tone: MixCoachTone;
};

export type MixCoachFocusSummary = {
  checkId: string | null;
  roleLabel: string;
  statusLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type MixCoachFocusResult = {
  checkId: string;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type MixFixPreset = "headroom" | "stem_balance" | "low_end";

export type MixFixAction = {
  preset: MixFixPreset;
  label: string;
  detail: string;
  tone: MixCoachTone;
};

export type MixFixPreviewSummary = {
  fixId: MixFixPreset | "none";
  statusLabel: string;
  fixLabel: string;
  scopeLabel: string;
  detailLabel: string;
  changeLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type MixFixResultMetric = {
  id: "export" | "headroom" | "stems" | "lowEnd" | "controls";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type MixFixResult = {
  fixId: MixFixPreset;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: MixFixResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type MixSnapshotSlotId = "A" | "B";

export type MixSnapshotQuickActionTarget = {
  id: "capture-a" | "capture-b" | "recall-a" | "recall-b" | "clear";
  label: string;
  metricId: string;
};

export type DirectExportQuickActionTarget = {
  id: "wav" | "stems" | "midi" | "sheet";
  label: string;
  metricId: string;
};

export type MixSnapshotSlotMap = Record<MixSnapshotSlotId, MixSnapshot | null>;

export type MixSnapshot = {
  slot: MixSnapshotSlotId;
  capturedAtLabel: string;
  projectTitle: string;
  statusLabel: string;
  exportLabel: string;
  headroomDb: number;
  limitedPercent: number;
  peakDb: number;
  rmsDb: number;
  balanceSpreadDb: number | null;
  balanceLabel: string;
  masterLabel: string;
  stemLabel: string;
  audibleStemCount: number;
  score: number;
  mixer: MixerChannel[];
  masterPreset: MasterPreset;
  masterCeilingDb: number;
  tone: MixCoachTone;
};

export type MixSnapshotMetricId = "headroom" | "balance" | "master" | "stems";

export type MixSnapshotComparisonMetric = {
  id: MixSnapshotMetricId;
  label: string;
  aLabel: string;
  bLabel: string;
  tone: MixCoachTone;
};

export type MixSnapshotDecisionActionId = "capture-a" | "capture-b" | "recall-a" | "recall-b";

export type MixSnapshotComparisonSummary = {
  statusLabel: string;
  winnerLabel: string;
  detailLabel: string;
  detailTitle: string;
  decisionStatus: string;
  decisionLabel: string;
  decisionDetail: string;
  decisionTitle: string;
  decisionActionId: MixSnapshotDecisionActionId;
  decisionActionLabel: string;
  tone: MixCoachTone;
  metrics: MixSnapshotComparisonMetric[];
};

export type MixBalancePadId = "clean" | "vocal" | "club" | "wide";

export type MixBalanceChannelUpdate = Partial<
  Pick<MixerChannel, "volumeDb" | "pan" | "lowCut" | "air" | "drive" | "glue" | "send">
>;

export type MixBalancePadDefinition = {
  id: MixBalancePadId;
  label: string;
  detail: string;
  channels: Partial<Record<MixerChannel["id"], MixBalanceChannelUpdate>>;
};

export type MixBalancePadOption = MixBalancePadDefinition & {
  preview: string;
  changedCount: number;
};

export type MixBalancePreviewSummary = {
  padId: MixBalancePadId;
  changedChannels: number;
  changedControls: number;
  statusLabel: string;
  padLabel: string;
  channelLabel: string;
  auditionLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type MixBalancePreviewDecisionSummary = {
  padId: MixBalancePadId;
  actionId: "apply-suggested" | "aligned";
  statusLabel: string;
  padLabel: string;
  metricLabel: string;
  detailLabel: string;
  actionLabel: string;
  disabled: boolean;
  detailTitle: string;
  tone: MixCoachTone;
};

export type MixBalanceResultMetric = {
  id: "drums" | "bass" | "synth" | "chords" | "audition";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type MixBalanceResult = {
  padId: MixBalancePadId;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: MixBalanceResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type SpaceFxPadId = "dry" | "room" | "wide" | "wash";

export type SpaceFxPadDefinition = {
  id: SpaceFxPadId;
  label: string;
  detail: string;
  sends: Record<StemTrackId, number>;
};

export type SpaceFxPadOption = SpaceFxPadDefinition & {
  preview: string;
  changedCount: number;
};

export type SpaceFxPreviewSummary = {
  padId: SpaceFxPadId;
  changedSends: number;
  statusLabel: string;
  padLabel: string;
  sendLabel: string;
  focusLabel: string;
  changeLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type SpaceFxPreviewDecisionSummary = {
  padId: SpaceFxPadId;
  actionId: "apply-suggested" | "aligned";
  statusLabel: string;
  padLabel: string;
  metricLabel: string;
  detailLabel: string;
  actionLabel: string;
  disabled: boolean;
  detailTitle: string;
  tone: MixCoachTone;
};

export type SpaceFxResultMetric = {
  id: "drums" | "bass" | "synth" | "chords";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type SpaceFxResult = {
  padId: SpaceFxPadId;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: SpaceFxResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type StemAuditionPadId = "full" | StemTrackId;

export type StemAuditionPadDefinition = {
  id: StemAuditionPadId;
  label: string;
  detail: string;
  trackId: StemTrackId | null;
};

export type StemAuditionPadOption = StemAuditionPadDefinition & {
  active: boolean;
  preview: string;
  changedCount: number;
};

export type SoundFocusPadId = "punch" | "warm" | "air" | "space";

export type SoundFocusParameter = Exclude<keyof SoundDesign, "preset">;

export type SoundFocusPadDefinition = {
  id: SoundFocusPadId;
  label: string;
  detail: string;
  values: Partial<Record<SoundFocusParameter, number>>;
};

export type SoundFocusPadOption = SoundFocusPadDefinition & {
  preview: string;
  changedCount: number;
};

export type SoundFocusPreviewSummary = {
  padId: SoundFocusPadId;
  changedMoves: number;
  statusLabel: string;
  padLabel: string;
  focusLabel: string;
  parameterLabel: string;
  changeLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type SoundFocusPreviewDecisionSummary = {
  padId: SoundFocusPadId;
  actionId: "apply-suggested" | "aligned";
  statusLabel: string;
  padLabel: string;
  metricLabel: string;
  detailLabel: string;
  actionLabel: string;
  disabled: boolean;
  detailTitle: string;
  tone: MixCoachTone;
};

export type SoundFocusResultMetric = {
  id: "preset" | "drums" | "bass" | "duck" | "synth" | "chords";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type SoundFocusResult = {
  moveId: string;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: SoundFocusResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type SoundTimbreMetricId = "drums" | "lowEnd" | "brightness" | "width" | "warmth";

export type SoundTimbreMetric = {
  id: SoundTimbreMetricId;
  label: string;
  value: string;
  detail: string;
  tone: MixCoachTone;
};

export type SoundTimbreCheckSummary = {
  statusLabel: string;
  headline: string;
  balanceLabel: string;
  detail: string;
  nextCheck: string;
  detailTitle: string;
  metrics: SoundTimbreMetric[];
  tone: MixCoachTone;
};

export type SoundSnapshotSlotId = "A" | "B";

export type SoundSnapshotSlotMap = Record<SoundSnapshotSlotId, SoundSnapshot | null>;

export type SoundSnapshot = {
  slot: SoundSnapshotSlotId;
  capturedAtLabel: string;
  statusLabel: string;
  presetLabel: string;
  timbreLabel: string;
  drumLabel: string;
  bassLabel: string;
  synthLabel: string;
  chordLabel: string;
  spreadLabel: string;
  score: number;
  sound: SoundDesign;
  tone: MixCoachTone;
};

export type SoundSnapshotMetricId = "preset" | "drums" | "bass" | "synth" | "chords";

export type SoundSnapshotComparisonMetric = {
  id: SoundSnapshotMetricId;
  label: string;
  aLabel: string;
  bLabel: string;
  tone: MixCoachTone;
};

export type SoundSnapshotDecisionActionId = "capture-a" | "capture-b" | "recall-a" | "recall-b";

export type SoundSnapshotComparisonSummary = {
  statusLabel: string;
  winnerLabel: string;
  detailLabel: string;
  detailTitle: string;
  actionId: SoundSnapshotDecisionActionId;
  actionLabel: string;
  tone: MixCoachTone;
  metrics: SoundSnapshotComparisonMetric[];
};

export type SoundPresetTarget = (typeof soundPresetIds)[number];

export type SoundPresetPreviewSummary = {
  presetId: SoundPresetTarget;
  changedMoves: number;
  statusLabel: string;
  presetLabel: string;
  toneLabel: string;
  changeLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type SoundPresetPreviewDecisionSummary = {
  presetId: SoundPresetTarget;
  actionId: "apply-preview" | "aligned";
  statusLabel: string;
  presetLabel: string;
  metricLabel: string;
  detailLabel: string;
  actionLabel: string;
  disabled: boolean;
  detailTitle: string;
  tone: MixCoachTone;
};

export type SoundPresetResultMetric = {
  id: "preset" | "drums" | "bass" | "duck" | "synth" | "chords";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type SoundPresetResult = {
  presetId: SoundPresetTarget;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: SoundPresetResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type DrumKitPadId = "clean" | "knock" | "dust" | "air";

export type DrumKitSoundParameter = "kickPunch" | "snareSnap" | "hatBrightness";

export type DrumKitPadDefinition = {
  id: DrumKitPadId;
  label: string;
  detail: string;
  sound: Record<DrumKitSoundParameter, number>;
  mixer: MixBalanceChannelUpdate;
};

export type DrumKitPadOption = DrumKitPadDefinition & {
  preview: string;
  changedCount: number;
};

export type DrumKitPreviewSummary = {
  padId: DrumKitPadId;
  changedMoves: number;
  statusLabel: string;
  kitLabel: string;
  drumLabel: string;
  rackLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type DrumKitPreviewDecisionSummary = {
  padId: DrumKitPadId;
  actionId: "apply-suggested" | "aligned";
  statusLabel: string;
  kitLabel: string;
  metricLabel: string;
  detailLabel: string;
  actionLabel: string;
  disabled: boolean;
  detailTitle: string;
  tone: MixCoachTone;
};

export type DrumKitResultMetric = {
  id: "kit" | "kick" | "clap" | "hat" | "rack";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type DrumKitResult = {
  padId: DrumKitPadId;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: DrumKitResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type MasterFinishPadId = "demo" | "vocal" | "store" | "club";

export type MasterFinishPadDefinition = {
  id: MasterFinishPadId;
  label: string;
  detail: string;
  preset: MasterPreset;
  ceilingDb: number;
  masterVolumeDb: number;
};

export type MasterFinishPadOption = MasterFinishPadDefinition & {
  preview: string;
  changedCount: number;
};

export type MasterFinishPreviewSummary = {
  padId: MasterFinishPadId;
  changedMoves: number;
  statusLabel: string;
  padLabel: string;
  presetLabel: string;
  ceilingLabel: string;
  outputLabel: string;
  changeLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type MasterFinishPreviewDecisionSummary = {
  padId: MasterFinishPadId;
  actionId: "apply-suggested" | "aligned";
  statusLabel: string;
  padLabel: string;
  metricLabel: string;
  detailLabel: string;
  actionLabel: string;
  disabled: boolean;
  detailTitle: string;
  tone: MixCoachTone;
};

export type MasterFinishResultMetric = {
  id: "preset" | "ceiling" | "output";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type MasterFinishResult = {
  padId: MasterFinishPadId;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: MasterFinishResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type MasterAutomationPadId = MasterAutomationPresetId;

export type MasterAutomationPadDefinition = {
  id: MasterAutomationPadId;
  label: string;
  detail: string;
  description: string;
};

export type MasterAutomationPadOption = MasterAutomationPadDefinition & {
  preview: string;
  changedCount: number;
  active: boolean;
};

export type MasterAutomationPreviewSummary = {
  padId: MasterAutomationPadId;
  changedEvents: number;
  statusLabel: string;
  padLabel: string;
  currentLabel: string;
  eventLabel: string;
  rangeLabel: string;
  changeLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type MasterAutomationPreviewDecisionSummary = {
  padId: MasterAutomationPadId;
  actionId: "apply-suggested" | "aligned";
  statusLabel: string;
  padLabel: string;
  metricLabel: string;
  detailLabel: string;
  actionLabel: string;
  disabled: boolean;
  detailTitle: string;
  tone: MixCoachTone;
};

export type MasterAutomationResultMetric = {
  id: "preset" | "events" | "range";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type MasterAutomationResult = {
  padId: MasterAutomationPadId;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: MasterAutomationResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type TransportLoopScope = "arrangement" | "block" | "transition" | "pattern";

export type QuickAction = {
  id: string;
  title: string;
  detail: string;
  group: string;
  keywords: string;
  disabled?: boolean;
  run: () => void | Promise<void>;
};

export type QuickActionRecent = {
  actionId: string;
  status: QuickActionResult["status"];
  tone: MixCoachTone;
};

export const maxQuickActionPins = 4;

export type QuickActionScopeId = "all" | "transport" | "compose" | "arrange" | "mix" | "master" | "project" | "export";

export type QuickActionScopeOption = {
  id: QuickActionScopeId;
  label: string;
  count: number;
};

export type QuickActionSpotlightSummary = {
  actionId: string | null;
  statusLabel: string;
  titleLabel: string;
  detailLabel: string;
  contextLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type QuickActionResultMetric = {
  id: string;
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type QuickActionResult = {
  actionId: string;
  title: string;
  status: string;
  group: string;
  detail: string;
  metric: QuickActionResultMetric;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type EditorAuditionResultKind = "drum" | "note" | "chord";

export type EditorAuditionResult = {
  kind: EditorAuditionResultKind;
  targetId: string;
  status: "Auditioned";
  title: string;
  detail: string;
  patternLabel: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type InputCaptureResultSource = "keyboard" | "midi";

export type InputCaptureResult = {
  source: InputCaptureResultSource;
  targetId: string;
  status: "Captured" | "Replaced";
  title: string;
  detail: string;
  patternLabel: string;
  metricLabel: string;
  metricValue: string;
  captureCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type SelectedEventDeleteResultKind = "drum" | "note" | "chord";

export type SelectedEventDeleteResult = {
  kind: SelectedEventDeleteResultKind;
  targetId: string;
  status: "Deleted";
  title: string;
  detail: string;
  patternLabel: string;
  metricLabel: string;
  metricValue: string;
  recoveryCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type UndoRedoResultAction = "undo" | "redo";

export type UndoRedoResult = {
  action: UndoRedoResultAction;
  targetId: string;
  status: "Undone" | "Redone";
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  recoveryCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type BeatReadinessCheckId = "drums" | "bass" | "harmony" | "arrangement" | "export";
export type BeatReadinessFocusTarget = "compose" | "arrange" | "master" | "deliver";

export type BeatReadinessCheck = {
  id: BeatReadinessCheckId;
  label: string;
  status: string;
  detail: string;
  focusTarget: BeatReadinessFocusTarget;
  focusLabel: string;
  tone: MixCoachTone;
};

export type BeatReadinessFocusSummary = {
  checkId: BeatReadinessCheckId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  actionLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type BeatReadinessFocusResult = {
  checkId: BeatReadinessCheckId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export function beatReadinessPriorityCheck(checks: BeatReadinessCheck[]): BeatReadinessCheck | null {
  return checks.find((check) => check.tone === "danger") ?? checks.find((check) => check.tone === "warn") ?? checks[0] ?? null;
}

export type PatternCompareSummary = {
  slot: PatternSlot;
  eventCount: number;
  drumHits: number;
  bassNotes: number;
  melodyNotes: number;
  chordEvents: number;
  arrangedBlocks: number;
  arrangedBars: number;
};

export type PatternCompareDecisionSummary = {
  action: "cue" | "use";
  target: PatternSlot;
  statusLabel: string;
  targetLabel: string;
  actionLabel: string;
  detailLabel: string;
  metricLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type PatternCompareResultMetric = {
  id: "pattern" | "events" | "block";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type PatternCompareResult = {
  action: "cue" | "use";
  pattern: PatternSlot;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: PatternCompareResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type PatternClonePadOption = {
  id: string;
  source: PatternSlot;
  target: PatternSlot;
  preset: PatternVariationPreset;
  label: string;
  preview: string;
  detail: string;
};

export type PatternCloneSuggestionSummary = {
  source: PatternSlot;
  target: PatternSlot;
  preset: PatternVariationPreset;
  statusLabel: string;
  routeLabel: string;
  presetLabel: string;
  detailLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type PatternCloneResultMetric = {
  id: "source" | "target" | "drums" | "music";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type PatternCloneResult = {
  source: PatternSlot;
  target: PatternSlot;
  preset: PatternVariationPreset;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: PatternCloneResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type PatternEditResultMetric = {
  id: "source" | "target" | "events" | "drums" | "music";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type PatternEditResult = {
  action: "copy" | "clear";
  source: PatternSlot;
  target: PatternSlot;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: PatternEditResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type PatternFillResultMetric = {
  id: "events" | "drums" | "bass" | "chords" | "melody";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type PatternFillPreviewSummary = {
  preset: PatternFillPreset;
  pattern: PatternSlot;
  statusLabel: string;
  patternLabel: string;
  presetLabel: string;
  drumsLabel: string;
  bassLabel: string;
  chordLabel: string;
  melodyLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type PatternFillSuggestionSummary = {
  preset: PatternFillPreset;
  statusLabel: string;
  patternLabel: string;
  presetLabel: string;
  detailLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type PatternFillResult = {
  preset: PatternFillPreset;
  pattern: PatternSlot;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: PatternFillResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type PatternVariationPreviewSummary = {
  preset: PatternVariationPreset;
  pattern: PatternSlot;
  statusLabel: string;
  patternLabel: string;
  presetLabel: string;
  drumsLabel: string;
  bassLabel: string;
  chordLabel: string;
  melodyLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type PatternVariationSuggestionSummary = {
  preset: PatternVariationPreset;
  statusLabel: string;
  patternLabel: string;
  presetLabel: string;
  detailLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type PatternVariationResultMetric = {
  id: "events" | "drums" | "bass" | "chords" | "melody";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type PatternVariationResult = {
  preset: PatternVariationPreset;
  pattern: PatternSlot;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: PatternVariationResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type PatternDnaCardId = "layers" | "density" | "dynamics" | "variation" | "arrangement";
export type PatternDnaFocusTarget = "compose" | "arrange";

export type PatternDnaCard = {
  id: PatternDnaCardId;
  label: string;
  value: string;
  detail: string;
  tone: MixCoachTone;
  focusTarget: PatternDnaFocusTarget;
  focusLabel: string;
};

export type PatternDnaSummary = {
  slot: PatternSlot;
  headline: string;
  detail: string;
  tone: MixCoachTone;
  cards: PatternDnaCard[];
};

export type LayerStarterId = "drums" | "bass" | "chords" | "melody";

export type LayerStarterOption = {
  id: LayerStarterId;
  label: string;
  status: string;
  detail: string;
  actionLabel: string;
  targetLabel: string;
  countLabel: string;
  tone: MixCoachTone;
};

export type LayerStarterPrioritySummary = {
  optionId: LayerStarterId | null;
  actionLabel: string;
  statusLabel: string;
  layerLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type LayerStarterResultMetric = {
  id: LayerStarterId;
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type LayerStarterResult = {
  starterId: LayerStarterId;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: LayerStarterResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export function layerStarterPriorityOption(options: LayerStarterOption[]): LayerStarterOption | null {
  return options.find((option) => option.tone === "danger") ?? options.find((option) => option.tone === "warn") ?? null;
}

export type ListeningPassId = "composition" | "arrangement" | "mix" | "delivery";
export type ListeningPassTarget = "compose" | "arrange" | "mix" | "master" | "deliver";

export type ListeningPassItem = {
  id: ListeningPassId;
  label: string;
  status: string;
  cue: string;
  detail: string;
  metric: string;
  focusTarget: ListeningPassTarget;
  focusLabel: string;
  tone: MixCoachTone;
};

export type ListeningPassSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  items: ListeningPassItem[];
};

export type ListeningPassFocusSummary = {
  itemId: ListeningPassId | null;
  statusLabel: string;
  checkpointLabel: string;
  detailLabel: string;
  actionLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ListeningPassFocusResult = {
  itemId: ListeningPassId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type PatternDnaFocusSummary = {
  cardId: PatternDnaCardId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type PatternDnaFocusResult = {
  cardId: PatternDnaCardId;
  status: string;
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type StyleGoalCardId = "drums" | "bass" | "harmony" | "melody" | "arrange";
export type StyleInspectorMetricId = "bpm" | "swing" | "bass" | "melody" | "sound";
export type StyleInspectorFocusId = StyleInspectorMetricId | `density-${PatternSlot}` | `goal-${StyleGoalCardId}`;
export type StyleInspectorFocusTarget = "transport" | "compose" | "sound" | "arrange";

export type StyleInspectorFocusItem = {
  focusId: StyleInspectorFocusId;
  label: string;
  value: string;
  detail: string;
  focusTarget: StyleInspectorFocusTarget;
  focusLabel: string;
};

export type StyleInspectorMetric = StyleInspectorFocusItem & {
  id: StyleInspectorMetricId;
};

export type StylePatternDensity = {
  slot: PatternSlot;
  label: string;
  value: string;
  eventCount: number;
  detail: string;
  focusId: `density-${PatternSlot}`;
  focusTarget: "compose";
  focusLabel: "Compose";
};

export type StyleGoalCard = StyleInspectorFocusItem & {
  id: StyleGoalCardId;
  current: string;
  target: string;
  progress: string;
  cue: string;
  tone: MixCoachTone;
};

export type StyleInspectorSummary = {
  profile: StyleProfile;
  bpm: string;
  swing: string;
  bass: string;
  melody: string;
  soundPreset: string;
  goalHeadline: string;
  totalEvents: number;
  metrics: StyleInspectorMetric[];
  goals: StyleGoalCard[];
  patterns: StylePatternDensity[];
};

export type StyleInspectorFocusSummary = {
  focusId: StyleInspectorFocusId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  detailTitle: string;
};

export type StyleInspectorFocusResult = {
  focusId: StyleInspectorFocusId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type BasslinePadId = "root" | "bounce" | "slide" | "offbeat";

export type BasslinePadStep = {
  step: number;
  degree: number;
  length: number;
  velocity?: number;
  glide: boolean;
  probability?: number;
};

export type BasslinePadDefinition = {
  id: BasslinePadId;
  label: string;
  detail: string;
  steps: BasslinePadStep[];
};

export type BasslinePadOption = BasslinePadDefinition & {
  preview: string;
  eventCount: number;
  glideCount: number;
};

export type BassGlidePadId = "clean" | "bounce" | "slide" | "hold";

export type BassGlidePadDefinition = {
  id: BassGlidePadId;
  label: string;
  detail: string;
};

export type BassGlidePadOption = BassGlidePadDefinition & {
  preview: string;
  glideCount: number;
};

export type BassContourId = "root" | "rise" | "drop" | "answer";

export type BassContourDefinition = {
  id: BassContourId;
  label: string;
  detail: string;
};

export type BassContourOption = BassContourDefinition & {
  preview: string;
  pitchSpan: string;
};

export type BassMovePreviewSummary = {
  statusLabel: string;
  phraseLabel: string;
  basslineLabel: string;
  glideLabel: string;
  contourLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
  basslineId: BasslinePadId | "none";
  glideId: BassGlidePadId | "none";
  contourId: BassContourId | "none";
};

export type BassMoveResultKind = "Bassline" | "Glide" | "Contour";

export type BassMoveResultMetric = {
  id: "notes" | "rhythm" | "glide" | "chance" | "range";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type BassMoveResult = {
  moveId: string;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: BassMoveResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type BassMoveQuickActionTarget =
  | { kind: "Bassline"; id: BasslinePadId; label: string }
  | { kind: "Glide"; id: BassGlidePadId; label: string }
  | { kind: "Contour"; id: BassContourId; label: string };

export type PatternStackId = "pocket" | "hook" | "lift" | "break";

export type PatternStackDefinition = {
  id: PatternStackId;
  label: string;
  detail: string;
  bassline: BasslinePadId;
  chordPreset: ChordProgressionPreset;
  motif: MelodyMotifId;
};

export type PatternStackEvents = {
  bassNotes: BassNote[];
  chordEvents: ChordEvent[];
  melodyNotes: MelodyNote[];
};

export type PatternStackOption = PatternStackDefinition & {
  preview: string;
  bassCount: number;
  chordCount: number;
  melodyCount: number;
};

export type PatternStackPreviewSummary = {
  statusLabel: string;
  patternLabel: string;
  stackLabel: string;
  bassLabel: string;
  chordLabel: string;
  melodyLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
  stackId: PatternStackId | "none";
};

export type PatternStackResultMetric = {
  id: "bass" | "chord" | "melody";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type PatternStackResult = {
  stackId: PatternStackId;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: PatternStackResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type GrooveFeelId = "tight" | "pocket" | "push" | "lazy";

export type GrooveFeelDefinition = {
  id: GrooveFeelId;
  label: string;
  detail: string;
  musicChance: number;
  chordChance: number;
  hatChance: number;
  percChance: number;
};

export type GrooveFeelOption = GrooveFeelDefinition & {
  timingPreview: string;
  chancePreview: string;
};

export type DrumAccentId = "soft" | "knock" | "ghost" | "lift";

export type DrumAccentDefinition = {
  id: DrumAccentId;
  label: string;
  detail: string;
};

export type DrumAccentOption = DrumAccentDefinition & {
  preview: string;
};

export type DrumFoundationId = "straight" | "bounce" | "half" | "club";

export type DrumFoundationDefinition = {
  id: DrumFoundationId;
  label: string;
  detail: string;
  kick: number[];
  clap: number[];
  hat: number[];
  perc: number[];
  hatRepeats?: Partial<Record<number, number>>;
};

export type DrumFoundationOption = DrumFoundationDefinition & {
  preview: string;
  hitCount: number;
};

export type DrumMovePreviewSummary = {
  statusLabel: string;
  patternLabel: string;
  foundationLabel: string;
  feelLabel: string;
  accentLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
  foundationId: DrumFoundationId | "none";
  feelId: GrooveFeelId | "none";
  accentId: DrumAccentId | "none";
};

export type DrumMoveResultKind = "Foundation" | "Feel" | "Accent";

export type DrumMoveResultMetric = {
  id: "hits" | "timing" | "chance" | "velocity";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type DrumMoveResult = {
  moveId: string;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: DrumMoveResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type DrumMoveQuickActionTarget =
  | { kind: "Foundation"; id: DrumFoundationId; label: string }
  | { kind: "Feel"; id: GrooveFeelId; label: string }
  | { kind: "Accent"; id: DrumAccentId; label: string };

export type MelodyMotifId = "hook" | "pocket" | "rise" | "answer";

export type MelodyMotifStep = {
  step: number;
  degree: number;
  length: number;
  velocity: number;
};

export type MelodyMotifDefinition = {
  id: MelodyMotifId;
  label: string;
  detail: string;
  steps: MelodyMotifStep[];
};

export type MelodyMotifOption = MelodyMotifDefinition & {
  preview: string;
  eventCount: number;
};

export type MelodyAccentId = "soft" | "lead" | "pulse" | "fade";

export type MelodyAccentDefinition = {
  id: MelodyAccentId;
  label: string;
  detail: string;
};

export type MelodyAccentOption = MelodyAccentDefinition & {
  preview: string;
  changedCount: number;
  chanceCount: number;
};

export type MelodyContourId = "rise" | "fall" | "answer" | "anchor";

export type MelodyContourDefinition = {
  id: MelodyContourId;
  label: string;
  detail: string;
};

export type MelodyContourOption = MelodyContourDefinition & {
  preview: string;
  changedCount: number;
  pitchSpan: string;
};

export type MelodyMovePreviewSummary = {
  statusLabel: string;
  phraseLabel: string;
  motifLabel: string;
  accentLabel: string;
  contourLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
  motifId: MelodyMotifId | "none";
  accentId: MelodyAccentId | "none";
  contourId: MelodyContourId | "none";
};

export type MelodyMoveResultKind = "Motif" | "Accent" | "Contour";

export type MelodyMoveResultMetric = {
  id: "notes" | "rhythm" | "range" | "velocity" | "chance";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type MelodyMoveResult = {
  moveId: string;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: MelodyMoveResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type MelodyMoveQuickActionTarget =
  | { kind: "Motif"; id: MelodyMotifId; label: string }
  | { kind: "Accent"; id: MelodyAccentId; label: string }
  | { kind: "Contour"; id: MelodyContourId; label: string };

export type TapTempoState = {
  taps: number;
  bpm: number | null;
  applied: boolean;
};

export type TempoNudgePadId = "down" | "up" | "half" | "double";

export type TempoNudgePadDefinition = {
  id: TempoNudgePadId;
  label: string;
  title: string;
};

export type SwingFeelPadId = "straight" | "tight" | "laid" | "loose" | "style";

export type SwingFeelPadDefinition = {
  id: SwingFeelPadId;
  label: string;
  detail: string;
  value: number | "style";
};

export type SwingFeelResult = {
  padId: SwingFeelPadId;
  title: string;
  status: string;
  detail: string;
  scope: string;
  metric: QuickActionResultMetric;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type ChordPadId = "home" | "lift" | "tension" | "color";

export type ChordPadDefinition = {
  id: ChordPadId;
  label: string;
  detail: string;
  degree: number;
  quality?: ChordQuality;
  inversion: ChordInversion;
};

export type ChordPadOption = ChordPadDefinition & {
  root: string;
  quality: ChordQuality;
  selected: boolean;
};

export type ChordRhythmId = "held" | "pulse" | "stab" | "ghost";

export type ChordRhythmDefinition = {
  id: ChordRhythmId;
  label: string;
  detail: string;
};

export type ChordRhythmOption = ChordRhythmDefinition & {
  preview: string;
  changedCount: number;
  chanceCount: number;
};

export type ChordVoicingId = "open" | "deep" | "tension" | "air";

export type ChordVoicingDefinition = {
  id: ChordVoicingId;
  label: string;
  detail: string;
  quality?: ChordQuality;
  inversion: ChordInversion;
  length: number;
  velocity: number;
  probability: number;
};

export type ChordVoicingOption = ChordVoicingDefinition & {
  quality: ChordQuality;
  preview: string;
  selected: boolean;
};

export type ChordHarmonicSummary = {
  degreeLabel: string;
  romanLabel: string;
  roleLabel: string;
  detailLabel: string;
  inKey: boolean;
};

export type ChordMovePreviewSummary = {
  statusLabel: string;
  selectedLabel: string;
  harmonicLabel: string;
  rhythmLabel: string;
  voicingLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
  padId: ChordPadId | "none";
  rhythmId: ChordRhythmId | "none";
  voicingId: ChordVoicingId | "none";
};

export type ChordMoveResultKind = "Pad" | "Rhythm" | "Voicing";

export type ChordMoveResultMetric = {
  id: "chords" | "harmony" | "inversion" | "rhythm" | "velocity" | "chance";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type ChordMoveResult = {
  moveId: string;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: ChordMoveResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type ChordMoveQuickActionTarget =
  | { kind: "Pad"; id: ChordPadId; label: string }
  | { kind: "Rhythm"; id: ChordRhythmId; label: string }
  | { kind: "Voicing"; id: ChordVoicingId; label: string };

export type ArrangementFocusPresetId = "intro_space" | "verse_pocket" | "hook_peak" | "bridge_drop" | "outro_release";

export type ArrangementFocusPreset = {
  id: ArrangementFocusPresetId;
  label: string;
  detail: string;
  section: ArrangementSection;
  pattern: PatternSlot;
  bars: number;
  energy: number;
  mutedTracks: ArrangementMuteTrack[];
};

export type ArrangementFocusSummary = {
  blockNumber: number;
  section: ArrangementSection;
  pattern: PatternSlot;
  bars: number;
  energy: number;
  eventCount: number;
  mutedLabel: string;
  suggestedPreset: ArrangementFocusPresetId;
};

export type ArrangementFocusPreviewSummary = {
  presetId: ArrangementFocusPresetId;
  changeCount: number;
  statusLabel: string;
  presetLabel: string;
  blockLabel: string;
  sectionLabel: string;
  energyLabel: string;
  muteLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ArrangementFocusPrioritySummary = {
  presetId: ArrangementFocusPresetId;
  statusLabel: string;
  presetLabel: string;
  reasonLabel: string;
  scopeLabel: string;
  nextCheckLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ArrangementFocusResultMetric = {
  id: "section" | "pattern" | "bars" | "energy" | "mutes";
  label: string;
  before: string;
  after: string;
  changed: boolean;
  tone: MixCoachTone;
};

export type ArrangementFocusResultSummary = {
  presetId: ArrangementFocusPresetId;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: ArrangementFocusResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type ArrangementMovePrioritySummary = {
  presetId: ArrangementMovePreset | "none";
  statusLabel: string;
  presetLabel: string;
  reasonLabel: string;
  scopeLabel: string;
  impactLabel: string;
  nextCheckLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ArrangementMoveResultMetricId = "energy" | "mutes";

export type ArrangementMoveResultMetric = {
  id: ArrangementMoveResultMetricId;
  label: string;
  before: string;
  after: string;
  changed: boolean;
  tone: MixCoachTone;
};

export type ArrangementMoveResultSummary = {
  presetId: ArrangementMovePreset;
  blockIndex: number;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: ArrangementMoveResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type SelectedBlockEditActionId = "copy" | "paste" | "duplicate" | "split" | "merge" | "move_left" | "move_right" | "delete";

export type SelectedBlockEditPriorityActionId = SelectedBlockEditActionId | "none";

export type SelectedBlockEditPrioritySummary = {
  actionId: SelectedBlockEditPriorityActionId;
  statusLabel: string;
  actionLabel: string;
  reasonLabel: string;
  scopeLabel: string;
  impactLabel: string;
  nextCheckLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type SelectedBlockEditResultMetricId = "blocks" | "bars" | "selected";

export type SelectedBlockEditResultMetric = {
  id: SelectedBlockEditResultMetricId;
  label: string;
  before: string;
  after: string;
  changed: boolean;
  tone: MixCoachTone;
};

export type SelectedBlockEditResultSummary = {
  actionId: SelectedBlockEditActionId;
  blockIndex: number;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: SelectedBlockEditResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type ArrangementArcPadId = "clean" | "lift" | "break" | "rise";

export type ArrangementArcPoint = {
  section: ArrangementSection;
  pattern: PatternSlot;
  bars: number;
  energy: number;
  mutedTracks: ArrangementMuteTrack[];
};

export type ArrangementArcPadDefinition = {
  id: ArrangementArcPadId;
  label: string;
  detail: string;
  points: ArrangementArcPoint[];
};

export type ArrangementArcPadOption = ArrangementArcPadDefinition & {
  preview: string;
  changedCount: number;
};

export type ArrangementArcPreviewSummary = {
  padId: ArrangementArcPadId;
  changedBlockCount: number;
  changedFieldCount: number;
  statusLabel: string;
  padLabel: string;
  sectionLabel: string;
  patternLabel: string;
  energyLabel: string;
  muteLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ArrangementArcPrioritySummary = {
  padId: ArrangementArcPreviewSummary["padId"];
  statusLabel: string;
  padLabel: string;
  reasonLabel: string;
  scopeLabel: string;
  moveLabel: string;
  nextCheckLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ArrangementTemplatePreviewSummary = {
  templateId: ArrangementTemplateId | "aligned";
  changedBlockCount: number;
  changedFieldCount: number;
  statusLabel: string;
  templateLabel: string;
  sectionLabel: string;
  patternLabel: string;
  energyLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ArrangementTemplatePrioritySummary = {
  templateId: ArrangementTemplatePreviewSummary["templateId"];
  statusLabel: string;
  templateLabel: string;
  reasonLabel: string;
  scopeLabel: string;
  moveLabel: string;
  nextCheckLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ArrangementTemplatePreviewDecisionSummary = {
  templateId: ArrangementTemplatePreviewSummary["templateId"];
  actionId: "apply-suggested" | "aligned";
  statusLabel: string;
  templateLabel: string;
  metricLabel: string;
  detailLabel: string;
  actionLabel: string;
  disabled: boolean;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ArrangementTemplateResultMetric = {
  id: "sections" | "patterns" | "bars" | "energy" | "mutes";
  label: string;
  before: string;
  after: string;
  changed: boolean;
  tone: MixCoachTone;
};

export type ArrangementTemplateResultSummary = {
  templateId: ArrangementTemplateId;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: ArrangementTemplateResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type ArrangementArcResultMetric = {
  id: "sections" | "patterns" | "bars" | "energy" | "mutes";
  label: string;
  before: string;
  after: string;
  changed: boolean;
  tone: MixCoachTone;
};

export type ArrangementArcResultSummary = {
  padId: ArrangementArcPadId;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: ArrangementArcResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type PatternChainPreviewSummary = {
  actionId: PatternChainId | "expand" | "aligned";
  changedBlockCount: number;
  changedFieldCount: number;
  statusLabel: string;
  actionLabel: string;
  sequenceLabel: string;
  sectionLabel: string;
  energyLabel: string;
  moveLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type PatternChainPrioritySummary = {
  actionId: PatternChainPreviewSummary["actionId"];
  statusLabel: string;
  actionLabel: string;
  reasonLabel: string;
  scopeLabel: string;
  nextCheckLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type PatternChainResultMetric = {
  id: "sequence" | "sections" | "bars" | "energy" | "mutes";
  label: string;
  before: string;
  after: string;
  changed: boolean;
  tone: MixCoachTone;
};

export type PatternChainResultSummary = {
  actionId: PatternChainId | "expand";
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: PatternChainResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type NextMoveCommand =
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

export type NextMoveAction = {
  id: string;
  title: string;
  detail: string;
  buttonLabel: string;
  tone: MixCoachTone;
  command: NextMoveCommand;
};

export type NextMoveResultMetric = {
  id: string;
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type NextMoveResult = {
  actionId: string;
  title: string;
  status: string;
  detail: string;
  metric: NextMoveResultMetric;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type BeatMapStage = {
  id: string;
  label: string;
  status: string;
  detail: string;
  tone: MixCoachTone;
};

export type BeatMapMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: MixCoachTone;
};

export type BeatMapSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  stages: BeatMapStage[];
  metrics: BeatMapMetric[];
};

export type StructureLensSignal = {
  id: "target" | "sections" | "hook" | "arc";
  label: string;
  value: string;
  detail: string;
  tone: MixCoachTone;
};

export type StructureLensSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  signals: StructureLensSignal[];
};

export type HookReadinessCardId = "section" | "motif" | "contrast" | "mix" | "handoff";
export type HookReadinessFocusId = HookReadinessCardId;
export type HookReadinessFocusTarget = ReviewQueueFocusTarget;

export type HookReadinessFocusItem = {
  focusId: HookReadinessFocusId;
  label: string;
  value: string;
  detail: string;
  focusTarget: HookReadinessFocusTarget;
  focusLabel: string;
};

export type HookReadinessCard = HookReadinessFocusItem & {
  id: HookReadinessCardId;
  status: string;
  tone: MixCoachTone;
};

export type HookReadinessSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  cards: HookReadinessCard[];
};

export type HookReadinessFocusSummary = {
  focusId: HookReadinessFocusId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type HookReadinessPrioritySummary = {
  cardId: HookReadinessCardId | null;
  actionLabel: string;
  statusLabel: string;
  cardLabel: string;
  reasonLabel: string;
  nextCheckLabel: string;
  tone: MixCoachTone;
};

export type HookReadinessFocusResult = {
  cardId: HookReadinessCardId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type ToplineSpaceCardId = "pocket" | "lead" | "arrangement" | "mix" | "brief";
export type ToplineSpaceFocusId = ToplineSpaceCardId;
export type ToplineSpaceFocusTarget = ReviewQueueFocusTarget;

export type ToplineSpaceFocusItem = {
  focusId: ToplineSpaceFocusId;
  label: string;
  value: string;
  detail: string;
  focusTarget: ToplineSpaceFocusTarget;
  focusLabel: string;
};

export type ToplineSpaceCard = ToplineSpaceFocusItem & {
  id: ToplineSpaceCardId;
  status: string;
  tone: MixCoachTone;
};

export type ToplineSpaceSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  cards: ToplineSpaceCard[];
};

export type ToplineSpaceFocusSummary = {
  focusId: ToplineSpaceFocusId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ToplineSpacePrioritySummary = {
  cardId: ToplineSpaceCardId | null;
  actionLabel: string;
  statusLabel: string;
  cardLabel: string;
  reasonLabel: string;
  nextCheckLabel: string;
  tone: MixCoachTone;
};

export type ToplineSpaceFocusResult = {
  cardId: ToplineSpaceCardId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type SongFormMetricId = "flow" | "patterns" | "selected" | "energy";

export type SongFormMetric = {
  id: SongFormMetricId;
  label: string;
  value: string;
  detail: string;
  tone: MixCoachTone;
};

export type SongFormSegment = {
  index: number;
  section: ArrangementSection;
  pattern: PatternSlot;
  bars: number;
  startBar: number;
  endBar: number;
  energy: number;
  mutedLabel: string;
  eventCount: number;
  tone: MixCoachTone;
  widthPercent: number;
};

export type SongFormOverviewSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  metrics: SongFormMetric[];
  segments: SongFormSegment[];
  selectedIndex: number;
};

export type SongFormPrioritySummary = {
  metricId: SongFormMetricId | null;
  targetIndex: number | null;
  targetLabel: string;
  statusLabel: string;
  metricLabel: string;
  reasonLabel: string;
  nextCheckLabel: string;
  tone: MixCoachTone;
};

export type ArrangementMuteMapFocusId = ArrangementMuteTrack;

export type ArrangementMuteMapLane = {
  id: ArrangementMuteMapFocusId;
  label: string;
  value: string;
  status: string;
  detail: string;
  focusLabel: string;
  mutedBlocks: number;
  mutedBars: number;
  tone: MixCoachTone;
};

export type ArrangementMuteMapSegment = {
  index: number;
  section: ArrangementSection;
  pattern: PatternSlot;
  startBar: number;
  endBar: number;
  bars: number;
  mutedTracks: ArrangementMuteTrack[];
  muteCount: number;
  tone: MixCoachTone;
};

export type ArrangementMuteMapSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  lanes: ArrangementMuteMapLane[];
  segments: ArrangementMuteMapSegment[];
};

export type ArrangementMuteMapFocusSummary = {
  focusId: ArrangementMuteMapFocusId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ArrangementMuteMapPrioritySummary = {
  laneId: ArrangementMuteMapFocusId | null;
  actionLabel: string;
  statusLabel: string;
  laneLabel: string;
  reasonLabel: string;
  nextCheckLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ArrangementMuteMapFocusResult = {
  laneId: ArrangementMuteMapFocusId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type ArrangementTransitionMapFocusId = number;

export type ArrangementTransitionMapTransition = {
  id: ArrangementTransitionMapFocusId;
  fromIndex: number;
  toIndex: number;
  fromSection: ArrangementSection;
  toSection: ArrangementSection;
  fromPattern: PatternSlot;
  toPattern: PatternSlot;
  boundaryBar: number;
  value: string;
  status: string;
  detail: string;
  energyLabel: string;
  patternLabel: string;
  muteLabel: string;
  focusLabel: string;
  tone: MixCoachTone;
};

export type ArrangementTransitionMapSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  transitions: ArrangementTransitionMapTransition[];
};

export type ArrangementTransitionMapFocusSummary = {
  focusId: ArrangementTransitionMapFocusId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ArrangementTransitionMapPrioritySummary = {
  transitionId: ArrangementTransitionMapFocusId | null;
  actionLabel: string;
  statusLabel: string;
  transitionLabel: string;
  reasonLabel: string;
  nextCheckLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ArrangementTransitionMapFocusResult = {
  transitionId: ArrangementTransitionMapFocusId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type SectionLocatorPad = {
  section: ArrangementSection;
  index: number | null;
  pattern: PatternSlot | null;
  startBar: number | null;
  endBar: number | null;
  energy: number;
  eventCount: number;
  selected: boolean;
  playing: boolean;
  tone: MixCoachTone;
};

export type SectionLocatorPrioritySummary = {
  section: ArrangementSection | null;
  statusLabel: string;
  sectionLabel: string;
  reasonLabel: string;
  nextCheckLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ArrangementBlockRoleSummary = {
  roleLabel: string;
  timelineLabel: string;
  detailLabel: string;
  isShaped: boolean;
};

export type MixerChannelRoleSummary = {
  roleLabel: string;
  levelLabel: string;
  detailLabel: string;
  isShaped: boolean;
};

export type StemAuditionReadoutSummary = {
  roleLabel: string;
  statusLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type StemAuditionDecisionSummary = {
  targetId: StemAuditionPadId | null;
  statusLabel: string;
  targetLabel: string;
  detailLabel: string;
  nextCheckLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type MasterOutputRoleSummary = {
  roleLabel: string;
  statusLabel: string;
  levelLabel: string;
  detailLabel: string;
  detailTitle: string;
  isAtRisk: boolean;
};

export type ProductionSnapshotMetricId = "target" | "form" | "patterns" | "mix" | "handoff";
export type ProductionSnapshotFocusId = ProductionSnapshotMetricId;
export type ProductionSnapshotFocusTarget = WorkflowZoneId;

export type ProductionSnapshotFocusItem = {
  focusId: ProductionSnapshotFocusId;
  label: string;
  value: string;
  detail: string;
  focusTarget: ProductionSnapshotFocusTarget;
  focusLabel: string;
};

export type ProductionSnapshotMetric = ProductionSnapshotFocusItem & {
  id: ProductionSnapshotMetricId;
  tone: MixCoachTone;
};

export type ProductionSnapshotSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  metrics: ProductionSnapshotMetric[];
};

export type ProductionSnapshotFocusSummary = {
  focusId: ProductionSnapshotFocusId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ProductionSnapshotFocusResult = {
  metricId: ProductionSnapshotFocusId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type KeyCompassCardId = "scale" | "chords" | "cadence" | "bass" | "melody" | "focus";
export type KeyCompassFocusId = KeyCompassCardId;
export type KeyCompassFocusTarget = "compose";

export type KeyCompassFocusItem = {
  focusId: KeyCompassFocusId;
  label: string;
  value: string;
  detail: string;
  focusTarget: KeyCompassFocusTarget;
  focusLabel: "Compose";
};

export type KeyCompassCard = KeyCompassFocusItem & {
  id: KeyCompassCardId;
  tone: MixCoachTone;
};

export type KeyCompassSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  scaleNotes: string[];
  cards: KeyCompassCard[];
};

export type KeyCompassFocusSummary = {
  focusId: KeyCompassFocusId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type KeyCompassFocusResult = {
  focusId: KeyCompassFocusId;
  status: string;
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type GrooveCompassCardId = "density" | "anchors" | "hats" | "timing" | "chance" | "pocket" | "focus";
export type GrooveCompassFocusId = GrooveCompassCardId;
export type GrooveCompassFocusTarget = "compose";

export type GrooveCompassFocusItem = {
  focusId: GrooveCompassFocusId;
  label: string;
  value: string;
  detail: string;
  focusTarget: GrooveCompassFocusTarget;
  focusLabel: "Compose";
};

export type GrooveCompassCard = GrooveCompassFocusItem & {
  id: GrooveCompassCardId;
  tone: MixCoachTone;
};

export type GrooveCompassSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  cards: GrooveCompassCard[];
};

export type GrooveCompassFocusSummary = {
  focusId: GrooveCompassFocusId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type GrooveCompassFocusResult = {
  focusId: GrooveCompassFocusId;
  status: string;
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type ComposerGuideCardId = "drums" | "bass" | "harmony" | "melody" | "arrange" | "finish";

export type ComposerGuideCard = {
  id: ComposerGuideCardId;
  label: string;
  status: string;
  detail: string;
  tone: MixCoachTone;
  focusTarget: ReviewQueueFocusTarget;
  focusLabel: string;
};

export type ComposerGuideFocusSummary = {
  cardId: ComposerGuideCardId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ComposerGuideSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  cards: ComposerGuideCard[];
};

export type ComposerGuideFocusResult = {
  cardId: ComposerGuideCardId;
  status: string;
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type ComposerActionArea = "drums" | "bass" | "harmony" | "melody" | "arrange" | "finish";

export type ComposerActionCommand =
  | { kind: "blueprint"; blueprintId: BeatBlueprintId }
  | { kind: "drumFoundation"; foundation: DrumFoundationId }
  | { kind: "bassline"; pad: BasslinePadId }
  | { kind: "chordProgression"; preset: ChordProgressionPreset }
  | { kind: "melodyMotif"; motif: MelodyMotifId }
  | { kind: "patternFill"; preset: PatternFillPreset }
  | { kind: "patternChain"; chain: PatternChainId }
  | { kind: "arrangementTemplate"; template: ArrangementTemplateId }
  | { kind: "masterFinish"; pad: MasterFinishPadId };

export type ComposerAction = {
  id: string;
  area: ComposerActionArea;
  label: string;
  detail: string;
  buttonLabel: string;
  scope: string;
  impact: string;
  safety: string;
  tone: MixCoachTone;
  priority: number;
  command: ComposerActionCommand;
};

export type ComposerActionResultMetric = {
  id: string;
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type ComposerActionResult = {
  actionId: string;
  area: ComposerActionArea;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  safety: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
  metrics: ComposerActionResultMetric[];
};

export type ComposerActionsSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  actions: ComposerAction[];
};

export type ComposerStyleActionGoals = {
  drumHits: number;
  bassNotes: number;
  chordEvents: number;
  melodyNotes: number;
  arrangementBars: number;
};

export type ComposerStyleActionProfile = {
  focus: string;
  priorities: Record<ComposerActionArea, number>;
  goals: ComposerStyleActionGoals;
  cues: Record<ComposerActionArea, string>;
};

export const composerStyleActionProfiles: Record<StyleId, ComposerStyleActionProfile> = {
  trap: {
    focus: "808 pocket first",
    priorities: { bass: 1, drums: 2, melody: 3, arrange: 4, harmony: 5, finish: 6 },
    goals: { drumHits: 12, bassNotes: 5, chordEvents: 2, melodyNotes: 4, arrangementBars: 8 },
    cues: {
      drums: "bounce grid",
      bass: "slide 808",
      harmony: "dark loop",
      melody: "hook riff",
      arrange: "drop contrast",
      finish: "headroom check"
    }
  },
  drill: {
    focus: "808 and space",
    priorities: { bass: 1, drums: 2, arrange: 3, melody: 4, harmony: 5, finish: 6 },
    goals: { drumHits: 10, bassNotes: 5, chordEvents: 2, melodyNotes: 3, arrangementBars: 8 },
    cues: {
      drums: "half-time pocket",
      bass: "slide 808",
      harmony: "dark bed",
      melody: "ambient lead",
      arrange: "switch sections",
      finish: "headroom check"
    }
  },
  boom_bap: {
    focus: "drum pocket first",
    priorities: { drums: 1, harmony: 2, bass: 3, melody: 4, arrange: 5, finish: 6 },
    goals: { drumHits: 14, bassNotes: 3, chordEvents: 2, melodyNotes: 3, arrangementBars: 8 },
    cues: {
      drums: "swing pocket",
      bass: "walking anchor",
      harmony: "loop color",
      melody: "call back",
      arrange: "A/B contrast",
      finish: "warm demo"
    }
  },
  lofi: {
    focus: "harmony and pocket",
    priorities: { harmony: 1, drums: 2, melody: 3, bass: 4, arrange: 5, finish: 6 },
    goals: { drumHits: 10, bassNotes: 3, chordEvents: 4, melodyNotes: 3, arrangementBars: 8 },
    cues: {
      drums: "laid-back grid",
      bass: "soft anchor",
      harmony: "warm chords",
      melody: "answer phrase",
      arrange: "loop variation",
      finish: "soft ceiling"
    }
  },
  house: {
    focus: "groove and form",
    priorities: { drums: 1, bass: 2, arrange: 3, harmony: 4, melody: 5, finish: 6 },
    goals: { drumHits: 18, bassNotes: 4, chordEvents: 3, melodyNotes: 2, arrangementBars: 16 },
    cues: {
      drums: "club pulse",
      bass: "offbeat bass",
      harmony: "chord stab",
      melody: "lift motif",
      arrange: "club sections",
      finish: "club preview"
    }
  },
  rnb: {
    focus: "chords and pocket",
    priorities: { harmony: 1, bass: 2, melody: 3, drums: 4, arrange: 5, finish: 6 },
    goals: { drumHits: 10, bassNotes: 4, chordEvents: 4, melodyNotes: 4, arrangementBars: 8 },
    cues: {
      drums: "soft pocket",
      bass: "sub movement",
      harmony: "lush chords",
      melody: "vocal pocket",
      arrange: "vocal space",
      finish: "vocal headroom"
    }
  },
  k_hiphop_rnb: {
    focus: "pocket and vocal space",
    priorities: { drums: 1, harmony: 2, bass: 3, melody: 4, arrange: 5, finish: 6 },
    goals: { drumHits: 12, bassNotes: 4, chordEvents: 4, melodyNotes: 4, arrangementBars: 8 },
    cues: {
      drums: "midtempo pocket",
      bass: "clean sub line",
      harmony: "lush color",
      melody: "topline room",
      arrange: "hook space",
      finish: "vocal headroom"
    }
  },
  afrobeats: {
    focus: "syncopated pocket",
    priorities: { drums: 1, bass: 2, harmony: 3, melody: 4, arrange: 5, finish: 6 },
    goals: { drumHits: 14, bassNotes: 5, chordEvents: 3, melodyNotes: 4, arrangementBars: 8 },
    cues: {
      drums: "cross-rhythm pocket",
      bass: "rolling offbeat",
      harmony: "warm lift",
      melody: "call motif",
      arrange: "hook space",
      finish: "vocal headroom"
    }
  },
  amapiano: {
    focus: "shuffle and log-bass",
    priorities: { drums: 1, bass: 2, harmony: 3, arrange: 4, melody: 5, finish: 6 },
    goals: { drumHits: 16, bassNotes: 5, chordEvents: 3, melodyNotes: 3, arrangementBars: 8 },
    cues: {
      drums: "shuffled percussion",
      bass: "log-bass pocket",
      harmony: "airy chords",
      melody: "short call",
      arrange: "drop lift",
      finish: "club headroom"
    }
  },
  reggaeton: {
    focus: "dembow pocket",
    priorities: { drums: 1, bass: 2, melody: 3, arrange: 4, harmony: 5, finish: 6 },
    goals: { drumHits: 16, bassNotes: 5, chordEvents: 3, melodyNotes: 4, arrangementBars: 8 },
    cues: {
      drums: "dembow pocket",
      bass: "clipped offbeat",
      harmony: "simple lift",
      melody: "chant hook",
      arrange: "hook switch",
      finish: "vocal headroom"
    }
  },
  jersey: {
    focus: "bounce and sections",
    priorities: { drums: 1, bass: 2, arrange: 3, melody: 4, harmony: 5, finish: 6 },
    goals: { drumHits: 18, bassNotes: 4, chordEvents: 2, melodyNotes: 4, arrangementBars: 8 },
    cues: {
      drums: "club bounce",
      bass: "offbeat sub",
      harmony: "simple color",
      melody: "riff energy",
      arrange: "switch-ups",
      finish: "club preview"
    }
  },
  phonk: {
    focus: "808 grit first",
    priorities: { bass: 1, drums: 2, melody: 3, harmony: 4, arrange: 5, finish: 6 },
    goals: { drumHits: 12, bassNotes: 5, chordEvents: 2, melodyNotes: 3, arrangementBars: 8 },
    cues: {
      drums: "knock grid",
      bass: "slide 808",
      harmony: "dark loop",
      melody: "grit motif",
      arrange: "drop contrast",
      finish: "drive check"
    }
  },
  garage: {
    focus: "shuffle and bass",
    priorities: { drums: 1, bass: 2, melody: 3, arrange: 4, harmony: 5, finish: 6 },
    goals: { drumHits: 16, bassNotes: 4, chordEvents: 3, melodyNotes: 3, arrangementBars: 8 },
    cues: {
      drums: "shuffle pocket",
      bass: "sync bass",
      harmony: "chord color",
      melody: "riff lift",
      arrange: "A/B switch",
      finish: "club preview"
    }
  },
  experimental: {
    focus: "shape and contrast",
    priorities: { arrange: 1, melody: 2, bass: 3, drums: 4, harmony: 5, finish: 6 },
    goals: { drumHits: 8, bassNotes: 3, chordEvents: 2, melodyNotes: 3, arrangementBars: 8 },
    cues: {
      drums: "open rhythm",
      bass: "reese anchor",
      harmony: "tension bed",
      melody: "texture phrase",
      arrange: "contrast map",
      finish: "safe output"
    }
  }
};

const suggestedBlueprintIdsByStyle: Record<StyleId, BeatBlueprintId> = {
  trap: "trap_bounce",
  drill: "dark_808",
  boom_bap: "boom_bap_knock",
  lofi: "warm_loop",
  house: "club_bounce",
  rnb: "rnb_pocket",
  k_hiphop_rnb: "seoul_pocket",
  afrobeats: "afro_swing",
  amapiano: "amapiano_log_bass",
  reggaeton: "reggaeton_dembow",
  jersey: "jersey_drive",
  phonk: "phonk_cruise",
  garage: "garage_skip",
  experimental: "experimental_pulse"
};

export function suggestedBlueprintId(project: Pick<ProjectState, "styleId">): BeatBlueprintId {
  return suggestedBlueprintIdsByStyle[project.styleId];
}

export function composerDrumFoundation(project: Pick<ProjectState, "styleId">): DrumFoundationId {
  switch (project.styleId) {
    case "house":
    case "amapiano":
    case "jersey":
    case "garage":
      return "club";
    case "drill":
    case "experimental":
      return "half";
    case "trap":
    case "boom_bap":
    case "lofi":
    case "rnb":
    case "k_hiphop_rnb":
    case "afrobeats":
    case "reggaeton":
    case "phonk":
      return "bounce";
  }
}

export function composerBasslinePad(project: Pick<ProjectState, "styleId">): BasslinePadId {
  switch (project.styleId) {
    case "house":
    case "jersey":
    case "garage":
    case "afrobeats":
    case "amapiano":
    case "reggaeton":
      return "offbeat";
    case "trap":
    case "drill":
    case "phonk":
      return "slide";
    case "boom_bap":
    case "lofi":
    case "rnb":
    case "k_hiphop_rnb":
      return "bounce";
    case "experimental":
      return "root";
  }
}

export function composerChordPreset(project: Pick<ProjectState, "styleId">): ChordProgressionPreset {
  switch (project.styleId) {
    case "house":
    case "jersey":
    case "garage":
      return "bounce";
    case "rnb":
    case "k_hiphop_rnb":
    case "afrobeats":
    case "amapiano":
    case "reggaeton":
      return "lift";
    case "boom_bap":
    case "lofi":
      return "sparse";
    case "trap":
    case "drill":
    case "phonk":
    case "experimental":
      return "moody";
  }
}

export function composerMelodyMotif(project: Pick<ProjectState, "styleId">): MelodyMotifId {
  switch (project.styleId) {
    case "house":
    case "amapiano":
    case "jersey":
    case "garage":
      return "rise";
    case "boom_bap":
    case "lofi":
      return "answer";
    case "rnb":
    case "k_hiphop_rnb":
    case "afrobeats":
    case "reggaeton":
      return "pocket";
    case "trap":
    case "drill":
    case "phonk":
    case "experimental":
      return "hook";
  }
}

export type BeatPassportMetricId = "target" | "length" | "patterns" | "readiness" | "export" | "stems" | "master";
export type BeatPassportFocusId = BeatPassportMetricId;
export type BeatPassportFocusTarget = ReviewQueueFocusTarget;

export type BeatPassportFocusItem = {
  focusId: BeatPassportFocusId;
  label: string;
  value: string;
  detail: string;
  focusTarget: BeatPassportFocusTarget;
  focusLabel: string;
};

export type BeatPassportMetric = BeatPassportFocusItem & {
  id: BeatPassportMetricId;
  tone: MixCoachTone;
};

export type BeatPassportSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  metrics: BeatPassportMetric[];
};

export type BeatPassportFocusSummary = {
  focusId: BeatPassportFocusId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  actionLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type BeatPassportFocusResult = {
  metricId: BeatPassportFocusId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type FinishChecklistCardId = "compose" | "arrange" | "mix" | "master" | "automation" | "handoff";

export type FinishChecklistCard = {
  id: FinishChecklistCardId;
  label: string;
  status: string;
  detail: string;
  tone: MixCoachTone;
  focusTarget: ReviewQueueFocusTarget;
  focusLabel: string;
};

export type FinishChecklistFocusSummary = {
  cardId: FinishChecklistCardId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type FinishChecklistFocusResult = {
  cardId: FinishChecklistCardId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type FinishChecklistSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  cards: FinishChecklistCard[];
};

export type ReviewQueueItem = {
  id: string;
  area: string;
  status: string;
  detail: string;
  tone: MixCoachTone;
  focusTarget: ReviewQueueFocusTarget;
  focusLabel: string;
};

export type ReviewQueueFocusTarget = "compose" | "arrange" | "mix" | "master" | "deliver";

export type ReviewQueueFocusSummary = {
  itemId: string | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ReviewQueueFocusResult = {
  itemId: string;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type ReviewQueueSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  items: ReviewQueueItem[];
};

export type ModeFocusCard = {
  id: string;
  label: string;
  value: string;
  detail: string;
  focusTarget: ReviewQueueFocusTarget;
  focusLabel: string;
  tone: MixCoachTone;
};

export type ModeFocusSummary = {
  mode: ProjectState["mode"];
  headline: string;
  detail: string;
  tone: MixCoachTone;
  activeCardId: string;
  decisionStatus: string;
  decisionLabel: string;
  decisionDetail: string;
  decisionTitle: string;
  decisionTone: MixCoachTone;
  cards: ModeFocusCard[];
};

export type ModeFocusJumpResult = {
  cardId: string;
  status: string;
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type ModeSwitchResultMetric = {
  id: "mode-switch";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type ModeSwitchResult = {
  mode: ProjectState["mode"];
  title: string;
  status: string;
  detail: string;
  metric: ModeSwitchResultMetric;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type SessionPassTarget = "transport" | ReviewQueueFocusTarget;

export type SessionPassCardId = "guided" | "studio" | "finish" | "deliver";

export type SessionPassCard = {
  id: SessionPassCardId;
  label: string;
  value: string;
  detail: string;
  tone: MixCoachTone;
  focusTarget: SessionPassTarget;
  focusLabel: string;
};

export type SessionPassSummary = {
  mode: ProjectState["mode"];
  headline: string;
  detail: string;
  activeCardId: SessionPassCardId;
  decisionStatus: string;
  decisionLabel: string;
  decisionDetail: string;
  decisionTitle: string;
  decisionTone: MixCoachTone;
  tone: MixCoachTone;
  cards: SessionPassCard[];
};

export type SessionPassFocusResult = {
  cardId: SessionPassCardId;
  status: string;
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type SnapshotCompareMetricId = "setup" | "length" | "readiness" | "export" | "stems" | "master";

export type SnapshotCompareFocusId = `${string}:${SnapshotCompareMetricId}`;
export type SnapshotCompareFocusTarget = ReviewQueueFocusTarget;

export type SnapshotCompareFocusItem = {
  focusId: SnapshotCompareFocusId;
  metricId: SnapshotCompareMetricId;
  label: string;
  value: string;
  currentValue: string;
  detail: string;
  tone: MixCoachTone;
  focusTarget: SnapshotCompareFocusTarget;
  focusLabel: string;
  cardId: string;
  cardName: string;
};

export type SnapshotCompareFocusResult = {
  focusId: SnapshotCompareFocusId;
  cardId: string;
  metricId: SnapshotCompareMetricId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type SnapshotCompareMetric = {
  id: SnapshotCompareMetricId;
  label: string;
  current: string;
  snapshot: string;
  detail: string;
  tone: MixCoachTone;
  focusTarget: SnapshotCompareFocusTarget;
  focusLabel: string;
};

export type SnapshotCompareCard = {
  id: string;
  name: string;
  detail: string;
  tone: MixCoachTone;
  metrics: SnapshotCompareMetric[];
};

export type SnapshotCompareSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  cards: SnapshotCompareCard[];
};

export type SnapshotCompareFocusSummary = {
  focusId: SnapshotCompareFocusId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export function snapshotCompareFocusId(cardId: string, metricId: SnapshotCompareMetricId): SnapshotCompareFocusId {
  return `${cardId}:${metricId}` as SnapshotCompareFocusId;
}

export function snapshotCompareFocusItem(
  card: SnapshotCompareCard,
  metric: SnapshotCompareMetric
): SnapshotCompareFocusItem {
  return {
    focusId: snapshotCompareFocusId(card.id, metric.id),
    metricId: metric.id,
    label: metric.label,
    value: metric.snapshot,
    currentValue: metric.current,
    detail: `${metric.detail} / current ${metric.current}`,
    tone: metric.tone,
    focusTarget: metric.focusTarget,
    focusLabel: metric.focusLabel,
    cardId: card.id,
    cardName: card.name
  };
}

export function snapshotCompareFocusItems(summary: SnapshotCompareSummary): SnapshotCompareFocusItem[] {
  return summary.cards.flatMap((card) => card.metrics.map((metric) => snapshotCompareFocusItem(card, metric)));
}

export type SnapshotSlotRoleSummary = {
  roleLabel: string;
  statusLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type EditHistoryReadoutSummary = {
  roleLabel: string;
  statusLabel: string;
  detailLabel: string;
  detailTitle: string;
  nextUndoLabel: string | null;
  nextRedoLabel: string | null;
  tone: MixCoachTone;
};

export type TapTempoReadoutSummary = {
  roleLabel: string;
  statusLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type TransportPositionReadoutSummary = {
  roleLabel: string;
  statusLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type PatternPlaybackReadoutSummary = {
  roleLabel: string;
  statusLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ArrangementPlaybackReadoutSummary = {
  roleLabel: string;
  statusLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type KeyboardCapturePostureSummary = {
  roleLabel: string;
  statusLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ProjectSafetyReadoutSummary = {
  roleLabel: string;
  statusLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ProjectFileResultAction = "save" | "download" | "open" | "import";

export type ProjectFileResult = {
  action: ProjectFileResultAction;
  targetId: string;
  status: "Saved" | "Downloaded" | "Loaded" | "Imported";
  title: string;
  detail: string;
  fileLabel: string;
  metricLabel: string;
  metricValue: string;
  safetyCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type HandoffPackItem = {
  id: "wav" | "stems" | "midi" | "sheet";
  label: string;
  value: string;
  detail: string;
  tone: MixCoachTone;
  buttonLabel: string;
  run: () => void;
};

export type HandoffPackRouteSummary = {
  routeLabel: string;
  statusLabel: string;
  detailLabel: string;
  fileLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type HandoffPackSendOrderSummary = {
  nextItemId: HandoffPackItem["id"] | null;
  statusLabel: string;
  nextLabel: string;
  detailLabel: string;
  sequenceLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type HandoffExportReceipt = {
  itemId: HandoffPackItem["id"] | null;
  statusLabel: string;
  fileLabel: string;
  detailLabel: string;
  nextLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type HandoffFileManifestItem = {
  id: HandoffPackItem["id"];
  label: string;
  fileLabel: string;
  detail: string;
  tone: MixCoachTone;
};

export type HandoffManifestAuditCheck = {
  id: HandoffPackItem["id"];
  label: string;
  statusLabel: string;
  fileLabel: string;
  detailLabel: string;
  tone: MixCoachTone;
};

export type HandoffManifestAuditSummary = {
  statusLabel: string;
  titleLabel: string;
  detailLabel: string;
  receiptLabel: string;
  nextLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
  checks: HandoffManifestAuditCheck[];
};

export type HandoffExportFormatMetric = {
  id: HandoffPackItem["id"];
  label: string;
  value: string;
  detail: string;
  tone: MixCoachTone;
};

export type HandoffExportFormatSummary = {
  statusLabel: string;
  titleLabel: string;
  detailLabel: string;
  durationLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
  metrics: HandoffExportFormatMetric[];
};

export type HandoffExportFormatFocusId = HandoffExportFormatMetric["id"];

export type HandoffExportFormatFocusResult = {
  metricId: HandoffExportFormatFocusId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type HandoffPackageCheckCardId = "files" | "order" | "receipt" | "context";
export type HandoffPackageCheckFocusId = HandoffPackageCheckCardId;

export type HandoffPackageCheckCard = {
  id: HandoffPackageCheckCardId;
  focusId: HandoffPackageCheckFocusId;
  label: string;
  value: string;
  status: string;
  detail: string;
  focusTarget: "deliver";
  focusLabel: "Deliver";
  tone: MixCoachTone;
};

export type HandoffPackageCheckSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  cards: HandoffPackageCheckCard[];
};

export type HandoffPackageCheckFocusSummary = {
  focusId: HandoffPackageCheckFocusId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type HandoffPackageCheckFocusResult = {
  cardId: HandoffPackageCheckFocusId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type SessionBriefRoleSummary = {
  roleLabel: string;
  statusLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type SessionBriefCompassCardId = "direction" | "reference" | "artist" | "handoff";

export type SessionBriefCompassCard = {
  id: SessionBriefCompassCardId;
  label: string;
  value: string;
  detail: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type SessionBriefCompassSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  cards: SessionBriefCompassCard[];
};

export type SessionBriefCompassFocusResult = {
  cardId: SessionBriefCompassCardId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type ReferenceAlignmentCardId = "reference" | "direction" | "arrangement" | "mix" | "listen" | "handoff";
export type ReferenceAlignmentFocusTarget = "artist" | "vibe" | "reference" | "notes" | "arrange" | "master" | "deliver";

export type ReferenceAlignmentCard = {
  id: ReferenceAlignmentCardId;
  label: string;
  value: string;
  detail: string;
  nextCheck: string;
  focusTarget: ReferenceAlignmentFocusTarget;
  focusLabel: string;
  tone: MixCoachTone;
};

export type ReferenceAlignmentFocusResult = {
  cardId: ReferenceAlignmentCardId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type ReferenceAlignmentSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  cards: ReferenceAlignmentCard[];
};

export type SessionBriefStarterPadId = "starter" | "vocal" | "store" | "club";

export type SessionBriefStarterPadDefinition = {
  id: SessionBriefStarterPadId;
  label: string;
  detail: string;
};

export type SessionBriefStarterPadOption = SessionBriefStarterPadDefinition & {
  preview: string;
  changedCount: number;
};

export type SessionBriefStarterResultMetric = {
  id: keyof SessionBrief;
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type SessionBriefStarterResult = {
  padId: SessionBriefStarterPadId;
  title: string;
  status: string;
  detail: string;
  impact: string;
  metrics: SessionBriefStarterResultMetric[];
  nextCheck: string;
  tone: MixCoachTone;
};

export type ExportPreflightCardId = "readiness" | "mix" | "automation" | "deliverables" | "handoff";
export type ExportPreflightFocusId = ExportPreflightCardId;
export type ExportPreflightFocusTarget = ReviewQueueFocusTarget;

export type ExportPreflightFocusItem = {
  focusId: ExportPreflightFocusId;
  label: string;
  value: string;
  detail: string;
  focusTarget: ExportPreflightFocusTarget;
  focusLabel: string;
};

export type ExportPreflightCard = ExportPreflightFocusItem & {
  id: ExportPreflightCardId;
  tone: MixCoachTone;
};

export type ExportPreflightSummary = {
  headline: string;
  detail: string;
  tone: MixCoachTone;
  cards: ExportPreflightCard[];
};

export type ExportPreflightFocusSummary = {
  focusId: ExportPreflightFocusId | null;
  statusLabel: string;
  areaLabel: string;
  detailLabel: string;
  detailTitle: string;
  tone: MixCoachTone;
};

export type ExportPreflightFocusResult = {
  cardId: ExportPreflightFocusId;
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type WorkflowZoneId = "compose" | "arrange" | "mix" | "deliver";

export type WorkflowNavigatorItem = {
  id: WorkflowZoneId;
  label: string;
  value: string;
  detail: string;
  tone: MixCoachTone;
};

export type WorkflowSpotlightSummary = {
  zoneId: WorkflowZoneId | null;
  statusLabel: string;
  zoneLabel: string;
  detailLabel: string;
  countLabel: string;
  detailTitle: string;
  decisionStatus: string;
  decisionLabel: string;
  decisionDetail: string;
  decisionTitle: string;
  tone: MixCoachTone;
};

export type WorkflowNavigatorJumpResult = {
  zoneId: WorkflowZoneId;
  status: string;
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type FirstBeatPathStepId = "setup" | "compose" | "arrange" | "mix" | "deliver";
export type FirstBeatPathTarget = "transport" | WorkflowZoneId;

export type FirstBeatPathStep = {
  id: FirstBeatPathStepId;
  label: string;
  value: string;
  detail: string;
  jumpLabel: string;
  target: FirstBeatPathTarget;
  tone: MixCoachTone;
};

export type FirstBeatPathSummary = {
  statusLabel: string;
  headline: string;
  detail: string;
  countLabel: string;
  nextStepId: FirstBeatPathStepId;
  decisionStatus: string;
  decisionLabel: string;
  decisionDetail: string;
  decisionTitle: string;
  tone: MixCoachTone;
  steps: FirstBeatPathStep[];
};

export type FirstBeatPathJumpResult = {
  stepId: FirstBeatPathStepId;
  status: string;
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type BeatSpineCardId = "setup" | "drums" | "bass" | "harmony" | "melody" | "sound" | "arrange" | "finish";
export type BeatSpineTarget = "transport" | "compose" | "sound" | "arrange" | "mix" | "master" | "deliver";
export type BeatSpineActionId = "drums" | "bass" | "harmony" | "melody" | "sound" | "arrange" | "finish";

export type BeatSpineAction = {
  id: BeatSpineActionId;
  label: string;
  detail: string;
};

export type BeatSpineCard = {
  id: BeatSpineCardId;
  label: string;
  value: string;
  detail: string;
  focusLabel: string;
  target: BeatSpineTarget;
  action?: BeatSpineAction;
  tone: MixCoachTone;
};

export type BeatSpineSummary = {
  statusLabel: string;
  headline: string;
  detail: string;
  countLabel: string;
  nextCardId: BeatSpineCardId;
  decisionStatus: string;
  decisionLabel: string;
  decisionDetail: string;
  decisionTitle: string;
  tone: MixCoachTone;
  cards: BeatSpineCard[];
};

export type BeatSpineApplyResultMetric = {
  id: BeatSpineActionId;
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type BeatSpineApplyResult = {
  actionId: BeatSpineActionId;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metric: BeatSpineApplyResultMetric;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type SelectedDrumStep = {
  lane: DrumLane;
  step: number;
};

export type DrumPocketSummary = {
  positionLabel: string;
  roleLabel: string;
  detailLabel: string;
  isShaped: boolean;
};

export type DrumClipboard = {
  lane: DrumLane;
  step: number;
  velocity: number;
  probability: number;
  timingMs: number;
  hatRepeat: number;
};

export type ChordClipboard = ChordEvent;

export type ArrangementBlockClipboard = ArrangementBlock;

export type NoteView = {
  step: number;
  pitch: string;
  length: number;
  velocity?: number;
  glide?: boolean;
  probability?: number;
};

export type KeyboardCaptureKeyMapItem = {
  key: KeyboardCaptureKey;
  pitch: string | null;
  degreeLabel: string | null;
};
export type KeyboardCaptureDefaults = {
  octave: number;
  length: number;
  velocity: number;
  glide: boolean;
};
export type MidiCaptureStatus = "unsupported" | "idle" | "requesting" | "ready" | "listening" | "denied" | "error";
export type MidiInputOption = {
  id: string;
  label: string;
  detail: string;
  connected: boolean;
};
export type MidiCaptureSummary = {
  statusLabel: string;
  detailLabel: string;
  tone: MixCoachTone;
};
export type NoteDegreeSummary = {
  degreeLabel: string;
  roleLabel: string;
  pitchLabel: string;
  inKey: boolean;
};

export const arrangementFocusPresets: ArrangementFocusPreset[] = [
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

export const arrangementArcPadDefinitions: ArrangementArcPadDefinition[] = [
  {
    id: "clean",
    label: "Clean Arc",
    detail: "steady song",
    points: [
      { section: "Intro", pattern: "A", bars: 2, energy: 0.42, mutedTracks: ["bass_808"] },
      { section: "Verse", pattern: "A", bars: 4, energy: 0.68, mutedTracks: ["synth"] },
      { section: "Hook", pattern: "B", bars: 4, energy: 0.9, mutedTracks: [] },
      { section: "Bridge", pattern: "C", bars: 2, energy: 0.54, mutedTracks: ["drum_rack"] },
      { section: "Outro", pattern: "A", bars: 2, energy: 0.34, mutedTracks: ["bass_808", "synth"] }
    ]
  },
  {
    id: "lift",
    label: "Hook Lift",
    detail: "wide peak",
    points: [
      { section: "Intro", pattern: "A", bars: 1, energy: 0.46, mutedTracks: ["synth"] },
      { section: "Verse", pattern: "A", bars: 4, energy: 0.64, mutedTracks: ["synth"] },
      { section: "Hook", pattern: "B", bars: 4, energy: 0.96, mutedTracks: [] },
      { section: "Hook", pattern: "C", bars: 2, energy: 0.82, mutedTracks: ["bass_808"] },
      { section: "Outro", pattern: "A", bars: 1, energy: 0.38, mutedTracks: ["drum_rack", "bass_808"] }
    ]
  },
  {
    id: "break",
    label: "Break Arc",
    detail: "drop turn",
    points: [
      { section: "Intro", pattern: "A", bars: 2, energy: 0.32, mutedTracks: ["bass_808", "synth"] },
      { section: "Verse", pattern: "A", bars: 4, energy: 0.58, mutedTracks: [] },
      { section: "Bridge", pattern: "C", bars: 2, energy: 0.34, mutedTracks: ["drum_rack", "bass_808"] },
      { section: "Hook", pattern: "B", bars: 4, energy: 0.92, mutedTracks: [] },
      { section: "Outro", pattern: "C", bars: 2, energy: 0.42, mutedTracks: ["drum_rack"] }
    ]
  },
  {
    id: "rise",
    label: "Club Rise",
    detail: "late energy",
    points: [
      { section: "Intro", pattern: "A", bars: 1, energy: 0.5, mutedTracks: ["bass_808"] },
      { section: "Verse", pattern: "A", bars: 2, energy: 0.72, mutedTracks: [] },
      { section: "Bridge", pattern: "C", bars: 2, energy: 0.78, mutedTracks: ["synth"] },
      { section: "Hook", pattern: "B", bars: 4, energy: 0.98, mutedTracks: [] },
      { section: "Outro", pattern: "B", bars: 1, energy: 0.64, mutedTracks: ["synth"] }
    ]
  }
];

export const chordPadDefinitions: ChordPadDefinition[] = [
  { id: "home", label: "Home", detail: "center", degree: 0, inversion: 0 },
  { id: "lift", label: "Lift", detail: "open", degree: 5, inversion: 1 },
  { id: "tension", label: "Tension", detail: "pull", degree: 4, quality: "7", inversion: 0 },
  { id: "color", label: "Color", detail: "float", degree: 3, quality: "sus2", inversion: 1 }
];

export const chordRhythmDefinitions: ChordRhythmDefinition[] = [
  { id: "held", label: "Held", detail: "wide" },
  { id: "pulse", label: "Pulse", detail: "bounce" },
  { id: "stab", label: "Stab", detail: "short" },
  { id: "ghost", label: "Ghost", detail: "air" }
];

export const chordVoicingDefinitions: ChordVoicingDefinition[] = [
  { id: "open", label: "Open", detail: "wide top", inversion: 2, length: 6, velocity: 0.62, probability: 1 },
  { id: "deep", label: "Deep", detail: "root weight", inversion: 0, length: 4, velocity: 0.72, probability: 1 },
  { id: "tension", label: "Tension", detail: "dominant pull", quality: "7", inversion: 1, length: 3, velocity: 0.78, probability: 0.98 },
  { id: "air", label: "Air", detail: "suspended ghost", quality: "sus2", inversion: 2, length: 2, velocity: 0.48, probability: 0.9 }
];

export const basslinePadDefinitions: BasslinePadDefinition[] = [
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

export const bassGlidePadDefinitions: BassGlidePadDefinition[] = [
  { id: "clean", label: "Clean", detail: "tight/no glide" },
  { id: "bounce", label: "Bounce", detail: "short pocket" },
  { id: "slide", label: "Slide", detail: "connected glide" },
  { id: "hold", label: "Hold", detail: "long sustain" }
];

export const bassContourDefinitions: BassContourDefinition[] = [
  { id: "root", label: "Root", detail: "sub anchor" },
  { id: "rise", label: "Rise", detail: "build lift" },
  { id: "drop", label: "Drop", detail: "resolve low" },
  { id: "answer", label: "Answer", detail: "call back" }
];

export const melodyMotifDefinitions: MelodyMotifDefinition[] = [
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

export const melodyAccentDefinitions: MelodyAccentDefinition[] = [
  { id: "soft", label: "Soft", detail: "lighter" },
  { id: "lead", label: "Lead", detail: "front" },
  { id: "pulse", label: "Pulse", detail: "bounce" },
  { id: "fade", label: "Fade", detail: "tail" }
];

export const melodyContourDefinitions: MelodyContourDefinition[] = [
  { id: "rise", label: "Rise", detail: "lift line" },
  { id: "fall", label: "Fall", detail: "resolve down" },
  { id: "answer", label: "Answer", detail: "call reply" },
  { id: "anchor", label: "Anchor", detail: "center hook" }
];

export const patternStackDefinitions: PatternStackDefinition[] = [
  { id: "pocket", label: "Pocket", detail: "verse", bassline: "bounce", chordPreset: "sparse", motif: "pocket" },
  { id: "hook", label: "Hook", detail: "main", bassline: "slide", chordPreset: "moody", motif: "hook" },
  { id: "lift", label: "Lift", detail: "pre", bassline: "root", chordPreset: "lift", motif: "rise" },
  { id: "break", label: "Break", detail: "space", bassline: "offbeat", chordPreset: "bounce", motif: "answer" }
];

export const patternCloneVariationPresets: PatternVariationPreset[] = ["hook", "breakdown"];

export const grooveFeelDefinitions: GrooveFeelDefinition[] = [
  { id: "tight", label: "Tight", detail: "grid", musicChance: 1, chordChance: 1, hatChance: 1, percChance: 0.96 },
  { id: "pocket", label: "Pocket", detail: "behind", musicChance: 0.94, chordChance: 0.96, hatChance: 0.94, percChance: 0.86 },
  { id: "push", label: "Push", detail: "ahead", musicChance: 1, chordChance: 1, hatChance: 1, percChance: 0.92 },
  { id: "lazy", label: "Lazy", detail: "loose", musicChance: 0.82, chordChance: 0.9, hatChance: 0.88, percChance: 0.78 }
];

export const drumAccentDefinitions: DrumAccentDefinition[] = [
  { id: "soft", label: "Soft", detail: "lighter" },
  { id: "knock", label: "Knock", detail: "front" },
  { id: "ghost", label: "Ghost", detail: "depth" },
  { id: "lift", label: "Lift", detail: "rise" }
];

export const drumFoundationDefinitions: DrumFoundationDefinition[] = [
  {
    id: "straight",
    label: "Straight",
    detail: "starter grid",
    kick: [0, 8],
    clap: [4, 12],
    hat: [0, 2, 4, 6, 8, 10, 12, 14],
    perc: [6, 14]
  },
  {
    id: "bounce",
    label: "Bounce",
    detail: "offbeat pocket",
    kick: [0, 3, 8, 11],
    clap: [4, 12],
    hat: [0, 2, 4, 5, 6, 8, 10, 12, 13, 14],
    perc: [2, 7, 10, 15],
    hatRepeats: { 5: 2, 13: 2 }
  },
  {
    id: "half",
    label: "Half",
    detail: "wide downbeat",
    kick: [0, 7, 10],
    clap: [12],
    hat: [0, 3, 6, 8, 11, 14],
    perc: [5, 15],
    hatRepeats: { 14: 2 }
  },
  {
    id: "club",
    label: "Club",
    detail: "floor drive",
    kick: [0, 4, 8, 12],
    clap: [4, 12],
    hat: [2, 6, 10, 14],
    perc: [3, 7, 11, 15],
    hatRepeats: { 14: 3 }
  }
];
