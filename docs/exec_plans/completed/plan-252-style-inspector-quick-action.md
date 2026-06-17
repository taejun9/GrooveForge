# plan-252-style-inspector-quick-action

## Goal

Add a Quick Actions command that focuses the current highest-priority Style Inspector item so beginners can jump from command search to BPM, swing, bass, melody, sound, or Pattern A/B/C density guidance, and producers can quickly inspect style posture without changing the selected style or project data.

## Non-Goals

- Do not change Style Inspector metric derivation, Pattern density rows, labels, or panel layout.
- Do not auto-apply styles, mutate project data, change Pattern A/B/C events, arrangement, mixer/master state, playback, exports, or undo history from the command.
- Do not add hidden generation, autoplay, command chains, modal workflows, sampling, imported audio, remote AI, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, Style Inspector summary/focus item types, existing focus handler, result metrics, and follow-up copy.
- `README.md`: user-facing feature list and desktop command summary.
- `docs/product/product.md`: product framing and MVP behavior.
- `docs/quality/rules.md`: guardrails for Style Inspector Focus and Quick Actions work.
- `harness/scripts/run_qa.py`: repository text and source-token checks.

## Plan

- [x] Route `styleInspectorSummary` and the existing Style Inspector focus handler into Quick Actions.
- [x] Add a `style-inspector-focus` command using the current highest-priority Style Inspector metric or Pattern density row and disable it when no focus item exists.
- [x] Add Style Inspector-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- Style Inspector items do not carry tone, so the command will choose by existing local style/profile data: BPM when outside the profile range, Swing when it differs from the profile default, the first Open or Pocket Pattern density row, then the first metric or Pattern row. This keeps command behavior aligned with the visible style posture scan without adding new scoring.

## Progress Log

- Started from clean `main` at `4f4f85d` in worktree `.worktree/plan-252-style-inspector-quick-action`.
- Added `style-inspector-focus` to Quick Actions using the existing Style Inspector summary and focus handler.
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
