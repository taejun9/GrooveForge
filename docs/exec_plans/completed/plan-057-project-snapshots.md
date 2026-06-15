# plan-057-project-snapshots

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add local Project Snapshots so users can save, restore, and delete a small set of beat idea states inside the project file. Beginners should be able to experiment without fear of losing a working beat; working producers should be able to compare hooks, variations, and mix directions without leaving the workstation.

## Non-Goals

- No cloud sync, account history, remote backup, collaboration, or analytics.
- No destructive file-system versioning, Git integration, or automatic autosave timeline.
- No sampling, audio import, plugin hosting, remote AI, generated audio, or hidden assets.
- No snapshot comparison diff view or audio A/B switching in this slice.

## Context Map

- `src/domain/workstation.ts`: project state, save/load serialization, normalization/migration, pattern/mixer/arrangement clone helpers.
- `src/ui/App.tsx`: undo/redo, project replace/update flow, save/open/export controls, top-level workstation sections.
- `src/styles.css`: top-level rows and compact repeated item controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, domain, UI, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-057-project-snapshots` and `.worktree/plan-057-project-snapshots` for git repository work.
- Snapshots must stay local-first project data, exclude recursive nested snapshots, preserve older project migration, and route restore/delete/save through undoable project history.

## Implementation Plan

- [x] Add snapshot types, max count, clone/normalize helpers, and save/restore/delete domain functions.
- [x] Persist snapshots in `.grooveforge.json` while migrating older files to an empty snapshot list.
- [x] Add a Project Snapshots UI row with Save Slot, Restore, and Delete controls.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run automated validation and browser smoke tests.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`
- Browser smoke test over the dev server: snapshot row renders, Save Slot creates a snapshot, a later edit changes the beat, Restore brings back the snapshot state, Delete removes the snapshot, undo/redo remains available, save serialization includes snapshots, no button overflow, Play/Stop works, and console errors are empty.

## Review Plan

QA completes before review starts. Review checks that snapshots are local project data, avoid recursion, migrate older projects safely, preserve undo/redo and save/load semantics, remain useful for both beginners and working producers, and avoid cloud/sampling/AI scope creep.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add local Project Snapshots before broader autosave or cloud history. | The feature improves safe experimentation without introducing accounts, remote storage, or external state. |
| 2026-06-16 | Store snapshots as core project payloads without nested snapshots. | Restoring should preserve the current snapshot list and avoid recursive project-file growth. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created after inspecting ProjectState, save/load, and undo/redo flow. |
| 2026-06-16 | harness_builder | Added local snapshot project data, normalization, save/restore/delete helpers, top-level UI controls, docs, and static QA expectations. |
| 2026-06-16 | quality_runner | `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `git diff --check`, `python3 harness/scripts/run_quality_gate.py`, `npm run qa`, and `npm run verify` passed. |
| 2026-06-16 | quality_runner | Browser smoke passed on `http://127.0.0.1:5175/`: snapshot row rendered, Save Slot created `1/6` slots, Clear Tail changed Pattern A from 34 to 23 events, Restore returned Pattern A to 34 events, Delete returned to `0/6`, undo remained enabled, Play/Stop worked, no button overflow, and console errors were empty. |
| 2026-06-16 | quality_runner | Domain serialization check passed: serialized project includes snapshots, snapshot payloads do not include nested snapshots, and restore preserves the snapshot list. |
| 2026-06-16 | review_judge | Reviewed local-only scope, migration, recursion boundary, undo/redo behavior, save/load semantics, layout, and product boundary. |
| 2026-06-16 | plan_keeper | Moved the plan to completed and created the review mirror. |

## Completion Notes

Completed. Project Snapshots now let users save, restore, and delete local idea slots inside the project file. Snapshot payloads exclude nested snapshots, older project files migrate to an empty list, and restore preserves the current snapshot list while replacing the editable beat state.
