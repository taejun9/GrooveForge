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
  projectStepStartSeconds,
  projectStepDurationSeconds,
  normalizeArrangementBars,
  normalizeMixerChannelTopology,
  normalizePatternEventCollections,
  normalizePatternEventLength,
  normalizeProjectAutomationEvents,
  normalizeSoundDesignControls,
  projectMasterCeilingDb,
  sidechainGainForStep,
} from "../domain/workstation";
import type { ArrangementBlock, ArrangementMuteTrack, ProjectState, SoundDesign, TrackType } from "../domain/workstation";
import { downloadBlob } from "../platform/downloads";
import { bassGlideProfile, bassVoiceProfileForProject } from "./bassVoice";
import type { BassGlideProfile, BassVoiceProfile } from "./bassVoice";

export const wavSampleRate = 44100;
export const wavChannels = 2;
export const wavBitDepth = 24;
const sampleRate = wavSampleRate;
const channels = wavChannels;
const renderNoiseSeedSalt = 0x47524647;
const minimumExportTailSeconds = 0.75;
const exportTailSteps = 6;
const terminalFadeSeconds = 0.08;
export const stemTrackIds = ["drum_rack", "bass_808", "synth", "chord"] as const;
export type StemTrackId = (typeof stemTrackIds)[number];
export type ExportAnalysis = {
  sampleRate: number;
  channels: number;
  bitDepth: number;
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
type RenderWorkspace = {
  buffer: AudioChannels;
  sendBuffer: AudioChannels;
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
type ToneOptions = {
  drive?: number;
  filter?: number;
  decay?: number;
  startFrequency?: number;
  glideDuration?: number;
};

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
  tone: ToneOptions = {},
  mirrorBuffer?: AudioChannels
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
    const startFrequency = tone.startFrequency ?? frequency;
    const glideDuration = Math.max(0, Math.min(duration, tone.glideDuration ?? 0));
    const phase = glideDuration > 0 && t < glideDuration
      ? 2 * Math.PI * (startFrequency * t + ((frequency - startFrequency) * t * t) / (2 * glideDuration))
      : 2 * Math.PI * (((startFrequency + frequency) * glideDuration) / 2 + frequency * (t - glideDuration));
    const fundamental = waveform(shape, phase);
    const harmonic = Math.sin(phase * 2) * drive * 0.28 + Math.sin(phase * 3) * drive * 0.12;
    const shaped = Math.tanh((fundamental + harmonic) * (1 + drive * 2.8));
    const value = channelGlueSample(shaped * mix.gain * gainScale * envelope * filter * eqFactor, mix);
    buffer[0][startFrame + index] += value * mix.left;
    buffer[1][startFrame + index] += value * mix.right;
    if (mirrorBuffer) {
      mirrorBuffer[0][startFrame + index] += value * mix.left;
      mirrorBuffer[1][startFrame + index] += value * mix.right;
    }
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
  tone: ToneOptions = {},
  mirrorBuffer?: AudioChannels,
  mirrorSendBuffer?: AudioChannels
): void {
  addTone(buffer, start, duration, frequency, mix, gainScale, shape, tone, mirrorBuffer);
  addTone(sendBuffer, start, duration * 1.08, frequency, spaceSendMix(mix), gainScale * 0.82, shape, {
    ...tone,
    decay: Math.max(2.2, (tone.decay ?? 4) * 0.76),
    filter: Math.min(1, (tone.filter ?? 1) + 0.08)
  }, mirrorSendBuffer);
}

function addBassToneWithSend(
  buffer: AudioChannels,
  sendBuffer: AudioChannels,
  start: number,
  duration: number,
  frequency: number,
  mix: ChannelMix,
  gainScale: number,
  voice: BassVoiceProfile,
  glide: BassGlideProfile | null,
  mirrorBuffer?: AudioChannels,
  mirrorSendBuffer?: AudioChannels
): void {
  const tone: ToneOptions = {
    drive: voice.drive,
    filter: Math.max(0.42, Math.min(1, voice.filterHz / 3200)),
    decay: voice.decay,
    startFrequency: glide?.startFrequency,
    glideDuration: glide?.durationSeconds
  };
  addToneWithSend(
    buffer,
    sendBuffer,
    start,
    duration,
    frequency,
    mix,
    gainScale,
    voice.waveform,
    tone,
    mirrorBuffer,
    mirrorSendBuffer
  );
  if (voice.detuneRatio) {
    const detunedMix = {
      ...mix,
      left: Math.max(0, Math.min(1, mix.left * 0.94)),
      right: Math.max(0, Math.min(1, mix.right + 0.06))
    };
    addToneWithSend(
      buffer,
      sendBuffer,
      start,
      duration,
      frequency * voice.detuneRatio,
      detunedMix,
      gainScale * 0.38,
      voice.waveform,
      {
        ...tone,
        startFrequency: tone.startFrequency ? tone.startFrequency * voice.detuneRatio : undefined
      },
      mirrorBuffer,
      mirrorSendBuffer
    );
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

function addNoise(
  buffer: AudioChannels,
  start: number,
  duration: number,
  mix: ChannelMix,
  gainScale: number,
  brightness = 0.5,
  noiseSeed = 0,
  mirrorBuffer?: AudioChannels
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
    if (mirrorBuffer) {
      mirrorBuffer[0][startFrame + index] += value * mix.left;
      mirrorBuffer[1][startFrame + index] += value * mix.right;
    }
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
  noiseSeed = 0,
  mirrorBuffer?: AudioChannels,
  mirrorSendBuffer?: AudioChannels
): void {
  addNoise(buffer, start, duration, mix, gainScale, brightness, noiseSeed, mirrorBuffer);
  addNoise(
    sendBuffer,
    start,
    duration * 1.12,
    spaceSendMix(mix),
    gainScale * 0.7,
    Math.min(1, brightness + 0.16),
    noiseSeed,
    mirrorSendBuffer
  );
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

function finalizeRenderedBuffer(
  project: ProjectState,
  buffer: AudioChannels,
  outputGain: number,
  automationEvents: ProjectState["automation"]
): ExportAnalysis {
  const ceilingDb = projectMasterCeilingDb(project);
  const ceiling = dbToGain(ceilingDb);
  const projectStep = stepDuration(project);
  let peak = 0;
  let squareSum = 0;
  let limitedSamples = 0;
  const totalSamples = buffer[0].length * channels;
  for (let index = 0; index < buffer[0].length; index += 1) {
    const absoluteStep = (index / sampleRate) / projectStep;
    const finalGain =
      outputGain *
      masterAutomationGainForEvents(automationEvents, absoluteStep) *
      terminalFadeGain(index, buffer[0].length);
    for (let channel = 0; channel < channels; channel += 1) {
      const value = buffer[channel][index] * finalGain;
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
  const headroomDb = Number.isFinite(peakDb) ? ceilingDb - peakDb : 99;
  const limitedPercent = (limitedSamples / Math.max(1, totalSamples)) * 100;
  const status =
    peak === 0 ? "Silent" : limitedSamples > 0 ? "Limiter active" : headroomDb < 1 ? "Hot" : "Ready";

  return {
    sampleRate,
    channels,
    bitDepth: wavBitDepth,
    durationSeconds: buffer[0].length / sampleRate,
    peakDb,
    rmsDb,
    headroomDb,
    ceilingDb,
    limitedSamples,
    limitedPercent,
    status
  };
}

function renderProject(
  project: ProjectState,
  bars = arrangementBarCount(project),
  stemTarget?: StemTrackId,
  workspace?: RenderWorkspace
): RenderedAudio {
  const normalizedMixer = normalizeMixerChannelTopology(project.mixer);
  const mixerProject = normalizedMixer === project.mixer ? project : { ...project, mixer: normalizedMixer };
  const step = stepDuration(project);
  const totalSteps = bars * 16;
  const musicalDuration = totalSteps * step;
  const duration = musicalDuration + exportTailDurationSeconds(project);
  const frames = Math.ceil(duration * sampleRate);
  const buffer: AudioChannels = workspace?.buffer ?? [new Float32Array(frames), new Float32Array(frames)];
  const sendBuffer: AudioChannels = workspace?.sendBuffer ?? [new Float32Array(frames), new Float32Array(frames)];
  if (workspace) {
    for (const channel of [...buffer, ...sendBuffer]) {
      if (channel.length !== frames) {
        throw new RangeError("Project export analysis workspace frame count mismatch");
      }
      channel.fill(0);
    }
  }
  const baseDrumMix = channelMix(mixerProject, "drum_rack", stemTarget);
  const baseBassMix = channelMix(mixerProject, "bass_808", stemTarget);
  const baseSynthMix = channelMix(mixerProject, "synth", stemTarget);
  const baseChordMix = channelMix(mixerProject, "chord", stemTarget);
  const sound = normalizeSoundDesignControls(project.sound);
  const bassVoice = bassVoiceProfileForProject(project, sound);
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
      const time = projectStepStartSeconds(project, absoluteStep);
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
    for (const [noteIndex, note] of pattern.bassNotes.entries()) {
      const absoluteStep = barOffset + note.step;
      if (!noteEventShouldPlay("bass", note, absoluteStep)) {
        continue;
      }
      const duration = normalizePatternEventLength(note.length, note.step) * step * (0.74 + sound.bassDecay * 0.52) * bassVoice.durationScale;
      const glide = bassGlideProfile(pattern.bassNotes, noteIndex, duration, step);
      addBassToneWithSend(
        buffer,
        sendBuffer,
        projectStepStartSeconds(project, absoluteStep),
        duration,
        noteToFrequency(note.pitch),
        bassMix,
        energyGain *
          note.velocity *
          (0.52 + sound.bassDrive * 0.24) * bassVoice.gainScale *
          sidechainGainForStep(pattern, note.step, sound.sidechainDuck, absoluteStep),
        bassVoice,
        glide
      );
    }
    for (const note of pattern.melodyNotes) {
      const absoluteStep = barOffset + note.step;
      if (!noteEventShouldPlay("melody", note, absoluteStep)) {
        continue;
      }
      addToneWithSend(
        buffer,
        sendBuffer,
        projectStepStartSeconds(project, absoluteStep),
        normalizePatternEventLength(note.length, note.step) * step * (0.8 + sound.synthRelease * 0.42),
        noteToFrequency(note.pitch),
        synthMix,
        energyGain * note.velocity * 0.22,
        synthShape(sound),
        { drive: sound.synthBrightness * 0.08, filter: 0.62 + sound.synthBrightness * 0.38, decay: 4.4 - sound.synthRelease * 1.8 }
      );
    }
    for (const chord of pattern.chordEvents) {
      const absoluteStep = barOffset + chord.step;
      if (!chordEventShouldPlay(chord, absoluteStep)) {
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
          projectStepStartSeconds(project, absoluteStep),
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
  const analysis = finalizeRenderedBuffer(project, buffer, outputGain, automationEvents);

  return {
    buffer,
    analysis
  };
}

type ProjectExportAnalyses = {
  mix: ExportAnalysis;
  stems: StemExportAnalyses;
};

export type ProjectExportAnalysisStrategy = "combined" | "bounded-sequential";

/**
 * PCM working-set ceiling for project meter analysis. The current valid
 * 64-bar/60 BPM maximum needs 181,692,000 bytes in the bounded path, leaving
 * headroom below this cap while preventing the 908,460,000-byte combined path.
 */
export const projectExportAnalysisPeakByteCap = 192 * 1024 * 1024;

const combinedAnalysisFloat32Arrays = (stemTrackIds.length + 1) * channels * 2;
const boundedAnalysisFloat32Arrays = channels * 2;

function projectExportAnalysisFrameCount(project: ProjectState): number {
  const bars = arrangementBarCount(project);
  const musicalDuration = bars * 16 * stepDuration(project);
  return Math.ceil((musicalDuration + exportTailDurationSeconds(project)) * sampleRate);
}

function analysisStrategyPeakBytes(project: ProjectState, strategy: ProjectExportAnalysisStrategy): number {
  const float32ArrayCount = strategy === "combined" ? combinedAnalysisFloat32Arrays : boundedAnalysisFloat32Arrays;
  return projectExportAnalysisFrameCount(project) * Float32Array.BYTES_PER_ELEMENT * float32ArrayCount;
}

/** Returns the automatic analysis path without allocating any PCM buffers. */
export function projectExportAnalysisStrategy(project: ProjectState): ProjectExportAnalysisStrategy {
  return analysisStrategyPeakBytes(project, "combined") <= projectExportAnalysisPeakByteCap
    ? "combined"
    : "bounded-sequential";
}

/** Returns the estimated concurrently reachable PCM bytes for the selected path. */
export function estimatedPeakBytes(
  project: ProjectState,
  strategy: ProjectExportAnalysisStrategy = projectExportAnalysisStrategy(project)
): number {
  return analysisStrategyPeakBytes(project, strategy);
}

type StemAnalysisTarget = {
  buffer: AudioChannels;
  sendBuffer: AudioChannels;
  baseMix: ChannelMix;
};

/**
 * Computes the full-mix and four exact stem meters in one musical-event pass.
 * A track's full-mix contribution is identical to its stem contribution unless
 * mute/solo excludes it, so waveform samples can be mirrored without running
 * the oscillator/noise loop twice. Export/WAV render entry points intentionally
 * remain on the established single-target renderer below.
 */
function analyzeProjectExportsCombined(project: ProjectState): ProjectExportAnalyses {
  const bars = arrangementBarCount(project);
  const normalizedMixer = normalizeMixerChannelTopology(project.mixer);
  const mixerProject = normalizedMixer === project.mixer ? project : { ...project, mixer: normalizedMixer };
  const projectStep = stepDuration(project);
  const totalSteps = bars * 16;
  const musicalDuration = totalSteps * projectStep;
  const duration = musicalDuration + exportTailDurationSeconds(project);
  const frames = Math.ceil(duration * sampleRate);
  const createChannels = (): AudioChannels => [new Float32Array(frames), new Float32Array(frames)];
  const mixBuffer = createChannels();
  const mixSendBuffer = createChannels();
  const stemTargets = Object.fromEntries(
    stemTrackIds.map((track) => [
      track,
      {
        buffer: createChannels(),
        sendBuffer: createChannels(),
        baseMix: channelMix(mixerProject, track, track)
      }
    ])
  ) as Record<StemTrackId, StemAnalysisTarget>;
  const fullBaseMixes: Record<StemTrackId, ChannelMix> = {
    drum_rack: channelMix(mixerProject, "drum_rack"),
    bass_808: channelMix(mixerProject, "bass_808"),
    synth: channelMix(mixerProject, "synth"),
    chord: channelMix(mixerProject, "chord")
  };
  const sound = normalizeSoundDesignControls(project.sound);
  const bassVoice = bassVoiceProfileForProject(project, sound);
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
    const drumTarget = stemTargets.drum_rack;
    const bassTarget = stemTargets.bass_808;
    const synthTarget = stemTargets.synth;
    const chordTarget = stemTargets.chord;
    const drumMix = arrangementChannelMix(drumTarget.baseMix, arrangementBlock, "drum_rack");
    const bassMix = arrangementChannelMix(bassTarget.baseMix, arrangementBlock, "bass_808");
    const synthMix = arrangementChannelMix(synthTarget.baseMix, arrangementBlock, "synth");
    const chordMix = arrangementChannelMix(chordTarget.baseMix, arrangementBlock, "chord");
    const mirrorFor = (track: StemTrackId): AudioChannels | undefined =>
      arrangementChannelMix(fullBaseMixes[track], arrangementBlock, track).gain > 0 ? mixBuffer : undefined;
    const mirrorSendFor = (track: StemTrackId): AudioChannels | undefined =>
      arrangementChannelMix(fullBaseMixes[track], arrangementBlock, track).gain > 0 ? mixSendBuffer : undefined;
    const drumMirrors = mirrorFor("drum_rack");
    const drumSendMirrors = mirrorSendFor("drum_rack");
    const bassMirrors = mirrorFor("bass_808");
    const bassSendMirrors = mirrorSendFor("bass_808");
    const synthMirrors = mirrorFor("synth");
    const synthSendMirrors = mirrorSendFor("synth");
    const chordMirrors = mirrorFor("chord");
    const chordSendMirrors = mirrorSendFor("chord");

    for (let patternStep = 0; patternStep < 16; patternStep += 1) {
      const absoluteStep = barOffset + patternStep;
      const time = projectStepStartSeconds(project, absoluteStep);
      if (drumStepShouldPlay(pattern, "kick", patternStep, absoluteStep)) {
        const velocity = drumStepVelocity(pattern, "kick", patternStep);
        const drumTime = time + drumStepTimingMs(pattern, "kick", patternStep) / 1000;
        addToneWithSend(
          drumTarget.buffer,
          drumTarget.sendBuffer,
          drumTime,
          0.18 + sound.kickPunch * 0.1,
          44 + sound.kickPunch * 10,
          drumMix,
          energyGain * (0.78 + sound.kickPunch * 0.24) * velocity,
          "sine",
          { decay: 4.8 - sound.kickPunch * 1.2 },
          drumMirrors,
          drumSendMirrors
        );
        addToneWithSend(
          drumTarget.buffer,
          drumTarget.sendBuffer,
          drumTime,
          0.06 + sound.kickPunch * 0.04,
          82 + sound.kickPunch * 45,
          drumMix,
          energyGain * (0.2 + sound.kickPunch * 0.22) * velocity,
          "sine",
          { decay: 8 },
          drumMirrors,
          drumSendMirrors
        );
      }
      if (drumStepShouldPlay(pattern, "clap", patternStep, absoluteStep)) {
        const drumTime = time + drumStepTimingMs(pattern, "clap", patternStep) / 1000;
        const drumDuration = 0.11 + (1 - sound.snareSnap) * 0.08;
        addNoiseWithSend(
          drumTarget.buffer,
          drumTarget.sendBuffer,
          drumTime,
          drumDuration,
          drumMix,
          energyGain * (0.28 + sound.snareSnap * 0.18) * drumStepVelocity(pattern, "clap", patternStep),
          sound.snareSnap,
          nextNoiseSeed(drumTime, drumDuration, sound.snareSnap),
          drumMirrors,
          drumSendMirrors
        );
      }
      if (drumStepShouldPlay(pattern, "hat", patternStep, absoluteStep)) {
        const repeatCount = hatRepeatCount(pattern, patternStep);
        const velocity = drumStepVelocity(pattern, "hat", patternStep);
        const drumTime = time + drumStepTimingMs(pattern, "hat", patternStep) / 1000;
        const drumDuration = 0.035 + (1 - sound.hatBrightness) * 0.025;
        for (let repeatIndex = 0; repeatIndex < repeatCount; repeatIndex += 1) {
          const repeatTime = drumTime + (repeatIndex * projectStep) / repeatCount;
          addNoiseWithSend(
            drumTarget.buffer,
            drumTarget.sendBuffer,
            repeatTime,
            drumDuration,
            drumMix,
            energyGain * (0.12 + sound.hatBrightness * 0.1) * velocity * (repeatIndex === 0 ? 1 : 0.72),
            sound.hatBrightness,
            nextNoiseSeed(repeatTime, drumDuration, sound.hatBrightness),
            drumMirrors,
            drumSendMirrors
          );
        }
      }
      if (drumStepShouldPlay(pattern, "perc", patternStep, absoluteStep)) {
        const drumTime = time + drumStepTimingMs(pattern, "perc", patternStep) / 1000;
        addToneWithSend(
          drumTarget.buffer,
          drumTarget.sendBuffer,
          drumTime,
          0.08,
          260 + sound.snareSnap * 190,
          drumMix,
          energyGain * 0.16 * drumStepVelocity(pattern, "perc", patternStep),
          "triangle",
          { filter: 0.7 + sound.hatBrightness * 0.3 },
          drumMirrors,
          drumSendMirrors
        );
      }
    }

    for (const [noteIndex, note] of pattern.bassNotes.entries()) {
      const absoluteStep = barOffset + note.step;
      if (!noteEventShouldPlay("bass", note, absoluteStep)) {
        continue;
      }
      const noteDuration =
        normalizePatternEventLength(note.length, note.step) *
        projectStep *
        (0.74 + sound.bassDecay * 0.52) *
        bassVoice.durationScale;
      const glide = bassGlideProfile(pattern.bassNotes, noteIndex, noteDuration, projectStep);
      addBassToneWithSend(
        bassTarget.buffer,
        bassTarget.sendBuffer,
        projectStepStartSeconds(project, absoluteStep),
        noteDuration,
        noteToFrequency(note.pitch),
        bassMix,
        energyGain *
          note.velocity *
          (0.52 + sound.bassDrive * 0.24) *
          bassVoice.gainScale *
          sidechainGainForStep(pattern, note.step, sound.sidechainDuck, absoluteStep),
        bassVoice,
        glide,
        bassMirrors,
        bassSendMirrors
      );
    }
    for (const note of pattern.melodyNotes) {
      const absoluteStep = barOffset + note.step;
      if (!noteEventShouldPlay("melody", note, absoluteStep)) {
        continue;
      }
      addToneWithSend(
        synthTarget.buffer,
        synthTarget.sendBuffer,
        projectStepStartSeconds(project, absoluteStep),
        normalizePatternEventLength(note.length, note.step) * projectStep * (0.8 + sound.synthRelease * 0.42),
        noteToFrequency(note.pitch),
        synthMix,
        energyGain * note.velocity * 0.22,
        synthShape(sound),
        {
          drive: sound.synthBrightness * 0.08,
          filter: 0.62 + sound.synthBrightness * 0.38,
          decay: 4.4 - sound.synthRelease * 1.8
        },
        synthMirrors,
        synthSendMirrors
      );
    }
    for (const chord of pattern.chordEvents) {
      const absoluteStep = barOffset + chord.step;
      if (!chordEventShouldPlay(chord, absoluteStep)) {
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
          chordTarget.buffer,
          chordTarget.sendBuffer,
          projectStepStartSeconds(project, absoluteStep),
          normalizePatternEventLength(chord.length, chord.step) * projectStep * (0.9 + sound.synthRelease * 0.24),
          noteToFrequency(pitch),
          voiceMix,
          energyGain * chord.velocity * 0.14,
          "triangle",
          {
            drive: (1 - sound.chordWarmth) * 0.08,
            filter: 0.48 + (1 - sound.chordWarmth) * 0.42,
            decay: 3.8 - sound.synthRelease * 1.2
          },
          chordMirrors,
          chordSendMirrors
        );
      }
    }
  }

  applySpaceReturn(mixBuffer, mixSendBuffer);
  const mix = finalizeRenderedBuffer(project, mixBuffer, outputGain, automationEvents);
  const stems = Object.fromEntries(
    stemTrackIds.map((track) => {
      const target = stemTargets[track];
      applySpaceReturn(target.buffer, target.sendBuffer);
      return [track, finalizeRenderedBuffer(project, target.buffer, outputGain, automationEvents)];
    })
  ) as StemExportAnalyses;

  return { mix, stems };
}

function analyzeProjectExportTarget(
  project: ProjectState,
  workspace: RenderWorkspace,
  stemTarget?: StemTrackId
): ExportAnalysis {
  let rendered: RenderedAudio | null = renderProject(project, arrangementBarCount(project), stemTarget, workspace);
  const analysis = rendered.analysis;
  // Keep only the scalar analysis; the same four PCM arrays are cleared and
  // reused for the next target instead of retaining or reallocating its audio.
  rendered = null;
  return analysis;
}

function analyzeProjectExportsBounded(project: ProjectState): ProjectExportAnalyses {
  const frames = projectExportAnalysisFrameCount(project);
  const createChannels = (): AudioChannels => [new Float32Array(frames), new Float32Array(frames)];
  const workspace: RenderWorkspace = { buffer: createChannels(), sendBuffer: createChannels() };
  const mix = analyzeProjectExportTarget(project, workspace);
  const stems = {} as StemExportAnalyses;
  for (const track of stemTrackIds) {
    stems[track] = analyzeProjectExportTarget(project, workspace, track);
  }
  return { mix, stems };
}

type ProjectExportAnalysisOptions = {
  /** A safe test/diagnostic override; callers cannot force the high-memory path. */
  forceBoundedSequential?: boolean;
};

export function analyzeProjectExports(
  project: ProjectState,
  options: ProjectExportAnalysisOptions = {}
): ProjectExportAnalyses {
  const strategy = options.forceBoundedSequential ? "bounded-sequential" : projectExportAnalysisStrategy(project);
  return strategy === "combined" ? analyzeProjectExportsCombined(project) : analyzeProjectExportsBounded(project);
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
    bass_808: "Bass",
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
  const bytesPerSample = wavBitDepth / 8;
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
      const signed = Math.round(sample < 0 ? sample * 0x800000 : sample * 0x7fffff);
      const encoded = signed < 0 ? signed + 0x1000000 : signed;
      view.setUint8(offset, encoded & 0xff);
      view.setUint8(offset + 1, (encoded >>> 8) & 0xff);
      view.setUint8(offset + 2, (encoded >>> 16) & 0xff);
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
  const fileSlugs: Record<StemTrackId, string> = {
    drum_rack: "drum-rack",
    bass_808: "bass",
    synth: "synth",
    chord: "chord"
  };
  return stemTrackIds.map((track) => `${stem}-${fileSlugs[track]}-stem.wav`);
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
