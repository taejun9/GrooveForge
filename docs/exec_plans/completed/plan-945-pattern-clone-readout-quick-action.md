# plan-945-pattern-clone-readout-quick-action

## Goal

Expose Pattern Clone as a dedicated read-only Quick Action so beginners and working producers can inspect the selected Pattern A/B/C, safest clone target, hook/breakdown variation suggestion, selected-pattern event posture, target overwrite posture, arrangement usage, audition cue, and next Pattern Clone check before explicitly cloning into another Pattern slot.

## Scope

- Add a UI-local Pattern Clone Readout Quick Action that focuses existing Compose/Pattern context without cloning Pattern data, changing selected Pattern, selected arrangement block, selected-block assignment, loop scope, playback, arrangement state, or project data.
- Add result metrics and follow-up copy for selected Pattern A/B/C, suggested target Pattern, suggested variation, source/target event counts, drum/music posture, arrangement usage, overwrite risk, audition cue, and next manual Pattern Clone check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Pattern Clone Readout is distinct from direct Pattern Clone commands that mutate Pattern A/B/C data.

## Non-Goals

- Do not change project schema, saved project files, playback scheduling, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Pattern Clone, Pattern Copy, Pattern Clear, Pattern Switch, Pattern Cue, Pattern Use, Pattern Compare Decision, selected-block navigation, selected Pattern changes, loop-scope changes, playback start/stop, arrangement mutations, Pattern A/B/C edits, or export changes from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `pattern-clone-readout-action` Quick Action that focuses the existing Compose/Pattern context and reports selected Pattern A/B/C clone posture before any direct Pattern Clone command runs.
- Added result metrics for safest target slot, suggested Hook/Break variation, source and target event counts, source/target drum/music posture, source/target arrangement usage, overwrite risk, audition cue, and next Pattern Clone check without mutating Pattern data, arrangement assignment, loop scope, playback, export, or sampling scope.
- Updated Command Reference coverage, README/product positioning, quality rules, and harness expectations so the readout remains distinct from direct Pattern Clone commands.

## Decision Log

- 2026-06-27: Selected Pattern Clone Readout because direct clone commands intentionally overwrite another Pattern A/B/C slot, while command search should also provide a read-only pre-flight posture for users who only want to inspect source, target, variation, and overwrite risk before editing.
- 2026-06-27: Kept the readout action routed only through existing focus/readout paths so it does not clone, change selected Pattern, change loop scope, start playback, alter arrangement, export, or touch sampling scope.
