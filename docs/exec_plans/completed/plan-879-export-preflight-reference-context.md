# plan-879-export-preflight-reference-context

## Goal

Make the Command Reference Export Preflight row expose readiness, mix risk, handoff risk, export blockers, package posture, audition cue, and next export check already available from local Deliver guidance.

## Scope

- Add static Export Preflight Command Reference row context for export readiness and delivery-risk review.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Export Preflight derivation, export handlers, file names, file contents, render/download behavior, Handoff Pack, Delivery Target Alignment, Session Brief, project data, playback, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, automatic export, hidden mix fixes, hidden mastering, hidden package creation, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, audio analysis changes, platform-loudness guarantees, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Export Preflight row from a compact target-only entry to a static context row that names selected Delivery Target, export readiness, mix/master risk, Master Automation posture, WAV/stem/MIDI deliverables, Session Brief/Handoff Sheet context, package readiness, Priority Readout, audition cue, and next Export Preflight check.
- Documented the row context in README, product docs, and quality rules so Export Preflight discovery stays aligned with explicit local delivery-risk focus behavior and pre-export checks.
- Added QA expectations for the new docs, quality rule, row target, row context, and visible Command Reference target text.

## Decision Log

- Export Preflight Command Reference rows should read as a local readiness and delivery-risk orientation before export actions, not as automatic export execution or mastering correction.
- Keep Export Preflight Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
