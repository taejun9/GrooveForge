# plan-441-key-compass-focus-result

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue toward a completed GrooveForge desktop app that can satisfy working producers such as 그냥노창 or 그루비룸 while staying easy for a first-time composer.

## Goal

Add UI-local Key Compass Focus Result feedback so visible Key Compass focus clicks, the current Key Compass Quick Action, and direct Key Compass card commands confirm the focused harmony lane, destination, key metric, audition cue, and next check.

## Non-Goals

- Do not change Key Compass derivation, key retargeting, selected-note editing, selected-chord editing, or harmony scoring.
- Do not mutate project data, undo history, musical events, arrangement data, mixer/master state, save/load, playback, or exports.
- Do not auto-run Key Retarget, note edits, chord edits, Composer Actions, Review Fixes, exports, or any follow-up action after a focus jump.
- Do not add sampling, imported audio, remote AI, plugin hosting, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Key Compass focus handler, Quick Actions routing, result reset paths.
- `src/ui/workstationUiModel.ts`: Key Compass result type.
- `src/styles.css`: Key Compass result layout.
- `README.md`: public feature summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: QA boundary for UI-local focus result behavior.
- `harness/scripts/run_qa.py`: static QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-441-key-compass-focus-result` and `.worktree/plan-441-key-compass-focus-result`.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional.

## Implementation Plan

- [x] Add a UI-local Key Compass Focus Result model.
- [x] Route visible Key Compass focus clicks and Quick Actions Key Compass commands through the same result-producing focus handler.
- [x] Render a compact result strip inside Key Compass with focused harmony lane, destination, key metric, audition cue, and next check.
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

QA completes before review starts. Review should verify that Key Compass Focus Result is UI-local, appears only after explicit visible or command focus jumps, routes all Key Compass focus paths through the same result handler, preserves project data/playback/export semantics, and does not auto-run follow-up actions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add Key Compass focus result feedback instead of changing harmony scoring. | The gap is confirmation and next-step clarity after choosing a harmony/key lane, not the underlying key diagnostics. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | harness_builder | Added UI-local Key Compass Focus Result state, helper derivation, result strip rendering, responsive CSS, and matching docs/QA expectations. |
| 2026-06-19 | quality_runner | `git diff --check`, static QA, quality gate, typecheck, build, `npm run qa`, and `npm run verify` passed. |
| 2026-06-19 | review_judge | Review found no blockers; Focus Result remains UI-local and does not alter Key Compass scoring, project data, undo history, playback, or exports. |

## Completion Notes

Completed with UI-local Key Compass Focus Result feedback for visible Focus controls, the current Key Compass Quick Action, and direct Key Compass card commands. The result confirms the focused harmony lane, Compose destination, key metric, audition cue, and next check without changing Key Compass derivation, key retargeting, selected-event editing, project schema, undo history, playback, or exports.
