# plan-245-groove-compass-quick-action

## Goal

Add a Quick Actions command that focuses the current highest-priority Groove Compass card so users can jump from command search to density, anchor, hat motion, timing, chance, or selected-drum diagnostics without changing project data.

## Non-Goals

- Do not add drum editing, groove generation, auto-humanization, playback changes, or hidden recommendations.
- Do not change Groove Compass scoring, focus card derivation, project schema, saved files, export behavior, playback, or undo history.
- Do not add sampling, imported audio, remote AI, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, focus-only result handling, Groove Compass focus handler, and result follow-up copy.
- `README.md`: user-facing feature list and desktop command summary.
- `docs/product/product.md`: product framing and MVP behavior.
- `docs/quality/rules.md`: guardrails for focus-only Quick Actions and Groove Compass work.
- `harness/scripts/run_qa.py`: repository text and source-token checks.

## Plan

- [x] Route `grooveCompassSummary` and `focusGrooveCompassItem` into Quick Actions.
- [x] Add a `groove-compass-focus` command using the existing highest-priority Groove Compass card and existing focus handler.
- [x] Mark the command as focus-only in Quick Action result metrics and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- Use existing Groove Compass cards as the source of truth. This keeps command search as navigation/focus for drum feel inspection, not as an automatic rhythm-writing surface.
- The Quick Actions command is grouped under `Create` because it helps direct drum composition and pocket inspection, but it only focuses the existing Compose panel and does not apply edits.

## Progress Log

- Started from clean `main` at `ed007d8` in worktree `.worktree/plan-245-groove-compass-quick-action`.
- Added `groove-compass-focus` to Quick Actions, focus-only result metrics, and follow-up text.
- Updated README, product docs, quality rules, and harness expectations for Groove Compass command-palette focus.

## QA Log

- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run typecheck` passed.
- `npm run qa` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed.
- `npm run verify` passed, including runtime smoke for 10/10 sample-free Beat Blueprints and 10/10 supported style profiles.
- Browser smoke was blocked: `npm run dev` failed with `listen EPERM: operation not permitted 127.0.0.1:5173`; the required escalated retry was rejected by the environment policy.

## Review

- Post-QA review found no follow-up code changes. Residual risk is limited to manual browser smoke being unavailable in this sandbox because the local dev server could not bind to `127.0.0.1:5173`.
