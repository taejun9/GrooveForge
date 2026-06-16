# plan-127-note-clipboard

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add a selected-note clipboard for 808 and Synth notes so users can copy the selected note's musical shape and paste it to the next available step. The feature should speed up bass/melody drafting for working producers while giving beginners a simple repeat/variation tool without requiring a full piano roll rewrite.

## Non-Goals

- Do not add multi-select, drag selection, system clipboard integration, MIDI recording, audio recording, imported audio, sampling, plugin hosting, remote AI, accounts, analytics, cloud sync, or hidden generation.
- Do not create new project schema; the clipboard should be UI-local and not saved in project files.
- Do not change playback/export semantics beyond explicit user edits to existing Pattern A/B/C note data.
- Do not replace existing selected-note move, transpose, octave, or duplicate controls.

## Context Map

- `src/ui/App.tsx`: selected note state, note move/duplicate handlers, Note Inspector UI, keyboard capture state, test ids.
- `src/styles.css`: note inspector button layout.
- `docs/product/product.md`, `README.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`: product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-127-note-clipboard` and `.worktree/plan-127-note-clipboard`.
- Clipboard actions must be explicit-click, local, deterministic, undoable for paste, and sample-free.

## Implementation Plan

- [x] Inspect selected-note editing, duplicate, and Note Inspector flows.
- [x] Add UI-local clipboard state for copied 808/Synth note attributes.
- [x] Add Copy and Paste controls to Note Inspector without disrupting existing move/duplicate controls.
- [x] Paste copied note into the selected Pattern A/B/C at the next empty step for the copied track.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA, verify, browser smoke, and review.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke:
  - Select an 808 or Synth note.
  - Copy selected note enables Paste and shows clipboard detail.
  - Paste creates a note in the same track at the next available step, selects it, and enables Undo.
  - Existing note move/transpose/octave/duplicate controls still render.
  - Console errors stay empty and 1180px viewport has no horizontal overflow.

## Review Plan

QA completes before review starts. Review checks clipboard state is UI-local, paste is an undoable explicit note edit, copied note shape remains manually editable afterward, no project-file schema changes occur, playback/export semantics stay on existing note data, and no sampling/remote scope is introduced.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add selected-note clipboard before multi-select piano-roll editing. | It addresses a known note-editing speed gap with low schema and layout risk while moving toward a practical composer workflow. |
| 2026-06-16 | Keep copied notes in UI-local state and make paste the only project mutation. | Copy should not create history or schema drift; pasted notes are explicit editable Pattern A/B/C note events and stay undoable through the existing project update path. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-127 branch and worktree from latest `main`. |
| 2026-06-16 | 제작 | Added selected-note clipboard state, Copy/Paste Note Inspector controls, and same-track next-empty-step paste behavior for 808 and Synth notes. |
| 2026-06-16 | 정리 | Updated README, product docs, quality rules, and QA expectations for selected-note copy/paste while preserving the direct beat-production and optional-sampling boundary. |
| 2026-06-16 | 검증 | `npm run qa`, `npm run verify`, `git diff --check`, and browser smoke passed. Browser smoke selected `808 F1 step 1`, copied it, pasted `808 F1 step 2`, confirmed Undo enabled, no console errors, and no 1180px horizontal overflow. |
| 2026-06-16 | 심사 | Reviewed UI-local clipboard state, undoable paste path, selected Pattern A/B/C scope, preserved note shape fields, no schema changes, no playback/export semantic drift, no sampling scope, and layout risk. |

## Completion Notes

Completed. Selected 808 and Synth notes now have a UI-local clipboard in Studio mode. Copy stores the selected note shape without creating history or project schema data; Paste adds that shape to the copied track's next empty step through the existing undoable Pattern A/B/C update path, selects the pasted note, and keeps the result manually editable.
