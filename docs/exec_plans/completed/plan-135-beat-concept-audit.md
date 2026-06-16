# plan-135-beat-concept-audit

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Check whether the current project draft still makes sampling look like the main product, and revise it so GrooveForge is clearly a beat-making mini DAW for all genres with sampling only as an accessory feature.

## Goal

Audit the durable project framing and strengthen the wording and QA expectations so GrooveForge is unambiguously centered on direct beat composition, sound design, arrangement, mixing/mastering, and export. Sampling must remain optional, later, and structurally subordinate.

## Non-Goals

- Do not add app UI or audio-engine behavior.
- Do not start optional sampling implementation.
- Do not change project schema, playback, save/load, export, or runtime behavior.
- Do not rewrite completed historical plans.

## Context Map

- `README.md`: public concept and MVP target.
- `docs/product/product.md`: durable product definition, boundary, MVP, roadmap, and non-goals.
- `docs/architecture/product-architecture.md`: event-first architecture and optional sampling placement.
- `docs/quality/rules.md`: durable guardrails for future work.
- `harness/scripts/run_qa.py`: local QA expectations for concept framing.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-135-beat-concept-audit` and `.worktree/plan-135-beat-concept-audit` for git repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Audit current root, product, architecture, quality, and harness wording for sampling-first drift.
- [x] Strengthen durable docs where the user brief should be more explicit.
- [x] Update QA expectations so future drafts preserve the corrected concept.
- [x] Run QA and review.
- [x] Move this plan to completed and add a review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `git diff --check`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that the changes are documentation/harness only, reinforce direct beat composition as the product spine, keep sampling optional, and avoid introducing runtime or schema changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Treat this as a documentation and QA guardrail audit, not feature work. | The user's concern is concept framing, and the current app already has no sampling runtime change in scope. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for beat-first concept audit. |
| 2026-06-16 | repo_cartographer | Audited README, product, architecture, quality, and QA expectations; current core docs already placed sampling outside the MVP. |
| 2026-06-16 | doc_gardener | Added explicit concept audit, accessory, leaf-module, and brief-alignment guardrails. |
| 2026-06-16 | quality_runner | `python3 harness/scripts/run_qa.py`, `npm run qa`, `git diff --check`, and `npm run verify` passed. |
| 2026-06-16 | review_judge | Reviewed scope as docs/harness-only and found no blocking issues. |

## Completion Notes

Completed. Durable docs now state that GrooveForge is an all-genre beat-production mini DAW for direct composition, sound design, arrangement, mixing/mastering, and export. Sampling remains an accessory module and optional later phase, not the app category, first proof of value, or main creative loop. QA expectations now check these guardrails.
