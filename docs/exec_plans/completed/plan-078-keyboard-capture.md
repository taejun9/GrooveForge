# plan-078-keyboard-capture

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add a local Keyboard Capture workflow so users can press desktop keys to enter scale-locked 808 or Synth notes into the selected Pattern A/B/C. This gives beginners a playable composition path without music theory setup and gives working producers a faster sketch input path before hardware MIDI is added.

## Non-Goals

- No Web MIDI permission prompt, hardware MIDI implementation, recording timeline, quantized live overdub, audio recording, sample import, chopping, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No project schema fields.
- No hidden generation or autoplay.
- No changes to WAV/stem/MIDI export semantics beyond existing export paths naturally rendering the newly entered local notes.

## Context Map

- `src/ui/App.tsx` owns desktop shortcuts, NoteEditor, selected-note state, and Pattern A/B/C mutation paths.
- `src/domain/workstation.ts` owns note data, scale lanes, normalization, and Pattern state.
- `src/styles.css` owns compact workstation layout and controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` keep product and QA expectations aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keyboard Capture must ignore focused inputs, textareas, selects, and contenteditable targets.
- Keyboard Capture must route note edits through undoable project updates and keep notes as editable local musical event data.

## Implementation Plan

- [x] Add Keyboard Capture mode state, track target, and next-step helpers.
- [x] Add desktop-key note capture for `A S D F G H J K` mapped to scale lanes.
- [x] Add a compact panel in the 808 / Melody editor for target, key map, next step, and selected-note feedback.
- [x] Update docs and QA expectations for local keyboard note capture.

## QA Plan

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser smoke: enable Keyboard Capture, press capture keys for 808 and Synth, confirm note counts/selected note change, undo works, focused inputs are protected, console errors empty, and no horizontal overflow.

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add desktop Keyboard Capture before hardware MIDI. | It is immediately testable in the desktop/web shell, improves direct composition speed, avoids permission prompts, and keeps the product sample-free and event-based. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created from clean main after plan-077. |
| 2026-06-16 | project_lead | Implemented local Keyboard Capture UI and desktop-key note entry for scale-locked 808/Synth events. |

## Completion Notes

Keyboard Capture is implemented in the 808 / Melody editor. Users can arm the panel, choose 808 or Synth, and press `A S D F G H J K` to add scale-locked local musical events to the selected Pattern A/B/C. Captured notes use existing undoable project history, leave focused editable controls protected, and remain editable in the note grid, inspector, playback, export, and MIDI paths.

QA passed:

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `npm run qa`
- Browser smoke at `http://127.0.0.1:5186/`: Keyboard Capture rendered, 808 capture increased 808 events and selected the captured note, Undo restored the count, Synth capture increased Synth events and selected the captured note, focused title input accepted `A` without adding notes, console errors were empty, and desktop horizontal overflow was false.
