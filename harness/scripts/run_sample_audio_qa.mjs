#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const outputRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`, `${appName}-${packageJson.version}-${platformArch}-sample-audio-qa`);
const reportJsonPath = path.join(outputRoot, "sample-audio-qa-report.json");
const reportMarkdownPath = path.join(outputRoot, "sample-audio-qa-report.md");
const failures = [];

const workstation = await import("../../src/domain/workstation.ts");
const render = await import("../../src/audio/render.ts");
const handoff = await import("../../src/audio/handoff.ts");
const midi = await import("../../src/audio/midi.ts");
const deliveryBundle = await import("../../src/audio/deliveryBundle.ts");

function check(condition, message) {
  if (!condition) failures.push(message);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function db(amplitude) {
  return amplitude > 0 ? 20 * Math.log10(amplitude) : Number.NEGATIVE_INFINITY;
}

function round(value, digits = 4) {
  return Number.isFinite(value) ? Number(value.toFixed(digits)) : value;
}

async function blobToBuffer(blob) {
  return Buffer.from(await blob.arrayBuffer());
}

function readInt24Le(bytes, offset) {
  const unsigned = bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
  return unsigned & 0x800000 ? unsigned - 0x1000000 : unsigned;
}

function parseCanonicalPcmWav(bytes, label, musicalDurationSeconds) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (start, length) => bytes.subarray(start, start + length).toString("ascii");

  check(bytes.byteLength >= 44, `${label}: WAV must have a 44-byte canonical header`);
  check(ascii(0, 4) === "RIFF", `${label}: missing RIFF marker`);
  check(view.getUint32(4, true) === bytes.byteLength - 8, `${label}: RIFF size does not match file length`);
  check(ascii(8, 4) === "WAVE", `${label}: missing WAVE marker`);
  check(ascii(12, 4) === "fmt ", `${label}: missing fmt chunk`);
  check(view.getUint32(16, true) === 16, `${label}: fmt chunk must be canonical PCM size 16`);

  const audioFormat = view.getUint16(20, true);
  const channels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const byteRate = view.getUint32(28, true);
  const blockAlign = view.getUint16(32, true);
  const bitsPerSample = view.getUint16(34, true);
  const dataSize = view.getUint32(40, true);

  check(audioFormat === 1, `${label}: audio format must be integer PCM (1)`);
  check(channels === 2, `${label}: channel count must be stereo (2)`);
  check(sampleRate === 44100, `${label}: sample rate must be 44100 Hz`);
  check(byteRate === 264600, `${label}: byte rate must be 264600`);
  check(blockAlign === 6, `${label}: block alignment must be 6 bytes`);
  check(bitsPerSample === 24, `${label}: samples must be 24-bit`);
  check(ascii(36, 4) === "data", `${label}: missing data chunk`);
  check(dataSize === bytes.byteLength - 44, `${label}: data size does not match file length`);
  check(dataSize % blockAlign === 0, `${label}: data size must contain complete stereo frames`);

  let peak = 0;
  let squareSum = 0;
  let nonZeroSamples = 0;
  let fullScaleSamples = 0;
  let postBoundaryNonZeroSamples = 0;
  let postBoundaryPeak = 0;
  let lowerByteActiveSamples = 0;
  let firstNonZeroFrame = null;
  const channelNonZeroSamples = Array.from({ length: channels }, () => 0);
  const bytesPerSample = bitsPerSample / 8;
  const sampleCount = Math.floor(dataSize / bytesPerSample);
  const frames = dataSize / blockAlign;
  const musicalBoundaryFrame = Math.max(0, Math.min(frames, Math.round(musicalDurationSeconds * sampleRate)));
  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    const sampleOffset = 44 + sampleIndex * bytesPerSample;
    const raw = readInt24Le(bytes, sampleOffset);
    const normalized = raw < 0 ? raw / 8388608 : raw / 8388607;
    const absolute = Math.abs(normalized);
    peak = Math.max(peak, absolute);
    squareSum += normalized * normalized;
    if (raw !== 0) {
      nonZeroSamples += 1;
      if (bytes[sampleOffset] !== 0) lowerByteActiveSamples += 1;
      channelNonZeroSamples[sampleIndex % channels] += 1;
      if (firstNonZeroFrame === null) firstNonZeroFrame = Math.floor(sampleIndex / channels);
    }
    if (Math.floor(sampleIndex / channels) >= musicalBoundaryFrame) {
      if (raw !== 0) postBoundaryNonZeroSamples += 1;
      postBoundaryPeak = Math.max(postBoundaryPeak, absolute);
    }
    if (raw === -8388608 || raw === 8388607) fullScaleSamples += 1;
  }

  const rms = sampleCount > 0 ? Math.sqrt(squareSum / sampleCount) : 0;
  let finalFramePeak = 0;
  for (let channel = 0; channel < channels && frames > 0; channel += 1) {
    const raw = readInt24Le(bytes, 44 + ((frames - 1) * channels + channel) * bytesPerSample);
    const normalized = raw < 0 ? raw / 8388608 : raw / 8388607;
    finalFramePeak = Math.max(finalFramePeak, Math.abs(normalized));
  }
  return {
    audioFormat, channels, sampleRate, byteRate, blockAlign, bitsPerSample, dataSize, frames,
    durationSeconds: frames / sampleRate,
    peakDb: db(peak),
    rmsDb: db(rms),
    nonZeroSamples,
    nonZeroPercent: sampleCount > 0 ? (nonZeroSamples / sampleCount) * 100 : 0,
    lowerByteActiveSamples,
    lowerByteActivePercent: nonZeroSamples > 0 ? (lowerByteActiveSamples / nonZeroSamples) * 100 : 0,
    channelNonZeroSamples,
    fullScaleSamples,
    musicalDurationSeconds,
    tailDurationSeconds: frames / sampleRate - musicalDurationSeconds,
    postBoundaryNonZeroSamples,
    postBoundaryPeak,
    firstNonZeroFrame,
    finalFramePeak
  };
}

function validateDecodedAudio(decoded, analysis, expectedTailDurationSeconds, requireTailContent, label) {
  const durationTolerance = 1 / decoded.sampleRate + Number.EPSILON;
  check(Math.abs(decoded.durationSeconds - analysis.durationSeconds) <= durationTolerance, `${label}: decoded duration must match renderer analysis within one frame`);
  check(Math.abs(decoded.tailDurationSeconds - expectedTailDurationSeconds) <= durationTolerance, `${label}: decoded WAV must preserve the expected export tail within one frame`);
  check(decoded.nonZeroSamples > 0, `${label}: decoded PCM must not be silent`);
  check(decoded.nonZeroPercent >= 0.01, `${label}: decoded PCM nonzero population is unexpectedly sparse`);
  check(decoded.lowerByteActivePercent >= 50, `${label}: 24-bit lower byte activity is too low and may be zero-padded 16-bit audio`);
  check(decoded.channelNonZeroSamples.every((count) => count > 0), `${label}: both stereo channels must contain audio`);
  check(Number.isFinite(decoded.peakDb), `${label}: decoded peak must be finite`);
  check(Number.isFinite(decoded.rmsDb), `${label}: decoded RMS must be finite`);
  check(Math.abs(decoded.peakDb - analysis.peakDb) <= 0.02, `${label}: decoded peak disagrees with renderer analysis`);
  check(Math.abs(decoded.rmsDb - analysis.rmsDb) <= 0.02, `${label}: decoded RMS disagrees with renderer analysis`);
  check(decoded.peakDb <= analysis.ceilingDb + 0.02, `${label}: decoded peak exceeds the configured ceiling`);
  check(decoded.fullScaleSamples === 0, `${label}: decoded PCM contains digital full-scale samples`);
  check(decoded.finalFramePeak === 0, `${label}: terminal fade must end at digital zero`);
  if (requireTailContent) {
    check(decoded.postBoundaryNonZeroSamples > 0, `${label}: full mix must preserve audible event or Space-return content after the musical boundary`);
  }
}

async function renderArtifact({ blobFactory, analysis, fileName, label, caseRoot, project, requireTailContent = false }) {
  const firstBytes = await blobToBuffer(blobFactory());
  const secondBytes = await blobToBuffer(blobFactory());
  const deterministic = firstBytes.equals(secondBytes);
  check(deterministic, `${label}: immediate rerender must be byte-identical`);
  const musicalDurationSeconds = workstation.arrangementTotalBars(project) * 16 * workstation.projectStepDurationSeconds(project);
  const expectedTailDurationSeconds = render.exportTailDurationSeconds(project);
  const decoded = parseCanonicalPcmWav(firstBytes, label, musicalDurationSeconds);
  validateDecodedAudio(decoded, analysis, expectedTailDurationSeconds, requireTailContent, label);
  const filePath = path.join(caseRoot, fileName);
  await writeFile(filePath, firstBytes);
  return {
    label, path: relative(filePath), bytes: firstBytes.byteLength, sha256: sha256(firstBytes), deterministic,
    decoded: {
      ...decoded,
      durationSeconds: round(decoded.durationSeconds), musicalDurationSeconds: round(decoded.musicalDurationSeconds),
      tailDurationSeconds: round(decoded.tailDurationSeconds), peakDb: round(decoded.peakDb), rmsDb: round(decoded.rmsDb),
      nonZeroPercent: round(decoded.nonZeroPercent), lowerByteActivePercent: round(decoded.lowerByteActivePercent), postBoundaryPeak: round(decoded.postBoundaryPeak), finalFramePeak: round(decoded.finalFramePeak)
    },
    rendererAnalysis: {
      ...analysis,
      durationSeconds: round(analysis.durationSeconds), peakDb: round(analysis.peakDb), rmsDb: round(analysis.rmsDb),
      headroomDb: round(analysis.headroomDb), ceilingDb: round(analysis.ceilingDb), limitedPercent: round(analysis.limitedPercent)
    }
  };
}

function buildCases() {
  return [
    {
      id: "beginner-guided-lofi", audience: "first-time composer",
      expected: { mode: "guided", styleId: "lofi", bpm: 86, bars: 8 },
      project: { ...workstation.createAudienceStarterProject("beginner"), title: "GrooveForge Beginner Sample Beat", snapshots: [] }
    },
    {
      id: "professional-studio-house", audience: "professional producer",
      expected: { mode: "studio", styleId: "house", bpm: 124, bars: 26 },
      project: { ...workstation.createAudienceStarterProject("producer"), title: "GrooveForge Professional Sample Beat", snapshots: [] }
    }
  ];
}

function styleMatrixProject(profile) {
  const key = "F minor";
  return {
    ...workstation.starterProject,
    title: `GrooveForge ${profile.name} Style Sample`,
    bpm: profile.defaultBpm,
    key,
    styleId: profile.id,
    selectedPattern: "A",
    swing: profile.defaultSwing,
    sound: workstation.soundPresetDesign(workstation.styleSoundPreset(profile.id)),
    patterns: workstation.createStylePatternSet(profile.id, key),
    arrangement: workstation.createPatternChain("eight_bar"),
    mixer: workstation.starterProject.mixer.map((channel) => ({ ...channel, muted: false, solo: false })),
    snapshots: []
  };
}

async function runStyleMatrixCase(profile) {
  const project = styleMatrixProject(profile);
  const caseRoot = path.join(outputRoot, "style-matrix", profile.id);
  await mkdir(caseRoot, { recursive: true });
  check(project.styleId === profile.id, `style-matrix:${profile.id}: style id must match`);
  check(project.bpm === profile.defaultBpm, `style-matrix:${profile.id}: BPM must match the style default`);
  check(workstation.arrangementTotalBars(project) === 8, `style-matrix:${profile.id}: arrangement must be 8 bars`);
  const artifact = await renderArtifact({
    blobFactory: () => render.createMixWavBlob(project),
    analysis: render.analyzeExport(project),
    fileName: render.mixWavFileName(project),
    label: `style-matrix:${profile.id} full mix`,
    caseRoot,
    project,
    requireTailContent: true
  });
  return {
    id: profile.id,
    name: profile.name,
    project: { title: project.title, bpm: project.bpm, key: project.key, bars: workstation.arrangementTotalBars(project) },
    artifact
  };
}

