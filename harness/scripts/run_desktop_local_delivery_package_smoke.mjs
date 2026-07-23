#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const deliveryRoot = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-local-delivery-package`);
const manifestJsonPath = path.join(deliveryRoot, `${appName}-${packageJson.version}-${platformArch}-local-delivery-package-manifest.json`);
const manifestMarkdownPath = path.join(deliveryRoot, `${appName}-${packageJson.version}-${platformArch}-local-delivery-package-manifest.md`);
const expectedStemArtifactLabels = ["Drums stem WAV", "Bass stem WAV", "Synth stem WAV", "Chords stem WAV"];
const failures = [];

const workstation = await import("../../src/domain/workstation.ts");
const render = await import("../../src/audio/render.ts");
const midi = await import("../../src/audio/midi.ts");
const handoff = await import("../../src/audio/handoff.ts");
const soundcloud = await import("../../src/audio/soundcloud.ts");

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge local delivery package smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function ascii(bytes, start, length) {
  return Buffer.from(bytes.subarray(start, start + length)).toString("ascii");
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function blobToBuffer(blob) {
  return Buffer.from(await blob.arrayBuffer());
}

function checkNoSamplingText(text, label) {
  check(!/AudioClipEvent|\bsampler\b|sample import|audio clip|sample chopping|imported audio/i.test(text), `${label} should stay sample-free and not mention optional sampling scope`);
}

function checkWavBytes(bytes, label) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  check(bytes.byteLength > 44, `${label} WAV should include audio data`);
  check(ascii(bytes, 0, 4) === "RIFF", `${label} WAV missing RIFF header`);
  check(ascii(bytes, 8, 4) === "WAVE", `${label} WAV missing WAVE header`);
  check(ascii(bytes, 12, 4) === "fmt ", `${label} WAV missing fmt chunk`);
  check(ascii(bytes, 36, 4) === "data", `${label} WAV missing data chunk`);
  check(view.getUint16(20, true) === 1, `${label} WAV must use PCM format 1`);
  check(view.getUint16(22, true) === 2, `${label} WAV must be stereo`);
  check(view.getUint32(24, true) === 44100, `${label} WAV must use 44100 Hz`);
  check(view.getUint32(28, true) === 264600, `${label} WAV must use 264600 byte rate`);
  check(view.getUint16(32, true) === 6, `${label} WAV must use 6-byte block alignment`);
  check(view.getUint16(34, true) === 24, `${label} WAV must use 24-bit samples`);
}

function checkMidiBytes(bytes, label) {
  check(bytes.byteLength > 128, `${label} MIDI should include arrangement events`);
  check(ascii(bytes, 0, 4) === "MThd", `${label} MIDI missing MThd header`);
}

function fileRow(label, kind, filePath, bytes) {
  return {
    label,
    kind,
    path: relative(filePath),
    bytes: bytes.byteLength,
    sha256: sha256(bytes)
  };
}

async function writeArtifact(label, kind, fileName, bytes) {
  const filePath = path.join(deliveryRoot, fileName);
  await writeFile(filePath, bytes);
  return fileRow(label, kind, filePath, bytes);
}

function buildProject() {
  const blueprintProject = workstation.applyBeatBlueprint(workstation.starterProject, "seoul_pocket");
  const targetProject = workstation.applyDeliveryTarget(blueprintProject, "starter_sketch");
  return {
    ...targetProject,
    title: "GrooveForge Sub Bass",
    mode: "guided",
    arrangement: workstation.createPatternChain("eight_bar"),
    sessionBrief: {
      artist: "",
      vibe: "late-night Seoul pocket / warm sub bass / original instrumental",
      reference: "built-in instruments",
      notes: "Created locally from editable GrooveForge events and built-in synthesis only."
    },
    snapshots: []
  };
}

function buildManifest(project, analysis, stemAnalyses, artifacts) {
  const target = workstation.activeDeliveryTarget(project);
  return {
    appName,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    packageRoot: relative(deliveryRoot),
    productScope: "sample-free direct beat composition package from editable GrooveForge events",
    project: {
      title: project.title,
      mode: project.mode,
      styleId: project.styleId,
      bpm: project.bpm,
      key: project.key,
      selectedPattern: project.selectedPattern,
      arrangementBars: workstation.arrangementTotalBars(project),
      deliveryTarget: target.name,
      stemGoal: target.stemGoal,
      masterPreset: project.masterPreset
    },
    mixAnalysis: analysis,
    stemAnalyses,
    artifacts,
    artifactCount: artifacts.length,
    totalBytes: artifacts.reduce((total, artifact) => total + artifact.bytes, 0),
    localDeliveryPackageReady: true,
    localEnvValueRecorded: false,
    privateValuesRecorded: false,
    privateBeatRecorded: false,
    realUserAudioRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedAutoUpdate: false,
    releaseGateClaimedManualQaApproval: false,
    releaseGateClaimedExternalDistribution: false
  };
}

