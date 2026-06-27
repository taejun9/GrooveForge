# plan-959-handoff-delivery-target-readout-quick-action

## Goal

Add a read-only Handoff Delivery Target Readout Quick Action so beginners and working producers can inspect the selected delivery target, target focus, target length, current arrangement length, stem goal, audible stems, Session Brief/Handoff Sheet context, package posture, selected Pattern, audition cue, and next target check before running explicit exports or sending files.

## Scope

- Add a UI-local Handoff Delivery Target Readout Quick Action that focuses the existing Deliver/Handoff Pack surface without selecting a new target, aligning the target, exporting files, changing project data, changing playback, changing receipt state, changing package checks, or touching sampling scope.
- Add result metrics and follow-up copy covering Delivery Target name/focus, target length, current arrangement length, stem goal, audible stems, Session Brief/Handoff Sheet context, package posture, export readiness, selected Pattern A/B/C, arrangement block count, audition cue, and next target check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the Handoff Delivery Target readout is distinct from Delivery Target select, Delivery Target Alignment, Handoff Pack, Export Preflight, and explicit export commands.

## Non-Goals

- Do not change project schema, saved project files, selected target behavior, custom target editing, alignment behavior, arrangement templates, mixer/master update paths, render bytes, MIDI bytes, Handoff Sheet text, export filenames, download behavior, receipt derivation, Handoff Pack scoring, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add target auto-alignment, configurable render settings, platform-loudness guarantees, auto-export, batch export, ZIP archives, native-folder writes, uploads, retries, background renders, or platform-compliance checks from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Handoff Delivery Target Readout Quick Action that focuses the existing Deliver/Handoff Pack panel and reports selected target, target focus, length fit, stem goal fit, Session Brief/Handoff Sheet context, package posture, export readiness, selected Pattern context, audition cue, and next check.
- Updated the Command Reference, README, product rules, quality rules, and harness expectations so the command remains distinct from Delivery Target selection, Delivery Target Alignment, Handoff Next Export, explicit exports, receipt updates, and sampler work.

## Decision Log

- 2026-06-27: Selected Handoff Delivery Target Readout because Delivery Target Alignment and Handoff Pack already exist, but users still need a no-render target-context command before explicit exports or file handoff.
- 2026-06-27: Kept the readout routed only through the existing Deliver/Handoff Pack focus path so it does not select targets, align arrangement/mix/master, render files, update receipts, change project data, start playback, batch export, create archives, or touch optional sampling scope.
