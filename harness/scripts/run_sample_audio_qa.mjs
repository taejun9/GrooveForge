#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const outputRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`, `${appName}-${packageJson.version}-${platformArch}-sample-audio-qa`);
const reportJsonPath = path.join(outputRoot, "sample-audio-qa-report.json");
const reportMarkdownPath = path.join(outputRoot, "sample-audio-qa-report.md");
const failures = [];

const workstation = await import("../../src/domain/workstation.ts");
const render = await import("../../src/audio/render.ts");

function check(condition, message) {
  if (!condition) failures.push(message);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function db(amplitude) {
  return amplitude > 0 ? 20 * Math.log10(amplitude) : Number.NEGATIVE_INFINITY;
}

function round(value, digits = 4) {
  return Number.isFinite(value) ? Number(value.toFixed(digits)) : value;
}

async function blobToBuffer(blob) {
  return Buffer.from(await blob.arrayBuffer());
}

function parseCanonicalPcmWav(bytes, label) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (start, length) => bytes.subarray(start, start + length).toString("ascii");

  check(bytes.byteLength >= 44, `${label}: WAV must have a 44-byte canonical header`);
  check(ascii(0, 4) === "RIFF", `${label}: missing RIFF marker`);
  check(view.getUint32(4, true) === bytes.byteLength - 8, `${label}: RIFF size does not match file length`);
  check(ascii(8, 4) === "WAVE", `${label}: missing WAVE marker`);
  check(ascii(12, 4) === "fmt ", `${label}: missing fmt chunk`);
  check(view.getUint32(16, true) === 16, `${label}: fmt chunk must be canonical PCM size 16`);

  const audioFormat = view.getUint16(20, true);
  const channels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const byteRate = view.getUint32(28, true);
  const blockAlign = view.getUint16(32, true);
  const bitsPerSample = view.getUint16(34, true);
  const dataSize = view.getUint32(40, true);

  check(audioFormat === 1, `${label}: audio format must be integer PCM (1)`);
  check(channels === 2, `${label}: channel count must be stereo (2)`);
  check(sampleRate === 44100, `${label}: sample rate must be 44100 Hz`);
  check(byteRate === 176400, `${label}: byte rate must be 176400`);
  check(blockAlign === 4, `${label}: block alignment must be 4 bytes`);
  check(bitsPerSample === 16, `${label}: samples must be 16-bit`);
  check(ascii(36, 4) === "data", `${label}: missing data chunk`);
  check(dataSize === bytes.byteLength - 44, `${label}: data size does not match file length`);
  check(dataSize % blockAlign === 0, `${label}: data size must contain complete stereo frames`);

  let peak = 0;
  let squareSum = 0;
  let nonZeroSamples = 0;
  let fullScaleSamples = 0;
  const channelNonZeroSamples = Array.from({ length: channels }, () => 0);
  const sampleCount = Math.floor(dataSize / 2);
  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    const raw = view.getInt16(44 + sampleIndex * 2, true);
    const normalized = raw < 0 ? raw / 32768 : raw / 32767;
    const absolute = Math.abs(normalized);
    peak = Math.max(peak, absolute);
    squareSum += normalized * normalized;
    if (raw !== 0) {
      nonZeroSamples += 1;
      channelNonZeroSamples[sampleIndex % channels] += 1;
    }
    if (raw === -32768 || raw === 32767) fullScaleSamples += 1;
  }

  const frames = dataSize / blockAlign;
  const rms = sampleCount > 0 ? Math.sqrt(squareSum / sampleCount) : 0;
  return {
    audioFormat, channels, sampleRate, byteRate, blockAlign, bitsPerSample, dataSize, frames,
    durationSeconds: frames / sampleRate,
    peakDb: db(peak),
    rmsDb: db(rms),
    nonZeroSamples,
    nonZeroPercent: sampleCount > 0 ? (nonZeroSamples / sampleCount) * 100 : 0,
    channelNonZeroSamples,
    fullScaleSamples
  };
}

