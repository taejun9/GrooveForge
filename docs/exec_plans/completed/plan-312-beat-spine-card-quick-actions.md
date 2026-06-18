# plan-312-beat-spine-card-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Beat Spine card Quick Actions for Setup, Drums, 808/Bass, Harmony, Melody, Sound, Arrange, and Finish so beginners can jump to any core beat-making axis from command search and producers can quickly apply available sample-free spine actions, while preserving existing Beat Spine scoring, visible card behavior, undoable apply handlers, and UI-only result feedback.

## Non-Goals

- Do not change Beat Spine scoring, card/action derivation, visible card order, existing Jump or Apply button behavior, First Beat Path, Workflow Navigator, Composer Guide, Beat Map, Export Preflight, Review Queue, Finish Checklist, Next Move, project schema, playback, save/load, undo/redo, WAV/stem/MIDI export, Handoff Pack, or Handoff Sheet behavior.
- Do not add onboarding overlays, tutorials, macros, command chains, hidden generation, auto-run, autoplay, auto-save, auto-export, sampling, imported audio, sampler devices, audio clips, remote AI, accounts, analytics, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: Beat Spine summary/cards/actions, visible Beat Spine Jump/Apply buttons, Quick Actions generation, focus-only handling, result metrics, and follow-up feedback.
- `README.md`: feature summary and command-search behavior.
- `docs/product/product.md`: Beat Spine and Quick Actions product behavior.
- `docs/quality/rules.md`: Beat Spine and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-312-beat-spine-card-quick-actions` and `.worktree/plan-312-beat-spine-card-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Beat Spine card, action, Quick Actions, and result patterns.
- [x] Add direct Beat Spine card jump Quick Actions for every existing card.
- [x] Add direct Beat Spine card apply Quick Actions for every existing card, disabling cards without actions.
- [x] Route jump commands only through `onJumpBeatSpine` and apply commands only through `onApplyBeatSpine`.
- [x] Add local result metric/follow-up copy for direct Beat Spine card commands.
- [x] Update durable docs and QA expectations to keep commands explicit, undoable or focus-only as appropriate, and sample-free.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run direct Beat Spine jump/apply Quick Actions, confirm jump commands do not mutate project data, apply commands use the same undoable Beat Spine apply path, unavailable apply commands are disabled, and no autoplay/export/sampling entry point appears.

## Review Plan

QA completes before review starts. Review checks that direct Beat Spine commands derive only from existing summary cards/actions, route only through existing jump/apply handlers, keep focus-only jump feedback UI-local, preserve undoable apply semantics, and avoid sampling, autoplay, command chains, or cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Beat Spine card jump/apply Quick Actions. | Beat Spine is the sample-free core beat-making axis; direct command access lets beginners choose a specific stage and lets producers rapidly apply available core moves. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Beat Spine visible cards already have Jump/Apply controls and Quick Actions only expose the current jump/apply target. |
| 2026-06-18 | harness_builder | Added direct Beat Spine card jump commands from existing Beat Spine cards and routed them only through `onJumpBeatSpine`. |
| 2026-06-18 | harness_builder | Added direct Beat Spine card apply commands from existing card actions, disabled cards without actions, and routed applies only through `onApplyBeatSpine`. |
| 2026-06-18 | harness_builder | Updated README, product docs, quality rules, and QA expectations for direct Beat Spine card jump/apply commands. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `git diff --check`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run verify`, and `npm run qa`. |
| 2026-06-18 | quality_runner | Browser smoke was attempted, but starting the local Vite dev server on `127.0.0.1:5336` failed with sandbox `EPERM`; escalated retry was rejected by environment policy, so no browser workaround was used. |
| 2026-06-18 | review_judge | Reviewed the diff after QA. No blocking findings found; residual risk is limited to missing interactive browser confirmation because localhost binding is blocked in this environment. |

## Completion Notes

- Quick Actions now expose direct Beat Spine card jump commands for all core axes.
- Quick Actions now expose direct Beat Spine card apply commands for all cards, with unavailable applies disabled.
- Jump commands remain focus-only; apply commands use the existing undoable Beat Spine apply path.
- The change adds no sampling, imported audio, autoplay, auto-export, command chains, remote AI, accounts, analytics, or cloud sync.
