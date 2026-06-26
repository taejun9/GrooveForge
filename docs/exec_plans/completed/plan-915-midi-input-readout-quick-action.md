# plan-915-midi-input-readout-quick-action

## Goal

Expose Web MIDI Input posture as a read-only Quick Actions status command so beginners and working producers can confirm browser MIDI support, permission/status, armed state, connected input count, selected MIDI input, latest note, 808/Synth capture target, defaults, placement mode, selected Pattern context, and next MIDI check before connecting, arming, playing a controller, editing notes, arranging, or exporting.

## Scope

- Add a read-only `midi-input-readout-action` Quick Action that reports current Web MIDI support/status, arm posture, input counts, selected input, latest MIDI note, Keyboard Capture target/defaults, Capture Step Mode, selected Pattern/block, Pattern A/B/C usage, editable note counts, arrangement length, and export readiness without requesting MIDI permission, arming/disarming MIDI, changing target/defaults/placement, or inserting/replacing notes.
- Add deterministic Quick Action result metric and follow-up copy derived only from UI-local MIDI/Keyboard Capture state, selected Pattern, selected arrangement block, Pattern A/B/C usage, current key/scale degree map, 808/Synth note counts, arrangement length, and export readiness.
- Update Command Reference context, README, product, quality rules, and QA expectations to lock the command, result metric, MIDI/project-data, sampling/privacy, and export boundaries.

## Non-Goals

- Do not change Web MIDI permission handling, MIDI arm/disarm behavior, MIDI input selection behavior, Note On parsing, MIDI-to-scale mapping, Keyboard Capture key handling, capture target/default behavior, Capture Step Mode behavior, note insertion/replacement, selected-note editing, Editor Audition, playback scheduling, Pattern data, arrangement data, save/load, project schema, or render/export output.
- Do not add automatic recording, count-in, MIDI output, clock sync, controller mapping, sampler tracks, imported audio, audio input analysis, remote AI, accounts, analytics, cloud sync, or hidden note generation.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Note: `npm run build` and `npm run verify` reported the existing Vite chunk-size warning for the main bundle after minification.

## Completion Notes

- Added the `midi-input-readout-action` Quick Action, focus handler, input setup snapshot field, read-only result metric, route label, and follow-up copy for Web MIDI support/status, armed state, input count, selected input, latest MIDI note, capture target/defaults, placement, Pattern A/B/C usage, arrangement length, and export readiness.
- Updated the Command Reference context, README, product rules, quality rules, and QA harness expectations so MIDI Input is discoverable as readout-capable input posture without changing MIDI permission, arm/disarm, selection, Note On mapping, note insertion, playback, export, project schema, or sampling scope.

## Decision Log

- 2026-06-27: Selected MIDI Input Readout because Command Reference already frames MIDI Input as readout-capable Create input posture, but command search needs a non-mutating status command for checking controller readiness before connect, arm, or note entry.
