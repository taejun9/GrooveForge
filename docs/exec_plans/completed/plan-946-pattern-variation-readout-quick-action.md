# plan-946-pattern-variation-readout-quick-action

## Goal

Expose Pattern Variation as a dedicated read-only Quick Action so beginners and working producers can inspect the selected Pattern A/B/C, suggested Subtle/Hook/Break variation, current preview preset, selected-pattern event posture, layer-change posture, arrangement usage, audition cue, and next Pattern Variation check before explicitly applying a variation to the selected Pattern.

## Scope

- Add a UI-local Pattern Variation Readout Quick Action that focuses existing Compose/Pattern context without applying variation changes, changing selected Pattern, selected arrangement block, selected-block assignment, loop scope, playback, arrangement state, or project data.
- Add result metrics and follow-up copy for selected Pattern A/B/C, suggested variation, current preview preset, selected-pattern event count, drum/music posture, layer-change posture, arrangement usage, audition cue, and next manual Pattern Variation check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Pattern Variation Readout is distinct from direct Pattern Variation commands that mutate Pattern A/B/C data.

## Non-Goals

- Do not change project schema, saved project files, playback scheduling, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-run Pattern Variation, Pattern Fill, Pattern Clone, Pattern Copy, Pattern Clear, Pattern Switch, Pattern Cue, Pattern Use, Pattern Compare Decision, selected-block navigation, selected Pattern changes, loop-scope changes, playback start/stop, arrangement mutations, Pattern A/B/C edits, or export changes from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `pattern-variation-readout-action` Quick Action that focuses the existing Compose/Pattern context and reports selected Pattern A/B/C variation posture before any direct Pattern Variation command runs.
- Added result metrics for suggested Subtle/Hook/Break move, current preview preset, selected-pattern event count, drum/music posture, layer-change posture, arrangement usage, audition cue, and next Pattern Variation check without mutating Pattern data, arrangement assignment, loop scope, playback, export, or sampling scope.
- Updated Command Reference coverage, README/product positioning, quality rules, and harness expectations so the readout remains distinct from direct Pattern Variation commands.

## Decision Log

- 2026-06-27: Selected Pattern Variation Readout because direct Pattern Variation commands intentionally mutate the selected Pattern A/B/C events, while command search should also provide a read-only pre-flight posture for users who only want to inspect the suggested move, preview preset, layer posture, and arrangement use before editing.
- 2026-06-27: Kept the readout action routed only through existing focus/readout paths so it does not apply variations, change selected Pattern, change loop scope, start playback, alter arrangement, export, or touch sampling scope.
