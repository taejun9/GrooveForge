# GrooveForge Product Architecture

## Layer Map

```text
UI Layer
  Transport
  Step Sequencer
  Piano Roll
  Chord Pad
  Arrangement
  Mixer
  Master Panel
        |
Project State
  BPM
  Key / Scale
  Tracks
  Clips
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

## Web-First Stack Assumption

The recommended MVP stack is:

- Frontend: Next.js, TypeScript, Zustand, Tailwind CSS.
- UI rendering: DOM for panels and Canvas/WebGL for dense grids, piano rolls, arrangement blocks, and waveforms.
- Audio: Web Audio API, AudioWorklet for custom DSP, Tone.js only when it accelerates prototyping without hiding scheduler behavior.
- Export: OfflineAudioContext-style offline rendering, then WAV encoding.
- Storage: IndexedDB for local project and asset cache, JSON project files for portable saves.

These are current candidates, not installed dependencies. Add package commands only after the stack exists.

## Data Model Direction

The core project model should make composition events first-class:

- `Project`: version, title, BPM, key/scale, swing, tracks, arrangement, master settings.
- `Track`: type, mixer strip, devices, clips, sends.
- `Clip`: pattern, MIDI, or automation data for the MVP.
- `MusicalEvent`: note, drum hit, or automation event for the MVP.
- `Device`: synth, drum rack, EQ, compressor, saturation, limiter, meter, send effect.
- `StyleProfile`: genre rules for BPM range, swing, density, quantize strength, humanization, bass style, and melody style.

Sampling is an extension model, not a core dependency. When it is added, it can introduce audio clips, sampler devices, audio tracks, and source/license metadata without changing the requirement that a valid beat can be made from generated and performed events alone.

## Track Types

Initial track types:

- `drum_rack`
- `bass_808`
- `synth`
- `chord`
- `fx_return`
- `master`

MVP tracks should be `drum_rack`, `bass_808`, `synth`, `chord`, `fx_return`, and `master`.

Extension track types for optional sampling:

- `audio`
- `sampler`

## Genre Rule

Genre is data, not a product silo. Trap, drill, boom bap, lofi, house, jersey, phonk, R&B, garage, and experimental behavior should live in `StyleProfile` presets and editable generation rules.

## Scheduling Rule

The audio scheduler is a P0 product dependency. UI timing must not be treated as audio timing. Playback should use stable musical ticks and schedule audio ahead of the render deadline while keeping UI state as a view of the transport.

## Export Rule

WAV export must render from project data through the same musical timeline used for realtime playback. Export validation should check that the result is non-silent, has the expected duration, does not exceed the chosen limiter ceiling, and can be recreated from saved project JSON.
