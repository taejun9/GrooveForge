
# GrooveForge Product

## Summary

GrooveForge is a desktop-ready, web-first, event-based mini DAW for making beats across genres with drums, 808/bass, melody/chords, sound design, arrangement, mixing, mastering, and WAV/stem export.

## Type

`web-first TypeScript mini DAW / beat workstation`

## Product Definition

GrooveForge is a code-driven all-genre beat workstation: a mini DAW with a JSON-based project format, programmable style profiles, editable musical events, local synthesis, mixing/mastering controls, and offline export.

The primary object is a beat project built from musical events, patterns, tracks, devices, arrangement blocks, mixer state, master state, and render state. Audio samples can become assets inside that project later, but they are not the default starting point.

It is not a trap-only app and not a sample-chopping tool. Trap, drill, boom bap, house, lofi, jersey, phonk, R&B, garage, and experimental workflows should be expressed as style profiles and editable generation rules, not as hard-coded product identity.

## Product Boundary

Core product:

- Direct drum programming.
- 808/bass synthesis and bassline editing.
- Melody and chord composition.
- Sound design through built-in instruments and devices.
- Arrangement from editable patterns.
- Mixing, mastering, and export.

Secondary extension:

- Sampling, audio import, chopping, and sampler mapping.

Sampling can be useful, but it must stay behind the composition engine, instrument engine, arrangement, mixer/master, and export pipeline in priority, architecture, roadmap order, and UI copy.

## Users

- Developers and technically comfortable producers who want programmable beat construction.
- Beatmakers who want to make drums, 808/bass, melodies, and arrangements without starting from samples.
- Beginners who benefit from key/scale-aware composition, chord pads, and style presets.
- Producers preparing beats for export, beat-store demos, stem delivery, or later vocal recording.

## Core Features

The core product loop is:

```text
BPM/key -> drum pattern -> 808/bass line -> melody/chords -> arrangement -> mixer -> master -> export
```

Primary feature areas:

- Transport: BPM, key, play, stop, loop, metronome.
- Pattern editor: drum step sequencer, bass grid, chord progression, melody grid, variation A/B/C.
- Instrument panel: drum kit, synth 808, simple synth, chord synth, effects, and sound-design controls.
- Arrangement view: editable pattern blocks placed into intro, verse, hook, bridge, and outro structures, with duplicate, move, and delete controls.
- Mixer/master: volume, pan, mute, solo, master preset ceiling, EQ, compressor, saturation, sends, limiter, loudness/peak metering.
- Export: WAV export first, then stems after the render path is reliable.

## First-Class Data

The core model centers on editable musical events, not audio clips:

```ts
type MusicalEvent =
  | NoteEvent
  | DrumHitEvent
  | AutomationEvent;

type NoteEvent = {
  type: "note";
  trackId: string;
  time: number;
  duration: number;
  pitch: number;
  velocity: number;
  glide?: boolean;
  probability?: number;
  microTimingMs?: number;
};

type DrumHitEvent = {
  type: "drum_hit";
  trackId: string;
  time: number;
  lane: "kick" | "snare" | "clap" | "hat" | "open_hat" | "perc" | "rim" | "fx";
  velocity: number;
  repeat?: number;
  probability?: number;
  microTimingMs?: number;
};
```

Audio clip events belong to a later extension model. A project must be able to produce a complete beat with only drum, bass, synth, chord, automation, mixer, and master data.

## MVP Scope

The MVP must prove this sentence:

```text
샘플 없이도 8마디 비트를 만들고 WAV로 export할 수 있어야 한다.
```

This sentence supersedes any sampling-first interpretation of the brief.

MVP capabilities:

- BPM/key setup.
- Style selector that applies key-aware editable groove templates for Pattern A/B/C, BPM, swing, and sound preset.
- 16-step drum sequencer with built-in drum kit, drum-synth sources, editable drum velocity, and hat repeat dynamics.
- Synth 808/bass track with editable scale-aware grid, mono mode, glide, and saturation direction.
- Chord progression track with scale-locked roots, editable quality, length, and velocity.
- Simple synth melody track with editable scale-aware grid and velocity control.
- Sound design presets and Studio tone controls for kick punch, snare snap, hat brightness, 808 drive/decay, synth brightness/release, and chord warmth/width.
- Independent Pattern A/B/C storage with copy/clear tools for drum, bass, chord, and melody variations.
- Editable arrangement blocks for an 8-bar loop or simple song section, using assigned Pattern A/B/C data, per-block energy, and structure controls for duplicate, move, and delete.
- Undo/redo edit history for project-level pattern, arrangement, mixer, sound, and master changes.
- Mixer volume, pan, mute, and solo reflected in realtime playback and WAV export.
- Master preset ceiling and output gain.
- Export peak/RMS/headroom meter with limiter activity status for the current arrangement.
- Local project save/load as a `.grooveforge.json` file.
- WAV export through offline rendering.
- Stem export for isolated drum, 808, synth, and chord WAV files from the current arrangement.

## Roadmap

Phase 0 validates the audio scheduler: BPM clock, tick/bar/beat math, play/stop/loop, metronome, and simple kick playback.

Phase 1 builds the drum sequencer: 16/32-step grid, kick/snare/clap/hat lanes, velocity, swing, pattern save/load, and hat repeat.

Phase 2 builds 808/bass: monophonic synth, piano-roll style editor, glide, pitch envelope, saturation, and sidechain ducking prototype.

Phase 3 adds melody/chords: simple poly synth, scale lock, chord pad, melody grid, and preset patches.

Phase 4 adds arrangement: pattern blocks, song section markers, duplicate/move/delete first, then split/mute/reorder refinements, and variation A/B/C.

Phase 5 adds mixer/master/export: volume, pan, mute, solo, master preset ceiling first, then EQ, compressor, saturation, limiter, peak/LUFS metering, WAV export, and later stem export.

Phase 6 scopes optional sampling as an extension after the beat-making core is useful: audio import, sampler mapping, chopping, reverse, pitch, and stretch.

## Non-Goals

- Do not make sample chop/import the MVP center.
- Do not describe GrooveForge as a sampling app in product docs, UI copy, or agent plans.
- Do not use sample import, chopping, sampler tracks, or audio warping as a plan title or primary scope unless the work is explicitly in the optional sampling phase.
- Do not build plugin hosting before the local synth/mixer/export loop is working.
- Do not add AI audio generation before editable pattern generation exists.
- Do not add cloud collaboration, accounts, payments, trackers, or remote AI calls without explicit rationale.
- Do not claim mastering is an automatic fix for a bad mix. Mixing and mastering remain separate product stages.

## Product Constraints

- Web-first MVP should assume browser audio constraints: user gesture requirements, device variability, scheduling precision limits, and offline render validation.
- Imported samples, exported stems, and project files can contain copyrighted or private material. Do not commit real user audio fixtures.
- Loudness presets are targets and measurement aids, not guarantees that a beat is platform-approved.
- VST3/AU/plugin hosting belongs to a later native/pro roadmap after the web MVP proves the core workflow.
