#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const personaDeliveryRoot = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-persona-delivery-packages`);
const personaReadinessMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-persona-readiness.md`);
const personaReadinessJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-persona-readiness.json`);
const failures = [];
const forbiddenSamplingText = /AudioClipEvent|sample import|sample browser|chop pads|sampler track|audio clip/i;
const expectedPersonaArtifactLabels = ["Project file", "Full mix WAV", "Drums stem WAV", "808 stem WAV", "Synth stem WAV", "Chords stem WAV", "Arrangement MIDI", "Handoff Sheet"];
const expectedPersonaArtifactCount = expectedPersonaArtifactLabels.length;

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function ascii(bytes, start, length) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function blobToBuffer(blob) {
  return Buffer.from(await blob.arrayBuffer());
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function checkNoSamplingText(text, label) {
  check(!forbiddenSamplingText.test(text), `${label} should keep sampling secondary and avoid imported-audio scope`);
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

function installBrowserMocks() {
  const storage = new Map();
  const localStorage = {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    }
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      addEventListener() {},
      clearTimeout,
      grooveforge: { appKind: "desktop" },
      localStorage,
      removeEventListener() {},
      setTimeout
    }
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {}
  });
}

function checkRenderedGroup(html, label, needles) {
  const missing = needles.filter((needle) => !html.includes(needle));
  for (const needle of missing) {
    check(false, `${label} should include ${needle}`);
  }
  return {
    label,
    ready: missing.length === 0,
    requiredSignals: needles,
    requiredSignalCount: needles.length,
    presentSignalCount: needles.length - missing.length,
    missingSignals: missing,
    valueRecorded: false
  };
}

function styleProfile(workstation, styleId) {
  return workstation.styleProfiles.find((profile) => profile.id === styleId) ?? workstation.styleProfiles[0];
}

function cloneProject(workstation, project) {
  return workstation.parseProjectFile(workstation.serializeProjectFile(project));
}

function patternEventCounts(workstation, pattern) {
  const drumHits = workstation.drumLanes.reduce(
    (count, lane) => count + pattern.drumPattern[lane].filter(Boolean).length,
    0
  );
  return {
    drums: drumHits,
    bass: pattern.bassNotes.length,
    melody: pattern.melodyNotes.length,
    chords: pattern.chordEvents.length
  };
}

function projectEventCounts(workstation, project) {
  return workstation.patternSlots.reduce(
    (totals, slot) => {
      const counts = patternEventCounts(workstation, project.patterns[slot]);
      return {
        drums: totals.drums + counts.drums,
        bass: totals.bass + counts.bass,
        melody: totals.melody + counts.melody,
        chords: totals.chords + counts.chords
      };
    },
    { drums: 0, bass: 0, melody: 0, chords: 0 }
  );
}

function usedPatterns(project) {
  return new Set(project.arrangement.map((block) => block.pattern));
}

function createBeginnerGuidedFirstBeat(workstation) {
  const styleId = "lofi";
  const key = "A minor";
  const style = styleProfile(workstation, styleId);
  let project = {
    ...cloneProject(workstation, workstation.starterProject),
    title: "Persona Beginner First Beat",
    mode: "guided",
    bpm: 86,
    key,
    styleId,
    selectedPattern: "A",
    swing: style.defaultSwing,
    sound: workstation.soundPresetDesign(workstation.styleSoundPreset(styleId)),
    patterns: workstation.createStylePatternSet(styleId, key),
    sessionBrief: {
      artist: "First-time composer",
      vibe: "guided direct-composition starter",
      reference: "local first beat",
      notes: "Beginner path covers setup, compose, arrange, mix, master, and deliver without imported audio."
    },
    snapshots: []
  };

  project = {
    ...project,
    patterns: {
      ...project.patterns,
      A: {
        ...workstation.applyPatternFillPreset(workstation.applyDrumGroovePreset(project.patterns.A, "pocket"), "melody_turn", key),
        chordEvents: workstation.createChordProgressionPreset("moody", key)
      },
      B: workstation.applyPatternFillPreset(workstation.createPatternVariation(project.patterns.B, "hook"), "bass_pickup", key),
      C: workstation.applyPatternFillPreset(workstation.createPatternVariation(project.patterns.C, "breakdown"), "clear_tail", key)
    }
  };

  return workstation.applyDeliveryTarget(project, "starter_sketch");
}

function createProducerFastPass(workstation) {
  let project = cloneProject(workstation, workstation.starterProject);
  project = workstation.applyBeatBlueprint(project, "club_bounce");
  project = workstation.retargetProjectKey(project, "C minor");
  project = {
    ...project,
    title: "Persona Producer Fast Pass",
    mode: "studio",
    selectedPattern: "B",
    sessionBrief: {
      artist: "Professional producer",
      vibe: "fast club-ready beat-store pass",
      reference: "working producer arrangement scan",
      notes: "Studio path covers blueprint, key retarget, pattern variation, delivery target, mix/master, and handoff."
    },
    snapshots: []
  };
  project = {
    ...project,
    patterns: {
      ...project.patterns,
      A: workstation.applyDrumGroovePreset(project.patterns.A, "push"),
      B: {
        ...workstation.applyPatternFillPreset(
          workstation.applyPatternFillPreset(workstation.createPatternVariation(project.patterns.B, "hook"), "drum_fill", project.key),
          "melody_turn",
          project.key
        ),
        chordEvents: workstation.createChordProgressionPreset("lift", project.key)
      },
      C: {
        ...workstation.applyPatternFillPreset(workstation.createPatternVariation(project.patterns.C, "switchup"), "bass_pickup", project.key),
        chordEvents: workstation.createChordProgressionPreset("bounce", project.key)
      }
    }
  };
  project = workstation.applyDeliveryTarget(project, "beat_store");
  return workstation.applyMasterAutomationPreset(project, "intro_outro");
}

