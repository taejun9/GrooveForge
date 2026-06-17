# plan-276-capture-default-quick-actions

## Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying approachable for first-time composers. Keep sampling secondary.

## Scope

Add Quick Actions for the existing direct note-entry defaults:

- Raise or lower the current Keyboard/Web MIDI capture octave.
- Shorten or lengthen the current captured note length.
- Raise or lower Synth capture velocity when the capture target is Synth.
- Toggle 808 glide when the capture target is 808.

These commands should help producers change capture posture without leaving command search and give beginners searchable access to the same local defaults already shown in the Compose panel.

## Non-Goals

- Do not change Keyboard Capture key maps, pitch mapping, note insertion, MIDI Note On parsing, Web MIDI permission behavior, or MIDI arm behavior.
- Do not add sampling, imported audio, audio input, controller mapping, background recording, remote AI, accounts, analytics, or cloud sync.
- Do not persist capture defaults or Quick Action result state in project files.
- Do not change project schema, save/load migration, playback, render/export, Handoff, snapshots, undo/redo, or local draft recovery.

## Files

- `src/ui/App.tsx`: Quick Actions wiring and result labels.
- `README.md`: public MVP/runtime feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: quality rules for capture-default Quick Actions.
- `harness/scripts/run_qa.py`: static QA expectations.

## Plan

- [x] Add capture-default Quick Actions using the existing `updateKeyboardCaptureDefaults` path.
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

Browser smoke if environment allows localhost: Quick Actions shows capture-default commands, octave/length changes update the current Keyboard Capture defaults without editing the project, Synth velocity commands are active only for Synth, 808 glide toggle is active only for 808, and no notes are inserted until explicit keyboard or MIDI input occurs.

## Review

QA completes before review starts. Review checks that commands are explicit, UI-local, route only through existing capture-default state, preserve note capture and project semantics, and avoid sampling/cloud/remote scope.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add Quick Actions for capture defaults rather than new recording behavior. | The next practical input-speed gap is changing capture posture quickly; it improves direct composition without changing musical data, MIDI parsing, or project schema. |

## Status Log

| Date | Agent | Status |
|---|---|---|
| 2026-06-18 | project_lead | Plan created for capture-default Quick Actions. |
| 2026-06-18 | harness_builder | Added capture-default Quick Actions for octave, length, Synth velocity, and 808 glide through the existing UI-local defaults updater. |
| 2026-06-18 | quality_runner | QA passed with `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. Localhost browser smoke was blocked by `listen EPERM 127.0.0.1:5301`; the required escalated retry was rejected by environment policy. |
| 2026-06-18 | review_judge | Review completed after QA; no blocking findings. |

## Completion Summary

Completed. Quick Actions now includes capture-default commands for current 808/Synth octave, captured note length, Synth velocity, and 808 glide. Commands route only through existing UI-local Keyboard Capture defaults state, show UI-local Quick Action results, and do not insert notes, mutate project data, change schema, alter playback/export, or add sampling/remote/cloud scope.
