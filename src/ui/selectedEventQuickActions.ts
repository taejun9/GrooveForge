import {
  ChordEvent,
  ChordQuality,
  PatternData,
  ProjectState,
  chordInversionLabel,
  chordInversions,
  chordQualities,
  defaultDrumVelocity,
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
  scalePitchNames,
  steps
} from "../domain/workstation";
import {
  adjacentTrackPitch,
  chordPadQualityFromDegree,
  matchesSelectedNote,
  keyboardCapturePitchLanes,
  nextEmptyChordStep,
  nextEmptyDrumStep,
  nextEmptyStepForPitch,
  octaveShiftPitch,
  clampStepLength,
  clampVelocity,
  percentLabel,
  sameChordEvent,
  timingLabel
} from "./workstationPatternTools";
import {
  ChordClipboard,
  DrumClipboard,
  KeyboardCaptureDefaults,
  NoteClipboard,
  QuickAction,
  SelectedDrumStep,
  SelectedNote,
  drumLabels
} from "./workstationUiModel";

const selectedChordDefaultVelocity = 0.5;
const selectedChordDefaultLength = 4;
const velocityResetThreshold = 0.005;

type SelectedEventQuickActionsParams = {
  project: ProjectState;
  selectedPatternData: PatternData;
  keyboardCaptureDefaults: Record<SelectedNote["track"], KeyboardCaptureDefaults>;
  selectedNote: SelectedNote | null;
  noteClipboard: NoteClipboard | null;
  selectedDrumStep: SelectedDrumStep | null;
  drumClipboard: DrumClipboard | null;
  selectedChord: ChordEvent | undefined;
  chordClipboard: ChordClipboard | null;
  onAuditionSelectedNote: () => void;
  onMoveSelectedNoteStep: (direction: -1 | 1) => void;
  onResetSelectedNoteStep: (step: number) => void;
  onMoveSelectedNotePitch: (direction: -1 | 1) => void;
  onResetSelectedNotePitch: () => void;
  onMoveSelectedNoteOctave: (direction: -1 | 1) => void;
  onUpdateSelectedNoteLength: (length: number) => void;
  onUpdateSelectedNoteGlide: (glide: boolean) => void;
  onUpdateSelectedNoteVelocity: (velocity: number) => void;
  onUpdateSelectedNoteProbability: (probability: number) => void;
  onCopySelectedNote: () => void;
  onPasteCopiedNote: () => void;
  onDuplicateSelectedNote: () => void;
  onDuplicateSelectedNoteToStep: (step: number) => void;
  onDeleteSelectedNote: () => void;
  onAuditionSelectedDrumHit: () => void;
  onMoveSelectedDrumStep: (direction: -1 | 1) => void;
  onUpdateSelectedDrumVelocity: (velocity: number) => void;
  onUpdateSelectedDrumProbability: (probability: number) => void;
  onUpdateSelectedDrumTiming: (timingMs: number) => void;
  onUpdateSelectedHatRepeat: (repeat: number) => void;
  onCopySelectedDrumHit: () => void;
  onPasteCopiedDrumHit: () => void;
  onDuplicateSelectedDrumHit: () => void;
  onDeleteSelectedDrumHit: () => void;
  onAuditionSelectedChord: () => void;
  onMoveSelectedChordStep: (direction: -1 | 1) => void;
  onUpdateSelectedChordStep: (step: number) => void;
  onMoveSelectedChordInversion: (direction: -1 | 1) => void;
  onResetSelectedChordInversion: () => void;
  onUpdateSelectedChordRoot: (root: string) => void;
  onUpdateSelectedChordQuality: (quality: ChordQuality) => void;
  onUpdateSelectedChordLength: (length: number) => void;
  onUpdateSelectedChordVelocity: (velocity: number) => void;
  onUpdateSelectedChordProbability: (probability: number) => void;
  onCopySelectedChord: () => void;
  onPasteCopiedChord: () => void;
  onDuplicateSelectedChord: () => void;
  onDeleteSelectedChord: () => void;
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
  keyboardCaptureDefaults,
  selectedNote,
  noteClipboard,
  selectedDrumStep,
  drumClipboard,
  selectedChord,
  chordClipboard,
  onAuditionSelectedNote,
  onMoveSelectedNoteStep,
  onResetSelectedNoteStep,
  onMoveSelectedNotePitch,
  onResetSelectedNotePitch,
  onMoveSelectedNoteOctave,
  onUpdateSelectedNoteLength,
  onUpdateSelectedNoteGlide,
  onUpdateSelectedNoteVelocity,
  onUpdateSelectedNoteProbability,
  onCopySelectedNote,
  onPasteCopiedNote,
  onDuplicateSelectedNote,
  onDuplicateSelectedNoteToStep,
  onDeleteSelectedNote,
  onAuditionSelectedDrumHit,
  onMoveSelectedDrumStep,
  onUpdateSelectedDrumVelocity,
  onUpdateSelectedDrumProbability,
  onUpdateSelectedDrumTiming,
  onUpdateSelectedHatRepeat,
  onCopySelectedDrumHit,
  onPasteCopiedDrumHit,
  onDuplicateSelectedDrumHit,
  onDeleteSelectedDrumHit,
  onAuditionSelectedChord,
  onMoveSelectedChordStep,
  onUpdateSelectedChordStep,
  onMoveSelectedChordInversion,
  onResetSelectedChordInversion,
  onUpdateSelectedChordRoot,
  onUpdateSelectedChordQuality,
  onUpdateSelectedChordLength,
  onUpdateSelectedChordVelocity,
  onUpdateSelectedChordProbability,
  onCopySelectedChord,
  onPasteCopiedChord,
  onDuplicateSelectedChord,
  onDeleteSelectedChord
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
  const selectedNoteVelocityDefault =
    selectedNote && selectedNoteActive ? clampVelocity(keyboardCaptureDefaults[selectedNote.track].velocity) : null;
  const selectedNoteProbability = selectedNoteEvent ? normalizeEventProbability(selectedNoteEvent.probability) : null;
  const selectedNoteLength = selectedNoteEvent ? clampStepLength(selectedNoteEvent.length) : null;
  const selectedNoteLengthDefault =
    selectedNote && selectedNoteActive ? clampStepLength(keyboardCaptureDefaults[selectedNote.track].length) : null;
  const selectedNoteStepResetTarget =
    selectedNote && selectedNoteActive && selectedNoteLength !== null
      ? steps
          .filter((step) => step % 4 === 0 && step <= steps.length - selectedNoteLength)
          .reduce<number | null>((best, step) => {
            if (best === null) {
              return step;
            }
            const distance = Math.abs(step - selectedNote.step);
            const bestDistance = Math.abs(best - selectedNote.step);
            return distance < bestDistance || (distance === bestDistance && step < best) ? step : best;
          }, null)
      : null;
  const selectedNoteStepResetBlocked =
    selectedNote && selectedNoteStepResetTarget !== null
      ? (selectedNote.track === "bass" ? selectedPatternData.bassNotes : selectedPatternData.melodyNotes).some(
          (note) =>
            !matchesSelectedNote(note, selectedNote) &&
            note.step === selectedNoteStepResetTarget &&
            note.pitch === selectedNote.pitch
        )
      : false;
  const selectedNoteGlide =
    selectedNote?.track === "bass" && selectedNoteEvent ? Boolean((selectedNoteEvent as { glide?: boolean }).glide) : null;
  const selectedNoteGlideDefault =
    selectedNote?.track === "bass" && selectedNoteActive ? Boolean(keyboardCaptureDefaults.bass.glide) : null;
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
  const selectedNoteDefaultPitch =
    selectedNote && selectedNoteActive
      ? keyboardCapturePitchLanes(project.key, selectedNote.track, keyboardCaptureDefaults[selectedNote.track])[0] ?? null
      : null;
  const selectedNoteDefaultPitchOccupied = Boolean(
    selectedNote &&
      selectedNoteDefaultPitch &&
      (selectedNote.track === "bass" ? selectedPatternData.bassNotes : selectedPatternData.melodyNotes).some(
        (note) => !matchesSelectedNote(note, selectedNote) && note.step === selectedNote.step && note.pitch === selectedNoteDefaultPitch
      )
  );
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
  const selectedNoteBeatDuplicateStep =
    selectedNote && selectedNoteActive && selectedNoteLength !== null
      ? steps.find(
          (step) =>
            step > selectedNote.step &&
            step % 4 === 0 &&
            step <= steps.length - selectedNoteLength &&
            !(selectedNote.track === "bass" ? selectedPatternData.bassNotes : selectedPatternData.melodyNotes).some(
              (note) => note.step === step && note.pitch === selectedNote.pitch
            )
        ) ?? null
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
  const selectedDrumStepLeft = selectedDrumStep && selectedDrumStep.step > 0 ? selectedDrumStep.step - 1 : null;
  const selectedDrumStepRight =
    selectedDrumStep && selectedDrumStep.step < steps.length - 1 ? selectedDrumStep.step + 1 : null;
  const selectedDrumStepLeftLabel =
    selectedDrumStep && selectedDrumStepLeft !== null ? `${drumLabels[selectedDrumStep.lane]} ${selectedDrumStepLeft + 1}` : "";
  const selectedDrumStepRightLabel =
    selectedDrumStep && selectedDrumStepRight !== null ? `${drumLabels[selectedDrumStep.lane]} ${selectedDrumStepRight + 1}` : "";
  const selectedDrumStepLeftOccupied = Boolean(
    selectedDrumStep && selectedDrumStepLeft !== null && selectedPatternData.drumPattern[selectedDrumStep.lane][selectedDrumStepLeft]
  );
  const selectedDrumStepRightOccupied = Boolean(
    selectedDrumStep && selectedDrumStepRight !== null && selectedPatternData.drumPattern[selectedDrumStep.lane][selectedDrumStepRight]
  );
  const selectedDrumVelocity =
    selectedDrumStep && selectedDrumActive ? drumStepVelocity(selectedPatternData, selectedDrumStep.lane, selectedDrumStep.step) : null;
  const selectedDrumVelocityDefault =
    selectedDrumStep && selectedDrumActive
      ? normalizeDrumVelocity(defaultDrumVelocity(selectedDrumStep.lane, selectedDrumStep.step))
      : null;
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
  const selectedDrumDuplicateStep =
    selectedDrumStep && selectedDrumActive ? nextEmptyDrumStep(selectedPatternData, selectedDrumStep.lane, selectedDrumStep.step) : null;
  const selectedDrumDuplicateLabel =
    selectedDrumStep && selectedDrumDuplicateStep !== null
      ? `${drumLabels[selectedDrumStep.lane]} ${selectedDrumDuplicateStep + 1}`
      : "";
  const selectedChordActive = Boolean(
    selectedChord && selectedPatternData.chordEvents.some((chord) => sameChordEvent(chord, selectedChord))
  );
  const selectedChordLabel = selectedChord
    ? `${selectedChord.root}${selectedChord.quality}.${selectedChord.step + 1}`
    : "No selected chord";
  const selectedChordVelocity = selectedChord && selectedChordActive ? clampVelocity(selectedChord.velocity) : null;
  const selectedChordVelocityDefault = selectedChord && selectedChordActive ? clampVelocity(selectedChordDefaultVelocity) : null;
  const selectedChordProbability =
    selectedChord && selectedChordActive ? normalizeEventProbability(selectedChord.probability) : null;
  const selectedChordScaleRoots = scalePitchNames(project.key);
  const selectedChordRootIndex = selectedChord ? selectedChordScaleRoots.indexOf(selectedChord.root) : -1;
  const selectedChordRootDown =
    selectedChord && selectedChordRootIndex > 0 ? selectedChordScaleRoots[selectedChordRootIndex - 1] : null;
  const selectedChordRootUp =
    selectedChord && selectedChordRootIndex >= 0 && selectedChordRootIndex < selectedChordScaleRoots.length - 1
      ? selectedChordScaleRoots[selectedChordRootIndex + 1]
      : null;
  const selectedChordTonicRoot = selectedChordScaleRoots[0] ?? null;
  const selectedChordQualityIndex = selectedChord ? chordQualities.indexOf(selectedChord.quality) : -1;
  const selectedChordNextQuality =
    selectedChord && selectedChordQualityIndex >= 0
      ? chordQualities[(selectedChordQualityIndex + 1) % chordQualities.length]
      : chordQualities[0];
  const selectedChordDefaultQuality =
    selectedChord && selectedChordActive && selectedChordRootIndex >= 0
      ? chordPadQualityFromDegree(project.key, selectedChordRootIndex)
      : null;
  const selectedChordMaxLength = selectedChord ? Math.max(1, steps.length - selectedChord.step) : 1;
  const selectedChordLengthDefault =
    selectedChord && selectedChordActive ? Math.min(selectedChordDefaultLength, selectedChordMaxLength) : null;
  const selectedChordLength =
    selectedChord && selectedChordActive ? Math.min(clampStepLength(selectedChord.length), selectedChordMaxLength) : null;
  const selectedChordStepResetTarget =
    selectedChord && selectedChordActive && selectedChordLength !== null
      ? steps
          .filter((step) => step % 4 === 0 && step <= steps.length - selectedChordLength)
          .reduce<number | null>((best, step) => {
            if (best === null) {
              return step;
            }
            const distance = Math.abs(step - selectedChord.step);
            const bestDistance = Math.abs(best - selectedChord.step);
            return distance < bestDistance || (distance === bestDistance && step < best) ? step : best;
          }, null)
      : null;
  const selectedChordStepResetBlocked =
    selectedChord && selectedChordStepResetTarget !== null
      ? selectedPatternData.chordEvents.some(
          (chord) => chord.step === selectedChordStepResetTarget && !sameChordEvent(chord, selectedChord)
        )
      : false;
  const selectedChordInversion = selectedChord ? normalizeChordInversion(selectedChord.inversion) : 0;
  const selectedChordInversionIndex = chordInversions.indexOf(selectedChordInversion);
  const selectedChordInversionDown = selectedChordInversionIndex > 0 ? chordInversions[selectedChordInversionIndex - 1] : null;
  const selectedChordInversionUp =
    selectedChordInversionIndex >= 0 && selectedChordInversionIndex < chordInversions.length - 1
      ? chordInversions[selectedChordInversionIndex + 1]
      : null;
  const selectedChordDuplicateStep =
    selectedChord && selectedChordActive ? nextEmptyChordStep(selectedPatternData.chordEvents, selectedChord.step) : null;
  const selectedChordDeleteBlocked = selectedChordActive && selectedPatternData.chordEvents.length <= 1;
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
      id: "selected-note-step-reset",
      title: "Reset selected note step",
      detail:
        selectedNoteActive && selectedNote && selectedNoteStepResetTarget !== null
          ? selectedNote.step === selectedNoteStepResetTarget
            ? `${selectedNoteLabel} already starts on the 4-step beat grid.`
            : selectedNoteStepResetBlocked
              ? `Step ${selectedNoteStepResetTarget + 1} already has ${selectedNote.pitch}.`
              : `${selectedNoteLabel} step ${selectedNote.step + 1} -> ${selectedNoteStepResetTarget + 1} / 4-step beat grid`
          : "Select an active 808 or Synth note first.",
      group: "Create",
      keywords: "selected note step reset snap beat grid timing quantize 808 synth edit beginner producer",
      disabled:
        !selectedNoteActive ||
        selectedNoteStepResetTarget === null ||
        selectedNote?.step === selectedNoteStepResetTarget ||
        selectedNoteStepResetBlocked,
      run: () => {
        if (selectedNoteStepResetTarget !== null) {
          onResetSelectedNoteStep(selectedNoteStepResetTarget);
        }
      }
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
      id: "selected-note-pitch-reset",
      title: "Reset selected note pitch",
      detail:
        selectedNoteActive && selectedNoteDefaultPitch
          ? selectedNoteDefaultPitchOccupied
            ? `${selectedNoteDefaultPitch}.${(selectedNote?.step ?? 0) + 1} already exists.`
            : `${selectedNoteLabel} -> ${selectedNoteDefaultPitch} / ${project.key} default`
          : "Select an active 808 or Synth note first.",
      group: "Create",
      keywords: "selected note pitch reset default tonic root keyboard capture scale 808 synth edit beginner producer",
      disabled:
        !selectedNoteActive ||
        !selectedNoteDefaultPitch ||
        selectedNote?.pitch === selectedNoteDefaultPitch ||
        selectedNoteDefaultPitchOccupied,
      run: onResetSelectedNotePitch
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
      id: "selected-note-length-short",
      title: "Shorten selected note",
      detail:
        selectedNoteLength !== null
          ? `${selectedNoteLabel} length ${selectedNoteLength} -> ${clampStepLength(selectedNoteLength - 1)}`
          : "Select an active 808 or Synth note first.",
      group: "Create",
      keywords: "selected note length shorten duration articulation shorter 808 synth edit keyboard capture midi beginner producer",
      disabled: selectedNoteLength === null || selectedNoteLength <= 1,
      run: () => selectedNoteLength !== null && onUpdateSelectedNoteLength(selectedNoteLength - 1)
    },
    {
      id: "selected-note-length-long",
      title: "Lengthen selected note",
      detail:
        selectedNoteLength !== null
          ? `${selectedNoteLabel} length ${selectedNoteLength} -> ${clampStepLength(selectedNoteLength + 1)}`
          : "Select an active 808 or Synth note first.",
      group: "Create",
      keywords: "selected note length lengthen duration articulation longer sustain 808 synth edit keyboard capture midi beginner producer",
      disabled: selectedNoteLength === null || selectedNoteLength >= steps.length,
      run: () => selectedNoteLength !== null && onUpdateSelectedNoteLength(selectedNoteLength + 1)
    },
    {
      id: "selected-note-length-reset",
      title: "Reset selected note length",
      detail:
        selectedNoteLength !== null && selectedNoteLengthDefault !== null
          ? `${selectedNoteLabel} length ${selectedNoteLength} -> ${selectedNoteLengthDefault}`
          : "Select an active 808 or Synth note first.",
      group: "Create",
      keywords: "selected note length reset default duration articulation keyboard capture 808 synth edit beginner producer",
      disabled: selectedNoteLength === null || selectedNoteLengthDefault === null || selectedNoteLength === selectedNoteLengthDefault,
      run: () => selectedNoteLengthDefault !== null && onUpdateSelectedNoteLength(selectedNoteLengthDefault)
    },
    {
      id: "selected-note-glide-toggle",
      title: selectedNoteGlide ? "Turn selected 808 glide off" : "Turn selected 808 glide on",
      detail:
        selectedNote?.track === "bass" && selectedNoteGlide !== null
          ? `${selectedNoteLabel} glide -> ${selectedNoteGlide ? "Off" : "On"}`
          : "Select an active 808 note first.",
      group: "Create",
      keywords: "selected note glide slide toggle 808 bass articulation edit keyboard capture midi beginner producer",
      disabled: selectedNote?.track !== "bass" || selectedNoteGlide === null,
      run: () => selectedNoteGlide !== null && onUpdateSelectedNoteGlide(!selectedNoteGlide)
    },
    {
      id: "selected-note-glide-reset",
      title: "Reset selected 808 glide",
      detail:
        selectedNoteGlide !== null && selectedNoteGlideDefault !== null
          ? `${selectedNoteLabel} glide ${selectedNoteGlide ? "On" : "Off"} -> ${selectedNoteGlideDefault ? "On" : "Off"}`
          : "Select an active 808 note first.",
      group: "Create",
      keywords: "selected note glide reset default slide 808 bass articulation keyboard capture edit beginner producer",
      disabled: selectedNoteGlide === null || selectedNoteGlideDefault === null || selectedNoteGlide === selectedNoteGlideDefault,
      run: () => selectedNoteGlideDefault !== null && onUpdateSelectedNoteGlide(selectedNoteGlideDefault)
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
      id: "selected-note-velocity-reset",
      title: "Reset selected note velocity",
      detail:
        selectedNoteVelocity !== null && selectedNoteVelocityDefault !== null
          ? `${selectedNoteLabel} velocity ${percentLabel(selectedNoteVelocity)} -> ${percentLabel(selectedNoteVelocityDefault)}`
          : "Select an active 808 or Synth note first.",
      group: "Create",
      keywords: "selected note velocity reset default capture dynamics 808 synth edit keyboard capture midi beginner producer",
      disabled:
        selectedNoteVelocity === null ||
        selectedNoteVelocityDefault === null ||
        Math.abs(selectedNoteVelocity - selectedNoteVelocityDefault) < velocityResetThreshold,
      run: () => selectedNoteVelocityDefault !== null && onUpdateSelectedNoteVelocity(selectedNoteVelocityDefault)
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
      id: "selected-note-chance-reset",
      title: "Reset selected note chance",
      detail:
        selectedNoteProbability !== null
          ? `${selectedNoteLabel} chance ${percentLabel(selectedNoteProbability)} -> ${percentLabel(1)}`
          : "Select an active 808 or Synth note first.",
      group: "Create",
      keywords: "selected note chance probability reset reliable 100 default variation 808 synth edit keyboard capture midi beginner producer",
      disabled: selectedNoteProbability === null || selectedNoteProbability >= 1,
      run: () => onUpdateSelectedNoteProbability(1)
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
    },
    {
      id: "selected-note-duplicate-beat",
      title: "Duplicate selected note to beat",
      detail:
        selectedNoteActive && selectedNoteBeatDuplicateStep !== null
          ? `${selectedNoteLabel} -> beat step ${selectedNoteBeatDuplicateStep + 1} / Pattern ${project.selectedPattern}`
          : selectedNoteActive && selectedNote
            ? `${selectedNoteLabel} has no later empty 4-step beat slot.`
            : "Select an active 808 or Synth note first.",
      group: "Create",
      keywords: "selected note duplicate beat grid copy repeat 4-step anchor 808 synth edit beginner producer",
      disabled: !selectedNoteActive || selectedNoteBeatDuplicateStep === null,
      run: () => {
        if (selectedNoteBeatDuplicateStep !== null) {
          onDuplicateSelectedNoteToStep(selectedNoteBeatDuplicateStep);
        }
      }
    },
    {
      id: "selected-note-delete",
      title: "Delete selected note",
      detail: selectedNoteActive ? `${selectedNoteLabel} / undoable Pattern ${project.selectedPattern} edit` : "Select an active 808 or Synth note first.",
      group: "Create",
      keywords: "selected note delete remove clear 808 synth edit keyboard capture midi beginner producer undo",
      disabled: !selectedNoteActive,
      run: onDeleteSelectedNote
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
      id: "selected-drum-step-left",
      title: "Move selected drum hit left",
      detail: !selectedDrumActive
        ? "Select an active drum hit first."
        : selectedDrumStepLeft === null
          ? `${selectedDrumLabel} is at the first step.`
          : selectedDrumStepLeftOccupied
            ? `${selectedDrumStepLeftLabel} already has a hit.`
            : `${selectedDrumLabel} -> ${selectedDrumStepLeftLabel} / Pattern ${project.selectedPattern}`,
      group: "Create",
      keywords: "selected drum move left step earlier nudge grid pocket hit edit beginner producer",
      disabled: !selectedDrumActive || selectedDrumStepLeft === null || selectedDrumStepLeftOccupied,
      run: () => onMoveSelectedDrumStep(-1)
    },
    {
      id: "selected-drum-step-right",
      title: "Move selected drum hit right",
      detail: !selectedDrumActive
        ? "Select an active drum hit first."
        : selectedDrumStepRight === null
          ? `${selectedDrumLabel} is at the last step.`
          : selectedDrumStepRightOccupied
            ? `${selectedDrumStepRightLabel} already has a hit.`
            : `${selectedDrumLabel} -> ${selectedDrumStepRightLabel} / Pattern ${project.selectedPattern}`,
      group: "Create",
      keywords: "selected drum move right step later nudge grid pocket hit edit beginner producer",
      disabled: !selectedDrumActive || selectedDrumStepRight === null || selectedDrumStepRightOccupied,
      run: () => onMoveSelectedDrumStep(1)
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
      id: "selected-drum-velocity-reset",
      title: "Reset selected drum velocity",
      detail:
        selectedDrumVelocity !== null && selectedDrumVelocityDefault !== null
          ? `${selectedDrumLabel} velocity ${percentLabel(selectedDrumVelocity)} -> ${percentLabel(selectedDrumVelocityDefault)}`
          : "Select an active drum hit first.",
      group: "Create",
      keywords: "selected drum velocity reset default lane step dynamics pocket hit edit beginner producer",
      disabled:
        selectedDrumVelocity === null ||
        selectedDrumVelocityDefault === null ||
        Math.abs(selectedDrumVelocity - selectedDrumVelocityDefault) < velocityResetThreshold,
      run: () => selectedDrumVelocityDefault !== null && onUpdateSelectedDrumVelocity(selectedDrumVelocityDefault)
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
      id: "selected-drum-chance-reset",
      title: "Reset selected drum chance",
      detail:
        selectedDrumProbability !== null
          ? `${selectedDrumLabel} chance ${percentLabel(selectedDrumProbability)} -> ${percentLabel(1)}`
          : "Select an active drum hit first.",
      group: "Create",
      keywords: "selected drum chance probability reset reliable 100 default variation pocket hit edit beginner producer",
      disabled: selectedDrumProbability === null || selectedDrumProbability >= 1,
      run: () => onUpdateSelectedDrumProbability(1)
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
      id: "selected-drum-timing-reset",
      title: "Reset selected drum timing",
      detail:
        selectedDrumTiming !== null
          ? `${selectedDrumLabel} timing ${timingLabel(selectedDrumTiming)} -> ${timingLabel(0)}`
          : "Select an active drum hit first.",
      group: "Create",
      keywords: "selected drum timing reset quantize grid on-grid default microtiming pocket hit edit beginner producer",
      disabled: selectedDrumTiming === null || selectedDrumTiming === 0,
      run: () => onUpdateSelectedDrumTiming(0)
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
      id: "selected-drum-hat-repeat-reset",
      title: "Reset selected hat repeat",
      detail:
        selectedDrumStep?.lane === "hat" && selectedHatRepeat !== null
          ? `${selectedDrumLabel} repeat ${selectedHatRepeat}x -> 1x`
          : "Select an active hat hit first.",
      group: "Create",
      keywords: "selected drum hat repeat reset roll default 1x pocket hit edit beginner producer",
      disabled: selectedDrumStep?.lane !== "hat" || selectedHatRepeat === null || selectedHatRepeat <= 1,
      run: () => onUpdateSelectedHatRepeat(1)
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
    },
    {
      id: "selected-drum-duplicate",
      title: "Duplicate selected drum hit",
      detail: !selectedDrumActive
        ? "Select an active drum hit first."
        : selectedDrumDuplicateStep === null
          ? `${selectedDrumLabel} has no empty duplicate step.`
          : `${selectedDrumLabel} -> ${selectedDrumDuplicateLabel} / Pattern ${project.selectedPattern}`,
      group: "Create",
      keywords: "selected drum duplicate repeat clone hit next empty dynamics timing chance repeat pocket edit beginner producer",
      disabled: !selectedDrumActive || selectedDrumDuplicateStep === null,
      run: onDuplicateSelectedDrumHit
    },
    {
      id: "selected-drum-delete",
      title: "Delete selected drum hit",
      detail: selectedDrumActive ? `${selectedDrumLabel} / undoable Pattern ${project.selectedPattern} edit` : "Select an active drum hit first.",
      group: "Create",
      keywords: "selected drum delete remove clear hit dynamics timing chance repeat pocket edit beginner producer undo",
      disabled: !selectedDrumActive,
      run: onDeleteSelectedDrumHit
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
      id: "selected-chord-step-reset",
      title: "Reset selected chord step",
      detail:
        selectedChordActive && selectedChord && selectedChordStepResetTarget !== null
          ? selectedChord.step === selectedChordStepResetTarget
            ? `${selectedChordLabel} already starts on the 4-step chord grid.`
            : selectedChordStepResetBlocked
              ? `Step ${selectedChordStepResetTarget + 1} already has another chord.`
              : `${selectedChordLabel} step ${selectedChord.step + 1} -> ${selectedChordStepResetTarget + 1} / 4-step grid`
          : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord step reset snap grid timing quantize harmony progression edit beginner producer",
      disabled:
        !selectedChordActive ||
        selectedChordStepResetTarget === null ||
        selectedChord?.step === selectedChordStepResetTarget ||
        selectedChordStepResetBlocked,
      run: () => {
        if (selectedChordStepResetTarget !== null) {
          onUpdateSelectedChordStep(selectedChordStepResetTarget);
        }
      }
    },
    {
      id: "selected-chord-root-down",
      title: "Move selected chord root down",
      detail:
        selectedChordRootDown !== null
          ? `${selectedChordLabel} root ${selectedChord?.root ?? "-"} -> ${selectedChordRootDown} / ${project.key}`
          : selectedChord && selectedChordRootIndex < 0
            ? `${selectedChordLabel} is outside ${project.key} scale roots.`
            : selectedChord
            ? `${selectedChordLabel} has no lower ${project.key} scale root.`
            : "Select a chord first.",
      group: "Create",
      keywords: "selected chord root down lower scale harmony progression edit beginner producer",
      disabled: !selectedChordActive || selectedChordRootDown === null,
      run: () => selectedChordRootDown !== null && onUpdateSelectedChordRoot(selectedChordRootDown)
    },
    {
      id: "selected-chord-root-up",
      title: "Move selected chord root up",
      detail:
        selectedChordRootUp !== null
          ? `${selectedChordLabel} root ${selectedChord?.root ?? "-"} -> ${selectedChordRootUp} / ${project.key}`
          : selectedChord && selectedChordRootIndex < 0
            ? `${selectedChordLabel} is outside ${project.key} scale roots.`
            : selectedChord
            ? `${selectedChordLabel} has no higher ${project.key} scale root.`
            : "Select a chord first.",
      group: "Create",
      keywords: "selected chord root up higher scale harmony progression edit beginner producer",
      disabled: !selectedChordActive || selectedChordRootUp === null,
      run: () => selectedChordRootUp !== null && onUpdateSelectedChordRoot(selectedChordRootUp)
    },
    {
      id: "selected-chord-root-reset",
      title: "Reset selected chord root",
      detail:
        selectedChordActive && selectedChordTonicRoot
          ? selectedChord?.root === selectedChordTonicRoot
            ? `${selectedChordLabel} already uses ${project.key} tonic root.`
            : `${selectedChordLabel} root ${selectedChord?.root ?? "-"} -> ${selectedChordTonicRoot} / ${project.key}`
          : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord root reset tonic key scale home harmony progression edit beginner producer",
      disabled: !selectedChordActive || !selectedChordTonicRoot || selectedChord?.root === selectedChordTonicRoot,
      run: () => {
        if (selectedChordTonicRoot) {
          onUpdateSelectedChordRoot(selectedChordTonicRoot);
        }
      }
    },
    {
      id: "selected-chord-quality-cycle",
      title: "Cycle selected chord quality",
      detail: selectedChordActive
        ? `${selectedChordLabel} quality ${selectedChord?.quality ?? "maj"} -> ${selectedChordNextQuality}`
        : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord quality cycle major minor seventh sus dim color harmony progression edit beginner producer",
      disabled: !selectedChordActive,
      run: () => onUpdateSelectedChordQuality(selectedChordNextQuality)
    },
    {
      id: "selected-chord-quality-reset",
      title: "Reset selected chord quality",
      detail:
        selectedChordActive && selectedChordDefaultQuality
          ? `${selectedChordLabel} quality ${selectedChord?.quality ?? "maj"} -> ${selectedChordDefaultQuality} / ${project.key}`
          : selectedChord && selectedChordRootIndex < 0
            ? `${selectedChordLabel} is outside ${project.key} scale roots.`
            : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord quality reset default diatonic key scale harmony progression edit beginner producer",
      disabled: !selectedChordActive || !selectedChordDefaultQuality || selectedChord?.quality === selectedChordDefaultQuality,
      run: () => {
        if (selectedChordDefaultQuality) {
          onUpdateSelectedChordQuality(selectedChordDefaultQuality);
        }
      }
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
      id: "selected-chord-inversion-reset",
      title: "Reset selected chord voicing",
      detail: selectedChordActive
        ? `${selectedChordLabel} / ${chordInversionLabel(selectedChordInversion)} -> ${chordInversionLabel(0)}`
        : "Select a chord first.",
      group: "Create",
      keywords: "selected chord inversion reset root position voicing harmony progression edit beginner producer",
      disabled: !selectedChordActive || selectedChordInversion === 0,
      run: onResetSelectedChordInversion
    },
    {
      id: "selected-chord-length-short",
      title: "Shorten selected chord",
      detail:
        selectedChordLength !== null
          ? `${selectedChordLabel} length ${selectedChordLength} -> ${clampStepLength(selectedChordLength - 1)}`
          : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord length shorten duration rhythm harmony progression edit beginner producer",
      disabled: selectedChordLength === null || selectedChordLength <= 1,
      run: () => selectedChordLength !== null && onUpdateSelectedChordLength(selectedChordLength - 1)
    },
    {
      id: "selected-chord-length-long",
      title: "Lengthen selected chord",
      detail:
        selectedChordLength !== null
          ? `${selectedChordLabel} length ${selectedChordLength} -> ${Math.min(
              selectedChordMaxLength,
              clampStepLength(selectedChordLength + 1)
            )}`
          : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord length lengthen duration rhythm sustain harmony progression edit beginner producer",
      disabled: selectedChordLength === null || selectedChordLength >= selectedChordMaxLength,
      run: () => selectedChordLength !== null && onUpdateSelectedChordLength(selectedChordLength + 1)
    },
    {
      id: "selected-chord-length-reset",
      title: "Reset selected chord length",
      detail:
        selectedChordLength !== null && selectedChordLengthDefault !== null
          ? `${selectedChordLabel} length ${selectedChordLength} -> ${selectedChordLengthDefault}`
          : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord length reset default duration rhythm harmony progression edit beginner producer",
      disabled:
        selectedChordLength === null || selectedChordLengthDefault === null || selectedChordLength === selectedChordLengthDefault,
      run: () => selectedChordLengthDefault !== null && onUpdateSelectedChordLength(selectedChordLengthDefault)
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
      id: "selected-chord-velocity-reset",
      title: "Reset selected chord velocity",
      detail:
        selectedChordVelocity !== null && selectedChordVelocityDefault !== null
          ? `${selectedChordLabel} velocity ${percentLabel(selectedChordVelocity)} -> ${percentLabel(selectedChordVelocityDefault)}`
          : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord velocity reset default dynamics harmony progression edit beginner producer",
      disabled:
        selectedChordVelocity === null ||
        selectedChordVelocityDefault === null ||
        Math.abs(selectedChordVelocity - selectedChordVelocityDefault) < velocityResetThreshold,
      run: () => selectedChordVelocityDefault !== null && onUpdateSelectedChordVelocity(selectedChordVelocityDefault)
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
      id: "selected-chord-chance-reset",
      title: "Reset selected chord chance",
      detail:
        selectedChordProbability !== null
          ? `${selectedChordLabel} chance ${percentLabel(selectedChordProbability)} -> ${percentLabel(1)}`
          : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord chance probability reset reliable 100 default variation harmony progression edit beginner producer",
      disabled: selectedChordProbability === null || selectedChordProbability >= 1,
      run: () => onUpdateSelectedChordProbability(1)
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
    },
    {
      id: "selected-chord-delete",
      title: "Delete selected chord",
      detail: selectedChordDeleteBlocked
        ? "Keep at least one chord in the selected progression."
        : selectedChordActive
          ? `${selectedChordLabel} / undoable Pattern ${project.selectedPattern} edit`
          : "Select an active chord first.",
      group: "Create",
      keywords: "selected chord delete remove clear harmony progression edit beginner producer undo",
      disabled: !selectedChordActive || selectedChordDeleteBlocked,
      run: onDeleteSelectedChord
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
