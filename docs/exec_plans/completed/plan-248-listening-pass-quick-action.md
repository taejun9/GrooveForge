# plan-248-listening-pass-quick-action

## Goal

Add a Quick Actions command that focuses the current highest-priority Listening Pass checkpoint so beginners can jump from command search to the next audition task and producers can run a fast composition, arrangement, mix, or delivery listening pass without changing project data.

## Non-Goals

- Do not change Listening Pass checkpoint derivation, scoring, labels, or panel layout.
- Do not mutate project data, undo history, playback, exports, mixer/master state, arrangement, or musical events from the command.
- Do not add audio analysis, sampling, imported audio, remote AI, analytics, accounts, payments, or cloud sync.
- Do not add command chains, autoplay, auto-fixing, auto-rendering, or auto-export.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, Listening Pass summary/cards, focus handler, result metrics, and follow-up copy.
- `README.md`: user-facing feature list and desktop command summary.
- `docs/product/product.md`: product framing and MVP behavior.
- `docs/quality/rules.md`: guardrails for Listening Pass and Quick Actions work.
- `harness/scripts/run_qa.py`: repository text and source-token checks.

## Plan

- [x] Route `listeningPassSummary` and the existing Listening Pass focus handler into Quick Actions.
- [x] Add a `listening-pass-focus` command using the current highest-priority Listening Pass checkpoint and disable it when no checkpoint exists.
- [x] Add Listening Pass-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will focus the first non-good Listening Pass item in the existing summary order, falling back to the first checkpoint when all passes are ready. This reuses the visible panel's order instead of introducing a second ranking system.

## Progress Log

- Started from clean `main` at `043ca81` in worktree `.worktree/plan-248-listening-pass-quick-action`.
- Added `activeListeningPassQuickActionItem` so Quick Actions selects the current non-good Listening Pass checkpoint, or the first ready checkpoint when no review checkpoint remains.
- Wired `listening-pass-focus` through the existing `focusListeningPassItem` path, with UI-only result metric and follow-up copy.
- Updated README, product docs, quality rules, and harness checks to keep the command focus-only, local, direct-composition centered, and sample-free.

## QA Log

- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `git diff --check`
- Passed: `npm run typecheck`
- Passed: `npm run qa`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run verify`
- Blocked: `npm run dev` could not bind `127.0.0.1:5173` in the sandbox (`listen EPERM`). The escalated retry was rejected by the environment policy, so browser smoke was not run.

## Review

- Reviewed after QA. No blocking findings.
- The command derives only from existing Listening Pass summary items, routes through the existing focus handler, and does not mutate project data.
- No playback, export, project schema, sampler, imported-audio, remote AI, analytics, account, payment, or cloud-sync behavior changed.
