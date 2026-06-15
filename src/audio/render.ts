import { dbToGain, noteToFrequency, patternForSlot, projectStepDurationSeconds, ProjectState } from "../domain/workstation";

const sampleRate = 44100;
const channels = 2;
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

function channelMix(project: ProjectState, id: string): ChannelMix {
  const channel = project.mixer.find((track) => track.id === id);
  const soloActive = hasSolo(project);
  if (!channel || channel.muted || (id !== "master" && soloActive && !channel.solo)) {
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

function addSine(buffer: AudioChannels, start: number, duration: number, frequency: number, mix: ChannelMix, gainScale: number): void {
  if (mix.gain <= 0) {
    return;
  }
  const startFrame = Math.max(0, Math.floor(start * sampleRate));
  const frames = Math.max(1, Math.floor(duration * sampleRate));
  for (let index = 0; index < frames && startFrame + index < buffer[0].length; index += 1) {
    const t = index / sampleRate;
    const envelope = Math.exp(-5 * t / duration);
    const value = Math.sin(2 * Math.PI * frequency * t) * mix.gain * gainScale * envelope;
    buffer[0][startFrame + index] += value * mix.left;
    buffer[1][startFrame + index] += value * mix.right;
  }
}

function addNoise(buffer: AudioChannels, start: number, duration: number, mix: ChannelMix, gainScale: number): void {
  if (mix.gain <= 0) {
    return;
  }
  const startFrame = Math.max(0, Math.floor(start * sampleRate));
  const frames = Math.max(1, Math.floor(duration * sampleRate));
  for (let index = 0; index < frames && startFrame + index < buffer[0].length; index += 1) {
    const t = index / sampleRate;
    const envelope = Math.exp(-8 * t / duration);
    const value = (Math.random() * 2 - 1) * mix.gain * gainScale * envelope;
    buffer[0][startFrame + index] += value * mix.left;
    buffer[1][startFrame + index] += value * mix.right;
  }
}

function renderProject(project: ProjectState, bars = arrangementBarCount(project)): AudioChannels {
  const step = stepDuration(project);
  const totalSteps = bars * 16;
  const duration = totalSteps * step;
  const frames = Math.ceil(duration * sampleRate);
  const buffer: AudioChannels = [new Float32Array(frames), new Float32Array(frames)];
  const drumMix = channelMix(project, "drum_rack");
  const bassMix = channelMix(project, "bass_808");
  const synthMix = channelMix(project, "synth");
  const outputGain = masterOutputGain(project);

  for (let bar = 0; bar < bars; bar += 1) {
    const barOffset = bar * 16;
    const arrangementBlock = project.arrangement[bar % project.arrangement.length];
    const pattern = arrangementBlock ? patternForSlot(project, arrangementBlock.pattern) : patternForSlot(project, project.selectedPattern);
    for (let patternStep = 0; patternStep < 16; patternStep += 1) {
      const time = (barOffset + patternStep) * step;
      if (pattern.drumPattern.kick[patternStep]) {
        addSine(buffer, time, 0.22, 52, drumMix, 0.95);
        addSine(buffer, time, 0.08, 96, drumMix, 0.3);
      }
      if (pattern.drumPattern.clap[patternStep]) {
        addNoise(buffer, time, 0.16, drumMix, 0.42);
      }
      if (pattern.drumPattern.hat[patternStep]) {
        addNoise(buffer, time, 0.045, drumMix, 0.18);
      }
      if (pattern.drumPattern.perc[patternStep]) {
        addSine(buffer, time, 0.08, 330, drumMix, 0.18);
      }
    }
    for (const note of pattern.bassNotes) {
      addSine(buffer, (barOffset + note.step) * step, note.length * step, noteToFrequency(note.pitch), bassMix, 0.72);
    }
    for (const note of pattern.melodyNotes) {
      addSine(buffer, (barOffset + note.step) * step, note.length * step, noteToFrequency(note.pitch), synthMix, note.velocity * 0.22);
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

export function exportWav(project: ProjectState): void {
  const blob = encodeWav(renderProject(project));
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "grooveforge"}-demo.wav`;
  link.click();
  URL.revokeObjectURL(url);
}
