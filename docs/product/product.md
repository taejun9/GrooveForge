
# GrooveForge Product

## Summary

GrooveForge is a desktop-ready, web-first, event-based mini DAW for making beats across genres with pattern programming, drums, 808/bass, melody/chords, sound design, arrangement, mixing, mastering, Session Brief, Space send FX, MIDI export, and WAV/stem export. It opens on direct beat writing with built-in instruments and editable musical events.

## Type

`web-first TypeScript mini DAW / beat workstation`

## Product Definition

Corrected concept: GrooveForge is a beat-production mini DAW for directly composing beats across genres, designing sounds, arranging sections, mixing/mastering, and exporting finished audio. In the user's terms, it is "비트(모든 장르)를 만드는" app and "직접 비트를 작곡하고 사운드를 설계하고 믹싱/마스터링까지 하는 비트 제작 미니 DAW." It can support sampling later as an optional extension, but the identity, first-run workflow, MVP proof, and core architecture are direct beat production.

GrooveForge is a code-driven all-genre beat workstation: a mini DAW with a JSON-based project format, programmable style profiles, editable musical events, local synthesis, mixing/mastering controls, and offline export. The center is writing and shaping the beat directly.

Product summaries should stay centered on direct beat writing before any extension workflow is mentioned.

First-read drafts should state the beat-making path before naming any sampling extension. The expected first impression is "make a beat from events and instruments," not "start by importing audio."

The primary object is a beat project built from musical events, patterns, tracks, devices, arrangement blocks, mixer state, master state, and render state. Audio samples can become assets inside that project later, but they are not the default starting point.

The product should make a blank beat feel playable without imported audio: set BPM/key/style, write rhythm, compose 808/bass, melody, and chords, shape tone and FX, arrange sections, mix/master, and export. The product center is Pattern Programming, Drum Sequencing, 808/Bass Synthesis, Melody/Chord Composition, Sound Design, Arrangement, Mixing, Mastering, and Export.

Core schema examples must reflect that order. Do not place `AudioClipEvent`, `audio`, or `sampler` beside core MVP event, clip, or track unions unless the user has explicitly started optional sampling-phase work.

Trap, drill, boom bap, house, lofi, jersey, phonk, R&B, garage, and experimental workflows should be expressed as style profiles and editable generation rules, not as hard-coded product identity.

When there is ambiguity, read the product draft in this order: all-genre beat creation first, direct composition and sound design second, arrangement/mixing/mastering/export third, optional sampling extensions last.

## Product Boundary

Core product:

- Pattern programming for all supported styles.
- Direct drum programming.
- 808/bass synthesis and bassline editing.
- Melody and chord composition.
- Sound design through built-in instruments and devices.
- Arrangement from editable patterns.
- Mixing, mastering, and export.

Later optional sound-source extension, outside the MVP:

- Sampling, audio import, chopping, and sampler mapping.

Sampling can be useful, but it must stay behind the composition engine, instrument engine, arrangement, mixer/master, and export pipeline in priority, architecture, roadmap order, and UI copy. A user should be able to make the first complete beat with only built-in instruments and editable musical events. When sampling appears later, it should behave like an optional sound source or instrument layer inside the beat workstation.

Keep sampling language in boundary, roadmap, or optional-phase sections. Do not move it into the top-line summary, MVP proof, or first-run creative loop.

Primary navigation and the first empty project should expose beat-making controls first: transport, style/key/BPM, pattern editor, drum programming, 808/bass, melody/chords, sound design, arrangement, mixer/master, and export. Sampling entry points, when added, should be opt-in secondary paths.

Default instrument-panel rule: the base instrument panel is built-in drum rack, synth 808/bass, simple synth, chord synth, effects, and sound-design controls. If a draft lists `sampler` beside those default instruments, move it to the optional sampling extension section unless the user explicitly starts sampling-phase work.

Accessory rule: sampling can expand available source material, but it is not the product category, the first proof of value, or the main creative loop. A feature draft should first explain which beat event, instrument, arrangement, mix/master, or export outcome it improves; if the answer is sample import, chopping, loop stretch, one-shot mapping, or sampler setup, the draft belongs in an optional sampling phase.

Placement rule: the default empty project, first visible actions, MVP proof, primary navigation, onboarding language, and plan titles must start from editable musical events and beat-making controls. Optional sampling can add sound sources later, but it must not become the first required action, first proof of value, default explanation of GrooveForge, or a co-equal product spine beside direct composition.

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

This loop is the product spine for all supported genres. Style presets may change BPM, swing, density, sound posture, and event blueprints, but they should still produce editable drums, 808/bass, melody/chords, arrangement, mixer/master, and export state without requiring samples.

Optional sampling remains a later extension after the direct beat workstation is useful. Future scope may include audio import, chopping/slicing, pitch/stretch, one-shot mapping, and sampler instruments, but product drafts should keep that list under extension planning.

Primary feature areas:

