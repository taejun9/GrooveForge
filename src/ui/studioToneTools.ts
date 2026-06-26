import type { SoundDesign } from "../domain/workstation";
import { soundPresetDesign, soundPresetLabel } from "../domain/workstation";
import { percentLabel } from "./workstationPatternTools";

export type SoundControlParameter = Exclude<keyof SoundDesign, "preset">;

export type StudioToneResetResult = {
  id: string;
  label: string;
  beforeLabel: string;
  baselineLabel: string;
  baselineSourceLabel: string;
  deltaLabel: string;
  nextCheck: string;
};

export type StudioToneBaseline = {
  sound: SoundDesign;
  sourceLabel: string;
};

export type StudioToneBaselineResult = {
  sourceLabel: string;
  toneLabel: string;
  nextCheck: string;
};

export type StudioToneDriftSummary = {
  changedCount: number;
  totalCount: number;
  postureLabel: string;
  largestLabel: string;
  directionLabel: string;
  nextCheck: string;
  resetTarget: StudioToneDriftResetTarget | null;
};

export type StudioToneDriftResetTarget = {
  id: string;
  label: string;
  parameter: SoundControlParameter;
  beforeValue: number;
  baselineValue: number;
  deltaLabel: string;
};

export const studioToneControls: Array<{ id: string; label: string; parameter: SoundControlParameter }> = [
  { id: "kick-punch", label: "Kick punch", parameter: "kickPunch" },
  { id: "snare-snap", label: "Snare snap", parameter: "snareSnap" },
  { id: "hat-brightness", label: "Hat bright", parameter: "hatBrightness" },
  { id: "bass-drive", label: "808 drive", parameter: "bassDrive" },
  { id: "bass-decay", label: "808 decay", parameter: "bassDecay" },
  { id: "sidechain-duck", label: "Kick duck", parameter: "sidechainDuck" },
  { id: "synth-brightness", label: "Synth bright", parameter: "synthBrightness" },
  { id: "synth-release", label: "Synth release", parameter: "synthRelease" },
  { id: "chord-warmth", label: "Chord warm", parameter: "chordWarmth" },
  { id: "chord-width", label: "Chord width", parameter: "chordWidth" }
];

export function createStudioToneBaseline(sound: SoundDesign): StudioToneBaseline {
  if (sound.preset === "custom") {
    return { sound: { ...sound }, sourceLabel: "Initial custom tone" };
  }

  return { sound: { ...soundPresetDesign(sound.preset) }, sourceLabel: `${soundPresetLabel(sound.preset)} preset` };
}

export function createCapturedStudioToneBaseline(sound: SoundDesign): StudioToneBaseline {
  return { sound: { ...sound }, sourceLabel: "Captured Studio tone" };
}

export function studioToneBaselineSummaryLabel(sound: SoundDesign): string {
  return `Kick ${percentLabel(sound.kickPunch)} | 808 ${percentLabel(sound.bassDrive)} | Synth ${percentLabel(sound.synthBrightness)} | Chord ${percentLabel(sound.chordWarmth)}`;
}

export function createStudioToneDriftSummary(sound: SoundDesign, baseline: SoundDesign): StudioToneDriftSummary {
  const deltas = studioToneControls.map((control) => {
    const currentPercent = Math.round(sound[control.parameter] * 100);
    const baselinePercent = Math.round(baseline[control.parameter] * 100);
    return {
      ...control,
      deltaPercent: currentPercent - baselinePercent
    };
  });
  const changed = deltas.filter((delta) => delta.deltaPercent !== 0);
  const largest = deltas.reduce((currentLargest, delta) =>
    Math.abs(delta.deltaPercent) > Math.abs(currentLargest.deltaPercent) ? delta : currentLargest
  );

  if (changed.length === 0) {
    return {
      changedCount: 0,
      totalCount: studioToneControls.length,
      postureLabel: "Tone matches baseline",
      largestLabel: "Largest 0",
      directionLabel: "No drift",
      nextCheck: "Capture a new baseline after you shape a sound worth keeping.",
      resetTarget: null
    };
  }

  const direction = largest.deltaPercent > 0 ? "above" : "below";
  const deltaLabel = `Delta ${largest.deltaPercent > 0 ? "+" : ""}${largest.deltaPercent}`;
  return {
    changedCount: changed.length,
    totalCount: studioToneControls.length,
    postureLabel: changed.length >= 4 ? "Tone has broad changes" : "Tone has focused changes",
    largestLabel: `${largest.label} ${largest.deltaPercent > 0 ? "+" : ""}${largest.deltaPercent}`,
    directionLabel: `${largest.label} is ${direction} baseline`,
    nextCheck: `Audition ${largest.label.toLowerCase()} first, then reset or capture if the move works.`,
    resetTarget: {
      id: largest.id,
      label: largest.label,
      parameter: largest.parameter,
      beforeValue: sound[largest.parameter],
      baselineValue: baseline[largest.parameter],
      deltaLabel
    }
  };
}

export function studioToneResetNextCheck(label: string): string {
  if (label.includes("808")) {
    return "Replay the 808 against the kick and confirm the low-end pocket.";
  }
  if (label.includes("Kick") || label.includes("Snare") || label.includes("Hat")) {
    return "Replay the drum loop and confirm the groove still cuts through.";
  }
  if (label.includes("Synth") || label.includes("Chord")) {
    return "Replay the harmony layers and confirm the top-end balance.";
  }
  return "Replay the beat and confirm the tone matches the preset target.";
}

export function createStudioToneBaselineResult(baseline: StudioToneBaseline): StudioToneBaselineResult {
  return {
    sourceLabel: baseline.sourceLabel,
    toneLabel: studioToneBaselineSummaryLabel(baseline.sound),
    nextCheck: "Adjust one tone control, then use Reset to compare against this captured baseline."
  };
}

export function createStudioToneResetResult(
  target: StudioToneDriftResetTarget,
  baselineSourceLabel: string
): StudioToneResetResult {
  return {
    id: target.id,
    label: target.label,
    beforeLabel: percentLabel(target.beforeValue),
    baselineLabel: percentLabel(target.baselineValue),
    baselineSourceLabel,
    deltaLabel: `${target.deltaLabel} -> 0`,
    nextCheck: studioToneResetNextCheck(target.label)
  };
}
