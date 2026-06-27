# plan-996-beat-map-route-readout-quick-action

## Goal

Add a read-only Beat Map Route Readout Quick Action so first-time beat makers and working producers can inspect the current Start, Compose, Arrange, Polish, or Deliver Beat Map route before running Beat Map actions, Structure Lens actions, Next Move, Workflow Navigator jumps, Workflow Spotlight focus, playback, edits, exports, or project data changes.

## Scope

- Add a UI-local Beat Map Route Readout Quick Action that focuses the existing Beat Map surface without changing Beat Map derivation, stage scoring, action suggestions, Next Move routing, project data, playback, export state, undo history, remote behavior, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Beat Map priority stage to the existing Beat Map action route while retaining selected Delivery Target, selected Pattern A/B/C, stage status/context, completion posture, export/stem/package readiness, audition cue, and next beat-map-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Beat Map actions, Structure Lens actions, Next Move actions, Workflow Navigator jumps, Workflow Spotlight focus, playback, export, remote analysis, and imported-audio workflows.

## Non-Goals

- Do not change project schema, saved project files, Beat Map derivation, Beat Map action derivation, Structure Lens derivation, Next Move derivation, Workflow Navigator item derivation, stage ordering, action routing, result state, render/download handlers, MIDI bytes, Handoff behavior, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add automatic actions, automatic edits, command chains, autoplay, hidden generation, sampling/imported-audio workflows, sampler devices, remote analysis, media uploads, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Quick Actions Beat Map Route Readout that focuses the existing Beat Map panel and reports the current Start, Compose, Arrange, Polish, or Deliver route without changing Beat Map actions, Structure Lens, Next Move, playback, export, project data, or sampling scope.
- Added local route-readout result metrics and follow-up copy that show the direct Beat Map action command, selected Pattern, Delivery Target, completion posture, export/stem/package readiness, audition cue, and next beat-map-route check.
- Updated Command Reference, product docs, quality rules, and harness expectations so Beat Map Route Readout is discoverable as a separate pre-action readout from Beat Map actions.

## Decision Log

- 2026-06-27: Selected Beat Map Route Readout because Beat Map is the top Guide production overview and needs a readout-first path before users run direct Beat Map, Structure Lens, or Next Move actions.