function validateDecodedAudio(decoded, analysis, label) {
  const durationTolerance = 1 / decoded.sampleRate + Number.EPSILON;
  check(Math.abs(decoded.durationSeconds - analysis.durationSeconds) <= durationTolerance, `${label}: decoded duration must match renderer analysis within one frame`);
  check(decoded.nonZeroSamples > 0, `${label}: decoded PCM must not be silent`);
  check(decoded.nonZeroPercent >= 0.01, `${label}: decoded PCM nonzero population is unexpectedly sparse`);
  check(decoded.channelNonZeroSamples.every((count) => count > 0), `${label}: both stereo channels must contain audio`);
  check(Number.isFinite(decoded.peakDb), `${label}: decoded peak must be finite`);
  check(Number.isFinite(decoded.rmsDb), `${label}: decoded RMS must be finite`);
  check(Math.abs(decoded.peakDb - analysis.peakDb) <= 0.02, `${label}: decoded peak disagrees with renderer analysis`);
  check(Math.abs(decoded.rmsDb - analysis.rmsDb) <= 0.02, `${label}: decoded RMS disagrees with renderer analysis`);
  check(decoded.peakDb <= analysis.ceilingDb + 0.02, `${label}: decoded peak exceeds the configured ceiling`);
  check(decoded.fullScaleSamples === 0, `${label}: decoded PCM contains digital full-scale samples`);
}

async function renderArtifact({ blobFactory, analysis, fileName, label, caseRoot }) {
  const firstBytes = await blobToBuffer(blobFactory());
  const secondBytes = await blobToBuffer(blobFactory());
  const deterministic = firstBytes.equals(secondBytes);
  check(deterministic, `${label}: immediate rerender must be byte-identical`);
  const decoded = parseCanonicalPcmWav(firstBytes, label);
  validateDecodedAudio(decoded, analysis, label);
  const filePath = path.join(caseRoot, fileName);
  await writeFile(filePath, firstBytes);
  return {
    label, path: relative(filePath), bytes: firstBytes.byteLength, sha256: sha256(firstBytes), deterministic,
    decoded: {
      ...decoded,
      durationSeconds: round(decoded.durationSeconds), peakDb: round(decoded.peakDb), rmsDb: round(decoded.rmsDb), nonZeroPercent: round(decoded.nonZeroPercent)
    },
    rendererAnalysis: {
      ...analysis,
      durationSeconds: round(analysis.durationSeconds), peakDb: round(analysis.peakDb), rmsDb: round(analysis.rmsDb),
      headroomDb: round(analysis.headroomDb), ceilingDb: round(analysis.ceilingDb), limitedPercent: round(analysis.limitedPercent)
    }
  };
}

function buildCases() {
  return [
    {
      id: "beginner-guided-lofi", audience: "first-time composer",
      expected: { mode: "guided", styleId: "lofi", bpm: 86, bars: 8 },
      project: { ...workstation.createAudienceStarterProject("beginner"), title: "GrooveForge Beginner Sample Beat", snapshots: [] }
    },
    {
      id: "professional-studio-house", audience: "professional producer",
      expected: { mode: "studio", styleId: "house", bpm: 124, bars: 26 },
      project: { ...workstation.createAudienceStarterProject("producer"), title: "GrooveForge Professional Sample Beat", snapshots: [] }
    }
  ];
}

