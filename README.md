
# GrooveForge

GrooveForge is a desktop-ready, web-first, event-based mini DAW for making beats across genres: drums, 808/bass, melody/chords, sound design, arrangement, mixing, mastering, and WAV/stem export. It is a beat workstation first, not a sampler-first app.

Project type: `web-first TypeScript mini DAW / beat workstation`.

This repository includes an agent-readable project base: concise root docs, durable project knowledge under `docs/`, and a local harness under `harness/`.

Agent team: `Team Forge`. See `AGENTS.md`.

## Product Spine

GrooveForge is a code-driven all-genre beat workstation with a programmable project format and style engine. Direct composition is the product spine: users should be able to program musical events, shape built-in instruments, arrange a song section, mix/master it, and export audio before they ever import a sample.

The first-run experience should feel like opening a compact beat-making DAW, not a sample browser: choose BPM/key/style, write drums, build 808/bass, add melody/chords, shape sounds, arrange, mix, master, then export.

The core flow is:

```text
BPM/key -> drums -> 808/bass -> melody/chords -> arrangement -> mixing -> mastering -> export
```

Sampling is a secondary add-on. It can be added later for users who want audio import, chopping, loop stretching, or sampler workflows, but it must not define the MVP, the first-run experience, or the core data model.

If a draft, screen, or roadmap has to choose what appears first, the answer is direct beat creation: pattern programming, drums, 808/bass, melody/chords, sound design, arrangement, mixer/master, and export. Sample browsing, chopping, and sampler setup are opt-in extension paths after the beat workstation core is useful.

## MVP Target

The first usable result is an Electron desktop workstation that can create a sample-free 8-bar beat in any supported style profile and export it as WAV:

- 145 BPM / F minor starter project.
- Key changes that retarget Pattern A/B/C 808, synth, and chord-root event data instead of only changing the project label.
- Style selector that applies editable genre groove templates for Pattern A/B/C, BPM, swing, and sound preset.
- Kick, snare/clap, hat, 808, chord, and synth melody tracks with editable drum velocity, event chance, chance badges, microtiming, one-click groove humanization, hat repeat dynamics, and selected-note move/transpose/duplicate tools.
- Key-aware chord progression presets with chord add/delete controls and per-chord chance for fast harmonic sketching.
- Sound presets and Studio tone controls for built-in drum, 808, kick-duck sidechain, synth, and chord engines.
- Independent Pattern A/B/C variations with deterministic Subtle/Hook/Break tools, copy/clear tools, and editable arrangement blocks with per-track mutes, audible energy, bar length, duplicate, move, and delete controls.
- Arrangement templates for 8-bar loop, full beat, hook-first, and breakdown song structures with explicit section lengths.
- Desktop editing shortcuts for arrangement playback, Pattern A/B/C switching, selected event deletion, save, open, undo, and redo.
- Undo/redo edit history for safer pattern, arrangement, mixer, sound, and master experimentation.
- Realtime transport metronome toggle with accented downbeat clicks for timing reference during arrangement or Pattern playback.
- Live playback that follows future pattern, arrangement track mutes, BPM, mixer, sound, and master edits without forcing users to stop and restart.
- Basic mixer volume/pan/mute/solo, channel low-cut/air EQ, Drive/Glue mix controls, master preset ceiling, reproducible export peak/RMS/headroom meter, full-mix WAV export, and drum/808/synth/chord stem export.

The first desktop runtime is an Electron + Vite + TypeScript app. It opens directly into the workstation surface: transport with arrangement playback, Pattern preview, and a realtime-only metronome that reads live project edits while running, desktop editing shortcuts, undo/redo, style/key/BPM with editable groove templates, drum steps with velocity, probability, visible chance badges, microtiming, one-click groove humanization, and hat repeat, deterministic Pattern variation tools, Pattern A/B/C copy/clear tools, editable scale-aware 808/melody lanes with note chance badges and selected-note move/transpose/duplicate tools, kick-to-808 sidechain ducking, chord progression presets plus add/delete/chance controls, sound design presets, Studio tone controls, editable arrangement blocks with per-track mutes, per-block bar lengths, and audible energy, arrangement templates, arrangement structure controls, mixer volume/pan/mute/solo, channel low-cut/air EQ, Drive/Glue mix controls, master preset ceiling, reproducible export peak/RMS/headroom meter, local project save/load, arrangement-length WAV export, and one-click stem export.

## Core Direction

- Keep product behavior grounded in the project brief and official sources where applicable.
- Treat genre as editable style profiles and generation rules, not as a single hard-coded genre.
- Keep pattern programming, drums, 808/bass, melody/chords, sound design, arrangement, mixer/master, and export ahead of sampling work.
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
