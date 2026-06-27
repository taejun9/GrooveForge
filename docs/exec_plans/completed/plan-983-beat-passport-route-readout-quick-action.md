# plan-983-beat-passport-route-readout-quick-action

## Goal

Add a read-only Beat Passport Route Readout Quick Action so beginners and working producers can see whether the current Beat Passport priority will use the target, length, Pattern A/B/C, readiness, export, stems, or master identity route before focusing a metric, editing notes, exporting, or changing project data.

## Scope

- Add a UI-local Beat Passport Route Readout Quick Action that focuses the existing Beat Passport area without changing metric derivation, priority scoring, focus result state, musical events, playback, export state, project data, undo history, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Beat Passport priority metric to the existing direct Beat Passport metric command while retaining selected Pattern A/B/C, editable event counts, Pattern usage, readiness/export/stem/master posture, arrangement length, audition cue, and next identity-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Beat Passport focus, direct Beat Passport metric commands, Listening Pass, Production Snapshot, Export Preflight, playback, export, and direct editing commands.

## Non-Goals

- Do not change project schema, saved project files, Beat Passport metric derivation, metric priority scoring, focus routing, focus result state, render/download handlers, MIDI bytes, Handoff behavior, Delivery Target, Master Automation, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
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

- Added a UI-local Quick Actions Beat Passport Route Readout command that reports the current target, length, Pattern A/B/C, readiness, export, stems, or master identity route and the direct Beat Passport metric handoff without focusing a metric or changing project data.
- Added Beat Passport route labeling, result metrics, follow-up copy, and a section ref so the readout can jump to the existing Beat Passport surface while preserving focus result state.
- Updated README, product docs, quality rules, Command Reference coverage, and QA harness expectations for the new route readout.

## Decision Log

- 2026-06-27: Selected Beat Passport Route Readout because it strengthens the all-genre sample-free beat workflow by making beat identity and delivery posture inspectable before focus, playback, editing, or export while keeping sampling secondary and optional.
