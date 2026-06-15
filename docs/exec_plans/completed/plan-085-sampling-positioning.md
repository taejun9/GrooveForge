# plan-085-sampling-positioning

## User Request

일단 컨셉이 비트(모든 장르)를 만드는거고, 샘플링은 부가 기능으로 쓸거야.
지금은 샘플링이 메인인것처럼 초안이 잡혀있는거 같은데 확인해서 수정해줘.

## Goal

Audit the current durable draft and tighten the project framing so GrooveForge is unmistakably an all-genre beat-production mini DAW: direct beat composition, sound design, arrangement, mixing, mastering, and export are the product center. Sampling remains a later optional support module only.

## Non-Goals

- No sampler, sample import, chopping, slicing, loop stretching, audio warping, or audio recording implementation.
- No broad UI redesign.
- No change to runtime audio, project schema, export behavior, or feature roadmap order beyond wording and guardrails.
- No deletion of historical completed plans or reviews.

## Context

- `AGENTS.md` already states GrooveForge is an all-genre, event-based beat workstation and not a sampling-first app.
- `README.md`, `docs/product/product.md`, architecture docs, and QA checks already contain beat-first guardrails, but the new user brief should become the durable definition used by future plans.
- Historical completed plans may still mention sampling because they record prior guardrail decisions; those should remain untouched.

## Files In Scope

- `README.md`
- `docs/product/product.md`
- `docs/architecture/product-architecture.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- This plan file, completed plan, and review mirror

## Constraints

- Keep root Markdown limited to `README.md` and `AGENTS.md`.
- Preserve sampling as an optional add-on, not a forbidden feature.
- Keep MVP and first-run language centered on direct event-based beat creation across genres.
- Update static QA so future drafts cannot drift back toward sampler-first positioning.

## Implementation Plan

- [x] Audit non-historical docs and harness expectations for sampling-first or ambiguous product framing.
- [x] Add the user's corrected definition: an all-genre beat-production mini DAW for direct composition, sound design, arrangement, mix/master, and export.
- [x] Clarify the optional sampling module boundary and roadmap order.
- [x] Extend QA text expectations for the strengthened definition.
- [x] Run validation and complete the repository lifecycle.

## Validation

- [x] `rg -n -i "sample|sampling|sampler|audio clip|AudioClip|chop|slice|stretch|샘플|샘플링" README.md AGENTS.md docs/architecture docs/product docs/quality harness/scripts/run_qa.py`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run verify`
- [x] `npm run qa`
- [x] `git diff --check`

## Review Plan

QA completes before review starts. Review checks that current durable docs make direct all-genre beat creation the product center, that sampling is described only as a later optional module, and that static QA guards the new framing without rewriting historical records.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-16 | Treat this as a framing/guardrail correction, not feature work. | The user asked to correct the project concept and draft emphasis, and no sampler/runtime implementation is needed. |

## Progress Log

| Date | Owner | Update |
|---|---|---|
| 2026-06-16 | project_lead | Created the plan after confirming the repository already has a beat-first invariant but needs the latest brief reflected in durable docs. |
| 2026-06-16 | doc_gardener | Updated README, product, architecture, quality rules, and static QA expectations with the corrected beat-production mini DAW definition and optional-sampling boundary. |
| 2026-06-16 | quality_runner | Ran sampling-positioning audit, static QA, verify, npm QA, and diff whitespace checks. |
| 2026-06-16 | review_judge | Reviewed the document-only change for beat-first clarity, optional-sampling preservation, and QA expectation alignment; no findings. |
