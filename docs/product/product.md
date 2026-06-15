
# GrooveForge Product

## Summary

GrooveForge is a desktop-ready, web-first, event-based mini DAW for making beats across genres with drums, 808/bass, melody/chords, sound design, arrangement, mixing, mastering, Session Brief, Space send FX, MIDI export, and WAV/stem export. It is beat-first, not sampler-first. It starts from directly writing the beat rather than importing or chopping audio.

## Type

`web-first TypeScript mini DAW / beat workstation`

## Product Definition

Corrected concept: GrooveForge is a beat-production mini DAW for directly composing beats across genres, designing sounds, arranging sections, mixing/mastering, and exporting finished audio. In the user's terms, it is "직접 비트를 작곡하고 사운드를 설계하고 믹싱/마스터링까지 하는 비트 제작 미니 DAW." It can support sampling later, but sampling is not the project identity, first-run workflow, MVP proof, or core architecture.

GrooveForge is a code-driven all-genre beat workstation: a mini DAW with a JSON-based project format, programmable style profiles, editable musical events, local synthesis, mixing/mastering controls, and offline export. The center is making a beat directly, not finding a sample to start from.

The primary object is a beat project built from musical events, patterns, tracks, devices, arrangement blocks, mixer state, master state, and render state. Audio samples can become assets inside that project later, but they are not the default starting point.

The product should make a blank beat feel playable without imported audio: set BPM/key/style, write rhythm, compose 808/bass, melody, and chords, shape tone and FX, arrange sections, mix/master, and export. The product center is Pattern Programming, Drum Sequencing, 808/Bass Synthesis, Melody/Chord Composition, Sound Design, Arrangement, Mixing, Mastering, and Export.

It is not a trap-only app and not a sample-chopping tool. Trap, drill, boom bap, house, lofi, jersey, phonk, R&B, garage, and experimental workflows should be expressed as style profiles and editable generation rules, not as hard-coded product identity.

## Product Boundary

Core product:

- Pattern programming for all supported styles.
- Direct drum programming.
- 808/bass synthesis and bassline editing.
- Melody and chord composition.
- Sound design through built-in instruments and devices.
- Arrangement from editable patterns.
- Mixing, mastering, and export.

Optional sampling module, later and outside the MVP:

- Sampling, audio import, chopping, and sampler mapping.

Sampling can be useful, but it must stay behind the composition engine, instrument engine, arrangement, mixer/master, and export pipeline in priority, architecture, roadmap order, and UI copy. No user should need a sample to make the first complete beat. When sampling appears later, it should behave like an optional sound source or instrument layer inside the beat workstation, not as the default project spine.

Primary navigation and the first empty project should expose beat-making controls before sample workflows: transport, style/key/BPM, pattern editor, drum programming, 808/bass, melody/chords, sound design, arrangement, mixer/master, and export. Sampling entry points, when added, should be opt-in secondary paths rather than the default way to start.

Any future sampler UI should be framed as an additional instrument or sound-source lane after direct composition exists, not as the first screen, first task, or reason the project file exists.

## Users

- Developers and technically comfortable producers who want programmable beat construction.
- Beatmakers who want to make drums, 808/bass, melodies, and arrangements without starting from samples.
- Beginners who benefit from key/scale-aware composition, chord pads, and style presets.
- Producers preparing beats for export, beat-store demos, stem delivery, or later vocal recording.

## Core Features

The core product loop is:

```text
BPM/key/style -> pattern programming -> drum pattern -> 808/bass line -> melody/chords -> sound design -> arrangement -> mixer -> master -> export
```

Optional sampling path, later:

```text
audio sample import -> chop/slice -> pitch/stretch -> one-shot or sampler mapping
```

Primary feature areas:

