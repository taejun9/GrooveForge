# plan-422-composition-first-docs

## Status

Completed

## Owner

project_lead / repo_cartographer / harness_builder

## User Request

Confirm and correct drafts so GrooveForge is framed as an all-genre beat-making mini DAW for direct composition, sound design, mixing/mastering, and export, with sampling only as an optional later module.

## Goal

Audit the product, architecture, quality, and harness-facing docs for sampling-first drift. Tighten the project definition around direct beat composition, editable musical events, built-in instruments, style profiles, arrangement, mixer/master, and sample-free export.

## Non-Goals

- No application behavior, project schema, playback, render/export, save/load, UI feature, or runtime data changes.
- No new sampler, sample import, chopping, stretching, audio clip, waveform, audio recording, remote AI, accounts, analytics, payments, plugin hosting, or cloud sync work.
- No broad rewrite of completed plan history.

## Context Map

- Product entry point: `README.md`
- Product principles: `docs/product/product.md`
- Product architecture: `docs/architecture/product-architecture.md`
- Quality rules: `docs/quality/rules.md`
- Source registry: `docs/references/official-sources.md`
- Static validation harness: `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-422-composition-first-docs` and `.worktree/plan-422-composition-first-docs` for git repository work.
- Preserve the project invariant: sampling is secondary and must not become the MVP, architecture, first-run, or roadmap center.

## Implementation Plan

- [x] Audit current docs and static expectations for sampling-first language.
- [x] Update durable docs so direct event-based beat composition is the product center and sampling is an optional later module.
- [x] Update static harness expectations to catch future sampling-first drift.
- [x] Run QA and review.
- [x] Move plan to completed and create review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that docs and static QA guardrails consistently center all-genre direct beat composition and do not introduce product claims or implementation work outside the requested scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Treat this as a docs and harness alignment pass, not an app feature slice. | The user asked to correct project framing after a sampling-heavy draft, and the repo already contains the beat-workstation implementation direction. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | repo_cartographer | Audited README, product, architecture, quality, official-source registry, and static QA expectations against the corrected composition-first Korean brief. |
| 2026-06-19 | harness_builder | Added current audit outcome guardrails, expanded genre-framing language to match supported style coverage, registered official DAW benchmark sources, and updated static QA expectations. |
| 2026-06-19 | quality_runner | QA passed: `python3 harness/scripts/run_qa.py`, `git diff --check`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run qa`, and `npm run verify`. Runtime smoke passed for 14/14 sample-free Beat Blueprints and 14/14 supported style profiles. |
| 2026-06-19 | review_judge | Reviewed docs and static QA expectations for composition-first framing, optional sampling boundaries, official-source registry updates, and absence of app/runtime/schema changes; no findings. |

## Completion Notes

The sampling-heavy draft has been recentered around GrooveForge as an all-genre direct beat-production mini DAW. Durable docs now record the current audit outcome: the accepted MVP path is BPM/key/style, drums, 808/bass, melody/chords, sound design, arrangement, mixer/master, and export; sample import, chop/slice, loop stretch, sample 808, `AudioClipEvent`, `AudioClip`, `audio`, `sampler`, waveform editing, and sampler devices are optional extension material unless a future user-approved sampling-phase plan exists.

The change touched only documentation and static QA expectations. It did not change application behavior, project schema, playback, render/export, save/load, UI runtime behavior, sampling/import support, remote AI, accounts, analytics, payments, plugin hosting, or cloud sync.
