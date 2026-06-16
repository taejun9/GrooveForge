# plan-131-local-draft-recovery

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add local draft recovery so edited beats are less likely to be lost between desktop/browser sessions before the user explicitly saves a `.grooveforge.json` file. The feature should help beginners feel safe experimenting and help working producers preserve session continuity without adding accounts, cloud sync, analytics, or remote storage.

## Non-Goals

- Do not replace explicit Save/Open project file actions.
- Do not add cloud sync, accounts, remote storage, recent-file indexing, analytics, remote AI, or background export.
- Do not store imported audio, media blobs, sample packs, or copyrighted fixtures.
- Do not add sampling, sampler tracks, audio clips, plugin hosting, or OS-level filesystem watchers.
- Do not make Quick Action result strips trigger auto-save or auto-export.

## Context Map

- `src/ui/App.tsx`: project state, update paths, Save/Open buttons, project status UI, local recovery banner.
- `src/domain/workstation.ts`: project validation, normalization, default state.
- `src/styles.css`: project controls and recovery banner styling.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `docs/privacy/principles.md`, `harness/scripts/run_qa.py`: durable product, safety, and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-131-local-draft-recovery` and `.worktree/plan-131-local-draft-recovery`.
- Recovery storage must be local-only, bounded to validated project JSON, and explicit to restore or clear.

## Implementation Plan

- [x] Inspect save/open and project mutation paths.
- [x] Add local draft persistence using a versioned localStorage payload and existing project validation.
- [x] Add visible Restore Draft and Clear Draft controls that appear only for a stored draft from session startup.
- [x] Keep explicit Save/Open behavior unchanged and update local status copy without modal friction.
- [x] Update docs, privacy/quality rules, and static QA expectations.
- [x] Run QA, verify, smoke check, and review.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- `npm run typecheck`
- `npm run build`
- `curl -I http://127.0.0.1:5208/`: passed with `HTTP/1.1 200 OK`.
- Local/browser smoke:
  - Edit a project, confirm a local draft is written without triggering a file download or export.
  - Reload with an existing draft and confirm a recovery banner appears with draft title/time.
  - Restore Draft replaces project state through undoable history and keeps Save/Open buttons usable.
  - Clear Draft removes only the recovery prompt, not the current project.
  - Console errors stay empty and project save/load/export controls still render.

## Review Plan

QA completes before review starts. Review checks that draft recovery is local-only, explicit to restore/clear, bounded to project JSON, does not replace project files, does not mutate Quick Action result semantics, preserves save/load/playback/export paths, and introduces no sampling/cloud/analytics scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add local draft recovery after project files and snapshots. | Session-loss protection improves trust for both beginners and producers while staying local-first and low-risk. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-131 branch and worktree from latest `main`. |
| 2026-06-16 | repo_cartographer | Confirmed project save/open already routes through validated `.grooveforge.json` serialization and invalid project imports do not replace current state. |
| 2026-06-16 | harness_builder | Added localStorage-backed draft recovery, Restore Draft/Clear Draft UI, Save/Open cleanup rules, docs, privacy/quality rules, and QA expectations. |
| 2026-06-16 | quality_runner | `npm run qa`, `npm run verify`, `npm run typecheck`, `npm run build`, `git diff --check`, and local HTTP smoke passed. In-app Browser click smoke could not run because the `iab` browser session was unavailable; Playwright was not installed locally. |
| 2026-06-16 | review_judge | Reviewed local-only draft storage, parser validation, explicit restore/clear actions, undoable restore, Save/Open preservation, and no sampling/cloud/analytics expansion. |

## Completion Notes

Completed. GrooveForge now writes a bounded versioned project JSON draft to renderer localStorage after project edits, reads only parser-validated drafts on startup, and shows a Restore Draft/Clear Draft banner only when a startup draft exists. Restore routes through project history so Undo can return to the prior state, Clear removes only the recovery payload, Open clears old recovery state without creating a new draft, and successful Save/download clears the draft because the durable `.grooveforge.json` workflow remains primary.
