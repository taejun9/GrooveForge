# plan-885-handoff-next-export-reference-context

## Goal

Make the Command Reference Handoff Next Export row expose the current next WAV, stem, MIDI, or Handoff Sheet deliverable, explicit export route, deliverable/file context, Delivery Target, package readiness, send-order status, latest receipt, audition cue, and next handoff step already available from local Handoff Next Export guidance.

## Scope

- Add static Handoff Next Export Command Reference row context for next-deliverable review.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, next-export selection, single-deliverable routing, export handlers, file names, file contents, render/download behavior, MIDI bytes, Handoff Sheet text, receipt derivation, Handoff Pack scoring, Send Order, route readout, file manifest, project data, playback, and sampler scope.

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

- Added static Handoff Next Export row context in Command Reference for current next deliverable, explicit export route, deliverable/file context, Delivery Target, package readiness, send-order status, latest export receipt, audition cue, and next handoff step.
- Updated README, product docs, quality rules, and QA harness text expectations for the new row context.
- Preserved command execution, next-export selection, single-deliverable routing, export handlers, file contents, render/download behavior, receipt derivation, Handoff Pack state, and sampling boundaries.

## Decision Log

- Handoff Next Export Command Reference rows should read as local next-deliverable orientation, not as automatic package export or delivery automation.
