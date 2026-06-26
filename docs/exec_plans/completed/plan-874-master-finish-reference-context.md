# plan-874-master-finish-reference-context

## Goal

Make the Command Reference Master Finish Decision and Master Finish rows expose the suggested/current output posture, master finish target, preset, ceiling, output gain, direct finish pad route, audition cue, export/manual-trim next check, and result context already available from local Master Finish guidance.

## Scope

- Add static Master Finish Command Reference row context for suggested/current output posture and direct finish pads.
- Keep the rows discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Master Finish pad definitions, preview derivation, apply handlers, master state, musical events, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Master Finish scoring changes, automatic mastering, automatic export, hidden mix fixes, hidden mastering, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, auto-export, audio analysis changes, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Master Finish Decision and Master Finish rows from compact target-only entries to static context rows that name suggested/current output posture, current finish target, preset, ceiling, output gain, direct finish pad route, audition cue, result feedback, and export/manual-trim next check.
- Documented the row context in README, product docs, and quality rules so Master Finish discovery stays aligned with local master-output preview/apply and explicit direct pad routing.
- Added QA expectations for the new docs, quality rule, row targets, and row contexts.

## Decision Log

- Master Finish Command Reference rows should read as local master-output orientation for preview/apply and direct finish pads rather than automatic mastering, platform compliance, or export automation.
- Keep Master Finish Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
