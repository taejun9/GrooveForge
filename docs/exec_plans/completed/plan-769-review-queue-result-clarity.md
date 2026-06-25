# plan-769-review-queue-result-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Make Quick Actions Review Queue result metrics identify the explicit production review action, current top or direct queue issue, destination panel, issue status/context, selected Pattern, editable event count, Pattern A/B/C usage, queue readiness summary, fix availability, arrangement block count, and song length so beginners know the next production issue and working producers can scan priority posture immediately after command execution.

## Non-Goals

- Do not change Review Queue issue derivation, issue order, scoring, visible focus controls, direct issue command definitions, fix routing, or focus routing.
- Do not change Beat Passport, Beat Readiness, Listening Pass, Production Snapshot, Finish Checklist, Export Preflight, Mix Coach, Delivery Target, Session Brief, Pattern A/B/C event data, arrangement data, playback, render/export, save/load, local draft, Handoff, or sampler boundaries.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run, autoplay, hidden generation, auto-save, auto-export, sampling, imported audio, audio analysis, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns Review Queue summary creation, Quick Actions Review Queue focus commands, and generic Quick Action Result metric snapshots.
- `README.md` and `docs/product/product.md` frame Review Queue as local prioritized production issue guidance with explicit focus/fix routing.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` pin Review Queue derivation, routing, and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-769-review-queue-result-clarity` and `.worktree/plan-769-review-queue-result-clarity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Inspect Review Queue Quick Action result metrics and current command detail format.
- [x] Add structured Review Queue result metric helpers without changing issue derivation, focus routing, or fix routing.
- [x] Update product/docs language and QA harness expectations for Review Queue result clarity.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Review Queue Quick Action result feedback is clearer while preserving issue derivation, issue priority, direct issue routing, fix routing, Pattern A/B/C event semantics, arrangement data, playback, export, Handoff, remote, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-26 | Improve the generic Quick Action Result metric instead of changing Review Queue issues, focus handlers, or fix handlers. | Review Queue already routes explicit issue focus and fix actions through existing handlers; the post-run metric should expose the selected issue and current queue posture without changing scoring or project data. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-26 | project_lead | Plan created for Review Queue Quick Action result clarity. |
| 2026-06-26 | harness_builder | Added structured Review Queue Quick Action result metric helpers plus product, quality, and QA harness expectations while preserving issue derivation, focus routing, fix routing, Pattern A/B/C event semantics, playback, export, and sampler boundaries. |
| 2026-06-26 | quality_runner | Ran the full required validation suite; all commands passed with the existing Vite chunk-size warning during build steps. |
| 2026-06-26 | review_judge | Reviewed the diff for Review Queue issue derivation, issue priority, focus routing, fix routing, Pattern A/B/C event semantics, arrangement data, playback, export, remote, and sampler boundaries; no blocking findings. |

## QA Log

| command | result |
|---|---|
| `git diff --check` | Passed. |
| `python3 harness/scripts/run_qa.py` | Passed. |
| `npm run typecheck` | Passed after normalizing the optional analysis argument. |
| `python3 harness/scripts/run_quality_gate.py` | Passed. |
| `npm run build` | Passed with the existing Vite chunk-size warning. |
| `npm run qa` | Passed. |
| `npm run verify` | Passed with the existing Vite chunk-size warning during the build step. |

## Review Log

Reviewed the diff for Review Queue issue derivation, issue priority, focus routing, fix routing, Pattern A/B/C event semantics, arrangement data, playback, export, remote, and sampler boundaries. No blocking findings.
