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
  | "k_hiphop_rnb"
  | "afrobeats"
  | "amapiano"
  | "reggaeton"
  | "jersey"
  | "phonk"
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
export const patternVariationPresetIds = ["subtle", "hook", "breakdown", "switchup"] as const;
export type PatternVariationPreset = (typeof patternVariationPresetIds)[number];
export const patternFillPresetIds = ["drum_fill", "bass_pickup", "melody_turn", "clear_tail"] as const;
export type PatternFillPreset = (typeof patternFillPresetIds)[number];

export type BassNote = {
  step: number;
  pitch: string;
  length: number;
  velocity: number;
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
export const chordInversions = [0, 1, 2] as const;
export type ChordInversion = (typeof chordInversions)[number];

export type ChordEvent = {
  step: number;
  root: string;
  quality: ChordQuality;
  inversion: ChordInversion;
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
  send: number;
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

export const automationTargetIds = ["master_volume"] as const;
export type AutomationTargetId = (typeof automationTargetIds)[number];
export const automationCurveIds = ["linear"] as const;
export type AutomationCurve = (typeof automationCurveIds)[number];
export const masterAutomationPresetIds = ["none", "fade_in", "fade_out", "intro_outro"] as const;
export type MasterAutomationPresetId = (typeof masterAutomationPresetIds)[number];

export type AutomationEvent = {
  target: AutomationTargetId;
  startStep: number;
  endStep: number;
  startValue: number;
  endValue: number;
  curve: AutomationCurve;
};

export const arrangementTemplateIds = ["loop", "full", "hook_first", "breakdown"] as const;
export type ArrangementTemplateId = (typeof arrangementTemplateIds)[number];
export const patternChainIds = ["eight_bar", "hook_switch", "break_turn"] as const;
export type PatternChainId = (typeof patternChainIds)[number];
export const arrangementMuteTrackIds = ["drum_rack", "bass_808", "synth", "chord"] as const;
export type ArrangementMuteTrack = (typeof arrangementMuteTrackIds)[number];
export const arrangementMovePresetIds = ["drop", "build", "hook_lift", "reset"] as const;
export type ArrangementMovePreset = (typeof arrangementMovePresetIds)[number];

export type MasterPreset = "Clean Demo" | "Streaming Safe" | "Headroom for Vocal";

export const fixedDeliveryTargetIds = ["starter_sketch", "vocal_session", "beat_store", "club_demo"] as const;
export const deliveryTargetIds = [...fixedDeliveryTargetIds, "custom"] as const;
export type FixedDeliveryTargetId = (typeof fixedDeliveryTargetIds)[number];
export type DeliveryTargetId = (typeof deliveryTargetIds)[number];
export type MixPosture = "loose" | "vocal_headroom" | "balanced" | "club_forward";

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

export type SessionBrief = {
  artist: string;
  vibe: string;
  reference: string;
  notes: string;
};

export type ProjectCoreState = {
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
  automation: AutomationEvent[];
  masterCeilingDb: number;
  masterPreset: MasterPreset;
  deliveryTarget: DeliveryTargetId;
  customDeliveryTarget: CustomDeliveryTarget;
  sessionBrief: SessionBrief;
};

export type ProjectSnapshot = {
  id: string;
  name: string;
  createdAt: string;
  project: ProjectCoreState;
};

export type ProjectState = ProjectCoreState & {
  snapshots: ProjectSnapshot[];
};

export const beatBlueprintIds = [
  "trap_bounce",
  "dark_808",
  "boom_bap_knock",
  "warm_loop",
  "rnb_pocket",
  "seoul_pocket",
  "afro_swing",
  "amapiano_log_bass",
  "reggaeton_dembow",
  "club_bounce",
  "jersey_drive",
  "phonk_cruise",
  "garage_skip",
  "experimental_pulse"
] as const;
export type BeatBlueprintId = (typeof beatBlueprintIds)[number];

export type BeatBlueprint = {
  id: BeatBlueprintId;
  name: string;
  focus: string;
  styleId: StyleId;
  key: string;
  bpm: number;
  arrangementTemplate: ArrangementTemplateId;
  soundPreset: (typeof soundPresetIds)[number];
  masterPreset: MasterPreset;
  mixer: Partial<Record<TrackType, Partial<Pick<MixerChannel, "volumeDb" | "pan" | "lowCut" | "air" | "drive" | "glue" | "send">>>>;
};

export type DeliveryTarget = {
  id: DeliveryTargetId;
  name: string;
  focus: string;
  targetBars: number;
  preferredTemplate: ArrangementTemplateId;
  preferredMasterPreset: MasterPreset;
  stemGoal: number;
  mixPosture: MixPosture;
};

export type CustomDeliveryTarget = Omit<DeliveryTarget, "id">;

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
export const maxProjectSnapshots = 6;
export const maxProjectSnapshotNameLength = 32;
export const maxSessionBriefFieldLength = 64;
export const maxSessionBriefNotesLength = 240;
export const maxCustomDeliveryTargetNameLength = 32;
export const maxCustomDeliveryTargetFocusLength = 72;
export const minDeliveryTargetBars = 1;
export const maxDeliveryTargetBars = 64;
export const minDeliveryTargetStemGoal = 1;
export const maxDeliveryTargetStemGoal = 4;
export const drumLanes: DrumLane[] = ["kick", "clap", "hat", "perc"];
export const patternSlots: PatternSlot[] = ["A", "B", "C"];
export const arrangementSections: ArrangementSection[] = ["Intro", "Verse", "Hook", "Bridge", "Outro"];
export const arrangementTemplateLabels: Record<ArrangementTemplateId, string> = {
  loop: "8 Bar Loop",
  full: "Full Beat",
  hook_first: "Hook First",
  breakdown: "Breakdown"
};
export const patternChainLabels: Record<PatternChainId, string> = {
  eight_bar: "8 Bar Chain",
  hook_switch: "Hook Switch",
  break_turn: "Break Turn"
};
export const arrangementMuteTrackLabels: Record<ArrangementMuteTrack, string> = {
  drum_rack: "Drums",
  bass_808: "808",
  synth: "Synth",
  chord: "Chords"
};
export const arrangementMovePresetLabels: Record<ArrangementMovePreset, string> = {
  drop: "Drop",
  build: "Build",
  hook_lift: "Hook Lift",
  reset: "Reset"
};
export const chordQualities: ChordQuality[] = ["maj", "min", "dim", "sus2", "sus4", "7", "m7"];
export const chordInversionLabels: Record<ChordInversion, string> = {
  0: "Root",
  1: "1st",
  2: "2nd"
};
export const masterPresets: MasterPreset[] = ["Clean Demo", "Streaming Safe", "Headroom for Vocal"];
export const defaultSessionBrief: SessionBrief = {
  artist: "",
  vibe: "",
  reference: "",
  notes: ""
};
export const defaultDeliveryTarget: DeliveryTargetId = "vocal_session";
export const defaultCustomDeliveryTarget: CustomDeliveryTarget = {
  name: "Custom Target",
  focus: "session-specific beat handoff",
  targetBars: 16,
  preferredTemplate: "full",
  preferredMasterPreset: "Headroom for Vocal",
  stemGoal: 4,
  mixPosture: "balanced"
};
export const deliveryTargetLabels: Record<DeliveryTargetId, string> = {
  starter_sketch: "Starter Sketch",
  vocal_session: "Vocal Session",
  beat_store: "Beat Store",
  club_demo: "Club Demo",
  custom: "Custom Target"
};
export const deliveryTargets: DeliveryTarget[] = [
  {
    id: "starter_sketch",
    name: "Starter Sketch",
    focus: "fast draft with flexible headroom",
    targetBars: 8,
    preferredTemplate: "loop",
    preferredMasterPreset: "Clean Demo",
    stemGoal: 2,
    mixPosture: "loose"
  },
  {
    id: "vocal_session",
    name: "Vocal Session",
    focus: "arranged beat with vocal headroom",
    targetBars: 16,
    preferredTemplate: "hook_first",
    preferredMasterPreset: "Headroom for Vocal",
    stemGoal: 4,
    mixPosture: "vocal_headroom"
  },
  {
    id: "beat_store",
    name: "Beat Store",
    focus: "structured demo with clean stems",
    targetBars: 24,
    preferredTemplate: "full",
    preferredMasterPreset: "Streaming Safe",
    stemGoal: 4,
    mixPosture: "balanced"
  },
  {
    id: "club_demo",
    name: "Club Demo",
    focus: "full-energy preview with strong drums",
    targetBars: 16,
    preferredTemplate: "full",
    preferredMasterPreset: "Clean Demo",
    stemGoal: 4,
    mixPosture: "club_forward"
  }
];
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
  breakdown: "Break",
  switchup: "Switchup"
};
export const patternFillPresetLabels: Record<PatternFillPreset, string> = {
  drum_fill: "Drum Fill",
  bass_pickup: "808 Pickup",
  melody_turn: "Melody Turn",
  clear_tail: "Clear Tail"
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

export const beatBlueprints: BeatBlueprint[] = [
  {
    id: "trap_bounce",
    name: "Trap Bounce",
    focus: "fast hats, hard 808 turns, and hook-ready drums",
    styleId: "trap",
    key: "F minor",
    bpm: 145,
    arrangementTemplate: "hook_first",
    soundPreset: "club_punch",
    masterPreset: "Headroom for Vocal",
    mixer: {
      drum_rack: { volumeDb: -3.8, lowCut: 0.05, air: 0.32, drive: 0.2, glue: 0.28, send: 0.08 },
      bass_808: { volumeDb: -4.8, lowCut: 0, air: 0.08, drive: 0.38, glue: 0.22, send: 0.02 },
      synth: { volumeDb: -9.5, pan: -14, lowCut: 0.24, air: 0.48, drive: 0.08, glue: 0.12, send: 0.26 },
      chord: { volumeDb: -11.5, pan: 12, lowCut: 0.2, air: 0.34, drive: 0.06, glue: 0.16, send: 0.32 },
      master: { volumeDb: -1.5 }
    }
  },
  {
    id: "dark_808",
    name: "Dark 808 Sketch",
    focus: "drill/trap hook with vocal headroom",
    styleId: "drill",
    key: "F minor",
    bpm: 142,
    arrangementTemplate: "hook_first",
    soundPreset: "air_space",
    masterPreset: "Headroom for Vocal",
    mixer: {
      drum_rack: { volumeDb: -4, lowCut: 0.06, air: 0.28, drive: 0.18, glue: 0.3, send: 0.12 },
      bass_808: { volumeDb: -5, lowCut: 0, air: 0.08, drive: 0.34, glue: 0.22, send: 0.02 },
      synth: { volumeDb: -10, pan: -18, lowCut: 0.22, air: 0.44, drive: 0.08, glue: 0.12, send: 0.38 },
      chord: { volumeDb: -12, pan: 18, lowCut: 0.18, air: 0.32, drive: 0.06, glue: 0.16, send: 0.42 },
      master: { volumeDb: -1.6 }
    }
  },
  {
    id: "boom_bap_knock",
    name: "Boom Bap Knock",
    focus: "swung drums, warm keys, and pocket-ready bass",
    styleId: "boom_bap",
    key: "E minor",
    bpm: 92,
    arrangementTemplate: "full",
    soundPreset: "warm_tape",
    masterPreset: "Headroom for Vocal",
    mixer: {
      drum_rack: { volumeDb: -4.6, lowCut: 0.12, air: 0.12, drive: 0.24, glue: 0.34, send: 0.22 },
      bass_808: { volumeDb: -7.6, lowCut: 0.02, air: 0.04, drive: 0.2, glue: 0.2, send: 0.08 },
      synth: { volumeDb: -10.8, pan: -18, lowCut: 0.32, air: 0.18, drive: 0.12, glue: 0.16, send: 0.42 },
      chord: { volumeDb: -8.4, pan: 16, lowCut: 0.16, air: 0.14, drive: 0.1, glue: 0.24, send: 0.36 },
      master: { volumeDb: -2.1 }
    }
  },
  {
    id: "warm_loop",
    name: "Warm Loop",
    focus: "boom bap/lo-fi sketch with swing",
    styleId: "lofi",
    key: "A minor",
    bpm: 82,
    arrangementTemplate: "breakdown",
    soundPreset: "warm_tape",
    masterPreset: "Headroom for Vocal",
    mixer: {
      drum_rack: { volumeDb: -5, lowCut: 0.12, air: 0.1, drive: 0.2, glue: 0.32, send: 0.2 },
      bass_808: { volumeDb: -8, lowCut: 0.02, air: 0.04, drive: 0.18, glue: 0.18, send: 0.08 },
      synth: { volumeDb: -11, pan: -20, lowCut: 0.3, air: 0.18, drive: 0.12, glue: 0.16, send: 0.4 },
      chord: { volumeDb: -8, pan: 20, lowCut: 0.16, air: 0.14, drive: 0.1, glue: 0.24, send: 0.36 },
      master: { volumeDb: -2 }
    }
  },
  {
    id: "rnb_pocket",
    name: "R&B Pocket",
    focus: "laid-back chords and clean low end",
    styleId: "rnb",
    key: "C minor",
    bpm: 76,
    arrangementTemplate: "full",
    soundPreset: "clean_knock",
    masterPreset: "Streaming Safe",
    mixer: {
      drum_rack: { volumeDb: -6, lowCut: 0.08, air: 0.18, drive: 0.08, glue: 0.22, send: 0.18 },
      bass_808: { volumeDb: -7, lowCut: 0, air: 0.08, drive: 0.16, glue: 0.2, send: 0.04 },
      synth: { volumeDb: -11, pan: -14, lowCut: 0.24, air: 0.42, drive: 0.04, glue: 0.12, send: 0.36 },
      chord: { volumeDb: -8, pan: 10, lowCut: 0.14, air: 0.24, drive: 0.04, glue: 0.2, send: 0.3 },
      master: { volumeDb: -1.2 }
    }
  },
  {
    id: "seoul_pocket",
    name: "Seoul Pocket",
    focus: "midtempo pocket, clean sub movement, and vocal-ready space",
    styleId: "k_hiphop_rnb",
    key: "C minor",
    bpm: 94,
    arrangementTemplate: "hook_first",
    soundPreset: "clean_knock",
    masterPreset: "Headroom for Vocal",
    mixer: {
      drum_rack: { volumeDb: -4.8, lowCut: 0.08, air: 0.24, drive: 0.14, glue: 0.28, send: 0.12 },
      bass_808: { volumeDb: -6.4, lowCut: 0, air: 0.06, drive: 0.22, glue: 0.18, send: 0.03 },
      synth: { volumeDb: -10.2, pan: -12, lowCut: 0.26, air: 0.48, drive: 0.05, glue: 0.1, send: 0.34 },
      chord: { volumeDb: -8.6, pan: 10, lowCut: 0.16, air: 0.3, drive: 0.05, glue: 0.2, send: 0.32 },
      master: { volumeDb: -1.8 }
    }
  },
  {
    id: "afro_swing",
    name: "Afro Swing",
    focus: "syncopated percussion, warm chords, and rolling bass pocket",
    styleId: "afrobeats",
    key: "A minor",
    bpm: 104,
    arrangementTemplate: "hook_first",
    soundPreset: "clean_knock",
    masterPreset: "Headroom for Vocal",
    mixer: {
      drum_rack: { volumeDb: -4.2, lowCut: 0.08, air: 0.26, drive: 0.14, glue: 0.26, send: 0.14 },
      bass_808: { volumeDb: -6.6, lowCut: 0.01, air: 0.08, drive: 0.18, glue: 0.18, send: 0.04 },
      synth: { volumeDb: -9.6, pan: -10, lowCut: 0.26, air: 0.46, drive: 0.06, glue: 0.12, send: 0.34 },
      chord: { volumeDb: -8.4, pan: 12, lowCut: 0.18, air: 0.32, drive: 0.05, glue: 0.18, send: 0.3 },
      master: { volumeDb: -1.7 }
    }
  },
  {
    id: "amapiano_log_bass",
    name: "Amapiano Log Bass",
    focus: "shuffled percussion, deep log-bass synth motion, and airy chord space",
    styleId: "amapiano",
    key: "F minor",
    bpm: 112,
    arrangementTemplate: "hook_first",
    soundPreset: "clean_knock",
    masterPreset: "Headroom for Vocal",
    mixer: {
      drum_rack: { volumeDb: -4.4, lowCut: 0.06, air: 0.32, drive: 0.14, glue: 0.28, send: 0.16 },
      bass_808: { volumeDb: -6.8, lowCut: 0.01, air: 0.08, drive: 0.28, glue: 0.18, send: 0.04 },
      synth: { volumeDb: -9.8, pan: -14, lowCut: 0.28, air: 0.54, drive: 0.06, glue: 0.12, send: 0.32 },
      chord: { volumeDb: -9.4, pan: 14, lowCut: 0.18, air: 0.4, drive: 0.05, glue: 0.16, send: 0.36 },
      master: { volumeDb: -2.1 }
    }
  },
  {
    id: "reggaeton_dembow",
    name: "Reggaeton Dembow",
    focus: "dembow drum pocket, clipped bass movement, and chant-ready synth hooks",
    styleId: "reggaeton",
    key: "D minor",
    bpm: 98,
    arrangementTemplate: "hook_first",
    soundPreset: "club_punch",
    masterPreset: "Headroom for Vocal",
    mixer: {
      drum_rack: { volumeDb: -3.6, lowCut: 0.06, air: 0.28, drive: 0.2, glue: 0.32, send: 0.1 },
      bass_808: { volumeDb: -6.4, lowCut: 0.01, air: 0.08, drive: 0.28, glue: 0.2, send: 0.03 },
      synth: { volumeDb: -8.8, pan: -8, lowCut: 0.24, air: 0.5, drive: 0.08, glue: 0.12, send: 0.26 },
      chord: { volumeDb: -10.2, pan: 10, lowCut: 0.2, air: 0.34, drive: 0.05, glue: 0.16, send: 0.28 },
      master: { volumeDb: -1.6 }
    }
  },
  {
    id: "club_bounce",
    name: "Club Bounce",
    focus: "four-on-floor drive and bright mids",
    styleId: "house",
    key: "D minor",
    bpm: 124,
    arrangementTemplate: "full",
    soundPreset: "club_punch",
    masterPreset: "Clean Demo",
    mixer: {
      drum_rack: { volumeDb: -3, lowCut: 0.05, air: 0.3, drive: 0.22, glue: 0.36, send: 0.1 },
      bass_808: { volumeDb: -7, lowCut: 0.02, air: 0.1, drive: 0.22, glue: 0.2, send: 0.04 },
      synth: { volumeDb: -8, pan: -10, lowCut: 0.2, air: 0.52, drive: 0.1, glue: 0.14, send: 0.24 },
      chord: { volumeDb: -9, pan: 12, lowCut: 0.18, air: 0.44, drive: 0.08, glue: 0.18, send: 0.28 },
      master: { volumeDb: -0.8 }
    }
  },
  {
    id: "jersey_drive",
    name: "Jersey Drive",
    focus: "club kick pattern, quick bass stabs, and bright hook motion",
    styleId: "jersey",
    key: "F# minor",
    bpm: 140,
    arrangementTemplate: "hook_first",
    soundPreset: "club_punch",
    masterPreset: "Clean Demo",
    mixer: {
      drum_rack: { volumeDb: -2.8, lowCut: 0.04, air: 0.34, drive: 0.24, glue: 0.38, send: 0.08 },
      bass_808: { volumeDb: -6.2, lowCut: 0.02, air: 0.08, drive: 0.26, glue: 0.2, send: 0.04 },
      synth: { volumeDb: -8.2, pan: -10, lowCut: 0.22, air: 0.54, drive: 0.08, glue: 0.14, send: 0.2 },
      chord: { volumeDb: -10.2, pan: 12, lowCut: 0.2, air: 0.42, drive: 0.06, glue: 0.16, send: 0.22 },
      master: { volumeDb: -0.9 }
    }
  },
  {
    id: "phonk_cruise",
    name: "Phonk Cruise",
    focus: "distorted low end, rolling drums, and dark loop energy",
    styleId: "phonk",
    key: "G minor",
    bpm: 132,
    arrangementTemplate: "full",
    soundPreset: "club_punch",
    masterPreset: "Clean Demo",
    mixer: {
      drum_rack: { volumeDb: -3.2, lowCut: 0.06, air: 0.22, drive: 0.3, glue: 0.34, send: 0.1 },
      bass_808: { volumeDb: -5.6, lowCut: 0, air: 0.06, drive: 0.42, glue: 0.24, send: 0.03 },
      synth: { volumeDb: -9.6, pan: -16, lowCut: 0.28, air: 0.3, drive: 0.18, glue: 0.16, send: 0.3 },
      chord: { volumeDb: -10.4, pan: 14, lowCut: 0.18, air: 0.18, drive: 0.14, glue: 0.24, send: 0.28 },
      master: { volumeDb: -1.1 }
    }
  },
  {
    id: "garage_skip",
    name: "Garage Skip",
    focus: "shuffling drums, plucky bass, and clean club motion",
    styleId: "garage",
    key: "A minor",
    bpm: 132,
    arrangementTemplate: "hook_first",
    soundPreset: "club_punch",
    masterPreset: "Streaming Safe",
    mixer: {
      drum_rack: { volumeDb: -3.4, lowCut: 0.06, air: 0.3, drive: 0.18, glue: 0.3, send: 0.12 },
      bass_808: { volumeDb: -6.8, lowCut: 0.02, air: 0.1, drive: 0.24, glue: 0.22, send: 0.06 },
      synth: { volumeDb: -8.6, pan: -12, lowCut: 0.24, air: 0.5, drive: 0.08, glue: 0.12, send: 0.24 },
      chord: { volumeDb: -9.8, pan: 12, lowCut: 0.18, air: 0.4, drive: 0.06, glue: 0.16, send: 0.32 },
      master: { volumeDb: -1 }
    }
  },
  {
    id: "experimental_pulse",
    name: "Experimental Pulse",
    focus: "uneven pulse, spacious synths, and editable abstract motion",
    styleId: "experimental",
    key: "D minor",
    bpm: 110,
    arrangementTemplate: "breakdown",
    soundPreset: "air_space",
    masterPreset: "Headroom for Vocal",
    mixer: {
      drum_rack: { volumeDb: -5.2, lowCut: 0.08, air: 0.26, drive: 0.16, glue: 0.22, send: 0.18 },
      bass_808: { volumeDb: -7.2, lowCut: 0.02, air: 0.08, drive: 0.24, glue: 0.18, send: 0.08 },
      synth: { volumeDb: -9.2, pan: -22, lowCut: 0.28, air: 0.6, drive: 0.08, glue: 0.1, send: 0.46 },
      chord: { volumeDb: -10.8, pan: 20, lowCut: 0.2, air: 0.44, drive: 0.06, glue: 0.14, send: 0.5 },
      master: { volumeDb: -2.2 }
    }
  }
];
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
    id: "k_hiphop_rnb",
    name: "K-Hip-Hop/R&B",
    bpmRange: [82, 108],
    defaultBpm: 94,
    defaultSwing: 0.1,
    bassStyle: "sub",
    melodyStyle: "chordal",
    color: "#7dd3fc"
  },
  {
    id: "afrobeats",
    name: "Afrobeats",
    bpmRange: [96, 116],
    defaultBpm: 104,
    defaultSwing: 0.14,
    bassStyle: "pluck",
    melodyStyle: "riff",
    color: "#ffb85c"
  },
  {
    id: "amapiano",
    name: "Amapiano",
    bpmRange: [108, 116],
    defaultBpm: 112,
    defaultSwing: 0.16,
    bassStyle: "pluck",
    melodyStyle: "chordal",
    color: "#f59e0b"
  },
  {
    id: "reggaeton",
    name: "Reggaeton",
    bpmRange: [90, 108],
    defaultBpm: 98,
    defaultSwing: 0.08,
    bassStyle: "pluck",
    melodyStyle: "riff",
    color: "#ff6b35"
  },
  {
    id: "jersey",
    name: "Jersey Club",
    bpmRange: [130, 150],
    defaultBpm: 140,
    defaultSwing: 0.04,
    bassStyle: "sub",
    melodyStyle: "riff",
    color: "#f7ff5c"
  },
  {
    id: "phonk",
    name: "Phonk",
    bpmRange: [120, 160],
    defaultBpm: 132,
    defaultSwing: 0.1,
    bassStyle: "808",
    melodyStyle: "loop",
    color: "#ff5c7a"
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

const patternChainBlocks: Record<PatternChainId, ArrangementTemplateBlock[]> = {
  eight_bar: [
    { section: "Intro", pattern: "A", energy: 0.44, bars: 1, mutedTracks: ["synth"] },
    { section: "Verse", pattern: "A", energy: 0.66, bars: 1 },
    { section: "Verse", pattern: "A", energy: 0.7, bars: 1 },
    { section: "Bridge", pattern: "C", energy: 0.58, bars: 1, mutedTracks: ["bass_808"] },
    { section: "Hook", pattern: "B", energy: 0.9, bars: 1 },
    { section: "Hook", pattern: "B", energy: 0.94, bars: 1 },
    { section: "Hook", pattern: "C", energy: 0.78, bars: 1 },
    { section: "Outro", pattern: "A", energy: 0.4, bars: 1, mutedTracks: ["bass_808", "synth"] }
  ],
  hook_switch: [
    { section: "Hook", pattern: "B", energy: 0.92, bars: 1 },
    { section: "Hook", pattern: "B", energy: 0.96, bars: 1 },
    { section: "Verse", pattern: "A", energy: 0.62, bars: 1 },
    { section: "Verse", pattern: "A", energy: 0.68, bars: 1 },
    { section: "Bridge", pattern: "C", energy: 0.5, bars: 1, mutedTracks: ["drum_rack"] },
    { section: "Hook", pattern: "B", energy: 0.98, bars: 1 },
    { section: "Hook", pattern: "C", energy: 0.82, bars: 1 },
    { section: "Outro", pattern: "A", energy: 0.36, bars: 1, mutedTracks: ["bass_808"] }
  ],
  break_turn: [
    { section: "Intro", pattern: "A", energy: 0.34, bars: 1, mutedTracks: ["bass_808", "synth"] },
    { section: "Verse", pattern: "A", energy: 0.58, bars: 1 },
    { section: "Bridge", pattern: "C", energy: 0.42, bars: 1, mutedTracks: ["bass_808"] },
    { section: "Bridge", pattern: "C", energy: 0.48, bars: 1 },
    { section: "Hook", pattern: "B", energy: 0.88, bars: 1 },
    { section: "Hook", pattern: "B", energy: 0.96, bars: 1 },
    { section: "Verse", pattern: "A", energy: 0.64, bars: 1 },
    { section: "Hook", pattern: "B", energy: 0.94, bars: 1 }
  ]
};

const chainExpandSections: ArrangementSection[] = [
  "Intro",
  "Verse",
  "Verse",
  "Hook",
  "Hook",
  "Verse",
  "Bridge",
  "Bridge",
  "Hook",
  "Hook",
  "Verse",
  "Verse",
  "Hook",
  "Hook",
  "Outro",
  "Outro"
];

const chainExpandEnergies = [
  0.34,
  0.62,
  0.68,
  0.9,
  0.94,
  0.58,
  0.42,
  0.5,
  0.92,
  0.96,
  0.64,
  0.7,
  0.95,
  0.98,
  0.4,
  0.28
];

const chainExpandMutedTracks: ArrangementMuteTrack[][] = [
  ["synth"],
  [],
  [],
  [],
  [],
  [],
  ["drum_rack", "bass_808"],
  ["bass_808"],
  [],
  [],
  [],
  [],
  [],
  [],
  ["bass_808", "synth"],
  ["drum_rack", "bass_808", "synth"]
];

const starterPatternA: PatternData = withDrumDynamics({
  drumPattern: {
    kick: [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
    clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hat: [true, false, true, false, true, false, true, true, true, false, true, false, true, false, true, true],
    perc: [false, false, false, true, false, false, false, false, false, true, false, false, false, false, true, false]
  },
  bassNotes: [
    { step: 0, pitch: "F1", length: 2, velocity: 0.88, glide: false, probability: 1 },
    { step: 6, pitch: "C2", length: 2, velocity: 0.92, glide: true, probability: 1 },
    { step: 10, pitch: "Eb2", length: 2, velocity: 0.8, glide: false, probability: 1 },
    { step: 12, pitch: "F1", length: 4, velocity: 0.9, glide: false, probability: 1 }
  ],
  melodyNotes: [
    { step: 0, pitch: "F4", length: 2, velocity: 0.72, probability: 1 },
    { step: 3, pitch: "Ab4", length: 1, velocity: 0.62, probability: 1 },
    { step: 6, pitch: "C5", length: 2, velocity: 0.7, probability: 1 },
    { step: 10, pitch: "Eb5", length: 1, velocity: 0.6, probability: 1 },
    { step: 12, pitch: "C5", length: 3, velocity: 0.66, probability: 1 }
  ],
  chordEvents: [
    { step: 0, root: "F", quality: "min", inversion: 0, length: 4, velocity: 0.55, probability: 1 },
    { step: 4, root: "Db", quality: "maj", inversion: 0, length: 4, velocity: 0.46, probability: 1 },
    { step: 8, root: "Ab", quality: "maj", inversion: 0, length: 4, velocity: 0.5, probability: 1 },
    { step: 12, root: "Eb", quality: "maj", inversion: 0, length: 4, velocity: 0.5, probability: 1 }
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
    { step: 0, pitch: "F1", length: 2, velocity: 0.88, glide: false, probability: 1 },
    { step: 5, pitch: "Ab1", length: 1, velocity: 0.92, glide: true, probability: 1 },
    { step: 8, pitch: "C2", length: 2, velocity: 0.8, glide: false, probability: 1 },
    { step: 12, pitch: "Eb2", length: 2, velocity: 0.92, glide: true, probability: 1 },
    { step: 14, pitch: "F1", length: 2, velocity: 0.82, glide: false, probability: 1 }
  ],
  melodyNotes: [
    { step: 0, pitch: "C5", length: 2, velocity: 0.7, probability: 1 },
    { step: 2, pitch: "Eb5", length: 1, velocity: 0.62, probability: 1 },
    { step: 6, pitch: "F5", length: 2, velocity: 0.72, probability: 1 },
    { step: 9, pitch: "Ab4", length: 1, velocity: 0.58, probability: 1 },
    { step: 12, pitch: "C5", length: 2, velocity: 0.66, probability: 1 }
  ],
  chordEvents: [
    { step: 0, root: "F", quality: "min", inversion: 0, length: 4, velocity: 0.5, probability: 1 },
    { step: 4, root: "C", quality: "min", inversion: 0, length: 4, velocity: 0.44, probability: 1 },
    { step: 8, root: "Db", quality: "maj", inversion: 0, length: 4, velocity: 0.48, probability: 1 },
    { step: 12, root: "Eb", quality: "maj", inversion: 0, length: 4, velocity: 0.5, probability: 1 }
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
    { step: 0, pitch: "F1", length: 4, velocity: 0.86, glide: false, probability: 1 },
    { step: 8, pitch: "Db2", length: 4, velocity: 0.8, glide: false, probability: 1 },
    { step: 14, pitch: "Eb2", length: 2, velocity: 0.92, glide: true, probability: 1 }
  ],
  melodyNotes: [
    { step: 0, pitch: "Ab4", length: 3, velocity: 0.6, probability: 1 },
    { step: 4, pitch: "F4", length: 2, velocity: 0.54, probability: 1 },
    { step: 8, pitch: "Bb4", length: 3, velocity: 0.62, probability: 1 },
    { step: 12, pitch: "C5", length: 2, velocity: 0.58, probability: 1 }
  ],
  chordEvents: [
    { step: 0, root: "Db", quality: "maj", inversion: 0, length: 4, velocity: 0.48, probability: 1 },
    { step: 4, root: "Eb", quality: "maj", inversion: 0, length: 4, velocity: 0.45, probability: 1 },
    { step: 8, root: "F", quality: "min", inversion: 0, length: 4, velocity: 0.52, probability: 1 },
    { step: 12, root: "C", quality: "min", inversion: 0, length: 4, velocity: 0.42, probability: 1 }
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
    { id: "drum_rack", name: "Drums", volumeDb: -4, pan: 0, lowCut: 0.08, air: 0.24, drive: 0.16, glue: 0.26, send: 0.14, muted: false, solo: false, accent: "#78f0c8" },
    { id: "bass_808", name: "808", volumeDb: -6, pan: 0, lowCut: 0, air: 0.1, drive: 0.22, glue: 0.18, send: 0.04, muted: false, solo: false, accent: "#ff7a4f" },
    { id: "synth", name: "Synth", volumeDb: -8, pan: -12, lowCut: 0.18, air: 0.36, drive: 0.08, glue: 0.12, send: 0.26, muted: false, solo: false, accent: "#8aa8ff" },
    { id: "chord", name: "Chord", volumeDb: -10, pan: 16, lowCut: 0.12, air: 0.28, drive: 0.06, glue: 0.18, send: 0.32, muted: false, solo: false, accent: "#d58cff" },
    { id: "master", name: "Master", volumeDb: -1, pan: 0, lowCut: 0, air: 0, drive: 0, glue: 0, send: 0, muted: false, solo: false, accent: "#f0c36a" }
  ],
  arrangement: createArrangementTemplate("full"),
  automation: [],
  masterCeilingDb: masterPresetCeilingsDb["Headroom for Vocal"],
  masterPreset: "Headroom for Vocal",
  deliveryTarget: defaultDeliveryTarget,
  customDeliveryTarget: { ...defaultCustomDeliveryTarget },
  sessionBrief: { ...defaultSessionBrief },
  snapshots: []
};

export function beatBlueprintLabel(id: BeatBlueprintId): string {
  return beatBlueprintForId(id).name;
}

export function beatBlueprintFocus(id: BeatBlueprintId): string {
  return beatBlueprintForId(id).focus;
}

export function applyBeatBlueprint(project: ProjectState, blueprintId: BeatBlueprintId): ProjectState {
  const blueprint = beatBlueprintForId(blueprintId);
  const style = styleProfiles.find((profile) => profile.id === blueprint.styleId) ?? styleProfiles[0];
  return {
    ...project,
    bpm: blueprint.bpm,
    key: blueprint.key,
    styleId: blueprint.styleId,
    selectedPattern: "A",
    swing: style.defaultSwing,
    sound: soundPresetDesign(blueprint.soundPreset),
    patterns: createStylePatternSet(blueprint.styleId, blueprint.key),
    arrangement: createArrangementTemplate(blueprint.arrangementTemplate),
    automation: [],
    mixer: applyBeatBlueprintMixer(starterProject.mixer, blueprint.mixer),
    masterCeilingDb: masterPresetCeilingDb(blueprint.masterPreset),
    masterPreset: blueprint.masterPreset
  };
}

export function masterPresetCeilingDb(preset: MasterPreset): number {
  return masterPresetCeilingsDb[preset];
}

export function deliveryTargetLabel(target: DeliveryTargetId): string {
  return deliveryTargetForId(target).name;
}

export function deliveryTargetFocus(target: DeliveryTargetId): string {
  return deliveryTargetForId(target).focus;
}

export function deliveryTargetForId(
  target: DeliveryTargetId,
  customTarget: CustomDeliveryTarget = defaultCustomDeliveryTarget
): DeliveryTarget {
  if (target === "custom") {
    return {
      id: "custom",
      ...normalizeCustomDeliveryTarget(customTarget)
    };
  }
  return deliveryTargets.find((candidate) => candidate.id === target) ?? deliveryTargets[0];
}

export function activeDeliveryTarget(project: Pick<ProjectCoreState, "deliveryTarget" | "customDeliveryTarget">): DeliveryTarget {
  return deliveryTargetForId(project.deliveryTarget, project.customDeliveryTarget);
}

export function applyDeliveryTarget(project: ProjectState, targetId: DeliveryTargetId): ProjectState {
  const target = deliveryTargetForId(targetId, project.customDeliveryTarget);
  return {
    ...project,
    deliveryTarget: target.id,
    arrangement: createArrangementTemplate(target.preferredTemplate),
    masterPreset: target.preferredMasterPreset,
    masterCeilingDb: masterPresetCeilingDb(target.preferredMasterPreset),
    mixer: applyDeliveryTargetMixer(project.mixer, target)
  };
}

export function soundPresetLabel(preset: SoundPresetId): string {
  return soundPresetLabels[preset];
}

function beatBlueprintForId(id: BeatBlueprintId): BeatBlueprint {
  return beatBlueprints.find((blueprint) => blueprint.id === id) ?? beatBlueprints[0];
}

function applyBeatBlueprintMixer(
  sourceMixer: MixerChannel[],
  mixerUpdates: BeatBlueprint["mixer"]
): MixerChannel[] {
  return sourceMixer.map((channel) => {
    const update = mixerUpdates[channel.id] ?? {};
    return {
      ...channel,
      ...update,
      volumeDb: clampVolumeDb(update.volumeDb ?? channel.volumeDb),
      pan: clampPanValue(update.pan ?? channel.pan),
      lowCut: normalizeMixerEq(update.lowCut ?? channel.lowCut),
      air: normalizeMixerEq(update.air ?? channel.air),
      drive: normalizeMixerEq(update.drive ?? channel.drive),
      glue: normalizeMixerEq(update.glue ?? channel.glue),
      send: normalizeMixerEq(update.send ?? channel.send),
      muted: false,
      solo: false
    };
  });
}

function applyDeliveryTargetMixer(sourceMixer: MixerChannel[], target: DeliveryTarget): MixerChannel[] {
  return sourceMixer.map((channel) => {
    if (channel.id === "master") {
      const masterVolume = target.mixPosture === "vocal_headroom" ? -2 : target.mixPosture === "club_forward" ? -0.8 : channel.volumeDb;
      return { ...channel, volumeDb: clampVolumeDb(masterVolume), muted: false, solo: false };
    }

    if (target.mixPosture === "loose") {
      return { ...channel, muted: false, solo: false };
    }

    if (target.mixPosture === "vocal_headroom") {
      if (channel.id === "bass_808") {
        return { ...channel, volumeDb: clampVolumeDb(Math.min(channel.volumeDb, -6.5)), drive: normalizeMixerEq(channel.drive * 0.92), send: normalizeMixerEq(Math.min(channel.send, 0.05)), muted: false, solo: false };
      }
      if (channel.id === "synth" || channel.id === "chord") {
        return { ...channel, volumeDb: clampVolumeDb(Math.min(channel.volumeDb, -10)), lowCut: normalizeMixerEq(Math.max(channel.lowCut, 0.18)), send: normalizeMixerEq(Math.min(channel.send, 0.32)), muted: false, solo: false };
      }
      return { ...channel, volumeDb: clampVolumeDb(Math.min(channel.volumeDb, -4.5)), muted: false, solo: false };
    }

    if (target.mixPosture === "balanced") {
      const targetVolume =
        channel.id === "drum_rack" ? -5 : channel.id === "bass_808" ? -6.5 : channel.id === "synth" ? -9 : channel.id === "chord" ? -9.5 : channel.volumeDb;
      return { ...channel, volumeDb: clampVolumeDb(targetVolume), muted: false, solo: false };
    }

    if (channel.id === "drum_rack") {
      return { ...channel, volumeDb: -3, drive: normalizeMixerEq(Math.max(channel.drive, 0.22)), glue: normalizeMixerEq(Math.max(channel.glue, 0.32)), muted: false, solo: false };
    }
    if (channel.id === "bass_808") {
      return { ...channel, volumeDb: -5.5, drive: normalizeMixerEq(Math.max(channel.drive, 0.28)), send: normalizeMixerEq(Math.min(channel.send, 0.04)), muted: false, solo: false };
    }
    return { ...channel, muted: false, solo: false };
  });
}

function clampVolumeDb(value: number): number {
  if (!Number.isFinite(value)) {
    return -6;
  }
  return Math.min(3, Math.max(-36, Math.round(value * 10) / 10));
}

function clampPanValue(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(-100, Math.round(value)));
}

export function chordProgressionPresetLabel(preset: ChordProgressionPreset): string {
  return chordProgressionPresetLabels[preset];
}

export function chordInversionLabel(inversion: ChordInversion): string {
  return chordInversionLabels[inversion];
}

export function patternVariationPresetLabel(preset: PatternVariationPreset): string {
  return patternVariationPresetLabels[preset];
}

export function patternFillPresetLabel(preset: PatternFillPreset): string {
  return patternFillPresetLabels[preset];
}

export function arrangementTemplateLabel(template: ArrangementTemplateId): string {
  return arrangementTemplateLabels[template];
}

export function patternChainLabel(chain: PatternChainId): string {
  return patternChainLabels[chain];
}

export function arrangementMuteTrackLabel(track: ArrangementMuteTrack): string {
  return arrangementMuteTrackLabels[track];
}

export function arrangementMovePresetLabel(preset: ArrangementMovePreset): string {
  return arrangementMovePresetLabels[preset];
}

export function createArrangementTemplate(template: ArrangementTemplateId): ArrangementBlock[] {
  return arrangementTemplateBlocks[template].map((block) => ({
    ...block,
    energy: normalizeArrangementEnergy(block.energy),
    bars: normalizeArrangementBars(block.bars),
    mutedTracks: normalizeArrangementMutedTracks(block.mutedTracks)
  }));
}

export function createPatternChain(chain: PatternChainId): ArrangementBlock[] {
  return patternChainBlocks[chain].map((block) => ({
    ...block,
    energy: normalizeArrangementEnergy(block.energy),
    bars: normalizeArrangementBars(block.bars),
    mutedTracks: normalizeArrangementMutedTracks(block.mutedTracks)
  }));
}

export function expandPatternChainArrangement(arrangement: ArrangementBlock[]): ArrangementBlock[] {
  const source = arrangement.length > 0 ? arrangement : createPatternChain("eight_bar");
  return chainExpandSections.map((section, index) => {
    const sourceBlock = source[index % source.length] ?? source[0];
    return {
      section,
      pattern: sourceBlock.pattern,
      bars: 1,
      energy: normalizeArrangementEnergy(chainExpandEnergies[index] ?? sourceBlock.energy),
      mutedTracks: normalizeArrangementMutedTracks(chainExpandMutedTracks[index] ?? sourceBlock.mutedTracks)
    };
  });
}

export function applyArrangementMovePreset(block: ArrangementBlock, preset: ArrangementMovePreset): ArrangementBlock {
  const moveSettings: Record<ArrangementMovePreset, Pick<ArrangementBlock, "energy" | "mutedTracks">> = {
    drop: {
      energy: 0.34,
      mutedTracks: ["drum_rack", "bass_808"]
    },
    build: {
      energy: 0.68,
      mutedTracks: ["bass_808"]
    },
    hook_lift: {
      energy: 0.96,
      mutedTracks: []
    },
    reset: {
      energy: 0.68,
      mutedTracks: []
    }
  };
  const settings = moveSettings[preset];
  return {
    ...block,
    energy: normalizeArrangementEnergy(settings.energy),
    mutedTracks: normalizeArrangementMutedTracks(settings.mutedTracks)
  };
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

export function arrangementTotalSteps(project: Pick<ProjectCoreState, "arrangement">): number {
  const bars = project.arrangement.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
  return Math.max(stepsPerBar, bars * stepsPerBar);
}

export function createMasterAutomationPreset(
  project: Pick<ProjectCoreState, "arrangement">,
  preset: MasterAutomationPresetId
): AutomationEvent[] {
  if (preset === "none") {
    return [];
  }
  const totalSteps = arrangementTotalSteps(project);
  const fadeSteps = Math.min(stepsPerBar, totalSteps);
  const fadeOutStart = Math.max(0, totalSteps - fadeSteps);
  const fadeIn: AutomationEvent = {
    target: "master_volume",
    startStep: 0,
    endStep: fadeSteps,
    startValue: 0,
    endValue: 1,
    curve: "linear"
  };
  const fadeOut: AutomationEvent = {
    target: "master_volume",
    startStep: fadeOutStart,
    endStep: totalSteps,
    startValue: 1,
    endValue: 0,
    curve: "linear"
  };
  if (preset === "fade_in") {
    return [fadeIn];
  }
  if (preset === "fade_out") {
    return [fadeOut];
  }
  return [fadeIn, fadeOut];
}

export function applyMasterAutomationPreset(project: ProjectState, preset: MasterAutomationPresetId): ProjectState {
  const automation = createMasterAutomationPreset(project, preset);
  if (sameAutomationEvents(project.automation, automation)) {
    return project;
  }
  return { ...project, automation };
}

export function masterAutomationGainAtStep(project: Pick<ProjectCoreState, "automation">, absoluteStep: number): number {
  return project.automation
    .filter((event) => event.target === "master_volume")
    .reduce((gain, event) => gain * automationEventValueAtStep(event, absoluteStep), 1);
}

export function masterAutomationPresetForProject(
  project: Pick<ProjectCoreState, "arrangement" | "automation">
): MasterAutomationPresetId | "custom" {
  for (const preset of masterAutomationPresetIds) {
    if (sameAutomationEvents(project.automation, createMasterAutomationPreset(project, preset))) {
      return preset;
    }
  }
  return "custom";
}

function automationEventValueAtStep(event: AutomationEvent, absoluteStep: number): number {
  if (absoluteStep < event.startStep || absoluteStep > event.endStep) {
    return 1;
  }
  if (event.endStep <= event.startStep) {
    return normalizeAutomationValue(event.endValue);
  }
  const progress = Math.max(0, Math.min(1, (absoluteStep - event.startStep) / (event.endStep - event.startStep)));
  return normalizeAutomationValue(event.startValue + (event.endValue - event.startValue) * progress);
}

function sameAutomationEvents(first: AutomationEvent[], second: AutomationEvent[]): boolean {
  return (
    first.length === second.length &&
    first.every((event, index) => {
      const candidate = second[index];
      return (
        candidate &&
        event.target === candidate.target &&
        event.startStep === candidate.startStep &&
        event.endStep === candidate.endStep &&
        event.startValue === candidate.startValue &&
        event.endValue === candidate.endValue &&
        event.curve === candidate.curve
      );
    })
  );
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

export function normalizeNoteVelocity(value: number | undefined, fallback = 0.82): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(1, Math.max(0, value));
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

export function normalizeChordInversion(value: unknown): ChordInversion {
  return isChordInversion(value) ? value : 0;
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
  if (preset === "switchup") {
    applySwitchupVariation(variation);
    return applyDrumGroovePreset(variation, "push");
  }
  applyBreakdownVariation(variation);
  return applyDrumGroovePreset(variation, "tight");
}

export function applyPatternFillPreset(pattern: PatternData, preset: PatternFillPreset, key: string): PatternData {
  const filled = clonePatternData(pattern);
  if (preset === "drum_fill") {
    applyDrumTailFill(filled);
    return filled;
  }
  if (preset === "bass_pickup") {
    applyBassPickup(filled, key);
    return filled;
  }
  if (preset === "melody_turn") {
    applyMelodyTurn(filled, key);
    return filled;
  }
  clearPatternTail(filled);
  return filled;
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

function applySwitchupVariation(pattern: PatternData): void {
  [0, 3, 8, 11, 14].forEach((step) =>
    setDrumStep(pattern, "kick", step, true, step === 0 || step === 8 ? 1 : 0.84, step === 14 ? 0.9 : 1, step === 14 ? -8 : 0)
  );
  [4, 10, 12].forEach((step) => setDrumStep(pattern, "clap", step, true, step === 10 ? 0.58 : 0.94, step === 10 ? 0.72 : 1, 2));
  [0, 2, 4, 6, 7, 8, 10, 12, 13, 14, 15].forEach((step) =>
    setDrumStep(
      pattern,
      "hat",
      step,
      true,
      step === 15 ? 0.82 : step % 4 === 0 ? 0.72 : 0.6,
      step === 7 || step === 13 ? 0.88 : 1,
      step === 15 ? -12 : step % 2 === 0 ? -5 : 6,
      step === 15 ? 4 : step === 7 || step === 13 ? 2 : 1
    )
  );
  [1, 5, 11, 15].forEach((step) => setDrumStep(pattern, "perc", step, true, step === 15 ? 0.72 : 0.6, step === 15 ? 0.86 : 0.74, step % 2 === 0 ? -6 : 8));

  const existingBass = pattern.bassNotes.map((note, index) => ({
    ...note,
    length: clampEventLength(index % 2 === 0 ? note.length + 1 : note.length, note.step),
    velocity: Math.min(1, normalizeNoteVelocity(note.velocity) + 0.08),
    glide: note.glide || index === pattern.bassNotes.length - 1,
    probability: 1
  }));
  const bassPickup = existingBass[0]
    ? [
        {
          ...existingBass[0],
          step: 14,
          length: 1,
          velocity: Math.min(1, existingBass[0].velocity + 0.1),
          glide: true,
          probability: 1
        }
      ]
    : [];
  pattern.bassNotes = sortBassNotes([...existingBass.filter((note) => note.step !== 14), ...bassPickup]);

  const existingMelody = pattern.melodyNotes.map((note, index) => ({
    ...note,
    length: clampEventLength(index % 3 === 0 ? note.length + 1 : note.length, note.step),
    velocity: Math.min(1, normalizeNoteVelocity(note.velocity, 0.68) + (index % 2 === 0 ? 0.1 : 0.04)),
    probability: index % 4 === 1 ? 0.84 : 1
  }));
  const melodyAnswer = existingMelody[0]
    ? [
        {
          ...existingMelody[0],
          step: 15,
          length: 1,
          velocity: Math.min(1, existingMelody[0].velocity + 0.08),
          probability: 0.92
        }
      ]
    : [];
  pattern.melodyNotes = sortMelodyNotes([...existingMelody.filter((note) => note.step !== 15), ...melodyAnswer]);

  pattern.chordEvents = pattern.chordEvents.map((event, index) => ({
    ...event,
    velocity: Math.min(1, normalizeNoteVelocity(event.velocity, 0.62) + (index === 0 ? 0.1 : 0.06)),
    probability: index % 3 === 2 ? 0.86 : 1
  }));
}

function applyDrumTailFill(pattern: PatternData): void {
  setDrumStep(pattern, "kick", 12, true, 0.94, 1, -2);
  setDrumStep(pattern, "kick", 14, true, 0.78, 0.9, -7);
  setDrumStep(pattern, "clap", 12, true, 0.92, 1, 3);
  setDrumStep(pattern, "hat", 12, true, 0.68, 1, -6);
  setDrumStep(pattern, "hat", 13, true, 0.58, 0.94, -4, 2);
  setDrumStep(pattern, "hat", 14, true, 0.66, 1, -9);
  setDrumStep(pattern, "hat", 15, true, 0.78, 1, -12, 4);
  setDrumStep(pattern, "perc", 13, true, 0.62, 0.86, 8);
  setDrumStep(pattern, "perc", 15, true, 0.68, 0.78, -10);
}

function applyBassPickup(pattern: PatternData, key: string): void {
  pattern.bassNotes = sortBassNotes([
    ...pattern.bassNotes.filter((note) => note.step < 12).map(trimEventBeforeTail),
    { step: 12, pitch: pitchFromDegree(key, 4, 1), length: 1, velocity: 0.78, glide: false, probability: 0.9 },
    { step: 14, pitch: pitchFromDegree(key, 5, 1), length: 1, velocity: 0.9, glide: true, probability: 1 },
    { step: 15, pitch: pitchFromDegree(key, 6, 1), length: 1, velocity: 0.92, glide: true, probability: 1 }
  ]);
}

function applyMelodyTurn(pattern: PatternData, key: string): void {
  pattern.melodyNotes = sortMelodyNotes([
    ...pattern.melodyNotes.filter((note) => note.step < 12).map(trimEventBeforeTail),
    { step: 12, pitch: pitchFromDegree(key, 4, 4), length: 1, velocity: 0.64, probability: 0.92 },
    { step: 13, pitch: pitchFromDegree(key, 5, 4), length: 1, velocity: 0.7, probability: 1 },
    { step: 14, pitch: pitchFromDegree(key, 3, 4), length: 1, velocity: 0.66, probability: 1 },
    { step: 15, pitch: pitchFromDegree(key, 2, 4), length: 1, velocity: 0.74, probability: 1 }
  ]);
}

function clearPatternTail(pattern: PatternData): void {
  drumLanes.forEach((lane) => {
    [12, 13, 14, 15].forEach((step) => setDrumStep(pattern, lane, step, false));
  });
  pattern.bassNotes = sortBassNotes(pattern.bassNotes.filter((note) => note.step < 12).map(trimEventBeforeTail));
  pattern.melodyNotes = sortMelodyNotes(pattern.melodyNotes.filter((note) => note.step < 12).map(trimEventBeforeTail));
  pattern.chordEvents = pattern.chordEvents
    .filter((event) => event.step < 12)
    .map((event) => ({
      ...event,
      length: normalizeChordLength(Math.min(event.length, 12 - event.step), event.step)
    }));
}

function trimEventBeforeTail<T extends BassNote | MelodyNote>(note: T): T {
  return {
    ...note,
    length: clampEventLength(Math.min(note.length, 12 - note.step), note.step)
  };
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
  k_hiphop_rnb: [
    blueprint([0, 6, 10, 14], [4, 12], [0, 3, 6, 8, 11, 14], [5, 9, 15], [0, 5, 7, 5], [4, 2, 0, 5], [0, 5, 3, 4]),
    blueprint([0, 5, 8, 13], [4, 12], [0, 2, 5, 8, 10, 13, 15], [3, 7, 11], [0, 3, 5, 7, 5], [5, 4, 2, 0], [0, 3, 5, 4]),
    blueprint([0, 8, 14], [4, 12], [0, 6, 8, 14], [6, 11], [0, 8], [4, 2], [3, 0])
  ],
  afrobeats: [
    blueprint([0, 3, 7, 10, 14], [4, 12], [1, 3, 6, 8, 10, 13, 15], [2, 5, 9, 11, 14], [0, 3, 5, 7, 5], [0, 2, 4, 5, 2], [0, 5, 3, 4]),
    blueprint([0, 2, 6, 9, 13, 15], [4, 12], [0, 2, 5, 7, 9, 11, 14, 15], [3, 6, 10, 13], [0, 2, 5, 4, 7], [4, 5, 2, 0, 4], [0, 3, 5, 4]),
    blueprint([0, 6, 10, 14], [4, 12], [1, 5, 9, 13], [2, 7, 11, 15], [0, 5, 7, 5], [5, 4, 2], [3, 0, 5])
  ],
  amapiano: [
    blueprint([0, 4, 7, 11, 14], [4, 12], [1, 3, 6, 8, 10, 13, 15], [2, 5, 9, 11, 14], [0, 3, 7, 10, 14], [0, 2, 4, 5, 2], [0, 3, 5, 4]),
    blueprint([0, 3, 6, 10, 13, 15], [4, 12], [0, 2, 5, 7, 9, 11, 14, 15], [1, 5, 8, 12, 15], [0, 2, 5, 8, 12, 14], [4, 5, 2, 0, 4], [0, 5, 3, 4]),
    blueprint([0, 7, 10, 14], [4, 12], [1, 5, 9, 13], [2, 6, 11, 15], [0, 7, 12], [5, 4, 2], [3, 0, 5])
  ],
  reggaeton: [
    blueprint([0, 3, 8, 11, 14], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14], [3, 7, 11, 15], [0, 3, 5, 7, 5], [0, 2, 4, 5, 2], [0, 5, 3, 4]),
    blueprint([0, 2, 6, 8, 11, 15], [4, 12], [0, 1, 3, 4, 6, 8, 10, 12, 14, 15], [2, 5, 9, 13], [0, 2, 5, 4, 7], [4, 5, 2, 0, 4], [0, 3, 5, 4]),
    blueprint([0, 3, 10, 14], [4, 12], [0, 4, 8, 12, 14], [3, 7, 11], [0, 5, 7, 5], [5, 4, 2], [3, 0, 5])
  ],
  jersey: [
    blueprint([0, 3, 6, 8, 11, 14], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14], [1, 5, 9, 13, 15], [0, 3, 6, 8, 11, 14], [0, 2, 4, 5, 2], [0, 3, 4, 5]),
    blueprint([0, 2, 5, 8, 10, 13, 15], [4, 12], [0, 1, 3, 4, 6, 8, 9, 11, 12, 14, 15], [2, 6, 10, 14], [0, 2, 5, 8, 10, 13], [4, 5, 2, 0, 4], [0, 4, 5, 3]),
    blueprint([0, 6, 11, 14], [4, 12], [0, 4, 6, 8, 12, 14], [3, 7, 15], [0, 6, 11, 14], [5, 4, 2], [3, 0])
  ],
  phonk: [
    blueprint([0, 4, 7, 11, 14], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14], [3, 6, 9, 13], [0, 4, 7, 11, 14], [0, 2, 3, 5], [0, 5, 3, 4]),
    blueprint([0, 3, 6, 8, 12, 15], [4, 12], [0, 1, 3, 4, 6, 8, 10, 11, 12, 14, 15], [2, 7, 10, 13], [0, 3, 6, 8, 12, 15], [3, 5, 4, 2, 0], [0, 3, 5, 4]),
    blueprint([0, 8, 11, 14], [4, 12], [0, 4, 6, 8, 10, 12, 14], [6, 11, 15], [0, 8, 11, 14], [5, 3, 0], [5, 0])
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
    case "jersey":
    case "phonk":
    case "garage":
    case "reggaeton":
      return "club_punch";
    case "boom_bap":
    case "lofi":
      return "warm_tape";
    case "rnb":
    case "k_hiphop_rnb":
    case "afrobeats":
    case "amapiano":
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
      velocity: index % 3 === 1 ? 0.92 : index % 2 === 0 ? 0.86 : 0.78,
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
      velocity: normalizeNoteVelocity(note.velocity),
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
      inversion: 0,
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
    inversion: 0,
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

export function nextProjectSnapshotName(project: ProjectState): string {
  const existingNames = new Set(project.snapshots.map((snapshot) => normalizeProjectSnapshotName(snapshot.name)));
  let index = project.snapshots.length + 1;
  while (existingNames.has(`Idea ${index}`)) {
    index += 1;
  }
  return `Idea ${index}`;
}

export function normalizeProjectSnapshotName(name: string): string {
  return name.trim().replace(/\s+/g, " ").slice(0, maxProjectSnapshotNameLength);
}

export function createProjectSnapshot(project: ProjectState, createdAt = new Date().toISOString()): ProjectSnapshot {
  return {
    id: projectSnapshotId(project, createdAt),
    name: nextProjectSnapshotName(project),
    createdAt,
    project: cloneProjectCore(project)
  };
}

export function saveProjectSnapshot(project: ProjectState, createdAt = new Date().toISOString()): ProjectState {
  const snapshot = createProjectSnapshot(project, createdAt);
  return {
    ...project,
    snapshots: [snapshot, ...cloneProjectSnapshots(project.snapshots)].slice(0, maxProjectSnapshots)
  };
}

export function restoreProjectSnapshot(project: ProjectState, snapshotId: string): ProjectState {
  const snapshot = project.snapshots.find((candidate) => candidate.id === snapshotId);
  if (!snapshot) {
    return project;
  }
  return {
    ...cloneProjectCore(snapshot.project),
    snapshots: cloneProjectSnapshots(project.snapshots)
  };
}

export function deleteProjectSnapshot(project: ProjectState, snapshotId: string): ProjectState {
  const snapshots = project.snapshots.filter((snapshot) => snapshot.id !== snapshotId);
  if (snapshots.length === project.snapshots.length) {
    return project;
  }
  return {
    ...project,
    snapshots: cloneProjectSnapshots(snapshots)
  };
}

export function renameProjectSnapshot(project: ProjectState, snapshotId: string, name: string): ProjectState {
  const normalizedName = normalizeProjectSnapshotName(name);
  if (!normalizedName) {
    return project;
  }

  let changed = false;
  const snapshots = project.snapshots.map((snapshot) => {
    const clonedSnapshot = {
      ...snapshot,
      project: cloneProjectCore(snapshot.project)
    };
    if (snapshot.id !== snapshotId) {
      return clonedSnapshot;
    }
    if (snapshot.name === normalizedName) {
      return clonedSnapshot;
    }
    changed = true;
    return {
      ...clonedSnapshot,
      name: normalizedName
    };
  });

  if (!changed) {
    return project;
  }

  return {
    ...project,
    snapshots
  };
}

export function projectSnapshotSummary(snapshot: ProjectSnapshot): string {
  const bars = snapshot.project.arrangement.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
  return `${snapshot.project.key} / ${snapshot.project.bpm} BPM / ${bars} bars`;
}

function projectSnapshotId(project: ProjectState, createdAt: string): string {
  const base = `snapshot-${createdAt.replace(/[^0-9]/g, "").slice(0, 17) || "local"}`;
  const existingIds = new Set(project.snapshots.map((snapshot) => snapshot.id));
  let suffix = 1;
  while (existingIds.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

function cloneProjectSnapshots(snapshots: ProjectSnapshot[]): ProjectSnapshot[] {
  return snapshots.map((snapshot) => ({
    ...snapshot,
    project: cloneProjectCore(snapshot.project)
  }));
}

function cloneProjectCore(project: ProjectCoreState): ProjectCoreState {
  return {
    title: project.title,
    mode: project.mode,
    bpm: project.bpm,
    key: project.key,
    styleId: project.styleId,
    selectedPattern: project.selectedPattern,
    swing: project.swing,
    metronomeEnabled: project.metronomeEnabled,
    sound: { ...project.sound },
    patterns: {
      A: clonePatternData(project.patterns.A),
      B: clonePatternData(project.patterns.B),
      C: clonePatternData(project.patterns.C)
    },
    mixer: project.mixer.map((channel) => ({ ...channel })),
    arrangement: project.arrangement.map((block) => ({
      ...block,
      mutedTracks: [...block.mutedTracks]
    })),
    automation: project.automation.map((event) => ({ ...event })),
    masterCeilingDb: project.masterCeilingDb,
    masterPreset: project.masterPreset,
    deliveryTarget: project.deliveryTarget,
    customDeliveryTarget: { ...project.customDeliveryTarget },
    sessionBrief: { ...project.sessionBrief }
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

export function retargetPitchNameToKey(pitchName: string, sourceKey: string, targetKey: string): string {
  if (sourceKey === targetKey) {
    return pitchName;
  }

  const degree = nearestScaleDegree(pitchName, sourceKey);
  if (degree === null) {
    return pitchName;
  }

  return scalePitchNames(targetKey)[degree] ?? pitchName;
}

export function retargetPitchToKey(pitch: string, sourceKey: string, targetKey: string): string {
  if (sourceKey === targetKey) {
    return pitch;
  }

  const parts = pitchParts(pitch);
  if (!parts) {
    return pitch;
  }

  const degree = nearestScaleDegree(parts.name, sourceKey);
  if (degree === null) {
    return pitch;
  }

  const sourceDegreeOctaveOffset = scaleDegreeOctaveOffset(sourceKey, degree);
  const targetStartOctave = parts.octave - sourceDegreeOctaveOffset;
  return scalePitches(targetKey, targetStartOctave)[degree] ?? pitch;
}

export function retargetPatternKey(pattern: PatternData, sourceKey: string, targetKey: string): PatternData {
  if (sourceKey === targetKey) {
    return pattern;
  }

  return {
    ...pattern,
    bassNotes: sortBassNotes(
      pattern.bassNotes.map((note) => ({
        ...note,
        pitch: retargetPitchToKey(note.pitch, sourceKey, targetKey)
      }))
    ),
    melodyNotes: sortMelodyNotes(
      pattern.melodyNotes.map((note) => ({
        ...note,
        pitch: retargetPitchToKey(note.pitch, sourceKey, targetKey)
      }))
    ),
    chordEvents: pattern.chordEvents.map((event) => ({
      ...event,
      root: retargetPitchNameToKey(event.root, sourceKey, targetKey)
    }))
  };
}

export function retargetProjectKey(project: ProjectState, targetKey: string): ProjectState {
  if (project.key === targetKey) {
    return project;
  }

  const sourceKey = project.key;
  return {
    ...project,
    key: targetKey,
    patterns: {
      A: retargetPatternKey(project.patterns.A, sourceKey, targetKey),
      B: retargetPatternKey(project.patterns.B, sourceKey, targetKey),
      C: retargetPatternKey(project.patterns.C, sourceKey, targetKey)
    }
  };
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
  const pitches = chordIntervals[chord.quality].map((interval) => {
    const absolute = root + interval;
    const pitchIndex = absolute % 12;
    const octaveOffset = Math.floor(absolute / 12);
    return `${names[pitchIndex]}${octave + octaveOffset}`;
  });
  return applyChordInversion(pitches, chord.inversion);
}

function pitchParts(pitch: string): { name: string; octave: number } | null {
  const match = /^([A-G](?:#|b)?)(-?\d+)$/.exec(pitch);
  if (!match) {
    return null;
  }
  return { name: match[1], octave: Number(match[2]) };
}

function nearestScaleDegree(pitchName: string, key: string): number | null {
  const pitchClass = tonicIndex[pitchName];
  if (pitchClass === undefined) {
    return null;
  }

  const scalePitchClasses = scalePitchNames(key).map((name) => tonicIndex[name] ?? 0);
  const exactDegree = scalePitchClasses.findIndex((candidate) => candidate === pitchClass);
  if (exactDegree >= 0) {
    return exactDegree;
  }

  return scalePitchClasses.reduce(
    (best, candidate, degree) => {
      const distance = circularPitchDistance(pitchClass, candidate);
      return distance < best.distance ? { degree, distance } : best;
    },
    { degree: 0, distance: Number.POSITIVE_INFINITY }
  ).degree;
}

function scaleDegreeOctaveOffset(key: string, degree: number): number {
  const referencePitch = scalePitches(key, 0)[degree];
  return pitchParts(referencePitch)?.octave ?? 0;
}

function circularPitchDistance(first: number, second: number): number {
  const distance = Math.abs(first - second) % 12;
  return Math.min(distance, 12 - distance);
}

function applyChordInversion(pitches: string[], inversion: unknown): string[] {
  const moves = Math.min(normalizeChordInversion(inversion), Math.max(0, pitches.length - 1));
  if (moves === 0) {
    return pitches;
  }

  return [...pitches.slice(moves), ...pitches.slice(0, moves).map((pitch) => shiftPitchOctave(pitch, 1))];
}

function shiftPitchOctave(pitch: string, octaves: number): string {
  const parts = pitchParts(pitch);
  return parts ? `${parts.name}${parts.octave + octaves}` : pitch;
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
    glue: normalizeMixerEq(channel.glue ?? 0),
    send: normalizeMixerEq(channel.send ?? 0)
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
    velocity: normalizeNoteVelocity(note.velocity),
    probability: normalizeEventProbability(note.probability ?? 1)
  }));
}

function normalizeMelodyNotes(notes: MelodyNoteInput[]): MelodyNote[] {
  return notes.map((note) => ({
    ...note,
    velocity: normalizeNoteVelocity(note.velocity, 0.64),
    probability: normalizeEventProbability(note.probability ?? 1)
  }));
}

function normalizeChordEvents(events: ChordEventInput[] | undefined): ChordEvent[] {
  return (
    events?.map((event) => ({
      ...event,
      inversion: normalizeChordInversion(event.inversion),
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

function normalizeAutomationEvents(events: AutomationEventInput[] | undefined): AutomationEvent[] {
  return events?.map(normalizeAutomationEvent).filter((event): event is AutomationEvent => event !== null) ?? [];
}

function normalizeAutomationEvent(event: AutomationEventInput): AutomationEvent | null {
  if (!isAutomationEventInput(event)) {
    return null;
  }
  const target = event.target;
  const curve = event.curve;
  if (!target || !curve) {
    return null;
  }
  const startStep = normalizeAutomationStep(event.startStep);
  const endStep = normalizeAutomationStep(event.endStep);
  if (endStep <= startStep) {
    return null;
  }
  return {
    target,
    startStep,
    endStep,
    startValue: normalizeAutomationValue(event.startValue),
    endValue: normalizeAutomationValue(event.endValue),
    curve
  };
}

function normalizeAutomationStep(value: unknown): number {
  return Math.min(maxDeliveryTargetBars * stepsPerBar, Math.max(0, Math.round(Number(value) || 0)));
}

function normalizeAutomationValue(value: unknown): number {
  return clampUnit(Number(value) || 0);
}

function normalizeProjectCoreState(value: ProjectCoreStateInput): ProjectCoreState {
  return {
    ...value,
    metronomeEnabled: value.metronomeEnabled ?? false,
    deliveryTarget: normalizeDeliveryTargetId(value.deliveryTarget),
    customDeliveryTarget: normalizeCustomDeliveryTarget(value.customDeliveryTarget),
    sessionBrief: normalizeSessionBrief(value.sessionBrief),
    sound: normalizeSoundDesign(value.sound),
    patterns: normalizePatternMap(value.patterns),
    mixer: normalizeMixerChannels(value.mixer),
    arrangement: normalizeArrangement(value.arrangement),
    automation: normalizeAutomationEvents(value.automation)
  };
}

function normalizeDeliveryTargetId(target: DeliveryTargetId | undefined): DeliveryTargetId {
  return target && isOneOf(target, deliveryTargetIds) ? target : defaultDeliveryTarget;
}

export function normalizeCustomDeliveryTarget(target: CustomDeliveryTargetInput | undefined): CustomDeliveryTarget {
  return {
    name: normalizeCustomDeliveryText(
      target?.name,
      maxCustomDeliveryTargetNameLength,
      defaultCustomDeliveryTarget.name
    ),
    focus: normalizeCustomDeliveryText(
      target?.focus,
      maxCustomDeliveryTargetFocusLength,
      defaultCustomDeliveryTarget.focus
    ),
    targetBars: normalizeDeliveryTargetBars(target?.targetBars),
    preferredTemplate: isOneOf(target?.preferredTemplate, arrangementTemplateIds)
      ? target.preferredTemplate
      : defaultCustomDeliveryTarget.preferredTemplate,
    preferredMasterPreset: isOneOf(target?.preferredMasterPreset, masterPresets)
      ? target.preferredMasterPreset
      : defaultCustomDeliveryTarget.preferredMasterPreset,
    stemGoal: normalizeDeliveryTargetStemGoal(target?.stemGoal),
    mixPosture: isMixPosture(target?.mixPosture) ? target.mixPosture : defaultCustomDeliveryTarget.mixPosture
  };
}

function normalizeCustomDeliveryText(value: unknown, maxLength: number, fallback: string): string {
  const normalized = typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
  return normalized || fallback;
}

export function normalizeDeliveryTargetBars(value: unknown): number {
  if (!isFiniteNumber(value)) {
    return defaultCustomDeliveryTarget.targetBars;
  }
  return Math.min(maxDeliveryTargetBars, Math.max(minDeliveryTargetBars, Math.round(value)));
}

export function normalizeDeliveryTargetStemGoal(value: unknown): number {
  if (!isFiniteNumber(value)) {
    return defaultCustomDeliveryTarget.stemGoal;
  }
  return Math.min(maxDeliveryTargetStemGoal, Math.max(minDeliveryTargetStemGoal, Math.round(value)));
}

function normalizeSessionBrief(brief: SessionBriefInput | undefined): SessionBrief {
  return {
    artist: normalizeBriefText(brief?.artist, maxSessionBriefFieldLength),
    vibe: normalizeBriefText(brief?.vibe, maxSessionBriefFieldLength),
    reference: normalizeBriefText(brief?.reference, maxSessionBriefFieldLength),
    notes: normalizeBriefText(brief?.notes, maxSessionBriefNotesLength)
  };
}

function normalizeBriefText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

function normalizeProjectSnapshots(snapshots: ProjectSnapshotInput[] | undefined): ProjectSnapshot[] {
  return (
    snapshots
      ?.map((snapshot, index) => ({
        id: snapshot.id,
        name: normalizeProjectSnapshotName(snapshot.name) || `Idea ${index + 1}`,
        createdAt: snapshot.createdAt,
        project: normalizeProjectCoreState(snapshot.project)
      }))
      .slice(0, maxProjectSnapshots) ?? []
  );
}

function normalizeProjectState(value: unknown): ProjectState | null {
  if (isProjectStateShape(value)) {
    return {
      ...normalizeProjectCoreState(value),
      snapshots: normalizeProjectSnapshots(value.snapshots)
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
      automation: normalizeAutomationEvents(value.automation),
      masterCeilingDb: value.masterCeilingDb,
      masterPreset: value.masterPreset,
      deliveryTarget: normalizeDeliveryTargetId(value.deliveryTarget),
      customDeliveryTarget: normalizeCustomDeliveryTarget(value.customDeliveryTarget),
      sessionBrief: normalizeSessionBrief(value.sessionBrief),
      snapshots: []
    };
  }

  return null;
}

type BassNoteInput = Omit<BassNote, "probability" | "velocity"> & { probability?: number; velocity?: number };
type MelodyNoteInput = Omit<MelodyNote, "probability"> & { probability?: number };
type ChordEventInput = Omit<ChordEvent, "probability" | "inversion"> & { probability?: number; inversion?: unknown };
type AutomationEventInput = Partial<AutomationEvent>;
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
type SessionBriefInput = Partial<SessionBrief>;
type CustomDeliveryTargetInput = Partial<CustomDeliveryTarget>;
type MixerChannelInput = Omit<MixerChannel, "lowCut" | "air" | "drive" | "glue" | "send"> & {
  lowCut?: number;
  air?: number;
  drive?: number;
  glue?: number;
  send?: number;
};
type ArrangementBlockInput = Omit<ArrangementBlock, "bars" | "mutedTracks"> & {
  bars?: number;
  mutedTracks?: ArrangementMuteTrack[];
};
type ProjectCoreStateInput = Omit<ProjectCoreState, "patterns" | "sound" | "mixer" | "arrangement" | "automation" | "metronomeEnabled" | "deliveryTarget" | "customDeliveryTarget" | "sessionBrief"> & {
  metronomeEnabled?: boolean;
  deliveryTarget?: DeliveryTargetId;
  customDeliveryTarget?: CustomDeliveryTargetInput;
  sessionBrief?: SessionBriefInput;
  sound?: SoundDesignInput;
  patterns: Record<PatternSlot, PatternDataInput>;
  mixer: MixerChannelInput[];
  arrangement: ArrangementBlockInput[];
  automation?: AutomationEventInput[];
};
type ProjectSnapshotInput = Omit<ProjectSnapshot, "project"> & {
  project: ProjectCoreStateInput;
};
type ProjectStateInput = ProjectCoreStateInput & {
  snapshots?: ProjectSnapshotInput[];
};

function isProjectStateShape(value: unknown): value is ProjectStateInput {
  if (!isProjectCoreStateShape(value) || !isRecord(value)) {
    return false;
  }
  const snapshots = (value as { snapshots?: unknown }).snapshots;
  return snapshots === undefined || isProjectSnapshotsInput(snapshots);
}

function isProjectCoreStateShape(value: unknown): value is ProjectCoreStateInput {
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
    (value.deliveryTarget === undefined || isOneOf(value.deliveryTarget, deliveryTargetIds)) &&
    (value.customDeliveryTarget === undefined || isCustomDeliveryTargetInput(value.customDeliveryTarget)) &&
    (value.sessionBrief === undefined || isSessionBriefInput(value.sessionBrief)) &&
    (value.sound === undefined || isSoundDesignInput(value.sound)) &&
    isPatternMapInput(value.patterns) &&
    Array.isArray(value.mixer) &&
    value.mixer.every(isMixerChannelInput) &&
    isArrangement(value.arrangement) &&
    (value.automation === undefined || (Array.isArray(value.automation) && value.automation.every(isAutomationEventInput))) &&
    isFiniteNumber(value.masterCeilingDb) &&
    isOneOf(value.masterPreset, masterPresets)
  );
}

function isProjectSnapshotsInput(value: unknown): value is ProjectSnapshotInput[] {
  return (
    Array.isArray(value) &&
    value.every(
      (snapshot) =>
        isRecord(snapshot) &&
        typeof snapshot.id === "string" &&
        typeof snapshot.name === "string" &&
        typeof snapshot.createdAt === "string" &&
        isProjectCoreStateShape(snapshot.project)
    )
  );
}

function isLegacyProjectState(value: unknown): value is Omit<ProjectCoreState, "patterns" | "sound" | "mixer" | "arrangement" | "automation" | "metronomeEnabled" | "deliveryTarget" | "customDeliveryTarget" | "sessionBrief"> & {
  metronomeEnabled?: boolean;
  deliveryTarget?: DeliveryTargetId;
  customDeliveryTarget?: CustomDeliveryTargetInput;
  sessionBrief?: SessionBriefInput;
  sound?: SoundDesignInput;
  mixer: MixerChannelInput[];
  arrangement: ArrangementBlockInput[];
  automation?: AutomationEventInput[];
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
    (value.deliveryTarget === undefined || isOneOf(value.deliveryTarget, deliveryTargetIds)) &&
    (value.customDeliveryTarget === undefined || isCustomDeliveryTargetInput(value.customDeliveryTarget)) &&
    (value.sessionBrief === undefined || isSessionBriefInput(value.sessionBrief)) &&
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
    (value.automation === undefined || (Array.isArray(value.automation) && value.automation.every(isAutomationEventInput))) &&
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

function isSessionBriefInput(value: unknown): value is SessionBriefInput {
  return (
    isRecord(value) &&
    (value.artist === undefined || typeof value.artist === "string") &&
    (value.vibe === undefined || typeof value.vibe === "string") &&
    (value.reference === undefined || typeof value.reference === "string") &&
    (value.notes === undefined || typeof value.notes === "string")
  );
}

function isCustomDeliveryTargetInput(value: unknown): value is CustomDeliveryTargetInput {
  return (
    isRecord(value) &&
    (value.name === undefined || typeof value.name === "string") &&
    (value.focus === undefined || typeof value.focus === "string") &&
    (value.targetBars === undefined || isFiniteNumber(value.targetBars)) &&
    (value.preferredTemplate === undefined || isOneOf(value.preferredTemplate, arrangementTemplateIds)) &&
    (value.preferredMasterPreset === undefined || isOneOf(value.preferredMasterPreset, masterPresets)) &&
    (value.stemGoal === undefined || isFiniteNumber(value.stemGoal)) &&
    (value.mixPosture === undefined || isMixPosture(value.mixPosture))
  );
}

function isAutomationEventInput(value: unknown): value is AutomationEventInput {
  return (
    isRecord(value) &&
    isOneOf(value.target, automationTargetIds) &&
    isFiniteNumber(value.startStep) &&
    isFiniteNumber(value.endStep) &&
    isFiniteNumber(value.startValue) &&
    isFiniteNumber(value.endValue) &&
    isOneOf(value.curve, automationCurveIds)
  );
}

function isMixPosture(value: unknown): value is MixPosture {
  return isOneOf(value, ["loose", "vocal_headroom", "balanced", "club_forward"]);
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
    isOptionalUnit(value.velocity) &&
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
    (value.inversion === undefined || isChordInversion(value.inversion)) &&
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
    isOptionalUnit(value.send) &&
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

function isChordInversion(value: unknown): value is ChordInversion {
  return isFiniteNumber(value) && chordInversions.includes(value as ChordInversion);
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
