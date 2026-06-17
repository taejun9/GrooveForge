# plan-255-chain-expand-quick-action

## Goal

Add a Quick Actions command for Chain Expand so beginners can turn an 8-bar Pattern Chain into a longer editable song-form outline from command search, and producers can structure a beat faster without hunting for the Arrangement panel control.

## Non-Goals

- Do not change Pattern Chain derivation, Chain Expand arrangement output, preview/result scoring, or Arrangement panel layout.
- Do not add command chains, hidden generation, auto-run, autoplay, auto-save, auto-export, onboarding overlays, or modal workflows.
- Do not mutate Pattern A/B/C musical event data, mixer state, sound design, master state, export handlers, project schema, or playback scheduling outside the existing Chain Expand handler.
- Do not add sampling, imported audio, sampler devices, audio clips, remote AI, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing Pattern Chain/Chain Expand handlers, command result metrics, and follow-up copy.
- `README.md`: user-facing desktop command summary.
- `docs/product/product.md`: MVP and product framing.
- `docs/quality/rules.md`: Quick Actions and Pattern Chain guardrails.
- `harness/scripts/run_qa.py`: static text/source expectations.

## Plan

- [x] Route the existing Chain Expand handler into Quick Actions.
- [x] Add a `chain-expand` Quick Actions command that uses existing Chain Expand behavior.
- [x] Add Chain Expand-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- Chain Expand will be a single explicit Quick Action in the Arrange group and will call the same handler as the visible `pattern-chain-expand` button, preserving Pattern Chain result behavior and undoable arrangement updates.

## QA Log

- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run typecheck` passed.
- `npm run qa` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run harness:smoke` passed.
- `npm run build` passed.
- `npm run verify` passed.
- `npm run dev` in sandbox failed with `listen EPERM: operation not permitted 127.0.0.1:5173`.
- Escalated `npm run dev` for local browser smoke was rejected by environment policy, so no browser smoke was run and no workaround was attempted.

## Review

- Post-QA review found no code or documentation issues. Residual risk is limited to the blocked browser smoke; automated QA, typecheck, runtime smoke, build, and verify all passed.
