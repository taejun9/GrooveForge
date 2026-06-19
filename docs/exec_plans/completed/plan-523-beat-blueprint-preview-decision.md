# plan-523-beat-blueprint-preview-decision

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a UI-local Beat Blueprint Preview Decision Readout so beginners can tell whether the previewed sample-free starter is ready to apply and working producers can scan style-match and change scope before committing a blueprint.

## Non-Goals

- Do not change blueprint preview/apply ordering, button handlers, Quick Actions routing, style matching, or blueprint generation.
- Do not mutate project data, undo history, playback, save/load, export, Handoff, local drafts, or command execution from the readout.
- Do not add sampling, imported audio, remote AI, accounts, analytics, cloud sync, onboarding overlays, macros, auto-run, or tutorials.

## Context Map

- `src/ui/App.tsx` renders `BeatBlueprints`, current-style match, preview metrics, Apply controls, and result feedback.
- `src/ui/workstationUiModel.ts` defines `BeatBlueprintPreviewSummary` and metric types.
- `src/styles.css` contains Beat Blueprint layout, preview, style match, result, and responsive styling.
- `README.md` and `docs/product/product.md` describe Beat Blueprints as sample-free editable starters.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce blueprint behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Decision Readout derived only from existing blueprint preview summary, current-style match summary, and visible project state.

## Implementation Plan

- [x] Add a typed UI-local Beat Blueprint Preview Decision summary.
- [x] Render the readout near the preview area with stable test ids and no click handlers.
- [x] Add responsive CSS that keeps compact text contained.
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
| 2026-06-20 | Add a read-only Beat Blueprint Preview Decision Readout. | Users can preview and apply starters, but need a faster summary of style-match status and change scope before committing. |
| 2026-06-20 | Do not work around dev-server sandbox denial. | `npm run dev -- --host 127.0.0.1` failed with `listen EPERM`, and the escalated retry was rejected by policy; all non-server QA passed. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 522 completed plans, no active plans, and next 10-plan progress report due at plan-530. |
| 2026-06-20 | project_lead | Implemented the UI-local Preview Decision Readout from existing blueprint preview and current-style match summaries, with no sampling or mutation scope added. |
| 2026-06-20 | quality_runner | `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify` passed. Dev server smoke was blocked by environment policy. |
| 2026-06-20 | review_judge | Reviewed the completed diff after QA and found no follow-up defects. |

## Completion Notes

Completed. Added a read-only Beat Blueprint Preview Decision Readout, kept preview/apply behavior explicit and sample-free, updated documentation and QA expectations, passed required non-server QA, and recorded the environment policy block for dev-server smoke.
