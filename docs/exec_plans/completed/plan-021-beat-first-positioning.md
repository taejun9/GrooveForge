# plan-021-beat-first-positioning

## Status

completed

## Owner

project_lead / doc_gardener

## User Request

일단 컨셉이 비트(모든 장르)를 만드는거고, 샘플링은 부가 기능으로 쓸거야. 지금은 샘플링이 메인인것처럼 초안이 잡혀있는거 같은데 확인해서 수정해줘.

## Goal

Audit the project draft and durable docs so GrooveForge is clearly framed as an all-genre, event-based beat-making mini DAW. Sampling must be described only as an optional add-on, not as the MVP center, architecture center, or product identity.

## Non-Goals

- No sampling implementation, audio import, chopping, stretching, or sampler UI in this plan.
- No broad feature implementation beyond documentation and quality guardrails.
- No change to the local-first desktop app direction.

## Context Map

- `AGENTS.md`: project invariants and team map.
- `README.md`: public project framing and runnable commands.
- `docs/product/product.md`: durable product direction.
- `docs/architecture/product-architecture.md`: product/data architecture.
- `docs/quality/rules.md`: repeatable QA guardrails.
- `harness/scripts/run_qa.py`: static expectations that prevent framing drift.
- User brief attachment: beat-first mini DAW direction, sampling as optional module.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-021-beat-first-positioning` and `.worktree/plan-021-beat-first-positioning` for git repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.
- Preserve the event-based beat workstation invariant.

## Implementation Plan

- [x] Search durable docs and harness checks for sampling-first or trap-only framing.
- [x] Update product and architecture docs so pattern programming, drums, 808/bass, melody/chord composition, sound design, arrangement, mixing, mastering, and export are the core flow.
- [x] Reframe sampling as a later optional module with explicit boundaries.
- [x] Add QA expectations that catch sampling-first drift.
- [x] Run static QA and repository verification.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that the docs consistently define GrooveForge as a beat-first mini DAW, not a sampler, and that quality gates encode that distinction.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Treat sampling as optional future scope, not an MVP pillar. | The user clarified that the project is for making beats across genres; sampling is only an add-on workflow. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created for beat-first positioning audit and documentation correction. |
| 2026-06-15 | repo_cartographer | Searched README, AGENTS, docs, harness, and source references for sample/sampling/sampler/audio clip/chop/stretch/trap terms. |
| 2026-06-15 | doc_gardener | Updated README and product docs to state GrooveForge is beat-first, not sampler-first, and that the first-run experience is a compact beat-making DAW rather than a sample browser. |
| 2026-06-15 | doc_gardener | Clarified the architecture term `Clip` as pattern/MIDI/automation data before optional sampling is implemented. |
| 2026-06-15 | harness_builder | Added static QA expectations for beat-first wording, optional sampling boundaries, and clip terminology. |
| 2026-06-15 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`. |

## Completion Notes

GrooveForge's durable docs now state the product as a beat-first all-genre mini DAW. Sampling remains allowed only as a later optional module, and QA expectations now protect the README, product docs, architecture docs, and quality rules from drifting back toward sampler-first framing.
