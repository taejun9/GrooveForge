import {
  arrangementBlockMutesTrack,
  arrangementEnergyGain,
  arrangementTotalBars,
  audibleMixerChannelIds,
  chordEventShouldPlay,
  chordPitches,
  dbToGain,
  drumStepTimingMs,
  drumStepVelocity,
  drumStepShouldPlay,
  hatRepeatCount,
  noteEventShouldPlay,
  noteToFrequency,
  masterAutomationGainForEvents,
  projectFileStem,
  projectStepDurationSeconds,
  normalizeArrangementBars,
  normalizeMixerChannelTopology,
  normalizePatternEventCollections,
  normalizePatternEventLength,
  normalizeProjectAutomationEvents,
  normalizeSoundDesignControls,
  sidechainGainForStep,
} from "../domain/workstation";
import type { ArrangementBlock, ArrangementMuteTrack, ProjectState, SoundDesign, TrackType } from "../domain/workstation";
import { downloadBlob } from "../platform/downloads";

const sampleRate = 44100;
const channels = 2;
const renderNoiseSeedSalt = 0x47524647;
const minimumExportTailSeconds = 0.75;
const exportTailSteps = 6;
const terminalFadeSeconds = 0.08;
export const stemTrackIds = ["drum_rack", "bass_808", "synth", "chord"] as const;
export type StemTrackId = (typeof stemTrackIds)[number];
export type ExportAnalysis = {
  sampleRate: number;
  channels: number;
  durationSeconds: number;
  peakDb: number;
  rmsDb: number;
  headroomDb: number;
  ceilingDb: number;
  limitedSamples: number;
  limitedPercent: number;
  status: "Ready" | "Hot" | "Limiter active" | "Silent";
};
export type StemExportAnalyses = Record<StemTrackId, ExportAnalysis>;

type AudioChannels = [Float32Array<ArrayBuffer>, Float32Array<ArrayBuffer>];
type RenderedAudio = {
  buffer: AudioChannels;
  analysis: ExportAnalysis;
};
type ChannelMix = {
  gain: number;
  left: number;
  right: number;
  lowCut: number;
  air: number;
  drive: number;
  glue: number;
  send: number;
};
type RenderNoiseSeed = (start: number, duration: number, brightness: number) => number;

function stepDuration(project: ProjectState): number {
  return projectStepDurationSeconds(project);
}

export function exportTailDurationSeconds(project: ProjectState): number {
  // Six tempo-scaled steps cover the longest current event overhang; the floor keeps fast projects safe for Space feedback.
  return Math.max(minimumExportTailSeconds, stepDuration(project) * exportTailSteps);
}

function hasSolo(project: ProjectState): boolean {
  return project.mixer.some(
    (track) => audibleMixerChannelIds.includes(track.id as (typeof audibleMixerChannelIds)[number]) && track.solo
  );
}

function channelMix(project: ProjectState, id: TrackType, stemTarget?: StemTrackId): ChannelMix {
  const channel = project.mixer.find((track) => track.id === id);
  if (stemTarget && id !== stemTarget) {
    return { gain: 0, left: 0, right: 0, lowCut: 0, air: 0, drive: 0, glue: 0, send: 0 };
  }
  const soloActive = hasSolo(project);
  if (!channel || (!stemTarget && channel.muted) || (!stemTarget && id !== "master" && soloActive && !channel.solo)) {
    return { gain: 0, left: 0, right: 0, lowCut: 0, air: 0, drive: 0, glue: 0, send: 0 };
  }

  const normalizedPan = Math.max(-1, Math.min(1, channel.pan / 100));
  return {
    gain: dbToGain(channel.volumeDb),
    left: normalizedPan <= 0 ? 1 : 1 - normalizedPan,
    right: normalizedPan >= 0 ? 1 : 1 + normalizedPan,
    lowCut: channel.lowCut,
    air: channel.air,
    drive: channel.drive,
    glue: channel.glue,
    send: id === "master" ? 0 : channel.send
  };
}

function masterOutputGain(project: ProjectState): number {
  return channelMix(project, "master").gain;
}

function mutedChannelMix(mix: ChannelMix): ChannelMix {
  return { ...mix, gain: 0 };
}

