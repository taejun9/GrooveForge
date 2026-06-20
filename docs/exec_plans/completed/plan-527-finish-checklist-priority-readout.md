# plan-527-finish-checklist-priority-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a UI-local Finish Checklist Priority Readout so beginners can see the first finish/export readiness lane to check and working producers can scan the highest-priority compose/arrange/mix/master/automation/handoff blocker before focusing a card.

## Non-Goals

- Do not change Finish Checklist card scoring, card order, focus buttons, Quick Actions routing, or panel jump behavior.
- Do not mutate project data, undo history, playback, save/load, export, Handoff, local drafts, or command execution from the readout.
- Do not add sampling, imported audio, remote AI, accounts, analytics, cloud sync, onboarding overlays, tutorials, macros, auto-run, or auto-fix behavior.

## Context Map

- `src/ui/App.tsx` renders Finish Checklist, cards, focus result, and summary derivation.
- `src/ui/workstationUiModel.ts` defines Finish Checklist types.
- `src/styles.css` contains Finish Checklist layout and responsive styling.
- `README.md` and `docs/product/product.md` describe Finish Checklist as local export readiness guidance.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Finish Checklist behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Priority Readout derived only from existing Finish Checklist summary cards and focus labels.

## Implementation Plan

- [x] Add a typed UI-local Finish Checklist Priority summary.
- [x] Render the priority readout near the Finish Checklist cards with stable test ids and no click handlers.
- [x] Add responsive CSS that keeps compact priority text contained.
- [x] Update README, product docs, quality rules, and QA token expectations.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Dev server smoke attempt and escalated retry if sandbox blocks binding.

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a read-only Finish Checklist Priority Readout. | The finish surface already shows readiness cards, but users need one visible highest-priority compose/arrange/mix/master/automation/handoff lane before focusing or exporting. |
| 2026-06-20 | Treat dev server smoke as blocked by sandbox policy after normal and escalated attempts. | `npm run dev -- --host 127.0.0.1` failed with `listen EPERM`; the escalated retry was rejected by environment policy, so no workaround was attempted. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 526 completed plans, no active plans, and next 10-plan progress report due at plan-530. |
| 2026-06-20 | harness_builder | Added the UI-local Finish Checklist Priority Readout, responsive styling, and QA/doc guardrails derived from existing finish checklist cards. |
| 2026-06-20 | quality_runner | QA passed for `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`; dev server smoke is blocked by localhost bind policy. |

## Completion Notes

Implemented a UI-local Finish Checklist Priority Readout derived from existing finish checklist cards, added contained responsive styling, and updated README, product docs, quality rules, and QA tokens. QA passed except dev server smoke, which remains blocked by sandbox localhost bind policy after normal and escalated attempts.
