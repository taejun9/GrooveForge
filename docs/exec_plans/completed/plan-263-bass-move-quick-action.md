# plan-263-bass-move-quick-action

## Goal

Add a Quick Actions command for the local 808 Move Preview so beginners can apply the current bassline/glide/contour recommendation from command search, and producers can reshape low-end movement without leaving the selected Pattern workflow.

## Non-Goals

- Do not change 808 Move Preview scoring, Bassline Pads, 808 Glide Pads, 808 Contour Pads, lane editing, arrangement behavior, playback scheduling, or export rendering.
- Do not add hidden generation, randomness, auto-arrangement, autoplay, auto-save, auto-export, onboarding overlays, or modal workflows.
- Do not mutate mixer, sound design, master state, project schema, sampler state, imported audio, or audio clips outside the existing 808 move handlers.
- Do not add sampling, remote AI, analytics, accounts, payments, cloud sync, or genre-specific trap-first behavior.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing 808 move handlers, 808 Move preview/result summaries, command result metrics, and follow-up copy.
- `README.md`: desktop command summary and 808 Move feature description.
- `docs/product/product.md`: direct beat composition, pattern editor, and MVP framing.
- `docs/quality/rules.md`: Quick Actions and 808 Move guardrails.
- `harness/scripts/run_qa.py`: static text/source expectations.

## Plan

- [x] Route the existing 808 Move preview summary and apply handlers into Quick Actions.
- [x] Add an `808-move` Quick Actions command that applies the current preview target through the matching existing handler.
- [x] Add 808 Move-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will apply the visible 808 Move Preview target only, matching Bassline/Glide/Contour pad behavior instead of introducing new recommendation logic.
- The command targets a Bassline pad when the selected Pattern has no 808 notes, then favors the current Glide candidate until a line has glide, then favors the current Contour candidate, so command search reshapes existing low-end motion without chaining handlers as a macro.

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
