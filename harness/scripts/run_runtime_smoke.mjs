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
const deliveryBundle = await import("../../src/audio/deliveryBundle.ts");
const downloads = await import("../../src/platform/downloads.ts");
const coreTrackTypes = new Set(["drum_rack", "bass_808", "synth", "chord", "fx_return", "master"]);
const smokeKey = "F minor";
const smokeScope = "sample-free first-run starter project plus all-style 8-bar beats with local project-file roundtrips, bounded mixer-topology recovery, Handoff Sheet checks, and mocked download-path checks without writing media artifacts";

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

function validateUnicodeFileIdentity() {
  const identityCases = [
    ["서울 비트", "서울-비트"],
    ["부산 비트", "부산-비트"],
    ["東京ビート", "東京ビート"],
    ["🔥 새 비트", "새-비트"]
  ].map(([title, expectedStem]) => {
    const project = { ...workstation.starterProject, title };
    const stem = workstation.projectFileStem(project);
    const fileNames = [
      workstation.projectFileName(project),
      render.mixWavFileName(project),
      ...render.stemWavFileNames(project),
      midi.midiFileName(project),
      handoff.handoffSheetFileName(project),
      deliveryBundle.deliveryBundleZipFileName(project)
    ];
    check(stem === expectedStem, `unicode-file-identity:${title} should preserve the normalized title stem ${expectedStem}, got ${stem}`);
    check(fileNames.every((fileName) => fileName.startsWith(`${stem}-`) || fileName.startsWith(`${stem}.`)), `unicode-file-identity:${title} deliverables should share one project file stem`);
    check(fileNames.every((fileName) => !/[\\/\u0000-\u001f\u007f]/u.test(fileName)), `unicode-file-identity:${title} deliverables should not contain path separators or control characters`);
    return { title, stem, fileNames };
  });

  check(new Set(identityCases.map((entry) => entry.stem)).size === identityCases.length, "unicode-file-identity: distinct non-English titles must keep distinct stems");
  for (let fileIndex = 0; fileIndex < identityCases[0].fileNames.length; fileIndex += 1) {
    check(new Set(identityCases.map((entry) => entry.fileNames[fileIndex])).size === identityCases.length, `unicode-file-identity: deliverable position ${fileIndex + 1} must not collide across distinct titles`);
  }

  const englishProject = { ...workstation.starterProject, title: "Midnight Drive" };
  check(workstation.projectFileStem(englishProject) === "midnight-drive", "unicode-file-identity: English title output must remain unchanged");
  check(render.mixWavFileName(englishProject) === "midnight-drive-demo.wav", "unicode-file-identity: English WAV output must remain unchanged");
  check(workstation.projectFileStem({ title: "Cafe\u0301 De\u0301ja\u0300 Vu" }) === "café-déjà-vu", "unicode-file-identity: canonically equivalent accents must normalize consistently");
  check(workstation.projectFileStem({ title: "CON" }) === "grooveforge-con", "unicode-file-identity: Windows reserved basenames must be prefixed");
  check(workstation.projectFileStem({ title: "🔥 !!!" }) === "grooveforge-project", "unicode-file-identity: symbol-only titles must use the stable fallback");
  const boundedStem = workstation.projectFileStem({ title: "서울야간비트".repeat(80) });
  check(new TextEncoder().encode(boundedStem).byteLength <= 120, "unicode-file-identity: project file stem must stay within the UTF-8 byte bound");
  check(!boundedStem.endsWith("-"), "unicode-file-identity: bounded project file stem must not end with a separator");

  return { cases: identityCases.length, deliverablesPerCase: identityCases[0].fileNames.length, boundedBytes: new TextEncoder().encode(boundedStem).byteLength };
}

function validateProjectTitleIntegrity() {
  const malformedTitle = "  서울\n야간\t비트\u0000  ";
  const expectedTitle = "서울 야간 비트";
  const { snapshots: _snapshots, ...snapshotProject } = workstation.starterProject;
  const malformedProject = {
    ...workstation.starterProject,
    title: malformedTitle,
    snapshots: [
      {
        id: "snapshot-title-integrity-1",
        name: "Title integrity",
        createdAt: "2026-07-15T00:00:00.000Z",
        project: { ...snapshotProject, title: "  스냅샷\n제목\u0000  " }
      }
    ]
  };
  const wrapped = JSON.stringify({
    app: "GrooveForge",
    fileVersion: workstation.projectFileVersion,
    savedAt: "2026-07-15T00:00:00.000Z",
    project: malformedProject
  });
  const parsed = workstation.parseProjectFile(wrapped);
  check(parsed.title === expectedTitle, "project-title-integrity: import should normalize multiline/control title metadata");
  check(parsed.snapshots[0]?.project.title === "스냅샷 제목", "project-title-integrity: imported snapshot titles should use the same normalization contract");

  const serialized = workstation.serializeProjectFile(malformedProject);
  const serializedFile = safeJsonParse(serialized, "project-title-integrity");
  check(serializedFile?.project?.title === expectedTitle, "project-title-integrity: durable serialization should normalize the active title before writing");
  check(serializedFile?.project?.snapshots?.[0]?.project?.title === "스냅샷 제목", "project-title-integrity: durable serialization should normalize snapshot titles before writing");
  check(workstation.parseProjectFile(serialized).title === expectedTitle, "project-title-integrity: normalized title should survive save/load roundtrip");
  check(workstation.projectFileStem(parsed) === "서울-야간-비트", "project-title-integrity: normalized Korean title should own the shared filename stem");

  const analysis = render.analyzeExport(parsed);
  const stemAnalyses = render.analyzeStemExports(parsed);
  const handoffText = handoff.createHandoffSheet(malformedProject, analysis, stemAnalyses);
  check(handoffText.split("\n").filter((line) => line.startsWith("Title:")).length === 1, "project-title-integrity: Handoff should contain exactly one Title line");
  check(handoffText.includes(`Title: ${expectedTitle}\nStyle:`), "project-title-integrity: Handoff Title should be one normalized line before Style");
  check(!handoffText.includes("\u0000"), "project-title-integrity: Handoff should not retain NUL title data");

  const manifest = deliveryBundle.createDeliveryBundleManifest(malformedProject, "서울-야간-비트-delivery-bundle.zip", []);
  const manifestMarkdown = deliveryBundle.createDeliveryBundleManifestMarkdown(manifest);
  check(manifest.title === expectedTitle, "project-title-integrity: Delivery Manifest JSON should use the normalized title");
  check(manifestMarkdown.includes(`Project: ${expectedTitle}\nDelivery target:`), "project-title-integrity: Delivery Manifest Markdown should keep Project metadata on one line");
  check(!manifestMarkdown.includes("\u0000"), "project-title-integrity: Delivery Manifest Markdown should not retain NUL title data");
  const directManifestMarkdown = deliveryBundle.createDeliveryBundleManifestMarkdown({ ...manifest, title: malformedTitle });
  check(directManifestMarkdown.includes(`Project: ${expectedTitle}\nDelivery target:`), "project-title-integrity: direct Manifest Markdown creation should normalize its title defensively");

  check(workstation.normalizeProjectTitle(" \t\n ") === workstation.defaultProjectTitle, "project-title-integrity: whitespace-only titles should use Untitled Beat");
  check(workstation.projectFileStem({ title: " \t\n " }) === "untitled-beat", "project-title-integrity: blank durable title fallback should own a stable filename stem");
  check(workstation.normalizeProjectTitle("Cafe\u0301 東京 👩‍🎤") === "Café 東京 👩‍🎤", "project-title-integrity: accents, Japanese, and ZWJ emoji should remain readable");
  check(workstation.sanitizeProjectTitleInput("New ") === "New ", "project-title-integrity: input-time safety should preserve a trailing space while typing another word");
  const bounded = workstation.normalizeProjectTitle("한".repeat(10000));
  check(Array.from(bounded).length === workstation.maxProjectTitleLength, "project-title-integrity: imported titles should be bounded by Unicode code points");

  return {
    normalizedTitle: parsed.title,
    fileStem: workstation.projectFileStem(parsed),
    maxCodePoints: workstation.maxProjectTitleLength
  };
}

