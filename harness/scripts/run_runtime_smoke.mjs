#!/usr/bin/env node

const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function ascii(bytes, start, length) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

async function blobBytes(blob) {
  return new Uint8Array(await blob.arrayBuffer());
}

function checkWavBytes(bytes, label) {
  check(bytes.byteLength > 44, `${label} WAV is too small`);
  check(ascii(bytes, 0, 4) === "RIFF", `${label} WAV missing RIFF header`);
  check(ascii(bytes, 8, 4) === "WAVE", `${label} WAV missing WAVE header`);
  check(ascii(bytes, 12, 4) === "fmt ", `${label} WAV missing fmt chunk`);
  check(ascii(bytes, 36, 4) === "data", `${label} WAV missing data chunk`);
}

const workstation = await import("../../src/domain/workstation.ts");
const render = await import("../../src/audio/render.ts");
const midi = await import("../../src/audio/midi.ts");
const handoff = await import("../../src/audio/handoff.ts");
const downloads = await import("../../src/platform/downloads.ts");
const coreTrackTypes = new Set(["drum_rack", "bass_808", "synth", "chord", "fx_return", "master"]);
const smokeKey = "F minor";
const smokeScope = "sample-free all-style 8-bar beats with local project-file roundtrips, Handoff Sheet checks, and mocked download-path checks without writing media artifacts";

function cloneMixerForSmoke() {
  return workstation.starterProject.mixer.map((channel) => ({
    ...channel,
    muted: false,
    solo: false
  }));
}

function styleSmokeProject(profile) {
  return {
    ...workstation.starterProject,
    title: `${profile.name} Smoke Beat`,
    bpm: profile.defaultBpm,
    key: smokeKey,
    styleId: profile.id,
    selectedPattern: "A",
    swing: profile.defaultSwing,
    sound: workstation.soundPresetDesign(workstation.styleSoundPreset(profile.id)),
    patterns: workstation.createStylePatternSet(profile.id, smokeKey),
    arrangement: workstation.createPatternChain("eight_bar"),
    mixer: cloneMixerForSmoke(),
    snapshots: []
  };
}

function blueprintSmokeProject(blueprint) {
  return {
    ...workstation.applyBeatBlueprint(workstation.starterProject, blueprint.id),
    title: `${blueprint.name} Smoke Beat`,
    arrangement: workstation.createPatternChain("eight_bar"),
    snapshots: []
  };
}

function legacySinglePatternProjectFile() {
  const pattern = workstation.createStylePatternSet("rnb", smokeKey).A;
  return {
    app: "GrooveForge",
    fileVersion: workstation.projectFileVersion,
    savedAt: "2026-06-28T00:00:00.000Z",
    project: {
      title: "Legacy Chord Migration Smoke Beat",
      mode: "guided",
      bpm: 96,
      key: smokeKey,
      styleId: "rnb",
      selectedPattern: "A",
      swing: 0.58,
      drumPattern: pattern.drumPattern,
      bassNotes: pattern.bassNotes,
      melodyNotes: pattern.melodyNotes,
      chordEvents: pattern.chordEvents,
      mixer: cloneMixerForSmoke(),
      arrangement: workstation.createPatternChain("eight_bar").map(({ section, pattern, energy }) => ({ section, pattern, energy })),
      masterCeilingDb: workstation.masterPresetCeilingDb("Headroom for Vocal"),
      masterPreset: "Headroom for Vocal"
    }
  };
}

function projectSlug(project) {
  return project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "grooveforge";
}

