# plan-922-space-fx-readout-quick-action

## Goal

Expose Space FX as a dedicated read-only Quick Action so beginners and working producers can search for the current dry/room/wide/wash send preview, editable stem send posture, and next listening check before applying a shared Space FX pad.

## Scope

- Add a UI-local Space FX Readout Quick Action that focuses the Mix panel without applying a Space FX pad.
- Add result metrics/follow-up copy for suggested/current Space FX target, editable Drums/808/Synth/Chords send posture, selected Pattern, event counts, arrangement length, export readiness, audition cue, and next manual Space-slider check.
- Update product docs, quality rules, and harness checks so Command Reference `Space FX` readout coverage matches the actual Quick Actions list.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-apply Space FX pads, change mixer send values, or change direct Space FX pad behavior from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Completed. Space FX now has a read-only Quick Action that focuses the Mix panel, reports the current dry/room/wide/wash send preview posture, and leaves mixer send mutation on the existing Space FX Decision/current/direct pad commands.

## Decision Log

- 2026-06-27: Selected Space FX Readout because Command Reference exposes `Space FX` as `Quick Actions / Readout`, but the existing `space-fx` Quick Action applies the current preview instead of offering a neutral pre-apply posture review.
