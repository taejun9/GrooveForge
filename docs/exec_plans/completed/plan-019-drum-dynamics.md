# plan-019-drum-dynamics

## Status

active

## Owner

project_lead / harness_builder

## User Request

이 제품을 현직 작곡가도 만족할 수 있고, 작곡을 처음 해보는 사람도 사용하기 쉬운 데스크탑 앱으로 완성시켜줘.

## Goal

Add editable drum dynamics so programmed beats feel less static and more producer-ready without making the app harder for beginners. The first slice is per-step drum velocity plus hat repeat support that affects realtime playback, WAV/stem export, save/load, undo/redo, and style templates.

## Non-Goals

- No sampling, audio import, chopping, sampler tracks, or audio warping.
- No 32-step grid, piano-roll rewrite, microtiming engine, flam editor, or probability engine in this plan.
- No external drum kits or copyrighted audio fixtures.

## Context Map

- `src/domain/workstation.ts`: project types, starter patterns, style templates, cloning, empty patterns, save/load validation.
- `src/audio/scheduler.ts`: realtime drum scheduling.
- `src/audio/render.ts`: offline WAV/stem drum rendering.
- `src/ui/App.tsx`: drum grid, selected pattern state, undoable project updates.
- `src/styles.css`: drum grid and control styling.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product surface and QA gates.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-019-drum-dynamics` and `.worktree/plan-019-drum-dynamics` for git repository work.
- Preserve the composition-first invariant: dynamics are musical event data, not imported audio samples.
- Existing `.grooveforge.json` files without drum velocity or repeat data must migrate safely.

## Implementation Plan

- [x] Add `drumVelocities` and `hatRepeats` to pattern data with migration/cloning/empty-pattern support.
- [x] Apply drum velocity and hat repeat in realtime playback.
- [x] Apply drum velocity and hat repeat in WAV and stem export.
- [x] Add beginner-safe UI controls for selected drum-step velocity and hat repeat.
- [x] Update starter/style patterns with useful default dynamics.
- [x] Update docs and static QA expectations.
- [x] Verify with automated QA and browser interaction.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Browser check at the local Vite app: select a drum step, adjust velocity, set hat repeat on an active hat, verify readouts and undo/redo, start/stop playback, export analysis remains non-silent, and confirm no console errors.

## Review Plan

QA completes before review starts. Review checks that dynamics migrate old projects, preserve Pattern A/B/C independence, affect both realtime/export paths, remain beginner-discoverable, and do not introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Implement drum dynamics before larger timeline features. | Velocity and hat repeat are immediately valuable to working beatmakers and help beginners make less mechanical patterns. |
| 2026-06-15 | Store dynamics alongside existing boolean drum steps. | This keeps compatibility with the current grid and existing project files while allowing richer event playback. |
| 2026-06-15 | Active drum-step first click selects, second click toggles off. | Selecting an active step must not destroy the hit before users can edit its dynamics. |
| 2026-06-15 | Add both range and percent number input for velocity. | Producers need precision, and beginners need visible feedback beyond a small slider. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created for drum velocity and hat repeat support. |
| 2026-06-15 | harness_builder | Added pattern-level drum velocity and hat repeat data with clone, empty-pattern, style-template, and project-file migration support. |
| 2026-06-15 | harness_builder | Realtime playback and offline WAV/stem rendering now scale drum gain by velocity and schedule repeated hats inside a step. |
| 2026-06-15 | harness_builder | Added a selected drum-step inspector with velocity slider, percent input, and hat repeat buttons. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for drum dynamics. |
| 2026-06-15 | quality_runner | Passed `npm run qa`, `npm run verify`, and `git diff --check`. |
| 2026-06-15 | quality_runner | Browser validation passed: selected active Hat 3 without turning it off, changed velocity to 42%, set repeat to 4x, Pattern A rose from 34 to 37 events, undo returned to 34, redo restored 37, reselect showed Hat 3 42%/4x, playback start/stop worked, and console error logs were empty. |
| 2026-06-15 | quality_runner | Domain validation passed: `serializeProjectFile`/`parseProjectFile` round-tripped velocity 0.42 and repeat 4, old pattern data without dynamics migrated to 16-step velocity/repeat arrays, and malformed dynamics were rejected. |

## Completion Notes

Drum programming now supports editable per-step velocity and hat repeat dynamics as local musical event data. Dynamics affect realtime playback, offline WAV/stem export, save/load migration, style templates, pattern copy/clear, and undo/redo without introducing sampling workflow dependencies.
