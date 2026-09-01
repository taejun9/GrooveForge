/**
 * 한 프로젝트의 편집 원본, 믹스·스템 WAV, MIDI, 검토 문서를 하나의 전달 ZIP으로 조립한다.
 * 모든 산출물은 메모리에서 생성하고 CRC-32가 포함된 무압축 ZIP으로 직렬화한 뒤에만 다운로드하며,
 * 외부 업로드·네트워크 검사·실사용자 음원 수집을 수행했다는 의미를 manifest에 부여하지 않는다.
 */
import {
  activeDeliveryTarget,
  arrangementTotalBars,
  normalizeProjectTitle,
  projectBpm,
  projectFileName,
  projectFileStem,
  projectKey,
  serializeProjectFile
} from "../domain/workstation";
import type { ProjectState } from "../domain/workstation";
import { downloadBlob } from "../platform/downloads";
import { createHandoffSheet, handoffSheetFileName } from "./handoff";
import { createMidiFile, midiFileName } from "./midi";
import {
  createMixWavBlob,
  createStemWavBlob,
  mixWavFileName,
  stemTrackIds,
  stemTrackLabel,
  stemWavFileNames
} from "./render";
import type { ExportAnalysis, StemExportAnalyses, StemTrackId } from "./render";
import { wavBitDepth, wavChannels, wavSampleRate } from "./render";
import { createSoundCloudUploadSheet, soundCloudUploadSheetFileName } from "./soundcloud";

export type DeliveryBundleEntryKind =
  | "project-json"
  | "mix-wav"
  | "stem-wav"
  | "arrangement-midi"
  | "handoff-sheet"
  | "soundcloud-upload-sheet"
  | "manifest-json"
  | "manifest-markdown";

export type DeliveryBundleManifestEntry = {
  path: string;
  label: string;
  kind: DeliveryBundleEntryKind;
  bytes: number;
  crc32: string;
};

export type DeliveryBundleManifest = {
  app: "GrooveForge";
  bundleVersion: 1;
  title: string;
  projectFileName: string;
  bundleFileName: string;
  deliveryTarget: string;
  bars: number;
  bpm: number;
  key: string;
  styleId: string;
  wavSampleRate: number;
  wavChannels: number;
  wavBitDepth: number;
  artifactCount: number;
  artifactBytes: number;
  entries: DeliveryBundleManifestEntry[];
  localFirst: true;
  samplingSecondary: true;
  privateValuesRecorded: false;
  realUserAudioRecorded: false;
  networkProbeAttempted: false;
  claimedExternalDistribution: false;
};

export type DeliveryBundleZipResult = {
  fileName: string;
  blob: Blob;
  manifest: DeliveryBundleManifest;
};

type BundleSourceEntry = {
  path: string;
  label: string;
  kind: DeliveryBundleEntryKind;
  bytes: Uint8Array;
};

const encoder = new TextEncoder();
// 표 생성은 한 번만 수행한다. 각 파일의 CRC 계산은 이 읽기 전용 테이블을 공유해 결과가 입력 바이트에만 의존한다.
const crcTable = createCrcTable();

export function deliveryBundleZipFileName(project: ProjectState): string {
  return `${projectFileStem(project)}-delivery-bundle.zip`;
}

function deliveryBundleRoot(project: ProjectState): string {
  return `${projectFileStem(project)}-delivery-bundle`;
}

function bytesFromText(contents: string): Uint8Array {
  return encoder.encode(contents);
}

