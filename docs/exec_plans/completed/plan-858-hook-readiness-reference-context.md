# plan-858-hook-readiness-reference-context

## Goal

Make the Command Reference Hook Readiness row expose the same hook section, motif, contrast, mix support, handoff destination, hook metric, audition cue, loop/fix cue, and next-check posture already available in Hook Readiness controls and Quick Actions.

## Scope

- Add static Hook Readiness Command Reference row context for direct hook-quality posture.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Hook Readiness card derivation, card ids, priority scoring, focus/cue/fix routing, Quick Actions execution, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Hook Readiness scoring changes, focus/cue/fix routing changes, tutorials, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Hook Readiness row from a compact target-only entry to a static context row that names hook section, motif, contrast, mix support, handoff, destination, hook metric, audition cue, loop/fix cue, and next check.
- Documented the row context in README, product docs, and quality rules so Hook Readiness discovery stays aligned with direct hook-quality scanning.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Hook Readiness should read as a compact hook section, motif, contrast, mix support, and handoff quality scan rather than as a tutorial, auto-writing flow, or sampling workflow.
- Keep Hook Readiness Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
