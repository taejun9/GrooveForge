# plan-881-handoff-send-order-reference-context

## Goal

Make the Command Reference Handoff Send Order row expose the WAV -> stems -> MIDI -> Handoff Sheet delivery sequence, current next deliverable, package readiness, latest receipt, Handoff Next Export target, Handoff Pack follow-up, audition cue, and next handoff check already available from local Handoff Send Order guidance.

## Scope

- Add static Handoff Send Order Command Reference row context for delivery-order review before explicit exports.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Handoff Pack item status derivation, send-order derivation, next-export command routing, export handlers, file names, file contents, render/download behavior, receipt state, route readout, file manifest, Handoff Sheet text, project data, playback, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, automatic export, batch export, retries, ZIP/archive creation, native folder writing, background rendering, uploads, publishing/licensing claims, platform compliance claims, tutorials, macros, command chains, audio analysis changes, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Note: Vite reported the existing large chunk warning during `npm run build` and `npm run verify`.

## Implementation Notes

- Updated the Command Reference Handoff Send Order row from a compact target-only entry to a static context row that names the WAV/stems/MIDI/Handoff Sheet sequence, current next deliverable, send-order status, package readiness, latest export receipt, Handoff Next Export target, Handoff Pack follow-up, direct export scope, audition cue, and next handoff check.
- Documented the row context in README, product docs, and quality rules so Handoff Send Order discovery stays aligned with explicit local Send Order focus behavior and next-export checks.
- Added QA expectations for the new docs, quality rule, row target, row context, and visible Command Reference target text.

## Decision Log

- Handoff Send Order Command Reference rows should read as local delivery-order orientation before explicit export actions, not as automatic package creation or delivery.
- Keep Handoff Send Order Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
