# plan-147-snapshot-slot-role-readout

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a compact Project Snapshots slot-role readout that tells users whether they should save the first slot, compare a saved take, keep a version bank, or clear a full slot bank. The readout should make local version management more understandable without changing Project Snapshot save, rename, restore, delete, or Snapshot Compare behavior.

## Non-Goals

- Do not change saved project schema or snapshot payload shape.
- Do not change save, rename, restore, delete, Snapshot Compare, undo/redo, save/load, playback, or export semantics.
- Do not auto-save, auto-compare, auto-restore, or mutate snapshots from the readout.
- Do not add sampling, imported audio, remote AI, accounts, analytics, cloud sync, or filesystem versioning.

## Context Map

- `src/ui/App.tsx`: `ProjectSnapshots`, `SnapshotCompare`, and local snapshot helpers.
- `src/styles.css`: Project Snapshot and readout styling.
- `README.md`: public feature list.
- `docs/product/product.md`: product feature areas and MVP capabilities.
- `docs/quality/rules.md`: Project Snapshot quality guardrails.
- `harness/scripts/run_qa.py`: static expectations for app code, docs, and tests.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-147-snapshot-slot-role-readout` and `.worktree/plan-147-snapshot-slot-role-readout` for git repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Add a UI-local snapshot slot role summary helper derived only from `project.snapshots`.
- [x] Render the readout inside `ProjectSnapshots` with stable test IDs and responsive styling.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke.
- [x] Complete review, move this plan to completed, and add a review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- Local browser smoke for empty and one-saved-slot Project Snapshot readout state.

## Review Plan

QA completes before review starts. Review checks UI-local derivation, snapshot behavior preservation, layout risk, beginner/pro usefulness, and no sampling/cloud/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add a readout rather than a new snapshot action. | Existing save/restore/delete/compare behavior works; the gap is explaining slot state and next action. |
| 2026-06-16 | Derive only from `project.snapshots` and `maxProjectSnapshots`. | The readout should be informational and must not alter snapshot or project data. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for snapshot slot role clarity. |
| 2026-06-16 | harness_builder | Added `SnapshotSlotRoleSummary`, `createSnapshotSlotRoleSummary`, `snapshot-slot-role-*` UI, docs, and QA expectations. |
| 2026-06-16 | quality_runner | `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `git diff --check`, `npm run qa`, and `npm run verify` passed. |
| 2026-06-16 | quality_runner | CDP smoke passed: empty state showed `0/6 slots / Save first take / Next Save Slot`; Save Slot updated to `1/6 slots / Compare ready / Idea 1`; readout stayed contained. |
| 2026-06-16 | review_judge | Reviewed UI-local derivation, snapshot behavior preservation, layout risk, and no sampling/cloud/remote scope; no findings. |

## Completion Notes

Completed. Project Snapshots now includes a compact slot-role readout that shows empty, compare-ready, version-bank, or full-bank posture from local snapshot count only. Existing save, rename, restore, delete, Snapshot Compare, save/load, undo/redo, playback, and export behavior remains unchanged.
