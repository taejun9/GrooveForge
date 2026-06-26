# plan-863-workflow-navigator-reference-context

## Goal

Make the Command Reference Workflow Navigator row expose the Compose, Arrange, Mix, Deliver, destination, readiness metric, zone context, audition cue, jump action, and next-check posture already available from local workflow navigation.

## Scope

- Add static Workflow Navigator Command Reference row context for direct workstation-zone navigation.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Workflow Navigator item derivation, item order, zone jump routing, Workflow Spotlight behavior, Quick Actions execution, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, navigator scoring changes, automatic stage selection, tutorials, macros, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Workflow Navigator row from a compact target-only entry to a static context row that names Compose, Arrange, Mix, Deliver, destination, readiness metric, zone context, audition cue, jump action, and next check.
- Documented the row context in README, product docs, and quality rules so Workflow Navigator discovery stays aligned with direct workstation-zone navigation.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Workflow Navigator should read as a local workstation-zone jump map for direct beat completion rather than an onboarding overlay, automatic workflow runner, or sampling workflow.
- Keep Workflow Navigator Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
