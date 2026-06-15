import {
  dbToGain,
  loopStepCount,
  noteToFrequency,
  projectStepDurationSeconds,
  ProjectState
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

function channelGain(project: ProjectState, id: string): number {
  const channel = project.mixer.find((track) => track.id === id);
  if (!channel || channel.muted) {
    return 0;
  }
  return dbToGain(channel.volumeDb);
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

function scheduleKick(context: AudioContext, destination: AudioNode, time: number, gainValue: number): void {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(92, time);
  osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.9 * gainValue, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
  osc.connect(gain).connect(destination);
  osc.start(time);
  osc.stop(time + 0.25);
}

function scheduleNoise(
  context: AudioContext,
  destination: AudioNode,
  time: number,
  duration: number,
  gainValue: number,
  filterHz: number
): void {
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
  filter.frequency.setValueAtTime(filterHz, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(gainValue, time + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(destination);
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
  type: OscillatorType
): void {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(gainValue, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(0.04, duration));
  osc.connect(gain).connect(destination);
  osc.start(time);
  osc.stop(time + duration + 0.03);
}

function scheduleStep(project: ProjectState, context: AudioContext, master: AudioNode, step: number, time: number): void {
  const patternStep = step % 16;
  const drumGain = channelGain(project, "drum_rack");
  const bassGain = channelGain(project, "bass_808");
  const synthGain = channelGain(project, "synth");
  const stepDuration = projectStepDurationSeconds(project);

  if (project.drumPattern.kick[patternStep]) {
    scheduleKick(context, master, time, drumGain);
  }
  if (project.drumPattern.clap[patternStep]) {
    scheduleNoise(context, master, time, 0.15, 0.26 * drumGain, 950);
  }
  if (project.drumPattern.hat[patternStep]) {
    scheduleNoise(context, master, time, 0.045, 0.12 * drumGain, 5200);
  }
  if (project.drumPattern.perc[patternStep]) {
    scheduleTone(context, master, time, 0.07, 330, 0.12 * drumGain, "triangle");
  }

  for (const note of project.bassNotes) {
    if (note.step === patternStep) {
      scheduleTone(context, master, time, note.length * stepDuration, noteToFrequency(note.pitch), 0.5 * bassGain, "sine");
    }
  }

  for (const note of project.melodyNotes) {
    if (note.step === patternStep) {
      scheduleTone(
        context,
        master,
        time,
        note.length * stepDuration,
        noteToFrequency(note.pitch),
        note.velocity * 0.12 * synthGain,
        "triangle"
      );
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
  masterGain.gain.setValueAtTime(Math.min(1, ceiling), context.currentTime);
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
