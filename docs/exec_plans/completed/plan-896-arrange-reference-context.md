# plan-896-arrange-reference-context

## Goal

Expose direct arrangement-building command context in Arrange Command Reference rows so beginners and working producers can discover Pattern Chain, Chain Expand, templates, arcs, selected-block focus, arrangement moves, and section cueing before opening Quick Actions.

## Scope

- Add static Command Reference row context for Pattern Chain, Chain Expand, Arrangement Template, Arrangement Arc, Arrangement Focus, Arrangement Move, and Section Locator.
- Keep the focus on turning editable Pattern A/B/C material into song form through explicit preview, priority, decision, apply, cue, and result checks.
- Update README, product, quality rules, and QA expectations to lock the new Arrange row context.

## Non-Goals

- Do not change command execution, Quick Actions behavior, Pattern Chain transforms, Chain Expand behavior, Arrangement Template application, Arrangement Arc application, Arrangement Focus application, Arrangement Move application, Section Locator cueing, playback, render/export, save/load, project schema, or sampling scope.
- Do not add automatic arrangement, auto-expand, autoplay, hidden block mutation, command chains, audio analysis, imported audio, sample browsing, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.

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

- 2026-06-26: Selected Arrange Command Reference context because direct beat composition needs a clear path from Pattern A/B/C loops into song sections, and the current Arrange rows list key commands without the richer pre-run context already present for later arrangement readouts.
