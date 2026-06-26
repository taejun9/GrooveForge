# plan-924-master-automation-readout-quick-action

## Goal

Expose Master Automation as a dedicated read-only Quick Action so beginners and working producers can search for the current none/fade-in/fade-out/intro-outro automation preview, editable fade event posture, and next listening/export check before applying a fade lane.

## Scope

- Add a UI-local Master Automation Readout Quick Action that focuses the Master panel without applying a Master Automation pad.
- Add result metrics/follow-up copy for suggested/current automation target, current and target automation posture, selected Pattern, event counts, arrangement length, export/stem readiness, master posture, audition cue, and next manual automation/output check.
- Update product docs, quality rules, and harness checks so Command Reference `Master Automation` readout coverage matches the actual Quick Actions list.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-apply Master Automation pads, change automation events, change master output state, or change direct Master Automation pad behavior from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Completed. Master Automation now has a read-only Quick Action that focuses the Master panel, reports the current none/fade-in/fade-out/intro-outro automation preview posture, and leaves automation event mutation on the existing Master Automation Decision/current/direct pad commands.

## Decision Log

- 2026-06-27: Selected Master Automation Readout because Command Reference exposes `Master Automation` as `Quick Actions / Readout`, but the existing `master-automation` Quick Action applies the current fade preview instead of offering a neutral pre-apply automation posture review.
