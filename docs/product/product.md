
# GrooveForge Product

## Summary

GrooveForge is a web-first, event-based mini DAW for composing drums, 808/bass, melody/chords, arrangement, mixing, mastering, and WAV/stem export; sampling is an optional later module.

## Type

`web-first TypeScript mini DAW / beat workstation`

## Product Definition

GrooveForge is a code-driven beat workstation: a mini DAW with a JSON-based project format, programmable style profiles, editable musical events, local synthesis, mixing/mastering controls, and offline export.

It is not a trap-only app and not a sample-chopping tool. Trap, drill, boom bap, house, lofi, jersey, phonk, R&B, garage, and experimental workflows should be expressed as style profiles and editable generation rules, not as hard-coded product identity.

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
- Pattern editor: drum step sequencer, bass grid, melody grid, variation A/B/C.
- Instrument panel: drum kit, synth 808, simple synth, chord synth, optional sampler later.
- Arrangement view: pattern blocks placed into intro, verse, hook, bridge, and outro structures.
- Mixer/master: volume, pan, mute, solo, EQ, compressor, saturation, sends, limiter, loudness/peak metering.
- Export: WAV export first, then stems after the render path is reliable.

## First-Class Data

The internal model centers on editable musical events, not audio clips:

```ts
type MusicalEvent =
  | NoteEvent
  | DrumHitEvent
  | AutomationEvent
  | AudioClipEvent;

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

Audio clips are allowed, but optional. A project must be able to produce a complete beat with only drum, bass, synth, chord, automation, mixer, and master data.

## MVP Scope

The MVP must prove this sentence:

```text
샘플 없이도 8마디 비트를 만들고 WAV로 export할 수 있어야 한다.
```

MVP capabilities:

- BPM/key setup.
- 16-step drum sequencer with built-in one-shot kit sounds.
- Synth 808/bass track with mono mode, pitch envelope, glide, and saturation.
- Simple synth melody track with scale-aware grid.
- Pattern A/B/C storage.
- Arrangement blocks for an 8-bar loop or simple song section.
- Mixer volume and pan.
- Master limiter.
- WAV export through offline rendering.

## Roadmap

Phase 0 validates the audio scheduler: BPM clock, tick/bar/beat math, play/stop/loop, metronome, and simple kick playback.

Phase 1 builds the drum sequencer: 16/32-step grid, kick/snare/clap/hat lanes, velocity, swing, pattern save/load, and hat repeat.

Phase 2 builds 808/bass: monophonic synth, piano-roll style editor, glide, pitch envelope, saturation, and sidechain ducking prototype.

Phase 3 adds melody/chords: simple poly synth, scale lock, chord pad, melody grid, and preset patches.

Phase 4 adds arrangement: pattern blocks, song section markers, duplicate/split/mute, and variation A/B/C.

Phase 5 adds mixer/master/export: volume, pan, mute, solo, EQ, compressor, saturation, limiter, peak/LUFS metering, WAV export, and later stem export.

Phase 6 adds optional sampling: sample import, one-shot mapping, audio clips, chop pad, reverse, pitch, and stretch.

## Non-Goals

- Do not make sample chop/import the MVP center.
- Do not build plugin hosting before the local synth/mixer/export loop is working.
- Do not add AI audio generation before editable pattern generation exists.
- Do not add cloud collaboration, accounts, payments, trackers, or remote AI calls without explicit rationale.
- Do not claim mastering is an automatic fix for a bad mix. Mixing and mastering remain separate product stages.

## Product Constraints

- Web-first MVP should assume browser audio constraints: user gesture requirements, device variability, scheduling precision limits, and offline render validation.
- Imported samples, exported stems, and project files can contain copyrighted or private material. Do not commit real user audio fixtures.
- Loudness presets are targets and measurement aids, not guarantees that a beat is platform-approved.
- VST3/AU/plugin hosting belongs to a later native/pro roadmap after the web MVP proves the core workflow.
