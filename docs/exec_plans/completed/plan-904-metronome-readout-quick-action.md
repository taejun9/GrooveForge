# plan-904-metronome-readout-quick-action

## Goal

Expose Metronome as a read-only Quick Actions status command so beginners and working producers can confirm click state, BPM, loop scope, selected Pattern, selected block, and export-clean posture before pressing Play or programming timing-critical beat parts.

## Scope

- Add a read-only `metronome-readout` Quick Action that reports current click/grid posture without toggling the metronome or starting playback.
- Add deterministic Quick Action result metric and follow-up copy derived only from local metronome state, BPM, transport loop scope, selected Pattern, selected arrangement block, arrangement length, and current editable events.
- Update Command Reference context, README, product, quality rules, and QA expectations to lock the readout, realtime-only click behavior, and sampling/privacy/export boundaries.

## Non-Goals

- Do not change the existing `metronome-toggle` command, transport button, realtime click synthesis, Play/Stop behavior, playback scheduling, loop-scope selection, Tap Tempo, Tempo Nudge, arrangement data, Pattern data, save/load, project schema, or render/export output.
- Do not add count-in, recording, quantization, click rendering, audio input, imported audio, beat detection, sampler tracks, remote AI, accounts, analytics, cloud sync, or automatic timing correction.

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

- Added a read-only `metronome-readout` Quick Action that opens the existing Transport strip without toggling the metronome, starting playback, changing timing controls, or mutating project data.
- Added a deterministic Quick Action result metric and follow-up copy covering click on/off state, BPM, loop scope, selected Pattern, selected block, editable event count, Pattern A/B/C usage, arrangement block count, song length, audition cue, and click-free export posture.
- Updated Command Reference context, README, product docs, quality rules, and QA expectations to keep the command local, read-only, sample-free, and separate from realtime click toggle behavior.

## Decision Log

- 2026-06-26: Selected Metronome readout because Command Reference marks Metronome as `Quick Actions / Readout`, but the available command primarily toggles the realtime click instead of providing a non-mutating current-grid status check.
