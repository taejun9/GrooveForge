# plan-761-pattern-dna-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Quick Actions Pattern DNA focus result metrics identify the explicit loop-posture focus action, active or direct Pattern DNA lane, destination panel, lane context, selected Pattern, editable event count, drum/music layer counts, arrangement use, and song length so beginners understand the current loop contents and producers can scan composition posture immediately after command execution.

## Non-Goals

- Do not change Pattern DNA card derivation, scoring, focus-card selection, visible focus behavior, direct card command definitions, focus routing, or Pattern DNA Focus Result behavior.
- Do not change Pattern A/B/C event data, arrangement data, Pattern Variation, Pattern Fill, Pattern Clone, Pattern Stack, Pattern Compare, Composer Actions, playback, render/export, save/load, local draft, Handoff, or sampler boundaries.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run, autoplay, automatic pattern edits, hidden generation, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns Pattern DNA Quick Actions, focus handlers, and generic Quick Action Result metric snapshots.
- `README.md` and `docs/product/product.md` describe Pattern DNA as the local selected-Pattern layer/density/dynamics/variation/arrangement posture scan.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin Pattern DNA derivation and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-761-pattern-dna-result-clarity` and `.worktree/plan-761-pattern-dna-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect Pattern DNA Quick Action result metrics and current command detail format.
- [x] Add structured Pattern DNA result metric helpers without changing existing focus routing or card derivation.
- [x] Update product/docs language and QA harness expectations for Pattern DNA result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Pattern DNA Quick Action result feedback is clearer while preserving Pattern DNA derivation, active-card selection, visible/direct focus routing, Pattern A/B/C event data, arrangement data, playback, export, Handoff, remote, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Improve the generic Quick Action Result metric instead of changing Pattern DNA derivation or focus behavior. | Pattern DNA already routes through explicit focus handlers; the command-palette post-run metric should expose the focused loop-posture lane and selected-Pattern posture without changing scoring, editing, arrangement, or routing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Pattern DNA Quick Action result clarity. |
| 2026-06-25 | harness_builder | Added structured Pattern DNA Quick Action result metric helpers plus product, quality, and QA harness expectations while preserving existing Pattern DNA derivation, focus routing, Pattern A/B/C data, arrangement data, playback, export, and sampler boundaries. |
| 2026-06-25 | quality_runner | Ran `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`; all passed, with the existing Vite chunk-size warning during build output. |
| 2026-06-25 | review_judge | Reviewed the diff for Pattern DNA card derivation, card order, active-card selection, focus routing, Pattern A/B/C event data, arrangement data, playback, export, remote, and sampler boundaries; no blocking findings. |
