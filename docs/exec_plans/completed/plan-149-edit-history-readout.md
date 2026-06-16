# plan-149-edit-history-readout

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local edit history readout near undo/redo so users can see undo and redo depth while composing, arranging, mixing, and finishing beats.

## Non-Goals

- Do not change undo/redo stack semantics, shortcut handling, or project edit behavior.
- Do not persist edit history depth in the project file or change save/load schema.
- Do not add timeline versioning, branching history, snapshot changes, cloud sync, accounts, analytics, remote AI, plugin hosting, imported audio, or sampling features.
- Do not change playback, render, export, MIDI, Handoff Sheet, or local draft recovery behavior.

## Context Map

- `src/ui/App.tsx`: undo/redo stacks, transport command strip, and UI-local readout derivation.
- `src/styles.css`: transport and command strip layout.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: undo/redo quality boundary.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-149-edit-history-readout` and `.worktree/plan-149-edit-history-readout` for git repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Add a derived edit history summary from undo/redo stack depth and project status.
- [x] Render the readout beside transport status and undo/redo with stable test IDs.
- [x] Add compact responsive styling that does not crowd transport controls.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- Local browser smoke for initial, undo-ready, and redo-ready readout states plus command strip containment.

## Review Plan

QA completes before review starts. Review checks that the readout is UI-local, derives only from existing undo/redo state, preserves edit history behavior, keeps the command strip usable, and avoids sampling/cloud/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add a read-only command strip readout instead of changing edit history behavior. | The need is visibility and confidence, not a new history model. |
| 2026-06-16 | Use undo/redo stack depth plus project status as the only readout inputs. | This keeps the feature UI-local and out of project schema. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for UI-local edit history visibility. |
| 2026-06-16 | harness_builder | Added edit history summary, command-strip readout, compact styling, docs, and static QA expectations. |
| 2026-06-16 | quality_runner | `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `git diff --check`, `npm run qa`, and `npm run verify` passed. |
| 2026-06-16 | quality_runner | CDP smoke passed for initial clean slate, undo-ready, redo-ready, and command strip containment. |
| 2026-06-16 | review_judge | Reviewed UI-local derivation, undo/redo behavior preservation, layout containment, and no sampling/cloud/remote scope; no findings. |

## Completion Notes

Completed. GrooveForge now shows a UI-local edit history readout beside transport status and undo/redo. It reports undo/redo depth and edit posture from existing stack lengths and current project status without changing undo/redo semantics, project schema, save/load, playback, render, export, MIDI, Handoff Sheet, snapshots, or local draft recovery.
