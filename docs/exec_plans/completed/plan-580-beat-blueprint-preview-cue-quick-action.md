# plan-580-beat-blueprint-preview-cue-quick-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report progress every 10 completed plans.

## Goal

Add a Quick Actions command for the current Beat Blueprint Preview Listening Cue so users can cue the recommended Song or Pattern loop from command search before applying a sample-free starter.

## Non-Goals

- Do not change Beat Blueprint definitions, preview scoring, apply behavior, project schema, playback scheduling, export, render, MIDI, snapshots, local draft recovery, or undo semantics.
- Do not add automatic playback, automatic blueprint apply, automatic preview switching, hidden generation, imported audio, sample browsing, chopping, sampler setup, or sampling-first onboarding.
- Do not trigger more than one cue operation from a single Quick Actions command.
- Do not add remote AI, cloud sync, accounts, analytics, payments, auto-mixing, auto-mastering, auto-export, or command chains.
- Do not persist Beat Blueprint cue action state in project data, localStorage, or undo history.

## Context Map

- `src/ui/App.tsx` creates Quick Actions, renders Beat Blueprints, derives Preview Listening Cue labels, and owns the existing transport loop selection handler.
- `README.md` and `docs/product/product.md` describe the sample-free Beat Blueprint starter workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce direct-composition guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Route the Quick Actions Beat Blueprint Preview Cue command only through existing transport loop selection.
- This is `plan-580`; include the requested 10-plan progress report after completion.

## Implementation Plan

- [x] Derive the current Beat Blueprint Preview Listening Cue action inside Quick Actions.
- [x] Add a searchable Quick Actions command for the cue target.
- [x] Route Song-loop and Pattern-loop cue targets through the existing Beat Blueprint preview cue handler.
- [x] Keep the command disabled/no-op while playback is running.
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
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Failed once because harness expected the old Beat Blueprint Preview Listening Cue docs text; fixed the harness expectations for the new Quick Actions cue wording. |
| 2026-06-20 | `git diff --check` | Passed after harness expectation update. |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-20 | `npm run typecheck` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_quality_gate.py` | Passed. |
| 2026-06-20 | `npm run build` | Passed with the existing Vite large chunk warning. |
| 2026-06-20 | `npm run qa` | Passed. |
| 2026-06-20 | `npm run verify` | Passed, including runtime smoke for 14/14 sample-free blueprints and 14/14 supported style profiles. |
| 2026-06-20 | `npm run dev -- --host 127.0.0.1` | Sandbox attempt failed with expected `listen EPERM`; approved dev server started on `127.0.0.1:5173`. |
| 2026-06-20 | `curl -I http://127.0.0.1:5173/` | Sandbox attempt could not connect; approved request returned `HTTP/1.1 200 OK`; dev server was stopped. |
| 2026-06-20 | Review loop: `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-20 | Review loop: `git diff --check` | Passed. |
| 2026-06-20 | Post-move `python3 harness/scripts/run_qa.py` | Passed after moving the plan to completed and adding the review mirror. |
| 2026-06-20 | Post-move `git diff --check` | Passed. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The Beat Blueprint Preview Cue Quick Action derives its target from the current preview and style match, routes only through the existing cue handler and transport loop selection, stays disabled while playback is running, and does not alter project data, preview/apply semantics, playback start/stop, export, or sampling boundaries. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a Quick Actions Beat Blueprint Preview Cue command. | Beginners need the same pre-apply Song/Pattern audition setup from command search, and producers need faster comparison while keeping sample-free starter editing primary. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming main is clean, no active plans exist, and the requested 10-plan progress report is due after this plan. |
| 2026-06-20 | harness_builder | Added the Beat Blueprint Preview Cue Quick Action, cue-only result handling, documentation, quality guardrails, and harness expectations. |
| 2026-06-20 | quality_runner | Completed QA and dev server smoke for the Beat Blueprint Preview Cue Quick Action. |
| 2026-06-20 | review_judge | Completed review after QA with no findings. |
