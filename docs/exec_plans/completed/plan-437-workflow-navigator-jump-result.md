# plan-437-workflow-navigator-jump-result

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue toward a completed GrooveForge desktop app that can satisfy working producers such as 그냥노창 or 그루비룸 while staying easy for a first-time composer.

## Goal

Add UI-local Workflow Navigator Jump Result feedback so visible Workflow Navigator jumps, direct Workflow Navigator Quick Actions, and Workflow Spotlight jumps confirm the destination zone, readiness metric, audition cue, and next check without changing project data.

## Non-Goals

- Do not change Workflow Navigator item derivation, Workflow Spotlight derivation, Beat Map scoring, Export Preflight scoring, or zone ordering.
- Do not mutate project data, undo history, musical events, arrangement data, mixer/master state, save/load, playback, or exports.
- Do not auto-run First Beat Path, Beat Spine, Composer Actions, Next Move, Review Fixes, exports, or any other follow-up action after a jump.
- Do not add sampling, imported audio, remote AI, plugin hosting, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Workflow Navigator jump handler, Quick Actions routing, global result reset paths.
- `src/ui/workstationGuidancePanels.tsx`: Workflow Navigator component and result rendering.
- `src/ui/workstationUiModel.ts`: Workflow Navigator result type.
- `src/styles.css`: Workflow Navigator result layout.
- `README.md`: public feature summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: QA boundary for UI-local jump result behavior.
- `harness/scripts/run_qa.py`: static QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-437-workflow-navigator-jump-result` and `.worktree/plan-437-workflow-navigator-jump-result`.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional.

## Implementation Plan

- [x] Add a UI-local Workflow Navigator Jump Result model.
- [x] Route visible Workflow Navigator jumps, direct Workflow Navigator Quick Actions, and Workflow Spotlight focus through item-based result creation.
- [x] Render a compact result strip inside Workflow Navigator with destination, readiness metric, audition cue, and next check.
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

QA completes before review starts. Review should verify that Workflow Navigator Jump Result is UI-local, appears only after explicit visible or command jumps, routes all navigator/spotlight jumps through the same item-based result path, preserves project data/playback/export semantics, and does not auto-run follow-up actions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add Workflow Navigator jump result feedback instead of changing navigator scoring. | The gap is orientation after moving across dense workstation zones, not zone derivation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |
| 2026-06-19 | harness_builder | Added Workflow Navigator Jump Result state, item-based visible/Quick Actions/Spotlight jump routing, result strip rendering, responsive CSS, and static QA expectations. |
| 2026-06-19 | quality_runner | QA passed: git diff --check, python3 harness/scripts/run_qa.py, python3 harness/scripts/run_quality_gate.py, npm run typecheck, npm run build, npm run qa, and npm run verify. |

## Completion Notes

Completed. Workflow Navigator visible jumps, direct Workflow Navigator Quick Actions, and Workflow Spotlight focus now route through an item-based jump handler and show UI-local destination, readiness metric, audition cue, and next-check feedback without mutating project data, scoring, playback, or exports.
