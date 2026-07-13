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

First-run ownership state must describe the default event project as an editable 8-bar foundation rather than a demo. Before an explicit file save, the compact safety state remains warning-toned and must say the project is editable now, local only, and needs Save for a durable `.grooveforge.json` copy; the first mutation continues through the existing unsaved-change and renderer-local draft path.

Audience starter creation is an action-to-workspace route, not only a project factory. The beginner route moves viewport and programmatic focus to the direct Pattern editor; the producer route first expands the nested Review & Export and Review Queue disclosures, then moves viewport and focus to Review Queue. Starter and Workflow Navigator routes share a measured sticky-navigation clearance fallback after normal `scrollIntoView`, so nested or top-level targets remain visible across renderers. These focus targets stay outside project state and must not trigger playback, fixes, export, remote behavior, or additional project mutation.

Drum-grid keyboard navigation is a UI-local focus state machine over the existing `SelectedDrumStep`. The pure `drumGridNavigationTarget` helper bounds horizontal movement to 16 steps and vertical movement to the four fixed drum lanes, while Home/End stay lane-local. The renderer owns one roving `tabIndex=0`, moves DOM focus and exclusive editor selection together for navigation keys, and never calls a project update from navigation. Enter/Space are consumed at the focused button and forwarded once through its existing click handler, which preserves the established undoable drum-event path and prevents Space from bubbling into the global Play/Stop shortcut. `aria-pressed` is derived directly from the current Pattern A/B/C drum event, so accessibility state, visible active styling, playback, save/load, render, and export all continue to read one event source of truth.

The Workspace Command Dock is a conditional projection of existing App transport state, not another command or playback subsystem. One `IntersectionObserver` watches the full transport header and renders the dock only while that header is non-intersecting. The dock reads the existing transport position summary, `isPlaying`, `canUndo`, and `canRedo`, and calls the same playback, Quick Actions, undo, redo, and save handlers as the header. Its fixed viewport placement is bounded by `100vw`, and the App shell adds bottom scroll and keyboard-focus clearance only while the dock is present. The observer and dock visibility remain UI-local and are not serialized into project, draft, render, export, or delivery data.

At desktop widths, the transport shell uses named grid areas for brand, setup, launchpad, and commands. The brand wrapper becomes layout-transparent only at `min-width: 1221px`, allowing the launchpad to span brand and setup columns while the command strip retains direct transport and project controls; mobile keeps the existing stacked wrapper. This is responsive presentation only and does not move ownership across handlers or state.

The reachable 901–1220px range uses a separate named-grid contract: brand/setup on the first row, launchpad across the second, and command groups across the third. Production smoke temporarily resizes the real BrowserWindow to its 1180px minimum, records viewport overflow and required-action geometry, then restores 1440×960 before the normal launch evidence so edge-width and standard-width claims remain independent.

Mode-aware tool disclosure uses that same 1220px boundary for the two transport secondary groups. `isCompactTransportViewport` prevents Studio entry from opening Session Context or Exports in the compact range, while the existing wide-window Studio posture still opens both. A `matchMedia` change listener closes both groups once when a window crosses into the compact range; it does not keep forcing them closed, so subsequent manual summary toggles remain authoritative. The listener is removed on unmount, Guided resets both groups, all other Studio panel disclosure behavior stays unchanged, and none of this UI-local state enters the project or undo history.

Direct preset controls in the first editing viewport must fully own their rendered state rather than inherit browser-native control chrome. Swing Feel pads therefore define dark base, hover, focus-visible, and selected surfaces plus explicit pressed semantics; this presentation layer remains separate from the existing swing project field, undo history, realtime scheduler, and export pipeline.

The workstation also owns a zero-specificity button foundation through `:where(button)`. It removes native appearance and supplies the minimum dark surface, border, radius, foreground, hover, focus-visible, and disabled contract while allowing every class- or component-scoped selector to override presentation. This is a rendering boundary only and must not alter event handlers, command routing, project mutation, keyboard shortcuts, playback, or export.

