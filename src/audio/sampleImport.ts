/**
 * 명시적으로 선택한 짧은 WAV만 읽고 길이·구조를 먼저 검증한 후 작은 모노 원샷으로 변환한다.
 * 브라우저 디코더에 압축 데이터를 넘기지 않아 압축 해제 폭증과 외부 파일 참조를 피한다.
 */
import { createDrumSample, drumSampleRate, maxDrumSampleFrames, maxSampleImportBytes } from "../domain/sampling";
import type { DrumSample } from "../domain/sampling";

function resampleMono(source: Float32Array, sourceRate: number, outputFrames: number): Float32Array {
  // 같은 rate는 필터를 통과시키지 않아 기존 22.05kHz 원본의 PCM 변환을 그대로 보존한다.
  if (sourceRate === drumSampleRate) return source.length === outputFrames ? source : source.subarray(0, outputFrames);
  const output = new Float32Array(outputFrames);
  const cutoff = 0.9 * Math.min(1, drumSampleRate / sourceRate);
  const radius = Math.ceil(32 / cutoff);
  const taps = radius * 2 + 2;
  let divisor = sourceRate, remainder = drumSampleRate;
  while (remainder !== 0) { const next = divisor % remainder; divisor = remainder; remainder = next; }
  const exactPhases = drumSampleRate / divisor;
  // 보통의 WAV rate는 정확한 유리수 위상을 재사용한다. 특이한 rate도 최대 약 5MiB 커널로 제한한다.
  const phaseCount = exactPhases <= 1024 ? exactPhases : 1024;
  const kernels: Array<Float64Array | undefined> = new Array(phaseCount);
  for (let index = 0; index < output.length; index += 1) {
    const numerator = index * sourceRate;
    let frame = Math.floor(numerator / drumSampleRate);
    let phase = Math.round((numerator % drumSampleRate) / drumSampleRate * phaseCount);
    if (phase === phaseCount) { frame += 1; phase = 0; }
    let kernel = kernels[phase];
    if (!kernel) {
      kernel = new Float64Array(taps);
      const fraction = phase / phaseCount;
      let sum = 0;
      for (let tap = 0; tap < taps; tap += 1) {
        const distance = tap - radius - fraction;
        if (Math.abs(distance) > radius) continue;
        const window = 0.42 + 0.5 * Math.cos(Math.PI * distance / radius) + 0.08 * Math.cos(2 * Math.PI * distance / radius);
        const argument = Math.PI * cutoff * distance;
        const value = cutoff * (Math.abs(argument) < 1e-12 ? 1 : Math.sin(argument) / argument) * window;
        kernel[tap] = value; sum += value;
      }
      // 위상별 DC gain을 1로 맞춰 음량이 흔들리지 않게 하며 경계 바깥 원본은 0으로 취급한다.
      for (let tap = 0; tap < taps; tap += 1) kernel[tap] /= sum;
      kernels[phase] = kernel;
    }
    const start = frame - radius;
    const firstTap = Math.max(0, -start);
    const lastTap = Math.min(taps, source.length - start);
    let value = 0;
    for (let tap = firstTap; tap < lastTap; tap += 1) value += source[start + tap] * kernel[tap];
    output[index] = value;
  }
  return output;
}

export function importWavSample(contents: ArrayBuffer, sourceName: string): DrumSample {
  if (contents.byteLength > maxSampleImportBytes) throw new Error("WAV must be 2 MB or smaller.");
  const view = new DataView(contents);
  const text = (offset: number, length: number): string => String.fromCharCode(...new Uint8Array(contents, offset, length));
  if (contents.byteLength < 44 || text(0, 4) !== "RIFF" || text(8, 4) !== "WAVE" || view.getUint32(4, true) + 8 !== contents.byteLength) throw new Error("Choose a valid uncompressed WAV file.");
  let format = 0, channels = 0, rate = 0, bits = 0, align = 0, dataOffset = -1, dataBytes = 0;
  for (let offset = 12; offset + 8 <= contents.byteLength;) {
    const id = text(offset, 4), size = view.getUint32(offset + 4, true), body = offset + 8;
    if (body + size > contents.byteLength) throw new Error("WAV chunk is truncated.");
    if (id === "fmt ") {
      if (size < 16) throw new Error("WAV format is truncated.");
      format = view.getUint16(body, true); channels = view.getUint16(body + 2, true); rate = view.getUint32(body + 4, true);
      align = view.getUint16(body + 12, true); bits = view.getUint16(body + 14, true);
    }
    if (id === "data" && dataOffset < 0) { dataOffset = body; dataBytes = size; }
    offset = body + size + size % 2;
  }
  if (![1, 3].includes(format) || ![1, 2].includes(channels) || rate < 8000 || rate > 192000 ||
    !(format === 1 ? [8, 16, 24, 32].includes(bits) : bits === 32) || align !== channels * bits / 8 || dataOffset < 0 || dataBytes % align !== 0) throw new Error("Use mono/stereo PCM WAV (8–32 bit) or 32-bit float WAV.");
  const sourceFrames = dataBytes / align;
  const outputFrames = Math.floor(sourceFrames / rate * drumSampleRate);
  if (outputFrames < drumSampleRate * 0.01 || sourceFrames / rate > 2 || outputFrames > maxDrumSampleFrames) throw new Error("WAV one-shots must be 0.01–2 seconds long.");
  // 다운샘플링이 건너뛸 위치까지 모든 입력 프레임을 읽어 NaN/Infinity를 빠짐없이 거절한다.
  const mono = new Float32Array(sourceFrames);
  for (let frame = 0; frame < sourceFrames; frame += 1) {
    let sum = 0;
    for (let channel = 0; channel < channels; channel += 1) {
      const offset = dataOffset + frame * align + channel * bits / 8;
      let value = 0;
      if (format === 3) value = view.getFloat32(offset, true);
      else if (bits === 8) value = (view.getUint8(offset) - 128) / 128;
      else if (bits === 16) value = view.getInt16(offset, true) / 32768;
      else if (bits === 24) { const raw = view.getUint8(offset) | view.getUint8(offset + 1) << 8 | view.getUint8(offset + 2) << 16; value = (raw >= 0x800000 ? raw - 0x1000000 : raw) / 8388608; }
      else value = view.getInt32(offset, true) / 2147483648;
      if (!Number.isFinite(value)) throw new Error("WAV contains non-finite audio samples.");
      sum += value / channels;
    }
    mono[frame] = sum;
  }
  return createDrumSample(resampleMono(mono, rate, outputFrames), sourceName);
}

export async function readWavSample(file: Pick<File, "size" | "name" | "arrayBuffer">): Promise<DrumSample> {
  if (file.size > maxSampleImportBytes) throw new Error("WAV must be 2 MB or smaller.");
  return importWavSample(await file.arrayBuffer(), file.name);
}
