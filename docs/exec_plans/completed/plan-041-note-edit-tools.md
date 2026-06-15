# plan-041-note-edit-tools

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue making GrooveForge into a desktop beat-making app that can satisfy working producers while staying easy for first-time composers.

## Goal

Add selected-note edit tools for the 808 and Synth grids so users can quickly move, transpose, and duplicate musical ideas without deleting and re-clicking notes. The tools should stay scale-aware, undoable, pattern-scoped, and compatible with realtime playback, WAV export, stem export, save/load, and Pattern A/B/C independence.

## Non-Goals

- No sampling, audio import, chopping, sampler tracks, plugin hosting, MIDI recording, remote AI, or audio warping.
- No full piano-roll drag editor, clipboard system, MIDI input, or multiselect in this plan.
- No mutation of other Pattern A/B/C slots when editing the selected Pattern.
- No hidden generated audio assets.

## Context Map

- `src/ui/App.tsx`: selected note state, note editor, note inspector, undoable project update path.
- `src/domain/workstation.ts`: note types, pitch lane helpers, pattern clone/normalization, pattern variation helpers.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and quality framing.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-041-note-edit-tools` and `.worktree/plan-041-note-edit-tools` for git repository work.
- Preserve the beat-first product invariant: direct composition first, optional sampling later.

## Implementation Plan

- [x] Add scale-aware selected-note move helpers for step and pitch changes.
- [x] Add selected-note duplicate helper that copies length/glide/velocity/chance into a nearby empty step.
- [x] Expose note edit buttons in the Studio note inspector with stable test IDs.
- [x] Keep note edits undoable and scoped to the selected Pattern A/B/C slot.
- [x] Update docs and QA expectations.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test: switch to Studio mode, select an 808/Synth note, use nudge/octave/duplicate controls, confirm event counts and selection update, undo restores, playback starts/stops, and console errors are empty.

## Review Plan

QA completes before review starts. Review checks that note tools are selected-pattern scoped, keep notes scale-aware, preserve note properties when duplicating, do not break save/load or export paths, and do not introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Add selected-note tools before a full piano-roll editor. | This improves direct composition speed for beginners and working producers while staying inside the existing compact grid model. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created after comparing MVP requirements with the current 808/Synth grid and identifying slow note movement/duplication as the next composition bottleneck. |
| 2026-06-15 | harness_builder | Added selected-note step, scale-pitch, octave, and duplicate tools in the Studio note inspector without adding new project state. |
| 2026-06-15 | quality_runner | Passed typecheck, static QA, quality gate, full verify, diff whitespace check, and browser smoke coverage for note tool rendering, nudge, pitch, octave, duplicate, undo, playback, and console health. |
| 2026-06-15 | review_judge | Confirmed note edits stay selected-pattern scoped and preserve the beat-first product direction. |

## Completion Notes

Completed. Studio mode now exposes selected-note tools for 808 and Synth notes: step left/right, scale pitch down/up, octave down/up, and duplicate. The tools preserve note properties, avoid overlapping same-step/same-pitch duplicates, remain undoable, and operate only on the selected Pattern A/B/C slot.

QA passed:

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test on `http://127.0.0.1:5173/`: Studio mode showed all seven note tool buttons, selected `808 F1.1`, nudge moved it to `F1.2` with Pattern A still `34 events`, pitch moved it to `G1.2`, octave moved it to `G2.2`, duplicate created `G2.3` and Pattern A became `35 events`, Undo returned Pattern A to `34 events`, playback started at `Intro 1.2`, Stop returned to `Ready`, and console warning/error logs were empty.
