# plan-388-selected-drum-step-reset

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Add a direct Quick Action that snaps the active selected drum hit to the nearest valid 4-step beat-grid anchor in the same drum lane inside the selected Pattern A/B/C slot.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new drum engine.
- No lane, velocity, chance, microtiming, hat repeat, drum synthesis, generation, macros, sampling, imported audio, remote AI, cloud sync, analytics, accounts, plugin hosting, or payment changes.
- No change to existing selected-drum copy, paste, duplicate, beat duplicate, step move, velocity, chance, timing, hat repeat, delete, audition, Keyboard Capture, MIDI Input, note editing, or chord editing behavior.

## Context Map

- `src/ui/App.tsx`: selected drum move/reset paths and Quick Actions wiring.
- `src/ui/selectedEventQuickActions.ts`: selected drum Quick Action definitions and reset target derivation.
- `README.md`: public capability summary.
- `docs/product/product.md`: durable product feature description.
- `docs/quality/rules.md`: selected drum edit QA boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep selected drum step reset scoped to the selected Pattern A/B/C slot.
- Derive the target only from the selected drum lane, selected drum step, selected Pattern A/B/C drum hits, and existing 16-step grid.
- Snap only to the nearest 4-step anchor in the same lane when that lane/step is empty.
- Disable reset when no active selected drum hit exists, the selected drum hit is already on the target anchor, or the target same-lane step is occupied.
- Preserve lane, velocity, chance, microtiming, hat repeat, drum clipboard, playback, export, and manual drum controls.
- Keep the reset drum hit selected after a successful edit.

## Implementation Plan

- [x] Inspect selected-drum move, beat duplicate, and selected-event Quick Action helpers.
- [x] Add selected-drum step reset Quick Action using the existing undoable selected-pattern drum edit path.
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

| command | result | note |
|---|---|---|
| `python3 harness/scripts/run_qa.py` | pass | Static product, quality, and source expectations passed. |
| `python3 harness/scripts/run_quality_gate.py` | pass | Quality gate passed. |
| `git diff --check` | pass | No whitespace errors. |
| `npm run typecheck` | pass | Renderer and Electron TypeScript checks passed. |
| `npm run harness:smoke` | pass | Sample-free all-style 8-bar runtime smoke passed for 10 blueprints and 10 styles. |
| `npm run build` | pass | Production build passed; existing large-chunk warning remains. |
| `npm run qa` | pass | Static QA wrapper passed. |
| `npm run verify` | pass | Quality gate, runtime smoke, typecheck, and build passed. |
| `npm run dev -- --host 127.0.0.1 --port 5195` | blocked | Sandbox returned `listen EPERM`; escalated retry was rejected by environment policy, so no workaround was attempted. |

## Review Plan

QA completes before review starts. Review checks that selected drum step reset is explicit, selected-pattern scoped, undoable, selection-preserving, collision-aware, clipboard-safe, and adds no sampling, hidden generation, or remote scope.

## Review Results

No findings. The new Quick Action derives the target from the active selected drum lane, selected drum step, selected Pattern A/B/C drum hits, and 16-step beat grid; disables when the selected hit is already on the nearest 4-step anchor or the target is occupied; routes the write through the existing undoable selected-pattern drum edit path; preserves lane, velocity, chance, microtiming, hat repeat, and drum clipboard state; keeps the reset hit selected; and does not introduce sampling, hidden generation, remote AI, accounts, analytics, cloud sync, playback, or export changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add selected drum step reset to the nearest valid 4-step anchor. | Drum hit quantize/reset is a fast direct-composition correction for beginners and a precise rhythm cleanup move for producers. |
| 2026-06-19 | Reuse the selected-drum move-style data preservation path for reset. | Reset should move one selected hit while preserving pocket data and resetting the source step defaults, not rewrite a lane or quantize a pattern. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected drum step reset Quick Action. |
| 2026-06-19 | harness_builder | Added selected-drum step reset Quick Action, target derivation, and undoable reset handler. |
| 2026-06-19 | repo_cartographer | Updated README, product, quality, and static QA expectations for the step reset command. |
| 2026-06-19 | quality_runner | Ran QA suite; all required static, runtime, typecheck, build, QA, and verify checks passed. Dev-server binding remained blocked by sandbox policy. |
| 2026-06-19 | review_judge | Review completed with no findings. |