async function runUnicodeFileIdentityCase({ id, title, expectedStem, styleId }) {
  const profile = workstation.styleProfiles.find((candidate) => candidate.id === styleId);
  check(Boolean(profile), `unicode-file-identity:${id}: style ${styleId} must exist`);
  const project = { ...styleMatrixProject(profile ?? workstation.styleProfiles[0]), title };
  const fileStem = workstation.projectFileStem(project);
  const fileName = render.mixWavFileName(project);
  const caseRoot = path.join(outputRoot, "unicode-file-identity", fileStem);
  await mkdir(caseRoot, { recursive: true });
  check(fileStem === expectedStem, `unicode-file-identity:${id}: expected file stem ${expectedStem}, got ${fileStem}`);
  check(fileName === `${expectedStem}-demo.wav`, `unicode-file-identity:${id}: WAV filename must preserve the shared project stem`);
  check(!/[\\/\u0000-\u001f\u007f]/u.test(fileName), `unicode-file-identity:${id}: WAV filename must not contain separators or control characters`);
  const artifact = await renderArtifact({
    blobFactory: () => render.createMixWavBlob(project),
    analysis: render.analyzeExport(project),
    fileName,
    label: `unicode-file-identity:${id} full mix`,
    caseRoot,
    project,
    requireTailContent: true
  });
  return {
    id,
    title,
    fileStem,
    project: { styleId: project.styleId, bpm: project.bpm, key: project.key, bars: workstation.arrangementTotalBars(project) },
    artifact
  };
}

async function runProjectTitleIntegrityCase() {
  const rawTitle = "  서울\n야간\t비트\u0000  ";
  const expectedTitle = "서울 야간 비트";
  const sourceProject = { ...styleMatrixProject(workstation.styleProfiles.find((profile) => profile.id === "lofi") ?? workstation.styleProfiles[0]), title: rawTitle };
  const importedProject = workstation.parseProjectFile(JSON.stringify({
    app: "GrooveForge",
    fileVersion: workstation.projectFileVersion,
    savedAt: "2026-07-15T00:00:00.000Z",
    project: sourceProject
  }));
  const fileStem = workstation.projectFileStem(importedProject);
  const fileName = render.mixWavFileName(importedProject);
  const caseRoot = path.join(outputRoot, "project-title-integrity", fileStem);
  await mkdir(caseRoot, { recursive: true });
  check(importedProject.title === expectedTitle, "project-title-integrity: malformed imported title must normalize before rendering");
  check(fileStem === "서울-야간-비트", "project-title-integrity: normalized imported title must own the shared filename stem");
  check(fileName === "서울-야간-비트-demo.wav", "project-title-integrity: real WAV must use the normalized Korean title filename");
  check(!/[\/\u0000-\u001f\u007f]/u.test(fileName), "project-title-integrity: WAV filename must not contain separators or control characters");
  const artifact = await renderArtifact({
    blobFactory: () => render.createMixWavBlob(importedProject),
    analysis: render.analyzeExport(importedProject),
    fileName,
    label: "project-title-integrity:malformed-import full mix",
    caseRoot,
    project: importedProject,
    requireTailContent: true
  });
  return {
    rawTitleEscaped: JSON.stringify(rawTitle),
    normalizedTitle: importedProject.title,
    fileStem,
    project: {
      styleId: importedProject.styleId,
      bpm: importedProject.bpm,
      key: importedProject.key,
      bars: workstation.arrangementTotalBars(importedProject)
    },
    artifact
  };
}

async function runProjectImportSafetyCase() {
  const profile = workstation.styleProfiles.find((candidate) => candidate.id === "lofi") ?? workstation.styleProfiles[0];
  const sourceProject = {
    ...styleMatrixProject(profile),
    title: "복구된 프로젝트",
    bpm: 400,
    key: "Unsupported future key",
    swing: -4,
    masterCeilingDb: -900,
    mixer: workstation.starterProject.mixer.map((channel, index) => ({
      ...channel,
      volumeDb: index === 0 ? 900 : index === 1 ? -900 : channel.id === "master" ? 900 : channel.volumeDb,
      pan: index === 2 ? 900 : index === 3 ? -900 : channel.pan
    }))
  };
  const importedProject = workstation.parseProjectFile(JSON.stringify({
    app: "GrooveForge",
    fileVersion: workstation.projectFileVersion,
    savedAt: "2026-07-15T00:00:00.000Z",
    project: sourceProject
  }));
  const fileStem = workstation.projectFileStem(importedProject);
  const fileName = render.mixWavFileName(importedProject);
  const caseRoot = path.join(outputRoot, "project-import-safety", fileStem);
  await mkdir(caseRoot, { recursive: true });

  check(importedProject.bpm === workstation.maxProjectBpm, "project-import-safety: imported BPM must clamp to 220 before rendering");
  check(importedProject.key === "A minor", "project-import-safety: unsupported key must recover before rendering");
  check(importedProject.swing === workstation.minProjectSwing, "project-import-safety: imported swing must clamp to zero before rendering");
  check(importedProject.masterCeilingDb === workstation.minMasterCeilingDb, "project-import-safety: imported ceiling must clamp to -6 dB before rendering");
  check(importedProject.mixer[0]?.volumeDb === workstation.maxMixerVolumeDb, "project-import-safety: imported hot channel must clamp before rendering");
  check(importedProject.mixer[1]?.volumeDb === workstation.minMixerVolumeDb, "project-import-safety: imported low channel must clamp before rendering");
  check(importedProject.mixer[2]?.pan === workstation.maxMixerPan, "project-import-safety: imported right pan must clamp before rendering");
  check(importedProject.mixer[3]?.pan === workstation.minMixerPan, "project-import-safety: imported left pan must clamp before rendering");
  check(workstation.projectStepDurationSeconds(importedProject) > 0, "project-import-safety: repaired project must have positive render timing");
  check(fileName === "복구된-프로젝트-demo.wav", "project-import-safety: repaired project must preserve its Korean filename identity");

  const artifact = await renderArtifact({
    blobFactory: () => render.createMixWavBlob(importedProject),
    analysis: render.analyzeExport(importedProject),
    fileName,
    label: "project-import-safety:repaired-import full mix",
    caseRoot,
    project: importedProject,
    requireTailContent: true
  });
  return {
    source: { bpm: sourceProject.bpm, key: sourceProject.key, swing: sourceProject.swing, masterCeilingDb: sourceProject.masterCeilingDb },
    repaired: {
      title: importedProject.title,
      bpm: importedProject.bpm,
      key: importedProject.key,
      swing: importedProject.swing,
      masterCeilingDb: importedProject.masterCeilingDb,
      drumVolumeDb: importedProject.mixer[0]?.volumeDb,
      bassVolumeDb: importedProject.mixer[1]?.volumeDb,
      synthPan: importedProject.mixer[2]?.pan,
      chordPan: importedProject.mixer[3]?.pan
    },
    fileStem,
    artifact
  };
}

async function runProjectPitchSafetyCase() {
  const profile = workstation.styleProfiles.find((candidate) => candidate.id === "rnb") ?? workstation.styleProfiles[0];
  const sourceProject = {
    ...styleMatrixProject(profile),
    title: "음정 복구 비트"
  };
  for (const pattern of Object.values(sourceProject.patterns)) {
    if (pattern.bassNotes[0]) pattern.bassNotes[0].pitch = "C-999999";
    if (pattern.melodyNotes[0]) pattern.melodyNotes[0].pitch = "C999999";
  }
  const importedProject = workstation.parseProjectFile(JSON.stringify({
    app: "GrooveForge",
    fileVersion: workstation.projectFileVersion,
    savedAt: "2026-07-16T00:00:00.000Z",
    project: sourceProject
  }));
  const fileStem = workstation.projectFileStem(importedProject);
  const fileName = render.mixWavFileName(importedProject);
  const caseRoot = path.join(outputRoot, "pitch-boundary-safety", fileStem);
  await mkdir(caseRoot, { recursive: true });

  check(importedProject.patterns.A.bassNotes[0]?.pitch === "C-1", "project-pitch-safety: imported low pitch must clamp to C-1 before rendering");
  check(importedProject.patterns.A.melodyNotes[0]?.pitch === "G9", "project-pitch-safety: imported high pitch must clamp to G9 before rendering");
  check(workstation.projectPitchMidiNumber(importedProject.patterns.A.bassNotes[0]?.pitch) === workstation.minProjectMidiNote, "project-pitch-safety: repaired bass pitch must be MIDI zero");
  check(workstation.projectPitchMidiNumber(importedProject.patterns.A.melodyNotes[0]?.pitch) === workstation.maxProjectMidiNote, "project-pitch-safety: repaired melody pitch must be MIDI 127");
  check(Number.isFinite(workstation.noteToFrequency("C-999999")), "project-pitch-safety: low bypass frequency must stay finite");
  check(Number.isFinite(workstation.noteToFrequency("C999999")), "project-pitch-safety: high bypass frequency must stay finite");
  check(sourceProject.patterns.A.bassNotes[0]?.pitch === "C-999999", "project-pitch-safety: import must not mutate source pitch data");
  check(fileName === "음정-복구-비트-demo.wav", "project-pitch-safety: repaired project must preserve its Korean filename identity");

  const analysis = render.analyzeExport(importedProject);
  check(Number.isFinite(analysis.peakDb), "project-pitch-safety: renderer peak analysis must be finite");
  check(Number.isFinite(analysis.rmsDb), "project-pitch-safety: renderer RMS analysis must be finite");
  const artifact = await renderArtifact({
    blobFactory: () => render.createMixWavBlob(importedProject),
    analysis,
    fileName,
    label: "project-pitch-safety:repaired-pitch full mix",
    caseRoot,
    project: importedProject,
    requireTailContent: true
  });
  return {
    source: { lowPitch: sourceProject.patterns.A.bassNotes[0]?.pitch, highPitch: sourceProject.patterns.A.melodyNotes[0]?.pitch },
    repaired: {
      lowPitch: importedProject.patterns.A.bassNotes[0]?.pitch,
      highPitch: importedProject.patterns.A.melodyNotes[0]?.pitch,
      lowFrequencyHz: round(workstation.noteToFrequency("C-999999")),
      highFrequencyHz: round(workstation.noteToFrequency("C999999"))
    },
    fileStem,
    artifact
  };
}

async function runTimelineBoundarySafetyCase() {
  const profile = workstation.styleProfiles.find((candidate) => candidate.id === "k_hiphop_rnb") ?? workstation.styleProfiles[0];
  const sourceProject = {
    ...styleMatrixProject(profile),
    title: "타임라인 복구 비트"
  };
  for (const pattern of Object.values(sourceProject.patterns)) {
    if (pattern.bassNotes[0]) pattern.bassNotes[0] = { ...pattern.bassNotes[0], step: 15, length: 16 };
    if (pattern.melodyNotes[0]) pattern.melodyNotes[0] = { ...pattern.melodyNotes[0], step: 14, length: 16 };
    if (pattern.chordEvents[0]) pattern.chordEvents[0] = { ...pattern.chordEvents[0], step: 15, length: 16 };
  }
  const importedProject = workstation.parseProjectFile(JSON.stringify({
    app: "GrooveForge",
    fileVersion: workstation.projectFileVersion,
    savedAt: "2026-07-16T00:00:00.000Z",
    project: sourceProject
  }));
  const fileStem = workstation.projectFileStem(importedProject);
  const fileName = render.mixWavFileName(importedProject);
  const caseRoot = path.join(outputRoot, "timeline-boundary-safety", fileStem);
  await mkdir(caseRoot, { recursive: true });

  check(importedProject.patterns.A.bassNotes[0]?.length === 1, "timeline-boundary-safety: imported bass event must end at step 16");
  check(importedProject.patterns.A.melodyNotes[0]?.length === 2, "timeline-boundary-safety: imported melody event must end at step 16");
  check(importedProject.patterns.A.chordEvents[0]?.length === 1, "timeline-boundary-safety: imported chord event must end at step 16");
  check(Object.values(importedProject.patterns).every((pattern) => [...pattern.bassNotes, ...pattern.melodyNotes, ...pattern.chordEvents].every((event) => event.step + event.length <= workstation.stepsPerBar)), "timeline-boundary-safety: every repaired note and chord must stay inside its pattern");
  check(sourceProject.patterns.A.bassNotes[0]?.length === 16, "timeline-boundary-safety: import must not mutate source event length");
  check(fileName === "타임라인-복구-비트-demo.wav", "timeline-boundary-safety: repaired project must preserve its Korean filename identity");

  const analysis = render.analyzeExport(importedProject);
  check(Number.isFinite(analysis.peakDb), "timeline-boundary-safety: renderer peak analysis must be finite");
  check(Number.isFinite(analysis.rmsDb), "timeline-boundary-safety: renderer RMS analysis must be finite");
  const artifact = await renderArtifact({
    blobFactory: () => render.createMixWavBlob(importedProject),
    analysis,
    fileName,
    label: "timeline-boundary-safety:repaired-event-ends full mix",
    caseRoot,
    project: importedProject,
    requireTailContent: true
  });
  return {
    source: { bassLength: sourceProject.patterns.A.bassNotes[0]?.length, melodyLength: sourceProject.patterns.A.melodyNotes[0]?.length, chordLength: sourceProject.patterns.A.chordEvents[0]?.length },
    repaired: { bassLength: importedProject.patterns.A.bassNotes[0]?.length, melodyLength: importedProject.patterns.A.melodyNotes[0]?.length, chordLength: importedProject.patterns.A.chordEvents[0]?.length },
    fileStem,
    artifact
  };
}