function safeJsonParse(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`${label} project file should be valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function projectEventCounts(project) {
  return workstation.patternSlots.map((slot) => {
    const pattern = project.patterns[slot];
    const drumHits = workstation.drumLanes.reduce(
      (total, lane) => total + pattern.drumPattern[lane].filter(Boolean).length,
      0
    );
    return {
      slot,
      drumHits,
      bassNotes: pattern.bassNotes.length,
      melodyNotes: pattern.melodyNotes.length,
      chordEvents: pattern.chordEvents.length
    };
  });
}

function validateProjectFileRoundTrip(project, label) {
  const projectFileContents = workstation.serializeProjectFile(project);
  const projectFile = safeJsonParse(projectFileContents, label);
  check(projectFileContents.endsWith("\n"), `${label} project file should end with a newline`);
  check(!projectFileContents.match(/AudioClipEvent|sampler|sample import|audio clip/i), `${label} project file contains sampling or audio-clip language`);

  if (projectFile && typeof projectFile === "object") {
    check(projectFile.app === "GrooveForge", `${label} project file should identify GrooveForge`);
    check(projectFile.fileVersion === workstation.projectFileVersion, `${label} project file should use version ${workstation.projectFileVersion}`);
    check(typeof projectFile.savedAt === "string" && Number.isFinite(Date.parse(projectFile.savedAt)), `${label} project file savedAt should be an ISO date`);
    check(projectFile.project && typeof projectFile.project === "object", `${label} project file should contain project data`);
  }

  let roundTrippedProject = project;
  try {
    roundTrippedProject = workstation.parseProjectFile(projectFileContents);
  } catch (error) {
    failures.push(`${label} project file should parse through parseProjectFile: ${error instanceof Error ? error.message : String(error)}`);
    return project;
  }

  const bareProjectContents = JSON.stringify(projectFile?.project ?? project);
  let bareRoundTrippedProject = roundTrippedProject;
  try {
    bareRoundTrippedProject = workstation.parseProjectFile(bareProjectContents);
  } catch (error) {
    failures.push(`${label} bare project data should parse through parseProjectFile: ${error instanceof Error ? error.message : String(error)}`);
  }

  check(roundTrippedProject.title === project.title, `${label} roundtrip should preserve title`);
  check(roundTrippedProject.styleId === project.styleId, `${label} roundtrip should preserve style`);
  check(roundTrippedProject.key === project.key, `${label} roundtrip should preserve key`);
  check(roundTrippedProject.bpm === project.bpm, `${label} roundtrip should preserve BPM`);
  check(roundTrippedProject.selectedPattern === project.selectedPattern, `${label} roundtrip should preserve selected Pattern`);
  check(workstation.projectFileName(roundTrippedProject) === workstation.projectFileName(project), `${label} roundtrip should preserve project file name`);
  check(workstation.arrangementTotalBars(roundTrippedProject) === workstation.arrangementTotalBars(project), `${label} roundtrip should preserve arrangement bars`);
  check(roundTrippedProject.arrangement.length === project.arrangement.length, `${label} roundtrip should preserve arrangement block count`);
  check(stableJson(projectEventCounts(roundTrippedProject)) === stableJson(projectEventCounts(project)), `${label} roundtrip should preserve Pattern A/B/C event counts`);
  check(stableJson(roundTrippedProject.patterns) === stableJson(project.patterns), `${label} roundtrip should preserve Pattern A/B/C event data`);
  check(stableJson(roundTrippedProject.mixer) === stableJson(project.mixer), `${label} roundtrip should preserve mixer state`);
  check(stableJson(roundTrippedProject.sound) === stableJson(project.sound), `${label} roundtrip should preserve sound design state`);
  check(stableJson(roundTrippedProject.arrangement) === stableJson(project.arrangement), `${label} roundtrip should preserve arrangement data`);
  check(stableJson(bareRoundTrippedProject) === stableJson(roundTrippedProject), `${label} wrapped and bare project parsing should match`);

  return roundTrippedProject;
}

function validateLegacyProjectMigration() {
  const label = "legacy:single-pattern-chord-events";
  const legacyFile = legacySinglePatternProjectFile();
  const legacyPattern = {
    drumPattern: legacyFile.project.drumPattern,
    bassNotes: legacyFile.project.bassNotes,
    melodyNotes: legacyFile.project.melodyNotes,
    chordEvents: legacyFile.project.chordEvents
  };
  const contents = `${JSON.stringify(legacyFile, null, 2)}\n`;
  let migratedProject = null;

  try {
    migratedProject = workstation.parseProjectFile(contents);
  } catch (error) {
    failures.push(`${label} should parse through parseProjectFile: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }

  check(migratedProject.title === legacyFile.project.title, `${label} should preserve title`);
  check(migratedProject.styleId === legacyFile.project.styleId, `${label} should preserve style`);
  check(migratedProject.key === legacyFile.project.key, `${label} should preserve key`);
  check(migratedProject.deliveryTarget === "vocal_session", `${label} should migrate missing delivery target to the safe default`);
  check(stableJson(migratedProject.sessionBrief) === stableJson({ artist: "", vibe: "", reference: "", notes: "" }), `${label} should migrate missing Session Brief to empty fields`);
  check(migratedProject.metronomeEnabled === false, `${label} should migrate missing metronome toggle to false`);
  check(migratedProject.snapshots.length === 0, `${label} should migrate without snapshots`);
  check(migratedProject.arrangement.every((block) => block.bars === 1), `${label} should migrate missing arrangement bars to one bar`);
  check(migratedProject.arrangement.every((block) => Array.isArray(block.mutedTracks) && block.mutedTracks.length === 0), `${label} should migrate missing arrangement mute maps to empty arrays`);

  for (const slot of workstation.patternSlots) {
    const pattern = migratedProject.patterns[slot];
    check(stableJson(pattern.drumPattern) === stableJson(legacyPattern.drumPattern), `${label} Pattern ${slot} should preserve legacy drums`);
    check(stableJson(pattern.bassNotes) === stableJson(legacyPattern.bassNotes), `${label} Pattern ${slot} should preserve legacy 808/bass notes`);
    check(stableJson(pattern.melodyNotes) === stableJson(legacyPattern.melodyNotes), `${label} Pattern ${slot} should preserve legacy Synth melody notes`);
    check(stableJson(pattern.chordEvents) === stableJson(legacyPattern.chordEvents), `${label} Pattern ${slot} should preserve legacy chord events`);
    check(pattern.chordEvents.length > 0, `${label} Pattern ${slot} should contain migrated chord events`);
  }

  return migratedProject;
}

