# plan-366-pattern-dynamics-dna

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat workstation that can satisfy working producers while staying approachable for first-time composers.

## Goal

Add a Pattern DNA Dynamics card so producers can scan selected-pattern velocity posture across drums, 808, chords, and Synth at a glance, while beginners can understand whether the loop feels flat or shaped without selecting every event.

## Non-Goals

- Do not change project schema, save/load, playback, render, stem export, MIDI export, or any event-edit semantics.
- Do not add automatic dynamics editing, normalization, humanization, sampling, imported audio, recording, remote AI, accounts, analytics, cloud sync, macros, autoplay, or auto-export.
- Do not redesign Pattern DNA or change its focus routing behavior.

## Context Map

- `src/ui/App.tsx`
- `src/ui/workstationUiModel.ts`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- Keep feature work off `main`.
- Derive all dynamics values from existing selected Pattern drum, 808, chord, and Synth event velocity data.
- Keep the new card read-only and routed through the existing Pattern DNA focus handler.
- Preserve existing Pattern DNA card order behavior, Quick Actions Pattern DNA commands, playback, export, and direct editing semantics.
- QA and review are separate loops.

## Implementation Plan

- [x] Add a `dynamics` Pattern DNA card id and compute selected-pattern average/spread/layer velocity detail.
- [x] Keep Pattern DNA focus routing unchanged by using the existing Compose target.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA, typecheck, build/verify, review, complete plan, and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`

## Review Plan

QA completes before review starts. Review should verify that the Dynamics card is read-only, derived from existing selected Pattern velocity data, uses existing Pattern DNA focus behavior, and avoids schema, playback, render, export, sampling, recording, remote AI, or cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add a Pattern DNA Dynamics card instead of another editor control. | The recent velocity labels solve cell-level scanning; Pattern DNA should now expose whole-loop dynamics posture for faster producer review and beginner guidance. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created in `codex/plan-366-pattern-dynamics-dna`. |
| 2026-06-19 | harness_builder | Added a read-only Pattern DNA Dynamics card derived from selected Pattern drum, 808, chord, and Synth velocities with average, spread, and layer posture detail. |
| 2026-06-19 | harness_builder | Updated product docs, quality rules, and static QA expectations for Pattern DNA dynamics scanning. |
| 2026-06-19 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. |
| 2026-06-19 | quality_runner | Browser visual QA was attempted with `npm run dev -- --host 127.0.0.1 --port 5173`, but local server binding failed with `listen EPERM`; escalated execution was rejected by environment policy, so no browser workaround was used. |
| 2026-06-19 | review_judge | Post-QA review found no blocking issues; residual risk is limited to visual browser QA being blocked by local server binding policy. |
