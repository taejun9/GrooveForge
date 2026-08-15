#!/usr/bin/env node

/**
 * Render a deterministic, non-human formant word layer over one canonical
 * GrooveForge PCM24 WAV.
 *
 * Usage:
 *   node harness/scripts/render_formant_word_overlay.mjs --spec /absolute/path/spec.json
 *
 * The strict v1 spec contains exactly:
 *   schemaVersion, instrumentalPath, outputMixPath, outputVocalPath,
 *   reportPath, word, bpm, targetPeakDbfs, ditherSeed, events.
 * Each event contains exactly: bar, beat, variant, gainDb, pitchHz.
 *
 * This renderer is intentionally local and mathematical. It does not read a
 * reference recording, invoke TTS, use a voice model, or make network calls.
 */

import { createHash } from "node:crypto";
import { lstat, open, readFile } from "node:fs/promises";
import path from "node:path";

const SAMPLE_RATE = 44_100;
const CHANNELS = 2;
const BIT_DEPTH = 24;
const BYTES_PER_SAMPLE = 3;
const BLOCK_ALIGN = CHANNELS * BYTES_PER_SAMPLE;
const WORD_BEATS = 1.5;
const TERMINAL_FADE_SECONDS = 0.08;
const MAX_INPUT_BYTES = 1_000_000_000;
const SUPPORTED_VARIANTS = new Set(["ghost", "narrow", "full", "lift", "outro"]);

