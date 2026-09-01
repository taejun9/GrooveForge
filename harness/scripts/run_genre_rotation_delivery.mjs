#!/usr/bin/env node

/**
 * 역할: 16개 장르 스타일을 순환해 원본 beat WAV·MIDI·전달 metadata와 SoundCloud 준비 증거를 생성한다.
 * 흐름: 각 style profile로 프로젝트를 렌더링하고 PCM·길이·peak·구간·해시를 검증한 뒤 장르별 bundle과 보고서를 조립한다.
 * 안전 경계: 사용자 지정 출력 경로를 거부하고 로컬 합성물만 만들며 샘플 다운로드·저작물 수집·SoundCloud 업로드는 수행하지 않는다.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const defaultOutputRoot = path.join(
  root,
  "build",
  "desktop",
  `GrooveForge-${packageJson.version}-${process.platform}-${process.arch}-genre-rotation-delivery`
);
const outputRoot = defaultOutputRoot;
const failures = [];

if (process.argv.length > 2) {
  // 임의 경로 삭제·덮어쓰기를 막기 위해 생성 위치는 version/platform별 build 산출물로 고정한다.
  throw new Error("genre rotation delivery does not accept a custom output path; copy the verified build artifact after generation");
}

const workstation = await import("../../src/domain/workstation.ts");
const render = await import("../../src/audio/render.ts");
const soundcloud = await import("../../src/audio/soundcloud.ts");
const deliveryBundle = await import("../../src/audio/deliveryBundle.ts");

const focusStyleIds = new Set(["ballad", "hiphop", "rnb"]);
const rotationStyleIds = [
  "ballad",
  "hiphop",
  "rnb",
  "house",
  "boom_bap",
  "k_hiphop_rnb",
  "trap",
  "afrobeats",
  "lofi",
  "amapiano",
  "drill",
  "reggaeton",
  "garage",
  "jersey",
  "phonk",
  "experimental"
];
const trackTitles = {
  ballad: "Glass Letter",
  hiphop: "Night Transit",
  rnb: "Velvet Reply",
  house: "Neon Current",
  boom_bap: "Dust Signal",
  k_hiphop_rnb: "Seoul Afterimage",
  trap: "Gravity Thread",
  afrobeats: "Sunlit Steps",
  lofi: "Paper Lantern",
  amapiano: "Log Bloom",
  drill: "Cold Geometry",
  reggaeton: "Amber Motion",
  garage: "Rainline",
  jersey: "Sidewalk Voltage",
  phonk: "Chrome Shadow",
  experimental: "Fractured Orbit"
};

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function relativeToOutput(filePath) {
  return path.relative(outputRoot, filePath);
}

function ascii(bytes, start, length) {
  return bytes.subarray(start, start + length).toString("ascii");
}

function checkWav(bytes, label) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  check(bytes.byteLength > 44, `${label}: WAV must include PCM data`);
  check(ascii(bytes, 0, 4) === "RIFF", `${label}: RIFF header missing`);
  check(ascii(bytes, 8, 4) === "WAVE", `${label}: WAVE header missing`);
  check(view.getUint16(20, true) === 1, `${label}: WAV must use PCM format 1`);
  check(view.getUint16(22, true) === 2, `${label}: WAV must be stereo`);
  check(view.getUint32(24, true) === 44100, `${label}: WAV must use 44.1 kHz`);
  check(view.getUint32(28, true) === 264600, `${label}: WAV byte rate must match 24-bit stereo 44.1 kHz`);
  check(view.getUint16(32, true) === 6, `${label}: WAV block alignment must be six bytes`);
  check(view.getUint16(34, true) === 24, `${label}: WAV must use signed PCM 24-bit`);
  check((bytes.byteLength - 44) % 6 === 0, `${label}: WAV data must contain complete stereo frames`);
  check(bytes.subarray(bytes.byteLength - 6).every((value) => value === 0), `${label}: terminal frame must end at digital zero`);
}

async function writeArtifact(artifacts, filePath, bytes) {
  await writeFile(filePath, bytes);
  const row = {
    path: relativeToOutput(filePath),
    bytes: bytes.byteLength,
    sha256: sha256(bytes)
  };
  artifacts.push(row);
  return row;
}

function buildProject(profile) {
  const blueprint = workstation.beatBlueprints.find((candidate) => candidate.styleId === profile.id);
  check(Boolean(blueprint), `${profile.id}: dedicated Beat Blueprint missing`);
  const blueprintProject = workstation.applyBeatBlueprint(
    workstation.starterProject,
    blueprint?.id ?? workstation.beatBlueprints[0].id
  );
  const targetProject = workstation.applyDeliveryTarget(blueprintProject, "starter_sketch");
  return {
    ...targetProject,
    title: trackTitles[profile.id],
    mode: "studio",
    arrangement: workstation.createPatternChain("eight_bar"),
    sessionBrief: {
      artist: "",
      vibe: `${profile.name} / original instrumental / ${profile.bassStyle} bass / ${profile.melodyStyle} melody`,
      reference: "GrooveForge built-in synthesis and editable musical events",
      notes: "Generated locally without imported audio. Replace artist, rightsholder, credits, artwork, and release details before upload."
    },
    snapshots: []
  };
}

function buildReadme(rows, artifactCount) {
  const table = rows
    .map(
      (row) =>
        `| ${String(row.order).padStart(2, "0")} | ${row.styleName} | ${row.title} | ${row.bpm} | ${row.key} | ${row.durationSeconds.toFixed(2)}s | ${row.peakDb.toFixed(2)} dB | ${row.rmsDb.toFixed(2)} dB | ${row.focusBundle ? "yes" : "no"} |`
    )
    .join("\n");
  return `# GrooveForge SoundCloud Genre Rotation

## 결과

- 지원 스타일 ${rows.length}/${workstation.styleProfiles.length}개를 순서대로 실제 24-bit WAV로 렌더했습니다.
- 각 장르 폴더에는 full-mix WAV, 다시 열 수 있는 GrooveForge 프로젝트, SoundCloud Upload Sheet가 있습니다.
- Ballad, Hip-Hop, R&B 폴더에는 stems, MIDI, Handoff, checksum manifest를 포함한 전체 Delivery Bundle ZIP도 있습니다.
- 모든 WAV는 stereo 44.1 kHz signed PCM 24-bit이며 즉시 재렌더 SHA-256 일치, 비무음, limiter ceiling, digital-zero tail을 확인했습니다.
- 이 결과는 로컬 자동 기술 QA입니다. 사람의 청취 승인, LUFS/true-peak mastering, SoundCloud 변환 스트림 확인은 아직 필요합니다.

## 권장 청취 순서

${rows.map((row) => `${row.order}. ${row.styleName} — ${row.title}`).join("\n")}

## 렌더 요약

| # | Style | Title | BPM | Key | Duration | Peak | RMS | Full bundle |
|---:|---|---|---:|---|---:|---:|---:|---|
${table}

## SoundCloud private-first 절차

1. 각 폴더의 \`*-soundcloud-upload.md\`에서 대괄호 placeholder를 모두 교체합니다.
2. artist, rightsholder, credits, artwork, license, release date와 모든 음악·시각 요소의 권리를 확인합니다.
3. 첫 업로드는 Private, Downloads Off, monetization/distribution/Content ID Off로 둡니다.
4. 업로드 후 SoundCloud 변환 스트림을 헤드폰과 스피커에서 처음부터 끝까지 듣습니다.
5. intro, 가장 큰 구간, 저역, 전환, ending을 승인한 뒤에만 Public/Scheduled 여부를 결정합니다.

## 파일 무결성

- 검증 artifact: ${artifactCount}개
- 전체 SHA-256: \`checksums.sha256\`
- 기계 판독 manifest: \`manifest.json\`
- 네트워크 요청, 로그인, 업로드, 공개 상태 변경은 수행하지 않았습니다.
`;
}

// 이전 회전 결과 정리는 위에서 고정한 전용 outputRoot에만 적용되며 사용자 프로젝트에는 닿지 않는다.
await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const supportedStyleIds = new Set(workstation.styleProfiles.map((profile) => profile.id));
check(rotationStyleIds.length === workstation.styleProfiles.length, "rotation must include every supported style exactly once");
check(new Set(rotationStyleIds).size === rotationStyleIds.length, "rotation must not contain duplicate styles");
for (const styleId of supportedStyleIds) {
  check(rotationStyleIds.includes(styleId), `${styleId}: missing from genre rotation`);
}

const artifacts = [];
const rows = [];

for (const [index, styleId] of rotationStyleIds.entries()) {
  const profile = workstation.styleProfiles.find((candidate) => candidate.id === styleId);
  if (!profile) {
    check(false, `${styleId}: StyleProfile missing`);
    continue;
  }

  const project = buildProject(profile);
  const order = index + 1;
  const directoryName = `${String(order).padStart(2, "0")}-${styleId.replaceAll("_", "-")}-${workstation.projectFileStem(project)}`;
  const styleRoot = path.join(outputRoot, directoryName);
  await mkdir(styleRoot, { recursive: true });

  // 각 장르는 serialize/reopen을 거친 프로젝트에서 두 번 오프라인 렌더한다. UI 임시 상태나
  // 비결정적 합성 결과가 delivery 파일에 스며들면 해시 일치 검사에서 실패한다.
  const projectContents = workstation.serializeProjectFile(project);
  const reopenedProject = workstation.parseProjectFile(projectContents);
  const analysis = render.analyzeExport(reopenedProject);
  const stemAnalyses = render.analyzeStemExports(reopenedProject);
  const firstMix = Buffer.from(await render.createMixWavBlob(reopenedProject).arrayBuffer());
  const secondMix = Buffer.from(await render.createMixWavBlob(reopenedProject).arrayBuffer());
  const uploadSheet = soundcloud.createSoundCloudUploadSheet(reopenedProject);

  check(reopenedProject.styleId === styleId, `${styleId}: project roundtrip must preserve style`);
  check(workstation.arrangementTotalBars(reopenedProject) === 8, `${styleId}: delivery beat must remain eight bars`);
  check(analysis.status === "Ready", `${styleId}: full mix should be Ready, got ${analysis.status}`);
  check(analysis.peakDb <= analysis.ceilingDb + 0.05, `${styleId}: peak must stay below limiter ceiling`);
  check(firstMix.equals(secondMix), `${styleId}: immediate full-mix rerender must be byte-identical`);
  check(render.stemTrackIds.every((track) => stemAnalyses[track].status !== "Silent"), `${styleId}: every core stem must be audible`);
  check(uploadSheet.includes("Initial privacy: Private"), `${styleId}: upload sheet must use Private first`);
  check(uploadSheet.includes("Downloads: Off"), `${styleId}: upload sheet must disable downloads initially`);
  check(uploadSheet.includes("[ARTIST NAME"), `${styleId}: upload sheet must retain artist placeholder`);
  checkWav(firstMix, styleId);

  const projectPath = path.join(styleRoot, workstation.projectFileName(reopenedProject));
  const mixPath = path.join(styleRoot, render.mixWavFileName(reopenedProject));
  const uploadSheetPath = path.join(styleRoot, soundcloud.soundCloudUploadSheetFileName(reopenedProject));
  await writeArtifact(artifacts, projectPath, Buffer.from(projectContents, "utf8"));
  const mixArtifact = await writeArtifact(artifacts, mixPath, firstMix);
  await writeArtifact(artifacts, uploadSheetPath, Buffer.from(uploadSheet, "utf8"));

  let bundlePath = null;
  if (focusStyleIds.has(styleId)) {
    const bundle = await deliveryBundle.createDeliveryBundleZipBlob(reopenedProject, analysis, stemAnalyses);
    const bundleBytes = Buffer.from(await bundle.blob.arrayBuffer());
    check(bundle.manifest.artifactCount === 11, `${styleId}: focus bundle must contain 11 artifacts`);
    check(bundle.manifest.entries.some((entry) => entry.kind === "soundcloud-upload-sheet"), `${styleId}: focus bundle must include upload sheet`);
    const bundleArtifact = await writeArtifact(artifacts, path.join(styleRoot, bundle.fileName), bundleBytes);
    bundlePath = bundleArtifact.path;
  }

  rows.push({
    order,
    styleId,
    styleName: profile.name,
    title: reopenedProject.title,
    bpm: reopenedProject.bpm,
    key: reopenedProject.key,
    bars: workstation.arrangementTotalBars(reopenedProject),
    durationSeconds: analysis.durationSeconds,
    peakDb: analysis.peakDb,
    rmsDb: analysis.rmsDb,
    ceilingDb: analysis.ceilingDb,
    status: analysis.status,
    mixPath: mixArtifact.path,
    mixBytes: mixArtifact.bytes,
    mixSha256: mixArtifact.sha256,
    deterministic: true,
    focusBundle: focusStyleIds.has(styleId),
    bundlePath
  });
}

check(rows.length === workstation.styleProfiles.length, "genre rotation must render every supported style");
check(new Set(rows.map((row) => row.mixSha256)).size === rows.length, "every style mix should have distinct PCM identity");

const manifest = {
  app: "GrooveForge",
  version: packageJson.version,
  scope: "all-style local SoundCloud private-first genre rotation",
  styleCount: rows.length,
  focusStyles: [...focusStyleIds],
  wav: { format: 1, sampleRate: 44100, channels: 2, bitDepth: 24, blockAlign: 6, byteRate: 264600 },
  rows,
  artifactCount: artifacts.length,
  localFirst: true,
  samplingSecondary: true,
  privateValuesRecorded: false,
  realUserAudioRecorded: false,
  networkProbeAttempted: false,
  uploadAttempted: false,
  externalDistributionClaimed: false
};

const finalArtifactCount = artifacts.length + 3;
const readmeBytes = Buffer.from(buildReadme(rows, finalArtifactCount), "utf8");
await writeArtifact(artifacts, path.join(outputRoot, "00-README.md"), readmeBytes);
manifest.artifactCount = finalArtifactCount;
const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, "utf8");
await writeArtifact(artifacts, path.join(outputRoot, "manifest.json"), manifestBytes);
// checksum 파일 자신은 순환 참조를 피하려고 목록에서 제외하고, 그 직전까지 기록한 모든 전달 artifact를 포함한다.
const checksumContents = `${artifacts.map((artifact) => `${artifact.sha256}  ${artifact.path}`).join("\n")}\n`;
await writeFile(path.join(outputRoot, "checksums.sha256"), checksumContents, "utf8");

if (failures.length > 0) {
  console.error("GrooveForge genre rotation delivery failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("GrooveForge genre rotation delivery passed.");
console.log(`- Output: ${outputRoot}`);
console.log(`- Styles: ${rows.length}/${workstation.styleProfiles.length}`);
console.log(`- Focus delivery bundles: ${rows.filter((row) => row.focusBundle).length}/3`);
console.log(`- Verified artifacts: ${artifacts.length + 1}`);
for (const row of rows) {
  console.log(
    `- ${String(row.order).padStart(2, "0")} ${row.styleName}: ${row.title}, ${row.bpm} BPM ${row.key}, ${row.durationSeconds.toFixed(2)}s, peak ${row.peakDb.toFixed(2)} dB, RMS ${row.rmsDb.toFixed(2)} dB`
  );
}
