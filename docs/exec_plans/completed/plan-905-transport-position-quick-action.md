# plan-905-transport-position-quick-action

## Goal

Expose Transport Position Readout as a read-only Quick Actions status command so beginners and working producers can confirm Bar/Beat/Step, section, Pattern, loop scope, selected block, BPM, and audition posture from command search before writing, arranging, or judging playback.

## Scope

- Add a read-only `transport-position-readout-action` Quick Action that reports the existing Transport Position Readout without starting playback or mutating project data.
- Add deterministic Quick Action result metric and follow-up copy derived only from the current local Transport Position Readout, selected Pattern, selected arrangement block, transport loop scope, BPM, metronome state, arrangement length, and editable events.
- Update Command Reference context, README, product, quality rules, and QA expectations to lock the command, result metric, and sampling/privacy/export boundaries.

## Non-Goals

- Do not change playback scheduling, Play/Stop behavior, realtime playback snapshots, existing Transport Position UI, loop-scope selection, metronome audio, Tap Tempo, Tempo Nudge, arrangement data, Pattern data, save/load, project schema, or render/export output.
- Do not add autoplay, count-in, recording, marker persistence, transport seeking, quantization, audio input, imported audio, beat detection, sampler tracks, remote AI, accounts, analytics, cloud sync, or automatic timing correction.

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

- Added a read-only `transport-position-readout-action` Quick Action that opens the existing Transport strip without starting playback, seeking transport, changing loop scope, or mutating project data.
- Added a deterministic Quick Action result metric and follow-up copy covering current Bar/Beat/Step, section, Pattern, loop scope, selected block, BPM, metronome state, editable event count, Pattern A/B/C usage, arrangement block count, song length, audition cue, and next position check.
- Updated Command Reference context, README, product docs, quality rules, and QA expectations to keep the command local, read-only, sample-free, and separate from transport playback behavior.

## Decision Log

- 2026-06-26: Selected Transport Position Quick Action because the workstation shows a local Bar/Beat/Step readout and Command Reference lists it as a Desktop readout, but command search does not expose a non-mutating status command with result metric and next-check guidance.