function arrangementChannelMix(mix: ChannelMix, block: ArrangementBlock | undefined, track: ArrangementMuteTrack): ChannelMix {
  return arrangementBlockMutesTrack(block, track) ? mutedChannelMix(mix) : mix;
}

function arrangementBarCount(project: ProjectState): number {
  return Math.max(1, arrangementTotalBars(project));
}

function arrangementBlockForBar(project: ProjectState, bar: number): ArrangementBlock | undefined {
  let cursor = 0;
  for (const block of project.arrangement) {
    const blockBars = normalizeArrangementBars(block.bars);
    if (bar < cursor + blockBars) {
      return block;
    }
    cursor += blockBars;
  }
  return project.arrangement.at(-1);
}

type ToneShape = "sine" | "triangle" | "saw" | "square";

function channelHighpassHz(mix: ChannelMix): number {
  return mix.lowCut <= 0 ? 18 : 30 + mix.lowCut * 260;
}

function toneEqFactor(frequency: number, mix: ChannelMix): number {
  const highpassHz = channelHighpassHz(mix);
  const lowCutFactor = frequency < highpassHz ? Math.max(0.16, frequency / highpassHz) : 1;
  const airFactor = 1 + mix.air * (frequency > 700 ? 0.22 : frequency > 180 ? 0.08 : -0.04);
  return Math.max(0.08, lowCutFactor * airFactor);
}

function channelDriveSample(sample: number, mix: ChannelMix): number {
  if (mix.drive <= 0) {
    return sample;
  }

  const drive = 1 + mix.drive * 3.4;
  const normalizer = Math.tanh(drive);
  return normalizer === 0 ? sample : Math.tanh(sample * drive) / normalizer;
}

function channelGlueSample(sample: number, mix: ChannelMix): number {
  if (mix.glue <= 0) {
    return sample;
  }

  const sign = sample < 0 ? -1 : 1;
  const absolute = Math.abs(sample);
  const threshold = 0.22 - mix.glue * 0.08;
  const ratio = 1 + mix.glue * 5.2;
  const compressed = absolute <= threshold ? absolute : threshold + (absolute - threshold) / ratio;
  return sign * compressed * (1 + mix.glue * 0.1);
}

function spaceSendMix(mix: ChannelMix): ChannelMix {
  if (mix.gain <= 0 || mix.send <= 0) {
    return { ...mix, gain: 0 };
  }
  return {
    ...mix,
    gain: mix.gain * mix.send * 0.58,
    left: Math.max(0, Math.min(1, mix.left + mix.send * 0.08)),
    right: Math.max(0, Math.min(1, mix.right + mix.send * 0.08)),
    lowCut: Math.max(mix.lowCut, 0.18),
    air: Math.min(1, mix.air + 0.18),
    drive: mix.drive * 0.35,
    glue: mix.glue * 0.45,
    send: 0
  };
}

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
  const drive = Math.min(1, (tone.drive ?? 0) + mix.drive * 0.48);
  const decay = tone.decay ?? 5;
  const filter = tone.filter ?? 1;
  const eqFactor = toneEqFactor(frequency, mix);
  for (let index = 0; index < frames && startFrame + index < buffer[0].length; index += 1) {
    const t = index / sampleRate;
    const envelope = Math.exp(-decay * t / Math.max(0.01, duration));
    const phase = 2 * Math.PI * frequency * t;
    const fundamental = waveform(shape, phase);
    const harmonic = Math.sin(phase * 2) * drive * 0.28 + Math.sin(phase * 3) * drive * 0.12;
    const shaped = Math.tanh((fundamental + harmonic) * (1 + drive * 2.8));
    const value = channelGlueSample(shaped * mix.gain * gainScale * envelope * filter * eqFactor, mix);
    buffer[0][startFrame + index] += value * mix.left;
    buffer[1][startFrame + index] += value * mix.right;
  }
}

