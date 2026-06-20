# plan-606-sound-snapshot-decision-quick-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Add a Quick Actions Sound Snapshot Decision command so users can run the same current Sound Snapshot A/B capture or recall recommendation from command search with the same target, detail, next-check, and handler path shown in the visible Sound Snapshot readout action.

## Non-Goals

- Do not change Sound Snapshot scoring, comparison metrics, captured payloads, SoundDesign schema, playback, export behavior, snapshots, local draft recovery, or undo semantics.
- Do not auto-play, auto-export, import audio, analyze audio files, chain multiple tone actions, or persist Sound Snapshot Decision state in project data, localStorage, or undo history.
- Do not add recording, sample browsing, chopping, sampler setup, sample-first onboarding, plugin hosting, remote AI, cloud sync, accounts, analytics, payments, or background export.

## Context Map

- `src/ui/App.tsx` builds Quick Actions, Sound Snapshot handlers, and Quick Action result feedback.
- `src/ui/workstationComposePanels.tsx` renders the visible Sound Snapshot readout action and routes its action.
- `src/ui/workstationUiModel.ts` owns Sound Snapshot summary types.
- `README.md` and `docs/product/product.md` describe the sample-free sound-design workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce local-first direct beat-making and UI token coverage.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Derive the Quick Actions command target only from the existing Sound Snapshot summary and UI-local slot state.
- Route the Quick Actions command only through the existing Sound Snapshot capture/recall handlers.

## Implementation Plan

- [x] Add a searchable Quick Actions command for the current Sound Snapshot action target.
- [x] Reuse the visible Sound Snapshot summary for command title, detail, and run target.
- [x] Ensure Quick Actions result/follow-up handling covers the new command with a useful local metric.
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
| 2026-06-21 | `python3 harness/scripts/run_qa.py` | passed |
| 2026-06-21 | `npm run typecheck` | passed |
| 2026-06-21 | `python3 harness/scripts/run_quality_gate.py` | passed |
| 2026-06-21 | `npm run build` | passed with existing Vite large-chunk warning |
| 2026-06-21 | `npm run qa` | passed |
| 2026-06-21 | `npm run verify` | passed; runtime smoke covered 14/14 sample-free blueprints and 14/14 supported style profiles |
| 2026-06-21 | `npm run dev -- --host 127.0.0.1` | sandbox attempt failed with expected `listen EPERM`; approved local dev server started |
| 2026-06-21 | `curl -I http://127.0.0.1:5173/` | sandbox attempt could not connect; approved HEAD request returned `HTTP/1.1 200 OK` |
| 2026-06-21 | post-move `git diff --check` | passed |
| 2026-06-21 | post-move `python3 harness/scripts/run_qa.py` | passed |
| 2026-06-21 | post-move active plan check | passed; `docs/exec_plans/active/` contains only `.gitkeep` |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-21 | review_judge | No blockers. The Quick Actions Sound Snapshot Decision command reuses the existing Sound Snapshot summary, routes capture only through UI-local handlers, routes recall only through the existing undoable SoundDesign replacement path, and keeps Sound Snapshot state out of saved project data. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Add Quick Actions Sound Snapshot Decision command. | The visible Sound Snapshot readout already identifies the next capture/recall target, but command-search users need the same explicit tone-pass decision without leaving keyboard flow. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created after confirming main is clean, active plans are empty, and plan-605 completed at about 92.0% progress. |
| 2026-06-21 | harness_builder | Added the Quick Actions Sound Snapshot Decision command, visible summary routing, local result metrics, follow-up handling, and docs/QA expectations. |
| 2026-06-21 | quality_runner | Completed QA, build, verify/runtime smoke, and dev server smoke. |
| 2026-06-21 | review_judge | Completed review with no blockers and confirmed the change preserves local-first, sample-free sound-design scope. |
