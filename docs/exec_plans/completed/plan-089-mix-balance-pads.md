# plan-089-mix-balance-pads

## Status

active

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add Mix Balance Pads to the Mixer so beginners can quickly set a useful rough balance and working producers can apply common editable mix postures to local mixer state with one explicit click.

## Non-Goals

- No project schema fields.
- No new audio engine, limiter, loudness standard, LUFS/true-peak claims, automatic mastering, remote analysis, remote AI, accounts, analytics, cloud sync, sample import, chopping, sampler tracks, or plugin hosting.
- No hidden background mutation, autoplay, render download, arrangement mutation, musical event mutation, sound-design mutation, master preset mutation, or Delivery Target mutation.
- No changes to realtime playback, WAV/stem export, MIDI export, project save/load, snapshots, Handoff Sheet, Beat Readiness, Beat Map, Next Move, Mix Coach, or Mix Fix semantics beyond existing paths naturally reading edited mixer values.

## Context Map

- `src/ui/App.tsx` owns Mixer UI, mixer channel update path, Mix Coach, Mix Fix, Quick Actions, selected state cleanup, and undoable project history.
- `src/domain/workstation.ts` owns mixer channel shape, defaults, normalization, save/load migration, playback/export consumers, and project state.
- `src/styles.css` owns compact workstation controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` keep product and QA expectations aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Mix Balance Pads must be deterministic, explicit-click, local-only, and undoable.
- Pads must update only editable mixer channel values through existing project history.
- Results must remain manually editable through the existing Mixer controls and preserve render/export semantics.

## Implementation Plan

- [x] Add Mix Balance Pad model and deterministic mixer transformation helper.
- [x] Add undoable Mix Balance Pad application to mixer channel volume, pan, EQ, Drive/Glue, and Space send values.
- [x] Add a compact Mix Balance Pads row to the Mixer panel.
- [x] Update docs and QA expectations for direct-composition rough-balance workflow.

## Validation

- [x] `npm run typecheck`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run verify`
- [x] `npm run qa`
- [x] `git diff --check`
- [x] Browser smoke: clicked Club Mix Balance Pad, confirmed mixer channel values visibly updated at 0.1 dB resolution, musical event counts stayed stable, Undo restored prior visible mixer values, console errors were empty, and no horizontal overflow was present.

## Review Plan

QA completes before review starts. Review checks that Mix Balance Pads are local, deterministic, explicit-click, undoable mixer-state transformations and do not introduce hidden mastering, sampling-first, remote analysis, remote AI, export downloads, arrangement mutation, or musical event mutation.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Mix Balance Pads after Chord Rhythm Pads. | The core composition pads now cover drums, 808, melody, and chords; rough balance is the next repeated beginner/producer step before export polish. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-089 from clean main after plan-088. |
| 2026-06-16 | harness_builder | Added Mix Balance Pads model, undoable mixer-state handler, Mixer panel UI, styles, docs, and QA expectations. |
| 2026-06-16 | quality_runner | Ran typecheck and static QA after implementation. |
| 2026-06-16 | quality_runner | Ran browser smoke after implementation and tightened mixer volume slider resolution to preserve 0.1 dB pad values in the UI. |
| 2026-06-16 | quality_runner | Ran final verify, npm QA, and diff check. |
| 2026-06-16 | review_judge | Reviewed Mix Balance Pads as local, deterministic, explicit-click mixer-state edits with no hidden mastering, sampling-first scope expansion, remote analysis, render download, arrangement mutation, or musical event mutation. |

## Completion Notes

Mix Balance Pads are complete for plan-089. The Mixer now has Clean, Vocal, Club, and Wide pads that apply editable rough-balance mixer channel volume, pan, low-cut, air, Drive/Glue, and Space send values through undoable project history. Musical events, arrangement, sound design, master preset, Delivery Target, render/export semantics, and local-only boundaries remain unchanged. Validation plus browser smoke passed.
