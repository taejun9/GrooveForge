# plan-875-master-automation-reference-context

## Goal

Make the Command Reference Master Automation Decision and Master Automation rows expose the suggested/current fade posture, current automation target, direct fade pad route, editable fade event range, playback/export application scope, audition cue, result feedback, and export/manual-trim next check already available from local Master Automation guidance.

## Scope

- Add static Master Automation Command Reference row context for suggested/current fade posture and direct fade pads.
- Keep the rows discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Master Automation pad definitions, preview derivation, apply handlers, master automation event storage, playback gain, WAV/stem export gain, project data, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Master Automation scoring changes, automatic fades, automatic export, hidden mix fixes, hidden mastering, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, auto-export, audio analysis changes, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Master Automation Decision and Master Automation rows from compact target-only entries to static context rows that name suggested/current fade posture, current automation target, editable fade event range, direct fade pad route, playback/export gain scope, audition cue, result feedback, and export/manual-trim next check.
- Documented the row context in README, product docs, and quality rules so Master Automation discovery stays aligned with local editable master automation events and realtime/render export gain parity.
- Added QA expectations for the new docs, quality rule, row targets, row contexts, and visible Command Reference target text.

## Decision Log

- Master Automation Command Reference rows should read as local fade-orientation for explicit editable master automation events rather than automatic mastering, platform compliance, or export automation.
- Keep Master Automation Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
