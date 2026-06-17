# plan-243-composer-guide-quick-action

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop app that working composers/producers can respect while staying easy for first-time composers.

## Goal

Add a Quick Actions command that focuses the current highest-priority Composer Guide card. This gives first-time composers a direct "what should I write next?" command and gives working producers a fast command-palette route to the most relevant composition gap.

## Non-Goals

- Do not change Composer Guide card derivation, scoring, recommendations, or focus targets.
- Do not auto-write, auto-generate, auto-run Composer Actions, trigger playback, export, save, or mutate project data.
- Do not change project schema, undo history, render/export output, Handoff behavior, sampling scope, accounts, analytics, cloud sync, or remote AI.
- Do not create a new writing guide surface; reuse the existing Composer Guide focus handler.

## Context Map

- `src/ui/App.tsx`: Quick Actions, Composer Guide, `focusComposerGuideCard`, and Quick Action result strips.
- `README.md`: current product feature summary.
- `docs/product/product.md`: durable feature definitions and MVP scope.
- `docs/quality/rules.md`: Quick Actions and Composer Guide Focus rules.
- `harness/scripts/run_qa.py`: static expectations for docs and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary; this is direct-composition navigation UX only.

## Implementation Plan

- [x] Inspect existing Composer Guide focus behavior and Quick Actions focus-only commands.
- [x] Add a `composer-guide-focus` Quick Action derived from the current highest-priority Composer Guide card.
- [x] Route the command through `focusComposerGuideCard` and disable it when no Composer Guide card exists.
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

QA completes before review starts. Review checks that the command is UI-local, explicit, searchable, disabled without a card, reuses the existing Composer Guide focus handler, preserves guide scoring/recommendations, and does not mutate project data or introduce sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a top Composer Guide focus Quick Action. | Composer Guide already identifies writing posture; command-palette access reduces friction for beginners deciding what to write next and producers scanning missing layers. |
| 2026-06-17 | Use the Composer Guide danger, then warn, then first-card priority for the command. | This matches the existing guide headline priority without introducing a separate recommendation model. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Created plan from the persistent goal and existing Composer Guide/Quick Actions surfaces. |
| 2026-06-17 | harness_builder | Added `composer-guide-focus` to Quick Actions, routed it through `focusComposerGuideCard`, and added UI-only result metric/follow-up copy. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality rules, and static QA expectations for Composer Guide Quick Action coverage. |
| 2026-06-17 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run typecheck`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, and `npm run verify`. |
| 2026-06-17 | quality_runner | Browser smoke was blocked because `npm run dev` failed with `listen EPERM: operation not permitted 127.0.0.1:5173`; escalated retry was rejected by the environment policy. |
| 2026-06-17 | review_judge | Review found no blocking issues; command remains explicit, UI-local, and derived from the existing highest-priority Composer Guide card. |

## Completion Notes

Completed implementation, QA, and review. The only unresolved validation gap is local browser smoke because the environment denied starting the Vite dev server on `127.0.0.1:5173`.
