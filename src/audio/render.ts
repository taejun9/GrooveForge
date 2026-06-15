import { dbToGain, noteToFrequency, patternForSlot, projectStepDurationSeconds, ProjectState } from "../domain/workstation";

const sampleRate = 44100;
const channels = 2;
type AudioChannels = [Float32Array<ArrayBuffer>, Float32Array<ArrayBuffer>];

function stepDuration(project: ProjectState): number {
  return projectStepDurationSeconds(project);
}

function channelGain(project: ProjectState, id: string): number {
  const channel = project.mixer.find((track) => track.id === id);
  if (!channel || channel.muted) {
    return 0;
  }
  return dbToGain(channel.volumeDb);
}

function addSine(buffer: AudioChannels, start: number, duration: number, frequency: number, gain: number): void {
  const startFrame = Math.max(0, Math.floor(start * sampleRate));
  const frames = Math.max(1, Math.floor(duration * sampleRate));
  for (let index = 0; index < frames && startFrame + index < buffer[0].length; index += 1) {
    const t = index / sampleRate;
    const envelope = Math.exp(-5 * t / duration);
    const value = Math.sin(2 * Math.PI * frequency * t) * gain * envelope;
    buffer[0][startFrame + index] += value;
    buffer[1][startFrame + index] += value;
  }
}

function addNoise(buffer: AudioChannels, start: number, duration: number, gain: number): void {
  const startFrame = Math.max(0, Math.floor(start * sampleRate));
  const frames = Math.max(1, Math.floor(duration * sampleRate));
  for (let index = 0; index < frames && startFrame + index < buffer[0].length; index += 1) {
    const t = index / sampleRate;
    const envelope = Math.exp(-8 * t / duration);
    const value = (Math.random() * 2 - 1) * gain * envelope;
    buffer[0][startFrame + index] += value;
    buffer[1][startFrame + index] += value;
  }
}

function renderProject(project: ProjectState, bars = 8): AudioChannels {
  const step = stepDuration(project);
  const totalSteps = bars * 16;
  const duration = totalSteps * step;
  const frames = Math.ceil(duration * sampleRate);
  const buffer: AudioChannels = [new Float32Array(frames), new Float32Array(frames)];
  const drumGain = channelGain(project, "drum_rack");
  const bassGain = channelGain(project, "bass_808");
  const synthGain = channelGain(project, "synth");

  for (let bar = 0; bar < bars; bar += 1) {
    const barOffset = bar * 16;
    const arrangementBlock = project.arrangement[bar % project.arrangement.length];
    const pattern = arrangementBlock ? patternForSlot(project, arrangementBlock.pattern) : patternForSlot(project, project.selectedPattern);
    for (let patternStep = 0; patternStep < 16; patternStep += 1) {
      const time = (barOffset + patternStep) * step;
      if (pattern.drumPattern.kick[patternStep]) {
        addSine(buffer, time, 0.22, 52, 0.95 * drumGain);
        addSine(buffer, time, 0.08, 96, 0.3 * drumGain);
      }
      if (pattern.drumPattern.clap[patternStep]) {
        addNoise(buffer, time, 0.16, 0.42 * drumGain);
      }
      if (pattern.drumPattern.hat[patternStep]) {
        addNoise(buffer, time, 0.045, 0.18 * drumGain);
      }
      if (pattern.drumPattern.perc[patternStep]) {
        addSine(buffer, time, 0.08, 330, 0.18 * drumGain);
      }
    }
    for (const note of pattern.bassNotes) {
      addSine(buffer, (barOffset + note.step) * step, note.length * step, noteToFrequency(note.pitch), 0.72 * bassGain);
    }
    for (const note of pattern.melodyNotes) {
      addSine(buffer, (barOffset + note.step) * step, note.length * step, noteToFrequency(note.pitch), note.velocity * 0.22 * synthGain);
    }
  }

  const ceiling = dbToGain(project.masterCeilingDb);
  for (let channel = 0; channel < channels; channel += 1) {
    for (let index = 0; index < buffer[channel].length; index += 1) {
      buffer[channel][index] = Math.max(-ceiling, Math.min(ceiling, buffer[channel][index]));
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
