# plan-968-808-move-route-readout-quick-action

## Goal

Add a read-only 808 Move Route Readout Quick Action so beginners and working producers can see whether the current low-end change should route through 808 Bassline, 808 Glide, or 808 Contour before applying the existing 808 Move command.

## Scope

- Add a UI-local 808 Move Route Readout Quick Action that focuses the existing Compose/808 area without applying a bass move, changing the selected Pattern, changing playback, changing project data, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current 808 Move target to the existing `808-move` command while retaining selected Pattern A/B/C, preview target, move count, note/rhythm/glide/chance/range posture, arrangement usage, audition cue, and next 808-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from 808 Move and selected-note edit commands.

## Non-Goals

- Do not change project schema, saved project files, 808 Move preview derivation, 808 Bassline/Glide/Contour definitions, apply routing, selected Pattern, Pattern A/B/C events, arrangement, mixer, master, export bytes, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add hidden generation, automatic 808 moves, command chains, automatic arrangement, autoplay, tutorial overlays, remote analysis, sampler devices, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only 808 Move Route Readout Quick Action that focuses the existing Compose/808 area and reports the current Bassline/Glide/Contour route, existing `808-move` command, selected Pattern, move counts, 808 note/rhythm/glide/chance/range posture, arrangement usage, audition cue, and next 808-route check without applying 808 Bassline, 808 Glide, or 808 Contour changes.
- Updated the Command Reference, README, product rules, quality rules, and harness expectations so the route readout remains distinct from the 808 Move apply command and selected-note edit tools.

## Decision Log

- 2026-06-27: Selected 808 Move Route Readout because recent plans improved Layer Starter, Pattern Stack, and Drum Move routing, and the next direct-composition friction point is choosing the correct low-end route before applying an 808 move.
- 2026-06-27: Kept the command routed only through a UI-local Compose focus/status path so it does not apply 808 Bassline, 808 Glide, or 808 Contour changes, edit events, change arrangement, start playback, export files, or touch optional sampling scope.
