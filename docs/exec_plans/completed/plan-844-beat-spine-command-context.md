# plan-844-beat-spine-command-context

## Goal

Make Beat Spine jump/apply Quick Action command details expose destination or action, beat-core metric, scope, audition cue, and next-check context before beginners or producers run direct core-axis commands.

## Scope

- Add structured Beat Spine Quick Action detail helpers for jump and apply commands.
- Apply the richer detail to current Beat Spine jump/apply commands and direct card jump/apply commands.
- Update Beat Spine Quick Action result metric parsing to read the labeled detail context.
- Derive all detail context from existing Beat Spine cards/actions, summary counts, selected Pattern, and existing jump/apply cue helpers.
- Update README, product docs, quality rules, and QA harness expectations.

## Non-Goals

- No change to Beat Spine scoring, card order, next-card selection, visible buttons, command ids, jump/apply handlers, saved project schema, undo history, playback, export, sampler, imported audio, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Implementation Notes

- Reused `beatSpineJumpButtonContext` for current and direct Beat Spine jump Quick Action command details.
- Reused `beatSpineApplyButtonContext` for current and direct Beat Spine apply Quick Action command details.
- Added labeled Beat Spine detail parsing so result metrics retain destination, beat-core metric, card, scope, audition cue, and next-check context even when labels contain slash-delimited values.
- Updated README, product docs, quality rules, and QA harness expectations.

## Review

- Result: pass.
- Findings: none open.
- Residual risk: disabled direct apply commands still expose only their unavailable message because they have no Beat Spine action to describe.

## Decision Log

- Beat Spine command-palette users should see the same pre-run posture as visible Beat Spine Jump and Apply button users.
- Beat Spine result metrics should parse labeled detail segments instead of fixed slash positions because beat-core and scope labels can include slash-delimited values.
