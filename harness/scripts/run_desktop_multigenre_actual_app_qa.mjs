#!/usr/bin/env node

/**
 * 역할: 실제 Electron 앱 화면에서 대표 6장르, 전체 16장르 또는 요청형 7곡 프로젝트를 순차 검수하고 SoundCloud 전달용 WAV·보고서를 조립한다.
 * 흐름: 기본 90~150초 대표 모드와 opt-in 90~180초 전체 장르/요청형 힙합 팩 모드의 fixture를 준비해 visible UI QA와 PCM24·재열기 증거를 검증한다.
 * 안전 경계: 생성 음원은 로컬 원본 합성만 사용하고 외부 업로드는 하지 않으며, 경로·해시·신호 검증 실패 시 패키징을 중단한다.
 */

import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import {
  copyFile,
  lstat,
  mkdir,
  readFile,
  readdir,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const desktopBuildRoot = path.join(root, "build", "desktop");
let planId = "plan-1528-desktop-app-multigenre-ui-qa";
let ownerMarker = "GrooveForge plan-1528 multi-genre actual-app QA";
const fixedSourceSavedAt = "2026-08-31T00:00:00.000Z";
const minimumDurationSeconds = 90;
let maximumDurationSeconds = 150;
const maximumSoundCloudBytes = 4_000_000_000;
const expectedWav = {
  audioFormat: 1,
  bitDepth: 24,
  blockAlign: 6,
  byteRate: 264_600,
  channels: 2,
  sampleRate: 44_100
};

const workstation = await import("../../src/domain/workstation.ts");
const render = await import("../../src/audio/render.ts");

const representativeGenreCases = [
  {
    arrangement: [
      { bars: 4, energy: 0.34, mutedTracks: ["drum_rack", "bass_808"], pattern: "C", section: "Intro" },
      { bars: 8, energy: 0.58, mutedTracks: [], pattern: "A", section: "Verse" },
      { bars: 8, energy: 0.82, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.48, mutedTracks: ["drum_rack"], pattern: "C", section: "Bridge" },
      { bars: 8, energy: 0.66, mutedTracks: ["bass_808"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "minimal",
    blueprintId: "ballad_canvas",
    bpm: 72,
    id: "ballad",
    masterAutomation: "intro_outro",
    mood: "새벽, 서정적, 여백, 따뜻함",
    order: 1,
    styleName: "Ballad",
    tags: ["ballad", "piano", "warm", "instrumental", "original"],
    title: "유리창의 새벽",
    vibe: "절제된 드럼과 열린 화음이 천천히 커지는 서정적 발라드"
  },
  {
    arrangement: [
      { bars: 4, energy: 0.42, mutedTracks: ["synth"], pattern: "A", section: "Intro" },
      { bars: 12, energy: 0.68, mutedTracks: [], pattern: "A", section: "Verse" },
      { bars: 8, energy: 0.92, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.62, mutedTracks: ["chord"], pattern: "C", section: "Verse" },
      { bars: 8, energy: 0.88, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 4, energy: 0.46, mutedTracks: ["drum_rack", "synth"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "walking",
    blueprintId: "hiphop_pocket",
    bpm: 90,
    id: "hiphop",
    masterAutomation: "intro_outro",
    mood: "도시, 묵직함, 집중, 여유",
    order: 2,
    styleName: "Hip-Hop",
    tags: ["hip-hop", "boom-bap", "pocket", "instrumental", "original"],
    title: "골목의 좌표",
    vibe: "헤드노드 드럼과 움직이는 베이스가 랩 공간을 남기는 힙합"
  },
  {
    arrangement: [
      { bars: 8, energy: 0.38, mutedTracks: ["drum_rack", "bass_808"], pattern: "C", section: "Intro" },
      { bars: 12, energy: 0.72, mutedTracks: [], pattern: "A", section: "Verse" },
      { bars: 12, energy: 0.98, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.52, mutedTracks: ["drum_rack"], pattern: "C", section: "Bridge" },
      { bars: 16, energy: 1, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.44, mutedTracks: ["synth", "chord"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "808",
    blueprintId: "trap_bounce",
    bpm: 145,
    id: "trap",
    masterAutomation: "intro_outro",
    mood: "네온, 긴장, 강렬함, 속도",
    order: 3,
    styleName: "Trap",
    tags: ["trap", "808", "fast-hats", "instrumental", "original"],
    title: "네온 중력",
    vibe: "빠른 하이햇과 연결된 808 움직임이 대비를 만드는 트랩"
  },
  {
    arrangement: [
      { bars: 4, energy: 0.3, mutedTracks: ["drum_rack"], pattern: "C", section: "Intro" },
      { bars: 8, energy: 0.58, mutedTracks: [], pattern: "A", section: "Verse" },
      { bars: 8, energy: 0.82, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.46, mutedTracks: ["bass_808"], pattern: "C", section: "Bridge" },
      { bars: 8, energy: 0.8, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 4, energy: 0.32, mutedTracks: ["drum_rack", "synth"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "sub",
    blueprintId: "rnb_pocket",
    bpm: 76,
    id: "rnb",
    masterAutomation: "intro_outro",
    mood: "느긋함, 친밀함, 밤, 부드러움",
    order: 4,
    styleName: "R&B",
    tags: ["rnb", "sub-bass", "late-night", "instrumental", "original"],
    title: "느린 대화",
    vibe: "느슨한 포켓과 부드러운 서브 베이스가 보컬 공간을 남기는 R&B"
  },
  {
    arrangement: [
      { bars: 8, energy: 0.36, mutedTracks: ["bass_808"], pattern: "C", section: "Intro" },
      { bars: 12, energy: 0.7, mutedTracks: [], pattern: "A", section: "Verse" },
      { bars: 16, energy: 1, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.5, mutedTracks: ["drum_rack"], pattern: "C", section: "Bridge" },
      { bars: 12, energy: 0.94, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.42, mutedTracks: ["synth"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "pluck",
    blueprintId: "club_bounce",
    bpm: 124,
    id: "house",
    masterAutomation: "intro_outro",
    mood: "새벽, 상승감, 선명함, 움직임",
    order: 5,
    styleName: "House",
    tags: ["house", "four-on-the-floor", "club", "instrumental", "original"],
    title: "새벽 네 시의 빛",
    vibe: "포온더플로어와 플럭 베이스가 긴 상승 곡선을 만드는 하우스"
  },
  {
    arrangement: [
      { bars: 8, energy: 0.28, mutedTracks: ["drum_rack", "bass_808"], pattern: "C", section: "Intro" },
      { bars: 12, energy: 0.56, mutedTracks: [], pattern: "A", section: "Verse" },
      { bars: 12, energy: 0.84, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.4, mutedTracks: ["drum_rack", "chord"], pattern: "C", section: "Bridge" },
      { bars: 8, energy: 0.9, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.34, mutedTracks: ["bass_808", "synth"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "reese",
    blueprintId: "experimental_pulse",
    bpm: 110,
    id: "experimental",
    masterAutomation: "intro_outro",
    mood: "추상적, 공간감, 긴장, 변화",
    order: 6,
    styleName: "Experimental",
    tags: ["experimental", "reese-bass", "ambient", "instrumental", "original"],
    title: "경계의 파동",
    vibe: "불균형 펄스와 리스 베이스, 넓은 신스가 움직이는 실험적 곡"
  }
];

// 전체 장르 모드는 검증된 대표 여섯 곡을 그대로 앞에 두고, 누락된 열 스타일만 전용 블루프린트와 장곡 편곡으로 확장한다.
const additionalGenreCases = [
  {
    arrangement: [
      { bars: 8, energy: 0.32, mutedTracks: ["drum_rack", "bass_808"], pattern: "C", section: "Intro" },
      { bars: 12, energy: 0.7, mutedTracks: ["chord"], pattern: "A", section: "Verse" },
      { bars: 12, energy: 0.96, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.48, mutedTracks: ["drum_rack"], pattern: "C", section: "Bridge" },
      { bars: 16, energy: 1, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.38, mutedTracks: ["synth", "chord"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "808",
    blueprintId: "dark_808",
    bpm: 142,
    id: "drill",
    masterAutomation: "intro_outro",
    mood: "빙점, 긴장, 어둠, 추진력",
    order: 7,
    styleName: "Drill",
    tags: ["drill", "808", "dark", "instrumental", "original"],
    title: "빙점의 궤적",
    vibe: "미끄러지는 808과 어두운 공간, 절제된 드럼 전환이 긴장을 쌓는 드릴"
  },
  {
    arrangement: [
      { bars: 4, energy: 0.36, mutedTracks: ["synth"], pattern: "C", section: "Intro" },
      { bars: 8, energy: 0.68, mutedTracks: [], pattern: "A", section: "Verse" },
      { bars: 8, energy: 0.9, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.58, mutedTracks: ["chord"], pattern: "C", section: "Verse" },
      { bars: 8, energy: 0.86, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.4, mutedTracks: ["drum_rack", "synth"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "walking",
    blueprintId: "boom_bap_knock",
    bpm: 92,
    id: "boom_bap",
    masterAutomation: "intro_outro",
    mood: "먼지, 계단, 묵직함, 여유",
    order: 8,
    styleName: "Boom Bap",
    tags: ["boom-bap", "swing", "warm", "instrumental", "original"],
    title: "먼지 낀 계단",
    vibe: "스윙 드럼과 걷는 베이스, 따뜻한 코드가 고전적인 포켓을 만드는 붐뱁"
  },
  {
    arrangement: [
      { bars: 4, energy: 0.26, mutedTracks: ["drum_rack", "bass_808"], pattern: "C", section: "Intro" },
      { bars: 8, energy: 0.52, mutedTracks: [], pattern: "A", section: "Verse" },
      { bars: 8, energy: 0.76, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.38, mutedTracks: ["drum_rack"], pattern: "C", section: "Bridge" },
      { bars: 8, energy: 0.72, mutedTracks: ["synth"], pattern: "B", section: "Hook" },
      { bars: 4, energy: 0.28, mutedTracks: ["bass_808", "synth"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "minimal",
    blueprintId: "warm_loop",
    bpm: 82,
    id: "lofi",
    masterAutomation: "intro_outro",
    mood: "종이, 오후, 포근함, 흐릿함",
    order: 9,
    styleName: "Lo-fi",
    tags: ["lo-fi", "warm", "study", "instrumental", "original"],
    title: "종이별의 오후",
    vibe: "부드러운 스윙과 최소한의 베이스, 따뜻한 화음이 느린 오후를 그리는 로파이"
  },
  {
    arrangement: [
      { bars: 4, energy: 0.34, mutedTracks: ["drum_rack"], pattern: "C", section: "Intro" },
      { bars: 8, energy: 0.62, mutedTracks: [], pattern: "A", section: "Verse" },
      { bars: 12, energy: 0.88, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.52, mutedTracks: ["chord"], pattern: "C", section: "Verse" },
      { bars: 8, energy: 0.84, mutedTracks: ["synth"], pattern: "B", section: "Hook" },
      { bars: 4, energy: 0.32, mutedTracks: ["drum_rack", "bass_808"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "sub",
    blueprintId: "seoul_pocket",
    bpm: 94,
    id: "k_hiphop_rnb",
    masterAutomation: "intro_outro",
    mood: "서울, 잔상, 세련됨, 밤",
    order: 10,
    styleName: "K-Hip-Hop/R&B",
    tags: ["k-hip-hop", "rnb", "seoul", "instrumental", "original"],
    title: "서울의 잔상",
    vibe: "정돈된 포켓과 깨끗한 서브 베이스, 넓은 코드가 도시의 밤을 남기는 K-힙합/R&B"
  },
  {
    arrangement: [
      { bars: 4, energy: 0.4, mutedTracks: ["bass_808"], pattern: "C", section: "Intro" },
      { bars: 12, energy: 0.7, mutedTracks: [], pattern: "A", section: "Verse" },
      { bars: 12, energy: 0.92, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.56, mutedTracks: ["drum_rack"], pattern: "C", section: "Bridge" },
      { bars: 12, energy: 0.9, mutedTracks: ["chord"], pattern: "B", section: "Hook" },
      { bars: 4, energy: 0.38, mutedTracks: ["synth"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "pluck",
    blueprintId: "afro_swing",
    bpm: 104,
    id: "afrobeats",
    masterAutomation: "intro_outro",
    mood: "햇빛, 보폭, 온기, 리듬",
    order: 11,
    styleName: "Afrobeats",
    tags: ["afrobeats", "syncopation", "warm", "instrumental", "original"],
    title: "햇빛의 보폭",
    vibe: "엇갈린 퍼커션과 구르는 플럭 베이스가 따뜻한 움직임을 만드는 아프로비츠"
  },
  {
    arrangement: [
      { bars: 8, energy: 0.34, mutedTracks: ["bass_808"], pattern: "C", section: "Intro" },
      { bars: 12, energy: 0.64, mutedTracks: [], pattern: "A", section: "Verse" },
      { bars: 12, energy: 0.9, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.46, mutedTracks: ["drum_rack", "synth"], pattern: "C", section: "Bridge" },
      { bars: 12, energy: 0.86, mutedTracks: ["chord"], pattern: "B", section: "Hook" },
      { bars: 4, energy: 0.3, mutedTracks: ["drum_rack", "bass_808"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "pluck",
    blueprintId: "amapiano_log_bass",
    bpm: 112,
    id: "amapiano",
    masterAutomation: "intro_outro",
    mood: "낮은 파문, 공기, 셔플, 깊이",
    order: 12,
    styleName: "Amapiano",
    tags: ["amapiano", "log-bass", "shuffle", "instrumental", "original"],
    title: "낮은 파문",
    vibe: "깊은 로그 베이스와 셔플 퍼커션, 열린 코드가 파문처럼 번지는 아마피아노"
  },
  {
    arrangement: [
      { bars: 4, energy: 0.38, mutedTracks: ["synth"], pattern: "C", section: "Intro" },
      { bars: 12, energy: 0.7, mutedTracks: [], pattern: "A", section: "Verse" },
      { bars: 12, energy: 0.94, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.54, mutedTracks: ["bass_808"], pattern: "C", section: "Bridge" },
      { bars: 8, energy: 0.9, mutedTracks: ["chord"], pattern: "B", section: "Hook" },
      { bars: 4, energy: 0.36, mutedTracks: ["drum_rack", "synth"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "pluck",
    blueprintId: "reggaeton_dembow",
    bpm: 98,
    id: "reggaeton",
    masterAutomation: "intro_outro",
    mood: "호박빛, 회전, 열기, 탄력",
    order: 13,
    styleName: "Reggaeton",
    tags: ["reggaeton", "dembow", "latin", "instrumental", "original"],
    title: "호박빛 회전",
    vibe: "뎀보우 리듬과 짧은 플럭 베이스, 선명한 훅이 원을 그리는 레게톤"
  },
  {
    arrangement: [
      { bars: 8, energy: 0.42, mutedTracks: ["bass_808"], pattern: "C", section: "Intro" },
      { bars: 12, energy: 0.74, mutedTracks: ["chord"], pattern: "A", section: "Verse" },
      { bars: 16, energy: 1, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.58, mutedTracks: ["drum_rack"], pattern: "C", section: "Bridge" },
      { bars: 12, energy: 0.98, mutedTracks: ["synth"], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.4, mutedTracks: ["drum_rack", "chord"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "sub",
    blueprintId: "jersey_drive",
    bpm: 140,
    id: "jersey",
    masterAutomation: "intro_outro",
    mood: "보도블록, 전압, 속도, 번쩍임",
    order: 14,
    styleName: "Jersey Club",
    tags: ["jersey-club", "club", "bounce", "instrumental", "original"],
    title: "보도블록 전압",
    vibe: "잘게 끊긴 킥과 밝은 훅, 빠른 서브 스탭이 튀어 오르는 저지 클럽"
  },
  {
    arrangement: [
      { bars: 8, energy: 0.36, mutedTracks: ["drum_rack"], pattern: "C", section: "Intro" },
      { bars: 12, energy: 0.7, mutedTracks: [], pattern: "A", section: "Verse" },
      { bars: 16, energy: 0.96, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.5, mutedTracks: ["bass_808"], pattern: "C", section: "Bridge" },
      { bars: 12, energy: 0.92, mutedTracks: ["chord"], pattern: "B", section: "Hook" },
      { bars: 4, energy: 0.34, mutedTracks: ["drum_rack", "synth"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "808",
    blueprintId: "phonk_cruise",
    bpm: 132,
    id: "phonk",
    masterAutomation: "intro_outro",
    mood: "크롬, 그림자, 질주, 거침",
    order: 15,
    styleName: "Phonk",
    tags: ["phonk", "distorted", "dark", "instrumental", "original"],
    title: "크롬 그림자",
    vibe: "왜곡된 808과 구르는 드럼, 어두운 반복이 야간 질주를 만드는 퐁크"
  },
  {
    arrangement: [
      { bars: 8, energy: 0.34, mutedTracks: ["bass_808"], pattern: "C", section: "Intro" },
      { bars: 16, energy: 0.68, mutedTracks: [], pattern: "A", section: "Verse" },
      { bars: 16, energy: 0.94, mutedTracks: [], pattern: "B", section: "Hook" },
      { bars: 8, energy: 0.52, mutedTracks: ["drum_rack"], pattern: "C", section: "Bridge" },
      { bars: 12, energy: 0.9, mutedTracks: ["chord"], pattern: "B", section: "Hook" },
      { bars: 4, energy: 0.32, mutedTracks: ["synth"], pattern: "A", section: "Outro" }
    ],
    bassStyle: "pluck",
    blueprintId: "garage_skip",
    bpm: 132,
    id: "garage",
    masterAutomation: "intro_outro",
    mood: "비, 차선, 셔플, 반사광",
    order: 16,
    styleName: "Garage",
    tags: ["garage", "shuffle", "club", "instrumental", "original"],
    title: "비의 차선",
    vibe: "셔플 드럼과 플럭 베이스, 깨끗한 신스가 젖은 차선을 가르는 개러지"
  }
];

const requiredBassStyles = ["808", "minimal", "pluck", "reese", "sub", "walking"];
const allGenreCases = [...representativeGenreCases, ...additionalGenreCases];

function existingGenreCase(id) {
  const config = allGenreCases.find((entry) => entry.id === id);
  if (!config) throw new Error(`Requested-pack source case is missing: ${id}`);
  return config;
}

const requestedLaneContract = [
  { count: 3, id: "dry-grit-rap-pocket", name: "건조하고 거친 랩 포켓" },
  { count: 2, id: "dark-minimal-split-verse", name: "어둡고 미니멀한 분할 벌스 포켓" },
  { count: 2, id: "synth-drive-punk-rap", name: "신스 드라이브 펑크 랩 포켓" }
];

// 요청된 레퍼런스는 특정 창작자의 식별 가능한 작품을 따라 하지 않고, 서로 다른 기존
// StyleProfile/Beat Blueprint 일곱 개를 넓은 제작 특성 3+2+2로 재조합한다.
const requestedHiphopCases = [
  {
    ...existingGenreCase("hiphop"),
    mood: "건조함, 골목, 긴장, 직진",
    order: 1,
    productionBrief: {
      arrangement: "짧은 도입 뒤 랩 공간이 넓은 벌스와 단단한 훅을 교차한다.",
      mix: "드럼은 건조하고 전면에 두며 중역을 비워 보컬이 들어갈 자리를 남긴다.",
      originality: "기존 StyleProfile의 편집 가능한 이벤트만 사용하며 특정 곡, 음색 서명, 보컬 또는 태그를 재현하지 않는다.",
      sound: "걷는 베이스, 짧은 코드, 절제된 신스 응답으로 거친 도시 포켓을 만든다."
    },
    productionLaneId: "dry-grit-rap-pocket",
    productionLaneName: "건조하고 거친 랩 포켓",
    tags: ["hip-hop", "dry-drums", "rap-pocket", "urban", "instrumental", "sample-free"],
    title: "막차의 분필선",
    vibe: "건조한 드럼과 걷는 베이스가 넓은 랩 공간을 남기는 거친 도시 포켓"
  },
  {
    ...existingGenreCase("boom_bap"),
    mood: "먼지, 계단, 거침, 집중",
    order: 2,
    productionBrief: {
      arrangement: "벌스 중심의 반복에 짧은 훅 대비와 드럼이 빠지는 브리지를 둔다.",
      mix: "킥과 스네어의 어택을 선명하게 유지하고 화음과 신스는 뒤로 물린다.",
      originality: "내장 합성과 원본 이벤트만 사용하며 알려진 멜로디, 코드 진행, 가사 또는 녹음을 인용하지 않는다.",
      sound: "스윙 드럼, 낮은 베이스 이동, 짧은 화음 잔향으로 거친 질감을 만든다."
    },
    productionLaneId: "dry-grit-rap-pocket",
    productionLaneName: "건조하고 거친 랩 포켓",
    tags: ["boom-bap", "swing", "gritty", "rap-pocket", "instrumental", "sample-free"],
    title: "회색 계단",
    vibe: "먼지 낀 스윙과 묵직한 킥이 랩의 첫 박을 또렷하게 세우는 건조한 포켓"
  },
  {
    ...existingGenreCase("k_hiphop_rnb"),
    mood: "서울, 새벽, 낮은 천장, 잔상",
    order: 3,
    productionBrief: {
      arrangement: "잔잔한 도입에서 벌스 밀도를 올리고 훅 뒤 다시 여백이 큰 구간으로 돌아온다.",
      mix: "서브는 중앙에 고정하고 드럼의 잔향을 짧게 잘라 도시적인 건조함을 유지한다.",
      originality: "장르 관습을 넓게 참고하되 독립적인 편집 이벤트 구성으로 완성한다.",
      sound: "깨끗한 서브, 낮은 코드 보이싱, 짧은 신스 잔상으로 새벽 랩 포켓을 만든다."
    },
    productionLaneId: "dry-grit-rap-pocket",
    productionLaneName: "건조하고 거친 랩 포켓",
    tags: ["k-hip-hop", "sub-bass", "dry-pocket", "night", "instrumental", "sample-free"],
    title: "낮은 천장",
    vibe: "짧은 잔향과 중앙의 서브가 새벽 도시의 좁고 건조한 랩 공간을 만드는 포켓"
  },
  {
    ...existingGenreCase("drill"),
    mood: "무광, 심야, 절제, 압력",
    order: 4,
    productionBrief: {
      arrangement: "낮은 밀도의 도입과 벌스, 압력이 커지는 훅, 드럼을 걷어낸 브리지를 대비시킨다.",
      mix: "저역 움직임을 중앙에 모으고 신스와 코드는 어둡고 좁게 배치한다.",
      originality: "대비되는 두 벌스 구간을 위한 일반적인 공간을 독립적인 이벤트 구성으로 설계한다.",
      sound: "미끄러지는 808, 최소한의 어두운 코드, 짧은 신스 응답으로 긴장을 만든다."
    },
    productionLaneId: "dark-minimal-split-verse",
    productionLaneName: "어둡고 미니멀한 분할 벌스 포켓",
    tags: ["dark-rap", "minimal", "808", "split-verse", "instrumental", "sample-free"],
    title: "무광의 밤",
    vibe: "어두운 808 움직임과 비워 둔 중역이 대비되는 벌스 구간을 위한 긴장된 공간을 만드는 포켓"
  },
  {
    ...existingGenreCase("trap"),
    mood: "회로, 그림자, 최소주의, 반동",
    order: 5,
    productionBrief: {
      arrangement: "긴 벌스와 강한 훅 사이에 드럼과 화음을 번갈아 걷어내며 두 파트의 대비를 만든다.",
      mix: "808과 킥의 충돌을 줄이고 상단 리듬은 짧고 낮은 레벨로 정리한다.",
      originality: "내장 트랩 어휘를 독립적으로 배열하며 특정 발매작의 훅, 보컬 캐릭터 또는 프로듀서 표식을 사용하지 않는다.",
      sound: "연결된 808, 낮은 화음, 잘게 끊긴 신스와 하이햇으로 미니멀한 압력을 만든다."
    },
    productionLaneId: "dark-minimal-split-verse",
    productionLaneName: "어둡고 미니멀한 분할 벌스 포켓",
    tags: ["trap", "dark", "minimal", "split-verse", "instrumental", "sample-free"],
    title: "닫힌 회로",
    vibe: "닫힌 공간의 808 반동과 최소한의 신스가 대비되는 벌스 구간을 받치는 어두운 포켓"
  },
  {
    ...existingGenreCase("phonk"),
    mood: "점화, 질주, 왜곡, 불꽃",
    order: 6,
    productionBrief: {
      arrangement: "점층적인 도입 뒤 벌스와 고에너지 훅을 반복하고 마지막에는 악기를 빠르게 걷어낸다.",
      mix: "드럼과 베이스 drive를 높이고 synth/chord 어택을 짧게 세워 밴드형 추진감을 만든다.",
      originality: "실제 기타 샘플, 가져온 오디오, 식별 가능한 리프 없이 내장 합성 이벤트만 사용한다.",
      sound: "bass drive, 밝은 synth 어택, 왜곡된 chord stabs로 기타형 질주감을 합성한다."
    },
    productionLaneId: "synth-drive-punk-rap",
    productionLaneName: "신스 드라이브 펑크 랩 포켓",
    tags: ["punk-rap", "synth-drive", "distorted-chords", "high-energy", "instrumental", "sample-free"],
    title: "점화선",
    vibe: "강한 drive와 짧은 신스·코드 어택이 실제 기타 없이 빠른 밴드형 추진감을 만드는 펑크 랩 포켓"
  },
  {
    ...existingGenreCase("jersey"),
    mood: "아스팔트, 전압, 도약, 속도",
    order: 7,
    productionBrief: {
      arrangement: "빠른 도입, 넓은 벌스, 길게 열린 훅과 리듬이 끊기는 브리지를 사용한다.",
      mix: "킥 반동을 전면에 두고 synth/chord의 넓이와 drive로 질주하는 벽을 만든다.",
      originality: "기타 녹음이나 샘플을 쓰지 않고 편집 가능한 melody/chord 이벤트와 내장 합성만 사용한다.",
      sound: "밝은 synth 리드, 압축된 chord stabs, 빠른 서브 움직임으로 기타형 에너지를 만든다."
    },
    productionLaneId: "synth-drive-punk-rap",
    productionLaneName: "신스 드라이브 펑크 랩 포켓",
    tags: ["punk-rap", "synth-chords", "drive", "fast", "instrumental", "sample-free"],
    title: "아스팔트 스프린트",
    vibe: "밝은 신스와 압축된 코드, 튀는 킥이 실제 기타 없이 질주하는 펑크 랩 에너지를 만드는 포켓"
  }
];

let genreCases = representativeGenreCases;
let allGenresMode = false;
let requestedHiphopPackMode = false;
let outputRootPrefix = "plan-1528-";

function configureGenreMode(requestAllGenres, requestRequestedHiphopPack) {
  check(!(requestAllGenres && requestRequestedHiphopPack), "Choose only one of --all-genres or --requested-hiphop-pack.");
  allGenresMode = requestAllGenres;
  requestedHiphopPackMode = requestRequestedHiphopPack;
  if (requestedHiphopPackMode) {
    genreCases = requestedHiphopCases;
    planId = "plan-1532-requested-hiphop-actual-app-qa";
    ownerMarker = "GrooveForge plan-1532 requested hip-hop actual-app QA";
    maximumDurationSeconds = 180;
    outputRootPrefix = "plan-1532-";
  } else if (allGenresMode) {
    genreCases = allGenreCases;
    planId = "plan-1531-install-all-genre-soundcloud";
    ownerMarker = "GrooveForge plan-1531 all-genre actual-app QA";
    maximumDurationSeconds = 180;
    outputRootPrefix = "plan-1531-";
  }
}

function durationRangeLabel() {
  return `${minimumDurationSeconds}-${maximumDurationSeconds}`;
}

function expectedGenreCount() {
  if (requestedHiphopPackMode) return requestedHiphopCases.length;
  return allGenresMode ? workstation.styleProfiles.length : representativeGenreCases.length;
}

function runPlanMode() {
  if (requestedHiphopPackMode) return "visible-native-sequential-requested-hiphop-pack";
  return allGenresMode ? "visible-native-sequential-all-genres" : "visible-native-sequential-multigenre";
}

function ownershipSentinelName() {
  if (requestedHiphopPackMode) return ".grooveforge-plan-1532-owned.json";
  return allGenresMode ? ".grooveforge-plan-1531-owned.json" : ".grooveforge-plan-1528-owned.json";
}

function modeLabel() {
  if (requestedHiphopPackMode) return "requested hip-hop pack";
  return allGenresMode ? "all-genre" : "multi-genre";
}

function usesExtendedDeliveryContract() {
  return allGenresMode || requestedHiphopPackMode;
}

function fail(message) {
  throw new Error(message);
}

function check(condition, message) {
  if (!condition) fail(message);
}

function objectValue(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : null;
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry)).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function sha256File(filePath) {
  return await new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function round(value, digits = 6) {
  return Number.isFinite(value) ? Number(value.toFixed(digits)) : value;
}

function db(amplitude) {
  return amplitude > 0 ? 20 * Math.log10(amplitude) : Number.NEGATIVE_INFINITY;
}

function relativeTo(base, filePath) {
  return path.relative(base, filePath).split(path.sep).join("/");
}

function isInside(base, candidate) {
  const relative = path.relative(base, candidate);
  return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function parseArguments(argv) {
  const parsed = {
    allGenres: false,
    audioSelfTest: false,
    fromExisting: false,
    outputRoot: null,
    prepareOnly: false,
    requestedHiphopPack: false,
    selfTest: false,
    skipBuild: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--all-genres") parsed.allGenres = true;
    else if (argument === "--audio-self-test") parsed.audioSelfTest = true;
    else if (argument === "--from-existing") parsed.fromExisting = true;
    else if (argument === "--prepare-only") parsed.prepareOnly = true;
    else if (argument === "--requested-hiphop-pack") parsed.requestedHiphopPack = true;
    else if (argument === "--self-test") parsed.selfTest = true;
    else if (argument === "--skip-build") parsed.skipBuild = true;
    else if (argument === "--output-root") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) fail("--output-root requires an absolute path.");
      parsed.outputRoot = path.resolve(value);
      index += 1;
    } else {
      fail(`Unknown argument: ${argument}`);
    }
  }
  const exclusiveModes = [parsed.audioSelfTest, parsed.fromExisting, parsed.prepareOnly, parsed.selfTest].filter(Boolean).length;
  check(exclusiveModes <= 1, "Choose at most one of --audio-self-test, --from-existing, --prepare-only, or --self-test.");
  check(!(parsed.allGenres && parsed.requestedHiphopPack), "Choose only one of --all-genres or --requested-hiphop-pack.");
  if (parsed.fromExisting) check(Boolean(parsed.outputRoot), "--from-existing requires --output-root.");
  if ((parsed.audioSelfTest || parsed.fromExisting || parsed.prepareOnly || parsed.selfTest) && parsed.skipBuild) {
    fail("--skip-build is only meaningful for a normal actual-app run.");
  }
  return parsed;
}

function timestampId() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/u, "Z");
}

function defaultOutputRoot() {
  const runName = requestedHiphopPackMode
    ? "plan-1532-requested-hiphop-actual-app-qa"
    : allGenresMode
      ? "plan-1531-all-genres-actual-app-qa"
      : "plan-1528-multigenre-actual-app-qa";
  return path.join(desktopBuildRoot, `${runName}-${timestampId()}-${process.pid}`);
}

function assertPlanOutputRoot(outputRoot) {
  // 정리·조립이 닿는 범위를 plan 전용 build/desktop 하위로 고정한다. 절대 경로를 받더라도
  // 저장소나 홈 디렉터리를 산출물 root로 사용할 수 없다.
  check(path.isAbsolute(outputRoot), "Multi-genre output root must be absolute.");
  check(isInside(desktopBuildRoot, outputRoot), `Output root must remain below ${desktopBuildRoot}.`);
  check(
    path.basename(outputRoot).startsWith(outputRootPrefix),
    `Output root basename must start with ${outputRootPrefix} for the selected genre mode.`
  );
}

async function lstatOrNull(filePath) {
  try {
    return await lstat(filePath);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function assertNoSymlinkComponents(base, candidate) {
  check(path.resolve(candidate) === path.resolve(base) || isInside(base, candidate), `${candidate} escaped ${base}.`);
  const segments = path.relative(base, candidate).split(path.sep).filter(Boolean);
  let current = base;
  for (const segment of segments) {
    current = path.join(current, segment);
    const entry = await lstatOrNull(current);
    if (!entry) break;
    check(!entry.isSymbolicLink(), `Refusing symbolic-link path component: ${current}`);
  }
}

async function readRegularFile(filePath, maximumBytes = Number.MAX_SAFE_INTEGER) {
  const entry = await lstatOrNull(filePath);
  check(Boolean(entry) && entry.isFile() && !entry.isSymbolicLink(), `Expected a regular non-symbolic-link file: ${filePath}`);
  check(entry.size <= maximumBytes, `${filePath} exceeds its ${maximumBytes}-byte safety limit.`);
  return await readFile(filePath);
}

async function readJson(filePath, maximumBytes = 8 * 1024 * 1024) {
  const bytes = await readRegularFile(filePath, maximumBytes);
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    fail(`Invalid JSON at ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function writeExclusive(filePath, contents) {
  await assertNoSymlinkComponents(path.dirname(filePath), filePath);
  await writeFile(filePath, contents, { flag: "wx", mode: 0o600 });
}

function arrangementBars(config) {
  return config.arrangement.reduce((total, block) => total + block.bars, 0);
}

function expectedDuration(config) {
  // Keep the renderer's operation order. Algebraically equivalent formulas can
  // straddle an exact-frame integer because IEEE-754 multiplication rounds at
  // different points (R&B 40 bars / 76 BPM is the current boundary case).
  const stepDurationSeconds = 60 / config.bpm / 4;
  return arrangementBars(config) * 16 * stepDurationSeconds + Math.max(0.75, stepDurationSeconds * 6);
}

function expectedFrameCount(config) {
  return Math.ceil(expectedDuration(config) * expectedWav.sampleRate);
}

function caseDirectoryName(config) {
  return `${String(config.order).padStart(2, "0")}-${config.id}`;
}

function sourceProjectPath(outputRoot, config) {
  return path.join(outputRoot, "inputs", caseDirectoryName(config), "source.grooveforge.json");
}

function movementSpecPath(outputRoot, config) {
  return path.join(outputRoot, "inputs", caseDirectoryName(config), "movement-spec.json");
}

function workspacePath(outputRoot, config) {
  return path.join(outputRoot, "workspaces", caseDirectoryName(config));
}

function outputProjectFileName(config) {
  return `${caseDirectoryName(config)}-final.grooveforge.json`;
}

function createSourceProject(config) {
  const blueprint = workstation.beatBlueprints.find((candidate) => candidate.id === config.blueprintId);
  check(Boolean(blueprint), `${config.id}: Beat Blueprint ${config.blueprintId} is missing.`);
  const styled = workstation.applyBeatBlueprint(workstation.starterProject, config.blueprintId);
  const delivered = workstation.applyDeliveryTarget(styled, "beat_store");
  const project = {
    ...delivered,
    arrangement: workstation.createPatternChain("eight_bar"),
    automation: [],
    bpm: config.bpm,
    deliveryTarget: "beat_store",
    masterCeilingDb: workstation.masterPresetCeilingsDb["Streaming Safe"],
    masterPreset: "Streaming Safe",
    metronomeEnabled: false,
    mode: "studio",
    selectedPattern: "A",
    sessionBrief: {
      artist: requestedHiphopPackMode ? "" : "GrooveForge 오리지널 QA",
      vibe: `${config.styleName} 실제 앱 장곡 QA 시드`,
      reference: "내장 이벤트와 신시사이저만 사용",
      notes: requestedHiphopPackMode
        ? "실제 앱에서 편곡, WAV 내보내기, 저장과 재열기를 검증하기 위한 외부 샘플 없는 로컬 시드 프로젝트."
        : "실제 앱에서 편곡, WAV 내보내기, 저장과 재열기를 검증하기 위한 샘플 없는 오리지널 시드 프로젝트."
    },
    snapshots: [],
    title: `${config.title} 시드`
  };
  check(project.styleId === config.id, `${config.id}: Blueprint produced unexpected style ${project.styleId}.`);
  check(project.bpm === config.bpm, `${config.id}: Blueprint BPM does not match the case matrix.`);
  return project;
}

function deterministicProjectFile(project) {
  const wrapper = JSON.parse(workstation.serializeProjectFile(project));
  wrapper.savedAt = fixedSourceSavedAt;
  return `${JSON.stringify(wrapper, null, 2)}\n`;
}

function createMovementSpec(config, absoluteSourcePath) {
  return {
    arrangement: config.arrangement,
    masterAutomation: config.masterAutomation,
    outputProjectFileName: outputProjectFileName(config),
    schemaVersion: 1,
    sessionBrief: {
      artist: requestedHiphopPackMode ? "" : "GrooveForge 오리지널 QA",
      vibe: config.vibe,
      reference: requestedHiphopPackMode
        ? `${config.styleName} 내장 이벤트 기반 로컬 편곡`
        : `${config.styleName} 내장 이벤트 기반 오리지널 편곡`,
      notes: requestedHiphopPackMode
        ? "외부 샘플 없이 GrooveForge의 편집 가능한 음악 이벤트와 내장 신시사이저로 제작한 실제 앱 QA 곡. 공개 전 권리자, 기여자/크레딧과 아트워크를 확인해야 합니다."
        : "외부 샘플 없이 GrooveForge의 편집 가능한 음악 이벤트와 내장 신시사이저로 제작한 실제 앱 QA 곡. 특정 아티스트를 모사하지 않으며 공개 전 권리자, 크레딧과 아트워크를 확인해야 합니다."
    },
    sourceProjectPath: absoluteSourcePath,
    title: config.title
  };
}

function assertRequestedPublicMetadata(contents, label) {
  const forbiddenNamedReferences = [
    "서울메트로부민",
    "서울 메트로 부민",
    "메트로부민",
    "메트로 부민",
    "블랙넛",
    "씨잼",
    "씨 잼",
    "도모",
    "한요한",
    "seoul metro boomin",
    "metro boomin",
    "black nut",
    "blacknut",
    "c jamm",
    "c-jamm",
    "cjamm",
    "domo",
    "han yohan",
    "han yo han",
    "han-yo-han",
    "hanyohan"
  ];
  const compactContents = contents
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/[^\p{L}\p{N}]+/gu, "");
  for (const reference of forbiddenNamedReferences) {
    const compactReference = reference
      .normalize("NFKC")
      .toLocaleLowerCase("ko-KR")
      .replace(/[^\p{L}\p{N}]+/gu, "");
    check(!compactContents.includes(compactReference), `${label} contains a named reference.`);
  }
  const compactForbiddenClaims = [
    "typebeat",
    "타입비트",
    "inspiredby",
    "inthestyleof",
    "soundlike",
    "soundslike",
    "producedby",
    "prodby",
    "officialcollab",
    "officialcollaboration",
    "공식협업",
    "공식제휴",
    "contentidsafe",
    "100owned",
    "royaltyfree"
  ];
  for (const claim of compactForbiddenClaims) {
    check(!compactContents.includes(claim), `${label} contains an imitation, affiliation, or unverified-rights claim.`);
  }
  check(
    !/(?:type beat|inspired by|in the style of|sounds? like|prod(?:uced)?\.?\s+by|\b(?:feat(?:\.|uring)?|collab(?:oration)?|tribute|official|approved|authorized|commissioned|exclusive|remake|cover|remix)\b|\s(?:x|×)\s|공식 (?:협업|제휴)|(?:Content ID safe|100% owned|royalty-free))/iu.test(contents),
    `${label} contains an imitation, affiliation, or unverified-rights claim.`
  );
  check(!/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/u.test(contents), `${label} contains an email address.`);
  check(
    !/"(?:api[-_\s]?key|access[-_\s]?token|refresh[-_\s]?token|client[-_\s]?secret|private[-_\s]?key|hostname|password|secret|token)"\s*:/iu.test(contents),
    `${label} contains a private-value or host field.`
  );
}

function validateGenreMatrix() {
  const expectedCount = expectedGenreCount();
  check(genreCases.length === expectedCount, `The selected actual-app matrix must contain exactly ${expectedCount} genres.`);
  check(new Set(genreCases.map((entry) => entry.id)).size === genreCases.length, "Genre ids must be unique.");
  check(new Set(genreCases.map((entry) => entry.order)).size === genreCases.length, "Genre orders must be unique.");
  check(
    canonicalJson(genreCases.map((entry) => entry.order)) ===
      canonicalJson(Array.from({ length: genreCases.length }, (_, index) => index + 1)),
    "Genre orders must be contiguous and match the actual execution/delivery order."
  );
  check(new Set(genreCases.map((entry) => entry.title)).size === genreCases.length, "Genre titles must be unique.");
  check(new Set(genreCases.map((entry) => entry.blueprintId)).size === genreCases.length, "Genre Beat Blueprint ids must be unique.");
  if (requestedHiphopPackMode) {
    const actualLaneCounts = Object.fromEntries(
      requestedLaneContract.map((lane) => [lane.id, genreCases.filter((config) => config.productionLaneId === lane.id).length])
    );
    const expectedLaneCounts = Object.fromEntries(requestedLaneContract.map((lane) => [lane.id, lane.count]));
    check(canonicalJson(actualLaneCounts) === canonicalJson(expectedLaneCounts), "Requested hip-hop pack must preserve the exact 3+2+2 production-lane contract.");
    for (const config of genreCases) {
      const lane = requestedLaneContract.find((candidate) => candidate.id === config.productionLaneId);
      check(Boolean(lane) && config.productionLaneName === lane.name, `${config.id}: requested production lane identity is invalid.`);
      check(
        objectValue(config.productionBrief) && ["arrangement", "mix", "originality", "sound"].every((key) => typeof config.productionBrief[key] === "string" && config.productionBrief[key].length > 0),
        `${config.id}: production brief is incomplete.`
      );
      assertRequestedPublicMetadata(
        JSON.stringify({
          mood: config.mood,
          productionBrief: config.productionBrief,
          productionLaneName: config.productionLaneName,
          styleName: config.styleName,
          tags: config.tags,
          title: config.title,
          vibe: config.vibe
        }),
        `${config.id}: requested public metadata`
      );
    }
  } else {
    check(
      canonicalJson([...new Set(genreCases.map((entry) => entry.bassStyle))].sort()) === canonicalJson(requiredBassStyles),
      "The selected cases must cover the complete Bass Voice family set."
    );
  }
  if (!allGenresMode && !requestedHiphopPackMode) {
    check(
      canonicalJson(genreCases.map((entry) => entry.bassStyle).sort()) === canonicalJson(requiredBassStyles),
      "The six representative cases must cover every Bass Voice family exactly once."
    );
  } else if (allGenresMode) {
    const selectedStyleIds = genreCases.map((entry) => entry.id).sort();
    const supportedStyleIds = workstation.styleProfiles.map((profile) => profile.id).sort();
    check(canonicalJson(selectedStyleIds) === canonicalJson(supportedStyleIds), "All-genre mode must cover every current StyleProfile exactly once.");
  }
  for (const config of genreCases) {
    const profile = workstation.styleProfiles.find((candidate) => candidate.id === config.id);
    const blueprint = workstation.beatBlueprints.find((candidate) => candidate.id === config.blueprintId);
    check(Boolean(profile), `${config.id}: style profile is missing.`);
    check(Boolean(blueprint), `${config.id}: dedicated Beat Blueprint ${config.blueprintId} is missing.`);
    check(blueprint?.styleId === config.id, `${config.id}: Beat Blueprint style identity does not match.`);
    check(blueprint?.bpm === config.bpm, `${config.id}: Beat Blueprint BPM does not match the case matrix.`);
    check(profile.bassStyle === config.bassStyle, `${config.id}: expected ${config.bassStyle} Bass Voice, got ${profile.bassStyle}.`);
    check(profile.defaultBpm === config.bpm, `${config.id}: case BPM must match the style default.`);
    const bars = arrangementBars(config);
    check(bars <= workstation.maxProjectArrangementBars, `${config.id}: ${bars} bars exceeds the project limit.`);
    check(config.arrangement.every((block) => block.bars >= 1 && block.bars <= 16), `${config.id}: a block exceeds 1-16 bars.`);
    const duration = expectedDuration(config);
    check(
      duration >= minimumDurationSeconds && duration <= maximumDurationSeconds,
      `${config.id}: expected duration ${duration}s is outside ${durationRangeLabel()} seconds.`
    );
    const source = createSourceProject(config);
    const sourceText = deterministicProjectFile(source);
    if (requestedHiphopPackMode) assertRequestedPublicMetadata(sourceText, `${config.id}: requested source project`);
    if (requestedHiphopPackMode && config.productionLaneId === "synth-drive-punk-rap") {
      check(source.sound.bassDrive > 0, `${config.id}: synth-drive lane requires audible built-in drive.`);
      check(
        ["A", "B", "C"].every((slot) => source.patterns[slot].melodyNotes.length > 0 && source.patterns[slot].chordEvents.length > 0),
        `${config.id}: synth-drive lane requires editable synth and chord events in every pattern.`
      );
      check(!/"(?:audioClips?|importedAudio|samplePath|sampleUrl|sampler)"/iu.test(sourceText), `${config.id}: synth-drive lane must not contain guitar or imported-audio sample data.`);
    }
    const reopened = workstation.parseProjectFile(sourceText);
    check(reopened.styleId === config.id && reopened.bpm === config.bpm, `${config.id}: deterministic source did not reopen exactly.`);
    check(new Set(["A", "B", "C"].map((slot) => sha256(canonicalJson(reopened.patterns[slot])))).size === 3, `${config.id}: Pattern A/B/C must be distinct.`);
    const spec = createMovementSpec(config, path.join(desktopBuildRoot, `${outputRootPrefix}self-test`, `${config.id}.grooveforge.json`));
    if (requestedHiphopPackMode) assertRequestedPublicMetadata(JSON.stringify(spec), `${config.id}: requested movement spec`);
    check(workstation.normalizeProjectTitle(spec.title) === spec.title, `${config.id}: final title is not durable.`);
    check(canonicalJson(workstation.projectSessionBrief({ sessionBrief: spec.sessionBrief })) === canonicalJson(spec.sessionBrief), `${config.id}: Session Brief would normalize during QA.`);
  }
}

async function prepareOutput(outputRoot) {
  assertPlanOutputRoot(outputRoot);
  await assertNoSymlinkComponents(desktopBuildRoot, outputRoot);
  check(!(await lstatOrNull(outputRoot)), `Output root already exists; choose a fresh plan-owned root: ${outputRoot}`);
  await mkdir(outputRoot, { recursive: true, mode: 0o700 });
  // 새 디렉터리만 허용하고 ownership sentinel을 먼저 기록한다. --from-existing 경로는 이 sentinel과
  // 결정론적 input 해시가 모두 일치해야만 이후 실제 앱 증거 감사에 들어갈 수 있다.
  const sentinel = {
    owner: ownerMarker,
    outputRoot,
    plan: planId,
    schemaVersion: 1
  };
  await writeExclusive(path.join(outputRoot, ownershipSentinelName()), `${JSON.stringify(sentinel, null, 2)}\n`);
  const entries = [];
  for (const config of genreCases) {
    const inputRoot = path.dirname(sourceProjectPath(outputRoot, config));
    await mkdir(inputRoot, { recursive: true, mode: 0o700 });
    const sourcePath = sourceProjectPath(outputRoot, config);
    const specPath = movementSpecPath(outputRoot, config);
    const sourceContents = deterministicProjectFile(createSourceProject(config));
    const specContents = `${JSON.stringify(createMovementSpec(config, sourcePath), null, 2)}\n`;
    await writeExclusive(sourcePath, sourceContents);
    await writeExclusive(specPath, specContents);
    entries.push({
      arrangementBars: arrangementBars(config),
      bassStyle: config.bassStyle,
      ...(usesExtendedDeliveryContract() ? { blueprintId: config.blueprintId } : {}),
      bpm: config.bpm,
      expectedDurationSeconds: round(expectedDuration(config)),
      id: config.id,
      order: config.order,
      ...(requestedHiphopPackMode
        ? { productionLaneId: config.productionLaneId, productionLaneName: config.productionLaneName }
        : {}),
      sourceProject: {
        bytes: Buffer.byteLength(sourceContents),
        path: sourcePath,
        sha256: sha256(sourceContents)
      },
      spec: {
        bytes: Buffer.byteLength(specContents),
        path: specPath,
        sha256: sha256(specContents)
      },
      styleName: config.styleName,
      title: config.title,
      workspaceRoot: workspacePath(outputRoot, config)
    });
  }
  const runPlan = {
    command: "desktop:movement-qa",
    generatedAt: new Date().toISOString(),
    mode: runPlanMode(),
    networkOperationRequested: false,
    plan: planId,
    schemaVersion: 1,
    entries
  };
  await writeExclusive(path.join(outputRoot, "run-plan.json"), `${JSON.stringify(runPlan, null, 2)}\n`);
  return entries;
}

async function loadPreparedOutput(outputRoot) {
  assertPlanOutputRoot(outputRoot);
  await assertNoSymlinkComponents(desktopBuildRoot, outputRoot);
  const sentinel = await readJson(path.join(outputRoot, ownershipSentinelName()));
  check(sentinel.owner === ownerMarker && sentinel.plan === planId && sentinel.schemaVersion === 1, "Output root ownership sentinel is invalid.");
  check(path.resolve(sentinel.outputRoot) === outputRoot, "Output root ownership sentinel path does not match.");
  const runPlan = await readJson(path.join(outputRoot, "run-plan.json"));
  check(runPlan.plan === planId && runPlan.schemaVersion === 1 && Array.isArray(runPlan.entries), "Prepared run-plan contract is invalid.");
  check(runPlan.mode === runPlanMode(), "Prepared run-plan mode does not match the selected genre mode.");
  check(runPlan.entries.length === genreCases.length, `Prepared run-plan must contain all ${genreCases.length} selected genres.`);
  const entries = [];
  for (const config of genreCases) {
    const sourcePath = sourceProjectPath(outputRoot, config);
    const specPath = movementSpecPath(outputRoot, config);
    await assertNoSymlinkComponents(outputRoot, sourcePath);
    await assertNoSymlinkComponents(outputRoot, specPath);
    const expectedSource = deterministicProjectFile(createSourceProject(config));
    const expectedSpec = `${JSON.stringify(createMovementSpec(config, sourcePath), null, 2)}\n`;
    const actualSource = await readRegularFile(sourcePath, workstation.maxProjectFileBytes);
    const actualSpec = await readRegularFile(specPath, 262_144);
    check(actualSource.equals(Buffer.from(expectedSource)), `${config.id}: prepared source differs from the deterministic contract.`);
    check(actualSpec.equals(Buffer.from(expectedSpec)), `${config.id}: prepared movement spec differs from the strict contract.`);
    const recorded = runPlan.entries.find((entry) => objectValue(entry)?.id === config.id);
    check(Boolean(recorded), `${config.id}: run-plan row is missing.`);
    check(recorded.order === config.order, `${config.id}: run-plan order mismatch.`);
    if (usesExtendedDeliveryContract()) check(recorded.blueprintId === config.blueprintId, `${config.id}: run-plan Beat Blueprint mismatch.`);
    if (requestedHiphopPackMode) {
      check(recorded.productionLaneId === config.productionLaneId, `${config.id}: run-plan production lane mismatch.`);
      check(recorded.productionLaneName === config.productionLaneName, `${config.id}: run-plan production lane name mismatch.`);
    }
    check(recorded.sourceProject?.sha256 === sha256(actualSource), `${config.id}: run-plan source SHA-256 mismatch.`);
    check(recorded.spec?.sha256 === sha256(actualSpec), `${config.id}: run-plan spec SHA-256 mismatch.`);
    check(path.resolve(recorded.workspaceRoot) === workspacePath(outputRoot, config), `${config.id}: run-plan workspace path mismatch.`);
    entries.push(recorded);
  }
  return entries;
}

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

async function runCommand(command, args, env = process.env) {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, env, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code, signal) => resolve({ code, signal }));
  });
}

async function runActualAppSequence(outputRoot, skipBuild) {
  if (!skipBuild) {
    console.log("검증: current source에서 production Electron build를 생성합니다.");
    const build = await runCommand(npmCommand(), ["run", "build"]);
    check(build.code === 0 && build.signal === null, `npm run build failed (${build.code ?? "no code"}/${build.signal ?? "no signal"}).`);
  }
  // 장르별 workspace를 분리해 순차 실행한다. 하나의 Electron 프로세스나 userData가 다음 장르에
  // 상태를 누출하지 않게 하면서, 가능한 모든 장르의 종료 결과를 모은 뒤 한 번에 실패한다.
  const failures = [];
  for (const config of genreCases) {
    const workspaceRoot = workspacePath(outputRoot, config);
    check(!(await lstatOrNull(workspaceRoot)), `${config.id}: workspace must be fresh and absent before actual-app QA: ${workspaceRoot}`);
    console.log(`검증: [${config.order}/${genreCases.length}] ${config.styleName} / ${config.title} actual-app QA를 실행합니다.`);
    const result = await runCommand(
      npmCommand(),
      ["run", "desktop:movement-qa", "--", "--movement-spec", movementSpecPath(outputRoot, config)],
      {
        ...process.env,
        GROOVEFORGE_DESKTOP_WORKSPACE_ROOT: workspaceRoot,
        NO_COLOR: "1"
      }
    );
    if (result.code !== 0 || result.signal !== null) {
      failures.push(`${config.id}: exit ${result.code ?? "none"}/${result.signal ?? "none"}`);
    }
  }
  check(failures.length === 0, `One or more actual-app genre runs failed:\n- ${failures.join("\n- ")}`);
}

function readInt24Le(bytes, offset) {
  const unsigned = bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
  return unsigned & 0x800000 ? unsigned - 0x1000000 : unsigned;
}

function decodeCanonicalPcm24Wav(bytes) {
  check(bytes.byteLength >= 44, "WAV is shorter than the canonical 44-byte header.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (start, length) => bytes.subarray(start, start + length).toString("ascii");
  check(ascii(0, 4) === "RIFF" && ascii(8, 4) === "WAVE", "WAV RIFF/WAVE markers are invalid.");
  check(view.getUint32(4, true) + 8 === bytes.byteLength, "WAV RIFF size does not match the file length.");
  check(ascii(12, 4) === "fmt " && view.getUint32(16, true) === 16, "WAV must use a canonical 16-byte fmt chunk.");
  check(ascii(36, 4) === "data", "WAV must use the canonical data chunk position.");
  const audioFormat = view.getUint16(20, true);
  const channels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const byteRate = view.getUint32(28, true);
  const blockAlign = view.getUint16(32, true);
  const bitDepth = view.getUint16(34, true);
  const dataSize = view.getUint32(40, true);
  check(audioFormat === expectedWav.audioFormat, `Expected PCM format 1, got ${audioFormat}.`);
  check(channels === expectedWav.channels, `Expected stereo WAV, got ${channels} channels.`);
  check(sampleRate === expectedWav.sampleRate, `Expected 44.1kHz WAV, got ${sampleRate}.`);
  check(byteRate === expectedWav.byteRate, `Expected byte rate ${expectedWav.byteRate}, got ${byteRate}.`);
  check(blockAlign === expectedWav.blockAlign, `Expected block alignment 6, got ${blockAlign}.`);
  check(bitDepth === expectedWav.bitDepth, `Expected PCM24, got ${bitDepth}-bit.`);
  check(dataSize === bytes.byteLength - 44 && dataSize % blockAlign === 0, "WAV data chunk is truncated or frame-incomplete.");

  const frames = dataSize / blockAlign;
  const sampleCount = frames * channels;
  const channelSums = Array.from({ length: channels }, () => 0);
  const channelNonZeroSamples = Array.from({ length: channels }, () => 0);
  const previous = Array.from({ length: channels }, () => null);
  let peak = 0;
  let squareSum = 0;
  let nonZeroSamples = 0;
  let lowerByteActiveSamples = 0;
  let fullScaleSamples = 0;
  let maxAdjacentDelta = 0;
  let clickRiskSamples = 0;
  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    const offset = 44 + sampleIndex * 3;
    const raw = readInt24Le(bytes, offset);
    const normalized = raw < 0 ? raw / 8_388_608 : raw / 8_388_607;
    const absolute = Math.abs(normalized);
    const channel = sampleIndex % channels;
    peak = Math.max(peak, absolute);
    squareSum += normalized * normalized;
    channelSums[channel] += normalized;
    if (raw !== 0) {
      nonZeroSamples += 1;
      channelNonZeroSamples[channel] += 1;
      if (bytes[offset] !== 0) lowerByteActiveSamples += 1;
    }
    if (raw === -8_388_608 || raw === 8_388_607) fullScaleSamples += 1;
    if (previous[channel] !== null) {
      const delta = Math.abs(normalized - previous[channel]);
      maxAdjacentDelta = Math.max(maxAdjacentDelta, delta);
      if (delta > 0.95) clickRiskSamples += 1;
    }
    previous[channel] = normalized;
  }
  const rms = sampleCount > 0 ? Math.sqrt(squareSum / sampleCount) : 0;
  let terminalZeroFrames = 0;
  for (let frame = frames - 1; frame >= 0; frame -= 1) {
    let zero = true;
    for (let channel = 0; channel < channels; channel += 1) {
      if (readInt24Le(bytes, 44 + (frame * channels + channel) * 3) !== 0) zero = false;
    }
    if (!zero) break;
    terminalZeroFrames += 1;
  }
  return {
    audioFormat,
    bitDepth,
    blockAlign,
    byteRate,
    channelDcOffsets: channelSums.map((sum) => sum / frames),
    channelNonZeroSamples,
    channels,
    clickRiskSamples,
    dataSize,
    durationSeconds: frames / sampleRate,
    frames,
    fullScaleSamples,
    lowerByteActivePercent: nonZeroSamples > 0 ? lowerByteActiveSamples / nonZeroSamples * 100 : 0,
    maxAdjacentDelta,
    nonZeroPercent: sampleCount > 0 ? nonZeroSamples / sampleCount * 100 : 0,
    nonZeroSamples,
    peakDb: db(peak),
    rmsDb: db(rms),
    sampleRate,
    terminalZeroFrames
  };
}

function musicalBoundaryTailEvidence(bytes, config) {
  const musicalDurationSeconds = arrangementBars(config) * 240 / config.bpm;
  const boundaryFrame = Math.round(musicalDurationSeconds * expectedWav.sampleRate);
  const totalFrames = (bytes.byteLength - 44) / expectedWav.blockAlign;
  let nonZeroSamples = 0;
  let peak = 0;
  for (let frame = Math.min(boundaryFrame, totalFrames); frame < totalFrames; frame += 1) {
    for (let channel = 0; channel < expectedWav.channels; channel += 1) {
      const raw = readInt24Le(bytes, 44 + (frame * expectedWav.channels + channel) * 3);
      if (raw !== 0) nonZeroSamples += 1;
      const normalized = raw < 0 ? raw / 8_388_608 : raw / 8_388_607;
      peak = Math.max(peak, Math.abs(normalized));
    }
  }
  return {
    musicalDurationSeconds,
    nonZeroSamples,
    peakDb: db(peak),
    tailDurationSeconds: totalFrames / expectedWav.sampleRate - musicalDurationSeconds
  };
}

function preservedMovementCore(project) {
  const core = JSON.parse(JSON.stringify(project));
  for (const key of ["arrangement", "automation", "selectedPattern", "sessionBrief", "title"]) delete core[key];
  return core;
}

function expectedAutomation(project, config) {
  return workstation.applyMasterAutomationPreset(
    { ...project, arrangement: config.arrangement, automation: [] },
    config.masterAutomation
  ).automation;
}

function resolveEvidencePath(candidate, expectedPath, label) {
  check(typeof candidate === "string" && path.resolve(candidate) === path.resolve(expectedPath), `${label} path mismatch.`);
  return expectedPath;
}

async function auditScreenshot(zoneEvidence, expectedPath, zone) {
  check(objectValue(zoneEvidence), `${zone}: zone evidence is missing.`);
  resolveEvidencePath(zoneEvidence.screenshot, expectedPath, `${zone} screenshot`);
  const bytes = await readRegularFile(expectedPath, 25 * 1024 * 1024);
  check(bytes.byteLength >= 10_000, `${zone}: screenshot is unexpectedly small.`);
  check(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${zone}: screenshot is not PNG.`);
  check(zoneEvidence.screenshotBytes === bytes.byteLength, `${zone}: screenshot byte count mismatch.`);
  check(zoneEvidence.screenshotSha256 === sha256(bytes), `${zone}: screenshot SHA-256 mismatch.`);
  check(zoneEvidence.activeZone === zone, `${zone}: wrong active workspace page.`);
  check(
    zoneEvidence.tabCount === 5 && zoneEvidence.tabPanelCount === 5,
    `${zone}: expected five Overview, Compose, Arrange, Mix, and Deliver tabs and tabpanels.`
  );
  check(zoneEvidence.activeZoneCount === 1, `${zone}: active workspace tabpanel identity is missing or duplicated.`);
  check(zoneEvidence.selectedTabCount === 1 && zoneEvidence.tabStopCount === 1, `${zone}: tab selection/roving stop contract failed.`);
  check(
    Array.isArray(zoneEvidence.selectedTabLabels) &&
      zoneEvidence.selectedTabLabels.length === 1 &&
      typeof zoneEvidence.selectedTabLabels[0] === "string" &&
      zoneEvidence.selectedTabLabels[0].trim().length > 0,
    `${zone}: the single aria-selected tab must expose a non-empty accessible label.`
  );
  check(zoneEvidence.visiblePanelCount === 1 && zoneEvidence.documentHorizontalOverflow === 0, `${zone}: visible page or overflow contract failed.`);
  if (zone === "mix" || zone === "deliver") {
    check(zoneEvidence.audioAnalysisState === "ready" && zoneEvidence.audioAnalysisStatus === "Audio meters ready", `${zone}: exact audio analysis was not ready.`);
  }
  return { bytes: bytes.byteLength, path: expectedPath, sha256: sha256(bytes) };
}

async function auditGenre(outputRoot, config) {
  const workspaceRoot = workspacePath(outputRoot, config);
  await assertNoSymlinkComponents(outputRoot, workspaceRoot);
  // 앱이 작성한 보고서만 신뢰하지 않고 원본·복사본·저장본을 각각 제한 크기로 다시 읽어 해시와
  // 보존된 음악 core를 독립 비교한다.
  const reportPath = path.join(workspaceRoot, "evidence", "auto-movement-qa-report.json");
  const reportBytes = await readRegularFile(reportPath, 8 * 1024 * 1024);
  const report = JSON.parse(reportBytes.toString("utf8"));
  const sourcePath = sourceProjectPath(outputRoot, config);
  const specPath = movementSpecPath(outputRoot, config);
  const sourceBytes = await readRegularFile(sourcePath, workstation.maxProjectFileBytes);
  const specBytes = await readRegularFile(specPath, 262_144);
  const spec = JSON.parse(specBytes.toString("utf8"));
  const copiedSourcePath = path.join(workspaceRoot, "fixtures", "movement-source.grooveforge.json");
  const copiedSpecPath = path.join(workspaceRoot, "fixtures", "movement-spec.json");
  const copiedSourceBytes = await readRegularFile(copiedSourcePath, workstation.maxProjectFileBytes);
  const copiedSpecBytes = await readRegularFile(copiedSpecPath, 262_144);
  const sourceProject = workstation.parseProjectFile(sourceBytes.toString("utf8"));
  const savedProjectPath = path.join(workspaceRoot, "Projects", outputProjectFileName(config));
  const savedProjectBytes = await readRegularFile(savedProjectPath, workstation.maxProjectFileBytes);
  const savedProject = workstation.parseProjectFile(savedProjectBytes.toString("utf8"));
  if (requestedHiphopPackMode) {
    assertRequestedPublicMetadata(savedProjectBytes.toString("utf8"), `${config.id}: saved project metadata`);
    check(
      !/"(?:audioClips?|importedAudio|samplePath|sampleUrl|sampler)"/iu.test(savedProjectBytes.toString("utf8")),
      `${config.id}: saved requested-pack project contains imported-audio or sampler data.`
    );
  }

  check(report.mode === "visible-native-auto-movement-qa" && report.ok === true, `${config.id}: actual-app report did not pass.`);
  check(Array.isArray(report.failures) && report.failures.length === 0, `${config.id}: actual-app report contains failures.`);
  check(report.workspaceRoot === workspaceRoot, `${config.id}: report workspace mismatch.`);
  check(report.provenanceValidatedAtLaunch === true, `${config.id}: source/build provenance was not validated.`);
  check(report.performance?.passed === true, `${config.id}: interaction performance budget failed.`);
  check(Array.isArray(report.interactions) && report.interactions.length > 0, `${config.id}: native interaction evidence is missing.`);
  check(report.interactions.every((interaction) => interaction.withinBudget === true), `${config.id}: an interaction exceeded its budget.`);
  const expectedStepIds = [
    "open-source-and-edit-metadata",
    "apply-arrangement",
    "apply-length-bound-master-automation",
    "deliver-export-save-and-reopen"
  ];
  check(
    canonicalJson(report.steps?.map((step) => [step.id, step.status])) === canonicalJson(expectedStepIds.map((id) => [id, "passed"])),
    `${config.id}: actual-app step receipt is incomplete.`
  );
  check(report.safety?.isolatedWorkspace === true && report.safety?.nativePointerAndKeyboard === true, `${config.id}: native/isolation posture failed.`);
  check(report.safety?.userDataIsolated === true, `${config.id}: Electron userData was not isolated.`);
  check(path.resolve(report.safety?.userDataPath ?? "") === path.join(workspaceRoot, "ElectronUserData"), `${config.id}: Electron userData path mismatch.`);
  check(report.safety?.sourceFixtureUnchanged === true && report.safety?.sourceUnchanged === true, `${config.id}: source preservation failed.`);
  check(report.safety?.externalSourcePath === sourcePath, `${config.id}: external source path mismatch.`);
  check(report.safety?.externalSourceSha256 === sha256(sourceBytes), `${config.id}: external source hash mismatch.`);
  check(report.safety?.externalSourceFinalSha256 === sha256(sourceBytes), `${config.id}: external source postflight hash mismatch.`);
  check(report.safety?.externalSourceBytes === sourceBytes.byteLength && report.safety?.externalSourceFinalBytes === sourceBytes.byteLength, `${config.id}: external source byte-count postflight mismatch.`);
  check(report.source?.path === copiedSourcePath && copiedSourceBytes.equals(sourceBytes), `${config.id}: workspace source fixture does not match the external source.`);
  check(report.source?.sha256 === sha256(sourceBytes), `${config.id}: copied source fixture hash mismatch.`);
  check(report.source?.styleId === config.id && report.source?.bpm === config.bpm, `${config.id}: source style/BPM report mismatch.`);
  check(report.spec?.path === copiedSpecPath && copiedSpecBytes.equals(specBytes), `${config.id}: workspace movement spec does not match the external spec.`);
  check(report.spec?.sha256 === sha256(specBytes), `${config.id}: copied movement spec hash mismatch.`);
  check(report.spec?.arrangementBars === arrangementBars(config), `${config.id}: report arrangement-bar count mismatch.`);
  check(report.spec?.arrangementBlocks === config.arrangement.length, `${config.id}: report arrangement-block count mismatch.`);
  check(report.spec?.title === config.title && report.spec?.masterAutomation === config.masterAutomation, `${config.id}: report spec metadata mismatch.`);

  check(savedProject.title === config.title, `${config.id}: final project title mismatch.`);
  check(savedProject.styleId === config.id && savedProject.bpm === config.bpm, `${config.id}: final project style/BPM mismatch.`);
  check(canonicalJson(savedProject.arrangement) === canonicalJson(config.arrangement), `${config.id}: final arrangement mismatch.`);
  check(canonicalJson(savedProject.sessionBrief) === canonicalJson(spec.sessionBrief), `${config.id}: final Session Brief mismatch.`);
  check(canonicalJson(savedProject.automation) === canonicalJson(expectedAutomation(savedProject, config)), `${config.id}: final master automation mismatch.`);
  check(
    canonicalJson(preservedMovementCore(savedProject)) === canonicalJson(preservedMovementCore(sourceProject)),
    `${config.id}: final project changed source musical core outside movement scope.`
  );
  check(report.project?.path === savedProjectPath, `${config.id}: report final project path mismatch.`);
  check(report.project?.sha256 === sha256(savedProjectBytes), `${config.id}: report final project hash mismatch.`);
  check(report.project?.preservedSourceCore === true, `${config.id}: report did not preserve source core.`);
  check(report.project?.arrangementBars === arrangementBars(config), `${config.id}: report final bar count mismatch.`);
  check(report.reopenedProject?.title === config.title, `${config.id}: reopened title mismatch.`);
  check(report.reopenedProject?.arrangementMatches === true && report.reopenedProject?.automationMatches === true, `${config.id}: live reopen contract failed.`);
  check(
    typeof report.reopenedProject?.observedAt === "string" &&
      typeof report.reopenedProject?.projectStatus === "string" &&
      report.reopenedProject.projectStatus.includes("Loaded"),
    `${config.id}: live reopen observation receipt is incomplete.`
  );

  const screenshotRows = {};
  for (const zone of ["arrange", "mix", "deliver"]) {
    screenshotRows[zone] = await auditScreenshot(
      report.zones?.[zone],
      path.join(workspaceRoot, "evidence", `auto-movement-${zone}.png`),
      zone
    );
  }
  check(new Set(Object.values(screenshotRows).map((row) => row.sha256)).size === 3, `${config.id}: page screenshots must be visually distinct.`);

  check(objectValue(report.wav), `${config.id}: report WAV evidence is missing.`);
  const wavPath = path.resolve(report.wav.path);
  check(isInside(path.join(workspaceRoot, "exports"), wavPath), `${config.id}: WAV escaped the isolated exports directory.`);
  check(
    Array.isArray(report.downloads) && report.downloads.some((download) => download.state === "completed" && path.resolve(download.filePath) === wavPath),
    `${config.id}: completed native download receipt for the WAV is missing.`
  );
  const wavBytes = await readRegularFile(wavPath, maximumSoundCloudBytes);
  check(report.wav.bytes === wavBytes.byteLength && report.wav.sha256 === sha256(wavBytes), `${config.id}: report WAV bytes/hash mismatch.`);
  // export 영수증과 별개로 실제 PCM을 다시 해독해 형식·길이·무음·ceiling·tail·click 위험을 검증한다.
  // 같은 저장 프로젝트의 즉시 재렌더까지 byte 단위로 일치해야 delivery 후보가 된다.
  const decoded = decodeCanonicalPcm24Wav(wavBytes);
  const tail = musicalBoundaryTailEvidence(wavBytes, config);
  const durationTolerance = 1 / expectedWav.sampleRate + Number.EPSILON;
  check(decoded.frames === expectedFrameCount(config), `${config.id}: exact WAV frame count mismatch.`);
  check(Math.abs(decoded.durationSeconds - expectedDuration(config)) <= durationTolerance, `${config.id}: WAV duration differs by more than one frame.`);
  check(
    decoded.durationSeconds >= minimumDurationSeconds && decoded.durationSeconds <= maximumDurationSeconds,
    `${config.id}: WAV is outside ${durationRangeLabel()} seconds.`
  );
  check(decoded.nonZeroSamples > 0 && decoded.nonZeroPercent >= 0.01, `${config.id}: WAV is silent or unexpectedly sparse.`);
  check(decoded.lowerByteActivePercent >= 50, `${config.id}: WAV may contain zero-padded 16-bit samples.`);
  check(decoded.channelNonZeroSamples.every((count) => count > 0), `${config.id}: both stereo channels must contain audio.`);
  check(Number.isFinite(decoded.peakDb) && Number.isFinite(decoded.rmsDb) && decoded.rmsDb > -80, `${config.id}: peak/RMS evidence is invalid.`);
  check(decoded.peakDb <= savedProject.masterCeilingDb + 0.02, `${config.id}: sample peak exceeds the master ceiling.`);
  check(decoded.fullScaleSamples === 0, `${config.id}: digital full-scale samples were found.`);
  check(decoded.terminalZeroFrames >= 1, `${config.id}: WAV does not end at digital zero.`);
  check(tail.nonZeroSamples > 0, `${config.id}: rendered tail contains no signal after the musical boundary.`);
  check(decoded.channelDcOffsets.every((offset) => Math.abs(offset) <= 0.02), `${config.id}: DC offset exceeds the 0.02 safety bound.`);
  check(decoded.clickRiskSamples === 0 && decoded.maxAdjacentDelta <= 0.95, `${config.id}: adjacent PCM transition exceeds the 0.95 click-risk bound.`);
  check(wavBytes.byteLength <= maximumSoundCloudBytes, `${config.id}: WAV exceeds SoundCloud's 4GB file limit.`);
  check(report.wav.durationSeconds === decoded.durationSeconds, `${config.id}: report WAV duration mismatch.`);
  check(report.wav.sampleRate === expectedWav.sampleRate && report.wav.channels === 2 && report.wav.bitDepth === 24, `${config.id}: report WAV format mismatch.`);

  const rerendered = Buffer.from(await render.createMixWavBlob(savedProject).arrayBuffer());
  check(rerendered.equals(wavBytes), `${config.id}: immediate offline rerender differs from the actual-app WAV export.`);

  return {
    config,
    decoded,
    originalReport: { bytes: reportBytes.byteLength, path: reportPath, sha256: sha256(reportBytes) },
    report,
    savedProject: { bytes: savedProjectBytes.byteLength, path: savedProjectPath, sha256: sha256(savedProjectBytes) },
    screenshots: screenshotRows,
    source: { bytes: sourceBytes.byteLength, sha256: sha256(sourceBytes) },
    spec: { bytes: specBytes.byteLength, sha256: sha256(specBytes) },
    tail,
    wav: { bytes: wavBytes.byteLength, path: wavPath, sha256: sha256(wavBytes) }
  };
}

function sanitizeForDelivery(value, outputRoot) {
  // 내부 원본 보고서는 그대로 보존하되, 전달본에서는 실행 root와 저장소 절대 경로를 안정된 토큰으로 치환한다.
  if (Array.isArray(value)) return value.map((entry) => sanitizeForDelivery(entry, outputRoot));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, sanitizeForDelivery(entry, outputRoot)]));
  }
  if (typeof value !== "string") return value;
  return value
    .split(outputRoot).join("<RUN_ROOT>")
    .split(root).join("<REPOSITORY>");
}

const forbiddenLocalPathPatterns = [
  /\/Users\//u,
  /\/home\//u,
  /\/(?:private\/)?tmp\//u,
  /\/(?:private\/)?var\/folders\//u,
  /[A-Za-z]:\\\\Users\\\\/u
];

function assertDeliveryTextPrivacy(contents, label) {
  // 알려진 두 root 치환만으로 충분하다고 가정하지 않고, 다른 사용자 홈·임시 경로와 private key 표식도 차단한다.
  for (const pattern of forbiddenLocalPathPatterns) {
    check(!pattern.test(contents), `${label} retained a local absolute path matching ${pattern}.`);
  }
  check(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u.test(contents), `${label} retained a private key.`);
}

function buildSoundCloudSheet(audit, project) {
  const { config, decoded, tail, wav } = audit;
  return `# SoundCloud 업로드 시트 — ${config.title}\n\n` +
    `## 복사할 메타데이터\n\n` +
    `- 제목: ${config.title}\n` +
    `- 아티스트: [업로드 전 입력]\n` +
    `- 권리자: [업로드 전 입력]\n` +
    `- 기여자/크레딧: [업로드 전 실제 기여자만 입력]\n` +
    `- 장르: ${config.styleName}\n` +
    `- BPM / Key: ${config.bpm} BPM / ${project.key}\n` +
    `- 무드: ${config.mood}\n` +
    `- 영문 태그: ${config.tags.join(", ")}\n` +
    `- 라이선스: [권리 확인 후 선택]\n` +
    `- 첫 공개 범위: Private\n` +
    `- Downloads: Off\n` +
    `- 수익화 / 배급 / Content ID: Off (별도 권리 승인 전)\n` +
    `- 아트워크: [업로드 전 권리 확인된 정사각형 이미지 준비]\n\n` +
    `## 설명 초안\n\n` +
    `${config.vibe}. 외부 샘플 없이 GrooveForge의 편집 가능한 음악 이벤트와 내장 신시사이저로 로컬 생성한 인스트루멘털입니다.\n\n` +
    `## 업로드 파일 기술 확인\n\n` +
    `- 파일: ${caseDirectoryName(config)}-soundcloud.wav\n` +
    `- 형식: stereo 44.1 kHz signed PCM 24-bit WAV\n` +
    `- 길이: ${decoded.durationSeconds.toFixed(6)}초 (${Math.floor(decoded.durationSeconds / 60)}분 ${(decoded.durationSeconds % 60).toFixed(2)}초)\n` +
    `- 크기: ${wav.bytes.toLocaleString("en-US")} bytes\n` +
    `- SHA-256: ${wav.sha256}\n` +
    `- sample peak / RMS: ${decoded.peakDb.toFixed(2)} dBFS / ${decoded.rmsDb.toFixed(2)} dBFS\n` +
    `- full-scale sample: ${decoded.fullScaleSamples}\n` +
    `- lower-byte activity: ${decoded.lowerByteActivePercent.toFixed(2)}%\n` +
    `- musical-boundary 이후 tail: ${tail.tailDurationSeconds.toFixed(6)}초 / signal ${tail.nonZeroSamples > 0 ? "있음" : "없음"}\n` +
    `- terminal digital zero: ${decoded.terminalZeroFrames >= 1 ? "확인" : "미확인"}\n` +
    `- 실제 앱 Open/edit/Deliver/Save/reopen: 통과\n\n` +
    `## Private-first 체크리스트\n\n` +
    `1. 대괄호 placeholder를 실제 아티스트·권리자·기여자/크레딧·라이선스·아트워크 정보로 교체합니다.\n` +
    `2. Private 업로드라도 음악과 시각 자료의 권리 확인이 필요하며, 제3자 표기만으로 사용 허락을 대신할 수 없습니다.\n` +
    `3. WAV를 먼저 Private로 업로드하고 Downloads는 Off로 유지합니다.\n` +
    `4. SoundCloud 처리 후 변환 스트림을 헤드폰과 스피커에서 처음부터 끝까지 듣습니다.\n` +
    `5. 인트로, 가장 큰 구간, 저역, 전환, 엔딩과 메타데이터를 승인한 뒤에만 공개 범위를 결정합니다.\n` +
    `6. 수익화·배급·Content ID는 별도의 권리 확인 뒤 결정합니다.\n` +
    `7. 사람이 전곡을 듣고 기존 곡의 인식 가능한 멜로디·리프·편곡·프로듀서 표식과 우연한 겹침이 없는지 확인합니다.\n\n` +
    `## 기술 한계\n\n` +
    `이 시트의 peak/RMS는 로컬 sample 측정이며 LUFS, true peak, 전문 마스터링 또는 플랫폼 승인 보장이 아닙니다. 실제 업로드·공개·계정 변경은 수행하지 않았습니다.\n\n` +
    `## SoundCloud 공식 참고 자료 (2026-09-07 확인)\n\n` +
    `- Upload requirements: https://help.soundcloud.com/hc/en-us/articles/360039171614-Upload-Requirements\n` +
    `- Privacy settings: https://help.soundcloud.com/hc/en-us/articles/46020211210523-Edit-your-track-s-privacy-settings\n` +
    `- Track permissions: https://help.soundcloud.com/hc/en-us/articles/31423603670043-Manage-your-track-s-permissions\n` +
    `- Upload rights (Private 포함): https://help.soundcloud.com/hc/en-us/articles/115003563308-Best-practices-for-uploading-someone-else-s-track\n` +
    `- Metadata/distribution rejection reference: https://help.soundcloud.com/hc/en-us/articles/48881707977627-Distribution-Rejections-How-to-Resolve-Them\n`;
}

function buildProductionBrief(audit, project) {
  const { config, decoded } = audit;
  return `# 프로덕션 브리프 — ${config.title}\n\n` +
    `## 제작 lane\n\n` +
    `- Lane: ${config.productionLaneName}\n` +
    `- StyleProfile / Beat Blueprint: ${config.id} / ${config.blueprintId}\n` +
    `- BPM / Key: ${config.bpm} BPM / ${project.key}\n` +
    `- 편곡 길이: ${arrangementBars(config)} bars / ${decoded.durationSeconds.toFixed(6)}초\n\n` +
    `## 방향\n\n` +
    `- Arrangement: ${config.productionBrief.arrangement}\n` +
    `- Sound: ${config.productionBrief.sound}\n` +
    `- Mix: ${config.productionBrief.mix}\n` +
    `- 독립 구성: ${config.productionBrief.originality}\n\n` +
    `## 구현 및 실제 앱 검증\n\n` +
    `- Pattern A/B/C의 드럼, Bass, Synth, Chord 음악 이벤트와 GrooveForge 내장 합성만 사용했습니다.\n` +
    `- 가져온 오디오, 실제 기타 녹음, 외부 샘플, 보컬, 가사와 외부 프로듀서 태그를 사용하지 않았습니다.\n` +
    `- production Electron에서 Open/edit → Arrange → Mix 분석 → Deliver WAV → Save → reopen을 통과했습니다.\n` +
    `- WAV는 stereo 44.1 kHz signed PCM 24-bit이며 저장 프로젝트의 즉시 재렌더와 byte-identical입니다.\n\n` +
    `## 공개 전 경계\n\n` +
    `- 아티스트: [업로드 전 입력]\n` +
    `- 권리자: [업로드 전 입력]\n` +
    `- 기여자/크레딧: [업로드 전 실제 기여자만 입력]\n` +
    `- 라이선스/아트워크: [권리 확인 뒤 입력]\n` +
    `- 첫 업로드는 Private, Downloads Off, 수익화·배급·Content ID Off를 유지합니다.\n` +
    `- 이 로컬 fixture 검증은 최종 권리·예술·마스터링 승인이나 플랫폼 승인을 대신하지 않습니다.\n`;
}

async function copyEvidenceFile(source, target) {
  const entry = await lstatOrNull(source);
  check(Boolean(entry) && entry.isFile() && !entry.isSymbolicLink(), `Evidence source is unsafe: ${source}`);
  check(!(await lstatOrNull(target)), `Delivery target already exists: ${target}`);
  await copyFile(source, target);
  return { bytes: entry.size, sha256: await sha256File(target) };
}

async function collectFiles(directory) {
  const rows = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const candidate = path.join(directory, entry.name);
    check(!entry.isSymbolicLink(), `Delivery tree contains a symbolic link: ${candidate}`);
    if (entry.isDirectory()) rows.push(...await collectFiles(candidate));
    else if (entry.isFile()) rows.push(candidate);
    else fail(`Delivery tree contains a non-regular entry: ${candidate}`);
  }
  return rows;
}

async function assembleDelivery(outputRoot, audits) {
  const deliveryRoot = path.join(outputRoot, "delivery");
  // 기존 delivery를 덮어쓰지 않으며, 원본과 복사본의 해시를 즉시 비교한 뒤 공개용 보고서만 sanitize한다.
  check(!(await lstatOrNull(deliveryRoot)), `Delivery root already exists: ${deliveryRoot}`);
  await mkdir(deliveryRoot, { recursive: true, mode: 0o700 });
  const uploadSelectionRoot = usesExtendedDeliveryContract() ? path.join(deliveryRoot, "00-SoundCloud-WAV") : null;
  if (uploadSelectionRoot) await mkdir(uploadSelectionRoot, { recursive: true, mode: 0o700 });
  const manifestRows = [];
  for (const audit of audits) {
    const { config } = audit;
    const packageRoot = path.join(deliveryRoot, caseDirectoryName(config));
    const evidenceRoot = path.join(packageRoot, "actual-app-evidence");
    await mkdir(evidenceRoot, { recursive: true, mode: 0o700 });
    const wavTarget = path.join(packageRoot, `${caseDirectoryName(config)}-soundcloud.wav`);
    const projectTarget = path.join(packageRoot, `${caseDirectoryName(config)}.grooveforge.json`);
    const sheetTarget = path.join(packageRoot, `${caseDirectoryName(config)}-soundcloud-upload-ko.md`);
    const briefTarget = requestedHiphopPackMode ? path.join(packageRoot, `${caseDirectoryName(config)}-production-brief-ko.md`) : null;
    const qaTarget = path.join(packageRoot, `${caseDirectoryName(config)}-qa.json`);
    const reportTarget = path.join(evidenceRoot, "actual-app-report-sanitized.json");
    const wavCopied = await copyEvidenceFile(audit.wav.path, wavTarget);
    const projectCopied = await copyEvidenceFile(audit.savedProject.path, projectTarget);
    check(wavCopied.sha256 === audit.wav.sha256 && projectCopied.sha256 === audit.savedProject.sha256, `${config.id}: copied user artifacts changed.`);
    let soundCloudBatchWav = null;
    if (uploadSelectionRoot) {
      const batchTarget = path.join(uploadSelectionRoot, `${caseDirectoryName(config)}-soundcloud.wav`);
      const batchCopied = await copyEvidenceFile(wavTarget, batchTarget);
      check(
        batchCopied.bytes === wavCopied.bytes && batchCopied.sha256 === wavCopied.sha256,
        `${config.id}: top-level SoundCloud WAV copy is not byte-identical.`
      );
      soundCloudBatchWav = {
        bytes: batchCopied.bytes,
        path: relativeTo(deliveryRoot, batchTarget),
        sha256: batchCopied.sha256
      };
    }
    const projectContents = (await readFile(projectTarget)).toString("utf8");
    if (requestedHiphopPackMode) assertRequestedPublicMetadata(projectContents, `${config.id}: delivered project`);
    const project = workstation.parseProjectFile(projectContents);
    const sheet = buildSoundCloudSheet(audit, project);
    if (requestedHiphopPackMode) assertRequestedPublicMetadata(sheet, `${config.id}: SoundCloud sheet`);
    await writeExclusive(sheetTarget, sheet);
    let productionBrief = null;
    if (briefTarget) {
      const brief = buildProductionBrief(audit, project);
      assertRequestedPublicMetadata(brief, `${config.id}: production brief`);
      await writeExclusive(briefTarget, brief);
      productionBrief = {
        bytes: Buffer.byteLength(brief),
        path: relativeTo(deliveryRoot, briefTarget),
        sha256: sha256(brief)
      };
    }
    const sanitizedReport = `${JSON.stringify(sanitizeForDelivery(audit.report, outputRoot), null, 2)}\n`;
    check(!sanitizedReport.includes(outputRoot) && !sanitizedReport.includes(root), `${config.id}: sanitized report retained a known local absolute path.`);
    assertDeliveryTextPrivacy(sanitizedReport, `${config.id}: sanitized actual-app report`);
    if (requestedHiphopPackMode) assertRequestedPublicMetadata(sanitizedReport, `${config.id}: sanitized actual-app report`);
    await writeExclusive(reportTarget, sanitizedReport);
    const screenshots = {};
    for (const zone of ["arrange", "mix", "deliver"]) {
      const target = path.join(evidenceRoot, `${zone}.png`);
      const copied = await copyEvidenceFile(audit.screenshots[zone].path, target);
      check(copied.sha256 === audit.screenshots[zone].sha256, `${config.id}: ${zone} screenshot changed while copying.`);
      screenshots[zone] = {
        bytes: copied.bytes,
        path: relativeTo(deliveryRoot, target),
        sha256: copied.sha256
      };
    }
    const qaRow = {
      actualApp: {
        nativePointerAndKeyboard: true,
        originalReportBytes: audit.originalReport.bytes,
        originalReportSha256: audit.originalReport.sha256,
        performancePassed: true,
        reopenedArrangementMatches: true,
        reopenedAutomationMatches: true,
        sanitizedReport: {
          bytes: Buffer.byteLength(sanitizedReport),
          path: relativeTo(deliveryRoot, reportTarget),
          sha256: sha256(sanitizedReport)
        },
        screenshots,
        sourceBuildProvenanceValidated: true,
        sourceFixtureUnchanged: true,
        userDataIsolated: true,
        visiblePages: ["arrange", "mix", "deliver"]
      },
      audio: {
        bitDepth: audit.decoded.bitDepth,
        channelDcOffsets: audit.decoded.channelDcOffsets.map((value) => round(value, 9)),
        channels: audit.decoded.channels,
        clickRiskSamples: audit.decoded.clickRiskSamples,
        durationSeconds: round(audit.decoded.durationSeconds),
        frameCount: audit.decoded.frames,
        fullScaleSamples: audit.decoded.fullScaleSamples,
        lowerByteActivePercent: round(audit.decoded.lowerByteActivePercent),
        maxAdjacentDelta: round(audit.decoded.maxAdjacentDelta, 9),
        nonZeroPercent: round(audit.decoded.nonZeroPercent),
        peakDb: round(audit.decoded.peakDb),
        rmsDb: round(audit.decoded.rmsDb),
        sampleRate: audit.decoded.sampleRate,
        tailDurationSeconds: round(audit.tail.tailDurationSeconds),
        tailNonZeroSamples: audit.tail.nonZeroSamples,
        terminalZeroFrames: audit.decoded.terminalZeroFrames
      },
      bassStyle: config.bassStyle,
      ...(usesExtendedDeliveryContract() ? { blueprintId: config.blueprintId } : {}),
      bpm: config.bpm,
      checks: {
        actualApp: "passed",
        deterministicRerender: "passed",
        [usesExtendedDeliveryContract() ? "duration90To180Seconds" : "duration90To150Seconds"]: "passed",
        pcm24Stereo44100: "passed",
        privateFirstPackage: "prepared",
        ...(requestedHiphopPackMode
          ? { importedAudioUsed: false, namedReferenceMetadata: "absent", productionLaneContract: "passed" }
          : {}),
        soundCloudUploadPerformed: false
      },
      id: config.id,
      inputHashes: {
        movementSpecSha256: audit.spec.sha256,
        sourceProjectSha256: audit.source.sha256
      },
      key: project.key,
      order: config.order,
      ...(requestedHiphopPackMode
        ? {
            productionBrief,
            productionLaneId: config.productionLaneId,
            productionLaneName: config.productionLaneName
          }
        : {}),
      project: {
        bytes: audit.savedProject.bytes,
        path: relativeTo(deliveryRoot, projectTarget),
        sha256: audit.savedProject.sha256
      },
      schemaVersion: 1,
      soundCloudSheet: {
        bytes: Buffer.byteLength(sheet),
        path: relativeTo(deliveryRoot, sheetTarget),
        sha256: sha256(sheet)
      },
      styleName: config.styleName,
      title: config.title,
      ...(soundCloudBatchWav ? { soundCloudBatchWav } : {}),
      wav: {
        bytes: audit.wav.bytes,
        path: relativeTo(deliveryRoot, wavTarget),
        sha256: audit.wav.sha256
      }
    };
    const qaContents = `${JSON.stringify(qaRow, null, 2)}\n`;
    check(!qaContents.includes(outputRoot) && !qaContents.includes(root), `${config.id}: QA row retained a known local absolute path.`);
    assertDeliveryTextPrivacy(qaContents, `${config.id}: QA row`);
    if (requestedHiphopPackMode) assertRequestedPublicMetadata(qaContents, `${config.id}: QA row`);
    await writeExclusive(qaTarget, qaContents);
    manifestRows.push({
      ...qaRow,
      qa: {
        bytes: Buffer.byteLength(qaContents),
        path: relativeTo(deliveryRoot, qaTarget),
        sha256: sha256(qaContents)
      }
    });
  }

  check(manifestRows.length === genreCases.length, `Delivery manifest must contain all ${genreCases.length} selected genres.`);
  check(
    canonicalJson(manifestRows.map((row) => row.id).sort()) === canonicalJson(genreCases.map((config) => config.id).sort()),
    "Delivery manifest StyleProfile coverage does not match the selected genre matrix."
  );
  check(
    canonicalJson(manifestRows.map((row) => [row.order, row.id])) ===
      canonicalJson(genreCases.map((config) => [config.order, config.id])),
    "Delivery manifest order must match the actual execution order."
  );
  check(new Set(manifestRows.map((row) => row.wav.sha256)).size === genreCases.length, "Every genre WAV must have a distinct SHA-256.");
  const screenshotHashes = manifestRows.flatMap((row) => Object.values(row.actualApp.screenshots).map((entry) => entry.sha256));
  check(
    new Set(screenshotHashes).size === genreCases.length * 3,
    `All ${genreCases.length * 3} actual-app page screenshots must be distinct.`
  );
  if (usesExtendedDeliveryContract()) {
    check(
      canonicalJson(manifestRows.map((row) => row.blueprintId).sort()) === canonicalJson(genreCases.map((config) => config.blueprintId).sort()),
      "Delivery manifest Beat Blueprint coverage does not match the selected genre matrix."
    );
    const batchEntries = await readdir(uploadSelectionRoot, { withFileTypes: true });
    check(batchEntries.length === genreCases.length, `Top-level SoundCloud WAV folder must contain exactly ${genreCases.length} files.`);
    check(batchEntries.every((entry) => entry.isFile() && !entry.isSymbolicLink() && entry.name.endsWith("-soundcloud.wav")), "Top-level SoundCloud WAV folder contains an unexpected entry.");
    check(manifestRows.every((row) => row.soundCloudBatchWav?.sha256 === row.wav.sha256), "A top-level SoundCloud WAV differs from its genre-folder source.");
  }
  const readmeRows = manifestRows.map((row) => requestedHiphopPackMode
    ? `| ${String(row.order).padStart(2, "0")} | ${row.productionLaneName} | ${row.styleName} | ${row.title} | ${row.bpm} | ${row.audio.durationSeconds.toFixed(3)}초 | ${row.audio.peakDb.toFixed(2)} dBFS | ${row.audio.rmsDb.toFixed(2)} dBFS | 통과 |`
    : `| ${String(row.order).padStart(2, "0")} | ${row.styleName} | ${row.title} | ${row.bpm} | ${row.bassStyle} | ${row.audio.durationSeconds.toFixed(3)}초 | ${row.audio.peakDb.toFixed(2)} dBFS | ${row.audio.rmsDb.toFixed(2)} dBFS | 통과 |`
  ).join("\n");
  const readmeTitle = requestedHiphopPackMode
    ? `# GrooveForge 샘플 없는 힙합 7곡 실제 앱 SoundCloud 준비 패키지\n\n`
    : allGenresMode
      ? `# GrooveForge 전체 ${genreCases.length}장르 실제 앱 SoundCloud 준비 패키지\n\n`
      : `# GrooveForge 6장르 실제 앱 SoundCloud 준비 패키지\n\n`;
  const resultSummary = requestedHiphopPackMode
    ? `실제 production Electron 앱 화면에서 서로 다른 StyleProfile/Beat Blueprint 일곱 개를 3+2+2 제작 lane으로 구성하고, 각 곡을 Open → native UI 편곡 → Mix 분석 → Deliver WAV → Save → reopen했습니다. 모든 곡은 ${durationRangeLabel()}초, stereo 44.1kHz signed PCM 24-bit이며 편집 가능한 음악 이벤트와 내장 합성만 사용했습니다.\n\n`
    : allGenresMode
      ? `실제 production Electron 앱 화면에서 현재 지원하는 ${genreCases.length}개 StyleProfile 전체를 각각 Open → native UI 편곡 → Mix 분석 → Deliver WAV → Save → reopen했습니다. 모든 곡은 ${durationRangeLabel()}초, stereo 44.1kHz signed PCM 24-bit이며 여섯 Bass Voice family(808, sub, walking, pluck, reese, minimal)를 모두 다룹니다.\n\n`
      : `실제 production Electron 앱 화면에서 여섯 장르를 각각 Open → native UI 편곡 → Mix 분석 → Deliver WAV → Save → reopen했습니다. 모든 곡은 90~150초, stereo 44.1kHz signed PCM 24-bit이며 여섯 Bass Voice(808, sub, walking, pluck, reese, minimal)를 한 번씩 다룹니다.\n\n`;
  const uploadSelectionGuide = usesExtendedDeliveryContract()
    ? `## SoundCloud WAV 한 번에 선택\n\nSoundCloud 파일 선택기에서 이 패키지의 \`00-SoundCloud-WAV/\` 폴더를 열고 순번과 장르가 표시된 WAV ${genreCases.length}개를 모두 선택하면 됩니다. 이 파일들은 각 장르 폴더의 원본 WAV와 byte-identical하며 두 사본 모두 \`checksums.sha256\` 검증 대상입니다.\n\n`
    : "";
  const readmeTable = requestedHiphopPackMode
    ? `| 순서 | Production lane | 장르 | 제목 | BPM | 길이 | Sample peak | RMS | Actual-app |\n|---:|---|---|---|---:|---:|---:|---:|---|\n${readmeRows}\n\n`
    : `| 순서 | 장르 | 제목 | BPM | Bass Voice | 길이 | Sample peak | RMS | Actual-app |\n|---:|---|---|---:|---|---:|---:|---:|---|\n${readmeRows}\n\n`;
  const readme = readmeTitle +
    `## 결과\n\n` +
    resultSummary +
    readmeTable +
    uploadSelectionGuide +
    `## 폴더 사용법\n\n` +
    `각 장르 폴더에는 SoundCloud에 올릴 WAV, 다시 편집할 수 있는 GrooveForge 프로젝트, 한글 private-first 업로드 시트, 기술 QA JSON, Arrange/Mix/Deliver 실제 화면 PNG와 경로를 비식별화한 actual-app 보고서${requestedHiphopPackMode ? ", 프로덕션 브리프" : ""}가 있습니다. 전체 파일 무결성은 \`manifest.json\`과 \`checksums.sha256\`으로 확인합니다.\n\n` +
    `macOS Terminal에서 이 폴더로 이동한 뒤 \`shasum -a 256 -c checksums.sha256\`를 실행하면 모든 전달 파일을 다시 검증할 수 있습니다. 체크섬은 무결성 확인용이며 배포자 서명은 아닙니다.\n\n` +
    `## 아직 사람이 해야 하는 확인\n\n` +
    `- 모든 곡을 헤드폰과 스피커로 처음부터 끝까지 듣고 음악적 완성도, 전환, 저역과 엔딩을 승인합니다.\n` +
    `- LUFS/true-peak와 최종 마스터링은 별도로 판단합니다. 로컬 sample peak/RMS는 이를 대신하지 않습니다.\n` +
    `- 아티스트, 권리자, 기여자/크레딧, 라이선스와 아트워크 placeholder를 실제 정보로 교체합니다.\n` +
    `- 사람이 전곡을 듣고 기존 곡의 인식 가능한 멜로디·리프·편곡·프로듀서 표식과 우연한 겹침이 없는지 확인합니다.\n` +
    `- 먼저 Private / Downloads Off로 올린 뒤 SoundCloud 변환 스트림을 다시 듣습니다.\n\n` +
    `이 실행에서는 SoundCloud 또는 다른 외부 서비스에 대한 네트워크 작업을 요청하지 않았고, 로그인·업로드·공개, 수익화·배급·Content ID 변경을 수행하지 않았습니다. 런타임 네트워크 트래픽을 계측했다는 의미는 아닙니다.\n`;
  assertDeliveryTextPrivacy(readme, "Delivery README");
  if (requestedHiphopPackMode) assertRequestedPublicMetadata(readme, "Delivery README");
  await writeExclusive(path.join(deliveryRoot, "README.md"), readme);
  const manifest = {
    app: "GrooveForge",
    artifactCount: null,
    generatedAt: new Date().toISOString(),
    networkEvidence: {
      operationRequested: false,
      runtimeTrafficInstrumented: false,
      scope: "No external-service operation was requested by this harness run."
    },
    plan: planId,
    rows: manifestRows,
    schemaVersion: requestedHiphopPackMode ? 3 : allGenresMode ? 2 : 1,
    scope: requestedHiphopPackMode
      ? "seven-sample-free-hip-hop-track visible native actual-app QA and SoundCloud private-first preparation"
      : allGenresMode
        ? "all-current-style visible native actual-app QA and SoundCloud private-first preparation"
        : "six-genre visible native actual-app QA and SoundCloud private-first preparation",
    soundCloudUploadPerformed: false,
    technicalContract: requestedHiphopPackMode
      ? {
          blueprintCount: new Set(manifestRows.map((row) => row.blueprintId)).size,
          blueprintIdsInDeliveryOrder: manifestRows.map((row) => row.blueprintId),
          durationSeconds: { maximum: maximumDurationSeconds, minimum: minimumDurationSeconds },
          importedAudioUsed: false,
          productionLanes: requestedLaneContract.map((lane) => ({
            ...lane,
            styleIdsInDeliveryOrder: manifestRows.filter((row) => row.productionLaneId === lane.id).map((row) => row.id)
          })),
          publicMetadata: {
            affiliationOrImitationClaim: false,
            namedReferenceIncluded: false,
            rightsClaimsRequireHumanApproval: true
          },
          soundCloudBatchFolder: "00-SoundCloud-WAV",
          soundCloudBatchWavCount: manifestRows.length,
          styleCount: manifestRows.length,
          styleIdsInDeliveryOrder: manifestRows.map((row) => row.id),
          wav: expectedWav
        }
      : allGenresMode
        ? {
          bassVoices: requiredBassStyles,
          blueprintCount: new Set(manifestRows.map((row) => row.blueprintId)).size,
          blueprintIdsInDeliveryOrder: manifestRows.map((row) => row.blueprintId),
          durationSeconds: { maximum: maximumDurationSeconds, minimum: minimumDurationSeconds },
          soundCloudBatchFolder: "00-SoundCloud-WAV",
          soundCloudBatchWavCount: manifestRows.length,
          styleCount: manifestRows.length,
          styleIdsInDeliveryOrder: manifestRows.map((row) => row.id),
          supportedStyleCount: workstation.styleProfiles.length,
          wav: expectedWav
          }
        : {
          bassVoices: representativeGenreCases.map((config) => config.bassStyle),
          durationSeconds: { maximum: 150, minimum: minimumDurationSeconds },
          wav: expectedWav
        }
  };
  const manifestPath = path.join(deliveryRoot, "manifest.json");
  await writeExclusive(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const filesBeforeChecksums = (await collectFiles(deliveryRoot))
    .filter((filePath) => path.basename(filePath) !== "checksums.sha256")
    .sort((left, right) => relativeTo(deliveryRoot, left).localeCompare(relativeTo(deliveryRoot, right), "en"));
  manifest.artifactCount = filesBeforeChecksums.length + 1;
  const manifestContents = `${JSON.stringify(manifest, null, 2)}\n`;
  assertDeliveryTextPrivacy(manifestContents, "Delivery manifest");
  if (requestedHiphopPackMode) assertRequestedPublicMetadata(manifestContents, "Delivery manifest");
  await writeFile(manifestPath, manifestContents, { encoding: "utf8", mode: 0o600 });
  const checksumRows = [];
  for (const filePath of filesBeforeChecksums) checksumRows.push(`${await sha256File(filePath)}  ${relativeTo(deliveryRoot, filePath)}`);
  const checksumsPath = path.join(deliveryRoot, "checksums.sha256");
  await writeExclusive(checksumsPath, `${checksumRows.join("\n")}\n`);
  const checksumContents = (await readFile(checksumsPath, "utf8")).trim().split("\n");
  check(checksumContents.length === filesBeforeChecksums.length, "Top-level checksum row count mismatch.");
  for (const row of checksumContents) {
    const match = /^([a-f0-9]{64})  (.+)$/u.exec(row);
    check(Boolean(match), `Malformed checksum row: ${row}`);
    const target = path.join(deliveryRoot, match[2]);
    check(isInside(deliveryRoot, target), `Checksum path escaped delivery root: ${match[2]}`);
    check(await sha256File(target) === match[1], `Checksum verification failed: ${match[2]}`);
  }
  if (requestedHiphopPackMode) {
    for (const filePath of await collectFiles(deliveryRoot)) {
      if (![".json", ".md", ".sha256"].includes(path.extname(filePath))) continue;
      const contents = (await readRegularFile(filePath, 16 * 1024 * 1024)).toString("utf8");
      assertDeliveryTextPrivacy(contents, `Requested-pack delivery text ${relativeTo(deliveryRoot, filePath)}`);
      assertRequestedPublicMetadata(contents, `Requested-pack delivery text ${relativeTo(deliveryRoot, filePath)}`);
    }
  }
  return { artifactCount: manifest.artifactCount, deliveryRoot, manifestRows };
}

function createSyntheticWav() {
  const frames = 4;
  const bytes = Buffer.alloc(44 + frames * expectedWav.blockAlign);
  bytes.write("RIFF", 0, "ascii");
  bytes.writeUInt32LE(bytes.byteLength - 8, 4);
  bytes.write("WAVE", 8, "ascii");
  bytes.write("fmt ", 12, "ascii");
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(2, 22);
  bytes.writeUInt32LE(44_100, 24);
  bytes.writeUInt32LE(264_600, 28);
  bytes.writeUInt16LE(6, 32);
  bytes.writeUInt16LE(24, 34);
  bytes.write("data", 36, "ascii");
  bytes.writeUInt32LE(frames * 6, 40);
  const samples = [0, 0, 65_537, -65_537, 32_769, -32_769, 0, 0];
  for (const [index, sample] of samples.entries()) {
    const unsigned = sample < 0 ? sample + 0x1000000 : sample;
    const offset = 44 + index * 3;
    bytes[offset] = unsigned & 0xff;
    bytes[offset + 1] = unsigned >>> 8 & 0xff;
    bytes[offset + 2] = unsigned >>> 16 & 0xff;
  }
  return bytes;
}

async function runSelfTest() {
  validateGenreMatrix();
  const decoded = decodeCanonicalPcm24Wav(createSyntheticWav());
  check(decoded.frames === 4 && decoded.channels === 2 && decoded.bitDepth === 24, "Synthetic PCM24 parser self-test failed.");
  check(decoded.nonZeroSamples === 4 && decoded.terminalZeroFrames === 1, "Synthetic signal metrics self-test failed.");
  const sanitized = sanitizeForDelivery({ path: path.join(root, "build", "desktop", "x") }, path.join(root, "build"));
  check(!sanitized.path.includes(root) && sanitized.path.includes("<RUN_ROOT>"), "Absolute-path sanitization self-test failed.");
  assertDeliveryTextPrivacy(JSON.stringify(sanitized), "Sanitization self-test output");
  let rejectedUnknownLocalPath = false;
  try {
    assertDeliveryTextPrivacy('{"path":"/Users/example/unknown/file.json"}', "Sanitization leak fixture");
  } catch {
    rejectedUnknownLocalPath = true;
  }
  check(rejectedUnknownLocalPath, "Unknown local absolute-path privacy gate self-test failed.");
  if (requestedHiphopPackMode) {
    const config = genreCases[0];
    const project = createSourceProject(config);
    const safeAudit = {
      config,
      decoded: {
        durationSeconds: expectedDuration(config),
        fullScaleSamples: 0,
        lowerByteActivePercent: 100,
        peakDb: -1,
        rmsDb: -12,
        terminalZeroFrames: 1
      },
      tail: { nonZeroSamples: 1, tailDurationSeconds: 1 },
      wav: { bytes: 1_024, sha256: "a".repeat(64) }
    };
    assertRequestedPublicMetadata(deterministicProjectFile(project), "Requested source metadata self-test");
    assertRequestedPublicMetadata(
      JSON.stringify(createMovementSpec(config, path.join(desktopBuildRoot, `${outputRootPrefix}self-test`, "source.grooveforge.json"))),
      "Requested movement spec self-test"
    );
    assertRequestedPublicMetadata(buildSoundCloudSheet(safeAudit, project), "Requested SoundCloud sheet self-test");
    assertRequestedPublicMetadata(buildProductionBrief(safeAudit, project), "Requested production brief self-test");
    for (const fixture of [
      "Black Nut type beat",
      "Black-Nut",
      "C.Jamm",
      "한 요 한",
      "produced by Example",
      "official collab",
      "공식협업",
      "타입 비트",
      "contact@example.com",
      '{"hostname":"private-host"}',
      '{"token":"private-token"}',
      '{"accessToken":"private-token"}',
      '{"clientSecret":"private-secret"}'
    ]) {
      let rejected = false;
      try {
        assertRequestedPublicMetadata(fixture, "Requested public-metadata rejection fixture");
      } catch {
        rejected = true;
      }
      check(rejected, `Requested public-metadata rejection self-test failed for: ${fixture}`);
    }
    let rejectedRequestedLocalPath = false;
    try {
      assertDeliveryTextPrivacy('{"path":"/Users/example/private.json"}', "Requested local-path rejection fixture");
    } catch {
      rejectedRequestedLocalPath = true;
    }
    check(rejectedRequestedLocalPath, "Requested local-path rejection self-test failed.");
  }
  console.log(`GrooveForge ${modeLabel()} actual-app QA self-test passed.`);
  console.log(`- Genres: ${genreCases.length}/${expectedGenreCount()}`);
  console.log(`- StyleProfile coverage: ${new Set(genreCases.map((config) => config.id)).size}/${expectedGenreCount()}`);
  console.log(`- Beat Blueprint coverage: ${new Set(genreCases.map((config) => config.blueprintId)).size}/${expectedGenreCount()}`);
  console.log(`- Bass Voice family coverage: ${[...new Set(genreCases.map((config) => config.bassStyle))].sort().join(", ")}`);
  if (requestedHiphopPackMode) {
    console.log(`- Production lanes: ${requestedLaneContract.map((lane) => `${lane.id}=${lane.count}`).join(", ")}`);
  }
  console.log(`- Duration range: ${durationRangeLabel()} seconds`);
  console.log("- PCM parser, deterministic source, strict spec, and path sanitization contracts passed");
}

async function runAudioSelfTest() {
  validateGenreMatrix();
  for (const config of genreCases) {
    const spec = createMovementSpec(config, path.join(desktopBuildRoot, `${outputRootPrefix}audio-self-test`, `${config.id}.grooveforge.json`));
    const source = createSourceProject(config);
    const arranged = workstation.applyMasterAutomationPreset(
      {
        ...source,
        arrangement: config.arrangement,
        sessionBrief: spec.sessionBrief,
        title: config.title
      },
      config.masterAutomation
    );
    console.log(`검증: ${config.styleName} ${arrangementBars(config)} bars offline long-form PCM을 렌더합니다.`);
    const bytes = Buffer.from(await render.createMixWavBlob(arranged).arrayBuffer());
    const decoded = decodeCanonicalPcm24Wav(bytes);
    const tail = musicalBoundaryTailEvidence(bytes, config);
    const tolerance = 1 / expectedWav.sampleRate + Number.EPSILON;
    check(decoded.frames === expectedFrameCount(config), `${config.id}: audio self-test frame count mismatch.`);
    check(Math.abs(decoded.durationSeconds - expectedDuration(config)) <= tolerance, `${config.id}: audio self-test duration mismatch.`);
    check(decoded.nonZeroPercent >= 0.01 && decoded.channelNonZeroSamples.every((count) => count > 0), `${config.id}: audio self-test audibility failed.`);
    check(decoded.lowerByteActivePercent >= 50, `${config.id}: audio self-test lower-byte activity failed.`);
    check(decoded.fullScaleSamples === 0 && decoded.terminalZeroFrames >= 1, `${config.id}: audio self-test full-scale/terminal-zero failed.`);
    check(decoded.peakDb <= arranged.masterCeilingDb + 0.02, `${config.id}: audio self-test ceiling failed.`);
    check(decoded.channelDcOffsets.every((offset) => Math.abs(offset) <= 0.02), `${config.id}: audio self-test DC bound failed.`);
    check(decoded.clickRiskSamples === 0 && decoded.maxAdjacentDelta <= 0.95, `${config.id}: audio self-test adjacent-transition bound failed.`);
    check(tail.nonZeroSamples > 0, `${config.id}: audio self-test export tail is empty.`);
    console.log(
      `- ${config.id}: ${decoded.durationSeconds.toFixed(6)}s / peak ${decoded.peakDb.toFixed(2)} dBFS / RMS ${decoded.rmsDb.toFixed(2)} dBFS / max delta ${decoded.maxAdjacentDelta.toFixed(6)}`
    );
  }
  console.log(`GrooveForge ${genreCases.length}-genre long-form offline audio self-test passed.`);
}

function printPreparedCommands(outputRoot) {
  console.log(`GrooveForge ${modeLabel()} actual-app inputs are ready.`);
  console.log(`- Output root: ${outputRoot}`);
  console.log(`- Run these ${genreCases.length} commands from the repository worktree after npm run build:`);
  for (const config of genreCases) {
    console.log(
      `  GROOVEFORGE_DESKTOP_WORKSPACE_ROOT=${workspacePath(outputRoot, config)} npm run desktop:movement-qa -- --movement-spec ${movementSpecPath(outputRoot, config)}`
    );
  }
  const resumeCommand = requestedHiphopPackMode
    ? "npm run desktop:requested-hiphop-qa --"
    : allGenresMode
      ? "npm run desktop:all-genres-qa --"
      : "node --experimental-strip-types --import ./harness/scripts/register_ts_loader.mjs harness/scripts/run_desktop_multigenre_actual_app_qa.mjs";
  console.log(`- Then assemble/audit: ${resumeCommand} --from-existing --output-root ${outputRoot}`);
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  configureGenreMode(args.allGenres, args.requestedHiphopPack);
  if (args.selfTest) {
    await runSelfTest();
    return;
  }
  if (args.audioSelfTest) {
    await runAudioSelfTest();
    return;
  }
  validateGenreMatrix();
  const outputRoot = args.outputRoot ?? defaultOutputRoot();
  assertPlanOutputRoot(outputRoot);
  if (args.fromExisting) await loadPreparedOutput(outputRoot);
  else await prepareOutput(outputRoot);
  if (args.prepareOnly) {
    printPreparedCommands(outputRoot);
    return;
  }
  // --from-existing은 실제 앱을 다시 실행하지 않고 선택 모드와 ownership이 일치하는 증거만 재감사한다.
  // 정상 경로에서만 build와 선택된 수만큼 visible native QA를 수행하며 외부 SoundCloud 작업은 호출하지 않는다.
  if (!args.fromExisting) await runActualAppSequence(outputRoot, args.skipBuild);
  const audits = [];
  for (const config of genreCases) {
    console.log(`검증: ${config.styleName} actual-app report/project/WAV/screenshots를 독립 감사합니다.`);
    audits.push(await auditGenre(outputRoot, config));
  }
  const delivery = await assembleDelivery(outputRoot, audits);
  console.log(`GrooveForge ${genreCases.length}장르 actual-app QA와 SoundCloud 준비 패키지가 완료되었습니다.`);
  console.log(`- Delivery: ${delivery.deliveryRoot}`);
  console.log(`- Genres: ${delivery.manifestRows.length}/${expectedGenreCount()}`);
  console.log(`- Artifacts: ${delivery.artifactCount}`);
  console.log("- Actual SoundCloud login/upload/publication: not performed");
}

await main().catch((error) => {
  console.error(`GrooveForge ${modeLabel()} actual-app QA failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