function validateHandoffSheet(project, label, analysis, stemAnalyses) {
  const sheetFileName = handoff.handoffSheetFileName(project);
  const sheet = handoff.createHandoffSheet(project, analysis, stemAnalyses);
  const styleName = workstation.styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
  const target = workstation.activeDeliveryTarget(project);
  const bars = workstation.arrangementTotalBars(project);
  const arrangementLines = sheet.split("\n").filter((line) => /^\d+\. /.test(line));
  const stemLines = render.stemTrackIds.map((track) => ({
    track,
    label: render.stemTrackLabel(track),
    line: sheet.split("\n").find((line) => line.startsWith(`${render.stemTrackLabel(track)}:`)) ?? ""
  }));

  check(sheetFileName.endsWith("-handoff.txt"), `${label} Handoff Sheet file name should end in -handoff.txt`);
  check(sheetFileName.includes(projectSlug(project)), `${label} Handoff Sheet file name should use the project slug`);
  check(sheet.endsWith("\n"), `${label} Handoff Sheet should end with a newline`);
  check(sheet.length > 1000, `${label} Handoff Sheet should contain a full delivery summary`);
  check(!sheet.match(/undefined|NaN/), `${label} Handoff Sheet contains undefined or NaN text`);
  check(!sheet.match(/AudioClipEvent|sampler|sample import|audio clip/i), `${label} Handoff Sheet contains sampling or audio-clip language`);

  for (const section of [
    "GrooveForge Handoff Sheet",
    "Project",
    "Delivery Target",
    "Session Brief",
    "Arrangement Blocks",
    "Export Meter",
    "Stem Meter",
    "Notes"
  ]) {
    check(sheet.includes(section), `${label} Handoff Sheet missing ${section} section`);
  }

  check(sheet.includes(`Title: ${project.title}`), `${label} Handoff Sheet should include the project title`);
  check(sheet.includes(`Style: ${styleName}`), `${label} Handoff Sheet should include the style name`);
  check(sheet.includes(`BPM: ${project.bpm}`), `${label} Handoff Sheet should include BPM`);
  check(sheet.includes(`Key: ${project.key}`), `${label} Handoff Sheet should include key`);
  check(sheet.includes(`Selected Pattern: ${project.selectedPattern}`), `${label} Handoff Sheet should include selected Pattern`);
  check(sheet.includes(`Arrangement: ${bars} bars`), `${label} Handoff Sheet should include arrangement length`);
  check(sheet.includes(`Name: ${target.name}`), `${label} Handoff Sheet should include Delivery Target name`);
  check(sheet.includes(`Focus: ${target.focus}`), `${label} Handoff Sheet should include Delivery Target focus`);
  check(sheet.includes(`Target Stems: ${target.stemGoal}`), `${label} Handoff Sheet should include target stem goal`);
  check(sheet.includes(`Master Preset: ${project.masterPreset}`), `${label} Handoff Sheet should include master preset`);
  check(sheet.includes("Artist:"), `${label} Handoff Sheet should include Session Brief artist`);
  check(sheet.includes("Vibe:"), `${label} Handoff Sheet should include Session Brief vibe`);
  check(sheet.includes("Reference:"), `${label} Handoff Sheet should include Session Brief reference`);
  check(sheet.includes("Notes:"), `${label} Handoff Sheet should include Session Brief notes`);

  check(arrangementLines.length === project.arrangement.length, `${label} Handoff Sheet arrangement block count should match project arrangement`);
  project.arrangement.forEach((block, index) => {
    const line = arrangementLines[index] ?? "";
    check(line.includes(`${index + 1}. ${block.section}`), `${label} Handoff Sheet arrangement block ${index + 1} should include section`);
    check(line.includes(`Pattern ${block.pattern}`), `${label} Handoff Sheet arrangement block ${index + 1} should include Pattern`);
  });

  check(sheet.includes(`Status: ${analysis.status}`), `${label} Handoff Sheet should include export status`);
  check(sheet.includes("Duration:"), `${label} Handoff Sheet should include export duration`);
  check(sheet.includes("Peak:"), `${label} Handoff Sheet should include export peak`);
  check(sheet.includes("RMS:"), `${label} Handoff Sheet should include export RMS`);
  check(sheet.includes("Dynamics:"), `${label} Handoff Sheet should include export dynamics`);
  check(sheet.includes("Headroom:"), `${label} Handoff Sheet should include export headroom`);
  check(sheet.includes("Limiter Activity:"), `${label} Handoff Sheet should include limiter activity`);

  for (const { track, label: stemLabel, line } of stemLines) {
    check(line.includes(stemLabel), `${label} Handoff Sheet should include ${track} stem label`);
    check(line.includes("Audible"), `${label} Handoff Sheet ${track} stem should be audible`);
    check(line.includes("Peak") && line.includes("RMS") && line.includes("Headroom"), `${label} Handoff Sheet ${track} stem should include meter data`);
  }

  return {
    sheetFileName,
    sheetBytes: sheet.length
  };
}

