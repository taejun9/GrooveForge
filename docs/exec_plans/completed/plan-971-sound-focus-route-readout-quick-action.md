# plan-971-sound-focus-route-readout-quick-action

## Goal

Add a read-only Sound Focus Route Readout Quick Action so beginners and working producers can see whether the current tone move should route through 808, Synth, or Chords sound-focus pads before applying the existing Sound Focus command.

## Scope

- Add a UI-local Sound Focus Route Readout Quick Action that focuses the existing Sound/Sound Focus area without applying a sound-focus pad, changing the selected Pattern, changing playback, changing project data, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Sound Focus target to the existing direct Sound Focus command while retaining selected Pattern A/B/C, preview target, editable sound posture, tone-focus posture, arrangement usage, audition cue, and next sound-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Sound Focus readout, Sound Focus decision, and Sound Focus apply commands.

## Non-Goals

- Do not change project schema, saved project files, Sound Focus preview derivation, Sound Focus pad definitions, apply routing, selected Pattern, Pattern A/B/C events, arrangement, mixer, master, export bytes, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add hidden generation, automatic tone-focus moves, command chains, automatic arrangement, autoplay, tutorial overlays, remote analysis, sampler devices, imported samples, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added `sound-focus-route-readout-action` as a UI-local Quick Action that focuses the Sound panel, shows the calculated 808/Synth/Chords route for the current Sound Focus preview target, and leaves Sound Focus apply behavior and project data unchanged.
- Added route readout result metrics, next-check/audition copy, Command Reference coverage, documentation, and static QA expectations so the readout remains distinct from Sound Focus Readout, Sound Focus Decision, current apply, and direct focus pad commands.

## Decision Log

- 2026-06-27: Selected Sound Focus Route Readout because direct composition routes for drums, 808, melody, and chords now have read-only preflights, and the next producer-facing gap is choosing the correct local tone-focus route before applying 808/Synth/Chords sound shaping.
