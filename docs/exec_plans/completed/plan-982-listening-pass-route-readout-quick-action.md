# plan-982-listening-pass-route-readout-quick-action

## Goal

Add a read-only Listening Pass Route Readout Quick Action so beginners and working producers can see whether the current Listening Pass priority will use a composition, arrangement, mix, or delivery route before focusing a checkpoint, starting playback, editing notes, exporting, or changing project data.

## Scope

- Add a UI-local Listening Pass Route Readout Quick Action that focuses the existing Listening Pass area without changing checkpoint derivation, priority scoring, focus result state, musical events, playback, export state, project data, undo history, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Listening Pass priority checkpoint to the existing direct Listening Pass checkpoint command while retaining selected Pattern A/B/C, editable event counts, readiness summary, arrangement length, export readiness, session brief context, audition cue, and next listening route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Listening Pass focus, direct Listening Pass checkpoint commands, Beat Readiness, Review Queue, Export Preflight, playback, export, and direct editing commands.

## Non-Goals

- Do not change project schema, saved project files, Listening Pass checkpoint derivation, checkpoint priority scoring, focus routing, focus result state, render/download handlers, MIDI bytes, Handoff behavior, Delivery Target, Master Automation, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
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

- Added a UI-local Quick Actions Listening Pass Route Readout command that reports the current composition, arrangement, mix, or delivery audition route and the direct Listening Pass checkpoint handoff without focusing a checkpoint or changing project data.
- Added Listening Pass route labeling, result metrics, follow-up copy, and a section ref so the readout can jump to the existing Listening Pass surface while preserving focus result state.
- Updated README, product docs, quality rules, Command Reference coverage, and QA harness expectations for the new route readout.

## Decision Log

- 2026-06-27: Selected Listening Pass Route Readout because it strengthens the sample-free first-beat workflow by making the audition route inspectable before focus, playback, editing, or export while keeping sampling secondary and optional.
