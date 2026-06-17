# plan-298-finish-review-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Finish Checklist card and Review Queue issue Focus commands through Quick Actions so beginners can jump to each finish-readiness step and producers can triage any queued production issue from command search without changing project data.

## Non-Goals

- Do not change Finish Checklist card derivation, Review Queue issue derivation, scoring, priority/order, visible focus buttons, project schema, musical events, arrangement, mixer, master, delivery target, Session Brief, undo/redo, playback, save/load, or export behavior.
- Do not add auto-fixing, auto-mastering, auto-export, tutorials, onboarding overlays, macros, command chains, hidden generation, auto-run, autoplay, sampling, imported audio, remote AI, accounts, analytics, plugin hosting, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: `finishChecklistSummary.cards`, `reviewQueueSummary.items`, `onFocusFinishChecklist`, `onFocusReviewQueue`, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary and command-search description.
- `docs/product/product.md`: Finish Checklist, Review Queue, and Quick Actions product behavior.
- `docs/quality/rules.md`: Finish Checklist/Review Queue focus and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-298-finish-review-quick-actions` and `.worktree/plan-298-finish-review-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Finish Checklist and Review Queue focus/Quick Actions result patterns.
- [x] Add one Quick Action per Finish Checklist card and per Review Queue item that reuses the existing focus handlers.
- [x] Add local result metric/follow-up copy for the direct commands without mutating project data.
- [x] Update durable docs and QA expectations to keep the commands scoped to UI-local focus navigation.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run direct Finish Checklist and Review Queue Quick Actions, confirm each command focuses the matching card/item or panel without project mutation, autoplay, console errors, or desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Finish Checklist and Review Queue direct commands derive only from existing cards/items, route only to existing focus handlers, keep result feedback UI-local, preserve project data/playback/export/save/load/undo semantics, and avoid auto-fixing, sampling, cloud, or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Quick Actions for Finish Checklist cards and Review Queue issues. | Finish readiness and issue triage are core beginner/pro workflows; direct command access improves navigation without generation or data mutation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Finish Checklist and Review Queue have visible focus buttons and single top-card/top-issue Quick Actions, but no direct per-card/per-issue commands. |
| 2026-06-18 | harness_builder | Added direct Finish Checklist card and Review Queue item Quick Actions, UI-local result/follow-up copy, documentation, and harness expectations. |
| 2026-06-18 | quality_runner | `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `git diff --check`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `npm run qa` passed. |
| 2026-06-18 | quality_runner | Browser smoke was blocked because Vite could not bind `127.0.0.1:5322` with `listen EPERM`, and the escalated localhost retry was rejected. |
| 2026-06-18 | review_judge | Reviewed the diff after QA and found no follow-up issues; commands derive from existing Finish Checklist cards and visible Review Queue items, then route only through existing focus handlers. |

## Completion Notes

- Added direct Quick Actions for Finish Checklist Compose, Arrange, Mix, Master, and Handoff cards.
- Added direct Quick Actions for visible Review Queue issues, including the ready-state item when no issues are queued.
- Commands derive from existing `finishChecklistSummary.cards` and `reviewQueueSummary.items`, route through `onFocusFinishChecklist(card)` or `onFocusReviewQueue(item)`, and keep result metrics/follow-up copy UI-local.
- Updated README, product docs, quality rules, and harness expectations to preserve direct beat composition scope and avoid auto-fixing, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- QA passed: `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `git diff --check`, `npm run verify`, and `npm run qa`.
- Browser smoke was not completed because localhost binding failed with `listen EPERM` on `127.0.0.1:5322`, and the escalated retry was rejected.
