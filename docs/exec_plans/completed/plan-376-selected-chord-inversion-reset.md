# plan-376-selected-chord-inversion-reset

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add a direct Quick Action for resetting the active selected chord inversion to root position inside the selected Pattern A/B/C slot.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new chord engine.
- No chord generation, progression replacement, reharmonization, chord quality changes, root changes, timing changes, hidden generation, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting.
- No change to existing selected-chord step, root, quality, inversion up/down, length, velocity, chance, copy, paste, duplicate, delete, audition, or reset behavior.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected chord Quick Action definitions.
- `src/ui/App.tsx`: selected chord update handlers, Quick Actions wiring, and selected chord state.
- `src/domain/workstation.ts`: chord event normalization helpers.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected chord edit QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep selected chord inversion reset scoped to the selected Pattern A/B/C slot.
- Disable reset when no active selected chord exists or the selected chord is already root position.
- Route the reset through the existing undoable selected chord update path.
- Keep the reset chord selected after a successful edit.

## Implementation Plan

- [x] Inspect selected chord inversion helpers and Quick Action definitions.
- [x] Add selected-chord inversion reset Quick Action.
- [x] Wire reset through existing selected chord inversion update path.
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

QA completes before review starts. Review checks that selected chord inversion reset is explicit, selected-pattern scoped, root-position only, disabled for no-op states, undoable, and adds no sampling or remote scope.

## QA Results

- Pass: `python3 harness/scripts/run_qa.py`
- Pass: `git diff --check`
- Pass: `npm run typecheck`
- Pass: `python3 harness/scripts/run_quality_gate.py`
- Pass: `npm run qa`
- Pass: `npm run harness:smoke`
- Pass: `npm run build`
- Pass: `npm run verify`
- Blocked: localhost visual check. `npm run dev -- --host 127.0.0.1 --port 5183` failed with `listen EPERM: operation not permitted 127.0.0.1:5183`, and the escalated retry was rejected by policy.

## Review Results

- Findings: none.
- Verified the Quick Action is disabled when no selected chord exists or the selected chord is already root position.
- Verified reset uses `updateChordEvent(selectedChordIndex, { inversion: 0 }, "Reset chord voicing")` and does not modify root, quality, timing, length, velocity, chance, playback, export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Verified README, product docs, quality rules, and static QA expectations describe the selected Pattern A/B/C scoped root-position reset.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected chord inversion reset after harmony actions. | Root-position reset is a common cleanup move for beginners and a fast voicing reset for producers after inversion experiments. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected chord inversion reset Quick Action. |
| 2026-06-19 | harness_builder | Added selected chord inversion reset Quick Action through the existing undoable chord inversion update path. |
| 2026-06-19 | repo_cartographer | Updated README, product docs, quality rules, and static QA expectations for selected-chord inversion reset commands. |
| 2026-06-19 | quality_runner | Ran CLI QA suite; all documented non-browser checks passed. Localhost visual check was blocked by environment permissions. |
| 2026-06-19 | review_judge | Reviewed selected chord inversion reset implementation and found no follow-up defects. |
