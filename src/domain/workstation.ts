export type SkillMode = "guided" | "studio";

export type TrackType = "drum_rack" | "bass_808" | "synth" | "chord" | "fx_return" | "master";

export type DrumLane = "kick" | "clap" | "hat" | "perc";

export type StyleId =
  | "trap"
  | "drill"
  | "boom_bap"
  | "lofi"
  | "house"
  | "rnb"
  | "garage"
  | "experimental";

export type StyleProfile = {
  id: StyleId;
  name: string;
  bpmRange: [number, number];
  defaultBpm: number;
  defaultSwing: number;
  bassStyle: "808" | "sub" | "walking" | "pluck" | "reese" | "minimal";
  melodyStyle: "riff" | "chordal" | "loop" | "ambient" | "none";
  color: string;
};

export type DrumPattern = Record<DrumLane, boolean[]>;
export type DrumVelocities = Record<DrumLane, number[]>;
export type DrumTimings = Record<DrumLane, number[]>;
export type DrumProbabilities = Record<DrumLane, number[]>;
export const drumGroovePresetIds = ["tight", "pocket", "push", "reset"] as const;
export type DrumGroovePreset = (typeof drumGroovePresetIds)[number];
export const chordProgressionPresetIds = ["moody", "lift", "bounce", "sparse"] as const;
export type ChordProgressionPreset = (typeof chordProgressionPresetIds)[number];
export const patternVariationPresetIds = ["subtle", "hook", "breakdown"] as const;
export type PatternVariationPreset = (typeof patternVariationPresetIds)[number];

export type BassNote = {
  step: number;
  pitch: string;
  length: number;
  glide: boolean;
  probability: number;
};

export type MelodyNote = {
  step: number;
  pitch: string;
  length: number;
  velocity: number;
  probability: number;
};

export type ChordQuality = "maj" | "min" | "dim" | "sus2" | "sus4" | "7" | "m7";

export type ChordEvent = {
  step: number;
  root: string;
  quality: ChordQuality;
  length: number;
  velocity: number;
  probability: number;
};

export type NoteTrack = "bass" | "melody";
export type PatternSlot = "A" | "B" | "C";

export type PatternData = {
  drumPattern: DrumPattern;
  drumVelocities: DrumVelocities;
  drumTimings: DrumTimings;
  drumProbabilities: DrumProbabilities;
  hatRepeats: number[];
  bassNotes: BassNote[];
  melodyNotes: MelodyNote[];
  chordEvents: ChordEvent[];
};

export type MixerChannel = {
  id: TrackType;
  name: string;
  volumeDb: number;
  pan: number;
  lowCut: number;
  air: number;
  drive: number;
  glue: number;
  muted: boolean;
  solo: boolean;
  accent: string;
};

export type ArrangementSection = "Intro" | "Verse" | "Hook" | "Bridge" | "Outro";

export type ArrangementBlock = {
  section: ArrangementSection;
  pattern: PatternSlot;
  energy: number;
  bars: number;
  mutedTracks: ArrangementMuteTrack[];
};

export const arrangementTemplateIds = ["loop", "full", "hook_first", "breakdown"] as const;
export type ArrangementTemplateId = (typeof arrangementTemplateIds)[number];
export const arrangementMuteTrackIds = ["drum_rack", "bass_808", "synth", "chord"] as const;
export type ArrangementMuteTrack = (typeof arrangementMuteTrackIds)[number];

export type MasterPreset = "Clean Demo" | "Streaming Safe" | "Headroom for Vocal";

export const soundPresetIds = ["clean_knock", "club_punch", "warm_tape", "air_space"] as const;

export type SoundPresetId = (typeof soundPresetIds)[number] | "custom";

export type SoundDesign = {
  preset: SoundPresetId;
  kickPunch: number;
  snareSnap: number;
  hatBrightness: number;
  bassDrive: number;
  bassDecay: number;
  sidechainDuck: number;
  synthBrightness: number;
  synthRelease: number;
  chordWarmth: number;
  chordWidth: number;
};

export type ProjectState = {
  title: string;
  mode: SkillMode;
  bpm: number;
  key: string;
  styleId: StyleId;
  selectedPattern: PatternSlot;
  swing: number;
  metronomeEnabled: boolean;
  sound: SoundDesign;
  patterns: Record<PatternSlot, PatternData>;
  mixer: MixerChannel[];
  arrangement: ArrangementBlock[];
  masterCeilingDb: number;
  masterPreset: MasterPreset;
};

export type ProjectFile = {
  app: "GrooveForge";
  fileVersion: 1;
  savedAt: string;
  project: ProjectState;
};

export const steps = Array.from({ length: 16 }, (_, index) => index);
export const stepsPerBar = 16;
export const minArrangementBars = 1;
export const maxArrangementBars = 16;
export const minDrumTimingMs = -35;
export const maxDrumTimingMs = 35;
export const projectFileVersion = 1;
export const drumLanes: DrumLane[] = ["kick", "clap", "hat", "perc"];
export const patternSlots: PatternSlot[] = ["A", "B", "C"];
export const arrangementSections: ArrangementSection[] = ["Intro", "Verse", "Hook", "Bridge", "Outro"];
export const arrangementTemplateLabels: Record<ArrangementTemplateId, string> = {
  loop: "8 Bar Loop",
  full: "Full Beat",
  hook_first: "Hook First",
  breakdown: "Breakdown"
};
export const arrangementMuteTrackLabels: Record<ArrangementMuteTrack, string> = {
  drum_rack: "Drums",
  bass_808: "808",
  synth: "Synth",
  chord: "Chords"
};
export const chordQualities: ChordQuality[] = ["maj", "min", "dim", "sus2", "sus4", "7", "m7"];
export const masterPresets: MasterPreset[] = ["Clean Demo", "Streaming Safe", "Headroom for Vocal"];
export const drumGroovePresetLabels: Record<DrumGroovePreset, string> = {
  tight: "Tight",
  pocket: "Pocket",
  push: "Push",
  reset: "Reset"
};
export const chordProgressionPresetLabels: Record<ChordProgressionPreset, string> = {
  moody: "Moody",
  lift: "Lift",
  bounce: "Bounce",
  sparse: "Sparse"
};
export const patternVariationPresetLabels: Record<PatternVariationPreset, string> = {
  subtle: "Subtle",
  hook: "Hook",
  breakdown: "Break"
};
export const masterPresetCeilingsDb: Record<MasterPreset, number> = {
  "Clean Demo": -0.8,
  "Streaming Safe": -1,
  "Headroom for Vocal": -3
};
export const soundPresetLabels: Record<SoundPresetId, string> = {
  clean_knock: "Clean Knock",
  club_punch: "Club Punch",
  warm_tape: "Warm Tape",
  air_space: "Air Space",
  custom: "Custom"
};
export const soundPresetDefaults: Record<(typeof soundPresetIds)[number], SoundDesign> = {
  clean_knock: {
    preset: "clean_knock",
    kickPunch: 0.58,
    snareSnap: 0.52,
    hatBrightness: 0.62,
    bassDrive: 0.34,
    bassDecay: 0.54,
    sidechainDuck: 0.42,
    synthBrightness: 0.56,
    synthRelease: 0.45,
    chordWarmth: 0.58,
    chordWidth: 0.46
  },
  club_punch: {
    preset: "club_punch",
    kickPunch: 0.86,
    snareSnap: 0.74,
    hatBrightness: 0.72,
    bassDrive: 0.66,
    bassDecay: 0.62,
    sidechainDuck: 0.68,
    synthBrightness: 0.6,
    synthRelease: 0.34,
    chordWarmth: 0.42,
    chordWidth: 0.38
  },
  warm_tape: {
    preset: "warm_tape",
    kickPunch: 0.5,
    snareSnap: 0.42,
    hatBrightness: 0.38,
    bassDrive: 0.52,
    bassDecay: 0.72,
    sidechainDuck: 0.28,
    synthBrightness: 0.34,
    synthRelease: 0.68,
    chordWarmth: 0.78,
    chordWidth: 0.52
  },
  air_space: {
    preset: "air_space",
    kickPunch: 0.44,
    snareSnap: 0.58,
    hatBrightness: 0.82,
    bassDrive: 0.28,
    bassDecay: 0.48,
    sidechainDuck: 0.36,
    synthBrightness: 0.76,
    synthRelease: 0.74,
    chordWarmth: 0.34,
    chordWidth: 0.78
  }
};

const sharpNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const flatNotes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const tonicIndex: Record<string, number> = {
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

const scaleIntervals: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10]
};

const chordIntervals: Record<ChordQuality, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  "7": [0, 4, 7, 10],
  m7: [0, 3, 7, 10]
};

