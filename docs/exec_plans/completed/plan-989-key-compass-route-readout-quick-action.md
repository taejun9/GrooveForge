# plan-989-key-compass-route-readout-quick-action

## Goal

Add a read-only Key Compass Route Readout Quick Action so beginners and working producers can see whether the current scale, cadence, chord, 808/bass, melody, or selected-note/chord harmony lane should route to the Compose panel before focusing a Key Compass card, retargeting key, editing notes/chords, playing back, exporting, or changing project data.

## Scope

- Add a UI-local Key Compass Route Readout Quick Action that focuses the existing Key Compass surface without changing Key Compass card derivation, focus-card selection, focus result state, musical events, playback, export state, project data, undo history, key retargeting, note/chord editing, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Key Compass card to the existing direct Key Compass card command while retaining selected Pattern A/B/C, editable event counts, current project key, key metric, song length, audition cue, and next harmony-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Key Compass focus, direct Key Compass card commands, key retargeting, playback, export, and direct editing commands.

## Non-Goals

- Do not change project schema, saved project files, Key Compass card derivation, card scoring, focus target selection, focus routing, focus result state, key retargeting, note/chord edit handlers, render/download handlers, MIDI bytes, Handoff behavior, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add automatic focus, automatic key rewriting, automatic fixes, command chains, autoplay, hidden generation, sampling/imported-audio workflows, sampler devices, remote analysis, or media uploads from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a UI-local Key Compass Route Readout Quick Action that scrolls to the existing Key Compass surface and reports the current harmony route, selected Pattern, current key, card metric, direct `key-compass-card-*` handoff, and destination panel without changing Key Compass focus state, key retargeting, note/chord edits, playback, exports, undo history, project data, or sampling scope.
- Extended Quick Actions result metrics and follow-up copy so route readout stays distinct from Key Compass focus, direct Key Compass card commands, and key retargeting while still exposing route, key metric, audition cue, next harmony-route check, editable event count, and song length.
- Updated Command Reference, product docs, quality rules, and harness checks so GrooveForge remains framed as an all-genre direct beat workstation with sampling as secondary scope.

## Decision Log

- 2026-06-27: Selected Key Compass Route Readout because key, harmony, 808/bass, melody, and selected-note/chord diagnostics are direct-composition lanes, and a route readout helps beginners and producers inspect harmony direction before focus, key retargeting, edit, playback, or export actions.
