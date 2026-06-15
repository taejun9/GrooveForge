# plan-030-arrangement-lengths

## Goal

Add per-block arrangement length controls so beginners can turn templates into longer usable song sections quickly and working beatmakers can shape intro, verse, hook, bridge, and outro durations without duplicating blocks by hand.

## Context

GrooveForge now has arrangement templates, duplicate/move/delete controls, and export tied to arrangement length. Each block still behaves as a single bar. That keeps the UI simple, but it makes real song structure clumsy because users must duplicate repeated sections instead of saying a hook is 4 bars or an outro is 2 bars.

## Scope

- Add a `bars` value to arrangement blocks with safe bounds.
- Migrate older project files and legacy project shapes by defaulting missing block length to 1 bar.
- Update built-in arrangement templates to use explicit block lengths.
- Add a selected-block Bars control in the Arrangement editor.
- Make full-mix WAV export, stem export, export meter duration, and arrangement rendering follow the sum of block bars.
- Update product docs, quality rules, and static QA expectations.

## Non-Goals

- No audio sampling, audio import, chopping, sampler tracks, or audio warping.
- No drag timeline, split/merge, clip lanes, or multi-track arrangement timeline in this slice.
- No realtime arrangement playback rewrite; current realtime preview can remain selected-pattern loop based.

## Files

- `src/domain/workstation.ts`
- `src/audio/render.ts`
- `src/ui/App.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/reviews/plan-030-arrangement-lengths-review.md`

## Acceptance

- Every arrangement block has a bounded bar length in app state.
- Older saved project files without block lengths load with one bar per block.
- Template buttons apply valid blocks with explicit bar counts.
- The selected block editor can change bars and stays undoable.
- Full-mix WAV export, stem export, and export meter duration follow the sum of block bars, not just block count.
- Browser validation confirms bar editing changes export duration and undo restores it.
- `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check` pass.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-15 | Add per-block bar counts before split/merge timeline editing. | Bar counts solve the most common structure-length problem while preserving the current compact arrangement model. |
| 2026-06-15 | Default missing block bars to 1 on project load. | This keeps all existing `.grooveforge.json` files valid and preserves their previous duration. |

## Progress

- [x] Created plan/worktree.
- [x] Implement arrangement bar lengths.
- [x] Update docs and harness.
- [x] Run QA and browser validation.
- [x] Create review mirror.
- [x] Ready for merge lifecycle.

## Outcome

Arrangement blocks now carry bounded per-block bar lengths. Built-in templates define explicit section lengths, the Arrangement panel displays total bars, the selected block editor can change a block's bars, and older project files without bar counts normalize to one bar per block. Full-mix WAV export, stem export, and export meter duration now follow total arrangement bars while preserving Pattern A/B/C data and the existing compact arrangement model.
