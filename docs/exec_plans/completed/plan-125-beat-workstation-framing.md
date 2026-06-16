# plan-125-beat-workstation-framing

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

일단 컨셉이 비트(모든 장르)를 만드는거고, 샘플링은 부가 기능으로 쓸거야.
지금은 샘플링이 메인인것처럼 초안이 잡혀있는거 같은데 확인해서 수정해줘.

## Goal

Tighten the public and durable product framing so GrooveForge reads first as an all-genre, direct beat-production mini DAW. Sampling should remain a later optional sound-source module, but the draft should not make sampling feel central by repeating sampler-first disclaimers or placing sampling beside the core workflow.

## Non-Goals

- Do not implement sampling, audio import, sampler tracks, chopping, audio warping, plugin hosting, or new UI.
- Do not remove sampling from the future roadmap; keep it as a clearly optional extension.
- Do not change runtime app behavior.
- Do not modify historical completed plan or review records except for this plan's own completion artifacts.

## Context Map

- Attached draft: beat-first mini DAW, sampling as optional module.
- `README.md`: public project entry point and first product impression.
- `docs/product/product.md`: durable product definition, product boundary, core loop, and roadmap.
- `docs/architecture/product-architecture.md`: event-first architecture and optional sampling boundary.
- `docs/quality/rules.md`: QA rules that prevent sampler-first drift.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-125-beat-workstation-framing` and `.worktree/plan-125-beat-workstation-framing`.
- Root Markdown files remain limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Audit current durable docs for sampling-centered first impression.
- [x] Reframe README and product docs around direct all-genre beat creation in positive terms.
- [x] Keep optional sampling as a short extension rule instead of repeated public-page disclaimers.
- [x] Preserve architecture and QA guardrails for event-first data and optional sampling boundaries.
- [x] Run QA and static wording checks.
- [x] Complete review docs and prepare the branch for merge, push, and worktree cleanup.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Targeted wording audit across README, product, architecture, quality, and harness files for:
  - core flow starts with BPM/key/style and direct composition.
  - sampling remains optional and later.
  - sampling is not presented as a parallel core product spine.

## Review Plan

QA completes before review starts. Review checks that the docs now read as a beat workstation first, preserve optional sampling as future extension scope, and avoid runtime behavior changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Reduce public sampling disclaimers instead of only adding more guardrails. | Too many sampling mentions can make the draft feel sampling-centered even when the wording says it is not. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-125 branch and worktree from latest `main`. |
| 2026-06-16 | repo_cartographer | Audited README, product, architecture, quality, and harness expectations for sampling-heavy public framing. |
| 2026-06-16 | doc_gardener | Reframed README and product docs around all-genre direct beat composition, built-in instruments, editable musical events, and export before optional sampling. |
| 2026-06-16 | harness_builder | Updated static QA expectations to check positive beat-workstation framing and the shortened optional-sampling boundary. |
| 2026-06-16 | quality_runner | `npm run qa`, `npm run verify`, `git diff --check`, and targeted wording audit passed. |
| 2026-06-16 | review_judge | Reviewed the docs for beat-workstation-first framing, optional sampling scope, no runtime behavior changes, and no historical completed-plan edits. |

## Completion Notes

Completed. README and product docs now open with direct all-genre beat composition, built-in instruments, editable musical events, arrangement, mixing/mastering, and export. Sampling remains a later optional sound-source extension, but the public-facing draft no longer repeats sampler-first disclaimers in a way that makes sampling feel like the center.
