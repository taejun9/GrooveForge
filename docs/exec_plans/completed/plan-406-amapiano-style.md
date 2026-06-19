# plan-406-amapiano-style

## Status

Completed

## Goal

Add Amapiano as a first-class, sample-free GrooveForge style with editable Pattern A/B/C event data and a dedicated Beat Blueprint, expanding all-genre beat creation for beginners and working producers without moving the product toward loops or sampling.

## Scope

- Add `amapiano` as a `StyleId` with BPM range, default BPM, swing, bass/melody posture, and color.
- Add a dedicated Amapiano Beat Blueprint with key, BPM, arrangement template, sound preset, master preset, and mixer posture.
- Add Pattern A/B/C blueprints for Amapiano using editable drums, bass, synth melody, and chords.
- Map Amapiano to existing local sound preset behavior and Composer Action targets.
- Update README, product docs, and static QA references so style coverage remains explicit.

## Non-Goals

- No imported loops, log drum samples, audio clips, sample packs, sampler devices, remote AI, cloud sync, accounts, analytics, plugin hosting, or hidden generation.
- No changes to render algorithms, MIDI export, project file version, save/load schema, arrangement templates, or existing style behavior outside the style catalog and style-target mapping.
- No genre-authenticity guarantees or claims about matching specific artists.

## Files

- `src/domain/workstation.ts`
- `src/ui/workstationUiModel.ts`
- `README.md`
- `docs/product/product.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/completed/plan-406-amapiano-style.md`

## Validation

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run harness:smoke`
- `npm run build`
- `npm run qa`
- `npm run verify`

## QA Log

- 2026-06-19: `git diff --check` passed.
- 2026-06-19: `python3 harness/scripts/run_qa.py` passed.
- 2026-06-19: `python3 harness/scripts/run_quality_gate.py` passed.
- 2026-06-19: `npm run typecheck` passed.
- 2026-06-19: `npm run harness:smoke` passed with 14/14 Beat Blueprints and 14/14 supported style profiles, including `amapiano` and `amapiano_log_bass`; Amapiano reported `Ready`.
- 2026-06-19: `npm run build` passed; main `index` chunk reported 498.46 kB.
- 2026-06-19: `npm run qa` passed.
- 2026-06-19: `npm run verify` passed.

## Review

Post-QA review completed. No findings.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Add Amapiano as sample-free style data. | It broadens the all-genre workstation through editable musical events and Beat Blueprints while keeping sampling optional and out of the MVP spine. |

## Progress

- [x] Created `codex/plan-406-amapiano-style` worktree.
- [x] Add Amapiano style, patterns, sound mapping, and blueprint.
- [x] Update docs/static QA.
- [x] Run QA/build/verify and review.
- [x] Move plan to completed and create review mirror.