function validateProjectImportSafety() {
  const unsafeProject = {
    ...workstation.starterProject,
    title: "Recovered Import Safety Beat",
    bpm: -120,
    key: "Not a supported key",
    swing: 4,
    masterCeilingDb: 18,
    mixer: workstation.starterProject.mixer.map((channel, index) => ({
      ...channel,
      volumeDb: index === 0 ? 900 : index === 1 ? -900 : channel.id === "master" ? 900 : channel.volumeDb,
      pan: index === 0 ? 900 : index === 1 ? -900 : channel.pan
    })),
    snapshots: []
  };
  const wrapped = JSON.stringify({
    app: "GrooveForge",
    fileVersion: workstation.projectFileVersion,
    savedAt: "2026-07-15T00:00:00.000Z",
    project: unsafeProject
  });
  const parsed = workstation.parseProjectFile(wrapped);
  const bareParsed = workstation.parseProjectFile(JSON.stringify(unsafeProject));
  const serialized = workstation.serializeProjectFile(unsafeProject);
  const serializedFile = safeJsonParse(serialized, "project-import-safety");

  check(parsed.bpm === workstation.minProjectBpm, "project-import-safety: negative BPM should clamp to the domain minimum");
  check(parsed.key === "A minor", "project-import-safety: unsupported keys should recover to A minor");
  check(parsed.swing === workstation.maxProjectSwing, "project-import-safety: excessive swing should clamp to the domain maximum");
  check(parsed.masterCeilingDb === workstation.maxMasterCeilingDb, "project-import-safety: positive master ceiling should clamp to 0 dB");
  check(parsed.mixer[0]?.volumeDb === workstation.maxMixerVolumeDb, "project-import-safety: excessive channel gain should clamp to +3 dB");
  check(parsed.mixer[1]?.volumeDb === workstation.minMixerVolumeDb, "project-import-safety: excessive channel cut should clamp to -36 dB");
  check(parsed.mixer[0]?.pan === workstation.maxMixerPan, "project-import-safety: excessive right pan should clamp to +100");
  check(parsed.mixer[1]?.pan === workstation.minMixerPan, "project-import-safety: excessive left pan should clamp to -100");
  check(parsed.mixer.find((channel) => channel.id === "master")?.volumeDb === workstation.maxMixerVolumeDb, "project-import-safety: master output should use the same safe mixer bound");
  check(workstation.projectStepDurationSeconds(parsed) > 0, "project-import-safety: repaired imports must always produce positive step duration");
  check(stableJson(bareParsed) === stableJson(parsed), "project-import-safety: wrapped and bare unsafe project data should canonicalize identically");
  check(serializedFile?.fileVersion === workstation.projectFileVersion, "project-import-safety: serialization should write the current file version");
  check(serializedFile?.project?.bpm === workstation.minProjectBpm, "project-import-safety: durable serialization should canonicalize BPM before writing");
  check(serializedFile?.project?.mixer?.[0]?.volumeDb === workstation.maxMixerVolumeDb, "project-import-safety: durable serialization should canonicalize mixer gain before writing");
  check(unsafeProject.bpm === -120, "project-import-safety: parsing and serialization should not mutate the caller's source project");

  const rejected = [];
  for (const [label, contents, expectedMessage] of [
    [
      "future-version",
      JSON.stringify({ app: "GrooveForge", fileVersion: workstation.projectFileVersion + 1, savedAt: "future", project: unsafeProject }),
      "Unsupported GrooveForge project file version"
    ],
    [
      "missing-version",
      JSON.stringify({ app: "GrooveForge", savedAt: "missing", project: unsafeProject }),
      "Unsupported GrooveForge project file version"
    ],
    [
      "oversized-source",
      " ".repeat(workstation.maxProjectFileCharacters + 1),
      "character safety limit"
    ]
  ]) {
    try {
      workstation.parseProjectFile(contents);
      failures.push(`project-import-safety:${label} should be rejected`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      check(message.includes(expectedMessage), `project-import-safety:${label} should explain the rejected boundary`);
      rejected.push(label);
    }
  }

  try {
    workstation.serializeProjectFile({
      ...workstation.starterProject,
      mixer: workstation.starterProject.mixer.map((channel, index) => ({
        ...channel,
        name: index === 0 ? "x".repeat(workstation.maxProjectFileCharacters) : channel.name
      }))
    });
    failures.push("project-import-safety:oversized-serialization should be rejected");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    check(message.includes("character safety limit"), "project-import-safety:oversized-serialization should explain the rejected boundary");
    rejected.push("oversized-serialization");
  }

  return {
    bpm: parsed.bpm,
    key: parsed.key,
    swing: parsed.swing,
    masterCeilingDb: parsed.masterCeilingDb,
    mixerRange: `${parsed.mixer[1]?.volumeDb}..${parsed.mixer[0]?.volumeDb}`,
    rejected: rejected.length
  };
}

function validateProjectPitchSafety() {
  const sourceProject = structuredClone(workstation.starterProject);
  sourceProject.title = "Recovered Pitch Safety Beat";
  sourceProject.patterns.A.bassNotes[0].pitch = "C-999999";
  sourceProject.patterns.A.melodyNotes[0].pitch = "C999999";
  sourceProject.patterns.B.bassNotes[0].pitch = "Bb2";
  sourceProject.patterns.B.melodyNotes[0].pitch = "F#4";
  sourceProject.patterns.C.melodyNotes[0].pitch = `C${"0".repeat(4096)}4`;
  const snapshot = workstation.createProjectSnapshot(workstation.starterProject, "2026-07-16T00:00:00.000Z");
  snapshot.project.patterns.A.bassNotes[0].pitch = "D-999999";
  snapshot.project.patterns.A.melodyNotes[0].pitch = "F#999999";
  sourceProject.snapshots = [snapshot];

  const wrapped = JSON.stringify({
    app: "GrooveForge",
    fileVersion: workstation.projectFileVersion,
    savedAt: "2026-07-16T00:00:00.000Z",
    project: sourceProject
  });
  const parsed = workstation.parseProjectFile(wrapped);
  const bareParsed = workstation.parseProjectFile(JSON.stringify(sourceProject));
  const serializedFile = safeJsonParse(workstation.serializeProjectFile(sourceProject), "project-pitch-safety");
  const legacyFile = legacySinglePatternProjectFile();
  legacyFile.project.bassNotes[0].pitch = "C-999999";
  legacyFile.project.melodyNotes[0].pitch = "C999999";
  const legacyParsed = workstation.parseProjectFile(JSON.stringify(legacyFile));
  const repairedMidi = midi.createMidiFile(parsed);
  const bypassMidi = midi.createMidiFile(sourceProject);

  check(parsed.patterns.A.bassNotes[0]?.pitch === "C-1", "project-pitch-safety: imported pitch below MIDI zero should clamp to C-1");
  check(parsed.patterns.A.melodyNotes[0]?.pitch === "G9", "project-pitch-safety: imported pitch above MIDI 127 should clamp to G9");
  check(parsed.patterns.B.bassNotes[0]?.pitch === "Bb2", "project-pitch-safety: valid flat spelling should remain byte-identical");
  check(parsed.patterns.B.melodyNotes[0]?.pitch === "F#4", "project-pitch-safety: valid sharp spelling should remain byte-identical");
  check(parsed.patterns.C.melodyNotes[0]?.pitch === "C4", "project-pitch-safety: safe leading-zero octave text should canonicalize before reaching UI or disk");
  check(parsed.snapshots[0]?.project.patterns.A.bassNotes[0]?.pitch === "C-1", "project-pitch-safety: snapshot low pitch should use the same boundary");
  check(parsed.snapshots[0]?.project.patterns.A.melodyNotes[0]?.pitch === "G9", "project-pitch-safety: snapshot high pitch should use the same boundary");
  check(legacyParsed.patterns.A.bassNotes[0]?.pitch === "C-1", "project-pitch-safety: legacy low pitch should use the same boundary");
  check(legacyParsed.patterns.A.melodyNotes[0]?.pitch === "G9", "project-pitch-safety: legacy high pitch should use the same boundary");
  check(stableJson(bareParsed) === stableJson(parsed), "project-pitch-safety: wrapped and bare pitch repair should match");
  check(serializedFile?.project?.patterns?.A?.bassNotes?.[0]?.pitch === "C-1", "project-pitch-safety: serialization should repair low pitch before writing");
  check(serializedFile?.project?.patterns?.A?.melodyNotes?.[0]?.pitch === "G9", "project-pitch-safety: serialization should repair high pitch before writing");
  check(sourceProject.patterns.A.bassNotes[0].pitch === "C-999999", "project-pitch-safety: parsing and serialization should not mutate source pitch data");
  check(workstation.projectPitchMidiNumber("C-1") === workstation.minProjectMidiNote, "project-pitch-safety: C-1 should map to MIDI zero");
  check(workstation.projectPitchMidiNumber("G9") === workstation.maxProjectMidiNote, "project-pitch-safety: G9 should map to MIDI 127");
  check(Number.isFinite(workstation.noteToFrequency("C-999999")), "project-pitch-safety: low bypass pitch frequency should stay finite");
  check(Number.isFinite(workstation.noteToFrequency("C999999")), "project-pitch-safety: high bypass pitch frequency should stay finite");
  check(workstation.noteToFrequency("malformed") === 440, "project-pitch-safety: malformed bypass pitch should use finite A4 fallback");
  check(ascii(repairedMidi, 0, 4) === "MThd", "project-pitch-safety: repaired project should produce a Standard MIDI file");
  check(ascii(bypassMidi, 0, 4) === "MThd", "project-pitch-safety: MIDI export should normalize extreme bypass pitches through the domain boundary");

  const malformedProject = structuredClone(workstation.starterProject);
  malformedProject.patterns.A.bassNotes[0].pitch = "not-a-note";
  for (const [label, operation] of [
    ["parse", () => workstation.parseProjectFile(JSON.stringify(malformedProject))],
    ["serialize", () => workstation.serializeProjectFile(malformedProject)]
  ]) {
    try {
      operation();
      failures.push(`project-pitch-safety: malformed pitch ${label} should be rejected`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      check(message.includes("Invalid GrooveForge project"), `project-pitch-safety: malformed pitch ${label} should report an invalid project`);
    }
  }

  return {
    range: `${parsed.patterns.A.bassNotes[0]?.pitch}..${parsed.patterns.A.melodyNotes[0]?.pitch}`,
    frequencies: `${workstation.noteToFrequency("C-999999").toFixed(2)}..${workstation.noteToFrequency("C999999").toFixed(2)}`,
    paths: 5,
    rejected: 2,
    midiBytes: repairedMidi.byteLength
  };
}

function validateTimelineBoundarySafety() {
  const sourceProject = structuredClone(workstation.starterProject);
  sourceProject.title = "Recovered Timeline Safety Beat";
  const sourceBlock = sourceProject.arrangement[0];
  sourceProject.arrangement = Array.from({ length: 100 }, (_, index) => ({
    ...sourceBlock,
    section: index % 2 === 0 ? "Verse" : "Hook",
    pattern: workstation.patternSlots[index % workstation.patternSlots.length],
    bars: workstation.maxArrangementBars,
    mutedTracks: [...sourceBlock.mutedTracks]
  }));
  sourceProject.patterns.A.bassNotes[0] = { ...sourceProject.patterns.A.bassNotes[0], step: 15, length: 16 };
  sourceProject.patterns.A.melodyNotes[0] = { ...sourceProject.patterns.A.melodyNotes[0], step: 14, length: 16 };
  sourceProject.patterns.A.chordEvents[0] = { ...sourceProject.patterns.A.chordEvents[0], step: 15, length: 16 };
  const snapshot = workstation.createProjectSnapshot(workstation.starterProject, "2026-07-16T00:00:00.000Z");
  snapshot.project.arrangement = structuredClone(sourceProject.arrangement);
  snapshot.project.patterns.A.bassNotes[0] = { ...snapshot.project.patterns.A.bassNotes[0], step: 15, length: 16 };
  sourceProject.snapshots = [snapshot];

  const wrapped = JSON.stringify({
    app: "GrooveForge",
    fileVersion: workstation.projectFileVersion,
    savedAt: "2026-07-16T00:00:00.000Z",
    project: sourceProject
  });
  const parsed = workstation.parseProjectFile(wrapped);
  const bareParsed = workstation.parseProjectFile(JSON.stringify(sourceProject));
  const serializedFile = safeJsonParse(workstation.serializeProjectFile(sourceProject), "timeline-boundary-safety");
  const legacyFile = legacySinglePatternProjectFile();
  legacyFile.project.arrangement = structuredClone(sourceProject.arrangement);
  legacyFile.project.bassNotes[0] = { ...legacyFile.project.bassNotes[0], step: 15, length: 16 };
  legacyFile.project.melodyNotes[0] = { ...legacyFile.project.melodyNotes[0], step: 14, length: 16 };
  legacyFile.project.chordEvents[0] = { ...legacyFile.project.chordEvents[0], step: 15, length: 16 };
  const legacyParsed = workstation.parseProjectFile(JSON.stringify(legacyFile));
  const directMidi = midi.createMidiFile(sourceProject);

  check(workstation.arrangementTotalBars(sourceProject) === workstation.maxProjectArrangementBars, "timeline-boundary-safety: direct total bars should cap at the project maximum");
  check(workstation.arrangementTotalSteps(sourceProject) === workstation.maxProjectArrangementBars * workstation.stepsPerBar, "timeline-boundary-safety: direct total steps should cap with total bars");
  check(workstation.arrangementTotalBars(parsed) === workstation.maxProjectArrangementBars, "timeline-boundary-safety: imported arrangement should cap at 64 bars");
  check(parsed.arrangement.length === workstation.maxProjectArrangementBars / workstation.maxArrangementBars, "timeline-boundary-safety: full 16-bar blocks should stop at the total boundary");
  check(parsed.arrangement.at(-1)?.section === "Hook", "timeline-boundary-safety: imported blocks should preserve source order through the boundary");
  check(parsed.patterns.A.bassNotes[0]?.length === 1, "timeline-boundary-safety: bass event should end inside step 16");
  check(parsed.patterns.A.melodyNotes[0]?.length === 2, "timeline-boundary-safety: melody event should end inside step 16");
  check(parsed.patterns.A.chordEvents[0]?.length === 1, "timeline-boundary-safety: chord event should end inside step 16");
  check(parsed.snapshots[0]?.project.arrangement.length === 4, "timeline-boundary-safety: snapshot arrangement should use the same total boundary");
  check(parsed.snapshots[0]?.project.patterns.A.bassNotes[0]?.length === 1, "timeline-boundary-safety: snapshot event should use the same end boundary");
  check(legacyParsed.arrangement.length === 4, "timeline-boundary-safety: legacy arrangement should use the same total boundary");
  check(legacyParsed.patterns.A.bassNotes[0]?.length === 1, "timeline-boundary-safety: legacy bass event should use the same end boundary");
  check(legacyParsed.patterns.A.melodyNotes[0]?.length === 2, "timeline-boundary-safety: legacy melody event should use the same end boundary");
  check(legacyParsed.patterns.A.chordEvents[0]?.length === 1, "timeline-boundary-safety: legacy chord event should use the same end boundary");
  check(stableJson(bareParsed) === stableJson(parsed), "timeline-boundary-safety: wrapped and bare repair should match");
  check(serializedFile?.project?.arrangement?.length === 4, "timeline-boundary-safety: serialization should persist only the bounded arrangement");
  check(serializedFile?.project?.patterns?.A?.bassNotes?.[0]?.length === 1, "timeline-boundary-safety: serialization should persist bounded event length");
  check(sourceProject.arrangement.length === 100, "timeline-boundary-safety: parsing and serialization should not mutate the caller arrangement");
  check(sourceProject.patterns.A.bassNotes[0].length === 16, "timeline-boundary-safety: parsing and serialization should not mutate caller event length");
  check(workstation.normalizePatternEventLength(16, 15) === 1, "timeline-boundary-safety: parser-bypass event duration should clamp to the remaining step");
  check(stableJson(workstation.normalizeArrangementPlaybackRange(16, 63)) === stableJson({ bars: 1, startBar: 63 }), "timeline-boundary-safety: realtime range should fit inside the remaining project bar");
  check(stableJson(workstation.normalizeArrangementPlaybackRange(Number.NaN, Number.POSITIVE_INFINITY)) === stableJson({ bars: 1, startBar: 0 }), "timeline-boundary-safety: non-finite realtime range should recover safely");
  check(ascii(directMidi, 0, 4) === "MThd", "timeline-boundary-safety: direct MIDI export should survive oversized bypass state");

  const partialBoundary = workstation.normalizeProjectArrangement([
    { ...sourceBlock, bars: 16 },
    { ...sourceBlock, bars: 16 },
    { ...sourceBlock, bars: 16 },
    { ...sourceBlock, bars: 15 },
    { ...sourceBlock, bars: 16 }
  ]);
  check(partialBoundary.length === 5 && partialBoundary.at(-1)?.bars === 1, "timeline-boundary-safety: boundary block should trim to the remaining bar without reordering");

  return {
    sourceBars: 100 * workstation.maxArrangementBars,
    repairedBars: workstation.arrangementTotalBars(parsed),
    blocks: parsed.arrangement.length,
    eventLengths: `${parsed.patterns.A.bassNotes[0]?.length}/${parsed.patterns.A.melodyNotes[0]?.length}/${parsed.patterns.A.chordEvents[0]?.length}`,
    paths: 5,
    midiBytes: directMidi.byteLength
  };
}

async function validateEventDensitySafety() {
  const sourceProject = structuredClone(workstation.starterProject);
  sourceProject.title = "Recovered Event Density Safety Beat";
  const bassSeed = sourceProject.patterns.A.bassNotes[0];
  const melodySeed = sourceProject.patterns.A.melodyNotes[0];
  const chordSeed = sourceProject.patterns.A.chordEvents[0];
  const duplicateCount = 512;
  sourceProject.patterns.A.bassNotes = Array.from({ length: duplicateCount }, () => ({ ...bassSeed }));
  sourceProject.patterns.A.melodyNotes = Array.from({ length: duplicateCount }, () => ({ ...melodySeed }));
  sourceProject.patterns.A.chordEvents = Array.from({ length: duplicateCount }, () => ({ ...chordSeed }));
  sourceProject.automation = Array.from({ length: 64 }, (_, index) => ({
    target: "master_volume",
    startStep: index * 2,
    endStep: index * 2 + 1,
    startValue: index / 64,
    endValue: 1,
    curve: "linear"
  }));
  const snapshot = workstation.createProjectSnapshot(structuredClone(sourceProject), "2026-07-16T00:00:00.000Z");
  sourceProject.snapshots = [snapshot];

  const wrapped = JSON.stringify({
    app: "GrooveForge",
    fileVersion: workstation.projectFileVersion,
    savedAt: "2026-07-16T00:00:00.000Z",
    project: sourceProject
  });
  check(wrapped.length < workstation.maxProjectFileCharacters, "event-density-safety: dense fixture should stay below the project-file ceiling");
  const parsed = workstation.parseProjectFile(wrapped);
  const bareParsed = workstation.parseProjectFile(JSON.stringify(sourceProject));
  const serializedFile = safeJsonParse(workstation.serializeProjectFile(sourceProject), "event-density-safety");
  const legacyFile = legacySinglePatternProjectFile();
  legacyFile.project.bassNotes = Array.from({ length: duplicateCount }, () => ({ ...bassSeed }));
  legacyFile.project.melodyNotes = Array.from({ length: duplicateCount }, () => ({ ...melodySeed }));
  legacyFile.project.chordEvents = Array.from({ length: duplicateCount }, () => ({ ...chordSeed }));
  legacyFile.project.automation = structuredClone(sourceProject.automation);
  const legacyParsed = workstation.parseProjectFile(JSON.stringify(legacyFile));

  const pitchNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const pitchForMidi = (midiNote) => `${pitchNames[midiNote % 12]}${Math.floor(midiNote / 12) - 1}`;
  const capacityProject = structuredClone(workstation.starterProject);
  capacityProject.patterns.C.bassNotes = Array.from({ length: workstation.maxPatternNoteEvents + 32 }, (_, index) => ({
    ...bassSeed,
    step: Math.floor(index / 128),
    pitch: pitchForMidi(index % 128)
  }));
  const capacityParsed = workstation.parseProjectFile(JSON.stringify(capacityProject));

  check(parsed.patterns.A.bassNotes.length === 1, "event-density-safety: duplicate bass locations should keep the first event only");
  check(parsed.patterns.A.melodyNotes.length === 1, "event-density-safety: duplicate melody locations should keep the first event only");
  check(parsed.patterns.A.chordEvents.length === 1, "event-density-safety: duplicate chord steps should keep the first event only");
  check(parsed.automation.length === workstation.maxProjectAutomationEvents, "event-density-safety: imported automation should stop at the project event limit");
  check(parsed.snapshots[0]?.project.patterns.A.bassNotes.length === 1, "event-density-safety: snapshot notes should use the same duplicate repair");
  check(parsed.snapshots[0]?.project.automation.length === workstation.maxProjectAutomationEvents, "event-density-safety: snapshot automation should use the same event limit");
  check(legacyParsed.patterns.A.bassNotes.length === 1, "event-density-safety: legacy notes should use the same duplicate repair");
  check(legacyParsed.patterns.A.chordEvents.length === 1, "event-density-safety: legacy chords should use the same step repair");
  check(legacyParsed.automation.length === workstation.maxProjectAutomationEvents, "event-density-safety: legacy automation should use the same event limit");
  check(capacityParsed.patterns.C.bassNotes.length === workstation.maxPatternNoteEvents, "event-density-safety: distinct imported notes should stop at the note-track capacity");
  check(stableJson(bareParsed) === stableJson(parsed), "event-density-safety: wrapped and bare repair should match");
  check(serializedFile?.project?.patterns?.A?.bassNotes?.length === 1, "event-density-safety: serialization should persist deduplicated notes");
  check(serializedFile?.project?.automation?.length === workstation.maxProjectAutomationEvents, "event-density-safety: serialization should persist bounded automation");
  check(sourceProject.patterns.A.bassNotes.length === duplicateCount, "event-density-safety: parse and serialization should not mutate caller notes");
  check(sourceProject.automation.length === 64, "event-density-safety: parse and serialization should not mutate caller automation");

  const directPattern = workstation.normalizePatternEventCollections(sourceProject.patterns.A);
  const directAutomation = workstation.normalizeProjectAutomationEvents(sourceProject.automation);
  check(directPattern.bassNotes.length === 1 && directPattern.melodyNotes.length === 1 && directPattern.chordEvents.length === 1, "event-density-safety: direct runtime pattern normalization should deduplicate every pitched collection");
  check(directAutomation.length === workstation.maxProjectAutomationEvents, "event-density-safety: direct automation normalization should enforce the same limit");
  const directMidi = midi.createMidiFile(sourceProject);
  check(ascii(directMidi, 0, 4) === "MThd", "event-density-safety: direct MIDI should survive parser-bypass event density");
  check(directMidi.byteLength < 100_000, "event-density-safety: direct MIDI should not expand duplicate pattern events without bound");
  const directWav = await blobBytes(render.createMixWavBlob(sourceProject));
  checkWavBytes(directWav, "event-density-safety:direct-render");

  const chords = [];
  for (let index = 0; index < workstation.stepsPerBar + 8; index += 1) {
    const chord = workstation.createNextChordEvent(sourceProject.key, chords);
    if (chord) chords.push(chord);
  }
  check(chords.length === workstation.maxPatternChordEvents, "event-density-safety: chord creation should stop after all 16 steps are occupied");
  check(new Set(chords.map((chord) => chord.step)).size === workstation.maxPatternChordEvents, "event-density-safety: chord creation should use each pattern step at most once");
  check(workstation.createNextChordEvent(sourceProject.key, chords) === null, "event-density-safety: a full chord grid should return no new event");

  return {
    sourceEvents: `${duplicateCount}/${duplicateCount}/${duplicateCount}/${sourceProject.automation.length}`,
    repairedEvents: `${parsed.patterns.A.bassNotes.length}/${parsed.patterns.A.melodyNotes.length}/${parsed.patterns.A.chordEvents.length}/${parsed.automation.length}`,
    noteCapacity: capacityParsed.patterns.C.bassNotes.length,
    chordSteps: chords.length,
    paths: 6,
    midiBytes: directMidi.byteLength,
    wavBytes: directWav.byteLength
  };
}

async function validateMixerTopologySafety() {
  const requiredIds = [...workstation.requiredMixerChannelIds];
  const sourceProject = structuredClone(workstation.starterProject);
  sourceProject.title = "Recovered Mixer Topology Safety Beat";
  sourceProject.mixer = [];
  const snapshot = workstation.createProjectSnapshot(workstation.starterProject, "2026-07-16T00:00:00.000Z");
  snapshot.project.mixer = [];
  sourceProject.snapshots = [snapshot];

  const wrapped = JSON.stringify({
    app: "GrooveForge",
    fileVersion: workstation.projectFileVersion,
    savedAt: "2026-07-16T00:00:00.000Z",
    project: sourceProject
  });
  const parsed = workstation.parseProjectFile(wrapped);
  const bareParsed = workstation.parseProjectFile(JSON.stringify(sourceProject));
  const serializedFile = safeJsonParse(workstation.serializeProjectFile(sourceProject), "mixer-topology-safety");
  const legacyFile = legacySinglePatternProjectFile();
  legacyFile.project.mixer = [];
  const legacyParsed = workstation.parseProjectFile(JSON.stringify(legacyFile));

  const fxReturn = {
    ...workstation.starterProject.mixer.at(-1),
    id: "fx_return",
    name: "FX Return",
    volumeDb: -6,
    solo: true
  };
  const duplicateSeeds = [
    ...workstation.starterProject.mixer.slice(0, -1),
    fxReturn,
    workstation.starterProject.mixer.at(-1)
  ];
  const duplicateCount = 1_000;
  const duplicateSource = Array.from({ length: duplicateCount }, (_, index) => ({
    ...duplicateSeeds[index % duplicateSeeds.length],
    name: `Mixer channel ${index}`
  }));
  const duplicateProject = { ...structuredClone(workstation.starterProject), mixer: duplicateSource };
  const duplicateParsed = workstation.parseProjectFile(JSON.stringify(duplicateProject));
  const directEmpty = workstation.normalizeMixerChannelTopology([]);
  const directDuplicate = workstation.normalizeMixerChannelTopology(duplicateSource);
  const partialSource = [
    { ...workstation.starterProject.mixer.find(({ id }) => id === "synth"), name: "Authored Synth", volumeDb: -12.3 },
    { ...workstation.starterProject.mixer.find(({ id }) => id === "master"), name: "Authored Master", volumeDb: -2.4 }
  ];
  const directPartial = workstation.normalizeMixerChannelTopology(partialSource);
  const canonicalMixer = workstation.starterProject.mixer;
  const optionalFxProject = { ...structuredClone(workstation.starterProject), mixer: duplicateSeeds };
  const optionalFxAnalysis = render.analyzeExport(optionalFxProject);
  const directAnalysis = render.analyzeExport(sourceProject);
  const directWav = await blobBytes(render.createMixWavBlob(sourceProject));

  check(stableJson(parsed.mixer.map(({ id }) => id)) === stableJson(requiredIds), "mixer-topology-safety: empty imported mixer should restore every required channel in canonical order");
  check(stableJson(bareParsed.mixer) === stableJson(parsed.mixer), "mixer-topology-safety: wrapped and bare empty-mixer repair should match");
  check(stableJson(serializedFile?.project?.mixer?.map(({ id }) => id)) === stableJson(requiredIds), "mixer-topology-safety: serialization should persist the required mixer topology");
  check(stableJson(parsed.snapshots[0]?.project.mixer.map(({ id }) => id)) === stableJson(requiredIds), "mixer-topology-safety: snapshot mixer should use the same required topology");
  check(stableJson(legacyParsed.mixer.map(({ id }) => id)) === stableJson(requiredIds), "mixer-topology-safety: legacy mixer should use the same required topology");
  check(stableJson(directEmpty.map(({ id }) => id)) === stableJson(requiredIds), "mixer-topology-safety: direct parser-bypass mixer should restore every required channel");
  check(duplicateParsed.mixer.length === workstation.maxProjectMixerChannels, "mixer-topology-safety: imported duplicate and inert FX-return channels should stop at the required topology");
  check(directDuplicate.length === workstation.maxProjectMixerChannels, "mixer-topology-safety: direct duplicate channels should stop at the finite topology capacity");
  check(directDuplicate[0]?.name === "Mixer channel 0", "mixer-topology-safety: duplicate repair should preserve the first authored channel for an id");
  check(!directDuplicate.some(({ id }) => id === "fx_return") && directDuplicate.at(-1)?.id === "master", "mixer-topology-safety: inert FX-return rows should not enter the current five-channel editor topology");
  check(optionalFxAnalysis.status !== "Silent", "mixer-topology-safety: FX-return-only Solo should not mute every audible source channel");
  check(stableJson(directPartial.map(({ id }) => id)) === stableJson(requiredIds), "mixer-topology-safety: partial mixer should restore only missing required channels in canonical order");
  check(directPartial.find(({ id }) => id === "synth")?.name === "Authored Synth" && directPartial.find(({ id }) => id === "synth")?.volumeDb === -12.3, "mixer-topology-safety: partial repair should preserve authored Synth settings");
  check(directPartial.find(({ id }) => id === "master")?.name === "Authored Master" && directPartial.find(({ id }) => id === "master")?.volumeDb === -2.4, "mixer-topology-safety: partial repair should preserve authored Master settings");
  check(partialSource.length === 2, "mixer-topology-safety: partial repair should not mutate the caller collection");
  check(workstation.normalizeMixerChannelTopology(canonicalMixer) === canonicalMixer, "mixer-topology-safety: canonical mixer normalization should preserve array identity for realtime reuse");
  check(sourceProject.mixer.length === 0, "mixer-topology-safety: parse, serialization, and direct render should not mutate the caller mixer");
  check(duplicateSource.length === duplicateCount, "mixer-topology-safety: duplicate repair should not mutate the caller mixer collection");
  check(directAnalysis.status !== "Silent", "mixer-topology-safety: direct empty-mixer render should recover to playable output");
  check(Number.isFinite(directAnalysis.peakDb) && Number.isFinite(directAnalysis.rmsDb), "mixer-topology-safety: repaired direct render should have finite peak and RMS");
  checkWavBytes(directWav, "mixer-topology-safety:direct-render");
  check(directWav.slice(44).some((byte) => byte !== 0), "mixer-topology-safety: repaired direct WAV should contain non-zero PCM bytes");

  return {
    sourceChannels: sourceProject.mixer.length,
    repairedChannels: parsed.mixer.length,
    duplicateChannels: `${duplicateCount}->${duplicateParsed.mixer.length}`,
    optionalFxStatus: optionalFxAnalysis.status,
    paths: 7,
    status: directAnalysis.status,
    peakDb: directAnalysis.peakDb,
    wavBytes: directWav.byteLength
  };
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
  check(sheetFileName.includes(workstation.projectFileStem(project)), `${label} Handoff Sheet file name should use the project file stem`);
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
  const {
    label,
    expectedArrangementBlocks = 8,
    expectedArrangementTemplate = null,
    expectedBars = 8,
    expectedBpm = null,
    expectedDeliveryTarget = null,
    expectedGeneratedStylePatterns = false,
    expectedKey = null,
    expectedMasterPreset = null,
    expectedMode = null,
    expectedSelectedPattern = null,
    expectedStyleId,
    expectedTitle = null
  } = smokeCase;
  const project = validateProjectFileRoundTrip(smokeCase.project, label);
  const bars = workstation.arrangementTotalBars(project);
  const musicalDuration = bars * workstation.stepsPerBar * workstation.projectStepDurationSeconds(project);
  const expectedTailDuration = render.exportTailDurationSeconds(project);
  const expectedDuration = musicalDuration + expectedTailDuration;

  check(project.styleId === expectedStyleId, `${label} should use ${expectedStyleId}, got ${project.styleId}`);
  if (expectedTitle) {
    check(project.title === expectedTitle, `${label} should use title ${expectedTitle}, got ${project.title}`);
  }
  if (expectedMode) {
    check(project.mode === expectedMode, `${label} should use ${expectedMode} mode, got ${project.mode}`);
  }
  if (expectedBpm) {
    check(project.bpm === expectedBpm, `${label} should use ${expectedBpm} BPM, got ${project.bpm}`);
  }
  if (expectedKey) {
    check(project.key === expectedKey, `${label} should use ${expectedKey}, got ${project.key}`);
  }
  if (expectedDeliveryTarget) {
    check(project.deliveryTarget === expectedDeliveryTarget, `${label} should target ${expectedDeliveryTarget}, got ${project.deliveryTarget}`);
  }
  if (expectedMasterPreset) {
    check(project.masterPreset === expectedMasterPreset, `${label} should use ${expectedMasterPreset}, got ${project.masterPreset}`);
  }
  if (expectedGeneratedStylePatterns) {
    check(
      stableJson(project.patterns) === stableJson(workstation.createStylePatternSet(project.styleId, project.key)),
      `${label} Pattern A/B/C should match the selected ${project.styleId} / ${project.key} style rules`
    );
    check(
      project.sound.preset === workstation.styleSoundPreset(project.styleId),
      `${label} sound preset should match the selected ${project.styleId} style`
    );
  }
  if (expectedSelectedPattern) {
    check(project.selectedPattern === expectedSelectedPattern, `${label} should use Pattern ${expectedSelectedPattern}, got ${project.selectedPattern}`);
  }
  check(bars === expectedBars, `${label} should be ${expectedBars} bars, got ${bars}`);
  check(project.arrangement.length === expectedArrangementBlocks, `${label} should have ${expectedArrangementBlocks} arrangement blocks, got ${project.arrangement.length}`);
  if (expectedArrangementTemplate) {
    check(
      stableJson(project.arrangement) === stableJson(workstation.createArrangementTemplate(expectedArrangementTemplate)),
      `${label} arrangement should match the ${expectedArrangementTemplate} template`
    );
  }
  if (expectedMasterPreset) {
    check(
      project.masterCeilingDb === workstation.masterPresetCeilingDb(expectedMasterPreset),
      `${label} master ceiling should match ${expectedMasterPreset}`
    );
  }
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
  check(expectedTailDuration >= 0.75, `${label} full mix export tail is shorter than the safety floor`);
  check(Math.abs(mixAnalysis.durationSeconds - expectedDuration) < 0.05, `${label} full mix duration does not match musical duration plus export tail`);
  check(Number.isFinite(mixAnalysis.peakDb), `${label} full mix peak should be finite`);
  check(Number.isFinite(mixAnalysis.rmsDb), `${label} full mix RMS should be finite`);

  const mixFileName = render.mixWavFileName(project);
  check(mixFileName.endsWith(".wav"), `${label} full mix file name should end in .wav`);
  check(mixFileName.includes(workstation.projectFileStem(project)), `${label} full mix file name should use the project file stem`);
  checkWavBytes(await blobBytes(render.createMixWavBlob(project)), `${label} full mix`);

  const stemAnalyses = render.analyzeStemExports(project);
  const stemNames = render.stemWavFileNames(project);
  check(stemNames.length === render.stemTrackIds.length, `${label} stem file count should match stem track count`);
  for (const [index, track] of render.stemTrackIds.entries()) {
    const analysis = stemAnalyses[track];
    check(stemNames[index]?.endsWith("-stem.wav"), `${label} ${track} stem file name should end in -stem.wav`);
    check(analysis.status !== "Silent", `${label} ${track} stem analysis should not be silent`);
    check(Math.abs(analysis.durationSeconds - expectedDuration) < 0.05, `${label} ${track} stem duration does not match musical duration plus export tail`);
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
const starterCase = {
  kind: "starter",
  label: "starter:first-run",
  project: workstation.starterProject,
  expectedArrangementBlocks: 4,
  expectedArrangementTemplate: "loop",
  expectedBars: 8,
  expectedBpm: 82,
  expectedDeliveryTarget: "starter_sketch",
  expectedGeneratedStylePatterns: true,
  expectedKey: "A minor",
  expectedMasterPreset: "Clean Demo",
  expectedMode: "guided",
  expectedSelectedPattern: "A",
  expectedStyleId: "lofi",
  expectedTitle: "Untitled Beat"
};
const styleCases = workstation.styleProfiles.map((profile) => ({
  kind: "style",
  label: `style:${profile.id}`,
  project: styleSmokeProject(profile),
  expectedStyleId: profile.id
}));
const smokeCases = [starterCase, ...blueprintCases, ...styleCases];
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
const downloadSmokeProject = workstation.parseProjectFile(workstation.serializeProjectFile(starterCase.project));
const downloadSmokeSummary = validateDownloadPathSmoke(downloadSmokeProject);
const unicodeFileIdentitySummary = validateUnicodeFileIdentity();
const projectTitleIntegritySummary = validateProjectTitleIntegrity();
const projectImportSafetySummary = validateProjectImportSafety();
const projectPitchSafetySummary = validateProjectPitchSafety();
const timelineBoundarySafetySummary = validateTimelineBoundarySafety();
const eventDensitySafetySummary = await validateEventDensitySafety();
const mixerTopologySafetySummary = await validateMixerTopologySafety();

if (failures.length > 0) {
  console.error("GrooveForge runtime smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("GrooveForge runtime smoke passed.");
console.log(`- Scope: ${smokeScope}`);
console.log(`- Starter project: 1/1 first-run Guided ${starterCase.expectedBpm} BPM ${starterCase.expectedKey} ${starterCase.expectedStyleId} state`);
console.log(`- Blueprints: ${blueprintCases.length}/${workstation.beatBlueprints.length} sample-free 8-bar starts`);
console.log(`- Styles: ${styleCases.length}/${workstation.styleProfiles.length} supported style profiles`);
console.log(`- Legacy migrations: ${legacyMigrationProject ? 1 : 0}/1 single-pattern chord-event project preserved`);
console.log(`- Project roundtrips: ${summaries.length}/${smokeCases.length} .grooveforge.json save/load checks before export`);
console.log(`- Handoff sheets: ${summaries.length}/${smokeCases.length} text deliverables verified`);
console.log(`- Download path: ${downloadSmokeSummary.clicked}/${downloadSmokeSummary.expected} mocked Blob URL downloads verified (${downloadSmokeSummary.fileNames.join(", ")})`);
console.log(`- Unicode file identity: ${unicodeFileIdentitySummary.cases} distinct titles x ${unicodeFileIdentitySummary.deliverablesPerCase} deliverables, bounded stem ${unicodeFileIdentitySummary.boundedBytes}/120 UTF-8 bytes`);
console.log(`- Project title integrity: ${projectTitleIntegritySummary.normalizedTitle}, ${projectTitleIntegritySummary.fileStem}, ${projectTitleIntegritySummary.maxCodePoints} code-point bound`);
console.log(`- Project import safety: ${projectImportSafetySummary.bpm} BPM / ${projectImportSafetySummary.key} / swing ${projectImportSafetySummary.swing} / ceiling ${projectImportSafetySummary.masterCeilingDb} dB / mixer ${projectImportSafetySummary.mixerRange} dB / rejected boundaries ${projectImportSafetySummary.rejected}/4`);
console.log(`- Project pitch safety: ${projectPitchSafetySummary.range} / ${projectPitchSafetySummary.frequencies} Hz / normalized paths ${projectPitchSafetySummary.paths}/5 / malformed rejections ${projectPitchSafetySummary.rejected}/2 / MIDI ${projectPitchSafetySummary.midiBytes} bytes`);
console.log(`- Timeline boundary safety: ${timelineBoundarySafetySummary.sourceBars}->${timelineBoundarySafetySummary.repairedBars} bars / ${timelineBoundarySafetySummary.blocks} blocks / event lengths ${timelineBoundarySafetySummary.eventLengths} / normalized paths ${timelineBoundarySafetySummary.paths}/5 / MIDI ${timelineBoundarySafetySummary.midiBytes} bytes`);
console.log(`- Event density safety: ${eventDensitySafetySummary.sourceEvents}->${eventDensitySafetySummary.repairedEvents} bass/melody/chord/automation / note capacity ${eventDensitySafetySummary.noteCapacity} / chord steps ${eventDensitySafetySummary.chordSteps} / normalized paths ${eventDensitySafetySummary.paths}/6 / MIDI ${eventDensitySafetySummary.midiBytes} bytes / WAV ${eventDensitySafetySummary.wavBytes} bytes`);
console.log(`- Mixer topology safety: ${mixerTopologySafetySummary.sourceChannels}->${mixerTopologySafetySummary.repairedChannels} required channels / duplicates ${mixerTopologySafetySummary.duplicateChannels} / normalized paths ${mixerTopologySafetySummary.paths}/7 / ${mixerTopologySafetySummary.status} ${mixerTopologySafetySummary.peakDb.toFixed(2)} dB / WAV ${mixerTopologySafetySummary.wavBytes} bytes`);
console.log(`- Style coverage: ${supportedStyleIds.join(", ")}`);
for (const summary of summaries) {
  console.log(`- ${summary.label}: ${summary.status}, ${summary.durationSeconds.toFixed(2)}s, ${summary.projectFileName} (${summary.projectFileBytes} bytes), ${summary.mixFileName}, ${summary.midiFileName} (${summary.midiBytes} bytes), ${summary.handoffSheetFileName} (${summary.handoffSheetBytes} bytes)`);
}
