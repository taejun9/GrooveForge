# plan-524-beat-blueprint-preview-listening-cue

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop beat-making app that is easy for first-time composers and still useful to working producers.

## Goal

Add a UI-local Beat Blueprint Preview Listening Cue so beginners know what to listen for before applying a sample-free starter and working producers can quickly judge whether the previewed blueprint fits the current session.

## Non-Goals

- Do not change blueprint preview/apply ordering, button handlers, Quick Actions routing, style matching, or blueprint generation.
- Do not mutate project data, undo history, playback, save/load, export, Handoff, local drafts, or command execution from the readout.
- Do not add sampling, imported audio, remote AI, accounts, analytics, cloud sync, onboarding overlays, macros, auto-run, or tutorials.

## Context Map

- `src/ui/App.tsx` renders `BeatBlueprints`, current-style match, preview decision, preview metrics, Apply controls, and result feedback.
- `src/ui/workstationUiModel.ts` defines `BeatBlueprintPreviewSummary` and metric types.
- `src/styles.css` contains Beat Blueprint layout, preview, decision, style match, result, and responsive styling.
- `README.md` and `docs/product/product.md` describe Beat Blueprints as sample-free editable starters.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce blueprint behavior and test tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary and out of this plan.
- Keep the Listening Cue derived only from existing blueprint preview metrics, current-style match summary, and visible project state.

## Implementation Plan

- [x] Add a typed UI-local Beat Blueprint Preview Listening Cue summary.
- [x] Render the cue near the preview area with stable test ids and no click handlers.
- [x] Add responsive CSS that keeps compact cue text contained.
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
| 2026-06-20 | Add a read-only Beat Blueprint Preview Listening Cue. | Preview now shows style-match and change scope, but users still need a pre-Apply listening standard before committing a full starter. |
| 2026-06-20 | Do not work around dev-server sandbox denial. | `npm run dev -- --host 127.0.0.1` failed with `listen EPERM`, and the escalated retry was rejected by policy; all non-server QA passed. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming 523 completed plans, no active plans, and next 10-plan progress report due at plan-530. |
| 2026-06-20 | project_lead | Implemented the UI-local Preview Listening Cue from existing preview metrics and style-match summary, with no sampling or mutation scope added. |
| 2026-06-20 | quality_runner | `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify` passed. Dev server smoke was blocked by environment policy. |
| 2026-06-20 | review_judge | Reviewed the completed diff after QA and found no follow-up defects. |

## Completion Notes

Completed. Added a read-only Beat Blueprint Preview Listening Cue, kept preview/apply behavior explicit and sample-free, updated documentation and QA expectations, passed required non-server QA, and recorded the environment policy block for dev-server smoke.
