# plan-241-review-queue-quick-action

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop app that working composers/producers can respect while staying easy for first-time composers.

## Goal

Add a Quick Actions command that focuses the current top Review Queue item. This gives beginners a direct "what should I inspect first?" command and gives producers a fast keyboard route to the highest-priority production issue.

## Non-Goals

- Do not change Review Queue issue derivation, priority, scoring, or focus targets.
- Do not auto-fix, auto-run recommendations, trigger playback, export, save, or mutate project data.
- Do not change project schema, undo history, render/export output, Handoff behavior, sampling scope, accounts, analytics, cloud sync, or remote AI.
- Do not create a new review system; reuse the existing Review Queue focus handler.

## Context Map

- `src/ui/App.tsx`: Quick Actions, Review Queue, `focusReviewQueueItem`, and Quick Action result strips.
- `README.md`: current product feature summary.
- `docs/product/product.md`: durable feature definitions and MVP scope.
- `docs/quality/rules.md`: Quick Actions and Review Queue Focus rules.
- `harness/scripts/run_qa.py`: static expectations for docs and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary; this is review-navigation UX only.

## Implementation Plan

- [x] Inspect existing Review Queue focus behavior and Quick Actions focus-only commands.
- [x] Add a `review-queue-focus` Quick Action derived from the current top Review Queue item.
- [x] Route the command through `focusReviewQueueItem` and disable it when no Review Queue item exists.
- [x] Add a focus-only Quick Action result metric/follow-up for the command.
- [x] Update README, product docs, quality rules, and static QA expectations.
- [x] Run QA and review before merge.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run typecheck`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run verify`
- Attempt local dev server smoke if needed for UI validation; record environment blockers.

## Review Plan

QA completes before review starts. Review checks that the command is UI-local, explicit, searchable, disabled without an item, reuses the existing Review Queue focus handler, preserves Review Queue issue priority/scoring, and does not mutate project data or introduce sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a top Review Queue focus Quick Action. | Review Queue already identifies production issues; command-palette access reduces navigation friction for both beginners and producers. |
| 2026-06-17 | Keep the command focus-only and disabled without a current Review Queue item. | This preserves Review Queue scoring and avoids command-palette auto-fix or hidden mutation behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Created plan from the persistent goal and existing Review Queue/Quick Actions surfaces. |
| 2026-06-17 | harness_builder | Added `review-queue-focus` to Quick Actions, routed it through `focusReviewQueueItem`, and added UI-only result metric/follow-up copy. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality rules, and static QA expectations for Review Queue Quick Action coverage. |
| 2026-06-17 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run typecheck`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, and `npm run verify`. |
| 2026-06-17 | quality_runner | Browser smoke was blocked because `npm run dev` failed with `listen EPERM: operation not permitted 127.0.0.1:5173`; escalated retry was rejected by the environment policy. |
| 2026-06-17 | review_judge | Review found no blocking issues; command remains explicit, UI-local, and derived from the existing top Review Queue item. |

## Completion Notes

Completed implementation, QA, and review. The only unresolved validation gap is local browser smoke because the environment denied starting the Vite dev server on `127.0.0.1:5173`.
