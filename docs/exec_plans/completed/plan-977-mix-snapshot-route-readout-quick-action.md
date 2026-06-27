# plan-977-mix-snapshot-route-readout-quick-action

## Goal

Add a read-only Mix Snapshot Route Readout Quick Action so beginners and working producers can see whether the current Mix Snapshot decision routes to capture, recall, clear, or listen-next guidance before changing any A/B snapshot slot state or mixer/master posture.

## Scope

- Add a UI-local Mix Snapshot Route Readout Quick Action that focuses the existing Mix Snapshot/Mix area without capturing, recalling, clearing, changing mixer/master state, changing playback, changing project data, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Mix Snapshot decision target to the existing direct Mix Snapshot command while retaining selected Pattern A/B/C, current mix/export posture, A/B slot posture, master posture, stem readiness, audition cue, and next snapshot-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Mix Snapshot Decision, Mix Snapshot capture/recall/clear, and direct snapshot commands.

## Non-Goals

- Do not change project schema, saved project files, Mix Snapshot slot derivation, capture/clear handlers, mixer/master recall payloads, decision routing, selected Pattern, Pattern A/B/C events, arrangement, Stem Audition behavior, Mix Balance behavior, Space FX behavior, master output, export bytes, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add rendered A/B playback, automatic capture, automatic recall, hidden mix moves, command chains, automatic arrangement, autoplay, tutorial overlays, remote analysis, sampler devices, imported samples, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Mix Snapshot Route Readout Quick Action that focuses the existing Mix panel, reports the current capture/recall route, direct Mix Snapshot command handoff, A/B slot posture, mix/export posture, master posture, stem readiness, selected Pattern context, audition cue, and next snapshot-route check.
- Kept capture, recall, clear, mixer/master mutation, playback, export, project data, and sampling scope unchanged.
- Updated README, product docs, quality rules, Command Reference coverage, and QA harness checks so Mix Snapshot Route Readout remains distinct from Mix Snapshot Decision and direct capture/recall/clear commands.

## Decision Log

- 2026-06-27: Selected Mix Snapshot Route Readout because A/B mix comparison is a core direct beat-production listening step, and users should be able to inspect the capture/recall/clear route before any snapshot slot or mixer/master state changes.
- 2026-06-27: Kept the new action focus-only and UI-local so it can explain the existing Mix Snapshot route without becoming a second capture/recall path.
