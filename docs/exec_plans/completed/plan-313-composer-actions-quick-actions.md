# plan-313-composer-actions-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Composer Actions Quick Actions for the existing style-aware drums, 808/bass, harmony, melody, arrangement, and finish writing moves so beginners can run the same visible sample-free composer buttons from command search and producers can quickly execute local writing moves without hunting through the surface.

## Non-Goals

- Do not change Composer Actions derivation, style priorities, visible button order, visible button behavior, Composer Guide, Beat Spine, Layer Starter, Pattern Stack, Next Move, project schema, playback, save/load, undo/redo, WAV/stem/MIDI export, Handoff Pack, or Handoff Sheet behavior.
- Do not add onboarding overlays, tutorials, macros, command chains, hidden generation, auto-run, autoplay, auto-save, auto-export, sampling, imported audio, sampler devices, audio clips, remote AI, accounts, analytics, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: Composer Actions summary/buttons/results, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: feature summary and command-search behavior.
- `docs/product/product.md`: Composer Actions and Quick Actions product behavior.
- `docs/quality/rules.md`: Composer Actions and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-313-composer-actions-quick-actions` and `.worktree/plan-313-composer-actions-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Composer Actions, Quick Actions, and result patterns.
- [x] Add direct Composer Actions Quick Actions for every existing Composer Action.
- [x] Route command runs through the same existing Composer Actions handler used by visible buttons.
- [x] Add local result metric/follow-up copy for direct Composer Actions commands.
- [x] Update durable docs and QA expectations to keep commands explicit, undoable, local, and sample-free.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run direct Composer Actions Quick Actions, confirm each command uses the same visible Composer Actions result posture and existing undoable writing handlers, and confirm no autoplay/export/sampling entry point appears.

## Review Plan

QA completes before review starts. Review checks that direct Composer Actions commands derive only from existing `composerActionsSummary.actions`, route only through the existing Composer Actions handler, preserve result feedback and undoable edit semantics, and avoid sampling, autoplay, command chains, hidden generation, or cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Composer Actions Quick Actions. | Composer Actions are the style-aware, sample-free writing buttons; exposing them through command search improves speed for producers and discoverability for beginners without introducing hidden generation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Quick Actions expose Composer Guide focus commands but not the direct Composer Actions writing buttons. |
| 2026-06-18 | harness_builder | Added direct Composer Actions Quick Actions from existing `composerActionsSummary.actions` and routed command runs only through `runComposerAction`. |
| 2026-06-18 | harness_builder | Added Composer Action area-specific Quick Actions result metrics and follow-up cues for drums, 808, harmony, melody, arrangement, and finish commands. |
| 2026-06-18 | harness_builder | Updated README, product docs, quality rules, and QA expectations for direct Composer Actions Quick Actions. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `npm run typecheck`, and `git diff --check`. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run verify`, and `npm run qa`. |
| 2026-06-18 | quality_runner | Browser smoke was attempted, but starting the local Vite dev server on `127.0.0.1:5337` failed with sandbox `EPERM`; escalated retry was rejected by environment policy, so no browser workaround was used. |
| 2026-06-18 | review_judge | Reviewed the diff after QA. No blocking findings found; residual risk is limited to missing interactive browser confirmation because localhost binding is blocked in this environment. |

## Completion Notes

- Quick Actions now expose direct Composer Actions commands for the existing drums, 808/bass, harmony, melody, arrangement, and finish writing moves.
- Direct commands derive from `composerActionsSummary.actions` and route only through the existing `runComposerAction` path used by visible Composer Actions buttons.
- Quick Actions result feedback now has area-specific metrics and follow-up cues for Composer Action commands.
- The change adds no sampling, imported audio, autoplay, auto-export, command chains, hidden generation, remote AI, accounts, analytics, or cloud sync.
