# plan-857-production-snapshot-reference-context

## Goal

Make the Command Reference Production Snapshot row expose the same target, form, Pattern A/B/C, mix, handoff destination, snapshot metric, audition cue, and next-check posture already available in Production Snapshot focus controls and Quick Actions.

## Scope

- Add static Production Snapshot Command Reference row context for direct session-scan posture.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Production Snapshot metric derivation, metric ids, Quick Actions execution, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Production Snapshot scoring changes, focus routing changes, tutorials, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Production Snapshot row from a compact target-only entry to a static context row that names target, form, Pattern A/B/C, mix, and handoff session-scan destination, snapshot metric, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Production Snapshot discovery stays aligned with direct session scanning.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Production Snapshot should read as a compact target, form, Pattern A/B/C, mix, and handoff session scan rather than as a tutorial, auto-fix loop, or sampling workflow.
- Keep Production Snapshot Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
