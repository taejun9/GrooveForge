# plan-851-mode-switch-reference-context

## Goal

Make the Command Reference Mode Switch row expose the same destination, current/target mode, transition, audition cue, and next-check posture now available in direct Mode Switch Quick Action details.

## Scope

- Add static Mode Switch Command Reference row context for Guided/Studio workflow switching.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, mode switching, command ids, Quick Actions execution, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, automatic mode switching, mode-switch scoring changes, tutorials, command chains, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Mode Switch row from a compact target-only entry to a static context row that names Guided/Studio workflow-switch destination, current mode, target mode, transition, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Mode Switch discovery stays aligned with direct beat-making workflow instead of sampler setup.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Command Reference should give Mode Switch users the same pre-run workflow-switch posture that direct command-palette users see, while remaining a static read-only map.
- Keep Mode Switch Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
