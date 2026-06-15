# plan-006-project-files

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop app that can satisfy working composers while staying easy for first-time composers.

## Goal

Add project save/load so edited beats can survive app restarts and move between sessions as GrooveForge project files.

## Non-Goals

- Add cloud sync, accounts, remote storage, or collaboration.
- Add sampling, audio import, or third-party asset packaging.
- Build a full project browser or recent-file manager.
- Replace WAV export.

## Requirements

- Save writes the current editable project as a JSON project file.
- Load restores a saved project into the workstation.
- Electron desktop builds use native file dialogs where available.
- Browser/dev fallback remains usable for local validation.
- Invalid project files are rejected without losing the current project.
- Save/load does not break realtime playback or WAV export.

## Context Map

- `electron/main.ts`: native file dialogs and filesystem IPC.
- `electron/preload.ts`: safe renderer bridge.
- `src/vite-env.d.ts`: renderer-visible bridge types.
- `src/domain/workstation.ts`: project serialization validation.
- `src/ui/App.tsx`: Save/Open actions and status feedback.
- `harness/scripts/run_qa.py`: static checks for project file support.

## Constraints

- QA and review are separate loops.
- Do not create or use `docs/plan`.
- Keep the app local-first.
- Keep sampling as an optional extension.
- No real user audio or copyrighted fixtures.

## Implementation Plan

- [x] Create task worktree and active plan.
- [x] Add project file serialization and validation helpers.
- [x] Add Electron save/open IPC behind a narrow preload API.
- [x] Add browser/dev fallback for project JSON export/import.
- [x] Wire Save/Load buttons and user-visible status feedback.
- [x] Update docs and QA checks.
- [x] Run validation and browser interaction checks.
- [x] Complete plan and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`: passed.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run verify`: passed.
- Browser fallback check: passed. Title edit set Unsaved changes, Save changed status to `Downloaded plan-006-smoke-beat.grooveforge.json`, Open and hidden file input were present, playback still ran, and no browser console errors were reported.
- `npm run desktop`: passed launch smoke check. The app built and Electron launched with the new preload IPC; the process was stopped after launch verification.

## Review Plan

QA completed before review. Review mirror is recorded in `docs/reviews/plan-006-project-files-review.md`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Implement local project files before deeper editors. | A beat workstation is not practically usable if edited projects cannot survive restart or move between sessions. |
| 2026-06-15 | Use native Electron dialogs with a browser fallback. | The desktop app should feel local, while the dev server remains easy to validate. |
| 2026-06-15 | Validate imports before replacing state. | Invalid project files should not destroy a user's current beat. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Opened plan for local GrooveForge project file save/load. |
| 2026-06-15 | harness_builder | Added project file serialization, validation, Electron IPC, renderer fallback, and QA expectations. |
| 2026-06-15 | quality_runner | Ran QA, quality gate, typecheck, build, verify, browser fallback checks, and desktop launch smoke check. |
| 2026-06-15 | review_judge | Created review mirror with no blocking findings. |

## Completion Notes

GrooveForge now has local project files. Desktop builds use Electron native save/open dialogs through a narrow preload bridge, while dev/browser fallback can export JSON and open project JSON through a file input. Imported projects are validated before replacing the current beat.
