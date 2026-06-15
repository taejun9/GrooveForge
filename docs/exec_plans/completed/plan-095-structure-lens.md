# plan-095-structure-lens

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that working producers can respect and first-time composers can use easily.

## Goal

Add a compact Structure Lens panel that explains the current arrangement's delivery-target fit, section coverage, hook contrast, and energy arc from local project data, with explicit buttons that route to existing arrangement actions.

## Non-Goals

- No new arrangement schema, render algorithm, sample import, audio clip, sampler, cloud, account, remote AI, or remote analysis work.
- No hidden auto-arrangement, auto-export, background rendering, publishing, platform compliance, licensing, LUFS, true-peak, or professional mastering guarantee claims.
- No mutation unless the user clicks an explicit existing action.

## Context Map

- `src/ui/App.tsx`: arrangement state, Delivery Target, Beat Map/Next Move placement, existing arrangement template, Pattern Chain, Chain Expand, and Hook Lift action paths.
- `src/styles.css`: compact panel/card/action styling.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product framing and guardrails.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-095-structure-lens` and `.worktree/plan-095-structure-lens` for git repository work.
- Structure Lens must derive only from local `ProjectState`, selected Delivery Target, and arrangement block data.
- Mutating buttons must route through existing explicit undoable actions such as full arrangement template, Pattern Chain, Chain Expand, target alignment, or Hook Lift.

## Implementation Plan

- [x] Add Structure Lens summary/action types and derivation helpers.
- [x] Render Structure Lens near existing arrangement/production guidance surfaces.
- [x] Wire action buttons to existing arrangement handlers only.
- [x] Add compact responsive styles.
- [x] Update docs and QA expectations.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `npm run verify`
- Browser smoke test: Structure Lens renders four signals, action buttons are unique, Hook Lift or target/action click routes through existing UI state, console errors stay empty, and no horizontal overflow appears.
- `npm run qa`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that Structure Lens is local/read-only until explicit clicks, stays arrangement-focused, routes actions through existing handlers, and does not reintroduce sampling-first framing.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Structure Lens as an arrangement quality surface. | Beginners need readable song-structure guidance; experienced producers need quick target-fit, hook, and energy checks without leaving the main workstation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for Structure Lens. |
| 2026-06-16 | harness_builder | Added Structure Lens UI, local arrangement analysis helpers, responsive styles, docs, and static QA expectations. |
| 2026-06-16 | quality_runner | `npm run typecheck`, `python3 harness/scripts/run_qa.py`, browser smoke, `npm run verify`, `npm run qa`, and `git diff --check` passed. |

## Completion Notes

Structure Lens now shows target fit, section coverage, hook contrast, and energy arc from local arrangement state and selected Delivery Target. Its buttons route through existing explicit undoable action paths for target alignment, Pattern Chain, Chain Expand, full arrangement, or Hook Lift.