async function runEventDensitySafetyCase() {
  const profile = workstation.styleProfiles.find((candidate) => candidate.id === "k_hiphop_rnb") ?? workstation.styleProfiles[0];
  const sourceProject = {
    ...styleMatrixProject(profile),
    title: "이벤트 밀도 복구 비트"
  };
  const duplicateCount = 256;
  for (const pattern of Object.values(sourceProject.patterns)) {
    const bassSeed = pattern.bassNotes[0];
    const melodySeed = pattern.melodyNotes[0];
    const chordSeed = pattern.chordEvents[0];
    pattern.bassNotes = Array.from({ length: duplicateCount }, () => ({ ...bassSeed }));
    pattern.melodyNotes = Array.from({ length: duplicateCount }, () => ({ ...melodySeed }));
    pattern.chordEvents = Array.from({ length: duplicateCount }, () => ({ ...chordSeed }));
  }
  sourceProject.automation = Array.from({ length: 64 }, (_, index) => ({
    target: "master_volume",
    startStep: index * 2,
    endStep: index * 2 + 1,
    startValue: index / 64,
    endValue: 1,
    curve: "linear"
  }));
  const importedProject = workstation.parseProjectFile(JSON.stringify({
    app: "GrooveForge",
    fileVersion: workstation.projectFileVersion,
    savedAt: "2026-07-16T00:00:00.000Z",
    project: sourceProject
  }));
  const fileStem = workstation.projectFileStem(importedProject);
  const fileName = render.mixWavFileName(importedProject);
  const caseRoot = path.join(outputRoot, "event-density-safety", fileStem);
  await mkdir(caseRoot, { recursive: true });

  check(Object.values(importedProject.patterns).every((pattern) => pattern.bassNotes.length === 1), "event-density-safety: imported duplicate bass locations must keep one event per Pattern");
  check(Object.values(importedProject.patterns).every((pattern) => pattern.melodyNotes.length === 1), "event-density-safety: imported duplicate melody locations must keep one event per Pattern");
  check(Object.values(importedProject.patterns).every((pattern) => pattern.chordEvents.length === 1), "event-density-safety: imported duplicate chord steps must keep one event per Pattern");
  check(importedProject.automation.length === workstation.maxProjectAutomationEvents, "event-density-safety: imported automation must stop at the project event limit");
  check(sourceProject.patterns.A.bassNotes.length === duplicateCount, "event-density-safety: import must not mutate source note collections");
  check(sourceProject.automation.length === 64, "event-density-safety: import must not mutate source automation");
  check(fileName === "이벤트-밀도-복구-비트-demo.wav", "event-density-safety: repaired project must preserve its Korean filename identity");

  const analysis = render.analyzeExport(importedProject);
  check(Number.isFinite(analysis.peakDb), "event-density-safety: renderer peak analysis must be finite");
  check(Number.isFinite(analysis.rmsDb), "event-density-safety: renderer RMS analysis must be finite");
  const artifact = await renderArtifact({
    blobFactory: () => render.createMixWavBlob(importedProject),
    analysis,
    fileName,
    label: "event-density-safety:repaired-event-collections full mix",
    caseRoot,
    project: importedProject,
    requireTailContent: true
  });
  return {
    source: { bassNotes: duplicateCount, melodyNotes: duplicateCount, chordEvents: duplicateCount, automation: 64 },
    repaired: {
      bassNotes: importedProject.patterns.A.bassNotes.length,
      melodyNotes: importedProject.patterns.A.melodyNotes.length,
      chordEvents: importedProject.patterns.A.chordEvents.length,
      automation: importedProject.automation.length
    },
    fileStem,
    artifact
  };
}

async function runMixerTopologySafetyCase() {
  const profile = workstation.styleProfiles.find((candidate) => candidate.id === "k_hiphop_rnb") ?? workstation.styleProfiles[0];
  const sourceProject = {
    ...styleMatrixProject(profile),
    title: "믹서 복구 비트",
    mixer: []
  };
  const importedProject = workstation.parseProjectFile(JSON.stringify({
    app: "GrooveForge",
    fileVersion: workstation.projectFileVersion,
    savedAt: "2026-07-16T00:00:00.000Z",
    project: sourceProject
  }));
  const fileStem = workstation.projectFileStem(importedProject);
  const fileName = render.mixWavFileName(importedProject);
  const caseRoot = path.join(outputRoot, "mixer-topology-safety", fileStem);
  await mkdir(caseRoot, { recursive: true });

  const repairedIds = importedProject.mixer.map(({ id }) => id);
  check(sourceProject.mixer.length === 0, "mixer-topology-safety: import must not mutate the source empty mixer");
  check(importedProject.mixer.length === workstation.requiredMixerChannelIds.length, "mixer-topology-safety: imported empty mixer must restore every required channel");
  check(JSON.stringify(repairedIds) === JSON.stringify(workstation.requiredMixerChannelIds), "mixer-topology-safety: repaired mixer ids must use canonical order");
  check(fileName === "믹서-복구-비트-demo.wav", "mixer-topology-safety: repaired project must preserve its Korean filename identity");

  const analysis = render.analyzeExport(importedProject);
  check(analysis.status !== "Silent", "mixer-topology-safety: repaired mixer analysis must not be silent");
  check(Number.isFinite(analysis.peakDb), "mixer-topology-safety: renderer peak analysis must be finite");
  check(Number.isFinite(analysis.rmsDb), "mixer-topology-safety: renderer RMS analysis must be finite");
  const artifact = await renderArtifact({
    blobFactory: () => render.createMixWavBlob(importedProject),
    analysis,
    fileName,
    label: "mixer-topology-safety:repaired-empty-mixer full mix",
    caseRoot,
    project: importedProject,
    requireTailContent: true
  });
  const directBypassBytes = await blobToBuffer(render.createMixWavBlob(sourceProject));
  check(sha256(directBypassBytes) === artifact.sha256, "mixer-topology-safety: direct parser-bypass render must match imported repair bytes");
  return {
    source: { channels: sourceProject.mixer.length },
    repaired: { channels: importedProject.mixer.length, ids: repairedIds },
    directBypassSha256: sha256(directBypassBytes),
    fileStem,
    artifact
  };
}

async function runSnapshotIdentitySafetyCase() {
  const profile = workstation.styleProfiles.find((candidate) => candidate.id === "k_hiphop_rnb") ?? workstation.styleProfiles[0];
  const sourceProject = {
    ...styleMatrixProject(profile),
    title: "스냅샷 ID 복구 비트"
  };
  const { snapshots: _snapshots, ...snapshotCore } = structuredClone(sourceProject);
  sourceProject.snapshots = [
    {
      id: "shared snapshot",
      name: "Fast idea",
      createdAt: "2026-07-16T01:00:00.000Z",
      project: {
        ...structuredClone(snapshotCore),
        bpm: 140,
        sound: { ...snapshotCore.sound, synthBrightness: 0.9, chordWarmth: 0.3 }
      }
    },
    {
      id: "shared snapshot",
      name: "Slow idea",
      createdAt: "2026-07-16T02:00:00.000Z",
      project: {
        ...structuredClone(snapshotCore),
        bpm: 90,
        sound: { ...snapshotCore.sound, synthBrightness: 0.28, chordWarmth: 0.88 }
      }
    }
  ];
  const importedProject = workstation.parseProjectFile(JSON.stringify({
    app: "GrooveForge",
    fileVersion: workstation.projectFileVersion,
    savedAt: "2026-07-16T00:00:00.000Z",
    project: sourceProject
  }));
  const repairedIds = importedProject.snapshots.map(({ id }) => id);
  const renamed = workstation.renameProjectSnapshot(importedProject, repairedIds[0], "Renamed Fast Idea");
  const deleted = workstation.deleteProjectSnapshot(importedProject, repairedIds[0]);
  const restoredProjects = repairedIds.map((id, index) => ({
    ...workstation.restoreProjectSnapshot(importedProject, id),
    title: index === 0 ? "스냅샷 복구 빠른 비트" : "스냅샷 복구 느린 비트"
  }));
  const caseRoot = path.join(outputRoot, "snapshot-identity-safety");
  await mkdir(caseRoot, { recursive: true });

  check(sourceProject.snapshots[0].id === sourceProject.snapshots[1].id, "snapshot-identity-safety: source fixture must retain its duplicate ids");
  check(JSON.stringify(repairedIds) === JSON.stringify(["shared-snapshot", "shared-snapshot-2"]), "snapshot-identity-safety: imported duplicate unsafe ids must repair deterministically");
  check(renamed.snapshots[0]?.name === "Renamed Fast Idea" && renamed.snapshots[1]?.name === "Slow idea", "snapshot-identity-safety: rename must affect exactly one repaired snapshot");
  check(deleted.snapshots.length === 1 && deleted.snapshots[0]?.id === repairedIds[1], "snapshot-identity-safety: delete must retain the other formerly colliding snapshot");
  check(restoredProjects[0]?.bpm === 140 && restoredProjects[1]?.bpm === 90, "snapshot-identity-safety: both repaired snapshots must restore their own BPM");
  check(restoredProjects[0]?.sound.synthBrightness === 0.9 && restoredProjects[1]?.sound.synthBrightness === 0.28, "snapshot-identity-safety: both repaired snapshots must restore their own sound design");
  check(render.mixWavFileName(restoredProjects[0]) === "스냅샷-복구-빠른-비트-demo.wav", "snapshot-identity-safety: fast restored snapshot must keep its Korean filename identity");
  check(render.mixWavFileName(restoredProjects[1]) === "스냅샷-복구-느린-비트-demo.wav", "snapshot-identity-safety: slow restored snapshot must keep its Korean filename identity");

  const artifacts = [];
  for (const [index, project] of restoredProjects.entries()) {
    const analysis = render.analyzeExport(project);
    check(analysis.status !== "Silent", `snapshot-identity-safety:${index}: restored snapshot must not be silent`);
    check(Number.isFinite(analysis.peakDb) && Number.isFinite(analysis.rmsDb), `snapshot-identity-safety:${index}: restored snapshot analysis must be finite`);
    artifacts.push(await renderArtifact({
      blobFactory: () => render.createMixWavBlob(project),
      analysis,
      fileName: render.mixWavFileName(project),
      label: `snapshot-identity-safety:${index === 0 ? "fast" : "slow"} restored full mix`,
      caseRoot,
      project,
      requireTailContent: true
    }));
  }
  check(new Set(artifacts.map(({ sha256: hash }) => hash)).size === artifacts.length, "snapshot-identity-safety: restored snapshots must produce distinct PCM");
  check(artifacts[0].decoded.durationSeconds !== artifacts[1].decoded.durationSeconds, "snapshot-identity-safety: restored snapshot BPM difference must change delivered duration");
  return {
    source: { ids: sourceProject.snapshots.map(({ id }) => id), bpms: sourceProject.snapshots.map(({ project }) => project.bpm) },
    repaired: { ids: repairedIds, bpms: restoredProjects.map(({ bpm }) => bpm) },
    renameCount: renamed.snapshots.filter(({ name }) => name === "Renamed Fast Idea").length,
    deleteCount: `${importedProject.snapshots.length}->${deleted.snapshots.length}`,
    artifacts
  };
}

