# plan-146-beat-first-framing

## Status

completed

## Owner

project_lead / repo_cartographer

## User Request

Check whether the current draft still makes sampling look like the main product, and revise it so GrooveForge is clearly a beat-making app for all genres with sampling only as an accessory feature.

## Goal

Tighten the first-read product framing so GrooveForge reads as a direct beat-production mini DAW before anything else: pattern programming, drum sequencing, 808/bass, melody/chords, sound design, arrangement, mixing/mastering, and export. Sampling must remain allowed only as an explicitly optional later sound-source extension.

## Non-Goals

- Do not implement sampling, audio import, chopping, sampler tracks, or audio warping.
- Do not add runtime UI, schema, playback, save/load, or export changes.
- Do not rewrite historical completed plans.
- Do not remove sampling from future scope entirely.

## Context Map

- Attached project brief: explicitly corrects the product from sampling-first to direct beat composition and sound design.
- `README.md`: public first-read concept and MVP target.
- `docs/product/product.md`: durable product definition, boundary, feature areas, roadmap, and non-goals.
- `docs/architecture/product-architecture.md`: event-first architecture and optional sampling placement.
- `docs/quality/rules.md`: future-work guardrails.
- `harness/scripts/run_qa.py`: local static expectations that enforce framing.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-146-beat-first-framing` and `.worktree/plan-146-beat-first-framing` for git repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Audit current durable docs and QA expectations for sampling-first drift or over-prominent sampling boundary wording.
- [x] Revise first-read summaries so they lead with direct beat creation and move sampling language into a clearly subordinate extension boundary.
- [x] Strengthen quality and harness checks so future drafts preserve positive beat-first framing, not just negative sampling prohibitions.
- [x] Run QA and review.
- [x] Move this plan to completed and add a review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `git diff --check`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that the result is docs/harness-only, direct-composition-first, all-genre, sample-free-MVP aligned, and that sampling remains optional rather than removed or promoted.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Keep this as docs/harness framing work. | The current runtime is already event-first; the user asked to correct concept/draft framing. |
| 2026-06-16 | Reduce sampling prominence in first summaries instead of only adding more warnings. | Repeating sampling guardrails at the top can still make the draft feel sampling-centered. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created after auditing the attached brief and current docs. |
| 2026-06-16 | repo_cartographer | Moved sampling language out of first-read summaries and into explicit extension-boundary wording. |
| 2026-06-16 | harness_builder | Updated static QA expectations for positive beat-workstation-first framing. |
| 2026-06-16 | quality_runner | `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run qa`, and `npm run verify` passed. |
| 2026-06-16 | review_judge | Reviewed docs/harness-only scope, beat-first first-read framing, optional sampling boundary, and QA coverage; no findings. |

## Completion Notes

Completed. README, product, architecture, quality, and harness expectations now lead with direct beat creation instead of opening on sampling guardrails. Sampling remains allowed only as a subordinate, opt-in extension boundary after the event-based beat workstation core is useful.
