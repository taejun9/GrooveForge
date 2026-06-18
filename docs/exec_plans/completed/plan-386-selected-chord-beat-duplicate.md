# plan-386-selected-chord-beat-duplicate

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add a direct Quick Action that duplicates the active selected chord event to the next available 4-step chord/beat-grid anchor inside the selected Pattern A/B/C slot.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new chord engine.
- No chord root, quality, inversion, length, velocity, chance, generation, reharmonization, progression replacement, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, plugin hosting, or payment changes.
- No change to existing selected-chord copy, paste, duplicate, move, step reset, root reset, quality reset, inversion reset, inversion, length reset, length, velocity, chance, delete, audition, Keyboard Capture, MIDI Input, or note editing behavior.

## Context Map

- `src/ui/App.tsx`: selected chord duplicate paths and Quick Actions wiring.
- `src/ui/selectedEventQuickActions.ts`: selected chord Quick Action definitions and beat-grid duplicate target derivation.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected chord edit QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep selected chord beat duplicate scoped to the selected Pattern A/B/C slot.
- Derive the target only from the selected chord step, selected chord length, selected Pattern A/B/C chord events, and existing 16-step grid.
- Duplicate only to a later 4-step anchor that can preserve selected chord length inside the 16-step grid.
- Disable beat duplicate when no active selected chord exists, no later length-preserving 4-step anchor exists, or another chord already starts at the target step.
- Preserve root, quality, inversion, length, velocity, chance, chord clipboard, playback, export, and manual chord controls.
- Keep the duplicated chord selected after a successful edit.

## Implementation Plan

- [x] Inspect selected-chord duplicate helpers and existing Quick Action state.
- [x] Add selected-chord beat-grid duplicate Quick Action using the existing undoable selected-pattern chord insertion path.
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

QA completes before review starts. Review checks that selected chord beat duplicate is explicit, selected-pattern scoped, undoable, selection-preserving, collision-aware, length-preserving, clipboard-safe, and adds no sampling, reharmonization, hidden generation, or remote scope.

## QA Results

| date | command | result | note |
|---|---|---|---|
| 2026-06-19 | `python3 harness/scripts/run_qa.py` | pass | Static docs and harness expectations include selected-chord beat duplicate. |
| 2026-06-19 | `python3 harness/scripts/run_quality_gate.py` | pass | Quality gate passed. |
| 2026-06-19 | `git diff --check` | pass | No whitespace errors. |
| 2026-06-19 | `npm run typecheck` | pass | App and Electron TypeScript checks passed. |
| 2026-06-19 | `npm run harness:smoke` | pass | Sample-free all-style 8-bar runtime smoke passed for 10/10 blueprints and 10/10 style profiles. |
| 2026-06-19 | `npm run build` | pass | Production Vite/Electron build passed. |
| 2026-06-19 | `npm run qa` | pass | QA wrapper passed. |
| 2026-06-19 | `npm run verify` | pass | Quality gate, runtime smoke, typecheck, and build passed. |
| 2026-06-19 | `npm run dev -- --host 127.0.0.1 --port 5193` | blocked | Sandbox returned `listen EPERM`; escalated localhost dev-server retry was rejected by the environment policy, so browser visual verification was not attempted. |

## Review Result

No blocking issues found. The new Quick Action derives the next later length-preserving empty 4-step chord anchor from the active selected chord and selected pattern data, disables when no target exists, and routes the edit through the existing undoable selected-pattern chord insertion path. The duplicated chord preserves root, quality, inversion, length, velocity, and chance, leaves the UI-local chord clipboard unchanged, and becomes the active selection.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected chord beat duplicate to the next valid 4-step anchor. | Chord-grid repetition is a fast direct-composition move for harmonic rhythm and song-section drafting, useful for beginners building progressions and producers placing harmonic events quickly. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected chord beat-grid duplicate Quick Action. |
| 2026-06-19 | harness_builder | Implemented `selected-chord-duplicate-beat` Quick Action and wired it through an undoable selected-pattern chord insertion handler. |
| 2026-06-19 | quality_runner | Completed QA commands; localhost browser check was blocked by sandbox policy after EPERM and rejected escalation. |
| 2026-06-19 | review_judge | Reviewed implementation after QA; no blocking issues found. |
