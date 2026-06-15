
# GrooveForge

GrooveForge is a desktop-ready, web-first, event-based mini DAW for making beats across genres: drums, 808/bass, melody/chords, sound design, arrangement, mixing, mastering, Session Brief, Space send FX, MIDI export, and WAV/stem export. It is a beat workstation first, not a sampler-first app.

Project type: `web-first TypeScript mini DAW / beat workstation`.

This repository includes an agent-readable project base: concise root docs, durable project knowledge under `docs/`, and a local harness under `harness/`.

Agent team: `Team Forge`. See `AGENTS.md`.

## Product Spine

Concept lock: GrooveForge is not a sampling app. It is an all-genre beat-production mini DAW for directly composing beats, designing sounds, arranging sections, mixing/mastering, and exporting finished audio. Sampling is a useful optional module only after the beat workstation core is already valuable.

GrooveForge is a code-driven all-genre beat workstation with a programmable project format and style engine. Direct composition is the product spine: users should be able to program drums, 808/bass, melody, chords, FX, and automation as editable musical events, shape built-in instruments, arrange a song section, mix/master it, and export audio before they ever import a sample.

The first-run experience should feel like opening a compact beat-making DAW, not a sample browser: choose BPM/key/style, write drums, build 808/bass, add melody/chords, shape sounds, arrange, mix, master, then export.

The core flow is:

```text
BPM/key/style -> pattern programming -> drums -> 808/bass -> melody/chords -> sound design -> arrangement -> mixing -> mastering -> export
```

Optional sampling path, later:

```text
sample import -> chop/slice -> pitch/stretch -> one-shot or sampler mapping
```

Sampling is a secondary add-on. It can be added later for users who want audio import, chopping, loop stretching, one-shot mapping, or sampler workflows, but it must not define the MVP, the first-run experience, or the core data model. A complete GrooveForge beat must be possible with no imported audio.

If a draft, screen, or roadmap has to choose what appears first, the answer is direct beat creation: pattern programming, drums, 808/bass, melody/chords, sound design, arrangement, mixer/master, and export. Sample browsing, chopping, and sampler setup are opt-in extension paths after the beat workstation core is useful.

## MVP Target

The first usable result is an Electron desktop workstation that can create a sample-free 8-bar beat in any supported style profile and export it as WAV:

- 145 BPM / F minor starter project.
- Key changes that retarget Pattern A/B/C 808, synth, and chord-root event data instead of only changing the project label.
- Style selector that applies editable genre groove templates for Trap, Drill, Boom Bap, Lo-fi, House, R&B, Jersey Club, Phonk, Garage, and Experimental Pattern A/B/C, BPM, swing, and sound preset.
- Style Inspector with Style Quick Picks that explain and apply each genre's BPM range, active/default swing, bass role, melody role, sound preset, and Pattern A/B/C event density from local project data.
- Beat Blueprints for sample-free project starts that apply style, key, BPM, Pattern A/B/C events, arrangement template, sound preset, mixer balance, and master preset while staying fully editable.
- Kick, snare/clap, hat, 808, chord, and synth melody tracks with editable drum velocity, event chance, chance badges, microtiming, one-click groove humanization, hat repeat dynamics, 808 Bassline Pads, Desktop Keyboard Capture for scale-locked 808/Synth note entry, Melody Motif Pads, and selected-note move/transpose/duplicate tools.
- Key-aware chord progression presets with Chord Pads, chord add/delete, selected-chord move/duplicate/inversion tools, and per-chord chance controls for fast harmonic sketching.
- Sound presets and Studio tone controls for built-in drum, 808, kick-duck sidechain, synth, and chord engines.
- Delivery Targets for starter sketch, vocal session, beat-store demo, club demo, and one editable custom outcome, with explicit target alignment for arrangement length, master preset, and mix posture.
- Session Brief for bounded local artist, vibe, reference, and handoff notes stored in the project file.
- Independent Pattern A/B/C variations with Pattern Compare cue/use cards, Pattern Stack Pads for one-click 808/chord/Synth sketches, Groove Feel Pads for editable timing/chance feel, deterministic Subtle/Hook/Break tools, one-click Drum Fill/808 Pickup/Melody Turn tail moves, copy/clear tools, and editable arrangement blocks with Arrangement Focus presets, one-click Drop/Build/Hook Lift moves, per-track mutes, audible energy, bar length, split, merge, duplicate, move, and delete controls.
- Pattern Chain presets, an 8-step chain editor, and Chain Expand that turn Pattern A/B/C variations into editable arrangement sketches and longer song-form outlines.
- Read-only Beat Readiness checks for drums, 808, melody/chords, arrangement, and export completeness.
- Beat Map production overview that uses the selected fixed or custom Delivery Target to show beginner workflow stages, producer-facing song/pattern/mix/stem metrics, and explicit local action buttons from the current project state.
- Next Move strip that turns readiness/export state into explicit local actions such as Blueprint, target alignment, Pattern Compare, Pattern Fill, Pattern Chain, Hook Lift, Save Slot, and Mix Check.
- Arrangement templates for 8-bar loop, full beat, hook-first, and breakdown song structures with explicit section lengths.
- Desktop editing shortcuts, Keyboard Capture, and Quick Actions command search for arrangement playback, Pattern A/B/C switching, selected event deletion, save, open, undo, redo, snapshots, blueprints, pattern fills, Arrangement Focus, mix fixes, and export.
- Undo/redo edit history for safer pattern, arrangement, mixer, sound, and master experimentation.
- Project Snapshots for local idea slots that can save, rename, restore, and delete beat states inside the project file.
- Realtime transport loop controls for Song, selected Block, and Pattern audition, plus a metronome toggle with accented downbeat clicks for timing reference during arrangement or Pattern playback.
- Live playback that follows future pattern, arrangement track mutes, BPM, mixer, sound, and master edits without forcing users to stop and restart.
- Basic mixer volume/pan/mute/solo, channel low-cut/air EQ, Drive/Glue mix controls, Space send FX, per-stem export level meters, deterministic Mix Coach checks with explicit Mix Fix actions, master preset ceiling, reproducible export peak/RMS/headroom meter, full-mix WAV export, drum/808/synth/chord stem export, and arrangement MIDI export for DAW handoff.
- Local Handoff Sheet text export that summarizes title, BPM/key/style, Delivery Target, Session Brief, arrangement, export meter, and stem meter data for collaboration and review.

