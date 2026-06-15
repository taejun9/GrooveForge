import {
  dbToGain,
  activePattern,
  chordPitches,
  loopStepCount,
  drumStepTimingMs,
  drumStepVelocity,
  hatRepeatCount,
  noteToFrequency,
  projectStepDurationSeconds,
  ProjectState,
  sidechainGainForStep,
  SoundDesign
} from "../domain/workstation";

export type PlaybackSnapshot = {
  absoluteStep: number;
  loopStep: number;
  bar: number;
  beat: number;
};

export type PlaybackController = {
  stop: () => void;
};

type SchedulerOptions = {
  bars?: number;
  onStep?: (snapshot: PlaybackSnapshot) => void;
  onStop?: () => void;
};

type TrackMix = {
  gain: number;
  pan: number;
  lowCut: number;
  air: number;
};

const scheduleAheadSeconds = 0.12;
const scheduleAheadMs = scheduleAheadSeconds * 1000;
const schedulerTickMs = 25;

function createAudioContext(): AudioContext {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("AudioContext is not available in this runtime.");
  }
  return new AudioContextClass();
}

function hasSolo(project: ProjectState): boolean {
  return project.mixer.some((track) => track.id !== "master" && track.solo);
}

function channelMix(project: ProjectState, id: string): TrackMix {
  const channel = project.mixer.find((track) => track.id === id);
  const soloActive = hasSolo(project);
  if (!channel || channel.muted || (id !== "master" && soloActive && !channel.solo)) {
    return { gain: 0, pan: 0, lowCut: 0, air: 0 };
  }
  return {
    gain: dbToGain(channel.volumeDb),
    pan: Math.max(-1, Math.min(1, channel.pan / 100)),
    lowCut: channel.lowCut,
    air: channel.air
  };
}

function channelHighpassHz(mix: TrackMix): number {
  return mix.lowCut <= 0 ? 18 : 30 + mix.lowCut * 260;
}

function channelAirGain(mix: TrackMix, amount = 0.12): number {
  return 1 + mix.air * amount;
}

function channelAirFilterHz(baseHz: number, mix: TrackMix): number {
  return Math.min(18000, baseHz * (1 + mix.air * 0.34));
}

function masterOutputGain(project: ProjectState): number {
  return channelMix(project, "master").gain;
}

function snapshotForStep(step: number, loopSteps: number): PlaybackSnapshot {
  const loopStep = step % loopSteps;
  return {
    absoluteStep: step,
    loopStep,
    bar: Math.floor(loopStep / 16) + 1,
    beat: Math.floor((loopStep % 16) / 4) + 1
  };
}

function scheduleKick(
  context: AudioContext,
  destination: AudioNode,
  time: number,
  gainValue: number,
  mix: TrackMix,
  sound: SoundDesign
): void {
  if (gainValue <= 0) {
    return;
  }
  const osc = context.createOscillator();
  const highpass = context.createBiquadFilter();
  const gain = context.createGain();
  const panner = context.createStereoPanner();
  osc.type = "sine";
  highpass.type = "highpass";
  highpass.frequency.setValueAtTime(channelHighpassHz(mix), time);
  highpass.Q.setValueAtTime(0.7, time);
  osc.frequency.setValueAtTime(78 + sound.kickPunch * 42, time);
  osc.frequency.exponentialRampToValueAtTime(42 + sound.kickPunch * 10, time + 0.09 + sound.kickPunch * 0.05);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime((0.72 + sound.kickPunch * 0.3) * gainValue * channelAirGain(mix, 0.06), time + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18 + sound.kickPunch * 0.1);
  panner.pan.setValueAtTime(mix.pan, time);
  osc.connect(highpass).connect(gain).connect(panner).connect(destination);
  osc.start(time);
  osc.stop(time + 0.3);
}

