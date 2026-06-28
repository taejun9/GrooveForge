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
const deliveryRoot = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-local-delivery-package`);
const manifestJsonPath = path.join(deliveryRoot, `${appName}-${packageJson.version}-${platformArch}-local-delivery-package-manifest.json`);
const reopenJsonPath = path.join(deliveryRoot, `${appName}-${packageJson.version}-${platformArch}-local-package-reopen.json`);
const reopenMarkdownPath = path.join(deliveryRoot, `${appName}-${packageJson.version}-${platformArch}-local-package-reopen.md`);
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

const workstation = await import("../../src/domain/workstation.ts");
const render = await import("../../src/audio/render.ts");
const midi = await import("../../src/audio/midi.ts");
const handoff = await import("../../src/audio/handoff.ts");

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge local package reopen smoke failed:");
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
  check(bytes.byteLength > 44, `${label} WAV should include audio data`);
  check(ascii(bytes, 0, 4) === "RIFF", `${label} WAV missing RIFF header`);
  check(ascii(bytes, 8, 4) === "WAVE", `${label} WAV missing WAVE header`);
  check(ascii(bytes, 12, 4) === "fmt ", `${label} WAV missing fmt chunk`);
  check(ascii(bytes, 36, 4) === "data", `${label} WAV missing data chunk`);
}

function checkMidiBytes(bytes, label) {
  check(bytes.byteLength > 128, `${label} MIDI should include arrangement events`);
  check(ascii(bytes, 0, 4) === "MThd", `${label} MIDI missing MThd header`);
}

function resolveArtifactPath(artifact) {
  const filePath = path.resolve(root, artifact.path);
  const deliveryRootWithSep = `${deliveryRoot}${path.sep}`;
  check(filePath === deliveryRoot || filePath.startsWith(deliveryRootWithSep), `${artifact.label} should stay inside the local delivery package`);
  return filePath;
}

async function readArtifact(artifact) {
  const filePath = resolveArtifactPath(artifact);
  const bytes = await readFile(filePath);
  const fileStat = await stat(filePath);
  const digest = sha256(bytes);
  check(fileStat.size === artifact.bytes, `${artifact.label} byte size should match manifest`);
  check(bytes.byteLength === artifact.bytes, `${artifact.label} read size should match manifest`);
  check(digest === artifact.sha256, `${artifact.label} SHA-256 should match manifest`);
  return { ...artifact, filePath, bytes, digest };
}

function artifactByLabel(artifacts, label) {
  const artifact = artifacts.find((candidate) => candidate.label === label);
  if (!artifact) {
    failures.push(`local package manifest should include ${label}`);
    return null;
  }
  return artifact;
}

function closeNumber(actual, expected, tolerance, label) {
  check(Math.abs(actual - expected) <= tolerance, `${label} should match within ${tolerance}`);
}

function buildReport(manifest, project, artifacts, generated) {
  const target = workstation.activeDeliveryTarget(project);
  return {
    appName,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    packageRoot: relative(deliveryRoot),
    sourceManifestPath: relative(manifestJsonPath),
    productScope: "sample-free local package reopen from editable GrooveForge events",
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
    sourceArtifactCount: manifest.artifactCount,
    verifiedArtifactCount: artifacts.length,
    verifiedTotalBytes: artifacts.reduce((total, artifact) => total + artifact.bytes.byteLength, 0),
    mixAnalysis: generated.mixAnalysis,
    stemAnalyses: generated.stemAnalyses,
    regenerated: {
      mixWavSha256: generated.mixWavSha256,
      stemWavSha256: generated.stemWavSha256,
      midiSha256: generated.midiSha256,
      handoffSha256: generated.handoffSha256
    },
    projectRoundtripReady: true,
    diskChecksumsReady: true,
    regeneratedExportsMatchDisk: true,
    localPackageReopenReady: true,
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

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Local Package Reopen

## Status

- Local package reopen ready: ${report.localPackageReopenReady ? "yes" : "no"}
- Product scope: ${report.productScope}
- Source manifest: \`${report.sourceManifestPath}\`
- Project: ${report.project.title}
- Style: ${report.project.styleId}
- BPM/key: ${report.project.bpm} / ${report.project.key}
- Arrangement: ${report.project.arrangementBars} bars
- Delivery target: ${report.project.deliveryTarget}
- Source artifacts: ${report.sourceArtifactCount}
- Verified artifacts: ${report.verifiedArtifactCount}
- Verified bytes: ${report.verifiedTotalBytes}

## Reopen Checks

- Project roundtrip ready: ${report.projectRoundtripReady ? "yes" : "no"}
- Disk checksums ready: ${report.diskChecksumsReady ? "yes" : "no"}
- Regenerated exports match disk: ${report.regeneratedExportsMatchDisk ? "yes" : "no"}
- Mix status: ${report.mixAnalysis.status}
- Mix duration: ${report.mixAnalysis.durationSeconds.toFixed(2)}s
- Mix SHA-256: \`${report.regenerated.mixWavSha256.slice(0, 16)}...\`
- MIDI SHA-256: \`${report.regenerated.midiSha256.slice(0, 16)}...\`
- Handoff SHA-256: \`${report.regenerated.handoffSha256.slice(0, 16)}...\`

## Not Recorded

Private values, private beats, real user audio, release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, and local env values are not recorded.

## Not Claimed

This reopen smoke does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

if (!existsSync(manifestJsonPath)) {
  fail("Local delivery package manifest is missing.", `Run npm run desktop:local-delivery-package-smoke before npm run desktop:local-package-reopen-smoke.\nMissing: ${relative(manifestJsonPath)}`);
}

const manifest = JSON.parse(await readFile(manifestJsonPath, "utf8"));
check(manifest.localDeliveryPackageReady === true, "source local delivery package should be ready");
check(manifest.artifactCount === 8, "source local delivery package should include 8 deliverable artifacts");
check(manifest.packageRoot === relative(deliveryRoot), "source manifest should point at the current local delivery package root");
check(expectedArtifactLabels.every((label) => manifest.artifacts?.some((artifact) => artifact.label === label)), "source manifest should include every expected local delivery artifact");
check(manifest.privateValuesRecorded === false, "source manifest should not record private values");
check(manifest.privateBeatRecorded === false, "source manifest should not record private beats");
check(manifest.realUserAudioRecorded === false, "source manifest should not record real user audio");
check(manifest.networkProbeAttempted === false, "source manifest should not probe remote channels");
check(manifest.releaseUploadAttempted === false, "source manifest should not upload release artifacts");
check(manifest.releaseGateClaimedExternalDistribution === false, "source manifest should not claim external distribution completion");

const artifactReads = [];
for (const artifact of manifest.artifacts ?? []) {
  artifactReads.push(await readArtifact(artifact));
}

const projectArtifact = artifactByLabel(artifactReads, "Project file");
const mixArtifact = artifactByLabel(artifactReads, "Full mix WAV");
const midiArtifact = artifactByLabel(artifactReads, "Arrangement MIDI");
const handoffArtifact = artifactByLabel(artifactReads, "Handoff Sheet");

if (!projectArtifact || !mixArtifact || !midiArtifact || !handoffArtifact) {
  fail("Local package manifest is missing required artifacts.", failures.map((failure) => `- ${failure}`).join("\n"));
}

const projectContents = projectArtifact.bytes.toString("utf8");
const reopenedProject = workstation.parseProjectFile(projectContents);
const reserializedProject = workstation.serializeProjectFile(reopenedProject);
const reparsedProject = workstation.parseProjectFile(reserializedProject);
const handoffContents = handoffArtifact.bytes.toString("utf8");
const regeneratedMixBytes = await blobToBuffer(render.createMixWavBlob(reopenedProject));
const regeneratedStemBytes = {};
const regeneratedStemHashes = {};
const stemFileNames = render.stemWavFileNames(reopenedProject);
const regeneratedMidiBytes = Buffer.from(midi.createMidiFile(reopenedProject));
const mixAnalysis = render.analyzeExport(reopenedProject);
const stemAnalyses = render.analyzeStemExports(reopenedProject);
const regeneratedHandoff = handoff.createHandoffSheet(reopenedProject, mixAnalysis, stemAnalyses);

check(reparsedProject.title === reopenedProject.title, "reopened project should survive a second serialize/parse roundtrip");
check(reopenedProject.title === manifest.project.title, "reopened project title should match manifest");
check(reopenedProject.styleId === manifest.project.styleId, "reopened project style should match manifest");
check(reopenedProject.bpm === manifest.project.bpm, "reopened project BPM should match manifest");
check(reopenedProject.key === manifest.project.key, "reopened project key should match manifest");
check(reopenedProject.mode === manifest.project.mode, "reopened project mode should match manifest");
check(workstation.arrangementTotalBars(reopenedProject) === 8, "reopened project should preserve the sample-free 8-bar target");
check(workstation.arrangementTotalBars(reopenedProject) === manifest.project.arrangementBars, "reopened arrangement bars should match manifest");
check(workstation.activeDeliveryTarget(reopenedProject).name === manifest.project.deliveryTarget, "reopened delivery target should match manifest");
check(workstation.projectFileName(reopenedProject) === path.basename(projectArtifact.filePath), "reopened project filename should match package artifact");
check(render.mixWavFileName(reopenedProject) === path.basename(mixArtifact.filePath), "reopened mix filename should match package artifact");
check(midi.midiFileName(reopenedProject) === path.basename(midiArtifact.filePath), "reopened MIDI filename should match package artifact");
check(handoff.handoffSheetFileName(reopenedProject) === path.basename(handoffArtifact.filePath), "reopened Handoff filename should match package artifact");
check(mixAnalysis.status !== "Silent", "reopened project mix should be audible");
check(render.stemTrackIds.every((track) => stemAnalyses[track].status !== "Silent"), "reopened project stems should be audible");
closeNumber(mixAnalysis.durationSeconds, manifest.mixAnalysis.durationSeconds, 0.01, "reopened mix duration");
checkWavBytes(mixArtifact.bytes, "disk full mix");
checkWavBytes(regeneratedMixBytes, "regenerated full mix");
check(sha256(regeneratedMixBytes) === mixArtifact.sha256, "regenerated full mix WAV should match disk artifact");

for (const [index, track] of render.stemTrackIds.entries()) {
  const label = `${render.stemTrackLabel(track)} stem WAV`;
  const artifact = artifactByLabel(artifactReads, label);
  if (!artifact) {
    continue;
  }
  const stemBytes = await blobToBuffer(render.createStemWavBlob(reopenedProject, track));
  regeneratedStemBytes[track] = stemBytes;
  regeneratedStemHashes[track] = sha256(stemBytes);
  check(path.basename(artifact.filePath) === stemFileNames[index], `reopened ${track} stem filename should match package artifact`);
  checkWavBytes(artifact.bytes, `disk ${track} stem`);
  checkWavBytes(stemBytes, `regenerated ${track} stem`);
  check(regeneratedStemHashes[track] === artifact.sha256, `regenerated ${track} stem WAV should match disk artifact`);
  check(artifact.bytes.byteLength === stemBytes.byteLength, `regenerated ${track} stem byte size should match disk artifact`);
}

checkMidiBytes(midiArtifact.bytes, "disk arrangement");
checkMidiBytes(regeneratedMidiBytes, "regenerated arrangement");
check(sha256(regeneratedMidiBytes) === midiArtifact.sha256, "regenerated MIDI should match disk artifact");
check(handoffContents.endsWith("\n"), "disk Handoff Sheet should end with a newline");
check(regeneratedHandoff.endsWith("\n"), "regenerated Handoff Sheet should end with a newline");
check(handoffContents === regeneratedHandoff, "regenerated Handoff Sheet should match disk artifact");
check(handoffContents.includes("GrooveForge Handoff Sheet"), "reopened Handoff Sheet should include its title");
check(handoffContents.includes("Project"), "reopened Handoff Sheet should include project section");
check(handoffContents.includes("Delivery Target"), "reopened Handoff Sheet should include delivery target section");
check(handoffContents.includes("Session Brief"), "reopened Handoff Sheet should include session brief section");
check(handoffContents.includes("Arrangement Blocks"), "reopened Handoff Sheet should include arrangement blocks section");
check(handoffContents.includes("Export Meter"), "reopened Handoff Sheet should include export meter section");
check(handoffContents.includes("Stem Meter"), "reopened Handoff Sheet should include stem meter section");
checkNoSamplingText(projectContents, "reopened project file");
checkNoSamplingText(handoffContents, "reopened Handoff Sheet");
checkNoSamplingText(JSON.stringify(manifest), "source manifest");

const report = buildReport(manifest, reopenedProject, artifactReads, {
  mixAnalysis,
  stemAnalyses,
  mixWavSha256: sha256(regeneratedMixBytes),
  stemWavSha256: regeneratedStemHashes,
  midiSha256: sha256(regeneratedMidiBytes),
  handoffSha256: sha256(Buffer.from(regeneratedHandoff, "utf8"))
});
const reportMarkdown = buildMarkdown(report);
check(report.localPackageReopenReady === true, "local package reopen report should be ready");
check(report.projectRoundtripReady === true, "local package reopen report should mark project roundtrip ready");
check(report.diskChecksumsReady === true, "local package reopen report should mark disk checksums ready");
check(report.regeneratedExportsMatchDisk === true, "local package reopen report should mark regenerated exports matching disk");
check(report.localEnvValueRecorded === false, "local package reopen report should not record local env values");
check(report.privateValuesRecorded === false, "local package reopen report should not record private values");
check(report.privateBeatRecorded === false, "local package reopen report should not record private beats");
check(report.realUserAudioRecorded === false, "local package reopen report should not record real user audio");
check(report.networkProbeAttempted === false, "local package reopen report should not probe remote channels");
check(report.releaseUploadAttempted === false, "local package reopen report should not upload release artifacts");
check(report.releaseGateClaimedExternalDistribution === false, "local package reopen report should not claim external distribution completion");
check(!/https?:\/\//i.test(reportMarkdown), "local package reopen report should not include URL values");

if (failures.length > 0) {
  fail("Local package reopen validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

await mkdir(deliveryRoot, { recursive: true });
await writeFile(reopenJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
await writeFile(reopenMarkdownPath, reportMarkdown, "utf8");

console.log("GrooveForge local package reopen smoke passed.");
console.log(`- Source manifest: ${relative(manifestJsonPath)}`);
console.log(`- Reopen JSON: ${relative(reopenJsonPath)}`);
console.log(`- Reopen Markdown: ${relative(reopenMarkdownPath)}`);
console.log(`- Project: ${reopenedProject.title}, ${reopenedProject.bpm} BPM ${reopenedProject.key}, ${workstation.arrangementTotalBars(reopenedProject)} bars`);
console.log(`- Verified artifacts: ${report.verifiedArtifactCount}/${report.sourceArtifactCount}, ${report.verifiedTotalBytes} bytes`);
console.log(`- Regenerated: mix WAV, four stem WAVs, arrangement MIDI, and Handoff Sheet match disk artifacts`);
console.log(`- Mix: ${render.mixWavFileName(reopenedProject)}, ${regeneratedMixBytes.byteLength} bytes, ${mixAnalysis.status}`);
console.log(`- Stems: ${render.stemTrackIds.map((track) => `${track}:${regeneratedStemBytes[track].byteLength}`).join(", ")}`);
console.log(`- MIDI: ${midi.midiFileName(reopenedProject)}, ${regeneratedMidiBytes.byteLength} bytes`);
console.log(`- Handoff: ${handoff.handoffSheetFileName(reopenedProject)}, ${regeneratedHandoff.length} characters`);
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not recorded: private values, private beats, real user audio, release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, or local env values");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
