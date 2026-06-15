# plan-086-808-glide-pads

## Status

active

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add 808 Glide Pads to the 808 / Melody editor so beginners can quickly shape an existing 808 line into Clean, Bounce, Slide, or Hold movement with one explicit click, while working producers can quickly adjust selected Pattern A/B/C bass-note glide, length, and chance data without losing editable note events.

## Non-Goals

- No project schema fields.
- No new synthesis engine, pitch envelope controls, audio recording, sample import, chopping, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No hidden generation, autoplay, background mutation, or arrangement mutation.
- No changes to realtime playback, WAV/stem export, or MIDI export semantics beyond existing paths naturally rendering edited 808 note length, chance, and glide values.

## Context Map

- `src/ui/App.tsx` owns the 808 / Melody editor, Bassline Pads, selected Pattern A/B/C mutation path, selected-note state, note grid, and Note Inspector.
- `src/domain/workstation.ts` owns bass note shape, normalization, save/load migration, playback/export consumers, and Pattern state.
- `src/styles.css` owns compact workstation controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` keep product and QA expectations aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- 808 Glide Pads must be deterministic and operate only on the selected Pattern A/B/C slot.
- Pad clicks must route through existing undoable project update paths.
- Results must keep bass note counts and pitches stable and remain editable local note data through the existing note grid and Note Inspector.

## Implementation Plan

- [x] Add 808 Glide Pad model and deterministic bass-note transformation helper.
- [x] Add undoable 808 Glide Pad application to selected Pattern bass note length, chance, and glide data.
- [x] Add a compact 808 Glide Pads row near Bassline Pads in the 808 / Melody editor.
- [x] Update docs and QA expectations for direct-composition 808 Glide Pads.

## Validation

- [x] `npm run typecheck`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run verify`
- [x] `npm run qa`
- [x] `git diff --check`
- [x] Browser smoke: clicked Slide 808 Glide Pad, confirmed selected Pattern 808 note count stayed 4, glide count changed 1 -> 3, chance badges changed 0 -> 3, Undo restored the exact prior 808 note state, console errors were empty, and no horizontal overflow was present.

## Review Plan

QA completes before review starts. Review checks that 808 Glide Pads are local, deterministic, explicit-click, undoable, editable bass-note transformations and do not introduce sampling-first, hidden generation, remote AI, or export regressions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add 808 Glide Pads after Drum Accent Pads. | Drums now have faster velocity shaping; 808 movement is the next high-impact beginner/producer control that remains direct-composition event data. |
| 2026-06-16 | Use bass-note chance instead of velocity in this slice. | The current bass note model exposes length, glide, and probability/chance; adding velocity would require schema work that is out of scope. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-086 from main because plan-085 is already completed for product positioning. |
| 2026-06-16 | harness_builder | Added 808 Glide Pads model, selected-Pattern undoable handler, UI panel, styles, docs, and QA expectations. |
| 2026-06-16 | quality_runner | Ran typecheck, static QA, verify, npm QA, diff check, and browser smoke. |
| 2026-06-16 | review_judge | Reviewed selected-Pattern scope, note count/pitch stability, undo path, product boundary, and export-safety assumptions; no findings. |

## Completion Notes

Completed. The 808 / Melody editor now includes Clean, Bounce, Slide, and Hold 808 Glide Pads that transform only the selected Pattern A/B/C bass-note length, glide, and chance data through the existing undoable project history. Bass note counts and pitches remain stable, and results stay editable through the note grid and Note Inspector.
