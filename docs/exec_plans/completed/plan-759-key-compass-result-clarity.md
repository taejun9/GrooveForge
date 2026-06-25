# plan-759-key-compass-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Quick Actions Key Compass focus result metrics identify the explicit harmony focus action, active or direct harmony lane, destination panel, lane context, current project key, selected Pattern, editable event count, and song length so beginners understand the next in-key composition check and producers can scan harmonic posture immediately after command execution.

## Non-Goals

- Do not change Key Compass card derivation, scoring, focus-card selection, visible focus behavior, direct card command definitions, key retargeting, note/chord editing, or focus routing.
- Do not change Composer Guide, Groove Compass, Guide Quick Start, First Beat Path, Beat Spine, Mode Focus, Session Pass, project data, playback, render/export, save/load, local draft, Handoff, or sampler boundaries.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run, autoplay, automatic key rewriting, hidden generation, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns Key Compass Quick Actions, focus handlers, and generic Quick Action Result metric snapshots.
- `README.md` and `docs/product/product.md` describe Key Compass as the local harmony/key posture surface.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin Key Compass boundaries and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-759-key-compass-result-clarity` and `.worktree/plan-759-key-compass-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect Key Compass Quick Action result metrics and current command detail format.
- [x] Add structured Key Compass result metric helpers without changing existing focus routing or card scoring.
- [x] Update product/docs language and QA harness expectations for Key Compass result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Key Compass Quick Action result feedback is clearer while preserving key card scoring, active-card selection, visible/direct focus routing, key retargeting, note/chord editing, project data, playback, export, Handoff, remote, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Improve the generic Quick Action Result metric instead of changing Key Compass derivation or focus behavior. | Key Compass already routes through explicit focus handlers; the command-palette post-run metric should expose the focused harmony lane and project posture without changing scoring, key rewriting, or routing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Key Compass Quick Action result clarity. |
| 2026-06-25 | harness_builder | Added structured Key Compass Quick Action result metric helpers plus product, quality, and QA harness expectations while preserving existing key card scoring, focus routing, key retargeting, and note/chord editing semantics. |
| 2026-06-25 | quality_runner | `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify` passed; build still reports the existing Vite chunk-size warning. |
| 2026-06-25 | review_judge | Reviewed the focused diff for Key Compass scoring, card order, active-card selection, focus routing, key retargeting, note/chord editing, project data, playback, export, remote, and sampler boundaries; no blocking findings. |
