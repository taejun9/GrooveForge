# plan-848-mode-focus-command-context

## Goal

Make Mode Focus Quick Action command details expose the same destination, mode metric, audition cue, and next-check posture already available on visible Mode Focus Decision and Jump buttons.

## Scope

- Add current and direct Mode Focus command detail context for jump commands before they run.
- Keep command ids, jump routing, Mode Focus scoring, visible button behavior, result metrics, project data, playback, export, and sampler scope unchanged.
- Update README, product docs, quality rules, and QA harness expectations.

## Non-Goals

- No Mode Focus scoring changes, card derivation changes, Command Reference row context, mode switching changes, command chains, tutorials, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Implementation Notes

- Added `modeFocusCommandDetail` so current and direct Mode Focus Quick Actions expose destination, mode metric, local context, audition cue, and next check before execution.
- Updated Mode Focus result metric parsing to read labelled command detail segments cleanly.
- Documented the command detail contract in README, product docs, quality rules, and QA harness expectations.

## Decision Log

- Mode Focus command-palette users should see the same pre-run orientation posture that visible Decision and Jump button users already get.
- Keep the command detail context derived from existing Mode Focus cards and cue helpers so this remains a discovery/context improvement rather than a routing, scoring, or project-data change.
