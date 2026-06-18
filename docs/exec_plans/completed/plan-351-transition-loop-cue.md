# plan-351-transition-loop-cue

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop beat workstation that satisfies working producers while staying approachable for beginners.

## Goal

Add a UI-local Transition Loop cue path so Arrangement Transition Map handoff cards can be auditioned immediately as two-block transition loops. Producers should be able to hear drops/builds/turnarounds quickly, and beginners should understand which exact boundary they are judging, without changing arrangement data, Pattern A/B/C events, playback engine semantics beyond loop bounds, export, save/load, or project schema.

## Non-Goals

- Do not mutate arrangement blocks, Pattern A/B/C musical events, mixer/master state, save/load data, export behavior, or project schema.
- Do not auto-write fills, auto-arrange sections, auto-mute layers, auto-play, or auto-export.
- Do not add sampling, imported audio, sampler devices, remote AI, accounts, analytics, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`
- `src/ui/workstationUiModel.ts`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Keep transition loop cue state UI-local and out of saved project schema.
- Route visible Cue buttons and Quick Actions Transition Loop commands only through existing selection and transport loop handlers.
- Preserve existing Song, Block, and Pattern loop behavior.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.

## Implementation Plan

- [x] Add `transition` as a UI-local transport loop scope derived from focused/selected adjacent arrangement blocks.
- [x] Add visible Cue buttons to Arrangement Transition Map cards that select the source block, focus the transition, and cue a transition loop.
- [x] Add Quick Actions for current and direct transition loop cue commands.
- [x] Update transport readouts, docs, quality rules, and harness expectations.
- [x] Run QA, review, move plan to completed, and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`

## Review Plan

QA completes before review starts. Review should verify Transition Loop cue derives only from existing arrangement block boundaries, keeps cue state UI-local, and does not mutate project data, render/export, save/load, or schema behavior.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add Transition Loop cue as a UI-local transport scope. | Arrangement playback already supports bounded arrangement loops via `startBar` and `bars`, so two-block transition audition can reuse existing playback without schema or audio-engine changes. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created in `codex/plan-351-transition-loop-cue`. |
| 2026-06-18 | harness_builder | Added UI-local `transition` transport loop scope, Arrangement Transition Map Cue buttons, Transition Loop Quick Actions, transport readouts, docs, and harness expectations. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `git diff --check`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run build`, `npm run qa`, and `npm run verify`. |
| 2026-06-18 | quality_runner | Browser visual verification was attempted but blocked by sandbox dev-server binding restrictions, rejected escalated dev-server execution, and in-app Browser `file://` URL policy. |
| 2026-06-18 | review_judge | Review found no code changes required; residual risk is limited to deferred live browser screenshot verification and the existing Vite large chunk warning. |

## Completion Notes

Transition Loop cue is implemented as UI-local state: Arrangement Transition Map cards expose Cue actions, Quick Actions can cue current or direct handoffs, and Transport can loop the resulting two-block Turn without mutating project data, schema, save/load, render/export, or sampling scope. QA and review completed; live browser visual verification remains deferred because the environment blocked all available local browser routes.
