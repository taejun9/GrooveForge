# plan-903-loop-scope-quick-action

## Goal

Expose Loop Scope as a real Quick Actions readout so beginners and working producers can search the current Song, Block, Turn, or Pattern audition scope, confirm what playback will loop, and receive a local result metric with loop scope, selected Pattern, selected block, arrangement length, metronome, audition cue, and next check before writing or arranging a beat.

## Scope

- Add a read-only `loop-scope` Quick Action that reports the current transport loop scope without starting playback or mutating project data.
- Add deterministic Quick Action result metric and follow-up copy derived only from local transport scope, selected Pattern, selected arrangement block, transition loop target, arrangement length, metronome state, BPM, and current project events.
- Update Command Reference context, README, product, quality rules, and QA expectations to lock the command, result metric, and sampling/privacy boundaries.

## Non-Goals

- Do not change playback scheduling, Play/Stop behavior, loop-scope selection buttons, metronome audio, Tap Tempo, Tempo Nudge, arrangement data, Pattern data, export output, save/load, project schema, or sampling scope.
- Do not add autoplay, count-in, recording, marker persistence, audio input, imported audio, beat detection, remote AI, accounts, analytics, cloud sync, or auto-export.

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

- Added a read-only `loop-scope` Quick Action that opens the existing Transport strip without starting playback, changing the loop scope, or mutating project data.
- Added a deterministic Quick Action result metric and follow-up copy covering the current Song/Block/Turn/Pattern loop, selected Pattern, selected block, editable event count, Pattern A/B/C usage, BPM, metronome state, arrangement block count, song length, audition cue, and next loop check.
- Updated Command Reference context, README, product docs, quality rules, and QA expectations to keep the command local, read-only, sample-free, and out of export/render behavior.

## Decision Log

- 2026-06-26: Selected Loop Scope Quick Action because the Desktop Command Reference marks Loop Scope as `Quick Actions / Readout`, but the app only exposed scattered loop selection commands instead of a single read-only current-loop readout and result metric.
