# plan-084-drum-accent-pads

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add Drum Accent Pads to the Pattern editor so beginners can make a programmed beat hit with clearer Soft, Knock, Ghost, or Lift dynamics in one explicit click, while working producers can quickly shape selected Pattern A/B/C drum velocity data without losing editable event state.

## Non-Goals

- No project schema fields.
- No new drum lanes, sample import, chopping, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No hidden generation, autoplay, background mutation, or arrangement mutation.
- No changes to realtime playback, WAV/stem export, or MIDI export semantics beyond existing paths naturally rendering edited drum velocity values.

## Context Map

- `src/ui/App.tsx` owns the Pattern editor, selected Pattern A/B/C mutation path, drum velocity display, and selected drum inspector.
- `src/domain/workstation.ts` owns drum velocity normalization, Pattern data, playback/export consumers, and Pattern state.
- `src/styles.css` owns compact workstation controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` keep product and QA expectations aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Drum Accent Pads must be deterministic and operate only on the selected Pattern A/B/C slot.
- Accent clicks must route through existing undoable project update paths.
- Results must remain editable local drum velocity data through existing velocity controls.

## Implementation Plan

- [x] Add Drum Accent model and deterministic Pattern velocity transformation helper.
- [x] Add undoable Drum Accent application to selected Pattern drum velocity data.
- [x] Add a compact Drum Accent Pads row near Groove Feel and Pattern tools.
- [x] Update docs and QA expectations for direct-composition Drum Accent Pads.

## QA Plan

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser smoke: click Drum Accent Pads, confirm selected Pattern active drum count stays stable, visible velocity/step state changes, undo restores previous values, console errors empty, and no horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Drum Accent Pads are local, deterministic, explicit-click, undoable, editable velocity transformations and do not introduce sampling-first, hidden generation, remote AI, or export regressions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Drum Accent Pads after Groove Feel Pads. | Groove Feel covers timing/chance; velocity accents are the next high-impact direct-composition control for beginners and working producers without adding sampling scope. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created from clean main after plan-083. |
| 2026-06-16 | project_lead | Implemented Drum Accent Pads for editable selected-Pattern velocity shaping. |
| 2026-06-16 | harness_builder | Updated product docs, quality guardrails, and QA expectations for Drum Accent Pads. |
| 2026-06-16 | quality_runner | Ran typecheck, verify, qa, diff check, and browser smoke. |
| 2026-06-16 | review_judge | Reviewed completed implementation after QA and found no blocking issues. |

## Completion Notes

Completed. The Pattern editor now includes Drum Accent Pads for Soft, Knock, Ghost, and Lift velocity shaping. Applying an accent updates only active drum velocities in the selected Pattern A/B/C slot through existing undoable project history while preserving active drum steps, note events, chord events, timing/chance data, arrangement, mixer, and export semantics.

QA passed with `npm run typecheck`, `npm run verify`, `npm run qa`, `python3 harness/scripts/run_qa.py`, and `git diff --check`. Browser smoke at `http://127.0.0.1:5193/` confirmed the Knock accent kept active drums at 18, active notes at 9, and chord slots at 4; changed visible active-step velocity values; undo restored the previous Pattern state; console errors were empty; and horizontal overflow was false.
