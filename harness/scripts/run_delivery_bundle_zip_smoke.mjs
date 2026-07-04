#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = (await import("../../package.json", { with: { type: "json" } })).default;
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const reportJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-delivery-bundle-zip-smoke.json`);
const reportMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-delivery-bundle-zip-smoke.md`);
const failures = [];

const workstation = await import("../../src/domain/workstation.ts");
const render = await import("../../src/audio/render.ts");
const deliveryBundle = await import("../../src/audio/deliveryBundle.ts");

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge delivery bundle ZIP smoke failed:");
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
      calculatedCrc32: deliveryBundle.formatCrc32(deliveryBundle.crc32(data)),
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

function buildMarkdown(report) {
  const entryRows = report.entries
    .map((entry) => `| ${entry.label} | ${entry.kind} | ${entry.bytes} | \`${entry.crc32}\` | \`${entry.name}\` |`)
    .join("\n");

  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Delivery Bundle ZIP Smoke

## Status

- Delivery bundle ZIP ready: ${report.deliveryBundleZipReady ? "yes" : "no"}
- Product scope: ${report.productScope}
- ZIP path: \`${report.zip.path}\`
- ZIP bytes: ${report.zip.bytes}
- ZIP SHA-256: \`${report.zip.sha256.slice(0, 16)}...\`
- Entry count: ${report.entryCount}
- Manifest entry count: ${report.manifestEntryCount}
- Project: ${report.project.title}
- Delivery target: ${report.project.deliveryTarget}

## ZIP Entries

| entry | kind | bytes | crc32 | zip name |
|---|---:|---:|---|---|
${entryRows}

## ZIP Structure

- EOCD present: ${report.zipStructure.eocdPresent ? "yes" : "no"}
- Central directory present: ${report.zipStructure.centralDirectoryPresent ? "yes" : "no"}
- Local headers verified: ${report.zipStructure.localHeadersVerified ? "yes" : "no"}
- CRC checks verified: ${report.zipStructure.crcChecksVerified ? "yes" : "no"}
- Stored entries only: ${report.zipStructure.storedEntriesOnly ? "yes" : "no"}
- Path safety verified: ${report.zipStructure.pathSafetyVerified ? "yes" : "no"}
- Manifest JSON verified: ${report.zipStructure.manifestJsonVerified ? "yes" : "no"}

## Not Recorded

Private values, private beats, real user audio, release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, and local env values are not recorded.

## Not Claimed

This smoke does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

const project = {
  ...workstation.starterProject,
  title: "Delivery Bundle Smoke Beat",
  mode: "guided",
  deliveryTarget: "starter_sketch",
  sessionBrief: {
    artist: "Local composer",
    vibe: "sample-free bundle handoff",
    reference: "direct composition smoke",
    notes: "Generated locally for bundle validation."
  }
};
const exportAnalysis = render.analyzeExport(project);
const stemAnalyses = render.analyzeStemExports(project);
const bundle = await deliveryBundle.createDeliveryBundleZipBlob(project, exportAnalysis, stemAnalyses);
const zipBytes = Buffer.from(await bundle.blob.arrayBuffer());
await mkdir(packageRoot, { recursive: true });
const zipPath = path.join(packageRoot, bundle.fileName);
await writeFile(zipPath, zipBytes);

let parsedZip;
try {
  parsedZip = parseZip(zipBytes);
} catch (error) {
  fail("ZIP structure parsing failed.", error instanceof Error ? error.message : String(error));
}

const entries = parsedZip.entries.map((entry) => ({
  name: entry.name,
  localName: entry.localName,
  bytes: entry.uncompressedSize,
  sha256: sha256(entry.data),
  crc32: entry.crc32,
  calculatedCrc32: entry.calculatedCrc32,
  compression: entry.compression,
  kind: entry.name.endsWith(".wav")
    ? entry.name.includes("/stems/")
      ? "stem-wav"
      : "mix-wav"
    : entry.name.endsWith(".mid")
      ? "arrangement-midi"
      : entry.name.endsWith(".grooveforge.json")
        ? "project-json"
        : entry.name.endsWith("manifest.json")
          ? "manifest-json"
          : entry.name.endsWith("manifest.md")
            ? "manifest-markdown"
            : "handoff-sheet",
  label: entry.name.endsWith("manifest.json")
    ? "Checksum manifest JSON"
    : entry.name.endsWith("manifest.md")
      ? "Checksum manifest Markdown"
      : entry.name.endsWith(".grooveforge.json")
        ? "Project file"
        : entry.name.endsWith("-demo.wav")
          ? "Full mix WAV"
          : entry.name.endsWith(".mid")
            ? "Arrangement MIDI"
            : entry.name.endsWith("-handoff.txt")
              ? "Handoff Sheet"
              : "Stem WAV"
}));
const entryByName = new Map(parsedZip.entries.map((entry) => [entry.name, entry]));
const manifestEntry = parsedZip.entries.find((entry) => entry.name.endsWith("/manifest.json"));
const manifestMarkdownEntry = parsedZip.entries.find((entry) => entry.name.endsWith("/manifest.md"));
const projectEntry = parsedZip.entries.find((entry) => entry.name.endsWith(".grooveforge.json"));
const mixEntry = parsedZip.entries.find((entry) => entry.name.endsWith("-demo.wav") && !entry.name.includes("/stems/"));
const midiEntry = parsedZip.entries.find((entry) => entry.name.endsWith(".mid"));
const handoffEntry = parsedZip.entries.find((entry) => entry.name.endsWith("-handoff.txt"));
const stemEntries = parsedZip.entries.filter((entry) => entry.name.includes("/stems/") && entry.name.endsWith(".wav"));
const parsedManifest = manifestEntry ? JSON.parse(manifestEntry.data.toString("utf8")) : null;
const bundleRoot = parsedZip.entries[0]?.name.split("/")[0] ?? "";
const expectedEntryCount = 10;
const expectedManifestLabels = [
  "Project file",
  "Full mix WAV",
  "Drums stem WAV",
  "808 stem WAV",
  "Synth stem WAV",
  "Chords stem WAV",
  "Arrangement MIDI",
  "Handoff Sheet"
];

check(exportAnalysis.status !== "Silent", "bundle smoke mix should be audible");
check(stemEntries.length === render.stemTrackIds.length, "bundle ZIP should include four stem WAVs");
check(stemEntries.every((entry) => entry.data.subarray(0, 4).toString("ascii") === "RIFF"), "stem ZIP entries should be WAV files");
check(mixEntry?.data.subarray(0, 4).toString("ascii") === "RIFF", "mix ZIP entry should be a WAV file");
check(midiEntry?.data.subarray(0, 4).toString("ascii") === "MThd", "MIDI ZIP entry should be a MIDI file");
check(Boolean(handoffEntry?.data.toString("utf8").includes("GrooveForge Handoff Sheet")), "Handoff ZIP entry should include the sheet title");
check(Boolean(projectEntry), "bundle ZIP should include a project JSON entry");
if (projectEntry) {
  check(workstation.parseProjectFile(projectEntry.data.toString("utf8")).title === project.title, "project JSON entry should roundtrip");
}
check(Boolean(manifestEntry), "bundle ZIP should include manifest JSON");
check(Boolean(manifestMarkdownEntry), "bundle ZIP should include manifest Markdown");
check(parsedZip.entryCount === expectedEntryCount, "bundle ZIP should contain project, mix, four stems, MIDI, sheet, and two manifests");
check(parsedZip.entries.every((entry) => entry.name.startsWith(`${bundleRoot}/`)), "bundle ZIP entries should stay under one root directory");
check(parsedZip.entries.every((entry) => !entry.name.includes("\\") && !entry.name.includes("..") && !path.isAbsolute(entry.name)), "bundle ZIP entry names should be archive-safe");
check(parsedZip.entries.every((entry) => entry.localName === entry.name), "bundle ZIP local names should match central names");
check(parsedZip.entries.every((entry) => entry.compression === 0), "bundle ZIP should use stored entries only");
check(parsedZip.entries.every((entry) => entry.compressedSize === entry.uncompressedSize), "bundle ZIP sizes should match for stored entries");
check(parsedZip.entries.every((entry) => entry.crc32 === entry.calculatedCrc32), "bundle ZIP CRC checks should verify");
check(Boolean(parsedManifest), "bundle manifest should parse as JSON");
if (parsedManifest) {
  check(parsedManifest.app === "GrooveForge", "bundle manifest should name GrooveForge");
  check(parsedManifest.bundleFileName === bundle.fileName, "bundle manifest should include ZIP file name");
  check(parsedManifest.artifactCount === expectedEntryCount, "bundle manifest artifact count should include manifest files");
  check(parsedManifest.entries.length === expectedManifestLabels.length, "bundle manifest should list eight source deliverables");
  check(expectedManifestLabels.every((label) => parsedManifest.entries.some((entry) => entry.label === label)), "bundle manifest should list expected source labels");
  check(parsedManifest.entries.every((entry) => entryByName.has(entry.path)), "bundle manifest paths should exist in ZIP");
  check(
    parsedManifest.entries.every((entry) => {
      const zipEntry = entryByName.get(entry.path);
      return zipEntry && zipEntry.uncompressedSize === entry.bytes && zipEntry.crc32 === entry.crc32;
    }),
    "bundle manifest sizes and CRC values should match ZIP entries"
  );
  check(parsedManifest.localFirst === true, "bundle manifest should keep local-first posture");
  check(parsedManifest.samplingSecondary === true, "bundle manifest should keep sampling secondary");
  check(parsedManifest.privateValuesRecorded === false, "bundle manifest should not record private values");
  check(parsedManifest.realUserAudioRecorded === false, "bundle manifest should not record real user audio");
  check(parsedManifest.networkProbeAttempted === false, "bundle manifest should not probe network");
  check(parsedManifest.claimedExternalDistribution === false, "bundle manifest should not claim external distribution");
}

const zipStat = await stat(zipPath);
const report = {
  appName,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  productScope: "in-app sample-free local delivery bundle ZIP from editable GrooveForge events",
  project: {
    title: project.title,
    mode: project.mode,
    bpm: project.bpm,
    key: project.key,
    styleId: project.styleId,
    bars: workstation.arrangementTotalBars(project),
    deliveryTarget: workstation.activeDeliveryTarget(project).name
  },
  zip: {
    path: relative(zipPath),
    bytes: zipBytes.byteLength,
    fileSize: zipStat.size,
    sha256: sha256(zipBytes)
  },
  entries,
  entryCount: parsedZip.entryCount,
  manifestEntryCount: parsedManifest?.entries.length ?? 0,
  manifestArtifactCount: parsedManifest?.artifactCount ?? 0,
  zipStructure: {
    eocdPresent: parsedZip.eocdOffset > 0,
    centralDirectoryPresent: parsedZip.centralOffset > 0 && parsedZip.centralSize > 0,
    localHeadersVerified: parsedZip.entries.every((entry) => entry.localName === entry.name),
    crcChecksVerified: parsedZip.entries.every((entry) => entry.crc32 === entry.calculatedCrc32),
    storedEntriesOnly: parsedZip.entries.every((entry) => entry.compression === 0),
    pathSafetyVerified: parsedZip.entries.every((entry) => entry.name.startsWith(`${bundleRoot}/`) && !entry.name.includes("\\") && !entry.name.includes("..") && !path.isAbsolute(entry.name)),
    manifestJsonVerified: Boolean(parsedManifest),
    commentLength: parsedZip.commentLength
  },
  deliveryBundleZipReady: true,
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

check(zipStat.size === zipBytes.byteLength, "bundle ZIP file size should match generated bytes");
check(report.deliveryBundleZipReady === true, "bundle ZIP report should be ready");
check(report.entryCount === expectedEntryCount, "bundle ZIP report should include ten entries");
check(report.manifestEntryCount === expectedManifestLabels.length, "bundle manifest should list source deliverables");
check(report.manifestArtifactCount === expectedEntryCount, "bundle manifest artifact count should match ZIP entries");
check(report.zipStructure.eocdPresent === true, "bundle ZIP should include EOCD");
check(report.zipStructure.centralDirectoryPresent === true, "bundle ZIP should include central directory");
check(report.zipStructure.localHeadersVerified === true, "bundle ZIP local headers should be verified");
check(report.zipStructure.crcChecksVerified === true, "bundle ZIP CRC checks should be verified");
check(report.zipStructure.storedEntriesOnly === true, "bundle ZIP should use stored entries only");
check(report.zipStructure.pathSafetyVerified === true, "bundle ZIP paths should be safe");
check(report.zipStructure.manifestJsonVerified === true, "bundle manifest JSON should be verified");
check(report.localEnvValueRecorded === false, "bundle ZIP report should not record local env values");
check(report.privateValuesRecorded === false, "bundle ZIP report should not record private values");
check(report.privateBeatRecorded === false, "bundle ZIP report should not record private beats");
check(report.realUserAudioRecorded === false, "bundle ZIP report should not record real user audio");
check(report.networkProbeAttempted === false, "bundle ZIP report should not probe remote channels");
check(report.releaseUploadAttempted === false, "bundle ZIP report should not upload release artifacts");
check(report.signingAttempted === false, "bundle ZIP report should not sign artifacts");
check(report.releaseGateClaimedExternalDistribution === false, "bundle ZIP report should not claim external distribution completion");
check(!/https?:\/\//i.test(reportMarkdown), "bundle ZIP report should not include URL values");

if (failures.length > 0) {
  fail("Delivery bundle ZIP validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
await writeFile(reportMarkdownPath, reportMarkdown, "utf8");

console.log("GrooveForge delivery bundle ZIP smoke passed.");
console.log(`- ZIP: ${relative(zipPath)}`);
console.log(`- JSON: ${relative(reportJsonPath)}`);
console.log(`- Markdown: ${relative(reportMarkdownPath)}`);
console.log(`- Entries: ${report.entryCount}, ${report.zip.bytes} bytes`);
console.log(`- Manifest entries: ${report.manifestEntryCount}, artifact count: ${report.manifestArtifactCount}`);
console.log("- Verified: project JSON, mix WAV, four stem WAVs, MIDI, Handoff Sheet, manifest JSON/Markdown, EOCD, central directory, local headers, CRC-32, sizes, and safe entry names");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not recorded: private values, private beats, real user audio, release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, or local env values");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
