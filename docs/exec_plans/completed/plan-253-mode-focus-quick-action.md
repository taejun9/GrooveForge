# plan-253-mode-focus-quick-action

## Goal

Add a Quick Actions command that jumps to the current Guided or Studio Mode Focus card so beginners can reach the next guided workstation panel from command search and producers can jump to the current studio scan target without changing focus scoring or project data.

## Non-Goals

- Do not change Mode Focus summary derivation, card scoring, mode selection, labels, or panel layout.
- Do not mutate project data, undo history, playback, exports, arrangement, mixer/master state, Handoff state, or musical events from the command.
- Do not add onboarding overlays, tutorials, command chains, hidden recommendations, auto-run, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, Mode Focus summary/cards, existing Mode Focus jump handler, result metrics, and follow-up copy.
- `README.md`: user-facing feature list and desktop command summary.
- `docs/product/product.md`: product framing and MVP behavior.
- `docs/quality/rules.md`: guardrails for Mode Focus Jump and Quick Actions work.
- `harness/scripts/run_qa.py`: repository text and source-token checks.

## Plan

- [x] Route `modeFocusSummary` and the existing Mode Focus jump handler into Quick Actions.
- [x] Add a `mode-focus-jump` command using the current Guided or Studio Mode Focus card.
- [x] Add Mode Focus-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will choose the Guided `stage` card in Guided mode and the Studio `issue` card in Studio mode, falling back to the first available card. This mirrors the existing Guided/Studio orientation without adding new scoring.

## Progress Log

- Started from clean `main` at `54e5e58` in worktree `.worktree/plan-253-mode-focus-quick-action`.
- Added `mode-focus-jump` to Quick Actions using the existing Mode Focus summary and jump handler.
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
