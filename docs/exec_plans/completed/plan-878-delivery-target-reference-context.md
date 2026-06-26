# plan-878-delivery-target-reference-context

## Goal

Make the Command Reference Delivery Target Alignment row expose selected target fit, target length, arrangement length, master posture, mix posture, stem expectation, Session Brief context, package readiness, audition cue, and next delivery check already available from local Delivery Target Alignment guidance.

## Scope

- Add static Delivery Target Alignment Command Reference row context for target-fit preview/result and follow-up delivery posture.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Delivery Target selection/custom editing, alignment preview derivation, Align behavior, arrangement templates, mixer/master update paths, export handlers, file contents, render/download behavior, project data, playback, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, target selection changes, automatic alignment, automatic export, hidden arrangement writing, hidden mastering, hidden mix fixes, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, audio analysis changes, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Delivery Target Alignment row from a compact target-only entry to a static context row that names selected target, target fit, target length, arrangement length, master posture, mix posture, stem expectation, Session Brief context, package readiness, audition cue, and next delivery check.
- Documented the row context in README, product docs, and quality rules so Delivery Target Alignment discovery stays aligned with explicit local Align behavior and delivery follow-up checks.
- Added QA expectations for the new docs, quality rule, row target, row context, and visible Command Reference target text.

## Decision Log

- Delivery Target Alignment Command Reference rows should read as local target-fit orientation for explicit Align and delivery follow-up rather than automatic arrangement, mastering, or export.
- Keep Delivery Target Alignment Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
