# plan-578-beat-blueprint-preview-decision-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report progress every 10 completed plans.

## Goal

Add an explicit action button to the Beat Blueprint Preview Decision Readout so the current starter decision can apply the previewed sample-free blueprint or preview the current-style match through the existing Beat Blueprint handlers.

## Non-Goals

- Do not change Beat Blueprint definitions, preview scoring, apply behavior, project schema, playback, export, render, MIDI, snapshots, local draft recovery, or undo semantics.
- Do not add automatic blueprint apply, automatic preview switching, hidden generation, imported audio, sample browsing, chopping, sampler setup, or sampling-first onboarding.
- Do not trigger more than one preview or apply operation from a single visible Decision Readout click.
- Do not add remote AI, cloud sync, accounts, analytics, payments, autoplay, auto-mixing, auto-mastering, auto-export, or command chains.
- Do not persist Beat Blueprint Decision action state in project data, localStorage, or undo history.

## Context Map

- `src/ui/App.tsx` renders Beat Blueprints, derives Preview Decision/Cue labels, and owns the existing preview/apply handlers.
- `src/styles.css` owns Beat Blueprint preview decision layout and button styles.
- `README.md` and `docs/product/product.md` describe the sample-free Beat Blueprint starter workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce direct-composition guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Route the visible Beat Blueprint Preview Decision action only through existing Beat Blueprint preview or apply handlers.
- This is `plan-578`; the next requested 10-plan progress report is due after `plan-580`.

## Implementation Plan

- [x] Add a derived Beat Blueprint Preview Decision action target.
- [x] Add a visible Decision Readout action button.
- [x] Route apply targets through the existing Beat Blueprint apply handler.
- [x] Route compare targets through the existing Beat Blueprint preview handler.
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
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Initially failed on one stale Beat Blueprints product expectation, then passed after updating the harness expectation. |
| 2026-06-20 | `npm run typecheck` | Passed. |
| 2026-06-20 | `git diff --check` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_quality_gate.py` | Passed. |
| 2026-06-20 | `npm run build` | Passed with the existing Vite large chunk warning. |
| 2026-06-20 | `npm run qa` | Passed. |
| 2026-06-20 | `npm run verify` | Passed, including runtime smoke for 14/14 sample-free blueprints and 14/14 supported style profiles. |
| 2026-06-20 | `npm run dev -- --host 127.0.0.1` | Sandbox attempt failed with expected `listen EPERM`; approved dev server started on `127.0.0.1:5173`. |
| 2026-06-20 | `curl -I http://127.0.0.1:5173/` | Sandbox attempt could not connect; approved request returned `HTTP/1.1 200 OK`; dev server was stopped. |
| 2026-06-20 | Review loop: `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-20 | Review loop: `git diff --check` | Passed. |
| 2026-06-20 | Post-move `python3 harness/scripts/run_qa.py` | Passed after moving the plan to completed and adding the review mirror. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The visible Beat Blueprint Preview Decision action is derived from preview/style-match state, routes only through existing preview/apply handlers, and preserves project schema, playback, export, and sampling boundaries. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Beat Blueprint Preview Decision action. | Beginners need one clear sample-free starter action, and producers need fast preview/apply routing without leaving the existing blueprint surface. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 577 completed plans, no active plans, and the next 10-plan progress report due at plan-580. |
| 2026-06-20 | harness_builder | Added the Beat Blueprint Preview Decision action target, visible action button, existing preview/apply handler routing, responsive-safe styles, docs, and harness expectations. |
| 2026-06-20 | quality_runner | Completed QA and dev server smoke for the Beat Blueprint Preview Decision action. |
| 2026-06-20 | review_judge | Completed review after QA with no findings. |