export const styleProfiles: StyleProfile[] = [
  {
    id: "trap",
    name: "Trap",
    bpmRange: [130, 170],
    defaultBpm: 145,
    defaultSwing: 0.08,
    bassStyle: "808",
    melodyStyle: "riff",
    color: "#78f0c8"
  },
  {
    id: "drill",
    name: "Drill",
    bpmRange: [136, 150],
    defaultBpm: 142,
    defaultSwing: 0.06,
    bassStyle: "808",
    melodyStyle: "ambient",
    color: "#8aa8ff"
  },
  {
    id: "boom_bap",
    name: "Boom Bap",
    bpmRange: [80, 100],
    defaultBpm: 92,
    defaultSwing: 0.18,
    bassStyle: "walking",
    melodyStyle: "loop",
    color: "#f0c36a"
  },
  {
    id: "lofi",
    name: "Lo-fi",
    bpmRange: [70, 92],
    defaultBpm: 82,
    defaultSwing: 0.16,
    bassStyle: "minimal",
    melodyStyle: "chordal",
    color: "#d58cff"
  },
  {
    id: "house",
    name: "House",
    bpmRange: [118, 128],
    defaultBpm: 124,
    defaultSwing: 0.05,
    bassStyle: "pluck",
    melodyStyle: "chordal",
    color: "#43d9ff"
  },
  {
    id: "rnb",
    name: "R&B",
    bpmRange: [68, 98],
    defaultBpm: 76,
    defaultSwing: 0.12,
    bassStyle: "sub",
    melodyStyle: "chordal",
    color: "#ff8aa8"
  },
  {
    id: "garage",
    name: "Garage",
    bpmRange: [126, 140],
    defaultBpm: 132,
    defaultSwing: 0.1,
    bassStyle: "pluck",
    melodyStyle: "riff",
    color: "#a7f36b"
  },
  {
    id: "experimental",
    name: "Experimental",
    bpmRange: [60, 180],
    defaultBpm: 110,
    defaultSwing: 0.2,
    bassStyle: "reese",
    melodyStyle: "ambient",
    color: "#ff7a4f"
  }
];

type NoteBlueprint = {
  step: number;
  degree: number;
  octave: number;
  length: number;
  velocity?: number;
  glide?: boolean;
};

type ChordBlueprint = {
  step: number;
  degree: number;
  quality?: ChordQuality;
  length: number;
  velocity: number;
};

type PatternBlueprint = {
  kick: number[];
  clap: number[];
  hat: number[];
  perc: number[];
  bass: NoteBlueprint[];
  melody: NoteBlueprint[];
  chords: ChordBlueprint[];
};

const chordProgressionPresetBlueprints: Record<ChordProgressionPreset, ChordBlueprint[]> = {
  moody: [
    { step: 0, degree: 0, length: 4, velocity: 0.55 },
    { step: 4, degree: 5, length: 4, velocity: 0.48 },
    { step: 8, degree: 2, length: 4, velocity: 0.5 },
    { step: 12, degree: 6, length: 4, velocity: 0.5 }
  ],
  lift: [
    { step: 0, degree: 5, length: 4, velocity: 0.52 },
    { step: 4, degree: 6, length: 4, velocity: 0.5 },
    { step: 8, degree: 0, length: 4, velocity: 0.58 },
    { step: 12, degree: 2, length: 4, velocity: 0.52 }
  ],
  bounce: [
    { step: 0, degree: 0, length: 3, velocity: 0.56 },
    { step: 3, degree: 2, length: 3, velocity: 0.48 },
    { step: 6, degree: 5, length: 4, velocity: 0.52 },
    { step: 10, degree: 6, length: 3, velocity: 0.5 },
    { step: 13, degree: 0, length: 3, velocity: 0.54 }
  ],
  sparse: [
    { step: 0, degree: 0, length: 8, velocity: 0.48 },
    { step: 8, degree: 5, length: 8, velocity: 0.44 }
  ]
};

type ArrangementTemplateBlock = Omit<ArrangementBlock, "mutedTracks"> & { mutedTracks?: ArrangementMuteTrack[] };

const arrangementTemplateBlocks: Record<ArrangementTemplateId, ArrangementTemplateBlock[]> = {
  loop: [
    { section: "Intro", pattern: "A", energy: 0.42, bars: 1 },
    { section: "Verse", pattern: "A", energy: 0.68, bars: 2 },
    { section: "Hook", pattern: "B", energy: 0.9, bars: 4 },
    { section: "Outro", pattern: "A", energy: 0.34, bars: 1 }
  ],
  full: [
    { section: "Intro", pattern: "A", energy: 0.35, bars: 2 },
    { section: "Verse", pattern: "A", energy: 0.65, bars: 4 },
    { section: "Hook", pattern: "B", energy: 0.9, bars: 4 },
    { section: "Verse", pattern: "A", energy: 0.68, bars: 4 },
    { section: "Hook", pattern: "B", energy: 0.94, bars: 4 },
    { section: "Bridge", pattern: "C", energy: 0.5, bars: 2 },
    { section: "Hook", pattern: "B", energy: 0.96, bars: 4 },
    { section: "Outro", pattern: "A", energy: 0.28, bars: 2 }
  ],
  hook_first: [
    { section: "Hook", pattern: "B", energy: 0.92, bars: 4 },
    { section: "Verse", pattern: "A", energy: 0.62, bars: 4 },
    { section: "Hook", pattern: "B", energy: 0.95, bars: 4 },
    { section: "Bridge", pattern: "C", energy: 0.48, bars: 2 },
    { section: "Hook", pattern: "B", energy: 0.98, bars: 4 },
    { section: "Outro", pattern: "A", energy: 0.32, bars: 2 }
  ],
  breakdown: [
    { section: "Intro", pattern: "A", energy: 0.28, bars: 2 },
    { section: "Verse", pattern: "A", energy: 0.58, bars: 4 },
    { section: "Bridge", pattern: "C", energy: 0.36, bars: 2 },
    { section: "Hook", pattern: "B", energy: 0.9, bars: 4 },
    { section: "Bridge", pattern: "C", energy: 0.44, bars: 2 },
    { section: "Hook", pattern: "B", energy: 0.96, bars: 4 },
    { section: "Outro", pattern: "A", energy: 0.26, bars: 2 }
  ]
};

const starterPatternA: PatternData = withDrumDynamics({
  drumPattern: {
    kick: [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
    clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hat: [true, false, true, false, true, false, true, true, true, false, true, false, true, false, true, true],
    perc: [false, false, false, true, false, false, false, false, false, true, false, false, false, false, true, false]
  },
  bassNotes: [
    { step: 0, pitch: "F1", length: 2, glide: false, probability: 1 },
    { step: 6, pitch: "C2", length: 2, glide: true, probability: 1 },
    { step: 10, pitch: "Eb2", length: 2, glide: false, probability: 1 },
    { step: 12, pitch: "F1", length: 4, glide: false, probability: 1 }
  ],
  melodyNotes: [
    { step: 0, pitch: "F4", length: 2, velocity: 0.72, probability: 1 },
    { step: 3, pitch: "Ab4", length: 1, velocity: 0.62, probability: 1 },
    { step: 6, pitch: "C5", length: 2, velocity: 0.7, probability: 1 },
    { step: 10, pitch: "Eb5", length: 1, velocity: 0.6, probability: 1 },
    { step: 12, pitch: "C5", length: 3, velocity: 0.66, probability: 1 }
  ],
  chordEvents: [
    { step: 0, root: "F", quality: "min", length: 4, velocity: 0.55, probability: 1 },
    { step: 4, root: "Db", quality: "maj", length: 4, velocity: 0.46, probability: 1 },
    { step: 8, root: "Ab", quality: "maj", length: 4, velocity: 0.5, probability: 1 },
    { step: 12, root: "Eb", quality: "maj", length: 4, velocity: 0.5, probability: 1 }
  ]
}, { 7: 2, 15: 3 });

const starterPatternB: PatternData = withDrumDynamics({
  drumPattern: {
    kick: [true, false, false, false, false, true, false, false, true, false, false, false, true, false, true, false],
    clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hat: [true, true, true, false, true, false, true, true, true, true, true, false, true, false, true, true],
    perc: [false, false, true, false, false, false, false, true, false, false, true, false, false, true, false, false]
  },
  bassNotes: [
    { step: 0, pitch: "F1", length: 2, glide: false, probability: 1 },
    { step: 5, pitch: "Ab1", length: 1, glide: true, probability: 1 },
    { step: 8, pitch: "C2", length: 2, glide: false, probability: 1 },
    { step: 12, pitch: "Eb2", length: 2, glide: true, probability: 1 },
    { step: 14, pitch: "F1", length: 2, glide: false, probability: 1 }
  ],
  melodyNotes: [
    { step: 0, pitch: "C5", length: 2, velocity: 0.7, probability: 1 },
    { step: 2, pitch: "Eb5", length: 1, velocity: 0.62, probability: 1 },
    { step: 6, pitch: "F5", length: 2, velocity: 0.72, probability: 1 },
    { step: 9, pitch: "Ab4", length: 1, velocity: 0.58, probability: 1 },
    { step: 12, pitch: "C5", length: 2, velocity: 0.66, probability: 1 }
  ],
  chordEvents: [
    { step: 0, root: "F", quality: "min", length: 4, velocity: 0.5, probability: 1 },
    { step: 4, root: "C", quality: "min", length: 4, velocity: 0.44, probability: 1 },
    { step: 8, root: "Db", quality: "maj", length: 4, velocity: 0.48, probability: 1 },
    { step: 12, root: "Eb", quality: "maj", length: 4, velocity: 0.5, probability: 1 }
  ]
}, { 1: 2, 7: 2, 15: 3 });

const starterPatternC: PatternData = withDrumDynamics({
  drumPattern: {
    kick: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false],
    clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hat: [true, false, false, false, true, false, true, false, true, false, false, false, true, false, true, false],
    perc: [false, false, false, false, false, false, true, false, false, false, false, true, false, false, false, true]
  },
  bassNotes: [
    { step: 0, pitch: "F1", length: 4, glide: false, probability: 1 },
    { step: 8, pitch: "Db2", length: 4, glide: false, probability: 1 },
    { step: 14, pitch: "Eb2", length: 2, glide: true, probability: 1 }
  ],
  melodyNotes: [
    { step: 0, pitch: "Ab4", length: 3, velocity: 0.6, probability: 1 },
    { step: 4, pitch: "F4", length: 2, velocity: 0.54, probability: 1 },
    { step: 8, pitch: "Bb4", length: 3, velocity: 0.62, probability: 1 },
    { step: 12, pitch: "C5", length: 2, velocity: 0.58, probability: 1 }
  ],
  chordEvents: [
    { step: 0, root: "Db", quality: "maj", length: 4, velocity: 0.48, probability: 1 },
    { step: 4, root: "Eb", quality: "maj", length: 4, velocity: 0.45, probability: 1 },
    { step: 8, root: "F", quality: "min", length: 4, velocity: 0.52, probability: 1 },
    { step: 12, root: "C", quality: "min", length: 4, velocity: 0.42, probability: 1 }
  ]
}, { 14: 2 });

