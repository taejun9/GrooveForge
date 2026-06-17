# plan-259-drum-kit-quick-action

## Goal

Add a Quick Actions command for Drum Kit so beginners can apply the current built-in drum tone suggestion from command search, and producers can quickly reshape kick, clap, hat, and drum rack posture without leaving the command palette.

## Non-Goals

- Do not change Drum Kit pad definitions, preview/result scoring, Sound panel layout, or Studio tone controls.
- Do not add new drum synthesis algorithms, hidden generation, auto-run, autoplay, auto-save, auto-export, onboarding overlays, or modal workflows.
- Do not mutate musical event data, arrangement blocks, non-drum mixer channels outside the existing Drum Kit handler, master state, export handlers, project schema, or playback scheduling.
- Do not add sampling, imported audio, sampler devices, audio clips, remote AI, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing Drum Kit pad handler, Drum Kit preview summary, command result metrics, and follow-up copy.
- `README.md`: desktop command summary and Drum Kit feature description.
- `docs/product/product.md`: MVP and product framing.
- `docs/quality/rules.md`: Quick Actions and Drum Kit guardrails.
- `harness/scripts/run_qa.py`: static text/source expectations.

## Plan

- [x] Route the existing Drum Kit handler and preview summary into Quick Actions.
- [x] Add a `drum-kit` Quick Actions command that applies the currently suggested Drum Kit pad through the existing handler.
- [x] Add Drum Kit-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will apply `drumKitPreviewSummary.padId`, matching the visible Drum Kit suggestion instead of introducing new recommendation scoring.

## QA Log

- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run typecheck` passed.
- `npm run qa` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run harness:smoke` passed.
- `npm run build` passed.
- `npm run verify` passed.
- Browser smoke was not run because `npm run dev` failed in the sandbox with `listen EPERM: operation not permitted 127.0.0.1:5173`; the escalated dev-server attempt was rejected by environment policy.

## Review

- No issues found in post-QA review.
