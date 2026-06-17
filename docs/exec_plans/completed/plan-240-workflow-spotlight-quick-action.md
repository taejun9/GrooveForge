# plan-240-workflow-spotlight-quick-action

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop app that working composers/producers can respect while staying easy for first-time composers.

## Goal

Add a Quick Actions command that focuses the current Workflow Spotlight target. This gives beginners a command-palette route to the next visible Compose/Arrange/Mix/Deliver zone and lets experienced producers jump through the dense workstation without visually hunting for the navigator.

## Non-Goals

- Do not add hidden generation, onboarding overlays, command chains, macros, autoplay, auto-save, or auto-export.
- Do not change Workflow Navigator item derivation, scoring, ordering, or jump semantics.
- Do not mutate project data, saved project schema, undo history, playback, render/export output, Handoff behavior, sampling scope, accounts, analytics, cloud sync, or remote AI.
- Do not create a new workflow target system; reuse the existing Workflow Navigator jump path.

## Context Map

- `src/ui/App.tsx`: Quick Actions definitions, result strip, Workflow Navigator, Workflow Spotlight, and jump handlers.
- `README.md`: public current-scope summary.
- `docs/product/product.md`: durable product behavior and feature list.
- `docs/quality/rules.md`: QA rules for Workflow Spotlight and Quick Actions.
- `harness/scripts/run_qa.py`: static expectations for docs and UI tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep sampling secondary; this is navigation/workflow UX only.

## Implementation Plan

- [x] Inspect existing Quick Actions, Session Pass focus, Workflow Spotlight, and Workflow Navigator jump patterns.
- [x] Add a `workflow-spotlight-focus` Quick Action derived from visible Workflow Navigator items.
- [x] Route the command through the existing Workflow Navigator jump handler and disable it when no spotlight zone exists.
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

QA completes before review starts. Review checks that the command is UI-local, explicit, searchable, disabled without a derived zone, reuses the existing Workflow Navigator jump path, preserves Workflow Spotlight and Quick Actions semantics, and does not mutate project data or introduce sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a Workflow Spotlight Quick Action instead of a new guide surface. | The current gap is fast access to the already-derived next workflow target, not another scoring or recommendation layer. |
| 2026-06-17 | Treat browser smoke as blocked by local listen permissions, not by product behavior. | `npm run dev` failed with `listen EPERM` on `127.0.0.1:5173`; escalated retry was rejected by environment policy. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Created plan from the persistent goal and recent Workflow Spotlight/Session Pass work. |
| 2026-06-17 | harness_builder | Added the Workflow Spotlight focus command to Quick Actions, reusing existing visible-item derivation and Workflow Navigator jumps. |
| 2026-06-17 | quality_runner | QA passed: run_qa, git diff --check, typecheck, npm qa, quality gate, build, and verify. Browser smoke was blocked by localhost listen permissions. |
| 2026-06-17 | review_judge | Reviewed focus-only command behavior, disabled no-zone handling, docs, and static QA coverage. |

## Completion Notes

Completed. Quick Actions now includes `workflow-spotlight-focus`, derived from the same visible Workflow Navigator items as the Workflow Spotlight panel. The command is disabled without a derived zone, uses the existing Workflow Navigator jump path when run, and shows a focus-only Quick Action Result without mutating project data, saved schema, undo history, playback, render/export, Handoff behavior, or sampling scope. Browser smoke could not be run because the environment rejected local dev-server listen permissions.
