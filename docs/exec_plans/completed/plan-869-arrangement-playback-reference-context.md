# plan-869-arrangement-playback-reference-context

## Goal

Make the Command Reference Arrangement Playback Readout and Audible Arrangement Follow rows expose the edit-vs-heard block, selected block, audible block, Pattern A/B/C, bar context, follow action, follow route, audition cue, and next-check context already available from local arrangement playback guidance.

## Scope

- Add static Arrangement Playback Readout and Audible Arrangement Follow Command Reference row context for edit-versus-audible arrangement orientation.
- Keep both rows discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Arrangement Playback Readout derivation, realtime playback snapshots, selected-block behavior, Audible Arrangement Follow routing, follow result metrics, arrangement data, Pattern data, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, playback scheduling changes, automatic follow mode, auto-selecting during playback without a click, hidden generation, automatic arrangement writing, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Arrangement Playback Readout and Audible Arrangement Follow rows from compact target-only entries to static context rows that name edit-vs-heard block, selected block, audible block, Pattern A/B/C, bar context, explicit follow action, follow route, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so arrangement playback discovery stays aligned with local edit-versus-audible orientation and explicit follow routing.
- Added QA expectations for the new docs, quality rule, row targets, and row contexts.

## Decision Log

- Arrangement Playback Readout and Audible Arrangement Follow should read as local orientation for edit-vs-heard arrangement context rather than automatic follow mode or hidden arrangement behavior.
- Keep Arrangement Playback Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
