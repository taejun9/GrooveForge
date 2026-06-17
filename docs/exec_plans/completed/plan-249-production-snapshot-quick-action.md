# plan-249-production-snapshot-quick-action

## Goal

Add a Quick Actions command that focuses the current highest-priority Production Snapshot metric so producers can jump from command search to target, form, pattern coverage, mix, or handoff session posture quickly, while beginners get a direct path to the next important session scan without changing project data.

## Non-Goals

- Do not change Production Snapshot metric derivation, scoring, labels, or panel layout.
- Do not mutate project data, undo history, playback, exports, mixer/master state, arrangement, Session Brief, or musical events from the command.
- Do not add auto-targeting, auto-arrangement, auto-mixing, auto-export, autoplay, command chains, modal workflows, or hidden recommendations.
- Do not add sampling, imported audio, remote AI, remote analysis, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, Production Snapshot summary/metrics, existing focus handler, result metrics, and follow-up copy.
- `README.md`: user-facing feature list and desktop command summary.
- `docs/product/product.md`: product framing and MVP behavior.
- `docs/quality/rules.md`: guardrails for Production Snapshot Focus and Quick Actions work.
- `harness/scripts/run_qa.py`: repository text and source-token checks.

## Plan

- [x] Route `productionSnapshotSummary` and the existing Production Snapshot focus handler into Quick Actions.
- [x] Add a `production-snapshot-focus` command using the current highest-priority Production Snapshot metric and disable it when no metric exists.
- [x] Add Production Snapshot-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will choose the first non-good Production Snapshot metric in the existing panel order, falling back to the first metric when all metrics are ready. This keeps the command aligned with the visible session scan instead of adding a separate ranking system.

## Progress Log

- Started from clean `main` at `505ab08` in worktree `.worktree/plan-249-production-snapshot-quick-action`.
- Added `activeProductionSnapshotQuickActionMetric` so Quick Actions selects the first non-good Production Snapshot metric, or the first ready metric when the session scan is clear.
- Wired `production-snapshot-focus` through the existing `focusProductionSnapshotMetric` path, with UI-only result metric and follow-up copy.
- Updated README, product docs, quality rules, and harness checks to keep the command focus-only, local, producer-scan oriented, and sample-free.

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
- The command derives only from existing Production Snapshot metrics, routes through the existing focus handler, and does not mutate project data.
- No playback, export, project schema, mixer/master, arrangement, Session Brief, sampler, imported-audio, remote AI, analytics, account, payment, or cloud-sync behavior changed.
