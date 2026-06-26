# plan-941-pattern-use-readout-quick-action

## Goal

Expose Pattern Use as a dedicated read-only Quick Action so beginners and working producers can inspect the selected arrangement block, current edit Pattern, target Pattern A/B/C placement posture, bar range, target Pattern event count, arrangement usage, audition cue, and next assignment check before explicitly assigning a Pattern to the selected block.

## Scope

- Add a UI-local Pattern Use Readout Quick Action that focuses existing Compose/Arrange context without changing selected Pattern, selected arrangement block, arrangement block assignment, loop scope, playback, arrangement state, or project data.
- Add result metrics and follow-up copy for selected block scope, section, current block Pattern, current edit Pattern, suggested/target Pattern A/B/C, bar range, target Pattern event count, arrangement usage, audition cue, and next manual Pattern Use check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Pattern Use Readout is distinct from direct Pattern Use commands that mutate selected-block assignment.

## Non-Goals

- Do not change project schema, saved project files, playback scheduling, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Pattern Use, Pattern Compare Decision, Pattern Cue, Pattern Switch, selected-block navigation, selected Pattern changes, loop-scope changes, playback start/stop, arrangement mutations, Pattern A/B/C edits, or export changes from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `pattern-use-readout-action` Quick Action that focuses existing arrangement context and reports selected-block Pattern placement without changing selected Pattern, selected block, loop scope, playback, arrangement state, or project data.
- Added result metric and follow-up copy for target Pattern A/B/C, selected-block placement, current edit Pattern, bar range, target Pattern event count, drum/music posture, arrangement usage, audition cue, and next Pattern Use check.
- Updated Command Reference coverage, product docs, quality rules, and harness checks so Pattern Use Readout is distinct from direct `pattern-use-*` assignment commands.

## Decision Log

- 2026-06-27: Selected Pattern Use Readout because direct Pattern Use commands intentionally mutate selected-block Pattern assignment, while command search should also provide a read-only pre-flight posture for users who only want to inspect placement before assigning.
- 2026-06-27: Kept the readout action routed only through existing focus/readout paths so it does not change selected Pattern, selected-block assignment, loop scope, playback, project data, export, or sampling scope.
