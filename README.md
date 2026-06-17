
# GrooveForge

GrooveForge is a desktop-ready, web-first, event-based mini DAW for making beats across genres: pattern programming, drums, 808/bass, melody/chords, sound design, arrangement, mixing, mastering, Session Brief, Space send FX, MIDI export, and WAV/stem export. It opens on direct beat composition with built-in instruments and editable musical events, so the first read is a beat workstation built around making music directly.

Project type: `web-first TypeScript mini DAW / beat workstation`.

This repository includes an agent-readable project base: concise root docs, durable project knowledge under `docs/`, and a local harness under `harness/`.

Agent team: `Team Forge`. See `AGENTS.md`.

## Product Spine

Concept lock: GrooveForge is an all-genre beat-production mini DAW for directly composing beats, designing sounds, arranging sections, mixing/mastering, and exporting finished audio. In the user's terms, it is "비트(모든 장르)를 만드는" app and "직접 비트를 작곡하고 사운드를 설계하고 믹싱/마스터링까지 하는 비트 제작 미니 DAW." This sentence is the anchor for every plan and product draft.

GrooveForge is a code-driven all-genre beat workstation with a programmable project format and style engine. Direct composition is the product spine: users should be able to program drums, 808/bass, melody, chords, FX, and automation as editable musical events, shape built-in instruments, arrange a song section, mix/master it, and export audio from built-in instruments alone. The product center is Pattern Programming, Drum Sequencing, 808/Bass Synthesis, Melody/Chord Composition, Sound Design, Arrangement, Mixing, Mastering, and Export.

The first-run experience should feel like opening a compact beat-making DAW: choose BPM/key/style, write drums, build 808/bass, add melody/chords, shape sounds, arrange, mix, master, then export.

Genre breadth is part of the core. Trap, drill, boom bap, lo-fi, house, R&B, jersey club, phonk, garage, and experimental starts should come from editable style profiles, built-in instruments, and musical events.

The core flow is:

```text
BPM/key/style -> pattern programming -> drums -> 808/bass -> melody/chords -> sound design -> arrangement -> mixing -> mastering -> export
```

Extension boundary: Sampling is subordinate and opt-in. After the core beat-making loop works, a future module may add audio import, chopping/slicing, pitch/stretch, one-shot mapping, or sampler instruments. It must attach as an optional sound source inside the workstation. A complete GrooveForge beat must still be possible with no imported audio.

Concept audit rule: do not read any sampling reference as the main workflow. Sampling is an accessory module, not the app category. If a draft starts from sample import, sample browsing, chopping, loop stretching, one-shot mapping, sampler setup, or lists a sampler as a default instrument-panel item, it is out of alignment until it is explicitly labeled optional sampling-phase work.

Core model rule: do not copy optional sampling examples into the MVP data model. The core project starts from editable notes, drum hits, automation, pattern/MIDI clips, built-in instruments, arrangement, mixer/master, and export; `AudioClipEvent`, `audio`, and `sampler` belong only to an explicitly approved optional sampling phase.

Drafting rule: the default empty project, first visible actions, MVP proof, primary navigation, default instrument panel, and new plan titles should lead with editable musical events, built-in drum rack, synth 808/bass, synth/chord instruments, FX, and beat-making controls. Do not present optional sampling as a co-equal product spine.

## MVP Target

The first usable result is an Electron desktop workstation that can create a sample-free 8-bar beat in any supported style profile and export it as WAV:

