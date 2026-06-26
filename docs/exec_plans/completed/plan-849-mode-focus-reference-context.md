# plan-849-mode-focus-reference-context

## Goal

Make the Command Reference Mode Focus row expose the same destination, mode metric, context, audition cue, and next-check posture now available in Mode Focus Quick Action command details.

## Scope

- Add static Mode Focus Command Reference row context for Guided/Studio orientation pre-run posture.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Mode Focus scoring, command ids, Quick Actions execution, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Mode Focus scoring changes, mode switching changes, tutorials, command chains, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Implementation Notes

- Updated the Command Reference Mode Focus row from a compact target-only entry to a static context row that names Guided/Studio orientation destination, mode metric, local context, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Command Reference discovery stays aligned with direct beat-composition workflow instead of sampler setup.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Command Reference should name the same Mode Focus pre-run posture fields that command-palette users see in live Mode Focus command details.
- Keep Mode Focus Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
