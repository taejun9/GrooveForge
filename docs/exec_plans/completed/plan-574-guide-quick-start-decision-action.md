# plan-574-guide-quick-start-decision-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report progress every 10 completed plans.

## Goal

Add an explicit action button to the Guide Quick Start Decision Readout so the current highest-priority Path, Session, or Workflow lane can run through the existing Guide Quick Start action path from the readout itself.

## Non-Goals

- Do not change Guide Quick Start decision scoring, priority scoring, context derivation, result derivation, project schema, playback, export behavior, snapshots, or undo semantics.
- Do not add sample browsing, chopping, sampler setup, imported audio, audio clips, reference-track import, audio analysis, or sampling-first onboarding.
- Do not trigger more than one Guide Quick Start action from a single visible readout click.
- Do not add remote AI, cloud sync, accounts, analytics, payments, onboarding overlays, autoplay, auto-arrangement, auto-export, or command chains.
- Do not persist Guide Quick Start Decision Readout action state in project data or undo history.

## Context Map

- `src/ui/workstationGuidancePanels.tsx` renders Guide Quick Start, derives the decision, priority, context, and local result feedback.
- `src/ui/App.tsx` passes existing First Beat Path, Session Pass, and Workflow Spotlight handlers into Guide Quick Start.
- `src/styles.css` owns Guide Quick Start Decision Readout layout and action controls.
- `README.md` and `docs/product/product.md` describe Guide Quick Start behavior.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce direct-composition guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, mix/master, and export; sampling stays secondary and out of this plan.
- Route the visible readout action only through the existing Guide Quick Start Path, Session, or Workflow action path.
- This is `plan-574`; the next requested 10-plan progress report is due after `plan-580`.

## Implementation Plan

- [x] Resolve the current Guide Quick Start decision source.
- [x] Add a visible Decision Readout action button.
- [x] Route the button through the existing Path, Session, or Workflow Guide Quick Start action path only.
- [x] Disable the button when the chosen source has no runnable target.
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
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Initially failed on one stale Guide Quick Start product expectation, then passed after updating the expectation for readout action clicks. |
| 2026-06-20 | `npm run typecheck` | Passed. |
| 2026-06-20 | `python3 harness/scripts/run_quality_gate.py` | Passed. |
| 2026-06-20 | `npm run build` | Passed with the existing Vite large chunk warning. |
| 2026-06-20 | `npm run qa` | Passed. |
| 2026-06-20 | `npm run verify` | Passed, including runtime smoke for 14/14 sample-free blueprints and 14/14 supported style profiles. |
| 2026-06-20 | `npm run dev -- --host 127.0.0.1` | Sandbox run failed with `listen EPERM`; approved run started Vite at `http://127.0.0.1:5173/`. |
| 2026-06-20 | `curl -I http://127.0.0.1:5173/` | Sandbox curl could not reach the approved server; approved curl returned `HTTP/1.1 200 OK`. Dev server was stopped. |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Passed during review. |
| 2026-06-20 | `git diff --check` | Passed during review. |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Passed after moving the plan to completed and creating the review mirror. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The visible Guide Quick Start Decision Readout action resolves the current Path, Session, or Workflow lane, disables when that source has no runnable target, and routes exactly one click through the same existing Path, Session, or Workflow action path without changing decision scoring, project data, undo history, playback, exports, hidden generation, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Guide Quick Start Decision Readout action. | Beginners need the top recommended lane to become one obvious next action, while producers need the same current session target exposed without command chains or sampling-first flow. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 573 completed plans, no active plans, and the next 10-plan progress report due at plan-580. |
| 2026-06-20 | harness_builder | Added the visible Guide Quick Start Decision Readout action, shared Path/Session/Workflow action routing, disabled target handling, responsive action styling, and harness expectations for the new tokens. |
| 2026-06-20 | quality_runner | Completed the full QA set plus dev-server HTTP smoke. |
| 2026-06-20 | review_judge | Reviewed the implementation after QA and found no issues. |
