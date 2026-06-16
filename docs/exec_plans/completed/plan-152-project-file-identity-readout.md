# plan-152-project-file-identity-readout

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Extend the UI-local project safety readout so users can see the current project file identity and whether the open/saved file has unsaved edits.

## Non-Goals

- Do not change project file contents, save/open/download behavior, local draft restore/clear behavior, or file system autosave.
- Do not persist file identity or dirty state in the project schema.
- Do not add background versioning, cloud sync, accounts, analytics, remote AI, imported audio, or sampling.
- Do not change playback, render, WAV/stem/MIDI export, Handoff Sheet, snapshots, Quick Actions, or undo/redo behavior.

## Context Map

- `src/ui/App.tsx`: project save/open handlers, project update path, project safety readout summary, and session meter rendering.
- `src/styles.css`: project safety readout styling.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: project file and local draft safety boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-152-project-file-identity-readout` and `.worktree/plan-152-project-file-identity-readout` for git repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Track current project file label and unsaved edit state as UI-local app state.
- [x] Update save/open/project-edit paths so the project safety readout distinguishes unsaved edits from durable saved/loaded files.
- [x] Preserve local draft safety net semantics and existing `project-safety-*` test IDs.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- Local browser smoke for initial local project state and edit-triggered unsaved/draft state.

## Review Plan

QA completes before review starts. Review checks that file identity and dirty state are UI-local, save/open/draft semantics are preserved, the readout does not imply autosave or cloud sync, and no sampling/cloud/remote scope was introduced.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Track file identity and dirty state only in UI state. | Users need orientation, but the project schema and file format should not change. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for project file identity and unsaved edit visibility. |
| 2026-06-16 | harness_builder | Added UI-local file identity and unsaved edit state to the project safety readout without changing project file serialization. |
| 2026-06-16 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `git diff --check`, `npm run verify`, and local browser smoke. |
| 2026-06-16 | review_judge | Reviewed scope boundaries; no schema, cloud, autosave, sampling, playback, export, snapshot, or command behavior changes found. |

## Completion Notes

- The command-strip project safety readout now shows durable current-file identity after save/open and switches to unsaved-edit posture after subsequent project edits.
- Local draft recovery remains renderer-local and still uses explicit Restore Draft and Clear Draft controls.
- File identity and dirty state are UI-only app state; they are not written into `.grooveforge.json`.
