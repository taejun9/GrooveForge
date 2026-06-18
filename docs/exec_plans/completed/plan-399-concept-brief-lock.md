# Plan 399 - Concept Brief Lock

## Goal

Confirm the attached Korean concept correction and lock GrooveForge back to an all-genre direct beat-production mini DAW. Sampling remains a later optional module, not the MVP center, first-run workflow, default instrument panel, or core data model.

## Scope

- Audit the attached brief and current durable docs for sampling-first drift.
- Add concise rewrite rules for the exact risky examples from the brief: `AudioClipEvent` in `MusicalEvent`, `audio`/`sampler` in `TrackType`, `AudioClip` in core `Clip`, and `sampler` in the default Instrument Panel.
- Strengthen static QA expectations so future plans must preserve the beat-first concept lock.

## Non-Goals

- No sampling implementation, audio import, chopping, pitch/stretch, sampler UI, waveform UI, or audio-clip schema work.
- No runtime behavior changes, project schema changes, playback/render/export changes, or UI feature additions.
- No refactor of existing workstation code.

## Files

- `README.md`
- `docs/product/product.md`
- `docs/architecture/product-architecture.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Validation

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run verify`

## QA Notes

QA must confirm that the current durable docs accept the user's correction as binding: the product is for making beats across all genres through direct composition, sound design, arrangement, mixing/mastering, and export; sampling can appear only as optional extension scope.

Validation completed:

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run verify` passed, including runtime smoke for 11/11 sample-free Beat Blueprints and 11/11 supported style profiles.

## Review Notes

Review starts only after QA passes. Review should check that this work does not introduce new product scope or accidentally promote sampling to a co-equal product spine.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Treat the attached Korean correction as the binding concept lock. | The user clarified that sampling was over-centered in the previous draft and that GrooveForge is a direct beat-making mini DAW for all genres. |
| 2026-06-19 | Strengthen docs and static QA instead of changing runtime code. | The existing app already follows the direct-composition model; this task needed durable guardrails for incoming brief examples, not new features. |

## Completion Summary

Added explicit attached-brief rewrite rules to README, product docs, architecture docs, quality rules, and the static QA harness. The repository now accepts the Korean correction as binding while rejecting verbatim promotion of `AudioClipEvent`, `AudioClip`, `audio`, `sampler`, waveform editing, sample import/chop/stretch, one-shot mapping, and sampler tracks into the MVP.

## Status

- [x] Read `$base` skill and required references.
- [x] Inspect current repo concept docs and attached brief.
- [x] Apply concept-lock documentation and QA updates.
- [x] Run validation.
- [x] Complete review mirror and move this plan to completed.
