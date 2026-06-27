# plan-969-melody-move-route-readout-quick-action

## Goal

Add a read-only Melody Move Route Readout Quick Action so beginners and working producers can see whether the current melodic change should route through Melody Motif, Melody Accent, or Melody Contour before applying the existing Melody Move command.

## Scope

- Add a UI-local Melody Move Route Readout Quick Action that focuses the existing Compose/Melody area without applying a melody move, changing the selected Pattern, changing playback, changing project data, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Melody Move target to the existing `melody-move` command while retaining selected Pattern A/B/C, preview target, move count, note/rhythm/range/velocity/chance posture, arrangement usage, audition cue, and next melody-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Melody Move and selected-note edit commands.

## Non-Goals

- Do not change project schema, saved project files, Melody Move preview derivation, Melody Motif/Accent/Contour definitions, apply routing, selected Pattern, Pattern A/B/C events, arrangement, mixer, master, export bytes, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add hidden generation, automatic melody moves, command chains, automatic arrangement, autoplay, tutorial overlays, remote analysis, sampler devices, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Melody Move Route Readout Quick Action that focuses the existing Compose/Melody area and reports the current Motif/Accent/Contour route, existing `melody-move` command, selected Pattern, move counts, Synth note/rhythm/range/velocity/chance posture, arrangement usage, audition cue, and next melody-route check without applying Melody Motif, Melody Accent, or Melody Contour changes.
- Updated the Command Reference, README, product rules, quality rules, and harness expectations so the route readout remains distinct from the Melody Move apply command and selected-note edit tools.

## Decision Log

- 2026-06-27: Selected Melody Move Route Readout because Drum Move and 808 Move now expose read-only route preflights, and the next direct-composition gap is choosing the correct melody route before applying a motif, accent, or contour move.
- 2026-06-27: Kept the command routed only through a UI-local Compose focus/status path so it does not apply Melody Motif, Melody Accent, or Melody Contour changes, edit events, change arrangement, start playback, export files, or touch optional sampling scope.
