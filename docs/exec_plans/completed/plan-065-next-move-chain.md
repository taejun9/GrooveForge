# plan-065-next-move-chain

## Status

Completed

## Owner

Team Forge

## User Request

Continue completing GrooveForge as a desktop beat workstation that is satisfying for working composers and easy for first-time composers.

## Goal

Connect Pattern Chain to Next Move so users who have enough Pattern A/B/C material but weak arrangement structure get a clear, explicit action to sketch an 8-bar chain. This should reduce beginner uncertainty and give working producers faster access to A/B/C arrangement auditioning.

## Scope

- Add a `patternChain` Next Move command type.
- Route the command through existing `applyPatternChain` logic.
- Prefer a Pattern Chain recommendation when readiness shows the arrangement needs structure but the beat has enough musical material to arrange.
- Keep Full Beat template available as a secondary action.
- Update README, product docs, quality rules, static QA expectations, exec plan, and review mirror.

## Non-Goals

- No new Pattern Chain presets or custom saved chains.
- No changes to Pattern Chain step editor behavior.
- No automatic background arrangement generation; every action remains an explicit user click.
- No sampling, audio import, sampler tracks, plugin hosting, remote AI, analytics, accounts, cloud sync, or project schema changes.
- No changes to playback, WAV export, stem export, MIDI export, or save/load semantics.

## Files

- `src/ui/App.tsx`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/active/plan-065-next-move-chain.md`
- `docs/reviews/plan-065-next-move-chain-review.md`

## Implementation Steps

- [x] Inspect current Next Move recommendation and execution paths.
- [x] Add a Pattern Chain Next Move command and action helper.
- [x] Make arrangement-weak readiness prefer Pattern Chain when drums, bass, and harmony are not missing.
- [x] Keep Full Beat as a secondary action for users who want a longer template.
- [x] Update docs and static QA expectations.
- [x] Run automated QA, browser smoke, review, and completion flow.

## QA Plan

- [x] `python3 harness/scripts/run_qa.py` - passed.
- [x] `python3 harness/scripts/run_quality_gate.py` - passed.
- [x] `npm run typecheck` - passed.
- [x] `npm run build` - passed.
- [x] `npm run qa` - passed.
- [x] `npm run verify` - passed.
- [x] Browser smoke: forced a weak one-block arrangement, verified Next Move recommended `Sketch an 8-bar Pattern Chain`, verified `Full Beat` remained available, clicked Pattern Chain, confirmed the readout changed to `A-A-A-C-B-B-C-A`, undo restored `A`, body and Next Move overflow were false, and console errors were empty.

## Review Plan

Review starts only after QA passes. Confirm that Next Move remains deterministic, local, explicit-click, undoable for project edits, arrangement-only for Pattern Chain actions, and separate from Beat Readiness mutation.

## Decision Log

| date | decision | rationale |
|---|---|---|
| 2026-06-16 | Add Pattern Chain to Next Move instead of adding another standalone arrangement button. | The app already has Pattern Chain controls; the missing piece is guiding users toward them at the moment arrangement structure is weak. |

## Implementation Notes

- Added a `patternChain` Next Move command and routed it through existing `applyPatternChain`.
- Added `patternChainNextMoveAction` and `fullArrangementNextMoveAction` helpers.
- When readiness reports weak arrangement structure after core musical material is present, Next Move now recommends `Sketch an 8-bar Pattern Chain`.
- Full Beat remains a secondary explicit action in the same weak-arrangement state.
- Updated README, product docs, quality rules, and static QA expectations.

## Review Summary

No findings. The change is deterministic, local-only, explicit-click, undoable through existing project history, and arrangement-only for Pattern Chain. Beat Readiness remains read-only, and no sampling, remote AI, project schema, playback, save/load, or export semantics changed.
