# plan-610-mix-balance-decision-quick-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Add a Quick Actions Mix Balance Decision command so users can run the same current Mix Balance Preview Decision target from command search with explicit decision naming, result metrics, and follow-up labels while preserving the existing current-target and direct Mix Balance pad commands.

## Non-Goals

- Do not change Mix Balance pad definitions, mixer transformations, project schema, playback, WAV/stem export, snapshots, local draft recovery, or undo semantics.
- Do not add automatic mixing, platform loudness claims, auto-export, autoplay, reference audio, imported audio, sample browsing, chopping, sampler setup, remote AI, plugin hosting, cloud sync, accounts, analytics, payments, or background export.
- Do not remove the existing `mix-balance` current-target command or direct balance pad commands.

## Context Map

- `src/ui/App.tsx` builds Quick Actions, Mix Balance command routing, result metrics, and follow-up labels.
- `src/ui/workstationMixPanels.tsx` renders the visible Mix Balance Preview Decision action from `MixBalancePreviewSummary`.
- `src/ui/workstationShellPanels.tsx` lists Command Reference Mix entries.
- `README.md` and `docs/product/product.md` describe the sample-free mix/master/export workflow.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce local-first direct beat-making and UI token coverage.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Derive the Quick Actions command target only from the existing Mix Balance preview summary and explicit pad ids.
- Route the Quick Actions command only through the existing undoable Mix Balance pad apply path.

## Implementation Plan

- [x] Add a searchable Quick Actions command for the current Mix Balance Preview Decision target.
- [x] Reuse the existing Mix Balance preview summary for command title, detail, disabled state, and run target.
- [x] Ensure Quick Actions result/follow-up handling covers the new command with a distinct local metric.
- [x] Update README, product docs, quality rules, QA expectations, and Command Reference coverage.

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
| 2026-06-21 | `git diff --check` | passed; rerun passed after review ordering adjustment |
| 2026-06-21 | `python3 harness/scripts/run_qa.py` | passed; rerun passed after review ordering adjustment |
| 2026-06-21 | `npm run typecheck` | passed; rerun passed after review ordering adjustment |
| 2026-06-21 | `python3 harness/scripts/run_quality_gate.py` | passed; rerun passed after review ordering adjustment |
| 2026-06-21 | `npm run build` | passed with existing Vite large-chunk warning; rerun passed with same warning |
| 2026-06-21 | `npm run qa` | passed; rerun passed after review ordering adjustment |
| 2026-06-21 | `npm run verify` | passed with existing Vite large-chunk warning; rerun passed with same warning |
| 2026-06-21 | `npm run dev -- --host 127.0.0.1` | sandbox attempt failed with localhost `EPERM`; approved run served `http://127.0.0.1:5173/`; final rerun matched |
| 2026-06-21 | `curl -I http://127.0.0.1:5173/` | sandbox attempt could not connect; approved run returned `HTTP/1.1 200 OK`; final rerun matched |
| 2026-06-21 | post-move `git diff --check` | passed |
| 2026-06-21 | post-move `python3 harness/scripts/run_qa.py` | passed |
| 2026-06-21 | post-move active plan check | passed; `docs/exec_plans/active/.gitkeep` only |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-21 | review_judge | No blockers. The new decision command reuses the existing Mix Balance preview summary and undoable apply path, has distinct result/follow-up copy, keeps current/direct Mix Balance commands intact, and does not touch sampling, schema, playback, or export semantics. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Add Quick Actions Mix Balance Decision command. | The visible Mix Balance Preview Decision already identifies the current rough-balance target, but command-search users need an explicit decision command with traceable result metrics. |
| 2026-06-21 | Add the Mix Balance Decision row to Command Reference. | The command-search surface and read-only command map should expose the same explicit decision command name. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created after confirming main is clean, active plans are empty, and plan-609 completed at about 93.7% progress. |
| 2026-06-21 | harness_builder | Added the Mix Balance Decision Quick Action, distinct result/follow-up handling, Command Reference coverage, and matching docs/QA expectations without changing Mix Balance pad definitions or export/playback paths. |
| 2026-06-21 | quality_runner | Completed diff, harness, typecheck, quality gate, build, QA, verify, and dev server smoke validation. |
| 2026-06-21 | review_judge | Reviewed Quick Actions ordering, result metric/follow-up routing, Command Reference coverage, and local-first scope; no blockers found. |
| 2026-06-21 | doc_gardener | Moved the plan to completed, created the review mirror, and confirmed the active plan directory returned to `.gitkeep` only. |
