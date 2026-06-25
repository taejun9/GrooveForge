# plan-746-section-locator-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Quick Actions Section Locator result feedback identify the explicit cue action, target section, cued block scope, Pattern A/B/C assignment, bar range, event count, song block count, and total song bars so command-palette users can confirm section navigation and Block-loop audition context before checking Section Locator, Song Form Overview, Arrangement Playback, or manual arrangement edits.

## Non-Goals

- Do not change Section Locator cue handlers, priority/decision derivation, disabled-state behavior, loop-scope semantics, or Section Cue Result strip behavior.
- Do not change Pattern A/B/C musical events, selected-block edit tools, Arrangement Template, Arrangement Arc, Arrangement Focus, Arrangement Move, mixer/master state, playback scheduling, render/export bytes, MIDI export, Handoff Pack, or Handoff Sheet.
- Do not add auto-arrangement, command chains, modal confirmations, autoplay, hidden generation, sampling, imported audio, audio clips, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns Section Locator Quick Actions, Section Cue Result UI, and generic Quick Action Result metric snapshots.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin Section Locator boundaries and QA expectations.
- `README.md` and `docs/product/product.md` describe command-map and result feedback for section cueing.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-746-section-locator-result-clarity` and `.worktree/plan-746-section-locator-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect Section Locator Quick Action result metric and existing cue routing.
- [x] Update Section Locator compact result metrics to identify cue action, target section, cued block, Pattern, bar range, event count, block count, and total bars.
- [x] Update product/docs language and QA harness expectations for Section Locator result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Quick Actions Section Locator result feedback is clearer while preserving cue handlers, priority/decision derivation, loop-scope behavior, Pattern A/B/C musical events, arrangement edit semantics, playback, export, MIDI, Handoff, remote, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Improve the existing Quick Action Result metric instead of adding a separate command result model. | Section Locator already has local cue feedback; the command-palette gap is the compact post-run metric, which should identify the explicit section cue and arrangement posture without changing cue behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Quick Actions Section Locator result clarity. |
| 2026-06-25 | harness_builder | Added a Section Locator Quick Action result metric snapshot helper that derives cue action, target section, cued block scope, Pattern, bar range, event count, song block count, and total bars from explicit Section Locator command metadata plus local arrangement state. |
| 2026-06-25 | repo_cartographer | Updated README, product docs, quality rules, and QA harness expectations for Section Locator result metric clarity. |
| 2026-06-25 | quality_runner | QA passed: git diff --check, python3 harness/scripts/run_qa.py, npm run typecheck, python3 harness/scripts/run_quality_gate.py, npm run build, npm run qa, and npm run verify. Build still reports the existing Vite chunk-size warning. |
| 2026-06-25 | review_judge | Review passed with no blocking findings; changes are limited to compact Quick Action result metrics, docs, QA expectations, and plan/review records. |
