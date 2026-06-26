# plan-846-session-pass-command-context

## Goal

Make Session Pass Quick Action command details expose the same destination, session metric, audition cue, and next-check posture already available on visible Session Pass Decision and Focus buttons.

## Scope

- Add current and direct Session Pass command detail context for focus commands before they run.
- Keep command ids, focus routing, Session Pass scoring, visible button behavior, result metrics, project data, playback, export, and sampler scope unchanged.
- Update README, product docs, quality rules, and QA harness expectations.

## Non-Goals

- No Session Pass scoring changes, card derivation changes, Command Reference row context, command chains, tutorials, autoplay, auto-save, auto-export, auto-fixing, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Implementation Notes

- Added `sessionPassCommandDetail` so current and direct Session Pass Quick Actions expose destination, session metric, local context, audition cue, and next check before execution.
- Updated Session Pass result metric parsing to read the labelled command detail segments cleanly.
- Documented the command detail contract in README, product docs, quality rules, and QA harness expectations.

## Decision Log

- Session Pass command-palette users should see the same pre-run pass posture that visible Decision and Focus button users already get.
- Keep the command detail context derived from existing Session Pass cards and cue helpers so this remains a discovery/context improvement rather than a routing, scoring, or project-data change.