export const starterProject: ProjectState = {
  title: "Untitled Beat",
  mode: "guided",
  bpm: 145,
  key: "F minor",
  styleId: "trap",
  selectedPattern: "A",
  swing: 0.08,
  metronomeEnabled: false,
  sound: { ...soundPresetDefaults.clean_knock },
  patterns: {
    A: clonePatternData(starterPatternA),
    B: clonePatternData(starterPatternB),
    C: clonePatternData(starterPatternC)
  },
  mixer: [
    { id: "drum_rack", name: "Drums", volumeDb: -4, pan: 0, lowCut: 0.08, air: 0.24, drive: 0.16, glue: 0.26, muted: false, solo: false, accent: "#78f0c8" },
    { id: "bass_808", name: "808", volumeDb: -6, pan: 0, lowCut: 0, air: 0.1, drive: 0.22, glue: 0.18, muted: false, solo: false, accent: "#ff7a4f" },
    { id: "synth", name: "Synth", volumeDb: -8, pan: -12, lowCut: 0.18, air: 0.36, drive: 0.08, glue: 0.12, muted: false, solo: false, accent: "#8aa8ff" },
    { id: "chord", name: "Chord", volumeDb: -10, pan: 16, lowCut: 0.12, air: 0.28, drive: 0.06, glue: 0.18, muted: false, solo: false, accent: "#d58cff" },
    { id: "master", name: "Master", volumeDb: -1, pan: 0, lowCut: 0, air: 0, drive: 0, glue: 0, muted: false, solo: false, accent: "#f0c36a" }
  ],
  arrangement: createArrangementTemplate("full"),
  masterCeilingDb: masterPresetCeilingsDb["Headroom for Vocal"],
  masterPreset: "Headroom for Vocal"
};

export function masterPresetCeilingDb(preset: MasterPreset): number {
  return masterPresetCeilingsDb[preset];
}

export function soundPresetLabel(preset: SoundPresetId): string {
  return soundPresetLabels[preset];
}

export function chordProgressionPresetLabel(preset: ChordProgressionPreset): string {
  return chordProgressionPresetLabels[preset];
}

export function patternVariationPresetLabel(preset: PatternVariationPreset): string {
  return patternVariationPresetLabels[preset];
}

export function arrangementTemplateLabel(template: ArrangementTemplateId): string {
  return arrangementTemplateLabels[template];
}

export function arrangementMuteTrackLabel(track: ArrangementMuteTrack): string {
  return arrangementMuteTrackLabels[track];
}

export function createArrangementTemplate(template: ArrangementTemplateId): ArrangementBlock[] {
  return arrangementTemplateBlocks[template].map((block) => ({
    ...block,
    mutedTracks: normalizeArrangementMutedTracks(block.mutedTracks)
  }));
}

export function normalizeArrangementBars(value: unknown): number {
  if (!isFiniteNumber(value)) {
    return minArrangementBars;
  }
  return Math.min(maxArrangementBars, Math.max(minArrangementBars, Math.round(value)));
}

