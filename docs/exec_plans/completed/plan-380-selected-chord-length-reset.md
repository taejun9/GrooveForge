# plan-380-selected-chord-length-reset

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add a direct Quick Action that resets the active selected chord length to the core 4-step chord length, capped by the remaining selected Pattern A/B/C grid from the chord start step.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new chord engine.
- No reharmonization, progression replacement, chord generation, hidden generation, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting.
- No change to existing selected-chord move, root/quality, inversion reset, inversion, length short/long, velocity, chance, copy, paste, duplicate, delete, audition, Chord Pads, Chord Rhythm Pads, or Chord Voicing Pads.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected chord Quick Action definitions and default length derivation.
- `src/ui/App.tsx`: existing selected chord length update handler and Quick Actions wiring.
- `src/domain/workstation.ts`: core chord creation defaults and 16-step Pattern grid.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected chord edit QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep selected chord length reset scoped to the selected Pattern A/B/C slot.
- Derive the reset target from the core 4-step chord length capped by the remaining 16-step grid from the selected chord step.
- Disable reset when no active selected chord exists or the selected chord already matches the target length.
- Route the reset through the existing undoable selected-chord length update path.
- Keep the chord selected after a successful edit.

## Implementation Plan

- [x] Inspect selected chord length helpers and Quick Action definitions.
- [x] Add selected-chord length reset Quick Action using the existing selected-chord length update path.
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

QA completes before review starts. Review checks that selected chord length reset is explicit, selected-pattern scoped, default-length capped, undoable, selected-chord preserving, and adds no sampling, hidden generation, or remote scope.

## QA Results

- Pass: `python3 harness/scripts/run_qa.py`
- Pass: `python3 harness/scripts/run_quality_gate.py`
- Pass: `git diff --check`
- Pass: `npm run typecheck`
- Pass: `npm run harness:smoke`
- Pass: `npm run build`
- Pass: `npm run qa`
- Pass: `npm run verify`
- Blocked: localhost visual check. `npm run dev -- --host 127.0.0.1 --port 5187` failed with `listen EPERM: operation not permitted 127.0.0.1:5187`, and the escalated retry was rejected by environment policy.

## Review Results

- Findings: none.
- Verified the Quick Action is disabled when no active selected chord exists or the selected chord already matches the capped 4-step target length.
- Verified reset derives the target from the core 4-step chord length capped by remaining selected Pattern A/B/C grid space.
- Verified reset routes through the existing selected-chord length update path, preserving root, quality, inversion, step, velocity, chance, selection, undo behavior, playback, export, sampling, imported audio, remote AI, accounts, analytics, and cloud sync boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected chord length reset to the core 4-step chord default. | Beginners need a safe way to recover after chord rhythm edits; producers need fast harmonic duration cleanup without changing chord identity. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected chord length reset Quick Action. |
| 2026-06-19 | harness_builder | Added selected chord length reset Quick Action through the existing selected-chord length update path. |
| 2026-06-19 | repo_cartographer | Updated README, product docs, quality rules, and static QA expectations for selected-chord length reset commands. |
| 2026-06-19 | quality_runner | Ran CLI QA suite; all documented non-browser checks passed. Localhost visual check was blocked by environment permissions. |
| 2026-06-19 | review_judge | Reviewed selected chord length reset implementation and found no follow-up defects. |
