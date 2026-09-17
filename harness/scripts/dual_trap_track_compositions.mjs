#!/usr/bin/env node

/**
 * 역할: 거친 크루 에너지와 여유로운 저역 포켓을 각각 세 곡의 독립 인스트루멘털로 저작한다.
 * 흐름: 곡마다 별도의 키·템포·킥·베이스·모티프·훅·톤을 A/B/C 이벤트로 구성하고 전체곡 편곡을 붙인다.
 * 안전 경계: 블루프린트의 이벤트, 외부 음원, 보컬, 가사를 재사용하지 않고 로컬 합성만 사용한다.
 */

export const dualTrapLaneContract = [
  { count: 3, id: "crew-energy-trap", name: "거친 크루 에너지 트랩" },
  { count: 3, id: "low-pocket-trap", name: "여유로운 저역 포켓 트랩" }
];

const compositions = [
  {
    id: "trap", blueprintId: "trap_bounce", bassStyle: "808", bpm: 140, key: "F minor",
    title: "철야 집결", mood: "단결, 밤거리, 전진", variant: "크루 바운스 트랩",
    motif: [[0, 0, 1], [3, 2, 1], [6, 1, 1], [8, 0, 2], [11, 4, 1], [14, 3, 2]],
    hook: [[0, 4, 2], [2, 3, 1], [5, 6, 2], [8, 4, 3], [12, 2, 2], [15, 0, 1]],
    bass: [[0, 0, 3], [3, 0, 1], [6, 0, 2], [8, 5, 3], [11, 4, 1], [14, 0, 2]],
    kicks: [0, 3, 6, 10, 14], hats: [0, 2, 4, 6, 8, 10, 11, 14], percs: [5, 15], rolls: [11, 14],
    degrees: [0, 5], hookDegrees: [3, 4], bars: [4, 16, 12, 8, 16, 4], swing: 0.03,
    tone: { kickPunch: 0.88, snareSnap: 0.9, hatBrightness: 0.63, bassDrive: 0.57, bassDecay: 0.5, sidechainDuck: 0.4, synthBrightness: 0.7, synthRelease: 0.13, chordWarmth: 0.35, chordWidth: 0.46 }
  },
  {
    id: "drill", blueprintId: "dark_808", bassStyle: "808", bpm: 146, key: "F# minor",
    title: "지하층의 함성", mood: "거침, 밀도, 긴장", variant: "지하실 스트라이크 트랩",
    motif: [[1, 0, 2], [4, 4, 1], [7, 1, 1], [9, 0, 2], [13, 6, 1], [15, 4, 1]],
    hook: [[0, 7, 2], [3, 6, 1], [4, 4, 3], [8, 3, 2], [11, 4, 2], [14, 2, 2]],
    bass: [[0, 0, 4], [5, 0, 2], [7, 4, 1], [10, 6, 3], [13, 4, 1], [15, 0, 1]],
    kicks: [0, 5, 7, 10, 13, 15], hats: [0, 2, 5, 6, 8, 10, 12, 13, 15], percs: [3, 11], rolls: [6, 13],
    degrees: [0, 6], hookDegrees: [5, 4], bars: [8, 12, 16, 4, 16, 8], swing: 0.01,
    tone: { kickPunch: 0.94, snareSnap: 0.82, hatBrightness: 0.47, bassDrive: 0.68, bassDecay: 0.38, sidechainDuck: 0.48, synthBrightness: 0.51, synthRelease: 0.19, chordWarmth: 0.44, chordWidth: 0.36 }
  },
  {
    id: "phonk", blueprintId: "phonk_cruise", bassStyle: "808", bpm: 154, key: "G minor",
    title: "불꽃 차선", mood: "속도, 열기, 도약", variant: "스파크 러시 트랩",
    motif: [[0, 0, 1], [2, 3, 1], [5, 4, 1], [7, 2, 1], [10, 0, 1], [12, 6, 2], [15, 4, 1]],
    hook: [[0, 4, 2], [3, 7, 1], [4, 6, 2], [7, 4, 1], [8, 5, 3], [12, 3, 2], [14, 2, 2]],
    bass: [[0, 0, 2], [2, 0, 2], [5, 4, 2], [8, 5, 2], [11, 5, 1], [14, 4, 2]],
    kicks: [0, 2, 5, 8, 11, 14], hats: [0, 1, 4, 6, 8, 9, 12, 14], percs: [7, 15], rolls: [9, 14],
    degrees: [0, 5], hookDegrees: [6, 3], bars: [4, 16, 16, 8, 16, 4], swing: 0.02,
    tone: { kickPunch: 0.78, snareSnap: 0.96, hatBrightness: 0.74, bassDrive: 0.49, bassDecay: 0.33, sidechainDuck: 0.34, synthBrightness: 0.83, synthRelease: 0.09, chordWarmth: 0.28, chordWidth: 0.58 }
  },
  {
    id: "rnb", blueprintId: "rnb_pocket", bassStyle: "sub", bpm: 96, key: "D minor",
    title: "낮은 구름 아래", mood: "여유, 따뜻함, 부유", variant: "딥 서브 포켓 트랩",
    motif: [[1, 2, 2], [6, 4, 2], [10, 1, 3], [15, 0, 1]],
    hook: [[0, 4, 3], [5, 6, 2], [8, 4, 2], [12, 2, 3]],
    bass: [[0, 0, 5], [7, 4, 1], [9, 5, 5]],
    kicks: [0, 6, 9], hats: [0, 3, 4, 6, 8, 11, 14], percs: [7], rolls: [14],
    degrees: [0, 5], hookDegrees: [3, 6], bars: [4, 12, 12, 4, 12, 4], swing: 0.15,
    tone: { kickPunch: 0.55, snareSnap: 0.54, hatBrightness: 0.31, bassDrive: 0.19, bassDecay: 0.79, sidechainDuck: 0.26, synthBrightness: 0.29, synthRelease: 0.47, chordWarmth: 0.83, chordWidth: 0.7 }
  },
  {
    id: "k_hiphop_rnb", blueprintId: "seoul_pocket", bassStyle: "sub", bpm: 104, key: "A minor",
    title: "뒷좌석의 오후", mood: "햇빛, 느긋함, 고개 끄덕임", variant: "웜 백시트 트랩",
    motif: [[0, 0, 3], [5, 2, 1], [9, 4, 2], [14, 1, 2]],
    hook: [[1, 2, 2], [4, 4, 3], [9, 6, 2], [13, 4, 3]],
    bass: [[0, 0, 4], [6, 2, 2], [10, 6, 4], [15, 4, 1]],
    kicks: [0, 3, 10, 15], hats: [0, 2, 5, 8, 10, 13, 14], percs: [6, 15], rolls: [13],
    degrees: [0, 6], hookDegrees: [5, 3], bars: [4, 12, 12, 8, 12, 4], swing: 0.19,
    tone: { kickPunch: 0.63, snareSnap: 0.61, hatBrightness: 0.39, bassDrive: 0.25, bassDecay: 0.71, sidechainDuck: 0.3, synthBrightness: 0.36, synthRelease: 0.35, chordWarmth: 0.76, chordWidth: 0.62 }
  },
  {
    id: "jersey", blueprintId: "jersey_drive", bassStyle: "sub", bpm: 116, key: "E minor",
    title: "새벽 순항", mood: "잔잔함, 도시, 흐름", variant: "미드나이트 크루즈 트랩",
    motif: [[2, 4, 2], [7, 2, 2], [11, 0, 3], [15, 1, 1]],
    hook: [[0, 6, 3], [4, 4, 2], [8, 3, 3], [13, 2, 2]],
    bass: [[0, 0, 5], [5, 4, 2], [9, 3, 4], [14, 4, 2]],
    kicks: [0, 5, 9, 14], hats: [1, 2, 4, 7, 8, 10, 12, 15], percs: [3, 13], rolls: [15],
    degrees: [0, 3], hookDegrees: [6, 4], bars: [4, 16, 12, 8, 12, 4], swing: 0.12,
    tone: { kickPunch: 0.59, snareSnap: 0.68, hatBrightness: 0.44, bassDrive: 0.15, bassDecay: 0.84, sidechainDuck: 0.22, synthBrightness: 0.43, synthRelease: 0.56, chordWarmth: 0.68, chordWidth: 0.78 }
  }
];

