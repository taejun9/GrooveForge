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
  Optional Sampler
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

The project model should make event data first-class:

- `Project`: version, title, BPM, key/scale, swing, tracks, arrangement, master settings.
- `Track`: type, mixer strip, devices, clips, sends.
- `Clip`: pattern, MIDI, audio, or automation data.
- `MusicalEvent`: note, drum hit, automation, or audio clip event.
- `Device`: synth, drum rack, sampler, EQ, compressor, saturation, limiter, meter, send effect.
- `StyleProfile`: genre rules for BPM range, swing, density, quantize strength, humanization, bass style, and melody style.

Sampling is represented as an audio/sampler track and audio clip events. It must not be required for a valid project.

## Track Types

Initial track types:

- `drum_rack`
- `bass_808`
- `synth`
- `chord`
- `audio`
- `sampler`
- `fx_return`
- `master`

MVP tracks should be `drum_rack`, `bass_808`, `synth`, and `master`. Add `audio` and `sampler` in the optional sampling phase.

## Scheduling Rule

The audio scheduler is a P0 product dependency. UI timing must not be treated as audio timing. Playback should use stable musical ticks and schedule audio ahead of the render deadline while keeping UI state as a view of the transport.

## Export Rule

WAV export must render from project data through the same musical timeline used for realtime playback. Export validation should check that the result is non-silent, has the expected duration, does not exceed the chosen limiter ceiling, and can be recreated from saved project JSON.

