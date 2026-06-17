# plan-265-chord-move-quick-action

## Goal

Add a Quick Actions command for the local Chord Move Preview so beginners can apply the current harmonic/rhythm/voicing recommendation from command search, and producers can reshape chord color and timing without leaving the selected Pattern workflow.

## Non-Goals

- Do not change Chord Move Preview scoring, Chord Pads, Chord Rhythm Pads, Chord Voicing Pads, selected-chord editing, arrangement behavior, playback scheduling, or export rendering.
- Do not add hidden generation, randomness, auto-arrangement, autoplay, auto-save, auto-export, onboarding overlays, or modal workflows.
- Do not mutate mixer, sound design, master state, project schema, sampler state, imported audio, or audio clips outside the existing Chord move handlers.
- Do not add sampling, remote AI, analytics, accounts, payments, cloud sync, or genre-specific trap-first behavior.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing Chord move handlers, Chord Move preview/result summaries, command result metrics, and follow-up copy.
- `README.md`: desktop command summary and Chord Move feature description.
- `docs/product/product.md`: direct beat composition, pattern editor, and MVP framing.
- `docs/quality/rules.md`: Quick Actions and Chord Move guardrails.
- `harness/scripts/run_qa.py`: static text/source expectations.

## Plan

- [x] Route the existing Chord Move preview summary and apply handlers into Quick Actions.
- [x] Add a `chord-move` Quick Actions command that applies the current preview target through the matching existing handler.
- [x] Add Chord Move-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will apply the visible Chord Move Preview target only, matching Chord Pad/Rhythm/Voicing pad behavior instead of introducing new recommendation logic.
- The command is disabled when no chord is selected or the Chord Move Preview is aligned. When active, it prioritizes an out-of-key harmonic Pad correction, then the current Rhythm candidate, then the current Voicing candidate, then Pad fallback, so one chord dimension changes per explicit command.

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

- No issues found in post-QA review. The change routes through existing Chord Pad, Chord Rhythm, and Chord Voicing handlers, keeps preview/result state UI-local, and does not add sampling, hidden generation, remote AI, schema changes, or autoplay.
