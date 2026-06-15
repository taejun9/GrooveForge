# plan-027-desktop-shortcuts

## Goal

Add desktop-grade keyboard shortcuts that make GrooveForge faster for working producers while staying safe for beginners and focused inputs.

## Context

GrooveForge already supports direct sample-free beat creation, Pattern A/B/C variations, editable drum/note events, undo/redo, arrangement editing, mixer/master controls, and export. The current workstation still asks users to click for basic repeated actions that are expected in a desktop music app.

## Scope

- Add non-editing keyboard shortcuts for realtime playback, Pattern A/B/C selection, selected event deletion, save, and open.
- Keep shortcuts out of text, number, range, select, textarea, and contenteditable targets.
- Deleting via keyboard must only remove a selected drum step, 808 note, or melody note; it must not clear a whole pattern or arrangement block.
- Preserve undo/redo history for shortcut edits.
- Update product docs, quality rules, and QA expectations.

## Non-Goals

- No MIDI input, plugin hosting, sampling, audio import, chopping, sampler tracks, or audio warping.
- No global shortcuts registered outside the app window.
- No visible shortcut tutorial panel in this slice.

## Files

- `src/ui/App.tsx`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/reviews/plan-027-desktop-shortcuts-review.md`

## Acceptance

- Space toggles realtime playback when focus is not in an editable field.
- `1`, `2`, and `3` select Pattern A, B, and C when focus is not in an editable field.
- Delete/Backspace removes the selected drum step or selected 808/melody note through normal undoable project history.
- Existing 808/melody notes can be selected before deletion or inspector edits instead of disappearing on first click.
- Cmd/Ctrl+S and Cmd/Ctrl+O trigger existing save/open flows when focus is not in an editable field.
- Existing Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z/Cmd+Y undo/redo behavior still works.
- `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check` pass.
- Browser validation confirms shortcuts work without console errors.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-15 | Add keyboard shortcuts before larger MIDI input. | Desktop shortcut ergonomics improve repeated producer workflows and beginner navigation without adding device permissions or external dependencies. |
| 2026-06-15 | Keep Delete scoped to selected musical events only. | This gives fast cleanup without creating a destructive whole-pattern or arrangement shortcut. |

## Progress

- [x] Created plan/worktree.
- [x] Implement shortcuts.
- [x] Update docs and harness.
- [x] Run QA and browser validation.
- [x] Create review mirror.
- [x] Ready for merge lifecycle.

## Outcome

Desktop shortcuts now cover Space playback, Pattern A/B/C selection with 1/2/3, selected drum/note deletion with Delete/Backspace, Cmd/Ctrl+S open/save routing, and existing undo/redo. Focused editable inputs keep normal typing behavior. Existing active 808/melody notes can be selected first, then edited or deleted, matching the drum-step interaction model.
