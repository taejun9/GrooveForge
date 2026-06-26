# plan-910-swing-feel-readout-quick-action

## Goal

Expose Swing Feel posture as a read-only Quick Actions status command so beginners and working producers can confirm current swing, style default, Straight/Tight/Laid/Loose/Style targets, selected Pattern context, and next groove check from command search before changing timing feel, programming drums, arranging, recording MIDI input, or exporting.

## Scope

- Add a read-only `swing-feel-readout-action` Quick Action that reports current Swing Feel posture without changing `project.swing` or applying a Swing Feel pad.
- Add deterministic Quick Action result metric and follow-up copy derived only from current project swing, local Swing Feel pad definitions, selected style profile default swing, selected Pattern, selected arrangement block, transport loop scope, metronome state, Pattern A/B/C usage, arrangement length, and editable events.
- Update Command Reference context, README, product, quality rules, and QA expectations to lock the command, result metric, swing/project-data, sampling/privacy, and export boundaries.

## Non-Goals

- Do not change Swing Feel pad behavior, manual Swing slider behavior, style selection, style profile definitions, Tap Tempo, Tempo Nudge, playback scheduling, loop-scope selection, metronome audio, Pattern data, arrangement data, save/load, project schema, or render/export output.
- Do not add drum microtiming rewrites, automatic groove extraction, audio input, beat detection, tempo automation, recording, count-in, transport seeking, hidden timing mutation, sampler tracks, imported audio, remote AI, accounts, analytics, cloud sync, or automatic timing correction.

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

- Added a read-only `swing-feel-readout-action` Quick Action that opens the existing Transport strip and reports current swing, style default, and Straight/Tight/Laid/Loose/Style targets without changing swing, applying pads, starting playback, or changing export behavior.
- Added a deterministic Quick Action result metric and follow-up copy covering swing posture, target routes, loop scope, metronome state, selected Pattern, selected block, Pattern A/B/C usage, arrangement block count, song length, audition cue, and next groove check.
- Updated Command Reference context, README, product docs, quality rules, and QA expectations to keep the command local, read-only, sample-free, and separate from mutating Swing Feel behavior.

## Decision Log

- 2026-06-26: Selected Swing Feel Readout because the workstation exposes mutating Swing Feel commands and Command Reference setup context, but command search does not expose a non-mutating swing-target summary for checking groove feel before changing timing.
