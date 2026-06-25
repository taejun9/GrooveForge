# plan-750-pattern-compare-decision-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Quick Actions Pattern Compare Decision result feedback identify the explicit Cue or Use recommendation, target Pattern A/B/C, target event count, drum/music posture, selected-block placement, arrangement usage, and current edit Pattern so command-palette users can understand why the app recommends auditioning a Pattern loop or placing it into the selected song block before changing musical events, arrangement blocks, playback, or export decisions.

## Non-Goals

- Do not change Pattern Compare Decision recommendation derivation, visible readout action routing, Pattern Cue/Switch/Use handlers, disabled-state behavior, selected-block assignment semantics, undo behavior, selected Pattern alignment, or Pattern Compare Result behavior.
- Do not change Pattern A/B/C musical events, arrangement length, section labels, block bars, energy, muted tracks, Section Locator, Arrangement Block Jump/Cue, mixer/master state, playback scheduling, render/export bytes, MIDI export, Handoff Pack, or Handoff Sheet.
- Do not add auto-arrangement, command chains, modal confirmations, autoplay, hidden generation, sampling, imported audio, audio clips, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns Pattern Compare Decision Quick Actions, Pattern Compare Result UI, and generic Quick Action Result metric snapshots.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin Pattern Compare Decision boundaries and QA expectations.
- `README.md` and `docs/product/product.md` describe command-map and result feedback for Pattern Compare recommendations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-750-pattern-compare-decision-result-clarity` and `.worktree/plan-750-pattern-compare-decision-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect Pattern Compare Decision Quick Action result metrics and existing recommendation routing.
- [x] Update Pattern Compare Decision compact result metrics to identify Cue/Use action, target Pattern, event posture, selected-block placement, arrangement usage, and edit Pattern.
- [x] Update product/docs language and QA harness expectations for Pattern Compare Decision result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Quick Actions Pattern Compare Decision result feedback is clearer while preserving recommendation derivation, explicit action routing, direct Pattern Cue/Switch/Use commands, selected-block semantics, undo behavior, Pattern A/B/C event data, arrangement length/section/bars, playback, export, MIDI, Handoff, remote, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Improve the existing Quick Action Result metric instead of changing Pattern Compare Decision recommendation logic. | Pattern Compare Decision already routes through explicit local Cue or Use handlers; the command-palette gap is the compact post-run metric, which should explain the target Pattern posture without changing recommendation or assignment behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Quick Actions Pattern Compare Decision result clarity. |
| 2026-06-25 | harness_builder | Added target Pattern-based Pattern Compare Decision result metric helpers, Cue/Use recommendation labels, selected-block section/bar context, docs, and QA harness expectations while preserving existing recommendation and action handlers. |
| 2026-06-25 | repo_cartographer | Updated README, product docs, quality rules, and QA harness expectations for Pattern Compare Decision result metric clarity. |
| 2026-06-25 | quality_runner | QA passed: git diff --check, python3 harness/scripts/run_qa.py, npm run typecheck, python3 harness/scripts/run_quality_gate.py, npm run build, npm run qa, and npm run verify. Build still reports the existing Vite chunk-size warning. |
| 2026-06-25 | review_judge | Review passed with no blocking findings; changes are limited to compact Quick Action result metrics, docs, QA expectations, and plan/review records. |