The core project model should make composition events first-class. In the core architecture, a clip is a pattern, MIDI, or automation container, not an imported audio asset:

- `Project`: version, title, BPM, key/scale, swing, tracks, arrangement, master settings.
- `SessionBrief`: bounded local artist, vibe, reference, and notes text for project intent and handoff context.
- `Track`: type, mixer strip, devices, clips, Space send amount.
- `Clip`: pattern, MIDI, or automation data for the MVP.
- `MusicalEvent`: note, drum hit, or automation event for the MVP.
- `Device`: synth, drum rack, EQ, compressor, saturation, limiter, meter, send effect.
- `StyleProfile`: genre rules for BPM range, swing, density, quantize strength, humanization, bass style, and melody style.

Core MVP schema contract:

```ts
type CoreMusicalEvent = NoteEvent | DrumHitEvent | AutomationEvent;
type CoreClipType = "pattern" | "midi" | "automation";
type CoreTrackType =
  | "drum_rack"
  | "bass_808"
  | "synth"
  | "chord"
  | "fx_return"
  | "master";
```

Optional sampling extension contract, later:

```ts
type OptionalSamplingTrackType = "audio" | "sampler";
type OptionalSamplingEvent = AudioClipEvent;
```

The optional contract is additive. It must plug into the event-first project, track, arrangement, mixer/master, and export flow instead of replacing the core composition model.

Default device palette: drum rack, synth 808/bass, simple synth, chord synth, built-in FX, mixer, and master devices. A sampler device is not part of the MVP default palette; it belongs to the optional sampling extension after the direct beat workstation can stand without imported audio.

Sound-source nuance: a built-in drum rack may use internal one-shot sounds, and a future bass patch may optionally use a sample 808 source, but those are instrument sound sources under direct event editing. They are not permission to introduce sample browsing, chopping, audio clips, sampler tracks, or user-file dependencies into the core MVP flow. The MVP default remains built-in drum rack plus synth 808/bass.

MVP type examples must not place `AudioClipEvent`, `audio`, or `sampler` beside the core event, clip, or track unions. Those names are reserved for the optional sampling extension section unless the user explicitly starts sampling-phase work. External examples that include `AudioClipEvent` in `MusicalEvent` or include `audio`/`sampler` in `TrackType` must be split into a core MVP union plus a clearly labeled optional sampling extension.

Attached-brief architecture rule: when a brief presents a single combined track, clip, or audio-engine list, split it before implementation. The MVP list is `drum_rack`, `bass_808`, `synth`, `chord`, `fx_return`, and `master` plus pattern/MIDI/automation clips; `audio`, `sampler`, `AudioClip`, `Sampler`, waveform editing, chop pads, and imported audio assets belong only to the optional sampling extension.

Korean concept-brief architecture rule: if a brief says GrooveForge is for "비트(모든 장르)를 만드는" work and sampling is "부가 기능", architecture must not promote sample import, chopping, loop stretching, sampler setup, `AudioClipEvent`, `audio`, or `sampler` into the core layer map, MVP track union, first-run project, or default device palette.

Latest brief architecture verdict: the core architecture must still make sense if every imported-audio and sampler concept is deleted. If removing sample import, chopping, loop stretching, audio clips, and sampler devices breaks the proposed MVP, the proposal is sampling-first and must be rewritten around musical events, built-in instruments, arrangement, mixer/master, and export before implementation.

Draft rewrite target: the accepted MVP architecture removes `AudioClipEvent` from `MusicalEvent`, excludes `audio` and `sampler` from `TrackType`, treats core clips as pattern/MIDI/automation containers, and keeps the default device palette to drum rack, synth 808/bass, simple synth, chord synth, built-in FX, mixer, and master devices. Optional sampling can add audio clips, audio tracks, sampler devices, sample import, chopping, pitch/stretch, and one-shot mapping later without changing the event-first core.

Attached Korean brief rewrite: the accepted architecture uses the brief's direct-composition concept, not its combined optional-sampling unions. If a draft shows `MusicalEvent` with `AudioClipEvent`, `TrackType` with `audio` or `sampler`, `Clip` with `AudioClip`, an audio-engine list with `Sampler`, or a default Instrument Panel with `sampler`, split it into a core MVP architecture plus an optional sampling extension before code review.

