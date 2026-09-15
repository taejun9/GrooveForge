#!/usr/bin/env node

/**
 * 역할: 실제 앱에서 검증한 요청형 힙합 7곡 중 건조한 랩 포켓 3곡을 새 로컬 전달 폴더로 선별한다.
 * 흐름: 원본 manifest·체크섬·WAV·프로젝트·시트를 먼저 검증하고, 중복 WAV 없이 정확한 3곡 manifest와 체크섬을 다시 만든다.
 * 안전 경계: plan 소유 build/desktop 원본만 읽고 새 plan-1535 산출물만 만들며 기존 파일 삭제·덮어쓰기·외부 업로드를 하지 않는다.
 */

import { createHash } from "node:crypto";
import { constants as fsConstants, createReadStream } from "node:fs";
import { copyFile, lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const desktopBuildRoot = path.join(repositoryRoot, "build", "desktop");
const expectedIds = ["hiphop", "boom_bap", "k_hiphop_rnb"];
const laneId = "dry-grit-rap-pocket";
const wavFolder = "00-SoundCloud-WAV";

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function inside(base, candidate) {
  const relative = path.relative(base, candidate);
  return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function relativeFileName(value) {
  check(typeof value === "string" && value.length > 0 && !value.includes("\\"), "Invalid artifact path.");
  const parts = value.split("/");
  check(parts.every((part) => part.length > 0 && part !== "." && part !== ".."), `Unsafe artifact path: ${value}`);
  check(!path.isAbsolute(value), `Absolute artifact path rejected: ${value}`);
  return value;
}

function targetFor(base, relative) {
  const candidate = path.join(base, relativeFileName(relative));
  check(inside(base, candidate), `Artifact escaped its folder: ${relative}`);
  return candidate;
}

async function lstatOrNull(candidate) {
  try {
    return await lstat(candidate);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function assertRegular(candidate, maximumBytes = Number.MAX_SAFE_INTEGER) {
  const stats = await lstatOrNull(candidate);
  check(stats?.isFile() && !stats.isSymbolicLink(), `Expected a regular file: ${candidate}`);
  check(stats.size <= maximumBytes, `File exceeds size limit: ${candidate}`);
  return stats;
}

async function assertNoSymlinkComponents(base, candidate) {
  check(path.resolve(candidate) === path.resolve(base) || inside(base, candidate), `Path escaped build root: ${candidate}`);
  let current = base;
  const rootStats = await lstatOrNull(current);
  check(!rootStats?.isSymbolicLink(), `Symlink build root rejected: ${current}`);
  for (const segment of path.relative(base, candidate).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    const stats = await lstatOrNull(current);
    if (!stats) break;
    check(!stats.isSymbolicLink(), `Symlink component rejected: ${current}`);
  }
}

async function sha256File(candidate) {
  return await new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(candidate);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function writeNew(candidate, contents) {
  await writeFile(candidate, contents, { flag: "wx", mode: 0o600 });
}

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    check(["--source-delivery", "--output-root"].includes(key), `Unknown argument: ${key ?? "(missing)"}`);
    check(values[key] === undefined && argv[index + 1] && !argv[index + 1].startsWith("--"), `Missing or duplicate value for ${key}.`);
    values[key] = argv[index + 1];
  }
  check(values["--source-delivery"] && values["--output-root"], "Both --source-delivery and --output-root are required.");
  check(path.isAbsolute(values["--source-delivery"]) && path.isAbsolute(values["--output-root"]), "Both paths must be absolute.");
  return {
    sourceDelivery: path.resolve(values["--source-delivery"]),
    outputRoot: path.resolve(values["--output-root"])
  };
}

function validateRoots({ sourceDelivery, outputRoot }) {
  const sourceRun = path.dirname(sourceDelivery);
  check(path.basename(sourceDelivery) === "delivery", "Source must point to the runner's delivery directory.");
  check(path.basename(sourceRun).startsWith("plan-1532-requested-hiphop-actual-app-qa-"), "Source run is not a plan-1532 actual-app run.");
  check(inside(desktopBuildRoot, sourceRun), "Source run must be below this worktree's build/desktop.");
  check(inside(desktopBuildRoot, outputRoot), "Output must be below this worktree's build/desktop.");
  check(path.basename(outputRoot).startsWith("plan-1535-hiphop-three-"), "Output name must begin with plan-1535-hiphop-three-.");
  check(!inside(sourceDelivery, outputRoot) && !inside(outputRoot, sourceDelivery) && sourceDelivery !== outputRoot, "Source and output paths overlap.");
}

function parseChecksums(contents) {
  const rows = new Map();
  for (const line of contents.trim().split("\n")) {
    const match = /^([a-f0-9]{64})  (.+)$/u.exec(line);
    check(Boolean(match), `Malformed source checksum row: ${line}`);
    const name = relativeFileName(match[2]);
    check(!rows.has(name), `Duplicate source checksum path: ${name}`);
    rows.set(name, match[1]);
  }
  return rows;
}

function trackPrefix(row) {
  return `${String(row.order).padStart(2, "0")}-${row.id}`;
}

function sourceArtifacts(row) {
  const prefix = trackPrefix(row);
  const expected = [
    [`${wavFolder}/${prefix}-soundcloud.wav`, row.soundCloudBatchWav],
    [`${prefix}/${prefix}-soundcloud.wav`, row.wav],
    [`${prefix}/${prefix}.grooveforge.json`, row.project],
    [`${prefix}/${prefix}-soundcloud-upload-ko.md`, row.soundCloudSheet],
    [`${prefix}/${prefix}-production-brief-ko.md`, row.productionBrief],
    [`${prefix}/${prefix}-qa.json`, row.qa],
    [`${prefix}/actual-app-evidence/actual-app-report-sanitized.json`, row.actualApp?.sanitizedReport],
    ...["arrange", "mix", "deliver"].map((zone) => [`${prefix}/actual-app-evidence/${zone}.png`, row.actualApp?.screenshots?.[zone]])
  ];
  for (const [name, descriptor] of expected) {
    check(descriptor?.path === name && /^[a-f0-9]{64}$/u.test(descriptor.sha256) && Number.isSafeInteger(descriptor.bytes) && descriptor.bytes > 0,
      `${prefix}: missing or invalid source artifact ${name}.`);
  }
  return expected;
}

function signed24(bytes, offset) {
  const unsigned = bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
  return unsigned & 0x800000 ? unsigned - 0x1000000 : unsigned;
}

function inspectWav(bytes, row) {
  check(bytes.byteLength >= 44, `${row.id}: short WAV.`);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const marker = (offset, length) => bytes.subarray(offset, offset + length).toString("ascii");
  check(marker(0, 4) === "RIFF" && marker(8, 4) === "WAVE" && marker(12, 4) === "fmt " && marker(36, 4) === "data", `${row.id}: WAV markers invalid.`);
  check(view.getUint32(4, true) + 8 === bytes.byteLength && view.getUint32(40, true) + 44 === bytes.byteLength, `${row.id}: WAV length fields invalid.`);
  check(view.getUint16(20, true) === 1 && view.getUint16(22, true) === 2 && view.getUint32(24, true) === 44100 &&
    view.getUint32(28, true) === 264600 && view.getUint16(32, true) === 6 && view.getUint16(34, true) === 24,
    `${row.id}: WAV is not stereo 44.1kHz signed PCM24.`);
  check((bytes.byteLength - 44) % 6 === 0, `${row.id}: incomplete WAV frame.`);
  const frames = (bytes.byteLength - 44) / 6;
  const duration = frames / 44100;
  check(duration >= 90 && duration <= 180 && frames === row.audio.frameCount && Math.abs(duration - row.audio.durationSeconds) < 0.00001,
    `${row.id}: WAV duration differs from actual-app QA.`);
  let nonZeroLeft = 0;
  let nonZeroRight = 0;
  let lowerByteActive = 0;
  let peak = 0;
  let sumSquares = 0;
  for (let offset = 44; offset < bytes.byteLength; offset += 6) {
    const left = signed24(bytes, offset);
    const right = signed24(bytes, offset + 3);
    if (left !== 0) nonZeroLeft++;
    if (right !== 0) nonZeroRight++;
    if (bytes[offset] !== 0) lowerByteActive++;
    if (bytes[offset + 3] !== 0) lowerByteActive++;
    peak = Math.max(peak, Math.abs(left), Math.abs(right));
    sumSquares += left * left + right * right;
  }
  check(nonZeroLeft > 0 && nonZeroRight > 0 && lowerByteActive / (frames * 2) >= 0.5,
    `${row.id}: WAV signal or genuine PCM24 activity missing.`);
  check(bytes.subarray(bytes.byteLength - 6).every((value) => value === 0), `${row.id}: WAV terminal frame is not digital zero.`);
  const peakDb = 20 * Math.log10(peak / 0x800000);
  const rmsDb = 20 * Math.log10(Math.sqrt(sumSquares / (frames * 2)) / 0x800000);
  check(Math.abs(peakDb - row.audio.peakDb) < 0.1 && Math.abs(rmsDb - row.audio.rmsDb) < 0.1,
    `${row.id}: WAV level differs from actual-app QA.`);
  return { durationSeconds: duration, frameCount: frames, peakDb, rmsDb };
}

function inspectProjectAndSheet(projectBytes, sheetBytes, row) {
  const projectContents = projectBytes.toString("utf8");
  const wrapper = JSON.parse(projectContents);
  check(wrapper.app === "GrooveForge" && wrapper.fileVersion === 1 && wrapper.project?.title === row.title &&
    wrapper.project?.styleId === row.id && wrapper.project?.bpm === row.bpm,
    `${row.id}: saved project identity or reopen wrapper invalid.`);
  check(Array.isArray(wrapper.project?.arrangement) &&
    wrapper.project.arrangement.reduce((bars, block) => bars + block.bars, 0) === 44,
    `${row.id}: saved arrangement is not the verified 44-bar song.`);
  check(!/"(?:audioClips?|importedAudio|samplePath|sampleUrl|sampler)"/iu.test(projectContents), `${row.id}: imported-audio data found.`);
  const sheet = sheetBytes.toString("utf8");
  check(sheet.includes(row.title) && sheet.includes(`${trackPrefix(row)}-soundcloud.wav`) &&
    sheet.includes("Private") && sheet.includes("Downloads: Off") &&
    sheet.includes("[업로드 전 입력]") && sheet.includes("아트워크"), `${row.id}: Korean upload sheet is incomplete.`);
}

async function validateSource(sourceDelivery) {
  const manifestPath = targetFor(sourceDelivery, "manifest.json");
  const checksumPath = targetFor(sourceDelivery, "checksums.sha256");
  await assertNoSymlinkComponents(sourceDelivery, manifestPath);
  await assertNoSymlinkComponents(sourceDelivery, checksumPath);
  await assertRegular(manifestPath, 8 * 1024 * 1024);
  await assertRegular(checksumPath, 8 * 1024 * 1024);
  const manifestBytes = await readFile(manifestPath);
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  const checksums = parseChecksums(await readFile(checksumPath, "utf8"));
  check(checksums.get("manifest.json") === sha256Bytes(manifestBytes), "Source manifest checksum mismatch.");
  check(manifest.app === "GrooveForge" && manifest.plan === "plan-1532-requested-hiphop-actual-app-qa" &&
    manifest.schemaVersion === 3 && Array.isArray(manifest.rows) && manifest.rows.length === 7 &&
    manifest.soundCloudUploadPerformed === false && manifest.technicalContract?.soundCloudBatchFolder === wavFolder,
    "Source is not the completed seven-track actual-app delivery package.");
  const selected = manifest.rows.slice(0, 3);
  check(selected.every((row, index) => row.order === index + 1 && row.id === expectedIds[index] &&
    row.productionLaneId === laneId && row.checks?.actualApp === "passed" &&
    row.checks?.deterministicRerender === "passed" && row.checks?.pcm24Stereo44100 === "passed" &&
    row.checks?.soundCloudUploadPerformed === false && row.actualApp?.reopenedArrangementMatches === true),
    "The first three source rows are not the verified dry rap pocket cases.");
  check(new Set(selected.map((row) => row.wav.sha256)).size === 3, "Selected WAVs are not distinct.");
  const batchFolderPath = targetFor(sourceDelivery, wavFolder);
  await assertNoSymlinkComponents(sourceDelivery, batchFolderPath);
  check((await lstat(batchFolderPath)).isDirectory(), "Source upload-selection path is not a directory.");
  const batchEntries = await readdir(batchFolderPath, { withFileTypes: true });
  check(batchEntries.length === 7 && batchEntries.every((entry) => entry.isFile() && !entry.isSymbolicLink() && entry.name.endsWith("-soundcloud.wav")),
    "Source upload-selection folder is incomplete or unsafe.");
  for (const row of selected) {
    for (const [name, descriptor] of sourceArtifacts(row)) {
      const filePath = targetFor(sourceDelivery, name);
      await assertNoSymlinkComponents(sourceDelivery, filePath);
      const stats = await assertRegular(filePath, name.endsWith(".wav") ? 4_000_000_000 : 16 * 1024 * 1024);
      check(stats.size === descriptor.bytes && checksums.get(name) === descriptor.sha256 &&
        await sha256File(filePath) === descriptor.sha256, `${row.id}: source artifact checksum mismatch for ${name}.`);
    }
    check(row.wav.sha256 === row.soundCloudBatchWav.sha256 && row.wav.bytes === row.soundCloudBatchWav.bytes,
      `${row.id}: source upload WAV and case WAV differ.`);
    inspectWav(await readFile(targetFor(sourceDelivery, row.soundCloudBatchWav.path)), row);
    inspectProjectAndSheet(
      await readFile(targetFor(sourceDelivery, row.project.path)),
      await readFile(targetFor(sourceDelivery, row.soundCloudSheet.path)), row
    );
  }
  return { selected, sourceManifestSha256: sha256Bytes(manifestBytes) };
}

async function collectFiles(base) {
  const files = [];
  for (const entry of await readdir(base, { withFileTypes: true })) {
    const candidate = path.join(base, entry.name);
    check(!entry.isSymbolicLink(), `Output symlink rejected: ${candidate}`);
    if (entry.isDirectory()) files.push(...await collectFiles(candidate));
    else if (entry.isFile()) files.push(candidate);
    else throw new Error(`Output special file rejected: ${candidate}`);
  }
  return files;
}

async function curate({ sourceDelivery, outputRoot }, source) {
  check(!(await lstatOrNull(outputRoot)), `Output already exists: ${outputRoot}`);
  await mkdir(outputRoot, { recursive: false, mode: 0o700 });
  await mkdir(targetFor(outputRoot, wavFolder), { mode: 0o700 });
  const rows = [];
  for (const original of source.selected) {
    const prefix = trackPrefix(original);
    await mkdir(targetFor(outputRoot, prefix), { mode: 0o700 });
    await mkdir(targetFor(outputRoot, `${prefix}/actual-app-evidence`), { mode: 0o700 });
    // 원본 7곡의 case WAV 중복은 건너뛰고, 최상위 업로드 WAV를 유일한 오디오 사본으로 보존한다.
    const copiedArtifacts = sourceArtifacts(original)
      .filter(([name]) => name !== original.wav.path);
    for (const [name, descriptor] of copiedArtifacts) {
      const sourcePath = targetFor(sourceDelivery, name);
      const targetPath = targetFor(outputRoot, name);
      await copyFile(sourcePath, targetPath, fsConstants.COPYFILE_EXCL);
      check(await sha256File(targetPath) === descriptor.sha256, `Copied artifact changed: ${name}`);
    }
    const wavName = original.soundCloudBatchWav.path;
    const wavBytes = await readFile(targetFor(outputRoot, wavName));
    inspectWav(wavBytes, original);
    inspectProjectAndSheet(
      await readFile(targetFor(outputRoot, original.project.path)),
      await readFile(targetFor(outputRoot, original.soundCloudSheet.path)), original
    );
    const qa = JSON.parse((await readFile(targetFor(outputRoot, original.qa.path))).toString("utf8"));
    const sourceQaRow = { ...original };
    delete sourceQaRow.qa;
    check(isDeepStrictEqual(qa, sourceQaRow),
      `${original.id}: copied QA row disagrees with source manifest.`);
    qa.wav.path = wavName;
    qa.soundCloudBatchWav.path = wavName;
    await writeFile(targetFor(outputRoot, original.qa.path), `${JSON.stringify(qa, null, 2)}\n`, { mode: 0o600 });
    rows.push({ ...qa, qa: { path: original.qa.path, bytes: (await lstat(targetFor(outputRoot, original.qa.path))).size,
      sha256: await sha256File(targetFor(outputRoot, original.qa.path)) } });
  }
  const readme = `# GrooveForge 오리지널 건조한 랩 포켓 3곡\n\n` +
    `이 세 곡은 실제 production Electron 앱에서 편곡·Mix·Deliver WAV·Save·reopen을 통과한 원본 instrumental입니다. 특정 아티스트의 녹음이나 멜로디를 인용하지 않고 편집 가능한 음악 이벤트와 내장 합성으로 만들었습니다.\n\n` +
    `## SoundCloud 파일 선택\n\n\`${wavFolder}/\`에서 WAV 세 개를 한 번에 선택합니다. 각 곡의 프로젝트, 한글 업로드 시트, 프로덕션 브리프와 QA 증거는 번호가 같은 폴더에 있습니다.\n\n` +
    rows.map((row) => `- ${trackPrefix(row)} — ${row.title} — ${row.audio.durationSeconds.toFixed(3)}초 — ${row.styleName}`).join("\n") +
    `\n\n## 업로드 전 입력과 확인\n\n아티스트, 권리자, 실제 기여자/크레딧, 라이선스와 권리가 확인된 아트워크 placeholder를 사용자가 채워야 합니다. 전곡을 듣고 LUFS/true peak와 최종 메타데이터를 확인하세요. 첫 업로드는 Private, Downloads Off로 두며 업로드 후 변환 스트림도 다시 듣습니다. 이 패키지는 SoundCloud 로그인이나 업로드를 수행하지 않았습니다.\n\n` +
    `## 무결성\n\n이 폴더에서 \`shasum -a 256 -c checksums.sha256\`를 실행하면 실제 3곡 파일 목록만 검증합니다. \`manifest.json\`에는 각 곡의 실제 상대 경로와 원본 실제 앱 QA 정보가 있습니다.\n`;
  await writeNew(targetFor(outputRoot, "README-KO.md"), readme);
  const manifestPath = targetFor(outputRoot, "manifest.json");
  const manifest = {
    app: "GrooveForge",
    schemaVersion: 1,
    plan: "plan-1535-usability-hiphop-delivery",
    sourcePlan: "plan-1532-requested-hiphop-actual-app-qa",
    sourceManifestSha256: source.sourceManifestSha256,
    generatedAt: new Date().toISOString(),
    artifactCount: null,
    trackCount: 3,
    soundCloudUploadPerformed: false,
    soundCloudBatchFolder: wavFolder,
    rows
  };
  await writeNew(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const inventory = (await collectFiles(outputRoot)).filter((file) => path.basename(file) !== "checksums.sha256");
  const expectedInventory = new Set([
    "README-KO.md", "manifest.json",
    ...source.selected.flatMap((row) => sourceArtifacts(row).map(([name]) => name).filter((name) => name !== row.wav.path))
  ]);
  check(inventory.length === expectedInventory.size && inventory.every((file) =>
    expectedInventory.has(path.relative(outputRoot, file).split(path.sep).join("/"))),
    "Curated inventory contains a missing or unexpected artifact.");
  manifest.artifactCount = inventory.length + 1;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
  const checksumRows = [];
  for (const file of inventory.sort((a, b) => a.localeCompare(b, "en"))) {
    checksumRows.push(`${await sha256File(file)}  ${path.relative(outputRoot, file).split(path.sep).join("/")}`);
  }
  await writeNew(targetFor(outputRoot, "checksums.sha256"), `${checksumRows.join("\n")}\n`);
  const after = await collectFiles(outputRoot);
  check(after.length === manifest.artifactCount &&
    (await readdir(targetFor(outputRoot, wavFolder))).length === 3 &&
    after.every((file) => expectedInventory.has(path.relative(outputRoot, file).split(path.sep).join("/")) ||
      path.basename(file) === "checksums.sha256"),
    "Curated 3-track inventory count mismatch.");
  const generatedChecksums = parseChecksums(await readFile(targetFor(outputRoot, "checksums.sha256"), "utf8"));
  check(generatedChecksums.size === after.length - 1, "Curated checksum set is incomplete.");
  for (const file of after) {
    if (path.basename(file) === "checksums.sha256") continue;
    const relative = path.relative(outputRoot, file).split(path.sep).join("/");
    check(generatedChecksums.get(relative) === await sha256File(file), `Curated checksum mismatch: ${relative}`);
  }
  console.log(`검증: 3곡 SoundCloud 준비 패키지 ${outputRoot}`);
  console.log(`- WAV: ${wavFolder}/ (${rows.length}곡)`);
  console.log(`- Files/checksums: ${after.length}/${generatedChecksums.size}`);
  console.log("- Downloads copy and SoundCloud upload: not performed");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  validateRoots(args);
  await assertNoSymlinkComponents(desktopBuildRoot, args.sourceDelivery);
  await assertNoSymlinkComponents(desktopBuildRoot, args.outputRoot);
  check(!(await lstatOrNull(args.outputRoot)), `Output already exists: ${args.outputRoot}`);
  const source = await validateSource(args.sourceDelivery);
  await curate(args, source);
}

await main().catch((error) => {
  console.error(`GrooveForge 3-track curation failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
