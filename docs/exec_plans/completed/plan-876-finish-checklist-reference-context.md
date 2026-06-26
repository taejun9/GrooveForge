# plan-876-finish-checklist-reference-context

## Goal

Make the Command Reference Finish Checklist row expose Compose, Arrange, Mix, Master, Master Automation, and Handoff readiness posture, priority readout, direct checklist card route, focus result, audition cue, and export/manual-trim next check already available from local Finish Checklist guidance.

## Scope

- Add static Finish Checklist Command Reference row context for finish readiness posture and direct checklist focus cards.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Finish Checklist card derivation/order/scoring, Priority Readout derivation, visible priority action behavior, focus routing, direct card command routing, project data, playback, render/export, Handoff behavior, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, checklist scoring changes, automatic fixes, automatic mastering, automatic export, hidden generation, hidden mix fixes, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, auto-export, audio analysis changes, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Finish Checklist row from a compact target-only entry to a static context row that names Compose, Arrange, Mix, Master, Master Automation, and Handoff readiness, Priority Readout, direct checklist card routes, Focus Result, audition cue, and export/manual-trim next check.
- Documented the row context in README, product docs, and quality rules so Finish Checklist discovery stays aligned with local finish-readiness cards and explicit focus routing.
- Added QA expectations for the new docs, quality rule, row target, row context, and visible Command Reference target text.

## Decision Log

- Finish Checklist Command Reference rows should read as local finish-readiness orientation for explicit focus cards rather than automatic fixing, automatic mastering, or export automation.
- Keep Finish Checklist Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
