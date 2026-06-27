# plan-990-groove-compass-route-readout-quick-action

## Goal

Add a read-only Groove Compass Route Readout Quick Action so beginners and working producers can see whether the current density, anchors, hat motion, timing, chance, pocket balance, or selected-drum pocket lane should route to the Compose panel before focusing a Groove Compass card, cueing playback, editing drums, exporting, or changing project data.

## Scope

- Add a UI-local Groove Compass Route Readout Quick Action that focuses the existing Groove Compass surface without changing Groove Compass card derivation, focus-card selection, focus result state, cue state, selected drum state, musical events, playback, export state, project data, undo history, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Groove Compass card to the existing direct Groove Compass card command while retaining selected Pattern A/B/C, editable event counts, drum hit count, groove metric, song length, audition cue, and next pocket-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Groove Compass focus, Groove Compass cue, direct Groove Compass card commands, playback, export, and direct drum editing commands.

## Non-Goals

- Do not change project schema, saved project files, Groove Compass card derivation, card scoring, focus target selection, focus routing, focus result state, cue routing, selected drum state, drum edit handlers, render/download handlers, MIDI bytes, Handoff behavior, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add automatic focus, automatic cueing, automatic drum fixes, command chains, autoplay, hidden generation, sampling/imported-audio workflows, sampler devices, remote analysis, or media uploads from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a UI-local Groove Compass Route Readout Quick Action that scrolls to the existing Groove Compass surface and reports the current pocket route, selected Pattern, groove metric, drum hit count, direct `groove-compass-card-*` handoff, and destination panel without changing Groove Compass focus state, cue state, selected drum state, playback, exports, undo history, project data, or sampling scope.
- Extended Quick Actions result metrics and follow-up copy so route readout stays distinct from Groove Compass focus, Groove Compass cue, direct Groove Compass card commands, and drum editing while still exposing route, groove metric, audition cue, next pocket-route check, editable event count, drum hit count, and song length.
- Updated Command Reference, product docs, quality rules, and harness checks so GrooveForge remains framed as an all-genre direct beat workstation with sampling as secondary scope.

## Decision Log

- 2026-06-27: Selected Groove Compass Route Readout because density, anchors, hats, timing, chance, pocket balance, and selected drum diagnostics are direct drum-composition lanes, and a route readout helps beginners and producers inspect pocket direction before focus, cue, drum edit, playback, or export actions.
