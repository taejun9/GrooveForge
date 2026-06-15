# plan-017-undo-history

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 현직 작곡가도 만족할 수 있고, 작곡을 처음 해보는 사람도 사용하기 쉬운 데스크탑 앱으로 완성시켜줘.

## Goal

Add undo/redo history for project-editing actions so beginners can experiment without fear and working beatmakers can move quickly through pattern, arrangement, mixer, sound, and master edits. Expose the feature through toolbar buttons and standard keyboard shortcuts.

## Non-Goals

- No sampling, audio import, chopping, sampler tracks, or audio warping.
- No multi-document history, cloud sync, collaboration, or autosave.
- No full command palette or macro recorder.

## Context Map

- `src/ui/App.tsx`: project state, edit handlers, toolbar commands, keyboard handling.
- `src/styles.css`: toolbar button disabled/compact states.
- `README.md`: current workstation surface.
- `docs/product/product.md`: MVP capabilities and beginner/pro workflow.
- `docs/quality/rules.md`: QA gate for edit history behavior.
- `harness/scripts/run_qa.py`: static checks for undo/redo support.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-017-undo-history` and `.worktree/plan-017-undo-history` for git repository work.
- Preserve the composition-first invariant: edit history stores local project state for musical events, instruments, arrangement, mixer, master, and project metadata.

## Implementation Plan

- [x] Add bounded undo/redo stacks around project-editing updates.
- [x] Convert direct project mutations that should be undoable to the shared edit wrapper.
- [x] Add toolbar undo/redo buttons with disabled states and status messages.
- [x] Add standard keyboard shortcuts: Ctrl/Cmd+Z for undo, Ctrl/Cmd+Shift+Z and Ctrl+Y for redo, while ignoring editable fields.
- [x] Update docs and static QA expectations.
- [x] Verify with automated QA and browser interaction.

## QA Plan

- `python3 harness/scripts/run_qa.py`
  - Passed.
- `python3 harness/scripts/run_quality_gate.py`
  - Passed.
- `npm run typecheck`
  - Passed.
- `npm run build`
  - Passed.
- `npm run qa`
  - Passed.
- `npm run verify`
  - Passed.
- Browser check at the local Vite app:
  - Passed. Initial Undo/Redo buttons were disabled, toggling Kick step 2 changed Pattern A from 31 to 32 events, Undo and Redo buttons restored and reapplied that edit, Ctrl+Z and Ctrl+Y did the same, focused Title input did not trigger project undo, toolbar buttons did not overflow, and no browser console errors were reported.

## Review Plan

QA completes before review starts. Review checks that history is local, bounded, not sampling-oriented, does not record playback/export side effects, and protects destructive edits such as pattern clear.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Add project-level undo/redo before deeper destructive editing. | Plan 016 introduced pattern clear; undo/redo makes experimentation safer for beginners and faster for working producers. |
| 2026-06-15 | Keep history in memory for this plan. | The current product already has explicit save/load; persistent history can be considered later after local file behavior is stable. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created for edit history. |
| 2026-06-15 | harness_builder | Added bounded project undo/redo history, toolbar buttons, keyboard shortcuts, docs, and QA expectations. |
| 2026-06-15 | quality_runner | Ran automated checks and browser undo/redo verification. |

## Completion Notes

GrooveForge now has bounded local undo/redo history for project-editing actions. The toolbar exposes Undo and Redo buttons, standard Ctrl/Cmd+Z and Ctrl+Y/Ctrl/Cmd+Shift+Z shortcuts work outside focused inputs, and loading another project clears the in-memory history. Playback and export actions remain side-effect commands rather than history entries.
