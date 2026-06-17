# plan-254-beat-spine-quick-actions

## Goal

Add Quick Actions commands for the current Beat Spine card so beginners can jump to the next core beat-making axis or apply the current explicit core action from command search, and producers can move quickly through setup, drums, 808/bass, harmony, melody, sound, arrangement, and finish posture without adding sampling or hidden automation.

## Non-Goals

- Do not change Beat Spine summary derivation, card scoring, card labels, Apply Result scoring, or panel layout.
- Do not add new beat-generation logic, command chains, hidden generation, auto-run, autoplay, auto-save, auto-export, modal workflows, or onboarding overlays.
- Do not route Beat Spine Apply outside existing undoable Layer Starter, Sound Preset, Pattern Chain, or Master Finish handlers.
- Do not add sampling, imported audio, sampler devices, audio clips, remote AI, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, Beat Spine summary/cards/actions, existing jump/apply handlers, result metrics, and follow-up copy.
- `README.md`: user-facing feature list and desktop command summary.
- `docs/product/product.md`: product framing and MVP behavior.
- `docs/quality/rules.md`: guardrails for Beat Spine and Quick Actions work.
- `harness/scripts/run_qa.py`: repository text and source-token checks.

## Plan

- [x] Route `beatSpineSummary`, `jumpToBeatSpineTarget`, and `applyBeatSpineAction` into Quick Actions.
- [x] Add a `beat-spine-jump` command for the current Beat Spine card and a `beat-spine-apply` command for the current explicit Beat Spine action.
- [x] Add Beat Spine-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The Jump command will target `summary.nextCardId`, falling back to the first Beat Spine card.
- The Apply command will prefer the current next card when it has an action, otherwise the first non-good card with an action, then the first action card. This keeps command behavior aligned with the visible Beat Spine while avoiding new recommendation scoring.

## Progress Log

- Started from clean `main` at `9d4b061` in worktree `.worktree/plan-254-beat-spine-quick-actions`.
- Added `beat-spine-jump` and `beat-spine-apply` to Quick Actions using the existing Beat Spine summary, jump handler, and apply handler.
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
