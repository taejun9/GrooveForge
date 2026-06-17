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
- UI rendering: DOM/CSS for the current workstation surface; Canvas/WebGL remains available for dense piano-roll work, while waveform views belong only to a later optional sampling phase.
- Audio: Web Audio API for realtime loop playback and a local WAV renderer for the first export path.
- Storage: JSON project files and IndexedDB/local file cache in later plans.

Electron is used for the first desktop MVP because it gets the existing web audio/UI direction into a runnable desktop app quickly. A later native/pro audio engine can still move to JUCE after the product loop is proven.

## Data Model Direction

The architecture follows a direct-composition pipeline: BPM/key/style, pattern programming, drum sequencing, 808/bass synthesis, melody/chord composition, sound design, arrangement, mixer/master, and export.

Architectural center: Pattern Programming, Drum Sequencing, 808/Bass Synthesis, Melody/Chord Composition, Sound Design, Arrangement, Mixing, Mastering, and Export. Style profiles, musical events, built-in instruments, arrangement blocks, mixer state, master state, and render state are the first-class data that make a beat without imported audio.

Extension boundary: optional sampling attaches after this pipeline as an additional sound source or instrument layer; it must not become the foundation of project creation, playback, arrangement, save/load, or export. Audio import, chopping, stretching, one-shot mapping, and sampler devices are secondary extension paths that plug into this center only after it works without samples. Architecture diagrams and draft flows should keep the core layer map centered on event editing, built-in instruments, arrangement, mixer/master, and export, with sampler/audio-clip concepts separated into a later extension section.

Composition-first invariant: GrooveForge must remain fully usable when audio import, sampler tracks, chop pads, and audio warping are absent. Core playback, arrangement, save/load, and export paths should depend on musical events, built-in instruments, mixer state, and master state before they depend on user audio assets.

Default project creation, first-run navigation, and MVP validation must instantiate editable musical events and built-in instruments first. They must not instantiate an audio asset graph, sample browser, chop grid, or sampler device as the required starting point for making a beat.

The core project model should make composition events first-class. In the core architecture, a clip is a pattern, MIDI, or automation container, not an imported audio asset:

- `Project`: version, title, BPM, key/scale, swing, tracks, arrangement, master settings.
- `SessionBrief`: bounded local artist, vibe, reference, and notes text for project intent and handoff context.
- `Track`: type, mixer strip, devices, clips, Space send amount.
- `Clip`: pattern, MIDI, or automation data for the MVP.
- `MusicalEvent`: note, drum hit, or automation event for the MVP.
- `Device`: synth, drum rack, EQ, compressor, saturation, limiter, meter, send effect.
- `StyleProfile`: genre rules for BPM range, swing, density, quantize strength, humanization, bass style, and melody style.

Default device palette: drum rack, synth 808/bass, simple synth, chord synth, built-in FX, mixer, and master devices. A sampler device is not part of the MVP default palette; it belongs to the optional sampling extension after the direct beat workstation can stand without imported audio.

MVP type examples must not place `AudioClipEvent`, `audio`, or `sampler` beside the core event, clip, or track unions. Those names are reserved for the optional sampling extension section unless the user explicitly starts sampling-phase work.

If an exploratory draft includes audio clip, sampler, or waveform examples, move them to an optional sampling section before they enter architecture diagrams, schema examples, default tracks, or MVP validation.

Sampling is an extension model, not a core dependency. When it is added, it can introduce audio clips, sampler devices, audio tracks, and source/license metadata without changing the requirement that a valid beat can be made from generated and performed events alone. `AudioClipEvent` belongs in that extension layer, not in the core MVP `MusicalEvent` union.

Optional sampling schemas must preserve the existing event-first contract: `NoteEvent`, `DrumHitEvent`, and automation stay sufficient for a complete beat, while any future `AudioClipEvent` remains additive, opt-in, and absent from the core MVP proof.

Sampling modules are leaf-level source or instrument devices, not root-level project architecture. They must plug into the existing track, arrangement, mixer/master, and export flow rather than requiring the product to start from sample browsing, chopping, loop stretching, or sampler setup.

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

MVP tracks should be `drum_rack`, `bass_808`, `synth`, `chord`, `fx_return`, and `master`. `audio` and `sampler` must not appear in the MVP track union or default project track list.

The MVP `fx_return` is a built-in Space send/return path for shared ambience. It is deterministic project processing, not plugin hosting, imported impulse responses, sample playback, or a sampling workflow.

Extension track types for optional sampling, later:

- `audio`
- `sampler`

Do not list `sampler` in the default instrument panel, first-run track list, or MVP architecture diagram. It can appear only inside an explicitly marked optional sampling section until sampling-phase work is approved.

## Genre Rule

Genre is data, not a product silo. Trap, drill, boom bap, lofi, house, jersey, phonk, R&B, garage, and experimental behavior should live in `StyleProfile` presets and editable generation rules.

## Scheduling Rule

The audio scheduler is a P0 product dependency. UI timing must not be treated as audio timing. Realtime playback uses stable musical ticks, schedules audio ahead of the render deadline, loops over musical steps, and reports current step/bar/beat back to the UI as a view of the transport.

## Export Rule

WAV export must render from project data through the same musical timeline used for realtime playback, including built-in Space send processing. Export validation should check that the result is non-silent, has the expected duration, does not exceed the chosen limiter ceiling, and can be recreated from saved project JSON.
