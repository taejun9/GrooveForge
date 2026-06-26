# plan-861-groove-compass-reference-context

## Goal

Make the Command Reference Groove Compass row expose the same density, anchors, hat motion, timing, chance, pocket balance, selected-drum destination, groove metric, audition cue, cue action, and next-check posture already available in Groove Compass controls and Quick Actions.

## Scope

- Add static Groove Compass Command Reference row context for direct drum-pocket posture.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Groove Compass card derivation, card ids, cue behavior, focus routing, Quick Actions execution, drum editing, selected drum state, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Groove Compass scoring changes, focus/cue routing changes, drum auto-writing, groove correction, tutorials, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Groove Compass row from a compact target-only entry to a static context row that names density, anchors, hats, timing, chance, pocket balance, selected drum, destination, groove metric, audition cue, cue action, and next check.
- Documented the row context in README, product docs, and quality rules so Groove Compass discovery stays aligned with direct drum-pocket scanning.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Groove Compass should read as a compact density, anchors, hat motion, timing, chance, pocket balance, and selected-drum pocket scan rather than as an automatic groove correction or sampling workflow.
- Keep Groove Compass Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