- 145 BPM / F minor starter project.
- Key changes that retarget Pattern A/B/C 808, synth, and chord-root event data instead of only changing the project label.
- Style selector that applies editable genre groove templates for Trap, Drill, Boom Bap, Lo-fi, House, R&B, Jersey Club, Phonk, Garage, and Experimental Pattern A/B/C, BPM, swing, and sound preset.
- Style Inspector with Style Quick Picks that explain and apply each genre's BPM range, active/default swing, bass role, melody role, sound preset, and Pattern A/B/C event density from local project data.
- Style Inspector Focus adds explicit Focus controls that jump BPM, swing, bass, melody, sound, and Pattern A/B/C density diagnostics to the matching Transport, Compose, or Sound panels without changing style application or project data.
- Key Compass for local read-only scale notes, chord motion, 808/bass posture, melody posture, and selected-note or selected-chord focus so beginners can compose inside the key and producers can scan harmony quickly.
- Key Compass Focus adds explicit Focus controls that jump scale, chord, 808/bass, melody, and selected-note or selected-chord diagnostics to the Compose panel without changing key retargeting, note/chord editing, or project data.
- Groove Compass for local read-only selected-pattern drum density, kick/clap anchors, hat motion, timing feel, chance posture, and selected drum focus so beginners can understand groove foundations and producers can scan pocket quickly.
- Groove Compass Focus adds explicit Focus controls that jump density, anchors, hat motion, timing, chance, and selected-drum diagnostics to the Compose panel without changing drum editing, selected drum state, playback, or project data.
- Composer Guide for local read-only drums, 808/bass, harmony, melody, arrangement, and finish posture so beginners know the next writing focus and producers can scan missing layers quickly.
- Composer Guide Focus adds explicit Focus controls that jump Drums, 808/Bass, Harmony, Melody, Arrange, and Finish guidance cards to the matching workstation panels without changing guide scoring or project data.
- Mode Focus strip that makes Guided mode show current stage, writing focus, and local check while Studio mode shows session scan, top review issue, and handoff posture from existing local project analysis.
- Mode Focus Jump adds explicit UI-local Jump controls from Guided/Studio focus cards to the matching Compose, Arrange, Mix, Master, or Deliver panels without changing focus scoring or project data.
- First Beat Path shows a UI-local setup, compose, arrange, mix, and deliver progression from existing workflow/readiness/export signals so beginners know the next direct beat-making step and producers can scan session posture quickly.
- Beat Spine shows a UI-local sample-free core readout for Setup, Drums, 808/Bass, Harmony, Melody, Sound, Arrange, and Finish, deriving only from existing local project/readiness/export data and routing explicit clicks to existing workstation panels without changing project data.
- Session Pass combines First Beat Path, Review Queue, Finish Checklist, and Export Preflight into Guided, Studio, Finish, and Delivery focus cards that jump to existing workstation panels without changing project data.
- Workflow Navigator for local UI-only Compose, Arrange, Mix, and Deliver jump controls so beginners can follow the beat-making path and producers can move quickly across the dense workstation.
- Workflow Spotlight shows the first Compose, Arrange, Mix, or Deliver zone needing attention plus ready/review/blocker counts from the visible Workflow Navigator items without changing jump behavior or project data.
- Native Command Menu adds Electron File, Edit, Transport, View, Window, and Help menus that route Open, Save, Undo, Redo, Quick Actions, Play/Stop, and selected-event deletion into existing renderer handlers without changing project schema or adding global OS automation.
- Style-aware Composer Actions for explicit local writing moves with inline scope, impact, and undo previews plus a post-click local result strip showing updated beat metrics, audition cues, and next checks, routing Composer Guide focus into existing undoable Drum Foundation, 808 Bassline, Chord Progression, Melody Motif, Pattern Fill, Pattern Chain, arrangement template, and Master Finish paths without sampling or hidden generation.
- Beat Blueprints for sample-free project starts with local Preview and Result feedback for style, key, BPM, arrangement, sound, and master changes before/after explicit Apply, while applied projects stay fully editable.
- Kick, snare/clap, hat, 808, chord, and synth melody tracks with editable drum velocity, Drum Foundation Pads for one-click kick/clap/hat/perc foundations, Groove Feel Pads for editable timing/chance feel, Drum Accent Pads, a local Drum Move Preview and Result for one-click rhythm/timing/chance/velocity shaping, event chance, chance badges, microtiming, one-click groove humanization, hat repeat dynamics, selected-drum pocket readout plus copy/paste hit tools, 808 Bassline Pads, 808 Glide Pads for one-click length/glide/chance shaping, 808 Contour Pads, and a local 808 Move Preview and Result for one-click low-end rhythm/glide/contour shaping, Desktop Keyboard Capture for scale-locked 808/Synth note entry with a degree-labeled key map, command-strip posture readout, plus UI-local octave, length, Synth velocity, and 808 glide defaults, Melody Motif Pads, Melody Accent Pads, Melody Contour Pads, and a local Melody Move Preview and Result for one-click Synth phrase direction/velocity/chance shaping, plus selected-note degree/role readout and move/transpose/copy/paste/duplicate tools.
- Web MIDI Input adds explicit local MIDI keyboard/controller note capture for the selected 808 or Synth target, maps Note On messages to scale-locked Pattern A/B/C notes through existing Keyboard Capture defaults, and never requests System Exclusive access or records audio.
- Key-aware chord progression presets with Chord Playhead Highlighting, Chord Pads, Chord Rhythm Pads, and Chord Voicing Pads with a local Chord Move Preview and Result for one-click chord color, inversion, length, velocity, and chance shaping, chord add/delete, selected-chord harmonic readout plus move/copy/paste/duplicate/inversion tools, and per-chord chance controls for fast harmonic sketching.
- Sound presets with local Sound Preset Preview and Result for explicit full-tone preset audition before Apply, Drum Kit Pads with local Drum Kit Preview and Result for one-click built-in kick/clap/hat tone posture, Sound Focus Pads with a local Sound Focus Preview and Result, and Studio tone controls for built-in drum, 808, kick-duck sidechain, synth, and chord engines.
- Delivery Targets for starter sketch, vocal session, beat-store demo, club demo, and one editable custom outcome, with explicit target alignment for arrangement length, master preset, and mix posture.
- Delivery Target Alignment Preview and Result show the selected target's pre-click Align outcome and post-click applied alignment across target fit, bar length, master posture, mix posture, and stem expectation without storing UI feedback in project data.
- Session Brief for bounded local artist, vibe, reference, and handoff notes stored in the project file, with a role readout and Starter Pads that fill blank brief fields from local style/target context so beginners can start a useful handoff and producers can standardize delivery notes.
- Independent Pattern A/B/C variations with Pattern Compare cue/use cards, Pattern Clone Pads for one-click clone-and-vary moves into another slot, Pattern Stack Pads for one-click 808/chord/Synth sketches with a local Pattern Stack Preview and Result, Drum Foundation Pads for editable rhythm foundations, Groove Feel Pads for editable timing/chance feel, Drum Accent Pads for editable velocity shape, local Drum Move Preview and Result, deterministic Subtle/Hook/Break tools, one-click Drum Fill/808 Pickup/Melody Turn tail moves, copy/clear tools, and editable arrangement blocks with selected-block role readout, Arrangement Playback Readout, Arrangement Playhead Highlighting across Arrangement Track, Section Locator Pads, and Song Form Overview, Arrangement Arc Pads with local Arrangement Arc Preview and Result, Section Locator Pads for Intro/Verse/Hook/Bridge/Outro block cueing, Arrangement Focus presets with local Arrangement Focus Preview and Result, one-click Drop/Build/Hook Lift moves, per-track mutes, audible energy, bar length, selected-block copy/paste, split, merge, duplicate, move, and delete controls.
- Pattern DNA for a read-only selected Pattern A/B/C scan of layers, density, variation signals, and arrangement use so beginners can see what the loop contains and producers can inspect edit posture quickly.
- Pattern DNA Focus adds explicit Focus controls that jump Layers, Density, Variation, and Arrangement DNA cards to the matching Compose or Arrange workstation panels without changing Pattern DNA derivation or project data.
- Layer Starter Pads show selected Pattern Drums, 808, Chords, and Synth readiness, then route explicit clicks into existing style-aware Drum Foundation, 808 Bassline, Chord Progression, and Melody Motif paths without adding hidden generation.
- Pattern Chain presets with local Pattern Chain Preview and Result, an 8-step chain editor, and Chain Expand that turn Pattern A/B/C variations into editable arrangement sketches and longer song-form outlines.
- Read-only Beat Readiness checks for drums, 808, melody/chords, arrangement, and export completeness.
- Listening Pass turns local composition, arrangement, mix, and delivery state into practical audition checkpoints with Focus jumps only, so beginners know what to listen for and producers can scan the beat without audio analysis or sampling.
- Beat Passport summary for target, length, Pattern A/B/C use, readiness, export, stems, and master posture from local project/render state.
- Beat Passport Focus adds explicit Focus controls that jump target, length, Pattern A/B/C, readiness, export, stems, and master posture diagnostics to Compose, Arrange, Master, or Deliver panels without changing passport scoring or project data.
- Production Snapshot for local read-only target, form, Pattern A/B/C coverage, mix, and handoff posture so producers can scan a session fast and beginners can see what matters next.
- Production Snapshot Focus adds explicit Focus controls that jump target, form, Pattern A/B/C coverage, mix, and handoff diagnostics to Compose, Arrange, Mix, or Deliver panels without changing snapshot scoring or project data.
- Finish Checklist for local read-only Compose, Arrange, Mix, Master, and Handoff readiness before export.
- Finish Checklist Focus adds explicit Focus controls that jump Compose, Arrange, Mix, Master, and Handoff readiness cards to the matching workstation panels without changing checklist scoring or project data.
- Review Queue for local read-only prioritized production issues across composition, arrangement, mix/master, target, and handoff.
- Review Queue Focus adds explicit Focus controls that jump queued issues to Compose, Arrange, Mix, Master, or Deliver panels without changing issue priority or project data.
- Export Preflight for a read-only delivery-risk scan of readiness, mix/master posture, WAV/stem/MIDI deliverables, and handoff brief status before users export or send files.
- Export Preflight Focus adds explicit Focus controls that jump readiness, mix/master, deliverables, and handoff risks to Compose, Master, or Deliver panels without changing export scoring, files, renders, or project data.
- Handoff Pack panel that groups explicit WAV, stem, MIDI, and Handoff Sheet export actions with local deliverable status, handoff route readout, file manifest preview, and a UI-local Manifest Audit for planned file sets, latest receipt, and next missing delivery step.
- Handoff Pack Send Order adds a UI-local next-step readout for WAV, stems, MIDI, and Handoff Sheet delivery sequence without auto-exporting, rendering, downloading, or changing file contents.
- Handoff Export Receipt records the latest explicit WAV, stem, MIDI, or Handoff Sheet export result inside Handoff Pack without changing file names, file contents, render/download handlers, or project data.
- Beat Map production overview that uses the selected fixed or custom Delivery Target to show beginner workflow stages, producer-facing song/pattern/mix/stem metrics, and explicit local action buttons from the current project state.
- Structure Lens panel that checks target fit, section coverage, hook contrast, and energy arc from the current arrangement with explicit local arrangement actions.
- Song Form Overview for a compact visual map of sections, Pattern A/B/C usage, bar ranges, energy, muted tracks, selected arrangement block navigation, and realtime playing-block context.
- Next Move strip that turns readiness/export state into explicit local actions such as Blueprint, target alignment, Pattern Compare, Pattern Fill, Pattern Chain, Hook Lift, Master Finish, Save Slot, and Mix Check, then shows post-click local result metrics, audition cues, and next checks.
- Mix Coach Focus highlights the highest-priority Mix Coach card after Mix Check actions so users can inspect the relevant headroom, limiter, stem balance, or low-end issue without auto-fixing the mix.
- Mix Fix Preview and Result show the suggested explicit Headroom, Stem Balance, or Low End fix before Apply, then after explicit fix clicks show applied scope, before/after export, headroom, stem, low-end, and editable-control posture, audition cue, and next check without changing mixer/master state outside the clicked fix.
- Arrangement templates for 8-bar loop, full beat, hook-first, and breakdown song structures with local Arrangement Template Preview and Result for explicit section length feedback, plus Arrangement Arc Pads with local Arrangement Arc Preview and Result for one-click full-song energy shaping.
- Desktop editing shortcuts, Keyboard Capture, and Quick Actions command search for arrangement playback, Pattern A/B/C switching, selected event deletion, save, open, undo, redo, snapshots, blueprints, pattern fills, Arrangement Focus, mix fixes, master finish, and export, with post-run local result metrics, audition cues, and next checks after explicit command clicks.
- Quick Actions Scope Filters for UI-local All, Transport, Compose, Arrange, Mix, Master, Project, and Export command narrowing with live counts, while preserving explicit command clicks, search behavior, and project data.
- Quick Actions Spotlight shows the current scope/search context and the first runnable command that Enter will trigger without changing search order, scope counts, command handlers, or project data.
- Quick Actions Recent Commands keeps a UI-local, session-only list of the latest explicit command-palette actions with explicit rerun buttons, without changing command ranking, Enter behavior, shortcuts, or project files.
- Undo/redo edit history with a command-strip readout for undo/redo depth across pattern, arrangement, mixer, sound, and master experimentation.
- Local draft recovery that keeps a bounded browser/Electron renderer draft in localStorage, shows a project safety readout that distinguishes local draft safety, current file identity, unsaved edits, and durable `.grooveforge.json` saves, then shows explicit Restore Draft and Clear Draft controls on the next session without replacing `.grooveforge.json` Save/Open.
- Project Snapshots for local idea slots that can save, rename, restore, and delete beat states inside the project file, with a slot role readout for save/compare readiness.
- Snapshot Compare for local read-only comparison of the current beat against saved snapshots by setup, length, readiness, export, stems, and master posture.
- Realtime transport loop controls for Song, selected Block, and Pattern audition, with a command-strip Transport Position Readout for Bar/Beat/Step, section, pattern, and loop-scope context, plus Tap Tempo and Tempo Nudge Pads for click-to-set, half-time, double-time, and +/-1 BPM changes, and a metronome toggle with accented downbeat clicks for timing reference during arrangement or Pattern playback.
- Pattern-aware editor playheads keep drum, 808, Synth, and Chord grid highlights tied to the selected Pattern A/B/C, while Transport and arrangement playheads continue to show the actually playing Pattern during Song/Block playback.
- Playing Pattern Tabs mark the audible Pattern A/B/C separately from the selected editing Pattern, so Song/Block playback can be followed without changing the Pattern being edited.
- Pattern Playback Readout summarizes the current edit Pattern and audible Pattern in the Pattern editor without changing playback, selection, or Pattern A/B/C data.
- Arrangement Playback Readout summarizes the current edit arrangement block and audible arrangement block without changing playback, selection, arrangement data, or Pattern A/B/C data.
- Live playback that follows future pattern, arrangement track mutes, BPM, mixer, sound, and master edits without forcing users to stop and restart.
- Basic mixer volume/pan/mute/solo, mixer channel role readouts, Stem Audition Pads for Full Mix/Drums/808/Synth/Chords solo checks, Mix Balance Pads with local Mix Balance Preview and Result for one-click editable rough balance, channel low-cut/air EQ, Drive/Glue mix controls, Space send FX with Space FX Pads and Result, per-stem export level meters, deterministic Mix Coach checks with explicit Mix Fix actions and local Mix Fix Result feedback, Master Finish Pads with local Master Finish Preview and Result for editable demo/vocal/store/club output posture, master preset ceiling, master output role readout, reproducible export peak/RMS/headroom meter, full-mix WAV export, drum/808/synth/chord stem export, and arrangement MIDI export for DAW handoff.
- Master Finish Preview and Result show the recommended finish pad's pre-click preset, ceiling, output gain, and finish-move count, then after explicit pad clicks show the applied preset, ceiling, output gain, audition cue, and next check without changing master state outside the clicked pad or making platform loudness claims.
- Stem Audition Readout summarizes whether the mixer is hearing Full Mix, a soloed Drums/808/Synth/Chords stem, or a manual custom audition state without changing mixer, playback, or export behavior.
- Mix Snapshot A/B captures two UI-local mix/master passes from the current project, deterministic export analysis, and deterministic stem analysis, then compares headroom, balance, master, and stem posture without changing project schema, playback, or export behavior.
- Local Handoff Sheet text export that summarizes title, BPM/key/style, Delivery Target, Session Brief, arrangement, export meter, and stem meter data for collaboration and review.

