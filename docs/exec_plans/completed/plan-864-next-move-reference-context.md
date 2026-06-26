# plan-864-next-move-reference-context

## Goal

Make the Command Reference Next Move row expose the readiness/export-driven recommendation, explicit action, route, before/after posture, delivery target, readiness/export/stem posture, audition cue, and next-check posture already available from local Next Move guidance.

## Scope

- Add static Next Move Command Reference row context for direct recommended-action posture.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Next Move recommendation derivation, action ordering, action definitions, explicit action handlers, Quick Actions execution, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, recommendation scoring changes, hidden generation, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Next Move row from a compact target-only entry to a static context row that names recommendation, route, readiness, export, stems, before/after posture, delivery target, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Next Move discovery stays aligned with explicit beat-completion actions.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Next Move should read as a local explicit-action recommendation for direct beat completion rather than an automatic workflow runner, hidden generator, or sampling workflow.
- Keep Next Move Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
