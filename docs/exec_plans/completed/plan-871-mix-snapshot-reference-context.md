# plan-871-mix-snapshot-reference-context

## Goal

Make the Command Reference Mix Snapshot A/B Decision and Mix Snapshot A/B rows expose the capture, recall, listen-next, A/B slot state, headroom, balance, master, stem-pass comparison, audition cue, and next-check context already available from local Mix Snapshot guidance.

## Scope

- Add static Mix Snapshot Command Reference row context for capture/recall decisions and A/B mix-pass comparison.
- Keep the rows discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Mix Snapshot slot derivation, capture/clear handlers, mixer/master recall routing, musical events, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Mix Snapshot scoring changes, automatic capture, automatic recall, hidden mix fixes, hidden mastering, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Mix Snapshot A/B Decision and Mix Snapshot A/B rows from compact target-only entries to static context rows that name capture/recall/listen-next decision target, A/B slot state, current mix/export posture, headroom, balance, master output, stem-pass comparison, capture/recall/clear route, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Mix Snapshot discovery stays aligned with local mix-pass comparison and explicit capture/recall/clear routing.
- Added QA expectations for the new docs, quality rule, row targets, and row contexts.

## Decision Log

- Mix Snapshot Command Reference rows should read as local mix-pass orientation for capture, recall, and listen-next comparison rather than an automatic mixer, hidden mastering path, or export workflow.
- Keep Mix Snapshot Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