async function runMusicalControlRangeSafetyCase() {
  const profile = workstation.styleProfiles.find((candidate) => candidate.id === "k_hiphop_rnb") ?? workstation.styleProfiles[0];
  const sourceProject = {
    ...styleMatrixProject(profile),
    title: "컨트롤 복구 비트"
  };
  sourceProject.sound = {
    preset: "custom",
    kickPunch: 3,
    snareSnap: -3,
    hatBrightness: 2,
    bassDrive: -2,
    bassDecay: 4,
    sidechainDuck: -4,
    synthBrightness: 5,
    synthRelease: -5,
    chordWarmth: 6,
    chordWidth: -6
  };
  for (const lane of workstation.drumLanes) {
    sourceProject.patterns.A.drumVelocities[lane] = workstation.steps.map((step) => (step % 2 === 0 ? 2 : -2));
    sourceProject.patterns.A.drumTimings[lane] = workstation.steps.map((step) => (step % 2 === 0 ? 999 : -999));
    sourceProject.patterns.A.drumProbabilities[lane] = workstation.steps.map((step) => (step % 2 === 0 ? 2 : -2));
  }
  sourceProject.patterns.A.drumPattern.hat = workstation.steps.map(() => true);
  sourceProject.patterns.A.hatRepeats = workstation.steps.map((step) => (step % 2 === 0 ? 9 : -3));
  sourceProject.patterns.A.bassNotes[0] = {
    ...sourceProject.patterns.A.bassNotes[0],
    length: 999,
    velocity: 2,
    probability: 2
  };
  sourceProject.patterns.A.melodyNotes[0] = {
    ...sourceProject.patterns.A.melodyNotes[0],
    length: -9,
    velocity: -2,
    probability: 2
  };
  sourceProject.patterns.A.chordEvents[0] = {
    ...sourceProject.patterns.A.chordEvents[0],
    length: 999,
    velocity: 2,
    probability: 2
  };
  sourceProject.mixer = sourceProject.mixer.map((channel, index) => ({
    ...channel,
    lowCut: index % 2 === 0 ? 2 : -2,
    air: index % 2 === 0 ? -3 : 3,
    drive: index % 2 === 0 ? 4 : -4,
    glue: index % 2 === 0 ? -5 : 5,
    send: index % 2 === 0 ? 6 : -6
  }));
  sourceProject.arrangement[0] = { ...sourceProject.arrangement[0], bars: -9, energy: 3 };
  sourceProject.arrangement[1] = { ...sourceProject.arrangement[1], bars: 3.7, energy: -3 };

  const importedProject = workstation.parseProjectFile(JSON.stringify({
    app: "GrooveForge",
    fileVersion: workstation.projectFileVersion,
    savedAt: "2026-07-16T08:00:00.000Z",
    project: sourceProject
  }));
  const serializedProject = workstation.parseProjectFile(workstation.serializeProjectFile(sourceProject));
  const fileStem = workstation.projectFileStem(importedProject);
  const fileName = render.mixWavFileName(importedProject);
  const caseRoot = path.join(outputRoot, "musical-control-range-safety", fileStem);
  await mkdir(caseRoot, { recursive: true });

  check(importedProject.sound.kickPunch === 1 && importedProject.sound.snareSnap === 0 && importedProject.sound.chordWidth === 0, "musical-control-range-safety: sound design must clamp before rendering");
  check(importedProject.patterns.A.drumVelocities.kick[0] === 1 && importedProject.patterns.A.drumVelocities.kick[1] === 0.15, "musical-control-range-safety: drum velocity must clamp before rendering");
  check(importedProject.patterns.A.drumTimings.kick[0] === workstation.maxDrumTimingMs && importedProject.patterns.A.drumTimings.kick[1] === workstation.minDrumTimingMs, "musical-control-range-safety: drum timing must clamp before rendering");
  check(importedProject.patterns.A.drumProbabilities.kick[0] === 1 && importedProject.patterns.A.drumProbabilities.kick[1] === 0, "musical-control-range-safety: drum chance must clamp before rendering");
  check(importedProject.patterns.A.hatRepeats[0] === 4 && importedProject.patterns.A.hatRepeats[1] === 1, "musical-control-range-safety: hat repeat must clamp before rendering");
  check(importedProject.patterns.A.bassNotes[0]?.velocity === 1 && importedProject.patterns.A.melodyNotes[0]?.velocity === 0 && importedProject.patterns.A.chordEvents[0]?.velocity === 1, "musical-control-range-safety: note and chord velocity must clamp before rendering");
  check(importedProject.mixer[0]?.lowCut === 1 && importedProject.mixer[0]?.air === 0 && importedProject.mixer[0]?.drive === 1 && importedProject.mixer[0]?.glue === 0 && importedProject.mixer[0]?.send === 1, "musical-control-range-safety: mixer processing must clamp before rendering");
  check(importedProject.arrangement[0]?.bars === 1 && importedProject.arrangement[0]?.energy === 1 && importedProject.arrangement[1]?.bars === 4 && importedProject.arrangement[1]?.energy === 0, "musical-control-range-safety: arrangement controls must clamp and round before rendering");
  check(JSON.stringify(serializedProject) === JSON.stringify(importedProject), "musical-control-range-safety: durable serialization must persist the same repaired project");
  check(sourceProject.sound.kickPunch === 3 && sourceProject.patterns.A.chordEvents[0]?.velocity === 2 && sourceProject.mixer[0]?.drive === 4 && sourceProject.arrangement[0]?.energy === 3, "musical-control-range-safety: import and serialization must not mutate source controls");
  check(fileName === "컨트롤-복구-비트-demo.wav", "musical-control-range-safety: repaired project must preserve its Korean filename identity");

  const analysis = render.analyzeExport(importedProject);
  check(analysis.status !== "Silent", "musical-control-range-safety: repaired control project must not be silent");
  check(Number.isFinite(analysis.peakDb) && Number.isFinite(analysis.rmsDb), "musical-control-range-safety: repaired control analysis must be finite");
  const artifact = await renderArtifact({
    blobFactory: () => render.createMixWavBlob(importedProject),
    analysis,
    fileName,
    label: "musical-control-range-safety:repaired-controls full mix",
    caseRoot,
    project: importedProject,
    requireTailContent: true
  });
  const directBypassBytes = await blobToBuffer(render.createMixWavBlob(sourceProject));
  check(sha256(directBypassBytes) === artifact.sha256, "musical-control-range-safety: direct parser-bypass render must match imported repair bytes");
  return {
    source: {
      sound: [sourceProject.sound.snareSnap, sourceProject.sound.kickPunch],
      drumVelocity: [sourceProject.patterns.A.drumVelocities.kick[1], sourceProject.patterns.A.drumVelocities.kick[0]],
      chordVelocity: sourceProject.patterns.A.chordEvents[0]?.velocity,
      mixerDrive: sourceProject.mixer[0]?.drive,
      arrangementEnergy: sourceProject.arrangement[0]?.energy
    },
    repaired: {
      sound: [importedProject.sound.snareSnap, importedProject.sound.kickPunch],
      drumVelocity: [importedProject.patterns.A.drumVelocities.kick[1], importedProject.patterns.A.drumVelocities.kick[0]],
      chordVelocity: importedProject.patterns.A.chordEvents[0]?.velocity,
      mixerDrive: importedProject.mixer[0]?.drive,
      arrangementEnergy: importedProject.arrangement[0]?.energy
    },
    directBypassSha256: sha256(directBypassBytes),
    fileStem,
    artifact
  };
}

function sparseSwingTimingSampleProject(swing, title) {
  const pattern = structuredClone(workstation.starterProject.patterns.A);
  pattern.drumPattern = {
    kick: workstation.steps.map((step) => step === 1 || step === 15),
    clap: workstation.steps.map(() => false),
    hat: workstation.steps.map(() => false),
    perc: workstation.steps.map(() => false)
  };
  pattern.bassNotes = [];
  pattern.melodyNotes = [];
  pattern.chordEvents = [];
  const clonePattern = () => structuredClone(pattern);
  return {
    ...structuredClone(workstation.starterProject),
    title,
    bpm: 120,
    swing,
    patterns: { A: clonePattern(), B: clonePattern(), C: clonePattern() },
    arrangement: [{ section: "Intro", pattern: "A", energy: 0.8, bars: 1, mutedTracks: [] }],
    mixer: workstation.starterProject.mixer.map((channel) => ({ ...channel, send: 0, muted: false, solo: false })),
    snapshots: []
  };
}

async function runSwingPlaybackTimingCase() {
  const straightProject = sparseSwingTimingSampleProject(0, "스트레이트 타이밍 비트");
  const swungProject = sparseSwingTimingSampleProject(workstation.maxProjectSwing, "스윙 타이밍 비트");
  const caseRoot = path.join(outputRoot, "swing-playback-timing");
  const straightRoot = path.join(caseRoot, "straight");
  const swungRoot = path.join(caseRoot, "swung");
  await mkdir(straightRoot, { recursive: true });
  await mkdir(swungRoot, { recursive: true });

  const straightArtifact = await renderArtifact({
    blobFactory: () => render.createMixWavBlob(straightProject),
    analysis: render.analyzeExport(straightProject),
    fileName: render.mixWavFileName(straightProject),
    label: "swing-playback-timing:straight full mix",
    caseRoot: straightRoot,
    project: straightProject,
    requireTailContent: true
  });
  const swungArtifact = await renderArtifact({
    blobFactory: () => render.createMixWavBlob(swungProject),
    analysis: render.analyzeExport(swungProject),
    fileName: render.mixWavFileName(swungProject),
    label: "swing-playback-timing:swung full mix",
    caseRoot: swungRoot,
    project: swungProject,
    requireTailContent: true
  });
  const expectedDelayFrames =
    Math.floor(workstation.projectStepStartSeconds(swungProject, 1) * 44100) -
    Math.floor(workstation.projectStepStartSeconds(straightProject, 1) * 44100);
  const measuredDelayFrames = swungArtifact.decoded.firstNonZeroFrame - straightArtifact.decoded.firstNonZeroFrame;

  check(straightArtifact.sha256 !== swungArtifact.sha256, "swing-playback-timing: straight and swung PCM hashes must differ");
  check(straightArtifact.bytes === swungArtifact.bytes, "swing-playback-timing: swing must preserve WAV byte length and total frames");
  check(straightArtifact.decoded.durationSeconds === swungArtifact.decoded.durationSeconds, "swing-playback-timing: swing must preserve delivered duration");
  check(straightArtifact.decoded.firstNonZeroFrame !== null && swungArtifact.decoded.firstNonZeroFrame !== null, "swing-playback-timing: both timing samples must expose a decoded onset");
  check(Math.abs(measuredDelayFrames - expectedDelayFrames) <= 1, "swing-playback-timing: decoded odd-step onset must move by the domain swing offset within one frame");
  check(render.mixWavFileName(straightProject) === "스트레이트-타이밍-비트-demo.wav", "swing-playback-timing: straight sample must preserve its Korean filename identity");
  check(render.mixWavFileName(swungProject) === "스윙-타이밍-비트-demo.wav", "swing-playback-timing: swung sample must preserve its Korean filename identity");

  const excessiveSwingProject = { ...structuredClone(swungProject), swing: 99 };
  const importedProject = workstation.parseProjectFile(JSON.stringify(excessiveSwingProject));
  const directBytes = await blobToBuffer(render.createMixWavBlob(excessiveSwingProject));
  check(importedProject.swing === workstation.maxProjectSwing, "swing-playback-timing: imported excessive swing must clamp to 24%");
  check(sha256(directBytes) === swungArtifact.sha256, "swing-playback-timing: parser-bypass excessive swing must match the 24% repaired sample");
  check(excessiveSwingProject.swing === 99, "swing-playback-timing: render and import must not mutate the direct source swing");

  return {
    bpm: straightProject.bpm,
    straightSwing: straightProject.swing,
    swungSwing: swungProject.swing,
    expectedDelayFrames,
    measuredDelayFrames,
    measuredDelayMs: round((measuredDelayFrames / 44100) * 1000),
    directBypassSha256: sha256(directBytes),
    artifacts: [straightArtifact, swungArtifact]
  };
}

function masterCeilingRuntimeSampleProject(masterCeilingDb, title) {
  return {
    ...structuredClone(workstation.starterProject),
    title,
    masterCeilingDb,
    arrangement: [{ section: "Intro", pattern: "A", energy: 0.8, bars: 1, mutedTracks: [] }],
    snapshots: []
  };
}

