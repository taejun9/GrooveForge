# plan-378-selected-note-length-reset

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add a direct Quick Action that resets the active selected 808/Synth note length to the current Keyboard Capture default length for that track inside the selected Pattern A/B/C slot.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new note engine.
- No note generation, melody rewriting, bassline rewriting, hidden generation, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting.
- No change to existing selected-note move, transpose, pitch reset, octave, length short/long, glide, velocity, chance, copy, paste, duplicate, delete, audition, or capture-default behavior.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected note Quick Action definitions and default length derivation.
- `src/ui/App.tsx`: existing selected note length update handler and Quick Actions wiring.
- `src/ui/workstationPatternTools.ts`: length clamping helpers.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected note edit QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep selected note length reset scoped to the selected Pattern A/B/C slot.
- Disable reset when no active selected note exists or the selected note already matches the current track Keyboard Capture default length.
- Route the reset through the existing undoable selected-note length update path.
- Keep the note selected after a successful edit.

## Implementation Plan

- [x] Inspect selected note length helpers and Quick Action definitions.
- [x] Add selected-note length reset Quick Action using the existing selected-note length update path.
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

QA completes before review starts. Review checks that selected note length reset is explicit, selected-pattern scoped, default-length only, undoable, selected-note preserving, and adds no sampling or remote scope.

## QA Results

- Pass: `python3 harness/scripts/run_qa.py`
- Pass: `python3 harness/scripts/run_quality_gate.py`
- Pass: `git diff --check`
- Pass: `npm run typecheck`
- Pass: `npm run harness:smoke`
- Pass: `npm run build`
- Pass: `npm run qa`
- Pass: `npm run verify`
- Blocked: localhost visual check. `npm run dev -- --host 127.0.0.1 --port 5185` failed with `listen EPERM: operation not permitted 127.0.0.1:5185`, and the escalated retry was rejected by environment policy.

## Review Results

- Findings: none.
- Verified the Quick Action is disabled when no active selected note exists or the selected note already matches the current track Keyboard Capture default length.
- Verified reset derives the target only from the selected note track's Keyboard Capture length default.
- Verified reset routes through the existing selected-note length update path, preserving step, pitch, glide, velocity, chance, selection, undo behavior, playback, export, sampling, imported audio, remote AI, accounts, analytics, and cloud sync boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected note length reset to Keyboard Capture defaults. | Beginners need a safe way to recover note duration edits; producers need faster articulation cleanup after shortening or extending notes. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected note length reset Quick Action. |
| 2026-06-19 | harness_builder | Added selected note length reset Quick Action through the existing selected-note length update path. |
| 2026-06-19 | repo_cartographer | Updated README, product docs, quality rules, and static QA expectations for selected-note length reset commands. |
| 2026-06-19 | quality_runner | Ran CLI QA suite; all documented non-browser checks passed. Localhost visual check was blocked by environment permissions. |
| 2026-06-19 | review_judge | Reviewed selected note length reset implementation and found no follow-up defects. |
