# plan-906-pattern-playback-readout-quick-action

## Goal

Expose Pattern Playback Readout as a read-only Quick Actions status command so beginners and working producers can confirm the selected editing Pattern, currently audible Pattern, event posture, loop scope, selected block, BPM, and next listening check from command search before changing notes, drums, chords, melody, or arrangement assignments.

## Scope

- Add a read-only `pattern-playback-readout-action` Quick Action that reports the existing Pattern Playback Readout without following the audible Pattern or mutating project data.
- Add deterministic Quick Action result metric and follow-up copy derived only from the current local Pattern Playback Readout, selected Pattern, audible Pattern snapshot, selected arrangement block, transport loop scope, BPM, Pattern A/B/C usage, arrangement length, and editable events.
- Update Command Reference context, README, product, quality rules, and QA expectations to lock the command, result metric, and sampling/privacy/export boundaries.

## Non-Goals

- Do not change Audible Pattern Follow, selected Pattern behavior, realtime playback snapshots, existing Pattern Playback UI, playback scheduling, loop-scope selection, arrangement assignments, Pattern data, save/load, project schema, or render/export output.
- Do not add auto-follow mode, auto-selecting during playback, autoplay, recording, quantization, transport seeking, note generation, hidden arrangement changes, audio input, imported audio, beat detection, sampler tracks, remote AI, accounts, analytics, cloud sync, or automatic timing correction.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

Notes:

- `npm run verify` confirmed runtime smoke for 14/14 sample-free Beat Blueprints and 14/14 supported style profiles.
- `npm run build` still reports the existing Vite large chunk warning for the main app chunk; build exits successfully.

## Completion Notes

- Added a read-only `pattern-playback-readout-action` Quick Action that opens the existing Pattern editor and reports edit-vs-heard Pattern context without selecting the audible Pattern, starting playback, changing loop scope, or mutating Pattern/arrangement data.
- Added a deterministic Quick Action result metric and follow-up copy covering Pattern Playback status, selected editing Pattern, audible Pattern context, event posture, selected block, loop scope, BPM, Pattern A/B/C usage, arrangement block count, song length, audition cue, and next listening check.
- Updated Command Reference context, README, product docs, quality rules, and QA expectations to keep the command local, read-only, sample-free, and separate from Audible Pattern Follow behavior.

## Decision Log

- 2026-06-26: Selected Pattern Playback Readout because the app has visible edit-vs-heard Pattern state and an Audible Pattern Follow command, but command search does not expose a non-mutating readout command for checking Pattern playback context before editing.
