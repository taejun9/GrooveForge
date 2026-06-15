# plan-088-chord-rhythm-pads

## Status

active

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add Chord Rhythm Pads to the Chords editor so beginners can quickly make static harmony feel more intentional, while working producers can reshape selected Pattern A/B/C chord length, velocity, and chance with explicit one-click local event edits.

## Non-Goals

- No project schema fields.
- No new synthesis engine, audio clip editing, sampler tracks, sample import, chopping, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No hidden generation, autoplay, background mutation, chord-root mutation, chord-quality mutation, inversion mutation, melody mutation, bass mutation, drum mutation, arrangement mutation, or mixer/master mutation.
- No changes to realtime playback, WAV/stem export, or MIDI export semantics beyond existing paths naturally rendering edited chord length, velocity, and chance values.

## Context Map

- `src/ui/App.tsx` owns Chord Editor, selected Pattern A/B/C mutation path, selected-chord state, Chord Pads, chord inspectors, and existing undoable chord update helpers.
- `src/domain/workstation.ts` owns chord event shape, normalization, save/load migration, playback/export consumers, and Pattern state.
- `src/styles.css` owns compact workstation controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` keep product and QA expectations aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Chord Rhythm Pads must be deterministic and operate only on the selected Pattern A/B/C slot.
- Pad clicks must route through existing undoable project update paths.
- Results must keep chord counts, steps, roots, qualities, and inversions stable and remain editable local chord event data through the existing Chord Editor.

## Implementation Plan

- [x] Add Chord Rhythm Pad model and deterministic chord-event transformation helper.
- [x] Add undoable Chord Rhythm Pad application to selected Pattern chord length, velocity, and chance data.
- [x] Add a compact Chord Rhythm Pads row near Chord Pads in the Chords editor.
- [x] Update docs and QA expectations for direct-composition Chord Rhythm Pads.

## Validation

- [x] `npm run typecheck`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run verify`
- [x] `npm run qa`
- [x] `git diff --check`
- [x] Browser smoke: clicked Pulse Chord Rhythm Pad, confirmed selected Pattern chord count stayed 4, roots/qualities/inversions stayed stable, length/velocity/chance visibly updated, Undo restored the prior visible chord state, console errors were empty, and no horizontal overflow was present.

## Review Plan

QA completes before review starts. Review checks that Chord Rhythm Pads are local, deterministic, explicit-click, undoable, editable chord-event transformations and do not introduce sampling-first, hidden generation, remote AI, chord reharmonization, arrangement mutation, or export regressions.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Chord Rhythm Pads after Melody Accent Pads. | Drums, 808, and Synth now have quick feel controls; harmony still needs a fast way to shape chord movement without changing musical identity. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-088 from clean main after plan-087. |
| 2026-06-16 | harness_builder | Added Chord Rhythm Pads model, selected-Pattern undoable handler, Chords editor UI, styles, docs, and QA expectations. |
| 2026-06-16 | quality_runner | Ran typecheck and static QA after implementation. |
| 2026-06-16 | quality_runner | Ran final verify, npm QA, diff check, and browser smoke after review cleanup. |
| 2026-06-16 | review_judge | Reviewed Chord Rhythm Pads as local, deterministic, explicit-click selected-Pattern chord length/velocity/chance edits with no sampling-first scope expansion, reharmonization, arrangement mutation, or export-path regression. |

## Completion Notes

Chord Rhythm Pads are complete for plan-088. The Chords editor now has Held, Pulse, Stab, and Ghost pads that reshape selected Pattern A/B/C chord length, velocity, and chance while keeping chord counts, steps, roots, qualities, inversions, and manual editability stable. Product docs and QA rules now describe the direct-composition harmony workflow, and validation plus browser smoke passed.