function addToneWithSend(
  buffer: AudioChannels,
  sendBuffer: AudioChannels,
  start: number,
  duration: number,
  frequency: number,
  mix: ChannelMix,
  gainScale: number,
  shape: ToneShape,
  tone: { drive?: number; filter?: number; decay?: number } = {}
): void {
  addTone(buffer, start, duration, frequency, mix, gainScale, shape, tone);
  addTone(sendBuffer, start, duration * 1.08, frequency, spaceSendMix(mix), gainScale * 0.82, shape, {
    ...tone,
    decay: Math.max(2.2, (tone.decay ?? 4) * 0.76),
    filter: Math.min(1, (tone.filter ?? 1) + 0.08)
  });
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

function addNoise(
  buffer: AudioChannels,
  start: number,
  duration: number,
  mix: ChannelMix,
  gainScale: number,
  brightness = 0.5,
  noiseSeed = 0
): void {
  if (mix.gain <= 0) {
    return;
  }
  const startFrame = Math.max(0, Math.floor(start * sampleRate));
  const frames = Math.max(1, Math.floor(duration * sampleRate));
  let previous = 0;
  const airBrightness = Math.min(1, Math.max(0, brightness + mix.air * 0.2 + mix.lowCut * 0.06));
  const channelGain = (1 + mix.air * 0.14) * (1 - mix.lowCut * 0.08);
  for (let index = 0; index < frames && startFrame + index < buffer[0].length; index += 1) {
    const t = index / sampleRate;
    const envelope = Math.exp((-6 - airBrightness * 5) * t / duration);
    const raw = seededNoiseSample(noiseSeed, index);
    const saturated = channelDriveSample(raw * airBrightness + previous * (1 - airBrightness), mix);
    const value = channelGlueSample(saturated * mix.gain * gainScale * envelope * channelGain, mix);
    previous = raw;
    buffer[0][startFrame + index] += value * mix.left;
    buffer[1][startFrame + index] += value * mix.right;
  }
}

function addNoiseWithSend(
  buffer: AudioChannels,
  sendBuffer: AudioChannels,
  start: number,
  duration: number,
  mix: ChannelMix,
  gainScale: number,
  brightness = 0.5,
  noiseSeed = 0
): void {
  addNoise(buffer, start, duration, mix, gainScale, brightness, noiseSeed);
  addNoise(sendBuffer, start, duration * 1.12, spaceSendMix(mix), gainScale * 0.7, Math.min(1, brightness + 0.16), noiseSeed);
}

function applySpaceReturn(buffer: AudioChannels, sendBuffer: AudioChannels): void {
  const delayLeft = Math.floor(sampleRate * 0.17);
  const delayRight = Math.floor(sampleRate * 0.23);
  const feedback = 0.34;
  const crossfeed = 0.44;
  const returnGain = 0.62;
  let dampedLeft = 0;
  let dampedRight = 0;

  for (let index = 0; index < sendBuffer[0].length; index += 1) {
    const inputLeft = sendBuffer[0][index];
    const inputRight = sendBuffer[1][index];
    const echoLeft = index >= delayLeft ? sendBuffer[1][index - delayLeft] * crossfeed : 0;
    const echoRight = index >= delayRight ? sendBuffer[0][index - delayRight] * crossfeed : 0;
    dampedLeft = dampedLeft * 0.58 + (inputLeft + echoLeft) * 0.42;
    dampedRight = dampedRight * 0.58 + (inputRight + echoRight) * 0.42;
    buffer[0][index] += (inputLeft * 0.18 + dampedLeft) * returnGain;
    buffer[1][index] += (inputRight * 0.18 + dampedRight) * returnGain;
    if (index + delayLeft < sendBuffer[0].length) {
      sendBuffer[0][index + delayLeft] += dampedRight * feedback;
    }
    if (index + delayRight < sendBuffer[1].length) {
      sendBuffer[1][index + delayRight] += dampedLeft * feedback;
    }
  }
}

function createRenderNoiseSeed(): RenderNoiseSeed {
  // Event-local inputs keep an unchanged noise source stable across unrelated project and mixer edits.
  let eventIndex = 0;

  return (start: number, duration: number, brightness: number) => {
    const seed = hashNumbers(
      renderNoiseSeedSalt,
      eventIndex,
      Math.max(0, Math.floor(start * sampleRate)),
      Math.max(1, Math.floor(duration * sampleRate)),
      Math.round(brightness * 1000)
    );
    eventIndex += 1;
    return seed;
  };
}

function seededNoiseSample(seed: number, index: number): number {
  return (hashNumbers(seed, index) / 0xffffffff) * 2 - 1;
}

function hashNumbers(...values: number[]): number {
  let hash = 2166136261;
  for (const value of values) {
    hash ^= value >>> 0;
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 2246822507);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 3266489909);
  hash ^= hash >>> 16;
  return hash >>> 0;
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

function terminalFadeGain(frame: number, frameCount: number): number {
  const fadeFrames = Math.max(2, Math.floor(terminalFadeSeconds * sampleRate));
  const fadeStart = Math.max(0, frameCount - fadeFrames);
  if (frame < fadeStart) {
    return 1;
  }
  return Math.max(0, Math.min(1, (frameCount - 1 - frame) / Math.max(1, frameCount - 1 - fadeStart)));
}

function renderProject(project: ProjectState, bars = arrangementBarCount(project), stemTarget?: StemTrackId): RenderedAudio {
  const normalizedMixer = normalizeMixerChannelTopology(project.mixer);
  const mixerProject = normalizedMixer === project.mixer ? project : { ...project, mixer: normalizedMixer };
  const step = stepDuration(project);
  const totalSteps = bars * 16;
  const musicalDuration = totalSteps * step;
  const duration = musicalDuration + exportTailDurationSeconds(project);
  const frames = Math.ceil(duration * sampleRate);
  const buffer: AudioChannels = [new Float32Array(frames), new Float32Array(frames)];
  const sendBuffer: AudioChannels = [new Float32Array(frames), new Float32Array(frames)];
  const baseDrumMix = channelMix(mixerProject, "drum_rack", stemTarget);
  const baseBassMix = channelMix(mixerProject, "bass_808", stemTarget);
  const baseSynthMix = channelMix(mixerProject, "synth", stemTarget);
  const baseChordMix = channelMix(mixerProject, "chord", stemTarget);
  const sound = normalizeSoundDesignControls(project.sound);
  const outputGain = masterOutputGain(mixerProject);
  const automationEvents = normalizeProjectAutomationEvents(project.automation);
  const normalizedPatterns = {
    A: normalizePatternEventCollections(project.patterns.A),
    B: normalizePatternEventCollections(project.patterns.B),
    C: normalizePatternEventCollections(project.patterns.C)
  };
  const nextNoiseSeed = createRenderNoiseSeed();

  for (let bar = 0; bar < bars; bar += 1) {
    const barOffset = bar * 16;
    const arrangementBlock = arrangementBlockForBar(project, bar);
    const pattern = normalizedPatterns[arrangementBlock?.pattern ?? project.selectedPattern];
    const energyGain = arrangementBlock ? arrangementEnergyGain(arrangementBlock.energy) : 1;
    const drumMix = arrangementChannelMix(baseDrumMix, arrangementBlock, "drum_rack");
    const bassMix = arrangementChannelMix(baseBassMix, arrangementBlock, "bass_808");
    const synthMix = arrangementChannelMix(baseSynthMix, arrangementBlock, "synth");
    const chordMix = arrangementChannelMix(baseChordMix, arrangementBlock, "chord");
    for (let patternStep = 0; patternStep < 16; patternStep += 1) {
      const absoluteStep = barOffset + patternStep;
      const time = (barOffset + patternStep) * step;
      if (drumStepShouldPlay(pattern, "kick", patternStep, absoluteStep)) {
        const velocity = drumStepVelocity(pattern, "kick", patternStep);
        const drumTime = time + drumStepTimingMs(pattern, "kick", patternStep) / 1000;
        addToneWithSend(buffer, sendBuffer, drumTime, 0.18 + sound.kickPunch * 0.1, 44 + sound.kickPunch * 10, drumMix, energyGain * (0.78 + sound.kickPunch * 0.24) * velocity, "sine", {
          decay: 4.8 - sound.kickPunch * 1.2
        });
        addToneWithSend(buffer, sendBuffer, drumTime, 0.06 + sound.kickPunch * 0.04, 82 + sound.kickPunch * 45, drumMix, energyGain * (0.2 + sound.kickPunch * 0.22) * velocity, "sine", {
          decay: 8
        });
      }
      if (drumStepShouldPlay(pattern, "clap", patternStep, absoluteStep)) {
        const drumTime = time + drumStepTimingMs(pattern, "clap", patternStep) / 1000;
        const drumDuration = 0.11 + (1 - sound.snareSnap) * 0.08;
        addNoiseWithSend(
          buffer,
          sendBuffer,
          drumTime,
          drumDuration,
          drumMix,
          energyGain * (0.28 + sound.snareSnap * 0.18) * drumStepVelocity(pattern, "clap", patternStep),
          sound.snareSnap,
          nextNoiseSeed(drumTime, drumDuration, sound.snareSnap)
        );
      }
      if (drumStepShouldPlay(pattern, "hat", patternStep, absoluteStep)) {
        const repeatCount = hatRepeatCount(pattern, patternStep);
        const velocity = drumStepVelocity(pattern, "hat", patternStep);
        const drumTime = time + drumStepTimingMs(pattern, "hat", patternStep) / 1000;
        const drumDuration = 0.035 + (1 - sound.hatBrightness) * 0.025;
        for (let repeatIndex = 0; repeatIndex < repeatCount; repeatIndex += 1) {
          const repeatTime = drumTime + (repeatIndex * step) / repeatCount;
          addNoiseWithSend(
            buffer,
            sendBuffer,
            repeatTime,
            drumDuration,
            drumMix,
            energyGain * (0.12 + sound.hatBrightness * 0.1) * velocity * (repeatIndex === 0 ? 1 : 0.72),
            sound.hatBrightness,
            nextNoiseSeed(repeatTime, drumDuration, sound.hatBrightness)
          );
        }
      }
      if (drumStepShouldPlay(pattern, "perc", patternStep, absoluteStep)) {
        const drumTime = time + drumStepTimingMs(pattern, "perc", patternStep) / 1000;
        addToneWithSend(buffer, sendBuffer, drumTime, 0.08, 260 + sound.snareSnap * 190, drumMix, energyGain * 0.16 * drumStepVelocity(pattern, "perc", patternStep), "triangle", {
          filter: 0.7 + sound.hatBrightness * 0.3
        });
      }
    }
    for (const note of pattern.bassNotes) {
      if (!noteEventShouldPlay("bass", note, barOffset + note.step)) {
        continue;
      }
      addToneWithSend(
        buffer,
        sendBuffer,
        (barOffset + note.step) * step,
        normalizePatternEventLength(note.length, note.step) * step * (0.74 + sound.bassDecay * 0.52),
        noteToFrequency(note.pitch),
        bassMix,
        energyGain *
          note.velocity *
          (0.52 + sound.bassDrive * 0.24) *
          sidechainGainForStep(pattern, note.step, sound.sidechainDuck, barOffset + note.step),
        bassShape(sound),
        { drive: sound.bassDrive, filter: 0.72 + sound.bassDrive * 0.28, decay: 3.8 - sound.bassDecay * 1.4 }
      );
    }
    for (const note of pattern.melodyNotes) {
      if (!noteEventShouldPlay("melody", note, barOffset + note.step)) {
        continue;
      }
      addToneWithSend(
        buffer,
        sendBuffer,
        (barOffset + note.step) * step,
        normalizePatternEventLength(note.length, note.step) * step * (0.8 + sound.synthRelease * 0.42),
        noteToFrequency(note.pitch),
        synthMix,
        energyGain * note.velocity * 0.22,
        synthShape(sound),
        { drive: sound.synthBrightness * 0.08, filter: 0.62 + sound.synthBrightness * 0.38, decay: 4.4 - sound.synthRelease * 1.8 }
      );
    }
    for (const chord of pattern.chordEvents) {
      if (!chordEventShouldPlay(chord, barOffset + chord.step)) {
        continue;
      }
      const pitches = chordPitches(chord);
      for (const [voiceIndex, pitch] of pitches.entries()) {
        const spread = pitches.length <= 1 ? 0 : (voiceIndex / (pitches.length - 1)) * 2 - 1;
        const voiceMix = {
          ...chordMix,
          left: Math.max(0, Math.min(1, chordMix.left - spread * sound.chordWidth * 0.28)),
          right: Math.max(0, Math.min(1, chordMix.right + spread * sound.chordWidth * 0.28))
        };
        addToneWithSend(
          buffer,
          sendBuffer,
          (barOffset + chord.step) * step,
          normalizePatternEventLength(chord.length, chord.step) * step * (0.9 + sound.synthRelease * 0.24),
          noteToFrequency(pitch),
          voiceMix,
          energyGain * chord.velocity * 0.14,
          "triangle",
          { drive: (1 - sound.chordWarmth) * 0.08, filter: 0.48 + (1 - sound.chordWarmth) * 0.42, decay: 3.8 - sound.synthRelease * 1.2 }
        );
      }
    }
  }

  applySpaceReturn(buffer, sendBuffer);

  const ceiling = dbToGain(project.masterCeilingDb);
  let peak = 0;
  let squareSum = 0;
  let limitedSamples = 0;
  const totalSamples = buffer[0].length * channels;
  for (let index = 0; index < buffer[0].length; index += 1) {
    const absoluteStep = (index / sampleRate) / step;
    const finalGain =
      outputGain *
      masterAutomationGainForEvents(automationEvents, absoluteStep) *
      terminalFadeGain(index, buffer[0].length);
    for (let channel = 0; channel < channels; channel += 1) {
      const value =
        buffer[channel][index] *
        finalGain;
      if (Math.abs(value) > ceiling) {
        limitedSamples += 1;
      }
      const limited = Math.max(-ceiling, Math.min(ceiling, value));
      const absolute = Math.abs(limited);
      peak = Math.max(peak, absolute);
      squareSum += limited * limited;
      buffer[channel][index] = limited;
    }
  }

  const peakDb = amplitudeToDb(peak);
  const rmsDb = amplitudeToDb(Math.sqrt(squareSum / Math.max(1, totalSamples)));
  const headroomDb = Number.isFinite(peakDb) ? project.masterCeilingDb - peakDb : 99;
  const limitedPercent = (limitedSamples / Math.max(1, totalSamples)) * 100;
  const status =
    peak === 0 ? "Silent" : limitedSamples > 0 ? "Limiter active" : headroomDb < 1 ? "Hot" : "Ready";

  return {
    buffer,
    analysis: {
      sampleRate,
      channels,
      durationSeconds: frames / sampleRate,
      peakDb,
      rmsDb,
      headroomDb,
      ceilingDb: project.masterCeilingDb,
      limitedSamples,
      limitedPercent,
      status
    }
  };
}

function amplitudeToDb(value: number): number {
  if (value <= 0) {
    return Number.NEGATIVE_INFINITY;
  }
  return 20 * Math.log10(value);
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

export function mixWavFileName(project: ProjectState): string {
  return `${projectFileStem(project)}-demo.wav`;
}

export function stemWavFileNames(project: ProjectState): string[] {
  const stem = projectFileStem(project);
  return stemTrackIds.map((track) => `${stem}-${track.replace("_", "-")}-stem.wav`);
}

function downloadWavBlob(blob: Blob, fileName: string): void {
  downloadBlob(blob, fileName);
}

export function createMixWavBlob(project: ProjectState): Blob {
  return encodeWav(renderProject(project).buffer);
}

export function createStemWavBlob(project: ProjectState, stemTarget: StemTrackId): Blob {
  return encodeWav(renderProject(project, arrangementBarCount(project), stemTarget).buffer);
}

export function exportWav(project: ProjectState): void {
  downloadWavBlob(createMixWavBlob(project), mixWavFileName(project));
}

export function exportStems(project: ProjectState): string[] {
  const fileNames = stemWavFileNames(project);
  fileNames.forEach((fileName, index) => {
    const track = stemTrackIds[index];
    downloadWavBlob(createStemWavBlob(project, track), fileName);
  });
  return fileNames;
}

export function analyzeExport(project: ProjectState): ExportAnalysis {
  return renderProject(project).analysis;
}

export function analyzeStemExports(project: ProjectState): StemExportAnalyses {
  return stemTrackIds.reduce<StemExportAnalyses>(
    (analyses, track) => ({
      ...analyses,
      [track]: renderProject(project, arrangementBarCount(project), track).analysis
    }),
    {} as StemExportAnalyses
  );
}
