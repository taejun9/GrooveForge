# plan-909-tempo-nudge-readout-quick-action

## Goal

Expose Tempo Nudge routes as a read-only Quick Actions status command so beginners and working producers can confirm the current BPM plus -1, +1, half-time, and double-time outcomes from command search before changing project tempo, arranging sections, recording MIDI input, or exporting.

## Scope

- Add a read-only `tempo-nudge-readout-action` Quick Action that reports current Tempo Nudge routes without changing project BPM or resetting Tap Tempo history.
- Add deterministic Quick Action result metric and follow-up copy derived only from current project BPM, bounded Tempo Nudge pad targets, transport loop scope, selected Pattern, selected arrangement block, metronome state, Pattern A/B/C usage, arrangement length, and editable events.
- Update Command Reference context, README, product, quality rules, and QA expectations to lock the command, result metric, tap-history, sampling/privacy, and export boundaries.

## Non-Goals

- Do not change Tempo Nudge pad behavior, BPM clamping, Tap Tempo reset behavior after actual nudge commands, manual BPM entry, Tap Tempo pulse behavior, playback scheduling, loop-scope selection, metronome audio, Pattern data, arrangement data, save/load, project schema, or render/export output.
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

- Added a read-only `tempo-nudge-readout-action` Quick Action that opens the existing Transport strip and reports bounded -1/+1/half/double BPM routes without changing BPM, resetting Tap Tempo history, starting playback, or changing export behavior.
- Added a deterministic Quick Action result metric and follow-up copy covering current BPM, Tempo Nudge routes, loop scope, metronome state, selected Pattern, selected block, Pattern A/B/C usage, arrangement block count, song length, audition cue, and next tempo check.
- Updated Command Reference context, README, product docs, quality rules, and QA expectations to keep the command local, read-only, sample-free, and separate from mutating Tempo Nudge behavior.

## Decision Log

- 2026-06-26: Selected Tempo Nudge Readout because the workstation exposes mutating Tempo Nudge commands and Command Reference context, but command search does not expose a non-mutating route summary for checking bounded BPM outcomes before changing timing.
