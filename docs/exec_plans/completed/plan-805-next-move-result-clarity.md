# plan-805-next-move-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition with sampling as secondary scope, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Next Move post-click result metrics identify the explicit recommended action, route, action-specific before/after posture, selected Delivery Target, Beat Readiness posture, selected Pattern, editable event count, Pattern A/B/C usage, arrangement block count, song length, export readiness, stem readiness, audition cue, and next check so beginners can understand what the recommendation did and working producers can scan the current production state from the result strip.

## Non-Goals

- Do not change Next Move recommendation derivation, action ordering, action definitions, action handlers, Beat Readiness scoring, Beat Map, Structure Lens, Workflow Navigator, Workflow Spotlight, project data beyond the explicit existing Next Move action, arrangement data beyond the explicit existing Next Move action, Pattern data beyond the explicit existing Next Move action, mixer/master state beyond the explicit existing Next Move action, export handlers, file contents, filenames, project schema, save/load, undo/redo, playback, snapshots, local drafts, or Handoff Pack behavior.
- Do not add hidden generation, auto-run, macros, autoplay, auto-arrangement, batch export, background rendering, sampling, sampler devices, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, payments, cloud sync, publishing/licensing claims, platform-loudness compliance, or LUFS/true-peak guarantees.

## Context Map

- `src/ui/App.tsx` owns Next Move recommendations, visible result strips, result metrics, action handlers, Beat Readiness, export analysis, and local result feedback.
- `README.md` and `docs/product/product.md` describe Next Move and command-map coverage.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin Next Move, local-first behavior, direct beat-composition scope, and sampling boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-805-next-move-result-clarity` and `.worktree/plan-805-next-move-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect current Next Move result metric routing, action kinds, and docs/QA expectations.
- [x] Add structured Next Move result metric details without changing recommendation derivation, action routing, or project data outside existing explicit action effects.
- [x] Update product/docs language and QA harness expectations for Next Move result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Next Move result metrics are clearer while preserving Next Move recommendation derivation, action ordering, action definitions, action handlers, project data boundaries, playback, export behavior, remote boundaries, platform-loudness boundaries, and sampler boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-26 | Improve Next Move post-click result metrics instead of changing recommendations or handlers. | The app already has local explicit recommended actions; richer result metrics make each recommendation outcome clearer without changing the action system. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-26 | project_lead | Plan created after 804 completed plans to continue improving first-time and producer-facing workflow clarity. |
| 2026-06-26 | plan_keeper | Found Next Move post-click result metrics were action-specific single posture values; expanded them with recommended action, route, Delivery Target, Beat Readiness, Pattern A/B/C, arrangement, export, stem, audition, and next-check context while preserving recommendation derivation and existing action handlers. |

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

Post-QA review passed. The diff keeps Next Move recommendation derivation, action ordering, action definitions, and existing action handlers intact; the added helper only expands the post-click result metric value from local project, Beat Readiness, export, stem, Delivery Target, arrangement, Pattern A/B/C, and action/follow-up state. No project schema, playback, save/load, render/export, remote, or sampler behavior changes were found.
