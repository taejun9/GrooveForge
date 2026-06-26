# plan-912-style-direction-readout-quick-action

## Goal

Expose Style Quick Picks posture as a read-only Quick Actions status command so beginners and working producers can confirm the current style direction, supported style targets, BPM/swing posture, bass/melody roles, sound preset, selected Pattern context, Pattern A/B/C density, arrangement fit, and next style check from command search before applying a different style, writing parts, arranging, recording MIDI input, or exporting.

## Scope

- Add a read-only `style-direction-readout-action` Quick Action that reports current Style Quick Picks posture without changing `project.styleId`, applying a style profile, changing BPM/swing, or rewriting Pattern A/B/C events.
- Add deterministic Quick Action result metric and follow-up copy derived only from current style/profile data, local style options, selected Pattern, selected arrangement block, transport loop scope, metronome state, Pattern A/B/C event counts, arrangement length, and editable events.
- Update Command Reference context, README, product, quality rules, and QA expectations to lock the command, result metric, style/project-data, sampling/privacy, and export boundaries.

## Non-Goals

- Do not change Style Quick Pick behavior, style profile definitions, Style Inspector derivation, Style Goal cue/action behavior, current-style starter behavior, Beat Blueprint behavior, Tap Tempo, Tempo Nudge, Swing Feel, Key Retarget, playback scheduling, Pattern data, arrangement data, save/load, project schema, or render/export output.
- Do not add auto-style detection, auto-applying styles, hidden generation, audio input analysis, recording, sampler tracks, imported audio, remote AI, accounts, analytics, cloud sync, or music-theory/genre-fit guarantees.

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

- Added a read-only `style-direction-readout-action` Quick Action that opens the existing Style Inspector and reports current style, style targets, BPM range, active/default swing, roles, sound preset, and selected Pattern posture without applying a style, changing BPM/swing, rewriting events, starting playback, or changing export behavior.
- Added a deterministic Quick Action result metric and follow-up copy covering style posture, style target options, Style Goal posture, Pattern A/B/C density, loop scope, metronome state, selected block, Pattern usage, arrangement block count, song length, audition cue, and next style check.
- Updated Command Reference context, README, product docs, quality rules, and QA expectations to keep the command local, read-only, sample-free, and separate from mutating Style Quick Pick behavior.

## Decision Log

- 2026-06-26: Selected Style Direction Readout because the workstation exposes mutating Style Quick Pick commands and Command Reference setup context, but command search does not expose a non-mutating style-target summary for checking genre direction before changing the project style.
