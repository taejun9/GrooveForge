# plan-251-beat-passport-quick-action

## Goal

Add a Quick Actions command that focuses the current highest-priority Beat Passport metric so beginners can jump from command search to the beat identity/status check and producers can quickly inspect target, length, Pattern A/B/C, readiness, export, stems, or master posture without changing project data.

## Non-Goals

- Do not change Beat Passport metric derivation, scoring, labels, or panel layout.
- Do not mutate project data, undo history, playback, exports, mixer/master state, arrangement, targets, Handoff state, or musical events from the command.
- Do not add auto-targeting, auto-arrangement, auto-mastering, auto-export, autoplay, command chains, modal workflows, or hidden recommendations.
- Do not add sampling, imported audio, remote AI, remote analysis, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, Beat Passport summary/metrics, existing focus handler, result metrics, and follow-up copy.
- `README.md`: user-facing feature list and desktop command summary.
- `docs/product/product.md`: product framing and MVP behavior.
- `docs/quality/rules.md`: guardrails for Beat Passport Focus and Quick Actions work.
- `harness/scripts/run_qa.py`: repository text and source-token checks.

## Plan

- [x] Route `beatPassportSummary` and the existing Beat Passport focus handler into Quick Actions.
- [x] Add a `beat-passport-focus` command using the current highest-priority Beat Passport metric and disable it when no metric exists.
- [x] Add Beat Passport-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will choose the first non-good Beat Passport metric in the existing metric order, falling back to the first metric when all passport metrics are ready. This keeps command behavior aligned with the visible beat identity scan.

## Progress Log

- Started from clean `main` at `f729648` in worktree `.worktree/plan-251-beat-passport-quick-action`.
- Added `beat-passport-focus` to Quick Actions using the existing Beat Passport summary and focus handler.
- Added command result metric/follow-up copy and aligned README, product docs, quality rules, and harness source-token checks.

## QA Log

- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run typecheck` passed.
- `npm run qa` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed.
- `npm run verify` passed.
- `npm run dev` in sandbox failed with `listen EPERM: operation not permitted 127.0.0.1:5173`.
- Escalated `npm run dev` for local browser smoke was rejected by environment policy, so no browser smoke was run and no workaround was attempted.

## Review

- Post-QA review found no code or documentation issues. Residual risk is limited to the blocked browser smoke; automated QA, typecheck, build, and verify all passed.
