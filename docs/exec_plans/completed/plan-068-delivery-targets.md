# plan-068-delivery-targets

## Status

Completed

## Owner

Team Forge

## User Request

Continue completing GrooveForge as a desktop beat workstation that can satisfy working composers while remaining easy for first-time composers.

## Goal

Add saved Delivery Targets so users can choose the intended outcome of a beat, such as a starter sketch, vocal session, beat-store demo, or club demo. The target should guide Beat Map expectations and producer-facing export/mix decisions without making platform-compliance or mastering guarantees.

## Scope

- Add a local `deliveryTarget` project field with migration for older project files.
- Add deterministic Delivery Target preset metadata for starter sketch, vocal session, beat-store demo, and club demo.
- Add a compact Delivery Target UI near the top workflow surface.
- Let applying a target optionally align master preset, master ceiling, arrangement template, and mix posture through existing undoable update paths.
- Make Beat Map use the selected target for arrangement and delivery expectations.
- Update README, product docs, quality rules, harness expectations, exec plan, and review mirror.

## Non-Goals

- No commercial release approval, platform loudness compliance, LUFS/true-peak claims, or professional mastering guarantees.
- No remote AI, remote analysis, cloud sync, accounts, analytics, payments, sampling, imported audio, sampler tracks, plugin hosting, hidden automation, or hidden assets.
- No destructive changes to existing beats when the user only selects or views a target.
- No new file format version unless required; older files should migrate safely to the default target.

## Files

- `src/domain/workstation.ts`
- `src/ui/App.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/active/plan-068-delivery-targets.md`
- `docs/reviews/plan-068-delivery-targets-review.md`

## Implementation Steps

- [x] Inspect current project state, save/load migration, Beat Map, master, and arrangement template paths.
- [x] Add Delivery Target types, presets, default/migration, labels, and an apply helper.
- [x] Add Delivery Target UI with explicit apply actions through undoable project update paths.
- [x] Integrate selected target into Beat Map arrangement/delivery expectations and session readout.
- [x] Update docs and static QA expectations.
- [x] Run automated QA, browser smoke, review, and completion flow.

## QA Plan

- [x] `python3 harness/scripts/run_qa.py` - passed.
- [x] `python3 harness/scripts/run_quality_gate.py` - passed.
- [x] `npm run typecheck` - passed.
- [x] `npm run build` - passed.
- [x] `npm run qa` - passed.
- [x] `npm run verify` - passed.
- [x] Browser smoke: Delivery Targets rendered at `http://127.0.0.1:5177/`, default target was `Vocal Session`, Beat Store alignment updated target/master/Beat Map, undo restored Vocal Session, console errors were empty, and horizontal overflow was false.

## Review Plan

Review starts only after QA passes. Confirm Delivery Target state migrates safely, mutating target actions are explicit and undoable, Beat Map uses target expectations deterministically, save/load semantics are preserved, and no platform compliance, remote service, sampling, or hidden automation was added.

## Decision Log

| date | decision | rationale |
|---|---|---|
| 2026-06-16 | Add Delivery Targets after Beat Map. | Beat Map made status visible; target-aware expectations make that status useful for both beginners and working producers with different output goals. |

## Implementation Notes

- Added `deliveryTarget` to project core state with safe default migration to `Vocal Session`.
- Added Delivery Target presets for `Starter Sketch`, `Vocal Session`, `Beat Store`, and `Club Demo`.
- Added `Set` and `Align` flows: Set changes only the stored target, while Align explicitly updates arrangement template, master preset, master ceiling, and mix posture through undoable project history.
- Updated Beat Map to derive arrangement and stem expectations from the selected Delivery Target.
- Updated docs and static QA expectations.

## Review Summary

No findings. Delivery Target state is local and migrated, alignment is explicit and undoable, and no platform compliance, sampling, remote service, hidden automation, or professional mastering claims were added.
