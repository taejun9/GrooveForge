# plan-244-key-compass-quick-action

## Goal

Add a Quick Actions command that focuses the current highest-priority Key Compass card so users can jump from command search to scale, chord, 808/bass, melody, or selected-note/chord diagnostics without changing project data.

## Non-Goals

- Do not add key retargeting, note editing, chord editing, or automatic correction.
- Do not change Key Compass scoring, focus card derivation, project schema, saved files, export behavior, playback, or undo history.
- Do not add sampling, imported audio, remote AI, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, focus-only result handling, Key Compass focus handler, and result follow-up copy.
- `README.md`: user-facing feature list and desktop command summary.
- `docs/product/product.md`: product framing and MVP behavior.
- `docs/quality/rules.md`: guardrails for focus-only Quick Actions and Key Compass work.
- `harness/scripts/run_qa.py`: repository text and source-token checks.

## Plan

- [x] Route `keyCompassSummary` and `focusKeyCompassItem` into Quick Actions.
- [x] Add a `key-compass-focus` command using the existing highest-priority Key Compass card and existing focus handler.
- [x] Mark the command as focus-only in Quick Action result metrics and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- Use the existing Key Compass cards as the source of truth. This keeps the command read-only and prevents command search from becoming a hidden editing or generation surface.
- The Quick Actions command is grouped under `Create` because it helps direct beat composition and harmonic inspection, but it only focuses the existing Compose panel and does not apply edits.

## Progress Log

- Started from clean `main` at `bc514e8` in worktree `.worktree/plan-244-key-compass-quick-action`.
- Added `key-compass-focus` to Quick Actions, result metrics, and follow-up text.
- Updated README, product docs, quality rules, and harness expectations for Key Compass command-palette focus.

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
