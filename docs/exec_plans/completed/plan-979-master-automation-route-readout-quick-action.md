# plan-979-master-automation-route-readout-quick-action

## Goal

Add a read-only Master Automation Route Readout Quick Action so beginners and working producers can see which none/fade-in/fade-out/intro-outro automation route the current Master Automation decision will use before changing editable master fade events.

## Scope

- Add a UI-local Master Automation Route Readout Quick Action that focuses the existing Master/Automation area without applying a fade pad, changing automation events, changing playback, rendering/exporting audio, changing project data, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Master Automation preview decision target to the existing direct Master Automation command while retaining selected Pattern A/B/C, current and target automation posture, fade event delta, export/stem readiness, master posture, arrangement length, audition cue, and next automation-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Master Automation Readout, Master Automation Decision, current Master Automation, and direct fade pad commands.

## Non-Goals

- Do not change project schema, saved project files, Master Automation pad definitions, preview derivation, decision routing, disabled-state rules, apply handlers, automation event storage, realtime playback gain, WAV/stem export gain, Master Finish, Mix Snapshot, Mix Balance, Stem Audition, Mix Coach, Space FX, musical events, arrangement, export bytes, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add automatic mastering, rendered automation preview audio, automatic export, hidden gain moves, command chains, autoplay, tutorial overlays, remote analysis, sampler devices, imported samples, or native folder writes from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Master Automation Route Readout Quick Action that focuses the existing Master panel, reports the calculated none/fade-in/fade-out/intro-outro fade route, direct Master Automation command handoff, selected Pattern context, current and target automation posture, export/stem readiness, master posture, audition cue, and next automation-route check.
- Kept Master Automation pad application, editable automation events, master output gain, playback, export/render, project data, platform loudness claims, and sampling scope unchanged.
- Updated README, product docs, quality rules, Command Reference coverage, and QA harness checks so Master Automation Route Readout remains distinct from Master Automation Readout, Master Automation Decision, current Master Automation, and direct fade pad commands.

## Decision Log

- 2026-06-27: Selected Master Automation Route Readout because finish fades are a core beat-delivery step, and users should be able to inspect the selected fade lane before any editable automation events are written.
- 2026-06-27: Kept the new action focus-only and UI-local so it can explain the existing Master Automation route without becoming a second fade-apply path.
