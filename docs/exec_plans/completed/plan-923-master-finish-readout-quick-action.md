# plan-923-master-finish-readout-quick-action

## Goal

Expose Master Finish as a dedicated read-only Quick Action so beginners and working producers can search for the current demo/vocal/store/club finish preview, master output posture, and next listening/export check before applying a finish pad.

## Scope

- Add a UI-local Master Finish Readout Quick Action that focuses the Master panel without applying a Master Finish pad.
- Add result metrics/follow-up copy for suggested/current finish target, current and target master posture, selected Pattern, event counts, arrangement length, export/stem readiness, audition cue, and next manual master-trim check.
- Update product docs, quality rules, and harness checks so Command Reference `Master Finish` readout coverage matches the actual Quick Actions list.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-apply Master Finish pads, change master preset/ceiling/output state, or change direct Master Finish pad behavior from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Completed. Master Finish now has a read-only Quick Action that focuses the Master panel, reports the current demo/vocal/store/club finish preview posture, and leaves master mutation on the existing Master Finish Decision/current/direct pad commands.

## Decision Log

- 2026-06-27: Selected Master Finish Readout because Command Reference exposes `Master Finish` as `Quick Actions / Readout`, but the existing `master-finish` Quick Action applies the current preview instead of offering a neutral pre-apply output posture review.
