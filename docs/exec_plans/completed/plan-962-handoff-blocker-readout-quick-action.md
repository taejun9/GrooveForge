# plan-962-handoff-blocker-readout-quick-action

## Goal

Add a read-only Handoff Blocker Readout Quick Action so beginners and working producers can identify the current handoff blocker or review lane, its deliverable context, package posture, selected Pattern, audition cue, and next corrective check before exporting or sending files.

## Scope

- Add a UI-local Handoff Blocker Readout Quick Action that focuses the existing Deliver/Handoff Pack surface without exporting files, updating receipt state, creating packages, changing project data, changing playback, or touching sampling scope.
- Add result metrics and follow-up copy covering the highest-priority danger/warn Handoff Pack item, ready/review/blocker counts, selected Delivery Target, Session Brief/Handoff Sheet context, manifest status, latest receipt, send order, package posture, selected Pattern A/B/C, arrangement block count, audition cue, and next blocker check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the blocker readout remains distinct from Handoff Final Check, Handoff Package Check, Handoff Manifest Audit, Handoff Send Order, Handoff Next Export, and explicit export commands.

## Non-Goals

- Do not change project schema, saved project files, Delivery Target selection, Session Brief text, Handoff Sheet contents, export bytes, render/download behavior, receipt derivation, manifest derivation, Send Order derivation, Handoff Pack scoring, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add auto-fix, auto-export, send/upload, package creation, ZIP archives, native-folder writes, background renders, retries, remote delivery automation, platform-compliance checks, or professional release claims from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Handoff Blocker Readout Quick Action that focuses the existing Deliver/Handoff Pack surface and reports the highest-priority danger or review deliverable lane, ready/review/blocker counts, selected Delivery Target, Session Brief/Handoff Sheet context, manifest status, latest receipt, send order, package posture, selected Pattern context, audition cue, and next blocker check.
- Updated the Command Reference, README, product rules, quality rules, and harness expectations so the command remains distinct from Handoff Final Check, Handoff Package Check, Handoff Manifest Audit, Handoff Send Order, Handoff Next Export, explicit exports, package creation, receipt updates, blocker fixes, and sampler work.

## Decision Log

- 2026-06-27: Selected Handoff Blocker Readout because Handoff Final Check summarizes send/no-send posture, but users also need a no-render shortcut to identify the specific blocked or review deliverable lane before running explicit exports.
- 2026-06-27: Kept the command routed only through the existing Deliver/Handoff Pack focus path so it does not fix blockers, export files, update receipts, create packages, mutate project data, start playback, send files, or touch optional sampling scope.