// 세 패턴의 악기 수·선율·베이스가 달라지며 두 번째 훅은 에너지를 높여 전곡의 도착점을 만든다.
export const dualTrapCases = compositions.map((composition, index) => {
  const crew = index < 3;
  const lane = dualTrapLaneContract[crew ? 0 : 1];
  return {
    ...composition, order: index + 1, styleName: composition.variant, masterAutomation: "intro_outro",
    productionLaneId: lane.id, productionLaneName: lane.name,
    tags: ["trap", crew ? "crew-energy" : "deep-sub", crew ? "high-energy" : "laid-back", "instrumental", "sample-free"],
    vibe: `${composition.mood}의 정서를 ${crew ? "짧은 신스 모티프, 단단한 808과 하프타임 드럼" : "깊은 서브베이스, 늦게 놓인 스네어와 넓은 선율 여백"}으로 담은 ${composition.variant}`,
    productionBrief: {
      arrangement: `${composition.bars.join(" / ")}마디 도입·벌스·훅·브레이크·마지막 훅·엔딩. 도입과 엔딩은 드럼·저역을 덜고 브레이크는 킥과 하이햇 밀도를 줄임.`,
      sound: crew ? "거친 808, 짧고 밝은 신스, 응답하는 상행 훅. 곡별 드라이브·엔벌로프·롤 위치가 다름." : "지속하는 서브베이스, 부드러운 신스와 넓은 화음. 곡별 스윙·릴리스·저역 길이가 다름.",
      mix: crew ? "중앙 킥·808, 짧은 드럼 잔향, 좌우로 나눈 신스와 화음. 훅에서 에너지와 악기 수가 함께 증가." : "중앙의 깊은 저역, 작은 하이햇, 늦은 스네어와 낮은 악기 밀도. 화음 잔향은 저역과 분리.",
      originality: "곡별 키·템포·킥·베이스·모티프·훅·화음·톤을 별도로 작성한 이벤트 기반 인스트루멘털. 보컬과 가사 없음."
    },
    arrangement: [
      { bars: composition.bars[0], energy: crew ? 0.44 : 0.4, mutedTracks: ["drum_rack", "bass_808"], pattern: "C", section: "Intro" },
      { bars: composition.bars[1], energy: crew ? 0.78 : 0.67, mutedTracks: ["chord"], pattern: "A", section: "Verse" },
      { bars: composition.bars[2], energy: crew ? 0.94 : 0.85, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: composition.bars[3], energy: crew ? 0.55 : 0.49, mutedTracks: ["bass_808"], pattern: "C", section: "Bridge" },
      { bars: composition.bars[4], energy: crew ? 1 : 0.91, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: composition.bars[5], energy: crew ? 0.38 : 0.35, mutedTracks: ["drum_rack", "bass_808"], pattern: "C", section: "Outro" }
    ]
  };
});