- Transport: BPM, key, play, stop, Song/Block/Pattern loop audition, metronome.
- Beat blueprints: sample-free editable project starts that combine style, key, BPM, Pattern A/B/C events, arrangement template, sound preset, mixer balance, and master preset.
- Delivery Targets: local starter sketch, vocal session, beat-store demo, club demo, and editable custom targets that can be set without changing the beat or explicitly aligned to arrangement length, master preset, and mix posture.
- Session Brief: bounded local artist, vibe, reference, and notes fields stored in the project file for beat intent and handoff context.
- Pattern editor: drum step sequencer, bass grid with 808 Bassline Pads and 808 Glide Pads for one-click length/glide/chance shaping, chord progression with key-aware Chord Pads and Chord Rhythm Pads for one-click chord length/velocity/chance shaping, melody grid with Melody Motif Pads and Melody Accent Pads for one-click Synth velocity/chance shaping, Pattern Stack Pads for one-click 808/chord/Synth sketches, Groove Feel Pads for editable timing/chance feel, Drum Accent Pads for editable velocity shape, Desktop Keyboard Capture for scale-locked 808/Synth note entry, Pattern Compare cue/use cards, variation A/B/C, and one-click Pattern Fill tail moves.
- Instrument panel: drum kit, synth 808, simple synth, chord synth, effects, Sound Focus Pads, and sound-design controls.
- Arrangement view: editable pattern blocks placed into intro, verse, hook, bridge, and outro structures, with Arrangement Focus presets, Pattern Chain 8-bar sketches, per-step A/B/C chain cycling, Chain Expand song-form outlining, one-click Drop/Build/Hook Lift moves, per-block bar lengths, split/merge controls, arrangement templates plus duplicate, move, and delete controls.
- Project readiness: read-only checks for drums, 808/bass, melody/chords, arrangement, and export completeness.
- Beat Map: deterministic production overview that maps the current beat into Start, Compose, Arrange, Polish, and Deliver stages against the selected fixed or custom Delivery Target, plus song length, Pattern A/B/C usage, export, and stem metrics for faster beginner and producer decisions.
- Next Move: explicit local action recommendations that connect readiness/export state to Blueprint, target alignment, Pattern Fill, Pattern Chain, Hook Lift, Save Slot, and Mix Check commands.
- Quick Actions: searchable local command palette for transport, project, creative, arrangement, mix, and export actions.
- Project snapshots: local idea slots for saving, renaming, restoring, and deleting beat states inside the project file.
- Mixer/master: volume, pan, mute, solo, Mix Balance Pads for one-click editable rough balance, channel low-cut/air EQ, Drive/Glue mix controls, built-in Space send FX, per-stem export level meters, deterministic Mix Coach checks, explicit Mix Fix actions, Master Finish Pads for editable demo/vocal/store/club output posture, master preset ceiling, limiter, loudness/peak metering.
- Export: WAV export, stem export, arrangement MIDI export, and local Handoff Sheet text export after the event/render paths are reliable.

## First-Class Data

The core model centers on editable musical events, not audio clips or a sampler asset graph:

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

When product docs use the word clip before the sampling phase, it means a pattern, MIDI, or automation container. It must not imply that imported audio clips are required for the core workflow.

## MVP Scope

The MVP must prove this sentence:

```text
샘플 없이도 8마디 비트를 만들고 WAV로 export할 수 있어야 한다.
```

This sentence supersedes any sampling-first interpretation of the brief.

MVP capabilities:

