# plan-856-beat-passport-reference-context

## Goal

Make the Command Reference Beat Passport row expose the same target, length, Pattern A/B/C, readiness, export, stems, master destination, passport metric, audition cue, and next-check posture already available in Beat Passport focus controls and Quick Actions.

## Scope

- Add static Beat Passport Command Reference row context for direct beat identity and delivery-readiness scanning.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Beat Passport metric derivation, metric ids, Quick Actions execution, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Beat Passport scoring changes, focus routing changes, tutorials, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Note: Vite reported the existing large chunk warning during build and verify.

## Implementation Notes

- Updated the Command Reference Beat Passport row from a compact target-only entry to a static context row that names target, length, Pattern A/B/C, readiness, export, stems, and master identity destination, passport metric, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Beat Passport discovery stays aligned with direct beat identity and delivery-readiness scanning.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Beat Passport should read as a compact beat identity and delivery-readiness scan for target, length, Pattern A/B/C, readiness, export, stems, and master posture rather than as a tutorial, auto-export step, or sampling workflow.
- Keep Beat Passport Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
