# plan-619-beat-map-structure-lens-quick-actions

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Expose the existing Beat Map and Structure Lens action buttons through Quick Actions so users can run the same explicit local workflow/arrangement actions from command search without changing recommendation derivation, project data paths, or sampling boundaries.

## Non-Goals

- Do not add new Beat Map or Structure Lens recommendations, scoring rules, metrics, or hidden automation.
- Do not change `runNextMove`, existing Next Move actions, arrangement transforms, delivery-target alignment, pattern-chain, master-finish, snapshot, or mix-review behavior.
- Do not store Beat Map or Structure Lens Quick Action state in project files, undo history, local draft recovery, or snapshots.
- Do not add sampling, imported audio, plugin hosting, remote AI, accounts, analytics, cloud sync, auto-run, autoplay, auto-save, or auto-export behavior.

## Context Map

- `src/ui/App.tsx` owns Beat Map actions, Structure Lens actions, Next Move action execution, Quick Actions, result metrics, and follow-up labels.
- `src/ui/workstationShellPanels.tsx` owns Command Reference rows.
- `README.md` and `docs/product/product.md` describe Beat Map, Structure Lens, and Quick Actions command coverage.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce explicit local action boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Quick Actions must route only through existing Beat Map/Structure Lens visible action paths and the existing `runNextMove` handler.

## Implementation Plan

- [x] Pass existing Beat Map and Structure Lens action arrays into Quick Actions.
- [x] Add Beat Map and Structure Lens Quick Actions that route through existing `runNextMove` execution and show local result feedback.
- [x] Add Command Reference, README/product, quality rule, and harness coverage for Beat Map/Structure Lens Quick Actions.

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
| 2026-06-21 | `git diff --check` | Passed. |
| 2026-06-21 | `python3 harness/scripts/run_qa.py` | Passed, `GrooveForge QA passed.` |
| 2026-06-21 | `npm run typecheck` | Passed. |
| 2026-06-21 | `python3 harness/scripts/run_quality_gate.py` | Passed, `GrooveForge quality gate passed.` |
| 2026-06-21 | `npm run build` | Passed; Vite emitted the existing chunk-size warning. |
| 2026-06-21 | `npm run qa` | Passed, `GrooveForge QA passed.` |
| 2026-06-21 | `npm run verify` | Passed; quality gate, runtime smoke, typecheck, and build completed. |
| 2026-06-21 | `npm run dev -- --host 127.0.0.1` | Sandbox attempt failed with `listen EPERM`; approved localhost run started Vite at `http://127.0.0.1:5173/`. |
| 2026-06-21 | `curl -I http://127.0.0.1:5173/` | Sandbox attempt could not connect; approved localhost check returned `HTTP/1.1 200 OK`. |
| 2026-06-21 | `git diff --check` | Passed after moving the plan to completed. |
| 2026-06-21 | `python3 harness/scripts/run_qa.py` | Passed after moving the plan to completed. |
| 2026-06-21 | `find docs/exec_plans/active -maxdepth 1 -type f -print` | Confirmed only `docs/exec_plans/active/.gitkeep` remains active. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-21 | review_judge | Passed. Beat Map and Structure Lens Quick Actions are derived from existing visible action arrays, route only through `onRunNextMove` / `runNextMove`, and reuse existing Next Move metric/follow-up derivation; no new scoring, auto-run, export, sampling, remote, or saved-state path was added. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Add Quick Actions for existing Beat Map and Structure Lens actions. | Command-search access helps first-time users find the next production step and lets working producers run overview/arrangement actions without leaving the keyboard, while preserving existing explicit action paths. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created after confirming `main` is clean, active plans are empty, and progress is 618/650 plans, about 95.1%. |
| 2026-06-21 | harness_builder | Added Quick Actions for existing Beat Map and Structure Lens action buttons, Command Reference rows, docs, quality rules, and harness coverage. |
| 2026-06-21 | quality_runner | Full QA plan passed, including dev server smoke after localhost approval. |
| 2026-06-21 | review_judge | Review passed with no follow-up findings. |
| 2026-06-21 | doc_gardener | Moved the plan to completed and created the review mirror. |
