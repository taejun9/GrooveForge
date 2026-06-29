#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
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
const personaReadinessMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-persona-readiness.md`);
const personaReadinessJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-persona-readiness.json`);
const failures = [];
const forbiddenSamplingText = /AudioClipEvent|sample import|sample browser|chop pads|sampler track|audio clip/i;

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

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
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
  directCompositionReady,
  allGenreStyleReadinessReady,
  localExportReadinessReady,
  samplingSecondaryReady
}) {
  const beginnerSignals = renderedSignalRows.find((row) => row.label === "beginner first-run path");
  const producerSignals = renderedSignalRows.find((row) => row.label === "professional producer path");
  const beginnerWorkflow = workflowRows.find((row) => row.persona === "first-time composer");
  const producerWorkflow = workflowRows.find((row) => row.persona === "professional producer");

  const rows = [
    {
      audience: "first-time composer",
      readinessRole: "guided first beat creation",
      ready:
        beginnerSignals?.ready === true &&
        beginnerWorkflow?.ready === true &&
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
      proofSummary: "Guide Quick Start, First Beat Path, Composer Guide, editable 8-bar beat, WAV/stems/MIDI/Handoff",
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
      proofSummary: "Studio, Review Queue, Production Snapshot, Mix Coach, Quick Actions, Command Reference, 24-bar delivery pass",
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
  }

  return rows;
}

function formatAudienceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.audience)} | ${escapeCell(row.readinessRole)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.renderedSignalGroup)} | ${escapeCell(row.workflowLabel)} | ${escapeCell(row.workflowMode)} | ${row.workflowBars} | ${escapeCell(row.workflowDeliveryTarget)} | ${escapeCell(row.workflowStyle)} | ${escapeCell(row.proofSummary)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
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
- Sampling secondary: ${report.samplingSecondaryReady ? "yes" : "no"}
- Private values recorded: no
- Network attempted: no
- External distribution claimed: no

## Audience Readiness

| audience | role | ready | rendered signal group | workflow | mode | bars | delivery | style | proof summary | value recorded |
|---|---|---:|---|---|---|---:|---|---|---|---:|
${formatAudienceRows(report.audienceReadinessRows)}

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
const samplingSecondaryReady = !forbiddenSamplingText.test(JSON.stringify({ renderedSignalRows, workflowRows, styleCoverage }));
const audienceReadinessRows = buildAudienceReadinessRows({
  renderedSignalRows,
  workflowRows,
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
  styleCoverage,
  beginnerReadinessReady,
  professionalProducerReadinessReady,
  directCompositionReady,
  allGenreStyleReadinessReady,
  localExportReadinessReady,
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
check(personaReadinessReport.samplingSecondaryReady === true, "persona readiness report should keep sampling secondary");
check(personaReadinessReport.localFirstReady === true, "persona readiness report should keep local-first posture");
check(personaReadinessReport.privateValuesRecorded === false, "persona readiness report should not record private values");
check(personaReadinessReport.networkAttemptedByThisReport === false, "persona readiness report should not use network");
check(personaReadinessReport.claimedExternalDistribution === false, "persona readiness report should not claim external distribution");
check(personaReadinessReport.audienceReadinessRows.length === 2, "persona readiness report should include two audience readiness rows");
check(personaReadinessReport.audienceReadinessRows.every((row) => row.ready === true), "persona readiness audience rows should be ready");
check(personaReadinessReport.audienceReadinessRows.every((row) => row.valueRecorded === false), "persona readiness audience rows should not record values");
check(personaReadinessReport.workflowRows.length === 2, "persona readiness report should include two persona workflow rows");
check(personaReadinessReport.styleCoverage.readyStyleCount === 14, "persona readiness report should include 14 ready style rows");
check(markdown.includes("Persona Readiness"), "persona readiness Markdown should include title");
check(markdown.includes("Audience Readiness"), "persona readiness Markdown should include audience readiness");
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
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted by this report");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
