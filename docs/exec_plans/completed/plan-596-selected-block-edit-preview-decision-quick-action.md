# plan-596-selected-block-edit-preview-decision-quick-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Add a Quick Actions Selected Block Edit Preview Decision command so users can run the same current selected-block copy, paste, duplicate, split, merge, move, or delete recommendation from command search with the same readiness, selected-block scope, structure impact, and next-check context shown in the visible Preview Decision Readout.

## Non-Goals

- Do not change selected-block edit handlers, arrangement block schema, Arrangement Move, Arrangement Focus, Arrangement Arc, Arrangement Template, Pattern Chain, Section Locator, Song Form Overview, playback scheduling, export, MIDI, snapshots, local draft recovery, or undo semantics.
- Do not auto-run selected-block edits, autoplay, auto-export, chain multiple commands, or persist preview/decision state in project data, localStorage, or undo history.
- Do not add imported audio, recording, sample browsing, chopping, sampler setup, sample-first onboarding, plugin hosting, remote AI, cloud sync, accounts, analytics, payments, or background export.

## Context Map

- `src/ui/App.tsx` builds Quick Actions, selected-block edit priority/preview decision summaries, and Quick Action result/follow-up labels.
- `README.md` and `docs/product/product.md` describe the direct-composition arrangement workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce local-first direct beat-making and UI token coverage.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Derive the Quick Actions command target only from the existing Selected Block Edit Preview Decision helper and current selected-block priority summary.
- Route the Quick Actions command only through the existing selected-block priority run handler.

## Implementation Plan

- [x] Add a searchable Quick Actions command for the current Selected Block Edit Preview Decision.
- [x] Reuse the visible Preview Decision summary for command title, detail, disabled state, and run target.
- [x] Update Quick Actions result/follow-up handling for the new command, including UI-local copy behavior.
- [x] Update README, product docs, quality rules, and QA expectations.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Dev server smoke attempt.

## Review Plan

QA completes before review starts.

## QA Log

| date | command | result |
|---|---|---|
| 2026-06-20 | `git diff --check` | passed |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | passed |
| 2026-06-20 | `npm run typecheck` | passed |
| 2026-06-20 | `python3 harness/scripts/run_quality_gate.py` | passed |
| 2026-06-20 | `npm run build` | passed with existing Vite large-chunk warning |
| 2026-06-20 | `npm run qa` | passed |
| 2026-06-20 | `npm run verify` | passed; runtime smoke covered 14/14 sample-free blueprints and 14/14 supported style profiles |
| 2026-06-20 | `npm run dev -- --host 127.0.0.1` | sandbox attempt failed with expected `listen EPERM`; approved local dev server started |
| 2026-06-20 | `curl -I http://127.0.0.1:5173/` | sandbox attempt could not connect; approved HEAD request returned `HTTP/1.1 200 OK` |
| 2026-06-20 | post-move `git diff --check` | passed |
| 2026-06-20 | post-move `python3 harness/scripts/run_qa.py` | passed |
| 2026-06-20 | post-move active plan check | passed; only `docs/exec_plans/active/.gitkeep` remains |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | no blockers; Quick Actions Selected Block Edit Preview Decision derives from the visible helper, routes through the existing selected-block priority handler, and keeps copy behavior UI-local |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add Quick Actions Selected Block Edit Preview Decision command. | The visible Preview Decision Readout names the safe next selected-block edit, but command-search users need the same direct arrangement decision without switching away from the keyboard. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming main is clean, active plans are empty, and plan-595 completed at about 87.0% progress. |
| 2026-06-20 | harness_builder | Added the Quick Actions Selected Block Edit Preview Decision command, existing handler routing, copy-result classification, follow-up labels, and matching docs/QA expectations. |
| 2026-06-20 | quality_runner | Completed QA, build, verify/runtime smoke, and dev server smoke. |
| 2026-06-20 | review_judge | Reviewed the completed changes with no blockers and confirmed direct arrangement editing remains primary. |
