# plan-949-layer-starter-readout-quick-action

## Goal

Expose Layer Starter as a dedicated read-only Quick Action so beginners and working producers can inspect the selected Pattern A/B/C Drums/808/Chords/Synth readiness, current priority missing or thin layer, selected-pattern event posture, arrangement usage, audition cue, and next Layer Starter check before explicitly starting any layer.

## Scope

- Add a UI-local Layer Starter Readout Quick Action that focuses existing Compose/Pattern context without starting layers, changing selected Pattern, selected arrangement block, selected-block assignment, loop scope, playback, arrangement state, or project data.
- Add result metrics and follow-up copy for selected Pattern A/B/C, priority starter lane, Drums/808/Chords/Synth readiness, selected-pattern event count, drum/music posture, arrangement usage, audition cue, and next manual Layer Starter check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Layer Starter Readout is distinct from direct Layer Starter commands that mutate Pattern A/B/C data.

## Non-Goals

- Do not change project schema, saved project files, playback scheduling, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Layer Starter, Pattern Stack, Pattern Variation, Pattern Fill, Pattern Clone, Pattern Copy, Pattern Clear, Pattern Switch, Pattern Cue, Pattern Use, Pattern Compare Decision, selected-block navigation, selected Pattern changes, loop-scope changes, playback start/stop, arrangement mutations, Pattern A/B/C edits, or export changes from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Layer Starter Readout Quick Action that focuses Compose/Pattern context and reports selected Pattern A/B/C, Drums/808/Chords/Synth readiness, priority missing or thin layer, selected-pattern event count, drum/music posture, arrangement usage, audition cue, and next Layer Starter check.
- Added local result metric and follow-up handling for `layer-starter-readout-action` without routing through direct Layer Starter mutation handlers.
- Updated Command Reference, README, product rules, quality rules, and harness checks so Layer Starter Readout remains separate from direct starter commands.

## Decision Log

- 2026-06-27: Selected Layer Starter Readout because direct Layer Starter commands intentionally mutate selected Pattern A/B/C Drums/808/Chords/Synth events, while command search should also provide a read-only pre-flight posture for users who only want to inspect readiness, priority layer, arrangement use, and next check before editing.
- 2026-06-27: Kept the readout action routed only through existing focus/readout paths so it does not start layers, change selected Pattern, change loop scope, start playback, alter arrangement, export, or touch sampling scope.
