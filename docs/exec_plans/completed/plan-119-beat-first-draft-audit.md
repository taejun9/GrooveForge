# plan-119-beat-first-draft-audit

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

일단 컨셉이 비트(모든 장르)를 만드는거고, 샘플링은 부가 기능으로 쓸거야. 지금은 샘플링이 메인인것처럼 초안이 잡혀있는거 같은데 확인해서 수정해줘.

## Goal

Audit the current durable project draft against the clarified concept: GrooveForge is an all-genre beat-production mini DAW for direct beat composition, sound design, arrangement, mixing/mastering, and export. Tighten docs and QA so sampling is clearly a later optional extension, not an equally weighted product spine or first-run path.

## Non-Goals

- Do not implement sampling, sampler tracks, audio clip import, chopping, audio warping, or plugin hosting.
- Do not remove all future-sampling references; keep sampling allowed as a secondary module.
- Do not change app runtime behavior unless the audit finds UI copy that centers sampling.
- Do not touch unrelated plan-085 or plan-118 worktrees.

## Context Map

- `README.md`: public project definition, MVP target, and core direction.
- `docs/product/product.md`: durable product definition, boundary, MVP, roadmap, and priority guardrail.
- `docs/architecture/product-architecture.md`: event-first architecture and extension-track boundary.
- `docs/quality/rules.md`: product framing and sampling-placement QA rules.
- `harness/scripts/run_qa.py`: static expectations that guard against sampling-first drift.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Root Markdown files remain limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Search current durable docs and app copy for sampling-centered wording.
- [x] Reframe any prominent optional-sampling flow so it reads as a later extension, not a parallel core workflow.
- [x] Strengthen durable product/architecture/quality rules around "all-genre beat creation first, sampling later".
- [x] Update static QA expectations for the stricter draft framing.
- [x] Run QA and verification.
- [x] Review, complete the plan, and create the review mirror.

## QA Plan

- `npm run qa`
- `npm run verify`
- Targeted `rg` audit for sampling/sample/sampler/chop/audio clip terms across current durable docs, harness, and app copy.

## Review Plan

QA completes before review starts. Review checks that remaining sampling language is optional-extension, safety/privacy, or future-roadmap context only, and that sampling no longer appears as a co-equal early workflow beside the core beat-making flow.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Keep sampling references but reduce their prominence. | The user wants sampling as a secondary feature, not erased from the future product. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-119 branch and worktree from `main`. |
| 2026-06-16 | repo_cartographer | Audited durable docs and found the core framing was beat-first, but the optional sampling flow still appeared too close to the primary flow. |
| 2026-06-16 | doc_gardener | Reframed README and product docs so sampling is not a parallel core flow or co-equal product spine. |
| 2026-06-16 | harness_builder | Updated QA expectations for the stricter draft-framing rule. |
| 2026-06-16 | quality_runner | `npm run qa` passed; `npm run verify` initially failed because this active plan still contained placeholder completion text. |
| 2026-06-16 | quality_runner | `npm run verify` passed after plan cleanup. |
| 2026-06-16 | review_judge | Reviewed durable docs and QA guardrails for beat-first framing and optional-sampling placement. |

## Completion Notes

Completed. The project draft now keeps direct all-genre beat composition as the only product spine and describes sampling as a later optional extension, not a parallel core flow. README, product docs, architecture docs, quality rules, and QA expectations now reject optional sampling sequences shown as co-equal starting workflows beside the beat-making path.