The first desktop runtime is an Electron + Vite + TypeScript app. It opens directly into the workstation surface: transport with arrangement playback, Pattern preview, Song/Block/Pattern loop audition, a command-strip Transport Position Readout, Tap Tempo, Tempo Nudge Pads, and a realtime-only metronome that reads live project edits while running, desktop editing shortcuts, Native Command Menu for File/Edit/Transport commands, Keyboard Capture for 808/Synth note entry with a degree-labeled key map, command-strip posture readout, UI-local octave bank, and capture defaults, Web MIDI Input for explicit local controller note capture, Quick Actions command search with Recent Commands and Master Finish actions plus post-run local result feedback, undo/redo, local draft recovery with Restore Draft and Clear Draft controls, Project Snapshots, Snapshot Compare, Beat Blueprints for sample-free editable project starts with local Beat Blueprint Preview and Result, Delivery Targets for starter sketch, vocal session, beat-store demo, club demo, and custom outcomes with Delivery Target Alignment Preview and Result, Session Brief for local artist/vibe/reference/handoff notes with role readout and Starter Pads, style/key/BPM with editable groove templates, Mode Focus for Guided/Studio local orientation, First Beat Path setup/compose/arrange/mix/deliver progression, Beat Spine Setup/Drums/808/Bass/Harmony/Melody/Sound/Arrange/Finish sample-free core readout, Session Pass Guided/Studio/Finish/Delivery focus cards, Workflow Navigator Compose/Arrange/Mix/Deliver jumps, Key Compass for scale/chord/bass/melody focus, Groove Compass for selected-pattern rhythm/pocket focus, Composer Guide for composition-stage writing focus, style-aware Composer Actions for explicit local writing moves with scope/impact/undo previews plus post-click updated-metric, audition-cue, and next-check result feedback, drum steps with velocity, probability, visible chance badges, microtiming, selected-drum pocket readout, one-click groove humanization, Drum Foundation Pads for editable kick/clap/hat/perc foundations, Groove Feel Pads for editable timing/chance feel, Drum Accent Pads for editable velocity shape, Drum Move Preview and Result, hat repeat, and selected-drum copy/paste hit tools, Pattern Compare cue/use cards, Pattern DNA selected-pattern layer/density/variation/arrangement scan, Layer Starter Pads for selected-pattern Drums/808/Chords/Synth readiness and explicit starter routing, Pattern Clone Pads for one-click clone-and-vary moves, Pattern Stack Pads with Pattern Stack Preview and Result for editable 808/chord/Synth sketches, deterministic Pattern variation tools, Pattern Fill tail moves, Pattern A/B/C copy/clear tools, editable scale-aware 808/melody lanes with 808 Bassline Pads, 808 Glide Pads, 808 Contour Pads, 808 Move Preview and Result, Melody Motif Pads, Melody Accent Pads, Melody Contour Pads, Melody Move Preview and Result, note chance badges, selected-note degree/role readout, and selected-note move/transpose/copy/paste/duplicate tools, kick-to-808 sidechain ducking, chord progression presets plus Chord Playhead Highlighting, Chord Pads, Chord Rhythm Pads, Chord Voicing Pads, Chord Move Preview and Result, add/delete/selected-chord harmonic readout/move/copy/paste/duplicate/inversion/chance controls, sound design presets with Sound Preset Preview and Result, Drum Kit Pads with Drum Kit Preview and Result for built-in drum tone posture, Sound Focus Pads with Sound Focus Preview and Result, Studio tone controls, read-only Beat Passport, Production Snapshot, Finish Checklist, Review Queue, Export Preflight delivery-risk scan, Beat Readiness checks, and Listening Pass composition/arrangement/mix/delivery audition checkpoints, Handoff Pack export surface with handoff route readout and Manifest Audit, target-aware Beat Map workflow and producer metrics, Structure Lens arrangement fit/section/hook/energy checks, Song Form Overview for full-song section/pattern/energy navigation, Arrangement Playhead Highlighting across Arrangement Track, Section Locator Pads, and Song Form Overview, local Next Move actions that can align the selected target, suggest Pattern Chain when arrangement structure is weak, or apply Master Finish with post-click result-metric, audition-cue, and next-check feedback, editable arrangement blocks with selected-block role readout, Arrangement Arc Pads with Arrangement Arc Preview and Result, Section Locator Pads for section cueing, Arrangement Focus presets with local Arrangement Focus Preview and Result, one-click Drop/Build/Hook Lift moves, per-track mutes, per-block bar lengths, selected-block copy/paste, split/merge controls, and audible energy, Pattern Chain 8-bar sketches with local Pattern Chain Preview and Result, per-step A/B/C cycling, and Chain Expand song-form outlining, arrangement templates with local Arrangement Template Preview and Result, arrangement structure controls, mixer volume/pan/mute/solo, mixer channel role readouts, Stem Audition Pads for Full Mix/Drums/808/Synth/Chords solo checks, Mix Balance Pads with Mix Balance Preview and Result, Mix Snapshot A/B for UI-local headroom/balance/master/stem pass comparison, channel low-cut/air EQ, Drive/Glue mix controls, Space send FX with Space FX Pads and Result, per-stem export level meters, deterministic Mix Coach checks with explicit Headroom/Stem Balance/Low End Mix Fix actions and Mix Fix Result, Master Finish Pads with Master Finish Preview and Result, master preset ceiling, master output role readout, reproducible export peak/RMS/headroom meter, local project save/load, arrangement-length WAV export, one-click stem export, arrangement MIDI export, and Handoff Sheet text export.

