import { steps, type NoteTrack } from "../domain/workstation";
import type { SelectedNote } from "./workstationUiModel";

export const noteGridNavigationKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"] as const;
export const noteGridActivationKeys = ["Enter", " "] as const;

export type NoteGridNavigationKey = (typeof noteGridNavigationKeys)[number];
export type NoteGridActivationKey = (typeof noteGridActivationKeys)[number];

export function isNoteGridActivationKey(key: string): key is NoteGridActivationKey {
  return noteGridActivationKeys.includes(key as NoteGridActivationKey);
}

export function isNoteGridNavigationKey(key: string): key is NoteGridNavigationKey {
  return noteGridNavigationKeys.includes(key as NoteGridNavigationKey);
}

export function noteGridEntryCell(
  track: NoteTrack,
  renderedPitches: string[],
  selectedNote: SelectedNote | null
): SelectedNote {
  if (selectedNote?.track === track && renderedPitches.includes(selectedNote.pitch)) {
    return selectedNote;
  }
  return { track, step: 0, pitch: renderedPitches[0] ?? "" };
}

export function noteGridNavigationTarget(
  current: SelectedNote,
  key: NoteGridNavigationKey,
  renderedPitches: string[]
): SelectedNote {
  if (renderedPitches.length === 0) {
    return current;
  }

  const pitchIndex = Math.max(0, renderedPitches.indexOf(current.pitch));
  const lastPitchIndex = renderedPitches.length - 1;
  const lastStep = steps.length - 1;

  switch (key) {
    case "ArrowLeft":
      return { ...current, step: Math.max(0, current.step - 1) };
    case "ArrowRight":
      return { ...current, step: Math.min(lastStep, current.step + 1) };
    case "ArrowUp":
      return { ...current, pitch: renderedPitches[Math.max(0, pitchIndex - 1)] };
    case "ArrowDown":
      return { ...current, pitch: renderedPitches[Math.min(lastPitchIndex, pitchIndex + 1)] };
    case "Home":
      return { ...current, step: 0 };
    case "End":
      return { ...current, step: lastStep };
  }
}
