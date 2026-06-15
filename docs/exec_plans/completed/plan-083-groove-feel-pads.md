# plan-083-groove-feel-pads

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add Groove Feel Pads to the Pattern editor so beginners can give a programmed beat a clearer Tight, Pocket, Push, or Lazy feel with one explicit click, while working producers can quickly shape selected Pattern A/B/C drum timing and musical-event chance without losing editable event data.

## Non-Goals

- No project schema fields.
- No audio recording, sample import, chopping, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No hidden generation, autoplay, or background mutation.
- No changes to realtime playback, WAV/stem export, or MIDI export semantics beyond existing paths naturally rendering edited timing/chance values.

## Context Map

- `src/ui/App.tsx` owns the Pattern editor, selected Pattern A/B/C mutation paths, drum timing/probability display, note/chord probability controls, and selected event state.
- `src/domain/workstation.ts` owns Pattern data, drum timing/probability helpers, note/chord event shapes, normalization, playback/export consumers, and Pattern state.
- `src/styles.css` owns compact workstation controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` keep product and QA expectations aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Groove Feel Pads must be deterministic and operate only on the selected Pattern A/B/C slot.
- Feel clicks must route through existing undoable project update paths.
- Results must remain editable local musical event data through existing timing, chance, note, and chord controls.

## Implementation Plan

- [x] Add Groove Feel model and deterministic Pattern transformation helper.
- [x] Add undoable Groove Feel application to selected Pattern drum timing/probability and note/chord probability data.
- [x] Add a compact Groove Feel Pads row near the Pattern tools.
- [x] Update docs and QA expectations for direct-composition Groove Feel Pads.

## QA Plan

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser smoke: click Groove Feel Pads, confirm selected Pattern event counts stay stable, drum timing/chance values change, undo restores previous values, console errors empty, and no horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Groove Feel Pads are local, deterministic, explicit-click, undoable, editable timing/chance transformations and do not introduce sampling-first, hidden generation, remote AI, or export regressions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Groove Feel Pads after Pattern Stack Pads. | Coherent notes are now easy to start; the next usability gap is making programmed beats feel less static while preserving editable event data. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created from clean main after plan-082. |
| 2026-06-16 | project_lead | Implemented Groove Feel Pads for editable timing/chance feel shaping. |
| 2026-06-16 | harness_builder | Updated product docs, quality guardrails, and QA expectations for Groove Feel Pads. |
| 2026-06-16 | quality_runner | Ran typecheck, build, quality gate, verify, qa, diff check, and browser smoke. |
| 2026-06-16 | review_judge | Reviewed completed implementation after QA and found no blocking issues. |

## Completion Notes

Completed. The Pattern editor now includes Groove Feel Pads for Tight, Pocket, Push, and Lazy feel shaping. Applying a feel updates only the selected Pattern A/B/C drum timing, drum chance, 808/Synth note chance, and chord chance through existing undoable project history while preserving event counts and editable local event data.

QA passed with `npm run typecheck`, `npm run build`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, `npm run qa`, and `git diff --check`. Browser smoke at `http://127.0.0.1:5192/` confirmed the Pocket feel kept active drums at 18, active notes at 9, and chord slots at 4; added drum, note, and chord chance/timing indicators; undo restored the previous Pattern state; console errors were empty; and horizontal overflow was false.