## Core Direction

- Keep product behavior grounded in the project brief and official sources where applicable.
- Treat genre as editable style profiles and generation rules, not as a single hard-coded genre.
- Keep pattern programming, drums, 808/bass, melody/chords, sound design, arrangement, mixer/master, and export ahead of optional sampling extensions.
- Treat sample-free beat creation as the proof of the product: built-in drums, synth 808/bass, synth melody/chords, arrangement, mixer/master, and WAV/stem/MIDI export should work before optional sampling entry points become prominent.
- Keep sample import, chopping, sampler tracks, and audio warping in P3/v2 extension scope unless a user-approved plan explicitly says otherwise.
- Keep first-run UI and default navigation focused on making beats across genres, not on finding or slicing samples.
- Keep default screens, plan titles, and roadmap ordering anchored to editable musical events and beat-making controls.
- Lead summaries with what users create directly: drums, 808/bass, melody/chords, sound design, arrangement, mix/master, and export. Mention sampling only as an explicitly optional extension boundary or sampling-phase plan.
- Keep sensitive real user, customer, credential, and production data out of samples, tests, docs, and screenshots.
- Keep validation commands current as the stack becomes concrete.

## Agent Harness

All implementation work starts from an active exec plan:

```text
docs/exec_plans/active/plan-NNN-<task>.md
```

Do not create or use `docs/plan`.

Completed plans move to `docs/exec_plans/completed/`, and completion reviews go in `docs/reviews/`.

## Git Flow

Do not work directly on `main`. Use a `codex/plan-NNN-<task>` branch and `.worktree/plan-NNN-<task>` checkout for feature work. After QA and review, merge to `main`, push `main`, delete the merged branch with `git branch -d`, and remove the worktree.

## Commands

Install dependencies:

```sh
npm install
```

Run the renderer dev server:

```sh
npm run dev
```

Build and open the desktop app:

```sh
npm run desktop
```

Validation:

```sh
python3 harness/scripts/run_qa.py
python3 harness/scripts/run_quality_gate.py
npm run typecheck
npm run build
npm run qa
npm run verify
```

`npm run desktop` performs a production build and launches Electron from the built files.

## Layout

```text
AGENTS.md
README.md
electron/
src/
docs/
  architecture/
    product-architecture.md
  exec_plans/
    active/
    completed/
  meetings/
  privacy/
  product/
  quality/
  references/
  reviews/
harness/
  scripts/
  templates/
```