The first desktop runtime is an Electron + Vite + TypeScript app. It opens directly into the workstation surface: transport with arrangement playback, Pattern preview, Song/Block/Pattern loop audition, and a realtime-only metronome that reads live project edits while running, desktop editing shortcuts, Keyboard Capture for 808/Synth note entry, Quick Actions command search, undo/redo, Project Snapshots, Beat Blueprints for sample-free editable project starts, Delivery Targets for starter sketch, vocal session, beat-store demo, club demo, and custom outcomes, Session Brief for local artist/vibe/reference/handoff notes, style/key/BPM with editable groove templates, drum steps with velocity, probability, visible chance badges, microtiming, one-click groove humanization, and hat repeat, Pattern Compare cue/use cards, Pattern Stack Pads for editable 808/chord/Synth sketches, Groove Feel Pads for editable timing/chance feel, deterministic Pattern variation tools, Pattern Fill tail moves, Pattern A/B/C copy/clear tools, editable scale-aware 808/melody lanes with 808 Bassline Pads, Melody Motif Pads, note chance badges, and selected-note move/transpose/duplicate tools, kick-to-808 sidechain ducking, chord progression presets plus Chord Pads, add/delete/selected-chord move/duplicate/inversion/chance controls, sound design presets, Studio tone controls, read-only Beat Readiness checks, target-aware Beat Map workflow and producer metrics, local Next Move actions that can align the selected target or suggest Pattern Chain when arrangement structure is weak, editable arrangement blocks with Arrangement Focus presets, one-click Drop/Build/Hook Lift moves, per-track mutes, per-block bar lengths, split/merge controls, and audible energy, Pattern Chain 8-bar sketches with per-step A/B/C cycling plus Chain Expand song-form outlining, arrangement templates, arrangement structure controls, mixer volume/pan/mute/solo, channel low-cut/air EQ, Drive/Glue mix controls, Space send FX, per-stem export level meters, deterministic Mix Coach checks with explicit Headroom/Stem Balance/Low End Mix Fix actions, master preset ceiling, reproducible export peak/RMS/headroom meter, local project save/load, arrangement-length WAV export, one-click stem export, arrangement MIDI export, and Handoff Sheet text export.

## Core Direction

- Keep product behavior grounded in the project brief and official sources where applicable.
- Treat genre as editable style profiles and generation rules, not as a single hard-coded genre.
- Keep pattern programming, drums, 808/bass, melody/chords, sound design, arrangement, mixer/master, and export ahead of sampling work.
- Treat sample-free beat creation as the proof of the product: built-in drums, synth 808/bass, synth melody/chords, arrangement, mixer/master, and WAV/stem/MIDI export should work before optional sampling entry points become prominent.
- Treat sample import, chopping, sampler tracks, and audio warping as P3/v2 optional modules unless a user-approved plan explicitly says otherwise.
- Keep first-run UI and default navigation focused on making beats across genres, not on finding or slicing samples.
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