function installDownloadPathMock(label) {
  const originalDocument = globalThis.document;
  const originalCreateObjectURL = globalThis.URL.createObjectURL;
  const originalRevokeObjectURL = globalThis.URL.revokeObjectURL;
  const state = {
    clicks: [],
    urls: [],
    revokedUrls: []
  };

  globalThis.URL.createObjectURL = (blob) => {
    const url = `blob:grooveforge-smoke-${state.urls.length + 1}`;
    state.urls.push({ url, blob });
    return url;
  };
  globalThis.URL.revokeObjectURL = (url) => {
    state.revokedUrls.push(url);
  };
  globalThis.document = {
    createElement(tagName) {
      check(tagName === "a", `${label} should create anchor elements for downloads`);
      return {
        href: "",
        download: "",
        click() {
          state.clicks.push({
            href: this.href,
            download: this.download
          });
        }
      };
    }
  };

  return {
    state,
    restore() {
      globalThis.URL.createObjectURL = originalCreateObjectURL;
      globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
      if (originalDocument === undefined) {
        delete globalThis.document;
      } else {
        globalThis.document = originalDocument;
      }
    }
  };
}

function validateDownloadPathSmoke(project) {
  const label = "download:path";
  const analysis = render.analyzeExport(project);
  const stemAnalyses = render.analyzeStemExports(project);
  const mock = installDownloadPathMock(label);
  let expectedDownloads = [];

  try {
    const projectFileName = workstation.projectFileName(project);
    const projectFileContents = workstation.serializeProjectFile(project);
    const mixFileName = render.mixWavFileName(project);
    const handoffSheetFileName = handoff.handoffSheetFileName(project);
    downloads.downloadProjectFile(projectFileContents, projectFileName);
    render.exportWav(project);
    const stemFileNames = render.exportStems(project);
    const midiFileName = midi.exportMidi(project);
    downloads.downloadTextFile(handoff.createHandoffSheet(project, analysis, stemAnalyses), handoffSheetFileName);
    expectedDownloads = [
      { fileName: projectFileName, mimeType: "application/json" },
      { fileName: mixFileName, mimeType: "audio/wav" },
      ...stemFileNames.map((fileName) => ({ fileName, mimeType: "audio/wav" })),
      { fileName: midiFileName, mimeType: "audio/midi" },
      { fileName: handoffSheetFileName, mimeType: "text/plain;charset=utf-8" }
    ];
  } catch (error) {
    failures.push(`${label} should complete mocked local downloads: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    mock.restore();
  }

  check(mock.state.urls.length === expectedDownloads.length, `${label} should create one Blob URL per deliverable`);
  check(mock.state.clicks.length === expectedDownloads.length, `${label} should click one anchor per deliverable`);
  check(mock.state.revokedUrls.length === expectedDownloads.length, `${label} should revoke one Blob URL per deliverable`);

  expectedDownloads.forEach((expected, index) => {
    const createdUrl = mock.state.urls[index];
    const click = mock.state.clicks[index];
    check(Boolean(createdUrl), `${label} ${expected.fileName} should create a Blob URL`);
    check(Boolean(click), `${label} ${expected.fileName} should click a download anchor`);
    check(createdUrl?.blob instanceof Blob, `${label} ${expected.fileName} should use a Blob payload`);
    check(createdUrl?.blob?.size > 0, `${label} ${expected.fileName} Blob should not be empty`);
    check(createdUrl?.blob?.type === expected.mimeType, `${label} ${expected.fileName} should use ${expected.mimeType}`);
    check(click?.download === expected.fileName, `${label} should set download file name ${expected.fileName}`);
    check(click?.href === createdUrl?.url, `${label} ${expected.fileName} anchor href should match the Blob URL`);
    check(mock.state.revokedUrls[index] === createdUrl?.url, `${label} ${expected.fileName} should revoke its Blob URL`);
  });

  return {
    expected: expectedDownloads.length,
    clicked: mock.state.clicks.length,
    fileNames: expectedDownloads.map((download) => download.fileName)
  };
}

async function validateProjectExportSmoke(smokeCase) {
  const { label, expectedStyleId } = smokeCase;
  const project = validateProjectFileRoundTrip(smokeCase.project, label);
  const bars = workstation.arrangementTotalBars(project);
  const expectedDuration = bars * workstation.stepsPerBar * workstation.projectStepDurationSeconds(project);

  check(project.styleId === expectedStyleId, `${label} should use ${expectedStyleId}, got ${project.styleId}`);
  check(bars === 8, `${label} should be 8 bars, got ${bars}`);
  check(project.arrangement.length === 8, `${label} should have 8 arrangement blocks, got ${project.arrangement.length}`);
  check(project.mixer.every((channel) => coreTrackTypes.has(channel.id)), `${label} contains a non-core or sampling-oriented mixer track`);
  check(!JSON.stringify(project).match(/AudioClipEvent|sampler|sample import|audio clip/i), `${label} contains sampling or audio-clip language`);

  for (const slot of workstation.patternSlots) {
    const pattern = project.patterns[slot];
    const drumHits = workstation.drumLanes.reduce(
      (total, lane) => total + pattern.drumPattern[lane].filter(Boolean).length,
      0
    );
    check(drumHits > 0, `${label} Pattern ${slot} should contain drum hits`);
    check(pattern.bassNotes.length > 0, `${label} Pattern ${slot} should contain 808/bass notes`);
    check(pattern.melodyNotes.length > 0, `${label} Pattern ${slot} should contain Synth melody notes`);
    check(pattern.chordEvents.length > 0, `${label} Pattern ${slot} should contain chord events`);
  }

  const mixAnalysis = render.analyzeExport(project);
  check(mixAnalysis.status !== "Silent", `${label} full mix analysis should not be silent`);
  check(mixAnalysis.channels === 2, `${label} full mix should be stereo, got ${mixAnalysis.channels} channels`);
  check(mixAnalysis.sampleRate === 44100, `${label} full mix sample rate should be 44100, got ${mixAnalysis.sampleRate}`);
  check(Math.abs(mixAnalysis.durationSeconds - expectedDuration) < 0.05, `${label} full mix duration does not match the 8-bar arrangement`);
  check(Number.isFinite(mixAnalysis.peakDb), `${label} full mix peak should be finite`);
  check(Number.isFinite(mixAnalysis.rmsDb), `${label} full mix RMS should be finite`);

  const mixFileName = render.mixWavFileName(project);
  check(mixFileName.endsWith(".wav"), `${label} full mix file name should end in .wav`);
  check(mixFileName.includes(projectSlug(project)), `${label} full mix file name should use the project slug`);
  checkWavBytes(await blobBytes(render.createMixWavBlob(project)), `${label} full mix`);

  const stemAnalyses = render.analyzeStemExports(project);
  const stemNames = render.stemWavFileNames(project);
  check(stemNames.length === render.stemTrackIds.length, `${label} stem file count should match stem track count`);
  for (const [index, track] of render.stemTrackIds.entries()) {
    const analysis = stemAnalyses[track];
    check(stemNames[index]?.endsWith("-stem.wav"), `${label} ${track} stem file name should end in -stem.wav`);
    check(analysis.status !== "Silent", `${label} ${track} stem analysis should not be silent`);
    check(Math.abs(analysis.durationSeconds - expectedDuration) < 0.05, `${label} ${track} stem duration does not match the 8-bar arrangement`);
    checkWavBytes(await blobBytes(render.createStemWavBlob(project, track)), `${label} ${track} stem`);
  }

  const midiBytes = midi.createMidiFile(project);
  check(midiBytes.byteLength > 128, `${label} MIDI file is too small`);
  check(ascii(midiBytes, 0, 4) === "MThd", `${label} MIDI file missing MThd header`);
  check(midi.midiFileName(project).endsWith(".mid"), `${label} MIDI file name should end in .mid`);
  const handoffSummary = validateHandoffSheet(project, label, mixAnalysis, stemAnalyses);

  return {
    label,
    status: mixAnalysis.status,
    durationSeconds: mixAnalysis.durationSeconds,
    projectFileName: workstation.projectFileName(project),
    projectFileBytes: workstation.serializeProjectFile(project).length,
    mixFileName,
    midiFileName: midi.midiFileName(project),
    midiBytes: midiBytes.byteLength,
    handoffSheetFileName: handoffSummary.sheetFileName,
    handoffSheetBytes: handoffSummary.sheetBytes
  };
}

const supportedStyleIds = workstation.styleProfiles.map((profile) => profile.id);
check(new Set(supportedStyleIds).size === supportedStyleIds.length, "styleProfiles should not contain duplicate style ids");
check(workstation.styleProfiles.length > 0, "styleProfiles should contain at least one supported style");
const blueprintStyleIds = new Set(workstation.beatBlueprints.map((blueprint) => blueprint.styleId));
for (const styleId of supportedStyleIds) {
  check(blueprintStyleIds.has(styleId), `style:${styleId} should have a dedicated Beat Blueprint`);
}

const blueprintCases = workstation.beatBlueprints.map((blueprint) => ({
  kind: "blueprint",
  label: `blueprint:${blueprint.id}`,
  project: blueprintSmokeProject(blueprint),
  expectedStyleId: blueprint.styleId
}));
const styleCases = workstation.styleProfiles.map((profile) => ({
  kind: "style",
  label: `style:${profile.id}`,
  project: styleSmokeProject(profile),
  expectedStyleId: profile.id
}));
const smokeCases = [...blueprintCases, ...styleCases];
const legacyMigrationProject = validateLegacyProjectMigration();
if (legacyMigrationProject) {
  smokeCases.push({
    kind: "legacy",
    label: "legacy:single-pattern-chord-events",
    project: legacyMigrationProject,
    expectedStyleId: legacyMigrationProject.styleId
  });
}
const summaries = [];

for (const smokeCase of smokeCases) {
  summaries.push(await validateProjectExportSmoke(smokeCase));
}
const downloadSmokeProject = workstation.parseProjectFile(workstation.serializeProjectFile(blueprintCases[0].project));
const downloadSmokeSummary = validateDownloadPathSmoke(downloadSmokeProject);

if (failures.length > 0) {
  console.error("GrooveForge runtime smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("GrooveForge runtime smoke passed.");
console.log(`- Scope: ${smokeScope}`);
console.log(`- Blueprints: ${blueprintCases.length}/${workstation.beatBlueprints.length} sample-free 8-bar starts`);
console.log(`- Styles: ${styleCases.length}/${workstation.styleProfiles.length} supported style profiles`);
console.log(`- Legacy migrations: ${legacyMigrationProject ? 1 : 0}/1 single-pattern chord-event project preserved`);
console.log(`- Project roundtrips: ${summaries.length}/${smokeCases.length} .grooveforge.json save/load checks before export`);
console.log(`- Handoff sheets: ${summaries.length}/${smokeCases.length} text deliverables verified`);
console.log(`- Download path: ${downloadSmokeSummary.clicked}/${downloadSmokeSummary.expected} mocked Blob URL downloads verified (${downloadSmokeSummary.fileNames.join(", ")})`);
console.log(`- Style coverage: ${supportedStyleIds.join(", ")}`);
for (const summary of summaries) {
  console.log(`- ${summary.label}: ${summary.status}, ${summary.durationSeconds.toFixed(2)}s, ${summary.projectFileName} (${summary.projectFileBytes} bytes), ${summary.mixFileName}, ${summary.midiFileName} (${summary.midiBytes} bytes), ${summary.handoffSheetFileName} (${summary.handoffSheetBytes} bytes)`);
}
