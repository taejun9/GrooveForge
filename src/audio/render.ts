import {
  chordPitches,
  dbToGain,
  noteToFrequency,
  patternForSlot,
  projectStepDurationSeconds,
  ProjectState,
  SoundDesign,
  TrackType
} from "../domain/workstation";

const sampleRate = 44100;
const channels = 2;
export const stemTrackIds = ["drum_rack", "bass_808", "synth", "chord"] as const;
export type StemTrackId = (typeof stemTrackIds)[number];

type AudioChannels = [Float32Array<ArrayBuffer>, Float32Array<ArrayBuffer>];
type ChannelMix = {
  gain: number;
  left: number;
  right: number;
};

function stepDuration(project: ProjectState): number {
  return projectStepDurationSeconds(project);
}

function hasSolo(project: ProjectState): boolean {
  return project.mixer.some((track) => track.id !== "master" && track.solo);
}

function channelMix(project: ProjectState, id: TrackType, stemTarget?: StemTrackId): ChannelMix {
  const channel = project.mixer.find((track) => track.id === id);
  if (stemTarget && id !== stemTarget) {
    return { gain: 0, left: 0, right: 0 };
  }
  const soloActive = hasSolo(project);
  if (!channel || (!stemTarget && channel.muted) || (!stemTarget && id !== "master" && soloActive && !channel.solo)) {
    return { gain: 0, left: 0, right: 0 };
  }

  const normalizedPan = Math.max(-1, Math.min(1, channel.pan / 100));
  return {
    gain: dbToGain(channel.volumeDb),
    left: normalizedPan <= 0 ? 1 : 1 - normalizedPan,
    right: normalizedPan >= 0 ? 1 : 1 + normalizedPan
  };
}

function masterOutputGain(project: ProjectState): number {
  return channelMix(project, "master").gain;
}

function arrangementBarCount(project: ProjectState): number {
  return Math.max(1, project.arrangement.length);
}

type ToneShape = "sine" | "triangle" | "saw" | "square";

function addTone(
  buffer: AudioChannels,
  start: number,
  duration: number,
  frequency: number,
  mix: ChannelMix,
  gainScale: number,
  shape: ToneShape,
  tone: { drive?: number; filter?: number; decay?: number } = {}
): void {
  if (mix.gain <= 0) {
    return;
  }
  const startFrame = Math.max(0, Math.floor(start * sampleRate));
  const frames = Math.max(1, Math.floor(duration * sampleRate));
  const drive = tone.drive ?? 0;
  const decay = tone.decay ?? 5;
  const filter = tone.filter ?? 1;
  for (let index = 0; index < frames && startFrame + index < buffer[0].length; index += 1) {
    const t = index / sampleRate;
    const envelope = Math.exp(-decay * t / Math.max(0.01, duration));
    const phase = 2 * Math.PI * frequency * t;
    const fundamental = waveform(shape, phase);
    const harmonic = Math.sin(phase * 2) * drive * 0.28 + Math.sin(phase * 3) * drive * 0.12;
    const shaped = Math.tanh((fundamental + harmonic) * (1 + drive * 2.8));
    const value = shaped * mix.gain * gainScale * envelope * filter;
    buffer[0][startFrame + index] += value * mix.left;
    buffer[1][startFrame + index] += value * mix.right;
  }
}

function waveform(shape: ToneShape, phase: number): number {
  switch (shape) {
    case "triangle":
      return (2 / Math.PI) * Math.asin(Math.sin(phase));
    case "saw":
      return 2 * (phase / (2 * Math.PI) - Math.floor(0.5 + phase / (2 * Math.PI)));
    case "square":
      return Math.sin(phase) >= 0 ? 1 : -1;
    case "sine":
    default:
      return Math.sin(phase);
  }
}

function addNoise(buffer: AudioChannels, start: number, duration: number, mix: ChannelMix, gainScale: number, brightness = 0.5): void {
  if (mix.gain <= 0) {
    return;
  }
  const startFrame = Math.max(0, Math.floor(start * sampleRate));
  const frames = Math.max(1, Math.floor(duration * sampleRate));
  let previous = 0;
  for (let index = 0; index < frames && startFrame + index < buffer[0].length; index += 1) {
    const t = index / sampleRate;
    const envelope = Math.exp((-6 - brightness * 5) * t / duration);
    const raw = Math.random() * 2 - 1;
    const value = (raw * brightness + previous * (1 - brightness)) * mix.gain * gainScale * envelope;
    previous = raw;
    buffer[0][startFrame + index] += value * mix.left;
    buffer[1][startFrame + index] += value * mix.right;
  }
}

function bassShape(sound: SoundDesign): ToneShape {
  if (sound.bassDrive > 0.64) {
    return "saw";
  }
  if (sound.bassDrive > 0.38) {
    return "triangle";
  }
  return "sine";
}

function synthShape(sound: SoundDesign): ToneShape {
  if (sound.synthBrightness > 0.72) {
    return "square";
  }
  return sound.synthBrightness > 0.46 ? "triangle" : "sine";
}

