# plan-082-pattern-stack-pads

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add key-aware Pattern Stack Pads to the Pattern editor so beginners can create a coherent 808 + chord + synth melody idea with one explicit click, while working producers can quickly sketch Pocket, Hook, Lift, or Break musical stacks as editable Pattern A/B/C event data.

## Non-Goals

- No project schema fields.
- No drum generation rewrite, arrangement mutation, audio recording, sample import, chopping, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No hidden generation, autoplay, or background mutation.
- No changes to realtime playback, WAV/stem export, or MIDI export semantics beyond existing paths naturally rendering edited Pattern notes and chords.

## Context Map

- `src/ui/App.tsx` owns the Pattern editor, 808 Bassline Pads, Melody Motif Pads, Chord Pads, selected Pattern A/B/C mutation paths, and selected event state.
- `src/domain/workstation.ts` owns Pattern data, bass/melody/chord event shapes, scale lanes, normalization, playback/export consumers, and Pattern state.
- `src/styles.css` owns compact workstation controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` keep product and QA expectations aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Pattern Stack Pads must be deterministic from the current key.
- Stack clicks must route through existing undoable project update paths.
- Results must remain editable local musical event data in the existing 808, chord, and melody editors.

## Implementation Plan

- [x] Add key-aware Pattern Stack model and note/chord generation helper.
- [x] Add undoable Pattern Stack application to the selected Pattern's 808, chord, and Synth melody events.
- [x] Add a compact Pattern Stack Pads row near the Pattern tools.
- [x] Update docs and QA expectations for direct-composition Pattern Stack Pads.

## QA Plan

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser smoke: click a Pattern Stack Pad, confirm 808/Synth/chord event counts change, selected event state is cleared or safe, undo restores previous Pattern events, console errors empty, and no horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Pattern Stack Pads are local, deterministic, explicit-click, undoable, editable, key-aware Pattern event transformations and do not introduce sampling-first, hidden generation, remote AI, or export regressions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Pattern Stack Pads after individual bassline, chord, and melody pads. | Beginners need a coherent musical pattern without understanding every lane first, and producers need fast A/B/C sketching while preserving editable local event data. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created from clean main after plan-081. |
| 2026-06-16 | project_lead | Implemented key-aware Pattern Stack Pads for editable 808/chord/Synth starts. |
| 2026-06-16 | harness_builder | Updated product docs, quality guardrails, and QA expectations for Pattern Stack Pads. |
| 2026-06-16 | quality_runner | Ran typecheck, verify, harness QA, qa, diff check, and browser smoke. |
| 2026-06-16 | review_judge | Reviewed completed implementation after QA and found no blocking issues. |

## Completion Notes

Completed. The Pattern editor now includes key-aware Pattern Stack Pads for Pocket, Hook, Lift, and Break musical stacks. Applying a stack replaces only the selected Pattern A/B/C 808 notes, chord events, and Synth melody notes through existing undoable project history, then selects the first chord for immediate editing while keeping generated notes and chords as local editable event data.

QA passed with `npm run typecheck`, `npm run verify`, `python3 harness/scripts/run_qa.py`, `npm run qa`, and `git diff --check`. Browser smoke at `http://127.0.0.1:5190/` confirmed the Hook stack changed 808 notes from 4 to 6, Synth melody notes from 5 to 6, changed chord event data while keeping 4 chord events, selected the first chord safely, undo restored the previous Pattern events, console errors were empty, and horizontal overflow was false.
