#!/usr/bin/env node

/**
 * 역할: 단단한 붐뱁, 차가운 트랩, 엇박자 포켓의 오리지널 랩 인스트루멘털 세 곡을 저작한다.
 * 흐름: 곡별 키·템포·드럼·베이스·모티프·훅을 직접 쓰고 A/B/C 대비와 90~180초 편곡을 만든다.
 * 안전 경계: 특정 녹음·목소리·가사·외부 샘플을 사용하지 않으며 기존 블루프린트 이벤트를 교체한다.
 */

import { createDrumSample, drumSampleRate, replaceDrumSample } from "../../src/domain/sampling.ts";

// 고정 시드 노이즈와 비정수 배음으로 짧은 금속 타격을 직접 합성한다. 실제 녹음은 읽지 않는다.
export function createOriginalRapPercussion() {
  const samples = new Float32Array(Math.round(drumSampleRate * 0.28));
  let seed = 1538;
  for (let index = 0; index < samples.length; index += 1) {
    const time = index / drumSampleRate;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const noise = seed / 0x80000000 - 1;
    const envelope = Math.min(1, time / 0.002) * Math.exp(-time * 25) * Math.min(1, (0.28 - time) / 0.02);
    samples[index] = (Math.sin(2 * Math.PI * 713 * time) * 0.42 + Math.sin(2 * Math.PI * 1157 * time) * 0.22 + noise * 0.14) * envelope;
  }
  return createDrumSample(samples, "Original-forge-metal-hit.wav");
}

