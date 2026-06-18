# plan-340-mix-coach-card-focus

## Status

Complete

## Goal

Add explicit Mix Coach card Focus controls so beginners and working producers can pin a specific headroom, limiter, stem balance, or low-end diagnostic directly from the Mix Coach panel without applying a Mix Fix or changing mix data.

## Scope

- Add a Focus button to each existing Mix Coach check card.
- Route Focus clicks through the existing UI-local Mix Coach focus state and master panel path.
- Keep Mix Coach check derivation, thresholds, card order, Mix Fix actions, mixer/master state, playback, export, save/load, undo/redo, and Quick Actions semantics unchanged.
- Update docs and static QA expectations.

## Non-Goals

- No new Mix Coach checks or threshold changes.
- No Mix Fix automation, auto-fixing, autoplay, auto-export, mixer/master mutation, playback changes, render/export changes, project schema changes, saved-file changes, sampling, imported audio, plugin hosting, remote AI, accounts, analytics, or cloud sync.

## Files

- `src/ui/App.tsx`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Validation

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run build`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`

## QA Log

- `npm run typecheck` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run build` passed with the existing Vite large chunk warning.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run qa` passed.
- `npm run verify` passed with runtime smoke covering 10/10 sample-free blueprints and 10/10 supported style profiles.
- In-app Browser tool was not exposed by tool discovery in this session, so no browser visual smoke was run.

## Review

- No findings. The card Focus buttons route through the existing Mix Coach focus handler and master panel path, keep Mix Coach check derivation and Mix Fix behavior unchanged, and remain UI-local.
- Residual risk: visual browser inspection was not available in this session; validation coverage is type/static/runtime/build based.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add explicit card Focus controls instead of adding another Mix Fix. | The app already has fix actions; this improves diagnosis and navigation without mutating mix data. |
| 2026-06-18 | Reuse existing Mix Coach focus state and master panel path. | It keeps the behavior consistent with Next Move, Review Queue, and Quick Actions Mix Coach focus. |
| 2026-06-18 | Keep card Focus controls documented as Mix Coach diagnosis, not a Mix Fix path. | Focus should help users inspect headroom, limiter, stem balance, and low-end checks without changing project data. |

## Progress

- [x] Inspected current main and remaining stale worktree state.
- [x] Created `codex/plan-340-mix-coach-card-focus` worktree.
- [x] Add Mix Coach card Focus controls.
- [x] Update docs and QA expectations.
- [x] Run QA and quality checks.
- [x] Complete review, move plan to completed, and create review mirror.
