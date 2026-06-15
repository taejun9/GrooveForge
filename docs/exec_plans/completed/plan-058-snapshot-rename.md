# plan-058-snapshot-rename

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 현직 작곡가도 만족하고 작곡을 처음 해보는 사람도 쓰기 쉬운 데스크탑앱으로 완성시켜 달라는 장기 목표를 이어간다.

## Goal

Let users rename Project Snapshots so local beat idea slots can carry meaningful labels such as hook, sparse verse, or mix-safe version instead of only generated `Idea N` names. The feature should help beginners remember what they saved and help working producers compare composition/mix states without introducing cloud sync, sampling, remote AI, or destructive filesystem versioning.

## Non-Goals

- No snapshot diff view.
- No audio A/B switching.
- No cloud sync, accounts, remote storage, analytics, or filesystem version history.
- No sampling, imported audio, sampler track, plugin hosting, or remote AI work.

## Context Map

- `src/domain/workstation.ts`: Project Snapshot model, save/restore/delete helpers, project normalization.
- `src/ui/App.tsx`: Snapshot row UI, undoable project updates, focused-input shortcut handling.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA wording for snapshot behavior.
- `harness/scripts/run_qa.py`: static quality expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Snapshot names must remain local project-file data, bounded, save/load safe, and undoable.
- Focused snapshot name inputs must not trigger desktop editing shortcuts.

## Implementation Plan

- [x] Add bounded snapshot-name normalization and a `renameProjectSnapshot` domain helper.
- [x] Normalize older/imported snapshot names during project load.
- [x] Add a Snapshot name input in the UI with draft editing and commit-on-blur/Enter behavior.
- [x] Update product docs and QA rules to include save/rename/restore/delete behavior.
- [x] Extend static QA coverage for domain/UI rename hooks.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`
- Browser smoke test: save a snapshot, rename it, use a fill/edit, restore the renamed snapshot, delete it, and confirm no console errors or horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that rename is local, bounded, undoable, save/load safe, does not recurse snapshot payloads, does not fire shortcuts from focused inputs, and stays aligned with the beat-workstation product boundary.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add rename as the next Project Snapshot slice. | Named idea slots improve beginner recall and professional version comparison while staying local-first and scoped. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created. |
| 2026-06-16 | harness_builder | Added bounded snapshot name normalization, rename helper, UI draft editing, and Snapshot row input styling. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for snapshot rename. |
| 2026-06-16 | quality_runner | `run_qa`, `run_quality_gate`, `npm run qa`, `npm run verify`, and browser smoke passed. |
| 2026-06-16 | review_judge | Reviewed rename flow for local-only scope, bounded names, undoable updates, save/load normalization, focused-input shortcut handling, and product-boundary fit. |

## Completion Notes

Implemented Snapshot rename for local project idea slots. Snapshot names are normalized and bounded in domain code, imported project snapshots normalize names on load, and the UI now supports draft editing with blur/Enter commit and Escape cancel. QA and browser smoke passed.
