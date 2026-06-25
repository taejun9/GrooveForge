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
    context.auditionControllerRef.current?.stop();
    context.auditionControllerRef.current = playEditorAudition(context.projectRef.current, target);
    context.setProjectStatus(status);
    return { ok: true };
  } catch (error) {
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
