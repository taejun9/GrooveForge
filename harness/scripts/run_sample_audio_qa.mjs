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
  check(byteRate === 176400, `${label}: byte rate must be 176400`);
  check(blockAlign === 4, `${label}: block alignment must be 4 bytes`);
  check(bitsPerSample === 16, `${label}: samples must be 16-bit`);
  check(ascii(36, 4) === "data", `${label}: missing data chunk`);
  check(dataSize === bytes.byteLength - 44, `${label}: data size does not match file length`);
  check(dataSize % blockAlign === 0, `${label}: data size must contain complete stereo frames`);

  let peak = 0;
  let squareSum = 0;
  let nonZeroSamples = 0;
  let fullScaleSamples = 0;
  let postBoundaryNonZeroSamples = 0;
  let postBoundaryPeak = 0;
  const channelNonZeroSamples = Array.from({ length: channels }, () => 0);
  const sampleCount = Math.floor(dataSize / 2);
  const frames = dataSize / blockAlign;
  const musicalBoundaryFrame = Math.max(0, Math.min(frames, Math.round(musicalDurationSeconds * sampleRate)));
  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    const raw = view.getInt16(44 + sampleIndex * 2, true);
    const normalized = raw < 0 ? raw / 32768 : raw / 32767;
    const absolute = Math.abs(normalized);
    peak = Math.max(peak, absolute);
    squareSum += normalized * normalized;
    if (raw !== 0) {
      nonZeroSamples += 1;
      channelNonZeroSamples[sampleIndex % channels] += 1;
    }
    if (Math.floor(sampleIndex / channels) >= musicalBoundaryFrame) {
      if (raw !== 0) postBoundaryNonZeroSamples += 1;
      postBoundaryPeak = Math.max(postBoundaryPeak, absolute);
    }
    if (raw === -32768 || raw === 32767) fullScaleSamples += 1;
  }

  const rms = sampleCount > 0 ? Math.sqrt(squareSum / sampleCount) : 0;
  let finalFramePeak = 0;
  for (let channel = 0; channel < channels && frames > 0; channel += 1) {
    const raw = view.getInt16(44 + ((frames - 1) * channels + channel) * 2, true);
    const normalized = raw < 0 ? raw / 32768 : raw / 32767;
    finalFramePeak = Math.max(finalFramePeak, Math.abs(normalized));
  }
  return {
    audioFormat, channels, sampleRate, byteRate, blockAlign, bitsPerSample, dataSize, frames,
    durationSeconds: frames / sampleRate,
    peakDb: db(peak),
    rmsDb: db(rms),
    nonZeroSamples,
    nonZeroPercent: sampleCount > 0 ? (nonZeroSamples / sampleCount) * 100 : 0,
    channelNonZeroSamples,
    fullScaleSamples,
    musicalDurationSeconds,
    tailDurationSeconds: frames / sampleRate - musicalDurationSeconds,
    postBoundaryNonZeroSamples,
    postBoundaryPeak,
    finalFramePeak
  };
}

