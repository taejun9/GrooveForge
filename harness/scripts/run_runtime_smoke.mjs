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
const coreTrackTypes = new Set(["drum_rack", "bass_808", "synth", "chord", "fx_return", "master"]);
const smokeKey = "F minor";
const smokeScope = "sample-free all-style 8-bar beats with local project-file roundtrips without writing media artifacts";

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

  return {
    label,
    status: mixAnalysis.status,
    durationSeconds: mixAnalysis.durationSeconds,
    projectFileName: workstation.projectFileName(project),
    projectFileBytes: workstation.serializeProjectFile(project).length,
    mixFileName,
    midiFileName: midi.midiFileName(project),
    midiBytes: midiBytes.byteLength
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
console.log(`- Style coverage: ${supportedStyleIds.join(", ")}`);
for (const summary of summaries) {
  console.log(`- ${summary.label}: ${summary.status}, ${summary.durationSeconds.toFixed(2)}s, ${summary.projectFileName} (${summary.projectFileBytes} bytes), ${summary.mixFileName}, ${summary.midiFileName} (${summary.midiBytes} bytes)`);
}
