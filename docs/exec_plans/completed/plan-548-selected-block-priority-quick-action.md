# plan-548-selected-block-priority-quick-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a Quick Actions command for the current Selected Block Edit Priority recommendation so users can explicitly run the recommended copy, paste, duplicate, split, merge, or move edit through the existing selected-block handlers.

## Non-Goals

- Do not auto-run the priority recommendation.
- Do not change selected-block edit semantics, individual Quick Actions commands, clipboard contents, undo/redo history behavior, playback scheduling, save/load, export, or project schema.
- Do not add confirmation modals, tutorials, remote analysis, AI arrangement, sampling, imported audio, plugin hosting, accounts, analytics, or cloud sync.
- Do not persist Selected Block Edit Priority state in project data or undo history.

## Context Map

- `src/ui/App.tsx` owns Quick Actions creation, selected arrangement block edit handlers, Selected Block Edit Priority derivation, and Quick Action result copy.
- `README.md` and `docs/product/product.md` describe selected-block Quick Actions and arrangement editing.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce selected-block edit and Quick Actions guardrails.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Route the priority command only through existing selected-block handlers.

## Implementation Plan

- [x] Derive the active Selected Block Edit Priority summary inside Quick Actions creation.
- [x] Add one explicit Quick Action that runs the priority action through existing selected-block handlers and disables when no valid recommendation exists.
- [x] Update Quick Action result copy for the new priority command while preserving individual selected-block result behavior.
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
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-20 | `npm run typecheck` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_quality_gate.py` | Passed. |
| 2026-06-20 | `npm run build` | Passed with existing Vite chunk-size warning. |
| 2026-06-20 | `npm run qa` | Passed. |
| 2026-06-20 | `npm run verify` | Passed with runtime smoke coverage for 14/14 sample-free blueprints and 14/14 supported style profiles; existing Vite chunk-size warning remains. |
| 2026-06-20 | `npm run dev` | Escalated run started Vite on `127.0.0.1:5173`; in-app Browser tooling was unavailable in this session and sandboxed `curl` could not connect to the escalated server process, so visual preview remained unverified. Server was stopped. |

## Review Plan

QA completes before review starts.

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The Selected Block Priority Quick Action is explicit, disabled without a valid recommendation, routes only through existing selected-block handlers, and does not alter direct command routing, project schema, undo semantics, playback, save/load, or export. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add an explicit Selected Block Priority Quick Action. | The readout helps users decide the next structure edit; command-palette access lets beginners follow that recommendation and producers run it quickly without bypassing existing edit handlers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 547 completed plans, no active plans, and next regular progress report due at plan-550 completion. |
| 2026-06-20 | harness_builder | Added `selected-block-priority-edit`, priority-summary routing through existing selected-block handlers, Quick Action follow-up copy, docs, and QA token coverage. |
| 2026-06-20 | quality_runner | Completed documented QA commands; dev server started after approval but visual preview could not be verified because Browser tooling was unavailable and sandboxed curl could not reach the escalated server. |
