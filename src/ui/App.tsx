import {
  CircleStop,
  Disc3,
  Download,
  Drum,
  Gauge,
  KeyboardMusic,
  Music2,
  Play,
  Save,
  SlidersHorizontal,
  Sparkles,
  Waves
} from "lucide-react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { exportWav } from "../audio/render";
import { PlaybackController, PlaybackSnapshot, startRealtimePlayback } from "../audio/scheduler";
import {
  BassNote,
  DrumLane,
  getStyle,
  MelodyNote,
  NoteTrack,
  ProjectState,
  bassPitchLanes,
  melodyPitchLanes,
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
  const controllerRef = useRef<PlaybackController | null>(null);
  const style = getStyle(project);
  const activeChannels = useMemo(() => project.mixer.filter((channel) => !channel.muted).length, [project.mixer]);
  const currentPatternStep = playbackPosition ? playbackPosition.loopStep % 16 : null;
  const bassPitches = useMemo(
    () => mergePitchLanes(bassPitchLanes(project.key), project.bassNotes.map((note) => note.pitch)),
    [project.bassNotes, project.key]
  );
  const melodyPitches = useMemo(
    () => mergePitchLanes(melodyPitchLanes(project.key), project.melodyNotes.map((note) => note.pitch)),
    [project.key, project.melodyNotes]
  );
  const selectedBassNote =
    selectedNote?.track === "bass"
      ? project.bassNotes.find((note) => note.step === selectedNote.step && note.pitch === selectedNote.pitch)
      : undefined;
  const selectedMelodyNote =
    selectedNote?.track === "melody"
      ? project.melodyNotes.find((note) => note.step === selectedNote.step && note.pitch === selectedNote.pitch)
      : undefined;

  useEffect(() => {
    return () => {
      controllerRef.current?.stop();
      controllerRef.current = null;
    };
  }, []);

  function updateProject(update: (current: ProjectState) => ProjectState): void {
    setProject((current) => update(current));
  }

  function toggleStep(lane: DrumLane, step: number): void {
    updateProject((current) => ({
      ...current,
      drumPattern: {
        ...current.drumPattern,
        [lane]: current.drumPattern[lane].map((enabled, index) => (index === step ? !enabled : enabled))
      }
    }));
  }

  function toggleBassNote(step: number, pitch: string): void {
    const exists = project.bassNotes.some((note) => note.step === step && note.pitch === pitch);
    updateProject((current) => ({
      ...current,
      bassNotes: exists
        ? current.bassNotes.filter((note) => note.step !== step || note.pitch !== pitch)
        : sortBassNotes([...current.bassNotes, { step, pitch, length: 2, glide: false }])
    }));
    setSelectedNote(exists ? null : { track: "bass", step, pitch });
  }

  function toggleMelodyNote(step: number, pitch: string): void {
    const exists = project.melodyNotes.some((note) => note.step === step && note.pitch === pitch);
    updateProject((current) => ({
      ...current,
      melodyNotes: exists
        ? current.melodyNotes.filter((note) => note.step !== step || note.pitch !== pitch)
        : sortMelodyNotes([...current.melodyNotes, { step, pitch, length: 1, velocity: 0.68 }])
    }));
    setSelectedNote(exists ? null : { track: "melody", step, pitch });
  }

  function updateSelectedLength(length: number): void {
    if (!selectedNote) {
      return;
    }

    updateProject((current) => ({
      ...current,
      bassNotes:
        selectedNote.track === "bass"
          ? current.bassNotes.map((note) =>
              note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, length } : note
            )
          : current.bassNotes,
      melodyNotes:
        selectedNote.track === "melody"
          ? current.melodyNotes.map((note) =>
              note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, length } : note
            )
          : current.melodyNotes
    }));
  }

  function updateSelectedGlide(glide: boolean): void {
    if (!selectedNote || selectedNote.track !== "bass") {
      return;
    }

    updateProject((current) => ({
      ...current,
      bassNotes: current.bassNotes.map((note) =>
        note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, glide } : note
      )
    }));
  }

  function updateSelectedVelocity(velocity: number): void {
    if (!selectedNote || selectedNote.track !== "melody") {
      return;
    }

    updateProject((current) => ({
      ...current,
      melodyNotes: current.melodyNotes.map((note) =>
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
          <button className="icon-button" type="button" title="Save project">
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
          <span>{activeChannels} active channels</span>
          <span>{project.masterPreset}</span>
        </div>
      </section>

      <section className="workspace-grid">
        <section className="panel pattern-panel" aria-label="Pattern editor">
          <PanelTitle icon={<Drum size={18} />} title="Drums" meta="16 step rack" />
          <div className="pattern-tabs" aria-label="Pattern">
            {(["A", "B", "C"] as const).map((pattern) => (
              <button
                key={pattern}
                className={project.selectedPattern === pattern ? "selected" : ""}
                type="button"
                onClick={() => updateProject((current) => ({ ...current, selectedPattern: pattern }))}
              >
                {pattern}
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
                      project.drumPattern[lane][step] ? "active" : "",
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
              notes={project.bassNotes.map((note) => ({ ...note, velocity: note.glide ? 0.95 : 0.82 }))}
              pitches={bassPitches}
              color="#ff7a4f"
              currentStep={currentPatternStep}
              selectedNote={selectedNote}
              onToggle={toggleBassNote}
            />
            <NoteEditor
              title="Synth"
              track="melody"
              notes={project.melodyNotes}
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
          <PanelTitle icon={<Music2 size={18} />} title="Arrangement" meta="8 blocks" />
          <div className="arrangement-track">
            {project.arrangement.map((block, index) => (
              <button className="arrangement-block" key={`${block.section}-${index}`} type="button">
                <span>{block.section}</span>
                <strong>{block.pattern}</strong>
                <i style={{ inlineSize: `${Math.max(18, block.energy * 100)}%` }} />
              </button>
            ))}
          </div>
        </section>

        <section className="panel mixer-panel" aria-label="Mixer">
          <PanelTitle icon={<SlidersHorizontal size={18} />} title="Mixer" meta="tracks" />
          <div className="mixer-strips">
            {project.mixer.map((channel) => (
              <div className="strip" key={channel.id} style={{ "--strip": channel.accent } as CSSProperties}>
                <div className="strip-top">
                  <span>{channel.name}</span>
                  <button
                    className={channel.muted ? "mini-toggle active" : "mini-toggle"}
                    type="button"
                    onClick={() =>
                      updateProject((current) => ({
                        ...current,
                        mixer: current.mixer.map((track) =>
                          track.id === channel.id ? { ...track, muted: !track.muted } : track
                        )
                      }))
                    }
                  >
                    M
                  </button>
                </div>
                <input
                  aria-label={`${channel.name} volume`}
                  max={3}
                  min={-36}
                  onChange={(event) =>
                    updateProject((current) => ({
                      ...current,
                      mixer: current.mixer.map((track) =>
                        track.id === channel.id ? { ...track, volumeDb: Number(event.target.value) } : track
                      )
                    }))
                  }
                  step={1}
                  type="range"
                  value={channel.volumeDb}
                />
                <span>{channel.volumeDb} dB</span>
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
            {(["Clean Demo", "Streaming Safe", "Headroom for Vocal"] as const).map((preset) => (
              <button
                key={preset}
                className={project.masterPreset === preset ? "selected" : ""}
                type="button"
                onClick={() => updateProject((current) => ({ ...current, masterPreset: preset }))}
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

function sortBassNotes(notes: BassNote[]): BassNote[] {
  return [...notes].sort((first, second) => first.step - second.step || first.pitch.localeCompare(second.pitch));
}

function sortMelodyNotes(notes: MelodyNote[]): MelodyNote[] {
  return [...notes].sort((first, second) => first.step - second.step || first.pitch.localeCompare(second.pitch));
}
