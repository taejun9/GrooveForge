# plan-577-sound-snapshot-decision-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report progress every 10 completed plans.

## Goal

Add an explicit action button to the Sound Snapshot A/B status readout so the current capture or recall recommendation can run through the existing Sound Snapshot capture/recall handlers from the readout itself.

## Non-Goals

- Do not change Sound Snapshot score logic, comparison metrics, captured payload shape, project schema, playback, export behavior, snapshots, or undo semantics.
- Do not add automatic recall, automatic capture, tone auto-correction, audio analysis, sample browsing, chopping, sampler setup, imported audio, or sampling-first onboarding.
- Do not trigger more than one Sound Snapshot capture or recall from a single visible readout click.
- Do not add remote AI, cloud sync, accounts, analytics, payments, autoplay, auto-mixing, auto-mastering, auto-export, or command chains.
- Do not persist Sound Snapshot action state in project data, localStorage, or undo history.

## Context Map

- `src/ui/App.tsx` derives Sound Snapshot comparisons, owns capture/recall/clear handlers, and passes Sound Snapshot props into the sound panel.
- `src/ui/workstationComposePanels.tsx` renders Sound Snapshot A/B controls and status readout.
- `src/ui/workstationUiModel.ts` owns Sound Snapshot summary types.
- `src/styles.css` owns Sound Snapshot A/B layout and action controls.
- `README.md` and `docs/product/product.md` describe Sound Snapshot behavior.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce direct-composition guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Route the visible readout action only through existing Sound Snapshot capture or recall handlers.
- This is `plan-577`; the next requested 10-plan progress report is due after `plan-580`.

## Implementation Plan

- [x] Add a derived Sound Snapshot action target.
- [x] Add a visible readout action button.
- [x] Route capture targets through the existing capture handler.
- [x] Route recall targets through the existing undoable recall handler.
- [x] Update layout and stable QA tokens for the added button.
- [x] Update README, product docs, quality rules, and QA expectations.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Dev server smoke attempt and Browser preview if tooling is available.

## Review Plan

QA completes before review starts.

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
| 2026-06-20 | `npm run dev -- --host 127.0.0.1` | Sandbox attempt failed with expected `listen EPERM`; approved dev server started on `127.0.0.1:5173`. |
| 2026-06-20 | `curl -I http://127.0.0.1:5173/` | Sandbox attempt could not connect; approved request returned `HTTP/1.1 200 OK`; dev server was stopped. |
| 2026-06-20 | Review loop: `git diff --check` | Passed. |
| 2026-06-20 | Review loop: `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-20 | Post-move `python3 harness/scripts/run_qa.py` | Passed after moving the plan to completed and adding the review mirror. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The visible Sound Snapshot A/B readout action is derived from slot state, routes through existing capture/recall handlers, and does not alter saved project data, scoring, playback, export, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Sound Snapshot A/B readout action. | Producers need faster tone-pass recall, and first-time composers need one explicit next sound-design step without hidden tone correction or sampling scope. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 576 completed plans, no active plans, and the next 10-plan progress report due at plan-580. |
| 2026-06-20 | harness_builder | Added the Sound Snapshot A/B readout action target, visible action button, existing capture/recall handler routing, responsive styles, and harness expectations. |
| 2026-06-20 | quality_runner | Completed QA and dev server smoke for the Sound Snapshot A/B readout action. |
| 2026-06-20 | review_judge | Completed review after QA with no findings. |
