# plan-531-review-queue-priority-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a UI-local Review Queue Priority Readout so beginners can see the first production issue to address and working producers can scan the highest-priority composition, arrangement, mix, master, target, or handoff risk before focusing or applying a fix.

## Non-Goals

- Do not change Review Queue issue scoring, sorting, item count, Focus/Fix controls, Quick Actions routing, or fix behavior.
- Do not mutate project data, undo history, playback, save/load, export files, render bytes, MIDI bytes, Handoff Sheet text, or command execution from the readout.
- Do not add sampling, imported audio, remote AI, accounts, analytics, cloud sync, onboarding overlays, tutorials, macros, auto-fix loops, or automatic generation.

## Context Map

- `src/ui/App.tsx` renders Review Queue, Focus/Fix feedback, and summary derivation.
- `src/ui/workstationUiModel.ts` defines Review Queue types.
- `src/styles.css` contains Review Queue layout and responsive styling.
- `README.md` and `docs/product/product.md` describe Review Queue as local production issue triage.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Review Queue behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Priority Readout derived only from existing Review Queue summary items and focus labels.

## Implementation Plan

- [x] Add a typed UI-local Review Queue Priority summary.
- [x] Render the priority readout near the Review Queue focus/fix stack with stable test ids and no click handlers.
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
| 2026-06-20 | Add a read-only Review Queue Priority Readout. | Review Queue already sorts local production issues and supports Focus/Fix, but users need one visible highest-priority issue before choosing a focus or one-step fix. |
| 2026-06-20 | Treat dev server smoke as blocked by sandbox policy after normal and escalated attempts. | `npm run dev -- --host 127.0.0.1` failed with `listen EPERM`; the escalated retry was rejected by environment policy, so no workaround was attempted. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 530 completed plans, no active plans, and next regular progress report due at plan-540 completion. |
| 2026-06-20 | harness_builder | Added the UI-local Review Queue Priority Readout, responsive styling, and QA/doc guardrails derived from existing Review Queue summary items. |
| 2026-06-20 | quality_runner | QA passed for `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`; dev server smoke is blocked by localhost bind policy. |
| 2026-06-20 | review_judge | Review found no issues; Review Queue issue scoring, ordering, Focus/Fix controls, and Quick Actions routing remain unchanged. |

## Completion Notes

Implemented a UI-local Review Queue Priority Readout derived from existing Review Queue summary items, added contained responsive styling, and updated README, product docs, quality rules, and QA tokens. QA passed except dev server smoke, which remains blocked by sandbox localhost bind policy after normal and escalated attempts.
