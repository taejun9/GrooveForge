/**
 * Web Audio API로 편곡/Pattern을 짧게 선행 예약해 실시간 재생하고, 편집기 단일 이벤트 미리듣기를 제공한다.
 * UI 타이머의 흔들림을 줄이기 위해 AudioContext 시간축에 노드를 미리 스케줄하며 현재 프로젝트 변경을 매 tick 반영한다.
 * 생성한 AudioContext·interval·feedback timeout은 controller.stop에서 정리하는 것이 중요한 생명주기 경계다.
 */
import {
  dbToGain,
  arrangementEnergyGain,
  activePattern,
  audibleMixerChannelIds,
  ArrangementMuteTrack,
  ArrangementSection,
  arrangementTotalBars,
  chordPitches,
  chordEventShouldPlay,
  loopStepCount,
  drumStepTimingMs,
  drumStepVelocity,
  drumStepShouldPlay,
  hatRepeatCount,
  masterAutomationGainForEvents,
  normalizeArrangementBars,
  normalizeArrangementPlaybackRange,
  normalizeMixerChannelTopology,
  normalizeNoteVelocity,
  normalizePatternEventCollections,
  normalizePatternEventLength,
  normalizeProjectAutomationEvents,
  normalizeSoundDesignControls,
  noteEventShouldPlay,
  noteToFrequency,
  BassNote,
  ChordEvent,
  DrumLane,
  MelodyNote,
  NoteTrack,
  PatternData,
  PatternSlot,
  patternForSlot,
  projectStepDurationSeconds,
  projectSwingOffsetSeconds,
  projectMasterCeilingDb,
  ProjectState,
  sidechainGainForStep,
  SoundDesign
} from "../domain/workstation";
import { bassGlideProfile, bassVoiceProfileForProject } from "./bassVoice";
import type { BassGlideProfile, BassVoiceProfile, BassWaveform } from "./bassVoice";

export type PlaybackMode = "arrangement" | "pattern";

export type PlaybackSnapshot = {
  absoluteStep: number;
  loopStep: number;
  bar: number;
  beat: number;
  mode: PlaybackMode;
  pattern: PatternSlot;
  section?: ArrangementSection;
  arrangementIndex?: number;
  energy: number;
  energyGain: number;
  mutedTracks: ArrangementMuteTrack[];
  totalBars: number;
};

export type PlaybackController = {
  stop: () => void;
};

export type EditorAuditionTarget =
  | { kind: "drum"; lane: DrumLane; step: number }
  | { kind: "note"; track: NoteTrack; note: BassNote | MelodyNote }
  | { kind: "chord"; chord: ChordEvent };

type SchedulerOptions = {
  bars?: number;
  mode?: PlaybackMode;
  startBar?: number;
  getProject?: () => ProjectState;
  onStep?: (snapshot: PlaybackSnapshot) => void;
  onStop?: () => void;
};

type TrackMix = {
  gain: number;
  pan: number;
  lowCut: number;
  air: number;
  drive: number;
  glue: number;
  send: number;
};

type ScheduledToneOptions = {
  drive?: number;
  filterHz?: number;
  highpassHz?: number;
  air?: number;
  release?: number;
  startFrequency?: number;
  glideDuration?: number;
};

const scheduleAheadSeconds = 0.12;
const scheduleAheadMs = scheduleAheadSeconds * 1000;
// 25ms마다 120ms 앞까지 예약해 UI 스레드의 짧은 지연은 흡수하되 편집 반영 지연은 작게 유지한다.
const schedulerTickMs = 25;
const metronomeMix: TrackMix = { gain: 1, pan: 0, lowCut: 0, air: 0.16, drive: 0, glue: 0, send: 0 };

type PlaybackDestination = {
  dry: AudioNode;
  send: AudioNode;
};

function createAudioContext(): AudioContext {
  // 사용자 제스처로 진입하는 공개 함수 안에서만 Context를 만들며, 지원되지 않는 런타임은 즉시 명시적으로 실패한다.
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("AudioContext is not available in this runtime.");
  }
  return new AudioContextClass();
}

function hasSolo(project: ProjectState): boolean {
  return project.mixer.some(
    (track) => audibleMixerChannelIds.includes(track.id as (typeof audibleMixerChannelIds)[number]) && track.solo
  );
}

