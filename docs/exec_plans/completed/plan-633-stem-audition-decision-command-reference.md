# plan-633-stem-audition-decision-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Align the Mix Command Reference row for Stem Audition Decision with the existing Stem Audition Decision Readout and Quick Actions decision command so beginners and producers can discover the next Full Mix or stem comparison target before changing mixer audition state.

## Non-Goals

- Do not change Stem Audition pad definitions, decision target derivation, readout labels, result labels, disabled-state rules, mixer solo/mute update behavior, playback behavior, render/export behavior, project schema, save/load, snapshots, or keyboard shortcut handling.
- Do not change Quick Actions ranking, search, pinning, recents, command execution beyond the existing decision command path, direct Stem Audition commands, Stem Audition Readout, Mix Balance, Mix Coach, Master Finish, or Handoff Pack behavior.
- Do not store Command Reference filter/search/focus state in project data, undo history, local drafts, or snapshots.
- Do not add rendered stem playback, stem separation, sampling, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, cloud sync, auto-run, autoplay, auto-mix, auto-export, or hidden mastering behavior.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Stem Audition Readout, Decision Readout action, Quick Actions decision/direct stem commands, and undoable Stem Audition pad application through mixer solo/mute state.
- `README.md` and `docs/product/product.md` describe Stem Audition readouts and command access.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Command Reference, Stem Audition, playback/export, and local-first boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Command Reference changes must reflect existing local Quick Actions/readouts only and must not alter Stem Audition application, command execution semantics, playback, render/export, project schema, or mixer safety boundaries.

## Implementation Plan

- [x] Update the Mix Command Reference row for Stem Audition Decision to show Quick Actions plus readout access.
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
| 2026-06-21 | `find docs/exec_plans/completed -maxdepth 1 -type f -name 'plan-*.md' \| wc -l` | Confirmed 633 completed plans. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-21 | review_judge | Passed. The implementation changes only the Command Reference Stem Audition Decision shortcut label plus aligned docs/harness text; Stem Audition pad definitions, decision target derivation, mixer solo/mute updates, playback, render/export, project schema, command execution, sampling, remote, rendered-stem playback, and stem-separation behavior were not changed. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Treat Stem Audition Decision as a readout-backed Quick Actions command-reference entry. | The app already exposes the next Full Mix or stem comparison target through a UI-local Decision Readout and explicit Quick Actions decision command; the command map should help beginners hear the right lane and let producers scan audition posture quickly without changing playback/export or project schema. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created after confirming `main` is clean, active plans are empty, and progress is 632/650 plans, about 97.2%. |
| 2026-06-21 | harness_builder | Aligned the Mix Command Reference Stem Audition Decision row, README/product wording, quality rule, and harness coverage with the existing next-audition readout and explicit Stem Audition pad path. |
| 2026-06-21 | quality_runner | Full QA plan passed, including runtime smoke through `npm run verify`. |
| 2026-06-21 | review_judge | Review passed with no follow-up findings. |
| 2026-06-21 | doc_gardener | Moved the plan to completed and created the review mirror. |
