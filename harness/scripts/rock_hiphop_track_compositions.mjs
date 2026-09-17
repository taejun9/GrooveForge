#!/usr/bin/env node

/**
 * 역할: 록·힙합의 넓은 음악 어휘로 서로 다른 오리지널 합성 인스트루멘털 다섯 곡을 저작한다.
 * 흐름: 곡별 키·리듬·리프를 A/B/C 이벤트로 만들고 드라이브와 백비트, 훅·브리지 대비를 적용한다.
 * 안전 경계: 외부 오디오나 실제 기타 녹음을 사용하지 않으며 기존 블루프린트의 음악 이벤트를 재사용하지 않는다.
 */

export const rockHiphopLaneContract = [
  { count: 5, id: "synth-rock-hiphop", name: "합성 리프 록·힙합" }
];

const compositions = [
  {
    id: "k_hiphop_rnb", blueprintId: "seoul_pocket", bassStyle: "sub", bpm: 112, key: "E minor",
    title: "비가 끝난 트랙", mood: "젖은 도로, 회복, 선명함", variant: "멜로딕 록·힙합",
    riff: [[0, 0, 2], [3, 2, 1], [6, 4, 2], [8, 3, 2], [11, 2, 1], [14, 1, 2]],
    hook: [[0, 4, 3], [3, 6, 1], [4, 7, 2], [7, 6, 1], [8, 4, 3], [12, 2, 2], [14, 1, 2]],
    kicks: [0, 3, 7, 8, 10], chordDegrees: [0, 5], hookDegrees: [3, 6],
    bars: [4, 12, 12, 8, 16, 4], swing: 0.03, release: 0.24
  },
  {
    id: "experimental", blueprintId: "experimental_pulse", bassStyle: "reese", bpm: 126, key: "F# minor",
    title: "유리 엔진", mood: "단단함, 전압, 긴장", variant: "인더스트리얼 록·힙합",
    riff: [[0, 0, 1], [2, 0, 1], [5, 4, 1], [7, 3, 1], [8, 0, 2], [11, 6, 1], [14, 4, 2]],
    hook: [[0, 7, 2], [2, 4, 2], [5, 6, 2], [8, 3, 3], [12, 4, 2], [14, 2, 2]],
    kicks: [0, 2, 6, 8, 11, 14], chordDegrees: [0, 6], hookDegrees: [5, 3],
    bars: [8, 12, 16, 8, 16, 4], swing: 0, release: 0.12
  },
  {
    id: "trap", blueprintId: "trap_bounce", bassStyle: "808", bpm: 138, key: "A minor",
    title: "다시 뛰는 밤", mood: "야간, 도약, 해방", variant: "앤섬 록·힙합",
    riff: [[0, 0, 2], [2, 4, 2], [5, 2, 1], [8, 5, 2], [10, 4, 1], [12, 2, 2], [15, 0, 1]],
    hook: [[0, 2, 2], [2, 4, 2], [4, 7, 3], [8, 6, 2], [10, 4, 2], [12, 5, 2], [14, 4, 2]],
    kicks: [0, 3, 6, 8, 10, 15], chordDegrees: [0, 3], hookDegrees: [5, 6],
    bars: [4, 16, 12, 8, 16, 8], swing: 0.02, release: 0.32
  },
  {
    id: "phonk", blueprintId: "phonk_cruise", bassStyle: "808", bpm: 148, key: "D minor",
    title: "붉은 지평선", mood: "붉은 하늘, 돌진, 거침", variant: "펑크 록·힙합",
    riff: [[0, 0, 1], [2, 0, 1], [4, 2, 1], [6, 4, 1], [8, 6, 1], [10, 4, 1], [12, 3, 1], [14, 2, 2]],
    hook: [[0, 7, 3], [4, 6, 2], [6, 4, 2], [8, 5, 3], [12, 4, 2], [14, 2, 2]],
    kicks: [0, 2, 6, 8, 10, 14], chordDegrees: [0, 6], hookDegrees: [3, 5],
    bars: [4, 12, 16, 12, 16, 4], swing: 0, release: 0.16
  },
  {
    id: "jersey", blueprintId: "jersey_drive", bassStyle: "sub", bpm: 156, key: "C minor",
    title: "마지막 불빛을 지나", mood: "새벽, 속도, 희망", variant: "업템포 록·힙합",
    riff: [[0, 0, 2], [3, 4, 1], [4, 3, 2], [7, 2, 1], [8, 0, 2], [11, 6, 1], [12, 4, 2], [15, 1, 1]],
    hook: [[0, 4, 2], [2, 7, 2], [4, 6, 3], [8, 7, 2], [10, 4, 2], [12, 3, 3]],
    kicks: [0, 3, 7, 8, 11, 14], chordDegrees: [0, 5], hookDegrees: [6, 3],
    bars: [8, 12, 12, 8, 16, 8], swing: 0.01, release: 0.2
  }
];