async function bytesFromBlob(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

function bytesFromMidi(project: ProjectState): Uint8Array {
  const midi = createMidiFile(project);
  return new Uint8Array(midi);
}

function createCrcTable(): Uint32Array {
  // ZIP 명세가 사용하는 역방향 CRC-32 다항식(0xEDB88320)을 8비트 조회표로 전개한다.
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}

export function crc32(bytes: Uint8Array): number {
  // 시작/종료 XOR를 포함한 표준 ZIP CRC-32 계산이다. JavaScript 비트 연산의 부호를 >>> 0으로 제거한다.
  let value = 0xffffffff;
  for (const byte of bytes) {
    value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

export function formatCrc32(value: number): string {
  return value.toString(16).padStart(8, "0");
}

function writeUint16(target: Uint8Array, offset: number, value: number): void {
  // ZIP 헤더의 정수 필드는 little-endian이므로 낮은 바이트부터 기록한다.
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
}

function writeUint32(target: Uint8Array, offset: number, value: number): void {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
  target[offset + 2] = (value >>> 16) & 0xff;
  target[offset + 3] = (value >>> 24) & 0xff;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.byteLength;
  }
  return bytes;
}

function zipDosTime(): { time: number; date: number } {
  // 실행 시각을 넣지 않고 DOS 최소 날짜를 고정해 같은 프로젝트에서 재생성한 ZIP 바이트를 재현 가능하게 한다.
  return {
    time: 0,
    date: (1 << 5) | 1
  };
}

function createLocalHeader(nameBytes: Uint8Array, entryBytes: Uint8Array, entryCrc32: number): Uint8Array {
  // 압축 방식 0(Store)을 사용하므로 압축 크기와 원본 크기가 동일하다.
  // 브라우저 내 구현을 단순하게 유지하고 WAV처럼 이미 큰 데이터의 불필요한 CPU 사용을 피한다.
  const header = new Uint8Array(30 + nameBytes.byteLength);
  const { time, date } = zipDosTime();
  writeUint32(header, 0, 0x04034b50);
  writeUint16(header, 4, 20);
  writeUint16(header, 6, 0);
  writeUint16(header, 8, 0);
  writeUint16(header, 10, time);
  writeUint16(header, 12, date);
  writeUint32(header, 14, entryCrc32);
  writeUint32(header, 18, entryBytes.byteLength);
  writeUint32(header, 22, entryBytes.byteLength);
  writeUint16(header, 26, nameBytes.byteLength);
  writeUint16(header, 28, 0);
  header.set(nameBytes, 30);
  return header;
}

function createCentralHeader(
  nameBytes: Uint8Array,
  entryBytes: Uint8Array,
  entryCrc32: number,
  localHeaderOffset: number
): Uint8Array {
  // 중앙 디렉터리는 같은 파일 메타데이터와 로컬 헤더의 절대 오프셋을 다시 기록한다.
  // 오프셋은 앞선 로컬 헤더와 페이로드 길이만 누적해 계산한다.
  const header = new Uint8Array(46 + nameBytes.byteLength);
  const { time, date } = zipDosTime();
  writeUint32(header, 0, 0x02014b50);
  writeUint16(header, 4, 20);
  writeUint16(header, 6, 20);
  writeUint16(header, 8, 0);
  writeUint16(header, 10, 0);
  writeUint16(header, 12, time);
  writeUint16(header, 14, date);
  writeUint32(header, 16, entryCrc32);
  writeUint32(header, 20, entryBytes.byteLength);
  writeUint32(header, 24, entryBytes.byteLength);
  writeUint16(header, 28, nameBytes.byteLength);
  writeUint16(header, 30, 0);
  writeUint16(header, 32, 0);
  writeUint16(header, 34, 0);
  writeUint16(header, 36, 0);
  writeUint32(header, 38, 0);
  writeUint32(header, 42, localHeaderOffset);
  header.set(nameBytes, 46);
  return header;
}

function createEndOfCentralDirectory(entryCount: number, centralSize: number, centralOffset: number): Uint8Array {
  const header = new Uint8Array(22);
  writeUint32(header, 0, 0x06054b50);
  writeUint16(header, 4, 0);
  writeUint16(header, 6, 0);
  writeUint16(header, 8, entryCount);
  writeUint16(header, 10, entryCount);
  writeUint32(header, 12, centralSize);
  writeUint32(header, 16, centralOffset);
  writeUint16(header, 20, 0);
  return header;
}

export function createStoredZip(entries: BundleSourceEntry[]): Blob {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = bytesFromText(entry.path);
    const entryCrc32 = crc32(entry.bytes);
    const localHeader = createLocalHeader(nameBytes, entry.bytes, entryCrc32);
    localParts.push(localHeader, entry.bytes);
    centralParts.push(createCentralHeader(nameBytes, entry.bytes, entryCrc32, offset));
    offset += localHeader.byteLength + entry.bytes.byteLength;
  }

  const centralDirectory = concatBytes(centralParts);
  // ZIP 구조는 [각 로컬 헤더+데이터] → [중앙 디렉터리] → [종료 레코드] 순서를 지켜야 한다.
  const end = createEndOfCentralDirectory(entries.length, centralDirectory.byteLength, offset);
  const zipBytes = concatBytes([...localParts, centralDirectory, end]);
  const payload = new ArrayBuffer(zipBytes.byteLength);
  new Uint8Array(payload).set(zipBytes);
  return new Blob([payload], { type: "application/zip" });
}

async function createBaseBundleEntries(
  project: ProjectState,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): Promise<BundleSourceEntry[]> {
  const root = deliveryBundleRoot(project);
  const projectJson = serializeProjectFile(project);
  const handoffSheet = createHandoffSheet(project, analysis, stemAnalyses);
  const soundCloudUploadSheet = createSoundCloudUploadSheet(project);
  const mixBlob = createMixWavBlob(project);
  const stemFiles = stemWavFileNames(project);
  const stemEntries = await Promise.all(
    // 스템 Blob의 ArrayBuffer 변환은 독립적이므로 병렬화하되, map 순서로 파일 목록의 결정성을 유지한다.
    stemTrackIds.map(async (track: StemTrackId, index) => ({
      path: `${root}/stems/${stemFiles[index]}`,
      label: `${stemTrackLabel(track)} stem WAV`,
      kind: "stem-wav" as const,
      bytes: await bytesFromBlob(createStemWavBlob(project, track))
    }))
  );

  return [
    {
      path: `${root}/${projectFileName(project)}`,
      label: "Project file",
      kind: "project-json",
      bytes: bytesFromText(projectJson)
    },
    {
      path: `${root}/${mixWavFileName(project)}`,
      label: "Full mix WAV",
      kind: "mix-wav",
      bytes: await bytesFromBlob(mixBlob)
    },
    ...stemEntries,
    {
      path: `${root}/${midiFileName(project)}`,
      label: "Arrangement MIDI",
      kind: "arrangement-midi",
      bytes: bytesFromMidi(project)
    },
    {
      path: `${root}/${handoffSheetFileName(project)}`,
      label: "Handoff Sheet",
      kind: "handoff-sheet",
      bytes: bytesFromText(handoffSheet)
    },
    {
      path: `${root}/${soundCloudUploadSheetFileName(project)}`,
      label: "SoundCloud Upload Sheet",
      kind: "soundcloud-upload-sheet",
      bytes: bytesFromText(soundCloudUploadSheet)
    }
  ];
}

export function createDeliveryBundleManifest(
  project: ProjectState,
  bundleFileName: string,
  entries: BundleSourceEntry[]
): DeliveryBundleManifest {
  // manifest 자신을 제외한 기본 산출물의 크기와 체크섬을 먼저 고정한다.
  // `artifactCount + 2`는 뒤에서 추가되는 JSON/Markdown manifest 두 파일을 포함한 전체 개수다.
  const manifestEntries = entries.map((entry) => ({
    path: entry.path,
    label: entry.label,
    kind: entry.kind,
    bytes: entry.bytes.byteLength,
    crc32: formatCrc32(crc32(entry.bytes))
  }));

  return {
    app: "GrooveForge",
    bundleVersion: 1,
    title: normalizeProjectTitle(project.title),
    projectFileName: projectFileName(project),
    bundleFileName,
    deliveryTarget: activeDeliveryTarget(project).name,
    bars: arrangementTotalBars(project),
    bpm: projectBpm(project),
    key: projectKey(project),
    styleId: project.styleId,
    wavSampleRate,
    wavChannels,
    wavBitDepth,
    artifactCount: manifestEntries.length + 2,
    artifactBytes: manifestEntries.reduce((sum, entry) => sum + entry.bytes, 0),
    entries: manifestEntries,
    localFirst: true,
    samplingSecondary: true,
    // 아래 값은 이 로컬 생성 코드가 하지 않은 일을 명확히 표현하는 안전 경계다.
    // 권리·외부 배포 여부를 자동으로 추론하거나 성공했다고 주장해서는 안 된다.
    privateValuesRecorded: false,
    realUserAudioRecorded: false,
    networkProbeAttempted: false,
    claimedExternalDistribution: false
  };
}

export function createDeliveryBundleManifestMarkdown(manifest: DeliveryBundleManifest): string {
  const rows = manifest.entries
    .map((entry) => `| ${entry.label} | ${entry.kind} | ${entry.bytes} | ${entry.crc32} | ${entry.path} |`)
    .join("\n");

  return [
    "# GrooveForge Delivery Bundle Manifest",
    "",
    `Project: ${normalizeProjectTitle(manifest.title)}`,
    `Delivery target: ${manifest.deliveryTarget}`,
    `Bundle: ${manifest.bundleFileName}`,
    `Artifacts: ${manifest.artifactCount}`,
    `Audio/project bytes: ${manifest.artifactBytes}`,
    `WAV format: ${manifest.wavSampleRate / 1000} kHz / ${manifest.wavChannels === 2 ? "stereo" : `${manifest.wavChannels} channels`} / signed PCM ${manifest.wavBitDepth}-bit`,
    "",
    "| Label | Kind | Bytes | CRC-32 | Path |",
    "|---|---:|---:|---:|---|",
    rows,
    "",
    "Local-first: yes",
    "Sampling secondary: yes",
    "Private values recorded: no",
    "Real user audio recorded: no",
    "Network probe attempted: no",
    "External distribution claimed: no",
    ""
  ].join("\n");
}

export async function createDeliveryBundleZipBlob(
  project: ProjectState,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): Promise<DeliveryBundleZipResult> {
  const fileName = deliveryBundleZipFileName(project);
  const baseEntries = await createBaseBundleEntries(project, analysis, stemAnalyses);
  const manifest = createDeliveryBundleManifest(project, fileName, baseEntries);
  const root = deliveryBundleRoot(project);
  const manifestJson = JSON.stringify(manifest, null, 2);
  const manifestMarkdown = createDeliveryBundleManifestMarkdown(manifest);
  const entries: BundleSourceEntry[] = [
    ...baseEntries,
    {
      path: `${root}/manifest.json`,
      label: "Checksum manifest JSON",
      kind: "manifest-json",
      bytes: bytesFromText(`${manifestJson}\n`)
    },
    {
      path: `${root}/manifest.md`,
      label: "Checksum manifest Markdown",
      kind: "manifest-markdown",
      bytes: bytesFromText(manifestMarkdown)
    }
  ];

  return {
    fileName,
    blob: createStoredZip(entries),
    manifest
  };
}

export async function exportDeliveryBundleZip(
  project: ProjectState,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): Promise<DeliveryBundleZipResult> {
  // 모든 비동기 산출물과 manifest가 완성된 뒤 단 한 번 다운로드를 시작한다.
  // 생성 중간 실패 시 불완전한 ZIP을 사용자 저장소에 남기지 않는다.
  const result = await createDeliveryBundleZipBlob(project, analysis, stemAnalyses);
  downloadBlob(result.blob, result.fileName);
  return result;
}
