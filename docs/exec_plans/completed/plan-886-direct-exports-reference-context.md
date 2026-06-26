# plan-886-direct-exports-reference-context

## Goal

Make the Command Reference Direct Exports row expose explicit WAV, stem, MIDI, and Handoff Sheet export commands, deliverable/file context, Delivery Target, direct export result metrics, latest receipt, package readiness, send-order next step, audition cue, and next handoff check already available from local Direct Exports guidance.

## Scope

- Add static Direct Exports Command Reference row context for explicit deliverable export review.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, direct export command ids, export handlers, file names, file contents, render/download behavior, MIDI bytes, Handoff Sheet text, receipt derivation, Handoff Pack scoring, Send Order, Handoff Next Export, route readout, file manifest, project data, playback, and sampler scope.

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

- Added static Direct Exports row context in Command Reference for explicit WAV/stem/MIDI/Handoff Sheet commands, deliverable/file context, Delivery Target, direct export result metrics, latest receipt, package readiness, send-order next step, audition cue, and next handoff check.
- Updated README, product docs, quality rules, and QA harness text expectations for the new row context.
- Preserved command execution, direct export command ids, export handlers, file contents, render/download behavior, receipt derivation, Handoff Pack state, and sampling boundaries.

## Decision Log

- Direct Exports Command Reference rows should read as local explicit-export orientation, not as automatic batch export, archive creation, or delivery automation.
