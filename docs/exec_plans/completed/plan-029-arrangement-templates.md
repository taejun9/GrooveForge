# plan-029-arrangement-templates

## Goal

Add arrangement templates so beginners can create usable song structures quickly and working beatmakers can sketch alternate beat forms without manually duplicating blocks.

## Context

GrooveForge has editable arrangement blocks with section, Pattern A/B/C assignment, energy, duplicate, move, and delete. The missing workflow is a fast way to switch from a loop to a beat-store demo, hook-first draft, or longer full structure. This is important because arrangement turns a pattern sketch into a usable beat.

## Scope

- Add built-in arrangement templates generated from existing Pattern A/B/C blocks.
- Expose templates in the Arrangement panel.
- Applying a template replaces arrangement blocks, selects the first block, and keeps pattern editor aligned.
- Preserve undo/redo behavior and WAV/stem export semantics.
- Update product docs, quality rules, and static QA expectations.

## Non-Goals

- No audio sampling, audio import, chopping, sampler tracks, or audio warping.
- No full timeline clip splitting, drag-and-drop, or multi-bar block lengths in this slice.
- No remote AI arrangement generation.

## Files

- `src/domain/workstation.ts`
- `src/ui/App.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/reviews/plan-029-arrangement-templates-review.md`

## Acceptance

- Arrangement panel exposes built-in template buttons.
- Applying each template replaces the current arrangement with at least one valid block.
- The selected arrangement index resets safely and selected pattern matches the first template block.
- Undo restores the previous arrangement.
- WAV/stem export continues to follow the current arrangement length.
- `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check` pass.
- Browser validation confirms template application, undo, pattern alignment, no visual breakage, and no console errors.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-15 | Add arrangement templates before advanced timeline editing. | Templates improve full-song completion with a small, reversible feature that uses the existing arrangement data model. |
| 2026-06-15 | Keep templates as block arrays over Pattern A/B/C. | This preserves current export behavior and keeps the feature sample-free and event-based. |

## Progress

- [x] Created plan/worktree.
- [x] Implement arrangement templates.
- [x] Update docs and harness.
- [x] Run QA and browser validation.
- [x] Create review mirror.
- [x] Ready for merge lifecycle.

## Outcome

The Arrangement panel now exposes Loop, Full Beat, Hook First, and Breakdown templates. Applying a template replaces only arrangement blocks, selects the first block, aligns Pattern A/B/C editing to that first block, clears stale note/drum selections, and routes the change through normal undo history. Templates reuse existing musical pattern data, mixer/master state, and arrangement-length export behavior, keeping GrooveForge centered on direct all-genre beat composition rather than sampling.
