# plan-002-product-direction

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Clarify that GrooveForge is for making beats across all genres, and that sampling is only an add-on feature.

## Goal

Audit and revise the base docs so the product center is all-genre beat composition, sound design, arrangement, mixing, mastering, and export. Sampling must read as a secondary extension, not the main product.

## Non-Goals

- Implement app runtime features.
- Install dependencies.
- Remove all references to sampling; the feature remains allowed as a future add-on.

## Context Map

- `README.md`: public project framing and MVP target.
- `AGENTS.md`: agent-facing invariants.
- `docs/product/product.md`: durable product definition and roadmap.
- `docs/architecture/product-architecture.md`: architecture boundaries and core/extension split.
- `docs/quality/rules.md`: QA wording that avoids sampling-first ambiguity.
- `docs/privacy/principles.md`: safe handling of imported audio and optional sampling.
- `harness/scripts/run_qa.py`: text expectations for the revised direction.

## Constraints

- QA and review are separate loops.
- Do not create or use `docs/plan`.
- Keep sampling as an optional future module.
- Future implementation should still use plan/worktree flow.

## Implementation Plan

- [x] Search for sample/sampling language across docs.
- [x] Move sampling language out of core architecture wording.
- [x] Add explicit all-genre beat workstation language.
- [x] Update QA expectations.
- [x] Run base QA and strict quality gate.
- [x] Complete this plan and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`: passed.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `rg` for sample/sampling terms: reviewed remaining mentions and kept them only for optional extension, privacy/safety, or historical plan context.

## Review Plan

QA completed before review. Review mirror is recorded in `docs/reviews/plan-002-product-direction-review.md`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Keep sampling but demote it to an extension boundary. | User clarified that the concept is making beats across all genres, with sampling only as an add-on. |
| 2026-06-15 | Remove sampler from the core audio-engine layer map. | The architecture should not make sampling look like a core MVP subsystem. |
| 2026-06-15 | Keep audio/sampler track types under extension track types. | Sampling remains allowed later, but not as part of the beat-making core. |
| 2026-06-15 | Add all-genre style-profile language to README, AGENTS, product, and architecture docs. | Genre support should be expressed as editable data and rules, not a single app identity. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Opened plan and audited current sampling-related wording. |
| 2026-06-15 | repo_cartographer | Reframed README, product, architecture, quality, privacy, and QA expectations around all-genre beat creation. |
| 2026-06-15 | quality_runner | QA and quality gate passed. |
| 2026-06-15 | review_judge | Review mirror created with no blocking findings. |

## Completion Notes

GrooveForge now reads as an all-genre beat workstation first. Sampling remains documented only as a secondary extension, privacy/licensing concern, or historical plan context.