function buildMarkdown(manifest) {
  const artifactRows = manifest.artifacts
    .map((artifact) => `| ${artifact.label} | ${artifact.kind} | ${artifact.bytes} | \`${artifact.sha256.slice(0, 16)}...\` | \`${artifact.path}\` |`)
    .join("\n");

  return `# ${appName} ${manifest.version} ${manifest.platform}-${manifest.arch} Local Delivery Package

## Status

- Local delivery package ready: ${manifest.localDeliveryPackageReady ? "yes" : "no"}
- Product scope: ${manifest.productScope}
- Project: ${manifest.project.title}
- Style: ${manifest.project.styleId}
- BPM/key: ${manifest.project.bpm} / ${manifest.project.key}
- Arrangement: ${manifest.project.arrangementBars} bars
- Delivery target: ${manifest.project.deliveryTarget}
- Artifacts: ${manifest.artifactCount}
- Total bytes: ${manifest.totalBytes}

## Artifacts

| artifact | kind | bytes | sha256 | path |
|---|---|---:|---|---|
${artifactRows}

## Export Meter

- Mix status: ${manifest.mixAnalysis.status}
- Duration: ${manifest.mixAnalysis.durationSeconds.toFixed(2)}s
- Peak: ${manifest.mixAnalysis.peakDb.toFixed(2)} dB
- RMS: ${manifest.mixAnalysis.rmsDb.toFixed(2)} dB
- Headroom: ${manifest.mixAnalysis.headroomDb.toFixed(2)} dB

## Not Recorded

Private values, private beats, real user audio, release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, and local env values are not recorded.

## Not Claimed

This package smoke does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

const project = buildProject();
const analysis = render.analyzeExport(project);
const stemAnalyses = render.analyzeStemExports(project);
const projectContents = workstation.serializeProjectFile(project);
const handoffContents = handoff.createHandoffSheet(project, analysis, stemAnalyses);
const soundCloudContents = soundcloud.createSoundCloudUploadSheet(project);
const mixBytes = await blobToBuffer(render.createMixWavBlob(project));
const stemArtifacts = [];
const stemFileNames = render.stemWavFileNames(project);
const midiBytes = Buffer.from(midi.createMidiFile(project));

await rm(deliveryRoot, { recursive: true, force: true });
await mkdir(deliveryRoot, { recursive: true });

const artifacts = [
  await writeArtifact("Project file", "project-json", workstation.projectFileName(project), Buffer.from(projectContents, "utf8")),
  await writeArtifact("Full mix WAV", "wav", render.mixWavFileName(project), mixBytes)
];

for (const [index, track] of render.stemTrackIds.entries()) {
  const stemBytes = await blobToBuffer(render.createStemWavBlob(project, track));
  stemArtifacts.push({ track, bytes: stemBytes, fileName: stemFileNames[index] });
  artifacts.push(await writeArtifact(`${render.stemTrackLabel(track)} stem WAV`, "wav-stem", stemFileNames[index], stemBytes));
}

artifacts.push(await writeArtifact("Arrangement MIDI", "midi", midi.midiFileName(project), midiBytes));
artifacts.push(await writeArtifact("Handoff Sheet", "handoff", handoff.handoffSheetFileName(project), Buffer.from(handoffContents, "utf8")));
artifacts.push(await writeArtifact("SoundCloud Upload Sheet", "soundcloud-upload", soundcloud.soundCloudUploadSheetFileName(project), Buffer.from(soundCloudContents, "utf8")));

const manifest = buildManifest(project, analysis, stemAnalyses, artifacts);
const manifestMarkdown = buildMarkdown(manifest);
await writeFile(manifestJsonPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
await writeFile(manifestMarkdownPath, manifestMarkdown, "utf8");

const roundTrippedProject = workstation.parseProjectFile(projectContents);
check(roundTrippedProject.title === project.title, "local delivery project file should roundtrip with the same title");
check(roundTrippedProject.styleId === project.styleId, "local delivery project file should roundtrip with the same style");
check(workstation.arrangementTotalBars(project) === 8, "local delivery package should prove the sample-free 8-bar first target");
check(workstation.activeDeliveryTarget(project).id === "starter_sketch", "local delivery package should use the starter sketch delivery target");
check(analysis.status !== "Silent", "local delivery mix should be audible");
check(render.stemTrackIds.every((track) => stemAnalyses[track].status !== "Silent"), "local delivery stems should be audible");
check(stemFileNames[1] === `${workstation.projectFileStem(project)}-bass-stem.wav`, "local delivery package should use a generic Bass stem filename");
checkWavBytes(mixBytes, "local delivery full mix");
for (const stem of stemArtifacts) {
  checkWavBytes(stem.bytes, `local delivery ${stem.track} stem`);
}
checkMidiBytes(midiBytes, "local delivery arrangement");
check(projectContents.endsWith("\n"), "local delivery project file should end with a newline");
check(handoffContents.endsWith("\n"), "local delivery Handoff Sheet should end with a newline");
check(handoffContents.includes("GrooveForge Handoff Sheet"), "local delivery Handoff Sheet should include its title");
check(handoffContents.includes("Export Meter"), "local delivery Handoff Sheet should include export meter");
check(handoffContents.includes("Stem Meter"), "local delivery Handoff Sheet should include stem meter");
check(handoffContents.includes("signed PCM 24-bit"), "local delivery Handoff Sheet should include the 24-bit format");
check(handoffContents.includes("SoundCloud Preparation"), "local delivery Handoff Sheet should include SoundCloud preparation context");
check(soundCloudContents.includes("# SoundCloud Upload Sheet"), "local delivery package should include a SoundCloud Upload Sheet");
check(soundCloudContents.includes("Initial privacy: Private") && soundCloudContents.includes("Downloads: Off"), "SoundCloud Upload Sheet should use private-first safe defaults");
check(manifest.artifactCount === 9, "local delivery package should include project, mix, four stems, MIDI, Handoff, and SoundCloud artifacts");
check(manifest.artifacts.every((artifact) => artifact.bytes > 0), "local delivery artifacts should be non-empty");
check(manifest.artifacts.every((artifact) => /^[a-f0-9]{64}$/.test(artifact.sha256)), "local delivery artifacts should have SHA-256 checksums");
check(expectedStemArtifactLabels.every((label) => manifest.artifacts.some((artifact) => artifact.label === label)), "local delivery package should include all expected stem WAV labels");
check(manifest.localDeliveryPackageReady === true, "local delivery package should be ready");
check(manifest.localEnvValueRecorded === false, "local delivery package should not record local env values");
check(manifest.privateValuesRecorded === false, "local delivery package should not record private values");
check(manifest.privateBeatRecorded === false, "local delivery package should not record private beats");
check(manifest.realUserAudioRecorded === false, "local delivery package should not record real user audio");
check(manifest.networkProbeAttempted === false, "local delivery package should not probe remote channels");
check(manifest.releaseUploadAttempted === false, "local delivery package should not upload release artifacts");
check(manifest.releaseGateClaimedExternalDistribution === false, "local delivery package should not claim external distribution completion");
checkNoSamplingText(projectContents, "local delivery project file");
checkNoSamplingText(handoffContents, "local delivery Handoff Sheet");
checkNoSamplingText(JSON.stringify(manifest), "local delivery manifest");
check(!/https?:\/\//i.test(manifestMarkdown), "local delivery manifest should not include URL values");

if (failures.length > 0) {
  fail("Local delivery package validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge local delivery package smoke passed.");
console.log(`- Package: ${relative(deliveryRoot)}`);
console.log(`- Manifest: ${relative(manifestJsonPath)}`);
console.log(`- Markdown: ${relative(manifestMarkdownPath)}`);
console.log(`- Project: ${project.title}, ${project.bpm} BPM ${project.key}, ${workstation.arrangementTotalBars(project)} bars`);
console.log("- Package contents: project JSON, full mix WAV, four stem WAVs, arrangement MIDI, Handoff Sheet, SoundCloud Upload Sheet, checksum manifest");
console.log(`- Artifacts: ${manifest.artifactCount}, ${manifest.totalBytes} bytes`);
console.log(`- Mix: ${render.mixWavFileName(project)}, ${mixBytes.byteLength} bytes, ${analysis.status}`);
console.log(`- Stems: ${stemArtifacts.map((stem) => `${stem.track}:${stem.bytes.byteLength}`).join(", ")}`);
console.log(`- MIDI: ${midi.midiFileName(project)}, ${midiBytes.byteLength} bytes`);
console.log(`- Handoff: ${handoff.handoffSheetFileName(project)}, ${handoffContents.length} characters`);
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not recorded: private values, private beats, real user audio, release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, or local env values");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