async function runMasterCeilingRuntimeSafetyCase() {
  const directLowProject = masterCeilingRuntimeSampleProject(-900, "마스터 천장 복구 비트");
  const importedLowProject = workstation.parseProjectFile(JSON.stringify(directLowProject));
  const caseRoot = path.join(outputRoot, "master-ceiling-runtime-safety", workstation.projectFileStem(directLowProject));
  await mkdir(caseRoot, { recursive: true });
  const directLowAnalysis = render.analyzeExport(directLowProject);
  const artifact = await renderArtifact({
    blobFactory: () => render.createMixWavBlob(directLowProject),
    analysis: directLowAnalysis,
    fileName: render.mixWavFileName(directLowProject),
    label: "master-ceiling-runtime-safety:repaired direct full mix",
    caseRoot,
    project: directLowProject,
    requireTailContent: true
  });
  const importedLowBytes = await blobToBuffer(render.createMixWavBlob(importedLowProject));
  const directHighProject = masterCeilingRuntimeSampleProject(18, "Master Ceiling High Repair Beat");
  const importedHighProject = workstation.parseProjectFile(JSON.stringify(directHighProject));
  const directHighBytes = await blobToBuffer(render.createMixWavBlob(directHighProject));
  const importedHighBytes = await blobToBuffer(render.createMixWavBlob(importedHighProject));
  const directHighAnalysis = render.analyzeExport(directHighProject);
  const handoffSheet = handoff.createHandoffSheet(
    directLowProject,
    directLowAnalysis,
    render.analyzeStemExports(directLowProject)
  );
  const draftSourceProject = masterCeilingRuntimeSampleProject(-1, directLowProject.title);
  const resolvedDraftCeiling = workstation.resolveMasterCeilingDraft(draftSourceProject, " -6.0 ");
  const committedDraftProject = { ...draftSourceProject, masterCeilingDb: resolvedDraftCeiling };
  const importedDraftProject = workstation.parseProjectFile(workstation.serializeProjectFile(committedDraftProject));
  const committedDraftBytes = await blobToBuffer(render.createMixWavBlob(committedDraftProject));
  const importedDraftBytes = await blobToBuffer(render.createMixWavBlob(importedDraftProject));
  const staleDraftBytes = await blobToBuffer(render.createMixWavBlob(draftSourceProject));

  check(importedLowProject.masterCeilingDb === workstation.minMasterCeilingDb, "master-ceiling-runtime-safety: imported low ceiling must clamp to -6 dB");
  check(importedHighProject.masterCeilingDb === workstation.maxMasterCeilingDb, "master-ceiling-runtime-safety: imported high ceiling must clamp to 0 dB");
  check(sha256(importedLowBytes) === artifact.sha256, "master-ceiling-runtime-safety: direct low WAV must match imported repair");
  check(directHighBytes.equals(importedHighBytes), "master-ceiling-runtime-safety: direct high WAV must match imported repair");
  check(directLowAnalysis.ceilingDb === workstation.minMasterCeilingDb && directHighAnalysis.ceilingDb === workstation.maxMasterCeilingDb, "master-ceiling-runtime-safety: direct analysis must report bounded ceilings");
  check(directLowAnalysis.peakDb <= directLowAnalysis.ceilingDb + 1e-9 && directHighAnalysis.peakDb <= directHighAnalysis.ceilingDb + 1e-9, "master-ceiling-runtime-safety: repaired PCM analysis must respect the bounded ceiling");
  check(handoffSheet.includes("Master Ceiling: -6.0 dB") && !handoffSheet.includes("-900.0 dB"), "master-ceiling-runtime-safety: direct Handoff Sheet must report the repaired ceiling");
  check(resolvedDraftCeiling === workstation.minMasterCeilingDb, "master-ceiling-draft-lifecycle: focused -6.0 dB draft must resolve before menu Save");
  check(committedDraftBytes.equals(importedDraftBytes) && sha256(committedDraftBytes) === artifact.sha256, "master-ceiling-draft-lifecycle: committed draft sample must match durable Save and repaired sample bytes");
  check(!committedDraftBytes.equals(staleDraftBytes), "master-ceiling-draft-lifecycle: committed draft sample must differ from stale -1.0 dB audio");
  check(draftSourceProject.masterCeilingDb === -1, "master-ceiling-draft-lifecycle: sample proof must not mutate the source project");
  check(render.mixWavFileName(directLowProject) === "마스터-천장-복구-비트-demo.wav", "master-ceiling-runtime-safety: repaired sample must preserve its Korean filename identity");
  check(directLowProject.masterCeilingDb === -900 && directHighProject.masterCeilingDb === 18, "master-ceiling-runtime-safety: render and Handoff must not mutate direct source ceilings");

  return {
    source: { low: directLowProject.masterCeilingDb, high: directHighProject.masterCeilingDb },
    repaired: { low: importedLowProject.masterCeilingDb, high: importedHighProject.masterCeilingDb },
    draftLifecycle: {
      source: draftSourceProject.masterCeilingDb,
      resolved: resolvedDraftCeiling,
      committedSha256: sha256(committedDraftBytes),
      staleSha256: sha256(staleDraftBytes)
    },
    directLowAnalysis,
    directHighAnalysis,
    importedLowSha256: sha256(importedLowBytes),
    importedHighSha256: sha256(importedHighBytes),
    artifact
  };
}

async function runDeliveryMetadataRuntimeSafetyCase() {
  const directProject = {
    ...structuredClone(workstation.starterProject),
    title: "전달 메타데이터 복구 비트",
    bpm: 0,
    key: "H major",
    arrangement: [{ section: "Intro", pattern: "A", energy: 0.8, bars: 1, mutedTracks: [] }],
    snapshots: []
  };
  const repairedProject = workstation.parseProjectFile(workstation.serializeProjectFile(directProject));
  const caseRoot = path.join(outputRoot, "delivery-metadata-runtime-safety", workstation.projectFileStem(directProject));
  await mkdir(caseRoot, { recursive: true });
  const analysis = render.analyzeExport(directProject);
  const artifact = await renderArtifact({
    blobFactory: () => render.createMixWavBlob(directProject),
    analysis,
    fileName: render.mixWavFileName(directProject),
    label: "delivery-metadata-runtime-safety:repaired direct full mix",
    caseRoot,
    project: directProject,
    requireTailContent: true
  });
  const repairedWavBytes = await blobToBuffer(render.createMixWavBlob(repairedProject));
  const directMidiBytes = Buffer.from(midi.createMidiFile(directProject));
  const repairedMidiBytes = Buffer.from(midi.createMidiFile(repairedProject));
  const midiPath = path.join(caseRoot, midi.midiFileName(directProject));
  await writeFile(midiPath, directMidiBytes);
  const stemAnalyses = {
    drum_rack: analysis,
    bass_808: analysis,
    synth: analysis,
    chord: analysis
  };
  const sheet = handoff.createHandoffSheet(directProject, analysis, stemAnalyses);
  const manifest = deliveryBundle.createDeliveryBundleManifest(directProject, "delivery-metadata-runtime-safety.zip", []);
  const midiText = directMidiBytes.toString("latin1");

  check(repairedProject.bpm === workstation.minProjectBpm && repairedProject.key === "A minor", "delivery-metadata-runtime-safety: durable repair must normalize BPM/key");
  check(sha256(repairedWavBytes) === artifact.sha256, "delivery-metadata-runtime-safety: direct WAV must match durable BPM/key repair");
  check(directMidiBytes.equals(repairedMidiBytes), "delivery-metadata-runtime-safety: direct MIDI must match durable BPM/key repair");
  check(midiText.includes("Key: A minor") && !midiText.includes("Key: H major"), "delivery-metadata-runtime-safety: MIDI metadata must use the repaired key");
  check(sheet.includes("BPM: 60") && sheet.includes("Key: A minor") && !sheet.includes("BPM: 0") && !sheet.includes("Key: H major"), "delivery-metadata-runtime-safety: Handoff Sheet must use repaired BPM/key metadata");
  check(manifest.bpm === workstation.minProjectBpm && manifest.key === "A minor", "delivery-metadata-runtime-safety: delivery manifest must use repaired BPM/key metadata");
  check(render.mixWavFileName(directProject) === "전달-메타데이터-복구-비트-demo.wav", "delivery-metadata-runtime-safety: sample must preserve its Korean filename identity");
  check(directProject.bpm === 0 && directProject.key === "H major", "delivery-metadata-runtime-safety: render and metadata consumers must not mutate direct source identity");

  return {
    source: { bpm: directProject.bpm, key: directProject.key },
    repaired: { bpm: repairedProject.bpm, key: repairedProject.key },
    midi: {
      path: relative(midiPath),
      bytes: directMidiBytes.byteLength,
      sha256: sha256(directMidiBytes),
      importedSha256: sha256(repairedMidiBytes)
    },
    importedWavSha256: sha256(repairedWavBytes),
    artifact
  };
}

async function runHandoffRuntimeSafetyCase() {
  const directProject = {
    ...structuredClone(workstation.starterProject),
    title: "핸드오프 복구 비트",
    arrangement: [{ section: "Intro", pattern: "A", energy: 99, bars: 0, mutedTracks: [] }],
    sessionBrief: {
      artist: "Artist\nExport Meter",
      vibe: "  night\t drive  ",
      reference: "Ref\nStatus: Ready",
      notes: "x".repeat(600)
    },
    snapshots: []
  };
  const repairedProject = workstation.parseProjectFile(workstation.serializeProjectFile(directProject));
  const caseRoot = path.join(outputRoot, "handoff-runtime-safety", workstation.projectFileStem(directProject));
  await mkdir(caseRoot, { recursive: true });
  const analysis = render.analyzeExport(directProject);
  const artifact = await renderArtifact({
    blobFactory: () => render.createMixWavBlob(directProject),
    analysis,
    fileName: render.mixWavFileName(directProject),
    label: "handoff-runtime-safety:repaired direct full mix",
    caseRoot,
    project: directProject,
    requireTailContent: true
  });
  const repairedWavBytes = await blobToBuffer(render.createMixWavBlob(repairedProject));
  const directMidiBytes = Buffer.from(midi.createMidiFile(directProject));
  const repairedMidiBytes = Buffer.from(midi.createMidiFile(repairedProject));
  const midiPath = path.join(caseRoot, midi.midiFileName(directProject));
  await writeFile(midiPath, directMidiBytes);
  const stemAnalyses = { drum_rack: analysis, bass_808: analysis, synth: analysis, chord: analysis };
  const directSheet = handoff.createHandoffSheet(directProject, analysis, stemAnalyses);
  const repairedSheet = handoff.createHandoffSheet(repairedProject, analysis, stemAnalyses);
  const handoffPath = path.join(caseRoot, handoff.handoffSheetFileName(directProject));
  await writeFile(handoffPath, directSheet);

  check(sha256(repairedWavBytes) === artifact.sha256, "handoff-runtime-safety: direct WAV must match durable arrangement/brief repair");
  check(directMidiBytes.equals(repairedMidiBytes), "handoff-runtime-safety: direct MIDI must match durable arrangement/brief repair");
  check(directSheet === repairedSheet, "handoff-runtime-safety: direct Handoff must match durable arrangement/brief repair");
  check(directSheet.includes("1. Intro / Pattern A / 1 bar / Energy 100% / Muted None"), "handoff-runtime-safety: Handoff arrangement row must use repaired bars and energy");
  check(directSheet.includes("Artist: Artist Export Meter") && !directSheet.includes("Artist: Artist\nExport Meter"), "handoff-runtime-safety: Handoff must reject multiline Session Brief injection");
  check(repairedProject.sessionBrief.notes.length === 240 && directProject.sessionBrief.notes.length === 600, "handoff-runtime-safety: Handoff must bound notes without mutating the source");
  check(render.mixWavFileName(directProject) === "핸드오프-복구-비트-demo.wav", "handoff-runtime-safety: sample must preserve its Korean filename identity");

  return {
    source: { bars: 0, energy: 99, notesLength: 600 },
    repaired: { bars: repairedProject.arrangement[0].bars, energy: repairedProject.arrangement[0].energy, notesLength: repairedProject.sessionBrief.notes.length },
    midi: { path: relative(midiPath), bytes: directMidiBytes.byteLength, sha256: sha256(directMidiBytes) },
    handoff: { path: relative(handoffPath), bytes: Buffer.byteLength(directSheet), sha256: sha256(Buffer.from(directSheet)) },
    importedWavSha256: sha256(repairedWavBytes),
    artifact
  };
}

