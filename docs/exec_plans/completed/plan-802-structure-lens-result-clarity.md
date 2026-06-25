# plan-802-structure-lens-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition with sampling as secondary scope, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Structure Lens Quick Actions result metrics identify the explicit Structure Lens action, Guide/Arrange destination, target structure signal, signal status/context, selected Delivery Target, target-fit posture, section coverage, hook contrast, energy arc, selected Pattern, editable event count, Pattern A/B/C usage, arrangement block count, song length, action route, audition cue, and next Structure Lens check so beginners can understand the arrangement problem being addressed and working producers can scan song-shape state from command results.

## Non-Goals

- Do not change Structure Lens signal derivation, scoring, action suggestions, Next Move routing, action handlers, arrangement data, Pattern data, mixer/master state, export handlers, file contents, filenames, project schema, save/load, undo/redo, playback, snapshots, local drafts, Handoff Pack behavior, or Beat Map behavior.
- Do not add hidden generation, auto-arrangement, auto-run, macros, autoplay, batch export, background rendering, sampling, sampler devices, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, payments, cloud sync, publishing/licensing claims, platform-loudness compliance, or LUFS/true-peak guarantees.

## Context Map

- `src/ui/App.tsx` owns Quick Actions result metrics, Structure Lens summary/actions, Next Move routing, Delivery Target state, arrangement data, and local result feedback.
- `README.md` and `docs/product/product.md` describe Structure Lens and command-map coverage.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin Quick Actions, Structure Lens, local-first behavior, direct beat-composition scope, and sampling boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-802-structure-lens-result-clarity` and `.worktree/plan-802-structure-lens-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect current Structure Lens Quick Actions result metric routing, Structure Lens summary/actions, and docs/QA expectations.
- [x] Add structured Structure Lens result metric details without changing Structure Lens derivation, action routing, or project data.
- [x] Update product/docs language and QA harness expectations for Structure Lens result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Structure Lens result metrics are clearer while preserving Structure Lens signal derivation, action suggestions, Next Move routing, action handlers, arrangement data, Pattern data, project data, playback, export behavior, remote boundaries, platform-loudness boundaries, and sampler boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-26 | Improve Structure Lens Quick Actions result metrics instead of changing Structure Lens actions. | The app already has local Structure Lens actions; richer result metrics make song-shape decisions clearer without changing arrangement generation or editing behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-26 | project_lead | Plan created after 801 completed plans to continue improving first-time and producer-facing workflow clarity. |
| 2026-06-26 | plan_keeper | Found Structure Lens Quick Actions reused the generic Next Move metric, which did not surface target-fit, section coverage, hook contrast, energy arc, selected Pattern, arrangement length, action route, audition cue, and next structure check clearly enough; added a Structure Lens-specific result metric helper and pinned docs/QA expectations while preserving `runNextMove` and Structure Lens action routing. |

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

Post-QA review passed. The diff only adds Structure Lens-specific Quick Actions result metric derivation plus docs/QA expectations; Structure Lens summary/signal/action derivation, `runNextMove`, Quick Actions command routing, arrangement data, Pattern data, project data, playback, export behavior, remote behavior, and sampling boundaries remain unchanged.
