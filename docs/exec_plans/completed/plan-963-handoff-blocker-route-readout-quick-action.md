# plan-963-handoff-blocker-route-readout-quick-action

## Goal

Add a read-only Handoff Blocker Route Readout Quick Action so beginners and working producers can see which existing deliverable command path should follow the current handoff blocker or review lane before exporting, fixing, packaging, or sending files.

## Scope

- Add a UI-local Handoff Blocker Route Readout Quick Action that focuses the existing Deliver/Handoff Pack surface without exporting files, updating receipt state, creating packages, changing project data, changing playback, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the highest-priority danger/warn Handoff Pack item to the next existing command family while retaining ready/review/blocker counts, selected Delivery Target, Session Brief/Handoff Sheet context, manifest status, latest receipt, send order, package posture, selected Pattern A/B/C, arrangement blocks, audition cue, and next blocker-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the blocker-route readout remains distinct from Handoff Blocker Readout, Handoff Final Check, Handoff Package Check, Handoff Next Export, and explicit export commands.

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

- Added a read-only Handoff Blocker Route Readout Quick Action that focuses the existing Deliver/Handoff Pack surface and maps the highest-priority danger or review deliverable lane to the next existing command family without exporting, fixing, packaging, sending, mutating project data, changing playback, or touching sampler scope.
- Updated the Command Reference, README, product rules, quality rules, and harness expectations so the route readout remains distinct from Handoff Blocker Readout, Handoff Final Check, Handoff Package Check, Handoff Next Export, explicit exports, Session Brief writes, package creation, receipt updates, blocker fixes, and sampler work.

## Decision Log

- 2026-06-27: Selected Handoff Blocker Route Readout because plan-962 exposes the blocked/review lane, but users still need a no-render route label that points to the existing command family to use next.
- 2026-06-27: Kept the command routed only through the existing Deliver/Handoff Pack focus path so it does not fix blockers, export files, update receipts, create packages, mutate project data, start playback, send files, or touch optional sampling scope.