- Transport: BPM, Tap Tempo, Tempo Nudge Pads, key, play, stop, Song/Block/Pattern loop audition, Transport Position Readout, metronome.
- Beat blueprints: sample-free editable project starts that combine style, key, BPM, Pattern A/B/C events, arrangement template, sound preset, mixer balance, and master preset, with a UI-local preview/readout before explicit Apply.
- Delivery Targets: local starter sketch, vocal session, beat-store demo, club demo, and editable custom targets that can be set without changing the beat or explicitly aligned to arrangement length, master preset, and mix posture.
- Delivery Target Alignment Preview and Result: UI-local readouts for the selected target's pre-click Align outcome and post-click applied alignment across target fit, arrangement length, master preset, mix posture, and stem expectation without storing UI feedback in project data.
- Session Brief: bounded local artist, vibe, reference, and notes fields stored in the project file for beat intent and handoff context, with a UI-only role readout for brief usefulness and next missing context.
- Key Compass: local read-only scale-note, chord-motion, 808/bass posture, melody posture, and selected-note or selected-chord focus summary so beginners can stay in key and producers can scan harmonic movement quickly.
- Key Compass Focus: UI-local Focus controls that route scale, chords, 808/bass, melody, and selected-note or selected-chord diagnostics to the Compose panel so users can correct harmonic posture without changing key retargeting, note/chord editing, or project data.
- Groove Compass: local read-only selected-pattern drum density, kick/clap anchor, hat motion, timing feel, probability, and selected drum focus summary so beginners can understand groove foundations and producers can scan pocket quickly.
- Groove Compass Focus: UI-local Focus controls that route density, anchors, hat motion, timing, chance, and selected-drum diagnostics to the Compose panel so users can correct pocket posture without changing drum editing, selected drum state, playback, or project data.
- Composer Guide: local read-only drums, 808/bass, harmony, melody, arrangement, and finish posture summary so beginners can see the next writing focus and producers can scan missing layers quickly.
- Composer Guide Focus: UI-local Focus controls that route Drums, 808/Bass, Harmony, Melody, Arrange, and Finish guidance cards to matching panels so users can run a guided writing pass without changing guide scoring or project data.
- Mode Focus: read-only Guided/Studio orientation strip derived from local Composer Guide, Beat Map, Review Queue, and Finish Checklist state; Guided shows current stage, writing focus, and local check, while Studio shows session scan, top review issue, and handoff posture.
- Mode Focus Jump: explicit UI-local Jump controls on Guided/Studio focus cards that route current stage, writing focus, local check, session scan, top issue, and handoff posture to matching Compose, Arrange, Mix, Master, or Deliver panels without changing focus scoring or project data.
- Workflow Navigator: local UI-only Compose, Arrange, Mix, and Deliver jump controls derived from current workflow state so beginners can follow the beat-making path and producers can move quickly across the dense workstation without changing project data.
- Workflow Spotlight: UI-local readout inside Workflow Navigator that shows the first Compose, Arrange, Mix, or Deliver zone needing attention plus ready/review/blocker counts from visible navigator items without changing item derivation, jump behavior, or project data.
- Composer Actions: style-aware explicit local writing move buttons derived from Composer Guide posture, selected style profile, and local project state, with inline scope, impact, and undo previews before each user-clicked action routes through existing undoable Drum Foundation, 808 Bassline, Chord Progression, Melody Motif, Pattern Fill, Pattern Chain, arrangement template, and Master Finish handlers, then shows a UI-only local result strip with updated beat metrics, audition cues, and next checks.
- Pattern editor: drum step sequencer with Drum Foundation Pads for one-click kick/clap/hat/perc foundations, Groove Feel Pads for editable timing/chance feel, Drum Accent Pads for editable velocity shape, a local Drum Move Preview and Result for one-click rhythm/timing/chance/velocity changes, plus selected-drum pocket readout, bass grid with 808 Bassline Pads, 808 Glide Pads for one-click length/glide/chance shaping, 808 Contour Pads for bassline direction shaping, and a local 808 Move Preview and Result for one-click low-end rhythm/glide/contour changes, chord progression with Chord Playhead Highlighting, key-aware Chord Pads, Chord Rhythm Pads, Chord Voicing Pads, and a local Chord Move Preview and Result for one-click chord color/inversion/shape changes plus selected-chord harmonic readout, melody grid with Melody Motif Pads, Melody Accent Pads, Melody Contour Pads, and a local Melody Move Preview and Result for one-click Synth phrase direction/velocity/chance shaping, Pattern Clone Pads for one-click clone-and-vary moves into another Pattern A/B/C slot, Pattern Stack Pads with a local Pattern Stack Preview and Result for one-click 808/chord/Synth sketches, Desktop Keyboard Capture for scale-locked 808/Synth note entry with a degree-labeled key map, command-strip posture readout, plus UI-local octave, length, Synth velocity, and 808 glide defaults, selected-note degree/role readout plus move/transpose/copy/paste/duplicate tools, Pattern Compare cue/use cards, variation A/B/C, and one-click Pattern Fill tail moves.
- Pattern-aware editor playheads: drum, 808, Synth, and Chord editor highlights derive from realtime playback snapshots only when the playback Pattern A/B/C matches the selected editing Pattern, while Transport Position Readout, Arrangement Playhead Highlighting, Section Locator Pads, and Song Form Overview continue to show the actually playing Pattern during Song/Block playback.
- Playing Pattern Tabs: Pattern A/B/C tabs keep selected editing Pattern state independent from a realtime playing marker derived from playback snapshots, so users can follow the audible Pattern without changing edit focus.
- Pattern Playback Readout: a compact Pattern editor status line summarizes selected editing Pattern, audible Pattern, and event counts from local playback snapshots and Pattern A/B/C data without changing edit focus.
- Pattern DNA: read-only selected Pattern A/B/C layer, density, variation-signal, and arrangement-use summary derived from local Pattern A/B/C event data and arrangement blocks so beginners can understand the loop and producers can scan edit posture.
- Pattern DNA Focus: UI-local Focus controls that route Layers, Density, Variation, and Arrangement DNA cards to matching Compose or Arrange panels so users can correct a loop faster without changing Pattern DNA derivation or project data.
- Instrument panel: built-in drum kit, synth 808, simple synth, chord synth, effects, Drum Kit Pads with local Drum Kit Preview and Result for built-in drum tone posture, Sound Focus Pads with a local Sound Focus Preview and Result, and sound-design controls; sampler entry points belong only to the later optional sampling extension.
- Arrangement view: editable pattern blocks placed into intro, verse, hook, bridge, and outro structures, with selected-block role readout, Arrangement Playback Readout for edit-versus-audible block context, Arrangement Playhead Highlighting across Arrangement Track, Section Locator Pads, and Song Form Overview from local playback snapshots, Arrangement Arc Pads with local Arrangement Arc Preview for full-song energy shaping, Section Locator Pads for Intro/Verse/Hook/Bridge/Outro block cueing, Arrangement Focus presets with local Arrangement Focus Preview and Result, Pattern Chain 8-bar sketches, per-step A/B/C chain cycling, Chain Expand song-form outlining, one-click Drop/Build/Hook Lift moves, per-block bar lengths, selected-block copy/paste, split/merge controls, arrangement templates plus duplicate, move, and delete controls.
- Project readiness: read-only checks for drums, 808/bass, melody/chords, arrangement, and export completeness.
- Beat Passport: compact read-only target, length, Pattern A/B/C, readiness, export, stem, and master posture summary from local project/render state.
- Beat Passport Focus: UI-local Focus controls that route target, length, Pattern A/B/C, readiness, export, stems, and master posture diagnostics to Compose, Arrange, Master, or Deliver panels so users can move from beat identity scan to the relevant workstation surface without changing passport scoring or project data.
- Production Snapshot: local read-only target, song form, Pattern A/B/C coverage, mix, and handoff posture summary for fast producer session scanning and beginner next-step judgment.
- Production Snapshot Focus: UI-local Focus controls that route target, form, Pattern A/B/C coverage, mix, and handoff diagnostics to Compose, Arrange, Mix, or Deliver panels so users can move from session scan to the relevant workstation surface without changing snapshot scoring or project data.
- Finish Checklist: read-only Compose, Arrange, Mix, Master, and Handoff readiness scan from local project, render, stem, target, and Session Brief state.
- Finish Checklist Focus: UI-local Focus controls that route Compose, Arrange, Mix, Master, and Handoff readiness cards to matching panels so users can run a guided finish pass without changing checklist scoring or project data.
- Review Queue: read-only prioritized production issue scan from local readiness, structure, mix, master, target, stem, and Session Brief state.
- Review Queue Focus: UI-local Focus controls that route queued issues to Compose, Arrange, Mix, Master, or Deliver panels so users can triage problems without changing issue priority, scoring, or project data.
- Export Preflight: read-only delivery-risk scan of readiness, mix/master posture, WAV/stem/MIDI deliverables, and handoff brief status so beginners know what blocks a clean export and producers can check send risk quickly.
- Export Preflight Focus: UI-local Focus controls that route readiness, mix/master, deliverables, and handoff risks to Compose, Master, or Deliver panels so users can fix delivery blockers without changing export scoring, files, renders, or project data.
- Handoff Pack: explicit WAV, stem, MIDI, and Handoff Sheet export buttons with local deliverable status, a handoff route readout, and a file manifest preview for final beat delivery.
- Handoff Pack Send Order: UI-local next-step readout that derives the delivery sequence from existing Handoff Pack statuses so beginners know which explicit export to handle next and producers can scan the package order without auto-exporting or changing files.
- Handoff Export Receipt: UI-local latest-result readout inside Handoff Pack that records the most recent explicit WAV, stem, MIDI, or Handoff Sheet export action so beginners can identify the downloaded file and producers can confirm delivery output without changing export behavior.
- Beat Map: deterministic production overview that maps the current beat into Start, Compose, Arrange, Polish, and Deliver stages against the selected fixed or custom Delivery Target, plus song length, Pattern A/B/C usage, export, and stem metrics for faster beginner and producer decisions.
- Structure Lens: read-only arrangement quality view for target fit, section coverage, hook contrast, and energy arc, with explicit local buttons for existing arrangement moves.
- Song Form Overview: compact visual arrangement map for section flow, Pattern A/B/C usage, bar ranges, energy, muted-track posture, selected-block navigation, and realtime playing-block context without rewriting arrangement data.
- Next Move: explicit local action recommendations that connect readiness/export state to Blueprint, target alignment, Pattern Fill, Pattern Chain, Hook Lift, Master Finish, Save Slot, and Mix Check commands, then show a UI-only local result strip with one changed metric, audition cue, and next check.
- Mix Coach Focus: UI-local card focus and compact readout derived from existing deterministic Mix Coach checks so Mix Check points users to the relevant headroom, limiter, stem balance, or low-end issue without changing scoring or auto-fixing the mix.
- Mix Fix Preview and Result: UI-local readouts for the suggested explicit Headroom, Stem Balance, or Low End fix before Apply, then applied scope, before/after export, headroom, stem, low-end, and editable-control posture, audition cue, and next check after explicit fix clicks without changing mixer/master state outside the clicked fix.
- Quick Actions: searchable local command palette for transport, project, creative, arrangement, mix, master finish, and export actions, with a UI-only post-run result strip that shows command status, one local metric, audition cue, and next check.
- Quick Actions Scope Filters: UI-local All, Transport, Compose, Arrange, Mix, Master, Project, and Export filters with live command counts so beginners can narrow the command palette and producers can jump faster without changing command execution or search semantics.
- Quick Actions Spotlight: UI-local readout that shows current scope/search context and the first runnable command targeted by Enter so beginners can run commands confidently and producers can execute filtered actions faster without changing command ranking or execution.
- Project snapshots: local idea slots for saving, renaming, restoring, and deleting beat states inside the project file, with a slot role readout for save/compare readiness.
- Snapshot Compare: local read-only comparison of the current beat against saved Project Snapshots by setup, arrangement length, readiness, export, stems, and master posture.
- Mixer/master: volume, pan, mute, solo, mixer channel role readouts, Stem Audition Pads for Full Mix/Drums/808/Synth/Chords solo checks, Mix Balance Pads with local Mix Balance Preview and Result for one-click editable rough balance, channel low-cut/air EQ, Drive/Glue mix controls, built-in Space send FX, per-stem export level meters, deterministic Mix Coach checks, explicit Mix Fix actions with local Mix Fix Result feedback, Master Finish Pads with local Master Finish Preview and Result for editable demo/vocal/store/club output posture, master preset ceiling, master output role readout, limiter, loudness/peak metering.
- Master Finish Preview and Result: UI-local readout for the suggested finish pad's pre-click preset, ceiling, output gain, and finish-move count, plus a post-click result for applied preset, ceiling, output gain, audition cue, and next check so users can verify output posture without platform loudness claims.
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

