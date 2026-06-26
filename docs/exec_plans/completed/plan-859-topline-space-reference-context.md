# plan-859-topline-space-reference-context

## Goal

Make the Command Reference Topline Space row expose the same rhythm pocket, lead room, vocal window, mix headroom, artist cue destination, topline metric, audition cue, loop/fix cue, and next-check posture already available in Topline Space controls and Quick Actions.

## Scope

- Add static Topline Space Command Reference row context for direct lead/vocal-space posture.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Topline Space card derivation, card ids, priority scoring, focus/cue/fix routing, Quick Actions execution, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Topline Space scoring changes, focus/cue/fix routing changes, vocal recording, lyric generation, tutorials, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Topline Space row from a compact target-only entry to a static context row that names rhythm pocket, lead room, vocal window, mix headroom, artist cue, destination, topline metric, audition cue, loop/fix cue, and next check.
- Documented the row context in README, product docs, and quality rules so Topline Space discovery stays aligned with direct lead/vocal-space scanning.
- Added QA expectations for the new docs, quality rule, row target, and row context.

## Decision Log

- Topline Space should read as a compact rhythm pocket, lead room, vocal window, mix headroom, and artist cue scan rather than as vocal recording, lyric generation, auto-writing, or sampling workflow.
- Keep Topline Space Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
