# plan-984-production-snapshot-route-readout-quick-action

## Goal

Add a read-only Production Snapshot Route Readout Quick Action so beginners and working producers can see whether the current Production Snapshot priority will use the target, form, Pattern A/B/C, mix, or handoff session-scan route before focusing a metric, editing notes, exporting, or changing project data.

## Scope

- Add a UI-local Production Snapshot Route Readout Quick Action that focuses the existing Production Snapshot area without changing metric derivation, priority scoring, focus result state, musical events, playback, export state, project data, undo history, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Production Snapshot priority metric to the existing direct Production Snapshot metric command while retaining selected Pattern A/B/C, editable event counts, Pattern usage, target/form/mix/handoff posture, arrangement length, audition cue, and next session-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Production Snapshot focus, direct Production Snapshot metric commands, Beat Passport, Listening Pass, Export Preflight, playback, export, and direct editing commands.

## Non-Goals

- Do not change project schema, saved project files, Production Snapshot metric derivation, metric priority scoring, focus routing, focus result state, render/download handlers, MIDI bytes, Handoff behavior, Delivery Target, Master Automation, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
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

- Added a UI-local Quick Actions Production Snapshot Route Readout command that reports the current target, form, Pattern A/B/C, mix, or handoff session-scan route and the direct Production Snapshot metric handoff without focusing a metric or changing project data.
- Added Production Snapshot route labeling, result metrics, follow-up copy, and a section ref so the readout can jump to the existing Production Snapshot surface while preserving focus result state.
- Updated README, product docs, quality rules, Command Reference coverage, and QA harness expectations for the new route readout.

## Decision Log

- 2026-06-27: Selected Production Snapshot Route Readout because it helps producers scan session posture and helps beginners understand the next target, form, Pattern, mix, or handoff route before focusing or editing, while keeping sampling secondary and optional.
