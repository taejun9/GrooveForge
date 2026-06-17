# plan-256-arrangement-template-quick-action

## Goal

Add a Quick Actions command for Arrangement Template so beginners can apply a complete beat/song structure from command search, and producers can quickly reshape the arrangement without leaving the command palette.

## Non-Goals

- Do not change Arrangement Template definitions, preview/result scoring, arrangement block UI, or Next Move recommendations.
- Do not add new arrangement algorithms, command chains, hidden generation, auto-run, autoplay, auto-save, auto-export, onboarding overlays, or modal workflows.
- Do not mutate Pattern A/B/C musical event data, mixer state, sound design, master state, export handlers, project schema, or playback scheduling outside the existing Arrangement Template handler.
- Do not add sampling, imported audio, sampler devices, audio clips, remote AI, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing Arrangement Template handler, Arrangement Template preview summary, command result metrics, and follow-up copy.
- `README.md`: desktop command summary and Arrangement Template feature description.
- `docs/product/product.md`: MVP and product framing.
- `docs/quality/rules.md`: Quick Actions and Arrangement Template guardrails.
- `harness/scripts/run_qa.py`: static text/source expectations.

## Plan

- [x] Route the existing Arrangement Template handler and preview summary into Quick Actions.
- [x] Add an `arrangement-template` Quick Actions command that applies the currently suggested template through the existing handler.
- [x] Add Arrangement Template-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will apply the current `arrangementTemplatePreviewSummary.templateId`, matching the visible Arrangement Template suggestion instead of introducing new recommendation scoring.

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