function validateDecodedAudio(decoded, analysis, expectedTailDurationSeconds, requireTailContent, label) {
  const durationTolerance = 1 / decoded.sampleRate + Number.EPSILON;
  check(Math.abs(decoded.durationSeconds - analysis.durationSeconds) <= durationTolerance, `${label}: decoded duration must match renderer analysis within one frame`);
  check(Math.abs(decoded.tailDurationSeconds - expectedTailDurationSeconds) <= durationTolerance, `${label}: decoded WAV must preserve the expected export tail within one frame`);
  check(decoded.nonZeroSamples > 0, `${label}: decoded PCM must not be silent`);
  check(decoded.nonZeroPercent >= 0.01, `${label}: decoded PCM nonzero population is unexpectedly sparse`);
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
      nonZeroPercent: round(decoded.nonZeroPercent), postBoundaryPeak: round(decoded.postBoundaryPeak), finalFramePeak: round(decoded.finalFramePeak)
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
    `## Export Tail Safety\n\nExpected tail length and digital-zero ending: **${report.tailSafety.allArtifactsSafe ? "yes" : "no"}** (${report.tailSafety.zeroEndedCount}/${report.tailSafety.artifactCount} artifacts). Full mixes preserving post-boundary content: **${report.tailSafety.fullMixTailContentCount}/${report.tailSafety.fullMixCount}**.\n\n` +
    `## Render Isolation\n\nUnrelated edits isolated: **${report.renderIsolation.unrelatedEditsIsolated ? "yes" : "no"}** (${report.renderIsolation.unrelatedEditCount} cases). Target mixer sensitivity: **${report.renderIsolation.targetMixerSensitive ? "yes" : "no"}**. Noise-sound sensitivity: **${report.renderIsolation.noiseSoundSensitive ? "yes" : "no"}**. Drums solo equals Drums stem: **${report.renderIsolation.soloMatchesStem ? "yes" : "no"}**.\n\n` +
    `Checks: canonical stereo PCM WAV, 44.1kHz, 16-bit, complete frames, audible decoded PCM, musical-boundary tail preservation, terminal digital zero, analysis agreement, ceiling safety, no digital full-scale samples, unique stems, and byte-identical immediate rerender.\n`;
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
const renderIsolation = await validateRenderIsolation();
const allArtifacts = [...cases.flatMap((smokeCase) => smokeCase.artifacts), ...styleMatrix.map((style) => style.artifact), ...unicodeFileIdentity.map((identity) => identity.artifact), projectTitleIntegrity.artifact, projectImportSafety.artifact, projectPitchSafety.artifact, timelineBoundarySafety.artifact, eventDensitySafety.artifact, mixerTopologySafety.artifact];
const fullMixArtifacts = [...cases.map((smokeCase) => smokeCase.artifacts[0]), ...styleMatrix.map((style) => style.artifact), ...unicodeFileIdentity.map((identity) => identity.artifact), projectTitleIntegrity.artifact, projectImportSafety.artifact, projectPitchSafety.artifact, timelineBoundarySafety.artifact, eventDensitySafety.artifact, mixerTopologySafety.artifact];
const tailSafety = {
  artifactCount: allArtifacts.length,
  zeroEndedCount: allArtifacts.filter((artifact) => artifact.decoded.finalFramePeak === 0).length,
  allArtifactsSafe: allArtifacts.every((artifact) => artifact.decoded.tailDurationSeconds > 0 && artifact.decoded.finalFramePeak === 0),
  fullMixCount: fullMixArtifacts.length,
  fullMixTailContentCount: fullMixArtifacts.filter((artifact) => artifact.decoded.postBoundaryNonZeroSamples > 0).length
};

const report = {
  schemaVersion: 10,
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
console.log(`Audience cases: ${cases.length}; style matrix: ${styleMatrix.length}/${workstation.styleProfiles.length}; Unicode file identity: ${unicodeFileIdentity.length}/2; title integrity: 1/1; import safety: 1/1; pitch safety: 1/1; timeline safety: 1/1; event density safety: 1/1; mixer topology safety: 1/1; playable WAV files: ${allArtifacts.length}`);
console.log(`Export tail safety: ${tailSafety.zeroEndedCount}/${tailSafety.artifactCount} artifacts end at digital zero; full-mix tail content ${tailSafety.fullMixTailContentCount}/${tailSafety.fullMixCount}`);
console.log(`Render isolation: ${renderIsolation.unrelatedEditCount}/${renderIsolation.unrelatedEditCount} unrelated edits isolated; target mixer sensitive ${renderIsolation.targetMixerSensitive ? "yes" : "no"}; noise sound sensitive ${renderIsolation.noiseSoundSensitive ? "yes" : "no"}; solo/stem match ${renderIsolation.soloMatchesStem ? "yes" : "no"}`);
for (const smokeCase of cases) {
  const mix = smokeCase.artifacts[0];
  console.log(`${smokeCase.id}: ${mix.path} (${mix.decoded.durationSeconds.toFixed(2)}s, peak ${mix.decoded.peakDb.toFixed(2)} dB, RMS ${mix.decoded.rmsDb.toFixed(2)} dB)`);
}
console.log(`Report: ${relative(reportMarkdownPath)}`);
