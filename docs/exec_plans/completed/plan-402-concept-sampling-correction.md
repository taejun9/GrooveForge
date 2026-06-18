# plan-402-concept-sampling-correction

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Confirm that GrooveForge is an all-genre beat-making app where sampling is an add-on, not the main product, and correct draft material that makes sampling look central.

## Goal

Reframe the first-read docs and QA checks so GrooveForge presents as a direct beat-production mini DAW: pattern programming, drums, 808/bass, melody/chords, sound design, arrangement, mixing, mastering, and export first; optional sampling only after that.

## Non-Goals

- Do not add sampling features.
- Do not remove the optional sampling boundary entirely.
- Do not change product schema, playback, export, renderer behavior, or app UI.
- Do not touch unrelated in-progress worktrees.

## Context Map

- `README.md`
- `docs/product/product.md`
- `docs/architecture/product-architecture.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Preserve the existing `plan-401-reference-alignment` worktree without mixing changes.

## Implementation Plan

- [x] Audit current docs against the attached Korean concept correction.
- [x] Move sampling-heavy guardrails out of the first-read product spine while preserving the optional-extension boundary.
- [x] Add a QA check that README/product first-read sections lead with direct beat production.
- [x] Run validation, review, complete the plan, merge, push, and clean up the task worktree.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`

## Review Plan

QA completes before review starts. Review checks whether first-read wording now centers direct beat composition, whether sampling remains clearly optional, and whether the change is docs/harness-only.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Keep optional sampling guardrails but move them away from the first-read spine. | The guardrails are useful, but leading with many sampling references makes the concept feel sampling-centered. |
| 2026-06-19 | Add a first-read framing QA check. | The request is about product framing, so the harness should catch future drift in intro sections. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for concept/sampling correction. |
| 2026-06-19 | repo_cartographer | Repositioned sampling-heavy guardrails below the first-read product spine and product definition. |
| 2026-06-19 | harness_builder | Added first-read framing QA to keep README/product intros beat-first. |
| 2026-06-19 | quality_runner | Ran full validation; all checks passed. |
| 2026-06-19 | review_judge | Reviewed docs/harness-only scope and concept alignment; no findings. |

## Completion Notes

Completed. README and product docs now first present GrooveForge as a direct all-genre beat-production mini DAW, while detailed sampling and attached-brief correction rules live in Draft Intake Guardrails. QA now enforces that first-read sections do not drift back into sampling-first framing.
