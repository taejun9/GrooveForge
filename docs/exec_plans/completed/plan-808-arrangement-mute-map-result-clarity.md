# plan-808-arrangement-mute-map-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition with sampling as secondary scope, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Arrangement Mute Map focus post-click result metrics identify the explicit mute-map focus action, priority or direct lane, Arrange destination, focused layer, lane status/context, section-by-section mute posture, selected Pattern, editable event count, Pattern A/B/C usage, selected block, arrangement block count, song length, export readiness, transition-map posture, audition cue, and next mute-map check so beginners understand where a layer drops out and working producers can scan layer-space posture immediately after focusing a mute lane.

## Non-Goals

- Do not change Arrangement Mute Map derivation, lane ordering, priority selection, focus routing, selected-block mute editing, arrangement data, Pattern A/B/C event data, mixer/master state, export handlers, file contents, filenames, project schema, save/load, undo/redo, playback scheduling, snapshots, local drafts, or sampler behavior.
- Do not add hidden generation, auto-run, macros, autoplay, auto-arrangement, auto-muting, batch export, background rendering, sampling, sampler devices, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, payments, cloud sync, publishing/licensing claims, platform-loudness compliance, or LUFS/true-peak guarantees.

## Context Map

- `src/ui/App.tsx` owns Quick Actions, Arrangement Mute Map summaries/results, result metrics, export analysis, arrangement readouts, and local result feedback.
- `README.md` and `docs/product/product.md` describe Arrangement Mute Map and command-map coverage.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin arrangement map expectations, local-first behavior, direct beat-composition scope, and sampling boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-808-arrangement-mute-map-result-clarity` and `.worktree/plan-808-arrangement-mute-map-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect current Arrangement Mute Map result metric routing, action ids, summary/result helpers, and docs/QA expectations.
- [x] Add structured mute-map focus result metric details without changing mute-map derivation, focus routing, mute editing, playback scheduling, or project data.
- [x] Update product/docs language and QA harness expectations for Arrangement Mute Map result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Arrangement Mute Map result metrics are clearer while preserving mute-map derivation, lane ordering, priority selection, focus routing, selected-block mute editing, project data boundaries, playback scheduling, export behavior, remote boundaries, platform-loudness boundaries, and sampler boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-26 | Improve Arrangement Mute Map post-click result metrics instead of changing mute-map or edit behavior. | The app already exposes local layer-dropout diagnostics; richer result metrics make focused mute lanes clearer without changing arrangement data or muting behavior. |

## Progress Log

| date | role | note |
|---|---|
| 2026-06-26 | project_lead | Plan created after 807 completed plans to continue improving first-time and producer-facing workflow clarity. |
| 2026-06-26 | harness_builder | Added Arrangement Mute Map Quick Actions result metric snapshots plus README/product/quality/harness expectations while preserving lane focus and mute-map derivation. |

## QA Log

| command | result |
|---|---|
| `git diff --check` | Passed. |
| `python3 harness/scripts/run_qa.py` | Passed: `GrooveForge QA passed.` |
| `npm run typecheck` | Passed. |
| `python3 harness/scripts/run_quality_gate.py` | Passed: `GrooveForge quality gate passed.` |
| `npm run build` | Passed with existing Vite chunk-size warning. |
| `npm run qa` | Passed: `GrooveForge QA passed.` |
| `npm run verify` | Passed with runtime smoke, typecheck, and build; build emitted existing Vite chunk-size warning. |

## Review Log

Post-QA review passed. The diff keeps Arrangement Mute Map derivation, lane ordering, priority selection, lane focus routing, selected-block mute editing, arrangement data, Pattern data, playback scheduling, save/load, render/export, remote, and sampler behavior intact; the added helpers only expand Arrangement Mute Map Quick Actions result metrics from local command, arrangement, Pattern, mute-map, transition-map, selected-block, export, audition, and next-check state.