// 실제 파일 선택기로 같은 원샷을 시험할 때 쓸 표준 PCM16 WAV이며 출력 위치는 호출자가 정한다.
export function createOriginalRapPercussionWav() {
  const sample = createOriginalRapPercussion();
  const pcm = Buffer.from(sample.pcm, "base64");
  const wav = Buffer.alloc(44 + pcm.length);
  wav.write("RIFF", 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(drumSampleRate, 24); wav.writeUInt32LE(drumSampleRate * 2, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write("data", 36); wav.writeUInt32LE(pcm.length, 40);
  pcm.copy(wav, 44);
  return wav;
}

export const darkRapLaneContract = [
  { count: 3, id: "dark-rap-originals", name: "강한 드럼과 어두운 랩 포켓" }
];

const compositions = [
  {
    id: "hiphop", blueprintId: "hiphop_pocket", bassStyle: "walking", bpm: 94, key: "C minor",
    title: "콘크리트 문장", mood: "긴장, 단단함, 집중", variant: "하드 붐뱁",
    motif: [[0, 0, 2], [5, 4, 1], [7, 3, 1], [10, 1, 2], [14, 0, 2]],
    hook: [[0, 7, 2], [3, 4, 1], [6, 6, 2], [9, 3, 2], [12, 2, 1], [14, 0, 2]],
    bass: [[0, 0, 3], [3, 0, 1], [6, 4, 2], [8, 5, 3], [11, 4, 1], [14, 2, 2]],
    kicks: [0, 3, 6, 10, 14], snares: [4, 12], hats: [0, 2, 4, 6, 8, 10, 12, 14], percs: [7, 15], rolls: [],
    degrees: [0, 5], hookDegrees: [3, 4], bars: [4, 12, 8, 8, 16, 4], swing: 0.11,
    tone: { kickPunch: 0.9, snareSnap: 0.88, hatBrightness: 0.36, bassDrive: 0.3, bassDecay: 0.35, sidechainDuck: 0.28, synthBrightness: 0.42, synthRelease: 0.14, chordWarmth: 0.7, chordWidth: 0.4 }
  },
  {
    id: "trap", blueprintId: "trap_bounce", bassStyle: "808", bpm: 142, key: "F# minor",
    title: "영하의 시선", mood: "냉기, 절제, 속도", variant: "미니멀 다크 트랩",
    motif: [[1, 0, 1], [4, 1, 2], [9, 4, 1], [13, 0, 2]],
    hook: [[0, 4, 3], [4, 7, 1], [7, 6, 1], [10, 3, 2], [14, 1, 2]],
    bass: [[0, 0, 5], [6, 0, 1], [9, 6, 3], [13, 4, 1], [15, 0, 1]],
    kicks: [0, 6, 9, 13, 15], snares: [8], hats: [0, 2, 5, 6, 8, 10, 12, 14, 15], percs: [3, 11], rolls: [6, 14],
    degrees: [0, 6], hookDegrees: [5, 4], bars: [4, 16, 12, 8, 16, 8], swing: 0.015,
    tone: { kickPunch: 0.85, snareSnap: 0.95, hatBrightness: 0.61, bassDrive: 0.55, bassDecay: 0.6, sidechainDuck: 0.44, synthBrightness: 0.55, synthRelease: 0.23, chordWarmth: 0.37, chordWidth: 0.65 }
  },
  {
    id: "k_hiphop_rnb", blueprintId: "seoul_pocket", bassStyle: "sub", bpm: 110, key: "D minor",
    title: "숨 사이의 칼날", mood: "날카로움, 여백, 전진", variant: "싱코페이션 랩 포켓",
    motif: [[0, 0, 1], [3, 2, 1], [6, 5, 2], [11, 4, 1], [15, 1, 1]],
    hook: [[1, 2, 2], [4, 4, 2], [8, 7, 3], [12, 6, 1], [14, 4, 2]],
    bass: [[0, 0, 4], [5, 2, 2], [8, 3, 4], [12, 4, 2], [15, 0, 1]],
    kicks: [0, 5, 7, 8, 12, 15], snares: [4, 12], hats: [1, 2, 4, 7, 8, 10, 13, 14], percs: [3, 10], rolls: [13],
    degrees: [0, 3], hookDegrees: [6, 4], bars: [4, 12, 12, 4, 16, 8], swing: 0.07,
    tone: { kickPunch: 0.77, snareSnap: 0.79, hatBrightness: 0.48, bassDrive: 0.2, bassDecay: 0.74, sidechainDuck: 0.35, synthBrightness: 0.64, synthRelease: 0.1, chordWarmth: 0.58, chordWidth: 0.56 }
  }
];

// 짧은 모티프는 랩의 조밀한 발음이 들어갈 여백을 남기고, 훅은 옥타브와 악기 수로 확장한다.
export const darkRapCases = compositions.map((composition, index) => ({
  ...composition, order: index + 1, styleName: composition.variant, masterAutomation: "intro_outro",
  productionLaneId: darkRapLaneContract[0].id, productionLaneName: darkRapLaneContract[0].name,
  tags: ["hip-hop", index === 0 ? "boom-bap" : index === 1 ? "dark-trap" : "syncopated", "rap-instrumental", "original"],
  vibe: `${composition.mood}의 정서를 강한 드럼, 짧은 모티프와 넓은 랩 여백으로 담은 ${composition.variant}`,
  productionBrief: {
    arrangement: `${composition.bars.join(" / ")}마디 도입·벌스·훅·브레이크·마지막 훅·엔딩. 벌스는 화음을 덜고 마지막 훅에서 전체 악기가 돌아옴.`,
    sound: `${composition.bassStyle} 베이스와 ${composition.key}의 짧은 모티프. A의 절제된 응답, B의 높은 훅, C의 분산된 긴 음으로 대비.`,
    mix: "중앙 킥·저역, 좌측 짧은 신스, 우측 낮은 화음. 하이햇은 낮게 두고 백비트와 발음 공간을 강조.",
    originality: "키·템포·드럼·베이스·모티프·훅·화음·톤을 직접 저작한 편집 가능한 인스트루멘털. 보컬과 가사 없음."
  },
  arrangement: [
    { bars: composition.bars[0], energy: 0.42, mutedTracks: ["drum_rack", "bass_808"], pattern: "C", section: "Intro" },
    { bars: composition.bars[1], energy: 0.8, mutedTracks: ["chord"], pattern: "A", section: "Verse" },
    { bars: composition.bars[2], energy: 0.94, mutedTracks: [], pattern: "B", section: "Hook" },
    { bars: composition.bars[3], energy: 0.56, mutedTracks: ["bass_808"], pattern: "C", section: "Bridge" },
    { bars: composition.bars[4], energy: 1, mutedTracks: [], pattern: "B", section: "Hook" },
    { bars: composition.bars[5], energy: 0.38, mutedTracks: ["drum_rack", "bass_808"], pattern: "C", section: "Outro" }
  ]
}));

export function composeDarkRapProject(base, config, workstation) {
  const trap = config.id === "trap";
  const low = workstation.scalePitches(config.key, trap ? 1 : 2);
  const melody = workstation.scalePitches(config.key, 3);
  const hookPitches = workstation.scalePitches(config.key, 4);
  const roots = workstation.scalePitchNames(config.key);
  const patterns = Object.fromEntries(["A", "B", "C"].map((slot) => {
    const hook = slot === "B";
    const sparse = slot === "C";
    const rhythm = {
      kick: sparse ? [0, 10] : hook ? [...new Set([...config.kicks, trap ? 12 : 11])] : config.kicks,
      clap: sparse ? [config.snares[0]] : config.snares,
      hat: sparse ? [2, 6, 10, 14] : config.hats,
      perc: sparse ? [15] : hook ? [...new Set([...config.percs, 14])] : config.percs
    };
    const lanes = (fn) => Object.fromEntries(Object.keys(rhythm).map((lane) => [lane, Array.from({ length: 16 }, (_, step) => fn(lane, step))]));
    const degrees = hook ? config.hookDegrees : config.degrees;
    const motif = hook ? config.hook : sparse ? config.motif.filter((_, index) => index % 2 === 0) : config.motif;
    const bassMotif = sparse ? [[0, 0, 6], [10, degrees[1], 5]] : config.bass;
    return [slot, {
      drumPattern: lanes((lane, step) => rhythm[lane].includes(step)),
      drumVelocities: lanes((lane, step) => lane === "kick" ? step === 0 ? 0.96 : 0.82 : lane === "clap" ? 0.9 : lane === "hat" ? step % 4 === 0 ? 0.51 : 0.32 : 0.38),
      drumTimings: lanes((lane, step) => lane === "clap" ? trap ? 0 : 7 : lane === "hat" && step % 2 === 1 ? -2 : 0),
      drumProbabilities: lanes(() => 1),
      hatRepeats: Array.from({ length: 16 }, (_, step) => !sparse && config.rolls.includes(step) ? hook ? 3 : 2 : 1),
      bassNotes: bassMotif.map(([step, degree, length], index) => ({ step, pitch: low[hook && step >= 8 ? degrees[1] : degree], length: Math.min(16 - step, length), velocity: index === 0 ? 0.87 : 0.72, glide: trap && !sparse && index === bassMotif.length - 1, probability: 1 })),
      melodyNotes: motif.map(([step, degree, length]) => ({ step, pitch: (hook ? hookPitches : melody)[degree], length: Math.min(16 - step, sparse ? length + 2 : length), velocity: sparse ? 0.48 : hook ? 0.68 : 0.58, probability: 1 })),
      chordEvents: degrees.map((degree, index) => ({ step: index * 8, root: roots[degree], quality: [0, 3, 4].includes(degree) ? "m7" : degree === 1 ? "dim" : "maj", inversion: hook ? 1 : 0, length: sparse ? 6 : hook ? 4 : 2, velocity: hook ? 0.5 : 0.43, probability: 1 }))
    }];
  }));
  return {
    ...base, key: config.key, bpm: config.bpm, swing: config.swing, patterns,
    ...(config.order === 3 ? { drumSamples: replaceDrumSample(base.drumSamples, "perc", createOriginalRapPercussion()) } : {}),
    sound: { ...base.sound, preset: "custom", ...config.tone },
    mixer: base.mixer.map((channel) => ({ ...channel, muted: false, solo: false, ...({
      drum_rack: { volumeDb: -2.5, pan: 0, lowCut: 0.02, air: 0.12, drive: 0.12, glue: 0.25, send: 0.035 },
      bass_808: { volumeDb: trap ? -6 : -5.8, pan: 0, lowCut: 0, air: 0, drive: trap ? 0.22 : 0.09, glue: 0.14, send: 0 },
      synth: { volumeDb: -9, pan: -11, lowCut: 0.3, air: 0.14, drive: 0.14, glue: 0.08, send: 0.13 },
      chord: { volumeDb: -12, pan: 13, lowCut: 0.4, air: 0.09, drive: 0.04, glue: 0.08, send: 0.19 },
      master: { volumeDb: 2, pan: 0, lowCut: 0, air: 0, drive: 0, glue: 0.07, send: 0 }
    }[channel.id] ?? {}) }))
  };
}
