# plan-584-sound-focus-preview-decision-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Add a UI-local Sound Focus Preview Decision Readout so the current suggested tone-focus pad exposes readiness, tone-move scope, and an explicit Apply Suggested Focus action before users commit kick, 808, sidechain, synth, and chord tone changes.

## Non-Goals

- Do not change Sound Focus pad definitions, suggestion scoring, Sound Preset behavior, Drum Kit behavior, Studio tone controls, project schema, playback scheduling, export, render, MIDI, snapshots, local draft recovery, or undo semantics.
- Do not auto-apply focus pads, auto-play, change the suggested focus without local SoundDesign changes, hide existing Sound Focus pad buttons, or trigger more than one sound-focus operation from one action.
- Do not add imported audio, sample browsing, chopping, sampler setup, sample-first onboarding, remote AI, cloud sync, accounts, analytics, payments, plugin hosting, auto-mixing, auto-mastering, auto-export, or command chains.
- Do not persist Sound Focus decision state in project data, localStorage, or undo history.

## Context Map

- `src/ui/workstationComposePanels.tsx` renders Sound Focus Preview, Sound Focus pad controls, and Sound Focus Result inside the Sound Designer.
- `src/ui/App.tsx` derives `SoundFocusPreviewSummary` and routes existing undoable Sound Focus pad apply behavior.
- `src/ui/workstationUiModel.ts` owns UI model types shared by workstation panels.
- `README.md` and `docs/product/product.md` describe the direct-composition Sound Designer workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce local-first direct beat-making and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Derive the readout only from current local `SoundDesign`, existing Sound Focus Pad definitions, and existing Sound Focus Preview data.
- Route the visible decision action only through the existing Sound Focus pad apply path.
- This is `plan-584`; the next requested 10-plan progress report is due after `plan-590`.

## Implementation Plan

- [x] Add explicit focus move count and a typed Sound Focus Preview Decision model.
- [x] Render the decision readout near the Sound Focus Preview.
- [x] Route the visible decision action through the existing Sound Focus apply handler and disable it when aligned.
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
| 2026-06-20 | Review fix: Quick Actions readiness | Applied: the current Sound Focus Quick Action now derives readiness from `changedMoves` instead of status-label text, matching the visible Preview Decision Readout. |
| 2026-06-20 | Review-fix `git diff --check` | Passed. |
| 2026-06-20 | Review-fix `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-20 | Review-fix `npm run typecheck` | Passed. |
| 2026-06-20 | Review-fix `npm run verify` | Passed, including runtime smoke for 14/14 sample-free blueprints and 14/14 supported style profiles. |
| 2026-06-20 | Post-move `python3 harness/scripts/run_qa.py` | Passed after moving the plan to completed and adding the review mirror. |
| 2026-06-20 | Post-move `git diff --check` | Passed. |
| 2026-06-20 | Final precommit `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-20 | Final precommit `git diff --check` | Passed. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings after review fix. The Sound Focus Preview Decision Readout derives from local preview data and `changedMoves`, disables the decision action when aligned, routes the visible action through the existing undoable Sound Focus apply handler, and preserves project schema, playback, export, Sound Preset, Drum Kit, Studio Tone, and sampling boundaries. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Sound Focus Preview Decision Readout. | Sound Focus Preview already suggests a tone posture and Quick Actions can apply it, but the visible Sound Designer needs an explicit local decision surface for beginners and producers to commit a focused tone move without making sampling central. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming main is clean, active plans are empty, and the next 10-plan progress report is due after plan-590. |
| 2026-06-20 | harness_builder | Added the Sound Focus Preview Decision model, visible decision readout, Apply routing, responsive styling, documentation, quality guardrails, and harness expectations. |
| 2026-06-20 | quality_runner | Completed QA, verify, and dev server smoke for the Sound Focus Preview Decision Readout. |
| 2026-06-20 | review_judge | Completed review, removed Sound Focus Quick Actions status-label coupling, and reran review-fix QA. |
