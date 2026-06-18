# Plan 398 - Snapshot Compare Focus

## Goal

Add Snapshot Compare Focus so saved beat versions are easier to inspect for working producers and safer for beginners before restore, delete, or major edits.

## Scope

- Add UI-local focus state for Snapshot Compare metrics.
- Add visible Focus controls for setup, length, readiness, export, stems, and master comparison lanes.
- Add Quick Actions for the highest-priority Snapshot Compare focus lane and each direct comparison metric.
- Route focus only to existing workstation panels; do not restore, delete, rename, save, export, or mutate project data.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No snapshot restore/delete Quick Actions.
- No snapshot schema change, autosave, background filesystem versioning, cloud sync, accounts, analytics, imported audio, sampling, remote AI, or professional mastering claims.
- No change to Project Snapshot save/rename/restore/delete behavior, Snapshot Compare metric derivation, save/load, playback, render/export, Handoff, or undo/redo semantics.

## Files

- `src/ui/App.tsx`
- `src/ui/workstationShellPanels.tsx`
- `src/ui/workstationUiModel.ts`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Validation

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run verify`

## QA Log

Validation completed:

- `git diff --check` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run verify` passed, including quality gate, runtime smoke for 11/11 Beat Blueprints and 11/11 style profiles, typecheck, and build with the same Vite chunk-size warning.

Visual browser QA was not run because no callable in-app Browser control tool was exposed in this session; `tool_search` returned no matching tool.

## Review Notes

Review completed after QA. No blocking findings. The change keeps Snapshot Compare focus state UI-local, routes visible controls and Quick Actions through the same focus handler, and does not introduce restore/delete/export/save/sampling behavior.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Add focus-only Snapshot Compare controls before adding mutating snapshot commands. | Comparing saved takes is useful for producer workflow and beginner confidence, while focus-only routing avoids destructive or surprising version changes. |
| 2026-06-19 | Reuse existing workstation panels as focus targets. | The feature should inspect current beat areas without creating a new snapshot editor, saved project schema, or undoable mutation path. |

## Completion Summary

Added Snapshot Compare Focus readout, visible Focus buttons for saved-take comparison lanes, and Quick Actions commands for the current highest-priority lane plus direct setup, length, readiness, export, stems, and master metrics. Documentation and static QA now guard the read-only, beat-first scope.

## Status

- [x] Created `codex/plan-398-snapshot-compare-focus` worktree.
- [x] Implement Snapshot Compare focus state, visible controls, and Quick Actions.
- [x] Update docs and static QA expectations.
- [x] Run QA/build/verify and review.
- [x] Move plan to completed and create review mirror.
