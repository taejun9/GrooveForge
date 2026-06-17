# plan-277-keyboard-capture-quick-action

## Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying approachable for first-time composers. Keep sampling secondary.

## Scope

Add a Quick Actions command for the existing Desktop Keyboard Capture toggle:

- Turn Keyboard Capture on or off from command search.
- Show the current 808/Synth target, Pattern A/B/C, and capture defaults in the command detail.
- Keep the command UI-local and route it only through existing Keyboard Capture enabled state.

This helps beginners discover the direct note-entry switch and lets producers arm or disarm desktop note entry without leaving the command palette.

## Non-Goals

- Do not change Keyboard Capture key maps, pitch mapping, focused-input guards, note insertion, capture defaults, MIDI Note On parsing, Web MIDI permission behavior, or MIDI arm behavior.
- Do not add sampling, imported audio, audio input, controller mapping, background recording, remote AI, accounts, analytics, or cloud sync.
- Do not persist Keyboard Capture enabled state or Quick Action result state in project files.
- Do not change project schema, save/load migration, playback, render/export, Handoff, snapshots, undo/redo, or local draft recovery.

## Files

- `src/ui/App.tsx`: Quick Actions wiring and result labels.
- `README.md`: public MVP/runtime feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: quality rules for Keyboard Capture Quick Actions.
- `harness/scripts/run_qa.py`: static QA expectations.

## Plan

- [x] Add a Keyboard Capture toggle Quick Action using existing `setKeyboardCaptureEnabled`.
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

Browser smoke if environment allows localhost: Quick Actions shows the Keyboard Capture toggle command, the command updates the Keyboard Capture panel On/Off state without editing the project, existing capture target/default commands still appear, and no notes are inserted until explicit desktop key or MIDI input occurs.

## Review

QA completes before review starts. Review checks that the command is explicit, UI-local, routes only through existing Keyboard Capture enabled state, preserves focused-input and note-capture semantics, and avoids sampling/cloud/remote scope.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add a Quick Actions Keyboard Capture toggle rather than changing note entry behavior. | The direct-composition entry point should be searchable and fast without changing how notes are captured, edited, saved, played, or exported. |

## Status Log

| Date | Agent | Status |
|---|---|---|
| 2026-06-18 | project_lead | Plan created for Keyboard Capture toggle Quick Action. |
| 2026-06-18 | harness_builder | Added the Keyboard Capture toggle Quick Action through existing UI-local enabled state, with input-capture result handling and follow-up copy. |
| 2026-06-18 | quality_runner | QA passed with `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. Localhost browser smoke was blocked by `listen EPERM 127.0.0.1:5302`; the required escalated retry was rejected by environment policy. |
| 2026-06-18 | review_judge | Review completed after QA; no blocking findings. |

## Completion Summary

Completed. Quick Actions now includes a Keyboard Capture toggle command for the current 808/Synth target and Pattern A/B/C context. It routes only through existing UI-local Keyboard Capture enabled state, does not insert notes by itself, and preserves project schema, save/load, playback, render/export, Handoff, sampling, remote, and cloud boundaries.
