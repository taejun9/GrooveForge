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

export type BassNote = {
  step: number;
  pitch: string;
  length: number;
  glide: boolean;
};

export type MelodyNote = {
  step: number;
  pitch: string;
  length: number;
  velocity: number;
};

export type NoteTrack = "bass" | "melody";
export type PatternSlot = "A" | "B" | "C";

export type PatternData = {
  drumPattern: DrumPattern;
  bassNotes: BassNote[];
  melodyNotes: MelodyNote[];
};

export type MixerChannel = {
  id: TrackType;
  name: string;
  volumeDb: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  accent: string;
};

export type ArrangementBlock = {
  section: "Intro" | "Verse" | "Hook" | "Bridge" | "Outro";
  pattern: "A" | "B" | "C";
  energy: number;
};

export type ProjectState = {
  title: string;
  mode: SkillMode;
  bpm: number;
  key: string;
  styleId: StyleId;
  selectedPattern: PatternSlot;
  swing: number;
  patterns: Record<PatternSlot, PatternData>;
  mixer: MixerChannel[];
  arrangement: ArrangementBlock[];
  masterCeilingDb: number;
  masterPreset: "Clean Demo" | "Streaming Safe" | "Headroom for Vocal";
};

export type ProjectFile = {
  app: "GrooveForge";
  fileVersion: 1;
  savedAt: string;
  project: ProjectState;
};

export const steps = Array.from({ length: 16 }, (_, index) => index);
export const stepsPerBar = 16;
export const projectFileVersion = 1;
export const patternSlots: PatternSlot[] = ["A", "B", "C"];

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

const starterPatternA: PatternData = {
  drumPattern: {
    kick: [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
    clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hat: [true, false, true, false, true, false, true, true, true, false, true, false, true, false, true, true],
    perc: [false, false, false, true, false, false, false, false, false, true, false, false, false, false, true, false]
  },
  bassNotes: [
    { step: 0, pitch: "F1", length: 2, glide: false },
    { step: 6, pitch: "C2", length: 2, glide: true },
    { step: 10, pitch: "Eb2", length: 2, glide: false },
    { step: 12, pitch: "F1", length: 4, glide: false }
  ],
  melodyNotes: [
    { step: 0, pitch: "F4", length: 2, velocity: 0.72 },
    { step: 3, pitch: "Ab4", length: 1, velocity: 0.62 },
    { step: 6, pitch: "C5", length: 2, velocity: 0.7 },
    { step: 10, pitch: "Eb5", length: 1, velocity: 0.6 },
    { step: 12, pitch: "C5", length: 3, velocity: 0.66 }
  ]
};

const starterPatternB: PatternData = {
  drumPattern: {
    kick: [true, false, false, false, false, true, false, false, true, false, false, false, true, false, true, false],
    clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hat: [true, true, true, false, true, false, true, true, true, true, true, false, true, false, true, true],
    perc: [false, false, true, false, false, false, false, true, false, false, true, false, false, true, false, false]
  },
  bassNotes: [
    { step: 0, pitch: "F1", length: 2, glide: false },
    { step: 5, pitch: "Ab1", length: 1, glide: true },
    { step: 8, pitch: "C2", length: 2, glide: false },
    { step: 12, pitch: "Eb2", length: 2, glide: true },
    { step: 14, pitch: "F1", length: 2, glide: false }
  ],
  melodyNotes: [
    { step: 0, pitch: "C5", length: 2, velocity: 0.7 },
    { step: 2, pitch: "Eb5", length: 1, velocity: 0.62 },
    { step: 6, pitch: "F5", length: 2, velocity: 0.72 },
    { step: 9, pitch: "Ab4", length: 1, velocity: 0.58 },
    { step: 12, pitch: "C5", length: 2, velocity: 0.66 }
  ]
};

const starterPatternC: PatternData = {
  drumPattern: {
    kick: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false],
    clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hat: [true, false, false, false, true, false, true, false, true, false, false, false, true, false, true, false],
    perc: [false, false, false, false, false, false, true, false, false, false, false, true, false, false, false, true]
  },
  bassNotes: [
    { step: 0, pitch: "F1", length: 4, glide: false },
    { step: 8, pitch: "Db2", length: 4, glide: false },
    { step: 14, pitch: "Eb2", length: 2, glide: true }
  ],
  melodyNotes: [
    { step: 0, pitch: "Ab4", length: 3, velocity: 0.6 },
    { step: 4, pitch: "F4", length: 2, velocity: 0.54 },
    { step: 8, pitch: "Bb4", length: 3, velocity: 0.62 },
    { step: 12, pitch: "C5", length: 2, velocity: 0.58 }
  ]
};

