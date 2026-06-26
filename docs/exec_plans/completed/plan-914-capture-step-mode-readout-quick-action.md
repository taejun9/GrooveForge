# plan-914-capture-step-mode-readout-quick-action

## Goal

Expose Capture Step Mode posture as a read-only Quick Actions status command so beginners and working producers can confirm whether desktop-key or MIDI capture will use the next empty step or replace the selected step before entering 808/Synth notes, changing placement mode, editing selected events, arranging, or exporting.

## Scope

- Add a read-only `capture-step-mode-readout-action` Quick Action that reports current Capture Step Mode, selected Pattern, selected step context, selected note context, Keyboard Capture armed/target/default posture, MIDI posture, Pattern A/B/C usage, editable note counts, arrangement length, and export readiness without changing placement mode or project data.
- Add deterministic Quick Action result metric and follow-up copy derived only from UI-local Keyboard Capture/MIDI state, selected Pattern, selected step, selected note, Pattern A/B/C usage, 808/Synth note counts, arrangement length, and export readiness.
- Update Command Reference context, README, product, quality rules, and QA expectations to lock the command, result metric, placement/project-data, sampling/privacy, and export boundaries.

## Non-Goals

- Do not change Capture Step Mode behavior, Keyboard Capture key handling, capture target/default behavior, MIDI permission handling, MIDI arm/disarm behavior, note insertion/replacement, selected-note editing, Editor Audition, playback scheduling, Pattern data, arrangement data, save/load, project schema, or render/export output.
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
- Note: `npm run build` and `npm run verify` still report the existing Vite large chunk warning.

## Completion Notes

- Added a read-only `capture-step-mode-readout-action` Quick Action that opens only the existing Compose input area and reports Next empty versus Replace selected placement, 808/Synth target, selected note/step posture, next capture step, Keyboard Capture armed state, capture defaults, MIDI posture, selected Pattern/block, Pattern A/B/C usage, 808/Synth note counts, arrangement length, and export readiness without changing placement mode or inserting notes.
- Added a deterministic Capture Step Mode result metric and follow-up copy for input placement readiness before desktop-key or MIDI note entry.
- Updated Command Reference context, README, product docs, quality rules, and QA expectations so the readout stays local, read-only, sample-free, and separate from mutating Capture Step Mode, Keyboard Capture, MIDI, and selected-note edit commands.

## Decision Log

- 2026-06-27: Selected Capture Step Mode Readout because Command Reference already frames Capture Step Mode as readout-capable input posture, but command search needs a non-mutating status command for checking placement behavior before note entry or selected-step replacement.
