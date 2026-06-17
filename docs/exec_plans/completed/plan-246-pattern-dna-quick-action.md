# plan-246-pattern-dna-quick-action

## Goal

Add a Quick Actions command that focuses the current highest-priority Pattern DNA card so users can jump from command search to layer, density, variation, or arrangement-use diagnostics without changing project data.

## Non-Goals

- Do not add pattern editing, auto-arrangement, pattern generation, layer creation, or hidden recommendations.
- Do not change Pattern DNA scoring, focus card derivation, project schema, saved files, export behavior, playback, or undo history.
- Do not add sampling, imported audio, remote AI, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, focus-only result handling, Pattern DNA focus handler, and result follow-up copy.
- `README.md`: user-facing feature list and desktop command summary.
- `docs/product/product.md`: product framing and MVP behavior.
- `docs/quality/rules.md`: guardrails for focus-only Quick Actions and Pattern DNA work.
- `harness/scripts/run_qa.py`: repository text and source-token checks.

## Plan

- [x] Route `patternDnaSummary` and `focusPatternDnaCard` into Quick Actions.
- [x] Add a `pattern-dna-focus` command using the existing highest-priority Pattern DNA card and existing focus handler.
- [x] Mark the command as focus-only in Quick Action result metrics and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- Use the same top-card rule as Pattern DNA Focus: focused card if present in the panel, otherwise the first non-good card, otherwise the first card. This keeps command search aligned with the visible Pattern DNA readout.
- The Quick Actions command is grouped under `Create` because it helps direct loop composition and pattern inspection, but it only focuses existing Compose or Arrange panels and does not apply edits.

## Progress Log

- Started from clean `main` at `fafad2f` in worktree `.worktree/plan-246-pattern-dna-quick-action`.
- Added `pattern-dna-focus` to Quick Actions, focus-only result metrics, and follow-up text.
- Updated README, product docs, quality rules, and harness expectations for Pattern DNA command-palette focus.

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
