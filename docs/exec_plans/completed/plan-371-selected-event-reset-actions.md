# plan-371-selected-event-reset-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add direct Quick Actions for resetting selected-event variation edits back to reliable defaults: selected 808/Synth note chance to 100%, selected drum timing to grid, selected drum chance to 100%, selected hat repeat to 1x, and selected chord chance to 100%.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new audio engines.
- No bulk reset, whole-pattern quantize, automatic humanization, hidden generation, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting.
- No change to existing velocity, length, glide, copy/paste/duplicate/delete, audition, keyboard shortcut, native menu, or selected-block behavior.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected note, drum, and chord command definitions.
- `src/ui/App.tsx`: selected event chance/timing/hat-repeat update handlers and Quick Actions wiring.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected-event reset QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Route reset commands through existing selected-event update handlers.
- Keep actions scoped to the selected Pattern A/B/C slot and disabled when no active selected event exists or when the event is already at the reset value.
- Keep reset values explicit: music chance `100%`, drum chance `100%`, drum timing `On grid`, and hat repeat `1x`.

## Implementation Plan

- [x] Add selected-note chance reset Quick Action.
- [x] Add selected-drum timing, chance, and hat-repeat reset Quick Actions.
- [x] Add selected-chord chance reset Quick Action.
- [x] Wire commands through existing handlers in `App.tsx` without new state.
- [x] Update README, product docs, quality rules, and static QA expectations.

## QA Plan

- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `git diff --check` passed.
- `npm run typecheck` passed.
- `npm run harness:smoke` passed: 10/10 Beat Blueprints and 10/10 style profiles.
- `npm run build` passed.
- `npm run qa` passed.
- `npm run verify` passed.
- Browser/dev-server visual check attempted with `npm run dev -- --host 127.0.0.1 --port 5178`; sandboxed run failed with `listen EPERM`, and escalated retry was rejected by environment policy.

## Review Plan

QA completes before review starts. Review checks that reset commands are explicit, scoped to the selected Pattern A/B/C slot, disabled when no-op or unsafe, reuse existing update handlers, preserve manual editing and undo semantics, and add no sampling or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected-event reset commands after delete/edit commands. | Fast reset helps beginners recover from chance/timing experiments and lets producers normalize selected events without leaving command search. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected-event reset Quick Actions. |
| 2026-06-19 | harness_builder | Added selected-note chance, selected-drum chance/timing/hat-repeat, and selected-chord chance reset Quick Actions through existing update handlers. |
| 2026-06-19 | quality_runner | QA, quality gate, diff check, typecheck, smoke, build, qa, and verify passed; localhost visual QA was blocked by environment policy. |
| 2026-06-19 | review_judge | Reviewed reset values, no-op disabled states, selected Pattern scope, existing handler reuse, and non-sampling boundary; no blocking findings. |

## Completion Notes

Completed. Selected 808/Synth note chance and selected chord chance now reset to 100% from Quick Actions. Selected drum chance resets to 100%, selected drum timing resets to On grid, and selected hat repeat resets to 1x. All reset commands reuse existing selected-event update handlers, stay scoped to the selected Pattern A/B/C slot, disable when already at the reset value, and avoid schema, playback, render/export, sampling, imported audio, or remote scope changes.
