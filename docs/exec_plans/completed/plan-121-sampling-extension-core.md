# plan-121-sampling-extension-core

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

일단 컨셉이 비트(모든 장르)를 만드는거고, 샘플링은 부가 기능으로 쓸거야.
지금은 샘플링이 메인인것처럼 초안이 잡혀있는거 같은데 확인해서 수정해줘.

## Goal

Audit the attached draft and current durable docs, then tighten the remaining architecture/data-model wording so GrooveForge cannot be read as a sampler-first or audio-clip-first product. The core MVP must stay centered on editable musical events, built-in instruments, arrangement, mixing/mastering, and export; `AudioClipEvent`, `audio`, and `sampler` concepts belong only to a later optional sampling extension.

## Non-Goals

- Do not implement sampling, audio import, sampler tracks, chopping, audio warping, plugin hosting, or new UI.
- Do not remove sampling from the future roadmap; keep it as a clearly optional module.
- Do not change runtime app behavior.
- Do not touch unrelated plan-085 or plan-120 worktrees.

## Context Map

- Attached draft: contains useful beat-first framing, but also examples where `AudioClipEvent`, `audio`, and `sampler` appear beside core event/track/clip types.
- `README.md`: public product definition and MVP target.
- `docs/product/product.md`: durable product definition, first-class data, MVP, roadmap, and priority guardrail.
- `docs/architecture/product-architecture.md`: event-first architecture and optional sampling extension boundary.
- `docs/quality/rules.md`: QA rules for sampling placement and data model boundaries.
- `harness/scripts/run_qa.py`: static expectations that prevent sampler-first drift.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Root Markdown files remain limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Read the attached draft and identify sampling-centered ambiguity.
- [x] Tighten durable docs so core `MusicalEvent`, MVP track types, and MVP clips exclude audio/sampler types.
- [x] Add QA expectations that catch `AudioClipEvent` or `audio/sampler` being promoted into the core MVP model.
- [x] Run QA and verification.
- [x] Review, complete the plan, and create the review mirror.

## QA Plan

- `npm run qa`
- `npm run verify`
- Targeted `rg` audit for `AudioClipEvent`, `audio`, `sampler`, and sampling placement language across current durable docs and harness expectations.

## Review Plan

QA completes before review starts. Review checks that future sampling remains allowed but structurally subordinate, and that the core MVP data model remains event-first without audio clip or sampler dependencies.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Keep optional sampling as extension data only. | The user wants sampling as a useful add-on, but the product identity and MVP proof are direct beat creation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-121 branch/worktree from `main` and audited the attached draft. |
| 2026-06-16 | doc_gardener | Tightened product, architecture, and quality docs so `AudioClipEvent`, `audio`, and `sampler` stay outside the MVP core unions and default tracks. |
| 2026-06-16 | harness_builder | Added QA expectations for the stricter core-data-model boundary. |
| 2026-06-16 | quality_runner | Targeted `rg` audit and `git diff --check` passed. |
| 2026-06-16 | quality_runner | `npm run qa` passed. |
| 2026-06-16 | quality_runner | `npm run verify` passed. |
| 2026-06-16 | review_judge | Reviewed the docs and QA expectations for beat-first framing and optional-sampling extension boundaries. |

## Completion Notes

Completed. The attached draft's useful beat-first direction is preserved, while the risky data-model examples are now explicitly guarded: the core MVP `MusicalEvent` union stays `NoteEvent`, `DrumHitEvent`, and `AutomationEvent`; `AudioClipEvent`, `audio`, and `sampler` are reserved for an explicitly approved optional-sampling phase; and QA now checks those boundaries.
