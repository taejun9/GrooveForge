# plan-092-finish-move-actions

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Connect Master Finish Pads to Next Move and Quick Actions so beginners can find a finishing step without hunting through the Master panel and producers can apply common finish postures from the command palette.

## Non-Goals

- No new mastering algorithm, LUFS, true-peak, platform compliance, automatic mastering claim, or remote analysis.
- No sampling, imported audio, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No new project schema fields.
- No mutation of Pattern A/B/C musical events, arrangement blocks, sound design, non-master mixer channels, Delivery Target, Session Brief, snapshots, or export commands beyond the existing explicit Master Finish Pad path.

## Context Map

- `src/ui/App.tsx`: Next Move command model, Quick Actions, Master Finish Pad handler, Beat Map actions.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product-facing workflow and QA boundaries.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-092-finish-move-actions` and `.worktree/plan-092-finish-move-actions` for git repository work.
- Finish Move Actions must route through the existing explicit `applyMasterFinishPad` path and preserve its undoable, local, editable behavior.
- Next Move and Beat Map must remain deterministic recommendations from local project/export/target state.

## Implementation Plan

- [x] Add `masterFinish` to the Next Move command model and route it through `applyMasterFinishPad`.
- [x] Add target-aware Master Finish Next Move/Beat Map suggestions.
- [x] Add Quick Actions for Demo, Vocal, Store, and Club Master Finish Pads.
- [x] Update docs and QA expectations for the command/search workflow.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `npm run verify`
- Browser smoke test: Quick Actions finds and applies a Master Finish action, Next Move/Beat Map expose a finish action when relevant, Undo restores the previous master state, console errors stay empty, and no incoherent overflow appears.
- `npm run qa`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that all new actions route through the existing Master Finish Pad handler, remain local/explicit/undoable, and avoid automatic mastering claims.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Connect Master Finish Pads to Next Move and Quick Actions before adding new mastering features. | Discovery and speed improve both beginner completion and producer workflow without changing audio semantics or claiming automatic mastering. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for Finish Move Actions. |
| 2026-06-16 | harness_builder | Added Master Finish routing to Next Move, Beat Map, and Quick Actions through the existing `applyMasterFinishPad` handler. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and QA expectations to include Master Finish command/search workflow while preserving beat-first/sampling-optional framing. |
| 2026-06-16 | quality_runner | Passed `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `npm run verify`, browser smoke, `npm run qa`, and `git diff --check`. |

## Completion Notes

Master Finish Pads are now available as deterministic local Next Move, Beat Map, and Quick Actions commands. Browser smoke confirmed Quick Actions can find and apply Club master finish, update master preset/ceiling/output, close the command palette, and undo back to the previous master state with no console errors or horizontal overflow.
