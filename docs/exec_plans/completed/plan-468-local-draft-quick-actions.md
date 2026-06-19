# plan-468-local-draft-quick-actions

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Expose explicit Restore Draft and Clear Draft Quick Actions for the existing local draft recovery workflow so users can discover and run recovery actions from the command palette while reusing the visible banner handlers and UI-local Local Draft Recovery Result feedback.

## Non-Goals

- Do not change local draft storage format, parser behavior, localStorage key/version/size limits, project file serialization, project schema, undo/redo history semantics, snapshots, playback, render/export, MIDI export, Handoff, shortcuts, Native Command Menu, Project File Result behavior, or visible banner behavior.
- Do not add autosave, cloud sync, accounts, analytics, destructive filesystem actions, remote AI, sampling, imported audio, or sample-pack workflows.
- Do not run recovery actions automatically or from command chains; actions remain explicit user commands and disabled when no recovery draft exists.

## Context Map

- `src/ui/App.tsx`: Quick Actions definitions/routing, local draft recovery handlers, result strip rendering.
- `src/ui/workstationUiModel.ts`: Quick Action data contracts if needed.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Inspect Quick Actions definitions and command routing for Project-scope actions.
- [x] Add Restore Draft and Clear Draft Quick Actions, disabled when no local draft recovery is available.
- [x] Route commands only through the existing visible restore/clear handlers and existing Local Draft Recovery Result feedback.
- [x] Update docs and harness expectations.
- [x] Run QA, review, complete plan, and create review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review should confirm the commands are explicit, disabled without a recovery draft, reuse the existing handlers/result feedback, and preserve local draft storage, project files, undo/redo history, playback/export, Handoff, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add local draft recovery commands to Quick Actions instead of adding new recovery UI. | The visible banner already owns the workflow; command-palette access improves discoverability and producer speed without changing storage behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created to make local draft recovery discoverable from Quick Actions. |
| 2026-06-19 | harness_builder | Added Project-scope Restore Draft and Clear Draft Quick Actions, disabled them without a recovery draft, and routed them through the existing visible local draft recovery handlers. |
| 2026-06-19 | repo_cartographer | Updated README, product docs, quality rules, and harness expectations so local draft commands preserve local-first storage, existing result feedback, and sampling boundaries. |
| 2026-06-19 | quality_runner | Passed `git diff --check`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run qa`, and `npm run verify`; dev server start was blocked by sandbox `listen EPERM` and escalated retry was rejected by policy. |
| 2026-06-19 | review_judge | Reviewed the completed diff after QA; no blocking findings. |

## Completion Notes

Added explicit Project-scope Restore Draft and Clear Draft Quick Actions for the existing local draft recovery workflow. The commands are disabled when no recovery draft exists, reuse the visible banner handlers, and keep Local Draft Recovery Result plus Quick Action Result feedback UI-local while preserving local draft storage format, parser behavior, project file serialization, project schema, undo/redo history payloads, playback, render/export, MIDI export, Handoff, shortcuts, Native Command Menu, command ranking, pinned/recent behavior, visible banner behavior, and sampling boundaries.

QA passed. Local dev-server browser verification could not run because sandboxed localhost listening failed with `listen EPERM: operation not permitted 127.0.0.1:5173`, and the required escalation was rejected by policy. `npm run build` still reports the existing non-blocking Vite chunk-size warning.
