# plan-100-sampling-optional-guardrails

## Status

completed

## Owner

project_lead / doc_gardener / harness_builder

## User Request

일단 컨셉이 비트(모든 장르)를 만드는거고, 샘플링은 부가 기능으로 쓸거야.
지금은 샘플링이 메인인것처럼 초안이 잡혀있는거 같은데 확인해서 수정해줘.

## Goal

Audit the current project draft and durable docs, then tighten the product framing so GrooveForge is unmistakably an all-genre beat-production mini DAW. Direct beat composition, sound design, arrangement, mixing/mastering, and export are the product spine; sampling remains only an optional later module.

## Non-Goals

- Do not implement sampling, sample import, chopping, sampler tracks, or audio warping.
- Do not add new product features beyond documentation and QA guardrails.
- Do not weaken the direct-composition, sample-free beat proof.
- Do not rewrite historical completed plans except by adding the new completion record for this work.

## Context Map

- `README.md`: public project framing and MVP summary.
- `docs/product/product.md`: durable product definition, boundary, MVP scope, roadmap, and non-goals.
- `docs/architecture/product-architecture.md`: event-first architecture and optional sampling extension boundary.
- `docs/quality/rules.md`: product QA gates that prevent sampler-first drift.
- `harness/scripts/run_qa.py`: static checks for required beat-first wording.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-100-sampling-optional-guardrails` and `.worktree/plan-100-sampling-optional-guardrails` for git repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.
- Preserve sampling as an optional future module instead of erasing it entirely.

## Implementation Plan

- [x] Audit current sampling-related wording across active durable docs and QA.
- [x] Tighten docs so the first-run flow, MVP proof, architecture, and roadmap all lead with direct all-genre beat creation.
- [x] Add or strengthen QA expectations that reject sampler-first wording and preserve the product spine list.
- [x] Run validation and document review results.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that remaining sampling language is optional-extension, safety/privacy, or historical context only, and that no wording makes sample import, chopping, sampler setup, or audio clips the default way to start a beat.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Separate this correction from the existing plan-099 drum work. | The user asked for product concept correction; mixing it with feature implementation would blur scope and review. |
| 2026-06-16 | Strengthen guardrails instead of deleting all sampling references. | The user wants sampling as a secondary feature, not removed from the future product. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created after confirming current docs are already mostly beat-first but can be tightened further. |
| 2026-06-16 | doc_gardener | Added explicit all-genre/user-intent wording and sampling placement rules to README, product, architecture, and quality docs. |
| 2026-06-16 | harness_builder | Added QA expectations for the strengthened beat-first and optional-sampling guardrails. |
| 2026-06-16 | quality_runner | Validation passed: run_qa, quality_gate, typecheck, build, qa, verify, and diff check. |
| 2026-06-16 | review_judge | Reviewed wording for beat-first scope, optional-sampling placement, and no feature implementation drift. |

## Completion Notes

GrooveForge's durable docs now state that the product is for "비트(모든 장르)를 만드는" direct beat creation, with sampling only as a later optional sound-source path. README, product docs, architecture docs, quality rules, and QA expectations now guard against sample browsing, chopping, sampler setup, audio clips, or sampling plan titles becoming the first-run, MVP, roadmap, architecture, or default explanation of the app.
