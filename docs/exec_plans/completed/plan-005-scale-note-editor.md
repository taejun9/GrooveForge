# plan-005-scale-note-editor

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop app that can satisfy working composers while staying easy for first-time composers.

## Goal

Make the 808 and melody area directly editable with a scale-aware note grid so users can compose basslines and melodies without relying on samples or static fixtures.

## Non-Goals

- Add sampling, audio import, chopping, or sampler tracks.
- Build a full piano roll, MIDI input, persistence, or plugin hosting.
- Replace the realtime scheduler or WAV export path.

## Requirements

- Users can add and remove 808 notes from the 16-step grid.
- Users can add and remove synth melody notes from a scale-aware grid.
- Beginners get clear in-key pitch choices derived from the selected key.
- Studio mode exposes practical note-shaping controls for selected notes.
- Playback/export continue to use the edited project state.
- Existing drum, transport, mixer, master, and export behavior remain intact.

## Context Map

- `src/domain/workstation.ts`: note models, scale helpers, starter notes.
- `src/ui/App.tsx`: note editor interactions and selected-note controls.
- `src/audio/render.ts`: offline render from project note state.
- `src/audio/scheduler.ts`: realtime render from project note state.
- `src/styles.css`: interactive note-grid and editor controls.
- `harness/scripts/run_qa.py`: static checks for the new editing surface.

## Constraints

- QA and review are separate loops.
- Do not create or use `docs/plan`.
- Keep sampling as an optional extension.
- No real user audio or copyrighted fixtures.

## Implementation Plan

- [x] Create task worktree and active plan.
- [x] Add scale helper data and pitch lanes.
- [x] Convert 808 and melody display grids into interactive note editors.
- [x] Add selected-note shaping controls for length, glide, and velocity.
- [x] Update docs and QA checks.
- [x] Run validation and browser interaction checks.
- [x] Complete plan and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`: passed.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run verify`: passed.
- Browser interaction check: passed. Added an 808 note, toggled glide in Studio mode, added and removed a melody note, played the edited project, stopped playback, and confirmed no browser console errors.

## Review Plan

QA completed before review. Review mirror is recorded in `docs/reviews/plan-005-scale-note-editor-review.md`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Prioritize editable 808/melody grids after realtime playback. | Direct composition is central to the product and currently weaker than drum editing. |
| 2026-06-15 | Keep editing event-based and in-key by default. | This supports beginners without turning GrooveForge into a sample-chopping app. |
| 2026-06-15 | Make Studio controls contextual to the selected note. | Beginners can click notes without extra controls, while working users can shape length, glide, and velocity. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Opened plan for scale-aware 808 and melody editing. |
| 2026-06-15 | harness_builder | Added key-derived pitch lanes, interactive note buttons, selected-note shaping, and QA expectations. |
| 2026-06-15 | quality_runner | Ran static QA, quality gate, typecheck, build, verify, and browser interaction checks. |
| 2026-06-15 | review_judge | Created review mirror with no blocking findings. |

## Completion Notes

GrooveForge now supports direct 808 and melody composition through scale-aware note grids. The edited project state feeds the existing realtime playback and WAV export paths, while Studio mode adds contextual note shaping for selected bass and melody notes.
