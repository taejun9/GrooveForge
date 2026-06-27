# plan-981-beat-readiness-route-readout-quick-action

## Goal

Add a read-only Beat Readiness Route Readout Quick Action so beginners and working producers can see which drums, 808/bass, melody/chords, arrangement, or export readiness route the current Beat Readiness priority will use before focusing a check or changing project data.

## Scope

- Add a UI-local Beat Readiness Route Readout Quick Action that focuses the existing Guide/Beat Readiness area without changing readiness scoring, focusing direct checks as a mutation, changing musical events, playback, export state, project data, undo history, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Beat Readiness priority check to the existing direct Beat Readiness check command while retaining selected Pattern A/B/C, editable event counts, layer posture, arrangement length, export readiness, readiness/review/blocker counts, audition cue, and next route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Beat Readiness focus, direct Beat Readiness check commands, Listening Pass, Review Queue, Export Preflight, and direct editing commands.

## Non-Goals

- Do not change project schema, saved project files, Beat Readiness check derivation, readiness scoring, focus routing, focus result state, render/download handlers, MIDI bytes, Handoff behavior, Delivery Target, Master Automation, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add automatic fixes, automatic focus, command chains, autoplay, hidden generation, sampling/imported-audio workflows, sampler devices, remote analysis, or media uploads from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a UI-local Quick Actions Beat Readiness Route Readout command that reports the current priority readiness route and direct Beat Readiness check handoff without focusing a check or editing project data.
- Added Beat Readiness route labeling, result metrics, follow-up copy, and a section ref so the readout can jump to the existing Beat Readiness surface while preserving focus result state.
- Updated README, product docs, quality rules, Command Reference coverage, and QA harness expectations for the new route readout.

## Decision Log

- 2026-06-27: Selected Beat Readiness Route Readout because it strengthens the first-beat workflow by making the next readiness route inspectable before focus or editing, while keeping sampling secondary and optional.
