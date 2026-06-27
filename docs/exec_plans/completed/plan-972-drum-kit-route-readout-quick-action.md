# plan-972-drum-kit-route-readout-quick-action

## Goal

Add a read-only Drum Kit Route Readout Quick Action so beginners and working producers can see which built-in kick/clap/hat kit route the current Drum Kit move should use before applying the existing Drum Kit command.

## Scope

- Add a UI-local Drum Kit Route Readout Quick Action that focuses the existing Sound/Drum Kit area without applying a Drum Kit pad, changing selected Pattern, changing playback, changing project data, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Drum Kit preview target to the existing direct Drum Kit command while retaining selected Pattern A/B/C, current kit preview target, drum tone posture, rack posture, audition cue, and next kit-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Drum Kit readout, Drum Kit decision, Drum Kit apply, and direct kit pad commands.

## Non-Goals

- Do not change project schema, saved project files, Drum Kit preview derivation, Drum Kit pad definitions, apply routing, selected Pattern, Pattern A/B/C events, arrangement, mixer, master, export bytes, playback scheduling, snapshots, draft recovery, Sound Focus behavior, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add hidden generation, automatic kit moves, command chains, automatic arrangement, autoplay, tutorial overlays, remote analysis, sampler devices, imported samples, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Drum Kit Route Readout Quick Action that focuses the existing Sound panel and reports the current built-in kick/clap/hat route without applying a kit, changing playback, changing project data, or touching sampling scope.
- Added route result metrics, action labeling, and follow-up copy that keep the existing Drum Kit command as the explicit apply path.
- Added Command Reference, README, product, quality, and harness coverage for the route readout as a separate Sound readout from Drum Kit Readout, Drum Kit Decision, Drum Kit, and direct kit pad commands.

## Decision Log

- 2026-06-27: Selected Drum Kit Route Readout because the Sound command map now exposes route preflights for direct tone focus, while built-in drum kit selection still needs a read-only command-search route before the existing Drum Kit command reshapes the local kick/clap/hat tone.
