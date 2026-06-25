# plan-758-composer-guide-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Quick Actions Composer Guide focus result metrics identify the explicit guide focus action, active or direct writing lane, destination panel, lane context, current mode, selected Pattern, editable event count, and song length so beginners understand the next writing lane and producers can scan composition posture immediately after command execution.

## Non-Goals

- Do not change Composer Guide card derivation, scoring, focus-card selection, visible focus behavior, direct card command definitions, or focus routing.
- Do not change Guide Quick Start, First Beat Path, Beat Spine, Mode Focus, Session Pass, Composer Actions, project data, playback, render/export, save/load, local draft, Handoff, or sampler boundaries.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run, autoplay, hidden generation, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns Composer Guide Quick Actions, focus handlers, and generic Quick Action Result metric snapshots.
- `README.md` and `docs/product/product.md` describe Composer Guide as the local writing-focus surface for drums, 808/bass, harmony, melody, arrangement, and finish.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin Composer Guide boundaries and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-758-composer-guide-result-clarity` and `.worktree/plan-758-composer-guide-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect Composer Guide Quick Action result metrics and current command detail format.
- [x] Add structured Composer Guide result metric helpers without changing existing focus routing or guide scoring.
- [x] Update product/docs language and QA harness expectations for Composer Guide result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Composer Guide Quick Action result feedback is clearer while preserving guide scoring, active-card selection, visible/direct focus routing, project data, playback, export, Handoff, remote, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Improve the generic Quick Action Result metric instead of changing Composer Guide derivation or focus behavior. | Composer Guide already routes through explicit focus handlers; the command-palette post-run metric should expose the focused writing lane and session posture without changing scoring or routing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Composer Guide Quick Action result clarity. |
| 2026-06-25 | harness_builder | Added structured Composer Guide Quick Action result metric helpers plus product, quality, and QA harness expectations while preserving existing guide scoring and focus routing. |
| 2026-06-25 | quality_runner | `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify` passed; build still reports the existing Vite chunk-size warning. |
| 2026-06-25 | review_judge | Reviewed the focused diff for Composer Guide scoring, card order, active-card selection, focus routing, project data, playback, export, remote, and sampler boundaries; no blocking findings. |