- BPM/key setup.
- Key changes retarget Pattern A/B/C 808/bass, melody, and chord-root musical events so existing beats stay in the selected key.
- Style selector that applies key-aware editable groove templates for Trap, Drill, Boom Bap, Lo-fi, House, R&B, Jersey Club, Phonk, Garage, and Experimental Pattern A/B/C, BPM, swing, and sound preset.
- Style Inspector with Style Quick Picks that derive read-only BPM range, active/default swing, bass role, melody role, sound preset, and Pattern A/B/C event density from local style/profile/project data while applying styles through the existing undoable style-selection path.
- Beat Blueprints that apply complete sample-free project starts across style, key, BPM, Pattern A/B/C events, arrangement template, sound preset, mixer balance, and master preset while preserving manual editing.
- 16-step drum sequencer with built-in drum kit, drum-synth sources, editable drum velocity, Drum Accent Pads, probability, visible chance badges, microtiming, one-click groove humanization, and hat repeat dynamics.
- Synth 808/bass track with editable scale-aware grid, 808 Bassline Pads, 808 Glide Pads, Desktop Keyboard Capture, mono mode, glide, note chance badges, selected-note move/transpose/duplicate tools, saturation direction, and kick-to-808 sidechain ducking.
- Chord progression track with scale-locked roots, key-aware Chord Pads, Chord Rhythm Pads, key-aware progression presets, editable step/root/quality/inversion/length/velocity/chance, visible chance badges, add/delete controls, and selected-chord move/duplicate/inversion tools.
- Simple synth melody track with editable scale-aware grid, Melody Motif Pads, Melody Accent Pads, Desktop Keyboard Capture, velocity control, note chance badges, and selected-note move/transpose/duplicate tools.
- Sound design presets, Sound Focus Pads, and Studio tone controls for kick punch, snare snap, hat brightness, 808 drive/decay, sidechain ducking, synth brightness/release, and chord warmth/width.
- Independent Pattern A/B/C storage with Pattern Compare cue/use cards for density and arrangement-use decisions, Pattern Stack Pads for one-click 808/chord/Synth sketches, Groove Feel Pads for editable timing/chance feel, Drum Accent Pads for editable velocity shape, deterministic Subtle/Hook/Break variation tools, one-click Drum Fill/808 Pickup/Melody Turn/Clear Tail moves, plus copy/clear tools for drum, bass, chord, and melody variations.
- Read-only Beat Readiness checks for drums, 808/bass, melody/chords, arrangement structure, and export signal status.
- Delivery Targets stored in project state with safe migration for older files; setting a fixed or custom target changes only the target, editable custom fields stay bounded in local project data, and explicit target alignment can update arrangement template, master preset, master ceiling, and mix posture through undoable project history.
- Session Brief stored in local project state with bounded artist, vibe, reference, and notes text so beginners can clarify intent and producers can keep handoff context without media uploads or cloud collaboration.
- Beat Map production overview derived from local project, selected fixed or custom Delivery Target, Beat Readiness, export analysis, and stem analysis state, showing beginner workflow stages, producer-facing song/pattern/export/stem metrics, and explicit local action buttons without mutating project state unless clicked.
- Next Move strip that gives one primary recommended action and secondary local actions from the current readiness/export state, including target alignment, Pattern Compare, and Pattern Chain when arrangement structure is weak, without mutating Beat Readiness.
- Editable arrangement blocks and templates for 8-bar loop, full beat, hook-first, and breakdown structures, using assigned Pattern A/B/C data, Arrangement Focus presets, one-click Drop/Build/Hook Lift moves, per-block track mutes, per-block bar length, split/merge controls, audible per-block energy, and structure controls for duplicate, move, and delete.
- Pattern Chain presets, per-step A/B/C cycling, and Chain Expand song-form outlining that edit only arrangement block assignments while preserving Pattern A/B/C musical event data, mixer state, sound design, master state, and existing export paths.
- Undo/redo edit history for project-level pattern, arrangement, mixer, sound, and master changes.
- Project Snapshots that save, rename, restore, and delete local beat idea states inside the `.grooveforge.json` file without cloud sync or nested snapshot recursion.
- Desktop editing shortcuts, Keyboard Capture, and Quick Actions command search for arrangement playback, Pattern A/B/C selection, selected drum/note deletion, save, open, undo, redo, snapshots, blueprints, pattern fills, Arrangement Focus, mix fixes, and export while leaving focused inputs alone.
- Transport playback modes for full arrangement playback by default, selected-block loop audition, and fast selected-pattern preview while editing.
- Realtime metronome toggle with accented downbeat clicks that helps users program to the grid during playback without adding click audio to WAV or stem export.
- Live playback reads the current project while scheduling future steps, so selected-pattern preview, arrangement block edits, arrangement track mutes, arrangement length, arrangement energy, BPM, mixer, sound, and master changes can be heard without stopping and restarting.
- Mixer volume, pan, mute, solo, Mix Balance Pads, low-cut/air EQ, Drive/Glue mix controls, built-in Space send FX, per-stem export level meters, deterministic Mix Coach checks, explicit Headroom/Stem Balance/Low End Mix Fix actions, and Master Finish Pads reflected in deterministic render feedback.
- Master preset ceiling, Master Finish Pads, and output gain.
- Reproducible export peak/RMS/headroom meter with limiter activity status for the current arrangement.
- Local project save/load as a `.grooveforge.json` file.
- WAV export through deterministic offline rendering.
- Stem export through deterministic offline rendering for isolated drum, 808, synth, and chord WAV files from the current arrangement.
- MIDI export as a deterministic Standard MIDI File with drum, 808, synth, and chord tracks from the current arrangement.
- Handoff Sheet export as a local plain text summary of title, BPM/key/style, Delivery Target, Session Brief, arrangement blocks, export meter, and stem meter data without media upload or compliance claims.

