# plan-865-beat-map-reference-context

## Goal

Make the Command Reference Beat Map row expose the workflow stage, song/pattern metrics, export/stem metrics, delivery target, completion posture, producer overview, action route, audition cue, and next-check posture already available from local Beat Map guidance.

## Scope

- Add static Beat Map Command Reference row context for direct production-overview posture.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Beat Map derivation, stage scoring, action suggestions, Next Move routing, explicit action handlers, Quick Actions execution, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Beat Map scoring changes, hidden generation, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Beat Map row from a compact target-only entry to a static context row that names workflow stages, song/pattern metrics, export/stem metrics, delivery target, completion posture, producer overview, action route, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Beat Map discovery stays aligned with local production overview and explicit action routing.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Beat Map should read as a local production overview for workflow stages and producer metrics rather than an automatic arranger, hidden generator, or sampling workflow.
- Keep Beat Map Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
