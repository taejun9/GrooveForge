# plan-370-selected-event-delete-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add direct Quick Actions for deleting the selected 808/Synth note, selected drum hit, and selected chord so command-palette users can remove mistakes through the same undoable selected-event deletion paths as keyboard shortcuts and the native menu.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new audio engines.
- No bulk delete, lasso selection, multi-select editing, destructive filesystem commands, command chains, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, or plugin hosting.
- No change to existing Backspace/Delete shortcut behavior, native menu delete behavior, selected-block delete behavior, clipboard behavior, audition behavior, or Pattern A/B/C independence.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: selected note, drum, and chord command definitions.
- `src/ui/App.tsx`: selected-event deletion handlers and Quick Actions wiring.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected-event delete QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Route selected note deletion through the existing selected-note deletion path.
- Route selected drum deletion through the existing selected-drum clear path.
- Route selected chord deletion through the existing selected-chord deletion path and preserve the one-chord minimum guard.
- Keep actions scoped to the selected Pattern A/B/C slot and disabled when no active selected event exists.

## Implementation Plan

- [x] Add selected-note delete Quick Action with active-event disabled state.
- [x] Add selected-drum delete Quick Action with active-hit disabled state.
- [x] Add selected-chord delete Quick Action with active-event and one-chord-minimum disabled states.
- [x] Wire the new actions through existing handlers in `App.tsx`.
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
- Browser/dev-server visual check attempted with `npm run dev -- --host 127.0.0.1 --port 5177`; sandboxed run failed with `listen EPERM`, and escalated retry was rejected by environment policy.

## Review Plan

QA completes before review starts. Review checks that selected-note/drum/chord delete commands are explicit, disabled when unsafe, scoped to the selected Pattern A/B/C slot, reuse existing undoable deletion handlers, preserve one-chord minimum behavior, keep copy/audition semantics unchanged, and add no sampling or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add command-palette delete commands instead of a new delete surface. | Deletion already exists through keyboard and native menu paths; command access removes workflow friction for producers and makes the same recovery path discoverable for beginners. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected event delete Quick Actions. |
| 2026-06-19 | repo_cartographer | Confirmed the product framing remains all-genre direct beat creation first, with sampling still secondary and guarded in docs/QA. |
| 2026-06-19 | harness_builder | Added selected-note, selected-drum, and selected-chord delete Quick Actions through existing undoable deletion paths. |
| 2026-06-19 | quality_runner | QA, quality gate, diff check, typecheck, smoke, build, qa, and verify passed; localhost visual QA was blocked by environment policy. |
| 2026-06-19 | review_judge | Reviewed selected Pattern scope, handler reuse, disabled states, one-chord minimum preservation, and non-sampling boundary; no blocking findings. |

## Completion Notes

Completed. Selected 808/Synth notes, selected drum hits, and selected chords now expose direct delete Quick Actions. The actions reuse the existing selected-event deletion handlers, stay scoped to the selected Pattern A/B/C slot, disable when no active selected event exists, and preserve the one-chord minimum guard. README, product docs, quality rules, and static QA expectations describe and guard the expanded selected-event delete surface. No project schema, playback scheduling, render/export, sampling, imported audio, or remote scope changed.
