# plan-261-mix-balance-quick-action

## Goal

Add a Quick Actions command for Mix Balance so beginners can apply the current rough-balance preview from command search, and producers can quickly set an editable Drums/808/Synth/Chords mix posture without leaving the command palette.

## Non-Goals

- Do not change Mix Balance Pad definitions, preview/result scoring, mixer panel layout, Stem Audition Pads, Mix Coach, Mix Fix, Master Finish, or Space FX behavior.
- Do not add auto-mixing, hidden mastering, render downloads, autoplay, auto-save, auto-export, onboarding overlays, or modal workflows.
- Do not mutate musical events, arrangement blocks, sound design, master state, export handlers, project schema, or playback scheduling outside the existing Mix Balance handler.
- Do not add sampling, imported audio, sampler devices, audio clips, remote AI, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing Mix Balance handler, Mix Balance preview summary, command result metrics, and follow-up copy.
- `README.md`: desktop command summary and mixer feature description.
- `docs/product/product.md`: MVP and mixer/master framing.
- `docs/quality/rules.md`: Quick Actions and Mix Balance guardrails.
- `harness/scripts/run_qa.py`: static text/source expectations.

## Plan

- [x] Route the existing Mix Balance preview summary and apply handler into Quick Actions.
- [x] Add a `mix-balance` Quick Actions command that applies the current Mix Balance preview pad through the existing handler.
- [x] Add Mix Balance-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will apply `mixBalancePreviewSummary.padId`, matching the visible Mix Balance preview target instead of introducing new mix recommendation scoring.

## QA Log

- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run typecheck` passed.
- `npm run qa` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run harness:smoke` passed.
- `npm run build` passed.
- `npm run verify` passed.
- Browser smoke was not run because `npm run dev` failed in the sandbox with `listen EPERM: operation not permitted 127.0.0.1:5173`, and the escalated localhost-only dev-server retry was rejected by environment policy.

## Review

- No issues found in post-QA review.
