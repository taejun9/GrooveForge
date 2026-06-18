# Plan 400 - Build Chunk Recovery

## Goal

Remove the recurring production build large-chunk warning after recent workstation growth through real module separation, preserving all runtime behavior and the direct beat-production product scope.

## Scope

- Identify a low-risk `src/ui/App.tsx` boundary that can be extracted into pure helper modules.
- Add Vite/Rolldown chunk grouping for the extracted modules.
- Update README, architecture, product/quality docs, and static QA expectations so future build hygiene covers the new boundaries.
- Verify that production build and full verify complete without the large-chunk warning.

## Non-Goals

- Do not raise or hide `chunkSizeWarningLimit`.
- Do not change UI behavior, project schema, save/load migration, undo/redo, playback, render/export, Handoff, local draft recovery, Quick Actions semantics, or app workflow.
- Do not add sampling, imported audio, sampler devices, remote AI, accounts, analytics, payments, or cloud sync.

## Files

- `src/ui/App.tsx`
- `src/ui/workstationSnapshotCompare.ts`
- `src/ui/workstationAnalysis.ts`
- `vite.config.ts`
- `README.md`
- `docs/architecture/harness.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Validation

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## QA Log

Validation completed:

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run build` passed with no large-chunk warning.
- `npm run qa` passed.
- `npm run verify` passed, including quality gate, runtime smoke for 11/11 Beat Blueprints and 11/11 supported style profiles, typecheck, and production build with no large-chunk warning.

Production build result: `workstation-snapshot-compare` emitted as a 3.31 kB chunk, `workstation-analysis` emitted as a 0.50 kB chunk, and the main app entry emitted as `dist/assets/index-BZnmZ4zq.js` at 499.97 kB after minification.

## Review Notes

Review completed after QA. No blocking findings. The change extracts Snapshot Compare read-only derivation and shared analysis helpers from `src/ui/App.tsx`, adds explicit Vite chunk groups, and preserves UI behavior by keeping the same handlers, project profile calculation, save/load, playback, export, Handoff, and Quick Actions paths.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Treat the returned Vite large-chunk warning as completion-readiness regression. | Clean production builds matter for desktop readiness, and the warning was previously removed before recent UI growth pushed the entry chunk back above 500 kB. |
| 2026-06-19 | Extract Snapshot Compare derivation before broader UI refactors. | The warning returned after Snapshot Compare Focus growth, and its card/focus/Quick Action helper code had a narrow read-only boundary. |
| 2026-06-19 | Extract only pure shared analysis helpers needed to finish the warning removal. | The Snapshot Compare split lowered the entry chunk to 500.28 kB, then shared analysis helpers lowered it below the warning threshold without behavior changes. |

## Completion Summary

Added `workstationSnapshotCompare.ts` for saved-take comparison cards, Focus summaries, and Snapshot Compare Quick Action item derivation. Added `workstationAnalysis.ts` for shared pure analysis helpers used by App surfaces. Updated Vite chunk groups and docs/static QA so the new chunks remain covered. The production build is warning-free again.

## Status

- [x] Created `codex/plan-400-build-chunk-recovery` worktree.
- [x] Identify safe App extraction boundary.
- [x] Extract module and update chunk configuration/docs/static QA.
- [x] Run QA/build/verify and review.
- [x] Move plan to completed and create review mirror.
