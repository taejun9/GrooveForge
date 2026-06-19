# plan-404-afrobeats-style

## Status

Active

## Goal

Add Afrobeats as a first-class, sample-free GrooveForge style with editable Pattern A/B/C event data and a dedicated Beat Blueprint, expanding all-genre beat creation for beginners and working producers without moving the product toward sampling.

## Scope

- Add `afrobeats` as a `StyleId` with BPM range, default BPM, swing, bass/melody posture, and color.
- Add a dedicated Afrobeats Beat Blueprint with key, BPM, arrangement template, sound preset, master preset, and mixer posture.
- Add Pattern A/B/C blueprints for Afrobeats using editable drums, bass, synth melody, and chords.
- Map Afrobeats to an existing local sound preset.
- Update README, product docs, quality expectations, and runtime/static QA references so style coverage remains explicit.

## Non-Goals

- No imported loops, audio clips, sample packs, sampler devices, remote AI, cloud sync, accounts, analytics, plugin hosting, or hidden generation.
- No changes to render algorithms, MIDI export, project file version, save/load schema, arrangement templates, or existing style behavior outside the new style catalog entry.
- No genre-authenticity guarantees or claims about matching specific artists.

## Files

- `src/domain/workstation.ts`
- `README.md`
- `docs/product/product.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/active/plan-404-afrobeats-style.md`

## Validation

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## QA Log

- 2026-06-19: `npm run typecheck` passed.
- 2026-06-19: `git diff --check` passed.
- 2026-06-19: `python3 harness/scripts/run_qa.py` passed.
- 2026-06-19: `npm run harness:smoke` passed with 12/12 Beat Blueprints and 12/12 supported style profiles, including `afro_swing` and `afrobeats`.
- 2026-06-19: `python3 harness/scripts/run_quality_gate.py` passed.
- 2026-06-19: `npm run build` passed; production main chunk stayed under the warning threshold at 499.86 kB.
- 2026-06-19: `npm run qa` passed.
- 2026-06-19: `npm run verify` passed.

## Review

Post-QA review complete. No blocking issues found. Residual risk: Afrobeats musical feel is validated structurally through editable event data and render smoke, not by human listening review in this run.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Add Afrobeats as sample-free style data, not a loop/sample feature. | It broadens the all-genre beat workstation while preserving the direct-composition product invariant. |

## Progress

- [x] Created `codex/plan-404-afrobeats-style` worktree.
- [x] Add Afrobeats style, patterns, sound mapping, and blueprint.
- [x] Update docs/static QA.
- [x] Run QA/build/verify and review.
- [x] Move plan to completed and create review mirror.
