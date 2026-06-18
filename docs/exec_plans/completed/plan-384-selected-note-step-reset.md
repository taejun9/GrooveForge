# plan-384-selected-note-step-reset

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add a direct Quick Action that resets the active selected 808/Synth note start step to the nearest 4-step beat grid anchor inside the selected Pattern A/B/C slot.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new note engine.
- No note pitch, length, glide, velocity, chance, generation, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting changes.
- No change to existing selected-note step-left/right, pitch reset, transpose, octave, length reset, length, glide reset, glide, velocity, chance, copy, paste, duplicate, delete, audition, Keyboard Capture, or MIDI Input behavior.

## Context Map

- `src/ui/App.tsx`: selected note update paths and Quick Actions wiring.
- `src/ui/selectedEventQuickActions.ts`: selected note Quick Action definitions and snap-target derivation.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected note edit QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep selected note step reset scoped to the selected Pattern A/B/C slot.
- Derive the target only from the selected note step, selected note length, selected note track, same-track notes, and existing 16-step grid.
- Snap to the nearest 4-step anchor that can preserve selected note length inside the 16-step grid.
- Disable reset when no active selected note exists, the selected note is already on the target anchor, or another same-track note already occupies the target step and pitch.
- Route reset through the existing undoable selected-note edit path.
- Keep the note selected after a successful edit.

## Implementation Plan

- [x] Inspect selected note step movement helpers and update path.
- [x] Add selected-note step reset Quick Action using the existing selected-note update path.
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

QA completes before review starts. Review checks that selected note step reset is explicit, selected-pattern scoped, undoable, selected-note preserving, collision-aware, length-preserving, and adds no pitch, sampling, hidden generation, or remote scope.

## QA Results

| date | command | result | note |
|---|---|---|---|
| 2026-06-19 | `python3 harness/scripts/run_qa.py` | pass | Static docs and harness expectations include selected-note step reset. |
| 2026-06-19 | `python3 harness/scripts/run_quality_gate.py` | pass | Quality gate passed. |
| 2026-06-19 | `git diff --check` | pass | No whitespace errors. |
| 2026-06-19 | `npm run typecheck` | pass | App and Electron TypeScript checks passed. |
| 2026-06-19 | `npm run harness:smoke` | pass | Sample-free all-style 8-bar runtime smoke passed for 10/10 blueprints and 10/10 style profiles. |
| 2026-06-19 | `npm run build` | pass | Production Vite/Electron build passed. |
| 2026-06-19 | `npm run qa` | pass | QA wrapper passed. |
| 2026-06-19 | `npm run verify` | pass | Quality gate, runtime smoke, typecheck, and build passed. |
| 2026-06-19 | `npm run dev -- --host 127.0.0.1 --port 5191` | blocked | Sandbox returned `listen EPERM`; escalated localhost dev-server retry was rejected by the environment policy, so browser visual verification was not attempted. |

## Review Result

No blocking issues found. The new Quick Action derives a length-preserving nearest 4-step anchor from the selected active note and selected pattern data, disables when the note is inactive, already on target, or blocked by a same-track step/pitch collision, and routes the edit through the existing undoable selected-note move path. The edit preserves pitch, length, glide, velocity, and chance because only `step` changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected note step reset to the nearest 4-step beat anchor. | Beginners need a safe way to recover from note timing experiments; producers need fast rhythmic cleanup without changing pitch, tone, or phrase data. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected note step reset Quick Action. |
| 2026-06-19 | harness_builder | Implemented `selected-note-step-reset` Quick Action and wired it through the existing selected-note move path. |
| 2026-06-19 | quality_runner | Completed QA commands; localhost browser check was blocked by sandbox policy after EPERM and rejected escalation. |
| 2026-06-19 | review_judge | Reviewed implementation after QA; no blocking issues found. |
