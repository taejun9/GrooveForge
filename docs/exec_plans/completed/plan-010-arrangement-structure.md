# plan-010-arrangement-structure

## Goal

Let users shape the arrangement timeline itself by duplicating, moving, and deleting blocks, and make WAV export follow the resulting arrangement length.

## Context

Plan 009 made each arrangement block editable. The arrangement was still effectively fixed to the starter eight blocks because users could not add, remove, or reorder sections. Working beatmakers need quick song-structure operations, and beginners need simple commands that turn patterns into a fuller track without understanding a full DAW timeline first.

## Scope

- Added selected-block structure actions: duplicate, move left, move right, and delete.
- Kept at least one arrangement block so playback/export always has a valid fallback.
- Kept selected block index and selected Pattern A/B/C aligned after each structure action.
- Updated the arrangement grid so it can display variable block counts cleanly.
- Made WAV export render the current arrangement length instead of a hard-coded 8 bars.
- Updated docs and QA expectations for arrangement structure editing.

## Out Of Scope

- No drag-and-drop timeline.
- No split-by-step, mute, or multi-select.
- No audio stem export.
- No automated WAV content comparison beyond build/static checks.

## Validation

- `python3 harness/scripts/run_qa.py`
  - Passed.
- `npm run typecheck`
  - Passed.
- `npm run verify`
  - Passed.
- `git diff --check`
  - Passed.
- Browser check against `http://127.0.0.1:5173/`
  - Passed. Selected Block 3, duplicated it, verified block count changed from 8 to 9, moved the duplicate right and left, deleted it back to 8 blocks, verified pattern editor alignment after each action, started playback, stopped playback, and observed no browser console errors.

## Checklist

- [x] Add arrangement structure actions.
- [x] Make export length follow arrangement length.
- [x] Update layout for variable block counts.
- [x] Update docs and QA expectations.
- [x] Run QA/build/browser verification.
- [x] Move plan to completed and create review mirror.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-15 | Add explicit duplicate/move/delete buttons before drag-and-drop. | Button commands are easier for beginners, faster to validate, and still useful for producers who want quick arrangement operations. |
| 2026-06-15 | Make export use `project.arrangement.length`. | If users can change arrangement length, the rendered WAV should follow the song structure rather than silently forcing eight bars. |
| 2026-06-15 | Reject empty arrangement arrays during project import validation. | The app needs at least one block so arrangement editing, playback fallback, and export duration always have a valid structure. |

## Activity Log

| Date | Role | Note |
|---|---|---|
| 2026-06-15 | project_lead | Chose arrangement structure editing as the next step toward a useful desktop beat workstation. |
| 2026-06-15 | harness_builder | Added duplicate, move, delete, variable grid layout, and arrangement-length WAV export. |
| 2026-06-15 | quality_runner | Ran QA, typecheck, verify, diff check, and Browser validation successfully. |
| 2026-06-15 | review_judge | Documented residual risks and follow-ups. |
