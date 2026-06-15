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
  selectedPattern: "A" | "B" | "C";
  swing: number;
  drumPattern: DrumPattern;
  bassNotes: BassNote[];
  melodyNotes: MelodyNote[];
  mixer: MixerChannel[];
  arrangement: ArrangementBlock[];
  masterCeilingDb: number;
  masterPreset: "Clean Demo" | "Streaming Safe" | "Headroom for Vocal";
};

export const steps = Array.from({ length: 16 }, (_, index) => index);
export const stepsPerBar = 16;

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

export const starterProject: ProjectState = {
  title: "Untitled Beat",
  mode: "guided",
  bpm: 145,
  key: "F minor",
  styleId: "trap",
  selectedPattern: "A",
  swing: 0.08,
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
  ],
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
