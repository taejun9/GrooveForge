# plan-530-handoff-export-format-priority-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a UI-local Handoff Export Format Priority Readout so beginners can see the first deliverable-format risk before export and working producers can scan the highest-priority WAV/stem/MIDI/Handoff Sheet format blocker before focusing a metric.

## Non-Goals

- Do not change Handoff Export Format metric scoring, metric order, focus buttons, Quick Actions routing, or Deliver/Handoff Pack jump behavior.
- Do not mutate project data, undo history, playback, save/load, export files, receipt state, file names, render bytes, MIDI bytes, Handoff Sheet text, or command execution from the readout.
- Do not add configurable render settings, normalization, dither, ZIP/archive creation, native folder writing, batch export, auto-export, retries, upload, platform compliance, licensing, sampling, imported audio, remote AI, accounts, analytics, cloud sync, onboarding overlays, tutorials, macros, or auto-fix behavior.

## Context Map

- `src/ui/App.tsx` renders Handoff Pack, Handoff Export Format metrics, focus result, and summary derivation.
- `src/ui/workstationUiModel.ts` defines Handoff Export Format types.
- `src/styles.css` contains Handoff Export Format layout and responsive styling.
- `README.md` and `docs/product/product.md` describe Handoff Export Format as local deliverable-format guidance.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Handoff Export Format behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Priority Readout derived only from existing Handoff Export Format metrics and focus labels.

## Implementation Plan

- [x] Add a typed UI-local Handoff Export Format Priority summary.
- [x] Render the priority readout near the Handoff Export Format main readout with stable test ids and no click handlers.
- [x] Add responsive CSS that keeps compact export-format priority text contained.
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
| 2026-06-20 | Add a read-only Handoff Export Format Priority Readout. | Handoff Export Format already shows deliverable metrics, but users need one visible highest-priority WAV/stem/MIDI/Handoff Sheet format lane before exporting or sending files. |
| 2026-06-20 | Treat dev server smoke as blocked by sandbox policy after normal and escalated attempts. | `npm run dev -- --host 127.0.0.1` failed with `listen EPERM`; the escalated retry was rejected by environment policy, so no workaround was attempted. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 529 completed plans, no active plans, and this plan will trigger the next 10-plan progress report at plan-530 completion. |
| 2026-06-20 | harness_builder | Added the UI-local Handoff Export Format Priority Readout, responsive styling, and QA/doc guardrails derived from existing export-format metrics. |
| 2026-06-20 | quality_runner | QA passed for `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`; dev server smoke is blocked by localhost bind policy. |

## Completion Notes

Implemented a UI-local Handoff Export Format Priority Readout derived from existing Handoff Export Format metrics, added contained responsive styling, and updated README, product docs, quality rules, and QA tokens. QA passed except dev server smoke, which remains blocked by sandbox localhost bind policy after normal and escalated attempts.
