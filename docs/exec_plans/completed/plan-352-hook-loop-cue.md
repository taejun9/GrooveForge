# plan-352-hook-loop-cue

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop beat workstation that satisfies working producers while staying approachable for beginners.

## Goal

Add a UI-local Hook Loop cue path from Hook Readiness so users can immediately audition the current hook section as an existing Block loop. Beginners should be able to hear the section the hook score is talking about, and producers should be able to repeat-check hook clarity without hunting through Section Locator or arrangement blocks.

## Non-Goals

- Do not mutate arrangement blocks, Pattern A/B/C musical events, mixer/master state, save/load data, export behavior, or project schema.
- Do not auto-play, auto-write hooks, auto-arrange, auto-mix, auto-master, or auto-export.
- Do not add sampling, imported audio, reference-track upload, audio analysis, remote AI, accounts, analytics, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Keep hook cue state UI-local and out of saved project schema.
- Route visible Cue buttons and Quick Actions Hook Loop commands only through existing arrangement selection and transport loop state.
- Preserve existing Hook Readiness focus behavior, Section Locator behavior, Song/Block/Turn/Pattern loop behavior, playback scheduling, exports, and project schema.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.

## Implementation Plan

- [x] Identify the current hook arrangement block from existing Hook Readiness/project data.
- [x] Add visible Cue controls to Hook Readiness cards that select the hook block and prepare Block loop without autoplay.
- [x] Add Quick Actions for current Hook Loop cue and direct Hook Readiness cue commands.
- [x] Update docs, quality rules, and harness expectations.
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

QA completes before review starts. Review should verify Hook Loop cue derives only from existing arrangement Hook blocks, keeps cue state UI-local, does not autoplay, and preserves Hook Readiness focus, arrangement data, render/export, save/load, and schema behavior.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Reuse Block loop for Hook Loop cue. | Hook audition should be an immediate listening affordance, and the existing bounded Block loop already has the right playback contract without adding schema or scheduler behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created in `codex/plan-352-hook-loop-cue`. |
| 2026-06-18 | harness_builder | Added Hook Loop cue target derivation, Hook Readiness Cue buttons, current/card Quick Actions, result metrics, follow-up cues, docs, quality rules, and harness expectations. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `git diff --check`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run build`, `npm run qa`, and `npm run verify`. |
| 2026-06-18 | quality_runner | Browser visual verification was attempted but blocked by sandbox dev-server binding restrictions and rejected escalated dev-server execution. |
| 2026-06-18 | review_judge | Review found no code changes required; residual risk is limited to deferred live browser screenshot verification and the existing Vite large chunk warning. |

## Completion Notes

Hook Loop cue is implemented as UI-local state: Hook Readiness cards expose Cue buttons, Quick Actions can cue the current or card-specific Hook Loop, and all cue paths select the first existing Hook block plus Block loop transport state without autoplay or mutation of arrangement blocks, Pattern A/B/C events, save/load, render/export, project schema, or sampling scope. QA and review completed; live browser visual verification remains deferred because the environment blocked local dev-server browser routes.
