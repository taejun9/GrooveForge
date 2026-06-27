# plan-960-handoff-session-brief-readout-quick-action

## Goal

Add a read-only Handoff Session Brief Readout Quick Action so beginners and working producers can verify artist, vibe, reference, notes, Handoff Sheet filename, delivery target context, package posture, export readiness, selected Pattern, audition cue, and next context check before exporting or sending files.

## Scope

- Add a UI-local Handoff Session Brief Readout Quick Action that focuses the existing Deliver/Handoff Pack surface without editing Session Brief fields, exporting files, changing receipt state, changing project data, changing playback, or touching sampling scope.
- Add result metrics and follow-up copy covering Session Brief filled-field count/status, artist/vibe/reference/notes posture, Handoff Sheet filename, selected Delivery Target, package posture, export readiness, selected Pattern A/B/C, arrangement block count, audition cue, and next handoff-context check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the Session Brief handoff readout remains distinct from Brief Compass, Session Brief Starter, Handoff Sheet export, Handoff Package Check, and explicit export commands.

## Non-Goals

- Do not change project schema, saved Session Brief text, starter text, Brief Compass focus behavior, Handoff Sheet contents, Handoff Sheet filenames, export bytes, render/download behavior, receipt derivation, Handoff Pack scoring, delivery-target alignment, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add auto-filled brief fields, writing advice generation, remote reference analysis, upload/sending, batch export, ZIP archives, native-folder writes, or platform-compliance checks from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Handoff Session Brief Readout Quick Action that focuses the existing Deliver/Handoff Pack surface and reports Session Brief filled-field count/status, artist, vibe, reference, notes, Handoff Sheet filename, Delivery Target, package posture, export readiness, selected Pattern context, audition cue, and next context check.
- Updated the Command Reference, README, product rules, quality rules, and harness expectations so the command remains distinct from Brief Compass, Session Brief Starter, Handoff Sheet export, Handoff Package Check, explicit exports, receipt updates, and sampler work.

## Decision Log

- 2026-06-27: Selected Handoff Session Brief Readout because Handoff Pack already exposes files, route, target, manifest, receipt, format, and send order, but delivery context still needs a no-render check for Session Brief and Handoff Sheet readiness.
- 2026-06-27: Kept the command routed only through the existing Deliver/Handoff Pack focus path so it does not edit Session Brief fields, generate text, export the Handoff Sheet, render files, update receipts, change project data, start playback, or touch optional sampling scope.
