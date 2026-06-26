# plan-860-key-compass-reference-context

## Goal

Make the Command Reference Key Compass row expose the same scale, cadence, chords, 808/bass, melody, selected-note/chord destination, key metric, audition cue, and next-check posture already available in Key Compass controls and Quick Actions.

## Scope

- Add static Key Compass Command Reference row context for direct harmony-writing posture.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Key Compass card derivation, card ids, focus routing, Quick Actions execution, key retargeting, note/chord editing, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Key Compass scoring changes, focus routing changes, key rewriting, chord generation, melody generation, tutorials, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Key Compass row from a compact target-only entry to a static context row that names scale, cadence, chords, 808/bass, melody, selected note/chord, destination, key metric, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Key Compass discovery stays aligned with direct harmony-writing scanning.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Key Compass should read as a compact scale, cadence, chord, 808/bass, melody, and selected-note/chord harmony scan rather than as an automatic rewrite or generation workflow.
- Keep Key Compass Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
