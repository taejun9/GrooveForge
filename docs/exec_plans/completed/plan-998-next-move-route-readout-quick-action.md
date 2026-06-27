# plan-998-next-move-route-readout-quick-action

## Goal

Add a read-only Next Move Route Readout Quick Action so first-time beat makers and working producers can inspect the current recommended action, route, readiness/export/stem posture, selected Delivery Target, selected Pattern, audition cue, and next check before running Next Move, Beat Map actions, Structure Lens actions, Workflow Navigator jumps, Workflow Spotlight focus, playback, edits, exports, or project data changes.

## Scope

- Add a UI-local Next Move Route Readout Quick Action that focuses the existing Next Move surface without running the recommendation or changing Next Move derivation, action ordering, action definitions, result state, project data, playback, export state, undo history, remote behavior, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current primary Next Move action to the existing Next Move route while retaining selected Delivery Target, selected Pattern A/B/C, Beat Readiness posture, export/stem posture, arrangement length, audition cue, and next move-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Next Move actions, Beat Map actions, Structure Lens actions, Workflow Navigator jumps, Workflow Spotlight focus, playback, export, remote analysis, and imported-audio workflows.

## Non-Goals

- Do not change project schema, saved project files, Next Move derivation, Beat Map derivation, Structure Lens derivation, Workflow Navigator item derivation, action ordering, action definitions, action routing, result state, render/download handlers, MIDI bytes, Handoff behavior, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
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

- Added a read-only Quick Actions Next Move Route Readout command before users run the primary recommended Next Move action.
- The readout focuses the existing Next Move panel and reports the current recommended action route, posture, selected Delivery Target, selected Pattern, readiness/export/stem posture, audition cue, and next move-route check without changing Next Move, Beat Map, Structure Lens, playback, project data, exports, schema, sampling, or remote behavior.
- Added local result metrics, follow-up copy, Command Reference coverage, product docs, quality rules, and QA harness expectations for the readout path.

## Decision Log

- 2026-06-27: Selected Next Move Route Readout because Next Move is the central recommendation/action surface after Beat Map and Structure Lens, and it needs a readout-first path before users run the primary recommendation or related Guide actions.
- 2026-06-27: Kept the route readout separate from mutating Next Move actions so users can inspect the recommendation path without creating undo history or altering playback/export state.
