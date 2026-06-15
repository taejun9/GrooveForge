import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CircleStop,
  Copy,
  Disc3,
  Download,
  Drum,
  FolderOpen,
  Gauge,
  KeyboardMusic,
  Music2,
  Play,
  Plus,
  Redo2,
  Save,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Undo2,
  Waves
} from "lucide-react";
import type { ChangeEvent, CSSProperties, ReactElement, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { exportMidi } from "../audio/midi";
import { analyzeExport, ExportAnalysis, exportStems, exportWav } from "../audio/render";
import { PlaybackController, PlaybackMode, PlaybackSnapshot, startRealtimePlayback } from "../audio/scheduler";
import {
  ArrangementBlock,
  ArrangementMuteTrack,
  ArrangementSection,
  ArrangementTemplateId,
  BassNote,
  ChordEvent,
  ChordProgressionPreset,
  ChordQuality,
  DrumGroovePreset,
  DrumLane,
  applyDrumGroovePreset,
  chordProgressionPresetIds,
  chordProgressionPresetLabel,
  getStyle,
  MasterPreset,
  MelodyNote,
  MixerChannel,
  NoteTrack,
  PatternData,
  PatternSlot,
  PatternVariationPreset,
  ProjectState,
  SoundDesign,
  activePattern,
  arrangementSections,
  arrangementEnergyGain,
  arrangementMuteTrackIds,
  arrangementMuteTrackLabel,
  arrangementTemplateIds,
  arrangementTemplateLabel,
  arrangementTotalBars,
  bassPitchLanes,
  chordInversions,
  chordInversionLabel,
  chordQualities,
  clonePatternData,
  createChordProgressionPreset,
  createArrangementTemplate,
  createNextChordEvent,
  createPatternVariation,
  createStylePatternSet,
  createEmptyPatternData,
  defaultDrumVelocity,
  drumStepProbability,
  drumStepTimingMs,
  drumStepVelocity,
  drumGroovePresetIds,
  drumGroovePresetLabel,
  hatRepeatCount,
  masterPresetCeilingDb,
  masterPresets,
  melodyPitchLanes,
  minArrangementBars,
  minDrumTimingMs,
  maxArrangementBars,
  maxDrumTimingMs,
  normalizeArrangementEnergy,
  normalizeArrangementMutedTracks,
  normalizeArrangementBars,
  normalizeDrumProbability,
  normalizeDrumTimingMs,
  normalizeDrumVelocity,
  normalizeChordInversion,
  normalizeEventProbability,
  normalizeHatRepeat,
  normalizeMixerEq,
  parseProjectFile,
  patternSlots,
  patternVariationPresetIds,
  patternVariationPresetLabel,
  projectFileName,
  retargetProjectKey,
  scalePitches,
  scalePitchNames,
  serializeProjectFile,
  soundPresetDesign,
  soundPresetIds,
  soundPresetLabel,
  styleSoundPreset,
  starterProject,
  steps,
  styleProfiles
} from "../domain/workstation";

const drumLabels: Record<DrumLane, string> = {
  kick: "Kick",
  clap: "Clap",
  hat: "Hat",
  perc: "Perc"
};

const keys = ["F minor", "A minor", "C minor", "D minor", "E minor", "G minor", "C major", "D dorian"];
const historyLimit = 50;

type SelectedNote = {
  track: NoteTrack;
  step: number;
  pitch: string;
};

type SelectedDrumStep = {
  lane: DrumLane;
  step: number;
};

type NoteView = {
  step: number;
  pitch: string;
  length: number;
  velocity?: number;
  glide?: boolean;
  probability?: number;
};

export function App(): ReactElement {
  const [project, setProject] = useState<ProjectState>(starterProject);
  const [undoStack, setUndoStack] = useState<ProjectState[]>([]);
  const [redoStack, setRedoStack] = useState<ProjectState[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("arrangement");
  const [playbackPosition, setPlaybackPosition] = useState<PlaybackSnapshot | null>(null);
  const [selectedNote, setSelectedNote] = useState<SelectedNote | null>(null);
  const [selectedDrumStep, setSelectedDrumStep] = useState<SelectedDrumStep | null>(null);
  const [selectedArrangementIndex, setSelectedArrangementIndex] = useState(0);
  const [projectStatus, setProjectStatus] = useState("Demo project");
  const projectRef = useRef<ProjectState>(starterProject);
  const controllerRef = useRef<PlaybackController | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const style = getStyle(project);
  const currentPattern = activePattern(project);
  const exportAnalysis = useMemo(() => analyzeExport(project), [project]);
  const activeChannels = useMemo(() => {
    const soloActive = project.mixer.some((channel) => channel.id !== "master" && channel.solo);
    return project.mixer.filter(
      (channel) => channel.id !== "master" && !channel.muted && (!soloActive || channel.solo)
    ).length;
  }, [project.mixer]);
  const activeChannelLabel = `${activeChannels} active ${activeChannels === 1 ? "channel" : "channels"}`;
  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;
  const currentPatternStep = playbackPosition ? playbackPosition.loopStep % 16 : null;
  const transportPrimary = isPlaying
    ? playbackPosition?.mode === "pattern"
      ? `Pattern ${playbackPosition.pattern} ${playbackPosition.bar}.${playbackPosition.beat}`
      : `${playbackPosition?.section ?? "Arrangement"} ${playbackPosition?.bar ?? 1}.${playbackPosition?.beat ?? 1}`
    : "Ready";
  const transportSecondary = isPlaying
    ? `Pattern ${playbackPosition?.pattern ?? project.selectedPattern} / Step ${(currentPatternStep ?? 0) + 1}`
    : playbackMode === "arrangement"
      ? `${barCountLabel(arrangementTotalBars(project))} arrangement`
      : `Pattern ${project.selectedPattern} preview`;
  const selectedArrangementBlock = project.arrangement[selectedArrangementIndex] ?? project.arrangement[0];
  const bassPitches = useMemo(
    () => mergePitchLanes(bassPitchLanes(project.key), currentPattern.bassNotes.map((note) => note.pitch)),
    [currentPattern.bassNotes, project.key]
  );
  const melodyPitches = useMemo(
    () => mergePitchLanes(melodyPitchLanes(project.key), currentPattern.melodyNotes.map((note) => note.pitch)),
    [currentPattern.melodyNotes, project.key]
  );
  const chordRootOptions = useMemo(
    () => mergeChordRoots(scalePitchNames(project.key), currentPattern.chordEvents.map((event) => event.root)),
    [currentPattern.chordEvents, project.key]
  );
  const selectedBassNote =
    selectedNote?.track === "bass"
      ? currentPattern.bassNotes.find((note) => note.step === selectedNote.step && note.pitch === selectedNote.pitch)
      : undefined;
  const selectedMelodyNote =
    selectedNote?.track === "melody"
      ? currentPattern.melodyNotes.find((note) => note.step === selectedNote.step && note.pitch === selectedNote.pitch)
      : undefined;
  const selectedDrumActive = selectedDrumStep
    ? currentPattern.drumPattern[selectedDrumStep.lane][selectedDrumStep.step]
    : false;
  const selectedDrumVelocity =
    selectedDrumStep && selectedDrumActive
      ? drumStepVelocity(currentPattern, selectedDrumStep.lane, selectedDrumStep.step)
      : undefined;
  const selectedDrumTiming =
    selectedDrumStep && selectedDrumActive
      ? drumStepTimingMs(currentPattern, selectedDrumStep.lane, selectedDrumStep.step)
      : 0;
  const selectedDrumProbability =
    selectedDrumStep && selectedDrumActive
      ? drumStepProbability(currentPattern, selectedDrumStep.lane, selectedDrumStep.step)
      : undefined;
  const selectedHatRepeat =
    selectedDrumStep && selectedDrumStep.lane === "hat" && selectedDrumActive
      ? hatRepeatCount(currentPattern, selectedDrumStep.step)
      : 1;

  useEffect(() => {
    return () => {
      controllerRef.current?.stop();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    setSelectedArrangementIndex((index) => Math.min(index, Math.max(0, project.arrangement.length - 1)));
  }, [project.arrangement.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleDesktopShortcut);
    return () => window.removeEventListener("keydown", handleDesktopShortcut);
  }, [project, undoStack, redoStack, isPlaying, playbackMode, selectedNote, selectedDrumStep, selectedDrumActive]);

  function handleDesktopShortcut(event: KeyboardEvent): void {
    if (isEditableShortcutTarget(event.target)) {
      return;
    }

    const key = event.key.toLowerCase();
    const withCommandModifier = event.metaKey || event.ctrlKey;
    const wantsUndo = withCommandModifier && !event.shiftKey && key === "z";
    const wantsRedo = withCommandModifier && ((event.shiftKey && key === "z") || key === "y");
    const wantsSave = withCommandModifier && !event.shiftKey && key === "s";
    const wantsOpen = withCommandModifier && !event.shiftKey && key === "o";

    if (wantsUndo || wantsRedo || wantsSave || wantsOpen) {
      event.preventDefault();
      if (wantsUndo) {
        undoProject();
        return;
      }
      if (wantsRedo) {
        redoProject();
        return;
      }
      if (wantsSave) {
        void handleSaveProject();
        return;
      }
      void handleOpenProject();
      return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      if (!event.repeat) {
        togglePlayback();
      }
      return;
    }

    const patternShortcut: Record<string, PatternSlot> = { "1": "A", "2": "B", "3": "C" };
    const nextPattern = patternShortcut[key];
    if (nextPattern) {
      event.preventDefault();
      selectPattern(nextPattern);
      return;
    }

    if (key === "backspace" || key === "delete") {
      event.preventDefault();
      if (!event.repeat) {
        deleteSelectedEvent();
      }
    }
  }

  function updateProject(update: (current: ProjectState) => ProjectState, status = "Unsaved changes"): boolean {
    const current = projectRef.current;
    const nextProject = update(current);
    if (nextProject === current) {
      return false;
    }

    projectRef.current = nextProject;
    setUndoStack((history) => appendHistory(history, current));
    setRedoStack([]);
    setProject(nextProject);
    setProjectStatus(status);
    return true;
  }

  function updateProjectView(update: (current: ProjectState) => ProjectState, status: string): void {
    const current = projectRef.current;
    const nextProject = update(current);
    if (nextProject !== current) {
      projectRef.current = nextProject;
      setProject(nextProject);
    }
    setProjectStatus(status);
  }

  function replaceProject(nextProject: ProjectState, status: string): void {
    projectRef.current = nextProject;
    setProject(nextProject);
    setUndoStack([]);
    setRedoStack([]);
    setSelectedArrangementIndex((index) => Math.min(index, Math.max(0, nextProject.arrangement.length - 1)));
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setProjectStatus(status);
  }

  function restoreProjectFromHistory(nextProject: ProjectState, status: string): void {
    projectRef.current = nextProject;
    setProject(nextProject);
    setSelectedArrangementIndex((index) => Math.min(index, Math.max(0, nextProject.arrangement.length - 1)));
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setPlaybackPosition(null);
    setProjectStatus(status);
  }

  function undoProject(): void {
    const previousProject = undoStack[undoStack.length - 1];
    if (!previousProject) {
      setProjectStatus("Nothing to undo");
      return;
    }

    const current = projectRef.current;
    setUndoStack((history) => history.slice(0, -1));
    setRedoStack((history) => prependFuture(history, current));
    restoreProjectFromHistory(previousProject, "Undo applied");
  }

  function redoProject(): void {
    const nextProject = redoStack[0];
    if (!nextProject) {
      setProjectStatus("Nothing to redo");
      return;
    }

    const current = projectRef.current;
    setRedoStack((history) => history.slice(1));
    setUndoStack((history) => appendHistory(history, current));
    restoreProjectFromHistory(nextProject, "Redo applied");
  }

  function updateCurrentPattern(update: (pattern: PatternData) => PatternData, status = "Unsaved changes"): boolean {
    return updateProject((current) => {
      const currentPatternData = current.patterns[current.selectedPattern];
      const nextPatternData = update(currentPatternData);
      if (nextPatternData === currentPatternData) {
        return current;
      }
      return {
        ...current,
        patterns: {
          ...current.patterns,
          [current.selectedPattern]: nextPatternData
        }
      };
    }, status);
  }

  function selectPattern(pattern: PatternSlot): void {
    updateProjectView(
      (current) => (current.selectedPattern === pattern ? current : { ...current, selectedPattern: pattern }),
      `Editing Pattern ${pattern}`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
  }

  function copySelectedPattern(target: PatternSlot): void {
    const sourceSlot = projectRef.current.selectedPattern;
    updateProject(
      (current) => ({
        ...current,
        selectedPattern: target,
        patterns: {
          ...current.patterns,
          [target]: clonePatternData(current.patterns[current.selectedPattern])
        }
      }),
      `Copied Pattern ${sourceSlot} to ${target}`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
  }

  function clearSelectedPattern(): void {
    const sourceSlot = projectRef.current.selectedPattern;
    updateProject(
      (current) => ({
        ...current,
        patterns: {
          ...current.patterns,
          [current.selectedPattern]: createEmptyPatternData()
        }
      }),
      `Cleared Pattern ${sourceSlot}`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
  }

  function applyPatternVariation(preset: PatternVariationPreset): void {
    const sourceSlot = projectRef.current.selectedPattern;
    updateCurrentPattern(
      (pattern) => createPatternVariation(pattern, preset),
      `${patternVariationPresetLabel(preset)} variation applied to Pattern ${sourceSlot}`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
  }

  function deleteSelectedEvent(): void {
    if (deleteSelectedNote()) {
      return;
    }
    if (clearSelectedDrumStep()) {
      return;
    }
    setProjectStatus("Select a step or note to delete");
  }

  function deleteSelectedNote(): boolean {
    if (!selectedNote) {
      return false;
    }

    const target = selectedNote;
    const changed = updateCurrentPattern(
      (pattern) => {
        if (target.track === "bass") {
          const bassNotes = pattern.bassNotes.filter(
            (note) => note.step !== target.step || note.pitch !== target.pitch
          );
          return bassNotes.length === pattern.bassNotes.length ? pattern : { ...pattern, bassNotes };
        }

        const melodyNotes = pattern.melodyNotes.filter(
          (note) => note.step !== target.step || note.pitch !== target.pitch
        );
        return melodyNotes.length === pattern.melodyNotes.length ? pattern : { ...pattern, melodyNotes };
      },
      `Deleted ${target.track === "bass" ? "808" : "Synth"} ${target.pitch}.${target.step + 1}`
    );

    if (changed) {
      setSelectedNote(null);
    }
    return changed;
  }

  function clearSelectedDrumStep(): boolean {
    if (!selectedDrumStep) {
      return false;
    }

    const target = selectedDrumStep;
    const changed = updateCurrentPattern(
      (pattern) => {
        if (!pattern.drumPattern[target.lane][target.step]) {
          return pattern;
        }

        return {
          ...pattern,
          drumPattern: {
            ...pattern.drumPattern,
            [target.lane]: pattern.drumPattern[target.lane].map((enabled, index) =>
              index === target.step ? false : enabled
            )
          },
          drumTimings: {
            ...pattern.drumTimings,
            [target.lane]: pattern.drumTimings[target.lane].map((timing, index) =>
              index === target.step ? 0 : timing
            )
          },
          hatRepeats:
            target.lane === "hat"
              ? pattern.hatRepeats.map((repeat, index) => (index === target.step ? 1 : repeat))
              : pattern.hatRepeats
        };
      },
      `Deleted ${drumLabels[target.lane]} step ${target.step + 1}`
    );

    if (changed) {
      setSelectedDrumStep(null);
    }
    return changed;
  }

  function selectArrangementBlock(index: number): void {
    const block = project.arrangement[index];
    if (!block) {
      return;
    }

    setSelectedArrangementIndex(index);
    updateProjectView((current) => ({ ...current, selectedPattern: block.pattern }), `Arranging ${block.section}`);
    setSelectedNote(null);
    setSelectedDrumStep(null);
  }

  function updateArrangementBlock(index: number, update: Partial<ArrangementBlock>): void {
    updateProject((current) => {
      const block = current.arrangement[index];
      if (!block) {
        return current;
      }
      const nextBlock: ArrangementBlock = {
        ...block,
        ...update,
        energy: update.energy === undefined ? block.energy : normalizeArrangementEnergy(update.energy),
        bars: update.bars === undefined ? block.bars : normalizeArrangementBars(update.bars),
        mutedTracks:
          update.mutedTracks === undefined
            ? block.mutedTracks
            : normalizeArrangementMutedTracks(update.mutedTracks)
      };
      return {
        ...current,
        selectedPattern: nextBlock.pattern,
        arrangement: current.arrangement.map((candidate, candidateIndex) => (candidateIndex === index ? nextBlock : candidate))
      };
    });
    setSelectedNote(null);
    setSelectedDrumStep(null);
  }

  function toggleArrangementTrackMute(track: ArrangementMuteTrack): void {
    const block = projectRef.current.arrangement[selectedArrangementIndex];
    if (!block) {
      return;
    }
    const mutedTracks = block.mutedTracks.includes(track)
      ? block.mutedTracks.filter((mutedTrack) => mutedTrack !== track)
      : [...block.mutedTracks, track];
    updateArrangementBlock(selectedArrangementIndex, { mutedTracks });
  }

  function applyArrangementTemplate(template: ArrangementTemplateId): void {
    const arrangement = createArrangementTemplate(template);
    const firstBlock = arrangement[0];
    const changed = updateProject(
      (current) => ({
        ...current,
        selectedPattern: firstBlock.pattern,
        arrangement
      }),
      `Applied ${arrangementTemplateLabel(template)} arrangement`
    );
    if (changed) {
      setSelectedArrangementIndex(0);
      setSelectedNote(null);
      setSelectedDrumStep(null);
    }
  }

  function updateMixerChannel(id: MixerChannel["id"], update: Partial<MixerChannel>): void {
    const nextUpdate: Partial<MixerChannel> = { ...update };
    if (update.lowCut !== undefined) {
      nextUpdate.lowCut = normalizeMixerEq(update.lowCut);
    }
    if (update.air !== undefined) {
      nextUpdate.air = normalizeMixerEq(update.air);
    }
    if (update.drive !== undefined) {
      nextUpdate.drive = normalizeMixerEq(update.drive);
    }
    if (update.glue !== undefined) {
      nextUpdate.glue = normalizeMixerEq(update.glue);
    }
    if (update.send !== undefined) {
      nextUpdate.send = normalizeMixerEq(update.send);
    }
    updateProject((current) => ({
      ...current,
      mixer: current.mixer.map((track) => (track.id === id ? { ...track, ...nextUpdate } : track))
    }));
  }

  function applyMasterPreset(preset: MasterPreset): void {
    updateProject((current) => ({
      ...current,
      masterPreset: preset,
      masterCeilingDb: masterPresetCeilingDb(preset)
    }));
  }

  function applySoundPreset(preset: (typeof soundPresetIds)[number]): void {
    updateProject((current) => ({
      ...current,
      sound: soundPresetDesign(preset)
    }));
  }

  function updateSoundDesign(update: Partial<Omit<SoundDesign, "preset">>): void {
    updateProject((current) => ({
      ...current,
      sound: {
        ...current.sound,
        ...Object.fromEntries(Object.entries(update).map(([key, value]) => [key, clampUnit(value)])),
        preset: "custom"
      }
    }));
  }

  function duplicateArrangementBlock(): void {
    const changed = updateProject((current) => {
      const source = current.arrangement[selectedArrangementIndex] ?? current.arrangement[0];
      if (!source) {
        return current;
      }
      const nextIndex = Math.min(selectedArrangementIndex + 1, current.arrangement.length);
      setSelectedArrangementIndex(nextIndex);
      return {
        ...current,
        selectedPattern: source.pattern,
        arrangement: [
          ...current.arrangement.slice(0, nextIndex),
          { ...source, mutedTracks: [...source.mutedTracks] },
          ...current.arrangement.slice(nextIndex)
        ]
      };
    }, "Duplicated arrangement block");
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
    }
  }

  function moveArrangementBlock(direction: -1 | 1): void {
    const changed = updateProject((current) => {
      const fromIndex = selectedArrangementIndex;
      const toIndex = fromIndex + direction;
      const movingBlock = current.arrangement[fromIndex];
      if (!movingBlock || toIndex < 0 || toIndex >= current.arrangement.length) {
        return current;
      }

      const arrangement = [...current.arrangement];
      arrangement.splice(fromIndex, 1);
      arrangement.splice(toIndex, 0, movingBlock);
      setSelectedArrangementIndex(toIndex);
      return {
        ...current,
        selectedPattern: movingBlock.pattern,
        arrangement
      };
    }, direction < 0 ? "Moved block left" : "Moved block right");
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
    }
  }

  function deleteArrangementBlock(): void {
    const changed = updateProject((current) => {
      if (current.arrangement.length <= 1) {
        return current;
      }

      const arrangement = current.arrangement.filter((_, index) => index !== selectedArrangementIndex);
      const nextIndex = Math.min(selectedArrangementIndex, arrangement.length - 1);
      const nextBlock = arrangement[nextIndex];
      setSelectedArrangementIndex(nextIndex);
      return {
        ...current,
        selectedPattern: nextBlock.pattern,
        arrangement
      };
    }, "Deleted arrangement block");
    setSelectedNote(null);
    setSelectedDrumStep(null);
    if (!changed) {
      setProjectStatus("Arrangement needs one block");
    }
  }

  function toggleStep(lane: DrumLane, step: number): void {
    const selectedSameStep = selectedDrumStep?.lane === lane && selectedDrumStep.step === step;
    const active = currentPattern.drumPattern[lane][step];
    setSelectedDrumStep({ lane, step });
    setSelectedNote(null);
    if (active && !selectedSameStep) {
      return;
    }

    updateCurrentPattern((pattern) => {
      const nextActive = active ? false : true;
      return {
        ...pattern,
        drumPattern: {
          ...pattern.drumPattern,
          [lane]: pattern.drumPattern[lane].map((enabled, index) => (index === step ? nextActive : enabled))
        },
        drumVelocities: {
          ...pattern.drumVelocities,
          [lane]: pattern.drumVelocities[lane].map((velocity, index) =>
            index === step && nextActive ? normalizeDrumVelocity(velocity || defaultDrumVelocity(lane, step)) : velocity
          )
        },
        drumTimings: {
          ...pattern.drumTimings,
          [lane]: pattern.drumTimings[lane].map((timing, index) =>
            index === step ? (nextActive ? normalizeDrumTimingMs(timing) : 0) : timing
          )
        },
        drumProbabilities: {
          ...pattern.drumProbabilities,
          [lane]: pattern.drumProbabilities[lane].map((probability, index) =>
            index === step && nextActive ? normalizeDrumProbability(probability) : probability
          )
        },
        hatRepeats:
          lane === "hat"
            ? pattern.hatRepeats.map((repeat, index) => (index === step && !nextActive ? 1 : repeat))
            : pattern.hatRepeats
      };
    });
  }

  function updateSelectedDrumVelocity(velocity: number): void {
    if (!selectedDrumStep || !selectedDrumActive) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      drumVelocities: {
        ...pattern.drumVelocities,
        [selectedDrumStep.lane]: pattern.drumVelocities[selectedDrumStep.lane].map((currentVelocity, index) =>
          index === selectedDrumStep.step ? normalizeDrumVelocity(velocity) : currentVelocity
        )
      }
    }));
  }

  function updateSelectedDrumProbability(probability: number): void {
    if (!selectedDrumStep || !selectedDrumActive) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      drumProbabilities: {
        ...pattern.drumProbabilities,
        [selectedDrumStep.lane]: pattern.drumProbabilities[selectedDrumStep.lane].map((currentProbability, index) =>
          index === selectedDrumStep.step ? normalizeDrumProbability(probability) : currentProbability
        )
      }
    }));
  }

  function updateSelectedHatRepeat(repeat: number): void {
    if (!selectedDrumStep || selectedDrumStep.lane !== "hat" || !selectedDrumActive) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      hatRepeats: pattern.hatRepeats.map((currentRepeat, index) =>
        index === selectedDrumStep.step ? normalizeHatRepeat(repeat) : currentRepeat
      )
    }));
  }

  function updateSelectedDrumTiming(timingMs: number): void {
    if (!selectedDrumStep || !selectedDrumActive) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      drumTimings: {
        ...pattern.drumTimings,
        [selectedDrumStep.lane]: pattern.drumTimings[selectedDrumStep.lane].map((currentTiming, index) =>
          index === selectedDrumStep.step ? normalizeDrumTimingMs(timingMs) : currentTiming
        )
      }
    }));
  }

  function applySelectedDrumGroove(preset: DrumGroovePreset): void {
    updateCurrentPattern(
      (pattern) => applyDrumGroovePreset(pattern, preset),
      `${drumGroovePresetLabel(preset)} groove applied to Pattern ${projectRef.current.selectedPattern}`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
  }

  function toggleBassNote(step: number, pitch: string): void {
    const exists = currentPattern.bassNotes.some((note) => note.step === step && note.pitch === pitch);
    const selectedSameNote = selectedNote?.track === "bass" && selectedNote.step === step && selectedNote.pitch === pitch;
    setSelectedNote({ track: "bass", step, pitch });
    setSelectedDrumStep(null);
    if (exists && !selectedSameNote) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      bassNotes: exists
        ? pattern.bassNotes.filter((note) => note.step !== step || note.pitch !== pitch)
        : sortBassNotes([...pattern.bassNotes, { step, pitch, length: 2, glide: false, probability: 1 }])
    }));
    setSelectedNote(exists ? null : { track: "bass", step, pitch });
  }

  function toggleMelodyNote(step: number, pitch: string): void {
    const exists = currentPattern.melodyNotes.some((note) => note.step === step && note.pitch === pitch);
    const selectedSameNote = selectedNote?.track === "melody" && selectedNote.step === step && selectedNote.pitch === pitch;
    setSelectedNote({ track: "melody", step, pitch });
    setSelectedDrumStep(null);
    if (exists && !selectedSameNote) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      melodyNotes: exists
        ? pattern.melodyNotes.filter((note) => note.step !== step || note.pitch !== pitch)
        : sortMelodyNotes([...pattern.melodyNotes, { step, pitch, length: 1, velocity: 0.68, probability: 1 }])
    }));
    setSelectedNote(exists ? null : { track: "melody", step, pitch });
  }

  function updateSelectedLength(length: number): void {
    if (!selectedNote) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      bassNotes:
        selectedNote.track === "bass"
          ? pattern.bassNotes.map((note) =>
              note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, length } : note
            )
          : pattern.bassNotes,
      melodyNotes:
        selectedNote.track === "melody"
          ? pattern.melodyNotes.map((note) =>
              note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, length } : note
            )
          : pattern.melodyNotes
    }));
  }

  function updateSelectedGlide(glide: boolean): void {
    if (!selectedNote || selectedNote.track !== "bass") {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      bassNotes: pattern.bassNotes.map((note) =>
        note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, glide } : note
      )
    }));
  }

  function updateSelectedVelocity(velocity: number): void {
    if (!selectedNote || selectedNote.track !== "melody") {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      melodyNotes: pattern.melodyNotes.map((note) =>
        note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, velocity } : note
      )
    }));
  }

  function updateSelectedNoteProbability(probability: number): void {
    if (!selectedNote) {
      return;
    }

    const nextProbability = normalizeEventProbability(probability);
    updateCurrentPattern((pattern) => ({
      ...pattern,
      bassNotes:
        selectedNote.track === "bass"
          ? pattern.bassNotes.map((note) =>
              note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, probability: nextProbability } : note
            )
          : pattern.bassNotes,
      melodyNotes:
        selectedNote.track === "melody"
          ? pattern.melodyNotes.map((note) =>
              note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, probability: nextProbability } : note
            )
          : pattern.melodyNotes
    }));
  }

  function moveSelectedNoteStep(direction: -1 | 1): void {
    if (!selectedNote) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    const nextStep = clampStepStart(selectedNote.step + direction);
    moveSelectedNoteTo(nextStep, selectedNote.pitch, direction < 0 ? "Moved note left" : "Moved note right");
  }

  function moveSelectedNotePitch(direction: -1 | 1): void {
    if (!selectedNote) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    const current = projectRef.current;
    const pattern = activePattern(current);
    const usedPitches =
      selectedNote.track === "bass"
        ? pattern.bassNotes.map((note) => note.pitch)
        : pattern.melodyNotes.map((note) => note.pitch);
    const nextPitch = adjacentTrackPitch(selectedNote.track, current.key, selectedNote.pitch, direction, usedPitches);
    if (!nextPitch) {
      setProjectStatus(direction < 0 ? "Note is at the low pitch edge" : "Note is at the high pitch edge");
      return;
    }

    moveSelectedNoteTo(selectedNote.step, nextPitch, direction < 0 ? "Moved note down" : "Moved note up");
  }

  function moveSelectedNoteOctave(direction: -1 | 1): void {
    if (!selectedNote) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    const nextPitch = octaveShiftPitch(selectedNote.track, selectedNote.pitch, direction);
    if (!nextPitch) {
      setProjectStatus(direction < 0 ? "Note is at the low octave edge" : "Note is at the high octave edge");
      return;
    }

    moveSelectedNoteTo(selectedNote.step, nextPitch, direction < 0 ? "Moved note down an octave" : "Moved note up an octave");
  }

  function moveSelectedNoteTo(step: number, pitch: string, status: string): void {
    const target = selectedNote;
    if (!target) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }
    if (target.step === step && target.pitch === pitch) {
      setProjectStatus("Note is already there");
      return;
    }

    const pattern = activePattern(projectRef.current);
    const sourceExists =
      target.track === "bass"
        ? pattern.bassNotes.some((note) => matchesSelectedNote(note, target))
        : pattern.melodyNotes.some((note) => matchesSelectedNote(note, target));
    if (!sourceExists) {
      setProjectStatus("Select an active note");
      return;
    }

    const occupied =
      target.track === "bass"
        ? pattern.bassNotes.some((note) => !matchesSelectedNote(note, target) && note.step === step && note.pitch === pitch)
        : pattern.melodyNotes.some((note) => !matchesSelectedNote(note, target) && note.step === step && note.pitch === pitch);
    if (occupied) {
      setProjectStatus("Target note already exists");
      return;
    }

    const changed = updateCurrentPattern(
      (currentPatternData) => ({
        ...currentPatternData,
        bassNotes:
          target.track === "bass"
            ? sortBassNotes(
                currentPatternData.bassNotes.map((note) =>
                  matchesSelectedNote(note, target) ? { ...note, step, pitch } : note
                )
              )
            : currentPatternData.bassNotes,
        melodyNotes:
          target.track === "melody"
            ? sortMelodyNotes(
                currentPatternData.melodyNotes.map((note) =>
                  matchesSelectedNote(note, target) ? { ...note, step, pitch } : note
                )
              )
            : currentPatternData.melodyNotes
      }),
      status
    );

    if (changed) {
      setSelectedNote({ ...target, step, pitch });
      setSelectedDrumStep(null);
    }
  }

  function duplicateSelectedNote(): void {
    const target = selectedNote;
    if (!target) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    const pattern = activePattern(projectRef.current);
    if (target.track === "bass") {
      const source = pattern.bassNotes.find((note) => matchesSelectedNote(note, target));
      if (!source) {
        setProjectStatus("Select an active note");
        return;
      }
      const nextStep = nextEmptyStepForPitch(pattern.bassNotes, source.pitch, source.step);
      if (nextStep === null) {
        setProjectStatus("No empty step for duplicate");
        return;
      }
      const changed = updateCurrentPattern(
        (currentPatternData) => ({
          ...currentPatternData,
          bassNotes: sortBassNotes([...currentPatternData.bassNotes, { ...source, step: nextStep }])
        }),
        "Duplicated 808 note"
      );
      if (changed) {
        setSelectedNote({ ...target, step: nextStep });
        setSelectedDrumStep(null);
      }
      return;
    }

    const source = pattern.melodyNotes.find((note) => matchesSelectedNote(note, target));
    if (!source) {
      setProjectStatus("Select an active note");
      return;
    }
    const nextStep = nextEmptyStepForPitch(pattern.melodyNotes, source.pitch, source.step);
    if (nextStep === null) {
      setProjectStatus("No empty step for duplicate");
      return;
    }
    const changed = updateCurrentPattern(
      (currentPatternData) => ({
        ...currentPatternData,
        melodyNotes: sortMelodyNotes([...currentPatternData.melodyNotes, { ...source, step: nextStep }])
      }),
      "Duplicated Synth note"
    );
    if (changed) {
      setSelectedNote({ ...target, step: nextStep });
      setSelectedDrumStep(null);
    }
  }

  function updateChordEvent(index: number, update: Partial<ChordEvent>): void {
    updateCurrentPattern((pattern) => ({
      ...pattern,
      chordEvents: sortChordEvents(
        pattern.chordEvents.map((event, eventIndex) => {
          if (eventIndex !== index) {
            return event;
          }
          const step = update.step === undefined ? event.step : clampStepStart(update.step);
          const length = Math.min(
            update.length === undefined ? event.length : clampStepLength(update.length),
            16 - step
          );
          return {
            ...event,
            ...update,
            step,
            length,
            inversion: update.inversion === undefined ? event.inversion : normalizeChordInversion(update.inversion),
            velocity: update.velocity === undefined ? event.velocity : clampVelocity(update.velocity),
            probability: update.probability === undefined ? event.probability : normalizeEventProbability(update.probability)
          };
        })
      )
    }));
  }

  function applyChordProgressionPreset(preset: ChordProgressionPreset): void {
    updateCurrentPattern(
      (pattern) => ({
        ...pattern,
        chordEvents: createChordProgressionPreset(preset, projectRef.current.key)
      }),
      `${chordProgressionPresetLabel(preset)} chords applied to Pattern ${projectRef.current.selectedPattern}`
    );
  }

  function addChordEvent(): void {
    updateCurrentPattern(
      (pattern) => ({
        ...pattern,
        chordEvents: sortChordEvents([
          ...pattern.chordEvents,
          createNextChordEvent(projectRef.current.key, pattern.chordEvents)
        ])
      }),
      `Added chord to Pattern ${projectRef.current.selectedPattern}`
    );
  }

  function deleteChordEvent(index: number): void {
    const currentChords = activePattern(projectRef.current).chordEvents;
    if (currentChords.length <= 1) {
      setProjectStatus("Chord progression needs one chord");
      return;
    }

    updateCurrentPattern(
      (pattern) => {
        if (!pattern.chordEvents[index]) {
          return pattern;
        }
        return {
          ...pattern,
          chordEvents: pattern.chordEvents.filter((_, eventIndex) => eventIndex !== index)
        };
      },
      `Deleted chord ${index + 1} from Pattern ${projectRef.current.selectedPattern}`
    );
  }

  function togglePlayback(): void {
    if (isPlaying) {
      controllerRef.current?.stop();
      controllerRef.current = null;
      setPlaybackPosition(null);
      return;
    }

    try {
      setIsPlaying(true);
      controllerRef.current = startRealtimePlayback(project, {
        mode: playbackMode,
        bars: playbackMode === "pattern" ? 2 : undefined,
        getProject: () => projectRef.current,
        onStep: setPlaybackPosition,
        onStop: () => {
          controllerRef.current = null;
          setPlaybackPosition(null);
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error(error);
      setIsPlaying(false);
      setPlaybackPosition(null);
    }
  }

  async function handleSaveProject(): Promise<void> {
    const contents = serializeProjectFile(project);
    const defaultName = projectFileName(project);

    try {
      const result = await window.grooveforge?.saveProject?.(contents, defaultName);
      if (result) {
        setProjectStatus(result.canceled ? "Save canceled" : `Saved ${fileDisplayName(result.filePath)}`);
        return;
      }

      downloadProjectFile(contents, defaultName);
      setProjectStatus(`Downloaded ${defaultName}`);
    } catch (error) {
      console.error(error);
      setProjectStatus("Save failed");
    }
  }

  async function handleOpenProject(): Promise<void> {
    try {
      const result = await window.grooveforge?.openProject?.();
      if (result) {
        if (result.canceled || !result.contents) {
          setProjectStatus("Open canceled");
          return;
        }
        loadProjectText(result.contents, fileDisplayName(result.filePath));
        return;
      }

      importInputRef.current?.click();
    } catch (error) {
      console.error(error);
      setProjectStatus("Open failed");
    }
  }

  function handleImportFile(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) {
      return;
    }

    void file
      .text()
      .then((contents) => loadProjectText(contents, file.name))
      .catch((error: unknown) => {
        console.error(error);
        setProjectStatus("Open failed");
      });
  }

  function loadProjectText(contents: string, sourceName: string): void {
    try {
      const nextProject = parseProjectFile(contents);
      controllerRef.current?.stop();
      controllerRef.current = null;
      replaceProject(nextProject, `Loaded ${sourceName}`);
      setPlaybackPosition(null);
      setIsPlaying(false);
    } catch (error) {
      console.error(error);
      setProjectStatus("Invalid project file");
    }
  }

  function handleExportWav(): void {
    try {
      exportWav(project);
      setProjectStatus("Exported mix WAV");
    } catch (error) {
      console.error(error);
      setProjectStatus("WAV export failed");
    }
  }

  function handleExportStems(): void {
    try {
      const fileNames = exportStems(project);
      setProjectStatus(`Exported ${fileNames.length} stems`);
    } catch (error) {
      console.error(error);
      setProjectStatus("Stem export failed");
    }
  }

  function handleExportMidi(): void {
    try {
      exportMidi(project);
      setProjectStatus("Exported MIDI");
    } catch (error) {
      console.error(error);
      setProjectStatus("MIDI export failed");
    }
  }

  function toggleMetronome(): void {
    updateProject(
      (current) => ({ ...current, metronomeEnabled: !current.metronomeEnabled }),
      projectRef.current.metronomeEnabled ? "Metronome off" : "Metronome on"
    );
  }

  function applyProjectKey(key: string): void {
    const changed = updateProject((current) => retargetProjectKey(current, key), `Retargeted project to ${key}`);
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
    }
  }

  function selectStyle(styleId: ProjectState["styleId"]): void {
    const nextStyle = styleProfiles.find((candidate) => candidate.id === styleId);
    if (!nextStyle) {
      return;
    }
    updateProject(
      (current) => {
        const soundPreset = styleSoundPreset(styleId);
        return {
          ...current,
          styleId,
          selectedPattern: "A",
          bpm: nextStyle.defaultBpm,
          swing: nextStyle.defaultSwing,
          sound: soundPresetDesign(soundPreset),
          patterns: createStylePatternSet(styleId, current.key)
        };
      },
      `Applied ${nextStyle.name} groove`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
  }

  return (
    <main className="app-shell">
      <header className="transport-band">
        <div className="brand-lockup">
          <Disc3 size={28} aria-hidden="true" />
          <div>
            <h1>GrooveForge</h1>
            <span>{window.grooveforge?.appKind ?? "desktop"} workstation</span>
          </div>
        </div>

        <div className="transport-controls">
          <label className="field title-field">
            <span>Title</span>
            <input
              type="text"
              value={project.title}
              onChange={(event) => updateProject((current) => ({ ...current, title: event.target.value }))}
            />
          </label>
          <label className="field compact">
            <span>BPM</span>
            <input
              type="number"
              min={60}
              max={220}
              value={project.bpm}
              onChange={(event) =>
                updateProject((current) => ({ ...current, bpm: Number(event.target.value) || current.bpm }))
              }
            />
          </label>
          <label className="field">
            <span>Key</span>
            <select value={project.key} onChange={(event) => applyProjectKey(event.target.value)}>
              {keys.map((key) => (
                <option key={key}>{key}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Style</span>
            <select value={project.styleId} onChange={(event) => selectStyle(event.target.value as ProjectState["styleId"])}>
              {styleProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="command-strip">
          <div className="transport-status" aria-live="polite">
            <strong>{transportPrimary}</strong>
            <span>{transportSecondary}</span>
          </div>
          <div className="segmented playback-mode-row" aria-label="Playback mode">
            <button
              className={playbackMode === "arrangement" ? "selected" : ""}
              data-testid="playback-mode-arrangement"
              disabled={isPlaying && playbackMode !== "arrangement"}
              onClick={() => setPlaybackMode("arrangement")}
              title="Play the full arrangement timeline"
              type="button"
            >
              Arrangement
            </button>
            <button
              className={playbackMode === "pattern" ? "selected" : ""}
              data-testid="playback-mode-pattern"
              disabled={isPlaying && playbackMode !== "pattern"}
              onClick={() => setPlaybackMode("pattern")}
              title="Preview the selected Pattern A/B/C loop"
              type="button"
            >
              Pattern
            </button>
          </div>
          <button
            aria-pressed={project.metronomeEnabled}
            className={`icon-button ${project.metronomeEnabled ? "selected" : ""}`}
            data-testid="metronome-toggle"
            type="button"
            title={project.metronomeEnabled ? "Turn metronome off" : "Turn metronome on"}
            onClick={toggleMetronome}
          >
            <Gauge size={18} aria-hidden="true" />
            <span>Click</span>
          </button>
          <button className="icon-button primary" type="button" title={playbackMode === "arrangement" ? "Play arrangement" : "Play selected pattern"} onClick={togglePlayback}>
            {isPlaying ? <CircleStop size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            <span>{isPlaying ? "Stop" : "Play"}</span>
          </button>
          <button
            className="icon-button"
            data-testid="undo-button"
            type="button"
            title="Undo last edit"
            disabled={!canUndo}
            onClick={undoProject}
          >
            <Undo2 size={18} aria-hidden="true" />
            <span>Undo</span>
          </button>
          <button
            className="icon-button"
            data-testid="redo-button"
            type="button"
            title="Redo last undone edit"
            disabled={!canRedo}
            onClick={redoProject}
          >
            <Redo2 size={18} aria-hidden="true" />
            <span>Redo</span>
          </button>
          <button className="icon-button" type="button" title="Open project" onClick={() => void handleOpenProject()}>
            <FolderOpen size={18} aria-hidden="true" />
            <span>Open</span>
          </button>
          <button className="icon-button" type="button" title="Save project" onClick={() => void handleSaveProject()}>
            <Save size={18} aria-hidden="true" />
            <span>Save</span>
          </button>
          <button className="icon-button" type="button" title="Export WAV" onClick={handleExportWav}>
            <Download size={18} aria-hidden="true" />
            <span>WAV</span>
          </button>
          <button className="icon-button" data-testid="export-stems" type="button" title="Export stem WAVs" onClick={handleExportStems}>
            <Download size={18} aria-hidden="true" />
            <span>Stems</span>
          </button>
          <button className="icon-button" data-testid="export-midi" type="button" title="Export MIDI" onClick={handleExportMidi}>
            <Download size={18} aria-hidden="true" />
            <span>MIDI</span>
          </button>
        </div>
      </header>

      <section className="mode-row" aria-label="Mode">
        <input
          ref={importInputRef}
          className="file-input"
          type="file"
          accept=".json,.grooveforge.json,application/json"
          onChange={handleImportFile}
        />
        <div className="segmented">
          <button
            className={project.mode === "guided" ? "selected" : ""}
            type="button"
            onClick={() => updateProject((current) => ({ ...current, mode: "guided" }))}
          >
            Guided
          </button>
          <button
            className={project.mode === "studio" ? "selected" : ""}
            type="button"
            onClick={() => updateProject((current) => ({ ...current, mode: "studio" }))}
          >
            Studio
          </button>
        </div>
        <div className="session-meter">
          <span style={{ "--accent": style.color } as CSSProperties}>{style.name}</span>
          <span>{project.key}</span>
          <span>{activeChannelLabel}</span>
          <span>{project.masterPreset}</span>
          <span>{projectStatus}</span>
        </div>
      </section>

      <section className="workspace-grid">
        <section className="panel pattern-panel" aria-label="Pattern editor">
          <PanelTitle icon={<Drum size={18} />} title="Drums" meta="16 step rack" />
          <div className="pattern-tabs" aria-label="Pattern">
            {patternSlots.map((pattern) => (
              <button
                key={pattern}
                className={project.selectedPattern === pattern ? "selected" : ""}
                type="button"
                onClick={() => selectPattern(pattern)}
              >
                <span>{pattern}</span>
                <small>{patternEventCount(project.patterns[pattern])}</small>
              </button>
            ))}
          </div>
          <div className="pattern-tools" aria-label="Pattern tools">
            {patternVariationPresetIds.map((preset) => (
              <button
                key={preset}
                data-testid={`pattern-variation-${preset}`}
                type="button"
                title={`Apply ${patternVariationPresetLabel(preset)} variation to Pattern ${project.selectedPattern}`}
                onClick={() => applyPatternVariation(preset)}
              >
                <Sparkles size={14} aria-hidden="true" />
                <span>{patternVariationPresetLabel(preset)}</span>
              </button>
            ))}
            {patternSlots
              .filter((pattern) => pattern !== project.selectedPattern)
              .map((pattern) => (
                <button
                  key={pattern}
                  data-testid={`pattern-copy-${pattern}`}
                  type="button"
                  title={`Copy selected pattern to Pattern ${pattern}`}
                  onClick={() => copySelectedPattern(pattern)}
                >
                  <Copy size={14} aria-hidden="true" />
                  <span>Copy to {pattern}</span>
                </button>
              ))}
            <button
              className="danger"
              data-testid="pattern-clear"
              type="button"
              title={`Clear Pattern ${project.selectedPattern}`}
              onClick={clearSelectedPattern}
            >
              <Trash2 size={14} aria-hidden="true" />
              <span>Clear {project.selectedPattern}</span>
            </button>
          </div>
          <div className="step-grid">
            {(Object.keys(drumLabels) as DrumLane[]).map((lane) => (
              <div className="step-row" key={lane}>
                <div className="lane-name">{drumLabels[lane]}</div>
                {steps.map((step) => {
                  const active = currentPattern.drumPattern[lane][step];
                  const velocity = drumStepVelocity(currentPattern, lane, step);
                  const probability = drumStepProbability(currentPattern, lane, step);
                  const hasChanceBadge = probability < 1;
                  const repeat = lane === "hat" ? hatRepeatCount(currentPattern, step) : 1;
                  const timing = drumStepTimingMs(currentPattern, lane, step);
                  const stepBadge = [
                    hasChanceBadge ? compactChanceBadgeLabel(probability) : "",
                    lane === "hat" && repeat > 1 ? `${repeat}x` : "",
                    timing === 0 ? "" : timingBadge(timing)
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <button
                      aria-label={`${drumLabels[lane]} step ${step + 1}`}
                      className={[
                        "step",
                        active ? "active" : "",
                        selectedDrumStep?.lane === lane && selectedDrumStep.step === step ? "selected" : "",
                        currentPatternStep === step ? "playhead" : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      data-testid={`drum-step-${lane}-${step}`}
                      key={step}
                      onClick={() => toggleStep(lane, step)}
                      style={
                        {
                          "--lane-color": laneColor(lane),
                          "--step-velocity": `${Math.round(velocity * 100)}%`
                        } as CSSProperties
                      }
                      type="button"
                    >
                      <span>{step + 1}</span>
                      {active && stepBadge && (
                        <small
                          className={hasChanceBadge ? "chance-badge" : undefined}
                          data-testid={hasChanceBadge ? `drum-chance-badge-${lane}-${step}` : undefined}
                        >
                          {stepBadge}
                        </small>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="micro-controls">
            <label>
              <span>Swing</span>
              <input
                type="range"
                min={0}
                max={0.24}
                step={0.01}
                value={project.swing}
                onChange={(event) => updateProject((current) => ({ ...current, swing: Number(event.target.value) }))}
              />
            </label>
            <div className="groove-row" aria-label="Groove humanize">
              <span>Groove</span>
              <div>
                {drumGroovePresetIds.map((preset) => (
                  <button
                    data-testid={`groove-preset-${preset}`}
                    key={preset}
                    onClick={() => applySelectedDrumGroove(preset)}
                    type="button"
                  >
                    {drumGroovePresetLabel(preset)}
                  </button>
                ))}
              </div>
            </div>
            <DrumStepInspector
              selectedStep={selectedDrumStep}
              active={selectedDrumActive}
              velocity={selectedDrumVelocity}
              timingMs={selectedDrumTiming}
              probability={selectedDrumProbability}
              hatRepeat={selectedHatRepeat}
              onVelocityChange={updateSelectedDrumVelocity}
              onProbabilityChange={updateSelectedDrumProbability}
              onTimingChange={updateSelectedDrumTiming}
              onHatRepeatChange={updateSelectedHatRepeat}
            />
          </div>
        </section>

        <section className="panel piano-panel" aria-label="Bass and melody editor">
          <PanelTitle icon={<KeyboardMusic size={18} />} title="808 / Melody" meta="scale locked grid" />
          <div className="note-lanes">
            <NoteEditor
              title="808"
              track="bass"
              notes={currentPattern.bassNotes.map((note) => ({ ...note, velocity: note.glide ? 0.95 : 0.82 }))}
              pitches={bassPitches}
              color="#ff7a4f"
              currentStep={currentPatternStep}
              selectedNote={selectedNote}
              onToggle={toggleBassNote}
            />
            <NoteEditor
              title="Synth"
              track="melody"
              notes={currentPattern.melodyNotes}
              pitches={melodyPitches}
              color="#8aa8ff"
              currentStep={currentPatternStep}
              selectedNote={selectedNote}
              onToggle={toggleMelodyNote}
            />
          </div>
          {project.mode === "studio" && (
            <NoteInspector
              selectedNote={selectedNote}
              bassNote={selectedBassNote}
              melodyNote={selectedMelodyNote}
              onLengthChange={updateSelectedLength}
              onGlideChange={updateSelectedGlide}
              onVelocityChange={updateSelectedVelocity}
              onProbabilityChange={updateSelectedNoteProbability}
              onStepMove={moveSelectedNoteStep}
              onPitchMove={moveSelectedNotePitch}
              onOctaveMove={moveSelectedNoteOctave}
              onDuplicate={duplicateSelectedNote}
            />
          )}
        </section>

        <section className="panel instrument-panel" aria-label="Instrument panel">
          <PanelTitle icon={<Sparkles size={18} />} title="Instruments" meta={project.mode === "guided" ? "curated" : "editable"} />
          <div className="device-list">
            <Device icon={<Drum size={17} />} name="Drum Rack" value={`${soundPresetLabel(project.sound.preset)} kit`} color="#78f0c8" />
            <Device
              icon={<Waves size={17} />}
              name="808 Engine"
              value={`drive ${percentLabel(project.sound.bassDrive)} / duck ${percentLabel(project.sound.sidechainDuck)}`}
              color="#ff7a4f"
            />
            <Device icon={<Music2 size={17} />} name="Synth" value={`${style.melodyStyle} / bright ${percentLabel(project.sound.synthBrightness)}`} color="#8aa8ff" />
            <Device icon={<SlidersHorizontal size={17} />} name="Chord Tone" value={`warm ${percentLabel(project.sound.chordWarmth)}`} color="#d58cff" />
          </div>
          <SoundDesigner
            mode={project.mode}
            sound={project.sound}
            onChange={updateSoundDesign}
            onPreset={applySoundPreset}
          />
          <ChordEditor
            chords={currentPattern.chordEvents}
            rootOptions={chordRootOptions}
            onAdd={addChordEvent}
            onChange={updateChordEvent}
            onDelete={deleteChordEvent}
            onPreset={applyChordProgressionPreset}
          />
        </section>

        <section className="panel arrangement-panel" aria-label="Arrangement">
          <PanelTitle icon={<Music2 size={18} />} title="Arrangement" meta={`${project.arrangement.length} blocks / ${barCountLabel(arrangementTotalBars(project))}`} />
          <div className="arrangement-template-row" aria-label="Arrangement templates">
            {arrangementTemplateIds.map((template) => {
              const templateBlocks = createArrangementTemplate(template);
              const templateBars = templateBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
              return (
                <button
                  data-testid={`arrangement-template-${template}`}
                  key={template}
                  onClick={() => applyArrangementTemplate(template)}
                  title={`Apply ${arrangementTemplateLabel(template)} arrangement`}
                  type="button"
                >
                  <span>{arrangementTemplateLabel(template)}</span>
                  <small>{templateBlocks.length} blocks / {barCountLabel(templateBars)}</small>
                </button>
              );
            })}
          </div>
          <div className="arrangement-track">
            {project.arrangement.map((block, index) => (
              <button
                aria-label={`Block ${index + 1} ${block.section} Pattern ${block.pattern} ${barCountLabel(block.bars)}`}
                aria-pressed={selectedArrangementIndex === index}
                className={["arrangement-block", selectedArrangementIndex === index ? "selected" : ""]
                  .filter(Boolean)
                  .join(" ")}
                data-testid={`arrangement-block-${index}`}
                key={`${block.section}-${index}`}
                onClick={() => selectArrangementBlock(index)}
                type="button"
              >
                <span>{block.section}</span>
                <strong>{block.pattern}</strong>
                <small>{barCountLabel(block.bars)}</small>
                {block.mutedTracks.length > 0 && <em>{block.mutedTracks.length} mute</em>}
                <i style={{ inlineSize: `${Math.max(18, block.energy * 100)}%` }} />
              </button>
            ))}
          </div>
          {selectedArrangementBlock && (
            <div className="arrangement-editor" aria-label="Selected arrangement block editor">
              <div className="arrangement-editor-heading">
                <span>Block {selectedArrangementIndex + 1}</span>
                <strong>
                  {selectedArrangementBlock.section} / Pattern {selectedArrangementBlock.pattern}
                </strong>
                <small>{barCountLabel(selectedArrangementBlock.bars)}</small>
              </div>
              <label>
                <span>Section</span>
                <select
                  data-testid="arrangement-section-select"
                  value={selectedArrangementBlock.section}
                  onChange={(event) =>
                    updateArrangementBlock(selectedArrangementIndex, { section: event.target.value as ArrangementSection })
                  }
                >
                  {arrangementSections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </label>
              <div className="block-pattern-row" aria-label="Block pattern">
                {patternSlots.map((pattern) => (
                  <button
                    key={pattern}
                    className={selectedArrangementBlock.pattern === pattern ? "selected" : ""}
                    data-testid={`arrangement-pattern-${pattern}`}
                    type="button"
                    onClick={() => updateArrangementBlock(selectedArrangementIndex, { pattern })}
                  >
                    <span>{pattern}</span>
                    <small>{patternEventCount(project.patterns[pattern])}</small>
                  </button>
                ))}
              </div>
              <div className="arrangement-mute-row" aria-label="Block track mutes">
                {arrangementMuteTrackIds.map((track) => {
                  const muted = selectedArrangementBlock.mutedTracks.includes(track);
                  return (
                    <button
                      aria-pressed={muted}
                      className={muted ? "selected" : ""}
                      data-testid={`arrangement-track-mute-${track}`}
                      key={track}
                      onClick={() => toggleArrangementTrackMute(track)}
                      title={`${muted ? "Unmute" : "Mute"} ${arrangementMuteTrackLabel(track)} in this block`}
                      type="button"
                    >
                      {arrangementMuteTrackLabel(track)}
                    </button>
                  );
                })}
              </div>
              <label>
                <span>Bars</span>
                <input
                  aria-label="Arrangement block bars"
                  data-testid="arrangement-bars-input"
                  type="number"
                  min={minArrangementBars}
                  max={maxArrangementBars}
                  step={1}
                  value={selectedArrangementBlock.bars}
                  onChange={(event) =>
                    updateArrangementBlock(selectedArrangementIndex, { bars: Number(event.target.value) })
                  }
                />
              </label>
              <label>
                <span>
                  Energy {Math.round(selectedArrangementBlock.energy * 100)}% / {arrangementEnergyGain(selectedArrangementBlock.energy).toFixed(2)}x
                </span>
                <div className="energy-inputs">
                  <input
                    data-testid="arrangement-energy-slider"
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={selectedArrangementBlock.energy}
                    onChange={(event) =>
                      updateArrangementBlock(selectedArrangementIndex, { energy: Number(event.target.value) })
                    }
                  />
                  <input
                    aria-label="Arrangement energy percent"
                    data-testid="arrangement-energy-input"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(selectedArrangementBlock.energy * 100)}
                    onChange={(event) =>
                      updateArrangementBlock(selectedArrangementIndex, { energy: Number(event.target.value) / 100 })
                    }
                  />
                </div>
              </label>
              <div className="arrangement-actions" aria-label="Arrangement structure actions">
                <button
                  data-testid="arrangement-move-left"
                  disabled={selectedArrangementIndex === 0}
                  onClick={() => moveArrangementBlock(-1)}
                  title="Move selected block left"
                  type="button"
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  <span>Move</span>
                </button>
                <button
                  data-testid="arrangement-move-right"
                  disabled={selectedArrangementIndex >= project.arrangement.length - 1}
                  onClick={() => moveArrangementBlock(1)}
                  title="Move selected block right"
                  type="button"
                >
                  <ArrowRight size={15} aria-hidden="true" />
                  <span>Move</span>
                </button>
                <button
                  data-testid="arrangement-duplicate"
                  onClick={duplicateArrangementBlock}
                  title="Duplicate selected block"
                  type="button"
                >
                  <Copy size={15} aria-hidden="true" />
                  <span>Duplicate</span>
                </button>
                <button
                  data-testid="arrangement-delete"
                  disabled={project.arrangement.length <= 1}
                  onClick={deleteArrangementBlock}
                  title="Delete selected block"
                  type="button"
                >
                  <Trash2 size={15} aria-hidden="true" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="panel mixer-panel" aria-label="Mixer">
          <PanelTitle icon={<SlidersHorizontal size={18} />} title="Mixer" meta={`${activeChannels} audible`} />
          <div className="mixer-strips">
            {project.mixer.map((channel) => (
              <div className="strip" key={channel.id} style={{ "--strip": channel.accent } as CSSProperties}>
                <div className="strip-top">
                  <span>{channel.name}</span>
                  <div className="strip-toggles">
                    <button
                      className={channel.muted ? "mini-toggle active" : "mini-toggle"}
                      data-testid={`mixer-mute-${channel.id}`}
                      type="button"
                      onClick={() => updateMixerChannel(channel.id, { muted: !channel.muted })}
                    >
                      M
                    </button>
                    <button
                      className={channel.solo ? "mini-toggle active solo" : "mini-toggle"}
                      data-testid={`mixer-solo-${channel.id}`}
                      disabled={channel.id === "master"}
                      type="button"
                      onClick={() => updateMixerChannel(channel.id, { solo: !channel.solo })}
                    >
                      S
                    </button>
                  </div>
                </div>
                <label className="strip-control">
                  <span>Volume</span>
                  <input
                    aria-label={`${channel.name} volume`}
                    data-testid={`mixer-volume-${channel.id}`}
                    max={3}
                    min={-36}
                    onChange={(event) => updateMixerChannel(channel.id, { volumeDb: Number(event.target.value) })}
                    step={1}
                    type="range"
                    value={channel.volumeDb}
                  />
                </label>
                <label className="strip-control">
                  <span>Pan</span>
                  <div className="pan-inputs">
                    <input
                      aria-label={`${channel.name} pan`}
                      data-testid={`mixer-pan-${channel.id}`}
                      max={100}
                      min={-100}
                      onChange={(event) => updateMixerChannel(channel.id, { pan: clampPan(Number(event.target.value)) })}
                      step={1}
                      type="range"
                      value={channel.pan}
                    />
                    <input
                      aria-label={`${channel.name} pan value`}
                      data-testid={`mixer-pan-input-${channel.id}`}
                      max={100}
                      min={-100}
                      onChange={(event) => updateMixerChannel(channel.id, { pan: clampPan(Number(event.target.value)) })}
                      step={1}
                      type="number"
                      value={channel.pan}
                    />
                  </div>
                </label>
                {channel.id !== "master" && (
                  <div className="eq-controls" aria-label={`${channel.name} channel EQ`}>
                    <label className="strip-control">
                      <span>Low cut</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={`${channel.name} low cut`}
                          data-testid={`mixer-low-cut-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { lowCut: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.lowCut}
                        />
                        <input
                          aria-label={`${channel.name} low cut percent`}
                          data-testid={`mixer-low-cut-input-${channel.id}`}
                          max={100}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { lowCut: Number(event.target.value) / 100 })}
                          step={1}
                          type="number"
                          value={Math.round(channel.lowCut * 100)}
                        />
                      </div>
                    </label>
                    <label className="strip-control">
                      <span>Air</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={`${channel.name} air`}
                          data-testid={`mixer-air-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { air: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.air}
                        />
                        <input
                          aria-label={`${channel.name} air percent`}
                          data-testid={`mixer-air-input-${channel.id}`}
                          max={100}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { air: Number(event.target.value) / 100 })}
                          step={1}
                          type="number"
                          value={Math.round(channel.air * 100)}
                        />
                      </div>
                    </label>
                    <label className="strip-control">
                      <span>Drive</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={`${channel.name} drive`}
                          data-testid={`mixer-drive-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { drive: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.drive}
                        />
                        <input
                          aria-label={`${channel.name} drive percent`}
                          data-testid={`mixer-drive-input-${channel.id}`}
                          max={100}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { drive: Number(event.target.value) / 100 })}
                          step={1}
                          type="number"
                          value={Math.round(channel.drive * 100)}
                        />
                      </div>
                    </label>
                    <label className="strip-control">
                      <span>Glue</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={`${channel.name} glue`}
                          data-testid={`mixer-glue-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { glue: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.glue}
                        />
                        <input
                          aria-label={`${channel.name} glue percent`}
                          data-testid={`mixer-glue-input-${channel.id}`}
                          max={100}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { glue: Number(event.target.value) / 100 })}
                          step={1}
                          type="number"
                          value={Math.round(channel.glue * 100)}
                        />
                      </div>
                    </label>
                    <label className="strip-control">
                      <span>Space</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={`${channel.name} space send`}
                          data-testid={`mixer-send-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { send: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.send}
                        />
                        <input
                          aria-label={`${channel.name} space send percent`}
                          data-testid={`mixer-send-input-${channel.id}`}
                          max={100}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { send: Number(event.target.value) / 100 })}
                          step={1}
                          type="number"
                          value={Math.round(channel.send * 100)}
                        />
                      </div>
                    </label>
                  </div>
                )}
                <div className="strip-readout">
                  <span>{channel.volumeDb} dB</span>
                  <span>{panLabel(channel.pan)}</span>
                  {channel.id !== "master" && (
                    <>
                      <span>Cut {percentLabel(channel.lowCut)}</span>
                      <span>Air {percentLabel(channel.air)}</span>
                      <span>Drive {percentLabel(channel.drive)}</span>
                      <span>Glue {percentLabel(channel.glue)}</span>
                      <span>Space {percentLabel(channel.send)}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel master-panel" aria-label="Master">
          <PanelTitle icon={<Gauge size={18} />} title="Master" meta="export ready" />
          <div className="master-readout">
            <strong>{project.masterPreset}</strong>
            <span>{project.masterCeilingDb} dB ceiling</span>
          </div>
          <ExportMeter analysis={exportAnalysis} />
          <label>
            <span>Ceiling</span>
            <input
              data-testid="master-ceiling"
              type="range"
              min={-6}
              max={0}
              step={0.1}
              value={project.masterCeilingDb}
              onChange={(event) =>
                updateProject((current) => ({ ...current, masterCeilingDb: Number(event.target.value) }))
              }
            />
          </label>
          <div className="preset-row">
            {masterPresets.map((preset) => (
              <button
                key={preset}
                className={project.masterPreset === preset ? "selected" : ""}
                data-testid={`master-preset-${preset}`}
                type="button"
                onClick={() => applyMasterPreset(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function PanelTitle({ icon, title, meta }: { icon: ReactNode; title: string; meta: string }): ReactElement {
  return (
    <div className="panel-title">
      <div>
        {icon}
        <h2>{title}</h2>
      </div>
      <span>{meta}</span>
    </div>
  );
}

function ExportMeter({ analysis }: { analysis: ExportAnalysis }): ReactElement {
  const peakPercent = meterPercent(analysis.peakDb, analysis.ceilingDb);
  const rmsPercent = meterPercent(analysis.rmsDb, analysis.ceilingDb);
  return (
    <div className="export-meter" data-testid="export-meter">
      <div className={`meter-status ${analysis.status.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
        <span>Export meter</span>
        <strong data-testid="export-meter-status">{analysis.status}</strong>
      </div>
      <div className="meter-bars">
        <MeterBar label="Peak" percent={peakPercent} value={formatDb(analysis.peakDb)} testId="export-peak-db" />
        <MeterBar label="RMS" percent={rmsPercent} value={formatDb(analysis.rmsDb)} testId="export-rms-db" />
      </div>
      <div className="meter-stats">
        <span data-testid="export-headroom-db">Headroom {formatDb(analysis.headroomDb)}</span>
        <span data-testid="export-limiter-percent">Limiter {formatPercent(analysis.limitedPercent)}</span>
        <span>{analysis.durationSeconds.toFixed(1)} sec</span>
      </div>
    </div>
  );
}

function MeterBar({
  label,
  percent,
  value,
  testId
}: {
  label: string;
  percent: number;
  value: string;
  testId: string;
}): ReactElement {
  return (
    <div className="meter-bar">
      <span>{label}</span>
      <i>
        <b style={{ inlineSize: `${percent}%` }} />
      </i>
      <strong data-testid={testId}>{value}</strong>
    </div>
  );
}

function DrumStepInspector({
  selectedStep,
  active,
  velocity,
  timingMs,
  probability,
  hatRepeat,
  onVelocityChange,
  onProbabilityChange,
  onTimingChange,
  onHatRepeatChange
}: {
  selectedStep: SelectedDrumStep | null;
  active: boolean;
  velocity?: number;
  timingMs: number;
  probability?: number;
  hatRepeat: number;
  onVelocityChange: (velocity: number) => void;
  onProbabilityChange: (probability: number) => void;
  onTimingChange: (timingMs: number) => void;
  onHatRepeatChange: (repeat: number) => void;
}): ReactElement {
  const velocityValue = velocity ?? 0.75;
  const probabilityValue = probability ?? 1;
  const timingValue = normalizeDrumTimingMs(timingMs);
  const timingTextValue = `${timingValue}`;
  const [timingText, setTimingText] = useState(timingTextValue);
  const [isEditingTiming, setIsEditingTiming] = useState(false);
  const skipNextTimingBlurCommit = useRef(false);
  const label = selectedStep ? `${drumLabels[selectedStep.lane]} ${selectedStep.step + 1}` : "No step";

  useEffect(() => {
    if (!isEditingTiming) {
      setTimingText(timingTextValue);
    }
  }, [isEditingTiming, timingTextValue]);

  function commitTimingInput(inputText: string): void {
    const nextText = inputText.trim();
    const parsed = nextText === "" ? timingValue : Number(nextText);
    const nextTiming = normalizeDrumTimingMs(parsed);

    setIsEditingTiming(false);
    setTimingText(`${nextTiming}`);
    if (nextTiming !== timingValue) {
      onTimingChange(nextTiming);
    }
  }

  return (
    <div className="drum-step-inspector" aria-label="Drum step dynamics">
      <div className="inspector-heading">
        <span>Dynamics</span>
        <strong data-testid="drum-step-readout">
          {selectedStep
            ? `${label} ${active ? `${percentLabel(velocityValue)} / ${percentLabel(probabilityValue)} chance / ${timingLabel(timingValue)}` : "off"}`
            : "Select step"}
        </strong>
      </div>
      <label>
        <span>Velocity {active ? percentLabel(velocityValue) : "--"}</span>
        <div className="drum-value-row">
          <input
            aria-label="Drum velocity"
            data-testid="drum-velocity"
            disabled={!selectedStep || !active}
            max={1}
            min={0.15}
            onChange={(event) => onVelocityChange(Number(event.target.value))}
            step={0.01}
            type="range"
            value={velocityValue}
          />
          <input
            aria-label="Drum velocity percent"
            data-testid="drum-velocity-input"
            disabled={!selectedStep || !active}
            max={100}
            min={15}
            onChange={(event) => onVelocityChange(Number(event.target.value) / 100)}
            step={1}
            type="number"
            value={Math.round(velocityValue * 100)}
          />
        </div>
      </label>
      <label>
        <span>Chance {active ? percentLabel(probabilityValue) : "--"}</span>
        <div className="drum-value-row">
          <input
            aria-label="Drum probability"
            data-testid="drum-probability"
            disabled={!selectedStep || !active}
            max={1}
            min={0}
            onChange={(event) => onProbabilityChange(Number(event.target.value))}
            step={0.01}
            type="range"
            value={probabilityValue}
          />
          <input
            aria-label="Drum probability percent"
            data-testid="drum-probability-input"
            disabled={!selectedStep || !active}
            max={100}
            min={0}
            onChange={(event) => onProbabilityChange(Number(event.target.value) / 100)}
            step={1}
            type="number"
            value={Math.round(probabilityValue * 100)}
          />
        </div>
      </label>
      <label>
        <span>Timing {active ? timingLabel(timingValue) : "--"}</span>
        <div className="timing-row" aria-label="Drum timing">
          {[
            { label: "Early", timing: -15, testId: "drum-timing-early" },
            { label: "On", timing: 0, testId: "drum-timing-on" },
            { label: "Late", timing: 15, testId: "drum-timing-late" }
          ].map((option) => (
            <button
              className={timingValue === option.timing ? "selected" : ""}
              data-testid={option.testId}
              disabled={!selectedStep || !active}
              key={option.label}
              onClick={() => onTimingChange(option.timing)}
              type="button"
            >
              {option.label}
            </button>
          ))}
          <input
            aria-label="Drum timing milliseconds"
            data-testid="drum-timing-input"
            disabled={!selectedStep || !active}
            max={maxDrumTimingMs}
            min={minDrumTimingMs}
            onBlur={(event) => {
              if (skipNextTimingBlurCommit.current) {
                skipNextTimingBlurCommit.current = false;
                return;
              }
              commitTimingInput(event.currentTarget.value);
            }}
            onChange={(event) => {
              setIsEditingTiming(true);
              setTimingText(event.target.value);
            }}
            onFocus={() => {
              setIsEditingTiming(true);
              setTimingText(timingTextValue);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                skipNextTimingBlurCommit.current = true;
                commitTimingInput(event.currentTarget.value);
                event.currentTarget.blur();
              }
              if (event.key === "Escape") {
                skipNextTimingBlurCommit.current = true;
                setIsEditingTiming(false);
                setTimingText(timingTextValue);
                event.currentTarget.blur();
              }
            }}
            step={1}
            type="number"
            value={isEditingTiming ? timingText : timingTextValue}
          />
        </div>
      </label>
      {selectedStep?.lane === "hat" && (
        <div className="repeat-row" aria-label="Hat repeat">
          {[1, 2, 3, 4].map((repeat) => (
            <button
              className={hatRepeat === repeat ? "selected" : ""}
              data-testid={`hat-repeat-${repeat}`}
              disabled={!active}
              key={repeat}
              onClick={() => onHatRepeatChange(repeat)}
              type="button"
            >
              {repeat}x
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteEditor({
  title,
  track,
  notes,
  pitches,
  color,
  currentStep,
  selectedNote,
  onToggle
}: {
  title: string;
  track: NoteTrack;
  notes: NoteView[];
  pitches: string[];
  color: string;
  currentStep: number | null;
  selectedNote: SelectedNote | null;
  onToggle: (step: number, pitch: string) => void;
}): ReactElement {
  const displayPitches = [...pitches].reverse();
  return (
    <div className="note-lane">
      <div className="lane-header">
        <span>{title}</span>
        <strong>{notes.length} events</strong>
      </div>
      <div className="piano-grid" style={{ "--note": color } as CSSProperties}>
        {displayPitches.map((pitch) => (
          <div className="piano-row" key={pitch}>
            <span>{pitch}</span>
            <div>
              {steps.map((step) => {
                const note = notes.find((candidate) => candidate.step === step && candidate.pitch === pitch);
                const selected =
                  selectedNote?.track === track && selectedNote.step === step && selectedNote.pitch === pitch;
                return (
                  <button
                    aria-label={`${title} ${pitch} step ${step + 1}${
                      note && note.probability !== undefined && note.probability < 1 ? ` ${chanceBadgeLabel(note.probability)} chance` : ""
                    }`}
                    aria-pressed={Boolean(note)}
                    className={["note", note ? "active" : "", currentStep === step ? "playhead" : "", selected ? "selected" : ""]
                      .filter(Boolean)
                      .join(" ")}
                    key={`${pitch}-${step}`}
                    onClick={() => onToggle(step, pitch)}
                    type="button"
                  >
                    {note && <span style={{ inlineSize: `${Math.min(100, note.length * 25)}%` }} />}
                    {note?.glide && <em>G</em>}
                    {note && note.probability !== undefined && note.probability < 1 && (
                      <small className="chance-badge" data-testid={`note-chance-badge-${track}-${step}-${pitch}`}>
                        {compactChanceBadgeLabel(note.probability)}
                      </small>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoteInspector({
  selectedNote,
  bassNote,
  melodyNote,
  onLengthChange,
  onGlideChange,
  onVelocityChange,
  onProbabilityChange,
  onStepMove,
  onPitchMove,
  onOctaveMove,
  onDuplicate
}: {
  selectedNote: SelectedNote | null;
  bassNote?: BassNote;
  melodyNote?: MelodyNote;
  onLengthChange: (length: number) => void;
  onGlideChange: (glide: boolean) => void;
  onVelocityChange: (velocity: number) => void;
  onProbabilityChange: (probability: number) => void;
  onStepMove: (direction: -1 | 1) => void;
  onPitchMove: (direction: -1 | 1) => void;
  onOctaveMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
}): ReactElement {
  const activeNote = bassNote ?? melodyNote;
  const label = selectedNote ? `${selectedNote.track === "bass" ? "808" : "Synth"} ${selectedNote.pitch}.${selectedNote.step + 1}` : "None";
  const probabilityValue = activeNote ? normalizeEventProbability(activeNote.probability) : 1;
  return (
    <div className="note-inspector">
      <div className="inspector-heading">
        <span>Selected</span>
        <strong>{activeNote ? `${label} / ${percentLabel(probabilityValue)} chance` : "None"}</strong>
      </div>
      {activeNote && (
        <>
          <div className="note-action-row" aria-label="Selected note tools">
            <button data-testid="note-nudge-left" onClick={() => onStepMove(-1)} title="Move selected note one step left" type="button">
              <ArrowLeft size={14} aria-hidden="true" />
              <span>Step</span>
            </button>
            <button data-testid="note-nudge-right" onClick={() => onStepMove(1)} title="Move selected note one step right" type="button">
              <ArrowRight size={14} aria-hidden="true" />
              <span>Step</span>
            </button>
            <button data-testid="note-pitch-down" onClick={() => onPitchMove(-1)} title="Move selected note down in scale" type="button">
              <ArrowDown size={14} aria-hidden="true" />
              <span>Pitch</span>
            </button>
            <button data-testid="note-pitch-up" onClick={() => onPitchMove(1)} title="Move selected note up in scale" type="button">
              <ArrowUp size={14} aria-hidden="true" />
              <span>Pitch</span>
            </button>
            <button data-testid="note-octave-down" onClick={() => onOctaveMove(-1)} title="Move selected note down an octave" type="button">
              <ArrowDown size={14} aria-hidden="true" />
              <span>Oct</span>
            </button>
            <button data-testid="note-octave-up" onClick={() => onOctaveMove(1)} title="Move selected note up an octave" type="button">
              <ArrowUp size={14} aria-hidden="true" />
              <span>Oct</span>
            </button>
            <button data-testid="note-duplicate" onClick={onDuplicate} title="Duplicate selected note to the next empty step" type="button">
              <Copy size={14} aria-hidden="true" />
              <span>Dup</span>
            </button>
          </div>
          <div className="inspector-grid">
            <label>
              <span>Length</span>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={activeNote.length}
                onChange={(event) => onLengthChange(Number(event.target.value))}
              />
            </label>
            {bassNote && (
              <label className="toggle-row">
                <span>Glide</span>
                <input type="checkbox" checked={bassNote.glide} onChange={(event) => onGlideChange(event.target.checked)} />
              </label>
            )}
            {melodyNote && (
              <label>
                <span>Velocity</span>
                <input
                  type="range"
                  min={0.2}
                  max={1}
                  step={0.01}
                  value={melodyNote.velocity}
                  onChange={(event) => onVelocityChange(Number(event.target.value))}
                />
              </label>
            )}
            <label>
              <span>Chance {percentLabel(probabilityValue)}</span>
              <input
                aria-label="Note probability"
                data-testid="note-probability"
                max={1}
                min={0}
                onChange={(event) => onProbabilityChange(Number(event.target.value))}
                step={0.01}
                type="range"
                value={probabilityValue}
              />
            </label>
            <label>
              <span>Chance %</span>
              <input
                aria-label="Note probability percent"
                data-testid="note-probability-input"
                inputMode="numeric"
                onChange={(event) => onProbabilityChange(Number(event.target.value) / 100)}
                pattern="[0-9]*"
                step={1}
                type="text"
                value={`${Math.round(probabilityValue * 100)}`}
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
}

function Device({
  icon,
  name,
  value,
  color
}: {
  icon: ReactNode;
  name: string;
  value: string;
  color: string;
}): ReactElement {
  return (
    <button className="device" style={{ "--device": color } as CSSProperties} type="button">
      {icon}
      <span>{name}</span>
      <strong>{value}</strong>
    </button>
  );
}

function SoundDesigner({
  mode,
  sound,
  onPreset,
  onChange
}: {
  mode: ProjectState["mode"];
  sound: SoundDesign;
  onPreset: (preset: (typeof soundPresetIds)[number]) => void;
  onChange: (update: Partial<Omit<SoundDesign, "preset">>) => void;
}): ReactElement {
  return (
    <div className="sound-designer">
      <div className="lane-header">
        <span>Tone</span>
        <strong data-testid="sound-preset-readout">{soundPresetLabel(sound.preset)}</strong>
      </div>
      <div className="sound-preset-row" aria-label="Sound presets">
        {soundPresetIds.map((preset) => (
          <button
            className={sound.preset === preset ? "selected" : ""}
            data-testid={`sound-preset-${preset}`}
            key={preset}
            onClick={() => onPreset(preset)}
            type="button"
          >
            {soundPresetLabel(preset)}
          </button>
        ))}
      </div>
      <div className="sound-readout" aria-label="Sound design state">
        <span data-testid="sound-kick-readout">Kick {percentLabel(sound.kickPunch)}</span>
        <span data-testid="sound-bass-readout">808 {percentLabel(sound.bassDrive)}</span>
        <span data-testid="sound-duck-readout">Duck {percentLabel(sound.sidechainDuck)}</span>
        <span data-testid="sound-synth-readout">Synth {percentLabel(sound.synthBrightness)}</span>
        <span data-testid="sound-chord-readout">Chord {percentLabel(sound.chordWarmth)}</span>
      </div>
      {mode === "studio" && (
        <div className="sound-control-grid">
          <SoundControl
            id="kick-punch"
            label="Kick punch"
            value={sound.kickPunch}
            onChange={(value) => onChange({ kickPunch: value })}
          />
          <SoundControl
            id="snare-snap"
            label="Snare snap"
            value={sound.snareSnap}
            onChange={(value) => onChange({ snareSnap: value })}
          />
          <SoundControl
            id="hat-brightness"
            label="Hat bright"
            value={sound.hatBrightness}
            onChange={(value) => onChange({ hatBrightness: value })}
          />
          <SoundControl
            id="bass-drive"
            label="808 drive"
            value={sound.bassDrive}
            onChange={(value) => onChange({ bassDrive: value })}
          />
          <SoundControl
            id="bass-decay"
            label="808 decay"
            value={sound.bassDecay}
            onChange={(value) => onChange({ bassDecay: value })}
          />
          <SoundControl
            id="sidechain-duck"
            label="Kick duck"
            value={sound.sidechainDuck}
            onChange={(value) => onChange({ sidechainDuck: value })}
          />
          <SoundControl
            id="synth-brightness"
            label="Synth bright"
            value={sound.synthBrightness}
            onChange={(value) => onChange({ synthBrightness: value })}
          />
          <SoundControl
            id="synth-release"
            label="Synth release"
            value={sound.synthRelease}
            onChange={(value) => onChange({ synthRelease: value })}
          />
          <SoundControl
            id="chord-warmth"
            label="Chord warm"
            value={sound.chordWarmth}
            onChange={(value) => onChange({ chordWarmth: value })}
          />
          <SoundControl
            id="chord-width"
            label="Chord width"
            value={sound.chordWidth}
            onChange={(value) => onChange({ chordWidth: value })}
          />
        </div>
      )}
    </div>
  );
}

function SoundControl({
  id,
  label,
  value,
  onChange
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}): ReactElement {
  const percentValue = `${Math.round(value * 100)}`;
  const [percentText, setPercentText] = useState(percentValue);
  const [isEditingPercent, setIsEditingPercent] = useState(false);
  const skipNextBlurCommit = useRef(false);

  useEffect(() => {
    if (!isEditingPercent) {
      setPercentText(percentValue);
    }
  }, [isEditingPercent, percentValue]);

  function commitPercentInput(inputText: string): void {
    const nextText = inputText.trim();
    const parsed = nextText === "" ? Math.round(value * 100) : Number(nextText);
    const nextPercent = Number.isFinite(parsed) ? Math.min(100, Math.max(0, Math.round(parsed))) : Math.round(value * 100);
    const nextValue = nextPercent / 100;

    setIsEditingPercent(false);
    setPercentText(`${nextPercent}`);
    if (nextValue !== value) {
      onChange(nextValue);
    }
  }

  return (
    <label className="sound-control">
      <span>
        {label} {percentLabel(value)}
      </span>
      <div className="sound-control-inputs">
        <input
          aria-label={label}
          data-testid={`sound-${id}`}
          max={1}
          min={0}
          onChange={(event) => {
            const nextValue = Number(event.target.value);
            setIsEditingPercent(false);
            setPercentText(`${Math.round(nextValue * 100)}`);
            onChange(nextValue);
          }}
          step={0.01}
          type="range"
          value={value}
        />
        <input
          aria-label={`${label} percent`}
          data-testid={`sound-${id}-input`}
          max={100}
          min={0}
          onBlur={(event) => {
            if (skipNextBlurCommit.current) {
              skipNextBlurCommit.current = false;
              return;
            }
            commitPercentInput(event.currentTarget.value);
          }}
          onChange={(event) => {
            setIsEditingPercent(true);
            setPercentText(event.target.value);
          }}
          onFocus={() => {
            setIsEditingPercent(true);
            setPercentText(percentValue);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              skipNextBlurCommit.current = true;
              commitPercentInput(event.currentTarget.value);
              event.currentTarget.blur();
            }
            if (event.key === "Escape") {
              skipNextBlurCommit.current = true;
              setIsEditingPercent(false);
              setPercentText(percentValue);
              event.currentTarget.blur();
            }
          }}
          step={1}
          type="number"
          value={isEditingPercent ? percentText : percentValue}
        />
      </div>
    </label>
  );
}

function ChordEditor({
  chords,
  rootOptions,
  onAdd,
  onChange,
  onDelete,
  onPreset
}: {
  chords: ChordEvent[];
  rootOptions: string[];
  onAdd: () => void;
  onChange: (index: number, update: Partial<ChordEvent>) => void;
  onDelete: (index: number) => void;
  onPreset: (preset: ChordProgressionPreset) => void;
}): ReactElement {
  return (
    <div className="chord-editor">
      <div className="lane-header">
        <span>Chords</span>
        <strong>{chords.length} events</strong>
      </div>
      <div className="chord-tools" aria-label="Chord progression tools">
        <div className="chord-preset-row" aria-label="Chord progression presets">
          {chordProgressionPresetIds.map((preset) => (
            <button
              data-testid={`chord-preset-${preset}`}
              key={preset}
              onClick={() => onPreset(preset)}
              type="button"
            >
              {chordProgressionPresetLabel(preset)}
            </button>
          ))}
        </div>
        <button data-testid="chord-add" onClick={onAdd} title="Add chord event" type="button">
          <Plus size={14} aria-hidden="true" />
          <span>Add chord</span>
        </button>
      </div>
      <div className="chord-slots">
        {chords.map((chord, index) => (
          <div className="chord-slot" data-testid={`chord-slot-${index}`} key={`${chord.step}-${index}`}>
            <div className="chord-slot-heading">
              <span>{chord.step + 1}</span>
              <strong>
                {chord.root}
                {chord.quality}
              </strong>
              <small data-testid={`chord-inversion-badge-${index}`}>{chordInversionLabel(normalizeChordInversion(chord.inversion))}</small>
              {chord.probability < 1 && (
                <small className="chance-badge" data-testid={`chord-chance-badge-${index}`}>
                  {chanceBadgeLabel(chord.probability)}
                </small>
              )}
              <button
                data-testid={`chord-delete-${index}`}
                disabled={chords.length <= 1}
                onClick={() => onDelete(index)}
                title="Delete chord event"
                type="button"
              >
                <Trash2 size={13} aria-hidden="true" />
              </button>
            </div>
            <label>
              <span>Step</span>
              <input
                data-testid={`chord-step-${index}`}
                max={16}
                min={1}
                onChange={(event) => onChange(index, { step: clampStepStart(Number(event.target.value) - 1) })}
                step={1}
                type="number"
                value={chord.step + 1}
              />
            </label>
            <label>
              <span>Root</span>
              <select
                data-testid={`chord-root-${index}`}
                value={chord.root}
                onChange={(event) => onChange(index, { root: event.target.value })}
              >
                {rootOptions.map((root) => (
                  <option key={root} value={root}>
                    {root}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Quality</span>
              <select
                data-testid={`chord-quality-${index}`}
                value={chord.quality}
                onChange={(event) => onChange(index, { quality: event.target.value as ChordQuality })}
              >
                {chordQualities.map((quality) => (
                  <option key={quality} value={quality}>
                    {quality}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Voicing {chordInversionLabel(normalizeChordInversion(chord.inversion))}</span>
              <div className="chord-inversion-row" aria-label={`Chord ${index + 1} inversion`}>
                {chordInversions.map((inversion) => (
                  <button
                    className={normalizeChordInversion(chord.inversion) === inversion ? "selected" : ""}
                    data-testid={`chord-inversion-${index}-${inversion}`}
                    key={inversion}
                    onClick={() => onChange(index, { inversion })}
                    type="button"
                  >
                    {chordInversionLabel(inversion)}
                  </button>
                ))}
              </div>
            </label>
            <label>
              <span>Length {chord.length}</span>
              <div className="chord-value-inputs">
                <input
                  data-testid={`chord-length-${index}`}
                  max={8}
                  min={1}
                  onChange={(event) => onChange(index, { length: Number(event.target.value) })}
                  step={1}
                  type="range"
                  value={chord.length}
                />
                <input
                  aria-label={`Chord ${index + 1} length`}
                  data-testid={`chord-length-input-${index}`}
                  max={8}
                  min={1}
                  onChange={(event) => onChange(index, { length: Number(event.target.value) })}
                  step={1}
                  type="number"
                  value={chord.length}
                />
              </div>
            </label>
            <label>
              <span>Velocity {Math.round(chord.velocity * 100)}%</span>
              <div className="chord-value-inputs">
                <input
                  data-testid={`chord-velocity-${index}`}
                  max={1}
                  min={0.1}
                  onChange={(event) => onChange(index, { velocity: Number(event.target.value) })}
                  step={0.01}
                  type="range"
                  value={chord.velocity}
                />
                <input
                  aria-label={`Chord ${index + 1} velocity percent`}
                  data-testid={`chord-velocity-input-${index}`}
                  max={100}
                  min={10}
                  onChange={(event) => onChange(index, { velocity: Number(event.target.value) / 100 })}
                  step={1}
                  type="number"
                  value={Math.round(chord.velocity * 100)}
                />
              </div>
            </label>
            <label>
              <span>Chance {percentLabel(chord.probability)}</span>
              <div className="chord-value-inputs">
                <input
                  aria-label={`Chord ${index + 1} probability`}
                  data-testid={`chord-probability-${index}`}
                  max={1}
                  min={0}
                  onChange={(event) => onChange(index, { probability: Number(event.target.value) })}
                  step={0.01}
                  type="range"
                  value={normalizeEventProbability(chord.probability)}
                />
                <input
                  aria-label={`Chord ${index + 1} probability percent`}
                  data-testid={`chord-probability-input-${index}`}
                  inputMode="numeric"
                  onChange={(event) => onChange(index, { probability: Number(event.target.value) / 100 })}
                  pattern="[0-9]*"
                  step={1}
                  type="text"
                  value={`${Math.round(normalizeEventProbability(chord.probability) * 100)}`}
                />
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function laneColor(lane: DrumLane): string {
  const colors: Record<DrumLane, string> = {
    kick: "#78f0c8",
    clap: "#ff7a4f",
    hat: "#f0c36a",
    perc: "#8aa8ff"
  };
  return colors[lane];
}

function mergePitchLanes(scalePitches: string[], usedPitches: string[]): string[] {
  return Array.from(new Set([...scalePitches, ...usedPitches]));
}

function mergeChordRoots(scaleRoots: string[], usedRoots: string[]): string[] {
  return Array.from(new Set([...scaleRoots, ...usedRoots]));
}

function matchesSelectedNote(note: BassNote | MelodyNote, selectedNote: SelectedNote): boolean {
  return note.step === selectedNote.step && note.pitch === selectedNote.pitch;
}

function nextEmptyStepForPitch(notes: Array<BassNote | MelodyNote>, pitch: string, startStep: number): number | null {
  for (let offset = 1; offset < steps.length; offset += 1) {
    const step = (startStep + offset) % steps.length;
    if (!notes.some((note) => note.step === step && note.pitch === pitch)) {
      return step;
    }
  }
  return null;
}

function adjacentTrackPitch(
  track: NoteTrack,
  key: string,
  pitch: string,
  direction: -1 | 1,
  usedPitches: string[]
): string | null {
  const pitches = trackScalePitches(track, key, usedPitches);
  const index = pitches.indexOf(pitch);
  if (index < 0) {
    return null;
  }
  return pitches[index + direction] ?? null;
}

function octaveShiftPitch(track: NoteTrack, pitch: string, direction: -1 | 1): string | null {
  const parts = pitchParts(pitch);
  if (!parts) {
    return null;
  }
  const [minOctave, maxOctave] = trackOctaveRange(track);
  const octave = parts.octave + direction;
  if (octave < minOctave || octave > maxOctave) {
    return null;
  }
  return `${parts.name}${octave}`;
}

function trackScalePitches(track: NoteTrack, key: string, usedPitches: string[]): string[] {
  const [minOctave, maxOctave] = trackOctaveRange(track);
  const pitches: string[] = [];
  for (let octave = minOctave; octave <= maxOctave; octave += 1) {
    pitches.push(...scalePitches(key, octave).slice(0, -1));
  }
  return Array.from(new Set([...pitches, ...usedPitches])).sort((first, second) => pitchMidi(first) - pitchMidi(second));
}

function trackOctaveRange(track: NoteTrack): [number, number] {
  return track === "bass" ? [0, 3] : [3, 6];
}

function pitchParts(pitch: string): { name: string; octave: number } | null {
  const match = /^([A-G](?:#|b)?)(-?\d+)$/.exec(pitch);
  if (!match) {
    return null;
  }
  return { name: match[1], octave: Number(match[2]) };
}

function pitchMidi(pitch: string): number {
  const parts = pitchParts(pitch);
  if (!parts) {
    return 0;
  }
  const semitones: Record<string, number> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11
  };
  return (parts.octave + 1) * 12 + (semitones[parts.name] ?? 0);
}

function patternEventCount(pattern: PatternData): string {
  const drumHits = Object.values(pattern.drumPattern).reduce(
    (total, laneSteps) => total + laneSteps.filter(Boolean).length,
    0
  );
  const repeatedHats = pattern.drumPattern.hat.reduce(
    (total, enabled, step) => total + (enabled ? hatRepeatCount(pattern, step) - 1 : 0),
    0
  );
  return `${drumHits + repeatedHats + pattern.bassNotes.length + pattern.melodyNotes.length + pattern.chordEvents.length} events`;
}

function barCountLabel(bars: number): string {
  return `${bars} ${bars === 1 ? "bar" : "bars"}`;
}

function panLabel(pan: number): string {
  if (pan === 0) {
    return "C";
  }
  return pan < 0 ? `L ${Math.abs(pan)}` : `R ${pan}`;
}

function percentLabel(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function chanceBadgeLabel(value: number): string {
  return percentLabel(normalizeEventProbability(value));
}

function compactChanceBadgeLabel(value: number): string {
  return `${Math.round(normalizeEventProbability(value) * 100)}`;
}

function timingLabel(value: number): string {
  const timing = normalizeDrumTimingMs(value);
  if (timing === 0) {
    return "On grid";
  }
  return timing > 0 ? `Late +${timing} ms` : `Early ${timing} ms`;
}

function timingBadge(value: number): string {
  const timing = normalizeDrumTimingMs(value);
  return timing > 0 ? `+${timing}` : `${timing}`;
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return "0.00%";
  }
  return `${value.toFixed(2)}%`;
}

function formatDb(value: number): string {
  if (!Number.isFinite(value)) {
    return "-inf dB";
  }
  return `${value.toFixed(1)} dB`;
}

function meterPercent(valueDb: number, ceilingDb: number): number {
  if (!Number.isFinite(valueDb)) {
    return 0;
  }
  const floorDb = -48;
  const clamped = Math.min(ceilingDb, Math.max(floorDb, valueDb));
  return Math.round(((clamped - floorDb) / (ceilingDb - floorDb)) * 100);
}

function clampUnit(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0.5;
  }
  return Math.min(1, Math.max(0, value));
}

function clampPan(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(-100, Math.round(value)));
}

function clampStepLength(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(16, Math.max(1, Math.round(value)));
}

function clampVelocity(value: number): number {
  if (!Number.isFinite(value)) {
    return 0.5;
  }
  return Math.min(1, Math.max(0, value));
}

function sortBassNotes(notes: BassNote[]): BassNote[] {
  return [...notes].sort((first, second) => first.step - second.step || first.pitch.localeCompare(second.pitch));
}

function sortMelodyNotes(notes: MelodyNote[]): MelodyNote[] {
  return [...notes].sort((first, second) => first.step - second.step || first.pitch.localeCompare(second.pitch));
}

function sortChordEvents(events: ChordEvent[]): ChordEvent[] {
  return [...events].sort((first, second) => first.step - second.step || first.root.localeCompare(second.root));
}

function clampStepStart(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(15, Math.max(0, Math.round(value)));
}

function appendHistory(history: ProjectState[], project: ProjectState): ProjectState[] {
  return [...history, project].slice(-historyLimit);
}

function prependFuture(history: ProjectState[], project: ProjectState): ProjectState[] {
  return [project, ...history].slice(0, historyLimit);
}

function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
}

function downloadProjectFile(contents: string, fileName: string): void {
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function fileDisplayName(filePath?: string): string {
  if (!filePath) {
    return "project file";
  }
  return filePath.split(/[\\/]/).pop() || "project file";
}