export function composeDualTrapProject(base, config, workstation) {
  const crew = config.productionLaneId === "crew-energy-trap";
  const bassPitches = workstation.scalePitches(config.key, 1);
  const melodyPitches = workstation.scalePitches(config.key, crew ? 4 : 3);
  const hookPitches = workstation.scalePitches(config.key, 4);
  const chordRoots = workstation.scalePitchNames(config.key);
  const patterns = Object.fromEntries(["A", "B", "C"].map((slot) => {
    const hook = slot === "B";
    const sparse = slot === "C";
    const rhythm = {
      kick: sparse ? [0, 10] : hook ? [...new Set([...config.kicks, crew ? 12 : 7])] : config.kicks,
      clap: sparse ? [8] : hook && crew ? [8, 15] : [8],
      hat: sparse ? [2, 6, 10, 14] : hook ? [...new Set([...config.hats, crew ? 15 : 12])] : config.hats,
      perc: sparse ? [14] : config.percs
    };
    const laneValues = (fn) => Object.fromEntries(Object.keys(rhythm).map((lane) => [lane, Array.from({ length: 16 }, (_, step) => fn(lane, step))]));
    const degrees = hook ? config.hookDegrees : config.degrees;
    const motif = hook ? config.hook : sparse ? config.motif.filter((_, index) => index % 2 === 0) : config.motif;
    const bassMotif = sparse ? [[0, 0, 6], [9, degrees[1], 5]] : config.bass;
    return [slot, {
      drumPattern: laneValues((lane, step) => rhythm[lane].includes(step)),
      drumVelocities: laneValues((lane, step) => lane === "kick" ? (step === 0 ? 0.96 : crew ? 0.84 : 0.76) : lane === "clap" ? (step === 8 ? crew ? 0.93 : 0.74 : 0.37) : lane === "hat" ? (step % 4 === 0 ? crew ? 0.55 : 0.4 : crew ? 0.36 : 0.28) : crew ? 0.42 : 0.3),
      drumTimings: laneValues((lane, step) => lane === "clap" ? crew ? 2 : 11 : lane === "hat" && step % 2 === 1 ? crew ? -2 : 4 : 0),
      drumProbabilities: laneValues(() => 1),
      hatRepeats: Array.from({ length: 16 }, (_, step) => !sparse && rhythm.hat.includes(step) && config.rolls.includes(step) ? hook && crew ? 3 : 2 : 1),
      bassNotes: bassMotif.map(([step, degree, length], index) => ({
        step, pitch: bassPitches[hook && step >= 8 ? degrees[1] : degree],
        length: Math.min(16 - step, hook && index === 0 ? length + 1 : length),
        velocity: crew ? index === 0 ? 0.88 : 0.76 : index === 0 ? 0.82 : 0.7,
        glide: crew && !sparse && index === bassMotif.length - 1, probability: 1
      })),
      melodyNotes: motif.map(([step, degree, length]) => ({ step, pitch: (hook ? hookPitches : melodyPitches)[degree], length: Math.min(16 - step, sparse ? length + 2 : length), velocity: sparse ? 0.48 : crew ? hook ? 0.7 : 0.6 : hook ? 0.61 : 0.52, probability: 1 })),
      chordEvents: degrees.map((degree, index) => ({ step: index * 8, root: chordRoots[degree], quality: [0, 3, 4].includes(degree) ? "m7" : degree === 1 ? "dim" : "maj", inversion: hook ? 1 : 0, length: crew ? sparse ? 6 : 3 : 7, velocity: crew ? 0.47 : 0.52, probability: 1 }))
    }];
  }));
  return {
    ...base, key: config.key, bpm: config.bpm, swing: config.swing, patterns,
    sound: { ...base.sound, preset: "custom", ...config.tone },
    mixer: base.mixer.map((channel) => ({ ...channel, muted: false, solo: false, ...({
      drum_rack: { volumeDb: crew ? -3 : -4, pan: 0, lowCut: 0.02, air: crew ? 0.16 : 0.08, drive: crew ? 0.13 : 0.04, glue: crew ? 0.24 : 0.16, send: 0.04 },
      bass_808: { volumeDb: crew ? -6.6 : -5.4, pan: 0, lowCut: 0, air: 0, drive: crew ? 0.23 : 0.08, glue: 0.16, send: 0 },
      synth: { volumeDb: crew ? -8.2 : -9.5, pan: crew ? -12 : -8, lowCut: 0.3, air: crew ? 0.2 : 0.1, drive: crew ? 0.24 : 0.03, glue: 0.1, send: crew ? 0.12 : 0.23 },
      chord: { volumeDb: crew ? -13 : -11.5, pan: crew ? 14 : 10, lowCut: 0.38, air: 0.12, drive: 0.03, glue: 0.08, send: crew ? 0.15 : 0.3 },
      master: { volumeDb: crew ? -1 : 3, pan: 0, lowCut: 0, air: 0, drive: 0, glue: 0.06, send: 0 }
    }[channel.id] ?? {}) }))
  };
}
