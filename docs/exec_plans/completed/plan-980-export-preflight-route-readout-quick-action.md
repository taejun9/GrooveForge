# plan-980-export-preflight-route-readout-quick-action

## Goal

Add a read-only Export Preflight Route Readout Quick Action so beginners and working producers can see which readiness, mix/master, Master Automation, deliverable, or handoff route the current Export Preflight priority will use before focusing a card or exporting files.

## Scope

- Add a UI-local Export Preflight Route Readout Quick Action that focuses the existing Deliver/Export Preflight area without changing preflight scoring, focusing cards as a mutation, rendering/exporting files, changing project data, changing playback, or touching sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Export Preflight priority lane to the existing direct Export Preflight focus command while retaining selected Delivery Target, WAV/headroom posture, audible stems, MIDI/song length posture, Session Brief/Handoff Sheet context, Master Automation posture, selected Pattern A/B/C, arrangement length, audition cue, and next route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Export Preflight focus, direct Export Preflight card commands, Handoff Route Readout, Handoff Next Export, and direct export commands.

## Non-Goals

- Do not change project schema, saved project files, Export Preflight card derivation, priority scoring, focus routing, focus result state, render/download handlers, Handoff Pack, Handoff manifests, export receipts, Delivery Target alignment, Master Automation, Master Finish, Mix Snapshot, Stem Audition, musical events, arrangement, export bytes, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add automatic export, automatic focus, automatic fixes, command chains, autoplay, remote delivery checks, folder writes, audio import, sampler devices, imported samples, or remote analysis from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a UI-local Quick Actions Export Preflight Route Readout command that reports the current priority delivery-risk route and direct Export Preflight card handoff without focusing a card or exporting files.
- Routed the readout result through existing Deliver panel status feedback and Export Preflight result metrics while preserving project data, preflight scoring, playback, render/export handlers, and sampling boundaries.
- Updated README, product docs, quality rules, Command Reference coverage, and QA harness expectations for the new route readout.

## Decision Log

- 2026-06-27: Selected Export Preflight Route Readout because final delivery risk routing is a core finish/export step, and users should be able to inspect the next risk route before focusing a card or exporting files.
