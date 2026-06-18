# plan-379-selected-note-glide-reset

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add a direct Quick Action that resets the active selected 808 note glide state to the current Keyboard Capture 808 glide default inside the selected Pattern A/B/C slot.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new note engine.
- No Synth glide behavior, whole-bassline glide rewrite, note generation, hidden generation, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting.
- No change to existing selected-note move, transpose, pitch reset, octave, length, length reset, glide toggle, velocity, chance, copy, paste, duplicate, delete, audition, or capture-default behavior.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected note Quick Action definitions and default glide derivation.
- `src/ui/App.tsx`: existing selected note glide update handler and Quick Actions wiring.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected note edit QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep selected note glide reset scoped to the selected Pattern A/B/C slot.
- Disable reset when no active selected 808 note exists or the selected 808 note already matches the current Keyboard Capture 808 glide default.
- Route the reset through the existing undoable selected-note glide update path.
- Keep the note selected after a successful edit.

## Implementation Plan

- [x] Inspect selected note glide helpers and Quick Action definitions.
- [x] Add selected-note glide reset Quick Action using the existing selected-note glide update path.
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

QA completes before review starts. Review checks that selected note glide reset is explicit, selected-pattern scoped, 808-only, default-glide only, undoable, selected-note preserving, and adds no sampling or remote scope.

## QA Results

- Pass: `python3 harness/scripts/run_qa.py`
- Pass: `python3 harness/scripts/run_quality_gate.py`
- Pass: `git diff --check`
- Pass: `npm run typecheck`
- Pass: `npm run harness:smoke`
- Pass: `npm run build`
- Pass: `npm run qa`
- Pass: `npm run verify`
- Blocked: localhost visual check. `npm run dev -- --host 127.0.0.1 --port 5186` failed with `listen EPERM: operation not permitted 127.0.0.1:5186`, and the escalated retry was rejected by environment policy.

## Review Results

- Findings: none.
- Verified the Quick Action is disabled when no active selected 808 note exists or the selected 808 note already matches the current Keyboard Capture 808 glide default.
- Verified reset derives the target only from `keyboardCaptureDefaults.bass.glide`.
- Verified reset routes through the existing selected-note glide update path, preserving step, pitch, length, velocity, chance, selection, undo behavior, playback, export, sampling, imported audio, remote AI, accounts, analytics, and cloud sync boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected 808 note glide reset to Keyboard Capture defaults. | Beginners need a safe way to recover 808 slide experiments; producers need faster low-end articulation cleanup after toggling glide. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected 808 note glide reset Quick Action. |
| 2026-06-19 | harness_builder | Added selected 808 note glide reset Quick Action through the existing selected-note glide update path. |
| 2026-06-19 | repo_cartographer | Updated README, product docs, quality rules, and static QA expectations for selected-note glide reset commands. |
| 2026-06-19 | quality_runner | Ran CLI QA suite; all documented non-browser checks passed. Localhost visual check was blocked by environment permissions. |
| 2026-06-19 | review_judge | Reviewed selected note glide reset implementation and found no follow-up defects. |
