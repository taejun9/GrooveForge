# plan-274-midi-input-quick-action

## Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying approachable for first-time composers. Keep sampling secondary.

## Scope

Expose the existing Web MIDI input connect/refresh flow through Quick Actions so users can prepare local MIDI note capture from the command palette. The command should help producers start controller input faster and help beginners find MIDI setup without leaving the direct 808/Synth composition workflow.

## Non-Goals

- Do not change Web MIDI note mapping, scale locking, capture defaults, selected target behavior, or Note On insertion.
- Do not request System Exclusive access, MIDI output, MIDI clock, controller mapping, background recording, audio input, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not persist MIDI access, arm state, input selection, latest-note labels, or Quick Action result state in project files.
- Do not change project schema, save/load migration, playback, render/export, Handoff, snapshots, undo/redo, or local draft recovery.

## Files

- `src/ui/App.tsx`: Quick Actions wiring and result labels.
- `README.md`: public MVP/runtime feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: quality rule for MIDI Quick Actions.
- `harness/scripts/run_qa.py`: static QA expectations.

## Plan

- [x] Add an explicit Quick Actions command that calls the existing MIDI connect/refresh handler.
- [x] Keep disabled/unsupported/requesting behavior explicit and UI-local.
- [x] Add post-run result/follow-up text that describes MIDI posture without mutating project data.
- [x] Update README, product docs, quality rules, and static QA expectations.
- [x] Run QA before review.
- [x] Move this plan to completed and create a review mirror.

## Validation

Run:

```sh
python3 harness/scripts/run_qa.py
python3 harness/scripts/run_quality_gate.py
npm run harness:smoke
npm run typecheck
npm run build
npm run qa
npm run verify
git diff --check
```

Browser smoke if environment allows localhost: Quick Actions shows MIDI Input Connect, unsupported browsers disable or report unavailable state, supported browsers request MIDI access only after explicit command click, and connected inputs can still arm/capture notes through the existing Web MIDI panel.

## Review

QA completes before review starts. Review checks that the command is explicit, local, and routed only through the existing MIDI connect/refresh handler; preserves note capture, project data, save/load, playback, export, and Handoff semantics; and avoids sampling/cloud/remote scope.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add a Quick Actions MIDI connect command instead of changing capture semantics. | MIDI controllers are a real composition entry point for producers and beginners, while the existing panel already owns safe local Web MIDI permission and note capture behavior. |

## Status Log

| Date | Agent | Status |
|---|---|---|
| 2026-06-18 | project_lead | Plan created for Quick Actions MIDI Input Connect. |
| 2026-06-18 | harness_builder | Added `midi-input-connect` Quick Action routed through the existing Web MIDI access handler with UI-local result guidance. |
| 2026-06-18 | quality_runner | QA passed with `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. Localhost browser smoke was blocked by `listen EPERM 127.0.0.1:5299`; the required escalated retry was rejected by environment policy. |
| 2026-06-18 | review_judge | Review completed after QA; no blocking findings. |
