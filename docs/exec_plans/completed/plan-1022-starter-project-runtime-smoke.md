# plan-1022-starter-project-runtime-smoke

## Goal

Add runtime smoke evidence that the actual first-run `starterProject` used by the app can be saved, reopened, rendered, exported, and handed off without samples.

## Product Fit

The app must work for a first-time composer immediately after opening, while still giving working producers a usable editable beat state. The all-style and blueprint smokes prove generated starts, but the exact default project loaded by the React app should also be a named runtime smoke case.

## Scope

- Added the app `starterProject` as a runtime smoke case.
- Validated starter BPM/key/style, Guided mode, selected Pattern, core track set, Pattern A/B/C events, arrangement length, project roundtrip, WAV/stem/MIDI output, Handoff Sheet, and sampling-free project data.
- Updated README, product docs, harness architecture, release readiness evidence, quality rules, and QA expectations.
- Ran the release gate before completion.

## Non-Goals

- No starter project redesign, UI layout change, new instrument, new style, project schema change, render algorithm change, MIDI encoding change, Handoff copy rewrite, installer/signing/notarization, GUI launch, browser automation, remote AI, cloud sync, accounts, analytics, payments, imported audio, sample browsing, or sampler MVP work.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run harness:smoke`
- Passed: `npm run release:check`

`npm run harness:smoke` verified starter 1/1, Beat Blueprints 14/14, style profiles 14/14, legacy migration 1/1, project roundtrips 30/30, Handoff Sheets 30/30, and mocked download path 8/8. `npm run release:check` ran `npm run qa` and `npm run verify`, including quality gate, runtime smoke, typecheck, production build, and desktop entry smoke.

## Decision Log

- 2026-06-28: Treat the app's first-run starter project as a separate smoke case because it is the project state users see before choosing a style or blueprint.
- 2026-06-28: Kept starter validation separate from generated 8-bar style/blueprint validation because the first-run app project is a longer editable default state, not another generated 8-bar smoke case.
- 2026-06-28: Completed after diff check, QA, runtime smoke, and release gate passed.

## Status

- Completed.