export const starterProject: ProjectState = {
  title: "Untitled Beat",
  mode: "guided",
  bpm: 145,
  key: "F minor",
  styleId: "trap",
  selectedPattern: "A",
  swing: 0.08,
  patterns: {
    A: clonePatternData(starterPatternA),
    B: clonePatternData(starterPatternB),
    C: clonePatternData(starterPatternC)
  },
  mixer: [
    { id: "drum_rack", name: "Drums", volumeDb: -4, pan: 0, muted: false, solo: false, accent: "#78f0c8" },
    { id: "bass_808", name: "808", volumeDb: -6, pan: 0, muted: false, solo: false, accent: "#ff7a4f" },
    { id: "synth", name: "Synth", volumeDb: -8, pan: -12, muted: false, solo: false, accent: "#8aa8ff" },
    { id: "chord", name: "Chord", volumeDb: -10, pan: 16, muted: false, solo: false, accent: "#d58cff" },
    { id: "master", name: "Master", volumeDb: -1, pan: 0, muted: false, solo: false, accent: "#f0c36a" }
  ],
  arrangement: [
    { section: "Intro", pattern: "A", energy: 0.35 },
    { section: "Verse", pattern: "A", energy: 0.65 },
    { section: "Hook", pattern: "B", energy: 0.9 },
    { section: "Verse", pattern: "A", energy: 0.68 },
    { section: "Hook", pattern: "B", energy: 0.94 },
    { section: "Bridge", pattern: "C", energy: 0.5 },
    { section: "Hook", pattern: "B", energy: 0.96 },
    { section: "Outro", pattern: "A", energy: 0.28 }
  ],
  masterCeilingDb: -1,
  masterPreset: "Headroom for Vocal"
};

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
    bassNotes: pattern.bassNotes.map((note) => ({ ...note })),
    melodyNotes: pattern.melodyNotes.map((note) => ({ ...note }))
  };
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

function normalizeProjectState(value: unknown): ProjectState | null {
  if (isProjectState(value)) {
    return value;
  }

  if (isLegacyProjectState(value)) {
    const legacyPattern = clonePatternData({
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
      patterns: {
        A: clonePatternData(legacyPattern),
        B: clonePatternData(legacyPattern),
        C: clonePatternData(legacyPattern)
      },
      mixer: value.mixer,
      arrangement: value.arrangement,
      masterCeilingDb: value.masterCeilingDb,
      masterPreset: value.masterPreset
    };
  }

  return null;
}

function isProjectState(value: unknown): value is ProjectState {
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
    isPatternMap(value.patterns) &&
    Array.isArray(value.mixer) &&
    value.mixer.every(isMixerChannel) &&
    Array.isArray(value.arrangement) &&
    value.arrangement.every(isArrangementBlock) &&
    isFiniteNumber(value.masterCeilingDb) &&
    isOneOf(value.masterPreset, ["Clean Demo", "Streaming Safe", "Headroom for Vocal"])
  );
}

function isLegacyProjectState(value: unknown): value is Omit<ProjectState, "patterns"> & PatternData {
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
    isDrumPattern(value.drumPattern) &&
    Array.isArray(value.bassNotes) &&
    value.bassNotes.every(isBassNote) &&
    Array.isArray(value.melodyNotes) &&
    value.melodyNotes.every(isMelodyNote) &&
    Array.isArray(value.mixer) &&
    value.mixer.every(isMixerChannel) &&
    Array.isArray(value.arrangement) &&
    value.arrangement.every(isArrangementBlock) &&
    isFiniteNumber(value.masterCeilingDb) &&
    isOneOf(value.masterPreset, ["Clean Demo", "Streaming Safe", "Headroom for Vocal"])
  );
}

function isPatternMap(value: unknown): value is Record<PatternSlot, PatternData> {
  if (!isRecord(value)) {
    return false;
  }
  return patternSlots.every((slot) => isPatternData(value[slot]));
}

function isPatternData(value: unknown): value is PatternData {
  return (
    isRecord(value) &&
    isDrumPattern(value.drumPattern) &&
    Array.isArray(value.bassNotes) &&
    value.bassNotes.every(isBassNote) &&
    Array.isArray(value.melodyNotes) &&
    value.melodyNotes.every(isMelodyNote)
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

function isBassNote(value: unknown): value is BassNote {
  return (
    isRecord(value) &&
    isStep(value.step) &&
    isPitch(value.pitch) &&
    isFiniteNumber(value.length) &&
    value.length >= 1 &&
    value.length <= stepsPerBar &&
    typeof value.glide === "boolean"
  );
}

function isMelodyNote(value: unknown): value is MelodyNote {
  return (
    isRecord(value) &&
    isStep(value.step) &&
    isPitch(value.pitch) &&
    isFiniteNumber(value.length) &&
    value.length >= 1 &&
    value.length <= stepsPerBar &&
    isFiniteNumber(value.velocity) &&
    value.velocity >= 0 &&
    value.velocity <= 1
  );
}

function isMixerChannel(value: unknown): value is MixerChannel {
  return (
    isRecord(value) &&
    isOneOf(value.id, ["drum_rack", "bass_808", "synth", "chord", "fx_return", "master"]) &&
    typeof value.name === "string" &&
    isFiniteNumber(value.volumeDb) &&
    isFiniteNumber(value.pan) &&
    typeof value.muted === "boolean" &&
    typeof value.solo === "boolean" &&
    typeof value.accent === "string"
  );
}

function isArrangementBlock(value: unknown): value is ArrangementBlock {
  return (
    isRecord(value) &&
    isOneOf(value.section, ["Intro", "Verse", "Hook", "Bridge", "Outro"]) &&
    isOneOf(value.pattern, ["A", "B", "C"]) &&
    isFiniteNumber(value.energy) &&
    value.energy >= 0 &&
    value.energy <= 1
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && options.includes(value as T);
}
