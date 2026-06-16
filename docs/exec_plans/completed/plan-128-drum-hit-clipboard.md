# plan-128-drum-hit-clipboard

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add a selected-drum-hit clipboard so users can copy one active drum hit's lane, velocity, chance, microtiming, and hat-repeat shape, then paste it to the next empty step in the same lane. This should speed up practical drum programming for working producers while giving beginners a safe way to repeat groove details without manually recreating each value.

## Non-Goals

- Do not add multi-select, drag selection, system clipboard integration, MIDI recording, audio recording, imported audio, sampling, plugin hosting, remote AI, accounts, analytics, cloud sync, or hidden generation.
- Do not create new project schema; the drum clipboard should be UI-local and not saved in project files.
- Do not change playback/export semantics beyond explicit user edits to existing Pattern A/B/C drum data.
- Do not replace existing drum velocity, chance, timing, hat-repeat, groove, foundation, or accent controls.

## Context Map

- `src/ui/App.tsx`: selected drum state, drum grid, drum inspector UI, drum update handlers, test ids.
- `src/styles.css`: drum inspector/control layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`: product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-128-drum-hit-clipboard` and `.worktree/plan-128-drum-hit-clipboard`.
- Clipboard actions must be explicit-click, local, deterministic, undoable for paste, and sample-free.

## Implementation Plan

- [x] Inspect selected drum edit and Drum Step Inspector flows.
- [x] Add UI-local clipboard state for copied active drum hit attributes.
- [x] Add Copy and Paste controls plus clipboard detail to Drum Step Inspector.
- [x] Paste copied hit into the selected Pattern A/B/C at the next empty step in the copied lane.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA, verify, browser smoke, and review.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke:
  - Switch to Studio mode and select an active drum step.
  - Copy selected hit enables Paste and shows clipboard detail.
  - Paste creates a hit in the same lane at the next available empty step, selects it, and enables Undo.
  - Existing velocity, chance, timing, hat-repeat, groove, foundation, and accent controls still render.
  - Console errors stay empty and 1180px viewport has no horizontal overflow.

## Review Plan

QA completes before review starts. Review checks clipboard state is UI-local, paste is an undoable explicit drum edit, copied hit shape remains manually editable afterward, no project-file schema changes occur, playback/export semantics stay on existing drum data, and no sampling/remote scope is introduced.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add selected-drum-hit clipboard after selected-note clipboard. | Drum programming needs the same repeatable edit speed for velocity/chance/timing/roll details while staying lower risk than multi-select or a full piano-roll rewrite. |
| 2026-06-16 | Keep copied drum hits in UI-local state and make paste the only project mutation. | Copy should not create history or schema drift; pasted hits are explicit editable Pattern A/B/C drum events and stay undoable through the existing project update path. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-128 branch and worktree from latest `main`. |
| 2026-06-16 | 제작 | Added selected-drum-hit clipboard state, Copy/Paste Drum Step Inspector controls, and same-lane next-empty-step paste behavior for drum hits. |
| 2026-06-16 | 정리 | Updated README, product docs, quality rules, and QA expectations for selected-drum copy/paste while preserving the direct beat-production and optional-sampling boundary. |
| 2026-06-16 | 검증 | `npm run qa`, `npm run verify`, `git diff --check`, and browser smoke passed. Browser smoke selected `Kick step 1`, copied it, pasted `Kick step 2`, confirmed Undo enabled, no console errors, and no 1180px horizontal overflow. |
| 2026-06-16 | 심사 | Reviewed UI-local clipboard state, undoable paste path, selected Pattern A/B/C scope, preserved drum hit fields, no schema changes, no playback/export semantic drift, no sampling scope, and layout risk. |

## Completion Notes

Completed. Selected active drum hits now have a UI-local clipboard in the Drum Step Inspector. Copy stores lane, step, velocity, chance, timing, and hat-repeat shape without creating history or project schema data; Paste adds that shape to the copied lane's next empty step through the existing undoable Pattern A/B/C update path, selects the pasted hit, and keeps the result manually editable.
