# plan-096-chord-voicing-pads

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that working producers can respect and first-time composers can use easily.

## Goal

Add Chord Voicing Pads so users can quickly reshape the selected chord's harmonic color through explicit local edits to quality, inversion, velocity, length, and chance.

## Non-Goals

- No new chord schema, audio sample import, sampler, plugin hosting, MIDI input, remote AI, remote analysis, cloud sync, accounts, analytics, or hidden generation.
- No automatic progression rewrite or mutation outside the selected Pattern A/B/C chord event.
- No professional music-theory guarantee claims.

## Context Map

- `src/ui/App.tsx`: selected chord state, Chord Pads, Chord Rhythm Pads, chord event update path, UI layout, QA test IDs.
- `docs/product/product.md`, `README.md`, `docs/quality/rules.md`: direct composition product framing and guardrails.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-096-chord-voicing-pads` and `.worktree/plan-096-chord-voicing-pads` for git repository work.
- Chord Voicing Pads must update only the selected Pattern A/B/C chord event through existing undoable chord update paths.
- Results must remain manually editable through existing chord controls and export through existing realtime/WAV/stem/MIDI paths.

## Implementation Plan

- [x] Add voicing pad definitions and selected-chord option derivation.
- [x] Add an explicit `applyChordVoicingPad` handler through existing chord event update logic.
- [x] Render compact Chord Voicing Pads near Chord Pads/Rhythm Pads.
- [x] Update docs and QA expectations.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `npm run verify`
- Browser smoke test: Chord Voicing Pads render four options, selected chord changes after a pad click, console errors stay empty, and no horizontal overflow appears.
- `npm run qa`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that voicing pads are explicit, selected-chord scoped, undoable through existing project history, manually editable afterward, and preserve the beat-first non-sampling product boundary.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Chord Voicing Pads instead of another status panel. | The app needs more direct composition depth for producers while keeping beginner-friendly one-click musical controls. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for Chord Voicing Pads. |
| 2026-06-16 | harness_builder | Added Chord Voicing Pads, selected-chord voicing derivation, styles, docs, and static QA expectations. |
| 2026-06-16 | quality_runner | `npm run typecheck`, `python3 harness/scripts/run_qa.py`, browser smoke, `npm run verify`, `npm run qa`, and `git diff --check` passed. |

## Completion Notes

Chord Voicing Pads now let users explicitly reshape the selected Pattern A/B/C chord event with Open, Deep, Tension, and Air voicing presets. Each pad routes through the existing undoable chord update path, preserves chord step/root and event count, and leaves the result manually editable through the Chord Editor.
