import { getStyle, noteToFrequency } from "../domain/workstation";
import type { BassNote, BassStyle, ProjectState, SoundDesign } from "../domain/workstation";

export type BassWaveform = "sine" | "triangle" | "saw" | "square";

export type BassVoiceProfile = {
  style: BassStyle;
  label: string;
  waveform: BassWaveform;
  durationScale: number;
  gainScale: number;
  drive: number;
  filterHz: number;
  decay: number;
  release: number;
  detuneRatio: number | null;
};

export type BassGlideProfile = {
  startFrequency: number;
  targetFrequency: number;
  durationSeconds: number;
};

const bassStyleLabels: Record<BassStyle, string> = {
  "808": "808",
  sub: "Sub",
  walking: "Walking",
  pluck: "Pluck",
  reese: "Reese",
  minimal: "Minimal"
};

export function bassStyleLabel(style: BassStyle): string {
  return bassStyleLabels[style];
}

export function bassVoiceProfile(style: BassStyle, sound: SoundDesign): BassVoiceProfile {
  switch (style) {
    case "808":
      return {
        style,
        label: bassStyleLabel(style),
        waveform: sound.bassDrive > 0.62 ? "triangle" : "sine",
        durationScale: 1.08,
        gainScale: 1,
        drive: Math.min(1, sound.bassDrive * 1.12),
        filterHz: 720 + sound.bassDrive * 980,
        decay: 3.25 - sound.bassDecay * 1.15,
        release: sound.bassDecay,
        detuneRatio: null
      };
    case "sub":
      return {
        style,
        label: bassStyleLabel(style),
        waveform: "sine",
        durationScale: 1.02,
        gainScale: 0.9,
        drive: sound.bassDrive * 0.36,
        filterHz: 420 + sound.bassDrive * 360,
        decay: 3.5 - sound.bassDecay,
        release: sound.bassDecay * 0.86,
        detuneRatio: null
      };
    case "walking":
      return {
        style,
        label: bassStyleLabel(style),
        waveform: "triangle",
        durationScale: 0.78,
        gainScale: 0.84,
        drive: 0.12 + sound.bassDrive * 0.38,
        filterHz: 1100 + sound.bassDrive * 1500,
        decay: 4.7 - sound.bassDecay * 1.1,
        release: sound.bassDecay * 0.55,
        detuneRatio: null
      };
    case "pluck":
      return {
        style,
        label: bassStyleLabel(style),
        waveform: sound.bassDrive > 0.55 ? "square" : "triangle",
        durationScale: 0.46,
        gainScale: 0.72,
        drive: 0.08 + sound.bassDrive * 0.34,
        filterHz: 1500 + sound.bassDrive * 2500,
        decay: 7.2 - sound.bassDecay * 1.4,
        release: sound.bassDecay * 0.24,
        detuneRatio: null
      };
    case "reese":
      return {
        style,
        label: bassStyleLabel(style),
        waveform: "saw",
        durationScale: 0.94,
        gainScale: 0.55,
        drive: 0.18 + sound.bassDrive * 0.72,
        filterHz: 900 + sound.bassDrive * 1500,
        decay: 3.75 - sound.bassDecay * 0.9,
        release: sound.bassDecay * 0.72,
        detuneRatio: 1.006
      };
    case "minimal":
      return {
        style,
        label: bassStyleLabel(style),
        waveform: "triangle",
        durationScale: 0.58,
        gainScale: 1.7,
        drive: sound.bassDrive * 0.18,
        filterHz: 520 + sound.bassDrive * 420,
        decay: 5.6 - sound.bassDecay * 1.2,
        release: sound.bassDecay * 0.35,
        detuneRatio: null
      };
  }
}

export function bassVoiceProfileForProject(project: ProjectState, sound: SoundDesign): BassVoiceProfile {
  return bassVoiceProfile(getStyle(project).bassStyle, sound);
}

export function bassGlideProfile(
  notes: readonly BassNote[],
  noteIndex: number,
  noteDurationSeconds: number,
  stepDurationSeconds: number
): BassGlideProfile | null {
  const note = notes[noteIndex];
  const previous = notes
    .filter((candidate, candidateIndex) => candidateIndex !== noteIndex && candidate.step < (note?.step ?? 0))
    .reduce<BassNote | undefined>((nearest, candidate) => {
      if (!nearest || candidate.step > nearest.step) {
        return candidate;
      }
      return nearest;
    }, undefined);
  if (!note?.glide || !previous) {
    return null;
  }
  return {
    startFrequency: noteToFrequency(previous.pitch),
    targetFrequency: noteToFrequency(note.pitch),
    durationSeconds: Math.min(noteDurationSeconds * 0.46, stepDurationSeconds * 0.72)
  };
}
