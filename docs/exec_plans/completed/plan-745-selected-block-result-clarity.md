# plan-745-selected-block-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Quick Actions Selected Block result feedback identify the explicit selected-block edit action, selected block scope, section/pattern/bar posture, song block count, total song bars, and structural delta, so command-palette users can confirm copy, paste, duplicate, split, merge, move, delete, or priority edits before checking Selected Block Edit Result, Song Form Overview, Arrangement Playback, or manual block edits.

## Non-Goals

- Do not change selected-block edit handlers, priority/decision derivation, clipboard behavior, disabled-state behavior, or Selected Block Edit Result strip behavior.
- Do not change Pattern A/B/C musical events, Pattern Chain, Chain Expand, Arrangement Template, Arrangement Arc, Arrangement Focus, Arrangement Move, Section Locator, mixer/master state, playback scheduling, render/export bytes, MIDI export, Handoff Pack, or Handoff Sheet.
- Do not add auto-arrangement, command chains, modal confirmations, autoplay, hidden generation, sampling, imported audio, audio clips, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns selected-block Quick Actions, Selected Block Edit Result UI, and generic Quick Action Result metric snapshots.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin selected-block edit boundaries and QA expectations.
- `README.md` and `docs/product/product.md` describe command-map and result feedback for selected-block editing.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-745-selected-block-result-clarity` and `.worktree/plan-745-selected-block-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect Selected Block Quick Action result metric and existing result routing.
- [x] Update Selected Block compact result metrics to identify action, selected block, section/pattern/bar posture, block count, total bars, and structural delta.
- [x] Update product/docs language and QA harness expectations for Selected Block result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Quick Actions Selected Block result feedback is clearer while preserving selected-block edit handlers, priority/decision derivation, clipboard behavior, Pattern A/B/C musical events, arrangement edit semantics, playback, export, MIDI, Handoff, remote, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Improve the existing Quick Action Result metric instead of adding a separate command result model. | Selected Block Edit already has detailed local result feedback; the command-palette gap is the compact post-run metric, which should identify the explicit selected-block edit and structural posture without changing edit behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Quick Actions Selected Block result clarity. |
| 2026-06-25 | harness_builder | Added a Selected Block Quick Action result metric snapshot helper that derives action, block scope, Pattern, bars, song block count, total bars, and structural delta from explicit selected-block command metadata plus local arrangement state. |
| 2026-06-25 | repo_cartographer | Updated README, product docs, quality rules, and QA harness expectations for Selected Block result metric clarity. |
| 2026-06-25 | quality_runner | QA passed: git diff --check, python3 harness/scripts/run_qa.py, npm run typecheck, python3 harness/scripts/run_quality_gate.py, npm run build, npm run qa, and npm run verify. Build still reports the existing Vite chunk-size warning. |
| 2026-06-25 | review_judge | Review passed with no blocking findings; direct selected-block command detail now carries bar length so delete/move/paste result metric parsing remains stable after arrangement changes. |
