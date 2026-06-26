# plan-913-keyboard-capture-readout-quick-action

## Goal

Expose Keyboard Capture posture as a read-only Quick Actions status command so beginners and working producers can confirm desktop-key input readiness, 808/Synth target, degree key map, capture defaults, placement mode, MIDI posture, selected Pattern context, and next input check from command search before entering notes, changing capture setup, recording MIDI input, arranging, or exporting.

## Scope

- Add a read-only `keyboard-capture-readout-action` Quick Action that reports current Keyboard Capture posture without toggling capture, changing target/defaults/placement, requesting MIDI permission, arming MIDI, or inserting/replacing notes.
- Add deterministic Quick Action result metric and follow-up copy derived only from UI-local Keyboard Capture/MIDI state, selected Pattern, selected arrangement block, Pattern A/B/C usage, current key/scale degree map, 808/Synth note counts, arrangement length, and export readiness.
- Update Command Reference context, README, product, quality rules, and QA expectations to lock the command, result metric, input/project-data, sampling/privacy, and export boundaries.

## Non-Goals

- Do not change Keyboard Capture key handling, capture target/default behavior, Capture Step Mode behavior, MIDI permission handling, MIDI arm/disarm behavior, note insertion/replacement, selected-note editing, Editor Audition, playback scheduling, Pattern data, arrangement data, save/load, project schema, or render/export output.
- Do not add automatic recording, count-in, MIDI output, clock sync, controller mapping, sampler tracks, imported audio, audio input analysis, remote AI, accounts, analytics, cloud sync, or hidden note generation.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Note: `npm run verify` confirmed runtime smoke for 14/14 sample-free Beat Blueprints and 14/14 supported style profiles.
- Note: `npm run build` still reports the existing Vite large chunk warning.

## Completion Notes

- Added a read-only `keyboard-capture-readout-action` Quick Action that opens only the existing Compose input area and reports Keyboard Capture armed state, 808/Synth target, Capture Step Mode placement, degree key map, octave/length/velocity/glide defaults, MIDI posture, selected Pattern, and selected block without toggling capture, changing target/defaults/placement, requesting MIDI permission, arming MIDI, inserting notes, changing playback, changing export output, or touching sampler scope.
- Added a deterministic Keyboard Capture result metric and follow-up copy for keyboard/MIDI input readiness, selected block, Pattern A/B/C usage, 808/Synth note counts, arrangement length, export readiness, audition cue, and next input check.
- Updated Command Reference context, README, product docs, quality rules, and QA expectations so the readout stays local, read-only, sample-free, and separate from mutating Keyboard Capture or MIDI commands.

## Decision Log

- 2026-06-26: Selected Keyboard Capture Readout because Command Reference already frames Keyboard Capture as a readout-capable Create row, but command search lacks a non-mutating status command for checking input readiness before desktop-key or MIDI note entry.
