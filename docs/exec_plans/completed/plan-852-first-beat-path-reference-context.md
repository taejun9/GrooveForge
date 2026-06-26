# plan-852-first-beat-path-reference-context

## Goal

Make the Command Reference First Beat Path row expose the same setup, compose, arrange, mix, deliver destination, audition cue, and next-check posture already available in First Beat Path Quick Action command details and visible buttons.

## Scope

- Add static First Beat Path Command Reference row context for the sample-free first-beat workflow path.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, First Beat Path scoring, command ids, Quick Actions execution, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, path scoring changes, jump routing changes, tutorials, command chains, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference First Beat Path row from a compact target-only entry to a static context row that names setup/compose/arrange/mix/deliver destination, path metric, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so First Beat Path discovery stays aligned with direct sample-free beat composition.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Command Reference should make First Beat Path read as the direct sample-free beat creation path, not as a sampler or browsing workflow.
- Keep First Beat Path Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
