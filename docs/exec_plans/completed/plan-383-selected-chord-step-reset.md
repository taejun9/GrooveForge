# plan-383-selected-chord-step-reset

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add a direct Quick Action that resets the active selected chord start step to the nearest 4-step chord grid anchor inside the selected Pattern A/B/C slot.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new chord engine.
- No chord root, quality, inversion, length, velocity, chance, progression replacement, reharmonization, hidden generation, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting changes.
- No change to existing selected-chord step-left/right, root reset/down/up, quality reset/cycle, inversion reset, inversion, length reset, length, velocity, chance, copy, paste, duplicate, delete, audition, Chord Pads, Chord Rhythm Pads, or Chord Voicing Pads.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected chord Quick Action definitions and snap-target derivation.
- `src/ui/App.tsx`: existing chord event update path and Quick Actions wiring.
- `src/ui/workstationPatternTools.ts`: `chordEventWithUpdate` and chord collision helpers.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected chord edit QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep selected chord step reset scoped to the selected Pattern A/B/C slot.
- Derive the target only from the selected chord step, chord length, and existing 16-step grid.
- Snap to the nearest 4-step anchor that can preserve the selected chord length inside the 16-step grid.
- Disable reset when no active selected chord exists, the selected chord is already on the target anchor, or another chord already starts at the target step.
- Route reset through the existing undoable chord event update path.
- Keep the chord selected after a successful edit.

## Implementation Plan

- [x] Inspect selected chord step movement helpers and update path.
- [x] Add selected-chord step reset Quick Action using the existing chord event update path.
- [x] Update README, product docs, quality rules, and static QA expectations.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `git diff --check`
- `npm run typecheck`
- `npm run harness:smoke`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Browser/dev-server visual check if the environment allows localhost.

## Review Plan

QA completes before review starts. Review checks that selected chord step reset is explicit, selected-pattern scoped, undoable, selected-chord preserving, collision-aware, length-preserving, and adds no harmonic, sampling, hidden generation, or remote scope.

## QA Results

| date | command | result |
|---|---|---|
| 2026-06-19 | `python3 harness/scripts/run_qa.py` | pass |
| 2026-06-19 | `python3 harness/scripts/run_quality_gate.py` | pass |
| 2026-06-19 | `git diff --check` | pass |
| 2026-06-19 | `npm run typecheck` | pass |
| 2026-06-19 | `npm run harness:smoke` | pass |
| 2026-06-19 | `npm run build` | pass |
| 2026-06-19 | `npm run qa` | pass |
| 2026-06-19 | `npm run verify` | pass |
| 2026-06-19 | `npm run dev -- --host 127.0.0.1 --port 5190` | blocked: sandbox returned `listen EPERM`; escalated retry was rejected by policy, so no browser visual check was run |

## Review Results

| date | reviewer | result |
|---|---|---|
| 2026-06-19 | review_judge | pass: reset target is derived from the selected chord step/length and the 16-step grid, collision blocking is present before execution and reinforced by `updateChordEvent`, and the command sets only `step` through the existing undoable chord event update path without adding harmonic, schema, render, sampling, hidden generation, or remote scope. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected chord step reset to the nearest 4-step anchor. | Beginners need a safe way to recover from off-grid chord timing experiments; producers need fast timing cleanup without replacing harmony or the progression. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected chord step reset Quick Action. |
| 2026-06-19 | harness_builder | Added `selected-chord-step-reset` Quick Action and synchronized README, product docs, quality rules, and static QA expectations. |
| 2026-06-19 | quality_runner | Standard QA suite passed; localhost browser check was blocked by sandbox/policy. |
| 2026-06-19 | review_judge | Post-QA review found no follow-up changes required. |
