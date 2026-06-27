# plan-965-layer-starter-route-readout-quick-action

## Goal

Add a read-only Layer Starter Route Readout Quick Action so beginners and working producers can see which existing starter command should handle the current missing or thin layer before starting drums, 808/bass, chords, or melody.

## Scope

- Add a UI-local Layer Starter Route Readout Quick Action that focuses the existing Compose/Layer Starter readout path without starting a layer, changing the selected Pattern, changing playback, changing project data, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the highest-priority missing/thin layer to the existing direct Layer Starter command while retaining selected Pattern A/B/C, layer readiness, event counts, drum/music posture, arrangement usage, audition cue, and next layer-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Layer Starter Readout and direct Layer Starter commands.

## Non-Goals

- Do not change project schema, saved project files, Layer Starter option derivation, selected Pattern, Pattern A/B/C events, arrangement, mixer, master, export bytes, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add hidden generation, automatic layer starts, command chains, automatic arrangement, autoplay, tutorial overlays, remote analysis, sampler devices, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Layer Starter Route Readout Quick Action that focuses the existing Layer Starter readout path and reports the current missing/thin layer, existing direct starter route, direct command id, selected Pattern, layer counts, arrangement usage, audition cue, and next layer-route check without starting layers, changing Pattern data, changing playback, exporting, or touching sampler scope.
- Updated the Command Reference, README, product rules, quality rules, and harness expectations so the route readout remains distinct from Layer Starter Readout and direct Drums/808/Chords/Synth starter commands.

## Decision Log

- 2026-06-27: Selected Layer Starter Route Readout because recent work strengthened delivery readiness, and the next meaningful product movement is back in the direct composition loop: showing which starter path fills the current missing or thin layer without mutating the beat.
- 2026-06-27: Kept the command routed only through the existing Layer Starter readout focus path so it does not start layers, edit events, change arrangement, start playback, export files, or touch optional sampling scope.
