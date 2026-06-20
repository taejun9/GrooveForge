# plan-547-selected-block-edit-priority

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a UI-local Selected Block Edit Priority Readout to the selected arrangement block editor so users can see the safest next manual structure edit before clicking copy, paste, duplicate, split, merge, move, or delete.

## Non-Goals

- Do not change selected-block edit semantics, Quick Actions command routing, clipboard contents, undo/redo history behavior, playback scheduling, save/load, export, or project schema.
- Do not auto-run arrangement edits, add confirmation modals, add tutorials, remote analysis, AI arrangement, sampling, imported audio, plugin hosting, accounts, analytics, or cloud sync.
- Do not persist Selected Block Edit Priority state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns the selected arrangement block editor, selected-block edit handlers, Quick Actions selected-block commands, and result strips.
- `src/ui/workstationUiModel.ts` defines UI model types for arrangement readouts and result summaries.
- `src/styles.css` contains selected arrangement block editor and readout styling.
- `README.md` and `docs/product/product.md` describe editable arrangement block controls and selected-block Quick Actions.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce selected-block edit guardrails and expected UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the priority readout derived only from local arrangement blocks, selected block state, clipboard state, block count, bar count, and existing selected-block edit affordances.

## Implementation Plan

- [x] Add typed Selected Block Edit Priority summary data.
- [x] Derive the current safest selected-block edit recommendation from local selected-block, neighbor, clipboard, bar-count, block-count, and arrangement-length state.
- [x] Render a compact read-only priority strip near the selected-block structure controls with stable test ids and no project persistence.
- [x] Add CSS for desktop/mobile containment.
- [x] Update README, product docs, quality rules, and QA token expectations.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Dev server smoke attempt and escalated retry if sandbox blocks binding.

## QA Log

| date | command | result |
|---|---|---|
| 2026-06-20 | `git diff --check` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Passed after correcting the App-only QA token list. |
| 2026-06-20 | `npm run typecheck` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_quality_gate.py` | Passed. |
| 2026-06-20 | `npm run build` | Passed with existing Vite chunk-size warning. |
| 2026-06-20 | `npm run qa` | Passed. |
| 2026-06-20 | `npm run verify` | Passed with runtime smoke coverage for 14/14 sample-free blueprints and 14/14 supported style profiles; existing Vite chunk-size warning remains. |
| 2026-06-20 | `npm run dev` | Blocked by sandbox `listen EPERM` on `127.0.0.1:5173`; escalated retry was rejected by environment policy. |

## Review Plan

QA completes before review starts.

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. Selected Block Edit Priority Readout is UI-local, read-only, derived from selected arrangement blocks and clipboard state, and does not alter selected-block edit semantics, Quick Actions routing, project schema, undo, playback, save/load, or export. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add Selected Block Edit Priority Readout. | Manual arrangement structure editing now has result feedback, but users still need a local pre-click recommendation that points to the safest next edit without automating song-form changes. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 546 completed plans, no active plans, and next regular progress report due at plan-550 completion. |
| 2026-06-20 | harness_builder | Added Selected Block Edit Priority types, readout, local recommendation helper, responsive styling, docs, and QA token coverage. |
| 2026-06-20 | quality_runner | Completed documented QA commands; dev server smoke remained blocked by sandbox localhost binding policy. |
