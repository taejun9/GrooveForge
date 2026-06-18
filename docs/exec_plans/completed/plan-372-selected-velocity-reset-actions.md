# plan-372-selected-velocity-reset-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add direct Quick Actions for resetting selected-event velocity to useful defaults: selected 808/Synth note velocity to the current Keyboard Capture default for that track, selected drum hit velocity to the lane/step drum default, and selected chord velocity to the core chord default.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new audio engines.
- No bulk normalization, whole-pattern velocity reset, automatic mixing, hidden generation, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting.
- No change to existing velocity up/down commands, chance/timing/repeat reset commands, copy/paste/duplicate/delete, audition, keyboard shortcut, native menu, or selected-block behavior.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected note, drum, and chord command definitions.
- `src/ui/App.tsx`: Quick Actions input wiring and selected event velocity update handlers.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected-event velocity reset QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Route reset commands through existing selected-event velocity update handlers.
- Keep actions scoped to the selected Pattern A/B/C slot and disabled when no active selected event exists or when the event is already at the reset velocity.
- Keep reset values explicit: note velocity uses the current Keyboard Capture default for 808 or Synth, drum velocity uses `defaultDrumVelocity(lane, step)`, and chord velocity uses 50%.

## Implementation Plan

- [x] Pass Keyboard Capture note defaults into selected-event Quick Actions.
- [x] Add selected-note velocity reset Quick Action.
- [x] Add selected-drum velocity reset Quick Action.
- [x] Add selected-chord velocity reset Quick Action.
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

## QA Results

- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `git diff --check`
- Passed: `npm run typecheck`
- Passed: `npm run harness:smoke`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Blocked by environment policy: `npm run dev -- --host 127.0.0.1 --port 5179` failed with `listen EPERM`; escalated retry was rejected, so browser/dev-server visual QA was not run.

## Review Plan

QA completes before review starts. Review checks that velocity reset commands are explicit, scoped to the selected Pattern A/B/C slot, disabled when no-op or unsafe, reuse existing velocity update handlers, preserve manual editing and undo semantics, and add no sampling or remote scope.

## Review Results

- No findings. The selected note, drum, and chord velocity reset commands use existing selected-event velocity update handlers, disable missing/no-op selections, stay scoped to the selected Pattern A/B/C slot, and add no sampling, imported audio, remote AI, analytics, account, or cloud scope.
- Residual risk: browser/dev-server visual QA could not run because localhost listen was blocked by the environment.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected velocity reset commands after chance/timing reset. | Fast velocity reset helps beginners recover from over-editing dynamics and gives producers a direct way to normalize one event without flattening the whole pattern. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected velocity reset Quick Actions. |
| 2026-06-19 | harness_builder | Added selected note/drum/chord velocity reset commands, wired note defaults from Keyboard Capture, and documented/reset QA expectations. |
| 2026-06-19 | quality_runner | QA passed through run_qa, quality_gate, diff check, typecheck, runtime smoke, build, npm qa, and verify; dev server visual QA was blocked by environment policy. |
| 2026-06-19 | review_judge | Post-QA review found no code issues and documented the localhost visual QA residual risk. |
