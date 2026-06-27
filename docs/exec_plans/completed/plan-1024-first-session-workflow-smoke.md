# plan-1024-first-session-workflow-smoke

## Goal

Add automated evidence that a first session can move from the first-run project through setup, composition, arrangement, mix/master, and delivery as both a beginner-guided path and a producer-fast path without imported audio or sampling scope.

## Product Fit

The current gates prove first render, default starter data, all-style generated starts, export bytes, and desktop entry. The remaining product-proof gap is a concrete first-session workflow: first-time composers need the guided sequence to produce a usable beat, while working producers need fast transformations from the same local project into a deliverable state.

## Scope

- Added a Node workflow smoke that starts from `starterProject` and creates two named local projects: a beginner-guided first beat and a producer-fast pass.
- Verified each workflow changes setup, musical events, arrangement, delivery target, mix/master posture, save/load, export analysis, MIDI, and Handoff Sheet output while staying sample-free.
- Added the workflow smoke to local verification and release gates.
- Updated README, release readiness evidence, harness architecture, quality rules, and QA expectations.

## Non-Goals

- No UI redesign, browser automation, visible Electron launch, new workflow surface, project schema change, render algorithm change, MIDI encoding change, Handoff copy rewrite, installer/signing/notarization, remote AI, cloud sync, accounts, analytics, payments, imported audio, sample browsing, or sampler MVP work.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run workflow:smoke`
- Passed: `npm run release:check`

`npm run workflow:smoke` created `beginner:guided-first-beat` as an 86 BPM A minor lo-fi Starter Sketch with 8 bars and event counts 40/12/11/10, and `producer:fast-pass` as a 124 BPM C minor house Beat Store pass with 26 bars and event counts 68/16/15/13. Both workflows passed save/load, full-mix and stem analysis, MIDI, Handoff Sheet, and sampling-free checks. `npm run release:check` ran `npm run qa` and `npm run verify`, including quality gate, renderer smoke, workflow smoke, runtime smoke, typecheck, production build, and desktop entry smoke.

## Decision Log

- 2026-06-28: Add a workflow smoke after renderer smoke because first-render evidence proves the surfaces exist, while the product objective also needs proof that the same local domain can move a first session to deliverable beats.
- 2026-06-28: Split the workflow proof into beginner-guided and producer-fast passes so the user objective is verified as two concrete first-session routes rather than a single generic export check.
- 2026-06-28: Completed after diff check, QA, workflow smoke, and release gate passed.

## Status

- Completed.
