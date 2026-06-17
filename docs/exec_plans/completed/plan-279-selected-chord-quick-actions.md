# plan-279-selected-chord-quick-actions

## Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying approachable for first-time composers. Keep sampling secondary.

## Scope

Add Quick Actions for existing selected-chord edit tools:

- Move the selected chord left/right by one step.
- Copy, paste, and duplicate selected/copied chords through the existing chord clipboard and duplicate handlers.
- Move selected chord inversion down/up through the existing inversion handler.

These commands should make harmonic correction and repetition faster after Chord Pads or Chord Move actions, while keeping beginner-discoverable chord editing in the command palette.

## Non-Goals

- Do not add new chord movement rules, new chord generation, hidden macros, multi-chord editing, or arrangement writing.
- Do not change chord grid UI behavior, selected-chord harmonic readouts, copy/paste collision rules, undo history semantics, key retargeting, playback, render/export, MIDI export, Handoff, snapshots, save/load migration, or project schema.
- Do not add sampling, imported audio, audio input, plugin hosting, remote AI, accounts, analytics, or cloud sync.

## Files

- `src/ui/App.tsx`: Quick Actions wiring and result labels.
- `README.md`: public MVP/runtime feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: quality rules for selected-chord Quick Actions.
- `harness/scripts/run_qa.py`: static QA expectations.

## Plan

- [x] Add selected-chord Quick Actions that route only through existing selected-chord handlers.
- [x] Keep copy UI-local and keep mutating commands on existing undoable chord update paths.
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

Browser smoke if environment allows localhost: Quick Actions shows selected-chord edit commands when a chord is selected, disables move/copy/duplicate/inversion commands without an active selected chord, disables paste when the chord clipboard is empty, and selected-chord actions reuse existing chord editor behavior without adding hidden generation.

## Review

QA completes before review starts. Review checks that commands are explicit, selected-chord scoped, route only through existing handlers, preserve collision prevention and undo semantics, and avoid sampling/cloud/remote scope.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add selected-chord Quick Actions after selected-note Quick Actions. | Once captured notes are command-editable, the parallel composition gap is fast harmonic correction and chord repetition without leaving command search. |
| 2026-06-18 | Keep selected-chord Quick Actions as handler aliases, not new chord logic. | This preserves selected Pattern scope, chord-step collision prevention, chord clipboard behavior, inversion bounds, and undo semantics. |

## Status Log

| Date | Agent | Status |
|---|---|---|
| 2026-06-18 | project_lead | Plan created for selected-chord Quick Actions. |
| 2026-06-18 | harness_builder | Added selected-chord Quick Actions, docs, and static QA expectations. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. Build passed with the existing Vite chunk-size warning. Localhost Browser smoke was not run because sandboxed dev server start failed with `listen EPERM` and escalated dev-server execution was rejected by environment policy. |
| 2026-06-18 | review_judge | Review found no blocking issues. Commands remain explicit, selected Pattern scoped, and routed through existing selected-chord handlers. |