function renderProject(project: ProjectState, bars = arrangementBarCount(project), stemTarget?: StemTrackId): AudioChannels {
  const step = stepDuration(project);
  const totalSteps = bars * 16;
  const duration = totalSteps * step;
  const frames = Math.ceil(duration * sampleRate);
  const buffer: AudioChannels = [new Float32Array(frames), new Float32Array(frames)];
  const drumMix = channelMix(project, "drum_rack", stemTarget);
  const bassMix = channelMix(project, "bass_808", stemTarget);
  const synthMix = channelMix(project, "synth", stemTarget);
  const chordMix = channelMix(project, "chord", stemTarget);
  const sound = project.sound;
  const outputGain = masterOutputGain(project);

  for (let bar = 0; bar < bars; bar += 1) {
    const barOffset = bar * 16;
    const arrangementBlock = project.arrangement[bar % project.arrangement.length];
    const pattern = arrangementBlock ? patternForSlot(project, arrangementBlock.pattern) : patternForSlot(project, project.selectedPattern);
    for (let patternStep = 0; patternStep < 16; patternStep += 1) {
      const time = (barOffset + patternStep) * step;
      if (pattern.drumPattern.kick[patternStep]) {
        addTone(buffer, time, 0.18 + sound.kickPunch * 0.1, 44 + sound.kickPunch * 10, drumMix, 0.78 + sound.kickPunch * 0.24, "sine", {
          decay: 4.8 - sound.kickPunch * 1.2
        });
        addTone(buffer, time, 0.06 + sound.kickPunch * 0.04, 82 + sound.kickPunch * 45, drumMix, 0.2 + sound.kickPunch * 0.22, "sine", {
          decay: 8
        });
      }
      if (pattern.drumPattern.clap[patternStep]) {
        addNoise(buffer, time, 0.11 + (1 - sound.snareSnap) * 0.08, drumMix, 0.28 + sound.snareSnap * 0.18, sound.snareSnap);
      }
      if (pattern.drumPattern.hat[patternStep]) {
        addNoise(buffer, time, 0.035 + (1 - sound.hatBrightness) * 0.025, drumMix, 0.12 + sound.hatBrightness * 0.1, sound.hatBrightness);
      }
      if (pattern.drumPattern.perc[patternStep]) {
        addTone(buffer, time, 0.08, 260 + sound.snareSnap * 190, drumMix, 0.16, "triangle", {
          filter: 0.7 + sound.hatBrightness * 0.3
        });
      }
    }
    for (const note of pattern.bassNotes) {
      addTone(
        buffer,
        (barOffset + note.step) * step,
        note.length * step * (0.74 + sound.bassDecay * 0.52),
        noteToFrequency(note.pitch),
        bassMix,
        0.52 + sound.bassDrive * 0.24,
        bassShape(sound),
        { drive: sound.bassDrive, filter: 0.72 + sound.bassDrive * 0.28, decay: 3.8 - sound.bassDecay * 1.4 }
      );
    }
    for (const note of pattern.melodyNotes) {
      addTone(
        buffer,
        (barOffset + note.step) * step,
        note.length * step * (0.8 + sound.synthRelease * 0.42),
        noteToFrequency(note.pitch),
        synthMix,
        note.velocity * 0.22,
        synthShape(sound),
        { drive: sound.synthBrightness * 0.08, filter: 0.62 + sound.synthBrightness * 0.38, decay: 4.4 - sound.synthRelease * 1.8 }
      );
    }
    for (const chord of pattern.chordEvents) {
      const pitches = chordPitches(chord);
      for (const [voiceIndex, pitch] of pitches.entries()) {
        const spread = pitches.length <= 1 ? 0 : (voiceIndex / (pitches.length - 1)) * 2 - 1;
        const voiceMix = {
          ...chordMix,
          left: Math.max(0, Math.min(1, chordMix.left - spread * sound.chordWidth * 0.28)),
          right: Math.max(0, Math.min(1, chordMix.right + spread * sound.chordWidth * 0.28))
        };
        addTone(
          buffer,
          (barOffset + chord.step) * step,
          chord.length * step * (0.9 + sound.synthRelease * 0.24),
          noteToFrequency(pitch),
          voiceMix,
          chord.velocity * 0.14,
          "triangle",
          { drive: (1 - sound.chordWarmth) * 0.08, filter: 0.48 + (1 - sound.chordWarmth) * 0.42, decay: 3.8 - sound.synthRelease * 1.2 }
        );
      }
    }
  }

  const ceiling = dbToGain(project.masterCeilingDb);
  for (let channel = 0; channel < channels; channel += 1) {
    for (let index = 0; index < buffer[channel].length; index += 1) {
      const value = buffer[channel][index] * outputGain;
      buffer[channel][index] = Math.max(-ceiling, Math.min(ceiling, value));
    }
  }
  return buffer;
}

export function stemTrackLabel(track: StemTrackId): string {
  const labels: Record<StemTrackId, string> = {
    drum_rack: "Drums",
    bass_808: "808",
    synth: "Synth",
    chord: "Chords"
  };
  return labels[track];
}

function writeString(view: DataView, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function encodeWav(buffer: AudioChannels): Blob {
  const frameCount = buffer[0].length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataSize = frameCount * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, buffer[channel][frame]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += bytesPerSample;
    }
  }
  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function projectSlug(project: ProjectState): string {
  return project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "grooveforge";
}

function downloadWav(buffer: AudioChannels, fileName: string): void {
  const blob = encodeWav(buffer);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportWav(project: ProjectState): void {
  downloadWav(renderProject(project), `${projectSlug(project)}-demo.wav`);
}

export function exportStems(project: ProjectState): string[] {
  const slug = projectSlug(project);
  const fileNames = stemTrackIds.map((track) => {
    const fileName = `${slug}-${track.replace("_", "-")}-stem.wav`;
    downloadWav(renderProject(project, arrangementBarCount(project), track), fileName);
    return fileName;
  });
  return fileNames;
}