function scheduleNoise(
  context: AudioContext,
  destination: AudioNode,
  time: number,
  duration: number,
  gainValue: number,
  filterHz: number,
  mix: TrackMix
): void {
  if (gainValue <= 0) {
    return;
  }
  const frames = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, frames, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < frames; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(Math.max(channelHighpassHz(mix), filterHz + mix.lowCut * 900 + mix.air * 1400), time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(gainValue * channelAirGain(mix, 0.16), time + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  source.buffer = buffer;
  const panner = context.createStereoPanner();
  panner.pan.setValueAtTime(mix.pan, time);
  source.connect(filter).connect(gain).connect(panner).connect(destination);
  source.start(time);
  source.stop(time + duration);
}

function scheduleTone(
  context: AudioContext,
  destination: AudioNode,
  time: number,
  duration: number,
  frequency: number,
  gainValue: number,
  type: OscillatorType,
  pan: number,
  tone: { drive?: number; filterHz?: number; highpassHz?: number; air?: number; release?: number } = {}
): void {
  if (gainValue <= 0) {
    return;
  }
  const osc = context.createOscillator();
  const highpass = context.createBiquadFilter();
  const filter = context.createBiquadFilter();
  const drive = context.createWaveShaper();
  const gain = context.createGain();
  const panner = context.createStereoPanner();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, time);
  highpass.type = "highpass";
  highpass.frequency.setValueAtTime(tone.highpassHz ?? 18, time);
  highpass.Q.setValueAtTime(0.7, time);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(tone.filterHz ?? 12000, time);
  filter.Q.setValueAtTime(0.6, time);
  drive.curve = driveCurve(tone.drive ?? 0);
  drive.oversample = "2x";
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(gainValue * (1 + (tone.air ?? 0) * 0.12), time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(0.04, duration + (tone.release ?? 0) * 0.12));
  panner.pan.setValueAtTime(pan, time);
  osc.connect(highpass).connect(filter).connect(drive).connect(gain).connect(panner).connect(destination);
  osc.start(time);
  osc.stop(time + duration + (tone.release ?? 0) * 0.14 + 0.03);
}

function driveCurve(amount: number): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(128);
  const drive = 1 + amount * 18;
  for (let index = 0; index < curve.length; index += 1) {
    const x = (index / (curve.length - 1)) * 2 - 1;
    curve[index] = Math.tanh(x * drive);
  }
  return curve;
}

function bassOscillator(sound: SoundDesign): OscillatorType {
  if (sound.bassDrive > 0.64) {
    return "sawtooth";
  }
  if (sound.bassDrive > 0.38) {
    return "triangle";
  }
  return "sine";
}

function synthOscillator(sound: SoundDesign): OscillatorType {
  if (sound.synthBrightness > 0.72) {
    return "square";
  }
  return sound.synthBrightness > 0.46 ? "triangle" : "sine";
}

function scheduleStep(project: ProjectState, context: AudioContext, master: AudioNode, step: number, time: number): void {
  const patternStep = step % 16;
  const drumMix = channelMix(project, "drum_rack");
  const bassMix = channelMix(project, "bass_808");
  const synthMix = channelMix(project, "synth");
  const chordMix = channelMix(project, "chord");
  const sound = project.sound;
  const stepDuration = projectStepDurationSeconds(project);
  const pattern = activePattern(project);

  if (pattern.drumPattern.kick[patternStep]) {
    const drumTime = time + drumStepTimingMs(pattern, "kick", patternStep) / 1000;
    scheduleKick(context, master, drumTime, drumMix.gain * drumStepVelocity(pattern, "kick", patternStep), drumMix, sound);
  }
  if (pattern.drumPattern.clap[patternStep]) {
    const drumTime = time + drumStepTimingMs(pattern, "clap", patternStep) / 1000;
    scheduleNoise(
      context,
      master,
      drumTime,
      0.11 + (1 - sound.snareSnap) * 0.08,
      (0.2 + sound.snareSnap * 0.14) * drumMix.gain * drumStepVelocity(pattern, "clap", patternStep),
      780 + sound.snareSnap * 1800,
      drumMix
    );
  }
  if (pattern.drumPattern.hat[patternStep]) {
    const repeatCount = hatRepeatCount(pattern, patternStep);
    const baseVelocity = drumStepVelocity(pattern, "hat", patternStep);
    const drumTime = time + drumStepTimingMs(pattern, "hat", patternStep) / 1000;
    for (let repeatIndex = 0; repeatIndex < repeatCount; repeatIndex += 1) {
      scheduleNoise(
        context,
        master,
        drumTime + (repeatIndex * stepDuration) / repeatCount,
        0.035 + (1 - sound.hatBrightness) * 0.025,
        (0.08 + sound.hatBrightness * 0.08) * drumMix.gain * baseVelocity * (repeatIndex === 0 ? 1 : 0.72),
        4300 + sound.hatBrightness * 4200,
        drumMix
      );
    }
  }
  if (pattern.drumPattern.perc[patternStep]) {
    const drumTime = time + drumStepTimingMs(pattern, "perc", patternStep) / 1000;
    scheduleTone(
      context,
      master,
      drumTime,
      0.07,
      260 + sound.snareSnap * 190,
      0.12 * drumMix.gain * drumStepVelocity(pattern, "perc", patternStep),
      "triangle",
      drumMix.pan,
      {
        filterHz: channelAirFilterHz(1800 + sound.hatBrightness * 4200, drumMix),
        highpassHz: channelHighpassHz(drumMix),
        air: drumMix.air
      }
    );
  }

  for (const note of pattern.bassNotes) {
    if (note.step === patternStep) {
      scheduleTone(
        context,
        master,
        time,
        note.length * stepDuration * (0.74 + sound.bassDecay * 0.52),
        noteToFrequency(note.pitch),
        (0.42 + sound.bassDrive * 0.22) * bassMix.gain * sidechainGainForStep(pattern, patternStep, sound.sidechainDuck),
        bassOscillator(sound),
        bassMix.pan,
        {
          drive: sound.bassDrive,
          filterHz: channelAirFilterHz(260 + sound.bassDrive * 1500, bassMix),
          highpassHz: channelHighpassHz(bassMix),
          air: bassMix.air,
          release: sound.bassDecay
        }
      );
    }
  }

  for (const note of pattern.melodyNotes) {
    if (note.step === patternStep) {
      scheduleTone(
        context,
        master,
        time,
        note.length * stepDuration * (0.8 + sound.synthRelease * 0.42),
        noteToFrequency(note.pitch),
        note.velocity * 0.12 * synthMix.gain,
        synthOscillator(sound),
        synthMix.pan,
        {
          drive: sound.synthBrightness * 0.08,
          filterHz: channelAirFilterHz(1200 + sound.synthBrightness * 7600, synthMix),
          highpassHz: channelHighpassHz(synthMix),
          air: synthMix.air,
          release: sound.synthRelease
        }
      );
    }
  }

  for (const chord of pattern.chordEvents) {
    if (chord.step === patternStep) {
      const pitches = chordPitches(chord);
      for (const [voiceIndex, pitch] of pitches.entries()) {
        const spread = pitches.length <= 1 ? 0 : (voiceIndex / (pitches.length - 1)) * 2 - 1;
        scheduleTone(
          context,
          master,
          time,
          chord.length * stepDuration * (0.9 + sound.synthRelease * 0.24),
          noteToFrequency(pitch),
          chord.velocity * 0.08 * chordMix.gain,
          "triangle",
          Math.max(-1, Math.min(1, chordMix.pan + spread * sound.chordWidth * 0.34)),
          {
            drive: (1 - sound.chordWarmth) * 0.08,
            filterHz: channelAirFilterHz(900 + (1 - sound.chordWarmth) * 6200, chordMix),
            highpassHz: channelHighpassHz(chordMix),
            air: chordMix.air,
            release: sound.synthRelease
          }
        );
      }
    }
  }
}

