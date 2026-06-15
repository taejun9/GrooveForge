# plan-038-arrangement-energy-playback

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue making GrooveForge into a desktop beat-making app that can satisfy working producers while staying easy for first-time composers.

## Goal

Make arrangement block Energy audible in realtime arrangement playback, WAV export, and stem export so song sections feel like real dynamic arrangement decisions rather than visual-only metadata. The feature must keep GrooveForge composition-first and sample-free.

## Non-Goals

- No sampling, audio import, chopping, sampler tracks, plugin hosting, MIDI recording, or remote AI.
- No destructive rewrite of saved pattern events when block energy changes.
- No new arrangement section model or automation-lane editor in this plan.
- No change to selected-pattern preview semantics except preserving existing behavior.

## Context Map

- `src/domain/workstation.ts`: arrangement block data, normalization, project migration, product-level helpers.
- `src/audio/scheduler.ts`: realtime arrangement playback currently chooses block pattern but does not use block energy.
- `src/audio/render.ts`: offline WAV/stem render currently chooses block pattern but does not use block energy.
- `src/ui/App.tsx`: arrangement editor already exposes an Energy slider/input.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: durable product and QA framing.
- `harness/scripts/run_qa.py`: static harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-038-arrangement-energy-playback` and `.worktree/plan-038-arrangement-energy-playback` for git repository work.
- Keep block Energy as local deterministic project data, not generated audio or imported assets.

## Implementation Plan

- [x] Add a shared arrangement energy helper in the domain layer.
- [x] Thread block energy through realtime arrangement playback snapshots and scheduling.
- [x] Apply the same energy gain rule in offline WAV and stem export.
- [x] Keep selected-pattern preview at neutral energy so pattern editing remains predictable.
- [x] Update UI copy/docs/harness so Energy is documented as audible and deterministic.
- [x] Run QA before review, then complete the plan and create the review mirror.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test: change arrangement energy, confirm UI remains usable, no console errors, and playback still starts/stops.

## Review Plan

QA completes before review starts. Review checks that arrangement Energy affects realtime playback and offline export through the same deterministic gain rule, does not mutate pattern event data, preserves pattern preview behavior, and does not introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Implement Energy as deterministic playback/render gain, not event rewriting. | Producers need audible section dynamics; beginners need a simple slider. Keeping it as render-time interpretation preserves editable pattern data and undo semantics. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created after confirming arrangement Energy was persisted and editable but not yet used by realtime or offline audio paths. |
| 2026-06-15 | harness_builder | Added `arrangementEnergyGain` and `normalizeArrangementEnergy`, then used the shared gain rule in realtime scheduling and offline rendering. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and QA expectations to treat Energy as audible arrangement behavior. |
| 2026-06-15 | quality_runner | Ran typecheck, static QA, quality gate, verify, diff check, and browser smoke validation. |

## Completion Notes

Arrangement Energy now uses a shared deterministic gain helper. Realtime arrangement playback, WAV export, and stem export apply the same Energy gain while selected-pattern preview stays neutral. QA and review completed before merge.
