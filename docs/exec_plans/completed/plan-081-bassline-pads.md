# plan-081-bassline-pads

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add key-aware 808 Bassline Pads to the 808 / Melody editor so beginners can start a usable low-end line with one explicit click and working producers can quickly sketch root, bounce, slide, or offbeat bass patterns as editable Pattern A/B/C 808 note data.

## Non-Goals

- No project schema fields.
- No audio recording, sample import, chopping, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No hidden generation, autoplay, or background mutation.
- No changes to realtime playback, WAV/stem export, or MIDI export semantics beyond existing paths naturally rendering the edited 808 notes.

## Context Map

- `src/ui/App.tsx` owns the 808 / Melody editor, `currentPattern`, selected-note state, and selected Pattern A/B/C mutation paths.
- `src/domain/workstation.ts` owns bass note data, scale lanes, normalization, playback/export consumers, and Pattern state.
- `src/styles.css` owns compact workstation controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` keep product and QA expectations aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Bassline Pads must be deterministic from current key and selected Pattern data.
- Bassline clicks must route through existing undoable project update paths.
- 808 notes must remain editable local musical event data.

## Implementation Plan

- [x] Add key-aware bassline pad model and note-generation helper.
- [x] Add undoable Bassline Pad application to the selected Pattern's 808 notes.
- [x] Add a compact 808 Bassline Pads row in the 808 / Melody editor.
- [x] Update docs and QA expectations for direct-composition bassline pads.

## QA Plan

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser smoke: click Bassline Pads, confirm 808 event count and selected note change, undo restores the previous 808 notes, console errors empty, and no horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Bassline Pads are local, deterministic, explicit-click, undoable, editable, key-aware 808 event transformations and do not introduce sampling-first, hidden generation, remote AI, or export regressions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add 808 Bassline Pads after Chord Pads and Melody Motif Pads. | Low-end composition is central to modern beat workflows, and one-click editable bass starts improve beginner confidence and producer speed without sampling or hidden generation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created from clean main after plan-080. |
| 2026-06-16 | project_lead | Implemented key-aware 808 Bassline Pads for editable low-end starts. |
| 2026-06-16 | harness_builder | Updated product docs, quality guardrails, and QA expectations for Bassline Pads. |
| 2026-06-16 | quality_runner | Ran typecheck, verify, harness QA, qa, diff check, browser smoke, and pad internal overflow checks. |
| 2026-06-16 | review_judge | Reviewed completed implementation after QA and found no blocking issues. |

## Completion Notes

Completed. The 808 / Melody editor now includes key-aware 808 Bassline Pads for Root, Bounce, Slide, and Offbeat bass patterns. Applying a pad replaces only the selected Pattern A/B/C 808 notes through existing undoable project history, selects the first generated 808 note for immediate editing, and leaves the generated low-end line as local editable event data with glide and chance preserved.

QA passed with `npm run typecheck`, `npm run verify`, `python3 harness/scripts/run_qa.py`, `npm run qa`, and `git diff --check`. Browser smoke at `http://127.0.0.1:5189/` confirmed the Bounce pad changed 808 notes from 4 to 6, selected an 808 note, undo restored the previous 4-note bassline, console errors were empty, and default viewport horizontal overflow was false. A 390px viewport check confirmed the new Bassline Pad panel, row, and buttons do not internally overflow; the app-wide horizontal scroll at that size comes from the existing desktop workstation shell width.
