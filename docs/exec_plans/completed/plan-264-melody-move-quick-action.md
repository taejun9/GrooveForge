# plan-264-melody-move-quick-action

## Goal

Add a Quick Actions command for the local Melody Move Preview so beginners can apply the current motif/accent/contour recommendation from command search, and producers can reshape Synth phrase motion without leaving the selected Pattern workflow.

## Non-Goals

- Do not change Melody Move Preview scoring, Melody Motif Pads, Melody Accent Pads, Melody Contour Pads, lane editing, arrangement behavior, playback scheduling, or export rendering.
- Do not add hidden generation, randomness, auto-arrangement, autoplay, auto-save, auto-export, onboarding overlays, or modal workflows.
- Do not mutate mixer, sound design, master state, project schema, sampler state, imported audio, or audio clips outside the existing Melody move handlers.
- Do not add sampling, remote AI, analytics, accounts, payments, cloud sync, or genre-specific trap-first behavior.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing Melody move handlers, Melody Move preview/result summaries, command result metrics, and follow-up copy.
- `README.md`: desktop command summary and Melody Move feature description.
- `docs/product/product.md`: direct beat composition, pattern editor, and MVP framing.
- `docs/quality/rules.md`: Quick Actions and Melody Move guardrails.
- `harness/scripts/run_qa.py`: static text/source expectations.

## Plan

- [x] Route the existing Melody Move preview summary and apply handlers into Quick Actions.
- [x] Add a `melody-move` Quick Actions command that applies the current preview target through the matching existing handler.
- [x] Add Melody Move-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will apply the visible Melody Move Preview target only, matching Melody Motif/Accent/Contour pad behavior instead of introducing new recommendation logic.
- The command targets a Motif pad when the selected Pattern has no Synth notes, then favors the current Contour candidate for flat/simple pitch phrases and the current Accent candidate for phrase dynamics, so command search reshapes one Melody dimension at a time through existing handlers.

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