This is the core MVP event union. Drafts must not add `AudioClipEvent` beside `NoteEvent`, `DrumHitEvent`, and `AutomationEvent` unless an optional-sampling phase has been explicitly approved. If an external brief includes `AudioClipEvent` in `MusicalEvent`, rewrite it as an optional extension example instead of copying it into the core schema.

Audio clip events belong to a later extension model. A project must be able to produce a complete beat with only drum, bass, synth, chord, automation, mixer, and master data.

When product docs use the word clip before the sampling phase, it means a pattern, MIDI, or automation container. It must not imply that imported audio clips are required for the core workflow.

## MVP Scope

The MVP must prove this sentence:

```text
샘플 없이도 8마디 비트를 만들고 WAV로 export할 수 있어야 한다.
```

This sentence is the MVP proof.

MVP capabilities:

- BPM/key setup, including Tap Tempo and Tempo Nudge Pads for explicit click-to-set, half-time, double-time, and +/-1 BPM changes.
- Key changes retarget Pattern A/B/C 808/bass, melody, and chord-root musical events so existing beats stay in the selected key.
- Style selector that applies key-aware editable groove templates for Trap, Drill, Boom Bap, Lo-fi, House, R&B, Jersey Club, Phonk, Garage, and Experimental Pattern A/B/C, BPM, swing, and sound preset.
- Style Inspector with Style Quick Picks that derive read-only BPM range, active/default swing, bass role, melody role, sound preset, and Pattern A/B/C event density from local style/profile/project data while applying styles through the existing undoable style-selection path.
- Style Inspector Focus derived from existing Style Inspector metrics and Pattern A/B/C density rows so users can click BPM, swing, bass, melody, sound, or density diagnostics into Transport, Compose, or Sound panels while keeping focus state UI-local and preserving style application.
- Key Compass derived from local key, selected Pattern A/B/C chord events, 808/bass notes, melody notes, selected note, and selected chord state so beginners can see safe scale notes and focus degrees while producers can inspect harmonic posture without changing the beat.
- Key Compass Focus derived from existing Key Compass cards so users can click scale, chord, 808/bass, melody, or selected-note/selected-chord diagnostics into the Compose panel while keeping focus state UI-local and preserving key retargeting plus direct note/chord editing.
- Groove Compass derived from local selected Pattern A/B/C drum pattern, velocity, microtiming, probability, and hat repeat data so beginners can understand drum foundation and producers can inspect pocket without changing the beat.
- Groove Compass Focus derived from existing Groove Compass cards so users can click density, anchors, hat motion, timing, chance, or selected-drum diagnostics into the Compose panel while keeping focus state UI-local and preserving direct drum editing, selected drum state, playback, and export behavior.
- Composer Guide derived from local selected Pattern A/B/C drum hits, 808/bass notes, chord events, melody notes, arrangement length, Delivery Target, deterministic export analysis, and deterministic stem analysis so beginners can identify the next writing focus while producers can scan composition gaps without changing the beat.
- Composer Guide Focus derived from existing Composer Guide cards so users can click Drums, 808/Bass, Harmony, Melody, Arrange, and Finish guidance into matching panels while keeping focus state UI-local and out of saved project data.
- Mode Focus derived from existing local Composer Guide, Beat Map, Review Queue, and Finish Checklist summaries so Guided mode highlights stage/focus/check for beginners and Studio mode highlights session scan/top issue/handoff posture for producers without mutating the beat.
- Mode Focus Jump derived from existing Mode Focus cards, Beat Map stage ids, Composer Guide focus targets, Finish Checklist focus targets, and Review Queue focus targets so users can jump from Guided/Studio focus cards to Compose, Arrange, Mix, Master, or Deliver panels while keeping jump state UI-local and preserving all scoring and project data.
- Workflow Navigator derived from local Beat Map, Export Preflight, selected Pattern A/B/C, arrangement length, and export status so users can jump to Compose, Arrange, Mix, and Deliver sections without mutating project data or hiding controls.
- Workflow Spotlight derived only from visible Workflow Navigator items so users can see the first blocker or review zone, exact jump target, and ready/review/blocker counts while preserving navigator item order, jump behavior, scoring, and project data.
- Composer Actions derived from local Composer Guide, selected style profile, Beat Readiness, Delivery Target, deterministic export analysis, and deterministic stem analysis state so users can preview scope, impact, and undo posture before explicitly clicking style-prioritized writing moves for drums, 808/bass, harmony, melody, arrangement, and finish flow through existing undoable handlers, then read a UI-only local result strip with updated metrics, audition cues, and next checks without hidden generation.
- Beat Blueprints that preview and apply complete sample-free project starts across style, key, BPM, Pattern A/B/C events, arrangement template, sound preset, mixer balance, and master preset while preserving manual editing.
- 16-step drum sequencer with built-in drum kit, drum-synth sources, editable drum velocity, Drum Foundation Pads, Groove Feel Pads, Drum Accent Pads, local Drum Move Preview and Result, probability, visible chance badges, microtiming, selected-drum pocket readout, one-click groove humanization, hat repeat dynamics, and selected-drum copy/paste hit tools.
- Synth 808/bass track with editable scale-aware grid, 808 Bassline Pads, 808 Glide Pads, 808 Contour Pads, local 808 Move Preview and Result, Desktop Keyboard Capture degree labels, command-strip posture readout, octave, length, and glide defaults, mono mode, glide, note chance badges, selected-note degree/role readout, selected-note move/transpose/copy/paste/duplicate tools, saturation direction, and kick-to-808 sidechain ducking.
- Chord progression track with scale-locked roots, Chord Playhead Highlighting from local playback snapshots, key-aware Chord Pads, Chord Rhythm Pads, Chord Voicing Pads, local Chord Move Preview and Result, key-aware progression presets, editable step/root/quality/inversion/length/velocity/chance, visible chance badges, selected-chord harmonic readout, add/delete controls, and selected-chord move/copy/paste/duplicate/inversion tools.
- Simple synth melody track with editable scale-aware grid, Melody Motif Pads, Melody Accent Pads, Melody Contour Pads, local Melody Move Preview and Result, Desktop Keyboard Capture degree labels, command-strip posture readout, octave, length, and velocity defaults, velocity control, note chance badges, selected-note degree/role readout, and selected-note move/transpose/copy/paste/duplicate tools.
- Sound design presets, Drum Kit Pads with local Drum Kit Preview and Result for one-click built-in kick/clap/hat tone posture, Sound Focus Pads with a local Sound Focus Preview and Result, and Studio tone controls for kick punch, snare snap, hat brightness, 808 drive/decay, sidechain ducking, synth brightness/release, and chord warmth/width.
- Independent Pattern A/B/C storage with Pattern Compare cue/use cards for density and arrangement-use decisions, Pattern Clone Pads for one-click clone-and-vary moves into another slot, Pattern Stack Pads for one-click 808/chord/Synth sketches with local Pattern Stack Preview and Result, Drum Foundation Pads for editable rhythm foundations, Groove Feel Pads for editable timing/chance feel, Drum Accent Pads for editable velocity shape, local Drum Move Preview and Result, deterministic Subtle/Hook/Break variation tools, one-click Drum Fill/808 Pickup/Melody Turn/Clear Tail moves, plus copy/clear tools for drum, bass, chord, and melody variations.
- Pattern DNA derived from the selected Pattern A/B/C drum hits, 808/bass notes, chord events, melody notes, probability, timing, velocity, hat-repeat, glide, and arrangement-block usage so users can scan layers, density, variation, and song placement without changing the beat.
- Pattern DNA Focus derived from existing Pattern DNA card ids so users can click Layers, Density, Variation, or Arrangement DNA into the matching Compose or Arrange panel while keeping focus state UI-local and preserving Pattern DNA derivation.
- Read-only Beat Readiness checks for drums, 808/bass, melody/chords, arrangement structure, and export signal status.
- Delivery Targets stored in project state with safe migration for older files; setting a fixed or custom target changes only the target, editable custom fields stay bounded in local project data, and explicit target alignment can update arrangement template, master preset, master ceiling, and mix posture through undoable project history.
- Delivery Target Alignment Preview and Result derived from current local project state, the selected active Delivery Target, and explicit Align before/after state so users can see target fit, bar length, master preset, mix posture, stem expectation, changed alignment impact, audition cue, and next check without storing UI feedback in project data.
- Session Brief stored in local project state with bounded artist, vibe, reference, and notes text plus a UI-only role readout so beginners can clarify intent and producers can keep handoff context without media uploads or cloud collaboration.
- Beat Passport summary derived from local project state, Beat Readiness, export analysis, stem analysis, Delivery Target, and master posture so beginners and producers can scan target, length, Pattern A/B/C use, readiness, export, stems, and master state without changing the beat.
- Beat Passport Focus derived from existing Beat Passport metrics so users can click target, length, Pattern A/B/C, readiness, export, stems, or master posture diagnostics into the matching Compose, Arrange, Master, or Deliver panel while keeping focus state UI-local and preserving passport scoring.
- Production Snapshot derived from local project state, Beat Readiness, arrangement blocks, Pattern A/B/C event data, deterministic export analysis, deterministic stem analysis, selected Delivery Target, Mix Coach checks, and Session Brief so producers can scan target, form, patterns, mix, and handoff posture while beginners see what matters next without changing the beat.
- Production Snapshot Focus derived from existing Production Snapshot metrics so users can click target, form, Pattern A/B/C coverage, mix, or handoff diagnostics into the matching Compose, Arrange, Mix, or Deliver panel while keeping focus state UI-local and preserving snapshot scoring.
- Finish Checklist derived from local project state, Beat Readiness, Structure Lens posture, Mix Coach checks, export analysis, stem analysis, Delivery Target, and Session Brief so users can review Compose, Arrange, Mix, Master, and Handoff readiness without changing the beat.
- Finish Checklist Focus derived from existing Finish Checklist cards so users can click Compose, Arrange, Mix, Master, and Handoff readiness into matching panels while keeping focus state UI-local and out of saved project data.
- Review Queue derived from local project state, Beat Readiness, Structure Lens signals, Mix Coach checks, export analysis, stem analysis, Delivery Target, and Session Brief so users can scan the top production issues without changing the beat.
- Export Preflight derived from local Beat Readiness, deterministic export analysis, deterministic stem analysis, selected Delivery Target, arrangement length, and Session Brief so users can scan readiness, mix/master, WAV/stem/MIDI deliverables, and handoff brief risk before export without changing files or project data.
- Export Preflight Focus derived from existing Export Preflight cards so users can click readiness, mix/master, deliverables, or handoff risks into matching Compose, Master, or Deliver panels while keeping focus state UI-local and preserving export/render/file behavior.
- Handoff Pack surface that groups explicit full-mix WAV, stem WAV, arrangement MIDI, and Handoff Sheet export actions with status, handoff route readout, and a UI-local file manifest preview derived from local project state, selected Delivery Target, Session Brief, and deterministic export/stem analysis.
- Handoff Pack Send Order derived from existing Handoff Pack item statuses so users can see the next non-ready deliverable and the WAV -> Stems -> MIDI -> Sheet sequence while preserving explicit export clicks, file names, file contents, renders, downloads, and project data.
- Handoff Export Receipt derived only after explicit Handoff Pack or Quick Action export clicks so users can see the latest downloaded WAV, stem count, MIDI file, or Handoff Sheet filename while preserving export handlers, file names, file contents, renders, downloads, and project data.
- Beat Map production overview derived from local project, selected fixed or custom Delivery Target, Beat Readiness, export analysis, and stem analysis state, showing beginner workflow stages, producer-facing song/pattern/export/stem metrics, and explicit local action buttons without mutating project state unless clicked.
- Structure Lens derived from local arrangement blocks and selected Delivery Target, showing target fit, section coverage, hook contrast, and energy arc while routing explicit action buttons through existing undoable arrangement paths.
- Song Form Overview derived from local arrangement blocks, Pattern A/B/C event data, and realtime playback snapshots, showing section flow, pattern usage, selected block, currently playing block, energy range, per-block bar spans, muted tracks, and navigation buttons that select existing arrangement blocks without creating undo history or mutating arrangement data.
- Next Move strip that gives one primary recommended action and secondary local actions from the current readiness/export state, including target alignment, Pattern Compare, Pattern Chain when arrangement structure is weak, and Master Finish when export posture needs a final target, then shows UI-only local result metrics, audition cues, and next checks after explicit clicks without mutating Beat Readiness.
- Editable arrangement blocks and templates for 8-bar loop, full beat, hook-first, and breakdown structures, using assigned Pattern A/B/C data, selected-block role readout, Arrangement Playback Readout, Arrangement Playhead Highlighting across Arrangement Track, Section Locator Pads, and Song Form Overview, Arrangement Arc Pads with local Arrangement Arc Preview for one-click full-song energy/section posture, Section Locator Pads that cue the first Intro/Verse/Hook/Bridge/Outro block as the current Block loop without rewriting arrangement data, Arrangement Focus presets with local Arrangement Focus Preview and Result, one-click Drop/Build/Hook Lift moves, per-block track mutes, per-block bar length, selected-block copy/paste, split/merge controls, audible per-block energy, and structure controls for duplicate, move, and delete.
- Pattern Chain presets with local Pattern Chain Preview, per-step A/B/C cycling, and Chain Expand song-form outlining that edit only arrangement block assignments while preserving Pattern A/B/C musical event data, mixer state, sound design, master state, and existing export paths.
- Undo/redo edit history for project-level pattern, arrangement, mixer, sound, and master changes, with a UI-local command-strip readout for undo/redo depth.
- Local draft recovery that writes a bounded versioned project JSON draft to renderer localStorage after project edits, shows a UI-local project safety readout that distinguishes local draft safety, current file identity, unsaved edits, and durable `.grooveforge.json` saves, then shows explicit Restore Draft and Clear Draft controls on the next session without replacing `.grooveforge.json` Save/Open.
- Project Snapshots that save, rename, restore, and delete local beat idea states inside the `.grooveforge.json` file, plus a UI-local slot role readout for save/compare readiness, without cloud sync or nested snapshot recursion.
- Snapshot Compare derived from local current project state and saved Project Snapshot payloads so users can compare setup, arrangement length, readiness, export, stems, and master posture without restoring, deleting, renaming, saving, or mutating the beat.
- Desktop editing shortcuts, Keyboard Capture, and Quick Actions command search for arrangement playback, Pattern A/B/C selection, selected drum/note deletion, save, open, undo, redo, snapshots, blueprints, pattern fills, Arrangement Focus, mix fixes, master finish, and export while leaving focused inputs alone, then showing UI-only local result metrics, audition cues, and next checks after explicit command clicks.
- Quick Actions Scope Filters derived from existing command groups and ids so users can narrow command discovery to All, Transport, Compose, Arrange, Mix, Master, Project, or Export while keeping scope state UI-local and preserving explicit command execution.
- Quick Actions Spotlight derived from filtered visible commands, current scope, scope counts, search query, and the first runnable action so users can see the exact Enter target while preserving search matching, command order, explicit clicks, Enter behavior, result strips, and project data.
- Transport playback modes for full arrangement playback by default, selected-block loop audition, and fast selected-pattern preview while editing.
- Transport Position Readout derived from local playback snapshots and selected loop state, showing Bar/Beat/Step, section, Pattern A/B/C, and Song/Block/Pattern loop scope without mutating project data.
- Pattern-aware editor playheads derived from local playback snapshots and selected Pattern A/B/C state, showing drum, 808, Synth, and Chord editor highlights only when the playing Pattern matches the selected editing Pattern without mutating project data.
- Playing Pattern Tabs derived from local playback snapshots, showing the audible Pattern A/B/C separately from the selected editing Pattern without mutating project data or changing edit focus.
- Pattern Playback Readout derived from local playback snapshots, selected Pattern A/B/C, and Pattern event counts, showing edit-versus-audible Pattern context without mutating project data or changing edit focus.
- Arrangement Playback Readout derived from local playback snapshots and selected arrangement block state, showing edit-versus-audible block context without mutating project data or changing edit focus.
- Tap Tempo that averages recent explicit clicks into a bounded project BPM through undoable project history without audio input, hidden beat detection, or tempo automation.
- Tempo Nudge Pads that apply -1, +1, half-time, and double-time BPM moves through explicit undoable project history while resetting UI-local Tap Tempo state.
- Realtime metronome toggle with accented downbeat clicks that helps users program to the grid during playback without adding click audio to WAV or stem export.
- Live playback reads the current project while scheduling future steps, so selected-pattern preview, arrangement block edits, arrangement track mutes, arrangement length, arrangement energy, BPM, mixer, sound, and master changes can be heard without stopping and restarting.
- Mixer volume, pan, mute, solo, mixer channel role readouts, Stem Audition Pads that explicitly set Full Mix/Drums/808/Synth/Chords audition through existing mixer solo/mute state, Mix Balance Pads with local Mix Balance Preview and Result, low-cut/air EQ, Drive/Glue mix controls, built-in Space send FX, per-stem export level meters, deterministic Mix Coach checks, explicit Headroom/Stem Balance/Low End Mix Fix actions with local Mix Fix Result, Master Finish Pads with local Master Finish Preview and Result, and master output role readout reflected in deterministic render feedback.
- Mix Fix Preview and Result derived from current local project state, deterministic export analysis, deterministic stem analysis, and existing Mix Fix actions, showing suggested fix scope, issue detail, and move count before Apply, then applied fix, scope, before/after posture, audition cue, and next check after explicit clicks without mutating project data beyond the clicked fix.
- Stem Audition Readout derived from local mixer solo/mute state, showing Full Mix, soloed stem, or manual custom audition context without mutating mixer, playback, export, or project data.
- Master preset ceiling, Master Finish Pads with local Master Finish Preview and Result, master output role readout, and output gain.
- Master Finish Preview and Result derived from current local master state and existing Master Finish pad options, showing suggested pad, preset, ceiling, output gain, and finish-move count before Apply, then applied preset, ceiling, output gain, audition cue, and next check after explicit pad clicks without mutating project data outside the clicked Master Finish move.
- Reproducible export peak/RMS/headroom meter with limiter activity status for the current arrangement.
- Local project save/load as a `.grooveforge.json` file, with UI-local current-file identity and unsaved-edit status.
- Local draft recovery as a session-loss safety net only, with a UI-local project safety readout; explicit project files remain the durable save/load workflow.
- WAV export through deterministic offline rendering.
- Stem export through deterministic offline rendering for isolated drum, 808, synth, and chord WAV files from the current arrangement.
- MIDI export as a deterministic Standard MIDI File with drum, 808, synth, and chord tracks from the current arrangement.
- Handoff Sheet export as a local plain text summary of title, BPM/key/style, Delivery Target, Session Brief, arrangement blocks, export meter, and stem meter data without media upload or compliance claims.