function channelMix(project: ProjectState, id: string): TrackMix {
  const channel = project.mixer.find((track) => track.id === id);
  const soloActive = hasSolo(project);
  if (!channel || channel.muted || (id !== "master" && soloActive && !channel.solo)) {
    // 뮤트/솔로 판정은 gain 0으로 통합해 이후 예약 함수가 불필요한 AudioNode 생성을 빠르게 건너뛰게 한다.
    return { gain: 0, pan: 0, lowCut: 0, air: 0, drive: 0, glue: 0, send: 0 };
  }
  return {
    gain: dbToGain(channel.volumeDb),
    pan: Math.max(-1, Math.min(1, channel.pan / 100)),
    lowCut: channel.lowCut,
    air: channel.air,
    drive: channel.drive,
    glue: channel.glue,
    send: id === "master" ? 0 : channel.send
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

function channelGlueMakeup(mix: TrackMix): number {
  return 1 + mix.glue * 0.08;
}

function connectChannelGlue(context: AudioContext, source: AudioNode, mix: TrackMix, time: number): AudioNode {
  if (mix.glue <= 0) {
    return source;
  }

  const compressor = context.createDynamicsCompressor();
  // 0..1 glue를 Web Audio compressor의 제한된 안전 범위로 매핑하고 소량의 makeup gain은 호출부에서 적용한다.
  compressor.threshold.setValueAtTime(-18 - mix.glue * 24, time);
  compressor.knee.setValueAtTime(8 + mix.glue * 18, time);
  compressor.ratio.setValueAtTime(1.2 + mix.glue * 5.2, time);
  compressor.attack.setValueAtTime(0.006 + mix.glue * 0.01, time);
  compressor.release.setValueAtTime(0.08 + mix.glue * 0.18, time);
  source.connect(compressor);
  return compressor;
}

function createSpaceBus(context: AudioContext, destination: AudioNode): GainNode {
  // 한 재생 세션이 공유하는 feedback delay 버스다. 각 음원은 send 양만큼 이 input에 연결된다.
  const input = context.createGain();
  const delay = context.createDelay(0.8);
  const feedback = context.createGain();
  const filter = context.createBiquadFilter();
  const wet = context.createGain();
  delay.delayTime.setValueAtTime(0.22, context.currentTime);
  feedback.gain.setValueAtTime(0.28, context.currentTime);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(5200, context.currentTime);
  filter.Q.setValueAtTime(0.45, context.currentTime);
  wet.gain.setValueAtTime(0.48, context.currentTime);
  input.connect(delay);
  delay.connect(filter);
  filter.connect(wet).connect(destination);
  filter.connect(feedback).connect(delay);
  return input;
}

function connectScheduledOutput(context: AudioContext, source: AudioNode, destination: PlaybackDestination, mix: TrackMix, time: number): void {
  source.connect(destination.dry);
  if (mix.gain <= 0 || mix.send <= 0) {
    return;
  }
  const sendGain = context.createGain();
  sendGain.gain.setValueAtTime(Math.min(0.72, mix.send * 0.58), time);
  source.connect(sendGain).connect(destination.send);
}

function masterOutputGain(project: ProjectState): number {
  return channelMix(project, "master").gain;
}

function mutedTrackMix(mix: TrackMix): TrackMix {
  return { ...mix, gain: 0 };
}

function arrangementTrackMix(project: ProjectState, track: ArrangementMuteTrack, mutedTracks: ArrangementMuteTrack[]): TrackMix {
  const mix = channelMix(project, track);
  return mutedTracks.includes(track) ? mutedTrackMix(mix) : mix;
}

type PlaybackStepContext = {
  pattern: PatternData;
  patternSlot: PatternSlot;
  section?: ArrangementSection;
  arrangementIndex?: number;
  energy: number;
  energyGain: number;
  mutedTracks: ArrangementMuteTrack[];
};

function arrangementContextForBar(project: ProjectState, bar: number): PlaybackStepContext {
  // 가변 길이 편곡 블록을 누적 bar 좌표로 탐색해 현재 Pattern과 음소거/에너지 문맥을 만든다.
  let cursor = 0;
  for (const [index, block] of project.arrangement.entries()) {
    const blockBars = normalizeArrangementBars(block.bars);
    if (bar < cursor + blockBars) {
      return {
        pattern: patternForSlot(project, block.pattern),
        patternSlot: block.pattern,
        section: block.section,
        arrangementIndex: index,
        energy: block.energy,
        energyGain: arrangementEnergyGain(block.energy),
        mutedTracks: block.mutedTracks
      };
    }
    cursor += blockBars;
  }

  return {
    pattern: activePattern(project),
    patternSlot: project.selectedPattern,
    energy: 1,
    energyGain: 1,
    mutedTracks: []
  };
}

function playbackContextForStep(project: ProjectState, mode: PlaybackMode, loopStep: number, startBar = 0): PlaybackStepContext {
  if (mode === "pattern") {
    return {
      pattern: activePattern(project),
      patternSlot: project.selectedPattern,
      energy: 1,
      energyGain: 1,
      mutedTracks: []
    };
  }

  return arrangementContextForBar(project, startBar + Math.floor(loopStep / 16));
}

function snapshotForStep(
  project: ProjectState,
  step: number,
  loopSteps: number,
  totalBars: number,
  mode: PlaybackMode,
  startBar = 0
): PlaybackSnapshot {
  const loopStep = step % loopSteps;
  const playbackContext = playbackContextForStep(project, mode, loopStep, startBar);
  return {
    // 콜백에는 무한 증가 absoluteStep과 루프 내부 loopStep을 모두 제공해 UI와 확률 게이트가 각 목적에 맞게 쓴다.
    absoluteStep: step,
    loopStep,
    bar: Math.floor(loopStep / 16) + 1,
    beat: Math.floor((loopStep % 16) / 4) + 1,
    mode,
    pattern: playbackContext.patternSlot,
    section: playbackContext.section,
    arrangementIndex: playbackContext.arrangementIndex,
    energy: playbackContext.energy,
    energyGain: playbackContext.energyGain,
    mutedTracks: playbackContext.mutedTracks,
    totalBars
  };
}

function scheduleKick(
  context: AudioContext,
  destination: PlaybackDestination,
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
  const drive = context.createWaveShaper();
  const gain = context.createGain();
  const panner = context.createStereoPanner();
  osc.type = "sine";
  highpass.type = "highpass";
  highpass.frequency.setValueAtTime(channelHighpassHz(mix), time);
  highpass.Q.setValueAtTime(0.7, time);
  drive.curve = driveCurve(mix.drive * 0.42);
  drive.oversample = "2x";
  osc.frequency.setValueAtTime(78 + sound.kickPunch * 42, time);
  // 짧은 지수 피치 하강과 gain envelope를 결합해 샘플 없이 킥의 트랜지언트와 바디를 만든다.
  osc.frequency.exponentialRampToValueAtTime(42 + sound.kickPunch * 10, time + 0.09 + sound.kickPunch * 0.05);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime((0.72 + sound.kickPunch * 0.3) * gainValue * channelAirGain(mix, 0.06) * channelGlueMakeup(mix), time + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18 + sound.kickPunch * 0.1);
  panner.pan.setValueAtTime(mix.pan, time);
  osc.connect(highpass).connect(drive);
  connectChannelGlue(context, drive, mix, time).connect(gain).connect(panner);
  connectScheduledOutput(context, panner, destination, mix, time);
  osc.start(time);
  osc.stop(time + 0.3);
}

function scheduleNoise(
  context: AudioContext,
  destination: PlaybackDestination,
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
  // 실시간 미리듣기 노이즈는 즉시 생성한다. 결정적 파일/미터는 별도 오프라인 렌더러의 seeded noise를 사용한다.
  for (let index = 0; index < frames; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const drive = context.createWaveShaper();
  const gain = context.createGain();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(Math.max(channelHighpassHz(mix), filterHz + mix.lowCut * 900 + mix.air * 1400), time);
  drive.curve = driveCurve(mix.drive * 0.36);
  drive.oversample = "2x";
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(gainValue * channelAirGain(mix, 0.16) * channelGlueMakeup(mix), time + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  source.buffer = buffer;
  const panner = context.createStereoPanner();
  panner.pan.setValueAtTime(mix.pan, time);
  source.connect(filter).connect(drive);
  connectChannelGlue(context, drive, mix, time).connect(gain).connect(panner);
  connectScheduledOutput(context, panner, destination, mix, time);
  source.start(time);
  source.stop(time + duration);
}

function scheduleTone(
  context: AudioContext,
  destination: PlaybackDestination,
  time: number,
  duration: number,
  frequency: number,
  gainValue: number,
  type: OscillatorType,
  mix: TrackMix,
  pan: number,
  tone: ScheduledToneOptions = {}
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
  osc.frequency.setValueAtTime(tone.startFrequency ?? frequency, time);
  if (tone.startFrequency !== undefined && (tone.glideDuration ?? 0) > 0) {
    // AudioParam의 선형 램프를 사용하므로 별도 프레임 루프 없이 샘플 정밀도의 글라이드를 예약한다.
    osc.frequency.linearRampToValueAtTime(frequency, time + Math.min(duration, tone.glideDuration ?? 0));
  }
  highpass.type = "highpass";
  highpass.frequency.setValueAtTime(tone.highpassHz ?? 18, time);
  highpass.Q.setValueAtTime(0.7, time);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(tone.filterHz ?? 12000, time);
  filter.Q.setValueAtTime(0.6, time);
  drive.curve = driveCurve(Math.min(1, (tone.drive ?? 0) + mix.drive * 0.48));
  drive.oversample = "2x";
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(gainValue * (1 + (tone.air ?? 0) * 0.12) * channelGlueMakeup(mix), time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(0.04, duration + (tone.release ?? 0) * 0.12));
  panner.pan.setValueAtTime(pan, time);
  osc.connect(highpass).connect(filter).connect(drive);
  connectChannelGlue(context, drive, mix, time).connect(gain).connect(panner);
  connectScheduledOutput(context, panner, destination, mix, time);
  osc.start(time);
  osc.stop(time + duration + (tone.release ?? 0) * 0.14 + 0.03);
}

function driveCurve(amount: number): Float32Array<ArrayBuffer> {
  // WaveShaper용 tanh 곡선을 -1..1 범위에 미리 샘플링한다. amount가 커질수록 중앙 기울기와 포화가 강해진다.
  const curve = new Float32Array(128);
  const drive = 1 + amount * 18;
  for (let index = 0; index < curve.length; index += 1) {
    const x = (index / (curve.length - 1)) * 2 - 1;
    curve[index] = Math.tanh(x * drive);
  }
  return curve;
}

function bassOscillator(waveform: BassWaveform): OscillatorType {
  return waveform === "saw" ? "sawtooth" : waveform;
}

function scheduleBassTone(
  context: AudioContext,
  destination: PlaybackDestination,
  time: number,
  duration: number,
  frequency: number,
  gainValue: number,
  mix: TrackMix,
  voice: BassVoiceProfile,
  glide: BassGlideProfile | null
): void {
  const tone: ScheduledToneOptions = {
    drive: voice.drive,
    filterHz: channelAirFilterHz(voice.filterHz, mix),
    highpassHz: channelHighpassHz(mix),
    air: mix.air,
    release: voice.release,
    ...(glide ? { startFrequency: glide.startFrequency, glideDuration: glide.durationSeconds } : {})
  };
  scheduleTone(context, destination, time, duration, frequency, gainValue, bassOscillator(voice.waveform), mix, mix.pan, tone);
  if (voice.detuneRatio) {
    // Reese 보이스의 두 번째 오실레이터는 주파수와 글라이드 시작점 모두 같은 비율로 이동해야 음정 이동이 평행하다.
    scheduleTone(
      context,
      destination,
      time,
      duration,
      frequency * voice.detuneRatio,
      gainValue * 0.38,
      bassOscillator(voice.waveform),
      mix,
      Math.max(-1, Math.min(1, mix.pan + 0.06)),
      {
        ...tone,
        ...(tone.startFrequency ? { startFrequency: tone.startFrequency * voice.detuneRatio } : {})
      }
    );
  }
}

function synthOscillator(sound: SoundDesign): OscillatorType {
  if (sound.synthBrightness > 0.72) {
    return "square";
  }
  return sound.synthBrightness > 0.46 ? "triangle" : "sine";
}

function scheduleMetronomeClick(context: AudioContext, destination: PlaybackDestination, time: number, step: number): void {
  const accent = step % 16 === 0;
  scheduleTone(
    context,
    destination,
    time,
    accent ? 0.055 : 0.04,
    accent ? 1760 : 1320,
    accent ? 0.12 : 0.075,
    "square",
    metronomeMix,
    0,
    {
      filterHz: accent ? 9200 : 7200,
      highpassHz: 900,
      air: metronomeMix.air,
      release: 0
    }
  );
}

function scheduleStep(
  project: ProjectState,
  pattern: PatternData,
  context: AudioContext,
  destination: PlaybackDestination,
  step: number,
  time: number,
  absoluteStep = step,
  energyGain = 1,
  mutedTracks: ArrangementMuteTrack[] = []
): void {
  // 한 스텝에서 시작하는 이벤트만 예약한다. 길게 유지되는 음은 AudioNode의 stop 시각으로 스텝 경계를 넘어간다.
  const patternStep = step % 16;
  const drumMix = arrangementTrackMix(project, "drum_rack", mutedTracks);
  const bassMix = arrangementTrackMix(project, "bass_808", mutedTracks);
  const synthMix = arrangementTrackMix(project, "synth", mutedTracks);
  const chordMix = arrangementTrackMix(project, "chord", mutedTracks);
  const sound = normalizeSoundDesignControls(project.sound);
  const bassVoice = bassVoiceProfileForProject(project, sound);
  const stepDuration = projectStepDurationSeconds(project);
  if (project.metronomeEnabled && patternStep % 4 === 0) {
    scheduleMetronomeClick(context, destination, time, patternStep);
  }
  if (drumStepShouldPlay(pattern, "kick", patternStep, absoluteStep)) {
    const drumTime = time + drumStepTimingMs(pattern, "kick", patternStep) / 1000;
    scheduleKick(context, destination, drumTime, energyGain * drumMix.gain * drumStepVelocity(pattern, "kick", patternStep), drumMix, sound);
  }
  if (drumStepShouldPlay(pattern, "clap", patternStep, absoluteStep)) {
    const drumTime = time + drumStepTimingMs(pattern, "clap", patternStep) / 1000;
    scheduleNoise(
      context,
      destination,
      drumTime,
      0.11 + (1 - sound.snareSnap) * 0.08,
      energyGain * (0.2 + sound.snareSnap * 0.14) * drumMix.gain * drumStepVelocity(pattern, "clap", patternStep),
      780 + sound.snareSnap * 1800,
      drumMix
    );
  }
  if (drumStepShouldPlay(pattern, "hat", patternStep, absoluteStep)) {
    const repeatCount = hatRepeatCount(pattern, patternStep);
    const baseVelocity = drumStepVelocity(pattern, "hat", patternStep);
    const drumTime = time + drumStepTimingMs(pattern, "hat", patternStep) / 1000;
    for (let repeatIndex = 0; repeatIndex < repeatCount; repeatIndex += 1) {
      scheduleNoise(
        context,
        destination,
        drumTime + (repeatIndex * stepDuration) / repeatCount,
        0.035 + (1 - sound.hatBrightness) * 0.025,
        energyGain * (0.08 + sound.hatBrightness * 0.08) * drumMix.gain * baseVelocity * (repeatIndex === 0 ? 1 : 0.72),
        4300 + sound.hatBrightness * 4200,
        drumMix
      );
    }
  }
  if (drumStepShouldPlay(pattern, "perc", patternStep, absoluteStep)) {
    const drumTime = time + drumStepTimingMs(pattern, "perc", patternStep) / 1000;
    scheduleTone(
      context,
      destination,
      drumTime,
      0.07,
      260 + sound.snareSnap * 190,
      energyGain * 0.12 * drumMix.gain * drumStepVelocity(pattern, "perc", patternStep),
      "triangle",
      drumMix,
      drumMix.pan,
      {
        filterHz: channelAirFilterHz(1800 + sound.hatBrightness * 4200, drumMix),
        highpassHz: channelHighpassHz(drumMix),
        air: drumMix.air
      }
    );
  }

  for (const [noteIndex, note] of pattern.bassNotes.entries()) {
    if (note.step === patternStep && noteEventShouldPlay("bass", note, absoluteStep)) {
      const duration = normalizePatternEventLength(note.length, note.step) * stepDuration * (0.74 + sound.bassDecay * 0.52) * bassVoice.durationScale;
      scheduleBassTone(
        context,
        destination,
        time,
        duration,
        noteToFrequency(note.pitch),
        energyGain *
          note.velocity *
          (0.42 + sound.bassDrive * 0.22) * bassVoice.gainScale *
          bassMix.gain *
          sidechainGainForStep(pattern, patternStep, sound.sidechainDuck, absoluteStep),
        bassMix,
        bassVoice,
        bassGlideProfile(pattern.bassNotes, noteIndex, duration, stepDuration)
      );
    }
  }

  for (const note of pattern.melodyNotes) {
    if (note.step === patternStep && noteEventShouldPlay("melody", note, absoluteStep)) {
      scheduleTone(
        context,
        destination,
        time,
        normalizePatternEventLength(note.length, note.step) * stepDuration * (0.8 + sound.synthRelease * 0.42),
        noteToFrequency(note.pitch),
        energyGain * note.velocity * 0.12 * synthMix.gain,
        synthOscillator(sound),
        synthMix,
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
    if (chord.step === patternStep && chordEventShouldPlay(chord, absoluteStep)) {
      const pitches = chordPitches(chord);
      for (const [voiceIndex, pitch] of pitches.entries()) {
        const spread = pitches.length <= 1 ? 0 : (voiceIndex / (pitches.length - 1)) * 2 - 1;
        scheduleTone(
          context,
          destination,
          time,
          normalizePatternEventLength(chord.length, chord.step) * stepDuration * (0.9 + sound.synthRelease * 0.24),
          noteToFrequency(pitch),
          energyGain * chord.velocity * 0.08 * chordMix.gain,
          "triangle",
          chordMix,
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

export function playEditorAudition(project: ProjectState, target: EditorAuditionTarget): PlaybackController {
  // 미리듣기는 전체 transport와 분리된 짧은 Context를 사용해 재생 상태나 편곡 커서를 바꾸지 않는다.
  const normalizedMixer = normalizeMixerChannelTopology(project.mixer);
  const mixerProject = normalizedMixer === project.mixer ? project : { ...project, mixer: normalizedMixer };
  const context = createAudioContext();
  void context.resume();
  const masterGain = context.createGain();
  const ceiling = dbToGain(projectMasterCeilingDb(project));
  masterGain.gain.setValueAtTime(masterOutputGain(mixerProject) * Math.min(1, ceiling), context.currentTime);
  masterGain.connect(context.destination);
  const spaceInput = createSpaceBus(context, masterGain);
  const destination: PlaybackDestination = { dry: masterGain, send: spaceInput };
  const pattern = activePattern(project);
  const sound = normalizeSoundDesignControls(project.sound);
  const stepDuration = projectStepDurationSeconds(project);
  const time = context.currentTime + 0.025;
  let stopAt = time + 0.42;

  const extendStop = (durationSeconds: number): void => {
    // release와 delay tail이 잘리지 않도록 이벤트 종류별 예상 길이에 안전 여유를 더한다.
    stopAt = Math.max(stopAt, time + Math.max(0.08, durationSeconds) + 0.28);
  };

  if (target.kind === "drum") {
    const drumMix = channelMix(mixerProject, "drum_rack");
    const velocity = drumStepVelocity(pattern, target.lane, target.step);
    const drumTime = time + Math.max(0, drumStepTimingMs(pattern, target.lane, target.step) / 1000);

    if (target.lane === "kick") {
      scheduleKick(context, destination, drumTime, drumMix.gain * velocity, drumMix, sound);
      extendStop(0.32);
    } else if (target.lane === "clap") {
      const duration = 0.11 + (1 - sound.snareSnap) * 0.08;
      scheduleNoise(
        context,
        destination,
        drumTime,
        duration,
        (0.2 + sound.snareSnap * 0.14) * drumMix.gain * velocity,
        780 + sound.snareSnap * 1800,
        drumMix
      );
      extendStop(duration);
    } else if (target.lane === "hat") {
      const repeatCount = hatRepeatCount(pattern, target.step);
      const duration = 0.035 + (1 - sound.hatBrightness) * 0.025;
      for (let repeatIndex = 0; repeatIndex < repeatCount; repeatIndex += 1) {
        scheduleNoise(
          context,
          destination,
          drumTime + (repeatIndex * stepDuration) / repeatCount,
          duration,
          (0.08 + sound.hatBrightness * 0.08) * drumMix.gain * velocity * (repeatIndex === 0 ? 1 : 0.72),
          4300 + sound.hatBrightness * 4200,
          drumMix
        );
      }
      extendStop(stepDuration + duration);
    } else {
      scheduleTone(
        context,
        destination,
        drumTime,
        0.07,
        260 + sound.snareSnap * 190,
        0.12 * drumMix.gain * velocity,
        "triangle",
        drumMix,
        drumMix.pan,
        {
          filterHz: channelAirFilterHz(1800 + sound.hatBrightness * 4200, drumMix),
          highpassHz: channelHighpassHz(drumMix),
          air: drumMix.air
        }
      );
      extendStop(0.24);
    }
  } else if (target.kind === "note" && target.track === "bass") {
    const note = target.note as BassNote;
    const bassMix = channelMix(mixerProject, "bass_808");
    const bassVoice = bassVoiceProfileForProject(mixerProject, sound);
    const duration = normalizePatternEventLength(note.length, note.step) * stepDuration * (0.74 + sound.bassDecay * 0.52) * bassVoice.durationScale;
    const notes = activePattern(mixerProject).bassNotes;
    const noteIndex = notes.findIndex((candidate) => candidate.step === note.step && candidate.pitch === note.pitch);
    scheduleBassTone(
      context,
      destination,
      time,
      duration,
      noteToFrequency(note.pitch),
      normalizeNoteVelocity(note.velocity) * (0.42 + sound.bassDrive * 0.22) * bassVoice.gainScale * bassMix.gain,
      bassMix,
      bassVoice,
      noteIndex >= 0 ? bassGlideProfile(notes, noteIndex, duration, stepDuration) : null
    );
    extendStop(duration + sound.bassDecay * 0.16);
  } else if (target.kind === "note") {
    const note = target.note as MelodyNote;
    const synthMix = channelMix(mixerProject, "synth");
    const duration = normalizePatternEventLength(note.length, note.step) * stepDuration * (0.8 + sound.synthRelease * 0.42);
    scheduleTone(
      context,
      destination,
      time,
      duration,
      noteToFrequency(note.pitch),
      normalizeNoteVelocity(note.velocity, 0.64) * 0.12 * synthMix.gain,
      synthOscillator(sound),
      synthMix,
      synthMix.pan,
      {
        drive: sound.synthBrightness * 0.08,
        filterHz: channelAirFilterHz(1200 + sound.synthBrightness * 7600, synthMix),
        highpassHz: channelHighpassHz(synthMix),
        air: synthMix.air,
        release: sound.synthRelease
      }
    );
    extendStop(duration + sound.synthRelease * 0.16);
  } else {
    const chordMix = channelMix(mixerProject, "chord");
    const pitches = chordPitches(target.chord);
    const duration =
      normalizePatternEventLength(target.chord.length, target.chord.step) *
      stepDuration *
      (0.9 + sound.synthRelease * 0.24);
    for (const [voiceIndex, pitch] of pitches.entries()) {
      const spread = pitches.length <= 1 ? 0 : (voiceIndex / (pitches.length - 1)) * 2 - 1;
      scheduleTone(
        context,
        destination,
        time,
        duration,
        noteToFrequency(pitch),
        normalizeNoteVelocity(target.chord.velocity, 0.5) * 0.08 * chordMix.gain,
        "triangle",
        chordMix,
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
    extendStop(duration + sound.synthRelease * 0.16);
  }

  let stopped = false;
  const closeTimeout = window.setTimeout(() => {
    stop();
  }, Math.max(160, Math.ceil((stopAt - context.currentTime) * 1000)));

  function stop(): void {
    if (stopped) {
      return;
    }
    stopped = true;
    window.clearTimeout(closeTimeout);
    // 갑자기 Context를 닫으면 클릭이 생길 수 있어 master를 짧게 감쇠한 뒤 닫는다.
    masterGain.gain.cancelScheduledValues(context.currentTime);
    masterGain.gain.setTargetAtTime(0.0001, context.currentTime, 0.015);
    window.setTimeout(() => {
      void context.close();
    }, 80);
  }

  return { stop };
}

export function startRealtimePlayback(project: ProjectState, options: SchedulerOptions = {}): PlaybackController {
  const context = createAudioContext();
  void context.resume();
  const getProject = options.getProject ?? (() => project);
  const mode = options.mode ?? "arrangement";
  const masterGain = context.createGain();
  masterGain.connect(context.destination);
  const spaceInput = createSpaceBus(context, masterGain);
  const destinations: PlaybackDestination = { dry: masterGain, send: spaceInput };

  let nextStep = 0;
  let nextStepAtMs = performance.now() + 50;
  let stopped = false;
  let intervalId: number | undefined;
  const feedbackTimeouts = new Set<number>();
  const normalizedPatternCache = new WeakMap<PatternData, PatternData>();
  // 객체 참조가 바뀔 때만 정규화해 25ms tick마다 같은 배열을 다시 복제하는 비용을 피한다.
  let mixerSource: ProjectState["mixer"] | null = null;
  let normalizedMixer = normalizeMixerChannelTopology([]);
  let soundSource: ProjectState["sound"] | null = null;
  let normalizedSound: ProjectState["sound"] | null = null;
  let playbackProjectSource: ProjectState | null = null;
  let normalizedPlaybackProject: ProjectState | null = null;
  let automationSource: ProjectState["automation"] | null = null;
  let automationEvents = normalizeProjectAutomationEvents([]);

  const normalizedPatternForPlayback = (pattern: PatternData): PatternData => {
    const cached = normalizedPatternCache.get(pattern);
    if (cached) {
      return cached;
    }
    const normalized = normalizePatternEventCollections(pattern);
    normalizedPatternCache.set(pattern, normalized);
    return normalized;
  };

  const normalizedProjectForPlayback = (currentProject: ProjectState): ProjectState => {
    // 편집 중 getProject가 최신 상태를 돌려주므로 mixer/sound 참조별 캐시도 함께 무효화해야 한다.
    if (currentProject.mixer !== mixerSource) {
      mixerSource = currentProject.mixer;
      normalizedMixer = normalizeMixerChannelTopology(currentProject.mixer);
      playbackProjectSource = null;
      normalizedPlaybackProject = null;
    }
    if (currentProject.sound !== soundSource) {
      soundSource = currentProject.sound;
      normalizedSound = normalizeSoundDesignControls(currentProject.sound);
      playbackProjectSource = null;
      normalizedPlaybackProject = null;
    }
    if (normalizedMixer === currentProject.mixer && normalizedSound === currentProject.sound) {
      return currentProject;
    }
    if (currentProject !== playbackProjectSource) {
      playbackProjectSource = currentProject;
      normalizedPlaybackProject = {
        ...currentProject,
        mixer: normalizedMixer,
        sound: normalizedSound ?? currentProject.sound
      };
    }
    return normalizedPlaybackProject ?? currentProject;
  };

  const normalizedAutomationForPlayback = (events: ProjectState["automation"]): ProjectState["automation"] => {
    // 자동화 정규화도 원본 배열 참조가 바뀐 경우에만 수행한다.
    if (events !== automationSource) {
      automationSource = events;
      automationEvents = normalizeProjectAutomationEvents(events);
    }
    return automationEvents;
  };

  const queueStepFeedback = (snapshot: PlaybackSnapshot, stepAtMs: number): void => {
    // 소리는 미리 예약하지만 UI playhead 콜백은 실제 청취 시각에 맞춰 별도 timeout으로 지연한다.
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
    // 현재 선행 예약 창 안에 들어온 모든 스텝을 한 tick에서 채워 timer 지연으로 생기는 오디오 공백을 방지한다.
    while (nextStepAtMs < nowMs + scheduleAheadMs) {
      const currentProject = normalizedProjectForPlayback(getProject());
      const requestedBars = options.bars ?? (mode === "arrangement" ? arrangementTotalBars(currentProject) : 2);
      const playbackRange = normalizeArrangementPlaybackRange(
        requestedBars,
        mode === "arrangement" ? options.startBar ?? 0 : 0
      );
      const bars = playbackRange.bars;
      const loopSteps = loopStepCount(bars);
      const totalBars = Math.max(1, bars);
      const startBar = playbackRange.startBar;
      const stepDuration = projectStepDurationSeconds(currentProject);
      const ceiling = dbToGain(projectMasterCeilingDb(currentProject));
      const snapshot = snapshotForStep(currentProject, nextStep, loopSteps, totalBars, mode, startBar);
      const automationStep = mode === "arrangement" ? startBar * 16 + snapshot.loopStep : snapshot.loopStep;
      const automationGain = masterAutomationGainForEvents(
        normalizedAutomationForPlayback(currentProject.automation),
        automationStep
      );
      masterGain.gain.setTargetAtTime(masterOutputGain(currentProject) * Math.min(1, ceiling) * automationGain, context.currentTime, 0.01);
      const playbackContext = playbackContextForStep(currentProject, mode, snapshot.loopStep, startBar);
      const audibleStepAtMs = nextStepAtMs + projectSwingOffsetSeconds(currentProject, nextStep) * 1000;
      // 이미 지난 시각은 최소 15ms 뒤로 보정해 Web Audio가 과거 노드를 즉시 터뜨리는 현상을 피한다.
      const scheduleDelaySeconds = Math.max(0.015, (audibleStepAtMs - nowMs) / 1000);
      scheduleStep(
        currentProject,
        normalizedPatternForPlayback(playbackContext.pattern),
        context,
        destinations,
        snapshot.loopStep,
        context.currentTime + scheduleDelaySeconds,
        nextStep,
        playbackContext.energyGain,
        playbackContext.mutedTracks
      );
      queueStepFeedback(snapshot, audibleStepAtMs);
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
        // stop 뒤 늦게 도착한 playhead 콜백이 UI를 다시 움직이지 않도록 예약된 피드백을 모두 취소한다.
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