async function runCase(smokeCase) {
  const { project, expected } = smokeCase;
  const caseRoot = path.join(outputRoot, smokeCase.id);
  await mkdir(caseRoot, { recursive: true });
  check(project.mode === expected.mode, `${smokeCase.id}: expected ${expected.mode} mode`);
  check(project.styleId === expected.styleId, `${smokeCase.id}: expected ${expected.styleId} style`);
  check(project.bpm === expected.bpm, `${smokeCase.id}: expected ${expected.bpm} BPM`);
  const bars = workstation.arrangementTotalBars(project);
  check(bars === expected.bars, `${smokeCase.id}: expected ${expected.bars} arrangement bars`);

  const mixAnalysis = render.analyzeExport(project);
  const stemAnalyses = render.analyzeStemExports(project);
  const artifacts = [await renderArtifact({
    blobFactory: () => render.createMixWavBlob(project), analysis: mixAnalysis,
    fileName: render.mixWavFileName(project), label: `${smokeCase.id} full mix`, caseRoot
  })];
  const stemFileNames = render.stemWavFileNames(project);
  for (const [index, track] of render.stemTrackIds.entries()) {
    artifacts.push(await renderArtifact({
      blobFactory: () => render.createStemWavBlob(project, track), analysis: stemAnalyses[track],
      fileName: stemFileNames[index], label: `${smokeCase.id} ${track} stem`, caseRoot
    }));
  }

  check(new Set(artifacts.map((artifact) => artifact.sha256)).size === artifacts.length, `${smokeCase.id}: mix and stem files must all contain distinct PCM`);
  check(new Set(artifacts.slice(1).map((artifact) => artifact.sha256)).size === render.stemTrackIds.length, `${smokeCase.id}: all four stems must contain distinct PCM`);
  return {
    id: smokeCase.id, audience: smokeCase.audience,
    project: { title: project.title, mode: project.mode, styleId: project.styleId, bpm: project.bpm, key: project.key, bars },
    artifacts
  };
}

function markdownReport(report) {
  const rows = report.cases.flatMap((smokeCase) => smokeCase.artifacts.map((artifact) =>
    `| ${smokeCase.id} | ${artifact.label} | \`${artifact.path}\` | ${artifact.decoded.durationSeconds.toFixed(2)} s | ${artifact.decoded.peakDb.toFixed(2)} dB | ${artifact.decoded.rmsDb.toFixed(2)} dB | ${artifact.decoded.nonZeroPercent.toFixed(2)}% | ${artifact.deterministic ? "yes" : "no"} |`
  ));
  return `# GrooveForge Sample Audio QA\n\nStatus: **${report.status}**\n\n` +
    `Generated from built-in editable musical events only. No imported audio, private project data, network service, or external release claim is used.\n\n` +
    `| Case | Artifact | Local path | Duration | Peak | RMS | Nonzero PCM | Repeat render |\n|---|---|---|---:|---:|---:|---:|---|\n${rows.join("\n")}\n\n` +
    `Checks: canonical stereo PCM WAV, 44.1kHz, 16-bit, complete frames, audible decoded PCM, analysis agreement, ceiling safety, no digital full-scale samples, unique stems, and byte-identical immediate rerender.\n`;
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
const cases = [];
for (const smokeCase of buildCases()) cases.push(await runCase(smokeCase));

const report = {
  schemaVersion: 1,
  status: failures.length === 0 ? "passed" : "failed",
  app: { name: appName, version: packageJson.version, platformArch },
  boundaries: {
    directCompositionOnly: true, importedAudioUsed: false, privateProjectDataUsed: false,
    networkUsed: false, externalReleaseClaimed: false, humanListeningReplaced: false
  },
  cases,
  failures
};
await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(reportMarkdownPath, markdownReport(report));

if (failures.length > 0) {
  console.error("GrooveForge sample audio QA failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error(`Report: ${relative(reportMarkdownPath)}`);
  process.exit(1);
}

console.log("GrooveForge sample audio QA passed.");
console.log(`Cases: ${cases.length}; playable WAV files: ${cases.reduce((total, smokeCase) => total + smokeCase.artifacts.length, 0)}`);
for (const smokeCase of cases) {
  const mix = smokeCase.artifacts[0];
  console.log(`${smokeCase.id}: ${mix.path} (${mix.decoded.durationSeconds.toFixed(2)}s, peak ${mix.decoded.peakDb.toFixed(2)} dB, RMS ${mix.decoded.rmsDb.toFixed(2)} dB)`);
}
console.log(`Report: ${relative(reportMarkdownPath)}`);