## Roadmap

Phase 0 validates the audio scheduler: BPM clock, Tap Tempo helper, Tempo Nudge Pads, Transport Position Readout, tick/bar/beat math, play/stop/loop, metronome, and simple kick playback.

Phase 1 builds the drum sequencer: 16/32-step grid, kick/snare/clap/hat lanes, velocity, swing, pattern save/load, and hat repeat.

Phase 2 builds 808/bass: monophonic synth, piano-roll style editor, 808 Bassline Pads, 808 Glide Pads, 808 Contour Pads, local 808 Move Preview and Result, glide, pitch envelope, saturation, and sidechain ducking prototype.

Phase 3 adds melody/chords: simple poly synth, scale lock, Melody Motif Pads, Melody Accent Pads, Keyboard Capture for 808/Synth note entry, key-aware Chord Pads, Chord Rhythm Pads, chord progression presets, chord add/delete tools, selected-chord move/copy/paste/duplicate/inversion tools, melody grid, and preset patches.

Phase 4 adds arrangement and editing speed: pattern blocks, song section markers, per-block bar lengths, arrangement templates, duplicate/move/delete, selected-block copy/paste, split/merge controls, desktop editing shortcuts, then deeper mute/reorder refinements, and variation A/B/C.

Phase 5 adds mixer/master/export: volume, pan, mute, solo, mixer channel role readouts, Mix Balance Pads with local Mix Balance Preview and Result, channel low-cut/air EQ, Drive/Glue mix controls, built-in Space send FX, per-stem export level meters, deterministic Mix Coach checks with local Mix Fix Result, Master Finish Pads with local Master Finish Preview and Result, master preset ceiling, master output role readout first, then limiter, peak/LUFS metering, WAV export, stem export, and MIDI export.

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

- Do not make sample chop/import the MVP center or describe GrooveForge as a sampling app.
- Do not put sample import, chopping, sampler tracks, audio warping, or sampler setup ahead of direct beat composition unless the work is explicitly in the optional sampling phase.
- Do not build plugin hosting before the local synth/mixer/export loop is working.
- Do not add AI audio generation before editable pattern generation exists.
- Do not add cloud collaboration, accounts, payments, trackers, or remote AI calls without explicit rationale.
- Do not claim mastering is an automatic fix for a bad mix. Mixing and mastering remain separate product stages.

## Product Constraints

- Web-first MVP should assume browser audio constraints: user gesture requirements, device variability, scheduling precision limits, and offline render validation.
- Imported samples, exported stems, and project files can contain copyrighted or private material. Do not commit real user audio fixtures.
- Loudness presets are targets and measurement aids, not guarantees that a beat is platform-approved.
- VST3/AU/plugin hosting belongs to a later native/pro roadmap after the web MVP proves the core workflow.
