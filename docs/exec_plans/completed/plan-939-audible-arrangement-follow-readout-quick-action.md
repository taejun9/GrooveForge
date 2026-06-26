# plan-939-audible-arrangement-follow-readout-quick-action

## Goal

Expose Audible Arrangement Follow as a dedicated read-only Quick Action so beginners and working producers can inspect the current edit-versus-heard block posture, audible target block, Pattern A/B/C assignment, bar range, block event count, song block count, loop scope, audition cue, and next follow check before explicitly switching the editing block to the audible block.

## Scope

- Add a UI-local Audible Arrangement Follow Readout Quick Action that focuses the existing Arrangement Playback readout without changing selected block, selected Pattern, loop scope, playback, arrangement state, or project data.
- Add result metrics/follow-up copy for the current audible target, current edit block, Pattern A/B/C assignment, bar range, block event count, arrangement block count, song length, loop scope, audition cue, and next arrangement-follow check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Audible Arrangement Follow Readout is distinct from the existing Audible Arrangement Follow action that changes the explicit editing block.

## Non-Goals

- Do not change project schema, saved project files, playback scheduling, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Audible Arrangement Follow, Arrangement Playback Readout follow, selected-block navigation, Pattern selection, loop-scope changes, playback start/stop, arrangement mutations, Pattern A/B/C edits, or export changes from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `audible-arrangement-follow-readout-action` Quick Action that scrolls/focuses the existing Arrangement Playback readout and updates only UI-local status feedback.
- Added result metric and follow-up copy for audible target, edit block, Pattern assignment, event counts, arrangement length, loop posture, audition cue, and next follow check before any explicit follow handler runs.
- Updated Command Reference coverage, product docs, quality rules, and QA expectations so Audible Arrangement Follow Readout is distinct from the mutating Audible Arrangement Follow command.

## Decision Log

- 2026-06-27: Selected Audible Arrangement Follow Readout because the current follow command intentionally changes the editing block, while Command Reference discovery should also provide a read-only pre-flight posture for users who only want to inspect edit-versus-heard alignment.
- 2026-06-27: Kept the readout action routed only through the existing Arrangement Playback readout focus path so it does not change selected block, selected Pattern, loop scope, playback, project data, export, or sampling scope.
