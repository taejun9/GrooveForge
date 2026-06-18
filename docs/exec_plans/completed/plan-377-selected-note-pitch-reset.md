# plan-377-selected-note-pitch-reset

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add a direct Quick Action that resets the active selected 808/Synth note pitch to the current Keyboard Capture default pitch for that track inside the selected Pattern A/B/C slot.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new note engine.
- No note generation, melody rewriting, bassline rewriting, hidden generation, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting.
- No change to existing selected-note move, transpose, octave, length, glide, velocity, chance, copy, paste, duplicate, delete, audition, or capture-default behavior.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected note Quick Action definitions and default pitch derivation.
- `src/ui/App.tsx`: selected note update handlers, Quick Actions wiring, selected note state, and keyboard capture defaults.
- `src/ui/workstationPatternTools.ts`: selected note matching and note update helpers.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected note edit QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep selected note pitch reset scoped to the selected Pattern A/B/C slot.
- Disable reset when no active selected note exists, the selected note already matches the track default pitch, or the default target step/pitch would collide with an existing note.
- Route the reset through the existing undoable selected-note update path.
- Keep the reset note selected after a successful edit.

## Implementation Plan

- [x] Inspect selected note pitch update helpers and Quick Action definitions.
- [x] Add selected-note pitch reset handler using the existing selected-note update path.
- [x] Add selected-note pitch reset Quick Action with safe disabled states.
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

QA completes before review starts. Review checks that selected note pitch reset is explicit, selected-pattern scoped, collision-safe, undoable, selected-note preserving, and adds no sampling or remote scope.

## QA Results

- Pass: `python3 harness/scripts/run_qa.py`
- Pass: `python3 harness/scripts/run_quality_gate.py`
- Pass: `git diff --check`
- Pass: `npm run typecheck`
- Pass: `npm run harness:smoke`
- Pass: `npm run build`
- Pass: `npm run qa`
- Pass: `npm run verify`
- Blocked: localhost visual check. `npm run dev -- --host 127.0.0.1 --port 5184` failed with `listen EPERM: operation not permitted 127.0.0.1:5184`, and the escalated retry was rejected by environment policy.

## Review Results

- Findings: none.
- Verified the Quick Action is disabled when no active selected note exists, the note already matches the default pitch, or the target step/pitch is occupied.
- Verified reset derives the target from current key, selected note track, and Keyboard Capture octave defaults.
- Verified reset routes through `moveSelectedNoteTo(selectedNote.step, defaultPitch, "Reset note pitch")`, preserving step, length, glide, velocity, chance, selection, undo behavior, playback, export, sampling, imported audio, remote AI, accounts, analytics, and cloud sync boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected note pitch reset to Keyboard Capture defaults. | Beginners need a safe way to recover pitch edits; producers need faster bass/melody cleanup after transposition experiments. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected note pitch reset Quick Action. |
| 2026-06-19 | harness_builder | Added selected note pitch reset Quick Action through the existing selected-note pitch update path. |
| 2026-06-19 | repo_cartographer | Updated README, product docs, quality rules, and static QA expectations for selected-note pitch reset commands. |
| 2026-06-19 | quality_runner | Ran CLI QA suite; all documented non-browser checks passed. Localhost visual check was blocked by environment permissions. |
| 2026-06-19 | review_judge | Reviewed selected note pitch reset implementation and found no follow-up defects. |
