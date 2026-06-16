# plan-129-chord-clipboard

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add a selected-chord clipboard so users can copy one chord event's root, quality, inversion, length, velocity, and chance shape, then paste it to the next empty chord step. This should speed up harmonic sketching for working producers while giving beginners a simple way to repeat and vary chord movement without manually recreating each field.

## Non-Goals

- Do not add multi-select, drag selection, system clipboard integration, MIDI recording, audio recording, imported audio, sampling, plugin hosting, remote AI, accounts, analytics, cloud sync, or hidden generation.
- Do not create new project schema; the chord clipboard should be UI-local and not saved in project files.
- Do not change playback/export semantics beyond explicit user edits to existing Pattern A/B/C chord event data.
- Do not replace existing chord add/delete, move, duplicate, inversion, rhythm, voicing, or progression controls.

## Context Map

- `src/ui/App.tsx`: selected chord state, chord update/duplicate handlers, Chord Editor UI, test ids.
- `src/styles.css`: Chord Editor button layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`: product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-129-chord-clipboard` and `.worktree/plan-129-chord-clipboard`.
- Clipboard actions must be explicit-click, local, deterministic, undoable for paste, and sample-free.

## Implementation Plan

- [x] Inspect selected chord edit, duplicate, and Chord Editor flows.
- [x] Add UI-local clipboard state for copied chord event attributes.
- [x] Add Copy and Paste controls plus clipboard detail to Chord Editor.
- [x] Paste copied chord into the selected Pattern A/B/C at the next empty chord step.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA, verify, browser smoke, and review.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke:
  - Switch to Studio mode and select an existing chord event.
  - Copy selected chord enables Paste and shows clipboard detail.
  - Paste creates a chord at the next available empty chord step, selects it, and enables Undo.
  - Existing chord add/delete/move/duplicate/inversion/rhythm/voicing controls still render.
  - Console errors stay empty and 1180px viewport has no horizontal overflow.

## Review Plan

QA completes before review starts. Review checks clipboard state is UI-local, paste is an undoable explicit chord edit, copied chord shape remains manually editable afterward, no project-file schema changes occur, playback/export semantics stay on existing chord event data, and no sampling/remote scope is introduced.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add selected-chord clipboard after selected note and drum hit clipboards. | Harmony editing now has the same repeatable shape-copy gap; filling it improves the core beat-composition loop without schema risk. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-129 branch and worktree from latest `main`. |
| 2026-06-16 | repo_cartographer | Confirmed selected chord duplicate/move/edit flows already use sorted chord events, `nextEmptyChordStep`, and undoable current-pattern updates. |
| 2026-06-16 | harness_builder | Added UI-local chord clipboard state, Copy/Paste controls, clipboard detail, docs, and QA expectations without saved schema or sampling scope changes. |
| 2026-06-16 | quality_runner | `npm run qa`, `npm run verify`, and `git diff --check` passed. Browser smoke at 1180px showed copy enables Paste, keyboard Paste adds/selects a pasted chord, Undo remains enabled, console errors are empty, and horizontal overflow is false. |
| 2026-06-16 | review_judge | Reviewed diff after QA: clipboard remains UI-local, paste is explicit and undoable through existing pattern history, copied chord fields remain editable event data, and playback/export/sampling boundaries are unchanged. |
