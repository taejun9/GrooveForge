# plan-266-drum-move-quick-action

## Goal

Add a Quick Actions command for the local Drum Move Preview so beginners can apply the current rhythm/feel/accent recommendation from command search, and producers can reshape drum pocket without leaving the selected Pattern workflow.

## Non-Goals

- Do not change Drum Move Preview scoring, Drum Foundation Pads, Groove Feel Pads, Drum Accent Pads, selected-drum editing, arrangement behavior, playback scheduling, or export rendering.
- Do not add hidden generation, randomness, auto-arrangement, autoplay, auto-save, auto-export, onboarding overlays, or modal workflows.
- Do not mutate bass, chord, melody, mixer, sound design, master state, project schema, sampler state, imported audio, or audio clips outside the existing Drum move handlers.
- Do not add sampling, remote AI, analytics, accounts, payments, cloud sync, or genre-specific trap-first behavior.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing Drum move handlers, Drum Move preview/result summaries, command result metrics, and follow-up copy.
- `README.md`: desktop command summary and Drum Move feature description.
- `docs/product/product.md`: direct beat composition, pattern editor, and MVP framing.
- `docs/quality/rules.md`: Quick Actions and Drum Move guardrails.
- `harness/scripts/run_qa.py`: static text/source expectations.

## Plan

- [x] Route the existing Drum Move preview summary and apply handlers into Quick Actions.
- [x] Add a `drum-move` Quick Actions command that applies the current preview target through the matching existing handler.
- [x] Add Drum Move-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will apply the visible Drum Move Preview target only, matching Drum Foundation/Groove Feel/Drum Accent pad behavior instead of introducing new recommendation logic.
- The command is disabled when the Drum Move Preview is aligned. When active, it prioritizes Foundation for empty drum patterns, then Feel, Accent, and Foundation fallback, so one drum dimension changes per explicit command while existing pad behavior remains the only mutation path.

## QA Log

- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run typecheck` passed.
- `npm run qa` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run harness:smoke` passed.
- `npm run build` passed.
- `npm run verify` passed.
- Browser smoke via `npm run dev` was blocked by sandbox `listen EPERM` on `127.0.0.1:5173`; escalated localhost dev-server execution was rejected by the environment policy, so no browser session was opened.

## Review

- No issues found in post-QA review. The change routes through existing Drum Foundation, Groove Feel, and Drum Accent handlers, keeps preview/result state UI-local, and does not add sampling, hidden generation, remote AI, schema changes, autoplay, or analytics.
