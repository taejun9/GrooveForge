# plan-845-beat-spine-reference-context

## Goal

Make the Command Reference Beat Spine row expose the same destination/action, beat-core metric, scope, audition cue, and next-check posture now available in Beat Spine Quick Action command details.

## Scope

- Add static Beat Spine Command Reference row context for jump/apply pre-run posture.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Beat Spine scoring, command ids, Quick Actions execution, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Beat Spine scoring changes, tutorials, command chains, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Implementation Notes

- Updated the Command Reference Beat Spine row from a plain target list to static jump/apply core-axis context.
- Documented the Beat Spine row context in README, product docs, and quality rules.
- Added QA harness expectations for the new row context, matching docs, and quality guardrails.

## Decision Log

- Command Reference should name the same Beat Spine pre-run posture fields that command-palette users see in live Beat Spine command details.
- Keep the Beat Spine reference context static and read-only so it improves discovery, Search Spotlight, title, and aria-label text without adding command execution or dynamic Command Reference state.
