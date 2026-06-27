# plan-974-space-fx-route-readout-quick-action

## Goal

Add a read-only Space FX Route Readout Quick Action so beginners and working producers can see which dry/room/wide/wash send route the current Space FX move should use before applying the existing Space FX command.

## Scope

- Add a UI-local Space FX Route Readout Quick Action that focuses the existing Space FX/Mix area without applying a Space FX pad, changing mixer sends, changing playback, changing project data, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Space FX preview target to the existing direct Space FX command while retaining selected Pattern A/B/C, current Space FX preview target, Drums/808/Synth/Chords send posture, audition cue, and next space-fx-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Space FX readout, Space FX Decision, Space FX apply, and direct Space FX pad commands.

## Non-Goals

- Do not change project schema, saved project files, Space FX preview derivation, Space FX pad definitions, apply routing, selected Pattern, Pattern A/B/C events, arrangement, mixer volume/pan/mute/solo/EQ/Drive/Glue controls, master, export bytes, playback scheduling, snapshots, draft recovery, Sound Preset behavior, Drum Kit behavior, Sound Focus behavior, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add hidden generation, automatic mix moves, command chains, automatic arrangement, autoplay, tutorial overlays, remote analysis, sampler devices, imported samples, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added the read-only `space-fx-route-readout-action` Quick Action before Space FX Decision so users can inspect the Drums/808/Synth/Chords send route for the current dry/room/wide/wash preview target.
- Added UI-local Mix panel focus/status feedback, result metrics, follow-up copy, and Command Reference coverage while keeping the existing Space FX apply/direct commands as the only mixer-send mutation paths.
- Updated README, product rules, quality rules, and harness checks to keep Space FX Readout, Space FX Route Readout, Space FX Decision, Space FX apply, and direct pad commands distinct.
- Sampling stays secondary and out of scope; the readout derives only from local mixer-send posture, the existing preview target, command metadata, and local project context.

## Decision Log

- 2026-06-27: Selected Space FX Route Readout because Space FX already shapes the beat's room/wide/wash posture from built-in mixer sends, and the current route-readout sequence should let users inspect the direct-composition send route before applying Space FX without moving the product toward sampling.
