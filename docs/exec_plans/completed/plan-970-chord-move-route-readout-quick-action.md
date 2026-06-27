# plan-970-chord-move-route-readout-quick-action

## Goal

Add a read-only Chord Move Route Readout Quick Action so beginners and working producers can see whether the current harmony change should route through Chord Pads, Chord Rhythm, or Chord Voicing before applying the existing Chord Move command.

## Scope

- Add a UI-local Chord Move Route Readout Quick Action that focuses the existing Compose/Chord area without applying a chord move, changing the selected Pattern, changing playback, changing project data, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Chord Move target to the existing `chord-move` command while retaining selected Pattern A/B/C, selected chord or no-selection posture, preview target, move count, chord count/harmony/inversion/rhythm/velocity/chance posture, arrangement usage, audition cue, and next harmony-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Chord Move and selected-chord edit commands.

## Non-Goals

- Do not change project schema, saved project files, Chord Move preview derivation, Chord Pads/Rhythm/Voicing definitions, apply routing, selected Pattern, Pattern A/B/C events, arrangement, mixer, master, export bytes, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add hidden generation, automatic chord moves, command chains, automatic arrangement, autoplay, tutorial overlays, remote analysis, sampler devices, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Chord Move Route Readout Quick Action that focuses the existing Compose/Chord area and reports the current Pads/Rhythm/Voicing route, existing `chord-move` command, selected Pattern, selected-chord or no-selection posture, move counts, chord count/harmony/inversion/rhythm/velocity/chance posture, arrangement usage, audition cue, and next harmony-route check without applying Chord Pad, Chord Rhythm, or Chord Voicing changes.
- Updated the Command Reference, README, product rules, quality rules, and harness expectations so the route readout remains distinct from the Chord Move apply command and selected-chord edit tools.

## Decision Log

- 2026-06-27: Selected Chord Move Route Readout because Drum Move, 808 Move, and Melody Move now expose read-only route preflights, and the next direct-composition gap is choosing the correct harmony route before applying a pad, rhythm, or voicing move.
- 2026-06-27: Kept the command routed only through a UI-local Compose focus/status path so it does not apply Chord Pad, Chord Rhythm, or Chord Voicing changes, edit events, change arrangement, start playback, export files, or touch optional sampling scope.
