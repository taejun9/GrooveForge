# plan-532-mix-coach-priority-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a UI-local Mix Coach Priority Readout so beginners can see the first mix/master issue to listen for and working producers can scan the highest-priority headroom, limiter, dynamics, stem balance, or low-end check before focusing or applying a mix fix.

## Non-Goals

- Do not change Mix Coach scoring, check order, Focus buttons, Quick Actions routing, Mix Fix behavior, master finish behavior, or export analysis.
- Do not mutate project data, undo history, playback, save/load, render/export files, MIDI bytes, Handoff Sheet text, or command execution from the readout.
- Do not add automatic mixing, auto-mastering, sampling, imported audio, remote AI/audio analysis, plugin hosting, accounts, analytics, cloud sync, onboarding overlays, tutorials, macros, or auto-fix loops.

## Context Map

- `src/ui/App.tsx` renders Mix Coach, focus feedback, and deterministic check derivation.
- `src/ui/workstationUiModel.ts` defines Mix Coach types.
- `src/styles.css` contains Mix Coach layout and responsive styling.
- `README.md` and `docs/product/product.md` describe Mix Coach as local deterministic mix guidance.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Mix Coach behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Priority Readout derived only from existing Mix Coach checks and focus labels.

## Implementation Plan

- [x] Add a typed UI-local Mix Coach Priority summary.
- [x] Render the priority readout near the Mix Coach focus readout with stable test ids and no click handlers.
- [x] Add responsive CSS that keeps compact mix priority text contained.
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
| 2026-06-20 | Add a read-only Mix Coach Priority Readout. | Mix Coach already derives deterministic mix checks and focus targets, but users need one visible highest-priority listening/meter check before choosing a focus or mix fix. |
| 2026-06-20 | Treat dev server smoke as blocked by sandbox policy after normal and escalated attempts. | `npm run dev -- --host 127.0.0.1` failed with `listen EPERM`; the escalated retry was rejected by environment policy, so no workaround was attempted. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 531 completed plans, no active plans, and next regular progress report due at plan-540 completion. |
| 2026-06-20 | harness_builder | Added the UI-local Mix Coach Priority Readout, responsive styling, and QA/doc guardrails derived from existing deterministic Mix Coach checks. |
| 2026-06-20 | quality_runner | QA passed for `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`; dev server smoke is blocked by localhost bind policy. |
| 2026-06-20 | review_judge | Review found no issues; Mix Coach scoring, check order, Focus controls, Quick Actions routing, and Mix Fix behavior remain unchanged. |

## Completion Notes

Implemented a UI-local Mix Coach Priority Readout derived from existing deterministic Mix Coach checks, added contained responsive styling, and updated README, product docs, quality rules, and QA tokens. QA passed except dev server smoke, which remains blocked by sandbox localhost bind policy after normal and escalated attempts.
