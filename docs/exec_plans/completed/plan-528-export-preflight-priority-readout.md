# plan-528-export-preflight-priority-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a UI-local Export Preflight Priority Readout so beginners can see the first delivery-risk lane before export and working producers can scan the highest-priority readiness/mix/master automation/deliverable/handoff blocker before focusing a card.

## Non-Goals

- Do not change Export Preflight card scoring, card order, focus buttons, Quick Actions routing, or panel jump behavior.
- Do not mutate project data, undo history, playback, save/load, export files, Handoff, local drafts, or command execution from the readout.
- Do not add sampling, imported audio, remote AI, accounts, analytics, cloud sync, onboarding overlays, tutorials, macros, auto-run, auto-export, or auto-fix behavior.

## Context Map

- `src/ui/App.tsx` renders Export Preflight, cards, focus result, and summary derivation.
- `src/ui/workstationUiModel.ts` defines Export Preflight types.
- `src/styles.css` contains Export Preflight layout and responsive styling.
- `README.md` and `docs/product/product.md` describe Export Preflight as local delivery-risk guidance.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Export Preflight behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Priority Readout derived only from existing Export Preflight summary cards and focus labels.

## Implementation Plan

- [x] Add a typed UI-local Export Preflight Priority summary.
- [x] Render the priority readout near the Export Preflight focus readout with stable test ids and no click handlers.
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
| 2026-06-20 | Add a read-only Export Preflight Priority Readout. | Export Preflight already shows delivery-risk cards, but users need one visible highest-priority readiness/mix/master automation/deliverable/handoff lane before focusing or exporting. |
| 2026-06-20 | Treat dev server smoke as blocked by sandbox policy after normal and escalated attempts. | `npm run dev -- --host 127.0.0.1` failed with `listen EPERM`; the escalated retry was rejected by environment policy, so no workaround was attempted. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 527 completed plans, no active plans, and next 10-plan progress report due at plan-530. |
| 2026-06-20 | harness_builder | Added the UI-local Export Preflight Priority Readout, responsive styling, and QA/doc guardrails derived from existing preflight cards. |
| 2026-06-20 | quality_runner | QA passed for `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`; dev server smoke is blocked by localhost bind policy. |

## Completion Notes

Implemented a UI-local Export Preflight Priority Readout derived from existing Export Preflight cards, added contained responsive styling, and updated README, product docs, quality rules, and QA tokens. QA passed except dev server smoke, which remains blocked by sandbox localhost bind policy after normal and escalated attempts.
