# plan-278-selected-note-quick-actions

## Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying approachable for first-time composers. Keep sampling secondary.

## Scope

Add Quick Actions for existing selected 808/Synth note edit tools:

- Move the selected note left/right by one step.
- Move the selected note up/down by one scale pitch.
- Move the selected note up/down by one octave.
- Copy, paste, and duplicate selected/copied notes through the existing note clipboard and duplicate handlers.

These commands should speed up producer editing after Keyboard Capture/Web MIDI entry and make beginner-discoverable note correction available through command search.

## Non-Goals

- Do not add new note movement rules, new quantization, new generation, hidden macros, batch selection, or multi-note editing.
- Do not change note grid UI behavior, selected-note readouts, copy/paste collision rules, undo history semantics, key retargeting, playback, render/export, MIDI export, Handoff, snapshots, save/load migration, or project schema.
- Do not add sampling, imported audio, audio input, controller mapping, background recording, remote AI, accounts, analytics, or cloud sync.

## Files

- `src/ui/App.tsx`: Quick Actions wiring and result labels.
- `README.md`: public MVP/runtime feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: quality rules for selected-note Quick Actions.
- `harness/scripts/run_qa.py`: static QA expectations.

## Plan

- [x] Add selected-note Quick Actions that route only through existing selected-note handlers.
- [x] Keep copy UI-local and keep mutating commands on existing undoable pattern update paths.
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

Browser smoke if environment allows localhost: Quick Actions shows selected-note edit commands when a note is selected, disables move/copy/duplicate commands without an active selected note, disables paste when the note clipboard is empty, and selected-note actions reuse existing note-grid behavior without inserting notes outside explicit commands.

## Review

QA completes before review starts. Review checks that commands are explicit, selected-note scoped, route only through existing handlers, preserve collision prevention and undo semantics, and avoid sampling/cloud/remote scope.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add selected-note Quick Actions after input-capture commands. | Once note entry is searchable, the next practical editing speed gap is correcting captured notes without leaving command search. |
| 2026-06-18 | Keep selected-note Quick Actions as handler aliases, not new edit logic. | This preserves existing selected Pattern scope, collision prevention, note clipboard behavior, and undo semantics. |

## Status Log

| Date | Agent | Status |
|---|---|---|
| 2026-06-18 | project_lead | Plan created for selected-note Quick Actions. |
| 2026-06-18 | harness_builder | Added selected-note Quick Actions, docs, and static QA expectations. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. Localhost Browser smoke was not run because sandboxed dev server start failed with `listen EPERM` and escalated dev-server execution was rejected by environment policy. |
| 2026-06-18 | review_judge | Review found no blocking issues. Commands remain explicit, selected Pattern scoped, and routed through existing selected-note handlers. |
