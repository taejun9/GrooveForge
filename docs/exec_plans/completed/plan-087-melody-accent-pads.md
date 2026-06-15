# plan-087-melody-accent-pads

## Status

active

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add Melody Accent Pads to the 808 / Melody editor so beginners can quickly make a generated or hand-entered Synth melody feel less flat, while working producers can reshape selected Pattern A/B/C melody-note velocity and chance with one explicit click without losing editable note events.

## Non-Goals

- No project schema fields.
- No new synthesis engine, MIDI recording, automation lanes, sample import, chopping, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No hidden generation, autoplay, background mutation, pitch mutation, length mutation, arrangement mutation, or bass/chord/drum mutation.
- No changes to realtime playback, WAV/stem export, or MIDI export semantics beyond existing paths naturally rendering edited Synth melody velocity and chance values.

## Context Map

- `src/ui/App.tsx` owns the 808 / Melody editor, Melody Motif Pads, selected Pattern A/B/C mutation path, selected-note state, note grid, and Note Inspector.
- `src/domain/workstation.ts` owns melody note shape, normalization, save/load migration, playback/export consumers, and Pattern state.
- `src/styles.css` owns compact workstation controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` keep product and QA expectations aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Melody Accent Pads must be deterministic and operate only on the selected Pattern A/B/C slot.
- Pad clicks must route through existing undoable project update paths.
- Results must keep melody note counts, steps, pitches, and lengths stable and remain editable local note data through the existing note grid and Note Inspector.

## Implementation Plan

- [x] Add Melody Accent Pad model and deterministic melody-note transformation helper.
- [x] Add undoable Melody Accent Pad application to selected Pattern melody-note velocity and chance data.
- [x] Add a compact Melody Accent Pads row near Melody Motif Pads in the 808 / Melody editor.
- [x] Update docs and QA expectations for direct-composition Melody Accent Pads.

## Validation

- [x] `npm run typecheck`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run verify`
- [x] `npm run qa`
- [x] `git diff --check`
- [x] Browser smoke: clicked Pulse Melody Accent Pad, confirmed selected Pattern Synth note count stayed 5, chance badges changed 0 -> 2, selected Synth note velocity readout changed to `0.82`, Undo restored the prior visible Synth note/chance state, console errors were empty, and no horizontal overflow was present.

## Review Plan

QA completes before review starts. Review checks that Melody Accent Pads are local, deterministic, explicit-click, undoable, editable melody-note transformations and do not introduce sampling-first, hidden generation, remote AI, pitch/arrangement mutation, or export regressions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Melody Accent Pads after 808 Glide Pads. | Drums and 808 now have quick feel controls; Synth melody still needs a fast velocity/chance shaping tool that improves beginner results and producer sketch speed. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-087 from clean main after plan-086. |
| 2026-06-16 | harness_builder | Added Melody Accent Pads model, selected-Pattern undoable handler, UI panel, styles, docs, and QA expectations. |
| 2026-06-16 | quality_runner | Ran typecheck, static QA, verify, npm QA, diff check, and browser smoke. |
| 2026-06-16 | review_judge | Reviewed Melody Accent Pads as local, deterministic, explicit-click selected-Pattern melody velocity/chance edits with no sampling-first scope expansion or export-path regression. |

## Completion Notes

Melody Accent Pads are complete for plan-087. The 808 / Melody editor now has Soft, Lead, Pulse, and Fade pads that reshape selected Pattern A/B/C Synth melody velocity and chance while keeping note counts, steps, pitches, lengths, and manual editability stable. Product docs and QA rules now describe the direct-composition workflow, and validation plus browser smoke passed.
