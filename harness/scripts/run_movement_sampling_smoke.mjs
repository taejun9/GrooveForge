#!/usr/bin/env node
/**
 * 악장 결합 CLI의 기존 무샘플 계약과 서로 다른 샘플 잔향 길이를 실제 WAV로 검증한다.
 * 앱 렌더러의 결정적 출력만 임시 폴더에 만들고 CLI를 실행하며 원본과 사용자 파일은 수정하지 않는다.
 */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDrumSample, drumSampleRate } from "../../src/domain/sampling.ts";
import { starterProject } from "../../src/domain/workstation.ts";
import { createMixWavBlob, exportTailDurationSeconds } from "../../src/audio/render.ts";

const directory = await mkdtemp(path.join(tmpdir(), "grooveforge-movement-sampling-"));
const script = fileURLToPath(new URL("./assemble_grooveforge_movements.mjs", import.meta.url));
const bpm = 110, bars = 1;
const base = { ...structuredClone(starterProject), bpm, arrangement: [{ section: "Verse", pattern: "A", energy: 0.8, bars, mutedTracks: [] }], snapshots: [] };
function sampled(duration) {
  const data = new Float32Array(Math.round(duration * drumSampleRate));
  for (let index = 0; index < data.length; index += 1) data[index] = Math.sin(index / drumSampleRate * Math.PI * 2 * 610) * Math.exp(-index / data.length * 4) * 0.35;
  return { ...base, drumSamples: { perc: createDrumSample(data, "Original movement.wav") } };
}
const files = {};
async function fixture(name, project) {
  const bytes = Buffer.from(await createMixWavBlob(project).arrayBuffer());
  const file = path.join(directory, `${name}.wav`);
  await writeFile(file, bytes); files[name] = { file, bytes, project };
}
function args(name, first, second, options = []) {
  return [script, "--part-a", files[first].file, "--part-b", files[second].file, "--output", path.join(directory, `${name}-mix.wav`), "--report", path.join(directory, `${name}-report.json`), "--bpm", String(bpm), "--bars-a", String(bars), "--bars-b", String(bars), ...options];
}
async function run(name, first, second, options = []) {
  execFileSync(process.execPath, args(name, first, second, options), { encoding: "utf8", stdio: "pipe" });
  return { bytes: await readFile(path.join(directory, `${name}-mix.wav`)), report: JSON.parse(await readFile(path.join(directory, `${name}-report.json`), "utf8")) };
}
try {
  await fixture("plain", base);
  await fixture("short", sampled(0.05));
  await fixture("sample-a", sampled(0.28));
  await fixture("sample-b", sampled(0.7));
  const baseline = await run("baseline", "plain", "plain");
  const zero = await run("zero", "plain", "plain", ["--sample-duration-a-seconds", "0", "--sample-duration-b-seconds", "0"]);
  assert.deepEqual(baseline.bytes, zero.bytes, "Existing default calls must retain byte-identical PCM");
  assert.deepEqual(baseline.report.assembly, zero.report.assembly);
  assert.equal(baseline.report.assembly.exportTailSeconds, Number(Math.max(0.75, 90 / bpm).toFixed(6)));
  const omitted = spawnSync(process.execPath, args("missing", "sample-a", "sample-b"), { encoding: "utf8" });
  assert.notEqual(omitted.status, 0); assert.match(omitted.stderr, /Part A frame count/);
  const options = ["--sample-duration-a-seconds", "0.28", "--sample-duration-b-seconds", "0.7"];
  const sampledMix = await run("sampled", "sample-a", "sample-b", options);
  const rerender = await run("rerender", "sample-a", "sample-b", options);
  assert.deepEqual(sampledMix.bytes, rerender.bytes);
  assert.equal(sampledMix.report.assembly.exportTailSecondsA, exportTailDurationSeconds(files["sample-a"].project));
  assert.equal(sampledMix.report.assembly.exportTailSecondsB, exportTailDurationSeconds(files["sample-b"].project));
  assert.equal(sampledMix.report.assembly.expectedFramesA, (files["sample-a"].bytes.length - 44) / 6);
  assert.equal(sampledMix.report.assembly.expectedFramesB, (files["sample-b"].bytes.length - 44) / 6);
  const combinedFrames = sampledMix.report.assembly.musicalFramesA - sampledMix.report.assembly.crossfadeFrames + sampledMix.report.assembly.expectedFramesB;
  assert.equal(sampledMix.report.metrics.totalFrames, combinedFrames);
  assert.equal((sampledMix.bytes.length - 44) / 6, combinedFrames);
  const shortDefault = await run("short-default", "short", "plain");
  const shortExplicit = await run("short-explicit", "short", "plain", ["--sample-duration-a-seconds", "0.05"]);
  assert.deepEqual(shortDefault.bytes, shortExplicit.bytes, "A shorter sample must preserve the tempo-owned export tail");
  const mixed = await run("mixed", "plain", "sample-b", ["--sample-duration-b-seconds", "0.7"]);
  assert.equal(mixed.report.assembly.expectedFramesA, (files.plain.bytes.length - 44) / 6);
  assert.equal(mixed.report.assembly.expectedFramesB, (files["sample-b"].bytes.length - 44) / 6);
  for (const value of ["-0.01", "2.01", "NaN"]) {
    const result = spawnSync(process.execPath, args("invalid", "plain", "plain", ["--sample-duration-a-seconds", value]), { encoding: "utf8" });
    assert.notEqual(result.status, 0); assert.match(result.stderr, /Sample durations|must be finite/);
  }
  console.log(JSON.stringify({ status: "passed", baselinePcmUnchanged: true, sampleTails: [sampledMix.report.assembly.exportTailSecondsA, sampledMix.report.assembly.exportTailSecondsB], actualFrames: [sampledMix.report.assembly.expectedFramesA, sampledMix.report.assembly.expectedFramesB], deterministic: true, mixedSampleAndPlain: true }, null, 2));
} finally { await rm(directory, { recursive: true, force: true }); }
