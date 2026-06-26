# plan-947-pattern-fill-readout-quick-action

## Goal

Expose Pattern Fill as a dedicated read-only Quick Action so beginners and working producers can inspect the selected Pattern A/B/C, suggested Drum Fill/808 Pickup/Melody Turn/Clear Tail move, current preview preset, selected-pattern event posture, tail-change posture, arrangement usage, audition cue, and next Pattern Fill check before explicitly applying a fill to the selected Pattern.

## Scope

- Add a UI-local Pattern Fill Readout Quick Action that focuses existing Compose/Pattern context without applying fill changes, changing selected Pattern, selected arrangement block, selected-block assignment, loop scope, playback, arrangement state, or project data.
- Add result metrics and follow-up copy for selected Pattern A/B/C, suggested fill move, current preview preset, selected-pattern event count, drum/music posture, tail-change posture, arrangement usage, audition cue, and next manual Pattern Fill check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Pattern Fill Readout is distinct from direct Pattern Fill commands that mutate Pattern A/B/C data.

## Non-Goals

- Do not change project schema, saved project files, playback scheduling, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Pattern Fill, Pattern Variation, Pattern Clone, Pattern Copy, Pattern Clear, Pattern Switch, Pattern Cue, Pattern Use, Pattern Compare Decision, selected-block navigation, selected Pattern changes, loop-scope changes, playback start/stop, arrangement mutations, Pattern A/B/C edits, or export changes from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Pattern Fill Readout Quick Action that focuses Compose/Pattern context and reports selected Pattern A/B/C, suggested Drum Fill/808 Pickup/Melody Turn/Clear Tail move, current preview preset, tail-change posture, selected-pattern event count, drum/music posture, arrangement usage, audition cue, and next Pattern Fill check.
- Added local result metric and follow-up handling for `pattern-fill-readout-action` without routing through direct Pattern Fill mutation handlers.
- Updated Command Reference, README, product rules, quality rules, and harness checks so Pattern Fill Readout remains separate from direct fill commands.

## Decision Log

- 2026-06-27: Selected Pattern Fill Readout because direct Pattern Fill commands intentionally mutate the selected Pattern A/B/C tail events, while command search should also provide a read-only pre-flight posture for users who only want to inspect the suggested move, preview preset, tail-change posture, and arrangement use before editing.
- 2026-06-27: Kept the readout action routed only through existing focus/readout paths so it does not apply fills, change selected Pattern, change loop scope, start playback, alter arrangement, export, or touch sampling scope.
