# plan-809-song-form-priority-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition with sampling as secondary scope, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Song Form Priority Quick Actions post-click result metrics identify the explicit priority focus action, Arrange destination, priority metric, target block, section, Pattern A/B/C assignment, bar range, bar length, energy, mute posture, event count, selected Pattern, Pattern A/B/C usage, arrangement block count, song length, export readiness, mute-map posture, transition-map posture, audition cue, and next song-form check so beginners understand why a section needs attention and working producers can scan full-song structure immediately after opening the priority target.

## Non-Goals

- Do not change Song Form Overview derivation, metric ordering, priority selection, selected-block navigation, arrangement data, Pattern A/B/C event data, mute-map derivation, transition-map derivation, mixer/master state, export handlers, file contents, filenames, project schema, save/load, undo/redo, playback scheduling, snapshots, local drafts, or sampler behavior.
- Do not add hidden generation, auto-run, macros, autoplay, auto-arrangement, auto-sectioning, auto-muting, transition writing, batch export, background rendering, sampling, sampler devices, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, payments, cloud sync, publishing/licensing claims, platform-loudness compliance, or LUFS/true-peak guarantees.

## Context Map

- `src/ui/App.tsx` owns Quick Actions, Song Form Overview summaries/priority action, result metrics, arrangement readouts, mute/transition summaries, export analysis, and local result feedback.
- `README.md` and `docs/product/product.md` describe Song Form Overview and command-map coverage.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin song-form expectations, local-first behavior, direct beat-composition scope, and sampling boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-809-song-form-priority-result-clarity` and `.worktree/plan-809-song-form-priority-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect current Song Form Priority result metric routing, action metadata, summary/priority helpers, and docs/QA expectations.
- [x] Add structured Song Form Priority result metric details without changing overview derivation, priority selection, selected-block navigation, playback scheduling, or project data.
- [x] Update product/docs language and QA harness expectations for Song Form Priority result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Song Form Priority result metrics are clearer while preserving overview derivation, metric ordering, priority selection, selected-block navigation, project data boundaries, playback scheduling, export behavior, remote boundaries, platform-loudness boundaries, and sampler boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-26 | Improve Song Form Priority post-click result metrics instead of changing priority/navigation behavior. | The app already exposes local song-form diagnostics; richer result metrics make the priority target clearer without changing arrangement data or playback semantics. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-26 | project_lead | Plan created after 808 completed plans to continue improving first-time and producer-facing workflow clarity. |
| 2026-06-26 | harness_builder | Added Song Form Priority Quick Actions result metric snapshots plus README/product/quality/harness expectations while preserving selected-block navigation and song-form derivation. |

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

Post-QA review passed. The diff keeps Song Form Overview derivation, metric ordering, priority selection, selected-block navigation, arrangement data, Pattern data, mute-map derivation, transition-map derivation, playback scheduling, save/load, render/export, remote, and sampler behavior intact; the added helper only expands Song Form Priority Quick Actions result metrics from local command, arrangement, Pattern, song-form, mute-map, transition-map, selected-block, export, audition, and next-check state.
