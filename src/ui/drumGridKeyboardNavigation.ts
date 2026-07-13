import { steps, type DrumLane } from "../domain/workstation";
import type { SelectedDrumStep } from "./workstationUiModel";

export const drumGridLaneOrder: DrumLane[] = ["kick", "clap", "hat", "perc"];

export const drumGridNavigationKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"] as const;
export const drumGridActivationKeys = ["Enter", " "] as const;

export type DrumGridNavigationKey = (typeof drumGridNavigationKeys)[number];
export type DrumGridActivationKey = (typeof drumGridActivationKeys)[number];

export function isDrumGridActivationKey(key: string): key is DrumGridActivationKey {
  return drumGridActivationKeys.includes(key as DrumGridActivationKey);
}

export function isDrumGridNavigationKey(key: string): key is DrumGridNavigationKey {
  return drumGridNavigationKeys.includes(key as DrumGridNavigationKey);
}

export function drumGridEntryStep(selectedStep: SelectedDrumStep | null): SelectedDrumStep {
  return selectedStep ?? { lane: drumGridLaneOrder[0], step: 0 };
}

export function drumGridNavigationTarget(
  current: SelectedDrumStep,
  key: DrumGridNavigationKey
): SelectedDrumStep {
  const laneIndex = Math.max(0, drumGridLaneOrder.indexOf(current.lane));
  const lastLaneIndex = drumGridLaneOrder.length - 1;
  const lastStep = steps.length - 1;

  switch (key) {
    case "ArrowLeft":
      return { lane: current.lane, step: Math.max(0, current.step - 1) };
    case "ArrowRight":
      return { lane: current.lane, step: Math.min(lastStep, current.step + 1) };
    case "ArrowUp":
      return { lane: drumGridLaneOrder[Math.max(0, laneIndex - 1)], step: current.step };
    case "ArrowDown":
      return { lane: drumGridLaneOrder[Math.min(lastLaneIndex, laneIndex + 1)], step: current.step };
    case "Home":
      return { lane: current.lane, step: 0 };
    case "End":
      return { lane: current.lane, step: lastStep };
  }
}
