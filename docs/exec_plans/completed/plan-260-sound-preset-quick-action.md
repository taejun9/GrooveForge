# plan-260-sound-preset-quick-action

## Goal

Add a Quick Actions command for Sound Preset so beginners can apply the current full-tone preset preview from command search, and producers can quickly reshape built-in drums, 808, ducking, synth, and chord posture without leaving the command palette.

## Non-Goals

- Do not change sound preset definitions, preview/result scoring, Sound panel layout, Drum Kit pads, Sound Focus pads, or Studio tone controls.
- Do not add new sound algorithms, hidden generation, auto-run, autoplay, auto-save, auto-export, onboarding overlays, or modal workflows.
- Do not mutate musical event data, arrangement blocks, mixer state, master state, export handlers, project schema, or playback scheduling outside the existing Sound Preset handler.
- Do not add sampling, imported audio, sampler devices, audio clips, remote AI, analytics, accounts, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing Sound Preset handler, Sound Preset preview summary, command result metrics, and follow-up copy.
- `README.md`: desktop command summary and Sound Preset feature description.
- `docs/product/product.md`: MVP and product framing.
- `docs/quality/rules.md`: Quick Actions and Sound Preset guardrails.
- `harness/scripts/run_qa.py`: static text/source expectations.

## Plan

- [x] Route the existing Sound Preset handler and preview summary into Quick Actions.
- [x] Add a `sound-preset` Quick Actions command that applies the current Sound Preset preview target through the existing handler.
- [x] Add Sound Preset-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will apply `soundPresetPreviewSummary.presetId`, matching the visible Sound Preset preview target instead of introducing new recommendation scoring.

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
