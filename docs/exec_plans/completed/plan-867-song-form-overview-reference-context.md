# plan-867-song-form-overview-reference-context

## Goal

Make the Command Reference Song Form Overview row expose the section-flow, Pattern A/B/C, bar-range, energy, mute posture, transition posture, priority action, action route, audition cue, and next-check context already available from local song-form guidance.

## Scope

- Add static Song Form Overview Command Reference row context for arrangement-form review.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Song Form Overview derivation, priority selection, selected-block navigation, arrangement data, Pattern data, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Song Form Overview scoring changes, hidden generation, automatic arrangement writing, automatic section fixes, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Song Form Overview row from a compact target-only entry to a static context row that names section flow, Pattern A/B/C usage, bar ranges, energy, muted tracks, transition posture, priority action, action route, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Song Form Overview discovery stays aligned with local arrangement-form review and selected-block navigation.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Song Form Overview should read as a local arrangement-form review for section flow, Pattern A/B/C usage, bar ranges, energy, mutes, and transitions rather than an automatic arranger, hidden generator, or sampling workflow.
- Keep Song Form Overview Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
