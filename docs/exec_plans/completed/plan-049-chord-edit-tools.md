# plan-049-chord-edit-tools

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱으로 완성시켜줘.

## Goal

Add selected-chord editing tools so users can quickly move, duplicate, and invert chord events inside the selected Pattern A/B/C slot. The workflow should preserve chord timing, length, velocity, chance, root, and quality unless the user explicitly changes them, stay scale-aware, remain undoable, avoid overlap surprises, and keep playback/export driven by editable musical event data.

## Non-Goals

- No full piano roll, multi-select chord editing, drag gestures, MIDI input, plugin hosting, sampling, or audio clip workflow.
- No AI chord generation or remote calls.
- No mutation of other Pattern A/B/C slots when editing the selected pattern.

## Context Map

- `src/ui/App.tsx`: chord editor state, selected note tools, and project update helpers.
- `src/domain/workstation.ts`: chord event data, scale helpers, chord inversion labels, and pattern cloning.
- `src/audio/scheduler.ts`, `src/audio/render.ts`, `src/audio/midi.ts`: consume chord events for realtime, WAV/stem, and MIDI output.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA framing.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-049-chord-edit-tools` and `.worktree/plan-049-chord-edit-tools`.
- Preserve the beat-first product boundary: chord tools are direct composition data, not sampling.

## Implementation Plan

- [x] Add selected chord state that stays valid across Pattern A/B/C and chord count changes.
- [x] Make chord cards selectable and expose move, duplicate, and inversion-step actions for the selected chord.
- [x] Keep chord edits undoable, pattern-scoped, scale-aware, and overlap-safe.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test: passed. The first Pattern A chord moved from step 1 to step 2, duplicated to step 3, and the duplicate changed to 1st inversion. Pattern B remained at its original 4 chord events. Undo/redo restored/reapplied chord edit state, Delete removed the selected chord and Undo restored it, Play/Stop worked, and console errors were empty.

## Review Plan

QA completes before review starts. Review checks that selected-chord tools are scoped to the selected Pattern A/B/C slot, preserve event fields, avoid overlapping duplicate chord starts, remain undoable, do not regress realtime/WAV/stem/MIDI export semantics, and do not introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Add explicit chord edit buttons instead of drag editing. | Buttons are lower-risk in the current compact editor, approachable for beginners, and still fast enough for producer chord sketching. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created to improve harmonic editing speed without expanding into full piano-roll or sampling scope. |
| 2026-06-15 | harness_builder | Added selected-chord state, chord move/duplicate/inversion tools, delete-key support, docs, and static QA expectations. |
| 2026-06-15 | quality_runner | Ran typecheck, QA, quality gate, verify, diff whitespace check, and Browser chord edit smoke. |
| 2026-06-15 | review_judge | Reviewed selected-chord scope, undoability, overlap protection, export semantics, and beat-first boundary. |

## Completion Notes

Selected chord editing is implemented for the selected Pattern A/B/C slot. Chord cards are selectable, move step left/right actions avoid occupied chord starts, duplicate finds the next empty step, inversion tools preserve the same editable event data model, and Delete removes the selected chord while preserving at least one chord event. Docs and static QA now cover selected-chord move/duplicate/inversion tools.
