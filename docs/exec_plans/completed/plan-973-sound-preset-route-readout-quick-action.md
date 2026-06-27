# plan-973-sound-preset-route-readout-quick-action

## Goal

Add a read-only Sound Preset Route Readout Quick Action so beginners and working producers can see which full-tone route the current Sound Preset move should use before applying the existing Sound Preset command.

## Scope

- Add a UI-local Sound Preset Route Readout Quick Action that focuses the existing Sound/Sound Preset area without applying a Sound Preset, changing selected Pattern, changing playback, changing project data, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Sound Preset preview target to the existing direct Sound Preset command while retaining selected Pattern A/B/C, current preset preview target, Drums/808/Duck/Synth/Chords posture, audition cue, and next sound-preset-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Sound Preset Readout, Sound Preset Decision, Sound Preset apply, and direct preset commands.

## Non-Goals

- Do not change project schema, saved project files, Sound Preset preview derivation, Sound Preset definitions, apply routing, selected Pattern, Pattern A/B/C events, arrangement, mixer, master, export bytes, playback scheduling, snapshots, draft recovery, Drum Kit behavior, Sound Focus behavior, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add hidden generation, automatic tone moves, command chains, automatic arrangement, autoplay, tutorial overlays, remote analysis, sampler devices, imported samples, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added the read-only `sound-preset-route-readout-action` Quick Action before Sound Preset Decision so users can inspect the Drums/808/Duck/Synth/Chords route for the current full-tone preset preview target.
- Added UI-local focus/status feedback, result metrics, follow-up copy, and Command Reference coverage while keeping the existing Sound Preset apply/direct commands as the only preset mutation paths.
- Updated README, product rules, quality rules, and harness checks to keep Sound Preset Readout, Sound Preset Route Readout, Sound Preset Decision, Sound Preset apply, and direct preset commands distinct.
- Sampling stays secondary and out of scope; the readout derives only from local SoundDesign posture, the existing preview target, command metadata, and local project context.

## Decision Log

- 2026-06-27: Selected Sound Preset Route Readout because the Sound command map now exposes route preflights for Sound Focus and Drum Kit, while full-tone Sound Preset selection still needs a read-only command-search route before the existing Sound Preset command reshapes Drums, 808, Duck, Synth, and Chords together.
