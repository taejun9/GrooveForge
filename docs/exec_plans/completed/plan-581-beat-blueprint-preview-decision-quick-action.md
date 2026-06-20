# plan-581-beat-blueprint-preview-decision-quick-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Add a Quick Actions command for the current Beat Blueprint Preview Decision so users can run the same Apply Preview or Compare Style Match decision from command search before committing to a sample-free starter.

## Non-Goals

- Do not change Beat Blueprint definitions, preview scoring, apply behavior, project schema, playback scheduling, export, render, MIDI, snapshots, local draft recovery, or undo semantics.
- Do not add automatic playback, automatic blueprint apply, automatic preview switching, hidden generation, imported audio, sample browsing, chopping, sampler setup, or sampling-first onboarding.
- Do not trigger more than one preview/apply operation from a single Quick Actions command.
- Do not add remote AI, cloud sync, accounts, analytics, payments, auto-mixing, auto-mastering, auto-export, or command chains.
- Do not persist Beat Blueprint decision action state in project data, localStorage, or undo history.

## Context Map

- `src/ui/App.tsx` creates Quick Actions, renders Beat Blueprints, derives Preview Decision labels, and owns existing preview/apply handlers.
- `README.md` and `docs/product/product.md` describe the sample-free Beat Blueprint starter workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce direct-composition guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Route the Quick Actions Beat Blueprint Preview Decision command only through existing Beat Blueprint preview/apply handlers.
- This is `plan-581`; the next requested 10-plan progress report is due after `plan-590`.

## Implementation Plan

- [x] Derive the current Beat Blueprint Preview Decision inside Quick Actions.
- [x] Add a searchable Quick Actions command for the current Preview Decision.
- [x] Route Apply Preview decisions through the existing Beat Blueprint apply/result path.
- [x] Route Compare Style Match decisions through the existing Beat Blueprint preview-only path.
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
| 2026-06-20 | Review fix: result label adjustment | Applied: Preview Decision Quick Action now reports Applied whenever the command title is Apply Preview, even if the starter was already aligned and no project data changed. |
| 2026-06-20 | Review-fix `git diff --check` | Passed. |
| 2026-06-20 | Review-fix `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-20 | Review-fix `npm run typecheck` | Passed. |
| 2026-06-20 | Review-fix `npm run verify` | Passed, including runtime smoke for 14/14 sample-free blueprints and 14/14 supported style profiles. |
| 2026-06-20 | Final `npm run dev -- --host 127.0.0.1` | Sandbox attempt failed with expected `listen EPERM`; approved dev server started on `127.0.0.1:5173`. |
| 2026-06-20 | Final `curl -I http://127.0.0.1:5173/` | Sandbox attempt could not connect; approved request returned `HTTP/1.1 200 OK`; dev server was stopped. |
| 2026-06-20 | Review loop: `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-20 | Review loop: `git diff --check` | Passed. |
| 2026-06-20 | Post-move `python3 harness/scripts/run_qa.py` | Passed after moving the plan to completed and adding the review mirror. |
| 2026-06-20 | Post-move `git diff --check` | Passed. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The Beat Blueprint Preview Decision Quick Action derives its target from the current preview and style match, routes Apply Preview through the existing apply/result path and Compare Style Match through existing preview state, preserves Preview Listening Cue behavior, and does not alter project schema, playback, export, or sampling boundaries. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a Quick Actions Beat Blueprint Preview Decision command. | Beginners need one command-palette action for the same decision shown in the Beat Blueprint panel, and producers need faster preview/apply comparison without making sampling central. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming main is clean, no active plans exist, and the next 10-plan progress report is due after plan-590. |
| 2026-06-20 | harness_builder | Added the Beat Blueprint Preview Decision Quick Action, decision-specific result handling, documentation, quality guardrails, and harness expectations. |
| 2026-06-20 | quality_runner | Completed QA and dev server smoke for the Beat Blueprint Preview Decision Quick Action. |
| 2026-06-20 | review_judge | Completed review after QA with no findings. |
