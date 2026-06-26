# plan-911-key-retarget-readout-quick-action

## Goal

Expose Key Retarget posture as a read-only Quick Actions status command so beginners and working producers can confirm current project key, available key targets, selected Pattern context, retargetable event count, Pattern A/B/C usage, and next key check from command search before changing harmonic center, editing notes/chords, arranging, recording MIDI input, or exporting.

## Scope

- Add a read-only `key-retarget-readout-action` Quick Action that reports current Key Retarget posture without changing `project.key` or retargeting Pattern A/B/C events.
- Add deterministic Quick Action result metric and follow-up copy derived only from current project key, local key options, selected Pattern, selected arrangement block, transport loop scope, metronome state, retargetable Pattern A/B/C event counts, arrangement length, and editable events.
- Update Command Reference context, README, product, quality rules, and QA expectations to lock the command, result metric, key/project-data, sampling/privacy, and export boundaries.

## Non-Goals

- Do not change Key Retarget command behavior, retargeting algorithms, key options, scale definitions, selected-note or selected-chord editing, Keyboard Capture, MIDI Input, style selection, Tap Tempo, Tempo Nudge, Swing Feel, playback scheduling, Pattern data, arrangement data, save/load, project schema, or render/export output.
- Do not add automatic key detection, auto-retargeting, hidden generation, audio input analysis, recording, sampler tracks, imported audio, remote AI, accounts, analytics, cloud sync, or music-theory guarantees.

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

- Added a read-only `key-retarget-readout-action` Quick Action that opens the existing Transport strip and reports current project key, available key targets, Pattern A/B/C retargetable event counts, and selected Pattern posture without changing key, retargeting events, starting playback, or changing export behavior.
- Added a deterministic Quick Action result metric and follow-up copy covering key posture, key target options, selected block, Pattern A/B/C usage, arrangement block count, song length, audition cue, and next key check.
- Updated Command Reference context, README, product docs, quality rules, and QA expectations to keep the command local, read-only, sample-free, and separate from mutating Key Retarget behavior.

## Decision Log

- 2026-06-26: Selected Key Retarget Readout because the workstation exposes mutating Key Retarget commands and Command Reference setup context, but command search does not expose a non-mutating key-target summary for checking harmonic impact before changing the project key.
