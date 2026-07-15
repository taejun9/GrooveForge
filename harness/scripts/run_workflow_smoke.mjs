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

const workstation = await import("../../src/domain/workstation.ts");
const render = await import("../../src/audio/render.ts");
const midi = await import("../../src/audio/midi.ts");
const handoff = await import("../../src/audio/handoff.ts");

const forbiddenSamplingText = /AudioClipEvent|sampler|sample import|sample browser|chop pads|audio clip/i;

function cloneProject(project) {
  return workstation.parseProjectFile(workstation.serializeProjectFile(project));
}

function patternEventCounts(pattern) {
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

function projectEventCounts(project) {
  return workstation.patternSlots.reduce(
    (totals, slot) => {
      const counts = patternEventCounts(project.patterns[slot]);
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

function validateWorkflowProject(workflow) {
  const { label, project, expected } = workflow;
  const projectJson = workstation.serializeProjectFile(project);
  const reopened = workstation.parseProjectFile(projectJson);
  const counts = projectEventCounts(reopened);
  const patterns = usedPatterns(reopened);
  const bars = workstation.arrangementTotalBars(reopened);
  const musicalDuration = bars * workstation.stepsPerBar * workstation.projectStepDurationSeconds(reopened);
  const deliveredDuration = musicalDuration + render.exportTailDurationSeconds(reopened);
  const analysis = render.analyzeExport(reopened);
  const stemAnalyses = render.analyzeStemExports(reopened);
  const midiBytes = midi.createMidiFile(reopened);
  const handoffSheet = handoff.createHandoffSheet(reopened, analysis, stemAnalyses);
  const target = workstation.activeDeliveryTarget(reopened);

  check(reopened.title === expected.title, `${label} title should be ${expected.title}`);
  check(reopened.mode === expected.mode, `${label} mode should be ${expected.mode}`);
  check(reopened.styleId === expected.styleId, `${label} style should be ${expected.styleId}`);
  check(reopened.key === expected.key, `${label} key should be ${expected.key}`);
  check(reopened.bpm === expected.bpm, `${label} BPM should be ${expected.bpm}`);
  check(reopened.selectedPattern === expected.selectedPattern, `${label} selected Pattern should be ${expected.selectedPattern}`);
  check(reopened.deliveryTarget === expected.deliveryTarget, `${label} delivery target should be ${expected.deliveryTarget}`);
  check(target.preferredMasterPreset === reopened.masterPreset, `${label} master preset should match delivery target`);
  check(reopened.masterCeilingDb === workstation.masterPresetCeilingDb(reopened.masterPreset), `${label} master ceiling should match master preset`);
  check(bars >= expected.minBars, `${label} should have at least ${expected.minBars} bars, got ${bars}`);
  for (const slot of expected.usedPatterns) {
    check(patterns.has(slot), `${label} arrangement should use Pattern ${slot}`);
  }
  check(counts.drums >= expected.minDrums, `${label} should have at least ${expected.minDrums} drum hits, got ${counts.drums}`);
  check(counts.bass >= expected.minBass, `${label} should have at least ${expected.minBass} bass notes, got ${counts.bass}`);
  check(counts.melody >= expected.minMelody, `${label} should have at least ${expected.minMelody} melody notes, got ${counts.melody}`);
  check(counts.chords >= expected.minChords, `${label} should have at least ${expected.minChords} chord events, got ${counts.chords}`);
  check(reopened.mixer.every((channel) => !channel.muted && !channel.solo), `${label} mixer should be audible without solo/mute locks`);
  check(!forbiddenSamplingText.test(projectJson), `${label} project JSON should stay sampling-free`);

  check(analysis.status !== "Silent", `${label} full mix should not be silent`);
  check(analysis.sampleRate === 44100, `${label} full mix sample rate should be 44100`);
  check(analysis.channels === 2, `${label} full mix should be stereo`);
  check(Math.abs(analysis.durationSeconds - deliveredDuration) < 0.05, `${label} full mix duration should match arrangement plus export tail`);
  for (const track of render.stemTrackIds) {
    const stem = stemAnalyses[track];
    check(stem.status !== "Silent", `${label} ${track} stem should not be silent`);
    check(Math.abs(stem.durationSeconds - deliveredDuration) < 0.05, `${label} ${track} stem duration should match arrangement plus export tail`);
  }

  check(ascii(midiBytes, 0, 4) === "MThd", `${label} MIDI should include an MThd header`);
  check(midiBytes.byteLength > 1000, `${label} MIDI should include arrangement events`);
  check(handoffSheet.includes("GrooveForge Handoff Sheet"), `${label} Handoff Sheet should include title`);
  check(handoffSheet.includes("Delivery Target"), `${label} Handoff Sheet should include Delivery Target`);
  check(handoffSheet.includes(target.name), `${label} Handoff Sheet should include target name`);
  check(handoffSheet.includes("Session Brief"), `${label} Handoff Sheet should include Session Brief`);
  check(handoffSheet.includes("Export Meter"), `${label} Handoff Sheet should include Export Meter`);
  check(handoffSheet.includes("Stem Meter"), `${label} Handoff Sheet should include Stem Meter`);
  check(!forbiddenSamplingText.test(handoffSheet), `${label} Handoff Sheet should stay sampling-free`);

  return {
    label,
    title: reopened.title,
    mode: reopened.mode,
    styleId: reopened.styleId,
    bpm: reopened.bpm,
    key: reopened.key,
    bars,
    deliveryTarget: target.name,
    masterPreset: reopened.masterPreset,
    status: analysis.status,
    midiBytes: midiBytes.byteLength,
    projectBytes: projectJson.length,
    counts
  };
}

const workflows = [
  {
    label: "beginner:guided-first-beat",
    project: workstation.createAudienceStarterProject("beginner"),
    expected: {
      title: "First Guided Beat",
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
  },
  {
    label: "producer:fast-pass",
    project: workstation.createAudienceStarterProject("producer"),
    expected: {
      title: "Producer Fast Pass",
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
  }
];

const summaries = workflows.map(validateWorkflowProject);

if (failures.length > 0) {
  console.error("GrooveForge workflow smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("GrooveForge workflow smoke passed.");
console.log("- Scope: first-session beginner and producer workflows from starter project through setup, composition, arrangement, mix/master, save/load, export analysis, MIDI, and Handoff without media artifacts");
for (const summary of summaries) {
  console.log(
    `- ${summary.label}: ${summary.mode}, ${summary.bpm} BPM ${summary.key} ${summary.styleId}, ${summary.bars} bars, ${summary.deliveryTarget}, ${summary.masterPreset}, ${summary.status}, ${summary.projectBytes} project bytes, ${summary.midiBytes} MIDI bytes, events ${summary.counts.drums}/${summary.counts.bass}/${summary.counts.melody}/${summary.counts.chords}`
  );
}
