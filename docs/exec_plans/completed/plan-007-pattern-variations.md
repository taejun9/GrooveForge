# plan-007-pattern-variations

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop app that can satisfy working composers while staying easy for first-time composers.

## Goal

Make Pattern A/B/C real editable pattern data and make arrangement/export use those pattern variations instead of repeating one global loop.

## Non-Goals

- Add full timeline drag editing, clips, or multi-track recording.
- Add sampling, audio import, or sampler tracks.
- Add cloud sync, accounts, or collaboration.
- Replace the realtime scheduler.

## Requirements

- Drum, 808, and melody edits are stored per Pattern A/B/C.
- Switching Pattern A/B/C changes the editable notes and drum hits without losing the other patterns.
- Realtime playback previews the selected pattern.
- WAV export follows the 8-block arrangement and uses each block's pattern.
- Saved project files preserve pattern variations.
- Older single-pattern project files can still load without losing their previous sound.

## Context Map

- `src/domain/workstation.ts`: project model, starter pattern data, project-file validation/migration.
- `src/ui/App.tsx`: pattern tab switching and per-pattern editing.
- `src/audio/scheduler.ts`: realtime selected-pattern playback.
- `src/audio/render.ts`: arrangement-aware offline export.
- `harness/scripts/run_qa.py`: static checks for pattern variation support.

## Constraints

- QA and review are separate loops.
- Do not create or use `docs/plan`.
- Keep sampling as an optional extension.
- No real user audio or copyrighted fixtures.

## Implementation Plan

- [x] Create task worktree and active plan.
- [x] Add `PatternData` and `patterns` to the project model.
- [x] Add legacy single-pattern project migration.
- [x] Update UI edits to target the selected pattern.
- [x] Update realtime preview and offline export to read pattern data.
- [x] Update docs and QA expectations.
- [x] Run validation and browser interaction checks.
- [x] Complete plan and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`: passed.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run verify`: passed.
- Browser interaction check: passed. Pattern B edit increased only B's event count, switching back to A showed the added note was absent, returning to B showed the note persisted, selected-pattern playback ran, and no browser console errors were reported.

## Review Plan

QA completed before review. Review mirror is recorded in `docs/reviews/plan-007-pattern-variations-review.md`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Implement pattern variations before deeper arrangement UI. | Arrangement blocks are only musically meaningful when patterns are independent data. |
| 2026-06-15 | Export follows arrangement pattern assignments, while realtime preview follows the selected pattern. | This keeps the editor fast while making rendered results song-structure aware. |
| 2026-06-15 | Migrate older single-pattern project files by cloning their one loop into A/B/C. | Old files previously sounded the same for every block, so cloning preserves prior behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Opened plan for real Pattern A/B/C variations and arrangement-aware export. |
| 2026-06-15 | harness_builder | Added pattern data model, legacy migration, selected-pattern UI editing, and arrangement-aware export. |
| 2026-06-15 | quality_runner | Ran static QA, quality gate, typecheck, build, verify, and browser interaction checks. |
| 2026-06-15 | review_judge | Created review mirror with no blocking findings. |

## Completion Notes

Pattern A/B/C are now independent editable event stores for drums, 808, and melody. Realtime playback previews the selected pattern, and WAV export follows the arrangement blocks' Pattern A/B/C assignments. Existing single-pattern project files migrate by cloning their prior loop into A/B/C.
