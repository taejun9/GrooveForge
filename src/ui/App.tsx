import {
  ArrowLeft,
  ArrowRight,
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
import { analyzeExport, ExportAnalysis, exportStems, exportWav } from "../audio/render";
import { PlaybackController, PlaybackSnapshot, startRealtimePlayback } from "../audio/scheduler";
import {
  ArrangementBlock,
  ArrangementSection,
  BassNote,
  ChordEvent,
  ChordQuality,
  DrumLane,
  getStyle,
  MasterPreset,
  MelodyNote,
  MixerChannel,
  NoteTrack,
  PatternData,
  PatternSlot,
  ProjectState,
  SoundDesign,
  activePattern,
  arrangementSections,
  bassPitchLanes,
  chordQualities,
  clonePatternData,
  createStylePatternSet,
  createEmptyPatternData,
  defaultDrumVelocity,
  drumStepVelocity,
  hatRepeatCount,
  masterPresetCeilingDb,
  masterPresets,
  melodyPitchLanes,
  normalizeDrumVelocity,
  normalizeHatRepeat,
  parseProjectFile,
  patternSlots,
  projectFileName,
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
};

export function App(): ReactElement {
  const [project, setProject] = useState<ProjectState>(starterProject);
  const [undoStack, setUndoStack] = useState<ProjectState[]>([]);
  const [redoStack, setRedoStack] = useState<ProjectState[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
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
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isEditableShortcutTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      const withCommandModifier = event.metaKey || event.ctrlKey;
      const wantsUndo = withCommandModifier && !event.shiftKey && key === "z";
      const wantsRedo = withCommandModifier && ((event.shiftKey && key === "z") || key === "y");

      if (!wantsUndo && !wantsRedo) {
        return;
      }

      event.preventDefault();
      if (wantsUndo) {
        undoProject();
        return;
      }
      redoProject();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undoStack, redoStack]);

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

  function updateCurrentPattern(update: (pattern: PatternData) => PatternData): void {
    updateProject((current) => ({
      ...current,
      patterns: {
        ...current.patterns,
        [current.selectedPattern]: update(current.patterns[current.selectedPattern])
      }
    }));
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
        energy: update.energy === undefined ? block.energy : clampEnergy(update.energy)
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

  function updateMixerChannel(id: MixerChannel["id"], update: Partial<MixerChannel>): void {
    updateProject((current) => ({
      ...current,
      mixer: current.mixer.map((track) => (track.id === id ? { ...track, ...update } : track))
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
          { ...source },
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

  function toggleBassNote(step: number, pitch: string): void {
    const exists = currentPattern.bassNotes.some((note) => note.step === step && note.pitch === pitch);
    updateCurrentPattern((pattern) => ({
      ...pattern,
      bassNotes: exists
        ? pattern.bassNotes.filter((note) => note.step !== step || note.pitch !== pitch)
        : sortBassNotes([...pattern.bassNotes, { step, pitch, length: 2, glide: false }])
    }));
    setSelectedNote(exists ? null : { track: "bass", step, pitch });
    setSelectedDrumStep(null);
  }

  function toggleMelodyNote(step: number, pitch: string): void {
    const exists = currentPattern.melodyNotes.some((note) => note.step === step && note.pitch === pitch);
    updateCurrentPattern((pattern) => ({
      ...pattern,
      melodyNotes: exists
        ? pattern.melodyNotes.filter((note) => note.step !== step || note.pitch !== pitch)
        : sortMelodyNotes([...pattern.melodyNotes, { step, pitch, length: 1, velocity: 0.68 }])
    }));
    setSelectedNote(exists ? null : { track: "melody", step, pitch });
    setSelectedDrumStep(null);
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

  function updateChordEvent(index: number, update: Partial<ChordEvent>): void {
    updateCurrentPattern((pattern) => ({
      ...pattern,
      chordEvents: pattern.chordEvents.map((event, eventIndex) =>
        eventIndex === index
          ? {
              ...event,
              ...update,
              length: update.length === undefined ? event.length : clampStepLength(update.length),
              velocity: update.velocity === undefined ? event.velocity : clampVelocity(update.velocity)
            }
          : event
      )
    }));
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
        bars: 2,
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
            <select
              value={project.key}
              onChange={(event) => updateProject((current) => ({ ...current, key: event.target.value }))}
            >
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
            <strong>{isPlaying ? `Bar ${playbackPosition?.bar ?? 1}.${playbackPosition?.beat ?? 1}` : "Ready"}</strong>
            <span>{isPlaying ? `Step ${(currentPatternStep ?? 0) + 1}` : "2 bar loop"}</span>
          </div>
          <button className="icon-button primary" type="button" title="Play realtime loop" onClick={togglePlayback}>
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
                  const repeat = lane === "hat" ? hatRepeatCount(currentPattern, step) : 1;
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
                      {active && lane === "hat" && repeat > 1 && <small>{repeat}x</small>}
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
            <DrumStepInspector
              selectedStep={selectedDrumStep}
              active={selectedDrumActive}
              velocity={selectedDrumVelocity}
              hatRepeat={selectedHatRepeat}
              onVelocityChange={updateSelectedDrumVelocity}
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
            />
          )}
        </section>

        <section className="panel instrument-panel" aria-label="Instrument panel">
          <PanelTitle icon={<Sparkles size={18} />} title="Instruments" meta={project.mode === "guided" ? "curated" : "editable"} />
          <div className="device-list">
            <Device icon={<Drum size={17} />} name="Drum Rack" value={`${soundPresetLabel(project.sound.preset)} kit`} color="#78f0c8" />
            <Device icon={<Waves size={17} />} name="808 Engine" value={`${style.bassStyle} / drive ${percentLabel(project.sound.bassDrive)}`} color="#ff7a4f" />
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
            onChange={updateChordEvent}
          />
        </section>

        <section className="panel arrangement-panel" aria-label="Arrangement">
          <PanelTitle icon={<Music2 size={18} />} title="Arrangement" meta={`${project.arrangement.length} blocks`} />
          <div className="arrangement-track">
            {project.arrangement.map((block, index) => (
              <button
                aria-label={`Block ${index + 1} ${block.section} Pattern ${block.pattern}`}
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
              <label>
                <span>Energy {Math.round(selectedArrangementBlock.energy * 100)}%</span>
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
                <div className="strip-readout">
                  <span>{channel.volumeDb} dB</span>
                  <span>{panLabel(channel.pan)}</span>
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
  hatRepeat,
  onVelocityChange,
  onHatRepeatChange
}: {
  selectedStep: SelectedDrumStep | null;
  active: boolean;
  velocity?: number;
  hatRepeat: number;
  onVelocityChange: (velocity: number) => void;
  onHatRepeatChange: (repeat: number) => void;
}): ReactElement {
  const velocityValue = velocity ?? 0.75;
  const label = selectedStep ? `${drumLabels[selectedStep.lane]} ${selectedStep.step + 1}` : "No step";

  return (
    <div className="drum-step-inspector" aria-label="Drum step dynamics">
      <div className="inspector-heading">
        <span>Dynamics</span>
        <strong data-testid="drum-step-readout">
          {selectedStep ? `${label} ${active ? percentLabel(velocityValue) : "off"}` : "Select step"}
        </strong>
      </div>
      <label>
        <span>Velocity {active ? percentLabel(velocityValue) : "--"}</span>
        <div className="drum-velocity-row">
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
                    aria-label={`${title} ${pitch} step ${step + 1}`}
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
  onVelocityChange
}: {
  selectedNote: SelectedNote | null;
  bassNote?: BassNote;
  melodyNote?: MelodyNote;
  onLengthChange: (length: number) => void;
  onGlideChange: (glide: boolean) => void;
  onVelocityChange: (velocity: number) => void;
}): ReactElement {
  const activeNote = bassNote ?? melodyNote;
  const label = selectedNote ? `${selectedNote.track === "bass" ? "808" : "Synth"} ${selectedNote.pitch}.${selectedNote.step + 1}` : "None";
  return (
    <div className="note-inspector">
      <div className="inspector-heading">
        <span>Selected</span>
        <strong>{activeNote ? label : "None"}</strong>
      </div>
      {activeNote && (
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
        </div>
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
          onChange={(event) => onChange(Number(event.target.value))}
          step={0.01}
          type="range"
          value={value}
        />
        <input
          aria-label={`${label} percent`}
          data-testid={`sound-${id}-input`}
          max={100}
          min={0}
          onChange={(event) => onChange(Number(event.target.value) / 100)}
          step={1}
          type="number"
          value={Math.round(value * 100)}
        />
      </div>
    </label>
  );
}

function ChordEditor({
  chords,
  rootOptions,
  onChange
}: {
  chords: ChordEvent[];
  rootOptions: string[];
  onChange: (index: number, update: Partial<ChordEvent>) => void;
}): ReactElement {
  return (
    <div className="chord-editor">
      <div className="lane-header">
        <span>Chords</span>
        <strong>{chords.length} events</strong>
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
            </div>
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

function panLabel(pan: number): string {
  if (pan === 0) {
    return "C";
  }
  return pan < 0 ? `L ${Math.abs(pan)}` : `R ${pan}`;
}

function percentLabel(value: number): string {
  return `${Math.round(value * 100)}%`;
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

function clampEnergy(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

function sortBassNotes(notes: BassNote[]): BassNote[] {
  return [...notes].sort((first, second) => first.step - second.step || first.pitch.localeCompare(second.pitch));
}

function sortMelodyNotes(notes: MelodyNote[]): MelodyNote[] {
  return [...notes].sort((first, second) => first.step - second.step || first.pitch.localeCompare(second.pitch));
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