async function runSnapshotRuntimeSafetyCase() {
  const sourceProject = {
    ...structuredClone(workstation.starterProject),
    title: "스냅샷 복구 비트",
    bpm: 0,
    key: "H major",
    swing: 99,
    masterCeilingDb: 999,
    arrangement: [{ section: "Hook", pattern: "A", energy: 99, bars: 0, mutedTracks: [] }],
    sessionBrief: {
      artist: "Artist\nExport Meter",
      vibe: "  night\t drive  ",
      reference: "Ref\nStatus: Ready",
      notes: "x".repeat(600)
    },
    snapshots: []
  };
  const savedProject = workstation.saveProjectSnapshot(sourceProject, "2026-07-16T00:00:00.000Z");
  const snapshot = savedProject.snapshots[0];
  const restoredProject = workstation.restoreProjectSnapshot({ ...savedProject, bpm: 124, key: "C minor" }, snapshot.id);
  const importedProject = workstation.parseProjectFile(workstation.serializeProjectFile(restoredProject));
  const caseRoot = path.join(outputRoot, "snapshot-runtime-safety", workstation.projectFileStem(restoredProject));
  await mkdir(caseRoot, { recursive: true });
  const analysis = render.analyzeExport(restoredProject);
  const artifact = await renderArtifact({
    blobFactory: () => render.createMixWavBlob(restoredProject),
    analysis,
    fileName: render.mixWavFileName(restoredProject),
    label: "snapshot-runtime-safety:repaired restored full mix",
    caseRoot,
    project: restoredProject,
    requireTailContent: true
  });
  const importedWavBytes = await blobToBuffer(render.createMixWavBlob(importedProject));
  const directMidiBytes = Buffer.from(midi.createMidiFile(restoredProject));
  const importedMidiBytes = Buffer.from(midi.createMidiFile(importedProject));
  const midiPath = path.join(caseRoot, midi.midiFileName(restoredProject));
  await writeFile(midiPath, directMidiBytes);
  const stemAnalyses = { drum_rack: analysis, bass_808: analysis, synth: analysis, chord: analysis };
  const directSheet = handoff.createHandoffSheet(restoredProject, analysis, stemAnalyses);
  const importedSheet = handoff.createHandoffSheet(importedProject, analysis, stemAnalyses);
  const handoffPath = path.join(caseRoot, handoff.handoffSheetFileName(restoredProject));
  await writeFile(handoffPath, directSheet);

  check(snapshot.project.bpm === workstation.minProjectBpm && snapshot.project.key === "A minor", "snapshot-runtime-safety: saved snapshot must repair BPM/key identity");
  check(snapshot.project.swing === workstation.maxProjectSwing && snapshot.project.masterCeilingDb === workstation.maxMasterCeilingDb, "snapshot-runtime-safety: saved snapshot must repair swing/ceiling");
  check(snapshot.project.arrangement[0].bars === 1 && snapshot.project.arrangement[0].energy === 1, "snapshot-runtime-safety: saved snapshot must repair arrangement");
  check(snapshot.project.sessionBrief.artist === "Artist Export Meter" && snapshot.project.sessionBrief.notes.length === 240, "snapshot-runtime-safety: saved snapshot must repair Session Brief");
  check(workstation.projectSnapshotSummary(snapshot) === "A minor / 60 BPM / 1 bars", "snapshot-runtime-safety: snapshot summary must use repaired identity");
  check(restoredProject.bpm === snapshot.project.bpm && restoredProject.key === snapshot.project.key, "snapshot-runtime-safety: restore must use repaired snapshot core");
  check(sha256(importedWavBytes) === artifact.sha256, "snapshot-runtime-safety: restored WAV must match durable repair");
  check(directMidiBytes.equals(importedMidiBytes), "snapshot-runtime-safety: restored MIDI must match durable repair");
  check(directSheet === importedSheet && !directSheet.includes("BPM: 0") && !directSheet.includes("Artist: Artist\nExport Meter"), "snapshot-runtime-safety: restored Handoff must match durable repair without injection");
  check(render.mixWavFileName(restoredProject) === "스냅샷-복구-비트-demo.wav", "snapshot-runtime-safety: sample must preserve its Korean filename identity");
  check(sourceProject.bpm === 0 && sourceProject.key === "H major" && sourceProject.arrangement[0].bars === 0 && sourceProject.sessionBrief.notes.length === 600, "snapshot-runtime-safety: snapshot operations must not mutate the source");

  return {
    source: { bpm: 0, key: "H major", bars: 0, energy: 99, notesLength: 600 },
    repaired: { bpm: snapshot.project.bpm, key: snapshot.project.key, bars: snapshot.project.arrangement[0].bars, energy: snapshot.project.arrangement[0].energy, notesLength: snapshot.project.sessionBrief.notes.length },
    summary: workstation.projectSnapshotSummary(snapshot),
    midi: { path: relative(midiPath), bytes: directMidiBytes.byteLength, sha256: sha256(directMidiBytes), importedSha256: sha256(importedMidiBytes) },
    handoff: { path: relative(handoffPath), bytes: Buffer.byteLength(directSheet), sha256: sha256(Buffer.from(directSheet)) },
    importedWavSha256: sha256(importedWavBytes),
    artifact
  };
}

function updateMixerChannel(project, trackId, update) {
  return {
    ...project,
    mixer: project.mixer.map((channel) => channel.id === trackId ? { ...channel, ...update } : { ...channel })
  };
}

async function targetStemBytes(project, track = "drum_rack") {
  return blobToBuffer(render.createStemWavBlob(project, track));
}

async function validateRenderIsolation() {
  const project = { ...workstation.createAudienceStarterProject("beginner"), snapshots: [] };
  const baseline = await targetStemBytes(project);
  const synthChannel = project.mixer.find((channel) => channel.id === "synth");
  check(Boolean(synthChannel), "render-isolation: Synth mixer channel must exist");
  const unrelatedMixerEdits = [
    ["volume", { volumeDb: synthChannel.volumeDb - 1 }],
    ["pan", { pan: Math.min(100, synthChannel.pan + 7) }],
    ["mute", { muted: !synthChannel.muted }],
    ["solo", { solo: !synthChannel.solo }],
    ["low-cut", { lowCut: Math.min(1, synthChannel.lowCut + 0.07) }],
    ["air", { air: Math.min(1, synthChannel.air + 0.07) }],
    ["drive", { drive: Math.min(1, synthChannel.drive + 0.07) }],
    ["glue", { glue: Math.min(1, synthChannel.glue + 0.07) }],
    ["space-send", { send: Math.min(1, synthChannel.send + 0.07) }]
  ];
  const isolationRows = [];
  for (const [edit, update] of unrelatedMixerEdits) {
    const candidate = await targetStemBytes(updateMixerChannel(project, "synth", update));
    const isolated = baseline.equals(candidate);
    check(isolated, `render-isolation: unrelated Synth ${edit} edit must not change Drums stem bytes`);
    isolationRows.push({ edit: `synth-${edit}`, isolated, sha256: sha256(candidate) });
  }

  const selectedPatternCandidate = await targetStemBytes({ ...project, selectedPattern: project.selectedPattern === "A" ? "B" : "A" });
  const selectedPatternIsolated = baseline.equals(selectedPatternCandidate);
  check(selectedPatternIsolated, "render-isolation: selected Pattern UI state must not change an arrangement-routed Drums stem");
  isolationRows.push({ edit: "selected-pattern", isolated: selectedPatternIsolated, sha256: sha256(selectedPatternCandidate) });

  const firstMelody = project.patterns.A.melodyNotes[0];
  check(Boolean(firstMelody), "render-isolation: Pattern A must contain a melody note");
  const unrelatedNoteProject = firstMelody ? {
    ...project,
    patterns: {
      ...project.patterns,
      A: {
        ...project.patterns.A,
        melodyNotes: project.patterns.A.melodyNotes.map((note, index) => index === 0 ? { ...note, velocity: Math.max(0.1, note.velocity - 0.08) } : { ...note })
      }
    }
  } : project;
  const unrelatedNoteCandidate = await targetStemBytes(unrelatedNoteProject);
  const unrelatedNoteIsolated = baseline.equals(unrelatedNoteCandidate);
  check(unrelatedNoteIsolated, "render-isolation: unrelated Melody note edit must not change Drums stem bytes");
  isolationRows.push({ edit: "melody-note", isolated: unrelatedNoteIsolated, sha256: sha256(unrelatedNoteCandidate) });

  const targetMixerCandidate = await targetStemBytes(updateMixerChannel(project, "drum_rack", {
    volumeDb: project.mixer.find((channel) => channel.id === "drum_rack").volumeDb - 1
  }));
  const targetMixerSensitive = !baseline.equals(targetMixerCandidate);
  check(targetMixerSensitive, "render-isolation: target Drums mixer edit must change Drums stem bytes");

  const noiseSoundCandidate = await targetStemBytes({
    ...project,
    sound: { ...project.sound, hatBrightness: Math.max(0, project.sound.hatBrightness - 0.08) }
  });
  const noiseSoundSensitive = !baseline.equals(noiseSoundCandidate);
  check(noiseSoundSensitive, "render-isolation: relevant hat-noise sound edit must change Drums stem bytes");

  const drumSoloProject = {
    ...project,
    mixer: project.mixer.map((channel) => ({
      ...channel,
      muted: false,
      solo: channel.id === "drum_rack"
    }))
  };
  const soloMix = await blobToBuffer(render.createMixWavBlob(drumSoloProject));
  const soloStem = await targetStemBytes(drumSoloProject);
  const soloMatchesStem = soloMix.equals(soloStem);
  check(soloMatchesStem, "render-isolation: Drums-only solo mix must equal the Drums stem from the same state");

  return {
    target: "drum_rack",
    baselineSha256: sha256(baseline),
    unrelatedEditCount: isolationRows.length,
    unrelatedEditsIsolated: isolationRows.every((row) => row.isolated),
    isolationRows,
    targetMixerSensitive,
    noiseSoundSensitive,
    soloMatchesStem
  };
}

async function runCase(smokeCase) {
  const { project, expected } = smokeCase;
  const caseRoot = path.join(outputRoot, smokeCase.id);
  await mkdir(caseRoot, { recursive: true });
  check(project.mode === expected.mode, `${smokeCase.id}: expected ${expected.mode} mode`);
  check(project.styleId === expected.styleId, `${smokeCase.id}: expected ${expected.styleId} style`);
  check(project.bpm === expected.bpm, `${smokeCase.id}: expected ${expected.bpm} BPM`);
  const bars = workstation.arrangementTotalBars(project);
  check(bars === expected.bars, `${smokeCase.id}: expected ${expected.bars} arrangement bars`);

  const mixAnalysis = render.analyzeExport(project);
  const stemAnalyses = render.analyzeStemExports(project);
  const artifacts = [await renderArtifact({
    blobFactory: () => render.createMixWavBlob(project), analysis: mixAnalysis,
    fileName: render.mixWavFileName(project), label: `${smokeCase.id} full mix`, caseRoot, project, requireTailContent: true
  })];
  const stemFileNames = render.stemWavFileNames(project);
  for (const [index, track] of render.stemTrackIds.entries()) {
    artifacts.push(await renderArtifact({
      blobFactory: () => render.createStemWavBlob(project, track), analysis: stemAnalyses[track],
      fileName: stemFileNames[index], label: `${smokeCase.id} ${track} stem`, caseRoot, project
    }));
  }

  check(new Set(artifacts.map((artifact) => artifact.sha256)).size === artifacts.length, `${smokeCase.id}: mix and stem files must all contain distinct PCM`);
  check(new Set(artifacts.slice(1).map((artifact) => artifact.sha256)).size === render.stemTrackIds.length, `${smokeCase.id}: all four stems must contain distinct PCM`);
  return {
    id: smokeCase.id, audience: smokeCase.audience,
    project: { title: project.title, mode: project.mode, styleId: project.styleId, bpm: project.bpm, key: project.key, bars },
    artifacts
  };
}