// 모든 편곡은 64마디 안에서 90~180초를 충족한다. 도입·벌스·훅·브리지·마지막 훅·엔딩은
// 같은 이벤트라도 에너지와 트랙 뮤트가 달라지며 마지막 훅에는 저역과 화음이 함께 돌아온다.
export const rockHiphopCases = compositions.map((composition, index) => ({
  ...composition,
  order: index + 1,
  styleName: composition.variant,
  masterAutomation: "intro_outro",
  productionLaneId: rockHiphopLaneContract[0].id,
  productionLaneName: rockHiphopLaneContract[0].name,
  tags: ["rock-hip-hop", "synth-riff", "melodic", "instrumental", "sample-free"],
  vibe: `${composition.mood}의 정서를 합성 리프와 강한 백비트, 멜로딕 훅으로 표현한 ${composition.variant}`,
  productionBrief: {
    arrangement: `${composition.bars.join(" / ")}마디의 도입·벌스·훅·브리지·마지막 훅·엔딩, 트랙 뮤트와 에너지 대비.`,
    sound: "기타를 연상시키는 왜곡된 신스 리프와 독립적인 상행·하행 훅. 실제 기타 녹음 없이 내장 합성으로 제작.",
    mix: "2·4박 백비트, 중앙 베이스, 좌측 리프와 우측 화음. 드라이브를 사용하되 짧은 잔향으로 선명도를 유지.",
    originality: "곡별 키·템포·리듬·리프·훅·화성을 별도로 저작한 편집 가능한 음악 이벤트. 보컬과 가사는 포함하지 않음."
  },
  arrangement: [
    { bars: composition.bars[0], energy: 0.48, mutedTracks: ["drum_rack", "bass_808"], pattern: "C", section: "Intro" },
    { bars: composition.bars[1], energy: 0.78, mutedTracks: ["chord"], pattern: "A", section: "Verse" },
    { bars: composition.bars[2], energy: 0.96, mutedTracks: [], pattern: "B", section: "Hook" },
    { bars: composition.bars[3], energy: 0.58, mutedTracks: ["bass_808"], pattern: "C", section: "Bridge" },
    { bars: composition.bars[4], energy: 1, mutedTracks: [], pattern: "B", section: "Hook" },
    { bars: composition.bars[5], energy: 0.45, mutedTracks: ["drum_rack", "bass_808"], pattern: "C", section: "Outro" }
  ]
}));