function fail(message) {
  throw new Error(message);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function assertExactKeys(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object.`);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) fail(`${label} keys must be exactly: ${wanted.join(", ")}.`);
}

function finiteNumber(value, label, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    fail(`${label} must be a finite number from ${min} to ${max}.`);
  }
  return value;
}

function dbToGain(value) {
  return 10 ** (value / 20);
}

function gainToDb(value) {
  return value > 0 ? 20 * Math.log10(value) : Number.NEGATIVE_INFINITY;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(value) {
  const x = clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
}

function equalPowerFade(value) {
  return Math.sin(clamp(value, 0, 1) * Math.PI * 0.5);
}

function readInt24Le(bytes, offset) {
  const unsigned = bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
  return unsigned & 0x800000 ? unsigned - 0x1000000 : unsigned;
}

function writeInt24Le(bytes, offset, value) {
  const unsigned = value < 0 ? value + 0x1000000 : value;
  bytes[offset] = unsigned & 0xff;
  bytes[offset + 1] = (unsigned >>> 8) & 0xff;
  bytes[offset + 2] = (unsigned >>> 16) & 0xff;
}

function parseCanonicalPcm24(bytes, label) {
  if (bytes.length < 44) fail(`${label} must have a canonical 44-byte WAV header.`);
  const ascii = (offset, length) => bytes.subarray(offset, offset + length).toString("ascii");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (ascii(0, 4) !== "RIFF" || ascii(8, 4) !== "WAVE" || ascii(12, 4) !== "fmt " || ascii(36, 4) !== "data") {
    fail(`${label} must use canonical RIFF/WAVE/fmt/data ordering.`);
  }
  const audioFormat = view.getUint16(20, true);
  const channels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const byteRate = view.getUint32(28, true);
  const blockAlign = view.getUint16(32, true);
  const bitDepth = view.getUint16(34, true);
  const dataBytes = view.getUint32(40, true);
  if (view.getUint32(16, true) !== 16 || audioFormat !== 1 || channels !== CHANNELS || sampleRate !== SAMPLE_RATE ||
      byteRate !== SAMPLE_RATE * BLOCK_ALIGN || blockAlign !== BLOCK_ALIGN || bitDepth !== BIT_DEPTH ||
      view.getUint32(4, true) !== bytes.length - 8 || dataBytes !== bytes.length - 44 || dataBytes % BLOCK_ALIGN !== 0) {
    fail(`${label} must be stereo 44.1 kHz signed PCM 24-bit with a canonical header.`);
  }
  const frames = dataBytes / BLOCK_ALIGN;
  const left = new Float64Array(frames);
  const right = new Float64Array(frames);
  for (let frame = 0, offset = 44; frame < frames; frame += 1, offset += BLOCK_ALIGN) {
    const leftRaw = readInt24Le(bytes, offset);
    const rightRaw = readInt24Le(bytes, offset + BYTES_PER_SAMPLE);
    left[frame] = leftRaw / (leftRaw < 0 ? 8_388_608 : 8_388_607);
    right[frame] = rightRaw / (rightRaw < 0 ? 8_388_608 : 8_388_607);
  }
  return { frames, left, right };
}

function wavHeader(dataBytes) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + dataBytes, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(CHANNELS, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * BLOCK_ALIGN, 28);
  header.writeUInt16LE(BLOCK_ALIGN, 32);
  header.writeUInt16LE(BIT_DEPTH, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(dataBytes, 40);
  return header;
}

function xorshift32(seed) {
  let state = seed >>> 0;
  if (state === 0) state = 0x6d2b79f5;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  };
}

function encodePcm24(left, right, seed) {
  if (left.length !== right.length) fail("PCM channels must contain the same frame count.");
  const dataBytes = left.length * BLOCK_ALIGN;
  const output = Buffer.allocUnsafe(44 + dataBytes);
  wavHeader(dataBytes).copy(output, 0);
  const random = xorshift32(seed);
  for (let frame = 0, offset = 44; frame < left.length; frame += 1, offset += BLOCK_ALIGN) {
    for (let channel = 0; channel < CHANNELS; channel += 1) {
      const sample = channel === 0 ? left[frame] : right[frame];
      const tpdf = (random() - random()) / 8_388_608;
      const raw = clamp(Math.round((clamp(sample + tpdf, -0.9999997, 0.9999997)) * 8_388_607), -8_388_606, 8_388_606);
      writeInt24Le(output, offset + channel * BYTES_PER_SAMPLE, raw);
    }
  }
  if (left.length > 0) output.fill(0, output.length - BLOCK_ALIGN);
  return output;
}

function resonator(frequency, radius = 0.985) {
  const coefficient = 2 * radius * Math.cos(2 * Math.PI * frequency / SAMPLE_RATE);
  const radiusSquared = radius * radius;
  let previous1 = 0;
  let previous2 = 0;
  return (input) => {
    const output = (1 - radius) * input + coefficient * previous1 - radiusSquared * previous2;
    previous2 = previous1;
    previous1 = output;
    return output;
  };
}

function onePoleHighPass(cutoff) {
  const alpha = Math.exp(-2 * Math.PI * cutoff / SAMPLE_RATE);
  let low = 0;
  return (input) => {
    low = (1 - alpha) * input + alpha * low;
    return input - low;
  };
}

function onePoleLowPass(cutoff) {
  const alpha = Math.exp(-2 * Math.PI * cutoff / SAMPLE_RATE);
  let value = 0;
  return (input) => {
    value = (1 - alpha) * input + alpha * value;
    return value;
  };
}

function renderWord({ frames, pitchHz, seed, variant }) {
  const output = new Float64Array(frames);
  const random = xorshift32(seed);
  const noiseHighPass = onePoleHighPass(1_800);
  const outputHighPass = onePoleHighPass(100);
  const outputLowPass = onePoleLowPass(7_500);
  const vowelFilters = [resonator(390, 0.992), resonator(1_450, 0.982), resonator(2_500, 0.975), resonator(3_800, 0.968)];
  const nasalFilters = [resonator(250, 0.994), resonator(900, 0.986), resonator(2_200, 0.976)];
  const nasalNotch = resonator(750, 0.987);
  const burstFilters = [resonator(3_800, 0.97), resonator(6_200, 0.96)];
  const vowelWeights = [0.88, 0.62, 0.36, 0.16];
  const nasalWeights = [1, 0.34, 0.14];
  let oscillatorPhase = 0;
  let peak = 0;

  for (let frame = 0; frame < frames; frame += 1) {
    const beats = frame / Math.max(1, frames - 1) * WORD_BEATS;
    oscillatorPhase += pitchHz / SAMPLE_RATE;
    oscillatorPhase -= Math.floor(oscillatorPhase);
    const saw = 2 * oscillatorPhase - 1;
    const harmonic = 0.66 * Math.sin(2 * Math.PI * oscillatorPhase) + 0.23 * Math.sin(4 * Math.PI * oscillatorPhase) +
      0.11 * Math.sin(6 * Math.PI * oscillatorPhase);
    const carrier = 0.55 * saw + 0.45 * harmonic;
    const white = random() * 2 - 1;
    const brightNoise = noiseHighPass(white);

    let burst = 0;
    if (beats >= 0.06 && beats < 0.1) {
      const local = (beats - 0.06) / 0.04;
      const envelope = Math.sin(Math.PI * local) ** 2;
      burst = envelope * (0.8 * burstFilters[0](brightNoise) + 0.62 * burstFilters[1](brightNoise));
    } else {
      burstFilters[0](0);
      burstFilters[1](0);
    }

    const aspirationEnvelope = beats >= 0.1 && beats < 0.36
      ? equalPowerFade((beats - 0.1) / 0.08) * (1 - smoothstep((beats - 0.26) / 0.1))
      : 0;
    const aspiration = brightNoise * aspirationEnvelope * 0.34;

    const vowelAttack = equalPowerFade((beats - 0.24) / 0.16);
    const vowelRelease = 1 - smoothstep((beats - 0.96) / 0.22);
    const vowelEnvelope = beats >= 0.24 && beats <= 1.18 ? vowelAttack * vowelRelease : 0;
    let vowel = 0;
    for (let index = 0; index < vowelFilters.length; index += 1) {
      vowel += vowelFilters[index](carrier) * vowelWeights[index];
    }

    const nasalAttack = equalPowerFade((beats - 0.98) / 0.18);
    const nasalRelease = 1 - smoothstep((beats - 1.38) / 0.12);
    const nasalEnvelope = beats >= 0.98 ? nasalAttack * nasalRelease : 0;
    let nasal = 0;
    for (let index = 0; index < nasalFilters.length; index += 1) {
      nasal += nasalFilters[index](carrier) * nasalWeights[index];
    }
    nasal -= 0.28 * nasalNotch(carrier);

    const variantTone = variant === "ghost" ? 0.72 : variant === "narrow" ? 0.82 : variant === "lift" ? 1.06 : 1;
    let sample = burst * 1.25 + aspiration + vowel * vowelEnvelope * 2.8 * variantTone + nasal * nasalEnvelope * 2.35;
    sample = Math.tanh(sample * 1.25);
    sample = outputLowPass(outputHighPass(sample));
    output[frame] = sample;
    peak = Math.max(peak, Math.abs(sample));
  }
  if (peak > 0) {
    const level = variant === "ghost" ? 0.58 : variant === "narrow" ? 0.7 : 0.82;
    for (let frame = 0; frame < frames; frame += 1) output[frame] = output[frame] / peak * level;
  }
  return output;
}

function addSample(buffer, frame, value) {
  if (frame >= 0 && frame < buffer.length) buffer[frame] += value;
}

function addWordToStem(stemLeft, stemRight, word, startFrame, gain, bpm, variant) {
  const doublerLeft = Math.round(0.011 * SAMPLE_RATE);
  const doublerRight = Math.round(0.017 * SAMPLE_RATE);
  const roomTaps = [0.031, 0.043, 0.059, 0.073].map((seconds) => Math.round(seconds * SAMPLE_RATE));
  const preEchoFrames = Math.round(0.25 * 60 / bpm * SAMPLE_RATE);
  const delayA = Math.round(0.75 * 60 / bpm * SAMPLE_RATE);
  const delayB = Math.round(1.5 * 60 / bpm * SAMPLE_RATE);
  const width = variant === "narrow" ? 0.08 : variant === "ghost" ? 0.12 : 0.18;
  for (let index = 0; index < word.length; index += 1) {
    const dry = word[index] * gain;
    const frame = startFrame + index;
    addSample(stemLeft, frame, dry * 0.707);
    addSample(stemRight, frame, dry * 0.707);
    addSample(stemLeft, frame + doublerLeft, dry * width);
    addSample(stemRight, frame + doublerRight, dry * width);
    for (let tap = 0; tap < roomTaps.length; tap += 1) {
      const tapGain = dbToGain(-17 - tap * 2);
      addSample(tap % 2 === 0 ? stemLeft : stemRight, frame + roomTaps[tap], dry * tapGain);
    }
    addSample(stemLeft, frame + delayA, dry * dbToGain(-15));
    addSample(stemRight, frame + delayA, dry * dbToGain(-15));
    addSample(stemLeft, frame + delayB, dry * dbToGain(-21));
    addSample(stemRight, frame + delayB, dry * dbToGain(-21));
    const reverseIndex = word.length - 1 - index;
    const preFrame = startFrame - preEchoFrames + index;
    const pre = word[reverseIndex] * gain * dbToGain(-18);
    addSample(stemLeft, preFrame, pre * 0.76);
    addSample(stemRight, preFrame, pre * 0.52);
  }
}

function applyDcBlock(samples, cutoff = 15) {
  const pole = Math.exp(-2 * Math.PI * cutoff / SAMPLE_RATE);
  let previousInput = 0;
  let previousOutput = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const input = samples[index];
    const output = input - previousInput + pole * previousOutput;
    samples[index] = output;
    previousInput = input;
    previousOutput = output;
  }
}

function applyTerminalFade(left, right) {
  const fadeFrames = Math.min(left.length, Math.round(TERMINAL_FADE_SECONDS * SAMPLE_RATE));
  for (let offset = 0; offset < fadeFrames; offset += 1) {
    const frame = left.length - fadeFrames + offset;
    const gain = Math.cos((offset / Math.max(1, fadeFrames - 1)) * Math.PI * 0.5) ** 2;
    left[frame] *= gain;
    right[frame] *= gain;
  }
  if (left.length > 0) {
    left[left.length - 1] = 0;
    right[right.length - 1] = 0;
  }
}

function goertzelPower(samples, frequency, start = 0, end = samples.length) {
  const coefficient = 2 * Math.cos(2 * Math.PI * frequency / SAMPLE_RATE);
  let previous1 = 0;
  let previous2 = 0;
  for (let index = Math.max(0, start); index < Math.min(samples.length, end); index += 1) {
    const current = samples[index] + coefficient * previous1 - previous2;
    previous2 = previous1;
    previous1 = current;
  }
  return previous1 * previous1 + previous2 * previous2 - coefficient * previous1 * previous2;
}

function analyzePcm24(bytes) {
  const dataBytes = bytes.readUInt32LE(40);
  const frames = dataBytes / BLOCK_ALIGN;
  let peak = 0;
  let squareSum = 0;
  let sum = 0;
  let fullScaleSamples = 0;
  let nonZeroSamples = 0;
  let lowerByteSamples = 0;
  let maxAdjacentDelta = 0;
  let previousLeft = 0;
  let previousRight = 0;
  let midSquare = 0;
  let sideSquare = 0;
  for (let frame = 0, offset = 44; frame < frames; frame += 1, offset += BLOCK_ALIGN) {
    const leftRaw = readInt24Le(bytes, offset);
    const rightRaw = readInt24Le(bytes, offset + 3);
    const left = leftRaw / (leftRaw < 0 ? 8_388_608 : 8_388_607);
    const right = rightRaw / (rightRaw < 0 ? 8_388_608 : 8_388_607);
    peak = Math.max(peak, Math.abs(left), Math.abs(right));
    squareSum += left * left + right * right;
    sum += left + right;
    maxAdjacentDelta = Math.max(maxAdjacentDelta, Math.abs(left - previousLeft), Math.abs(right - previousRight));
    previousLeft = left;
    previousRight = right;
    const mid = (left + right) * 0.5;
    const side = (left - right) * 0.5;
    midSquare += mid * mid;
    sideSquare += side * side;
    for (const [raw, sampleOffset] of [[leftRaw, offset], [rightRaw, offset + 3]]) {
      if (raw === -8_388_608 || raw === 8_388_607) fullScaleSamples += 1;
      if (raw !== 0) {
        nonZeroSamples += 1;
        if (bytes[sampleOffset] !== 0) lowerByteSamples += 1;
      }
    }
  }
  const sampleCount = frames * CHANNELS;
  const lastOffset = frames > 0 ? 44 + (frames - 1) * BLOCK_ALIGN : 44;
  return {
    audioFormat: bytes.readUInt16LE(20),
    channels: bytes.readUInt16LE(22),
    sampleRate: bytes.readUInt32LE(24),
    bitDepth: bytes.readUInt16LE(34),
    frames,
    durationSeconds: frames / SAMPLE_RATE,
    peakDbfs: gainToDb(peak),
    rmsDbfs: gainToDb(Math.sqrt(squareSum / Math.max(1, sampleCount))),
    dc: sum / Math.max(1, sampleCount),
    fullScaleSamples,
    lowerByteActivePercent: nonZeroSamples > 0 ? lowerByteSamples / nonZeroSamples * 100 : 0,
    terminalFrame: frames > 0 ? [readInt24Le(bytes, lastOffset), readInt24Le(bytes, lastOffset + 3)] : [],
    maxAdjacentDelta,
    sideToMidDb: midSquare > 0 ? gainToDb(Math.sqrt(sideSquare / midSquare)) : Number.NEGATIVE_INFINITY
  };
}

async function assertRegularNonSymlink(filePath, label, maxBytes = MAX_INPUT_BYTES) {
  if (typeof filePath !== "string" || !path.isAbsolute(filePath)) fail(`${label} must be an absolute path.`);
  const stats = await lstat(filePath);
  if (stats.isSymbolicLink() || !stats.isFile() || stats.size < 44 || stats.size > maxBytes) {
    fail(`${label} must be a bounded regular non-symlink file.`);
  }
  return stats;
}

async function assertOutputPath(filePath, label) {
  if (typeof filePath !== "string" || !path.isAbsolute(filePath) || path.basename(filePath) === "") {
    fail(`${label} must be an absolute file path.`);
  }
  await assertRegularNonSymlink(path.dirname(filePath), `${label} parent`, Number.MAX_SAFE_INTEGER).catch(async () => {
    const parentStats = await lstat(path.dirname(filePath));
    if (parentStats.isSymbolicLink() || !parentStats.isDirectory()) fail(`${label} parent must be a regular non-symlink directory.`);
  });
  try {
    await lstat(filePath);
    fail(`${label} already exists; refusing to overwrite it.`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

function parseSpec(value) {
  assertExactKeys(value, [
    "schemaVersion", "instrumentalPath", "outputMixPath", "outputVocalPath", "reportPath", "word", "bpm",
    "targetPeakDbfs", "ditherSeed", "events"
  ], "Spec");
  if (value.schemaVersion !== 1) fail("Spec schemaVersion must be 1.");
  if (value.word !== "틈") fail("Spec word must be exactly 틈.");
  const bpm = finiteNumber(value.bpm, "Spec bpm", 40, 220);
  const targetPeakDbfs = finiteNumber(value.targetPeakDbfs, "Spec targetPeakDbfs", -6, -0.5);
  if (!Number.isInteger(value.ditherSeed) || value.ditherSeed < 1 || value.ditherSeed > 0xffff_ffff) {
    fail("Spec ditherSeed must be a non-zero uint32 integer.");
  }
  if (!Array.isArray(value.events) || value.events.length < 1 || value.events.length > 64) {
    fail("Spec events must contain 1-64 entries.");
  }
  const events = value.events.map((event, index) => {
    assertExactKeys(event, ["bar", "beat", "variant", "gainDb", "pitchHz"], `Spec events[${index}]`);
    if (!Number.isInteger(event.bar) || event.bar < 1 || event.bar > 64) fail(`Spec events[${index}].bar must be 1-64.`);
    if (!Number.isInteger(event.beat) || event.beat < 1 || event.beat > 4) fail(`Spec events[${index}].beat must be 1-4.`);
    if (!SUPPORTED_VARIANTS.has(event.variant)) fail(`Spec events[${index}].variant is unsupported.`);
    finiteNumber(event.gainDb, `Spec events[${index}].gainDb`, -30, -3);
    finiteNumber(event.pitchHz, `Spec events[${index}].pitchHz`, 100, 440);
    return { ...event };
  });
  const pathValues = [value.instrumentalPath, value.outputMixPath, value.outputVocalPath, value.reportPath];
  if (new Set(pathValues).size !== pathValues.length) fail("All input and output paths must be distinct.");
  return { ...value, bpm, targetPeakDbfs, events };
}

function eventStartFrame(event, bpm) {
  const beatsFromStart = (event.bar - 1) * 4 + (event.beat - 1);
  return Math.round(beatsFromStart * 60 / bpm * SAMPLE_RATE);
}

async function writeNew(filePath, bytes) {
  const handle = await open(filePath, "wx", 0o600);
  try {
    await handle.writeFile(bytes);
  } finally {
    await handle.close();
  }
}

async function main() {
  const specIndex = process.argv.indexOf("--spec");
  if (specIndex < 0 || specIndex + 1 >= process.argv.length || process.argv.length !== 4) {
    fail("Usage: node harness/scripts/render_formant_word_overlay.mjs --spec /absolute/path/spec.json");
  }
  const specPath = path.resolve(process.argv[specIndex + 1]);
  if (!path.isAbsolute(process.argv[specIndex + 1])) fail("--spec must be an absolute path.");
  await assertRegularNonSymlink(specPath, "Spec file", 1_000_000);
  const specBytes = await readFile(specPath);
  const spec = parseSpec(JSON.parse(specBytes.toString("utf8")));
  await assertRegularNonSymlink(spec.instrumentalPath, "Instrumental WAV");
  await Promise.all([
    assertOutputPath(spec.outputMixPath, "Output mix"),
    assertOutputPath(spec.outputVocalPath, "Output vocal"),
    assertOutputPath(spec.reportPath, "Output report")
  ]);

  const instrumentalBytes = await readFile(spec.instrumentalPath);
  const instrumentalSha256 = sha256(instrumentalBytes);
  const decoded = parseCanonicalPcm24(instrumentalBytes, "Instrumental WAV");
  const durationSeconds = decoded.frames / SAMPLE_RATE;
  if (durationSeconds < 110 || durationSeconds > 150) fail("Instrumental duration must be 110-150 seconds.");

  const vocalLeft = new Float64Array(decoded.frames);
  const vocalRight = new Float64Array(decoded.frames);
  const duck = new Float32Array(decoded.frames);
  duck.fill(1);
  const wordFrames = Math.round(WORD_BEATS * 60 / spec.bpm * SAMPLE_RATE);
  const renderedEvents = [];
  let firstWordForAnalysis = null;
  for (let index = 0; index < spec.events.length; index += 1) {
    const event = spec.events[index];
    const startFrame = eventStartFrame(event, spec.bpm);
    if (startFrame < 0 || startFrame + wordFrames > decoded.frames) fail(`Event ${index} exceeds the instrumental frame range.`);
    const word = renderWord({
      frames: wordFrames,
      pitchHz: event.pitchHz,
      seed: (spec.ditherSeed ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0,
      variant: event.variant
    });
    if (!firstWordForAnalysis && ["full", "lift"].includes(event.variant)) firstWordForAnalysis = word;
    addWordToStem(vocalLeft, vocalRight, word, startFrame, dbToGain(event.gainDb), spec.bpm, event.variant);
    const duckStart = Math.max(0, startFrame - Math.round(0.01 * SAMPLE_RATE));
    const duckEnd = Math.min(decoded.frames, startFrame + wordFrames + Math.round(0.12 * SAMPLE_RATE));
    const duckFloor = dbToGain(-1.2);
    const rampFrames = Math.round(0.02 * SAMPLE_RATE);
    for (let frame = duckStart; frame < duckEnd; frame += 1) {
      const attack = smoothstep((frame - duckStart) / Math.max(1, rampFrames));
      const release = smoothstep((duckEnd - frame) / Math.max(1, rampFrames));
      const amount = Math.min(attack, release);
      duck[frame] = Math.min(duck[frame], 1 - amount * (1 - duckFloor));
    }
    renderedEvents.push({
      ...event,
      startFrame,
      startSeconds: startFrame / SAMPLE_RATE,
      wordFrames,
      wordSeconds: wordFrames / SAMPLE_RATE
    });
  }

  for (let frame = 0; frame < decoded.frames; frame += 1) {
    decoded.left[frame] = decoded.left[frame] * duck[frame] + vocalLeft[frame];
    decoded.right[frame] = decoded.right[frame] * duck[frame] + vocalRight[frame];
  }
  applyDcBlock(decoded.left);
  applyDcBlock(decoded.right);
  applyDcBlock(vocalLeft);
  applyDcBlock(vocalRight);
  applyTerminalFade(decoded.left, decoded.right);
  applyTerminalFade(vocalLeft, vocalRight);

  let mixPeak = 0;
  for (let frame = 0; frame < decoded.frames; frame += 1) {
    mixPeak = Math.max(mixPeak, Math.abs(decoded.left[frame]), Math.abs(decoded.right[frame]));
  }
  if (mixPeak <= 0) fail("Rendered mix is silent.");
  const targetLinear = dbToGain(spec.targetPeakDbfs) - 1 / 8_388_608;
  const outputGain = targetLinear / mixPeak;
  for (let frame = 0; frame < decoded.frames; frame += 1) {
    decoded.left[frame] *= outputGain;
    decoded.right[frame] *= outputGain;
    vocalLeft[frame] *= outputGain;
    vocalRight[frame] *= outputGain;
  }
  if (decoded.frames > 0) {
    decoded.left[decoded.frames - 1] = 0;
    decoded.right[decoded.frames - 1] = 0;
    vocalLeft[decoded.frames - 1] = 0;
    vocalRight[decoded.frames - 1] = 0;
  }

  const mixBytes = encodePcm24(decoded.left, decoded.right, spec.ditherSeed);
  const vocalBytes = encodePcm24(vocalLeft, vocalRight, (spec.ditherSeed ^ 0xa5a5a5a5) >>> 0);
  const mixAnalysis = analyzePcm24(mixBytes);
  const vocalAnalysis = analyzePcm24(vocalBytes);
  const formantSource = firstWordForAnalysis ?? renderWord({ frames: wordFrames, pitchHz: 184.997, seed: spec.ditherSeed, variant: "full" });
  const vowelStart = Math.round(wordFrames * 0.3);
  const vowelEnd = Math.round(wordFrames * 0.68);
  const nasalStart = Math.round(wordFrames * 0.78);
  const formantChecks = {
    vowel390HzPower: goertzelPower(formantSource, 390, vowelStart, vowelEnd),
    vowel1450HzPower: goertzelPower(formantSource, 1450, vowelStart, vowelEnd),
    vowel2500HzPower: goertzelPower(formantSource, 2500, vowelStart, vowelEnd),
    nasal250HzPower: goertzelPower(formantSource, 250, nasalStart, wordFrames),
    nasal750HzPower: goertzelPower(formantSource, 750, nasalStart, wordFrames),
    burst5000HzPower: goertzelPower(formantSource, 5000, Math.round(wordFrames * 0.04), Math.round(wordFrames * 0.1))
  };

  const qaFailures = [];
  const check = (condition, message) => { if (!condition) qaFailures.push(message); };
  for (const [label, analysis] of [["mix", mixAnalysis], ["vocal", vocalAnalysis]]) {
    check(analysis.audioFormat === 1 && analysis.channels === CHANNELS && analysis.sampleRate === SAMPLE_RATE && analysis.bitDepth === BIT_DEPTH,
      `${label}: canonical stereo 44.1 kHz PCM24 contract failed`);
    check(analysis.frames === decoded.frames, `${label}: frame count changed`);
    check(analysis.durationSeconds >= 110 && analysis.durationSeconds <= 150, `${label}: duration is outside 110-150 seconds`);
    check(analysis.fullScaleSamples === 0, `${label}: full-scale PCM samples detected`);
    check(analysis.lowerByteActivePercent >= 50, `${label}: 24-bit lower-byte activity is below 50%`);
    check(Math.abs(analysis.dc) < 0.0001, `${label}: DC exceeds 0.0001`);
    check(analysis.terminalFrame[0] === 0 && analysis.terminalFrame[1] === 0, `${label}: final frame is not digital zero`);
  }
  check(mixAnalysis.peakDbfs <= spec.targetPeakDbfs + 0.001, "mix: peak exceeds target");
  check(vocalAnalysis.rmsDbfs > -80, "vocal: stem is unexpectedly silent");
  check(Object.values(formantChecks).every((value) => Number.isFinite(value) && value > 0), "formant: expected spectral bands are absent");

  const sourceFinalBytes = await readFile(spec.instrumentalPath);
  const sourceFinalSha256 = sha256(sourceFinalBytes);
  check(sourceFinalSha256 === instrumentalSha256 && sourceFinalBytes.equals(instrumentalBytes), "instrumental source changed during render");
  if (qaFailures.length > 0) fail(`Rendered QA failed: ${qaFailures.join("; ")}`);

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    word: spec.word,
    pronunciationTarget: "/tʰɯm/",
    bpm: spec.bpm,
    provenance: {
      synthesis: "deterministic local mathematical source-filter formant synthesis",
      humanVoiceRecording: false,
      voiceModel: false,
      ttsUsed: false,
      referenceAudioUsed: false,
      networkAttempted: false,
      semanticWords: ["틈"],
      humanListeningClaimed: false
    },
    spec: {
      path: path.basename(specPath),
      sha256: sha256(Buffer.from(canonicalJson(spec))),
      ditherSeed: spec.ditherSeed,
      targetPeakDbfs: spec.targetPeakDbfs,
      wordBeats: WORD_BEATS,
      wordFrames,
      formantsHz: { vowel: [390, 1450, 2500, 3800], nasal: [250, 900, 2200], nasalNotch: 750 }
    },
    instrumental: {
      path: path.basename(spec.instrumentalPath),
      bytes: instrumentalBytes.length,
      sha256: instrumentalSha256,
      finalSha256: sourceFinalSha256,
      sourceUnchanged: sourceFinalSha256 === instrumentalSha256 && sourceFinalBytes.equals(instrumentalBytes),
      frames: decoded.frames,
      durationSeconds
    },
    events: renderedEvents,
    processing: {
      instrumentalDuckDb: -1.2,
      vocalHighPassHz: 100,
      vocalLowPassHz: 7500,
      finalDcBlockHz: 15,
      terminalFadeMs: TERMINAL_FADE_SECONDS * 1000,
      normalizationGainDb: gainToDb(outputGain),
      deterministicTpdfDither: true
    },
    formantChecks,
    outputs: {
      mix: { path: path.basename(spec.outputMixPath), bytes: mixBytes.length, sha256: sha256(mixBytes), ...mixAnalysis },
      vocal: { path: path.basename(spec.outputVocalPath), bytes: vocalBytes.length, sha256: sha256(vocalBytes), ...vocalAnalysis }
    },
    qa: {
      ok: true,
      failures: [],
      automaticFormantChecksDoNotProveWordRecognition: true,
      humanListeningRequiredBeforePublication: true
    }
  };

  await writeNew(spec.outputMixPath, mixBytes);
  await writeNew(spec.outputVocalPath, vocalBytes);
  await writeNew(spec.reportPath, Buffer.from(`${JSON.stringify(report, null, 2)}\n`, "utf8"));
  console.log(JSON.stringify({
    ok: true,
    reportPath: spec.reportPath,
    mix: report.outputs.mix,
    vocal: report.outputs.vocal,
    sourceUnchanged: report.instrumental.sourceUnchanged
  }));
}

main().catch((error) => {
  console.error(`Formant word overlay failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
