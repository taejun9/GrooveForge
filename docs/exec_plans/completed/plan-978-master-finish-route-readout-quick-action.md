# plan-978-master-finish-route-readout-quick-action

## Goal

Add a read-only Master Finish Route Readout Quick Action so beginners and working producers can see which demo/vocal/store/club output route the current Master Finish decision will use before changing master preset, ceiling, or output gain.

## Scope

- Add a UI-local Master Finish Route Readout Quick Action that focuses the existing Master/Finish area without applying a finish pad, changing master state, changing playback, rendering/exporting audio, changing project data, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Master Finish preview decision target to the existing direct Master Finish command while retaining selected Pattern A/B/C, current and target master posture, export/stem readiness, arrangement length, audition cue, and next finish-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Master Finish Readout, Master Finish Decision, current Master Finish, and direct finish pad commands.

## Non-Goals

- Do not change project schema, saved project files, Master Finish pad definitions, preview derivation, decision routing, disabled-state rules, apply handlers, master preset/ceiling/output gain algorithms, Master Automation, Mix Snapshot, Mix Balance, Stem Audition, Mix Coach, Space FX, musical events, arrangement, export bytes, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add automatic mastering, platform loudness claims, rendered A/B playback, automatic export, hidden mix moves, command chains, autoplay, tutorial overlays, remote analysis, sampler devices, imported samples, or native folder writes from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Master Finish Route Readout Quick Action that focuses the existing Master panel, reports the calculated demo/vocal/store/club finish route, direct Master Finish command handoff, selected Pattern context, current and target master posture, export/stem readiness, audition cue, and next finish-route check.
- Kept Master Finish pad application, master preset, ceiling, output gain, playback, export/render, project data, platform loudness claims, and sampling scope unchanged.
- Updated README, product docs, quality rules, Command Reference coverage, and QA harness checks so Master Finish Route Readout remains distinct from Master Finish Readout, Master Finish Decision, current Master Finish, and direct finish pad commands.

## Decision Log

- 2026-06-27: Selected Master Finish Route Readout because final output posture is a core beat-completion step for both beginners and working producers, and the user should be able to inspect the selected finish route before any master state changes.
- 2026-06-27: Kept the new action focus-only and UI-local so it can explain the existing Master Finish route without becoming a second finish-apply path.
