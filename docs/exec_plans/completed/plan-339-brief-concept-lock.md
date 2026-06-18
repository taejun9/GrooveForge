# plan-339-brief-concept-lock

## Status

Completed

## Goal

Re-check the attached concept brief and tighten GrooveForge's durable framing so the product remains an all-genre, event-based beat-production mini DAW, while sampling stays a later optional module rather than the MVP, architecture spine, first-run path, or default data model.

## Scope

- Audit the attached brief for sampling-first drift, especially examples that place audio clips, audio tracks, or sampler devices beside MVP event, clip, track, or device unions.
- Strengthen README, product, architecture, and quality wording so the accepted rewrite is direct beat composition first: drums, 808/bass, melody/chords, sound design, arrangement, mixer/master, and export.
- Keep optional sampling visible only as a later extension that can add audio import, chopping, sampler mapping, pitch/stretch, and audio clips after the sample-free beat workstation is useful.
- Update static QA expectations so future drafts fail if optional sampling examples are copied into the core MVP or default Instrument Panel.

## Non-Goals

- No runtime UI changes.
- No project schema changes.
- No audio engine, playback, render, export, MIDI, Electron, or Vite changes.
- No sampling, imported audio, sample browser, chopping, audio clip, sampler track, sampler device, or waveform implementation.
- No remote AI, cloud sync, accounts, analytics, payments, plugin hosting, or legal/licensing claims.

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
- `npm run typecheck`
- `npm run harness:smoke`
- `npm run qa`
- `npm run build`
- `npm run verify`

## QA Log

- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run harness:smoke` passed: 10/10 sample-free Beat Blueprints and 10/10 supported style profiles.
- `npm run qa` passed.
- `npm run build` passed. Vite reported the existing large client chunk warning for `dist/assets/index-lWtMunvx.js` at 511.06 kB after minification.
- `npm run verify` passed, including quality gate, runtime smoke, typecheck, and build. Vite reported the same existing large client chunk warning.

## Review

Post-QA review found no blocking issues. The change is documentation and static QA only: it tightens the attached-brief intake rule, keeps the MVP centered on sample-free event creation, and prevents combined `audio`/`sampler`/`AudioClip` examples from entering core product, architecture, roadmap, or first-run planning. It does not change runtime UI, project schema, playback, render/export, MIDI, Electron, or Vite behavior.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Treat the attached brief as product-concept input and not as a schema implementation request. | The user asked to correct sampling-first framing, and the brief itself says sampling is optional and should not lead the product. |
| 2026-06-18 | Add incremental guardrails instead of overwriting the existing base. | The repository already has the base structure and prior concept corrections; this task should preserve those conventions and close remaining drift paths. |

## Progress

- [x] Read `$base` skill instructions and required references.
- [x] Read the attached brief and current sampling/concept guardrails.
- [x] Created `codex/plan-339-brief-concept-lock` worktree.
- [x] Tighten durable concept wording.
- [x] Update static QA expectations.
- [x] Run QA and quality checks.
- [x] Complete review, move plan to completed, and create review mirror.
