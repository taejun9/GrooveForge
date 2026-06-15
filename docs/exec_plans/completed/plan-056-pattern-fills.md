# plan-056-pattern-fills

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add deterministic Pattern Fill tools that help users create usable last-bar transitions in the selected Pattern A/B/C without sampling or remote generation. Beginners should get one-click drum, 808, and melody movement near the end of a loop; working producers should get editable event data they can refine, undo, arrange, mix, export, and hand off.

## Non-Goals

- No sampling, audio import, chopping, sampler tracks, audio warping, plugin hosting, MIDI input, or recording.
- No remote AI, generated audio services, hidden randomness, or hidden audio assets.
- No new pattern slots, arrangement automation, or full piano-roll redesign.
- No destructive changes outside the selected Pattern A/B/C slot.

## Context Map

- `src/domain/workstation.ts`: Pattern data model, Pattern variation helpers, note/chord/drum helpers, labels, and normalization.
- `src/ui/App.tsx`: Pattern tool UI, selected Pattern update flow, undo/redo history, status messages, and test IDs.
- `src/styles.css`: Pattern tool layout and responsive controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product framing and QA guardrails.
- `harness/scripts/run_qa.py`: static expectations for domain/UI/docs.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-056-pattern-fills` and `.worktree/plan-056-pattern-fills` for git repository work.
- Pattern Fill work must remain direct-composition, deterministic, selected-pattern scoped, undoable, editable, and sample-free.

## Implementation Plan

- [x] Add Pattern Fill preset ids, labels, and a domain helper that mutates only the selected Pattern clone.
- [x] Provide drum fill, 808 pickup, melody turn, and clear-tail presets over the tail of the selected 16-step pattern.
- [x] Add Pattern Fill controls to the Pattern panel with stable test IDs and no layout overflow.
- [x] Update product docs, quality rules, and static QA expectations.
- [x] Run automated validation and browser smoke tests.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`
- Browser smoke test over the dev server: Pattern Fill buttons render, a fill changes selected Pattern data, clear-tail removes tail events, undo/redo remains available, Play/Stop still works, and no console errors occur.

## Review Plan

QA completes before review starts. Review checks that Pattern Fill tools are deterministic, selected Pattern A/B/C scoped, undoable, editable afterward, useful for beginners and producers, preserve realtime/WAV/stem/MIDI export semantics, avoid sampling-first drift, and avoid hidden randomness/assets.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Pattern Fill tools before deeper generators or sampling. | Tail fills/pickups improve practical beat composition for both beginners and working producers while staying editable and sample-free. |
| 2026-06-16 | Keep presets deterministic and local to selected Pattern A/B/C. | This matches existing Pattern variation architecture and preserves undo/edit/export behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created after inspecting current Pattern variation and Pattern tool structure. |
| 2026-06-16 | harness_builder | Added deterministic Pattern Fill presets, UI controls, docs, and static QA expectations. |
| 2026-06-16 | quality_runner | `python3 harness/scripts/run_qa.py`, `npm run typecheck`, and `git diff --check` passed. |
| 2026-06-16 | quality_runner | Browser smoke passed on `http://127.0.0.1:5174/`: fill buttons rendered, no overflow, Drum Fill changed Pattern A from 34 to 40 events, Clear Tail cleared tail drum steps, undo/redo worked, 808 Pickup and Melody Turn applied, Play/Stop worked, and console errors were empty. |
| 2026-06-16 | quality_runner | `python3 harness/scripts/run_quality_gate.py`, `npm run qa`, and `npm run verify` passed. |
| 2026-06-16 | review_judge | Reviewed selected-pattern scope, deterministic local event edits, undo/redo behavior, layout constraints, export-path preservation, and sampling boundary. |
| 2026-06-16 | plan_keeper | Moved the plan to completed and created the review mirror. |

## Completion Notes

Completed. Pattern Fill tools now provide Drum Fill, 808 Pickup, Melody Turn, and Clear Tail actions for the selected Pattern A/B/C. The work stays deterministic, undoable, editable, sample-free, and scoped to local pattern event data.
