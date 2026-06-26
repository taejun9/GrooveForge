# plan-853-composer-guide-reference-context

## Goal

Make the Command Reference Composer Guide row expose the same drums, 808/bass, harmony, melody, arrangement, finish destination, guide metric, audition cue, and next-check posture already available in Composer Guide command details and visible focus controls.

## Scope

- Add static Composer Guide Command Reference row context for composition-stage writing focus.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Composer Guide scoring, command ids, Quick Actions execution, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Composer Guide scoring changes, focus routing changes, tutorials, command chains, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Composer Guide row from a compact target-only entry to a static context row that names drums, 808/bass, harmony, melody, arrange, and finish writing-focus destination, guide metric, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Composer Guide discovery stays aligned with direct composition-stage writing focus.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Command Reference should make Composer Guide read as a direct writing-focus guide for drums, 808/bass, harmony, melody, arrangement, and finish, not as a tutorial or sampling workflow.
- Keep Composer Guide Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
