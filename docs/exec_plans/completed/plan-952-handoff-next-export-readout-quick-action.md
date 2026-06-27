# plan-952-handoff-next-export-readout-quick-action

## Goal

Add a read-only Handoff Next Export Readout Quick Action so beginners and working producers can inspect the next WAV, stems, MIDI, or Handoff Sheet deliverable, route, file context, Delivery Target, package readiness, latest receipt, send order, selected Pattern, arrangement length, audition cue, and next handoff check before explicitly running the Handoff Next Export command.

## Scope

- Add a UI-local Handoff Next Export Readout Quick Action that focuses the existing Deliver/Handoff Pack context without exporting files, changing project data, changing playback, changing receipt state, changing send order, changing package checks, or touching sampling scope.
- Add result metrics and follow-up copy covering the current next deliverable, explicit export route, deliverable file context, Delivery Target, package readiness, latest receipt, send-order status/sequence, selected Pattern, Pattern A/B/C usage, arrangement length, audition cue, and next manual export check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the Handoff Next Export readout is distinct from the explicit Handoff Next Export command.

## Non-Goals

- Do not change project schema, saved project files, render bytes, MIDI bytes, Handoff Sheet text, export filenames, download behavior, receipt derivation, Handoff Pack scoring, send-order derivation, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not auto-export WAV, stems, MIDI, Handoff Sheet, Handoff Next Export, batches, ZIP archives, native-folder writes, uploads, retries, background renders, or platform-compliance checks from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only `Review Handoff Next Export Readout` Quick Action that focuses the existing Deliver/Handoff Pack surface and reports the current next deliverable, export route, file target, Delivery Target, package readiness, latest receipt, send-order status/sequence, selected Pattern, arrangement length, audition cue, and next handoff check.
- Added Handoff Next Export Readout result metrics and follow-up copy without rendering files, downloading files, updating receipts, changing playback, changing project data, or touching optional sampling scope.
- Updated README, product docs, quality rules, Command Reference coverage, and harness checks so the readout remains distinct from the explicit Handoff Next Export command.

## Decision Log

- 2026-06-27: Selected Handoff Next Export Readout because the existing Handoff Next Export command intentionally runs the next explicit deliverable export, while command search should also provide a no-render inspection step for users who want to verify the next handoff item first.
- 2026-06-27: Kept the readout routed only through existing Deliver/Handoff Pack focus paths so it does not render files, update receipts, change project data, start playback, batch export, create archives, or touch optional sampling scope.
