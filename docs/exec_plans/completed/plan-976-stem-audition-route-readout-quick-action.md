# plan-976-stem-audition-route-readout-quick-action

## Goal

Add a read-only Stem Audition Route Readout Quick Action so beginners and working producers can see which Full Mix/Drums/808/Synth/Chords audition route the current Stem Audition decision should use before changing solo/mute state through the existing Stem Audition command.

## Scope

- Add a UI-local Stem Audition Route Readout Quick Action that focuses the existing Mix/Stem Audition area without applying a stem audition pad, changing mixer solo/mute state, changing playback, changing project data, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Stem Audition decision target to the existing direct Stem Audition command while retaining selected Pattern A/B/C, current audition posture, mixer solo/mute posture, stem readiness, audition cue, and next stem-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Stem Audition Readout, Stem Audition Decision, Stem Audition apply, and direct stem audition commands.

## Non-Goals

- Do not change project schema, saved project files, Stem Audition pad definitions, readout derivation, decision routing, direct pad routing, selected Pattern, Pattern A/B/C events, arrangement, mixer level/pan/EQ/Drive/Glue/Space behavior, Mix Balance behavior, Mix Snapshot behavior, master, export bytes, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add rendered stem playback, stem separation, hidden generation, automatic mix moves, command chains, automatic arrangement, autoplay, tutorial overlays, remote analysis, sampler devices, imported samples, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added the read-only `stem-audition-route-readout-action` Quick Action between Stem Audition Readout and Stem Audition Decision so users can inspect the Full Mix/Drums/808/Synth/Chords audition route before any solo/mute changes.
- Added UI-local Mix panel focus/status feedback, route labeling, result metrics, follow-up copy, and Command Reference coverage while keeping existing Stem Audition Decision and direct stem audition commands as the only solo/mute mutation paths.
- Updated README, product rules, quality rules, and harness checks to keep Stem Audition Readout, Stem Audition Route Readout, Stem Audition Decision, Stem Audition apply, and direct stem audition commands distinct.
- Sampling stays secondary and out of scope; the readout derives only from local mixer posture, existing Stem Audition pad options, command metadata, and local project context.

## Decision Log

- 2026-06-27: Selected Stem Audition Route Readout because direct stem comparison is a core beat-production listening step for both beginners and working producers, and it should expose the route before any solo/mute state changes.
