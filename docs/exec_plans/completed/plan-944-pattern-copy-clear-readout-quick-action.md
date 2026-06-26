# plan-944-pattern-copy-clear-readout-quick-action

## Goal

Expose Pattern Copy/Clear as a dedicated read-only Quick Action so beginners and working producers can inspect the selected Pattern A/B/C, available copy targets, selected-pattern event posture, arrangement usage, clear risk, audition cue, and next Pattern Copy/Clear check before explicitly copying into another slot or clearing the selected Pattern.

## Scope

- Add a UI-local Pattern Copy/Clear Readout Quick Action that focuses existing Compose/Pattern context without copying Pattern data, clearing Pattern data, changing selected Pattern, selected arrangement block, selected-block assignment, loop scope, playback, arrangement state, or project data.
- Add result metrics and follow-up copy for selected Pattern A/B/C, available copy targets, selected-pattern event count, drum/music posture, arrangement usage, clear risk, audition cue, and next manual Pattern Copy/Clear check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Pattern Copy/Clear Readout is distinct from direct Pattern Copy/Clear commands that mutate Pattern A/B/C data.

## Non-Goals

- Do not change project schema, saved project files, playback scheduling, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Pattern Copy, Pattern Clear, Pattern Switch, Pattern Cue, Pattern Use, Pattern Compare Decision, selected-block navigation, selected Pattern changes, loop-scope changes, playback start/stop, arrangement mutations, Pattern A/B/C edits, or export changes from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `pattern-copy-clear-readout-action` Quick Action that focuses the existing Compose/Pattern context and reports selected Pattern A/B/C copy-clear posture before any direct copy or clear command runs.
- Added result metrics for available copy targets, event count, drum/music posture, arrangement usage, clear risk, audition cue, and next Pattern Copy/Clear check without mutating Pattern data, arrangement assignment, loop scope, playback, export, or sampling scope.
- Updated Command Reference coverage, README/product positioning, quality rules, and harness expectations so the readout remains distinct from direct Pattern Copy/Clear commands.

## Decision Log

- 2026-06-27: Selected Pattern Copy/Clear Readout because direct copy and clear commands intentionally mutate Pattern A/B/C data, while command search should also provide a read-only pre-flight posture for users who only want to inspect source, targets, and clear risk before editing.
- 2026-06-27: Kept the readout action routed only through existing focus/readout paths so it does not copy, clear, change selected Pattern, change loop scope, start playback, alter arrangement, export, or touch sampling scope.
