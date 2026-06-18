import {
  ChordEvent,
  PatternData,
  ProjectState,
  chordInversionLabel,
  chordInversions,
  drumStepProbability,
  drumStepTimingMs,
  drumStepVelocity,
  hatRepeatCount,
  maxDrumTimingMs,
  minDrumTimingMs,
  normalizeChordInversion,
  normalizeDrumProbability,
  normalizeDrumTimingMs,
  normalizeDrumVelocity,
  normalizeEventProbability,
  normalizeHatRepeat,
  steps
} from "../domain/workstation";
import {
  adjacentTrackPitch,
  matchesSelectedNote,
  nextEmptyChordStep,
  nextEmptyDrumStep,
  nextEmptyStepForPitch,
  octaveShiftPitch,
  clampVelocity,
  percentLabel,
  sameChordEvent,
  timingLabel
} from "./workstationPatternTools";
import {
  ChordClipboard,
  DrumClipboard,
  NoteClipboard,
  QuickAction,
  SelectedDrumStep,
  SelectedNote,
  drumLabels
} from "./workstationUiModel";

type SelectedEventQuickActionsParams = {
  project: ProjectState;
  selectedPatternData: PatternData;
  selectedNote: SelectedNote | null;
  noteClipboard: NoteClipboard | null;
  selectedDrumStep: SelectedDrumStep | null;
  drumClipboard: DrumClipboard | null;
  selectedChord: ChordEvent | undefined;
  chordClipboard: ChordClipboard | null;
  onAuditionSelectedNote: () => void;
  onMoveSelectedNoteStep: (direction: -1 | 1) => void;
  onMoveSelectedNotePitch: (direction: -1 | 1) => void;
  onMoveSelectedNoteOctave: (direction: -1 | 1) => void;
  onUpdateSelectedNoteVelocity: (velocity: number) => void;
  onUpdateSelectedNoteProbability: (probability: number) => void;
  onCopySelectedNote: () => void;
  onPasteCopiedNote: () => void;
  onDuplicateSelectedNote: () => void;
  onAuditionSelectedDrumHit: () => void;
  onUpdateSelectedDrumVelocity: (velocity: number) => void;
  onUpdateSelectedDrumProbability: (probability: number) => void;
  onUpdateSelectedDrumTiming: (timingMs: number) => void;
  onUpdateSelectedHatRepeat: (repeat: number) => void;
  onCopySelectedDrumHit: () => void;
  onPasteCopiedDrumHit: () => void;
  onAuditionSelectedChord: () => void;
  onMoveSelectedChordStep: (direction: -1 | 1) => void;
  onMoveSelectedChordInversion: (direction: -1 | 1) => void;
  onUpdateSelectedChordVelocity: (velocity: number) => void;
  onUpdateSelectedChordProbability: (probability: number) => void;
  onCopySelectedChord: () => void;
  onPasteCopiedChord: () => void;
  onDuplicateSelectedChord: () => void;
};

export type SelectedEventQuickActions = {
  selectedNoteActive: boolean;
  selectedNoteLabel: string;
  selectedNoteActions: QuickAction[];
  selectedDrumActions: QuickAction[];
  selectedChordActions: QuickAction[];
};