function validateWorkflowProject({ workstation, render, midi, handoff, label, persona, project, expected }) {
  const projectJson = workstation.serializeProjectFile(project);
  const reopened = workstation.parseProjectFile(projectJson);
  const counts = projectEventCounts(workstation, reopened);
  const patterns = usedPatterns(reopened);
  const bars = workstation.arrangementTotalBars(reopened);
  const duration = bars * workstation.stepsPerBar * workstation.projectStepDurationSeconds(reopened);
  const analysis = render.analyzeExport(reopened);
  const stemAnalyses = render.analyzeStemExports(reopened);
  const midiBytes = midi.createMidiFile(reopened);
  const handoffSheet = handoff.createHandoffSheet(reopened, analysis, stemAnalyses);
  const target = workstation.activeDeliveryTarget(reopened);

  check(reopened.mode === expected.mode, `${label} mode should be ${expected.mode}`);
  check(reopened.styleId === expected.styleId, `${label} style should be ${expected.styleId}`);
  check(reopened.key === expected.key, `${label} key should be ${expected.key}`);
  check(reopened.bpm === expected.bpm, `${label} BPM should be ${expected.bpm}`);
  check(reopened.selectedPattern === expected.selectedPattern, `${label} selected Pattern should be ${expected.selectedPattern}`);
  check(reopened.deliveryTarget === expected.deliveryTarget, `${label} delivery target should be ${expected.deliveryTarget}`);
  check(target.preferredMasterPreset === reopened.masterPreset, `${label} master preset should match delivery target`);
  check(reopened.masterCeilingDb === workstation.masterPresetCeilingDb(reopened.masterPreset), `${label} master ceiling should match master preset`);
  check(bars >= expected.minBars, `${label} should have at least ${expected.minBars} bars`);
  for (const slot of expected.usedPatterns) {
    check(patterns.has(slot), `${label} arrangement should use Pattern ${slot}`);
  }
  check(counts.drums >= expected.minDrums, `${label} should have at least ${expected.minDrums} drum hits`);
  check(counts.bass >= expected.minBass, `${label} should have at least ${expected.minBass} bass notes`);
  check(counts.melody >= expected.minMelody, `${label} should have at least ${expected.minMelody} melody notes`);
  check(counts.chords >= expected.minChords, `${label} should have at least ${expected.minChords} chord events`);
  check(reopened.mixer.every((channel) => !channel.muted && !channel.solo), `${label} mixer should be audible without solo/mute locks`);
  check(!forbiddenSamplingText.test(projectJson), `${label} project JSON should keep sampling secondary and avoid imported-audio scope`);
  check(analysis.status !== "Silent", `${label} full mix should not be silent`);
  check(analysis.sampleRate === 44100, `${label} full mix sample rate should be 44100`);
  check(analysis.channels === 2, `${label} full mix should be stereo`);
  check(Math.abs(analysis.durationSeconds - duration) < 0.05, `${label} full mix duration should match arrangement`);
  for (const track of render.stemTrackIds) {
    const stem = stemAnalyses[track];
    check(stem.status !== "Silent", `${label} ${track} stem should not be silent`);
    check(Math.abs(stem.durationSeconds - duration) < 0.05, `${label} ${track} stem duration should match arrangement`);
  }
  check(ascii(midiBytes, 0, 4) === "MThd", `${label} MIDI should include an MThd header`);
  check(midiBytes.byteLength > 1000, `${label} MIDI should include arrangement events`);
  check(handoffSheet.includes("GrooveForge Handoff Sheet"), `${label} Handoff Sheet should include title`);
  check(handoffSheet.includes("Delivery Target"), `${label} Handoff Sheet should include Delivery Target`);
  check(handoffSheet.includes(target.name), `${label} Handoff Sheet should include target name`);
  check(handoffSheet.includes("Session Brief"), `${label} Handoff Sheet should include Session Brief`);
  check(handoffSheet.includes("Export Meter"), `${label} Handoff Sheet should include Export Meter`);
  check(handoffSheet.includes("Stem Meter"), `${label} Handoff Sheet should include Stem Meter`);
  check(!forbiddenSamplingText.test(handoffSheet), `${label} Handoff Sheet should keep sampling secondary and avoid imported-audio scope`);

  return {
    label,
    persona,
    ready: true,
    mode: reopened.mode,
    styleId: reopened.styleId,
    bpm: reopened.bpm,
    key: reopened.key,
    bars,
    deliveryTarget: target.name,
    masterPreset: reopened.masterPreset,
    mixStatus: analysis.status,
    projectBytes: projectJson.length,
    midiBytes: midiBytes.byteLength,
    eventCounts: counts,
    usedPatterns: [...patterns].sort(),
    valueRecorded: false
  };
}

function packageManifestPath(packageDir) {
  return path.join(packageDir, "manifest.json");
}

function packageMarkdownPath(packageDir) {
  return path.join(packageDir, "manifest.md");
}

function artifactRow(label, kind, filePath, bytes) {
  return {
    label,
    kind,
    path: relative(filePath),
    bytes: bytes.byteLength,
    sha256: sha256(bytes),
    valueRecorded: false
  };
}

function resolveManifestPath(manifestPath) {
  const resolved = path.resolve(root, manifestPath);
  const relativeToRoot = path.relative(root, resolved);
  check(Boolean(manifestPath) && !relativeToRoot.startsWith("..") && !path.isAbsolute(relativeToRoot), `persona package manifest should stay inside ${relative(root) || "repo root"}`);
  return resolved;
}

function resolvePackageArtifactPath(packageDir, artifactPath, label) {
  const resolved = path.resolve(root, artifactPath);
  const relativeToPackage = path.relative(packageDir, resolved);
  check(
    Boolean(artifactPath) && !relativeToPackage.startsWith("..") && !path.isAbsolute(relativeToPackage),
    `${label} reopened artifact path should stay inside its persona package`
  );
  return resolved;
}

function artifactByLabel(manifest, label) {
  return manifest.artifacts.find((artifact) => artifact.label === label);
}

async function writePersonaArtifact(packageDir, label, kind, fileName, bytes) {
  const filePath = path.join(packageDir, fileName);
  await writeFile(filePath, bytes);
  return artifactRow(label, kind, filePath, bytes);
}