export function startRealtimePlayback(project: ProjectState, options: SchedulerOptions = {}): PlaybackController {
  const context = createAudioContext();
  void context.resume();
  const bars = options.bars ?? 2;
  const loopSteps = loopStepCount(bars);
  const stepDuration = projectStepDurationSeconds(project);
  const masterGain = context.createGain();
  const ceiling = dbToGain(project.masterCeilingDb);
  masterGain.gain.setValueAtTime(masterOutputGain(project) * Math.min(1, ceiling), context.currentTime);
  masterGain.connect(context.destination);

  let nextStep = 0;
  let nextStepAtMs = performance.now() + 50;
  let stopped = false;
  let intervalId: number | undefined;
  const feedbackTimeouts = new Set<number>();

  const queueStepFeedback = (snapshot: PlaybackSnapshot, stepAtMs: number): void => {
    const delayMs = Math.max(0, stepAtMs - performance.now());
    const timeoutId = window.setTimeout(() => {
      feedbackTimeouts.delete(timeoutId);
      if (!stopped) {
        options.onStep?.(snapshot);
      }
    }, delayMs);
    feedbackTimeouts.add(timeoutId);
  };

  const tick = (): void => {
    if (stopped) {
      return;
    }

    const nowMs = performance.now();
    while (nextStepAtMs < nowMs + scheduleAheadMs) {
      const snapshot = snapshotForStep(nextStep, loopSteps);
      const scheduleDelaySeconds = Math.max(0.015, (nextStepAtMs - nowMs) / 1000);
      scheduleStep(project, context, masterGain, snapshot.loopStep, context.currentTime + scheduleDelaySeconds);
      queueStepFeedback(snapshot, nextStepAtMs);
      nextStep += 1;
      nextStepAtMs += stepDuration * 1000;
    }
  };

  intervalId = window.setInterval(tick, schedulerTickMs);
  tick();

  return {
    stop: () => {
      if (stopped) {
        return;
      }
      stopped = true;
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
      for (const timeoutId of feedbackTimeouts) {
        window.clearTimeout(timeoutId);
      }
      feedbackTimeouts.clear();
      masterGain.gain.cancelScheduledValues(context.currentTime);
      masterGain.gain.setTargetAtTime(0.0001, context.currentTime, 0.015);
      window.setTimeout(() => {
        void context.close();
        options.onStop?.();
      }, 80);
    }
  };
}
