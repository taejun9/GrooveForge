# plan-393-sampling-brief-alignment

## Status

Completed

## Goal

Re-audit the current GrooveForge base against the user's Korean concept correction and tighten any remaining product, architecture, README, and QA wording so GrooveForge is unambiguously an all-genre direct beat-production mini DAW, with sampling only as an optional extension.

## Scope

- Read the attached Korean brief as binding product input: the main flow is BPM/key/style, drums, 808/bass, melody/chords, sound design, arrangement, mixer/master, and export.
- Audit durable docs and runtime-facing strings for language that could make sample import, chopping, sampler setup, audio clips, or loop stretching look like the product spine.
- Update only stale or weak wording and static QA expectations needed to prevent sampling-first drift in future plans.
- Keep first-run, MVP, architecture, roadmap, and default device language centered on editable musical events and sample-free beat creation.

## Non-Goals

- No runtime feature implementation unless the audit finds an actual user-facing sampling-first label that must be corrected.
- No project schema changes.
- No audio engine, playback, render/export, MIDI, Electron, or Vite changes.
- No sample import, sample browser, chopping/slicing, audio clips, sampler tracks, waveform editing, pitch/stretch, or sampler-device implementation.
- No remote AI, cloud sync, accounts, analytics, payments, plugin hosting, or legal/licensing claims.

## Files

- `README.md`
- `docs/product/product.md`
- `docs/architecture/product-architecture.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- Runtime UI copy files only if the audit finds sampling-first wording.

## Validation

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run harness:smoke`
- `npm run qa`
- `npm run build`
- `npm run verify`

## QA Log

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run harness:smoke` passed: 10/10 sample-free Beat Blueprints and 10/10 supported style profiles.
- `npm run qa` passed.
- `npm run build` passed. Vite reported the existing large client chunk warning for `dist/assets/index-DPt7Ugi_.js` at 502.86 kB after minification.
- `npm run verify` passed, including quality gate, runtime smoke, typecheck, and build. Vite reported the same existing large client chunk warning.

## Review

Post-QA review found no blocking issues. The change is limited to durable concept framing and static QA expectations. It confirms the current brief's accepted product spine as direct all-genre beat composition, sound design, arrangement, mix/master, and export, while rejecting sample-import/chop/sampler flows as the product spine. No runtime UI, schema, playback, render/export, MIDI, Electron, Vite, or sampling implementation changed.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Treat the user's Korean correction as a base/guardrail alignment task, not a sampling feature request. | The request explicitly says GrooveForge is for making beats across all genres and sampling is an add-on. |
| 2026-06-19 | Preserve existing base structure and prior concept-lock work. | The repository already has the Team Forge base, planning flow, and several sampling-secondary guardrails, so this plan should only close remaining gaps. |

## Progress

- [x] Read `$base` skill instructions and required references.
- [x] Read the attached Korean concept correction.
- [x] Created `codex/plan-393-sampling-brief-alignment` worktree.
- [x] Audit current docs and runtime-facing copy for sampling-first drift.
- [x] Tighten docs and QA expectations where needed.
- [x] Run QA and quality checks.
- [x] Complete review, move plan to completed, and create review mirror.
