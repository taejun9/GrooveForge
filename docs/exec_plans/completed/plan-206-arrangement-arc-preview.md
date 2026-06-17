# plan-206-arrangement-arc-preview

## Status

Completed.

## Goal

Add a UI-local Arrangement Arc Preview above Arrangement Arc Pads so users can see the suggested full-song arc, section/bar posture, Pattern A/B/C spread, energy posture, muted-track posture, and pre-click arrangement move count before applying an arc.

## User Value

- Beginners can understand what a full-song arrangement move will change before clicking it.
- Producers can scan song-form shape, Pattern spread, and energy direction quickly while arranging.
- The workflow keeps arrangement editing explicit, undoable, and sample-free.

## Non-Goals

- Do not change Arrangement Arc Pad definitions or apply behavior.
- Do not change saved project schema, undo history semantics, playback, render/export, MIDI export, Handoff Sheet, or Handoff Pack file contents.
- Do not add auto-arrangement, hidden generation, remote AI, imported audio, or sampling workflow.

## Scope

- Add `ArrangementArcPreviewSummary` derived only from current local arrangement state and existing Arrangement Arc Pad definitions.
- Render the preview in the Arrange panel before the existing Arrangement Arc Pad row.
- Update README/product/quality docs and static QA expectations.
- Preserve existing Arrangement Arc Pad click behavior and manual arrangement controls.

## QA

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser smoke if localhost dev server is available in this environment. Blocked: `npm run dev -- --host 127.0.0.1 --port 5296` failed with `listen EPERM`, and the escalated retry was rejected by the environment policy.

## Completion Notes

- Added a UI-local Arrangement Arc Preview above Arrangement Arc Pads.
- Preview labels show suggested arc, section/bar posture, Pattern A/B/C spread, energy posture, muted-track posture, and pre-click block/field move counts.
- Preview derivation uses current local arrangement state plus existing Arrangement Arc Pad definitions and leaves saved project schema, undo history, pad apply behavior, playback, and export behavior unchanged.
- Updated README, product docs, quality rules, and static QA expectations.

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-06-17 | Add preview before Arrangement Arc Pads. | Arrangement Arc Pads affect full-song section, Pattern, energy, and mute posture; pre-click clarity improves beginner confidence and producer speed without changing explicit arrangement editing. |
| 2026-06-17 | Keep preview UI-local and derived from the existing arc transform. | This preserves Arrangement Arc Pad definitions, apply behavior, project schema, undo history, and sample-free arrangement semantics. |
| 2026-06-17 | Record browser smoke as blocked in this environment. | Localhost dev server binding failed with `listen EPERM`, and the escalated retry was rejected by environment policy. |
