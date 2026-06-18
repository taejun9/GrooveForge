# plan-348-sampling-secondary-audit

## Status

active

## Owner

project_lead / plan_keeper

## User Request

일단 컨셉이 비트(모든 장르)를 만드는거고, 샘플링은 부가 기능으로 쓸거야. 지금은 샘플링이 메인인것처럼 초안이 잡혀있는거 같은데 확인해서 수정해줘.

## Goal

Audit and tighten the project base so GrooveForge remains defined as an all-genre beat-production mini DAW centered on direct composition, sound design, arrangement, mixing/mastering, and export, with sampling only as a later optional extension.

## Non-Goals

- Do not add sampling, sampler, audio import, chopping, waveform, or audio-track product features.
- Do not change app runtime behavior, project schema, playback, rendering, export, or UI controls.
- Do not reframe built-in drum one-shots or future sample 808 support as the product workflow.
- Do not introduce remote AI, accounts, analytics, cloud sync, payments, or external audio dependencies.

## Context Map

- `README.md`
- `docs/product/product.md`
- `docs/architecture/product-architecture.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- User-supplied concept correction brief in the Codex attachment.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Root Markdown remains limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current docs and harness for sampling-first drift.
- [x] Add an explicit intake rule for Korean concept briefs and combined event/track examples from external drafts.
- [x] Strengthen product and architecture docs so `AudioClipEvent`, `audio`, and `sampler` remain optional-extension examples, not core MVP schema.
- [x] Strengthen quality gates so future brief-correction work rejects sample-first first-run, roadmap, or Instrument Panel language.
- [x] Run QA and review after the documentation/harness updates.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`

## Review Plan

QA completes before review starts. Review should verify that the updated docs and harness match the user's corrected concept and do not accidentally promote sampling into the MVP or first-run workflow.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Treat the request as a product-base correction, not a runtime feature. | The user asked to check and correct concept drift in drafts. |
| 2026-06-18 | Keep sampling language only in optional-extension boundaries while emphasizing direct event composition. | GrooveForge must be a beat-making mini DAW across genres, not a sampling-first app. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created in `codex/plan-348-sampling-secondary-audit`. |
| 2026-06-18 | repo_cartographer | Confirmed current docs already frame GrooveForge as a direct beat-production mini DAW and added stronger intake rules for Korean concept briefs and combined sampling examples. |
| 2026-06-18 | harness_builder | Added QA expectations for Korean brief constraints, external-draft splitting, and optional sampling placement. |
| 2026-06-18 | quality_runner | QA passed: `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. |
| 2026-06-18 | review_judge | Review found no blocking issues; changes are documentation/harness-only and keep sampling as optional extension scope. |

## Completion Notes

Completed the sampling-secondary concept audit. Updated README, product docs, architecture docs, quality rules, and QA expectations so Korean concept briefs that define GrooveForge as all-genre beat-making with sampling as an accessory cannot promote sample import, chopping, sampler, audio clip, or loop-stretching examples into the MVP path.
