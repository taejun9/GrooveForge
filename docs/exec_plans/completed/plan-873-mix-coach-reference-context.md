# plan-873-mix-coach-reference-context

## Goal

Make the Command Reference Mix Coach row expose the priority mix metric, headroom, balance, limiter, dynamics, stem-spread diagnostics, focus route, audition cue, and next-check context already available from local Mix Coach guidance.

## Scope

- Add static Mix Coach Command Reference row context for priority/focus mix diagnostics.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Mix Coach scoring, focus handling, mixer/master state, musical events, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Mix Coach scoring changes, automatic mix fixes, hidden mastering, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, auto-export, audio analysis changes, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Mix Coach row from a compact target-only entry to a static context row that names priority mix metric, headroom, balance, limiter, dynamics, stem-spread diagnostics, focus route, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Mix Coach discovery stays aligned with local priority/focus diagnostics and explicit direct check routing.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Mix Coach Command Reference rows should read as local mix-diagnostic orientation for priority/focus checks rather than an automatic mixer, hidden mastering path, or export workflow.
- Keep Mix Coach Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
