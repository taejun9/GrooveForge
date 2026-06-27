# plan-975-mix-balance-route-readout-quick-action

## Goal

Add a read-only Mix Balance Route Readout Quick Action so beginners and working producers can see which Drums/808/Synth/Chords rough-balance route the current Mix Balance move should use before applying the existing Mix Balance command.

## Scope

- Add a UI-local Mix Balance Route Readout Quick Action that focuses the existing Mix Balance/Mix area without applying a balance pad, changing mixer controls, changing playback, changing project data, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Mix Balance preview target to the existing direct Mix Balance command while retaining selected Pattern A/B/C, current rough-balance preview target, Drums/808/Synth/Chords channel posture, audition cue, and next mix-balance-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Mix Balance Readout, Mix Balance Decision, Mix Balance apply, and direct balance pad commands.

## Non-Goals

- Do not change project schema, saved project files, Mix Balance preview derivation, Mix Balance pad definitions, apply routing, selected Pattern, Pattern A/B/C events, arrangement, Space FX behavior, mixer send behavior, master, export bytes, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
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

- Added the read-only `mix-balance-route-readout-action` Quick Action before Mix Balance Decision so users can inspect the Drums/808/Synth/Chords rough-balance route for the current Mix Balance preview target.
- Added UI-local Mix panel focus/status feedback, result metrics, follow-up copy, and Command Reference coverage while keeping the existing Mix Balance decision/current/direct commands as the only rough-balance mutation paths.
- Updated README, product rules, quality rules, and harness checks to keep Mix Balance Readout, Mix Balance Route Readout, Mix Balance Decision, Mix Balance apply, and direct balance pad commands distinct.
- Sampling stays secondary and out of scope; the readout derives only from local mixer posture, the existing preview target, command metadata, and local project context.

## Decision Log

- 2026-06-27: Selected Mix Balance Route Readout because rough mix balancing is a core direct beat-production step for beginners and working producers, and it should have the same read-only route preflight pattern as the recent Sound and Space FX commands before any mixer controls change.
