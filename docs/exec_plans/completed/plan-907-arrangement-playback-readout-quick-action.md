# plan-907-arrangement-playback-readout-quick-action

## Goal

Expose Arrangement Playback Readout as a read-only Quick Actions status command so beginners and working producers can confirm the selected editing block, currently audible block, Pattern assignment, bar range, loop scope, BPM, and next arrangement check from command search before changing section order, block details, Pattern placement, or arrangement energy.

## Scope

- Add a read-only `arrangement-playback-readout-action` Quick Action that reports the existing Arrangement Playback Readout without following the audible block or mutating project data.
- Add deterministic Quick Action result metric and follow-up copy derived only from the current local Arrangement Playback Readout, selected arrangement block, audible arrangement snapshot, transport loop scope, BPM, Pattern A/B/C usage, arrangement block count, total song bars, and editable events.
- Update Command Reference context, README, product, quality rules, and QA expectations to lock the command, result metric, and sampling/privacy/export boundaries.

## Non-Goals

- Do not change Audible Arrangement Follow, selected arrangement block behavior, selected Pattern alignment, realtime playback snapshots, existing Arrangement Playback UI, playback scheduling, loop-scope selection, Pattern data, arrangement block data, save/load, project schema, or render/export output.
- Do not add auto-follow mode, auto-selecting during playback, autoplay, recording, quantization, transport seeking, hidden arrangement generation, automatic section rewriting, audio input, imported audio, beat detection, sampler tracks, remote AI, accounts, analytics, cloud sync, or automatic timing correction.

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

- Added a read-only `arrangement-playback-readout-action` Quick Action that opens the existing Arrangement editor and reports edit-vs-heard block context without selecting the audible block, starting playback, changing loop scope, mutating arrangement blocks, or changing Pattern data.
- Added a deterministic Quick Action result metric and follow-up copy covering Arrangement Playback status, selected editing block, audible block context, Pattern assignment, bar range, loop scope, BPM, Pattern A/B/C usage, arrangement block count, song length, audition cue, and next arrangement check.
- Updated Command Reference context, README, product docs, quality rules, and QA expectations to keep the command local, read-only, sample-free, and separate from Audible Arrangement Follow behavior.

## Decision Log

- 2026-06-26: Selected Arrangement Playback Readout because the workstation has visible edit-vs-heard arrangement block state and an Audible Arrangement Follow command, but command search does not expose a non-mutating readout command for checking arrangement playback context before editing song structure.