function buildPersonaDeliveryMarkdown(manifest) {
  const artifactRows = manifest.artifacts
    .map((artifact) => `| ${escapeCell(artifact.label)} | ${escapeCell(artifact.kind)} | ${artifact.bytes} | \`${artifact.sha256.slice(0, 16)}...\` | \`${escapeCell(artifact.path)}\` | no |`)
    .join("\n");

  return `# ${appName} ${manifest.version} ${manifest.platform}-${manifest.arch} Persona Delivery Package

## Status

- Persona delivery package ready: ${manifest.personaDeliveryPackageReady ? "yes" : "no"}
- Persona: ${manifest.persona}
- Workflow: ${manifest.workflowLabel}
- Mode: ${manifest.project.mode}
- Style: ${manifest.project.styleId}
- BPM/key: ${manifest.project.bpm} / ${manifest.project.key}
- Arrangement: ${manifest.project.arrangementBars} bars
- Delivery target: ${manifest.project.deliveryTarget}
- Artifacts: ${manifest.artifactCount}
- Total bytes: ${manifest.totalBytes}
- Private values recorded: no
- Network attempted: no
- External distribution claimed: no

## Artifacts

| artifact | kind | bytes | sha256 | path | value recorded |
|---|---|---:|---|---|---:|
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

This package does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

async function writePersonaDeliveryPackage({ workstation, render, midi, handoff, workflowRow, project, packageSlug }) {
  const packageDir = path.join(personaDeliveryRoot, packageSlug);
  const manifestJsonPath = packageManifestPath(packageDir);
  const manifestMarkdownPath = packageMarkdownPath(packageDir);
  const projectContents = workstation.serializeProjectFile(project);
  const reopened = workstation.parseProjectFile(projectContents);
  const analysis = render.analyzeExport(reopened);
  const stemAnalyses = render.analyzeStemExports(reopened);
  const handoffContents = handoff.createHandoffSheet(reopened, analysis, stemAnalyses);
  const mixBytes = await blobToBuffer(render.createMixWavBlob(reopened));
  const midiBytes = Buffer.from(midi.createMidiFile(reopened));
  const stemFileNames = render.stemWavFileNames(reopened);
  const stemArtifacts = [];

  await rm(packageDir, { recursive: true, force: true });
  await mkdir(packageDir, { recursive: true });

  const artifacts = [
    await writePersonaArtifact(packageDir, "Project file", "project-json", workstation.projectFileName(reopened), Buffer.from(projectContents, "utf8")),
    await writePersonaArtifact(packageDir, "Full mix WAV", "wav", render.mixWavFileName(reopened), mixBytes)
  ];

  for (const [index, track] of render.stemTrackIds.entries()) {
    const stemBytes = await blobToBuffer(render.createStemWavBlob(reopened, track));
    stemArtifacts.push({ track, bytes: stemBytes, fileName: stemFileNames[index] });
    artifacts.push(await writePersonaArtifact(packageDir, `${render.stemTrackLabel(track)} stem WAV`, "wav-stem", stemFileNames[index], stemBytes));
  }

  artifacts.push(await writePersonaArtifact(packageDir, "Arrangement MIDI", "midi", midi.midiFileName(reopened), midiBytes));
  artifacts.push(await writePersonaArtifact(packageDir, "Handoff Sheet", "handoff", handoff.handoffSheetFileName(reopened), Buffer.from(handoffContents, "utf8")));

  const manifest = {
    appName,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    persona: workflowRow.persona,
    workflowLabel: workflowRow.label,
    packageRoot: relative(packageDir),
    manifestJsonPath: relative(manifestJsonPath),
    manifestMarkdownPath: relative(manifestMarkdownPath),
    productScope: "local direct-composition delivery package for persona readiness; sampling is secondary",
    project: {
      title: reopened.title,
      mode: reopened.mode,
      styleId: reopened.styleId,
      bpm: reopened.bpm,
      key: reopened.key,
      selectedPattern: reopened.selectedPattern,
      arrangementBars: workstation.arrangementTotalBars(reopened),
      deliveryTarget: workstation.activeDeliveryTarget(reopened).name,
      masterPreset: reopened.masterPreset
    },
    mixAnalysis: analysis,
    stemAnalyses,
    artifacts,
    artifactCount: artifacts.length,
    totalBytes: artifacts.reduce((total, artifact) => total + artifact.bytes, 0),
    expectedArtifactCount: expectedPersonaArtifactLabels.length,
    stemArtifactCount: stemArtifacts.length,
    projectBytes: projectContents.length,
    mixBytes: mixBytes.byteLength,
    midiBytes: midiBytes.byteLength,
    handoffSheetBytes: handoffContents.length,
    personaDeliveryPackageReady: true,
    localFirst: true,
    samplingSecondary: true,
    valueRecorded: false,
    localEnvValueRecorded: false,
    privateValuesRecorded: false,
    privateBeatRecorded: false,
    realUserAudioRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    claimedExternalDistribution: false
  };

  const markdown = buildPersonaDeliveryMarkdown(manifest);
  await writeFile(manifestJsonPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(manifestMarkdownPath, markdown, "utf8");

  check(workstation.parseProjectFile(projectContents).title === reopened.title, `${workflowRow.label} package project file should roundtrip`);
  check(analysis.status !== "Silent", `${workflowRow.label} package mix should be audible`);
  check(render.stemTrackIds.every((track) => stemAnalyses[track].status !== "Silent"), `${workflowRow.label} package stems should be audible`);
  checkWavBytes(mixBytes, `${workflowRow.label} package full mix`);
  for (const stem of stemArtifacts) {
    checkWavBytes(stem.bytes, `${workflowRow.label} package ${stem.track} stem`);
  }
  checkMidiBytes(midiBytes, `${workflowRow.label} package arrangement`);
  check(projectContents.endsWith("\n"), `${workflowRow.label} package project file should end with newline`);
  check(handoffContents.endsWith("\n"), `${workflowRow.label} package Handoff Sheet should end with newline`);
  check(handoffContents.includes("GrooveForge Handoff Sheet"), `${workflowRow.label} package Handoff Sheet should include title`);
  check(handoffContents.includes("Export Meter"), `${workflowRow.label} package Handoff Sheet should include export meter`);
  check(handoffContents.includes("Stem Meter"), `${workflowRow.label} package Handoff Sheet should include stem meter`);
  check(manifest.artifactCount === expectedPersonaArtifactLabels.length, `${workflowRow.label} package should include project, mix, four stems, MIDI, and Handoff artifacts`);
  check(expectedPersonaArtifactLabels.every((label) => manifest.artifacts.some((artifact) => artifact.label === label)), `${workflowRow.label} package should include all expected artifact labels`);
  check(manifest.artifacts.every((artifact) => artifact.bytes > 0), `${workflowRow.label} package artifacts should be non-empty`);
  check(manifest.artifacts.every((artifact) => /^[a-f0-9]{64}$/.test(artifact.sha256)), `${workflowRow.label} package artifacts should include SHA-256 checksums`);
  check(manifest.personaDeliveryPackageReady === true, `${workflowRow.label} persona delivery package should be ready`);
  check(manifest.localFirst === true, `${workflowRow.label} persona delivery package should keep local-first posture`);
  check(manifest.samplingSecondary === true, `${workflowRow.label} persona delivery package should keep sampling secondary`);
  check(manifest.valueRecorded === false, `${workflowRow.label} persona delivery package should not record values`);
  check(manifest.privateValuesRecorded === false, `${workflowRow.label} persona delivery package should not record private values`);
  check(manifest.privateBeatRecorded === false, `${workflowRow.label} persona delivery package should not record private beats`);
  check(manifest.realUserAudioRecorded === false, `${workflowRow.label} persona delivery package should not record real user audio`);
  check(manifest.networkProbeAttempted === false, `${workflowRow.label} persona delivery package should not probe network`);
  check(manifest.releaseUploadAttempted === false, `${workflowRow.label} persona delivery package should not upload release artifacts`);
  check(manifest.claimedExternalDistribution === false, `${workflowRow.label} persona delivery package should not claim external distribution`);
  checkNoSamplingText(projectContents, `${workflowRow.label} package project file`);
  checkNoSamplingText(handoffContents, `${workflowRow.label} package Handoff Sheet`);
  checkNoSamplingText(JSON.stringify(manifest), `${workflowRow.label} package manifest`);
  check(!/https?:\/\//i.test(markdown), `${workflowRow.label} package Markdown should not include URL values`);

  return {
    persona: workflowRow.persona,
    workflowLabel: workflowRow.label,
    ready: manifest.personaDeliveryPackageReady,
    mode: reopened.mode,
    styleId: reopened.styleId,
    bars: workstation.arrangementTotalBars(reopened),
    deliveryTarget: workstation.activeDeliveryTarget(reopened).name,
    packageRoot: manifest.packageRoot,
    manifestJsonPath: manifest.manifestJsonPath,
    artifactCount: manifest.artifactCount,
    totalBytes: manifest.totalBytes,
    projectBytes: manifest.projectBytes,
    mixBytes: manifest.mixBytes,
    stemArtifactCount: manifest.stemArtifactCount,
    midiBytes: manifest.midiBytes,
    handoffSheetBytes: manifest.handoffSheetBytes,
    mixStatus: analysis.status,
    localFirst: true,
    samplingSecondary: true,
    valueRecorded: false
  };
}

async function reopenPersonaDeliveryPackage({ workstation, render, packageRow }) {
  const manifestPath = resolveManifestPath(packageRow.manifestJsonPath);
  const manifestText = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestText);
  const packageDir = path.resolve(root, manifest.packageRoot);
  const manifestMarkdownPath = resolveManifestPath(manifest.manifestMarkdownPath);
  const manifestMarkdown = await readFile(manifestMarkdownPath, "utf8");

  check(manifest.manifestJsonPath === packageRow.manifestJsonPath, `${packageRow.workflowLabel} reopened manifest JSON path should match package row`);
  check(path.resolve(root, manifest.manifestJsonPath) === manifestPath, `${packageRow.workflowLabel} reopened manifest JSON path should resolve consistently`);
  check(path.dirname(manifestPath) === packageDir, `${packageRow.workflowLabel} reopened manifest JSON should live in the package root`);
  check(path.dirname(manifestMarkdownPath) === packageDir, `${packageRow.workflowLabel} reopened manifest Markdown should live in the package root`);
  check(manifest.persona === packageRow.persona, `${packageRow.workflowLabel} reopened manifest persona should match package row`);
  check(manifest.workflowLabel === packageRow.workflowLabel, `${packageRow.workflowLabel} reopened manifest workflow should match package row`);
  check(manifest.personaDeliveryPackageReady === true, `${packageRow.workflowLabel} reopened manifest should remain ready`);
  check(manifest.localFirst === true, `${packageRow.workflowLabel} reopened manifest should keep local-first posture`);
  check(manifest.samplingSecondary === true, `${packageRow.workflowLabel} reopened manifest should keep sampling secondary`);
  check(manifest.valueRecorded === false, `${packageRow.workflowLabel} reopened manifest should not record values`);
  check(manifest.localEnvValueRecorded === false, `${packageRow.workflowLabel} reopened manifest should not record local env values`);
  check(manifest.privateValuesRecorded === false, `${packageRow.workflowLabel} reopened manifest should not record private values`);
  check(manifest.privateBeatRecorded === false, `${packageRow.workflowLabel} reopened manifest should not record private beats`);
  check(manifest.realUserAudioRecorded === false, `${packageRow.workflowLabel} reopened manifest should not record real user audio`);
  check(manifest.networkProbeAttempted === false, `${packageRow.workflowLabel} reopened manifest should not probe network`);
  check(manifest.releaseUploadAttempted === false, `${packageRow.workflowLabel} reopened manifest should not upload release artifacts`);
  check(manifest.claimedExternalDistribution === false, `${packageRow.workflowLabel} reopened manifest should not claim external distribution`);
  check(Array.isArray(manifest.artifacts), `${packageRow.workflowLabel} reopened manifest should include artifacts`);
  check(manifest.artifactCount === expectedPersonaArtifactCount, `${packageRow.workflowLabel} reopened manifest should keep expected artifact count`);
  check(manifest.artifacts.length === expectedPersonaArtifactCount, `${packageRow.workflowLabel} reopened manifest artifact list should match expected count`);
  check(expectedPersonaArtifactLabels.every((label) => artifactByLabel(manifest, label)), `${packageRow.workflowLabel} reopened manifest should include every expected artifact label`);

  const reopenedArtifacts = [];
  for (const artifact of manifest.artifacts) {
    const artifactPath = resolvePackageArtifactPath(packageDir, artifact.path, `${packageRow.workflowLabel} ${artifact.label}`);
    const bytes = await readFile(artifactPath);
    check(bytes.byteLength === artifact.bytes, `${packageRow.workflowLabel} reopened ${artifact.label} bytes should match manifest`);
    check(sha256(bytes) === artifact.sha256, `${packageRow.workflowLabel} reopened ${artifact.label} SHA-256 should match manifest`);
    check(artifact.valueRecorded === false, `${packageRow.workflowLabel} reopened ${artifact.label} should not record values`);
    reopenedArtifacts.push({ ...artifact, bytesBuffer: bytes });
  }

  const projectArtifact = reopenedArtifacts.find((artifact) => artifact.label === "Project file");
  const mixArtifact = reopenedArtifacts.find((artifact) => artifact.label === "Full mix WAV");
  const stemArtifacts = reopenedArtifacts.filter((artifact) => artifact.kind === "wav-stem");
  const midiArtifact = reopenedArtifacts.find((artifact) => artifact.label === "Arrangement MIDI");
  const handoffArtifact = reopenedArtifacts.find((artifact) => artifact.label === "Handoff Sheet");
  const projectContents = projectArtifact?.bytesBuffer.toString("utf8") ?? "";
  const handoffContents = handoffArtifact?.bytesBuffer.toString("utf8") ?? "";
  const reopenedProject = workstation.parseProjectFile(projectContents);
  const reopenedMixAnalysis = render.analyzeExport(reopenedProject);
  const reopenedStemAnalyses = render.analyzeStemExports(reopenedProject);

  check(projectContents.endsWith("\n"), `${packageRow.workflowLabel} reopened project file should end with newline`);
  check(reopenedProject.title === manifest.project.title, `${packageRow.workflowLabel} reopened project title should match manifest`);
  check(reopenedProject.mode === manifest.project.mode, `${packageRow.workflowLabel} reopened project mode should match manifest`);
  check(reopenedProject.styleId === manifest.project.styleId, `${packageRow.workflowLabel} reopened project style should match manifest`);
  check(workstation.arrangementTotalBars(reopenedProject) === manifest.project.arrangementBars, `${packageRow.workflowLabel} reopened project arrangement should match manifest`);
  check(workstation.arrangementTotalBars(reopenedProject) === packageRow.bars, `${packageRow.workflowLabel} reopened project arrangement should match package row`);
  check(workstation.activeDeliveryTarget(reopenedProject).name === manifest.project.deliveryTarget, `${packageRow.workflowLabel} reopened project delivery target should match manifest`);
  check(workstation.activeDeliveryTarget(reopenedProject).name === packageRow.deliveryTarget, `${packageRow.workflowLabel} reopened project delivery target should match package row`);
  check(reopenedMixAnalysis.status !== "Silent", `${packageRow.workflowLabel} reopened project mix should be audible`);
  check(render.stemTrackIds.every((track) => reopenedStemAnalyses[track].status !== "Silent"), `${packageRow.workflowLabel} reopened project stems should be audible`);
  checkWavBytes(mixArtifact?.bytesBuffer ?? Buffer.alloc(0), `${packageRow.workflowLabel} reopened full mix`);
  check(stemArtifacts.length === 4, `${packageRow.workflowLabel} reopened package should include four stem WAV artifacts`);
  for (const stemArtifact of stemArtifacts) {
    checkWavBytes(stemArtifact.bytesBuffer, `${packageRow.workflowLabel} reopened ${stemArtifact.label}`);
  }
  checkMidiBytes(midiArtifact?.bytesBuffer ?? Buffer.alloc(0), `${packageRow.workflowLabel} reopened arrangement`);
  check(handoffContents.endsWith("\n"), `${packageRow.workflowLabel} reopened Handoff Sheet should end with newline`);
  check(handoffContents.includes("GrooveForge Handoff Sheet"), `${packageRow.workflowLabel} reopened Handoff Sheet should include title`);
  check(handoffContents.includes("Delivery Target"), `${packageRow.workflowLabel} reopened Handoff Sheet should include delivery target`);
  check(handoffContents.includes("Export Meter"), `${packageRow.workflowLabel} reopened Handoff Sheet should include export meter`);
  check(handoffContents.includes("Stem Meter"), `${packageRow.workflowLabel} reopened Handoff Sheet should include stem meter`);
  checkNoSamplingText(projectContents, `${packageRow.workflowLabel} reopened project file`);
  checkNoSamplingText(handoffContents, `${packageRow.workflowLabel} reopened Handoff Sheet`);
  checkNoSamplingText(manifestText, `${packageRow.workflowLabel} reopened manifest`);
  checkNoSamplingText(manifestMarkdown, `${packageRow.workflowLabel} reopened manifest Markdown`);
  check(!/https?:\/\//i.test(manifestMarkdown), `${packageRow.workflowLabel} reopened manifest Markdown should not include URL values`);

  return {
    persona: manifest.persona,
    workflowLabel: manifest.workflowLabel,
    ready:
      manifest.personaDeliveryPackageReady === true &&
      manifest.artifactCount === expectedPersonaArtifactCount &&
      reopenedArtifacts.length === expectedPersonaArtifactCount &&
      stemArtifacts.length === 4 &&
      reopenedMixAnalysis.status !== "Silent" &&
      render.stemTrackIds.every((track) => reopenedStemAnalyses[track].status !== "Silent") &&
      manifest.valueRecorded === false,
    packageRoot: manifest.packageRoot,
    manifestJsonPath: manifest.manifestJsonPath,
    artifactCount: manifest.artifactCount,
    verifiedArtifactCount: reopenedArtifacts.length,
    totalBytes: manifest.totalBytes,
    projectReopened: true,
    hashesReady: reopenedArtifacts.every((artifact) => sha256(artifact.bytesBuffer) === artifact.sha256 && artifact.bytesBuffer.byteLength === artifact.bytes),
    wavHeadersReady: Boolean(mixArtifact) && stemArtifacts.length === 4,
    midiHeaderReady: Boolean(midiArtifact),
    handoffReady: Boolean(handoffArtifact) && handoffContents.includes("GrooveForge Handoff Sheet") && handoffContents.includes("Delivery Target"),
    localFirst: manifest.localFirst === true,
    samplingSecondary: manifest.samplingSecondary === true,
    valueRecorded: false
  };
}

function validateAllGenreCoverage(workstation) {
  const requiredStyleIds = [
    "trap",
    "drill",
    "boom_bap",
    "lofi",
    "house",
    "rnb",
    "k_hiphop_rnb",
    "afrobeats",
    "amapiano",
    "reggaeton",
    "jersey",
    "phonk",
    "garage",
    "experimental"
  ];
  const styleRows = requiredStyleIds.map((styleId) => {
    const profile = styleProfile(workstation, styleId);
    const patterns = workstation.createStylePatternSet(styleId, "F minor");
    const counts = workstation.patternSlots.reduce(
      (totals, slot) => {
        const row = patternEventCounts(workstation, patterns[slot]);
        return {
          drums: totals.drums + row.drums,
          bass: totals.bass + row.bass,
          melody: totals.melody + row.melody,
          chords: totals.chords + row.chords
        };
      },
      { drums: 0, bass: 0, melody: 0, chords: 0 }
    );
    const ready = Boolean(profile) && counts.drums > 0 && counts.bass > 0 && counts.melody > 0 && counts.chords > 0;
    check(ready, `${styleId} style should provide direct-composition drums, bass, melody, and chords`);
    return {
      styleId,
      name: profile.name,
      bpm: profile.defaultBpm,
      swing: profile.defaultSwing,
      ready,
      eventCounts: counts,
      valueRecorded: false
    };
  });

  return {
    requiredStyleCount: requiredStyleIds.length,
    supportedStyleCount: workstation.styleProfiles.length,
    readyStyleCount: styleRows.filter((row) => row.ready).length,
    styleRows,
    valueRecorded: false
  };
}

function formatSignalRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${row.ready ? "yes" : "no"} | ${row.presentSignalCount}/${row.requiredSignalCount} | ${escapeCell(row.requiredSignals.join(", "))} | ${escapeCell(row.missingSignals.join(", ") || "none")} |`)
    .join("\n");
}

function formatWorkflowRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.persona)} | ${escapeCell(row.mode)} | ${escapeCell(row.styleId)} | ${row.bpm} | ${escapeCell(row.key)} | ${row.bars} | ${escapeCell(row.deliveryTarget)} | ${escapeCell(row.mixStatus)} | ${row.eventCounts.drums}/${row.eventCounts.bass}/${row.eventCounts.melody}/${row.eventCounts.chords} |`)
    .join("\n");
}

function formatStyleRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.styleId)} | ${escapeCell(row.name)} | ${row.ready ? "yes" : "no"} | ${row.bpm} | ${row.eventCounts.drums}/${row.eventCounts.bass}/${row.eventCounts.melody}/${row.eventCounts.chords} |`)
    .join("\n");
}

function buildAudienceReadinessRows({
  renderedSignalRows,
  workflowRows,
  deliveryPackageRows,
  deliveryPackageReopenRows,
  directCompositionReady,
  allGenreStyleReadinessReady,
  localExportReadinessReady,
  samplingSecondaryReady
}) {
  const beginnerSignals = renderedSignalRows.find((row) => row.label === "beginner first-run path");
  const producerSignals = renderedSignalRows.find((row) => row.label === "professional producer path");
  const beginnerWorkflow = workflowRows.find((row) => row.persona === "first-time composer");
  const producerWorkflow = workflowRows.find((row) => row.persona === "professional producer");
  const beginnerDelivery = deliveryPackageRows.find((row) => row.persona === "first-time composer");
  const producerDelivery = deliveryPackageRows.find((row) => row.persona === "professional producer");
  const beginnerReopen = deliveryPackageReopenRows.find((row) => row.persona === "first-time composer");
  const producerReopen = deliveryPackageReopenRows.find((row) => row.persona === "professional producer");

  const rows = [
    {
      audience: "first-time composer",
      readinessRole: "guided first beat creation",
      ready:
        beginnerSignals?.ready === true &&
        beginnerWorkflow?.ready === true &&
        beginnerDelivery?.ready === true &&
        beginnerReopen?.ready === true &&
        directCompositionReady &&
        allGenreStyleReadinessReady &&
        localExportReadinessReady &&
        samplingSecondaryReady,
      renderedSignalGroup: beginnerSignals?.label ?? "missing",
      workflowLabel: beginnerWorkflow?.label ?? "missing",
      workflowMode: beginnerWorkflow?.mode ?? "missing",
      workflowBars: beginnerWorkflow?.bars ?? 0,
      workflowDeliveryTarget: beginnerWorkflow?.deliveryTarget ?? "missing",
      workflowStyle: beginnerWorkflow?.styleId ?? "missing",
      deliveryPackageReady: beginnerDelivery?.ready === true,
      deliveryPackageReopenReady: beginnerReopen?.ready === true,
      deliveryArtifactCount: beginnerDelivery?.artifactCount ?? 0,
      verifiedDeliveryArtifactCount: beginnerReopen?.verifiedArtifactCount ?? 0,
      proofSummary: "Guide Quick Start, First Beat Path, Composer Guide, editable 8-bar beat, project/WAV/stems/MIDI/Handoff package",
      localFirst: true,
      samplingSecondary: samplingSecondaryReady,
      valueRecorded: false
    },
    {
      audience: "professional producer",
      readinessRole: "studio fast-pass production and delivery",
      ready:
        producerSignals?.ready === true &&
        producerWorkflow?.ready === true &&
        producerDelivery?.ready === true &&
        producerReopen?.ready === true &&
        directCompositionReady &&
        allGenreStyleReadinessReady &&
        localExportReadinessReady &&
        samplingSecondaryReady,
      renderedSignalGroup: producerSignals?.label ?? "missing",
      workflowLabel: producerWorkflow?.label ?? "missing",
      workflowMode: producerWorkflow?.mode ?? "missing",
      workflowBars: producerWorkflow?.bars ?? 0,
      workflowDeliveryTarget: producerWorkflow?.deliveryTarget ?? "missing",
      workflowStyle: producerWorkflow?.styleId ?? "missing",
      deliveryPackageReady: producerDelivery?.ready === true,
      deliveryPackageReopenReady: producerReopen?.ready === true,
      deliveryArtifactCount: producerDelivery?.artifactCount ?? 0,
      verifiedDeliveryArtifactCount: producerReopen?.verifiedArtifactCount ?? 0,
      proofSummary: "Studio, Review Queue, Production Snapshot, Mix Coach, Quick Actions, Command Reference, project/WAV/stems/MIDI/Handoff package",
      localFirst: true,
      samplingSecondary: samplingSecondaryReady,
      valueRecorded: false
    }
  ];

  for (const row of rows) {
    check(row.ready === true, `${row.audience} audience readiness row should be ready`);
    check(row.valueRecorded === false, `${row.audience} audience readiness row should not record values`);
    check(row.localFirst === true, `${row.audience} audience readiness row should keep local-first posture`);
    check(row.samplingSecondary === true, `${row.audience} audience readiness row should keep sampling secondary`);
    check(row.deliveryPackageReady === true, `${row.audience} audience readiness row should include ready delivery package`);
    check(row.deliveryPackageReopenReady === true, `${row.audience} audience readiness row should include reopened delivery package`);
  }

  return rows;
}

function formatAudienceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.audience)} | ${escapeCell(row.readinessRole)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.renderedSignalGroup)} | ${escapeCell(row.workflowLabel)} | ${escapeCell(row.workflowMode)} | ${row.workflowBars} | ${escapeCell(row.workflowDeliveryTarget)} | ${escapeCell(row.workflowStyle)} | ${row.deliveryPackageReady ? "yes" : "no"} | ${row.deliveryPackageReopenReady ? "yes" : "no"} | ${row.deliveryArtifactCount ?? 0} | ${row.verifiedDeliveryArtifactCount ?? 0} | ${escapeCell(row.proofSummary)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatDeliveryPackageRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.persona)} | ${escapeCell(row.workflowLabel)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.mode)} | ${row.bars} | ${escapeCell(row.deliveryTarget)} | ${row.artifactCount} | ${row.totalBytes} | \`${escapeCell(row.packageRoot)}\` | \`${escapeCell(row.manifestJsonPath)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatDeliveryPackageReopenRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.persona)} | ${escapeCell(row.workflowLabel)} | ${row.ready ? "yes" : "no"} | ${row.artifactCount} | ${row.verifiedArtifactCount} | ${row.projectReopened ? "yes" : "no"} | ${row.hashesReady ? "yes" : "no"} | ${row.wavHeadersReady ? "yes" : "no"} | ${row.midiHeaderReady ? "yes" : "no"} | ${row.handoffReady ? "yes" : "no"} | \`${escapeCell(row.packageRoot)}\` | \`${escapeCell(row.manifestJsonPath)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Persona Readiness

## Status

- Persona readiness ready: ${report.personaReadinessReady ? "yes" : "no"}
- Product scope: ${report.productScope}
- Beginner readiness: ${report.beginnerReadinessReady ? "yes" : "no"}
- Professional producer readiness: ${report.professionalProducerReadinessReady ? "yes" : "no"}
- Direct composition readiness: ${report.directCompositionReady ? "yes" : "no"}
- All-genre style readiness: ${report.allGenreStyleReadinessReady ? "yes" : "no"}
- Local export readiness: ${report.localExportReadinessReady ? "yes" : "no"}
- Persona delivery packages ready: ${report.personaDeliveryPackagesReady ? "yes" : "no"}
- Persona delivery package rows: ${report.deliveryPackageRows.length}
- Persona delivery packages reopen ready: ${report.personaDeliveryPackagesReopenReady ? "yes" : "no"}
- Persona delivery package reopen rows: ${report.deliveryPackageReopenRows.length}
- Sampling secondary: ${report.samplingSecondaryReady ? "yes" : "no"}
- Private values recorded: no
- Network attempted: no
- External distribution claimed: no

## Audience Readiness

| audience | role | ready | rendered signal group | workflow | mode | bars | delivery | style | package ready | package reopen ready | artifacts | verified artifacts | proof summary | value recorded |
|---|---|---:|---|---|---|---:|---|---|---:|---:|---:|---:|---|---:|
${formatAudienceRows(report.audienceReadinessRows)}

## Persona Delivery Packages

| persona | workflow | ready | mode | bars | delivery | artifacts | total bytes | package | manifest | value recorded |
|---|---|---:|---|---:|---|---:|---:|---|---|---:|
${formatDeliveryPackageRows(report.deliveryPackageRows)}

## Persona Delivery Package Reopen

| persona | workflow | ready | artifacts | verified artifacts | project | hashes | WAV | MIDI | Handoff | package | manifest | value recorded |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|---:|
${formatDeliveryPackageReopenRows(report.deliveryPackageReopenRows)}

## Rendered Persona Signals

| signal group | ready | present | required signals | missing |
|---|---:|---:|---|---|
${formatSignalRows(report.renderedSignalRows)}

## Workflow Evidence

| persona | mode | style | BPM | key | bars | delivery | mix | events drums/bass/melody/chords |
|---|---|---|---:|---|---:|---|---|---|
${formatWorkflowRows(report.workflowRows)}

## Style Coverage

| style | name | ready | BPM | events drums/bass/melody/chords |
|---|---|---:|---:|---|
${formatStyleRows(report.styleCoverage.styleRows)}

## Evidence Commands

- Persona readiness smoke: \`${report.personaReadinessCommand}\`
- Renderer coverage source: \`${report.rendererCoverageCommand}\`
- Workflow coverage source: \`${report.workflowCoverageCommand}\`
- Runtime all-style coverage source: \`${report.runtimeCoverageCommand}\`

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, local env values, private beats, and real user audio are not recorded.

## Not Claimed

This report does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

installBrowserMocks();

const workstation = await import("../../src/domain/workstation.ts");
const render = await import("../../src/audio/render.ts");
const midi = await import("../../src/audio/midi.ts");
const handoff = await import("../../src/audio/handoff.ts");

const server = await createServer({
  appType: "custom",
  logLevel: "silent",
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true }
});

let html = "";
try {
  const { App } = await server.ssrLoadModule("/src/ui/App.tsx");
  html = renderToStaticMarkup(React.createElement(App));
} finally {
  await server.close();
}

check(html.length > 250000, `persona readiness renderer output should be substantial, got ${html.length} characters`);
check(!forbiddenSamplingText.test(html), "persona readiness renderer output should keep sampling secondary and avoid imported-audio first-run scope");

const renderedSignalRows = [
  checkRenderedGroup(html, "beginner first-run path", [
    "Guide Quick Start",
    "First Beat Path",
    "Beat Spine",
    "Composer Guide",
    "Workflow navigator",
    "Guided Focus",
    "Guided Session Pass"
  ]),
  checkRenderedGroup(html, "professional producer path", [
    "Studio",
    "Review Queue",
    "Production Snapshot",
    "Mix Coach",
    "Sound Snapshot",
    "Mix Snapshot",
    "Quick Actions",
    "Command Reference"
  ]),
  checkRenderedGroup(html, "direct composition workstation", [
    "Pattern A",
    "Drums",
    "808",
    "Synth",
    "Melody",
    "Chords",
    "Arrangement",
    "Mixer",
    "Master",
    "Export WAV",
    "Stem WAV",
    "Export MIDI",
    "Handoff Sheet"
  ])
];

const workflowRows = [
  validateWorkflowProject({
    workstation,
    render,
    midi,
    handoff,
    label: "beginner:guided-first-beat",
    persona: "first-time composer",
    project: createBeginnerGuidedFirstBeat(workstation),
    expected: {
      mode: "guided",
      styleId: "lofi",
      bpm: 86,
      key: "A minor",
      selectedPattern: "A",
      deliveryTarget: "starter_sketch",
      minBars: 8,
      usedPatterns: ["A", "B"],
      minDrums: 40,
      minBass: 9,
      minMelody: 10,
      minChords: 10
    }
  }),
  validateWorkflowProject({
    workstation,
    render,
    midi,
    handoff,
    label: "producer:fast-pass",
    persona: "professional producer",
    project: createProducerFastPass(workstation),
    expected: {
      mode: "studio",
      styleId: "house",
      bpm: 124,
      key: "C minor",
      selectedPattern: "B",
      deliveryTarget: "beat_store",
      minBars: 24,
      usedPatterns: ["A", "B", "C"],
      minDrums: 50,
      minBass: 12,
      minMelody: 12,
      minChords: 12
    }
  })
];
const deliveryPackageRows = await Promise.all([
  writePersonaDeliveryPackage({
    workstation,
    render,
    midi,
    handoff,
    workflowRow: workflowRows[0],
    project: createBeginnerGuidedFirstBeat(workstation),
    packageSlug: "first-time-composer-guided"
  }),
  writePersonaDeliveryPackage({
    workstation,
    render,
    midi,
    handoff,
    workflowRow: workflowRows[1],
    project: createProducerFastPass(workstation),
    packageSlug: "professional-producer-studio"
  })
]);
const deliveryPackageReopenRows = await Promise.all(deliveryPackageRows.map((packageRow) => reopenPersonaDeliveryPackage({ workstation, render, packageRow })));
const styleCoverage = validateAllGenreCoverage(workstation);

const beginnerReadinessReady =
  renderedSignalRows.find((row) => row.label === "beginner first-run path")?.ready === true &&
  workflowRows.find((row) => row.persona === "first-time composer")?.ready === true;
const professionalProducerReadinessReady =
  renderedSignalRows.find((row) => row.label === "professional producer path")?.ready === true &&
  workflowRows.find((row) => row.persona === "professional producer")?.ready === true;
const directCompositionReady = renderedSignalRows.find((row) => row.label === "direct composition workstation")?.ready === true;
const allGenreStyleReadinessReady =
  styleCoverage.readyStyleCount === styleCoverage.requiredStyleCount &&
  styleCoverage.supportedStyleCount >= styleCoverage.requiredStyleCount;
const localExportReadinessReady = workflowRows.every((row) => row.mixStatus !== "Silent" && row.midiBytes > 1000 && row.projectBytes > 10000);
const personaDeliveryPackagesReady =
  deliveryPackageRows.length === 2 &&
  deliveryPackageRows.every((row) => row.ready === true && row.artifactCount === expectedPersonaArtifactCount && row.valueRecorded === false);
const personaDeliveryPackagesReopenReady =
  deliveryPackageReopenRows.length === 2 &&
  deliveryPackageReopenRows.every((row) => row.ready === true && row.verifiedArtifactCount === expectedPersonaArtifactCount && row.valueRecorded === false);
const samplingSecondaryReady = !forbiddenSamplingText.test(JSON.stringify({ renderedSignalRows, workflowRows, deliveryPackageRows, deliveryPackageReopenRows, styleCoverage }));
const audienceReadinessRows = buildAudienceReadinessRows({
  renderedSignalRows,
  workflowRows,
  deliveryPackageRows,
  deliveryPackageReopenRows,
  directCompositionReady,
  allGenreStyleReadinessReady,
  localExportReadinessReady,
  samplingSecondaryReady
});

const personaReadinessReport = {
  appName,
  bundleId,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  personaReadinessCommand: "npm run persona:smoke",
  rendererCoverageCommand: "npm run renderer:smoke",
  workflowCoverageCommand: "npm run workflow:smoke",
  runtimeCoverageCommand: "npm run harness:smoke",
  personaReadinessMarkdownPath: relative(personaReadinessMarkdownPath),
  personaReadinessJsonPath: relative(personaReadinessJsonPath),
  productScope: "all-genre direct beat workstation for professional producers and first-time composers; sampling is secondary",
  renderedMarkupCharacters: html.length,
  audienceReadinessRows,
  renderedSignalRows,
  workflowRows,
  deliveryPackageRows,
  deliveryPackageReopenRows,
  styleCoverage,
  beginnerReadinessReady,
  professionalProducerReadinessReady,
  directCompositionReady,
  allGenreStyleReadinessReady,
  localExportReadinessReady,
  personaDeliveryPackagesReady,
  personaDeliveryPackagesReopenReady,
  personaDeliveryPackageRoot: relative(personaDeliveryRoot),
  samplingSecondaryReady,
  localFirstReady: true,
  privateValuesRecorded: false,
  networkAttemptedByThisReport: false,
  releaseUploadAttemptedByThisReport: false,
  notarySubmissionAttemptedByThisReport: false,
  signingAttemptedByThisReport: false,
  claimedExternalDistribution: false
};
personaReadinessReport.personaReadinessReady =
  personaReadinessReport.beginnerReadinessReady &&
  personaReadinessReport.professionalProducerReadinessReady &&
  personaReadinessReport.directCompositionReady &&
  personaReadinessReport.allGenreStyleReadinessReady &&
  personaReadinessReport.localExportReadinessReady &&
  personaReadinessReport.personaDeliveryPackagesReady &&
  personaReadinessReport.personaDeliveryPackagesReopenReady &&
  personaReadinessReport.samplingSecondaryReady &&
  personaReadinessReport.localFirstReady;

const markdown = buildMarkdown(personaReadinessReport);

check(personaReadinessReport.appName === appName, "persona readiness report should identify GrooveForge");
check(personaReadinessReport.bundleId === bundleId, `persona readiness report should identify ${bundleId}`);
check(personaReadinessReport.personaReadinessCommand === "npm run persona:smoke", "persona readiness report should identify its command");
check(personaReadinessReport.beginnerReadinessReady === true, "persona readiness report should prove beginner readiness");
check(personaReadinessReport.professionalProducerReadinessReady === true, "persona readiness report should prove professional producer readiness");
check(personaReadinessReport.directCompositionReady === true, "persona readiness report should prove direct composition readiness");
check(personaReadinessReport.allGenreStyleReadinessReady === true, "persona readiness report should prove all-genre style readiness");
check(personaReadinessReport.localExportReadinessReady === true, "persona readiness report should prove local export readiness");
check(personaReadinessReport.personaDeliveryPackagesReady === true, "persona readiness report should prove persona delivery package readiness");
check(personaReadinessReport.personaDeliveryPackagesReopenReady === true, "persona readiness report should prove persona delivery package reopen readiness");
check(personaReadinessReport.samplingSecondaryReady === true, "persona readiness report should keep sampling secondary");
check(personaReadinessReport.localFirstReady === true, "persona readiness report should keep local-first posture");
check(personaReadinessReport.privateValuesRecorded === false, "persona readiness report should not record private values");
check(personaReadinessReport.networkAttemptedByThisReport === false, "persona readiness report should not use network");
check(personaReadinessReport.claimedExternalDistribution === false, "persona readiness report should not claim external distribution");
check(personaReadinessReport.audienceReadinessRows.length === 2, "persona readiness report should include two audience readiness rows");
check(personaReadinessReport.audienceReadinessRows.every((row) => row.ready === true), "persona readiness audience rows should be ready");
check(personaReadinessReport.audienceReadinessRows.every((row) => row.valueRecorded === false), "persona readiness audience rows should not record values");
check(personaReadinessReport.audienceReadinessRows.every((row) => row.deliveryPackageReady === true), "persona readiness audience rows should include ready delivery packages");
check(personaReadinessReport.audienceReadinessRows.every((row) => row.deliveryPackageReopenReady === true), "persona readiness audience rows should include reopened delivery packages");
check(personaReadinessReport.audienceReadinessRows.every((row) => row.verifiedDeliveryArtifactCount === expectedPersonaArtifactCount), "persona readiness audience rows should include verified delivery artifacts");
check(personaReadinessReport.deliveryPackageRows.length === 2, "persona readiness report should include two delivery package rows");
check(personaReadinessReport.deliveryPackageRows.every((row) => row.ready === true), "persona readiness delivery package rows should be ready");
check(personaReadinessReport.deliveryPackageRows.every((row) => row.artifactCount === expectedPersonaArtifactCount), "persona readiness delivery package rows should include all deliverable artifacts");
check(personaReadinessReport.deliveryPackageRows.every((row) => row.valueRecorded === false), "persona readiness delivery package rows should not record values");
check(personaReadinessReport.deliveryPackageReopenRows.length === 2, "persona readiness report should include two delivery package reopen rows");
check(personaReadinessReport.deliveryPackageReopenRows.every((row) => row.ready === true), "persona readiness delivery package reopen rows should be ready");
check(personaReadinessReport.deliveryPackageReopenRows.every((row) => row.verifiedArtifactCount === expectedPersonaArtifactCount), "persona readiness delivery package reopen rows should verify all deliverable artifacts");
check(personaReadinessReport.deliveryPackageReopenRows.every((row) => row.projectReopened === true && row.hashesReady === true && row.wavHeadersReady === true && row.midiHeaderReady === true && row.handoffReady === true), "persona readiness delivery package reopen rows should verify project, hashes, WAV, MIDI, and Handoff");
check(personaReadinessReport.deliveryPackageReopenRows.every((row) => row.valueRecorded === false), "persona readiness delivery package reopen rows should not record values");
check(personaReadinessReport.workflowRows.length === 2, "persona readiness report should include two persona workflow rows");
check(personaReadinessReport.styleCoverage.readyStyleCount === 14, "persona readiness report should include 14 ready style rows");
check(markdown.includes("Persona Readiness"), "persona readiness Markdown should include title");
check(markdown.includes("Audience Readiness"), "persona readiness Markdown should include audience readiness");
check(markdown.includes("Persona Delivery Packages"), "persona readiness Markdown should include persona delivery packages");
check(markdown.includes("Persona Delivery Package Reopen"), "persona readiness Markdown should include persona delivery package reopen");
check(markdown.includes("first-time composer"), "persona readiness Markdown should include first-time composer evidence");
check(markdown.includes("professional producer"), "persona readiness Markdown should include professional producer evidence");
check(markdown.includes("Direct composition readiness:"), "persona readiness Markdown should include direct composition readiness");
check(markdown.includes("Sampling secondary:"), "persona readiness Markdown should include sampling-secondary posture");
check(markdown.includes("Export WAV"), "persona readiness Markdown should include export surface evidence");
check(!/https?:\/\//i.test(markdown), "persona readiness Markdown should not include URL values");

if (failures.length > 0) {
  console.error("GrooveForge persona readiness smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

await mkdir(packageRoot, { recursive: true });
await writeFile(personaReadinessJsonPath, `${JSON.stringify(personaReadinessReport, null, 2)}\n`, "utf8");
await writeFile(personaReadinessMarkdownPath, markdown, "utf8");

console.log("GrooveForge persona readiness smoke passed.");
console.log(`- Markdown: ${relative(personaReadinessMarkdownPath)}`);
console.log(`- JSON: ${relative(personaReadinessJsonPath)}`);
console.log("- Scope: professional producer and first-time composer readiness through local direct beat composition workflows");
console.log(`- Beginner readiness: ${personaReadinessReport.beginnerReadinessReady ? "yes" : "no"}`);
console.log(`- Professional producer readiness: ${personaReadinessReport.professionalProducerReadinessReady ? "yes" : "no"}`);
console.log(`- Direct composition readiness: ${personaReadinessReport.directCompositionReady ? "yes" : "no"}`);
console.log(`- All-genre style readiness: ${personaReadinessReport.styleCoverage.readyStyleCount}/${personaReadinessReport.styleCoverage.requiredStyleCount}`);
console.log(`- Local export readiness: ${personaReadinessReport.localExportReadinessReady ? "yes" : "no"}`);
console.log(`- Persona delivery packages ready: ${personaReadinessReport.personaDeliveryPackagesReady ? "yes" : "no"}`);
console.log(`- Persona delivery package rows: ${personaReadinessReport.deliveryPackageRows.length}`);
console.log(`- Persona delivery packages reopen ready: ${personaReadinessReport.personaDeliveryPackagesReopenReady ? "yes" : "no"}`);
console.log(`- Persona delivery package reopen rows: ${personaReadinessReport.deliveryPackageReopenRows.length}`);
console.log(`- Sampling secondary: ${personaReadinessReport.samplingSecondaryReady ? "yes" : "no"}`);
console.log(`- Audience readiness rows: ${personaReadinessReport.audienceReadinessRows.length}`);
for (const row of personaReadinessReport.audienceReadinessRows) {
  console.log(
    `- ${row.audience}: ${row.ready ? "ready" : "blocked"}, ${row.readinessRole}, ${row.workflowMode}, ${row.workflowBars} bars, ${row.workflowDeliveryTarget}, ${row.workflowStyle}`
  );
}
for (const row of personaReadinessReport.workflowRows) {
  console.log(
    `- ${row.label}: ${row.persona}, ${row.mode}, ${row.bpm} BPM ${row.key} ${row.styleId}, ${row.bars} bars, ${row.deliveryTarget}, ${row.mixStatus}, events ${row.eventCounts.drums}/${row.eventCounts.bass}/${row.eventCounts.melody}/${row.eventCounts.chords}`
  );
}
for (const row of personaReadinessReport.deliveryPackageRows) {
  console.log(
    `- package ${row.persona}: ${row.ready ? "ready" : "blocked"}, ${row.artifactCount} artifacts, ${row.totalBytes} bytes, ${row.packageRoot}`
  );
}
for (const row of personaReadinessReport.deliveryPackageReopenRows) {
  console.log(
    `- reopen ${row.persona}: ${row.ready ? "ready" : "blocked"}, ${row.verifiedArtifactCount}/${row.artifactCount} artifacts verified, project ${row.projectReopened ? "yes" : "no"}, hashes ${row.hashesReady ? "yes" : "no"}, ${row.packageRoot}`
  );
}
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted by this report");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
