# GrooveForge Product Architecture

## Layer Map

```text
UI Layer
  Transport
  Step Sequencer
  Piano Roll
  Chord Pad
  Arrangement
  Session Brief
  Mixer
  Master Panel
        |
Project State
  BPM
  Key / Scale
  Session Brief
  Tracks
  Pattern/Event Clips
  Patterns
  Devices
  Automation
  Mixer State
        |
Composition Engine
  Style Profiles
  Pattern Generator
  Chord Generator
  Bassline Generator
  Humanizer
  Variation Generator
        |
Audio Engine
  Scheduler
  Drum Rack
  808 Synth
  Poly Synth
  FX Devices
  Space Send / FX Return
  Mixer Bus
  Master Bus
        |
Render Engine
  Realtime Playback
  Offline Render
  WAV Export
  Stem Export
  Loudness Analysis
```

## Desktop MVP Stack

The current MVP stack is:

- Desktop shell: Electron.
- Renderer/build: Vite, React, TypeScript.
- UI rendering: DOM/CSS for the current workstation surface; Canvas/WebGL remains available for dense piano-roll and waveform work later.
- Audio: Web Audio API for realtime loop playback and a local WAV renderer for the first export path.
- Storage: JSON project files and IndexedDB/local file cache in later plans.

Electron is used for the first desktop MVP because it gets the existing web audio/UI direction into a runnable desktop app quickly. A later native/pro audio engine can still move to JUCE after the product loop is proven.

## Data Model Direction

The architecture follows a direct-composition pipeline first: BPM/key/style, pattern programming, drum sequencing, 808/bass synthesis, melody/chord composition, sound design, arrangement, mixer/master, and export. Optional sampling attaches after this pipeline as an additional sound source or instrument layer; it must not become the foundation of project creation, playback, arrangement, save/load, or export.

Architectural center: Pattern Programming, Drum Sequencing, 808/Bass Synthesis, Melody/Chord Composition, Sound Design, Arrangement, Mixing, Mastering, and Export. Audio import, chopping, stretching, one-shot mapping, and sampler devices are secondary extension paths that plug into this center only after it works without samples.

Composition-first invariant: GrooveForge must remain fully usable when audio import, sampler tracks, chop pads, and audio warping are absent. Core playback, arrangement, save/load, and export paths should depend on musical events, built-in instruments, mixer state, and master state before they depend on user audio assets.

The core project model should make composition events first-class. In the core architecture, a clip is a pattern, MIDI, or automation container, not an imported audio asset:

- `Project`: version, title, BPM, key/scale, swing, tracks, arrangement, master settings.
- `SessionBrief`: bounded local artist, vibe, reference, and notes text for project intent and handoff context.
- `Track`: type, mixer strip, devices, clips, Space send amount.
- `Clip`: pattern, MIDI, or automation data for the MVP.
- `MusicalEvent`: note, drum hit, or automation event for the MVP.
- `Device`: synth, drum rack, EQ, compressor, saturation, limiter, meter, send effect.
- `StyleProfile`: genre rules for BPM range, swing, density, quantize strength, humanization, bass style, and melody style.

Sampling is an extension model, not a core dependency. When it is added, it can introduce audio clips, sampler devices, audio tracks, and source/license metadata without changing the requirement that a valid beat can be made from generated and performed events alone. Sampling architecture should attach to the beat workstation; it should not replace the workstation model. `AudioClipEvent` belongs in that extension layer, not in the core MVP `MusicalEvent` union.

The core architecture should remain valid with no audio-file entities at all. Default project creation, playback, arrangement, save/load, and export must continue to start from musical events and built-in instruments; sample browsing, chopping, sampler mapping, and audio warping belong behind explicit optional-sampling entry points.

Key and scale changes are composition edits over musical event data. They should retarget Pattern A/B/C bass notes, melody notes, and chord roots by scale degree before any future sampling module is considered part of the workflow.

Roadmap and architecture plans should treat `audio` and `sampler` as extension track types until the direct beat workstation is already useful. A future sampling plan can add import, one-shot mapping, chop pads, reverse, pitch, and stretch, but it must preserve sample-free project creation, playback, save/load, and export.

## Track Types

Initial track types:

- `drum_rack`
- `bass_808`
- `synth`
- `chord`
- `fx_return`
- `master`

MVP tracks should be `drum_rack`, `bass_808`, `synth`, `chord`, `fx_return`, and `master`.

The MVP `fx_return` is a built-in Space send/return path for shared ambience. It is deterministic project processing, not plugin hosting, imported impulse responses, sample playback, or a sampling workflow.

Extension track types for optional sampling, later:

- `audio`
- `sampler`

## Genre Rule

Genre is data, not a product silo. Trap, drill, boom bap, lofi, house, jersey, phonk, R&B, garage, and experimental behavior should live in `StyleProfile` presets and editable generation rules.

## Scheduling Rule

The audio scheduler is a P0 product dependency. UI timing must not be treated as audio timing. Realtime playback uses stable musical ticks, schedules audio ahead of the render deadline, loops over musical steps, and reports current step/bar/beat back to the UI as a view of the transport.

## Export Rule

WAV export must render from project data through the same musical timeline used for realtime playback, including built-in Space send processing. Export validation should check that the result is non-silent, has the expected duration, does not exceed the chosen limiter ceiling, and can be recreated from saved project JSON.
