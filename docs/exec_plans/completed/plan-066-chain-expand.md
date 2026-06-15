# plan-066-chain-expand

## Status

Completed

## Owner

Team Forge

## User Request

Continue completing GrooveForge as a desktop beat workstation that is satisfying for working composers and easy for first-time composers.

## Goal

Add a Chain Expand arrangement action that turns an 8-block Pattern Chain sketch into a longer song-form outline while preserving Pattern A/B/C musical event data. This should help beginners move beyond a loop and help working producers audition a larger verse/hook structure without manual block duplication.

## Scope

- Add a deterministic arrangement-domain helper that expands the current arrangement into a longer intro/verse/hook/bridge/hook/outro structure.
- Add a UI button near Pattern Chain controls.
- Route the action through existing undoable project update paths.
- Keep Pattern A/B/C events, mixer state, sound state, master state, save/load schema, and export paths unchanged.
- Update README, product docs, quality rules, static QA expectations, exec plan, and review mirror.

## Non-Goals

- No custom saved chain presets.
- No drag-and-drop timeline editor.
- No new project schema or persistence fields.
- No automatic background arrangement generation; every expansion is an explicit user click.
- No sampling, audio import, sampler tracks, plugin hosting, remote AI, analytics, accounts, cloud sync, or hidden assets.
- No changes to realtime playback, WAV export, stem export, MIDI export, or save/load semantics.

## Files

- `src/domain/workstation.ts`
- `src/ui/App.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/active/plan-066-chain-expand.md`
- `docs/reviews/plan-066-chain-expand-review.md`

## Implementation Steps

- [x] Inspect current Pattern Chain and arrangement update paths.
- [x] Add an arrangement-only helper for expanding a chain into a longer song form.
- [x] Add an undoable UI action near Pattern Chain controls.
- [x] Keep the action readable and stable across desktop/mobile layouts.
- [x] Update docs and static QA expectations.
- [x] Run automated QA, browser smoke, review, and completion flow.

## QA Plan

- [x] `python3 harness/scripts/run_qa.py` - passed.
- [x] `python3 harness/scripts/run_quality_gate.py` - passed.
- [x] `npm run typecheck` - passed.
- [x] `npm run build` - passed.
- [x] `npm run qa` - passed.
- [x] `npm run verify` - passed.
- [x] Browser smoke: applied `8 Bar Chain`, clicked Chain Expand, confirmed `16 blocks / 16 bars` with readout `A-A-A-C-B-B-C-A-A-A-A-C-B-B-C-A`, undo restored `A-A-A-C-B-B-C-A`, Play/Stop worked, console errors were empty, and body/row/button horizontal overflow checks were false.

## Review Plan

Review starts only after QA passes. Confirm the action is deterministic, explicit-click, undoable, arrangement-only, preserves Pattern A/B/C musical event data and mix/master state, and stays inside the beat-workstation product boundary.

## Decision Log

| date | decision | rationale |
|---|---|---|
| 2026-06-16 | Add Chain Expand after Pattern Chain step editing. | Users can now sketch and edit 8 steps; the next useful step is turning that sketch into a fuller song-form outline without manual duplication. |

## Implementation Notes

- Added `expandPatternChainArrangement` in the domain layer as a deterministic arrangement-block transform.
- Added an explicit `Expand` button in the Pattern Chain row.
- Routed expansion through existing undoable project update state.
- The expanded arrangement keeps current Pattern A/B/C assignments, uses 16 one-bar blocks, and sets section/energy/mute intent for intro, verse, hook, bridge, hook, and outro movement.
- Updated README, product docs, quality rules, and static QA expectations.

## Review Summary

No findings. Chain Expand is explicit-click, deterministic, undoable, arrangement-only, and preserves musical Pattern A/B/C data, mixer state, sound state, master state, save/load schema, and existing playback/export paths.
