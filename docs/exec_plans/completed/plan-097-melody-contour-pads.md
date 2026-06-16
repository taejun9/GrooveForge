# plan-097-melody-contour-pads

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that working producers can respect and first-time composers can use easily.

## Goal

Add Melody Contour Pads so users can reshape the selected Pattern A/B/C Synth melody direction while preserving existing note timing and note count.

## Non-Goals

- No new melody schema, audio sample import, sampler, plugin hosting, MIDI input, remote AI, remote analysis, cloud sync, accounts, analytics, or hidden generation.
- No automatic full-song composition or mutation outside the selected Pattern A/B/C melody notes.
- No professional music-theory guarantee claims.

## Context Map

- `src/ui/App.tsx`: Melody Motif Pads, Melody Accent Pads, selected-note editing, melody note helpers, UI layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: direct composition framing and guardrails.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-097-melody-contour-pads` and `.worktree/plan-097-melody-contour-pads` for git repository work.
- Melody Contour Pads must update only selected Pattern A/B/C melody note data through existing undoable project update paths.
- Contour changes must preserve melody note count and step positions, keep results manually editable, and preserve realtime playback plus WAV/stem/MIDI export semantics.

## Implementation Plan

- [x] Add contour pad definitions and preview derivation.
- [x] Add an explicit `applyMelodyContour` handler scoped to selected Pattern A/B/C melody notes.
- [x] Render compact Melody Contour Pads near Melody Motif/Accent Pads.
- [x] Update docs and QA expectations.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `npm run verify`
- Browser smoke test: Melody Contour Pads render four options, Fall changes Synth note pitches while preserving note count and step positions, console errors stay empty, and no horizontal overflow appears.
- `npm run qa`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that contour pads are explicit, selected-pattern scoped, undoable, keep existing melody timing/count, remain manually editable, and preserve the non-sampling product boundary.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Melody Contour Pads after Chord Voicing Pads. | The app needs faster melodic variation editing for producers while keeping beginner-friendly one-click controls. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for Melody Contour Pads. |
| 2026-06-16 | implementer | Added Rise, Fall, Answer, and Anchor contour pads that reshape selected Synth melody pitch contour, length, velocity, and chance without changing note count or step positions. |
| 2026-06-16 | qa | Passed `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `npm run verify`, `npm run qa`, and `git diff --check`. Browser smoke confirmed four contour buttons render, applying Fall changes Synth pitches while preserving five notes and steps `[1,4,7,11,13]`, and no horizontal overflow appears. |
| 2026-06-16 | reviewer | Reviewed implementation for selected-pattern scope, undoable update path, direct-composition framing, and no sampling/imported-audio expansion. |

## Completion Notes

Melody Contour Pads are complete. The feature stays on the direct beat-composition spine by editing local Synth melody notes in the selected Pattern A/B/C, remains manually editable through the note grid and inspector, and preserves realtime playback plus WAV/stem/MIDI export semantics.
