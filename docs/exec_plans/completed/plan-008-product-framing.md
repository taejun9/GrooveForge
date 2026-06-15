# plan-008-product-framing

## Goal

Confirm and tighten the project framing so GrooveForge is clearly documented as an all-genre beat-making mini DAW, with sampling only as a secondary optional extension.

## Context

The user clarified that the product concept is not a sampling app. The center is direct beat composition, sound design, arrangement, mixing/mastering, and export across genres. Sampling can exist later as an add-on.

Current repository docs already included this direction in several places, but this plan audited remaining wording and strengthened ambiguous or stale framing.

## Scope

- Reviewed product, architecture, README, quality, and privacy docs for sample/sampling language.
- Kept sampling references only when they describe optional extension, licensing/privacy boundaries, or historical completed-plan context.
- Aligned README wording with the current Electron desktop MVP while preserving web-first architecture language.
- Added durable framing checks so future plans do not drift back toward a sampling-first product.

## Out Of Scope

- No UI implementation.
- No audio engine changes.
- No sampling feature implementation.
- No broad roadmap rewrite beyond wording needed for this correction.

## Validation

- `rg -n "샘플링|샘플|sampling|sample|sampler|샘플러" README.md AGENTS.md docs harness`
  - Reviewed remaining matches. They are optional-extension, safety/licensing, QA guardrail, or historical-plan context.
- `python3 harness/scripts/run_qa.py`
  - Passed.
- `python3 harness/scripts/run_quality_gate.py`
  - Passed.

## Checklist

- [x] Audit sampling-related wording.
- [x] Update product framing docs.
- [x] Update quality guardrails if needed.
- [x] Run validation.
- [x] Move plan to completed and create review mirror.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-15 | Treat sampling as a future extension, not the product spine. | The user explicitly clarified that GrooveForge is a beat-making mini DAW for direct composition, sound design, mixing/mastering, and export. |
| 2026-06-15 | Keep sample/sampling mentions only when they reinforce optional-extension, safety, licensing, QA, or historical context. | Removing every mention would erase necessary guardrails; the problem was sampling as the center, not acknowledging it as a later module. |

## Activity Log

| Date | Role | Note |
|---|---|---|
| 2026-06-15 | project_lead | Read the `$base` skill instructions and audited the attached brief. |
| 2026-06-15 | repo_cartographer | Searched repository docs and harness files for sampling-related language. |
| 2026-06-15 | doc_gardener | Updated README, product, architecture, quality, and QA expectation wording. |
| 2026-06-15 | quality_runner | Ran QA and quality gate successfully. |
