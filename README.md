
# GrooveForge

GrooveForge is a desktop-ready, web-first, event-based mini DAW for making beats across genres: drums, 808/bass, melody/chords, sound design, arrangement, mixing, mastering, and WAV/stem export.

Project type: `web-first TypeScript mini DAW / beat workstation`.

This repository includes an agent-readable project base: concise root docs, durable project knowledge under `docs/`, and a local harness under `harness/`.

Agent team: `Team Forge`. See `AGENTS.md`.

## Product Spine

GrooveForge is a code-driven all-genre beat workstation with a programmable project format and style engine. Direct composition is the product spine: users should be able to program musical events, shape built-in instruments, arrange a song section, mix/master it, and export audio before they ever import a sample.

The core flow is:

```text
BPM/key -> drums -> 808/bass -> melody/chords -> arrangement -> mixing -> mastering -> export
```

Sampling is a secondary add-on. It can be added later for users who want audio import, chopping, or sampler workflows, but it must not define the MVP, the first-run experience, or the core data model.

## MVP Target

The first usable result is an Electron desktop workstation that can create a sample-free 8-bar beat in any supported style profile and export it as WAV:

- 145 BPM / F minor starter project.
- Style selector that applies editable genre groove templates for Pattern A/B/C, BPM, swing, and sound preset.
- Kick, snare/clap, hat, 808, chord, and synth melody tracks.
- Sound presets and Studio tone controls for built-in drum, 808, synth, and chord engines.
- Independent Pattern A/B/C variations with copy/clear tools and editable arrangement blocks with duplicate, move, and delete controls.
- Undo/redo edit history for safer pattern, arrangement, mixer, sound, and master experimentation.
- Basic mixer volume/pan/mute/solo, master preset ceiling, export peak/RMS/headroom meter, full-mix WAV export, and drum/808/synth/chord stem export.

The first desktop runtime is an Electron + Vite + TypeScript app. It opens directly into the workstation surface: transport, undo/redo, style/key/BPM with editable groove templates, drum steps, Pattern A/B/C copy/clear tools, editable scale-aware 808/melody lanes, chord progression, sound design presets, Studio tone controls, editable arrangement blocks, arrangement structure controls, mixer volume/pan/mute/solo, master preset ceiling, export peak/RMS/headroom meter, local project save/load, realtime loop playback, arrangement-length WAV export, and one-click stem export.

## Core Direction

- Keep product behavior grounded in the project brief and official sources where applicable.
- Treat genre as editable style profiles and generation rules, not as a single hard-coded genre.
- Keep drums, 808/bass, melody/chords, arrangement, mixer/master, and export ahead of sampling work.
- Treat sample import, chopping, sampler tracks, and audio warping as P3/v2 optional modules unless a user-approved plan explicitly says otherwise.
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
