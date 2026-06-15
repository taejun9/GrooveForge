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
import { useMemo, useRef, useState } from "react";
import { exportWav, playPreview } from "../audio/render";
import {
  DrumLane,
  getStyle,
  ProjectState,
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

export function App(): ReactElement {
  const [project, setProject] = useState<ProjectState>(starterProject);
  const [isPlaying, setIsPlaying] = useState(false);
  const stopRef = useRef<null | (() => void)>(null);
  const style = getStyle(project);
  const activeChannels = useMemo(() => project.mixer.filter((channel) => !channel.muted).length, [project.mixer]);

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

  function togglePlayback(): void {
    if (isPlaying) {
      stopRef.current?.();
      stopRef.current = null;
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    stopRef.current = playPreview(project, () => {
      stopRef.current = null;
      setIsPlaying(false);
    });
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
          <button className="icon-button primary" type="button" title="Play preview" onClick={togglePlayback}>
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
                    className={project.drumPattern[lane][step] ? "step active" : "step"}
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
            <NoteLane
              title="808"
              notes={project.bassNotes.map((note) => ({ ...note, velocity: note.glide ? 0.95 : 0.82 }))}
              color="#ff7a4f"
            />
            <NoteLane title="Synth" notes={project.melodyNotes} color="#8aa8ff" />
          </div>
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

function NoteLane({
  title,
  notes,
  color
}: {
  title: string;
  notes: { step: number; pitch: string; length: number; velocity: number }[];
  color: string;
}): ReactElement {
  const pitches = Array.from(new Set(notes.map((note) => note.pitch))).reverse();
  return (
    <div className="note-lane">
      <div className="lane-header">{title}</div>
      <div className="piano-grid" style={{ "--note": color } as CSSProperties}>
        {pitches.map((pitch) => (
          <div className="piano-row" key={pitch}>
            <span>{pitch}</span>
            <div>
              {steps.map((step) => {
                const note = notes.find((candidate) => candidate.step === step && candidate.pitch === pitch);
                return (
                  <i
                    className={note ? "note active" : "note"}
                    key={`${pitch}-${step}`}
                    style={note ? { gridColumn: `${step + 1} / span ${note.length}` } : undefined}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
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
