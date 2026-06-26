# plan-872-mix-balance-reference-context

## Goal

Make the Command Reference Mix Balance Decision and Mix Balance rows expose the suggested/current rough-balance target, preview/apply posture, editable channel scope, current Drums/808/Synth/Chords channel posture, direct balance pad route, audition cue, and next-check context already available from local Mix Balance guidance.

## Scope

- Add static Mix Balance Command Reference row context for rough-balance preview/apply decisions and direct balance pads.
- Keep the rows discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Mix Balance pad definitions, preview derivation, apply handlers, mixer update paths, musical events, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Mix Balance scoring changes, automatic balancing, automatic apply, hidden mix fixes, hidden mastering, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Mix Balance Decision and Mix Balance rows from compact target-only entries to static context rows that name suggested/current rough-balance target, preview/apply posture, editable channel scope, Drums/808/Synth/Chords channel posture, direct balance pad route, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Mix Balance discovery stays aligned with local rough-balance preview/apply and explicit direct pad routing.
- Added QA expectations for the new docs, quality rule, row targets, and row contexts.

## Decision Log

- Mix Balance Command Reference rows should read as local rough-balance orientation for preview/apply and direct balance pads rather than an automatic mixer, hidden mastering path, or export workflow.
- Keep Mix Balance Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