## Roadmap

Phase 0 validates the audio scheduler: BPM clock, tick/bar/beat math, play/stop/loop, metronome, and simple kick playback.

Phase 1 builds the drum sequencer: 16/32-step grid, kick/snare/clap/hat lanes, velocity, swing, pattern save/load, and hat repeat.

Phase 2 builds 808/bass: monophonic synth, piano-roll style editor, 808 Bassline Pads, 808 Glide Pads, glide, pitch envelope, saturation, and sidechain ducking prototype.

Phase 3 adds melody/chords: simple poly synth, scale lock, Melody Motif Pads, Melody Accent Pads, Keyboard Capture for 808/Synth note entry, key-aware Chord Pads, Chord Rhythm Pads, chord progression presets, chord add/delete tools, selected-chord move/duplicate/inversion tools, melody grid, and preset patches.

Phase 4 adds arrangement and editing speed: pattern blocks, song section markers, per-block bar lengths, arrangement templates, duplicate/move/delete, split/merge controls, desktop editing shortcuts, then deeper mute/reorder refinements, and variation A/B/C.

Phase 5 adds mixer/master/export: volume, pan, mute, solo, Mix Balance Pads, channel low-cut/air EQ, Drive/Glue mix controls, built-in Space send FX, per-stem export level meters, deterministic Mix Coach checks, Master Finish Pads, master preset ceiling first, then limiter, peak/LUFS metering, WAV export, stem export, and MIDI export.

Phase 6 scopes optional sampling as an extension only after the beat-making core is useful: audio import, sampler mapping, chopping, reverse, pitch, and stretch.

## Priority Guardrail

Feature priority follows the beat-workstation core:

| priority | area | reason |
|---|---|---|
| P0 | scheduler, drum sequencer, 808/bass, WAV export | timing, rhythm, low end, and output define whether this is a usable music app |
| P1 | melody/chords, arrangement, mixer | these make a sample-free beat feel like a song rather than a loop |
| P2 | mastering, MIDI input, deeper meters | these improve finishing and workflow after the core beat exists |
| P3 | sampling and plugin hosting | useful extensions, but not required for the first complete beat |
| P4 | AI generation | later automation only after editable event generation is reliable |

## Non-Goals

- Do not make sample chop/import the MVP center.
- Do not describe GrooveForge as a sampling app in product docs, UI copy, or agent plans.
- Do not use sample import, chopping, sampler tracks, or audio warping as a plan title or primary scope unless the work is explicitly in the optional sampling phase.
- Do not put sample browsing, chopping, or sampler setup ahead of direct beat composition in first-run UX, roadmap ordering, or default navigation.
- Do not build plugin hosting before the local synth/mixer/export loop is working.
- Do not add AI audio generation before editable pattern generation exists.
- Do not add cloud collaboration, accounts, payments, trackers, or remote AI calls without explicit rationale.
- Do not claim mastering is an automatic fix for a bad mix. Mixing and mastering remain separate product stages.

## Product Constraints

- Web-first MVP should assume browser audio constraints: user gesture requirements, device variability, scheduling precision limits, and offline render validation.
- Imported samples, exported stems, and project files can contain copyrighted or private material. Do not commit real user audio fixtures.
- Loudness presets are targets and measurement aids, not guarantees that a beat is platform-approved.
- VST3/AU/plugin hosting belongs to a later native/pro roadmap after the web MVP proves the core workflow.
