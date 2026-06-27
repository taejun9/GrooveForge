# plan-994-workflow-navigator-route-readout-quick-action

## Goal

Add a read-only Workflow Navigator Route Readout Quick Action so first-time beat makers and working producers can see whether the current Compose, Arrange, Mix, or Deliver workflow zone should be inspected before jumping zones, running Workflow Spotlight, opening Beat Map/Structure Lens/Next Move actions, editing events, playing back, exporting, or changing project data.

## Scope

- Add a UI-local Workflow Navigator Route Readout Quick Action that focuses the existing Workflow Navigator surface without changing Workflow Navigator item derivation, spotlight derivation, jump result state, zone jump routing, project data, playback, export state, undo history, remote behavior, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Workflow Navigator priority zone to the existing direct Workflow Navigator zone command while retaining selected Delivery Target, selected Pattern A/B/C, workflow ready/review/blocker counts, Beat Map posture, Export Preflight posture, stem readiness, audition cue, and next workflow-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Workflow Navigator jumps, Workflow Spotlight focus, Beat Map actions, Structure Lens actions, Next Move actions, playback, export, remote analysis, and imported-audio workflows.

## Non-Goals

- Do not change project schema, saved project files, Workflow Navigator item derivation, Workflow Spotlight derivation, Beat Map/Structure Lens/Next Move derivation, item ordering, jump routing, jump result state, render/download handlers, MIDI bytes, Handoff behavior, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add automatic jumps, automatic edits, command chains, autoplay, hidden generation, sampling/imported-audio workflows, sampler devices, remote analysis, media uploads, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added the read-only Workflow Navigator Route Readout Quick Action with UI-local result metrics and follow-up copy that identify the current route, direct zone command, workflow posture, selected Pattern, Delivery Target, Beat Map posture, Export Preflight posture, export/stem readiness, audition cue, and next workflow-route check.
- Focused the readout only on the existing Workflow Navigator surface while leaving Workflow Navigator item derivation, Workflow Spotlight derivation, Jump Result state, zone jump routing, project data, playback, export, sampling, imported audio, remote AI, accounts, analytics, and cloud sync unchanged.
- Updated README, product docs, quality rules, Command Reference coverage, and harness checks so the readout remains distinct from Workflow Navigator jumps, Workflow Spotlight focus, Beat Map actions, Structure Lens actions, Next Move actions, playback, edit, and export commands.

## Decision Log

- 2026-06-27: Selected Workflow Navigator Route Readout because Compose/Arrange/Mix/Deliver routing is the most central navigation layer for both beginner path-following and producer-speed command work, and a readout-first route reduces accidental jumps before users choose the correct workstation zone.
