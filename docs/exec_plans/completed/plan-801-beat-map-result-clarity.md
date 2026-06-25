# plan-801-beat-map-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition with sampling as secondary scope, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Beat Map Quick Actions result metrics identify the explicit Beat Map action, Guide destination, target workflow stage, stage status/context, selected Delivery Target, current completion posture, selected Pattern, editable event count, Pattern A/B/C usage, arrangement block count, song length, export readiness, stem readiness, package readiness, action route, audition cue, and next Beat Map check so beginners can understand the next end-to-end beat step and working producers can scan production state from command results.

## Non-Goals

- Do not change Beat Map card derivation, stage scoring, action suggestions, Next Move routing, direct action handlers, arrangement data, Pattern data, mixer/master state, export handlers, file contents, filenames, project schema, save/load, undo/redo, playback, snapshots, local drafts, or Handoff Pack behavior.
- Do not add hidden generation, auto-run, macros, autoplay, batch export, background rendering, sampling, sampler devices, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, payments, cloud sync, publishing/licensing claims, platform-loudness compliance, or LUFS/true-peak guarantees.

## Context Map

- `src/ui/App.tsx` owns Quick Actions result metrics, Beat Map summaries/actions, Next Move routing, Delivery Target state, export/stem/package summaries, and local result feedback.
- `README.md` and `docs/product/product.md` describe Beat Map production overview and command-map coverage.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin Quick Actions, Beat Map, local-first behavior, direct beat-composition scope, and sampling boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-801-beat-map-result-clarity` and `.worktree/plan-801-beat-map-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect current Beat Map Quick Actions result metric routing, Beat Map action summaries, and docs/QA expectations.
- [x] Add structured Beat Map result metric details without changing Beat Map derivation, action routing, or project data.
- [x] Update product/docs language and QA harness expectations for Beat Map result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Beat Map result metrics are clearer while preserving Beat Map card derivation, action suggestions, Next Move routing, action handlers, project data, playback, export behavior, remote boundaries, platform-loudness boundaries, and sampler boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-26 | Improve Beat Map Quick Actions result metrics instead of changing Beat Map actions. | The app already has local Beat Map actions; richer result metrics make the whole-beat workflow clearer without changing composition, arrangement, mix, or export behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-26 | project_lead | Plan created after 800 completed plans to continue improving first-time and producer-facing workflow clarity. |
| 2026-06-26 | plan_keeper | Found Beat Map Quick Actions reused the generic Next Move metric, which showed one before/after value but not the Beat Map stage, target, completion, pattern, export, stem, package, route, audition, and next-check context; added a Beat Map-specific result metric helper and pinned docs/QA expectations while preserving Next Move routing and action handlers. |

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

Post-QA review passed. The diff only adds Beat Map-specific Quick Actions result metric derivation plus docs/QA expectations; Beat Map summary/stage/metric/action derivation, `runNextMove`, Quick Actions command routing, project data, playback, export behavior, remote behavior, and sampling boundaries remain unchanged.
