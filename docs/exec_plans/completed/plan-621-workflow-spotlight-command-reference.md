# plan-621-workflow-spotlight-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Align the Guide Command Reference row for Workflow Spotlight with the existing Quick Actions focus command so beginners and producers can discover the current workflow target from the command map as well as from the readout.

## Non-Goals

- Do not change Workflow Spotlight scoring, target derivation, jump behavior, or result feedback.
- Do not change Quick Actions ranking, search, pinning, recents, command execution, or keyboard shortcut handling.
- Do not store Command Reference filter/search/focus state in project data, undo history, local drafts, or snapshots.
- Do not add sampling, imported audio, plugin hosting, remote AI, accounts, analytics, cloud sync, auto-run, autoplay, auto-save, or auto-export behavior.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `README.md` and `docs/product/product.md` describe Workflow Spotlight and Command Reference coverage.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Command Reference and Quick Actions boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Command Reference changes must reflect existing local Quick Actions only and must not alter command execution semantics.

## Implementation Plan

- [x] Update the Guide Command Reference row for Workflow Spotlight to show Quick Actions access.
- [x] Align README/product/quality/harness coverage with the command-map wording.
- [x] Complete QA, review, completed-plan move, and review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

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
| 2026-06-21 | `git diff --check` | Passed after moving the plan to completed. |
| 2026-06-21 | `python3 harness/scripts/run_qa.py` | Passed after moving the plan to completed. |
| 2026-06-21 | `find docs/exec_plans/active -maxdepth 1 -type f -print` | Confirmed only `docs/exec_plans/active/.gitkeep` remains active. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-21 | review_judge | Passed. The implementation changes only the Command Reference Workflow Spotlight shortcut label plus aligned docs/harness text; Workflow Spotlight derivation, jump behavior, Quick Actions execution, project data, playback, render/export, sampling, remote, and automation behavior were not changed. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Treat Workflow Spotlight as both a readout and Quick Actions command-reference entry. | The app already exposes a Workflow Spotlight focus command; the command map should help beginners find the current stage and let producers jump there quickly without changing project data. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created after confirming `main` is clean, active plans are empty, and progress is 620/650 plans, about 95.4%. |
| 2026-06-21 | harness_builder | Aligned the Guide Command Reference Workflow Spotlight row, README/product wording, quality rule, and harness coverage with the existing Quick Actions focus command. |
| 2026-06-21 | quality_runner | Full QA plan passed, including runtime smoke through `npm run verify`. |
| 2026-06-21 | review_judge | Review passed with no follow-up findings. |
| 2026-06-21 | doc_gardener | Moved the plan to completed and created the review mirror. |
