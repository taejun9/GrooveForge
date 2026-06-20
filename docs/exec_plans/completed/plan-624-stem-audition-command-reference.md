# plan-624-stem-audition-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Align the Mix Command Reference row for Stem Audition Readout with the existing Stem Audition Decision and direct Stem Audition Quick Actions so beginners and producers can discover full-mix and stem comparison targets from the command map as well as from the mixer panel.

## Non-Goals

- Do not change Stem Audition readout derivation, pad behavior, decision targeting, mixer solo/mute updates, or result feedback.
- Do not change Quick Actions ranking, search, pinning, recents, command execution, playback behavior, render/export behavior, or keyboard shortcut handling.
- Do not store Command Reference filter/search/focus state in project data, undo history, local drafts, or snapshots.
- Do not add sampling, imported audio, plugin hosting, remote AI, accounts, analytics, cloud sync, auto-run, autoplay, auto-save, or auto-export behavior.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Stem Audition readout, decision, direct Quick Actions, and the existing Stem Audition pad path.
- `README.md` and `docs/product/product.md` describe Stem Audition Readout and command access.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Command Reference, readout, mixer, export, and Quick Actions boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Command Reference changes must reflect existing local Quick Actions/readouts only and must not alter command execution semantics.

## Implementation Plan

- [x] Update the Mix Command Reference row for Stem Audition Readout to show Quick Actions plus readout access.
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
| 2026-06-21 | `find docs/exec_plans/completed -maxdepth 1 -type f -name 'plan-*.md' \| wc -l` | Confirmed 624 completed plans. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-21 | review_judge | Passed. The implementation changes only the Command Reference Stem Audition Readout shortcut label plus aligned docs/harness text; readout derivation, decision/direct Stem Audition command execution, mixer solo/mute updates, playback, render/export, sampling, remote, and automation behavior were not changed. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Treat Stem Audition Readout as both a readout and Quick Actions command-reference entry. | The app already exposes Stem Audition Decision and direct stem audition commands; the command map should help beginners compare full mix/stems and let producers reach mix audition checks quickly without changing mixer or export behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created after confirming `main` is clean, active plans are empty, and progress is 623/650 plans, about 95.8%. |
| 2026-06-21 | harness_builder | Aligned the Mix Command Reference Stem Audition Readout row, README/product wording, quality rule, and harness coverage with the existing Stem Audition Decision and direct Stem Audition commands. |
| 2026-06-21 | quality_runner | Full QA plan passed, including runtime smoke through `npm run verify`. |
| 2026-06-21 | review_judge | Review passed with no follow-up findings. |
| 2026-06-21 | doc_gardener | Moved the plan to completed and created the review mirror. |
