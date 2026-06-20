# plan-585-mix-balance-preview-decision-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Add a UI-local Mix Balance Preview Decision Readout so the current rough-balance suggestion exposes readiness, channel/control move scope, and an explicit Apply Suggested Balance action before users commit mixer changes across drums, 808, synth, and chords.

## Non-Goals

- Do not change Mix Balance pad definitions, suggestion scoring, Mix Fix behavior, Mix Snapshot behavior, Space FX behavior, mixer schema, playback scheduling, export, render, MIDI, snapshots, local draft recovery, or undo semantics.
- Do not auto-apply mix balance pads, auto-play, change the suggested balance without local mixer changes, hide existing Mix Balance pad buttons, or trigger more than one mix-balance operation from one action.
- Do not add imported audio, reference-track upload, audio analysis, sample browsing, chopping, sampler setup, sample-first onboarding, remote AI, cloud sync, accounts, analytics, payments, plugin hosting, auto-mixing, auto-mastering, auto-export, or command chains.
- Do not persist Mix Balance decision state in project data, localStorage, or undo history.

## Context Map

- `src/ui/workstationMixPanels.tsx` renders Mix Balance Preview, Mix Balance pad controls, and Mix Balance Result inside the Mix panel.
- `src/ui/App.tsx` derives `MixBalancePreviewSummary` and routes existing undoable Mix Balance pad apply behavior.
- `src/ui/workstationUiModel.ts` owns UI model types shared by workstation panels.
- `README.md` and `docs/product/product.md` describe the direct-composition mix workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce local-first direct beat-making and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Derive the readout only from current local mixer state, existing Mix Balance Pad definitions, and existing Mix Balance Preview data.
- Route the visible decision action only through the existing Mix Balance pad apply path.
- This is `plan-585`; the next requested 10-plan progress report is due after `plan-590`.

## Implementation Plan

- [x] Add explicit mix move counts and a typed Mix Balance Preview Decision model.
- [x] Render the decision readout near the Mix Balance Preview.
- [x] Route the visible decision action through the existing Mix Balance apply handler and disable it when aligned.
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
| 2026-06-20 | Post-move `python3 harness/scripts/run_qa.py` | Passed after moving the plan to completed and adding the review mirror. |
| 2026-06-20 | Post-move `git diff --check` | Passed. |
| 2026-06-20 | Final precommit `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-20 | Final precommit `git diff --check` | Passed. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The Mix Balance Preview Decision Readout derives from local preview data and `changedControls`, disables the visible action when the suggested rough balance is already aligned, routes the visible action through the existing undoable Mix Balance apply handler, and preserves project schema, playback, export, Mix Coach, Stem Audition, Mix Snapshot, Space FX, Master Finish, and sampling boundaries. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Mix Balance Preview Decision Readout. | Mix Balance Preview already suggests a rough mixer posture and Quick Actions can apply it, but the visible Mix panel needs an explicit local decision surface for beginners and producers to commit balance changes without making sampling or external analysis central. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming main is clean, active plans are empty, and the next 10-plan progress report is due after plan-590. |
| 2026-06-20 | harness_builder | Added the Mix Balance Preview Decision model, visible decision readout, Apply routing, responsive styling, documentation, quality guardrails, and harness expectations. |
| 2026-06-20 | quality_runner | Completed QA, verify, and dev server smoke for the Mix Balance Preview Decision Readout. |
| 2026-06-20 | review_judge | Completed review with no findings after confirming the decision readout stays UI-local, uses `changedControls`, and routes through the existing Mix Balance apply path. |
