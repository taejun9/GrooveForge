# plan-948-pattern-stack-readout-quick-action

## Goal

Expose Pattern Stack as a dedicated read-only Quick Action so beginners and working producers can inspect the selected Pattern A/B/C 808/chord/Synth posture, current suggested stack, current preview target, selected-pattern event posture, arrangement usage, audition cue, and next Pattern Stack check before explicitly applying a stack sketch to the selected Pattern.

## Scope

- Add a UI-local Pattern Stack Readout Quick Action that focuses existing Compose/Pattern context without applying stack changes, changing selected Pattern, selected arrangement block, selected-block assignment, loop scope, playback, arrangement state, or project data.
- Add result metrics and follow-up copy for selected Pattern A/B/C, current preview or suggested stack, 808/chord/Synth posture, selected-pattern event count, drum/music posture, arrangement usage, audition cue, and next manual Pattern Stack check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Pattern Stack Readout is distinct from direct Pattern Stack commands that mutate Pattern A/B/C data.

## Non-Goals

- Do not change project schema, saved project files, playback scheduling, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Pattern Stack, Layer Starter, Pattern Variation, Pattern Fill, Pattern Clone, Pattern Copy, Pattern Clear, Pattern Switch, Pattern Cue, Pattern Use, Pattern Compare Decision, selected-block navigation, selected Pattern changes, loop-scope changes, playback start/stop, arrangement mutations, Pattern A/B/C edits, or export changes from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Pattern Stack Readout Quick Action that focuses Compose/Pattern context and reports selected Pattern A/B/C, suggested 808/chord/Synth stack, current preview target, move count, selected-pattern event count, drum/music posture, layer readiness, arrangement usage, audition cue, and next Pattern Stack check.
- Added local result metric and follow-up handling for `pattern-stack-readout-action` without routing through direct Pattern Stack mutation handlers.
- Updated Command Reference, README, product rules, quality rules, and harness checks so Pattern Stack Readout remains separate from direct stack commands.

## Decision Log

- 2026-06-27: Selected Pattern Stack Readout because direct Pattern Stack commands intentionally mutate selected Pattern A/B/C 808/chord/Synth sketch layers, while command search should also provide a read-only pre-flight posture for users who only want to inspect stack readiness, suggested target, arrangement use, and next check before editing.
- 2026-06-27: Kept the readout action routed only through existing focus/readout paths so it does not apply stacks, change selected Pattern, change loop scope, start playback, alter arrangement, export, or touch sampling scope.