export function composeRockHiphopProject(base, config, workstation) {
  const low = workstation.scalePitches(config.key, 2);
  const riffPitches = workstation.scalePitches(config.key, 3);
  const hookPitches = workstation.scalePitches(config.key, 4);
  const chordRoots = workstation.scalePitchNames(config.key);
  const patterns = Object.fromEntries(["A", "B", "C"].map((slot) => {
    const hook = slot === "B";
    const bridge = slot === "C";
    const pitches = hook ? hookPitches : riffPitches;
    const motif = hook ? config.hook : bridge ? config.riff.filter((_, index) => index % 2 === 0) : config.riff;
    const rhythm = {
      kick: bridge ? [0, 8] : hook ? [...new Set([...config.kicks, 12])] : config.kicks,
      clap: [4, 12],
      hat: bridge ? [0, 4, 8, 12] : [0, 2, 4, 6, 8, 10, 12, 14, ...(hook ? [15] : [])],
      perc: bridge ? [14] : hook ? [3, 7, 11, 15] : [6, 14]
    };
    const drumPattern = Object.fromEntries(Object.entries(rhythm).map(([lane, onsets]) => [lane, Array.from({ length: 16 }, (_, step) => onsets.includes(step))]));
    const drumVelocities = Object.fromEntries(Object.keys(rhythm).map((lane) => [lane, Array.from({ length: 16 }, (_, step) => lane === "clap" ? 0.96 : lane === "kick" ? (step % 4 === 0 ? 0.96 : 0.8) : lane === "hat" ? (step % 4 === 0 ? 0.64 : 0.42) : 0.45)]));
    const drumTimings = Object.fromEntries(Object.keys(rhythm).map((lane) => [lane, Array.from({ length: 16 }, () => lane === "clap" && config.swing > 0 ? 4 : 0)]));
    const drumProbabilities = Object.fromEntries(Object.keys(rhythm).map((lane) => [lane, Array(16).fill(1)]));
    const degrees = hook ? config.hookDegrees : config.chordDegrees;
    return [slot, {
      drumPattern, drumVelocities, drumTimings, drumProbabilities,
      hatRepeats: Array.from({ length: 16 }, (_, step) => hook && step === 15 ? 2 : 1),
      bassNotes: (bridge ? [0, 8] : [0, 3, 6, 8, 11, 14]).map((step) => ({
        step, pitch: low[degrees[step < 8 ? 0 : 1]], length: bridge ? 5 : step % 8 === 0 ? 2 : 1,
        velocity: step % 8 === 0 ? 0.86 : 0.68, glide: false, probability: 1
      })),
      melodyNotes: motif.map(([step, degree, length]) => ({ step, pitch: pitches[degree], length: Math.min(bridge ? length + 2 : length, 16 - step), velocity: hook ? 0.8 : bridge ? 0.58 : 0.76, probability: 1 })),
      chordEvents: degrees.map((degree, index) => ({ step: index * 8, root: chordRoots[degree], quality: [0, 3, 4].includes(degree) ? "min" : "maj", inversion: hook ? 1 : 0, length: bridge ? 7 : hook ? 6 : 3, velocity: hook ? 0.68 : 0.5, probability: 1 }))
    }];
  }));
  return {
    ...base, key: config.key, bpm: config.bpm, swing: config.swing, patterns,
    sound: { ...base.sound, preset: "custom", kickPunch: 0.82, snareSnap: 0.88, hatBrightness: 0.55, bassDrive: 0.58, bassDecay: 0.42, sidechainDuck: 0.35, synthBrightness: 0.88, synthRelease: config.release, chordWarmth: 0.48, chordWidth: 0.64 },
    mixer: base.mixer.map((channel) => ({ ...channel, muted: false, solo: false, ...({
      drum_rack: { volumeDb: -3.5, pan: 0, lowCut: 0.04, air: 0.25, drive: 0.18, glue: 0.35, send: 0.05 },
      bass_808: { volumeDb: -7.8, pan: 0, lowCut: 0.02, air: 0.05, drive: 0.3, glue: 0.24, send: 0.02 },
      synth: { volumeDb: -6, pan: -12, lowCut: 0.24, air: 0.25, drive: 0.72, glue: 0.24, send: 0.16 },
      chord: { volumeDb: -10, pan: 14, lowCut: 0.3, air: 0.18, drive: 0.38, glue: 0.22, send: 0.22 },
      master: { volumeDb: -1, pan: 0, lowCut: 0, air: 0, drive: 0, glue: 0.08, send: 0 }
    }[channel.id] ?? {}) }))
  };
}
