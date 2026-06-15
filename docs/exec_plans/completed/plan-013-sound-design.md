# plan-013-sound-design

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Move GrooveForge toward a desktop app that working composers can respect while remaining easy for beginners.

## Goal

Add the first real sound-design layer for built-in instruments: editable tone presets and core parameters that affect realtime playback, WAV export, save/load, and the workstation UI.

## Non-Goals

- No plugin hosting, VST/AU support, or native DSP framework.
- No sample import, sampler tracks, chopping, or audio warping.
- No full modulation matrix, automation lanes, or patch browser.
- No third-party audio assets or copyrighted presets.

## Context Map

- `src/domain/workstation.ts`: project state, preset data, migration/validation.
- `src/audio/scheduler.ts`: realtime synth/drum scheduling.
- `src/audio/render.ts`: offline WAV rendering.
- `src/ui/App.tsx`: device panel, Guided/Studio controls, project editing.
- `src/styles.css`: sound design control layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA expectations.
- `harness/scripts/run_qa.py`: durable validation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Preserve the composition-first invariant: sound design improves generated instruments and must not make sampling a prerequisite.

## Implementation Plan

- [x] Add instrument sound preset and parameter types to project state.
- [x] Add starter sound design values and migration for older project files.
- [x] Make realtime playback use the selected kick, clap, hat, perc, 808, synth, and chord tone parameters.
- [x] Make offline WAV export use the same sound design state.
- [x] Add beginner-friendly preset buttons plus Studio parameter controls.
- [x] Update docs and QA expectations.
- [x] Run QA/build/browser verification.
- [x] Move plan to completed and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `npm run verify`
- `git diff --check`
- Browser check against local dev server:
  - applied `Warm Tape`,
  - switched to `Studio`,
  - changed `808 drive` to `77`,
  - changed `Chord width` to `82`,
  - verified readouts and device text updated,
  - started playback and checked no console errors.

## Review Plan

QA completed before review. Review checked that sound design state is persistent, validated, and audible in realtime/export without changing the product into a sampling workflow.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Implement parameterized internal instruments before sampling or plugin hosting. | The user wants professional usefulness and beginner ease; editable built-in tone controls improve both while preserving sample-free beat creation. |
| 2026-06-15 | Keep Guided presets and Studio fine controls in one project state. | Beginners need fast tonal choices, while experienced users need direct parameters that save and export reliably. |
| 2026-06-15 | Use simple Web Audio/filter/drive shaping for the first pass. | This gives audible differences in realtime and export without adding a heavy DSP dependency before the workstation workflow is proven. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Created plan for first sound design controls. |
| 2026-06-15 | harness_builder | Added sound preset state, migration, UI controls, realtime audio shaping, and export shaping. |
| 2026-06-15 | quality_runner | Ran QA, typecheck, verify, diff check, and Browser validation. |
| 2026-06-15 | review_judge | Completed review mirror with residual risk notes. |

## Completion Notes

GrooveForge now has a first sound-design layer for built-in instruments. Guided users can apply curated tone presets, Studio users can edit kick punch, snare snap, hat brightness, 808 drive/decay, synth brightness/release, and chord warmth/width, and those values are stored in project state.

Realtime playback and WAV export now both read the same sound design state. Older project files without sound data migrate to the default `Clean Knock` tone.
