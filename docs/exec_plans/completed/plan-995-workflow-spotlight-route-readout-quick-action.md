# plan-995-workflow-spotlight-route-readout-quick-action

## Goal

Add a read-only Workflow Spotlight Route Readout Quick Action so first-time beat makers and working producers can inspect the current derived Compose, Arrange, Mix, or Deliver spotlight route before focusing the spotlight, jumping workflow zones, opening Workflow Navigator, Beat Map, Structure Lens, Next Move, editing events, playing back, exporting, or changing project data.

## Scope

- Add a UI-local Workflow Spotlight Route Readout Quick Action that focuses the existing Workflow Navigator/Workflow Spotlight surface without changing Workflow Spotlight derivation, Workflow Navigator item derivation, jump routing, Jump Result state, project data, playback, export state, undo history, remote behavior, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Workflow Spotlight target to the existing Workflow Spotlight focus command and visible Workflow Navigator zone route while retaining selected Delivery Target, selected Pattern A/B/C, workflow ready/review/blocker counts, Beat Map posture, Export Preflight posture, stem readiness, audition cue, and next spotlight-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Workflow Spotlight focus, Workflow Navigator jumps, Beat Map actions, Structure Lens actions, Next Move actions, playback, export, remote analysis, and imported-audio workflows.

## Non-Goals

- Do not change project schema, saved project files, Workflow Spotlight derivation, Workflow Navigator item derivation, Beat Map/Structure Lens/Next Move derivation, item ordering, jump routing, Jump Result state, render/download handlers, MIDI bytes, Handoff behavior, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
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

- Added the read-only Workflow Spotlight Route Readout Quick Action with UI-local result metrics and follow-up copy that identify the current spotlight route, direct focus command, selected Pattern, Delivery Target, Workflow Navigator counts, Beat Map posture, Export Preflight posture, export/stem readiness, audition cue, and next spotlight-route check.
- Focused the readout only on the existing Workflow Navigator/Workflow Spotlight surface while leaving Workflow Spotlight derivation, Workflow Navigator item derivation, Jump Result state, jump routing, project data, playback, export, sampling, imported audio, remote AI, accounts, analytics, and cloud sync unchanged.
- Updated README, product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Workflow Spotlight focus, Workflow Navigator jumps, Beat Map actions, Structure Lens actions, Next Move actions, playback, edit, and export commands.

## Decision Log

- 2026-06-27: Selected Workflow Spotlight Route Readout because the spotlight is the current bottleneck/focus layer inside the guide, and a readout-first route lets users verify the derived zone before using the focus command or any workflow jump.