export function normalizeArrangementEnergy(value: unknown): number {
  if (!isFiniteNumber(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

export function arrangementEnergyGain(value: unknown): number {
  return 0.45 + normalizeArrangementEnergy(value) * 0.67;
}

export function normalizeArrangementMutedTracks(value: unknown): ArrangementMuteTrack[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return arrangementMuteTrackIds.filter((track) => value.includes(track));
}

export function arrangementBlockMutesTrack(block: ArrangementBlock | undefined, track: ArrangementMuteTrack): boolean {
  return Boolean(block?.mutedTracks.includes(track));
}

export function arrangementTotalBars(project: ProjectState): number {
  return project.arrangement.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
}

export function soundPresetDesign(preset: (typeof soundPresetIds)[number]): SoundDesign {
  return { ...soundPresetDefaults[preset] };
}

type PatternSeed = Omit<PatternData, "drumVelocities" | "drumTimings" | "drumProbabilities" | "hatRepeats">;

function withDrumDynamics(pattern: PatternSeed, repeatOverrides: Partial<Record<number, number>> = {}): PatternData {
  return {
    ...pattern,
    drumVelocities: defaultDrumVelocities(pattern.drumPattern),
    drumTimings: defaultDrumTimings(),
    drumProbabilities: defaultDrumProbabilities(),
    hatRepeats: defaultHatRepeats(pattern.drumPattern.hat, repeatOverrides)
  };
}

export function defaultDrumVelocity(lane: DrumLane, step: number): number {
  if (lane === "kick") {
    return step % 8 === 0 ? 0.98 : 0.86;
  }
  if (lane === "clap") {
    return step % 8 === 4 ? 0.9 : 0.76;
  }
  if (lane === "hat") {
    return step % 4 === 0 ? 0.72 : step % 2 === 0 ? 0.62 : 0.5;
  }
  return step % 4 === 0 ? 0.68 : 0.58;
}

export function normalizeDrumVelocity(value: number): number {
  if (!Number.isFinite(value)) {
    return 0.75;
  }
  return Math.min(1, Math.max(0.15, value));
}

export function normalizeDrumProbability(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(1, Math.max(0, value));
}

export function normalizeEventProbability(value: number): number {
  return normalizeDrumProbability(value);
}

export function normalizeHatRepeat(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(4, Math.max(1, Math.round(value)));
}

export function normalizeDrumTimingMs(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(maxDrumTimingMs, Math.max(minDrumTimingMs, Math.round(value)));
}

export function normalizeMixerEq(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

export function drumStepVelocity(pattern: PatternData, lane: DrumLane, step: number): number {
  return normalizeDrumVelocity(pattern.drumVelocities[lane]?.[step] ?? defaultDrumVelocity(lane, step));
}

export function drumStepTimingMs(pattern: PatternData, lane: DrumLane, step: number): number {
  return normalizeDrumTimingMs(pattern.drumTimings[lane]?.[step] ?? 0);
}

export function drumStepProbability(pattern: PatternData, lane: DrumLane, step: number): number {
  return normalizeDrumProbability(pattern.drumProbabilities[lane]?.[step] ?? 1);
}

export function drumStepShouldPlay(pattern: PatternData, lane: DrumLane, step: number, absoluteStep: number): boolean {
  if (!pattern.drumPattern[lane][step]) {
    return false;
  }
  const probability = drumStepProbability(pattern, lane, step);
  if (probability >= 1) {
    return true;
  }
  if (probability <= 0) {
    return false;
  }
  return probabilityGateValue(lane, step, absoluteStep) < probability;
}

export function noteEventShouldPlay(track: NoteTrack, note: BassNote | MelodyNote, absoluteStep: number): boolean {
  const probability = normalizeEventProbability(note.probability);
  if (probability >= 1) {
    return true;
  }
  if (probability <= 0) {
    return false;
  }
  return probabilityGateValue(track, note.step, absoluteStep) < probability;
}

export function chordEventShouldPlay(chord: ChordEvent, absoluteStep: number): boolean {
  const probability = normalizeEventProbability(chord.probability);
  if (probability >= 1) {
    return true;
  }
  if (probability <= 0) {
    return false;
  }
  return probabilityGateValue("chord", chord.step, absoluteStep) < probability;
}

export function hatRepeatCount(pattern: PatternData, step: number): number {
  return pattern.drumPattern.hat[step] ? normalizeHatRepeat(pattern.hatRepeats[step] ?? 1) : 1;
}

export function sidechainGainForStep(pattern: PatternData, step: number, amount: number, absoluteStep = step): number {
  const depth = clampUnit(amount);
  if (depth <= 0) {
    return 1;
  }

  const releaseShape = [1, 0.58, 0.26, 0.08];
  const strongestKick = releaseShape.reduce((strongest, shape, offset) => {
    const kickStep = positiveModulo(step - offset, stepsPerBar);
    if (!drumStepShouldPlay(pattern, "kick", kickStep, absoluteStep - offset)) {
      return strongest;
    }
    return Math.max(strongest, shape * drumStepVelocity(pattern, "kick", kickStep));
  }, 0);

  return Math.max(0.28, 1 - depth * 0.72 * strongestKick);
}

export function drumGroovePresetLabel(preset: DrumGroovePreset): string {
  return drumGroovePresetLabels[preset];
}

export function applyDrumGroovePreset(pattern: PatternData, preset: DrumGroovePreset): PatternData {
  return {
    ...pattern,
    drumVelocities: Object.fromEntries(
      drumLanes.map((lane) => [
        lane,
        pattern.drumVelocities[lane].map((velocity, step) =>
          pattern.drumPattern[lane][step] ? grooveVelocity(lane, step, preset, velocity) : velocity
        )
      ])
    ) as DrumVelocities,
    drumTimings: Object.fromEntries(
      drumLanes.map((lane) => [
        lane,
        pattern.drumTimings[lane].map((timing, step) => (pattern.drumPattern[lane][step] ? grooveTimingMs(lane, step, preset) : 0))
      ])
    ) as DrumTimings
  };
}

export function createPatternVariation(pattern: PatternData, preset: PatternVariationPreset): PatternData {
  const variation = clonePatternData(pattern);
  if (preset === "subtle") {
    applySubtleVariation(variation);
    return applyDrumGroovePreset(variation, "pocket");
  }
  if (preset === "hook") {
    applyHookVariation(variation);
    return applyDrumGroovePreset(variation, "push");
  }
  applyBreakdownVariation(variation);
  return applyDrumGroovePreset(variation, "tight");
}

function applySubtleVariation(pattern: PatternData): void {
  setDrumStep(pattern, "kick", 10, true, 0.68, 0.72, -4);
  setDrumStep(pattern, "perc", 3, true, 0.58, 0.64, 8);
  setDrumStep(pattern, "perc", 11, true, 0.54, 0.58, 10);
  setDrumStep(pattern, "hat", 15, true, 0.62, 0.76, -6, 2);
  pattern.bassNotes = pattern.bassNotes.map((note, index) => ({
    ...note,
    probability: index % 3 === 2 ? Math.min(1, normalizeEventProbability(note.probability) * 0.86) : normalizeEventProbability(note.probability)
  }));
  pattern.melodyNotes = pattern.melodyNotes.map((note, index) => ({
    ...note,
    velocity: Math.min(1, note.velocity + (index % 2 === 0 ? 0.04 : -0.02)),
    probability: index % 3 === 1 ? 0.82 : normalizeEventProbability(note.probability)
  }));
  pattern.chordEvents = pattern.chordEvents.map((event, index) => ({
    ...event,
    velocity: Math.min(1, event.velocity + (index % 2 === 0 ? 0.04 : 0))
  }));
}

function applyHookVariation(pattern: PatternData): void {
  [0, 5, 8, 12, 14].forEach((step) => setDrumStep(pattern, "kick", step, true, step === 0 || step === 12 ? 1 : 0.88, 1, step === 14 ? -7 : 0));
  [4, 12].forEach((step) => setDrumStep(pattern, "clap", step, true, 0.94, 1, 2));
  [0, 2, 4, 6, 8, 10, 12, 14, 15].forEach((step) =>
    setDrumStep(pattern, "hat", step, true, step % 4 === 0 ? 0.78 : 0.64, 1, step % 2 === 0 ? -5 : -8, step === 15 ? 3 : 1)
  );
  [2, 7, 10, 13].forEach((step) => setDrumStep(pattern, "perc", step, true, 0.68, step === 13 ? 0.78 : 1, step % 2 === 0 ? -6 : 7));
  pattern.bassNotes = sortBassNotes(
    pattern.bassNotes.map((note, index) => ({
      ...note,
      glide: note.glide || index === pattern.bassNotes.length - 1,
      length: clampEventLength(note.length + (index % 2 === 0 ? 1 : 0), note.step),
      probability: 1
    }))
  );
  pattern.melodyNotes = sortMelodyNotes(
    pattern.melodyNotes.map((note, index) => ({
      ...note,
      length: clampEventLength(index % 3 === 0 ? note.length + 1 : note.length, note.step),
      velocity: Math.min(1, note.velocity + 0.12),
      probability: 1
    }))
  );
  pattern.chordEvents = pattern.chordEvents.map((event) => ({ ...event, velocity: Math.min(1, event.velocity + 0.12), probability: 1 }));
}

function applyBreakdownVariation(pattern: PatternData): void {
  const firstKick = pattern.drumPattern.kick.findIndex(Boolean);
  const anchorKick = firstKick >= 0 ? firstKick : 0;
  pattern.drumPattern.kick = steps.map((step) => step === anchorKick || step === 8);
  pattern.drumPattern.clap = steps.map((step) => step === 12 && pattern.drumPattern.clap.some(Boolean));
  pattern.drumPattern.hat = steps.map((step) => [0, 8, 12].includes(step));
  pattern.drumPattern.perc = steps.map(() => false);
  pattern.drumVelocities = defaultDrumVelocities(pattern.drumPattern);
  pattern.drumProbabilities = defaultDrumProbabilities();
  pattern.drumTimings = defaultDrumTimings();
  pattern.hatRepeats = defaultHatRepeats(pattern.drumPattern.hat);
  pattern.bassNotes = sortBassNotes(
    pattern.bassNotes.slice(0, Math.max(1, Math.min(2, pattern.bassNotes.length))).map((note, index) => ({
      ...note,
      length: clampEventLength(index === 0 ? Math.max(note.length, 4) : note.length, note.step),
      glide: false,
      probability: 1
    }))
  );
  pattern.melodyNotes = sortMelodyNotes(
    pattern.melodyNotes
      .filter((note, index) => index % 2 === 0 || note.step % 8 === 0)
      .map((note) => ({ ...note, velocity: Math.max(0.28, note.velocity - 0.18), probability: 0.72 }))
  );
  pattern.chordEvents = pattern.chordEvents.map((event, index) => ({
    ...event,
    velocity: Math.max(0.28, event.velocity - 0.12),
    probability: index <= 1 ? 1 : 0.72
  }));
}

function setDrumStep(
  pattern: PatternData,
  lane: DrumLane,
  step: number,
  active: boolean,
  velocity = defaultDrumVelocity(lane, step),
  probability = 1,
  timing = 0,
  repeat = 1
): void {
  const normalizedStep = normalizeStep(step);
  pattern.drumPattern[lane][normalizedStep] = active;
  pattern.drumVelocities[lane][normalizedStep] = active ? normalizeDrumVelocity(velocity) : pattern.drumVelocities[lane][normalizedStep];
  pattern.drumProbabilities[lane][normalizedStep] = active ? normalizeDrumProbability(probability) : 1;
  pattern.drumTimings[lane][normalizedStep] = active ? normalizeDrumTimingMs(timing) : 0;
  if (lane === "hat") {
    pattern.hatRepeats[normalizedStep] = active ? normalizeHatRepeat(repeat) : 1;
  }
}

function clampEventLength(length: number, step: number): number {
  if (!Number.isFinite(length)) {
    return 1;
  }
  const normalizedStep = normalizeStep(step);
  return Math.min(stepsPerBar - normalizedStep, Math.max(1, Math.round(length)));
}

function sortBassNotes(notes: BassNote[]): BassNote[] {
  return [...notes].sort((first, second) => first.step - second.step || first.pitch.localeCompare(second.pitch));
}

function sortMelodyNotes(notes: MelodyNote[]): MelodyNote[] {
  return [...notes].sort((first, second) => first.step - second.step || first.pitch.localeCompare(second.pitch));
}

function defaultDrumVelocities(drumPattern: DrumPattern): DrumVelocities {
  return {
    kick: steps.map((step) => (drumPattern.kick[step] ? defaultDrumVelocity("kick", step) : 0.72)),
    clap: steps.map((step) => (drumPattern.clap[step] ? defaultDrumVelocity("clap", step) : 0.68)),
    hat: steps.map((step) => (drumPattern.hat[step] ? defaultDrumVelocity("hat", step) : 0.56)),
    perc: steps.map((step) => (drumPattern.perc[step] ? defaultDrumVelocity("perc", step) : 0.58))
  };
}

function defaultDrumProbabilities(): DrumProbabilities {
  return {
    kick: steps.map(() => 1),
    clap: steps.map(() => 1),
    hat: steps.map(() => 1),
    perc: steps.map(() => 1)
  };
}

function probabilityGateValue(lane: DrumLane | NoteTrack | "chord", step: number, absoluteStep: number): number {
  const laneSalt: Record<DrumLane | NoteTrack | "chord", number> = { kick: 11, clap: 23, hat: 37, perc: 53, bass: 71, melody: 89, chord: 107 };
  let hash = Math.imul(absoluteStep + 1, 1103515245) ^ Math.imul(step + 1, 12345) ^ Math.imul(laneSalt[lane], 265443576);
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}

function grooveVelocity(lane: DrumLane, step: number, preset: DrumGroovePreset, current: number): number {
  if (preset === "reset") {
    return defaultDrumVelocity(lane, step);
  }

  const base = defaultDrumVelocity(lane, step);
  const accent = step % 4 === 0 ? 0.04 : step % 2 === 0 ? 0.01 : -0.03;
  if (preset === "tight") {
    return normalizeDrumVelocity(base + accent * 0.7);
  }
  if (preset === "pocket") {
    const lanePush = lane === "clap" ? 0.05 : lane === "hat" ? -0.04 : lane === "perc" ? -0.02 : 0.02;
    return normalizeDrumVelocity(base + accent + lanePush);
  }
  if (preset === "push") {
    const lift = lane === "hat" || lane === "perc" ? 0.05 : 0.03;
    return normalizeDrumVelocity(Math.max(current, base) + accent * 0.5 + lift);
  }
  return normalizeDrumVelocity(current);
}

function grooveTimingMs(lane: DrumLane, step: number, preset: DrumGroovePreset): number {
  if (preset === "reset") {
    return 0;
  }

  if (preset === "tight") {
    const timing = lane === "clap" ? 5 : lane === "hat" ? (step % 2 === 0 ? -3 : 4) : lane === "perc" ? (step % 4 === 0 ? -4 : 6) : 0;
    return normalizeDrumTimingMs(timing);
  }

  if (preset === "pocket") {
    const timing = lane === "clap" ? 17 : lane === "hat" ? (step % 2 === 0 ? 6 : 11) : lane === "perc" ? 13 : step % 8 === 0 ? 0 : -5;
    return normalizeDrumTimingMs(timing);
  }

  if (preset === "push") {
    const timing = lane === "clap" ? -6 : lane === "hat" ? (step % 2 === 0 ? -12 : -7) : lane === "perc" ? -10 : step % 8 === 0 ? -4 : -8;
    return normalizeDrumTimingMs(timing);
  }

  return 0;
}

function defaultDrumTimings(): DrumTimings {
  return {
    kick: steps.map(() => 0),
    clap: steps.map(() => 0),
    hat: steps.map(() => 0),
    perc: steps.map(() => 0)
  };
}

function defaultHatRepeats(hatSteps: boolean[], repeatOverrides: Partial<Record<number, number>> = {}): number[] {
  return steps.map((step) => {
    if (!hatSteps[step]) {
      return 1;
    }
    if (repeatOverrides[step] !== undefined) {
      return normalizeHatRepeat(repeatOverrides[step] ?? 1);
    }
    return step % 16 === 15 ? 2 : 1;
  });
}

const stylePatternBlueprints: Record<StyleId, [PatternBlueprint, PatternBlueprint, PatternBlueprint]> = {
  trap: [
    blueprint([0, 6, 12], [4, 12], [0, 2, 4, 7, 8, 10, 12, 14, 15], [3, 9, 14], [0, 6, 10, 12], [0, 3, 6, 10, 12], [0, 3, 5, 4]),
    blueprint([0, 5, 8, 12, 14], [4, 12], [0, 1, 2, 4, 6, 7, 8, 9, 10, 12, 14, 15], [2, 7, 10, 13], [0, 5, 8, 12, 14], [4, 5, 7, 3, 4], [0, 4, 3, 5]),
    blueprint([0, 8, 14], [4, 12], [0, 4, 6, 8, 12, 14], [6, 11, 15], [0, 8, 14], [3, 0, 4, 5], [3, 5, 0, 4])
  ],
  drill: [
    blueprint([0, 6, 11], [4, 12], [0, 2, 4, 7, 8, 10, 12, 15], [3, 9, 14], [0, 6, 11, 14], [4, 5, 3], [0, 5]),
    blueprint([0, 5, 8, 13], [4, 12], [0, 1, 3, 4, 6, 8, 10, 11, 12, 14, 15], [2, 7, 10, 15], [0, 5, 8, 13], [5, 4, 3], [0, 3, 5, 4]),
    blueprint([0, 8, 14], [4, 12], [0, 4, 6, 8, 12, 15], [7, 11], [0, 8, 14], [3, 1], [5, 0])
  ],
  boom_bap: [
    blueprint([0, 3, 7, 10], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14], [6, 11, 15], [0, 3, 7, 10, 14], [0, 2, 4, 3], [0, 3, 4, 2]),
    blueprint([0, 2, 6, 9, 14], [4, 12], [0, 2, 4, 5, 8, 10, 12, 13], [3, 7, 11], [0, 2, 6, 9, 14], [4, 2, 0, 5], [0, 4, 3, 5]),
    blueprint([0, 7, 10], [4, 12], [0, 4, 6, 8, 12, 14], [2, 11], [0, 7, 12], [2, 4], [3, 0])
  ],
  lofi: [
    blueprint([0, 6, 10], [4, 12], [0, 4, 8, 12], [3, 11], [0, 6, 10], [2, 4, 1], [0, 3, 5, 4]),
    blueprint([0, 5, 9, 14], [4, 12], [0, 3, 4, 8, 11, 12], [6, 15], [0, 5, 9, 14], [4, 2, 5], [0, 5, 3, 4]),
    blueprint([0, 8], [4, 12], [0, 8, 12], [10], [0, 8], [5, 4], [5, 0])
  ],
  house: [
    blueprint([0, 4, 8, 12], [4, 12], [2, 6, 10, 14], [3, 7, 11, 15], [0, 3, 6, 10, 14], [0, 2, 4, 5], [0, 3, 4, 5]),
    blueprint([0, 4, 8, 12], [4, 12], [2, 3, 6, 7, 10, 11, 14, 15], [5, 9, 13], [0, 2, 4, 6, 10, 14], [4, 5, 2, 0], [0, 4, 3, 5]),
    blueprint([0, 4, 8, 12], [4, 12], [2, 6, 10, 14], [7, 15], [0, 8], [0, 3], [0, 3])
  ],
  rnb: [
    blueprint([0, 7, 10], [4, 12], [0, 3, 6, 8, 11, 14], [5, 13], [0, 7, 12], [4, 2, 5], [0, 5, 3, 4]),
    blueprint([0, 6, 9, 14], [4, 12], [0, 2, 5, 8, 10, 13, 15], [3, 11], [0, 6, 9, 14], [5, 4, 2, 0], [0, 3, 5, 4]),
    blueprint([0, 8], [4, 12], [0, 6, 8, 14], [11], [0, 8], [4, 2], [3, 0])
  ],
  garage: [
    blueprint([0, 6, 10, 14], [4, 12], [1, 3, 6, 8, 10, 13, 15], [5, 9], [0, 3, 6, 10, 14], [0, 2, 4, 5], [0, 3, 4, 5]),
    blueprint([0, 5, 8, 11, 14], [4, 12], [1, 2, 5, 7, 9, 10, 13, 15], [3, 6, 12], [0, 2, 5, 8, 12, 14], [4, 2, 5, 0], [0, 4, 3, 5]),
    blueprint([0, 8, 14], [4, 12], [2, 6, 10, 14], [7, 11], [0, 8, 14], [0, 3], [5, 0])
  ],
  experimental: [
    blueprint([0, 5, 11], [3, 12], [0, 1, 4, 7, 9, 14], [2, 6, 13], [0, 5, 11, 14], [6, 2, 5], [0, 2, 5]),
    blueprint([1, 4, 8, 15], [6, 13], [0, 3, 5, 10, 12, 15], [2, 7, 11, 14], [1, 4, 8, 12], [5, 1, 6, 3], [2, 6, 3, 0]),
    blueprint([0, 9], [5, 14], [1, 8, 15], [4, 10], [0, 9], [6, 4], [6, 0])
  ]
};

export function styleSoundPreset(styleId: StyleId): (typeof soundPresetIds)[number] {
  switch (styleId) {
    case "trap":
    case "garage":
      return "club_punch";
    case "boom_bap":
    case "lofi":
      return "warm_tape";
    case "rnb":
      return "clean_knock";
    case "drill":
    case "house":
    case "experimental":
      return "air_space";
  }
}

export function createStylePatternSet(styleId: StyleId, key: string): Record<PatternSlot, PatternData> {
  const [patternA, patternB, patternC] = stylePatternBlueprints[styleId];
  return {
    A: patternFromBlueprint(key, patternA),
    B: patternFromBlueprint(key, patternB),
    C: patternFromBlueprint(key, patternC)
  };
}

function blueprint(
  kick: number[],
  clap: number[],
  hat: number[],
  perc: number[],
  bassDegrees: number[],
  melodyDegrees: number[],
  chordDegrees: number[]
): PatternBlueprint {
  return {
    kick,
    clap,
    hat,
    perc,
    bass: bassDegrees.map((degree, index) => ({
      step: [0, 3, 6, 10, 14][index] ?? (index * 3) % 16,
      degree,
      octave: index > 3 ? 2 : 1,
      length: index === 0 ? 3 : 2,
      glide: index % 3 === 1
    })),
    melody: melodyDegrees.map((degree, index) => ({
      step: [0, 3, 6, 10, 13][index] ?? (index * 4) % 16,
      degree,
      octave: index > 3 ? 5 : 4,
      length: index % 2 === 0 ? 2 : 1,
      velocity: 0.56 + (index % 3) * 0.04
    })),
    chords: chordDegrees.map((degree, index) => ({
      step: index * 4,
      degree,
      length: 4,
      velocity: 0.42 + (index % 2) * 0.04
    }))
  };
}

function patternFromBlueprint(key: string, pattern: PatternBlueprint): PatternData {
  const drums = drumPattern(pattern.kick, pattern.clap, pattern.hat, pattern.perc);
  return withDrumDynamics({
    drumPattern: drums,
    bassNotes: pattern.bass.map((note) => ({
      step: note.step,
      pitch: pitchFromDegree(key, note.degree, note.octave),
      length: note.length,
      glide: note.glide ?? false,
      probability: 1
    })),
    melodyNotes: pattern.melody.map((note) => ({
      step: note.step,
      pitch: pitchFromDegree(key, note.degree, note.octave),
      length: note.length,
      velocity: note.velocity ?? 0.64,
      probability: 1
    })),
    chordEvents: pattern.chords.map((chord) => ({
      step: chord.step,
      root: rootFromDegree(key, chord.degree),
      quality: chord.quality ?? chordQualityFromDegree(key, chord.degree),
      length: chord.length,
      velocity: chord.velocity,
      probability: 1
    }))
  }, hatRepeatOverrides(pattern.hat));
}

export function createChordProgressionPreset(preset: ChordProgressionPreset, key: string): ChordEvent[] {
  return chordProgressionPresetBlueprints[preset].map((chord) => chordFromBlueprint(key, chord));
}

export function createNextChordEvent(key: string, chords: ChordEvent[]): ChordEvent {
  const sortedChords = [...chords].sort((first, second) => first.step - second.step);
  const lastChord = sortedChords[sortedChords.length - 1];
  const usedSteps = new Set(sortedChords.map((chord) => chord.step));
  const quarterStep = [0, 4, 8, 12].find((step) => !usedSteps.has(step));
  const step =
    quarterStep ??
    (lastChord ? Math.min(stepsPerBar - 1, lastChord.step + Math.max(1, lastChord.length)) : 0);
  const degree = sortedChords.length % scalePitchNames(key).length;
  return chordFromBlueprint(key, { step, degree, length: Math.min(4, stepsPerBar - step), velocity: 0.5 });
}

function chordFromBlueprint(key: string, chord: ChordBlueprint): ChordEvent {
  return {
    step: normalizeStep(chord.step),
    root: rootFromDegree(key, chord.degree),
    quality: chord.quality ?? chordQualityFromDegree(key, chord.degree),
    length: normalizeChordLength(chord.length, chord.step),
    velocity: normalizeChordVelocity(chord.velocity),
    probability: 1
  };
}

function drumPattern(kick: number[], clap: number[], hat: number[], perc: number[]): DrumPattern {
  return {
    kick: steps.map((step) => kick.includes(step)),
    clap: steps.map((step) => clap.includes(step)),
    hat: steps.map((step) => hat.includes(step)),
    perc: steps.map((step) => perc.includes(step))
  };
}

function hatRepeatOverrides(hatSteps: number[]): Partial<Record<number, number>> {
  return Object.fromEntries(
    hatSteps
      .filter((step) => step % 8 === 7 || step % 16 === 15 || step === 1)
      .map((step) => [step, step % 16 === 15 ? 3 : 2])
  );
}

function pitchFromDegree(key: string, degree: number, octave: number): string {
  const names = scalePitchNames(key);
  return `${names[positiveModulo(degree, names.length)]}${octave + Math.floor(degree / names.length)}`;
}

function normalizeStep(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(stepsPerBar - 1, Math.max(0, Math.round(value)));
}

function normalizeChordLength(length: number, step: number): number {
  if (!Number.isFinite(length)) {
    return 1;
  }
  const normalizedStep = normalizeStep(step);
  return Math.min(stepsPerBar - normalizedStep, Math.max(1, Math.round(length)));
}

function normalizeChordVelocity(velocity: number): number {
  if (!Number.isFinite(velocity)) {
    return 0.5;
  }
  return Math.min(1, Math.max(0, velocity));
}

function rootFromDegree(key: string, degree: number): string {
  const names = scalePitchNames(key);
  return names[positiveModulo(degree, names.length)] ?? names[0];
}

function chordQualityFromDegree(key: string, degree: number): ChordQuality {
  const [, mode = "minor"] = key.split(" ");
  const majorQualities: ChordQuality[] = ["maj", "min", "min", "maj", "maj", "min", "dim"];
  const dorianQualities: ChordQuality[] = ["min", "min", "maj", "maj", "min", "dim", "maj"];
  const minorQualities: ChordQuality[] = ["min", "dim", "maj", "min", "min", "maj", "maj"];
  const qualities = mode === "major" ? majorQualities : mode === "dorian" ? dorianQualities : minorQualities;
  return qualities[positiveModulo(degree, qualities.length)] ?? "min";
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

export function getStyle(project: ProjectState): StyleProfile {
  return styleProfiles.find((style) => style.id === project.styleId) ?? styleProfiles[0];
}

export function activePattern(project: ProjectState): PatternData {
  return patternForSlot(project, project.selectedPattern);
}

export function patternForSlot(project: ProjectState, slot: PatternSlot): PatternData {
  return project.patterns[slot] ?? project.patterns.A;
}

export function clonePatternData(pattern: PatternData): PatternData {
  return {
    drumPattern: {
      kick: [...pattern.drumPattern.kick],
      clap: [...pattern.drumPattern.clap],
      hat: [...pattern.drumPattern.hat],
      perc: [...pattern.drumPattern.perc]
    },
    drumVelocities: {
      kick: [...pattern.drumVelocities.kick],
      clap: [...pattern.drumVelocities.clap],
      hat: [...pattern.drumVelocities.hat],
      perc: [...pattern.drumVelocities.perc]
    },
    drumTimings: {
      kick: [...pattern.drumTimings.kick],
      clap: [...pattern.drumTimings.clap],
      hat: [...pattern.drumTimings.hat],
      perc: [...pattern.drumTimings.perc]
    },
    drumProbabilities: {
      kick: [...pattern.drumProbabilities.kick],
      clap: [...pattern.drumProbabilities.clap],
      hat: [...pattern.drumProbabilities.hat],
      perc: [...pattern.drumProbabilities.perc]
    },
    hatRepeats: [...pattern.hatRepeats],
    bassNotes: pattern.bassNotes.map((note) => ({ ...note })),
    melodyNotes: pattern.melodyNotes.map((note) => ({ ...note })),
    chordEvents: pattern.chordEvents.map((event) => ({ ...event }))
  };
}

export function createEmptyPatternData(): PatternData {
  return withDrumDynamics({
    drumPattern: {
      kick: steps.map(() => false),
      clap: steps.map(() => false),
      hat: steps.map(() => false),
      perc: steps.map(() => false)
    },
    bassNotes: [],
    melodyNotes: [],
    chordEvents: []
  });
}

export function projectFileName(project: ProjectState): string {
  const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${slug || "grooveforge-project"}.grooveforge.json`;
}

export function serializeProjectFile(project: ProjectState): string {
  const file: ProjectFile = {
    app: "GrooveForge",
    fileVersion: projectFileVersion,
    savedAt: new Date().toISOString(),
    project
  };
  return `${JSON.stringify(file, null, 2)}\n`;
}

export function parseProjectFile(contents: string): ProjectState {
  const parsed: unknown = JSON.parse(contents);
  const candidate = isRecord(parsed) && parsed.app === "GrooveForge" && isRecord(parsed.project) ? parsed.project : parsed;
  const project = normalizeProjectState(candidate);
  if (!project) {
    throw new Error("Invalid GrooveForge project file.");
  }
  return project;
}

export function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}

export function stepDurationSeconds(bpm: number): number {
  return 60 / bpm / 4;
}

export function projectStepDurationSeconds(project: ProjectState): number {
  return stepDurationSeconds(project.bpm);
}

export function loopStepCount(bars: number): number {
  return bars * stepsPerBar;
}

export function stepToSeconds(project: ProjectState, absoluteStep: number): number {
  return absoluteStep * projectStepDurationSeconds(project);
}

export function scalePitchNames(key: string): string[] {
  const [tonic = "C", mode = "minor"] = key.split(" ");
  const root = tonicIndex[tonic] ?? 0;
  const intervals = scaleIntervals[mode] ?? scaleIntervals.minor;
  const noteNames = tonic.includes("b") || ["F", "Bb", "Eb", "Ab", "Db"].includes(tonic) ? flatNotes : sharpNotes;
  return intervals.map((interval) => noteNames[(root + interval) % 12]);
}

export function scalePitches(key: string, startOctave: number): string[] {
  const [tonic = "C", mode = "minor"] = key.split(" ");
  const root = tonicIndex[tonic] ?? 0;
  const intervals = scaleIntervals[mode] ?? scaleIntervals.minor;
  const names = scalePitchNames(key);
  let octave = startOctave;
  let previousIndex = root;
  const pitches = intervals.map((interval, index) => {
    const pitchIndex = (root + interval) % 12;
    if (index > 0 && pitchIndex < previousIndex) {
      octave += 1;
    }
    previousIndex = pitchIndex;
    return `${names[index]}${octave}`;
  });
  return [...pitches, `${names[0]}${startOctave + 1}`];
}

export function bassPitchLanes(key: string): string[] {
  return scalePitches(key, 1);
}

export function melodyPitchLanes(key: string): string[] {
  return scalePitches(key, 4);
}

export function noteToFrequency(note: string): number {
  const match = /^([A-G])(#|b)?(-?\d+)$/.exec(note);
  if (!match) {
    return 440;
  }
  const [, letter, accidental = "", octaveText] = match;
  const semitones: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11
  };
  const octave = Number(octaveText);
  const accidentalOffset = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  const midi = (octave + 1) * 12 + semitones[letter] + accidentalOffset;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function chordPitches(chord: ChordEvent, octave = 3): string[] {
  const root = tonicIndex[chord.root] ?? 0;
  const names = chord.root.includes("b") ? flatNotes : sharpNotes;
  return chordIntervals[chord.quality].map((interval) => {
    const absolute = root + interval;
    const pitchIndex = absolute % 12;
    const octaveOffset = Math.floor(absolute / 12);
    return `${names[pitchIndex]}${octave + octaveOffset}`;
  });
}

function normalizePatternData(pattern: PatternDataInput): PatternData {
  const drumPattern = pattern.drumPattern;
  return {
    drumPattern,
    drumVelocities: normalizeDrumVelocities(pattern.drumVelocities, drumPattern),
    drumTimings: normalizeDrumTimings(pattern.drumTimings),
    drumProbabilities: normalizeDrumProbabilities(pattern.drumProbabilities),
    hatRepeats: normalizeHatRepeats(pattern.hatRepeats, drumPattern.hat),
    bassNotes: normalizeBassNotes(pattern.bassNotes),
    melodyNotes: normalizeMelodyNotes(pattern.melodyNotes),
    chordEvents: normalizeChordEvents(pattern.chordEvents)
  };
}

function normalizePatternMap(patterns: Record<PatternSlot, PatternDataInput>): Record<PatternSlot, PatternData> {
  return {
    A: normalizePatternData(patterns.A),
    B: normalizePatternData(patterns.B),
    C: normalizePatternData(patterns.C)
  };
}

function normalizeMixerChannels(channels: MixerChannelInput[]): MixerChannel[] {
  return channels.map((channel) => ({
    ...channel,
    lowCut: normalizeMixerEq(channel.lowCut ?? 0),
    air: normalizeMixerEq(channel.air ?? 0),
    drive: normalizeMixerEq(channel.drive ?? 0),
    glue: normalizeMixerEq(channel.glue ?? 0)
  }));
}

function normalizeArrangement(arrangement: ArrangementBlockInput[]): ArrangementBlock[] {
  return arrangement.map((block) => ({
    section: block.section,
    pattern: block.pattern,
    energy: normalizeArrangementEnergy(block.energy),
    bars: normalizeArrangementBars(block.bars),
    mutedTracks: normalizeArrangementMutedTracks(block.mutedTracks)
  }));
}

function normalizeDrumVelocities(value: DrumVelocities | undefined, drumPattern: DrumPattern): DrumVelocities {
  if (!value) {
    return defaultDrumVelocities(drumPattern);
  }
  return {
    kick: steps.map((step) => normalizeDrumVelocity(value.kick[step] ?? defaultDrumVelocity("kick", step))),
    clap: steps.map((step) => normalizeDrumVelocity(value.clap[step] ?? defaultDrumVelocity("clap", step))),
    hat: steps.map((step) => normalizeDrumVelocity(value.hat[step] ?? defaultDrumVelocity("hat", step))),
    perc: steps.map((step) => normalizeDrumVelocity(value.perc[step] ?? defaultDrumVelocity("perc", step)))
  };
}

function normalizeDrumTimings(value: DrumTimings | undefined): DrumTimings {
  if (!value) {
    return defaultDrumTimings();
  }
  return {
    kick: steps.map((step) => normalizeDrumTimingMs(value.kick[step] ?? 0)),
    clap: steps.map((step) => normalizeDrumTimingMs(value.clap[step] ?? 0)),
    hat: steps.map((step) => normalizeDrumTimingMs(value.hat[step] ?? 0)),
    perc: steps.map((step) => normalizeDrumTimingMs(value.perc[step] ?? 0))
  };
}

function normalizeDrumProbabilities(value: DrumProbabilities | undefined): DrumProbabilities {
  if (!value) {
    return defaultDrumProbabilities();
  }
  return {
    kick: steps.map((step) => normalizeDrumProbability(value.kick[step] ?? 1)),
    clap: steps.map((step) => normalizeDrumProbability(value.clap[step] ?? 1)),
    hat: steps.map((step) => normalizeDrumProbability(value.hat[step] ?? 1)),
    perc: steps.map((step) => normalizeDrumProbability(value.perc[step] ?? 1))
  };
}

function normalizeBassNotes(notes: BassNoteInput[]): BassNote[] {
  return notes.map((note) => ({
    ...note,
    probability: normalizeEventProbability(note.probability ?? 1)
  }));
}

function normalizeMelodyNotes(notes: MelodyNoteInput[]): MelodyNote[] {
  return notes.map((note) => ({
    ...note,
    probability: normalizeEventProbability(note.probability ?? 1)
  }));
}

function normalizeChordEvents(events: ChordEventInput[] | undefined): ChordEvent[] {
  return (
    events?.map((event) => ({
      ...event,
      probability: normalizeEventProbability(event.probability ?? 1)
    })) ?? []
  );
}

function normalizeHatRepeats(value: number[] | undefined, hatSteps: boolean[]): number[] {
  if (!value) {
    return defaultHatRepeats(hatSteps);
  }
  return steps.map((step) => (hatSteps[step] ? normalizeHatRepeat(value[step] ?? 1) : 1));
}

function normalizeSoundDesign(sound: SoundDesignInput | undefined): SoundDesign {
  if (!sound) {
    return { ...soundPresetDefaults.clean_knock };
  }
  return {
    preset: sound.preset ?? "custom",
    kickPunch: clampUnit(sound.kickPunch),
    snareSnap: clampUnit(sound.snareSnap),
    hatBrightness: clampUnit(sound.hatBrightness),
    bassDrive: clampUnit(sound.bassDrive),
    bassDecay: clampUnit(sound.bassDecay),
    sidechainDuck: clampUnit(sound.sidechainDuck),
    synthBrightness: clampUnit(sound.synthBrightness),
    synthRelease: clampUnit(sound.synthRelease),
    chordWarmth: clampUnit(sound.chordWarmth),
    chordWidth: clampUnit(sound.chordWidth)
  };
}

function normalizeProjectState(value: unknown): ProjectState | null {
  if (isProjectStateShape(value)) {
    return {
      ...value,
      metronomeEnabled: value.metronomeEnabled ?? false,
      sound: normalizeSoundDesign(value.sound),
      patterns: normalizePatternMap(value.patterns),
      mixer: normalizeMixerChannels(value.mixer),
      arrangement: normalizeArrangement(value.arrangement)
    };
  }

  if (isLegacyProjectState(value)) {
    const legacyPattern = normalizePatternData({
      drumPattern: value.drumPattern,
      bassNotes: value.bassNotes,
      melodyNotes: value.melodyNotes
    });
    return {
      title: value.title,
      mode: value.mode,
      bpm: value.bpm,
      key: value.key,
      styleId: value.styleId,
      selectedPattern: value.selectedPattern,
      swing: value.swing,
      metronomeEnabled: value.metronomeEnabled ?? false,
      sound: normalizeSoundDesign(value.sound),
      patterns: {
        A: clonePatternData(legacyPattern),
        B: clonePatternData(legacyPattern),
        C: clonePatternData(legacyPattern)
      },
      mixer: normalizeMixerChannels(value.mixer),
      arrangement: normalizeArrangement(value.arrangement),
      masterCeilingDb: value.masterCeilingDb,
      masterPreset: value.masterPreset
    };
  }

  return null;
}

type BassNoteInput = Omit<BassNote, "probability"> & { probability?: number };
type MelodyNoteInput = Omit<MelodyNote, "probability"> & { probability?: number };
type ChordEventInput = Omit<ChordEvent, "probability"> & { probability?: number };
type PatternDataInput = Omit<PatternData, "bassNotes" | "melodyNotes" | "chordEvents" | "drumVelocities" | "drumTimings" | "drumProbabilities" | "hatRepeats"> & {
  bassNotes: BassNoteInput[];
  melodyNotes: MelodyNoteInput[];
  chordEvents?: ChordEventInput[];
  drumVelocities?: DrumVelocities;
  drumTimings?: DrumTimings;
  drumProbabilities?: DrumProbabilities;
  hatRepeats?: number[];
};
type SoundDesignInput = Partial<SoundDesign> & { preset?: SoundPresetId };
type MixerChannelInput = Omit<MixerChannel, "lowCut" | "air" | "drive" | "glue"> & {
  lowCut?: number;
  air?: number;
  drive?: number;
  glue?: number;
};
type ArrangementBlockInput = Omit<ArrangementBlock, "bars" | "mutedTracks"> & {
  bars?: number;
  mutedTracks?: ArrangementMuteTrack[];
};
type ProjectStateInput = Omit<ProjectState, "patterns" | "sound" | "mixer" | "arrangement" | "metronomeEnabled"> & {
  metronomeEnabled?: boolean;
  sound?: SoundDesignInput;
  patterns: Record<PatternSlot, PatternDataInput>;
  mixer: MixerChannelInput[];
  arrangement: ArrangementBlockInput[];
};

function isProjectStateShape(value: unknown): value is ProjectStateInput {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.title === "string" &&
    isOneOf(value.mode, ["guided", "studio"]) &&
    isFiniteNumber(value.bpm) &&
    typeof value.key === "string" &&
    isOneOf(value.styleId, styleProfiles.map((profile) => profile.id)) &&
    isOneOf(value.selectedPattern, patternSlots) &&
    isFiniteNumber(value.swing) &&
    (value.metronomeEnabled === undefined || typeof value.metronomeEnabled === "boolean") &&
    (value.sound === undefined || isSoundDesignInput(value.sound)) &&
    isPatternMapInput(value.patterns) &&
    Array.isArray(value.mixer) &&
    value.mixer.every(isMixerChannelInput) &&
    isArrangement(value.arrangement) &&
    isFiniteNumber(value.masterCeilingDb) &&
    isOneOf(value.masterPreset, masterPresets)
  );
}

function isLegacyProjectState(value: unknown): value is Omit<ProjectState, "patterns" | "sound" | "mixer" | "arrangement" | "metronomeEnabled"> & {
  metronomeEnabled?: boolean;
  sound?: SoundDesignInput;
  mixer: MixerChannelInput[];
  arrangement: ArrangementBlockInput[];
} & PatternDataInput {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.title === "string" &&
    isOneOf(value.mode, ["guided", "studio"]) &&
    isFiniteNumber(value.bpm) &&
    typeof value.key === "string" &&
    isOneOf(value.styleId, styleProfiles.map((profile) => profile.id)) &&
    isOneOf(value.selectedPattern, patternSlots) &&
    isFiniteNumber(value.swing) &&
    (value.metronomeEnabled === undefined || typeof value.metronomeEnabled === "boolean") &&
    (value.sound === undefined || isSoundDesignInput(value.sound)) &&
    isDrumPattern(value.drumPattern) &&
    (value.drumVelocities === undefined || isDrumVelocities(value.drumVelocities)) &&
    (value.drumTimings === undefined || isDrumTimings(value.drumTimings)) &&
    (value.drumProbabilities === undefined || isDrumProbabilities(value.drumProbabilities)) &&
    (value.hatRepeats === undefined || isHatRepeats(value.hatRepeats)) &&
    Array.isArray(value.bassNotes) &&
    value.bassNotes.every(isBassNote) &&
    Array.isArray(value.melodyNotes) &&
    value.melodyNotes.every(isMelodyNote) &&
    Array.isArray(value.mixer) &&
    value.mixer.every(isMixerChannelInput) &&
    isArrangement(value.arrangement) &&
    isFiniteNumber(value.masterCeilingDb) &&
    isOneOf(value.masterPreset, masterPresets)
  );
}

function isSoundDesignInput(value: unknown): value is SoundDesignInput {
  return (
    isRecord(value) &&
    (value.preset === undefined || isOneOf(value.preset, [...soundPresetIds, "custom"])) &&
    isOptionalUnit(value.kickPunch) &&
    isOptionalUnit(value.snareSnap) &&
    isOptionalUnit(value.hatBrightness) &&
    isOptionalUnit(value.bassDrive) &&
    isOptionalUnit(value.bassDecay) &&
    isOptionalUnit(value.sidechainDuck) &&
    isOptionalUnit(value.synthBrightness) &&
    isOptionalUnit(value.synthRelease) &&
    isOptionalUnit(value.chordWarmth) &&
    isOptionalUnit(value.chordWidth)
  );
}

function isPatternMapInput(value: unknown): value is Record<PatternSlot, PatternDataInput> {
  if (!isRecord(value)) {
    return false;
  }
  return patternSlots.every((slot) => isPatternDataInput(value[slot]));
}

function isPatternDataInput(value: unknown): value is PatternDataInput {
  return (
    isRecord(value) &&
    isDrumPattern(value.drumPattern) &&
    (value.drumVelocities === undefined || isDrumVelocities(value.drumVelocities)) &&
    (value.drumTimings === undefined || isDrumTimings(value.drumTimings)) &&
    (value.drumProbabilities === undefined || isDrumProbabilities(value.drumProbabilities)) &&
    (value.hatRepeats === undefined || isHatRepeats(value.hatRepeats)) &&
    Array.isArray(value.bassNotes) &&
    value.bassNotes.every(isBassNote) &&
    Array.isArray(value.melodyNotes) &&
    value.melodyNotes.every(isMelodyNote) &&
    (value.chordEvents === undefined || (Array.isArray(value.chordEvents) && value.chordEvents.every(isChordEvent)))
  );
}

function isDrumPattern(value: unknown): value is DrumPattern {
  if (!isRecord(value)) {
    return false;
  }
  return (["kick", "clap", "hat", "perc"] as DrumLane[]).every(
    (lane) => Array.isArray(value[lane]) && value[lane].length === stepsPerBar && value[lane].every((step) => typeof step === "boolean")
  );
}

function isDrumVelocities(value: unknown): value is DrumVelocities {
  if (!isRecord(value)) {
    return false;
  }
  return drumLanes.every(
    (lane) =>
      Array.isArray(value[lane]) &&
      value[lane].length === stepsPerBar &&
      value[lane].every((velocity) => isFiniteNumber(velocity) && velocity >= 0 && velocity <= 1)
  );
}

function isDrumTimings(value: unknown): value is DrumTimings {
  if (!isRecord(value)) {
    return false;
  }
  return drumLanes.every(
    (lane) =>
      Array.isArray(value[lane]) &&
      value[lane].length === stepsPerBar &&
      value[lane].every((timing) => isFiniteNumber(timing) && timing >= minDrumTimingMs && timing <= maxDrumTimingMs)
  );
}

function isDrumProbabilities(value: unknown): value is DrumProbabilities {
  if (!isRecord(value)) {
    return false;
  }
  return drumLanes.every(
    (lane) =>
      Array.isArray(value[lane]) &&
      value[lane].length === stepsPerBar &&
      value[lane].every((probability) => isFiniteNumber(probability) && probability >= 0 && probability <= 1)
  );
}

function isHatRepeats(value: unknown): value is number[] {
  return Array.isArray(value) && value.length === stepsPerBar && value.every((repeat) => Number.isInteger(repeat) && repeat >= 1 && repeat <= 4);
}

function isBassNote(value: unknown): value is BassNoteInput {
  return (
    isRecord(value) &&
    isStep(value.step) &&
    isPitch(value.pitch) &&
    isFiniteNumber(value.length) &&
    value.length >= 1 &&
    value.length <= stepsPerBar &&
    typeof value.glide === "boolean" &&
    isOptionalUnit(value.probability)
  );
}

function isMelodyNote(value: unknown): value is MelodyNoteInput {
  return (
    isRecord(value) &&
    isStep(value.step) &&
    isPitch(value.pitch) &&
    isFiniteNumber(value.length) &&
    value.length >= 1 &&
    value.length <= stepsPerBar &&
    isFiniteNumber(value.velocity) &&
    value.velocity >= 0 &&
    value.velocity <= 1 &&
    isOptionalUnit(value.probability)
  );
}

function isChordEvent(value: unknown): value is ChordEventInput {
  return (
    isRecord(value) &&
    isStep(value.step) &&
    typeof value.root === "string" &&
    (value.root in tonicIndex) &&
    isOneOf(value.quality, chordQualities) &&
    isFiniteNumber(value.length) &&
    value.length >= 1 &&
    value.length <= stepsPerBar &&
    isFiniteNumber(value.velocity) &&
    value.velocity >= 0 &&
    value.velocity <= 1 &&
    isOptionalUnit(value.probability)
  );
}

function isMixerChannelInput(value: unknown): value is MixerChannelInput {
  return (
    isRecord(value) &&
    isOneOf(value.id, ["drum_rack", "bass_808", "synth", "chord", "fx_return", "master"]) &&
    typeof value.name === "string" &&
    isFiniteNumber(value.volumeDb) &&
    isFiniteNumber(value.pan) &&
    value.pan >= -100 &&
    value.pan <= 100 &&
    isOptionalUnit(value.lowCut) &&
    isOptionalUnit(value.air) &&
    isOptionalUnit(value.drive) &&
    isOptionalUnit(value.glue) &&
    typeof value.muted === "boolean" &&
    typeof value.solo === "boolean" &&
    typeof value.accent === "string"
  );
}

function isArrangement(value: unknown): value is ArrangementBlockInput[] {
  return Array.isArray(value) && value.length > 0 && value.every(isArrangementBlock);
}

function isArrangementBlock(value: unknown): value is ArrangementBlockInput {
  return (
    isRecord(value) &&
    isOneOf(value.section, arrangementSections) &&
    isOneOf(value.pattern, patternSlots) &&
    isFiniteNumber(value.energy) &&
    value.energy >= 0 &&
    value.energy <= 1 &&
    (value.bars === undefined ||
      (isFiniteNumber(value.bars) && value.bars >= minArrangementBars && value.bars <= maxArrangementBars)) &&
    (value.mutedTracks === undefined ||
      (Array.isArray(value.mutedTracks) && value.mutedTracks.every((track) => isOneOf(track, arrangementMuteTrackIds))))
  );
}

function isStep(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < stepsPerBar;
}

function isPitch(value: unknown): value is string {
  return typeof value === "string" && /^([A-G])(#|b)?-?\d+$/.test(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isOptionalUnit(value: unknown): boolean {
  return value === undefined || (isFiniteNumber(value) && value >= 0 && value <= 1);
}

function clampUnit(value: unknown): number {
  if (!isFiniteNumber(value)) {
    return 0.5;
  }
  return Math.min(1, Math.max(0, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && options.includes(value as T);
}
