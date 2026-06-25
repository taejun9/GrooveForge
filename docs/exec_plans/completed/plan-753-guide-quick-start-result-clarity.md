# plan-753-guide-quick-start-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Quick Actions Guide Quick Start and Guide Bottleneck Focus result metrics identify the explicit guide action, target lane, route/source, context, completion metric, completion breakdown, and bottleneck label so beginners can understand where the command sent them and producers can quickly scan the weakest writing or delivery lane.

## Non-Goals

- Do not change Guide Quick Start target scoring, completion score math, completion breakdown, bottleneck derivation, guide suggestion behavior, pinned-command behavior, Recent Commands, or Command Reference coverage.
- Do not change First Beat Path, Session Pass, Workflow Spotlight, mode switching, focus/jump routing, project data, playback, render/export, save/load, local draft, Handoff, or sampler boundaries.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run, autoplay, hidden generation, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns Guide Quick Start targets, Guide Bottleneck Focus targets, Quick Actions execution, and generic Quick Action Result metric snapshots.
- `README.md` and `docs/product/product.md` describe Guide Quick Start as a composition-first guide for beginners and producers.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin the guide boundaries and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-753-guide-quick-start-result-clarity` and `.worktree/plan-753-guide-quick-start-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect Guide Quick Start and Guide Bottleneck Focus Quick Action result metrics and current detail format.
- [x] Add structured result metric helpers for guide quick start and bottleneck focus without changing existing command routing.
- [x] Update product/docs language and QA harness expectations for guide result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Guide Quick Start and Guide Bottleneck Focus result feedback is clearer while preserving guide target derivation, completion scoring, bottleneck selection, focus/jump routing, project data, playback, export, Handoff, remote, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Improve the existing Quick Action Result metric instead of changing Guide Quick Start routing or scoring. | The current commands already carry target, completion, breakdown, and bottleneck context; the gap is that the post-run metric displays raw detail text instead of a structured scan-friendly result. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Guide Quick Start and Guide Bottleneck Focus result clarity. |
| 2026-06-25 | harness_builder | Added structured guide result metric helpers for guide quick start and bottleneck focus plus product, quality, and QA harness expectations while preserving existing guide routing and scoring. |
| 2026-06-25 | quality_runner | `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify` passed; build still reports the existing Vite chunk-size warning. |
| 2026-06-25 | review_judge | Reviewed the focused diff for guide scoring, jump/focus routing, project data, playback, export, remote, and sampler boundaries; no blocking findings. |
