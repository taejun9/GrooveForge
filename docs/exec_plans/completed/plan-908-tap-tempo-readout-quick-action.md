# plan-908-tap-tempo-readout-quick-action

## Goal

Expose Tap Tempo Readout as a read-only Quick Actions status command so beginners and working producers can confirm current BPM, tap estimate, pending commit posture, loop scope, metronome state, Pattern context, and next tempo check from command search before tapping, nudging, arranging, recording MIDI input, or exporting.

## Scope

- Add a read-only `tap-tempo-readout-action` Quick Action that reports the existing Tap Tempo Readout without adding a tap pulse or mutating project tempo.
- Add deterministic Quick Action result metric and follow-up copy derived only from the current local Tap Tempo Readout, project BPM, transport loop scope, selected Pattern, selected arrangement block, metronome state, Pattern A/B/C usage, arrangement length, and editable events.
- Update Command Reference context, README, product, quality rules, and QA expectations to lock the command, result metric, tap-history, sampling/privacy, and export boundaries.

## Non-Goals

- Do not change Tap Tempo pulse behavior, delayed BPM commit, tap history storage, Tempo Nudge, manual BPM entry, playback scheduling, loop-scope selection, metronome audio, Pattern data, arrangement data, save/load, project schema, or render/export output.
- Do not add audio input, beat detection, tempo automation, recording, count-in, transport seeking, hidden timing mutation, sampler tracks, imported audio, remote AI, accounts, analytics, cloud sync, or automatic timing correction.

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

- Added a read-only `tap-tempo-readout-action` Quick Action that opens the existing Transport strip and reports Tap Tempo status without adding a tap pulse, committing BPM, changing tap history, starting playback, or changing export behavior.
- Added a deterministic Quick Action result metric and follow-up copy covering current BPM, tap estimate, pending commit posture, loop scope, metronome state, selected Pattern, selected block, Pattern A/B/C usage, arrangement block count, song length, audition cue, and next tempo check.
- Updated Command Reference context, README, product docs, quality rules, and QA expectations to keep the command local, read-only, sample-free, and separate from mutating Tap Tempo and Tempo Nudge behavior.

## Decision Log

- 2026-06-26: Selected Tap Tempo Readout because the workstation has a visible tap/BPM status readout and a mutating Tap Tempo command, but command search does not expose a non-mutating readout command for checking tempo posture before changing timing.
