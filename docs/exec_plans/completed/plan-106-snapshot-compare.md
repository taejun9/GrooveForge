# plan-106-snapshot-compare

## User Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that working producers can respect and first-time composers can use easily.

## Slice Goal

Add a read-only Snapshot Compare panel that compares the current beat against saved Project Snapshots. Beginners should be able to understand what will change before restoring an idea, while producers should be able to compare takes by setup, arrangement length, readiness, export, stems, and master posture.

## Non-Goals

- No new snapshot schema or project-file format change.
- No restore, save, rename, delete, undo/redo, or snapshot storage behavior changes.
- No mutation of musical events, arrangement blocks, mixer, sound design, master state, snapshots, exports, Beat Readiness, Beat Passport, Finish Checklist, Review Queue, Beat Map, Next Move, Mix Coach, or Handoff semantics.
- No sampling, imported audio, sampler tracks, plugin hosting, remote AI, remote analysis, cloud sync, accounts, analytics, or mastering/platform claims.

## Context Map

- `src/ui/App.tsx`: Project Snapshots UI, Beat Readiness, Beat Passport, Finish Checklist, Review Queue, export/stem analysis helpers.
- `src/domain/workstation.ts`: ProjectSnapshot, ProjectState, snapshot payload helpers.
- `src/styles.css`: workstation panel styling.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and quality guardrails.
- `harness/scripts/run_qa.py`: static expectations for the new surface.

## Implementation Plan

- [x] Inspect existing Project Snapshots, readiness, export, stem, and master summary helpers.
- [x] Add deterministic Snapshot Compare summary helpers derived only from current project and saved snapshot project state.
- [x] Render a compact read-only panel near Project Snapshots with empty state and per-snapshot comparison cards.
- [x] Style the panel responsively without nested cards or text overflow.
- [x] Update docs and QA expectations for the read-only local comparison surface.
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
- Confirm `snapshot-compare` renders.
- Confirm the panel is read-only with no buttons or inputs inside it.
- Confirm the existing Project Snapshots controls still render.
- Confirm no horizontal overflow or browser console errors.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-16 | Add Snapshot Compare as a read-only local panel near Project Snapshots. | The app already supports saving/restoring ideas; comparing takes before restoring helps beginners avoid confusion and gives producers a faster way to judge arrangement/export/master differences. |

## Progress Log

| Date | Actor | Notes |
|---|---|---|
| 2026-06-16 | plan_keeper | Plan created. |
| 2026-06-16 | harness_builder | Added Snapshot Compare summary, read-only UI, responsive styles, docs, and static QA expectations. |
| 2026-06-16 | quality_runner | `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, and browser smoke passed before review. |
| 2026-06-16 | quality_runner | `npm run qa`, `git diff --check`, and `npm run verify` passed after final review edits. |
