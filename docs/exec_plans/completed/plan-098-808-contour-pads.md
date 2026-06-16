# plan-098-808-contour-pads

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that working producers can respect and first-time composers can use easily.

## Goal

Add 808 Contour Pads so users can reshape the selected Pattern A/B/C 808 bassline pitch direction while preserving existing note timing and note count.

## Non-Goals

- No new bass schema, audio sample import, sampler, plugin hosting, MIDI input, remote AI, remote analysis, cloud sync, accounts, analytics, or hidden generation.
- No automatic full-song composition or mutation outside the selected Pattern A/B/C 808/bass notes.
- No professional music-theory, mixing, mastering, platform, or release-readiness guarantee claims.

## Context Map

- `src/ui/App.tsx`: 808 Bassline Pads, 808 Glide Pads, selected-note editing, bass note helpers, UI layout.
- `src/styles.css`: compact pad panel styles.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: direct composition framing and guardrails.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-098-808-contour-pads` and `.worktree/plan-098-808-contour-pads` for git repository work.
- 808 Contour Pads must update only selected Pattern A/B/C 808/bass note data through existing undoable project update paths.
- Contour changes must preserve 808 note count and step positions, keep results manually editable, and preserve realtime playback plus WAV/stem/MIDI export semantics.

## Implementation Plan

- [x] Add 808 contour pad definitions and preview derivation.
- [x] Add an explicit `applyBassContour` handler scoped to selected Pattern A/B/C 808/bass notes.
- [x] Render compact 808 Contour Pads near 808 Bassline/Glide Pads.
- [x] Update docs and QA expectations.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `npm run verify`
- Browser smoke test: 808 Contour Pads render four options, applying one option changes 808 note pitches while preserving note count and step positions, console errors stay empty, and no horizontal overflow appears.
- `npm run qa`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that contour pads are explicit, selected-pattern scoped, undoable, keep existing 808 timing/count, remain manually editable, and preserve the non-sampling product boundary.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add 808 Contour Pads after Melody Contour Pads. | The low-end line is a core beat-production surface; beginners need one-click direction changes, and producers need fast editable 808 movement without sampling or hidden generation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for 808 Contour Pads. |
| 2026-06-16 | implementer | Added Root, Rise, Drop, and Answer 808 Contour Pads that reshape selected 808/bass pitch direction without changing note count, step positions, lengths, glide flags, or chance values. |
| 2026-06-16 | qa | Passed `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `npm run verify`, `npm run qa`, and `git diff --check`. Browser smoke confirmed four contour buttons render, applying Rise changes 808 pitches while preserving four notes, steps `[1,7,11,13]`, length widths, glide flags, and chance values, with no console warnings/errors or horizontal overflow. |
| 2026-06-16 | reviewer | Reviewed implementation for selected-pattern scope, undoable update path, direct-composition framing, and no sampling/imported-audio expansion. |

## Completion Notes

808 Contour Pads are complete. The feature strengthens the direct beat-composition spine by letting users reshape local 808/bass pitch movement in the selected Pattern A/B/C while preserving existing rhythm, glide, chance, manual editability, realtime playback, and WAV/stem/MIDI export semantics.