Current audit outcome: keep the architecture proof sample-free. The accepted core still works after deleting every imported-audio entity, including `AudioClipEvent`, `AudioClip`, sample import, sample browser, chop/slice grid, loop stretch, sample 808 as a required source, `audio`, `sampler`, and sampler devices. Those names can appear only in an optional sampling extension section or a user-approved sampling-phase plan.

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

If a draft proposes a default Instrument Panel with `drum kit`, `808`, `synth`, `sampler`, and `FX`, rewrite the default list to `drum rack`, `synth 808/bass`, `simple synth`, `chord synth`, built-in FX, mixer, and master devices. Put `sampler` only under the optional sampling extension.

If a draft proposes `Sample 808` beside `Synth 808`, keep Synth 808 as the MVP default and document Sample 808 only as a future optional source mode inside the 808/Bass engine.

If a draft proposes `sample import -> chop -> pitch/stretch -> sampler instrument` as the first creative flow, rewrite that flow as optional sampling extension work and keep the core architecture flow as `BPM/key/style -> drum rack -> synth 808/bass -> melody/chords -> sound design -> arrangement -> mixer/master -> export`.

Extension track types for optional sampling, later:

- `audio`
- `sampler`

Do not list `sampler` in the default instrument panel, first-run track list, or MVP architecture diagram. It can appear only inside an explicitly marked optional sampling section until sampling-phase work is approved.

## Modal Focus Rule

Quick Actions and Command Reference share one UI-local modal focus lifecycle. Each dialog owns initial focus and Escape handling, uses the same visible-enabled focusable-element traversal for Tab and Shift+Tab wraparound, and exposes a focusable dialog fallback when no child control is available. The App shell records the active workstation opener only when entering the first modal, preserves it during direct modal-to-modal handoff, restores it after an explicit close, and clears it when command execution intentionally routes focus elsewhere. This state never enters project data, undo history, save/load, playback, render/export, or remote behavior.

Desktop shortcut routing recognizes only modified Ctrl/Cmd+K and Ctrl/Cmd+/ command-workflow navigation before the editable-target guard. This lets a workstation input or either modal search hand off directly into the other command surface while retaining the original opener. The guard still runs before unmodified `?` and before undo, redo, save, open, transport, Pattern, capture, and delete handling, so ordinary text entry and project mutation semantics remain unchanged.

Quick Actions keyboard selection is also UI-local component state. It is derived only from the currently visible enabled results, resets when the palette opens or its query or scope changes, and keeps DOM focus in the search input while ArrowUp, ArrowDown, Home, and End update the selected action id. Enter resolves that selected action through the existing command run path. Selection styling, scrolling, and live status do not alter command definitions, result filtering, pinning, recent actions, project data, undo history, save/load, playback, render/export, or remote behavior.

## Genre Rule

Genre is data, not a product silo. Trap, drill, boom bap, lofi, house, jersey, phonk, R&B, garage, and experimental behavior should live in `StyleProfile` presets and editable generation rules.

The default project is an 8-bar local composition foundation, not a genre-branded long demo: it uses the existing Lo-fi profile at 82 BPM in A minor, generates matching editable Pattern A/B/C events through the same style-rule system, targets Starter Sketch with Clean Demo master posture, and labels Style as a changeable starting point across all 14 profiles. Full-song and professional producer projects remain explicit starter/template choices.

## Scheduling Rule

The audio scheduler is a P0 product dependency. UI timing must not be treated as audio timing. Realtime playback uses stable musical ticks, schedules audio ahead of the render deadline, loops over musical steps, and reports current step/bar/beat back to the UI as a view of the transport.

## Export Rule

WAV export must render from project data through the same musical timeline used for realtime playback, including built-in Space send processing. Export validation should check that the result is non-silent, has the expected duration, does not exceed the chosen limiter ceiling, and can be recreated from saved project JSON.
