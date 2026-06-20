# plan-550-arrangement-move-priority-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add an explicit action button to the Arrangement Move Priority Readout so users can run the currently recommended Drop, Build, Hook Lift, or Reset move directly from the arrangement editor while still routing through the existing Arrangement Move handler and result feedback.

## Non-Goals

- Do not auto-run the priority recommendation.
- Do not change Arrangement Move preset definitions, direct pad behavior, Quick Actions routing, undo/redo behavior, playback scheduling, save/load, export, or project schema.
- Do not add confirmation modals, tutorials, remote analysis, AI arrangement, sampling, imported audio, plugin hosting, accounts, analytics, or cloud sync.
- Do not persist Arrangement Move Priority state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns Arrangement Move summary derivation, visible pads, Priority Readout, Result feedback, and Quick Actions routing.
- `src/styles.css` owns Arrangement Move priority readout layout.
- `README.md` and `docs/product/product.md` describe arrangement editing and Arrangement Move controls.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Arrangement Move guardrails.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Route the visible priority action only through the existing Arrangement Move handler.

## Implementation Plan

- [x] Add a visible action button to `ArrangementMovePriorityReadout`.
- [x] Route the button through the same local move action path used by the current Arrangement Move Quick Action.
- [x] Keep disabled and no-op behavior when no selected block or recommendation exists.
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
| 2026-06-20 | review_judge | No findings. The visible action routes only through `applyArrangementMoveToSelected`, disables when no local recommendation exists, preserves Arrangement Move Result feedback, and does not touch domain, audio, project schema, playback, or export code. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Arrangement Move Priority action. | Beginners need the recommended structure move to be directly actionable in the editor, while producers can keep using pads or Quick Actions for speed. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 549 completed plans, no active plans, and the next regular progress report is due at plan-550 completion. |
| 2026-06-20 | harness_builder | Added the visible Arrangement Move Priority action button, existing handler routing, responsive button styling, docs updates, and QA token coverage. |
| 2026-06-20 | quality_runner | Completed the documented QA commands; Browser tooling was unavailable, so dev-server verification used local HTTP response checks. |
| 2026-06-20 | project_lead | Ten-plan checkpoint reached at plan-550: completed 550 plans with 0 active plans after merge. |
