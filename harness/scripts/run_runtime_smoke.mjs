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
const smokeScope = "sample-free 8-bar beat without writing media artifacts";

const project = {
  ...workstation.applyBeatBlueprint(workstation.starterProject, "dark_808"),
  arrangement: workstation.createPatternChain("eight_bar")
};
const bars = workstation.arrangementTotalBars(project);
const expectedDuration = bars * workstation.stepsPerBar * workstation.projectStepDurationSeconds(project);
const coreTrackTypes = new Set(["drum_rack", "bass_808", "synth", "chord", "fx_return", "master"]);

check(project.styleId === "drill", "smoke project should use the drill style blueprint");
check(bars === 8, `smoke project should be 8 bars, got ${bars}`);
check(project.arrangement.length === 8, `smoke project should have 8 arrangement blocks, got ${project.arrangement.length}`);
check(project.mixer.every((channel) => coreTrackTypes.has(channel.id)), "smoke project contains a non-core or sampling-oriented mixer track");
check(!JSON.stringify(project).match(/AudioClipEvent|sampler|sample import|audio clip/i), "smoke project contains sampling or audio-clip language");

for (const slot of workstation.patternSlots) {
  const pattern = project.patterns[slot];
  const drumHits = workstation.drumLanes.reduce(
    (total, lane) => total + pattern.drumPattern[lane].filter(Boolean).length,
    0
  );
  check(drumHits > 0, `Pattern ${slot} should contain drum hits`);
  check(pattern.bassNotes.length > 0, `Pattern ${slot} should contain 808/bass notes`);
  check(pattern.melodyNotes.length > 0, `Pattern ${slot} should contain Synth melody notes`);
  check(pattern.chordEvents.length > 0, `Pattern ${slot} should contain chord events`);
}

const mixAnalysis = render.analyzeExport(project);
check(mixAnalysis.status !== "Silent", "full mix analysis should not be silent");
check(mixAnalysis.channels === 2, `full mix should be stereo, got ${mixAnalysis.channels} channels`);
check(mixAnalysis.sampleRate === 44100, `full mix sample rate should be 44100, got ${mixAnalysis.sampleRate}`);
check(Math.abs(mixAnalysis.durationSeconds - expectedDuration) < 0.05, "full mix duration does not match the 8-bar arrangement");
check(Number.isFinite(mixAnalysis.peakDb), "full mix peak should be finite");
check(Number.isFinite(mixAnalysis.rmsDb), "full mix RMS should be finite");

const mixFileName = render.mixWavFileName(project);
check(mixFileName.endsWith(".wav"), "full mix file name should end in .wav");
check(mixFileName.includes("untitled-beat"), "full mix file name should use the project slug");
checkWavBytes(await blobBytes(render.createMixWavBlob(project)), "full mix");

const stemAnalyses = render.analyzeStemExports(project);
const stemNames = render.stemWavFileNames(project);
check(stemNames.length === render.stemTrackIds.length, "stem file count should match stem track count");
for (const [index, track] of render.stemTrackIds.entries()) {
  const analysis = stemAnalyses[track];
  check(stemNames[index]?.endsWith("-stem.wav"), `${track} stem file name should end in -stem.wav`);
  check(analysis.status !== "Silent", `${track} stem analysis should not be silent`);
  check(Math.abs(analysis.durationSeconds - expectedDuration) < 0.05, `${track} stem duration does not match the 8-bar arrangement`);
  checkWavBytes(await blobBytes(render.createStemWavBlob(project, track)), `${track} stem`);
}

const midiBytes = midi.createMidiFile(project);
check(midiBytes.byteLength > 128, "MIDI file is too small");
check(ascii(midiBytes, 0, 4) === "MThd", "MIDI file missing MThd header");
check(midi.midiFileName(project).endsWith(".mid"), "MIDI file name should end in .mid");

if (failures.length > 0) {
  console.error("GrooveForge runtime smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("GrooveForge runtime smoke passed.");
console.log(`- Scope: ${smokeScope}`);
console.log(`- 8-bar ${project.styleId} beat: ${mixAnalysis.status}, ${mixAnalysis.durationSeconds.toFixed(2)}s`);
console.log(`- WAV: ${mixFileName}; stems: ${stemNames.join(", ")}`);
console.log(`- MIDI: ${midi.midiFileName(project)} (${midiBytes.byteLength} bytes)`);
