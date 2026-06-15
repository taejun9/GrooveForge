# plan-048-arrangement-merge

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱으로 완성시켜줘.

## Goal

Add an arrangement merge workflow so users can combine the selected block with the next block after experimenting with splits, drops, or short section edits. Merging must preserve total arrangement bars, keep the selected block's musical metadata as the merged block identity, remain undoable, avoid mutating Pattern A/B/C event data, and keep playback/export behavior driven by the resulting arrangement structure.

## Non-Goals

- No multi-select timeline editing, drag merge gestures, audio clip merging, sampling, waveform editing, or automation merging.
- No merge across blocks when the resulting block would exceed the bounded per-block bar limit.
- No mutation of Pattern A/B/C musical events.

## Context Map

- `src/ui/App.tsx`: arrangement editor state and structure actions.
- `src/domain/workstation.ts`: arrangement block type, `maxArrangementBars`, bar normalization, arrangement total bars.
- `src/audio/render.ts`, `src/audio/scheduler.ts`, `src/audio/midi.ts`: already follow arrangement block data.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA framing.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-048-arrangement-merge` and `.worktree/plan-048-arrangement-merge` for git repository work.
- Merge work must remain arrangement-structure editing over local project data, not audio or sampling work.

## Implementation Plan

- [x] Add an undoable merge-with-next action bounded by `maxArrangementBars`.
- [x] Add beginner-readable Merge control to the selected arrangement block editor with safe disabled states.
- [x] Keep selection aligned to the merged block and clear stale drum/note selection.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test: passed. Split changed the default full-beat arrangement from 8 blocks / 26 bars to 9 blocks / 26 bars with the second Intro block selected. Merge combined that selected Intro 1-bar block with the next Verse 4-bar block into a selected `IntroA5 bars` block, returning to 8 blocks / 26 bars. Undo restored 9 blocks / 26 bars, Redo remained available, Play/Stop worked, and console errors were empty.

## Review Plan

QA completes before review starts. Review checks that merging preserves total bars, keeps selected-block metadata, stays bounded, remains undoable, does not mutate Pattern A/B/C data, does not regress export semantics, and does not introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Merge the selected block with the next block using the selected block's metadata. | It gives a predictable inverse to split while avoiding ambiguous metadata conflicts between two arrangement blocks. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created to complete the split/merge arrangement editing pair without touching audio clips or sampling workflows. |
| 2026-06-15 | harness_builder | Added merge-with-next arrangement editing, Merge UI, docs, and static QA expectations. |
| 2026-06-15 | quality_runner | Ran typecheck, QA, quality gate, verify, diff whitespace check, and Browser split/merge/undo/play smoke. |
| 2026-06-15 | review_judge | Reviewed scope against arrangement-structure, undoability, export-semantics, and beat-first boundaries. |

## Completion Notes

Arrangement merge is implemented as an undoable selected-block action bounded by the existing max per-block bar limit. It preserves total arrangement bars, keeps selected-block section, Pattern A/B/C, energy, and muted-track identity, clears stale note/drum selection, and leaves Pattern A/B/C event data untouched. Docs and static QA now describe split/merge arrangement controls while keeping sampling out of the core workflow.
