/**
 * 베이스/멜로디 피아노롤의 키보드 진입 셀과 2차원 이동 대상을 계산한다.
 * 렌더된 음높이 목록을 기준으로 현재 선택을 보정하며, 실제 선택 상태와 DOM 포커스 반영은 호출자에게 맡긴다.
 * 빈 음역이나 가장자리에서도 유효한 셀만 반환해 접근성 포커스가 그리드 밖으로 새지 않게 한다.
 */
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
  // 같은 트랙에서 아직 화면에 보이는 선택만 재사용하고, 그렇지 않으면 첫 셀로 안전하게 진입한다.
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
