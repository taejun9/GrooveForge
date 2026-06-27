# plan-993-topline-space-route-readout-quick-action

## Goal

Add a read-only Topline Space Route Readout Quick Action so first-time beat makers and working producers can see whether the current rhythm pocket, lead density, vocal window, mix headroom, or artist cue lane should route to Compose, Arrange, Mix, Master, Deliver, or Session Brief before focusing Topline Space, cueing a topline loop, applying a topline fix, editing events, playing back, exporting, or changing project data.

## Scope

- Add a UI-local Topline Space Route Readout Quick Action that focuses the existing Topline Space surface without changing Topline Space card derivation, priority-card selection, focus result state, topline loop cue state, topline fix routing, musical events, playback, export state, project data, undo history, vocal-recording scope, lyric-generation scope, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Topline Space card to the existing direct Topline Space card command while retaining selected Pattern A/B/C, topline metric, destination, hook/window posture, export/stem/package readiness, fix availability, audition cue, and next topline-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Topline Space focus, topline loop cue, topline fix, direct Topline Space card commands, playback, export, remote analysis, vocal recording, lyric generation, and imported-audio workflows.

## Non-Goals

- Do not change project schema, saved project files, Topline Space card derivation, card scoring, focus target selection, focus routing, focus result state, topline loop cue routing, topline fix behavior, render/download handlers, MIDI bytes, Handoff behavior, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, vocal-recording scope, lyric-generation scope, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add automatic focus, automatic cueing, automatic topline fixes, command chains, autoplay, hidden generation, vocal recording, lyric generation, sampling/imported-audio workflows, sampler devices, remote analysis, media uploads, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `topline-space-route-readout-action` Quick Action that scrolls to Topline Space, reports the current route, direct Topline Space card handoff, destination, selected Pattern, export/stem/package posture, topline loop unchanged posture, and topline fix unchanged posture without changing focus result state, playback, project data, loop state, fix state, vocal-recording scope, lyric-generation scope, or sampling scope.
- Added route-label/result-metric helpers for Topline Space so Quick Actions can report route readout details separately from Topline Space focus/card commands.
- Updated Command Reference coverage plus README, product docs, quality rules, and harness expectations for Topline Space Route Readout.

## Decision Log

- 2026-06-27: Selected Topline Space Route Readout because lead/vocal-room decisions sit beside hook readiness in the Guide flow, and a readout-first route helps users choose Compose, Arrange, Mix, Master, Deliver, or Session Brief context before cueing or applying fixes.
