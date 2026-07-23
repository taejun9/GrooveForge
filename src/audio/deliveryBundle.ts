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
  return {
    time: 0,
    date: (1 << 5) | 1
  };
}

function createLocalHeader(nameBytes: Uint8Array, entryBytes: Uint8Array, entryCrc32: number): Uint8Array {
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
  const result = await createDeliveryBundleZipBlob(project, analysis, stemAnalyses);
  downloadBlob(result.blob, result.fileName);
  return result;
}
