# plan-549-selected-block-priority-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add an explicit action button to the Selected Block Edit Priority Readout so users can run the recommended selected-block edit from the visible arrangement editor while still routing through the existing copy, paste, duplicate, split, merge, move, and delete handlers.

## Non-Goals

- Do not auto-run the priority recommendation.
- Do not change selected-block edit semantics, direct edit buttons, Quick Actions command routing, clipboard contents, undo/redo history behavior, playback scheduling, save/load, export, or project schema.
- Do not add confirmation modals, tutorials, remote analysis, AI arrangement, sampling, imported audio, plugin hosting, accounts, analytics, or cloud sync.
- Do not persist Selected Block Edit Priority state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns the selected arrangement block editor, Selected Block Edit Priority readout, selected-block edit handlers, and Quick Actions routing.
- `src/styles.css` owns the selected-block priority readout layout.
- `README.md` and `docs/product/product.md` describe selected-block arrangement editing.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce selected-block edit and Quick Actions guardrails.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Route the visible priority action only through existing selected-block handlers.

## Implementation Plan

- [x] Add a visible action button to `SelectedBlockEditPriorityReadout`.
- [x] Route the button through the same local priority action mapping used by the selected-block priority Quick Action.
- [x] Keep disabled and no-op behavior for missing recommendations.
- [x] Update responsive styling and stable test ids.
- [x] Update README, product docs, quality rules, and QA token expectations.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Dev server smoke attempt and Browser preview if tooling is available.

## QA Log

| date | command | result |
|---|---|---|
| 2026-06-20 | `git diff --check` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-20 | `npm run typecheck` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_quality_gate.py` | Passed. |
| 2026-06-20 | `npm run build` | Passed with the existing Vite large chunk warning. |
| 2026-06-20 | `npm run qa` | Passed. |
| 2026-06-20 | `npm run verify` | Passed, including runtime smoke for 14/14 sample-free blueprints and 14/14 supported style profiles. |
| 2026-06-20 | `npm run dev -- --host 127.0.0.1` | Sandbox run failed with `listen EPERM`; escalated run started Vite at `http://127.0.0.1:5173/`. |
| 2026-06-20 | `curl -I http://127.0.0.1:5173/` | Sandbox curl could not reach the escalated server; escalated curl returned `HTTP/1.1 200 OK`. Browser control tooling was unavailable in this session. Dev server was stopped. |

## Review Plan

QA completes before review starts.

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The visible action routes through the shared selected-block priority runner, stays UI-local when no recommendation exists, and does not touch domain, audio, project schema, playback, or export code. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Selected Block Priority action. | Command-palette access helps fast users, but beginners need the same recommendation to be actionable directly inside the arrangement editor without hunting for individual structure controls. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 548 completed plans, no active plans, and next regular progress report due at plan-550 completion. |
| 2026-06-20 | harness_builder | Added the visible Selected Block Priority action button, shared priority action runner, responsive button styling, docs updates, and QA token coverage. |
| 2026-06-20 | quality_runner | Completed the documented QA commands; Browser tooling was unavailable, so dev-server verification used local HTTP response checks. |
