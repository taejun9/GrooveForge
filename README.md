
# GrooveForge

GrooveForge is a desktop-ready, web-first, event-based mini DAW for making beats across genres: pattern programming, drums, 808/bass, melody/chords, sound design, arrangement, mixing, mastering, Session Brief, Space send FX, MIDI export, and WAV/stem export. It opens on direct beat composition with built-in instruments and editable musical events; sampling remains a later optional sound-source module.

Project type: `web-first TypeScript mini DAW / beat workstation`.

This repository includes an agent-readable project base: concise root docs, durable project knowledge under `docs/`, and a local harness under `harness/`.

Agent team: `Team Forge`. See `AGENTS.md`.

## Product Spine

Concept lock: GrooveForge is an all-genre beat-production mini DAW for directly composing beats, designing sounds, arranging sections, mixing/mastering, and exporting finished audio. In the user's terms, it is "비트(모든 장르)를 만드는" app and "직접 비트를 작곡하고 사운드를 설계하고 믹싱/마스터링까지 하는 비트 제작 미니 DAW." Sampling can be added later as an optional workflow after the beat workstation core is already valuable.

GrooveForge is a code-driven all-genre beat workstation with a programmable project format and style engine. Direct composition is the product spine: users should be able to program drums, 808/bass, melody, chords, FX, and automation as editable musical events, shape built-in instruments, arrange a song section, mix/master it, and export audio before they ever import a sample. The product center is Pattern Programming, Drum Sequencing, 808/Bass Synthesis, Melody/Chord Composition, Sound Design, Arrangement, Mixing, Mastering, and Export.

The first-run experience should feel like opening a compact beat-making DAW: choose BPM/key/style, write drums, build 808/bass, add melody/chords, shape sounds, arrange, mix, master, then export.

Genre breadth is part of the core. Trap, drill, boom bap, lo-fi, house, R&B, jersey club, phonk, garage, and experimental starts should come from editable style profiles, built-in instruments, and musical events.

The core flow is:

```text
BPM/key/style -> pattern programming -> drums -> 808/bass -> melody/chords -> sound design -> arrangement -> mixing -> mastering -> export
```

Optional sampling scope is intentionally subordinate: after core beat-making works, a future module may add audio import, chopping/slicing, pitch/stretch, one-shot mapping, or sampler instruments. It must attach as an opt-in sound source inside the workstation. A complete GrooveForge beat must still be possible with no imported audio.

Concept audit rule: do not read any sampling reference as the main workflow. Sampling is an accessory module, not the app category. If a draft starts from sample import, sample browsing, chopping, loop stretching, one-shot mapping, or sampler setup, it is out of alignment until it is explicitly labeled optional sampling-phase work.

Drafting rule: the default empty project, first visible actions, MVP proof, primary navigation, and new plan titles should lead with editable musical events and beat-making controls. Do not present optional sampling as a co-equal product spine.

## MVP Target

The first usable result is an Electron desktop workstation that can create a sample-free 8-bar beat in any supported style profile and export it as WAV:

- 145 BPM / F minor starter project.
- Key changes that retarget Pattern A/B/C 808, synth, and chord-root event data instead of only changing the project label.
- Style selector that applies editable genre groove templates for Trap, Drill, Boom Bap, Lo-fi, House, R&B, Jersey Club, Phonk, Garage, and Experimental Pattern A/B/C, BPM, swing, and sound preset.
- Style Inspector with Style Quick Picks that explain and apply each genre's BPM range, active/default swing, bass role, melody role, sound preset, and Pattern A/B/C event density from local project data.
- Key Compass for local read-only scale notes, chord motion, 808/bass posture, melody posture, and selected-note or selected-chord focus so beginners can compose inside the key and producers can scan harmony quickly.
- Groove Compass for local read-only selected-pattern drum density, kick/clap anchors, hat motion, timing feel, chance posture, and selected drum focus so beginners can understand groove foundations and producers can scan pocket quickly.
- Composer Guide for local read-only drums, 808/bass, harmony, melody, arrangement, and finish posture so beginners know the next writing focus and producers can scan missing layers quickly.
- Mode Focus strip that makes Guided mode show current stage, writing focus, and local check while Studio mode shows session scan, top review issue, and handoff posture from existing local project analysis.
- Workflow Navigator for local UI-only Compose, Arrange, Mix, and Deliver jump controls so beginners can follow the beat-making path and producers can move quickly across the dense workstation.
- Style-aware Composer Actions for explicit local writing moves with inline scope, impact, and undo previews plus a post-click local result strip showing updated beat metrics, audition cues, and next checks, routing Composer Guide focus into existing undoable Drum Foundation, 808 Bassline, Chord Progression, Melody Motif, Pattern Fill, Pattern Chain, arrangement template, and Master Finish paths without sampling or hidden generation.
- Beat Blueprints for sample-free project starts that apply style, key, BPM, Pattern A/B/C events, arrangement template, sound preset, mixer balance, and master preset while staying fully editable.
- Kick, snare/clap, hat, 808, chord, and synth melody tracks with editable drum velocity, Drum Foundation Pads for one-click kick/clap/hat/perc foundations, Drum Accent Pads, event chance, chance badges, microtiming, one-click groove humanization, hat repeat dynamics, selected-drum copy/paste hit tools, 808 Bassline Pads, 808 Glide Pads for one-click length/glide/chance shaping, 808 Contour Pads for bassline direction shaping, Desktop Keyboard Capture for scale-locked 808/Synth note entry with a degree-labeled key map plus UI-local octave, length, Synth velocity, and 808 glide defaults, Melody Motif Pads, Melody Accent Pads, Melody Contour Pads for one-click Synth phrase direction/velocity/chance shaping, and selected-note degree/role readout plus move/transpose/copy/paste/duplicate tools.
- Key-aware chord progression presets with Chord Pads, Chord Rhythm Pads, and Chord Voicing Pads for one-click chord color, inversion, length, velocity, and chance shaping, chord add/delete, selected-chord move/copy/paste/duplicate/inversion tools, and per-chord chance controls for fast harmonic sketching.
- Sound presets, Drum Kit Pads for one-click built-in kick/clap/hat tone posture, Sound Focus Pads, and Studio tone controls for built-in drum, 808, kick-duck sidechain, synth, and chord engines.
- Delivery Targets for starter sketch, vocal session, beat-store demo, club demo, and one editable custom outcome, with explicit target alignment for arrangement length, master preset, and mix posture.
- Session Brief for bounded local artist, vibe, reference, and handoff notes stored in the project file.
- Independent Pattern A/B/C variations with Pattern Compare cue/use cards, Pattern Clone Pads for one-click clone-and-vary moves into another slot, Pattern Stack Pads for one-click 808/chord/Synth sketches, Drum Foundation Pads for editable rhythm foundations, Groove Feel Pads for editable timing/chance feel, Drum Accent Pads for editable velocity shape, deterministic Subtle/Hook/Break tools, one-click Drum Fill/808 Pickup/Melody Turn tail moves, copy/clear tools, and editable arrangement blocks with Arrangement Arc Pads, Arrangement Focus presets, one-click Drop/Build/Hook Lift moves, per-track mutes, audible energy, bar length, selected-block copy/paste, split, merge, duplicate, move, and delete controls.
- Pattern DNA for a read-only selected Pattern A/B/C scan of layers, density, variation signals, and arrangement use so beginners can see what the loop contains and producers can inspect edit posture quickly.
- Pattern Chain presets, an 8-step chain editor, and Chain Expand that turn Pattern A/B/C variations into editable arrangement sketches and longer song-form outlines.
- Read-only Beat Readiness checks for drums, 808, melody/chords, arrangement, and export completeness.
- Beat Passport summary for target, length, Pattern A/B/C use, readiness, export, stems, and master posture from local project/render state.
- Production Snapshot for local read-only target, form, Pattern A/B/C coverage, mix, and handoff posture so producers can scan a session fast and beginners can see what matters next.
- Finish Checklist for local read-only Compose, Arrange, Mix, Master, and Handoff readiness before export.
- Review Queue for local read-only prioritized production issues across composition, arrangement, mix/master, target, and handoff.
- Export Preflight for a read-only delivery-risk scan of readiness, mix/master posture, WAV/stem/MIDI deliverables, and handoff brief status before users export or send files.
- Handoff Pack panel that groups explicit WAV, stem, MIDI, and Handoff Sheet export actions with local deliverable status.
- Beat Map production overview that uses the selected fixed or custom Delivery Target to show beginner workflow stages, producer-facing song/pattern/mix/stem metrics, and explicit local action buttons from the current project state.
- Structure Lens panel that checks target fit, section coverage, hook contrast, and energy arc from the current arrangement with explicit local arrangement actions.
- Song Form Overview for a compact visual map of sections, Pattern A/B/C usage, bar ranges, energy, muted tracks, and selected arrangement block navigation.
- Next Move strip that turns readiness/export state into explicit local actions such as Blueprint, target alignment, Pattern Compare, Pattern Fill, Pattern Chain, Hook Lift, Master Finish, Save Slot, and Mix Check, then shows post-click local result metrics, audition cues, and next checks.
- Arrangement templates for 8-bar loop, full beat, hook-first, and breakdown song structures with explicit section lengths, plus Arrangement Arc Pads for one-click full-song energy shaping.
- Desktop editing shortcuts, Keyboard Capture, and Quick Actions command search for arrangement playback, Pattern A/B/C switching, selected event deletion, save, open, undo, redo, snapshots, blueprints, pattern fills, Arrangement Focus, mix fixes, master finish, and export, with post-run local result metrics, audition cues, and next checks after explicit command clicks.
- Undo/redo edit history for safer pattern, arrangement, mixer, sound, and master experimentation.
- Local draft recovery that keeps a bounded browser/Electron renderer draft in localStorage, then shows explicit Restore Draft and Clear Draft controls on the next session without replacing `.grooveforge.json` Save/Open.
- Project Snapshots for local idea slots that can save, rename, restore, and delete beat states inside the project file.
- Snapshot Compare for local read-only comparison of the current beat against saved snapshots by setup, length, readiness, export, stems, and master posture.
- Realtime transport loop controls for Song, selected Block, and Pattern audition, plus a metronome toggle with accented downbeat clicks for timing reference during arrangement or Pattern playback.
- Live playback that follows future pattern, arrangement track mutes, BPM, mixer, sound, and master edits without forcing users to stop and restart.
- Basic mixer volume/pan/mute/solo, Stem Audition Pads for Full Mix/Drums/808/Synth/Chords solo checks, Mix Balance Pads for one-click editable rough balance, channel low-cut/air EQ, Drive/Glue mix controls, Space send FX, per-stem export level meters, deterministic Mix Coach checks with explicit Mix Fix actions, Master Finish Pads for editable demo/vocal/store/club output posture, master preset ceiling, reproducible export peak/RMS/headroom meter, full-mix WAV export, drum/808/synth/chord stem export, and arrangement MIDI export for DAW handoff.
- Local Handoff Sheet text export that summarizes title, BPM/key/style, Delivery Target, Session Brief, arrangement, export meter, and stem meter data for collaboration and review.

