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
  Save,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Waves
} from "lucide-react";
import type { ChangeEvent, CSSProperties, ReactElement, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { exportWav } from "../audio/render";
import { PlaybackController, PlaybackSnapshot, startRealtimePlayback } from "../audio/scheduler";
import {
  ArrangementBlock,
  ArrangementSection,
  BassNote,
  DrumLane,
  getStyle,
  MasterPreset,
  MelodyNote,
  MixerChannel,
  NoteTrack,
  PatternData,
  PatternSlot,
  ProjectState,
  activePattern,
  arrangementSections,
  bassPitchLanes,
  masterPresetCeilingDb,
  masterPresets,
  melodyPitchLanes,
  parseProjectFile,
  patternSlots,
  projectFileName,
  serializeProjectFile,
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

type SelectedNote = {
  track: NoteTrack;
  step: number;
  pitch: string;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState<PlaybackSnapshot | null>(null);
  const [selectedNote, setSelectedNote] = useState<SelectedNote | null>(null);
  const [selectedArrangementIndex, setSelectedArrangementIndex] = useState(0);
  const [projectStatus, setProjectStatus] = useState("Demo project");
  const controllerRef = useRef<PlaybackController | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const style = getStyle(project);
  const currentPattern = activePattern(project);
  const activeChannels = useMemo(() => {
    const soloActive = project.mixer.some((channel) => channel.id !== "master" && channel.solo);
    return project.mixer.filter(
      (channel) => channel.id !== "master" && !channel.muted && (!soloActive || channel.solo)
    ).length;
  }, [project.mixer]);
  const activeChannelLabel = `${activeChannels} active ${activeChannels === 1 ? "channel" : "channels"}`;
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
  const selectedBassNote =
    selectedNote?.track === "bass"
      ? currentPattern.bassNotes.find((note) => note.step === selectedNote.step && note.pitch === selectedNote.pitch)
      : undefined;
  const selectedMelodyNote =
    selectedNote?.track === "melody"
      ? currentPattern.melodyNotes.find((note) => note.step === selectedNote.step && note.pitch === selectedNote.pitch)
      : undefined;

  useEffect(() => {
    return () => {
      controllerRef.current?.stop();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    setSelectedArrangementIndex((index) => Math.min(index, Math.max(0, project.arrangement.length - 1)));
  }, [project.arrangement.length]);

  function updateProject(update: (current: ProjectState) => ProjectState): void {
    setProject((current) => update(current));
    setProjectStatus("Unsaved changes");
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
    setProject((current) => ({ ...current, selectedPattern: pattern }));
    setSelectedNote(null);
    setProjectStatus(`Editing Pattern ${pattern}`);
  }

  function selectArrangementBlock(index: number): void {
    const block = project.arrangement[index];
    if (!block) {
      return;
    }

    setSelectedArrangementIndex(index);
    setProject((current) => ({ ...current, selectedPattern: block.pattern }));
    setSelectedNote(null);
    setProjectStatus(`Arranging ${block.section}`);
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

  function duplicateArrangementBlock(): void {
    setProject((current) => {
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
    });
    setSelectedNote(null);
    setProjectStatus("Duplicated arrangement block");
  }

  function moveArrangementBlock(direction: -1 | 1): void {
    setProject((current) => {
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
    });
    setSelectedNote(null);
    setProjectStatus(direction < 0 ? "Moved block left" : "Moved block right");
  }

  function deleteArrangementBlock(): void {
    setProject((current) => {
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
    });
    setSelectedNote(null);
    setProjectStatus(project.arrangement.length <= 1 ? "Arrangement needs one block" : "Deleted arrangement block");
  }

  function toggleStep(lane: DrumLane, step: number): void {
    updateCurrentPattern((pattern) => ({
      ...pattern,
      drumPattern: {
        ...pattern.drumPattern,
        [lane]: pattern.drumPattern[lane].map((enabled, index) => (index === step ? !enabled : enabled))
      }
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
      setProject(nextProject);
      setPlaybackPosition(null);
      setSelectedNote(null);
      setIsPlaying(false);
      setProjectStatus(`Loaded ${sourceName}`);
    } catch (error) {
      console.error(error);
      setProjectStatus("Invalid project file");
    }
  }

  function selectStyle(styleId: ProjectState["styleId"]): void {
    const nextStyle = styleProfiles.find((candidate) => candidate.id === styleId);
    if (!nextStyle) {
      return;
    }
    updateProject((current) => ({
      ...current,
      styleId,
      bpm: nextStyle.defaultBpm,
      swing: nextStyle.defaultSwing
    }));
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
          <button className="icon-button" type="button" title="Open project" onClick={() => void handleOpenProject()}>
            <FolderOpen size={18} aria-hidden="true" />
            <span>Open</span>
          </button>
          <button className="icon-button" type="button" title="Save project" onClick={() => void handleSaveProject()}>
            <Save size={18} aria-hidden="true" />
            <span>Save</span>
          </button>
          <button className="icon-button" type="button" title="Export WAV" onClick={() => exportWav(project)}>
            <Download size={18} aria-hidden="true" />
            <span>WAV</span>
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
          <div className="step-grid">
            {(Object.keys(drumLabels) as DrumLane[]).map((lane) => (
              <div className="step-row" key={lane}>
                <div className="lane-name">{drumLabels[lane]}</div>
                {steps.map((step) => (
                  <button
                    aria-label={`${drumLabels[lane]} step ${step + 1}`}
                    className={[
                      "step",
                      currentPattern.drumPattern[lane][step] ? "active" : "",
                      currentPatternStep === step ? "playhead" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={step}
                    onClick={() => toggleStep(lane, step)}
                    style={{ "--lane-color": laneColor(lane) } as CSSProperties}
                    type="button"
                  >
                    <span>{step + 1}</span>
                  </button>
                ))}
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
            <label>
              <span>Density</span>
              <input type="range" min={0} max={1} step={0.05} defaultValue={0.72} />
            </label>
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
            <Device icon={<Drum size={17} />} name="Drum Rack" value="Forge Kit 01" color="#78f0c8" />
            <Device icon={<Waves size={17} />} name="808 Engine" value={`${style.bassStyle} / mono`} color="#ff7a4f" />
            <Device icon={<Music2 size={17} />} name="Synth" value={`${style.melodyStyle} patch`} color="#8aa8ff" />
            <Device icon={<SlidersHorizontal size={17} />} name="FX" value="EQ / comp / sat" color="#f0c36a" />
          </div>
          {project.mode === "studio" && (
            <div className="studio-controls">
              <label>
                <span>808 drive</span>
                <input type="range" min={0} max={1} step={0.01} defaultValue={0.42} />
              </label>
              <label>
                <span>Sidechain</span>
                <input type="range" min={0} max={1} step={0.01} defaultValue={0.38} />
              </label>
              <label>
                <span>Humanize</span>
                <input type="range" min={0} max={1} step={0.01} defaultValue={0.12} />
              </label>
            </div>
          )}
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
          <label>
            <span>Ceiling</span>
            <input
              type="range"
              min={-6}
              max={0}
              step={0.5}
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

function patternEventCount(pattern: PatternData): string {
  const drumHits = Object.values(pattern.drumPattern).reduce(
    (total, laneSteps) => total + laneSteps.filter(Boolean).length,
    0
  );
  return `${drumHits + pattern.bassNotes.length + pattern.melodyNotes.length} events`;
}

function panLabel(pan: number): string {
  if (pan === 0) {
    return "C";
  }
  return pan < 0 ? `L ${Math.abs(pan)}` : `R ${pan}`;
}

function clampPan(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(-100, Math.round(value)));
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
