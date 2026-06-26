# plan-854-beat-readiness-reference-context

## Goal

Make the Command Reference Beat Readiness row expose the same drums, 808/bass, melody/chords, arrangement, export destination, readiness metric, audition cue, and next-check posture already available in Beat Readiness focus controls and Quick Actions.

## Scope

- Add static Beat Readiness Command Reference row context for direct beat-completion checks.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Beat Readiness scoring, check ids, Quick Actions execution, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Beat Readiness scoring changes, focus routing changes, tutorials, command chains, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Beat Readiness row from a compact target-only entry to a static context row that names drums, 808/bass, melody/chords, arrangement, and export readiness destination, readiness metric, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Beat Readiness discovery stays aligned with direct beat-completion checks.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Beat Readiness should read as a direct beat-completion scan for drums, 808/bass, melody/chords, arrangement, and export rather than as a tutorial, auto-fix loop, or sampling workflow.
- Keep Beat Readiness Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
