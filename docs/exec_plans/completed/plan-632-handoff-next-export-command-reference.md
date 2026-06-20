# plan-632-handoff-next-export-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre beat-making workstation for both working producers and first-time composers. Keep direct beat composition primary and sampling secondary. Report completion progress after each finished plan and give a 10-plan progress report every 10 completed plans.

## Goal

Align the Deliver Command Reference row for Handoff Next Export with the existing Handoff Pack Send Order next-step readout and Quick Actions next-export command so beginners and producers can discover the current next deliverable while export still runs only after an explicit command click.

## Non-Goals

- Do not change Handoff Pack item statuses, send-order derivation, latest receipt behavior, export handlers, file contents, file names, render/download handlers, MIDI bytes, Handoff Sheet contents, playback, save/load, snapshots, or export click semantics.
- Do not change Quick Actions ranking, search, pinning, recents, command execution beyond the existing next-export command path, direct export commands, Handoff Package Check, Handoff Manifest Audit, Handoff Export Receipt, or Export Format Readout behavior.
- Do not store Command Reference filter/search/focus state in project data, undo history, local drafts, or snapshots.
- Do not add batch export, auto-export, zip packaging, native folder writing, background rendering, media upload, platform compliance, publishing, licensing, sampling, imported audio, plugin hosting, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Handoff Pack Send Order, Handoff Next Export command routing, direct export commands, receipt updates, and explicit export handlers.
- `README.md` and `docs/product/product.md` describe Handoff Pack Send Order and the next handoff export command.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce Command Reference, Handoff Pack, export safety, and local-first boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition, arrangement, sound design, mix/master, and export; sampling stays secondary and out of this plan.
- Command Reference changes must reflect existing local Quick Actions/readouts only and must not alter export file contents, command execution semantics, playback, render, project schema, or export safety boundaries.

## Implementation Plan

- [x] Update the Deliver Command Reference row for Handoff Next Export to show Quick Actions plus readout access.
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
| 2026-06-21 | `find docs/exec_plans/completed -maxdepth 1 -type f -name 'plan-*.md' \| wc -l` | Confirmed 632 completed plans. |

## Review Log

| date | reviewer | result |
|---|---|---|
| 2026-06-21 | review_judge | Passed. The implementation changes only the Command Reference Handoff Next Export shortcut label plus aligned docs/harness text; Handoff Pack item statuses, send order, latest receipt, export handlers, file contents, file names, render/download handlers, MIDI bytes, Handoff Sheet contents, playback, project schema, command execution, sampling, remote, and batch-export behavior were not changed. |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Treat Handoff Next Export as a readout-backed Quick Actions command-reference entry. | The app already derives the next export target from the Handoff Pack Send Order readout and runs only that deliverable after an explicit command click; the command map should help beginners find the next file and let producers scan handoff order quickly without enabling batch export or changing file output. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created after confirming `main` is clean, active plans are empty, and progress is 631/650 plans, about 97.1%. |
| 2026-06-21 | harness_builder | Aligned the Deliver Command Reference Handoff Next Export row, README/product wording, quality rule, and harness coverage with the existing next-deliverable readout and explicit export boundary. |
| 2026-06-21 | quality_runner | Full QA plan passed, including runtime smoke through `npm run verify`. |
| 2026-06-21 | review_judge | Review passed with no follow-up findings. |
| 2026-06-21 | doc_gardener | Moved the plan to completed and created the review mirror. |
