# plan-080-melody-motif-pads

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add key-aware Melody Motif Pads to the 808 / Melody editor so beginners can start a usable synth melody with one explicit click and working producers can quickly sketch hook, pocket, rise, or answer motifs as editable Pattern A/B/C note data.

## Non-Goals

- No project schema fields.
- No audio recording, sample import, chopping, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No hidden generation, autoplay, or background mutation.
- No changes to realtime playback, WAV/stem export, or MIDI export semantics beyond existing paths naturally rendering the edited melody notes.

## Context Map

- `src/ui/App.tsx` owns the 808 / Melody editor, `currentPattern`, selected-note state, and selected Pattern A/B/C mutation paths.
- `src/domain/workstation.ts` owns melody note data, scale lanes, normalization, playback/export consumers, and Pattern state.
- `src/styles.css` owns compact workstation controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` keep product and QA expectations aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Melody Motif Pads must be deterministic from current key and selected Pattern data.
- Motif clicks must route through existing undoable project update paths.
- Melody notes must remain editable local musical event data.

## Implementation Plan

- [x] Add key-aware melody motif model and note-generation helper.
- [x] Add undoable Motif Pad application to the selected Pattern's Synth melody notes.
- [x] Add a compact Melody Motif Pads row in the 808 / Melody editor.
- [x] Update docs and QA expectations for direct-composition motif pads.

## QA Plan

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser smoke: click Motif Pads, confirm Synth melody event count and selected note change, undo restores the previous melody, console errors empty, and no horizontal overflow.

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Melody Motif Pads after Keyboard Capture and Chord Pads. | Beginners need a clear melodic starting point after harmony exists, and producers need fast editable riff starts without sampling, remote AI, or non-editable generation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created from clean main after plan-079. |
| 2026-06-16 | project_lead | Implemented key-aware Melody Motif Pads for editable Synth melody starts. |
| 2026-06-16 | quality_runner | Ran typecheck, build, harness QA, quality gate, verify, qa, diff check, and browser smoke. |
| 2026-06-16 | review_judge | Reviewed completed implementation after QA and found no blocking issues. |

## Completion Notes

Completed. The 808 / Melody editor now includes key-aware Melody Motif Pads for Hook, Pocket, Rise, and Answer synth phrases. Applying a motif replaces only the selected Pattern A/B/C melody notes through existing undoable project history, selects the first generated note for immediate editing, and leaves the generated notes as local editable event data.

QA passed with `npm run typecheck`, `npm run build`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, `npm run qa`, and `git diff --check`. Browser smoke confirmed the Hook motif changed Synth melody notes from 5 to 6, selected a melody note, undo restored the previous 5-note melody, console errors were empty, and the page had no horizontal overflow.
