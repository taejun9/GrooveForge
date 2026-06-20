# plan-597-arrangement-move-preview-decision-quick-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Add a Quick Actions Arrangement Move Preview Decision command so users can run the same current Drop, Build, Hook Lift, or Reset selected-block move recommendation from command search with the same readiness, selected-block scope, energy/mute impact, and next-check context shown in the visible Preview Decision Readout.

## Non-Goals

- Do not change Arrangement Move preset definitions, apply transforms, arrangement block schema, Arrangement Focus, Arrangement Arc, Arrangement Template, Pattern Chain, Section Locator, Song Form Overview, playback scheduling, export, MIDI, snapshots, local draft recovery, or undo semantics.
- Do not auto-run Arrangement Move actions, autoplay, auto-export, chain multiple commands, or persist preview/decision state in project data, localStorage, or undo history.
- Do not add imported audio, recording, sample browsing, chopping, sampler setup, sample-first onboarding, plugin hosting, remote AI, cloud sync, accounts, analytics, payments, or background export.

## Context Map

- `src/ui/App.tsx` builds Quick Actions, Arrangement Move priority/preview decision summaries, and Quick Action result/follow-up labels.
- `README.md` and `docs/product/product.md` describe the direct-composition arrangement workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce local-first direct beat-making and UI token coverage.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Derive the Quick Actions command target only from the existing Arrangement Move Preview Decision helper and current selected-block priority summary.
- Route the Quick Actions command only through the existing Arrangement Move apply handler.

## Implementation Plan

- [x] Add a searchable Quick Actions command for the current Arrangement Move Preview Decision.
- [x] Reuse the visible Preview Decision summary for command title, detail, disabled state, and run target.
- [x] Update Quick Actions result/follow-up handling for the new command.
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
| 2026-06-20 | `git diff --check` | passed after moving the plan to completed and creating the review mirror |
| 2026-06-20 | `python3 harness/scripts/run_qa.py` | passed after moving the plan to completed and creating the review mirror |
| 2026-06-20 | `find docs/exec_plans/active -maxdepth 1 -type f -print` | passed; active plans contain only `.gitkeep` |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-20 | review_judge | No blockers. The Quick Actions Arrangement Move Preview Decision command reuses the visible selected-block decision helper, routes only through the existing Arrangement Move apply handler, remains UI-local, and keeps direct arrangement editing primary. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add Quick Actions Arrangement Move Preview Decision command. | The visible Arrangement Move Preview Decision names the next selected-block energy/mute move, but command-search users need the same direct arrangement decision without leaving keyboard flow. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created after confirming main is clean, active plans are empty, and plan-596 completed at about 87.5% progress. |
| 2026-06-20 | harness_builder | Added the Quick Actions Arrangement Move Preview Decision command, existing apply-handler routing, result/follow-up labels, and matching docs/QA expectations. |
| 2026-06-20 | quality_runner | Completed QA, build, verify/runtime smoke, and dev server smoke. |
| 2026-06-20 | review_judge | Reviewed the completed changes with no blockers and confirmed direct arrangement editing remains primary. |
