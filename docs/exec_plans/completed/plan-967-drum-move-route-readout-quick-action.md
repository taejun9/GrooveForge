# plan-967-drum-move-route-readout-quick-action

## Goal

Add a read-only Drum Move Route Readout Quick Action so beginners and working producers can see whether the current drum-groove change should route through Drum Foundation, Groove Feel, or Drum Accent before applying the existing Drum Move command.

## Scope

- Add a UI-local Drum Move Route Readout Quick Action that focuses the existing Compose/Drum Move area without applying a drum move, changing the selected Pattern, changing playback, changing project data, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Drum Move target to the existing `drum-move` command while retaining selected Pattern A/B/C, preview target, move count, hit/timing/chance/velocity posture, arrangement usage, audition cue, and next drum-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Drum Move and direct drum edit commands.

## Non-Goals

- Do not change project schema, saved project files, Drum Move preview derivation, Drum Foundation/Groove Feel/Drum Accent definitions, apply routing, selected Pattern, Pattern A/B/C events, arrangement, mixer, master, export bytes, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add hidden generation, automatic drum moves, command chains, automatic arrangement, autoplay, tutorial overlays, remote analysis, sampler devices, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Drum Move Route Readout Quick Action that focuses the existing Compose/Drum area and reports the current Foundation/Feel/Accent route, existing `drum-move` command, selected Pattern, move counts, drum hit/timing/chance/velocity posture, arrangement usage, audition cue, and next drum-route check without applying Drum Foundation, Groove Feel, or Drum Accent changes.
- Updated the Command Reference, README, product rules, quality rules, and harness expectations so the route readout remains distinct from the Drum Move apply command and selected-drum edit tools.

## Decision Log

- 2026-06-27: Selected Drum Move Route Readout because recent plans improved Layer Starter and Pattern Stack routing, and the next direct-composition friction point is choosing the correct drum-groove route before applying a rhythm move.
- 2026-06-27: Kept the command routed only through a UI-local Compose focus/status path so it does not apply Drum Foundation, Groove Feel, or Drum Accent changes, edit events, change arrangement, start playback, export files, or touch optional sampling scope.
