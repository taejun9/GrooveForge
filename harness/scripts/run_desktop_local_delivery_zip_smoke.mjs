#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const deliveryName = `${appName}-${packageJson.version}-${platformArch}-local-delivery-package`;
const deliveryRoot = path.join(packageRoot, deliveryName);
const manifestJsonPath = path.join(deliveryRoot, `${appName}-${packageJson.version}-${platformArch}-local-delivery-package-manifest.json`);
const manifestMarkdownPath = path.join(deliveryRoot, `${appName}-${packageJson.version}-${platformArch}-local-delivery-package-manifest.md`);
const reopenJsonPath = path.join(deliveryRoot, `${appName}-${packageJson.version}-${platformArch}-local-package-reopen.json`);
const zipPath = path.join(packageRoot, `${deliveryName}.zip`);
const zipReportJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-local-delivery-zip-smoke.json`);
const zipReportMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-local-delivery-zip-smoke.md`);
const expectedArtifactLabels = [
  "Project file",
  "Full mix WAV",
  "Drums stem WAV",
  "808 stem WAV",
  "Synth stem WAV",
  "Chords stem WAV",
  "Arrangement MIDI",
  "Handoff Sheet"
];
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge local delivery ZIP smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function dosDateTime(date = new Date("2026-01-01T00:00:00Z")) {
  const year = Math.max(1980, date.getUTCFullYear());
  const dosTime = (date.getUTCSeconds() >> 1) | (date.getUTCMinutes() << 5) | (date.getUTCHours() << 11);
  const dosDate = date.getUTCDate() | ((date.getUTCMonth() + 1) << 5) | ((year - 1980) << 9);
  return { dosTime, dosDate };
}

const crcTable = new Uint32Array(256);
for (let index = 0; index < crcTable.length; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  crcTable[index] = value >>> 0;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function uint16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function createZip(entries) {
  const { dosTime, dosDate } = dosDateTime();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = Buffer.from(entry.name, "utf8");
    const size = entry.bytes.byteLength;
    const crc = crc32(entry.bytes);
    const localHeader = Buffer.concat([
      uint32(0x04034b50),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(dosTime),
      uint16(dosDate),
      uint32(crc),
      uint32(size),
      uint32(size),
      uint16(nameBytes.byteLength),
      uint16(0),
      nameBytes
    ]);
    localParts.push(localHeader, entry.bytes);

    const centralHeader = Buffer.concat([
      uint32(0x02014b50),
      uint16(20),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(dosTime),
      uint16(dosDate),
      uint32(crc),
      uint32(size),
      uint32(size),
      uint16(nameBytes.byteLength),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(offset),
      nameBytes
    ]);
    centralParts.push(centralHeader);
    entry.crc32 = crc.toString(16).padStart(8, "0");
    entry.bytesLength = size;
    entry.localHeaderOffset = offset;
    offset += localHeader.byteLength + size;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const eocd = Buffer.concat([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(entries.length),
    uint16(entries.length),
    uint32(centralDirectory.byteLength),
    uint32(offset),
    uint16(0)
  ]);

  return Buffer.concat([...localParts, centralDirectory, eocd]);
}

function readCString(bytes, start, length) {
  return bytes.subarray(start, start + length).toString("utf8");
}

function parseZip(bytes) {
  let eocdOffset = -1;
  for (let index = bytes.byteLength - 22; index >= Math.max(0, bytes.byteLength - 65557); index -= 1) {
    if (bytes.readUInt32LE(index) === 0x06054b50) {
      eocdOffset = index;
      break;
    }
  }
  if (eocdOffset < 0) {
    throw new Error("EOCD record missing");
  }

  const entryCount = bytes.readUInt16LE(eocdOffset + 10);
  const centralSize = bytes.readUInt32LE(eocdOffset + 12);
  const centralOffset = bytes.readUInt32LE(eocdOffset + 16);
  const commentLength = bytes.readUInt16LE(eocdOffset + 20);
  const entries = [];
  let cursor = centralOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (bytes.readUInt32LE(cursor) !== 0x02014b50) {
      throw new Error(`Central directory entry ${index} has an invalid signature`);
    }
    const compression = bytes.readUInt16LE(cursor + 10);
    const crc = bytes.readUInt32LE(cursor + 16);
    const compressedSize = bytes.readUInt32LE(cursor + 20);
    const uncompressedSize = bytes.readUInt32LE(cursor + 24);
    const nameLength = bytes.readUInt16LE(cursor + 28);
    const extraLength = bytes.readUInt16LE(cursor + 30);
    const commentEntryLength = bytes.readUInt16LE(cursor + 32);
    const localHeaderOffset = bytes.readUInt32LE(cursor + 42);
    const name = readCString(bytes, cursor + 46, nameLength);
    cursor += 46 + nameLength + extraLength + commentEntryLength;

    if (bytes.readUInt32LE(localHeaderOffset) !== 0x04034b50) {
      throw new Error(`${name} has an invalid local header signature`);
    }
    const localNameLength = bytes.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = bytes.readUInt16LE(localHeaderOffset + 28);
    const localName = readCString(bytes, localHeaderOffset + 30, localNameLength);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const data = bytes.subarray(dataStart, dataStart + compressedSize);
    entries.push({
      name,
      localName,
      compression,
      crc32: crc.toString(16).padStart(8, "0"),
      calculatedCrc32: crc32(data).toString(16).padStart(8, "0"),
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
      data
    });
  }

  return {
    entryCount,
    centralSize,
    centralOffset,
    commentLength,
    eocdOffset,
    entries
  };
}

