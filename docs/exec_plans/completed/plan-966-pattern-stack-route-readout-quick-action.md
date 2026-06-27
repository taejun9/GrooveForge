# plan-966-pattern-stack-route-readout-quick-action

## Goal

Add a read-only Pattern Stack Route Readout Quick Action so beginners and working producers can see which existing Pattern Stack route should handle the selected Pattern before rewriting 808, chord, and Synth layers.

## Scope

- Add a UI-local Pattern Stack Route Readout Quick Action that focuses the existing Compose/Pattern Stack readout path without applying a stack, changing the selected Pattern, changing playback, changing project data, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current suggested stack to the existing preview command and direct Pattern Stack pad while retaining selected Pattern A/B/C, current preview target, move count, event counts, drum/music posture, layer readiness, arrangement usage, audition cue, and next stack-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Pattern Stack Readout and direct Pattern Stack commands.

## Non-Goals

- Do not change project schema, saved project files, Pattern Stack definitions, Pattern Stack preview derivation, Pattern Stack apply routing, selected Pattern, Pattern A/B/C events, arrangement, mixer, master, export bytes, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add hidden generation, automatic stack application, command chains, automatic arrangement, autoplay, tutorial overlays, remote analysis, sampler devices, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Pattern Stack Route Readout Quick Action that focuses the existing Pattern Stack readout path and reports the current suggested stack route, preview command, direct pad command, selected Pattern, layer counts, arrangement usage, audition cue, and next stack-route check without applying stacks, changing Pattern data, changing playback, exporting, or touching sampler scope.
- Updated the Command Reference, README, product rules, quality rules, and harness expectations so the route readout remains distinct from Pattern Stack Readout and direct Pattern Stack commands.

## Decision Log

- 2026-06-27: Selected Pattern Stack Route Readout because the direct composition loop already exposes layer-start routing, and the next useful preflight is showing which existing stack route should rewrite 808/chord/Synth layers before a user applies it.
- 2026-06-27: Kept the command routed only through the existing Pattern Stack readout focus path so it does not apply stacks, edit events, change arrangement, start playback, export files, or touch optional sampling scope.
