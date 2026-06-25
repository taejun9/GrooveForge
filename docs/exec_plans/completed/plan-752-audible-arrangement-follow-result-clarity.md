# plan-752-audible-arrangement-follow-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Quick Actions Audible Arrangement Follow result feedback identify the explicit follow action, audible target block, before/current edit block, Pattern A/B/C assignment, bar range, block event count, song block count, and total song bars so users can safely follow the song section they are hearing during playback before changing arrangement blocks, Pattern events, playback, or export decisions.

## Non-Goals

- Do not change Audible Arrangement Follow routing, realtime playing arrangement block derivation, selected-block navigation behavior, selected Pattern alignment, Arrangement Playback Readout behavior, or playback scheduling.
- Do not change Pattern A/B/C musical events, arrangement blocks, arrangement length, Pattern Cue/Switch/Use behavior, Pattern Compare Decision behavior, mixer/master state, render/export bytes, MIDI export, Handoff Pack, or Handoff Sheet.
- Do not add auto-follow mode, autoplay, hidden selection changes, undo history, command chains, modal confirmations, hidden generation, sampling, imported audio, audio clips, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns Audible Arrangement Follow Quick Action, Arrangement Playback Readout, selected-block navigation, and generic Quick Action Result metric snapshots.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin Arrangement Playback/Audible Arrangement Follow boundaries and QA expectations.
- `README.md` and `docs/product/product.md` describe Arrangement Playback Readout and Audible Arrangement Follow command-map behavior.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-752-audible-arrangement-follow-result-clarity` and `.worktree/plan-752-audible-arrangement-follow-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect Audible Arrangement Follow Quick Action result metrics and existing follow routing.
- [x] Update Audible Arrangement Follow compact result metrics to identify follow action, audible target block, before/current edit block, Pattern, bar range, event count, and song length context.
- [x] Update product/docs language and QA harness expectations for Audible Arrangement Follow result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Quick Actions Audible Arrangement Follow result feedback is clearer while preserving follow routing, realtime playback snapshot derivation, selected-block navigation, selected Pattern alignment, Pattern A/B/C event data, arrangement block data, playback, export, MIDI, Handoff, remote, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Improve the existing Quick Action Result metric instead of changing Audible Arrangement Follow behavior. | Audible Arrangement Follow already routes through explicit selected-block navigation; the command-palette gap is the compact post-run metric, which should identify the audible block and song-form posture without adding auto-follow or playback mutations. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Quick Actions Audible Arrangement Follow result clarity. |
| 2026-06-25 | harness_builder | Added audible block-based Arrangement Follow result metric helpers, before/current edit block context, song bar context, docs, and QA harness expectations while preserving existing follow routing. |
| 2026-06-25 | quality_runner | `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify` passed; build still reports the existing Vite chunk-size warning. |
| 2026-06-25 | review_judge | Reviewed the focused diff for follow-routing, playback, arrangement, Pattern data, export, remote, and sampler boundaries; no blocking findings. |
