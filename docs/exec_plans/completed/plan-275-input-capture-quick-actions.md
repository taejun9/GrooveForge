# plan-275-input-capture-quick-actions

## Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying approachable for first-time composers. Keep sampling secondary.

## Scope

Add Quick Actions for the existing direct note-entry workflow:

- Switch Keyboard/Web MIDI capture target between 808 and Synth.
- Arm or disarm Web MIDI input when a connected input is available.

These commands should help producers move quickly between bass and melody input while giving beginners searchable commands for the same local capture setup.

## Non-Goals

- Do not change Keyboard Capture key maps, pitch mapping, note insertion, capture defaults, MIDI Note On parsing, or Web MIDI permission behavior.
- Do not request System Exclusive access, MIDI output, MIDI clock, controller mapping, background recording, audio input, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not persist capture target, MIDI arm state, MIDI input selection, or Quick Action result state in project files.
- Do not change project schema, save/load migration, playback, render/export, Handoff, snapshots, undo/redo, or local draft recovery.

## Files

- `src/ui/App.tsx`: Quick Actions wiring and result labels.
- `README.md`: public MVP/runtime feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: quality rules for input-capture Quick Actions.
- `harness/scripts/run_qa.py`: static QA expectations.

## Plan

- [x] Add capture target Quick Actions for 808 and Synth using existing `setKeyboardCaptureTarget`.
- [x] Add MIDI Arm/Disarm Quick Action using existing `setMidiCaptureArmed` only when a connected MIDI input is available.
- [x] Keep command results UI-local and out of project data.
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

Browser smoke if environment allows localhost: Quick Actions shows capture target commands, target switching updates the Keyboard Capture/Web MIDI target without editing the project, MIDI Arm/Disarm enables only when a connected input exists, and no notes are inserted until explicit keyboard or MIDI input occurs.

## Review

QA completes before review starts. Review checks that commands are explicit, UI-local, route only through existing input-state setters, preserve note capture and project semantics, and avoid sampling/cloud/remote scope.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add Quick Actions for capture target and MIDI arm state. | Direct note-entry setup is a frequent producer workflow and a beginner discovery point; command access improves speed without changing musical data or capture semantics. |

## Status Log

| Date | Agent | Status |
|---|---|---|
| 2026-06-18 | project_lead | Plan created for input capture Quick Actions. |
| 2026-06-18 | harness_builder | Added capture target and MIDI Arm/Disarm Quick Actions routed through existing UI-local input-state handlers. |
| 2026-06-18 | quality_runner | QA passed with `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. Localhost browser smoke was blocked by `listen EPERM 127.0.0.1:5300`; the required escalated retry was rejected by environment policy. |
| 2026-06-18 | review_judge | Review completed after QA; no blocking findings. |
