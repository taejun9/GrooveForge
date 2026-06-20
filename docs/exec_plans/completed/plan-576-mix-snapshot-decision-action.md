# plan-576-mix-snapshot-decision-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report progress every 10 completed plans.

## Goal

Add an explicit action button to the Mix Snapshot A/B Decision Readout so the current capture or recall recommendation can run through the existing Mix Snapshot capture/recall handlers from the readout itself.

## Non-Goals

- Do not change Mix Snapshot score logic, comparison metrics, captured payload shape, project schema, playback, export behavior, snapshots, or undo semantics.
- Do not add automatic recall, automatic capture, rendered reference imports, reference audio, sample browsing, chopping, sampler setup, imported audio, or sampling-first onboarding.
- Do not trigger more than one Mix Snapshot capture or recall from a single visible readout click.
- Do not add remote AI, cloud sync, accounts, analytics, payments, autoplay, auto-mixing, auto-mastering, auto-export, or command chains.
- Do not persist Mix Snapshot Decision Readout action state in project data or undo history.

## Context Map

- `src/ui/workstationAnalysis.ts` derives Mix Snapshot A/B comparison and Decision Readout labels.
- `src/ui/workstationUiModel.ts` owns Mix Snapshot summary types.
- `src/ui/workstationMixPanels.tsx` renders Mix Snapshot A/B controls and Decision Readout.
- `src/ui/App.tsx` passes the existing capture/recall/clear handlers into the panel.
- `src/styles.css` owns Mix Snapshot A/B layout and action controls.
- `README.md` and `docs/product/product.md` describe Mix Snapshot behavior.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce direct-composition guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, mix/master, and export; sampling stays secondary and out of this plan.
- Route the visible readout action only through existing Mix Snapshot capture or recall handlers.
- This is `plan-576`; the next requested 10-plan progress report is due after `plan-580`.

## Implementation Plan

- [x] Add a derived Mix Snapshot Decision Readout action target.
- [x] Add a visible Decision Readout action button.
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
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Initially failed on a misplaced `MixSnapshotDecisionActionId` expectation, then passed after moving the expectation to the UI model checks. |
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
| 2026-06-20 | review_judge | No findings. The visible Mix Snapshot A/B Decision Readout action derives a single capture or recall target from current UI-local A/B slot state, routes capture targets only through the existing capture handler, routes recall targets only through the existing undoable recall path, and does not change comparison scoring, payload shape, project schema, playback, export, hidden mixing, mastering, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Mix Snapshot A/B Decision Readout action. | Producers need faster A/B pass recall, and first-time composers need the current capture/recall recommendation to become one explicit next mix step without hidden automation or sampling scope. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 575 completed plans, no active plans, and the next 10-plan progress report due at plan-580. |
| 2026-06-20 | harness_builder | Added the Mix Snapshot A/B Decision Readout action target, visible action button, existing capture/recall handler routing, responsive styles, and harness expectations. |
| 2026-06-20 | quality_runner | Completed the full QA set plus dev-server HTTP smoke. |
| 2026-06-20 | review_judge | Reviewed the implementation after QA and found no issues. |
