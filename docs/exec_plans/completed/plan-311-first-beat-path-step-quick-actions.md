# plan-311-first-beat-path-step-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Quick Actions for every First Beat Path step so beginners can jump to Setup, Compose, Arrange, Mix, or Deliver guidance from command search, while producers can move quickly between the major workstation stages without changing project data, autoplaying, exporting, or adding sampling-first workflow.

## Non-Goals

- Do not change First Beat Path scoring, step derivation, Workflow Navigator item derivation, Beat Map scoring, Export Preflight scoring, Composer Guide, Review Queue, Finish Checklist, Next Move, playback, save/load, undo/redo, WAV/stem/MIDI export, Handoff Pack, or Handoff Sheet behavior.
- Do not add onboarding overlays, tutorials, macros, command chains, hidden generation, autoplay, auto-save, auto-export, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: `FirstBeatPath`, `firstBeatPathSummary`, `activeFirstBeatPathQuickActionStep`, Quick Actions generation, focus-only command handling, result metrics, and follow-up feedback.
- `README.md`: feature summary and command-search behavior.
- `docs/product/product.md`: First Beat Path and Quick Actions product behavior.
- `docs/quality/rules.md`: First Beat Path and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-311-first-beat-path-step-quick-actions` and `.worktree/plan-311-first-beat-path-step-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing First Beat Path step rendering and Quick Actions result patterns.
- [x] Add one direct focus-only Quick Action per existing First Beat Path step.
- [x] Route direct step commands through the existing First Beat Path jump handler.
- [x] Add local result metric/follow-up copy for direct First Beat Path step commands.
- [x] Update durable docs and QA expectations to keep commands UI-local, explicit, and sample-free.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run direct First Beat Path step Quick Actions, confirm they jump only to existing panels and do not mutate project data, autoplay, export, or show sampling-first entry points.

## Review Plan

QA completes before review starts. Review checks that direct First Beat Path step commands derive only from the existing summary steps, route only through the existing jump handler, stay focus-only/UI-local, preserve project data and export behavior, and avoid sampling, autoplay, command chains, or cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Quick Actions for First Beat Path steps. | Current command access covers only the next step; direct stage commands make the beginner path more legible and give experienced producers faster navigation across the beat-making workflow. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming First Beat Path already has clickable steps and one current-next-step Quick Action, but no direct per-step commands. |
| 2026-06-18 | harness_builder | Added direct First Beat Path step Quick Actions from existing summary steps and routed runs only through `onJumpFirstBeatPath`. |
| 2026-06-18 | harness_builder | Marked direct step commands as focus-only result actions and added UI-only result metric/follow-up copy. |
| 2026-06-18 | harness_builder | Updated README, product docs, quality rules, and QA expectations for First Beat Path jump and step jump commands. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `git diff --check`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run verify`, and `npm run qa`. |
| 2026-06-18 | quality_runner | Browser smoke was attempted, but starting the local Vite dev server on `127.0.0.1:5335` failed with sandbox `EPERM`; escalated retry was rejected by environment policy, so no browser workaround was used. |
| 2026-06-18 | review_judge | Reviewed the diff after QA. No blocking findings found; residual risk is limited to missing interactive browser confirmation because localhost binding is blocked in this environment. |

## Completion Notes

- Quick Actions now expose direct setup, compose, arrange, mix, and deliver First Beat Path step commands.
- Direct step commands derive from the existing First Beat Path summary and route through the same jump handler as visible step clicks.
- Result feedback stays UI-local and focus-only, with no project data mutation, autoplay, export, sampling, or cloud scope.
