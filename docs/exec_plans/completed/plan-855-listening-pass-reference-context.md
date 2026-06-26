# plan-855-listening-pass-reference-context

## Goal

Make the Command Reference Listening Pass row expose the same composition, arrangement, mix, delivery destination, listening metric, audition cue, and next-check posture already available in Listening Pass focus controls and Quick Actions.

## Scope

- Add static Listening Pass Command Reference row context for direct beat audition checkpoints.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Listening Pass checkpoint derivation, checkpoint ids, Quick Actions execution, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Listening Pass scoring changes, focus routing changes, tutorials, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Listening Pass row from a compact target-only entry to a static context row that names composition, arrangement, mix, and delivery audition-checkpoint destination, listening metric, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Listening Pass discovery stays aligned with by-ear direct beat audition rather than audio analysis or sampling workflows.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Listening Pass should read as a direct by-ear production checkpoint for composition, arrangement, mix, and delivery rather than as audio analysis, tutorial, or sampling workflow.
- Keep Listening Pass Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
