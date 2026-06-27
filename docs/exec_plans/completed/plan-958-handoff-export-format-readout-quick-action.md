# plan-958-handoff-export-format-readout-quick-action

## Goal

Add a read-only Handoff Export Format Readout Quick Action so beginners and working producers can inspect WAV format, duration, full-mix file, stem file count/audible stems, MIDI scope, Handoff Sheet context, Delivery Target, package posture, selected Pattern, arrangement length, audition cue, and next export-format check before running explicit exports.

## Scope

- Add a UI-local Handoff Export Format Readout Quick Action that focuses the existing Deliver/Handoff Pack surface without exporting files, changing project data, changing playback, changing receipt state, changing export-format derivation, changing package checks, or touching sampling scope.
- Add result metrics and follow-up copy covering format status, WAV sample-rate/channel format, duration, full-mix file, stem count/audible stems, MIDI scope, Handoff Sheet context, Delivery Target, package posture, selected Pattern A/B/C, arrangement length, audition cue, and next export-format check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the Handoff Export Format readout is distinct from Export Format focus metrics, Handoff Pack, Handoff Package Check, Handoff Next Export, and explicit export commands.

## Non-Goals

- Do not change project schema, saved project files, render bytes, MIDI bytes, Handoff Sheet text, export filenames, download behavior, receipt derivation, export-format derivation, Handoff Pack scoring, send-order derivation, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add configurable render settings, dither, normalization, platform-loudness guarantees, auto-export, batch export, ZIP archives, native-folder writes, uploads, retries, background renders, or platform-compliance checks from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added `Review Handoff Export Format Readout` as a read-only Quick Action that focuses the existing Deliver/Handoff Pack surface and reports deliverable-format posture without rendering files, downloading files, updating receipt state, changing export-format derivation, mutating project data, changing playback, or touching sampler scope.
- Added result metrics and follow-up copy for WAV sample-rate/channel format, duration, full-mix file, stem file count/audible stems, MIDI scope, Handoff Sheet context, Delivery Target, package posture, selected Pattern A/B/C, arrangement length, audition cue, and next export-format check.
- Updated Command Reference docs, product docs, quality rules, and harness assertions so the readout remains separate from Handoff Export Format focus metrics, Handoff Pack, Handoff Package Check, Handoff Next Export, and explicit export commands.

## Decision Log

- 2026-06-27: Selected Handoff Export Format Readout because Export Format Focus already exposes metric-level focus, but users still need a single no-render command to inspect the overall deliverable-format posture before explicit exports.
- 2026-06-27: Kept the readout routed only through the existing Deliver/Handoff Pack focus path so it does not render files, update receipts, change project data, start playback, batch export, create archives, or touch optional sampling scope.