function markdownReport(report) {
  const rows = report.cases.flatMap((smokeCase) => smokeCase.artifacts.map((artifact) =>
    `| ${smokeCase.id} | ${artifact.label} | \`${artifact.path}\` | ${artifact.decoded.musicalDurationSeconds.toFixed(2)} s | +${artifact.decoded.tailDurationSeconds.toFixed(2)} s | ${artifact.decoded.durationSeconds.toFixed(2)} s | ${artifact.decoded.peakDb.toFixed(2)} dB | ${artifact.decoded.rmsDb.toFixed(2)} dB | ${artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} | ${artifact.deterministic ? "yes" : "no"} |`
  ));
  const styleRows = report.styleMatrix.map((style) =>
    `| ${style.id} | ${style.name} | ${style.project.bpm} | \`${style.artifact.path}\` | ${style.artifact.decoded.musicalDurationSeconds.toFixed(2)} s | +${style.artifact.decoded.tailDurationSeconds.toFixed(2)} s | ${style.artifact.decoded.durationSeconds.toFixed(2)} s | ${style.artifact.decoded.peakDb.toFixed(2)} dB | ${style.artifact.decoded.rmsDb.toFixed(2)} dB | ${style.artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${style.artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} | ${style.artifact.deterministic ? "yes" : "no"} |`
  );
  const unicodeRows = report.unicodeFileIdentity.map((identity) =>
    `| ${identity.title} | \`${identity.fileStem}\` | ${identity.project.styleId} | \`${identity.artifact.path}\` | ${identity.artifact.decoded.durationSeconds.toFixed(2)} s | ${identity.artifact.decoded.peakDb.toFixed(2)} dB | ${identity.artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${identity.artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} | ${identity.artifact.deterministic ? "yes" : "no"} |`
  );
  const titleIntegrity = report.projectTitleIntegrity;
  const importSafety = report.projectImportSafety;
  const pitchSafety = report.projectPitchSafety;
  const timelineSafety = report.timelineBoundarySafety;
  const eventDensitySafety = report.eventDensitySafety;
  const mixerTopologySafety = report.mixerTopologySafety;
  const snapshotIdentitySafety = report.snapshotIdentitySafety;
  const musicalControlRangeSafety = report.musicalControlRangeSafety;
  const swingPlaybackTiming = report.swingPlaybackTiming;
  const masterCeilingRuntimeSafety = report.masterCeilingRuntimeSafety;
  const snapshotRows = snapshotIdentitySafety.artifacts.map((artifact, index) =>
    `| ${snapshotIdentitySafety.repaired.ids[index]} | ${snapshotIdentitySafety.repaired.bpms[index]} | \`${artifact.path}\` | ${artifact.decoded.durationSeconds.toFixed(2)} s | ${artifact.decoded.peakDb.toFixed(2)} dB | ${artifact.decoded.rmsDb.toFixed(2)} dB | ${artifact.decoded.nonZeroSamples} | ${artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} | ${artifact.deterministic ? "yes" : "no"} |`
  );
  const swingRows = swingPlaybackTiming.artifacts.map((artifact, index) =>
    `| ${index === 0 ? "Straight" : "Swung"} | ${index === 0 ? swingPlaybackTiming.straightSwing : swingPlaybackTiming.swungSwing} | \`${artifact.path}\` | ${artifact.decoded.firstNonZeroFrame} | ${artifact.decoded.durationSeconds.toFixed(2)} s | ${artifact.decoded.peakDb.toFixed(2)} dB | ${artifact.decoded.rmsDb.toFixed(2)} dB | ${artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} | ${artifact.deterministic ? "yes" : "no"} |`
  );
  return `# GrooveForge Sample Audio QA\n\nStatus: **${report.status}**\n\n` +
    `Generated from built-in editable musical events only. No imported audio, private project data, network service, or external release claim is used.\n\n` +
    `| Case | Artifact | Local path | Musical | Tail | Delivered | Peak | RMS | Tail content | Zero end | Repeat render |\n|---|---|---|---:|---:|---:|---:|---:|---|---|---|\n${rows.join("\n")}\n\n` +
    `## All-style PCM Matrix\n\n| Style | Name | BPM | Local path | Musical | Tail | Delivered | Peak | RMS | Tail content | Zero end | Repeat render |\n|---|---|---:|---|---:|---:|---:|---:|---:|---|---|---|\n${styleRows.join("\n")}\n\n` +
    `## Unicode File Identity\n\nDistinct Korean project titles keep distinct shared file stems and real decoded WAV output: **${report.unicodeFileIdentity.length}/2**.\n\n| Title | Shared stem | Style | Local WAV | Delivered | Peak | Tail content | Zero end | Repeat render |\n|---|---|---|---|---:|---:|---|---|---|\n${unicodeRows.join("\n")}\n\n` +
    `## Project Title Integrity\n\nMalformed imported metadata normalized to **${titleIntegrity.normalizedTitle}** with shared stem \`${titleIntegrity.fileStem}\` before rendering a real decoded WAV.\n\n| Local WAV | Delivered | Peak | Tail content | Zero end | Repeat render |\n|---|---:|---:|---|---|---|\n| \`${titleIntegrity.artifact.path}\` | ${titleIntegrity.artifact.decoded.durationSeconds.toFixed(2)} s | ${titleIntegrity.artifact.decoded.peakDb.toFixed(2)} dB | ${titleIntegrity.artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${titleIntegrity.artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} | ${titleIntegrity.artifact.deterministic ? "yes" : "no"} |\n\n` +
    `## Project Import Safety\n\nOut-of-range imported timing and audio values repaired to **${importSafety.repaired.bpm} BPM / ${importSafety.repaired.key} / ${importSafety.repaired.masterCeilingDb} dB ceiling** before rendering a real decoded WAV.\n\n| Local WAV | Delivered | Peak | RMS | Tail content | Zero end | Repeat render |\n|---|---:|---:|---:|---|---|---|\n| \`${importSafety.artifact.path}\` | ${importSafety.artifact.decoded.durationSeconds.toFixed(2)} s | ${importSafety.artifact.decoded.peakDb.toFixed(2)} dB | ${importSafety.artifact.decoded.rmsDb.toFixed(2)} dB | ${importSafety.artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${importSafety.artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} | ${importSafety.artifact.deterministic ? "yes" : "no"} |\n\n` +
    `## Project Pitch Safety\n\nExtreme imported pitches repaired from **${pitchSafety.source.lowPitch}–${pitchSafety.source.highPitch}** to **${pitchSafety.repaired.lowPitch}–${pitchSafety.repaired.highPitch} (${pitchSafety.repaired.lowFrequencyHz.toFixed(2)}–${pitchSafety.repaired.highFrequencyHz.toFixed(2)} Hz)** before rendering a finite decoded WAV.\n\n| Local WAV | Delivered | Peak | RMS | Non-zero PCM | Tail content | Zero end | Repeat render |\n|---|---:|---:|---:|---:|---|---|---|\n| \`${pitchSafety.artifact.path}\` | ${pitchSafety.artifact.decoded.durationSeconds.toFixed(2)} s | ${pitchSafety.artifact.decoded.peakDb.toFixed(2)} dB | ${pitchSafety.artifact.decoded.rmsDb.toFixed(2)} dB | ${pitchSafety.artifact.decoded.nonZeroSamples} | ${pitchSafety.artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${pitchSafety.artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} | ${pitchSafety.artifact.deterministic ? "yes" : "no"} |\n\n` +
    `## Timeline Boundary Safety\n\nPattern-crossing imported bass/melody/chord lengths repaired from **${timelineSafety.source.bassLength}/${timelineSafety.source.melodyLength}/${timelineSafety.source.chordLength}** to **${timelineSafety.repaired.bassLength}/${timelineSafety.repaired.melodyLength}/${timelineSafety.repaired.chordLength} steps** before rendering a finite decoded WAV.\n\n| Local WAV | Delivered | Peak | RMS | Non-zero PCM | Tail content | Zero end | Repeat render |\n|---|---:|---:|---:|---:|---|---|---|\n| \`${timelineSafety.artifact.path}\` | ${timelineSafety.artifact.decoded.durationSeconds.toFixed(2)} s | ${timelineSafety.artifact.decoded.peakDb.toFixed(2)} dB | ${timelineSafety.artifact.decoded.rmsDb.toFixed(2)} dB | ${timelineSafety.artifact.decoded.nonZeroSamples} | ${timelineSafety.artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${timelineSafety.artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} | ${timelineSafety.artifact.deterministic ? "yes" : "no"} |\n\n` +
    `## Event Density Safety\n\nDuplicate imported bass/melody/chord collections and oversized automation repaired from **${eventDensitySafety.source.bassNotes}/${eventDensitySafety.source.melodyNotes}/${eventDensitySafety.source.chordEvents}/${eventDensitySafety.source.automation}** to **${eventDensitySafety.repaired.bassNotes}/${eventDensitySafety.repaired.melodyNotes}/${eventDensitySafety.repaired.chordEvents}/${eventDensitySafety.repaired.automation} events** before rendering a finite decoded WAV.\n\n| Local WAV | Delivered | Peak | RMS | Non-zero PCM | Tail content | Zero end | Repeat render |\n|---|---:|---:|---:|---:|---|---|---|\n| \`${eventDensitySafety.artifact.path}\` | ${eventDensitySafety.artifact.decoded.durationSeconds.toFixed(2)} s | ${eventDensitySafety.artifact.decoded.peakDb.toFixed(2)} dB | ${eventDensitySafety.artifact.decoded.rmsDb.toFixed(2)} dB | ${eventDensitySafety.artifact.decoded.nonZeroSamples} | ${eventDensitySafety.artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${eventDensitySafety.artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} | ${eventDensitySafety.artifact.deterministic ? "yes" : "no"} |\n\n` +
    `## Mixer Topology Safety\n\nAn imported **${mixerTopologySafety.source.channels}-channel** mixer was repaired to **${mixerTopologySafety.repaired.channels} required channels (${mixerTopologySafety.repaired.ids.join(", ")})** before rendering a finite decoded WAV. Direct parser-bypass rendering produced the same PCM hash.\n\n| Local WAV | Delivered | Peak | RMS | Non-zero PCM | Tail content | Zero end | Repeat render |\n|---|---:|---:|---:|---:|---|---|---|\n| \`${mixerTopologySafety.artifact.path}\` | ${mixerTopologySafety.artifact.decoded.durationSeconds.toFixed(2)} s | ${mixerTopologySafety.artifact.decoded.peakDb.toFixed(2)} dB | ${mixerTopologySafety.artifact.decoded.rmsDb.toFixed(2)} dB | ${mixerTopologySafety.artifact.decoded.nonZeroSamples} | ${mixerTopologySafety.artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${mixerTopologySafety.artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} | ${mixerTopologySafety.artifact.deterministic ? "yes" : "no"} |\n\n` +
    `## Snapshot Identity Safety\n\nTwo imported snapshots sharing the unsafe id **${snapshotIdentitySafety.source.ids[0]}** were repaired to **${snapshotIdentitySafety.repaired.ids.join(" / ")}**, restored independently at **${snapshotIdentitySafety.repaired.bpms.join(" / ")} BPM**, and rendered as distinct decoded WAVs. Rename affected ${snapshotIdentitySafety.renameCount}/2 snapshots and delete changed ${snapshotIdentitySafety.deleteCount}.\n\n| Repaired id | BPM | Local WAV | Delivered | Peak | RMS | Non-zero PCM | Tail content | Zero end | Repeat render |\n|---|---:|---|---:|---:|---:|---:|---|---|---|\n${snapshotRows.join("\n")}\n\n` +
    `## Musical Control Range Safety\n\nFinite out-of-range sound, drum, note/chord, mixer-processing, and arrangement controls were repaired from **sound ${musicalControlRangeSafety.source.sound.join("..")} / drum velocity ${musicalControlRangeSafety.source.drumVelocity.join("..")}** to **sound ${musicalControlRangeSafety.repaired.sound.join("..")} / drum velocity ${musicalControlRangeSafety.repaired.drumVelocity.join("..")}** before rendering. Direct parser-bypass PCM matched the imported repair.\n\n| Local WAV | Delivered | Peak | RMS | Non-zero PCM | Tail content | Zero end | Repeat render |\n|---|---:|---:|---:|---:|---|---|---|\n| \`${musicalControlRangeSafety.artifact.path}\` | ${musicalControlRangeSafety.artifact.decoded.durationSeconds.toFixed(2)} s | ${musicalControlRangeSafety.artifact.decoded.peakDb.toFixed(2)} dB | ${musicalControlRangeSafety.artifact.decoded.rmsDb.toFixed(2)} dB | ${musicalControlRangeSafety.artifact.decoded.nonZeroSamples} | ${musicalControlRangeSafety.artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${musicalControlRangeSafety.artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} | ${musicalControlRangeSafety.artifact.deterministic ? "yes" : "no"} |\n\n` +
    `## Swing Playback Timing\n\nAt **${swingPlaybackTiming.bpm} BPM**, the same sparse beat rendered at **${swingPlaybackTiming.straightSwing * 100}%** and **${swingPlaybackTiming.swungSwing * 100}%** Swing with equal duration but distinct PCM. The decoded first odd-step onset moved **${swingPlaybackTiming.measuredDelayFrames} frames / ${swingPlaybackTiming.measuredDelayMs.toFixed(2)} ms** (expected ${swingPlaybackTiming.expectedDelayFrames} frames), and direct excessive Swing matched imported 24% repair.\n\n| Feel | Swing | Local WAV | First onset frame | Delivered | Peak | RMS | Tail content | Zero end | Repeat render |\n|---|---:|---|---:|---:|---:|---:|---|---|---|\n${swingRows.join("\n")}\n\n` +
    `## Master Ceiling Runtime Safety\n\nA direct parser-bypass Ceiling of **${masterCeilingRuntimeSafety.source.low} dB** repaired to **${masterCeilingRuntimeSafety.repaired.low} dB** at render, analysis, realtime/audition, and Handoff boundaries instead of silencing the mix. Direct and imported repair produced the same PCM hash; the decoded sample stayed audible, respected the repaired ceiling, retained tail content, and ended at digital zero. A direct **+${masterCeilingRuntimeSafety.source.high} dB** value likewise matched imported **${masterCeilingRuntimeSafety.repaired.high} dB** repair. A focused range draft also resolved from **${masterCeilingRuntimeSafety.draftLifecycle.source.toFixed(1)} dB** to **${masterCeilingRuntimeSafety.draftLifecycle.resolved.toFixed(1)} dB** before menu Save; its durable WAV matched this sample and differed from stale audio.\n\n| Local WAV | Delivered | Peak | RMS | Ceiling | Non-zero PCM | Tail content | Zero end | Repeat render |\n|---|---:|---:|---:|---:|---:|---|---|---|\n| \`${masterCeilingRuntimeSafety.artifact.path}\` | ${masterCeilingRuntimeSafety.artifact.decoded.durationSeconds.toFixed(2)} s | ${masterCeilingRuntimeSafety.artifact.decoded.peakDb.toFixed(2)} dB | ${masterCeilingRuntimeSafety.artifact.decoded.rmsDb.toFixed(2)} dB | ${masterCeilingRuntimeSafety.artifact.rendererAnalysis.ceilingDb.toFixed(1)} dB | ${masterCeilingRuntimeSafety.artifact.decoded.nonZeroSamples} | ${masterCeilingRuntimeSafety.artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${masterCeilingRuntimeSafety.artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} | ${masterCeilingRuntimeSafety.artifact.deterministic ? "yes" : "no"} |\n\n` +
    `## Delivery Metadata Runtime Safety\n\nA direct parser-bypass identity of **${deliveryMetadataRuntimeSafety.source.bpm} BPM / ${deliveryMetadataRuntimeSafety.source.key}** repaired to **${deliveryMetadataRuntimeSafety.repaired.bpm} BPM / ${deliveryMetadataRuntimeSafety.repaired.key}** across WAV timing, MIDI metadata, Handoff Sheet, delivery manifest, and durable project JSON. Direct and imported WAV/MIDI bytes match without mutating the source object.\n\n| Local WAV | Local MIDI | Delivered | Peak | RMS | MIDI bytes | WAV parity | MIDI parity | Tail content | Zero end |\n|---|---|---:|---:|---:|---:|---|---|---|---|\n| \`${deliveryMetadataRuntimeSafety.artifact.path}\` | \`${deliveryMetadataRuntimeSafety.midi.path}\` | ${deliveryMetadataRuntimeSafety.artifact.decoded.durationSeconds.toFixed(2)} s | ${deliveryMetadataRuntimeSafety.artifact.decoded.peakDb.toFixed(2)} dB | ${deliveryMetadataRuntimeSafety.artifact.decoded.rmsDb.toFixed(2)} dB | ${deliveryMetadataRuntimeSafety.midi.bytes} | ${deliveryMetadataRuntimeSafety.artifact.sha256 === deliveryMetadataRuntimeSafety.importedWavSha256 ? "yes" : "no"} | ${deliveryMetadataRuntimeSafety.midi.sha256 === deliveryMetadataRuntimeSafety.midi.importedSha256 ? "yes" : "no"} | ${deliveryMetadataRuntimeSafety.artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${deliveryMetadataRuntimeSafety.artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} |\n\n` +
    `## Handoff Runtime Safety\n\nA direct parser-bypass arrangement and Session Brief repaired from **${handoffRuntimeSafety.source.bars} bars / ${handoffRuntimeSafety.source.energy * 100}% / ${handoffRuntimeSafety.source.notesLength} note characters** to **${handoffRuntimeSafety.repaired.bars} bar / ${handoffRuntimeSafety.repaired.energy * 100}% / ${handoffRuntimeSafety.repaired.notesLength} characters**. Multiline brief text collapses to safe single-line fields, and direct/imported WAV, MIDI, and Handoff output match without source mutation.\n\n| Local WAV | Local MIDI | Local Handoff | Delivered | Peak | RMS | Handoff bytes | Tail content | Zero end |\n|---|---|---|---:|---:|---:|---:|---|---|\n| \`${handoffRuntimeSafety.artifact.path}\` | \`${handoffRuntimeSafety.midi.path}\` | \`${handoffRuntimeSafety.handoff.path}\` | ${handoffRuntimeSafety.artifact.decoded.durationSeconds.toFixed(2)} s | ${handoffRuntimeSafety.artifact.decoded.peakDb.toFixed(2)} dB | ${handoffRuntimeSafety.artifact.decoded.rmsDb.toFixed(2)} dB | ${handoffRuntimeSafety.handoff.bytes} | ${handoffRuntimeSafety.artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${handoffRuntimeSafety.artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} |\n\n` +
    `## Snapshot Runtime Safety\n\nA direct snapshot source of **${snapshotRuntimeSafety.source.bpm} BPM / ${snapshotRuntimeSafety.source.key} / ${snapshotRuntimeSafety.source.bars} bars / ${snapshotRuntimeSafety.source.energy * 100}% / ${snapshotRuntimeSafety.source.notesLength} note characters** is stored and restored as **${snapshotRuntimeSafety.repaired.bpm} BPM / ${snapshotRuntimeSafety.repaired.key} / ${snapshotRuntimeSafety.repaired.bars} bar / ${snapshotRuntimeSafety.repaired.energy * 100}% / ${snapshotRuntimeSafety.repaired.notesLength} characters**. The producer-facing summary is **${snapshotRuntimeSafety.summary}**, and restored/direct versus imported WAV, MIDI, and Handoff output match without source mutation.\n\n| Local WAV | Local MIDI | Local Handoff | Delivered | Peak | RMS | Handoff bytes | Tail content | Zero end |\n|---|---|---|---:|---:|---:|---:|---|---|\n| \`${snapshotRuntimeSafety.artifact.path}\` | \`${snapshotRuntimeSafety.midi.path}\` | \`${snapshotRuntimeSafety.handoff.path}\` | ${snapshotRuntimeSafety.artifact.decoded.durationSeconds.toFixed(2)} s | ${snapshotRuntimeSafety.artifact.decoded.peakDb.toFixed(2)} dB | ${snapshotRuntimeSafety.artifact.decoded.rmsDb.toFixed(2)} dB | ${snapshotRuntimeSafety.handoff.bytes} | ${snapshotRuntimeSafety.artifact.decoded.postBoundaryNonZeroSamples > 0 ? "yes" : "no"} | ${snapshotRuntimeSafety.artifact.decoded.finalFramePeak === 0 ? "yes" : "no"} |\n\n` +
    `## Export Tail Safety\n\nExpected tail length and digital-zero ending: **${report.tailSafety.allArtifactsSafe ? "yes" : "no"}** (${report.tailSafety.zeroEndedCount}/${report.tailSafety.artifactCount} artifacts). Full mixes preserving post-boundary content: **${report.tailSafety.fullMixTailContentCount}/${report.tailSafety.fullMixCount}**.\n\n` +
    `## Render Isolation\n\nUnrelated edits isolated: **${report.renderIsolation.unrelatedEditsIsolated ? "yes" : "no"}** (${report.renderIsolation.unrelatedEditCount} cases). Target mixer sensitivity: **${report.renderIsolation.targetMixerSensitive ? "yes" : "no"}**. Noise-sound sensitivity: **${report.renderIsolation.noiseSoundSensitive ? "yes" : "no"}**. Drums solo equals Drums stem: **${report.renderIsolation.soloMatchesStem ? "yes" : "no"}**.\n\n` +
    `Checks: canonical stereo PCM WAV, 44.1kHz, 24-bit, complete frames, real lower-byte activity, audible decoded PCM, musical-boundary tail preservation, terminal digital zero, analysis agreement, ceiling safety, no digital full-scale samples, unique stems, and byte-identical immediate rerender.\n`;
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
const cases = [];
for (const smokeCase of buildCases()) cases.push(await runCase(smokeCase));
const styleMatrix = [];
for (const profile of workstation.styleProfiles) styleMatrix.push(await runStyleMatrixCase(profile));
check(new Set(styleMatrix.map((style) => style.artifact.sha256)).size === styleMatrix.length, "style matrix full mixes must all contain distinct PCM");
const unicodeFileIdentity = [];
for (const identityCase of [
  { id: "seoul-beat", title: "서울 비트", expectedStem: "서울-비트", styleId: "lofi" },
  { id: "busan-beat", title: "부산 비트", expectedStem: "부산-비트", styleId: "k_hiphop_rnb" }
]) unicodeFileIdentity.push(await runUnicodeFileIdentityCase(identityCase));
check(new Set(unicodeFileIdentity.map((identity) => identity.fileStem)).size === unicodeFileIdentity.length, "unicode-file-identity: distinct Korean titles must retain distinct shared stems");
check(new Set(unicodeFileIdentity.map((identity) => identity.artifact.path)).size === unicodeFileIdentity.length, "unicode-file-identity: distinct Korean titles must write distinct WAV paths");
const projectTitleIntegrity = await runProjectTitleIntegrityCase();
const projectImportSafety = await runProjectImportSafetyCase();
const projectPitchSafety = await runProjectPitchSafetyCase();
const timelineBoundarySafety = await runTimelineBoundarySafetyCase();
const eventDensitySafety = await runEventDensitySafetyCase();
const mixerTopologySafety = await runMixerTopologySafetyCase();
const snapshotIdentitySafety = await runSnapshotIdentitySafetyCase();
const musicalControlRangeSafety = await runMusicalControlRangeSafetyCase();
const swingPlaybackTiming = await runSwingPlaybackTimingCase();
const masterCeilingRuntimeSafety = await runMasterCeilingRuntimeSafetyCase();
const deliveryMetadataRuntimeSafety = await runDeliveryMetadataRuntimeSafetyCase();
const handoffRuntimeSafety = await runHandoffRuntimeSafetyCase();
const snapshotRuntimeSafety = await runSnapshotRuntimeSafetyCase();
const renderIsolation = await validateRenderIsolation();
const allArtifacts = [...cases.flatMap((smokeCase) => smokeCase.artifacts), ...styleMatrix.map((style) => style.artifact), ...unicodeFileIdentity.map((identity) => identity.artifact), projectTitleIntegrity.artifact, projectImportSafety.artifact, projectPitchSafety.artifact, timelineBoundarySafety.artifact, eventDensitySafety.artifact, mixerTopologySafety.artifact, ...snapshotIdentitySafety.artifacts, musicalControlRangeSafety.artifact, ...swingPlaybackTiming.artifacts, masterCeilingRuntimeSafety.artifact, deliveryMetadataRuntimeSafety.artifact, handoffRuntimeSafety.artifact, snapshotRuntimeSafety.artifact];
const fullMixArtifacts = [...cases.map((smokeCase) => smokeCase.artifacts[0]), ...styleMatrix.map((style) => style.artifact), ...unicodeFileIdentity.map((identity) => identity.artifact), projectTitleIntegrity.artifact, projectImportSafety.artifact, projectPitchSafety.artifact, timelineBoundarySafety.artifact, eventDensitySafety.artifact, mixerTopologySafety.artifact, ...snapshotIdentitySafety.artifacts, musicalControlRangeSafety.artifact, ...swingPlaybackTiming.artifacts, masterCeilingRuntimeSafety.artifact, deliveryMetadataRuntimeSafety.artifact, handoffRuntimeSafety.artifact, snapshotRuntimeSafety.artifact];
const tailSafety = {
  artifactCount: allArtifacts.length,
  zeroEndedCount: allArtifacts.filter((artifact) => artifact.decoded.finalFramePeak === 0).length,
  allArtifactsSafe: allArtifacts.every((artifact) => artifact.decoded.tailDurationSeconds > 0 && artifact.decoded.finalFramePeak === 0),
  fullMixCount: fullMixArtifacts.length,
  fullMixTailContentCount: fullMixArtifacts.filter((artifact) => artifact.decoded.postBoundaryNonZeroSamples > 0).length
};

const report = {
  schemaVersion: 17,
  status: failures.length === 0 ? "passed" : "failed",
  app: { name: appName, version: packageJson.version, platformArch },
  boundaries: {
    directCompositionOnly: true, importedAudioUsed: false, privateProjectDataUsed: false,
    networkUsed: false, externalReleaseClaimed: false, humanListeningReplaced: false
  },
  cases,
  styleMatrix,
  unicodeFileIdentity,
  projectTitleIntegrity,
  projectImportSafety,
  projectPitchSafety,
  timelineBoundarySafety,
  eventDensitySafety,
  mixerTopologySafety,
  snapshotIdentitySafety,
  musicalControlRangeSafety,
  swingPlaybackTiming,
  masterCeilingRuntimeSafety,
  deliveryMetadataRuntimeSafety,
  handoffRuntimeSafety,
  snapshotRuntimeSafety,
  tailSafety,
  renderIsolation,
  failures
};
await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(reportMarkdownPath, markdownReport(report));

if (failures.length > 0) {
  console.error("GrooveForge sample audio QA failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error(`Report: ${relative(reportMarkdownPath)}`);
  process.exit(1);
}

console.log("GrooveForge sample audio QA passed.");
console.log(`Audience cases: ${cases.length}; style matrix: ${styleMatrix.length}/${workstation.styleProfiles.length}; Unicode file identity: ${unicodeFileIdentity.length}/2; title integrity: 1/1; import safety: 1/1; pitch safety: 1/1; timeline safety: 1/1; event density safety: 1/1; mixer topology safety: 1/1; snapshot identity safety: 2/2; musical control range safety: 1/1; swing playback timing: 2/2; master ceiling runtime safety: 1/1; master ceiling draft lifecycle: 1/1; delivery metadata runtime safety: 1/1; Handoff runtime safety: 1/1; snapshot runtime safety: 1/1; playable WAV files: ${allArtifacts.length}`);
console.log(`Export tail safety: ${tailSafety.zeroEndedCount}/${tailSafety.artifactCount} artifacts end at digital zero; full-mix tail content ${tailSafety.fullMixTailContentCount}/${tailSafety.fullMixCount}`);
console.log(`Render isolation: ${renderIsolation.unrelatedEditCount}/${renderIsolation.unrelatedEditCount} unrelated edits isolated; target mixer sensitive ${renderIsolation.targetMixerSensitive ? "yes" : "no"}; noise sound sensitive ${renderIsolation.noiseSoundSensitive ? "yes" : "no"}; solo/stem match ${renderIsolation.soloMatchesStem ? "yes" : "no"}`);
for (const smokeCase of cases) {
  const mix = smokeCase.artifacts[0];
  console.log(`${smokeCase.id}: ${mix.path} (${mix.decoded.durationSeconds.toFixed(2)}s, peak ${mix.decoded.peakDb.toFixed(2)} dB, RMS ${mix.decoded.rmsDb.toFixed(2)} dB)`);
}
console.log(`Report: ${relative(reportMarkdownPath)}`);
