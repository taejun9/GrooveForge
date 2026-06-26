# plan-940-selected-arrangement-block-readout-quick-action

## Goal

Expose the currently selected arrangement block as a dedicated read-only Quick Action so beginners and working producers can inspect the selected block number, section role, Pattern A/B/C assignment, bar range, bar length, energy, mute posture, editable event count, arrangement block count, song length, audition cue, and next navigation/cue check before running Arrangement Block Jump or Cue commands.

## Scope

- Add a UI-local Selected Arrangement Block Readout Quick Action that focuses the existing Arrange panel and selected block context without changing selected block, selected Pattern, loop scope, playback, arrangement state, or project data.
- Add result metrics and follow-up copy for selected block scope, section, Pattern A/B/C assignment, bar range, bar length, energy, mute posture, editable event count, arrangement block count, song length, audition cue, and next manual jump/cue check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Selected Arrangement Block Readout is distinct from Arrangement Block Jump and Arrangement Block Cue commands.

## Non-Goals

- Do not change project schema, saved project files, playback scheduling, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Arrangement Block Jump, Arrangement Block Cue, selected-block navigation, Pattern selection, loop-scope changes, playback start/stop, arrangement mutations, Pattern A/B/C edits, or export changes from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `selected-arrangement-block-readout-action` Quick Action that focuses the existing Arrange panel and reports current selected-block posture without changing selected block, selected Pattern, loop scope, playback, arrangement state, or project data.
- Added result metric and follow-up copy for selected block scope, section role, Pattern A/B/C assignment, bar range, bar length, energy, mute posture, editable event count, Pattern usage, arrangement length, audition cue, and next Jump/Cue check.
- Updated Command Reference coverage, product docs, quality rules, and harness checks so Selected Arrangement Block Readout is distinct from Arrangement Block Jump and Arrangement Block Cue.

## Decision Log

- 2026-06-27: Selected Selected Arrangement Block Readout because current Arrangement Block Jump/Cue commands are explicit navigation/cue actions, while command search should also provide a read-only pre-flight posture for the currently selected block.
- 2026-06-27: Kept the readout action routed only through the existing Arrange panel focus path so it does not change selection, Pattern, loop scope, playback, project data, export, or sampling scope.
