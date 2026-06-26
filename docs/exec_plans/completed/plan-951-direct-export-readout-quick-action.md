# plan-951-direct-export-readout-quick-action

## Goal

Add a read-only Direct Exports Quick Action so beginners and working producers can inspect WAV, stems, MIDI, and Handoff Sheet export posture, file names, delivery target, package readiness, latest receipt, send order, audition cue, and next handoff check before explicitly running any direct export command.

## Scope

- Add a UI-local Direct Exports Readout Quick Action that focuses the existing Deliver/Handoff Pack context without exporting files, changing project data, changing playback, changing receipt state, changing send order, changing package checks, or touching sampling scope.
- Add result metrics and follow-up copy covering direct export targets, deliverable file context, Delivery Target, export readiness, stem/MIDI/Handoff Sheet posture, latest receipt, package readiness, send-order next step, selected Pattern, Pattern A/B/C usage, arrangement length, audition cue, and next manual export check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so Direct Exports Readout is distinct from explicit direct export commands.

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

- Added a read-only `Review Direct Exports Readout` Quick Action that focuses the existing Deliver/Handoff Pack surface and reports WAV, stems, MIDI, Handoff Sheet, Delivery Target, package readiness, latest receipt, send order, selected Pattern, arrangement length, audition cue, and next direct export check.
- Added Direct Exports Readout result metrics and follow-up copy without rendering files, downloading files, updating receipts, changing playback, changing project data, or touching optional sampling scope.
- Updated README, product docs, quality rules, Command Reference coverage, and harness checks so the readout remains distinct from explicit direct export commands.

## Decision Log

- 2026-06-27: Selected Direct Exports Readout because Direct Export commands intentionally render or write deliverable files, while command search should also provide a read-only preflight posture for users who only want to inspect deliverable readiness before exporting.
- 2026-06-27: Kept the readout routed only through existing Deliver/Handoff Pack focus paths so it does not render files, update receipts, change project data, start playback, batch export, create archives, or touch optional sampling scope.
