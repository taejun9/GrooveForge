# plan-281-selected-block-quick-actions

## Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying approachable for first-time composers. Keep sampling secondary.

## Scope

Add Quick Actions for existing selected arrangement block edit tools:

- Copy and paste the selected/copied arrangement block through the existing arrangement clipboard handlers.
- Duplicate the selected arrangement block through the existing duplicate handler.
- Move the selected arrangement block left or right through the existing move handlers.
- Split the selected arrangement block using the existing split-after-bars state and handler.
- Merge the selected arrangement block with the next block through the existing merge handler.
- Delete the selected arrangement block through the existing delete handler.

These commands should make song-form editing faster from command search after Arrangement Template, Pattern Chain, Section Locator, Arrangement Focus, or manual block edits.

## Non-Goals

- Do not add new arrangement generation rules, new templates, new block roles, hidden macros, multi-block selection, drag/drop, or timeline lanes.
- Do not change existing arrangement button behavior, selected-block role readout, clipboard behavior, undo history semantics, playback, render/export, MIDI export, Handoff, snapshots, save/load migration, or project schema.
- Do not add sampling, imported audio, audio input, plugin hosting, remote AI, accounts, analytics, or cloud sync.

## Files

- `src/ui/App.tsx`: Quick Actions wiring and result labels.
- `README.md`: public MVP/runtime feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: quality rules for selected-block Quick Actions.
- `harness/scripts/run_qa.py`: static QA expectations.

## Plan

- [x] Add selected-block Quick Actions that route only through existing arrangement block handlers.
- [x] Keep copy UI-local and mutating commands on existing undoable arrangement update paths.
- [x] Update README, product docs, quality rules, and static QA expectations.
- [ ] Run QA before review.
- [ ] Move this plan to completed and create a review mirror.

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

Browser smoke if environment allows localhost: Quick Actions shows selected-block edit commands, disables move-left on the first block, disables move-right/merge on the last block, disables delete when only one block remains, disables paste when the arrangement clipboard is empty, and selected-block actions reuse existing arrangement editor behavior without adding hidden generation.

## Review

QA completes before review starts. Review checks that commands are explicit, selected-block scoped, route only through existing handlers, preserve copy/paste and undo semantics, and avoid sampling/cloud/remote scope.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add selected-block Quick Actions after selected-note/chord/drum Quick Actions. | Compose edit commands are now searchable; arrangement block editing is the remaining core edit surface that benefits from command search for beginner song-form building and producer speed. |

## Status Log

| Date | Agent | Status |
|---|---|---|
| 2026-06-18 | project_lead | Plan created for selected-block Quick Actions. |
| 2026-06-18 | harness_builder | Added selected-block Quick Actions for copy, paste, duplicate, move, split, merge, and delete through existing arrangement handlers, then updated docs and static QA expectations. |
| 2026-06-18 | quality_runner | `python3 harness/scripts/run_qa.py` and `npm run typecheck` passed before merging the latest main documentation updates. |
