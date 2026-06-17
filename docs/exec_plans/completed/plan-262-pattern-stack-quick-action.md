# plan-262-pattern-stack-quick-action

## Goal

Add a Quick Actions command for Pattern Stack so beginners can start or reshape the selected Pattern A/B/C with the current 808/chord/Synth stack preview from command search, and producers can quickly audition editable harmonic and melodic sketches without leaving the command palette.

## Non-Goals

- Do not change Pattern Stack definitions, preview/result scoring, Pattern editor layout, Pattern Clone Pads, Layer Starter, Pattern Chain, arrangement behavior, or lane editing tools.
- Do not add hidden generation, randomness, auto-arrangement, autoplay, auto-save, auto-export, onboarding overlays, or modal workflows.
- Do not mutate mixer, sound design, master state, project schema, export handlers, or playback scheduling outside the existing Pattern Stack handler.
- Do not add sampling, imported audio, sampler devices, audio clips, remote AI, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing Pattern Stack handler, Pattern Stack preview summary, command result metrics, and follow-up copy.
- `README.md`: desktop command summary and Pattern Stack feature description.
- `docs/product/product.md`: pattern editor and MVP framing.
- `docs/quality/rules.md`: Quick Actions and Pattern Stack guardrails.
- `harness/scripts/run_qa.py`: static text/source expectations.

## Plan

- [x] Route the existing Pattern Stack preview summary and apply handler into Quick Actions.
- [x] Add a `pattern-stack` Quick Actions command that applies the current Pattern Stack preview target through the existing handler.
- [x] Add Pattern Stack-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will apply `patternStackPreviewSummary.stackId` when it is not `none`, matching the visible Pattern Stack preview target instead of introducing new stack recommendation scoring.

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
