# plan-893-create-pattern-reference-context

## Goal

Expose pattern-building command context in Create Command Reference rows so beginners and working producers can discover direct Pattern A/B/C writing, comparison, variation, fill, clone, copy, and clear moves before opening Quick Actions.

## Scope

- Add static Command Reference row context for Layer Starter, Pattern Stack, Pattern Compare, Pattern Compare Decision, Pattern DNA, Pattern Variation, Pattern Fill, Pattern Clone, and Pattern Copy / Clear.
- Keep the focus on editable musical events and sample-free direct beat composition.
- Update README, product, quality rules, and QA expectations to lock the new row context.

## Non-Goals

- Do not change command execution, Quick Actions behavior, Pattern A/B/C data, arrangement data, playback, render/export, save/load, or sampling scope.
- Do not add tutorials, command chains, auto-writing, auto-arrangement, remote AI, accounts, analytics, cloud sync, or sampler behavior.

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

- 2026-06-26: Selected the remaining core pattern-building Create rows because they are central to direct beat composition but still appeared as terse Command Reference entries after setup, input, and Create guidance rows gained richer row context.
