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

function matchesAuditionNote(note: BassNote | MelodyNote, selectedNote: SelectedNote): boolean {
  return note.step === selectedNote.step && note.pitch === selectedNote.pitch;
}

function runEditorAudition(context: EditorAuditionContext, target: Parameters<typeof playEditorAudition>[1], status: string): void {
  try {
    context.auditionControllerRef.current?.stop();
    context.auditionControllerRef.current = playEditorAudition(context.projectRef.current, target);
    context.setProjectStatus(status);
  } catch {
    context.setProjectStatus("Editor audition is unavailable in this runtime");
  }
}

export function auditionSelectedDrumHit(context: EditorAuditionContext, selectedDrumStep: SelectedDrumStep | null): void {
  const target = selectedDrumStep;
  if (!target) {
    context.setProjectStatus("Select an active drum step");
    return;
  }

  const pattern = activePattern(context.projectRef.current);
  if (!pattern.drumPattern[target.lane][target.step]) {
    context.setProjectStatus("Select an active drum step");
    return;
  }

  runEditorAudition(context, { kind: "drum", lane: target.lane, step: target.step }, `Auditioned ${drumLabels[target.lane]} ${target.step + 1}`);
}

export function auditionSelectedNote(context: EditorAuditionContext, selectedNote: SelectedNote | null): void {
  const target = selectedNote;
  if (!target) {
    context.setProjectStatus("Select an 808 or Synth note");
    return;
  }

  const pattern = activePattern(context.projectRef.current);
  const note =
    target.track === "bass"
      ? pattern.bassNotes.find((candidate) => matchesAuditionNote(candidate, target))
      : pattern.melodyNotes.find((candidate) => matchesAuditionNote(candidate, target));
  if (!note) {
    context.setProjectStatus("Select an active note");
    return;
  }

  runEditorAudition(
    context,
    { kind: "note", track: target.track, note },
    `Auditioned ${target.track === "bass" ? "808" : "Synth"} ${note.pitch}.${note.step + 1}`
  );
}

export function auditionSelectedChord(context: EditorAuditionContext, selectedChord: ChordEvent | undefined): void {
  const chord = selectedChord;
  if (!chord) {
    context.setProjectStatus("Select a chord event");
    return;
  }

  runEditorAudition(context, { kind: "chord", chord }, `Auditioned chord ${chord.root}${chord.quality}.${chord.step + 1}`);
}
