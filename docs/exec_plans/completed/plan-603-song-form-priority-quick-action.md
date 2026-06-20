# plan-603-song-form-priority-quick-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Add a Quick Actions Song Form Priority command so users can run the same current highest-priority Song Form Overview block navigation target from command search with the same metric, reason, next-check, disabled state, and target shown in the visible Priority Readout.

## Non-Goals

- Do not change Song Form metric scoring, section detection, arrangement block schema, Pattern Chain, Arrangement Template, Arrangement Arc, Arrangement Focus, Arrangement Move, Section Locator, playback scheduling, export, MIDI, snapshots, local draft recovery, or undo semantics.
- Do not auto-select during render, autoplay, auto-edit, auto-export, chain multiple commands, or persist Song Form priority state in project data, localStorage, or undo history.
- Do not add imported audio, recording, sample browsing, chopping, sampler setup, sample-first onboarding, plugin hosting, remote AI, cloud sync, accounts, analytics, payments, or background export.

## Context Map

- `src/ui/App.tsx` builds Quick Actions, Song Form Overview summaries, visible Song Form Priority actions, and selected-block navigation.
- `README.md` and `docs/product/product.md` describe the direct-composition arrangement workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce local-first direct beat-making and UI token coverage.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Derive the Quick Actions command target only from the existing Song Form Priority summary and visible Song Form metrics.
- Route the Quick Actions command only through the existing selected arrangement block navigation path.

## Implementation Plan

- [x] Add a searchable Quick Actions command for the current Song Form Priority target.
- [x] Reuse the visible Priority summary for command title, detail, disabled state, and run target.
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
| 2026-06-21 | `git diff --check` | passed |
| 2026-06-21 | `python3 harness/scripts/run_qa.py` | failed, then passed after adding the README expectation update and exact Quick Actions Song Form Priority app token |
| 2026-06-21 | `npm run typecheck` | passed |
| 2026-06-21 | `python3 harness/scripts/run_quality_gate.py` | passed |
| 2026-06-21 | `npm run build` | passed with existing Vite large-chunk warning |
| 2026-06-21 | `npm run qa` | passed |
| 2026-06-21 | `npm run verify` | passed; runtime smoke covered 14/14 sample-free blueprints and 14/14 supported style profiles |
| 2026-06-21 | `npm run dev -- --host 127.0.0.1` | sandbox attempt failed with expected `listen EPERM`; approved local dev server started |
| 2026-06-21 | `curl -I http://127.0.0.1:5173/` | sandbox attempt could not connect; approved HEAD request returned `HTTP/1.1 200 OK` |
| 2026-06-21 | `git diff --check` | passed after moving the plan to completed and creating the review mirror |
| 2026-06-21 | `python3 harness/scripts/run_qa.py` | passed after moving the plan to completed and creating the review mirror |
| 2026-06-21 | `find docs/exec_plans/active -maxdepth 1 -type f -print` | passed; active plans contain only `.gitkeep` |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-21 | review_judge | No blockers. The Quick Actions Song Form Priority command reuses the visible priority summary, routes only through existing selected-block navigation, remains UI-local, and keeps direct arrangement composition primary. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Add Quick Actions Song Form Priority command. | The visible Song Form Priority readout already identifies the current full-song arrangement navigation target, but command-search users need the same explicit direct-composition action without leaving keyboard flow. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created after confirming main is clean, active plans are empty, and plan-602 completed at about 90.5% progress. |
| 2026-06-21 | harness_builder | Added the Quick Actions Song Form Priority command, visible priority-summary routing, UI-local focus result handling, and docs/QA expectations. |
| 2026-06-21 | quality_runner | Completed QA, build, verify/runtime smoke, and dev server smoke. |
| 2026-06-21 | review_judge | Reviewed the completed changes with no blockers and confirmed Song Form navigation remains a direct-composition workflow. |
