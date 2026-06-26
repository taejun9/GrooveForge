# plan-892-create-guidance-reference-context

## Goal

Expose Create guidance command context in Command Reference rows so sample-free starts, style inspection, composer actions, and style-goal cues/actions are discoverable before users open Quick Actions.

## Scope

- Add static Command Reference row context for Beat Blueprints, Style Inspector, Composer Actions, Style Goal Cues, and Style Goal Actions.
- Keep the focus on direct beat composition for all genres; sampling remains secondary.
- Update README, product, quality rules, and QA expectations to lock the new row context.

## Non-Goals

- Do not change command execution, Quick Actions behavior, style profiles, project data, playback, render/export, save/load, or sampling scope.
- Do not add remote AI, accounts, analytics, cloud sync, tutorials, command chains, or automatic writing/arrangement/mixing/export.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

Notes:

- `npm run verify` confirmed runtime smoke for 14/14 sample-free Beat Blueprints and 14/14 supported style profiles.
- `npm run build` still reports the existing Vite large chunk warning for the main app chunk; build exits successfully.

## Decision Log

- 2026-06-26: Selected the remaining Create guidance rows because they still presented major direct-composition features as terse one-line references, while nearby setup/input rows already expose richer row context.
