# plan-930-chain-expand-readout-quick-action

## Goal

Expose Chain Expand as a dedicated read-only Quick Action so beginners and working producers can inspect the current 16-bar expansion target, song-form outline posture, arrangement length, and next audition check before explicitly expanding the song form.

## Scope

- Add a UI-local Chain Expand Readout Quick Action that focuses the existing Arrange panel without running `expandPatternChain`.
- Add result metrics/follow-up copy for the current Chain Expand recommendation, current Pattern A/B/C sequence, target 16-bar outline posture, block count, hook count, bar count, selected Pattern, editable event count, audition cue, and next manual expand check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Chain Expand readout coverage is distinct from the mutating Chain Expand command.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Chain Expand, Pattern Chain, arrangement templates, arrangement moves, or Pattern A/B/C edits from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `Chain Expand Readout` Quick Action that focuses the existing Arrange panel and reports the target 16-bar outline without running `expandPatternChain`.
- Split Command Reference/docs coverage so `Chain Expand Readout` is the status path and `Chain Expand` remains the explicit decision/expand path.
- Updated the QA harness to cover the new readout command, result metric, follow-up copy, Command Reference row, and non-mutating quality rules.

## Decision Log

- 2026-06-27: Selected Chain Expand Readout to finish the plan-921 through plan-930 readout block and separate 16-bar song-form inspection from the mutating Chain Expand command.
