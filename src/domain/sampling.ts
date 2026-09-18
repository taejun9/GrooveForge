/**
 * 선택적으로 가져온 원샷을 작은 PCM16 데이터로 보관하는 순수 도메인 계약이다.
 * 경로와 외부 참조 없이 프로젝트에 포함하며 파일·스냅샷·실시간·WAV가 같은 trim과 gain을 사용한다.
 */
import type { DrumLane } from "./workstation";

export const drumSampleRate = 22050;
export const maxDrumSampleFrames = drumSampleRate * 2;
export const maxSampleImportBytes = 2_000_000;
export const sampleLanes = ["kick", "clap", "hat", "perc"] as const;
export type DrumSample = {
  format: "pcm16-mono";
  sampleRate: 22050;
  frames: number;
  pcm: string;
  sourceName: string;
  trimStart: number;
  trimEnd: number;
  gainDb: number;
};
export type DrumSamples = Partial<Record<DrumLane, DrumSample>>;
const decodedSamples = new WeakMap<DrumSample, Float32Array>();

function finite(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value); }
function record(value: unknown): value is Record<string, unknown> { return !!value && typeof value === "object" && !Array.isArray(value); }
export function sampleSourceName(value: string): string {
  // 파일 선택기에서 받은 이름 외에 경로나 제어 문자는 저장하지 않는다.
  return Array.from(value.split(/[\\/]/).at(-1)?.replace(/[\u0000-\u001f\u007f]/g, " ").trim() || "One-shot.wav").slice(0, 80).join("");
}
export function isDrumSample(value: unknown): value is DrumSample {
  if (!record(value) || Object.keys(value).some((key) => !["format", "sampleRate", "frames", "pcm", "sourceName", "trimStart", "trimEnd", "gainDb"].includes(key)) || value.format !== "pcm16-mono" || value.sampleRate !== drumSampleRate ||
    !finite(value.frames) || !Number.isInteger(value.frames) || value.frames < Math.ceil(drumSampleRate * 0.01) || value.frames > maxDrumSampleFrames ||
    typeof value.pcm !== "string" || value.pcm.length !== Math.ceil(value.frames * 2 / 3) * 4 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(value.pcm) ||
    typeof value.sourceName !== "string" || value.sourceName.length > 320 ||
    !finite(value.trimStart) || !finite(value.trimEnd) || !finite(value.gainDb)) return false;
  const decodedLength = value.pcm.length / 4 * 3 - (value.pcm.endsWith("==") ? 2 : value.pcm.endsWith("=") ? 1 : 0);
  return decodedLength === value.frames * 2;
}
export function isDrumSamples(value: unknown): value is DrumSamples | undefined {
  if (value === undefined) return true;
  if (!record(value) || Object.keys(value).some((key) => !sampleLanes.includes(key as DrumLane))) return false;
  let frames = 0;
  for (const sample of Object.values(value)) {
    if (!isDrumSample(sample)) return false;
    frames += sample.frames;
  }
  return frames <= maxDrumSampleFrames;
}
export function normalizeDrumSample(sample: DrumSample): DrumSample {
  const duration = sample.frames / drumSampleRate;
  const minimumLength = Math.min(0.01, duration);
  const trimStart = Math.max(0, Math.min(duration - minimumLength, sample.trimStart));
  const trimEnd = Math.max(trimStart + minimumLength, Math.min(duration, sample.trimEnd));
  const gainDb = Math.max(-24, Math.min(6, sample.gainDb));
  const sourceName = sampleSourceName(sample.sourceName);
  if (trimStart === sample.trimStart && trimEnd === sample.trimEnd && gainDb === sample.gainDb && sourceName === sample.sourceName) return sample;
  return { format: "pcm16-mono", sampleRate: drumSampleRate, frames: sample.frames, pcm: sample.pcm, sourceName, trimStart, trimEnd, gainDb };
}
export function normalizeDrumSamples(value: DrumSamples | undefined): DrumSamples | undefined {
  if (!value || !isDrumSamples(value)) return undefined;
  return Object.fromEntries(sampleLanes.flatMap((lane) => value[lane] ? [[lane, normalizeDrumSample(value[lane])]] : []));
}
export function sampleForLane(project: { drumSamples?: DrumSamples }, lane: DrumLane): DrumSample | undefined {
  const sample = project.drumSamples?.[lane];
  return sample && isDrumSample(sample) ? normalizeDrumSample(sample) : undefined;
}
export function sampleBankFrames(samples: DrumSamples | undefined): number {
  return Object.values(samples ?? {}).reduce((sum, sample) => sum + sample.frames, 0);
}
export function replaceDrumSample(samples: DrumSamples | undefined, lane: DrumLane, sample?: DrumSample): DrumSamples | undefined {
  const result = { ...samples };
  if (sample) result[lane] = normalizeDrumSample(sample);
  else delete result[lane];
  if (!isDrumSamples(result)) throw new Error("One-shots can use at most 2 seconds in total. Remove a sample before importing another.");
  return Object.keys(result).length ? result : undefined;
}
export function createDrumSample(samples: Float32Array, sourceName: string): DrumSample {
  if (samples.length < Math.ceil(drumSampleRate * 0.01) || samples.length > maxDrumSampleFrames) throw new Error("Use a WAV one-shot between 0.01 and 2 seconds.");
  const bytes = new Uint8Array(samples.length * 2);
  const view = new DataView(bytes.buffer);
  for (let index = 0; index < samples.length; index += 1) {
    const value = samples[index];
    if (!Number.isFinite(value)) throw new Error("WAV contains non-finite audio samples.");
    view.setInt16(index * 2, Math.round(Math.max(-1, Math.min(1, value)) * 32767), true);
  }
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return { format: "pcm16-mono", sampleRate: drumSampleRate, frames: samples.length, pcm: btoa(binary), sourceName: sampleSourceName(sourceName), trimStart: 0, trimEnd: samples.length / drumSampleRate, gainDb: 0 };
}
export function decodedDrumSample(sample: DrumSample): Float32Array {
  const cached = decodedSamples.get(sample);
  if (cached) return cached;
  const binary = atob(sample.pcm);
  const data = new Float32Array(sample.frames);
  for (let index = 0; index < data.length; index += 1) {
    const raw = binary.charCodeAt(index * 2) | binary.charCodeAt(index * 2 + 1) << 8;
    data[index] = (raw >= 32768 ? raw - 65536 : raw) / 32768;
  }
  decodedSamples.set(sample, data);
  return data;
}
export function sampleFrameValue(sample: DrumSample, data: Float32Array, seconds: number): number {
  const duration = sample.trimEnd - sample.trimStart;
  if (seconds < 0 || seconds >= duration) return 0;
  const position = (sample.trimStart + seconds) * drumSampleRate;
  const index = Math.floor(position);
  const fraction = position - index;
  const value = (data[index] ?? 0) * (1 - fraction) + (data[index + 1] ?? data[index] ?? 0) * fraction;
  // 시작과 끝의 3ms 경사로 trim 경계 클릭을 줄이고 두 렌더 경로의 입력 파형을 일치시킨다.
  const fade = Math.min(1, seconds / 0.003, (duration - seconds) / 0.003);
  return value * fade * 10 ** (sample.gainDb / 20);
}
