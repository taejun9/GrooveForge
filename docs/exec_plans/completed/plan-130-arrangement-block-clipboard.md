# plan-130-arrangement-block-clipboard

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add a selected-arrangement-block clipboard so users can copy a block's section, Pattern A/B/C assignment, bar length, energy, and muted-track shape, then paste it after the currently selected block. This should make song-form sketching faster for producers while giving beginners an obvious way to repeat and vary sections without rebuilding every block field.

## Non-Goals

- Do not add multi-block selection, drag reordering, system clipboard integration, audio recording, imported audio, sampling, plugin hosting, remote AI, accounts, analytics, cloud sync, or hidden generation.
- Do not create new project schema; the arrangement block clipboard should be UI-local and not saved in project files.
- Do not mutate Pattern A/B/C musical event data when copying or pasting arrangement blocks.
- Do not change realtime playback, WAV/stem export, MIDI export, or Handoff semantics beyond the explicit arrangement edit.

## Context Map

- `src/ui/App.tsx`: arrangement block selection, duplicate/move/delete/split/merge handlers, Arrangement panel UI, test ids.
- `src/styles.css`: arrangement controls layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`: product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-130-arrangement-block-clipboard` and `.worktree/plan-130-arrangement-block-clipboard`.
- Clipboard actions must be explicit-click, local, deterministic, undoable for paste, and sample-free.

## Implementation Plan

- [x] Inspect selected arrangement block edit, duplicate, split, merge, and panel flows.
- [x] Add UI-local clipboard state for copied arrangement block fields.
- [x] Add Copy Block and Paste After controls plus clipboard detail to the Arrangement panel.
- [x] Paste copied block after the selected block, select the pasted block, and align selected Pattern A/B/C.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA, verify, local HTTP smoke, and review. Browser click smoke was attempted but the in-app Browser backend was unavailable.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke:
  - Switch to Studio mode and select an existing arrangement block.
  - Copy selected block enables Paste After and shows clipboard detail.
  - Paste After creates a new block after the selected block, selects it, aligns Pattern A/B/C, and enables Undo.
  - Existing arrangement template, focus, arc, duplicate, move, delete, split, merge, and mute controls still render.
  - Console errors stay empty and 1180px viewport has no horizontal overflow.

## Review Plan

QA completes before review starts. Review checks clipboard state is UI-local, paste is an undoable explicit arrangement edit, Pattern A/B/C musical data is unchanged, pasted block fields remain manually editable afterward, no project-file schema changes occur, playback/export semantics stay arrangement-driven, and no sampling/remote scope is introduced.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add selected-arrangement-block clipboard after note, drum-hit, and chord clipboards. | Song-form editing has the same repeatable-shape gap; filling it improves the direct beat-production workflow without schema risk. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-130 branch and worktree from latest `main`. |
| 2026-06-16 | repo_cartographer | Confirmed arrangement duplicate, split, merge, move, delete, and selected-block update flows already route through undoable project updates and keep selected Pattern A/B/C aligned. |
| 2026-06-16 | harness_builder | Added UI-local arrangement block clipboard state, Copy Block/Paste After controls, clipboard detail, docs, quality rules, and static QA expectations without project schema or sampling scope changes. |
| 2026-06-16 | quality_runner | `npm run qa`, `npm run verify`, and `git diff --check` passed. Local dev server responded `200 text/html` on `127.0.0.1:5196`. In-app Browser click smoke could not complete because `agent.browsers.list()` returned `[]` after the browser pipe closed. |
| 2026-06-16 | review_judge | Reviewed diff after QA: clipboard remains UI-local, paste is explicit and undoable through existing project history, pasted block fields remain editable, Pattern A/B/C musical events are unchanged, and playback/export/sampling boundaries are unchanged. |
