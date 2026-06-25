# plan-760-groove-compass-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Quick Actions Groove Compass focus result metrics identify the explicit pocket focus action, active or direct groove lane, destination panel, lane context, selected Pattern, editable event count, drum hit count, and song length so beginners understand the next rhythm-pocket check and producers can scan groove posture immediately after command execution.

## Non-Goals

- Do not change Groove Compass card derivation, scoring, focus-card selection, visible focus behavior, direct card command definitions, selected drum state, drum editing, Groove Compass Cue behavior, or focus routing.
- Do not change Key Compass, Composer Guide, Guide Quick Start, First Beat Path, Beat Spine, Mode Focus, Session Pass, project data, playback, render/export, save/load, local draft, Handoff, or sampler boundaries.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run, autoplay, automatic drum edits, hidden generation, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns Groove Compass Quick Actions, focus/cue handlers, and generic Quick Action Result metric snapshots.
- `README.md` and `docs/product/product.md` describe Groove Compass as the local selected-pattern rhythm/pocket posture surface.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin Groove Compass boundaries and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-760-groove-compass-result-clarity` and `.worktree/plan-760-groove-compass-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect Groove Compass Quick Action result metrics and current command detail format.
- [x] Add structured Groove Compass result metric helpers without changing existing focus/cue routing or card scoring.
- [x] Update product/docs language and QA harness expectations for Groove Compass result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Groove Compass Quick Action result feedback is clearer while preserving groove card scoring, active-card selection, visible/direct focus routing, cue behavior, selected drum state, drum editing, project data, playback, export, Handoff, remote, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Improve the generic Quick Action Result metric instead of changing Groove Compass derivation, cue behavior, or focus behavior. | Groove Compass already routes through explicit focus handlers; the command-palette post-run metric should expose the focused pocket lane and pattern posture without changing scoring, editing, cueing, or routing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Groove Compass Quick Action result clarity. |
| 2026-06-25 | harness_builder | Added structured Groove Compass Quick Action result metric helpers plus product, quality, and QA harness expectations while preserving existing groove card scoring, focus routing, cue behavior, selected drum state, and drum editing semantics. |
| 2026-06-25 | quality_runner | Ran `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`; all passed, with the existing Vite chunk-size warning during build output. |
| 2026-06-25 | review_judge | Reviewed the diff for Groove Compass scoring, card order, active-card selection, focus routing, cue behavior, selected drum state, drum editing, project data, playback, export, remote, and sampler boundaries; no blocking findings. |
