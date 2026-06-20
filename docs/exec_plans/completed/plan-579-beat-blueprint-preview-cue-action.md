# plan-579-beat-blueprint-preview-cue-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report progress every 10 completed plans.

## Goal

Add an explicit action button to the Beat Blueprint Preview Listening Cue so users can cue the appropriate Song or Pattern loop before applying a sample-free starter, using only the existing transport loop selection path.

## Non-Goals

- Do not change Beat Blueprint definitions, preview scoring, apply behavior, project schema, playback scheduling, export, render, MIDI, snapshots, local draft recovery, or undo semantics.
- Do not add automatic playback, automatic blueprint apply, automatic preview switching, hidden generation, imported audio, sample browsing, chopping, sampler setup, or sampling-first onboarding.
- Do not trigger more than one cue operation from a single visible Preview Listening Cue click.
- Do not add remote AI, cloud sync, accounts, analytics, payments, auto-mixing, auto-mastering, auto-export, or command chains.
- Do not persist Beat Blueprint cue action state in project data, localStorage, or undo history.

## Context Map

- `src/ui/App.tsx` renders Beat Blueprints, derives Preview Decision/Cue labels, and owns the existing transport loop selection handler.
- `src/styles.css` owns Beat Blueprint preview cue layout and button styles.
- `README.md` and `docs/product/product.md` describe the sample-free Beat Blueprint starter workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce direct-composition guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Route the visible Beat Blueprint Preview Listening Cue action only through existing transport loop selection.
- This is `plan-579`; the next requested 10-plan progress report is due after `plan-580`.

## Implementation Plan

- [x] Add a derived Beat Blueprint Preview Cue action target.
- [x] Add a visible Preview Listening Cue action button.
- [x] Route Song-loop cue targets through existing transport loop selection.
- [x] Route Pattern-loop cue targets through existing transport loop selection.
- [x] Keep cue action disabled/no-op while playback is running.
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
| 2026-06-20 | Stale text/selector search | Passed; no old read-only Preview Listening Cue text or broad cue selectors remained. |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Passed. |
| 2026-06-20 | `git diff --check` | Passed. |
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

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The visible Beat Blueprint Preview Listening Cue action derives Song/Pattern loop targets from preview metrics, routes only through existing transport loop selection while playback is stopped, and does not alter project data, preview/apply semantics, playback scheduling, export, or sampling boundaries. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Beat Blueprint Preview Listening Cue action. | Beginners need a one-click audition setup before applying a starter, and producers need quick Song/Pattern loop routing while comparing sample-free blueprints. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 578 completed plans, no active plans, and the next 10-plan progress report due at plan-580. |
| 2026-06-20 | harness_builder | Added the Beat Blueprint Preview Listening Cue action target, visible cue button, existing transport loop routing, playback-disabled state, responsive-safe styles, docs, and harness expectations. |
| 2026-06-20 | quality_runner | Completed QA and dev server smoke for the Beat Blueprint Preview Listening Cue action. |
| 2026-06-20 | review_judge | Completed review after QA with no findings. |
