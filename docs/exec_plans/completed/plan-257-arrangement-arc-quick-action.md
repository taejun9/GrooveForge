# plan-257-arrangement-arc-quick-action

## Goal

Add a Quick Actions command for Arrangement Arc so beginners can apply the current full-song energy-shaping suggestion from command search, and producers can quickly reshape song dynamics without leaving the command palette.

## Non-Goals

- Do not change Arrangement Arc pad definitions, preview/result scoring, arrangement block UI, or Next Move recommendations.
- Do not add new arrangement algorithms, command chains, hidden generation, auto-run, autoplay, auto-save, auto-export, onboarding overlays, or modal workflows.
- Do not mutate Pattern A/B/C musical event data, mixer state, sound design, master state, export handlers, project schema, or playback scheduling outside the existing Arrangement Arc pad handler.
- Do not add sampling, imported audio, sampler devices, audio clips, remote AI, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing Arrangement Arc pad handler, Arrangement Arc preview summary, command result metrics, and follow-up copy.
- `README.md`: desktop command summary and Arrangement Arc feature description.
- `docs/product/product.md`: MVP and product framing.
- `docs/quality/rules.md`: Quick Actions and Arrangement Arc guardrails.
- `harness/scripts/run_qa.py`: static text/source expectations.

## Plan

- [x] Route the existing Arrangement Arc handler and preview summary into Quick Actions.
- [x] Add an `arrangement-arc` Quick Actions command that applies the currently suggested arc pad through the existing handler.
- [x] Add Arrangement Arc-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will apply `arrangementArcPreviewSummary.padId`, matching the visible Arrangement Arc suggestion instead of introducing new recommendation scoring.

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
