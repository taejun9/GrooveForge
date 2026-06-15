# plan-035-drum-probability

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add editable per-step drum probability so programmed beats can create intentional variation without relying on sampling. Beginners can make less repetitive hats/percussion, and working beatmakers can set controlled chance on ghost hits and fills.

## Non-Goals

- No MIDI input, recording, plugin hosting, audio sampling, sampler tracks, chopping, or audio warping.
- No note probability for 808, melody, or chords in this slice.
- No nondeterministic export randomness; WAV/stem export must stay reproducible.

## Context Map

- `src/domain/workstation.ts`: pattern data, migration, probability helpers.
- `src/audio/scheduler.ts`: realtime drum hit gating.
- `src/audio/render.ts`: deterministic offline render/stem gating.
- `src/ui/App.tsx`: drum step inspector and pattern editing.
- `src/styles.css`: inspector control layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: feature documentation and guardrails.
- `harness/scripts/run_qa.py`: static validation expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep probability as local musical event data; do not introduce sampling-first workflows or remote AI.

## Implementation Plan

- [x] Add `drumProbabilities` to Pattern A/B/C data with save/load migration.
- [x] Add deterministic probability helpers shared by realtime playback and offline render.
- [x] Add probability controls to the drum step inspector with undoable project edits.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA and browser validation, then complete lifecycle.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser validation: select a drum step, edit probability, verify readout/input state, play with no console errors, and confirm reset/migration behavior where practical.
- Domain validation: old project JSON migrates missing `drumProbabilities`; enabled probability serializes; deterministic gate returns stable results for the same project step.

## Review Plan

QA completes before review starts. Review checks that probability is pattern-scoped, deterministic for export, audible in realtime/export/stems, migrated for older projects, undoable, and still sample-free.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Implement drum probability before note probability. | Drum hats, percussion, ghost claps, and fills are the fastest way to make programmed beats feel less static for both beginners and producers. |
| 2026-06-15 | Use deterministic probability gates. | Export and saved-project reproducibility matter more than nondeterministic render variation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created for per-step drum probability. |
| 2026-06-15 | harness_builder | Added `drumProbabilities`, migration defaults to 100%, and deterministic `drumStepShouldPlay` helpers for realtime/export/stems. |
| 2026-06-15 | harness_builder | Added Drum Step Inspector `Chance` controls and undoable selected-step probability edits. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for drum probability. |
| 2026-06-15 | quality_runner | Domain compile/import check confirmed old project JSON migrates to 100%, 0% always skips, 100% always plays, and same seed decisions are stable. |
| 2026-06-15 | quality_runner | Browser validation confirmed Kick step Chance edits to 50%, readout shows `50% chance`, playback remains stable, and console errors are 0. |
| 2026-06-15 | quality_runner | `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check` passed. |
| 2026-06-15 | review_judge | Created completion review mirror with no blocking findings. |

## Completion Notes

Drum step probability is implemented as local pattern event data, migrated for old files, editable in the drum step inspector, and applied to realtime playback, WAV export, and stem export through deterministic gates.
