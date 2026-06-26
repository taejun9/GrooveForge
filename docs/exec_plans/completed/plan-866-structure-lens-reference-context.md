# plan-866-structure-lens-reference-context

## Goal

Make the Command Reference Structure Lens row expose the target-fit, section-coverage, hook-contrast, energy-arc, arrangement-action, action route, audition cue, and next-check posture already available from local Structure Lens guidance.

## Scope

- Add static Structure Lens Command Reference row context for direct arrangement-quality posture.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Structure Lens derivation, signal scoring, action suggestions, Next Move routing, explicit arrangement action handlers, Quick Actions execution, arrangement data, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Structure Lens scoring changes, hidden generation, automatic arrangement writing, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Structure Lens row from a compact target-only entry to a static context row that names target fit, section coverage, hook contrast, energy arc, arrangement action, action route, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Structure Lens discovery stays aligned with local arrangement-quality review and explicit action routing.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Structure Lens should read as a local arrangement-quality view for target fit, section coverage, hook contrast, and energy arc rather than an automatic arranger, hidden generator, or sampling workflow.
- Keep Structure Lens Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