The first desktop runtime is an Electron + Vite + TypeScript app. It opens directly into the workstation surface: transport with arrangement playback, Pattern preview, Song/Block/Pattern loop audition, and a realtime-only metronome that reads live project edits while running, desktop editing shortcuts, Keyboard Capture for 808/Synth note entry with a degree-labeled key map, UI-local octave bank, and capture defaults, Quick Actions command search with Master Finish actions and post-run local result feedback, undo/redo, local draft recovery with Restore Draft and Clear Draft controls, Project Snapshots, Snapshot Compare, Beat Blueprints for sample-free editable project starts, Delivery Targets for starter sketch, vocal session, beat-store demo, club demo, and custom outcomes, Session Brief for local artist/vibe/reference/handoff notes, style/key/BPM with editable groove templates, Mode Focus for Guided/Studio local orientation, Workflow Navigator Compose/Arrange/Mix/Deliver jumps, Key Compass for scale/chord/bass/melody focus, Groove Compass for selected-pattern rhythm/pocket focus, Composer Guide for composition-stage writing focus, style-aware Composer Actions for explicit local writing moves with scope/impact/undo previews plus post-click updated-metric, audition-cue, and next-check result feedback, drum steps with velocity, probability, visible chance badges, microtiming, one-click groove humanization, Drum Foundation Pads for editable kick/clap/hat/perc foundations, Drum Accent Pads for editable velocity shape, hat repeat, and selected-drum copy/paste hit tools, Pattern Compare cue/use cards, Pattern DNA selected-pattern layer/density/variation/arrangement scan, Pattern Clone Pads for one-click clone-and-vary moves, Pattern Stack Pads for editable 808/chord/Synth sketches, Groove Feel Pads for editable timing/chance feel, deterministic Pattern variation tools, Pattern Fill tail moves, Pattern A/B/C copy/clear tools, editable scale-aware 808/melody lanes with 808 Bassline Pads, 808 Glide Pads, 808 Contour Pads, Melody Motif Pads, Melody Accent Pads, Melody Contour Pads, note chance badges, selected-note degree/role readout, and selected-note move/transpose/copy/paste/duplicate tools, kick-to-808 sidechain ducking, chord progression presets plus Chord Pads, Chord Rhythm Pads, Chord Voicing Pads, add/delete/selected-chord move/copy/paste/duplicate/inversion/chance controls, sound design presets, Drum Kit Pads for built-in drum tone posture, Sound Focus Pads, Studio tone controls, read-only Beat Passport, Production Snapshot, Finish Checklist, Review Queue, Export Preflight delivery-risk scan, and Beat Readiness checks, Handoff Pack export surface, target-aware Beat Map workflow and producer metrics, Structure Lens arrangement fit/section/hook/energy checks, Song Form Overview for full-song section/pattern/energy navigation, local Next Move actions that can align the selected target, suggest Pattern Chain when arrangement structure is weak, or apply Master Finish with post-click result-metric, audition-cue, and next-check feedback, editable arrangement blocks with Arrangement Arc Pads, Arrangement Focus presets, one-click Drop/Build/Hook Lift moves, per-track mutes, per-block bar lengths, selected-block copy/paste, split/merge controls, and audible energy, Pattern Chain 8-bar sketches with per-step A/B/C cycling plus Chain Expand song-form outlining, arrangement templates, arrangement structure controls, mixer volume/pan/mute/solo, Stem Audition Pads for Full Mix/Drums/808/Synth/Chords solo checks, Mix Balance Pads, channel low-cut/air EQ, Drive/Glue mix controls, Space send FX, per-stem export level meters, deterministic Mix Coach checks with explicit Headroom/Stem Balance/Low End Mix Fix actions, Master Finish Pads, master preset ceiling, reproducible export peak/RMS/headroom meter, local project save/load, arrangement-length WAV export, one-click stem export, arrangement MIDI export, and Handoff Sheet text export.

## Core Direction

- Keep product behavior grounded in the project brief and official sources where applicable.
- Treat genre as editable style profiles and generation rules, not as a single hard-coded genre.
- Keep pattern programming, drums, 808/bass, melody/chords, sound design, arrangement, mixer/master, and export ahead of optional sampling extensions.
- Treat sample-free beat creation as the proof of the product: built-in drums, synth 808/bass, synth melody/chords, arrangement, mixer/master, and WAV/stem/MIDI export should work before optional sampling entry points become prominent.
- Keep sample import, chopping, sampler tracks, and audio warping in P3/v2 extension scope unless a user-approved plan explicitly says otherwise.
- Keep first-run UI and default navigation focused on making beats across genres, not on finding or slicing samples.
- Keep default screens, plan titles, and roadmap ordering anchored to editable musical events and beat-making controls.
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
