# plan-999-command-reference-route-readout-quick-action

## Goal

Add a read-only Command Reference Route Readout Quick Action so first-time beat makers and working producers can inspect the current command-map route, selected command category, command count posture, Quick Actions/Readout coverage, search/spotlight posture, audition cue, and next check before opening Command Reference, running Quick Actions, jumping panels, triggering playback, editing project data, exporting, or changing sampling scope.

## Scope

- Add a UI-local Command Reference Route Readout Quick Action that focuses the existing Command Reference surface without running commands or changing Command Reference filtering, Search Spotlight, pinned/recent commands, project data, playback, export state, undo history, remote behavior, or sampling scope.
- Add result metrics and follow-up copy that map the current command-reference route to the existing command-map categories and readout coverage while retaining selected Pattern, Delivery Target, readiness/export posture, arrangement length, editable event count, audition cue, and next command-map check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Command Reference opening, Quick Actions, Workflow navigation, Search Spotlight, playback, export, remote analysis, and imported-audio workflows.

## Non-Goals

- Do not change project schema, saved project files, Command Reference row derivation, Command Reference filtering, Search Spotlight behavior, pinned/recent command behavior, Quick Action ordering outside the new readout insertion, command execution semantics, render/download handlers, MIDI bytes, Handoff behavior, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add automatic command execution, automatic edits, command chains, autoplay, hidden generation, sampling/imported-audio workflows, sampler devices, remote analysis, media uploads, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Quick Actions Command Reference Route Readout command before users open Help, run Quick Actions, jump panels, play, edit, export, or enter optional sampling workflows.
- The readout opens the existing Command Reference surface and reports command-map filters, command-map entry count, Quick Actions coverage, readout coverage, Search Spotlight route, selected Pattern, Delivery Target, editable event count, arrangement length, export posture, audition cue, and next command-map check without changing Command Reference filters, Search Spotlight, Quick Actions, playback, project data, exports, schema, sampling, or remote behavior.
- Added local result metrics, follow-up copy, Command Reference row coverage, product docs, quality rules, and QA harness expectations for the readout path.

## Decision Log

- 2026-06-27: Selected Command Reference Route Readout because Command Reference is the app-wide command-map hub and needs a readout-first path before users open commands, jump panels, run Quick Actions, search, edit, play, export, or enter optional sampling workflows.