function resolveInsideDeliveryRoot(filePath, label) {
  const resolved = path.resolve(root, filePath);
  const deliveryRootWithSep = `${deliveryRoot}${path.sep}`;
  check(resolved === deliveryRoot || resolved.startsWith(deliveryRootWithSep), `${label} should stay inside the local delivery package`);
  return resolved;
}

async function sourceEntry(label, kind, filePath) {
  const absolutePath = resolveInsideDeliveryRoot(filePath, label);
  const bytes = await readFile(absolutePath);
  const fileStat = await stat(absolutePath);
  check(fileStat.size === bytes.byteLength, `${label} stat size should match bytes`);
  return {
    label,
    kind,
    name: `${deliveryName}/${path.basename(absolutePath)}`,
    path: relative(absolutePath),
    bytes,
    sha256: sha256(bytes)
  };
}

function buildMarkdown(report) {
  const entryRows = report.entries
    .map((entry) => `| ${entry.label} | ${entry.kind} | ${entry.bytes} | \`${entry.sha256.slice(0, 16)}...\` | \`${entry.crc32}\` | \`${entry.name}\` |`)
    .join("\n");

  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Local Delivery ZIP Smoke

## Status

- Local delivery ZIP ready: ${report.localDeliveryZipReady ? "yes" : "no"}
- Product scope: ${report.productScope}
- ZIP path: \`${report.zip.path}\`
- ZIP bytes: ${report.zip.bytes}
- ZIP SHA-256: \`${report.zip.sha256.slice(0, 16)}...\`
- Source manifest: \`${report.sourceManifestPath}\`
- Reopen report: \`${report.sourceReopenPath}\`
- Entry count: ${report.entryCount}
- Central directory entries verified: ${report.centralDirectoryEntryCount}
- Source artifact count: ${report.sourceArtifactCount}

## ZIP Entries

| entry | kind | bytes | sha256 | crc32 | zip name |
|---|---|---:|---|---|---|
${entryRows}

## ZIP Structure

- EOCD present: ${report.zipStructure.eocdPresent ? "yes" : "no"}
- Central directory present: ${report.zipStructure.centralDirectoryPresent ? "yes" : "no"}
- Local headers verified: ${report.zipStructure.localHeadersVerified ? "yes" : "no"}
- CRC checks verified: ${report.zipStructure.crcChecksVerified ? "yes" : "no"}
- Stored entries only: ${report.zipStructure.storedEntriesOnly ? "yes" : "no"}
- Path safety verified: ${report.zipStructure.pathSafetyVerified ? "yes" : "no"}

## Not Recorded

Private values, private beats, real user audio, release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, and local env values are not recorded.

## Not Claimed

This ZIP smoke does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

if (!existsSync(manifestJsonPath)) {
  fail("Local delivery package manifest is missing.", `Run npm run desktop:local-delivery-package-smoke before npm run desktop:local-delivery-zip-smoke.\nMissing: ${relative(manifestJsonPath)}`);
}
if (!existsSync(reopenJsonPath)) {
  fail("Local package reopen report is missing.", `Run npm run desktop:local-package-reopen-smoke before npm run desktop:local-delivery-zip-smoke.\nMissing: ${relative(reopenJsonPath)}`);
}

const manifest = JSON.parse(await readFile(manifestJsonPath, "utf8"));
const reopenReport = JSON.parse(await readFile(reopenJsonPath, "utf8"));
check(manifest.localDeliveryPackageReady === true, "source local delivery package should be ready");
check(reopenReport.localPackageReopenReady === true, "source local package reopen report should be ready");
check(manifest.artifactCount === expectedArtifactLabels.length, "source local delivery package should include every deliverable artifact");
check(expectedArtifactLabels.every((label) => manifest.artifacts?.some((artifact) => artifact.label === label)), "source manifest should include every expected local delivery artifact");
check(manifest.privateValuesRecorded === false, "source manifest should not record private values");
check(manifest.privateBeatRecorded === false, "source manifest should not record private beats");
check(manifest.realUserAudioRecorded === false, "source manifest should not record real user audio");
check(manifest.networkProbeAttempted === false, "source manifest should not probe remote channels");
check(manifest.releaseUploadAttempted === false, "source manifest should not upload release artifacts");
check(manifest.releaseGateClaimedExternalDistribution === false, "source manifest should not claim external distribution completion");
check(reopenReport.privateValuesRecorded === false, "source reopen report should not record private values");
check(reopenReport.privateBeatRecorded === false, "source reopen report should not record private beats");
check(reopenReport.realUserAudioRecorded === false, "source reopen report should not record real user audio");
check(reopenReport.networkProbeAttempted === false, "source reopen report should not probe remote channels");
check(reopenReport.releaseUploadAttempted === false, "source reopen report should not upload release artifacts");
check(reopenReport.releaseGateClaimedExternalDistribution === false, "source reopen report should not claim external distribution completion");

const entries = [];
for (const artifact of manifest.artifacts ?? []) {
  entries.push(await sourceEntry(artifact.label, artifact.kind, artifact.path));
}
entries.push(await sourceEntry("Package manifest JSON", "manifest-json", manifestJsonPath));
entries.push(await sourceEntry("Package manifest Markdown", "manifest-markdown", manifestMarkdownPath));

const entryNames = entries.map((entry) => entry.name);
check(new Set(entryNames).size === entryNames.length, "local delivery ZIP should not contain duplicate entry names");
check(entryNames.every((name) => name.startsWith(`${deliveryName}/`)), "local delivery ZIP entries should stay under one package directory");
check(entryNames.every((name) => !name.includes("\\") && !name.includes("..") && !path.isAbsolute(name)), "local delivery ZIP entry names should be archive-safe");

const zipBytes = createZip(entries);
await mkdir(packageRoot, { recursive: true });
await writeFile(zipPath, zipBytes);

let parsedZip;
try {
  parsedZip = parseZip(zipBytes);
} catch (error) {
  fail("ZIP structure parsing failed.", error instanceof Error ? error.message : String(error));
}

const parsedEntryByName = new Map(parsedZip.entries.map((entry) => [entry.name, entry]));
for (const entry of entries) {
  const parsed = parsedEntryByName.get(entry.name);
  check(Boolean(parsed), `${entry.label} should exist in ZIP central directory`);
  if (!parsed) {
    continue;
  }
  check(parsed.localName === entry.name, `${entry.label} local header name should match central directory`);
  check(parsed.compression === 0, `${entry.label} should use stored ZIP method`);
  check(parsed.compressedSize === entry.bytes.byteLength, `${entry.label} compressed size should match source bytes`);
  check(parsed.uncompressedSize === entry.bytes.byteLength, `${entry.label} uncompressed size should match source bytes`);
  check(parsed.crc32 === entry.crc32, `${entry.label} central CRC should match source CRC`);
  check(parsed.calculatedCrc32 === entry.crc32, `${entry.label} recalculated CRC should match source CRC`);
  check(sha256(parsed.data) === entry.sha256, `${entry.label} ZIP data SHA-256 should match source`);
}

const zipStat = await stat(zipPath);
const report = {
  appName,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  productScope: "single-file sample-free local delivery archive from editable GrooveForge events",
  sourceManifestPath: relative(manifestJsonPath),
  sourceReopenPath: relative(reopenJsonPath),
  packageRoot: relative(deliveryRoot),
  zip: {
    path: relative(zipPath),
    bytes: zipBytes.byteLength,
    fileSize: zipStat.size,
    sha256: sha256(zipBytes)
  },
  entries: entries.map((entry) => ({
    label: entry.label,
    kind: entry.kind,
    name: entry.name,
    sourcePath: entry.path,
    bytes: entry.bytes.byteLength,
    sha256: entry.sha256,
    crc32: entry.crc32,
    localHeaderOffset: entry.localHeaderOffset,
    valueRecorded: false
  })),
  entryCount: entries.length,
  centralDirectoryEntryCount: parsedZip.entryCount,
  sourceArtifactCount: manifest.artifactCount,
  zipStructure: {
    eocdPresent: parsedZip.eocdOffset > 0,
    centralDirectoryPresent: parsedZip.centralOffset > 0 && parsedZip.centralSize > 0,
    localHeadersVerified: parsedZip.entries.every((entry) => entry.localName === entry.name),
    crcChecksVerified: parsedZip.entries.every((entry) => entry.crc32 === entry.calculatedCrc32),
    storedEntriesOnly: parsedZip.entries.every((entry) => entry.compression === 0),
    pathSafetyVerified: parsedZip.entries.every((entry) => entry.name.startsWith(`${deliveryName}/`) && !entry.name.includes("\\") && !entry.name.includes("..") && !path.isAbsolute(entry.name)),
    commentLength: parsedZip.commentLength
  },
  localDeliveryZipReady: true,
  localEnvValueRecorded: false,
  privateValuesRecorded: false,
  privateBeatRecorded: false,
  realUserAudioRecorded: false,
  networkProbeAttempted: false,
  releaseUploadAttempted: false,
  signingAttempted: false,
  releaseGateClaimedDeveloperIdSigning: false,
  releaseGateClaimedNotarization: false,
  releaseGateClaimedGatekeeperApproval: false,
  releaseGateClaimedAutoUpdate: false,
  releaseGateClaimedManualQaApproval: false,
  releaseGateClaimedExternalDistribution: false
};
const reportMarkdown = buildMarkdown(report);

check(zipStat.size === zipBytes.byteLength, "local delivery ZIP file size should match generated bytes");
check(report.entryCount === expectedArtifactLabels.length + 2, "local delivery ZIP should include deliverables plus manifest files");
check(report.centralDirectoryEntryCount === report.entryCount, "local delivery ZIP central directory count should match entries");
check(report.zipStructure.eocdPresent === true, "local delivery ZIP should include EOCD");
check(report.zipStructure.centralDirectoryPresent === true, "local delivery ZIP should include central directory");
check(report.zipStructure.localHeadersVerified === true, "local delivery ZIP local headers should be verified");
check(report.zipStructure.crcChecksVerified === true, "local delivery ZIP CRC checks should be verified");
check(report.zipStructure.storedEntriesOnly === true, "local delivery ZIP should use stored entries only");
check(report.zipStructure.pathSafetyVerified === true, "local delivery ZIP paths should be safe");
check(report.entries.every((entry) => entry.valueRecorded === false), "local delivery ZIP entries should be value-free");
check(report.localDeliveryZipReady === true, "local delivery ZIP report should be ready");
check(report.localEnvValueRecorded === false, "local delivery ZIP report should not record local env values");
check(report.privateValuesRecorded === false, "local delivery ZIP report should not record private values");
check(report.privateBeatRecorded === false, "local delivery ZIP report should not record private beats");
check(report.realUserAudioRecorded === false, "local delivery ZIP report should not record real user audio");
check(report.networkProbeAttempted === false, "local delivery ZIP report should not probe remote channels");
check(report.releaseUploadAttempted === false, "local delivery ZIP report should not upload release artifacts");
check(report.signingAttempted === false, "local delivery ZIP report should not sign artifacts");
check(report.releaseGateClaimedExternalDistribution === false, "local delivery ZIP report should not claim external distribution completion");
check(!/https?:\/\//i.test(reportMarkdown), "local delivery ZIP report should not include URL values");

if (failures.length > 0) {
  fail("Local delivery ZIP validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

await writeFile(zipReportJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
await writeFile(zipReportMarkdownPath, reportMarkdown, "utf8");

console.log("GrooveForge local delivery ZIP smoke passed.");
console.log(`- ZIP: ${relative(zipPath)}`);
console.log(`- JSON: ${relative(zipReportJsonPath)}`);
console.log(`- Markdown: ${relative(zipReportMarkdownPath)}`);
console.log(`- Entries: ${report.entryCount}, ${report.zip.bytes} bytes`);
console.log(`- Source artifacts: ${report.sourceArtifactCount}, central directory entries: ${report.centralDirectoryEntryCount}`);
console.log("- Verified: EOCD, central directory, local headers, CRC-32, sizes, entry names, and source SHA-256 matches");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not recorded: private values, private beats, real user audio, release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, or local env values");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
