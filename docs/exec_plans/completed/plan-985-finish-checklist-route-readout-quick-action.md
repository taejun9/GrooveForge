# plan-985-finish-checklist-route-readout-quick-action

## Goal

Add a read-only Finish Checklist Route Readout Quick Action so beginners and working producers can see whether the current finish priority will use the Compose, Arrange, Mix, Master, Master Automation, or Handoff route before focusing a finish card, editing notes, exporting, or changing project data.

## Scope

- Add a UI-local Finish Checklist Route Readout Quick Action that focuses the existing Finish Checklist area without changing card derivation, priority scoring, focus result state, musical events, playback, export state, project data, undo history, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Finish Checklist priority card to the existing direct Finish Checklist card command while retaining selected Pattern A/B/C, editable event counts, readiness/export/master/handoff posture, arrangement length, audition cue, and next finish-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Finish Checklist focus, direct Finish Checklist card commands, Export Preflight, Beat Passport, Production Snapshot, playback, export, and direct editing commands.

## Non-Goals

- Do not change project schema, saved project files, Finish Checklist card derivation, card priority scoring, focus routing, focus result state, render/download handlers, MIDI bytes, Handoff behavior, Delivery Target, Master Automation, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
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

- Added a UI-local Finish Checklist Route Readout Quick Action that scrolls to the existing Finish Checklist surface, reports the current Compose, Arrange, Mix, Master, Master Automation, or Handoff route, and leaves focus state, playback, export, undo history, saved project data, and sampling scope unchanged.
- Added route labels, result metric handling, direct card command handoff wording, and follow-up cues for the Finish Checklist route readout while preserving existing Finish Checklist focus and direct card behavior.
- Updated README, product docs, quality rules, Command Reference context, and QA harness checks so Finish Checklist Route Readout remains discoverable and separate from focus/edit/export commands.

## Decision Log

- 2026-06-27: Selected Finish Checklist Route Readout because it helps producers and beginners inspect the next Compose, Arrange, Mix, Master, Master Automation, or Handoff finish route before focusing, editing, playback, or export, while keeping sampling secondary and optional.
