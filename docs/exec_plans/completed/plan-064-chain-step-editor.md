# plan-064-chain-step-editor

## Status

Completed

## Owner

Team Forge

## User Request

Continue completing GrooveForge as a desktop beat workstation that is satisfying for working composers and easy for first-time composers.

## Goal

Add a direct Pattern Chain step editor so users can quickly reshape the first eight arrangement blocks by cycling each block's Pattern A/B/C assignment. This should make arrangement sketching faster for producers and easier to understand for beginners without adding sampling, hidden generation, or new project data.

## Scope

- Add compact 8-step Pattern Chain controls near the existing Pattern Chain presets.
- Each step should show the bar number, assigned Pattern A/B/C, and section/energy context.
- Clicking a step should cycle that arrangement block's pattern A -> B -> C -> A through existing undoable arrangement update paths.
- Preserve Pattern A/B/C event data, mixer state, sound state, master state, export paths, and arrangement block metadata.
- Update product docs, quality rules, and static QA expectations.

## Non-Goals

- No drag-and-drop timeline editor.
- No custom chain save presets or new project schema.
- No sampling, sample import, audio clips, sampler tracks, waveform editing, plugin hosting, remote AI, analytics, accounts, or cloud sync.
- No changes to audio scheduling, MIDI export, WAV export, stem export, save/load schema, or render semantics.

## Files

- `src/ui/App.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/active/plan-064-chain-step-editor.md`
- `docs/reviews/plan-064-chain-step-editor-review.md`

## Implementation Steps

- [x] Inspect current Pattern Chain UI, arrangement update helper, and styling.
- [x] Add an undoable step-cycle handler for arrangement block pattern assignment.
- [x] Render up to eight compact chain step buttons with stable test ids and accessible labels.
- [x] Style the step editor with fixed sizing so labels do not shift or overlap on desktop/mobile.
- [x] Update docs and QA expectations for the step editor.
- [x] Run automated QA, browser smoke, review, and completion flow.

## QA Plan

- [x] `python3 harness/scripts/run_qa.py` - passed.
- [x] `python3 harness/scripts/run_quality_gate.py` - passed.
- [x] `npm run typecheck` - passed.
- [x] `npm run build` - passed.
- [x] `npm run qa` - passed.
- [x] `npm run verify` - passed.
- [x] Browser smoke: applying Break Turn produced `A-A-C-C-B-B-A-B`; clicking step 3 changed it to `A-A-A-C-B-B-A-B`; undo restored `A-A-C-C-B-B-A-B`; Play/Stop worked; console errors were empty; body, step editor, and mute row horizontal overflow were false.

## Review Plan

Review starts only after QA passes. Confirm the step editor is undoable, arrangement-only, preserves musical event data and mix/master state, avoids sampling-first drift, and remains readable in the workstation UI.

## Decision Log

| date | decision | rationale |
|---|---|---|
| 2026-06-16 | Build direct per-step cycling rather than a text input or saved custom preset. | Step buttons are faster for sketching, easier for beginners, avoid parsing/error states, and reuse existing arrangement block data. |

## Implementation Notes

- Added `cyclePatternChainStep` and `nextPatternSlot` to cycle an arrangement block through Pattern A/B/C via the existing undoable project update path.
- Added `pattern-chain-step-editor` with up to eight step buttons showing step number, current pattern, section, and bar count.
- Kept the editor arrangement-only: it changes block pattern assignments, not Pattern A/B/C musical events, mixer state, sound state, master state, or export logic.
- Tuned Pattern Chain and Arrangement editor CSS so the new step editor, mute row, and energy inputs stay inside their containers.
- Updated README, product docs, quality rules, and static QA expectations.

## Review Summary

No findings. The step editor is explicit-click, local, undoable, arrangement-only, and stays within the beat-workstation composition workflow. It adds no sampling, remote AI, hidden generation, schema changes, or export/playback behavior changes.
