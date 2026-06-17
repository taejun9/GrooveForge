# plan-295-first-beat-path-quick-action

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose the current First Beat Path next step through Quick Actions so beginners can jump to the next setup/compose/arrange/mix/deliver workstation area from command search, while producers can quickly inspect the same session posture without changing project data.

## Non-Goals

- Do not change First Beat Path scoring, Workflow Navigator derivation, Beat Map, Export Preflight, Review Queue, Finish Checklist, Session Pass, project schema, or saved project data.
- Do not run edits, apply generation, start playback, create undo history, auto-save, auto-export, add tutorials/onboarding overlays, sampling, imported audio, remote AI, accounts, analytics, cloud sync, or plugin hosting.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: `firstBeatPathSummary`, `jumpToFirstBeatPathTarget`, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary and runtime description.
- `docs/product/product.md`: First Beat Path and Quick Actions product behavior.
- `docs/quality/rules.md`: First Beat Path derivation and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-295-first-beat-path-quick-action` and `.worktree/plan-295-first-beat-path-quick-action` for git repository work.

## Implementation Plan

- [x] Inspect existing First Beat Path jump behavior and Quick Actions focus/result patterns.
- [x] Add a First Beat Path Quick Action that targets the current next step and reuses the existing jump handler.
- [x] Add local result metric/follow-up copy for the command without mutating project data.
- [x] Update durable docs and QA expectations to keep the command scoped to UI-local navigation.
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
- Browser smoke if environment allows localhost: open the workstation, run Quick Actions First Beat Path, confirm the current next-step workstation area scrolls into view without project mutation, autoplay, console errors, or desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that the First Beat Path command derives only from the existing summary, routes only to the existing jump handler, keeps result feedback UI-local, preserves project data/playback/export/save/load/undo semantics, and avoids command chains, tutorials, sampling, cloud, or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add one Quick Actions First Beat Path command for the current next step. | The visible First Beat Path already identifies the next beat-making area; command-palette access improves beginner guidance and producer navigation without adding new generation or data mutation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming First Beat Path has panel jump behavior but no dedicated Quick Actions command. |
| 2026-06-18 | harness_builder | Added the First Beat Path Quick Action, local result metric/follow-up copy, documentation, and harness expectations. |
| 2026-06-18 | quality_runner | Initial `python3 harness/scripts/run_qa.py`, `npm run typecheck`, and `git diff --check` passed. |
| 2026-06-18 | quality_runner | Full `npm run verify` and `npm run qa` passed; browser smoke was blocked because sandbox localhost listen failed with `EPERM` and the required escalation was rejected by environment policy. |
| 2026-06-18 | review_judge | Review found no code issues; the command derives from the existing First Beat Path summary and routes only through the existing jump handler. |

## Completion Notes

Implemented a Quick Actions First Beat Path jump command for the current next setup/compose/arrange/mix/deliver step. The command derives from `firstBeatPathSummary`, reuses `jumpToFirstBeatPathTarget`, and shows local result/follow-up feedback without changing First Beat Path scoring, project data, playback, undo history, save/load, or export behavior.

QA passed:

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- `npm run qa`

Browser smoke was not completed because the sandbox rejected localhost server startup with `listen EPERM: operation not permitted 127.0.0.1:5319`, and the required escalated retry was rejected by environment policy. No workaround was attempted.
