# plan-942-pattern-cue-readout-quick-action

## Goal

Expose Pattern Cue as a dedicated read-only Quick Action so beginners and working producers can inspect the target Pattern A/B/C audition posture, current edit Pattern, selected-block placement, Pattern loop scope, target Pattern event count, arrangement usage, audition cue, and next Pattern Cue check before explicitly cueing a Pattern loop.

## Scope

- Add a UI-local Pattern Cue Readout Quick Action that focuses existing Compose/Pattern context without changing selected Pattern, selected arrangement block, selected-block assignment, loop scope, playback, arrangement state, Pattern events, or project data.
- Add result metrics and follow-up copy for target Pattern A/B/C, current edit Pattern, selected-block placement, Pattern loop scope, target Pattern event count, drum/music posture, arrangement usage, audition cue, and next manual Pattern Cue check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Pattern Cue Readout is distinct from direct Pattern Cue commands that set the selected Pattern preview and Pattern loop scope.

## Non-Goals

- Do not change project schema, saved project files, playback scheduling, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Pattern Cue, Pattern Switch, Pattern Use, Pattern Compare Decision, selected-block navigation, selected Pattern changes, loop-scope changes, playback start/stop, arrangement mutations, Pattern A/B/C edits, or export changes from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `pattern-cue-readout-action` Quick Action that focuses existing Compose/Pattern context and reports target Pattern A/B/C audition posture without changing selected Pattern, loop scope, playback, arrangement state, Pattern events, or project data.
- Added result metric and follow-up copy for target Pattern A/B/C, current edit Pattern, selected-block placement, Pattern loop scope, target Pattern event count, drum/music posture, arrangement usage, audition cue, and next Pattern Cue check.
- Updated Command Reference coverage, product docs, quality rules, and harness checks so Pattern Cue Readout is distinct from direct `pattern-cue-*` commands that set selected Pattern preview and Pattern loop scope.

## Decision Log

- 2026-06-27: Selected Pattern Cue Readout because direct Pattern Cue commands intentionally switch the audition Pattern and Pattern loop scope, while command search should also provide a read-only pre-flight posture for users who only want to inspect the cue target before auditioning.
- 2026-06-27: Kept the readout action routed only through existing focus/readout paths so it does not change selected Pattern, selected-block assignment, loop scope, playback, project data, export, or sampling scope.
