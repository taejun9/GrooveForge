# plan-884-handoff-package-check-reference-context

## Goal

Make the Command Reference Handoff Package Check row expose file-set readiness, send order, latest receipt, session context, package priority, focus route, direct package result metrics, audition cue, and next package check already available from local Handoff Package Check guidance.

## Scope

- Add static Handoff Package Check Command Reference row context for send-package readiness review.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Handoff Pack scoring, package card derivation, priority selection, focus routing, receipt derivation, Send Order, Handoff Next Export, export handlers, file names, file contents, render/download behavior, MIDI bytes, Handoff Sheet text, project data, playback, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, automatic export, batch export, retries, ZIP/archive creation, native folder writing, background rendering, uploads, publishing/licensing claims, platform compliance claims, tutorials, macros, command chains, audio analysis changes, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build` (Vite reported the existing large chunk warning.)
- Passed: `npm run qa`
- Passed: `npm run verify` (14/14 sample-free 8-bar blueprints and 14/14 supported style profiles passed.)

## Implementation Notes

- Added static Handoff Package Check row context in Command Reference for file-set readiness, send order status, latest export receipt, Session Brief context, package priority, focus route, direct package result metrics, audition cue, and next package check.
- Updated README, product docs, quality rules, and QA harness text expectations for the new row context.
- Preserved command execution, package-check derivation, priority selection, focus routing, receipt derivation, export handlers, file contents, render/download behavior, Handoff Pack state, and sampling boundaries.

## Decision Log

- Handoff Package Check Command Reference rows should read as local send-package readiness orientation, not as archive creation, automatic export, or delivery automation.
