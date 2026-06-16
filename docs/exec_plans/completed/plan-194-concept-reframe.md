# Plan 194 - Concept Reframe Audit

## User Request

일단 컨셉이 비트(모든 장르)를 만드는거고, 샘플링은 부가 기능으로 쓸거야.
지금은 샘플링이 메인인것처럼 초안이 잡혀있는거 같은데 확인해서 수정해줘.

## Goal

Audit the current GrooveForge draft and durable repo guidance so the project reads as an all-genre, event-based beat-production mini DAW: direct drums, 808/bass, melody/chords, sound design, arrangement, mixing/mastering, and export first; sampling only as a later optional module.

## Scope

- Review first-read docs, architecture docs, product docs, quality rules, and harness expectations for sampling-first or sampling-coequal drift.
- Reframe any remaining language that makes sample import, chopping, sampler setup, audio clips, or sampling workflows look like the main product path.
- Preserve sampling as a future optional extension rather than deleting it from the product.
- Keep the app local-first and sample-free for the first proof: an 8-bar beat with drums, 808/bass, synth melody, arrangement, mixer/master, and WAV export.

## Out Of Scope

- No sampling implementation, audio import, chopping, waveform editing, sampler tracks, or plugin hosting.
- No runtime feature behavior changes unless audit finds user-facing copy that centers sampling.
- No remote AI, cloud sync, accounts, analytics, payments, or permission expansion.

## Files Expected To Change

- `README.md`
- `docs/product/product.md`
- `docs/architecture/product-architecture.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- completion record under `docs/exec_plans/completed/`
- review mirror under `docs/reviews/`

## Checklist

- [x] Search durable docs and app copy for sampling-centered wording.
- [x] Identify whether current first-read draft still frames sampling as primary or coequal.
- [x] Tighten product/architecture/quality wording where needed.
- [x] Update QA expectations so sampling-first draft drift fails validation.
- [x] Run documented validation.
- [x] Complete QA before review.
- [x] Move this plan to completed and create the review mirror.

## Validation Plan

- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run verify`

Browser smoke is not required for docs-only work unless runtime UI copy changes.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-17 | Keep sampling references only as optional extension/boundary language. | The user wants sampling available later, but not as the MVP, architecture spine, or first-run workflow. |
| 2026-06-17 | Treat audio clip, sampler, and waveform examples as optional sampling-phase examples. | The supplied concept brief includes useful later-sampling examples, but putting those examples in core MVP unions or architecture can make the project read like a sampling app. |

## Work Log

| Date | Agent | Notes |
|---|---|---|
| 2026-06-17 | project_lead | Started concept reframe audit in a dedicated plan/worktree. |
| 2026-06-17 | repo_cartographer | Confirmed current first-read docs already lead with all-genre direct beat creation; found the remaining drift risk in technical examples such as waveform UI and AudioClip/sampler schema examples. |
| 2026-06-17 | doc_gardener | Tightened README, product, architecture, quality, and QA expectations so optional sampling examples cannot be copied into the MVP data model or default architecture. |
| 2026-06-17 | quality_runner | QA passed: `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run verify`, and `npm run qa`. |
| 2026-06-17 | review_judge | Reviewed the diff for product framing, architecture/data-model boundaries, QA coverage, and no runtime feature drift; no findings. |
| 2026-06-17 | doc_gardener | Moved the plan to completed and created the completion review mirror. |

## Completion Notes

Completed. The current first-read docs were already centered on all-genre direct beat creation, not sampling, but this audit tightened the remaining technical-example risk: optional sampling examples such as waveform UI, audio clip schemas, sampler tracks, and `AudioClipEvent` must stay in optional sampling-phase sections and out of the MVP data model, default architecture, first-run flow, and default project tracks.