export function createSelectedEventQuickActions({
  project,
  selectedPatternData,
  selectedNote,
  noteClipboard,
  selectedDrumStep,
  drumClipboard,
  selectedChord,
  chordClipboard,
  onAuditionSelectedNote,
  onMoveSelectedNoteStep,
  onMoveSelectedNotePitch,
  onMoveSelectedNoteOctave,
  onUpdateSelectedNoteVelocity,
  onUpdateSelectedNoteProbability,
  onCopySelectedNote,
  onPasteCopiedNote,
  onDuplicateSelectedNote,
  onAuditionSelectedDrumHit,
  onUpdateSelectedDrumVelocity,
  onUpdateSelectedDrumProbability,
  onUpdateSelectedDrumTiming,
  onUpdateSelectedHatRepeat,
  onCopySelectedDrumHit,
  onPasteCopiedDrumHit,
  onAuditionSelectedChord,
  onMoveSelectedChordStep,
  onMoveSelectedChordInversion,
  onUpdateSelectedChordVelocity,
  onUpdateSelectedChordProbability,
  onCopySelectedChord,
  onPasteCopiedChord,
  onDuplicateSelectedChord
}: SelectedEventQuickActionsParams): SelectedEventQuickActions {
  const selectedNoteTrackLabel = selectedNote?.track === "bass" ? "808" : "Synth";
  const selectedNoteLabel = selectedNote ? `${selectedNoteTrackLabel} ${selectedNote.pitch}.${selectedNote.step + 1}` : "No selected note";
  const selectedNoteActive = Boolean(
    selectedNote &&
      (selectedNote.track === "bass"
        ? selectedPatternData.bassNotes.some((note) => matchesSelectedNote(note, selectedNote))
        : selectedPatternData.melodyNotes.some((note) => matchesSelectedNote(note, selectedNote)))
  );
  const selectedNoteEvent =
    selectedNote && selectedNoteActive
      ? selectedNote.track === "bass"
        ? selectedPatternData.bassNotes.find((note) => matchesSelectedNote(note, selectedNote))
        : selectedPatternData.melodyNotes.find((note) => matchesSelectedNote(note, selectedNote))
      : undefined;
  const selectedNoteVelocity = selectedNoteEvent ? clampVelocity(selectedNoteEvent.velocity) : null;
  const selectedNoteProbability = selectedNoteEvent ? normalizeEventProbability(selectedNoteEvent.probability) : null;
  const selectedNoteUsedPitches =
    selectedNote?.track === "bass"
      ? selectedPatternData.bassNotes.map((note) => note.pitch)
      : selectedNote?.track === "melody"
        ? selectedPatternData.melodyNotes.map((note) => note.pitch)
        : [];
  const selectedNotePitchDown =
    selectedNote && selectedNoteActive
      ? adjacentTrackPitch(selectedNote.track, project.key, selectedNote.pitch, -1, selectedNoteUsedPitches)
      : null;
  const selectedNotePitchUp =
    selectedNote && selectedNoteActive
      ? adjacentTrackPitch(selectedNote.track, project.key, selectedNote.pitch, 1, selectedNoteUsedPitches)
      : null;
  const selectedNoteOctaveDown =
    selectedNote && selectedNoteActive ? octaveShiftPitch(selectedNote.track, selectedNote.pitch, -1) : null;
  const selectedNoteOctaveUp =
    selectedNote && selectedNoteActive ? octaveShiftPitch(selectedNote.track, selectedNote.pitch, 1) : null;
  const selectedNoteDuplicateStep =
    selectedNote && selectedNoteActive
      ? nextEmptyStepForPitch(
          selectedNote.track === "bass" ? selectedPatternData.bassNotes : selectedPatternData.melodyNotes,
          selectedNote.pitch,
          selectedNote.step
        )
      : null;
  const noteClipboardLabel = noteClipboard
    ? `${noteClipboard.track === "bass" ? "808" : "Synth"} ${noteClipboard.note.pitch}.${noteClipboard.note.step + 1}`
    : "Clipboard empty";
  const noteClipboardPatternNotes =
    noteClipboard?.track === "bass" ? selectedPatternData.bassNotes : selectedPatternData.melodyNotes;
  const noteClipboardPasteStep = noteClipboard
    ? nextEmptyStepForPitch(noteClipboardPatternNotes, noteClipboard.note.pitch, noteClipboard.note.step)
    : null;
  const selectedDrumActive = Boolean(
    selectedDrumStep && selectedPatternData.drumPattern[selectedDrumStep.lane][selectedDrumStep.step]
  );
  const selectedDrumLabel = selectedDrumStep
    ? `${drumLabels[selectedDrumStep.lane]} ${selectedDrumStep.step + 1}`
    : "No selected drum hit";
  const selectedDrumVelocity =
    selectedDrumStep && selectedDrumActive ? drumStepVelocity(selectedPatternData, selectedDrumStep.lane, selectedDrumStep.step) : null;
  const selectedDrumProbability =
    selectedDrumStep && selectedDrumActive
      ? drumStepProbability(selectedPatternData, selectedDrumStep.lane, selectedDrumStep.step)
      : null;
  const selectedDrumTiming =
    selectedDrumStep && selectedDrumActive ? drumStepTimingMs(selectedPatternData, selectedDrumStep.lane, selectedDrumStep.step) : null;
  const selectedHatRepeat =
    selectedDrumStep?.lane === "hat" && selectedDrumActive ? hatRepeatCount(selectedPatternData, selectedDrumStep.step) : null;
  const drumClipboardLabel = drumClipboard ? `${drumLabels[drumClipboard.lane]} ${drumClipboard.step + 1}` : "Clipboard empty";
  const drumClipboardPasteStep = drumClipboard ? nextEmptyDrumStep(selectedPatternData, drumClipboard.lane, drumClipboard.step) : null;
  const selectedChordActive = Boolean(
    selectedChord && selectedPatternData.chordEvents.some((chord) => sameChordEvent(chord, selectedChord))
  );
  const selectedChordLabel = selectedChord
    ? `${selectedChord.root}${selectedChord.quality}.${selectedChord.step + 1}`
    : "No selected chord";
  const selectedChordVelocity = selectedChord && selectedChordActive ? clampVelocity(selectedChord.velocity) : null;
  const selectedChordProbability =
    selectedChord && selectedChordActive ? normalizeEventProbability(selectedChord.probability) : null;
  const selectedChordInversion = selectedChord ? normalizeChordInversion(selectedChord.inversion) : 0;
  const selectedChordInversionIndex = chordInversions.indexOf(selectedChordInversion);
  const selectedChordInversionDown = selectedChordInversionIndex > 0 ? chordInversions[selectedChordInversionIndex - 1] : null;
  const selectedChordInversionUp =
    selectedChordInversionIndex >= 0 && selectedChordInversionIndex < chordInversions.length - 1
      ? chordInversions[selectedChordInversionIndex + 1]
      : null;
  const selectedChordDuplicateStep =
    selectedChord && selectedChordActive ? nextEmptyChordStep(selectedPatternData.chordEvents, selectedChord.step) : null;
  const chordClipboardLabel = chordClipboard ? `${chordClipboard.root}${chordClipboard.quality}.${chordClipboard.step + 1}` : "Clipboard empty";
  const chordClipboardPasteStep = chordClipboard ? nextEmptyChordStep(selectedPatternData.chordEvents, chordClipboard.step) : null;

  const selectedNoteActions: QuickAction[] = [
    {
      id: "selected-note-audition",
      title: "Audition selected note",
      detail: selectedNoteActive ? `${selectedNoteLabel} / one-shot built-in ${selectedNoteTrackLabel} sound` : "Select an active 808 or Synth note first.",
      group: "Create",
      keywords: "selected note audition preview hear listen one shot 808 synth edit keyboard capture midi beginner producer",
      disabled: !selectedNoteActive,
      run: onAuditionSelectedNote
    },
    {
      id: "selected-note-step-left",
      title: "Move selected note left",
      detail: selectedNote ? `${selectedNoteLabel} / Pattern ${project.selectedPattern} / one step earlier` : "Select an 808 or Synth note first.",
      group: "Create",
      keywords: "selected note move left step nudge 808 synth edit keyboard capture midi beginner producer",
      disabled: !selectedNoteActive || !selectedNote || selectedNote.step <= 0,
      run: () => onMoveSelectedNoteStep(-1)
    },
    {
      id: "selected-note-step-right",
      title: "Move selected note right",
      detail: selectedNote ? `${selectedNoteLabel} / Pattern ${project.selectedPattern} / one step later` : "Select an 808 or Synth note first.",
      group: "Create",
      keywords: "selected note move right step nudge 808 synth edit keyboard capture midi beginner producer",
      disabled: !selectedNoteActive || !selectedNote || selectedNote.step >= steps.length - 1,
      run: () => onMoveSelectedNoteStep(1)
    },
    {
      id: "selected-note-pitch-down",
      title: "Move selected note down",
      detail: selectedNotePitchDown
        ? `${selectedNoteLabel} -> ${selectedNotePitchDown} / Pattern ${project.selectedPattern}`
        : selectedNote
          ? `${selectedNoteLabel} is at the low pitch edge.`
          : "Select an 808 or Synth note first.",
      group: "Create",
      keywords: "selected note pitch down lower scale 808 synth edit keyboard capture midi beginner producer",
      disabled: !selectedNoteActive || !selectedNotePitchDown,
      run: () => onMoveSelectedNotePitch(-1)
    },
    {
      id: "selected-note-pitch-up",
      title: "Move selected note up",
      detail: selectedNotePitchUp
        ? `${selectedNoteLabel} -> ${selectedNotePitchUp} / Pattern ${project.selectedPattern}`
        : selectedNote
          ? `${selectedNoteLabel} is at the high pitch edge.`
          : "Select an 808 or Synth note first.",
      group: "Create",
      keywords: "selected note pitch up higher scale 808 synth edit keyboard capture midi beginner producer",
      disabled: !selectedNoteActive || !selectedNotePitchUp,
      run: () => onMoveSelectedNotePitch(1)
    },
    {
      id: "selected-note-octave-down",
      title: "Move selected note down octave",
      detail: selectedNoteOctaveDown
        ? `${selectedNoteLabel} -> ${selectedNoteOctaveDown} / Pattern ${project.selectedPattern}`
        : selectedNote
          ? `${selectedNoteLabel} is at the low octave edge.`
          : "Select an 808 or Synth note first.",
      group: "Create",
      keywords: "selected note octave down lower 808 synth edit keyboard capture midi beginner producer",
      disabled: !selectedNoteActive || !selectedNoteOctaveDown,
      run: () => onMoveSelectedNoteOctave(-1)
    },
    {
      id: "selected-note-octave-up",
      title: "Move selected note up octave",
      detail: selectedNoteOctaveUp
        ? `${selectedNoteLabel} -> ${selectedNoteOctaveUp} / Pattern ${project.selectedPattern}`
        : selectedNote
          ? `${selectedNoteLabel} is at the high octave edge.`
          : "Select an 808 or Synth note first.",
      group: "Create",
      keywords: "selected note octave up higher 808 synth edit keyboard capture midi beginner producer",
      disabled: !selectedNoteActive || !selectedNoteOctaveUp,
      run: () => onMoveSelectedNoteOctave(1)
    },
    {
      id: "selected-note-velocity-down",
      title: "Soften selected note",
      detail:
        selectedNoteVelocity !== null
          ? `${selectedNoteLabel} velocity ${percentLabel(selectedNoteVelocity)} -> ${percentLabel(clampVelocity(selectedNoteVelocity - 0.05))}`
          : "Select an active 808 or Synth note first.",
      group: "Create",
      keywords: "selected note velocity down softer dynamics 808 synth edit keyboard capture midi beginner producer",
      disabled: selectedNoteVelocity === null || selectedNoteVelocity <= 0,
      run: () => selectedNoteVelocity !== null && onUpdateSelectedNoteVelocity(selectedNoteVelocity - 0.05)
    },
    {
      id: "selected-note-velocity-up",
      title: "Punch selected note",
      detail:
        selectedNoteVelocity !== null
          ? `${selectedNoteLabel} velocity ${percentLabel(selectedNoteVelocity)} -> ${percentLabel(clampVelocity(selectedNoteVelocity + 0.05))}`
          : "Select an active 808 or Synth note first.",
      group: "Create",
      keywords: "selected note velocity up louder punch dynamics 808 synth edit keyboard capture midi beginner producer",
      disabled: selectedNoteVelocity === null || selectedNoteVelocity >= 1,
      run: () => selectedNoteVelocity !== null && onUpdateSelectedNoteVelocity(selectedNoteVelocity + 0.05)
    },
    {
      id: "selected-note-chance-down",
      title: "Lower selected note chance",
      detail:
        selectedNoteProbability !== null
          ? `${selectedNoteLabel} chance ${percentLabel(selectedNoteProbability)} -> ${percentLabel(
              normalizeEventProbability(selectedNoteProbability - 0.05)
            )}`
          : "Select an active 808 or Synth note first.",
      group: "Create",
      keywords: "selected note chance probability down ghost variation 808 synth edit keyboard capture midi beginner producer",
      disabled: selectedNoteProbability === null || selectedNoteProbability <= 0,
      run: () => selectedNoteProbability !== null && onUpdateSelectedNoteProbability(selectedNoteProbability - 0.05)
    },
    {
      id: "selected-note-chance-up",
      title: "Raise selected note chance",
      detail:
        selectedNoteProbability !== null
          ? `${selectedNoteLabel} chance ${percentLabel(selectedNoteProbability)} -> ${percentLabel(
              normalizeEventProbability(selectedNoteProbability + 0.05)
            )}`
          : "Select an active 808 or Synth note first.",
      group: "Create",
      keywords: "selected note chance probability up reliable variation 808 synth edit keyboard capture midi beginner producer",
      disabled: selectedNoteProbability === null || selectedNoteProbability >= 1,
      run: () => selectedNoteProbability !== null && onUpdateSelectedNoteProbability(selectedNoteProbability + 0.05)
    },
    {
      id: "selected-note-copy",
      title: "Copy selected note",
      detail: selectedNoteActive ? `${selectedNoteLabel} -> local note clipboard` : "Select an active 808 or Synth note first.",
      group: "Create",
      keywords: "selected note copy clipboard 808 synth edit keyboard capture midi beginner producer",
      disabled: !selectedNoteActive,
      run: onCopySelectedNote
    },
    {
      id: "selected-note-paste",
      title: "Paste copied note",
      detail:
        noteClipboard && noteClipboardPasteStep !== null
          ? `${noteClipboardLabel} -> step ${noteClipboardPasteStep + 1} / Pattern ${project.selectedPattern}`
          : noteClipboard
            ? `${noteClipboardLabel} has no empty paste step.`
            : "Copy an 808 or Synth note first.",
      group: "Create",
      keywords: "selected note paste clipboard 808 synth edit keyboard capture midi beginner producer",
      disabled: !noteClipboard || noteClipboardPasteStep === null,
      run: onPasteCopiedNote
    },
    {
      id: "selected-note-duplicate",
      title: "Duplicate selected note",
      detail:
        selectedNoteActive && selectedNoteDuplicateStep !== null
          ? `${selectedNoteLabel} -> step ${selectedNoteDuplicateStep + 1} / Pattern ${project.selectedPattern}`
          : selectedNote
            ? `${selectedNoteLabel} has no empty duplicate step.`
            : "Select an 808 or Synth note first.",
      group: "Create",
      keywords: "selected note duplicate copy next empty step 808 synth edit keyboard capture midi beginner producer",
      disabled: !selectedNoteActive || selectedNoteDuplicateStep === null,
      run: onDuplicateSelectedNote
    }
  ];

  const selectedDrumActions: QuickAction[] = [
    {
      id: "selected-drum-audition",
      title: "Audition selected drum hit",
      detail: selectedDrumActive ? `${selectedDrumLabel} / one-shot built-in drum rack sound` : "Select an active drum hit first.",
      group: "Create",
      keywords: "selected drum audition preview hear listen one shot hit dynamics pocket edit beginner producer",
      disabled: !selectedDrumActive,
      run: onAuditionSelectedDrumHit
    },
    {
      id: "selected-drum-velocity-down",
      title: "Soften selected drum hit",
      detail:
        selectedDrumVelocity !== null
          ? `${selectedDrumLabel} velocity ${percentLabel(selectedDrumVelocity)} -> ${percentLabel(normalizeDrumVelocity(selectedDrumVelocity - 0.05))}`
          : "Select an active drum hit first.",
      group: "Create",
      keywords: "selected drum velocity down softer dynamics pocket hit edit beginner producer",
      disabled: selectedDrumVelocity === null || selectedDrumVelocity <= 0.15,
      run: () => selectedDrumVelocity !== null && onUpdateSelectedDrumVelocity(selectedDrumVelocity - 0.05)
    },
    {
      id: "selected-drum-velocity-up",
      title: "Punch selected drum hit",
      detail:
        selectedDrumVelocity !== null
          ? `${selectedDrumLabel} velocity ${percentLabel(selectedDrumVelocity)} -> ${percentLabel(normalizeDrumVelocity(selectedDrumVelocity + 0.05))}`
          : "Select an active drum hit first.",
      group: "Create",
      keywords: "selected drum velocity up louder punch dynamics pocket hit edit beginner producer",
      disabled: selectedDrumVelocity === null || selectedDrumVelocity >= 1,
      run: () => selectedDrumVelocity !== null && onUpdateSelectedDrumVelocity(selectedDrumVelocity + 0.05)
    },
    {
      id: "selected-drum-chance-down",
      title: "Lower selected drum chance",
      detail:
        selectedDrumProbability !== null
          ? `${selectedDrumLabel} chance ${percentLabel(selectedDrumProbability)} -> ${percentLabel(normalizeDrumProbability(selectedDrumProbability - 0.05))}`
          : "Select an active drum hit first.",
      group: "Create",
      keywords: "selected drum chance probability down ghost variation pocket hit edit beginner producer",
      disabled: selectedDrumProbability === null || selectedDrumProbability <= 0,
      run: () => selectedDrumProbability !== null && onUpdateSelectedDrumProbability(selectedDrumProbability - 0.05)
    },
    {
      id: "selected-drum-chance-up",
      title: "Raise selected drum chance",
      detail:
        selectedDrumProbability !== null
          ? `${selectedDrumLabel} chance ${percentLabel(selectedDrumProbability)} -> ${percentLabel(normalizeDrumProbability(selectedDrumProbability + 0.05))}`
          : "Select an active drum hit first.",
      group: "Create",
      keywords: "selected drum chance probability up reliable variation pocket hit edit beginner producer",
      disabled: selectedDrumProbability === null || selectedDrumProbability >= 1,
      run: () => selectedDrumProbability !== null && onUpdateSelectedDrumProbability(selectedDrumProbability + 0.05)
    },
    {
      id: "selected-drum-timing-earlier",
      title: "Push selected drum earlier",
      detail:
        selectedDrumTiming !== null
          ? `${selectedDrumLabel} timing ${timingLabel(selectedDrumTiming)} -> ${timingLabel(normalizeDrumTimingMs(selectedDrumTiming - 5))}`
          : "Select an active drum hit first.",
      group: "Create",
      keywords: "selected drum timing earlier ahead microtiming pocket hit edit beginner producer",
      disabled: selectedDrumTiming === null || selectedDrumTiming <= minDrumTimingMs,
      run: () => selectedDrumTiming !== null && onUpdateSelectedDrumTiming(selectedDrumTiming - 5)
    },
    {
      id: "selected-drum-timing-later",
      title: "Lay selected drum later",
      detail:
        selectedDrumTiming !== null
          ? `${selectedDrumLabel} timing ${timingLabel(selectedDrumTiming)} -> ${timingLabel(normalizeDrumTimingMs(selectedDrumTiming + 5))}`
          : "Select an active drum hit first.",
      group: "Create",
      keywords: "selected drum timing later behind microtiming pocket hit edit beginner producer",
      disabled: selectedDrumTiming === null || selectedDrumTiming >= maxDrumTimingMs,
      run: () => selectedDrumTiming !== null && onUpdateSelectedDrumTiming(selectedDrumTiming + 5)
    },
    {
      id: "selected-drum-hat-repeat-down",
      title: "Reduce selected hat repeat",
      detail:
        selectedDrumStep?.lane === "hat" && selectedHatRepeat !== null
          ? `${selectedDrumLabel} repeat ${selectedHatRepeat}x -> ${normalizeHatRepeat(selectedHatRepeat - 1)}x`
          : "Select an active hat hit first.",
      group: "Create",
      keywords: "selected drum hat repeat roll reduce dynamics pocket hit edit beginner producer",
      disabled: selectedDrumStep?.lane !== "hat" || selectedHatRepeat === null || selectedHatRepeat <= 1,
      run: () => selectedHatRepeat !== null && onUpdateSelectedHatRepeat(selectedHatRepeat - 1)
    },
    {
      id: "selected-drum-hat-repeat-up",
      title: "Increase selected hat repeat",
      detail:
        selectedDrumStep?.lane === "hat" && selectedHatRepeat !== null
          ? `${selectedDrumLabel} repeat ${selectedHatRepeat}x -> ${normalizeHatRepeat(selectedHatRepeat + 1)}x`
          : "Select an active hat hit first.",
      group: "Create",
      keywords: "selected drum hat repeat roll increase dynamics pocket hit edit beginner producer",
      disabled: selectedDrumStep?.lane !== "hat" || selectedHatRepeat === null || selectedHatRepeat >= 4,
      run: () => selectedHatRepeat !== null && onUpdateSelectedHatRepeat(selectedHatRepeat + 1)
    },
    {
      id: "selected-drum-copy",
      title: "Copy selected drum hit",
      detail: selectedDrumActive ? `${selectedDrumLabel} -> local drum clipboard` : "Select an active drum hit first.",
      group: "Create",
      keywords: "selected drum copy clipboard hit dynamics timing chance repeat pocket edit beginner producer",
      disabled: !selectedDrumActive,
      run: onCopySelectedDrumHit
    },
    {
      id: "selected-drum-paste",
      title: "Paste copied drum hit",
      detail:
        drumClipboard && drumClipboardPasteStep !== null
          ? `${drumClipboardLabel} -> ${drumLabels[drumClipboard.lane]} ${drumClipboardPasteStep + 1} / Pattern ${project.selectedPattern}`
          : drumClipboard
            ? `${drumClipboardLabel} has no empty paste step.`
            : "Copy a drum hit first.",
      group: "Create",
      keywords: "selected drum paste clipboard hit next empty dynamics timing chance repeat pocket edit beginner producer",
      disabled: !drumClipboard || drumClipboardPasteStep === null,
      run: onPasteCopiedDrumHit
    }
  ];

  const selectedChordActions: QuickAction[] = [
    {
      id: "selected-chord-audition",
      title: "Audition selected chord",
      detail: selectedChordActive ? `${selectedChordLabel} / one-shot built-in chord sound` : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord audition preview hear listen one shot harmony progression edit beginner producer",
      disabled: !selectedChordActive,
      run: onAuditionSelectedChord
    },
    {
      id: "selected-chord-step-left",
      title: "Move selected chord left",
      detail: selectedChord ? `${selectedChordLabel} / Pattern ${project.selectedPattern} / one step earlier` : "Select a chord first.",
      group: "Create",
      keywords: "selected chord move left step nudge harmony progression edit beginner producer",
      disabled:
        !selectedChordActive ||
        !selectedChord ||
        selectedChord.step <= 0 ||
        selectedPatternData.chordEvents.some((chord) => chord.step === selectedChord.step - 1),
      run: () => onMoveSelectedChordStep(-1)
    },
    {
      id: "selected-chord-step-right",
      title: "Move selected chord right",
      detail: selectedChord ? `${selectedChordLabel} / Pattern ${project.selectedPattern} / one step later` : "Select a chord first.",
      group: "Create",
      keywords: "selected chord move right step nudge harmony progression edit beginner producer",
      disabled:
        !selectedChordActive ||
        !selectedChord ||
        selectedChord.step >= steps.length - 1 ||
        selectedPatternData.chordEvents.some((chord) => chord.step === selectedChord.step + 1),
      run: () => onMoveSelectedChordStep(1)
    },
    {
      id: "selected-chord-inversion-down",
      title: "Move selected chord voicing down",
      detail: selectedChordActive
        ? `${selectedChordLabel} / ${chordInversionLabel(selectedChordInversion)} -> ${
            selectedChordInversionDown === null ? "root" : chordInversionLabel(selectedChordInversionDown)
          }`
        : "Select a chord first.",
      group: "Create",
      keywords: "selected chord inversion voicing down lower harmony progression edit beginner producer",
      disabled: !selectedChordActive || selectedChordInversionDown === null,
      run: () => onMoveSelectedChordInversion(-1)
    },
    {
      id: "selected-chord-inversion-up",
      title: "Move selected chord voicing up",
      detail: selectedChordActive
        ? `${selectedChordLabel} / ${chordInversionLabel(selectedChordInversion)} -> ${
            selectedChordInversionUp === null ? "top" : chordInversionLabel(selectedChordInversionUp)
          }`
        : "Select a chord first.",
      group: "Create",
      keywords: "selected chord inversion voicing up higher harmony progression edit beginner producer",
      disabled: !selectedChordActive || selectedChordInversionUp === null,
      run: () => onMoveSelectedChordInversion(1)
    },
    {
      id: "selected-chord-velocity-down",
      title: "Soften selected chord",
      detail:
        selectedChordVelocity !== null
          ? `${selectedChordLabel} velocity ${percentLabel(selectedChordVelocity)} -> ${percentLabel(
              clampVelocity(selectedChordVelocity - 0.05)
            )}`
          : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord velocity down softer dynamics harmony progression edit beginner producer",
      disabled: selectedChordVelocity === null || selectedChordVelocity <= 0,
      run: () => selectedChordVelocity !== null && onUpdateSelectedChordVelocity(selectedChordVelocity - 0.05)
    },
    {
      id: "selected-chord-velocity-up",
      title: "Lift selected chord",
      detail:
        selectedChordVelocity !== null
          ? `${selectedChordLabel} velocity ${percentLabel(selectedChordVelocity)} -> ${percentLabel(
              clampVelocity(selectedChordVelocity + 0.05)
            )}`
          : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord velocity up louder lift dynamics harmony progression edit beginner producer",
      disabled: selectedChordVelocity === null || selectedChordVelocity >= 1,
      run: () => selectedChordVelocity !== null && onUpdateSelectedChordVelocity(selectedChordVelocity + 0.05)
    },
    {
      id: "selected-chord-chance-down",
      title: "Lower selected chord chance",
      detail:
        selectedChordProbability !== null
          ? `${selectedChordLabel} chance ${percentLabel(selectedChordProbability)} -> ${percentLabel(
              normalizeEventProbability(selectedChordProbability - 0.05)
            )}`
          : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord chance probability down ghost variation harmony progression edit beginner producer",
      disabled: selectedChordProbability === null || selectedChordProbability <= 0,
      run: () => selectedChordProbability !== null && onUpdateSelectedChordProbability(selectedChordProbability - 0.05)
    },
    {
      id: "selected-chord-chance-up",
      title: "Raise selected chord chance",
      detail:
        selectedChordProbability !== null
          ? `${selectedChordLabel} chance ${percentLabel(selectedChordProbability)} -> ${percentLabel(
              normalizeEventProbability(selectedChordProbability + 0.05)
            )}`
          : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord chance probability up reliable variation harmony progression edit beginner producer",
      disabled: selectedChordProbability === null || selectedChordProbability >= 1,
      run: () => selectedChordProbability !== null && onUpdateSelectedChordProbability(selectedChordProbability + 0.05)
    },
    {
      id: "selected-chord-copy",
      title: "Copy selected chord",
      detail: selectedChordActive ? `${selectedChordLabel} -> local chord clipboard` : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord copy clipboard harmony progression edit beginner producer",
      disabled: !selectedChordActive,
      run: onCopySelectedChord
    },
    {
      id: "selected-chord-paste",
      title: "Paste copied chord",
      detail:
        chordClipboard && chordClipboardPasteStep !== null
          ? `${chordClipboardLabel} -> step ${chordClipboardPasteStep + 1} / Pattern ${project.selectedPattern}`
          : chordClipboard
            ? `${chordClipboardLabel} has no empty paste step.`
            : "Copy a chord first.",
      group: "Create",
      keywords: "selected chord paste clipboard harmony progression edit beginner producer",
      disabled: !chordClipboard || chordClipboardPasteStep === null,
      run: onPasteCopiedChord
    },
    {
      id: "selected-chord-duplicate",
      title: "Duplicate selected chord",
      detail:
        selectedChordActive && selectedChordDuplicateStep !== null
          ? `${selectedChordLabel} -> step ${selectedChordDuplicateStep + 1} / Pattern ${project.selectedPattern}`
          : selectedChord
            ? `${selectedChordLabel} has no empty duplicate step.`
            : "Select a chord first.",
      group: "Create",
      keywords: "selected chord duplicate copy next empty step harmony progression edit beginner producer",
      disabled: !selectedChordActive || selectedChordDuplicateStep === null,
      run: onDuplicateSelectedChord
    }
  ];

  return {
    selectedNoteActive,
    selectedNoteLabel,
    selectedNoteActions,
    selectedDrumActions,
    selectedChordActions
  };
}
