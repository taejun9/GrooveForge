# plan-009-arrangement-editor

## Goal

Make arrangement blocks editable so GrooveForge can move beyond a static loop display toward a song-structure workflow for beginners and working beatmakers.

## Context

Pattern A/B/C are now independent editable data stores, and WAV export already follows arrangement pattern assignments. The previous arrangement UI rendered fixed buttons without editing controls, which blocked users from choosing where variations appear in the song structure.

## Scope

- Added reusable arrangement section constants and types to the domain model.
- Let users select an arrangement block in the UI.
- Let users edit the selected block's section, Pattern A/B/C assignment, and energy.
- Kept the selected pattern editor in sync when an arrangement block is selected or reassigned.
- Preserved save/load/export compatibility through the existing `ProjectState.arrangement` data.
- Added QA expectations and docs for arrangement editing.

## Out Of Scope

- No timeline drag-and-drop.
- No block add/remove/duplicate/split/mute controls.
- No automated WAV content comparison.
- No stem export or mixer/master implementation changes.

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
  - Passed. Selected Block 3, changed its section to Bridge, changed its pattern assignment to Pattern C, changed energy to 42%, confirmed the pattern editor selected Pattern C, started playback, stopped playback, and observed no browser console errors.

## Checklist

- [x] Add arrangement section constants/types.
- [x] Implement arrangement block selection and edit controls.
- [x] Update styles for selected block and editor controls.
- [x] Update docs and QA expectations.
- [x] Run validation and browser check.
- [x] Move plan to completed and create review mirror.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-15 | Implement section, pattern, and energy editing before drag-and-drop timeline editing. | These controls make the existing arrangement data user-editable with low risk and directly connect Pattern A/B/C variations to song structure. |
| 2026-06-15 | Add a numeric energy input next to the slider. | It improves precision for working producers and makes automated/browser validation of energy changes reliable. |

## Activity Log

| Date | Role | Note |
|---|---|---|
| 2026-06-15 | project_lead | Confirmed arrangement editing as the next concrete step toward a usable beat workstation. |
| 2026-06-15 | harness_builder | Added domain constants, UI selection, section/pattern/energy controls, and stable test IDs. |
| 2026-06-15 | quality_runner | Ran QA, typecheck, verify, diff check, and Browser validation successfully. |
| 2026-06-15 | review_judge | Reviewed residual risks and documented follow-ups. |
