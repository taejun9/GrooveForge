# plan-250-finish-checklist-quick-action

## Goal

Add a Quick Actions command that focuses the current highest-priority Finish Checklist card so beginners can jump from command search to the next finish step and producers can quickly inspect Compose, Arrange, Mix, Master, or Handoff readiness before export without changing project data.

## Non-Goals

- Do not change Finish Checklist card derivation, scoring, labels, or panel layout.
- Do not mutate project data, undo history, playback, exports, mixer/master state, arrangement, Handoff state, or musical events from the command.
- Do not add auto-fixing, auto-mastering, auto-export, autoplay, command chains, modal workflows, or hidden recommendations.
- Do not add sampling, imported audio, remote AI, remote analysis, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, Finish Checklist summary/cards, existing focus handler, result metrics, and follow-up copy.
- `README.md`: user-facing feature list and desktop command summary.
- `docs/product/product.md`: product framing and MVP behavior.
- `docs/quality/rules.md`: guardrails for Finish Checklist Focus and Quick Actions work.
- `harness/scripts/run_qa.py`: repository text and source-token checks.

## Plan

- [x] Route `finishChecklistSummary` and the existing Finish Checklist focus handler into Quick Actions.
- [x] Add a `finish-checklist-focus` command using the current highest-priority Finish Checklist card and disable it when no card exists.
- [x] Add Finish Checklist-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will choose the first non-good Finish Checklist card in the existing card order, falling back to the first card when all finish checks are ready. This keeps command behavior aligned with the visible finish pass.

## Progress Log

- Started from clean `main` at `dfa3c1e` in worktree `.worktree/plan-250-finish-checklist-quick-action`.
- Added `activeFinishChecklistQuickActionCard` so Quick Actions selects the first non-good Finish Checklist card, or the first ready card when all finish checks are clear.
- Wired `finish-checklist-focus` through the existing `focusFinishChecklistCard` path, with UI-only result metric and follow-up copy.
- Updated README, product docs, quality rules, and harness checks to keep the command focus-only, local, finish-pass oriented, and sample-free.

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
- The command derives only from existing Finish Checklist cards, routes through the existing focus handler, and does not mutate project data.
- No playback, export, project schema, mixer/master, arrangement, Handoff, sampler, imported-audio, remote AI, analytics, account, payment, or cloud-sync behavior changed.
