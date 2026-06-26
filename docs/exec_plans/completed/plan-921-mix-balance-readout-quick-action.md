# plan-921-mix-balance-readout-quick-action

## Goal

Expose Mix Balance as a dedicated read-only Quick Action so beginners and working producers can search for the current rough-balance preview, editable channel posture, and next listening check before applying a balance pad.

## Scope

- Add a UI-local Mix Balance Readout Quick Action that focuses the Mix panel without applying a rough-balance preset.
- Add result metrics/follow-up copy for suggested/current balance target, editable Drums/808/Synth/Chords posture, selected Pattern, event counts, arrangement length, export/stem readiness, audition cue, and next manual-trim check.
- Update product docs, quality rules, and harness checks so Command Reference `Mix Balance` readout coverage matches the actual Quick Actions list.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-apply rough balance, change mixer levels, or change direct Mix Balance pad behavior from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Completed. Mix Balance now has a read-only Quick Action that focuses the Mix panel, reports current rough-balance preview posture, and leaves mixer mutation on the existing Mix Balance Decision/current/direct pad commands.

## Decision Log

- 2026-06-27: Selected Mix Balance Readout because Command Reference exposes `Mix Balance` as `Quick Actions / Readout`, but the existing `mix-balance` Quick Action applies the current preview instead of offering a neutral pre-apply posture review.
