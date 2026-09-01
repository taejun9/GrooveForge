#!/usr/bin/env node

/**
 * 역할: 실제 Electron 앱 화면에서 여러 장르 프로젝트를 순차 검수하고 90~150초 SoundCloud 전달용 WAV·보고서를 조립한다.
 * 흐름: 장르별 fixture를 준비해 visible UI QA를 실행하고 PCM24·길이·peak·스크린샷·재열기 증거를 검증한 뒤 전달 묶음을 만든다.
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
const planId = "plan-1528-desktop-app-multigenre-ui-qa";
const ownerMarker = "GrooveForge plan-1528 multi-genre actual-app QA";
const fixedSourceSavedAt = "2026-08-31T00:00:00.000Z";
const minimumDurationSeconds = 90;
const maximumDurationSeconds = 150;
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

const genreCases = [
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
    audioSelfTest: false,
    fromExisting: false,
    outputRoot: null,
    prepareOnly: false,
    selfTest: false,
    skipBuild: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--audio-self-test") parsed.audioSelfTest = true;
    else if (argument === "--from-existing") parsed.fromExisting = true;
    else if (argument === "--prepare-only") parsed.prepareOnly = true;
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
  return path.join(desktopBuildRoot, `plan-1528-multigenre-actual-app-qa-${timestampId()}-${process.pid}`);
}

function assertPlanOutputRoot(outputRoot) {
  // 정리·조립이 닿는 범위를 plan 전용 build/desktop 하위로 고정한다. 절대 경로를 받더라도
  // 저장소나 홈 디렉터리를 산출물 root로 사용할 수 없다.
  check(path.isAbsolute(outputRoot), "Multi-genre output root must be absolute.");
  check(isInside(desktopBuildRoot, outputRoot), `Output root must remain below ${desktopBuildRoot}.`);
  check(path.basename(outputRoot).startsWith("plan-1528-"), "Output root basename must start with plan-1528-.");
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
      artist: "GrooveForge 오리지널 QA",
      vibe: `${config.styleName} 실제 앱 장곡 QA 시드`,
      reference: "내장 이벤트와 신시사이저만 사용",
      notes: "실제 앱에서 편곡, WAV 내보내기, 저장과 재열기를 검증하기 위한 샘플 없는 오리지널 시드 프로젝트."
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
      artist: "GrooveForge 오리지널 QA",
      vibe: config.vibe,
      reference: `${config.styleName} 내장 이벤트 기반 오리지널 편곡`,
      notes: "외부 샘플 없이 GrooveForge의 편집 가능한 음악 이벤트와 내장 신시사이저로 제작한 실제 앱 QA 곡. 특정 아티스트를 모사하지 않으며 공개 전 권리자, 크레딧과 아트워크를 확인해야 합니다."
    },
    sourceProjectPath: absoluteSourcePath,
    title: config.title
  };
}

function validateGenreMatrix() {
  check(genreCases.length === 6, "The actual-app matrix must contain exactly six genres.");
  check(new Set(genreCases.map((entry) => entry.id)).size === genreCases.length, "Genre ids must be unique.");
  check(new Set(genreCases.map((entry) => entry.order)).size === genreCases.length, "Genre orders must be unique.");
  check(
    canonicalJson(genreCases.map((entry) => entry.bassStyle).sort()) ===
      canonicalJson(["808", "minimal", "pluck", "reese", "sub", "walking"]),
    "The six cases must cover every Bass Voice family exactly once."
  );
  for (const config of genreCases) {
    const profile = workstation.styleProfiles.find((candidate) => candidate.id === config.id);
    check(Boolean(profile), `${config.id}: style profile is missing.`);
    check(profile.bassStyle === config.bassStyle, `${config.id}: expected ${config.bassStyle} Bass Voice, got ${profile.bassStyle}.`);
    check(profile.defaultBpm === config.bpm, `${config.id}: case BPM must match the style default.`);
    const bars = arrangementBars(config);
    check(bars <= workstation.maxProjectArrangementBars, `${config.id}: ${bars} bars exceeds the project limit.`);
    check(config.arrangement.every((block) => block.bars >= 1 && block.bars <= 16), `${config.id}: a block exceeds 1-16 bars.`);
    const duration = expectedDuration(config);
    check(
      duration >= minimumDurationSeconds && duration <= maximumDurationSeconds,
      `${config.id}: expected duration ${duration}s is outside 90-150 seconds.`
    );
    const source = createSourceProject(config);
    const sourceText = deterministicProjectFile(source);
    const reopened = workstation.parseProjectFile(sourceText);
    check(reopened.styleId === config.id && reopened.bpm === config.bpm, `${config.id}: deterministic source did not reopen exactly.`);
    check(new Set(["A", "B", "C"].map((slot) => sha256(canonicalJson(reopened.patterns[slot])))).size === 3, `${config.id}: Pattern A/B/C must be distinct.`);
    const spec = createMovementSpec(config, path.join(desktopBuildRoot, "plan-1528-self-test", `${config.id}.grooveforge.json`));
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
  await writeExclusive(path.join(outputRoot, ".grooveforge-plan-1528-owned.json"), `${JSON.stringify(sentinel, null, 2)}\n`);
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
      bpm: config.bpm,
      expectedDurationSeconds: round(expectedDuration(config)),
      id: config.id,
      order: config.order,
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
    mode: "visible-native-sequential-multigenre",
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
  const sentinel = await readJson(path.join(outputRoot, ".grooveforge-plan-1528-owned.json"));
  check(sentinel.owner === ownerMarker && sentinel.plan === planId && sentinel.schemaVersion === 1, "Output root ownership sentinel is invalid.");
  check(path.resolve(sentinel.outputRoot) === outputRoot, "Output root ownership sentinel path does not match.");
  const runPlan = await readJson(path.join(outputRoot, "run-plan.json"));
  check(runPlan.plan === planId && runPlan.schemaVersion === 1 && Array.isArray(runPlan.entries), "Prepared run-plan contract is invalid.");
  check(runPlan.entries.length === genreCases.length, "Prepared run-plan must contain all six genres.");
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
    console.log(`검증: [${config.order}/6] ${config.styleName} / ${config.title} actual-app QA를 실행합니다.`);
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
  check(zoneEvidence.tabCount === 4 && zoneEvidence.tabPanelCount === 4, `${zone}: expected four tabs and tabpanels.`);
  check(zoneEvidence.selectedTabCount === 1 && zoneEvidence.tabStopCount === 1, `${zone}: tab selection/roving stop contract failed.`);
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
  check(decoded.durationSeconds >= minimumDurationSeconds && decoded.durationSeconds <= maximumDurationSeconds, `${config.id}: WAV is outside 90-150 seconds.`);
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
    `- 장르: ${config.styleName}\n` +
    `- BPM / Key: ${config.bpm} BPM / ${project.key}\n` +
    `- 무드: ${config.mood}\n` +
    `- 영문 태그: ${config.tags.join(", ")}\n` +
    `- 라이선스: [권리 확인 후 선택]\n` +
    `- 첫 공개 범위: Private\n` +
    `- Downloads: Off\n` +
    `- 아트워크: [업로드 전 권리 확인된 정사각형 이미지 준비]\n\n` +
    `## 설명 초안\n\n` +
    `${config.vibe}. 외부 샘플 없이 GrooveForge의 편집 가능한 음악 이벤트와 내장 신시사이저로 만든 오리지널 인스트루멘털입니다.\n\n` +
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
    `1. 대괄호 placeholder를 실제 아티스트·권리자·라이선스·아트워크 정보로 교체합니다.\n` +
    `2. 음악과 시각 자료의 권리를 확인합니다. 제3자 표기만으로 사용 허락을 대신할 수 없습니다.\n` +
    `3. WAV를 먼저 Private로 업로드하고 Downloads는 Off로 유지합니다.\n` +
    `4. SoundCloud 처리 후 변환 스트림을 헤드폰과 스피커에서 처음부터 끝까지 듣습니다.\n` +
    `5. 인트로, 가장 큰 구간, 저역, 전환, 엔딩과 메타데이터를 승인한 뒤에만 공개 범위를 결정합니다.\n` +
    `6. 수익화·배급·Content ID는 별도의 권리 확인 뒤 결정합니다.\n\n` +
    `## 기술 한계\n\n` +
    `이 시트의 peak/RMS는 로컬 sample 측정이며 LUFS, true peak, 전문 마스터링 또는 플랫폼 승인 보장이 아닙니다. 실제 업로드·공개·계정 변경은 수행하지 않았습니다.\n\n` +
    `## SoundCloud 공식 참고 자료 (2026-08-31 확인)\n\n` +
    `- Upload requirements: https://help.soundcloud.com/hc/en-us/articles/360039171614-Upload-Requirements\n` +
    `- Privacy settings: https://help.soundcloud.com/hc/en-us/articles/46020211210523-Edit-your-track-s-privacy-settings\n` +
    `- Track permissions: https://help.soundcloud.com/hc/en-us/articles/31423603670043-Manage-your-track-s-permissions\n`;
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
  const manifestRows = [];
  for (const audit of audits) {
    const { config } = audit;
    const packageRoot = path.join(deliveryRoot, caseDirectoryName(config));
    const evidenceRoot = path.join(packageRoot, "actual-app-evidence");
    await mkdir(evidenceRoot, { recursive: true, mode: 0o700 });
    const wavTarget = path.join(packageRoot, `${caseDirectoryName(config)}-soundcloud.wav`);
    const projectTarget = path.join(packageRoot, `${caseDirectoryName(config)}.grooveforge.json`);
    const sheetTarget = path.join(packageRoot, `${caseDirectoryName(config)}-soundcloud-upload-ko.md`);
    const qaTarget = path.join(packageRoot, `${caseDirectoryName(config)}-qa.json`);
    const reportTarget = path.join(evidenceRoot, "actual-app-report-sanitized.json");
    const wavCopied = await copyEvidenceFile(audit.wav.path, wavTarget);
    const projectCopied = await copyEvidenceFile(audit.savedProject.path, projectTarget);
    check(wavCopied.sha256 === audit.wav.sha256 && projectCopied.sha256 === audit.savedProject.sha256, `${config.id}: copied user artifacts changed.`);
    const project = workstation.parseProjectFile((await readFile(projectTarget)).toString("utf8"));
    const sheet = buildSoundCloudSheet(audit, project);
    await writeExclusive(sheetTarget, sheet);
    const sanitizedReport = `${JSON.stringify(sanitizeForDelivery(audit.report, outputRoot), null, 2)}\n`;
    check(!sanitizedReport.includes(outputRoot) && !sanitizedReport.includes(root), `${config.id}: sanitized report retained a known local absolute path.`);
    assertDeliveryTextPrivacy(sanitizedReport, `${config.id}: sanitized actual-app report`);
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
      bpm: config.bpm,
      checks: {
        actualApp: "passed",
        deterministicRerender: "passed",
        duration90To150Seconds: "passed",
        pcm24Stereo44100: "passed",
        privateFirstPackage: "prepared",
        soundCloudUploadPerformed: false
      },
      id: config.id,
      inputHashes: {
        movementSpecSha256: audit.spec.sha256,
        sourceProjectSha256: audit.source.sha256
      },
      key: project.key,
      order: config.order,
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
      wav: {
        bytes: audit.wav.bytes,
        path: relativeTo(deliveryRoot, wavTarget),
        sha256: audit.wav.sha256
      }
    };
    const qaContents = `${JSON.stringify(qaRow, null, 2)}\n`;
    check(!qaContents.includes(outputRoot) && !qaContents.includes(root), `${config.id}: QA row retained a known local absolute path.`);
    assertDeliveryTextPrivacy(qaContents, `${config.id}: QA row`);
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

  check(new Set(manifestRows.map((row) => row.wav.sha256)).size === genreCases.length, "Every genre WAV must have a distinct SHA-256.");
  const screenshotHashes = manifestRows.flatMap((row) => Object.values(row.actualApp.screenshots).map((entry) => entry.sha256));
  check(new Set(screenshotHashes).size === genreCases.length * 3, "All 18 actual-app page screenshots must be distinct.");
  const readmeRows = manifestRows.map((row) =>
    `| ${String(row.order).padStart(2, "0")} | ${row.styleName} | ${row.title} | ${row.bpm} | ${row.bassStyle} | ${row.audio.durationSeconds.toFixed(3)}초 | ${row.audio.peakDb.toFixed(2)} dBFS | ${row.audio.rmsDb.toFixed(2)} dBFS | 통과 |`
  ).join("\n");
  const readme = `# GrooveForge 6장르 실제 앱 SoundCloud 준비 패키지\n\n` +
    `## 결과\n\n` +
    `실제 production Electron 앱 화면에서 여섯 장르를 각각 Open → native UI 편곡 → Mix 분석 → Deliver WAV → Save → reopen했습니다. 모든 곡은 90~150초, stereo 44.1kHz signed PCM 24-bit이며 여섯 Bass Voice(808, sub, walking, pluck, reese, minimal)를 한 번씩 다룹니다.\n\n` +
    `| 순서 | 장르 | 제목 | BPM | Bass Voice | 길이 | Sample peak | RMS | Actual-app |\n|---:|---|---|---:|---|---:|---:|---:|---|\n${readmeRows}\n\n` +
    `## 폴더 사용법\n\n` +
    `각 장르 폴더에는 SoundCloud에 올릴 WAV, 다시 편집할 수 있는 GrooveForge 프로젝트, 한글 private-first 업로드 시트, 기술 QA JSON, Arrange/Mix/Deliver 실제 화면 PNG와 경로를 비식별화한 actual-app 보고서가 있습니다. 전체 파일 무결성은 \`manifest.json\`과 \`checksums.sha256\`으로 확인합니다.\n\n` +
    `macOS Terminal에서 이 폴더로 이동한 뒤 \`shasum -a 256 -c checksums.sha256\`를 실행하면 모든 전달 파일을 다시 검증할 수 있습니다. 체크섬은 무결성 확인용이며 배포자 서명은 아닙니다.\n\n` +
    `## 아직 사람이 해야 하는 확인\n\n` +
    `- 모든 곡을 헤드폰과 스피커로 처음부터 끝까지 듣고 음악적 완성도, 전환, 저역과 엔딩을 승인합니다.\n` +
    `- LUFS/true-peak와 최종 마스터링은 별도로 판단합니다. 로컬 sample peak/RMS는 이를 대신하지 않습니다.\n` +
    `- 아티스트, 권리자, 크레딧, 라이선스와 아트워크 placeholder를 실제 정보로 교체합니다.\n` +
    `- 먼저 Private / Downloads Off로 올린 뒤 SoundCloud 변환 스트림을 다시 듣습니다.\n\n` +
    `이 실행에서는 SoundCloud 또는 다른 외부 서비스에 대한 네트워크 작업을 요청하지 않았고, 로그인·업로드·공개, 수익화·배급·Content ID 변경을 수행하지 않았습니다. 런타임 네트워크 트래픽을 계측했다는 의미는 아닙니다.\n`;
  assertDeliveryTextPrivacy(readme, "Delivery README");
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
    schemaVersion: 1,
    scope: "six-genre visible native actual-app QA and SoundCloud private-first preparation",
    soundCloudUploadPerformed: false,
    technicalContract: {
      bassVoices: ["minimal", "walking", "808", "sub", "pluck", "reese"],
      durationSeconds: { maximum: 150, minimum: 90 },
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
  console.log("GrooveForge multi-genre actual-app QA self-test passed.");
  console.log("- Genres: 6/6");
  console.log("- Bass Voice coverage: minimal, walking, 808, sub, pluck, reese");
  console.log("- Duration range: 90-150 seconds");
  console.log("- PCM parser, deterministic source, strict spec, and path sanitization contracts passed");
}

async function runAudioSelfTest() {
  validateGenreMatrix();
  for (const config of genreCases) {
    const spec = createMovementSpec(config, path.join(desktopBuildRoot, "plan-1528-audio-self-test", `${config.id}.grooveforge.json`));
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
  console.log("GrooveForge six-genre long-form offline audio self-test passed.");
}

function printPreparedCommands(outputRoot) {
  console.log("GrooveForge multi-genre actual-app inputs are ready.");
  console.log(`- Output root: ${outputRoot}`);
  console.log("- Run these six commands from the repository worktree after npm run build:");
  for (const config of genreCases) {
    console.log(
      `  GROOVEFORGE_DESKTOP_WORKSPACE_ROOT=${workspacePath(outputRoot, config)} npm run desktop:movement-qa -- --movement-spec ${movementSpecPath(outputRoot, config)}`
    );
  }
  console.log(`- Then assemble/audit: node --experimental-strip-types --import ./harness/scripts/register_ts_loader.mjs harness/scripts/run_desktop_multigenre_actual_app_qa.mjs --from-existing --output-root ${outputRoot}`);
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
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
  // --from-existing은 실제 앱을 다시 실행하지 않고 이미 준비된 증거를 재감사한다. 정상 경로에서만
  // build와 여섯 번의 visible native QA를 수행하며, 어떤 경로도 SoundCloud 외부 작업을 호출하지 않는다.
  if (!args.fromExisting) await runActualAppSequence(outputRoot, args.skipBuild);
  const audits = [];
  for (const config of genreCases) {
    console.log(`검증: ${config.styleName} actual-app report/project/WAV/screenshots를 독립 감사합니다.`);
    audits.push(await auditGenre(outputRoot, config));
  }
  const delivery = await assembleDelivery(outputRoot, audits);
  console.log("GrooveForge 6장르 actual-app QA와 SoundCloud 준비 패키지가 완료되었습니다.");
  console.log(`- Delivery: ${delivery.deliveryRoot}`);
  console.log(`- Genres: ${delivery.manifestRows.length}/6`);
  console.log(`- Artifacts: ${delivery.artifactCount}`);
  console.log("- Actual SoundCloud login/upload/publication: not performed");
}

await main().catch((error) => {
  console.error(`GrooveForge multi-genre actual-app QA failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
