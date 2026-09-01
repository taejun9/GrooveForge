/**
 * 편집기에서 선택한 드럼·노트·코드 한 개를 짧게 들어 보는 오디션 흐름을 통합한다.
 * 현재 프로젝트 ref를 기준으로 실제 이벤트 존재 여부를 확인한 뒤 이전 재생을 중지하고 새 Web Audio 컨트롤러를 보관한다.
 * 오디오 런타임이 막혀도 예외를 UI 밖으로 전파하지 않고 상태 문구와 진단 결과로 변환하는 것이 실패 경계다.
 */
import { PlaybackController, playEditorAudition } from "../audio/scheduler";
import { activePattern } from "../domain/workstation";
import type { BassNote, ChordEvent, MelodyNote, ProjectState } from "../domain/workstation";
import { SelectedDrumStep, SelectedNote, drumLabels } from "./workstationUiModel";

type RefCell<T> = {
  current: T;
};

type EditorAuditionContext = {
  projectRef: RefCell<ProjectState>;
  auditionControllerRef: RefCell<PlaybackController | null>;
  setProjectStatus: (status: string) => void;
};

export type EditorAuditionOutcome = {
  ok: boolean;
  runtimeDetail?: string;
};

function matchesAuditionNote(note: BassNote | MelodyNote, selectedNote: SelectedNote): boolean {
  return note.step === selectedNote.step && note.pitch === selectedNote.pitch;
}

function runtimeDetail(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Runtime blocked one-shot Web Audio";
}

function runEditorAudition(context: EditorAuditionContext, target: Parameters<typeof playEditorAudition>[1], status: string): EditorAuditionOutcome {
  try {
    // 겹치는 원샷 재생과 낡은 컨트롤러 참조가 남지 않도록 새 재생 전에 기존 재생을 정리한다.
    context.auditionControllerRef.current?.stop();
    context.auditionControllerRef.current = playEditorAudition(context.projectRef.current, target);
    context.setProjectStatus(status);
    return { ok: true };
  } catch (error) {
    // 사용자 제스처/AudioContext 정책 등 런타임 실패는 편집 데이터 손상과 무관하므로 복구 가능한 UI 상태로 닫는다.
    context.setProjectStatus("Editor audition audio not started");
    return { ok: false, runtimeDetail: runtimeDetail(error) };
  }
}

export function auditionSelectedDrumHit(context: EditorAuditionContext, selectedDrumStep: SelectedDrumStep | null): EditorAuditionOutcome {
  const target = selectedDrumStep;
  if (!target) {
    context.setProjectStatus("Select an active drum step");
    return { ok: false };
  }

  const pattern = activePattern(context.projectRef.current);
  if (!pattern.drumPattern[target.lane][target.step]) {
    context.setProjectStatus("Select an active drum step");
    return { ok: false };
  }

  return runEditorAudition(context, { kind: "drum", lane: target.lane, step: target.step }, `Auditioned ${drumLabels[target.lane]} ${target.step + 1}`);
}

export function auditionSelectedNote(context: EditorAuditionContext, selectedNote: SelectedNote | null): EditorAuditionOutcome {
  const target = selectedNote;
  if (!target) {
    context.setProjectStatus("Select an 808 or Synth note");
    return { ok: false };
  }

  const pattern = activePattern(context.projectRef.current);
  const note =
    target.track === "bass"
      ? pattern.bassNotes.find((candidate) => matchesAuditionNote(candidate, target))
      : pattern.melodyNotes.find((candidate) => matchesAuditionNote(candidate, target));
  if (!note) {
    context.setProjectStatus("Select an active note");
    return { ok: false };
  }

  return runEditorAudition(
    context,
    { kind: "note", track: target.track, note },
    `Auditioned ${target.track === "bass" ? "808" : "Synth"} ${note.pitch}.${note.step + 1}`
  );
}

export function auditionSelectedChord(context: EditorAuditionContext, selectedChord: ChordEvent | undefined): EditorAuditionOutcome {
  const chord = selectedChord;
  if (!chord) {
    context.setProjectStatus("Select a chord event");
    return { ok: false };
  }

  return runEditorAudition(context, { kind: "chord", chord }, `Auditioned chord ${chord.root}${chord.quality}.${chord.step + 1}`);
}
