# plan-332-brief-sampling-correction

## Status

Completed

## Goal

Correct the product brief framing so GrooveForge is clearly an all-genre beat-production mini DAW for direct composition, sound design, arrangement, mixing/mastering, and export, while sampling remains a later optional extension.

## Scope

- Audit current product, architecture, README, quality, and harness language for sampling-first drift.
- Add durable correction wording for drafts that place `AudioClipEvent` in the core `MusicalEvent` union or list `sampler` in the default Instrument Panel.
- Keep the MVP centered on editable notes, drum hits, automation, Pattern A/B/C, built-in drum rack, synth 808/bass, synth/chord instruments, FX, mixer/master, and export.
- Update static QA expectations so future changes preserve this framing.

## Non-Goals

- No app UI changes.
- No project schema changes.
- No audio engine, playback, export, MIDI, or Electron changes.
- No sampling, imported audio, sampler tracks, sample browser, chopping, pitch/stretch, or audio-clip implementation.
- No remote AI, accounts, analytics, payments, plugin hosting, or cloud sync.

## Files

- `README.md`
- `docs/product/product.md`
- `docs/architecture/product-architecture.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Validation

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `git diff --check`

## QA Log

- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `git diff --check` passed.
- `npm run typecheck` passed.
- `npm run harness:smoke` passed: 10/10 sample-free Beat Blueprints and 10/10 supported style profiles.
- `npm run qa` passed.
- `npm run build` passed. Vite reported the existing large client chunk warning for `dist/assets/index-Dc4wLlCS.js` at 505.10 kB after minification.
- `npm run verify` passed, including quality gate, runtime smoke, typecheck, and build.

## Review

Post-QA review found no code, schema, playback, export, or UI behavior changes. The change is limited to durable product/architecture/quality framing and static QA expectations that keep sampling optional and direct all-genre beat creation primary. No findings.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Treat this as a documentation and static-QA correction, not feature work. | The user asked to correct product concept drift from sampling-first to direct all-genre beat creation. |
| 2026-06-18 | Keep optional sampling visible only as an extension boundary. | Sampling is useful later, but it must not drive the MVP, default data model, first-run UI, or architecture. |

## Progress

- [x] Inspected current branch, active plans, and sampling-related documentation.
- [x] Created `codex/plan-332-brief-sampling-correction` worktree.
- [x] Add brief correction language and QA expectations.
- [x] Run QA and quality checks.
- [x] Complete review, move plan to completed, and create review mirror.
