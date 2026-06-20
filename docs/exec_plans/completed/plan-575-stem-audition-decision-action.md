# plan-575-stem-audition-decision-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report progress every 10 completed plans.

## Goal

Add an explicit action button to the Stem Audition Decision Readout so the current Full Mix or stem comparison target can run through the existing Stem Audition pad apply path from the readout itself.

## Non-Goals

- Do not change Stem Audition decision scoring, pad definitions, mixer state model, project schema, playback, export behavior, snapshots, or undo semantics.
- Do not add rendered stem playback, stem separation, sample browsing, chopping, sampler setup, imported audio, audio analysis, or sampling-first onboarding.
- Do not trigger more than one Stem Audition pad action from a single visible readout click.
- Do not add remote AI, cloud sync, accounts, analytics, payments, autoplay, auto-mixing, auto-mastering, auto-export, or command chains.
- Do not persist Stem Audition Decision Readout action state in project data or undo history.

## Context Map

- `src/ui/App.tsx` renders the Stem Audition Readout and Decision Readout, derives the current target, and owns the existing `applyStemAuditionPad` handler.
- `src/ui/workstationUiModel.ts` owns Stem Audition summary types.
- `src/styles.css` owns Stem Audition readout and decision layout.
- `README.md` and `docs/product/product.md` describe Stem Audition behavior.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce direct-composition guardrails and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, mix/master, and export; sampling stays secondary and out of this plan.
- Route the visible readout action only through the existing Stem Audition pad apply path.
- This is `plan-575`; the next requested 10-plan progress report is due after `plan-580`.

## Implementation Plan

- [x] Resolve the current Stem Audition Decision Readout target.
- [x] Add a visible Decision Readout action button.
- [x] Route the button through the existing Stem Audition pad apply path only.
- [x] Disable the button when the decision has no runnable target.
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
| 2026-06-20 | `npm run dev -- --host 127.0.0.1` | Sandbox run failed with `listen EPERM`; approved run started Vite at `http://127.0.0.1:5173/`. |
| 2026-06-20 | `curl -I http://127.0.0.1:5173/` | Sandbox curl could not reach the approved server; approved curl returned `HTTP/1.1 200 OK`. Dev server was stopped. |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Passed during review. |
| 2026-06-20 | `git diff --check` | Passed during review. |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | Passed after moving the plan to completed and creating the review mirror. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No findings. The visible Stem Audition Decision Readout action uses the current local Decision Readout `targetId`, disables when no target exists, and routes exactly one click through the existing `applyStemAuditionPad` path without changing decision derivation, pad definitions, project schema, playback, export, hidden mixing, mastering, or sampling scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a visible Stem Audition Decision Readout action. | Producers and first-time composers should be able to act on the current Full Mix or stem comparison recommendation directly while staying in the explicit beat-composition and mix workflow. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 574 completed plans, no active plans, and the next 10-plan progress report due at plan-580. |
| 2026-06-20 | harness_builder | Added the visible Stem Audition Decision Readout action, routed it through the existing pad apply handler, disabled missing targets, and updated responsive styles plus harness expectations. |
| 2026-06-20 | quality_runner | Completed the full QA set plus dev-server HTTP smoke. |
| 2026-06-20 | review_judge | Reviewed the implementation after QA and found no issues. |
