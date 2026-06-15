# plan-033-beat-first-guardrails

## Status

active

## Owner

project_lead / plan_keeper

## User Request

일단 컨셉이 비트(모든 장르)를 만드는거고, 샘플링은 부가 기능으로 쓸거야. 지금은 샘플링이 메인인것처럼 초안이 잡혀있는거 같은데 확인해서 수정해줘.

## Goal

Audit the current project draft and strengthen durable docs so GrooveForge is unmistakably an all-genre beat-making workstation first. Sampling remains allowed only as a later optional supporting module.

## Non-Goals

- No sampling, audio import, chopping, sampler tracks, or audio warping implementation.
- No UI feature implementation.
- No broad roadmap rewrite outside the beat-first framing guardrails.

## Context Map

- `README.md`: public project entry point and first-run framing.
- `AGENTS.md`: short repository invariants for future agents.
- `docs/product/product.md`: product definition, boundary, MVP, roadmap, and non-goals.
- `docs/architecture/product-architecture.md`: model and architecture boundary between core composition and optional sampling.
- `docs/quality/rules.md`: durable QA guardrail for future plans and UI copy.
- `harness/scripts/run_qa.py`: static checks that prevent sampler-first wording from returning.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Audit current sampling-related wording across durable docs.
- [x] Tighten product docs around all-genre beat creation, direct composition, and first-run workflow.
- [x] Add architecture/quality guardrails that keep sampling out of primary navigation, MVP, and plan titles unless explicitly optional.
- [x] Update static QA expectations for the strengthened beat-first language.
- [x] Run QA and review, then complete the plan lifecycle.

## QA Plan

- `rg -n -i "sample|sampling|sampler|audio clip|AudioClip|chop|slice|stretch|샘플|샘플링" README.md AGENTS.md docs harness`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that the remaining sampling language is optional-extension, privacy/safety, QA guardrail, or historical completed-plan context only.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Strengthen guardrails instead of removing every sampling reference. | The user wants sampling as a secondary feature, not erased entirely. |
| 2026-06-15 | Keep changes in docs and harness only. | The request is about product concept framing, not feature implementation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created after auditing current docs and confirming the existing direction is already mostly beat-first. |
| 2026-06-15 | doc_gardener | Added first-run, default navigation, roadmap, and architecture guardrails that keep direct beat composition ahead of sampling workflows. |
| 2026-06-15 | harness_builder | Added static QA expectations for the new beat-first guardrail wording. |
| 2026-06-15 | quality_runner | `python3 harness/scripts/run_qa.py` passed; first quality gate run found an active-plan placeholder and the plan was cleaned up. |
| 2026-06-15 | quality_runner | `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check` passed. |
| 2026-06-15 | review_judge | Created the completion review mirror with no blocking findings. |

## Completion Notes

The durable docs now make direct all-genre beat creation the first-run and roadmap priority. Sampling is preserved as a later opt-in extension and guarded by static QA expectations.
