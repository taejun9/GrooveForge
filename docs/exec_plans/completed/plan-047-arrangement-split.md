# plan-047-arrangement-split

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱으로 완성시켜줘.

## Goal

Add an arrangement block split workflow so users can quickly turn a long section into editable smaller sections for drops, fills, bridges, and hook variations. Splitting must preserve Pattern A/B/C assignment, section label, energy, track mutes, undo/redo behavior, selected-block alignment, arrangement playback/export length, and the beat-workstation direction.

## Non-Goals

- No timeline drag-and-drop rewrite, audio clip splitting, sampling, waveform editing, automation lanes, or multi-select editing.
- No change to Pattern A/B/C event data when splitting arrangement blocks.
- No change to WAV/stem/MIDI export semantics beyond following the newly split arrangement structure.

## Context Map

- `src/ui/App.tsx`: arrangement editor state and structure actions.
- `src/domain/workstation.ts`: arrangement block type, bar normalization, arrangement total bars.
- `src/audio/render.ts`, `src/audio/scheduler.ts`, `src/audio/midi.ts`: already follow arrangement block data.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA framing.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-047-arrangement-split` and `.worktree/plan-047-arrangement-split` for git repository work.
- Split work must remain arrangement-structure editing over local project data, not audio or sampling work.

## Implementation Plan

- [x] Add selected-block split state and an undoable split action bounded by the selected block's bar count.
- [x] Add beginner-readable split controls to the selected arrangement block editor.
- [x] Keep selection aligned to the newly created second block and clear stale drum/note selection.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- [x] `npm run typecheck`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `python3 harness/scripts/run_quality_gate.py`
- [x] `npm run verify`
- [x] `git diff --check`
- [x] Browser smoke test: split the selected 2-bar Intro block into two 1-bar Intro blocks, confirmed block count changed from 8 to 9, total bars stayed 26, the new second block was selected, Undo restored 8 blocks / 26 bars with Redo enabled, playback still starts/stops, and console errors are empty.

## Review Plan

QA completes before review starts. Review checks that splitting preserves block musical metadata, keeps Pattern A/B/C data unchanged, remains undoable, keeps arrangement length stable, does not regress export semantics, and does not introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Add explicit split-after control instead of only a half-split button. | Working producers need precise section cuts, while beginners still get bounded numeric input and disabled states. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created to improve arrangement editing speed without touching audio clips or sampling workflows. |
| 2026-06-15 | harness_builder | Added split-after state, bounded split action, Split UI, and action layout support. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for arrangement split controls. |
| 2026-06-15 | quality_runner | Ran typecheck, QA, quality gate, verify/build, diff check, and Browser smoke. |
| 2026-06-15 | review_judge | Reviewed split behavior for arrangement length preservation, metadata preservation, undoability, and sample-free scope. |

## Completion Notes

Implemented arrangement block split controls. The selected block can be split after a bounded bar count; the action preserves section, Pattern A/B/C assignment, energy, muted tracks, and total arrangement bars, selects the newly created second block, clears stale drum/note selection, and uses normal undoable project history. Realtime playback, WAV/stem export, and MIDI export already follow the resulting arrangement block structure.
