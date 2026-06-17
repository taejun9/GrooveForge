# plan-296-workflow-navigator-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Workflow Navigator zone jumps through Quick Actions so beginners and producers can jump to Compose, Arrange, Mix, or Deliver from command search while preserving the existing UI-only navigation behavior.

## Non-Goals

- Do not change Workflow Navigator item derivation, Workflow Spotlight derivation, First Beat Path, Beat Map, Export Preflight, panel layout, project schema, or saved project data.
- Do not run edits, apply generation, start playback, create undo history, auto-save, auto-export, add tutorials/onboarding overlays, sampling, imported audio, remote AI, accounts, analytics, cloud sync, or plugin hosting.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: `workflowNavigatorItems`, `jumpToWorkflowZone`, `WorkflowNavigator`, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary and runtime description.
- `docs/product/product.md`: Workflow Navigator and Quick Actions product behavior.
- `docs/quality/rules.md`: Workflow Navigator guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-296-workflow-navigator-quick-actions` and `.worktree/plan-296-workflow-navigator-quick-actions` for git repository work.

## Implementation Plan

- [x] Inspect existing Workflow Navigator jump behavior and Quick Actions focus/result patterns.
- [x] Add Quick Actions commands for Compose, Arrange, Mix, and Deliver that reuse the existing workflow jump handler.
- [x] Add local result metric/follow-up copy for the commands without mutating project data.
- [x] Update durable docs and QA expectations to keep the commands scoped to UI-local navigation.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run Quick Actions Workflow Navigator zone commands, confirm each command scrolls to the matching Compose/Arrange/Mix/Deliver panel without project mutation, autoplay, console errors, or desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Workflow Navigator commands derive only from existing navigator items, route only to the existing workflow jump handler, keep result feedback UI-local, preserve project data/playback/export/save/load/undo semantics, and avoid command chains, tutorials, sampling, cloud, or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add one Quick Action per Workflow Navigator zone. | Direct command-palette access to Compose, Arrange, Mix, and Deliver improves beginner orientation and producer navigation without adding new generation or data mutation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Workflow Navigator has visible zone jump buttons and a Spotlight command, but no direct zone commands. |
| 2026-06-18 | harness_builder | Added Workflow Navigator zone Quick Actions, local result/follow-up copy, documentation, and harness expectations. |
| 2026-06-18 | quality_runner | Initial `python3 harness/scripts/run_qa.py`, `npm run typecheck`, and `git diff --check` passed. |
| 2026-06-18 | quality_runner | Full `npm run verify` and `npm run qa` passed after implementation; browser smoke was blocked because Vite could not bind `127.0.0.1:5320` with `listen EPERM`, and the escalated localhost retry was rejected. |
| 2026-06-18 | review_judge | Reviewed the diff after QA and found no follow-up issues; commands derive from existing navigator items and route only through the existing workflow jump handler. |
| 2026-06-18 | quality_runner | Final completed-plan validation passed with `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `git diff --check`, `npm run verify`, and `npm run qa`. |

## Completion Notes

- Added one Quick Action per visible Workflow Navigator zone for Compose, Arrange, Mix, and Deliver.
- Commands derive from existing `workflowNavigatorItems`, route through `jumpToWorkflowZone`, and keep result metrics/follow-up copy UI-local.
- Updated README, product docs, quality rules, and harness expectations to preserve direct beat composition scope and avoid sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- QA passed: `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `git diff --check`, `npm run verify`, and `npm run qa`.
- Browser smoke was not completed because localhost binding failed with `listen EPERM` on `127.0.0.1:5320`, and the escalated retry was rejected.
