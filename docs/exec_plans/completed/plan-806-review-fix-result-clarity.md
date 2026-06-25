# plan-806-review-fix-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition with sampling as secondary scope, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Review Fix post-click result metrics identify the explicit review fix action, Project/Review Queue destination, selected issue and fix, fix status/context, applied scope/impact, selected Delivery Target, Review Queue readiness posture, Beat Readiness posture, selected Pattern, editable event count, Pattern A/B/C usage, arrangement block count, song length, export readiness, stem readiness, audition cue, and next review check so beginners understand what was fixed and working producers can scan current mix/arrangement/export readiness immediately after a one-step review fix.

## Non-Goals

- Do not change Review Queue derivation, Review Fix option selection, fix handlers, issue ordering, Beat Readiness scoring, Export Preflight, Mix Coach, Handoff Pack, project data beyond the explicit existing Review Fix effects, arrangement data beyond the explicit existing Review Fix effects, Pattern data beyond the explicit existing Review Fix effects, mixer/master state beyond the explicit existing Review Fix effects, export handlers, file contents, filenames, project schema, save/load, undo/redo, playback, snapshots, local drafts, or sampler behavior.
- Do not add hidden generation, auto-run, macros, autoplay, auto-arrangement, batch export, background rendering, sampling, sampler devices, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, payments, cloud sync, publishing/licensing claims, platform-loudness compliance, or LUFS/true-peak guarantees.

## Context Map

- `src/ui/App.tsx` owns Quick Actions, Review Queue, Review Fix previews/results, visible result strips, result metrics, action handlers, Beat Readiness, export analysis, and local result feedback.
- `README.md` and `docs/product/product.md` describe Review Queue, Review Fix, and command-map coverage.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin Review Queue/Review Fix expectations, local-first behavior, direct beat-composition scope, and sampling boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-806-review-fix-result-clarity` and `.worktree/plan-806-review-fix-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect current Review Fix result metric routing, direct Review Queue fix action ids, preview/result helpers, and docs/QA expectations.
- [x] Add structured Review Fix result metric details without changing Review Queue derivation, Review Fix option selection, action routing, or project data outside existing explicit fix effects.
- [x] Update product/docs language and QA harness expectations for Review Fix result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Review Fix result metrics are clearer while preserving Review Queue derivation, Review Fix option selection, direct fix action ids, fix handlers, project data boundaries, playback, export behavior, remote boundaries, platform-loudness boundaries, and sampler boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-26 | Improve Review Fix post-click result metrics instead of changing queue derivation or fix handlers. | The app already has explicit one-step local review fixes; richer result metrics make each fix outcome clearer without changing how issues are chosen or applied. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-26 | project_lead | Plan created after 805 completed plans to continue improving first-time and producer-facing workflow clarity. |
| 2026-06-26 | plan_keeper | Found Review Fix Quick Actions had direct fix ids and preview/result helpers, but post-click result metrics only returned Review Queue headline/detail. Added a read-only metric/follow-up helper that preserves fix routing and expands the result with selected issue/fix, scope/impact, queue/readiness/export/stem, Pattern, arrangement, audition, and next-check context. |

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

Post-QA review passed. The diff keeps Review Queue derivation, issue order, scoring, fix option selection, direct fix command ids, `applyReviewFix`, existing fix handlers, project data boundaries, playback, save/load, render/export, remote, and sampler behavior intact; the added helper only expands Review Fix Quick Actions result metrics and follow-up text from local command, Review Queue, Beat Readiness, export, stem, Delivery Target, Pattern, and arrangement state.
