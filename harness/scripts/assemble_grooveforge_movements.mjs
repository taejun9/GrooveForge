/**
 * 역할: 여러 GrooveForge 악장 WAV와 메타데이터를 순서대로 결합해 하나의 검증 가능한 장곡 산출물을 만든다.
 * 흐름: 명령행 사양을 읽고 입력 해시·PCM 형식을 확인한 뒤 구간을 조립하고 결과 매니페스트와 해시를 기록한다.
 * 안전 경계: 입력이나 형식이 기대와 다르면 산출을 중단하며, 지정된 로컬 출력 경로 밖의 파일이나 외부 서비스는 변경하지 않는다.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);

function option(name, fallback = "") {
  const index = args.indexOf(`--${name}`);
  if (index < 0) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`--${name} requires a value.`);
  }
  return value;
}

function requiredOption(name) {
  const value = option(name);
  if (!value) throw new Error(`Missing --${name}.`);
  return path.resolve(value);
}

function finiteNumber(name, fallback = "") {
  const raw = option(name, fallback);
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`--${name} must be finite.`);
  return value;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function parsePcm24Wave(bytes, label) {
  // 고정 44-byte header를 가정하지 않고 chunk를 순회하되, 최종 합성에는 canonical PCM24 형식과
  // 완전한 stereo frame만 허용한다.
  if (bytes.length < 44 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error(`${label} is not a RIFF/WAVE file.`);
  }
  let offset = 12;
  let format = null;
  let data = null;
  while (offset + 8 <= bytes.length) {
    const id = bytes.toString("ascii", offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    const start = offset + 8;
    const end = start + size;
    if (end > bytes.length) throw new Error(`${label} has a truncated ${id} chunk.`);
    if (id === "fmt ") {
      if (size < 16) throw new Error(`${label} has a short fmt chunk.`);
      format = {
        audioFormat: bytes.readUInt16LE(start),
        channels: bytes.readUInt16LE(start + 2),
        sampleRate: bytes.readUInt32LE(start + 4),
        byteRate: bytes.readUInt32LE(start + 8),
        blockAlign: bytes.readUInt16LE(start + 12),
        bitDepth: bytes.readUInt16LE(start + 14)
      };
    } else if (id === "data") {
      data = { start, size };
    }
    offset = end + (size % 2);
  }
  if (!format || !data) throw new Error(`${label} is missing fmt or data.`);
  if (
    format.audioFormat !== 1 ||
    format.channels !== 2 ||
    format.sampleRate !== 44_100 ||
    format.bitDepth !== 24 ||
    format.blockAlign !== 6 ||
    format.byteRate !== 264_600 ||
    data.size % format.blockAlign !== 0
  ) {
    throw new Error(`${label} must be stereo 44.1kHz signed PCM 24-bit: ${JSON.stringify({ ...format, dataBytes: data.size })}.`);
  }
  const samples = new Int32Array(data.size / 3);
  for (let index = 0, cursor = data.start; index < samples.length; index += 1, cursor += 3) {
    let sample = bytes[cursor] | (bytes[cursor + 1] << 8) | (bytes[cursor + 2] << 16);
    if (sample & 0x800000) sample |= 0xff000000;
    samples[index] = sample;
  }
  return {
    ...format,
    dataBytes: data.size,
    frames: data.size / format.blockAlign,
    samples,
    sha256: sha256(bytes)
  };
}

function createPcm24Header(frameCount, sampleRate = 44_100, channels = 2) {
  const blockAlign = channels * 3;
  const dataBytes = frameCount * blockAlign;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + dataBytes, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * blockAlign, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(24, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(dataBytes, 40);
  return header;
}

function xorshift32(seed) {
  let state = seed >>> 0 || 0x9e3779b9;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  };
}

function dbfs(amplitude) {
  return amplitude > 0 ? 20 * Math.log10(amplitude / 8_388_608) : null;
}

function rounded(value, digits = 6) {
  return Number(value.toFixed(digits));
}

const partAPath = requiredOption("part-a");
const partBPath = requiredOption("part-b");
const outputPath = requiredOption("output");
const reportPath = requiredOption("report");
const bpm = finiteNumber("bpm");
const barsA = finiteNumber("bars-a");
const barsB = finiteNumber("bars-b");
const targetPeakDbfs = finiteNumber("target-peak-dbfs", "-1.2");
const crossfadeMs = finiteNumber("crossfade-ms", "20");
const dcBlockHz = finiteNumber("dc-block-hz", "15");
const terminalFadeMs = finiteNumber("terminal-fade-ms", "80");
const ditherSeed = Math.trunc(finiteNumber("dither-seed", "1526"));

if (
  bpm <= 0 ||
  barsA <= 0 ||
  barsB <= 0 ||
  crossfadeMs < 0 ||
  crossfadeMs > 100 ||
  dcBlockHz < 0 ||
  dcBlockHz > 30 ||
  terminalFadeMs < 0 ||
  terminalFadeMs > 500
) {
  throw new Error("BPM/bars must be positive; crossfade, DC block, and terminal fade settings are out of bounds.");
}
if (targetPeakDbfs > -0.5 || targetPeakDbfs < -12) {
  throw new Error("Target peak must stay between -12 and -0.5 dBFS.");
}

const [partABytes, partBBytes] = await Promise.all([readFile(partAPath), readFile(partBPath)]);
const partA = parsePcm24Wave(partABytes, "Part A");
const partB = parsePcm24Wave(partBBytes, "Part B");
if (partA.sampleRate !== partB.sampleRate || partA.channels !== partB.channels) {
  throw new Error("Movement WAV formats do not match.");
}

const sampleRate = partA.sampleRate;
const channels = partA.channels;
const musicalFramesA = Math.round((barsA * 240 * sampleRate) / bpm);
const musicalFramesB = Math.round((barsB * 240 * sampleRate) / bpm);
const exportTailSeconds = Math.max(0.75, 90 / bpm);
const expectedFramesA = Math.ceil(((barsA * 240) / bpm + exportTailSeconds) * sampleRate);
const expectedFramesB = Math.ceil(((barsB * 240) / bpm + exportTailSeconds) * sampleRate);
const crossfadeFrames = Math.min(Math.round((crossfadeMs / 1000) * sampleRate), musicalFramesA, partB.frames);
if (Math.abs(partA.frames - expectedFramesA) > 1) {
  throw new Error(`Part A frame count does not match ${barsA} bars plus the GrooveForge export tail: ${partA.frames} vs ${expectedFramesA}.`);
}
if (Math.abs(partB.frames - expectedFramesB) > 1) {
  throw new Error(`Part B frame count does not match ${barsB} bars plus the GrooveForge export tail: ${partB.frames} vs ${expectedFramesB}.`);
}

const outputFrames = musicalFramesA - crossfadeFrames + partB.frames;
const terminalFadeFrames = Math.min(Math.round((terminalFadeMs / 1000) * sampleRate), outputFrames);
const dcBlockCoefficient = dcBlockHz === 0 ? 0 : Math.exp((-2 * Math.PI * dcBlockHz) / sampleRate);

function sourceSample(outputFrame, channel) {
  const crossfadeStart = musicalFramesA - crossfadeFrames;
  if (outputFrame < crossfadeStart) {
    return partA.samples[outputFrame * channels + channel];
  }
  if (outputFrame < musicalFramesA) {
    const crossfadeIndex = outputFrame - crossfadeStart;
    const t = crossfadeFrames <= 1 ? 1 : crossfadeIndex / (crossfadeFrames - 1);
    const a = partA.samples[outputFrame * channels + channel];
    const b = partB.samples[crossfadeIndex * channels + channel];
    return a * (1 - t) + b * t;
  }
  const partBFrame = outputFrame - musicalFramesA + crossfadeFrames;
  return partB.samples[partBFrame * channels + channel];
}

function terminalFadeGain(frame) {
  if (terminalFadeFrames <= 1 || frame < outputFrames - terminalFadeFrames) return 1;
  return (outputFrames - 1 - frame) / (terminalFadeFrames - 1);
}

function dcBlockedSample(input, channel, state) {
  if (dcBlockHz === 0) return input;
  const outputValue = input - state.priorInput[channel] + dcBlockCoefficient * state.priorOutput[channel];
  state.priorInput[channel] = input;
  state.priorOutput[channel] = outputValue;
  return outputValue;
}

function createDcBlockState() {
  return { priorInput: Array(channels).fill(0), priorOutput: Array(channels).fill(0) };
}

// DC block과 terminal fade를 동일한 상태 전이로 두 번 통과시킨다. 첫 pass는 안전 gain만 계산하고,
// 둘째 pass에서 결정론적 dither와 함께 PCM을 인코딩해 target peak를 넘지 않게 한다.
let preGainPeak = 0;
const peakPassState = createDcBlockState();
for (let frame = 0; frame < outputFrames; frame += 1) {
  for (let channel = 0; channel < channels; channel += 1) {
    const filtered = dcBlockedSample(sourceSample(frame, channel), channel, peakPassState) * terminalFadeGain(frame);
    preGainPeak = Math.max(preGainPeak, Math.abs(filtered));
  }
}
if (preGainPeak === 0) throw new Error("Combined movement signal is silent.");
const targetPeakAmplitude = 8_388_608 * 10 ** (targetPeakDbfs / 20);
const gain = targetPeakAmplitude / preGainPeak;
const gainDb = 20 * Math.log10(gain);

const output = Buffer.alloc(44 + outputFrames * channels * 3);
createPcm24Header(outputFrames, sampleRate, channels).copy(output, 0);
const random = xorshift32(ditherSeed);
const encodePassState = createDcBlockState();
const peakByChannel = Array(channels).fill(0);
const sumByChannel = Array(channels).fill(0);
const squareSumByChannel = Array(channels).fill(0);
let fullScaleSamples = 0;
let lowerByteActiveSamples = 0;
let terminalZeroFrames = 0;
let globalMaxAdjacentDelta = 0;
let seamMaxAdjacentDelta = 0;
const prior = Array(channels).fill(0);
let cursor = 44;
for (let frame = 0; frame < outputFrames; frame += 1) {
  for (let channel = 0; channel < channels; channel += 1) {
    const filtered = dcBlockedSample(sourceSample(frame, channel), channel, encodePassState) * terminalFadeGain(frame);
    const undithered = filtered * gain;
    const dither = undithered === 0 ? 0 : random() - random();
    let sample = Math.round(undithered + dither);
    sample = Math.max(-8_388_608, Math.min(8_388_607, sample));
    if (frame === outputFrames - 1) sample = 0;
    peakByChannel[channel] = Math.max(peakByChannel[channel], Math.abs(sample));
    sumByChannel[channel] += sample;
    squareSumByChannel[channel] += sample * sample;
    if (sample === -8_388_608 || sample === 8_388_607) fullScaleSamples += 1;
    if ((sample & 0xff) !== 0) lowerByteActiveSamples += 1;
    if (frame > 0) {
      const delta = Math.abs(sample - prior[channel]);
      globalMaxAdjacentDelta = Math.max(globalMaxAdjacentDelta, delta);
      if (Math.abs(frame - (musicalFramesA - crossfadeFrames)) <= crossfadeFrames * 2) {
        seamMaxAdjacentDelta = Math.max(seamMaxAdjacentDelta, delta);
      }
    }
    prior[channel] = sample;
    let encoded = sample < 0 ? sample + 0x1_000000 : sample;
    output[cursor] = encoded & 0xff;
    output[cursor + 1] = (encoded >>> 8) & 0xff;
    output[cursor + 2] = (encoded >>> 16) & 0xff;
    cursor += 3;
  }
}

for (let frame = outputFrames - 1; frame >= 0; frame -= 1) {
  let zero = true;
  for (let channel = 0; channel < channels; channel += 1) {
    const sampleOffset = 44 + (frame * channels + channel) * 3;
    if (output[sampleOffset] !== 0 || output[sampleOffset + 1] !== 0 || output[sampleOffset + 2] !== 0) {
      zero = false;
      break;
    }
  }
  if (!zero) break;
  terminalZeroFrames += 1;
}

// 이 저수준 조립기는 호출자가 준 경로를 writeFile로 갱신할 수 있다. 상위 작업은 반드시 plan-owned
// 새 출력 경로를 넘겨야 하며, 여기서는 네트워크나 입력 WAV 자체를 수정하지 않는다.
await mkdir(path.dirname(outputPath), { recursive: true });
await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(outputPath, output);

const metrics = {
  bitDepth: 24,
  channels,
  dcOffset: sumByChannel.map((sum) => rounded(sum / outputFrames / 8_388_608, 9)),
  durationSeconds: rounded(outputFrames / sampleRate),
  fullScaleSamples,
  globalMaxAdjacentDelta: rounded(globalMaxAdjacentDelta / 8_388_608, 9),
  lowerByteActivityPercent: rounded((lowerByteActiveSamples / (outputFrames * channels)) * 100, 3),
  peakDbfs: peakByChannel.map((peak) => rounded(dbfs(peak), 3)),
  rmsDbfs: squareSumByChannel.map((sum) => rounded(dbfs(Math.sqrt(sum / outputFrames)), 3)),
  sampleRate,
  seamMaxAdjacentDelta: rounded(seamMaxAdjacentDelta / 8_388_608, 9),
  terminalZeroFrames,
  totalFrames: outputFrames
};

const report = {
  app: "GrooveForge",
  assembly: {
    barsA,
    barsB,
    bpm,
    crossfadeFrames,
    crossfadeMs: rounded((crossfadeFrames / sampleRate) * 1000, 3),
    dcBlockHz,
    dither: "deterministic TPDF at signed PCM 24-bit quantization",
    ditherSeed,
    exportTailSeconds: rounded(exportTailSeconds),
    expectedFramesA,
    expectedFramesB,
    gainDb: rounded(gainDb, 3),
    musicalFramesA,
    musicalFramesB,
    targetPeakDbfs,
    terminalFadeFrames,
    terminalFadeMs: rounded((terminalFadeFrames / sampleRate) * 1000, 3)
  },
  generatedAt: new Date().toISOString(),
  metrics,
  output: {
    bytes: output.length,
    path: outputPath,
    sha256: sha256(output)
  },
  sources: {
    partA: { bytes: partABytes.length, frames: partA.frames, path: partAPath, sha256: partA.sha256 },
    partB: { bytes: partBBytes.length, frames: partB.frames, path: partBPath, sha256: partB.sha256 }
  },
  version: 1
};
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge movement assembly complete.");
console.log(`- Output: ${outputPath}`);
console.log(`- Duration: ${metrics.durationSeconds}s`);
console.log(`- Gain: ${report.assembly.gainDb}dB`);
console.log(`- Peak: ${metrics.peakDbfs.join(" / ")} dBFS`);
console.log(`- RMS: ${metrics.rmsDbfs.join(" / ")} dBFS`);
console.log(`- Full-scale samples: ${metrics.fullScaleSamples}`);
console.log(`- SHA-256: ${report.output.sha256}`);
