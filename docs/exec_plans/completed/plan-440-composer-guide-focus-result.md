# plan-440-composer-guide-focus-result

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue toward a completed GrooveForge desktop app that can satisfy working producers such as 그냥노창 or 그루비룸 while staying easy for a first-time composer.

## Goal

Add UI-local Composer Guide Focus Result feedback so visible Composer Guide focus clicks, the current Composer Guide Quick Action, and direct Composer Guide card commands confirm the focused writing lane, destination, guide metric, audition cue, and next check.

## Non-Goals

- Do not change Composer Guide derivation, card order, scoring, recommendations, or Composer Actions behavior.
- Do not mutate project data, undo history, musical events, arrangement data, mixer/master state, save/load, playback, or exports.
- Do not auto-run Composer Actions, Layer Starter, Pattern Chain, Review Fixes, Beat Spine applies, exports, or any follow-up action after a focus jump.
- Do not add sampling, imported audio, remote AI, plugin hosting, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Composer Guide focus handler, Quick Actions routing, result reset paths.
- `src/ui/workstationGuidancePanels.tsx`: Composer Guide component and result rendering.
- `src/ui/workstationUiModel.ts`: Composer Guide result type.
- `src/styles.css`: Composer Guide result layout.
- `README.md`: public feature summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: QA boundary for UI-local focus result behavior.
- `harness/scripts/run_qa.py`: static QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-440-composer-guide-focus-result` and `.worktree/plan-440-composer-guide-focus-result`.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional.

## Implementation Plan

- [x] Add a UI-local Composer Guide Focus Result model.
- [x] Route visible Composer Guide focus clicks and Quick Actions Composer Guide commands through the same result-producing focus handler.
- [x] Render a compact result strip inside Composer Guide with focused lane, destination, guide metric, audition cue, and next check.
- [x] Update README/product/quality docs and static QA expectations.
- [x] Run QA, review, complete plan, and mirror review.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review should verify that Composer Guide Focus Result is UI-local, appears only after explicit visible or command focus jumps, routes all Composer Guide focus paths through the same result handler, preserves project data/playback/export semantics, and does not auto-run follow-up actions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add Composer Guide focus result feedback instead of changing guide scoring. | The gap is confirmation and next-step clarity after choosing a writing lane, not the underlying guide derivation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | harness_builder | Added Composer Guide Focus Result type, UI-local state, shared focus-handler result creation, result strip rendering, responsive styling, and static QA expectations. |
| 2026-06-19 | quality_runner | Passed `git diff --check`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run qa`, and `npm run verify`. |
| 2026-06-19 | review_judge | Reviewed after QA; no follow-up fixes required. |

## Completion Notes

Composer Guide visible focus buttons, the current Composer Guide Quick Action, and direct Composer Guide card commands now share the same focus handler and show a UI-local Focus Result with focused writing lane, destination, guide metric, audition cue, and next-check feedback. The change does not alter Composer Guide derivation, project data, undo history, playback, save/load, export behavior, or sampling boundaries.
