# plan-107-song-form-overview

## User Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that working producers can respect and first-time composers can use easily.

## Slice Goal

Add a Song Form Overview panel that turns the current arrangement into a compact visual song map. Beginners should see the song's intro/verse/hook/bridge/outro flow without parsing every editor control, while producers should quickly scan pattern usage, bar length, energy, and muted-track posture across the full beat.

## Non-Goals

- No new arrangement schema or project-file format change.
- No automatic arrangement generation, hidden rewrites, or mutation of Pattern A/B/C musical events.
- No changes to existing arrangement edit behavior, Pattern Chain, Arrangement Arc Pads, Structure Lens, Beat Map, Next Move, export, MIDI, stem, snapshot, or save/load semantics.
- No sampling, imported audio, sampler tracks, plugin hosting, remote AI, remote analysis, cloud sync, accounts, analytics, or platform/mastering claims.

## Context Map

- `src/ui/App.tsx`: arrangement block state, selection handlers, Structure Lens, Beat Map, Arrangement Editor, helper functions.
- `src/domain/workstation.ts`: arrangement section, energy, bar, mute, Pattern A/B/C types and labels.
- `src/styles.css`: top-level workstation panel styling.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA guardrails.
- `harness/scripts/run_qa.py`: static expectations for the new surface.

## Implementation Plan

- [x] Inspect existing arrangement selection and editor helpers.
- [x] Add Song Form Overview summary helpers derived only from current arrangement and Pattern A/B/C state.
- [x] Render a compact panel near Structure Lens/Next Move with segment buttons that select existing arrangement blocks without mutating arrangement data.
- [x] Style the song map with stable dimensions, responsive behavior, and no text overflow.
- [x] Update docs and QA expectations for the local arrangement overview.
- [x] Run typecheck, QA, browser smoke, and review.

## Validation Plan

```sh
npm run typecheck
python3 harness/scripts/run_qa.py
git diff --check
npm run qa
npm run verify
```

Manual browser smoke:

- Open the worktree dev server.
- Confirm `song-form-overview` renders.
- Confirm it shows the current song length, section flow, pattern usage, and segment buttons.
- Confirm clicking a segment selects the corresponding arrangement block without creating undo history or changing project data.
- Confirm no horizontal overflow or browser console errors.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-16 | Add Song Form Overview as an arrangement navigation panel. | The app has deep arrangement editing, but users still need a compact full-song map to understand structure before editing. |

## Progress Log

| Date | Actor | Notes |
|---|---|---|
| 2026-06-16 | plan_keeper | Plan created. |
| 2026-06-16 | harness_builder | Added Song Form Overview summary helpers, segment navigation UI, responsive styles, docs, and static QA expectations. |
| 2026-06-16 | quality_runner | `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, and browser smoke passed before review. |
| 2026-06-16 | review_judge | Reviewed segment navigation, undo history behavior, arrangement/export boundary, and reused the new numeric pattern event helper from the existing pattern count label. |
| 2026-06-16 | quality_runner | `npm run qa`, `git diff --check`, and `npm run verify` passed after review edits. |
