# plan-703-finish-checklist-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Finish Checklist in the Finish section of Command Reference as a readout-backed finish-readiness entry so users can discover local Compose, Arrange, Mix, Master, Master Automation, and Handoff readiness, the Priority Readout, Finish Checklist focus command, direct card commands, and local Focus Result feedback while preparing an export.

## Non-Goals

- Do not change Finish Checklist scoring, card order, focus target derivation, Priority Readout derivation, visible priority action routing, Quick Actions execution, direct card command routing, Focus Result labels, or disabled-state behavior.
- Do not change Compose, Arrange, Mix, Master, Master Automation, Handoff Pack, Export Preflight, Review Queue, Beat Readiness, Structure Lens, Mix Coach, Delivery Target, Session Brief, save/load, snapshots, undo/redo history, render/export, MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add auto-fixes, auto-mastering, auto-export, tutorials, macros, command chains, audio analysis, imported audio, sampling, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` owns Finish Checklist summaries, focus routing, priority action, Quick Actions commands, and local Focus Result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-703-finish-checklist-command-reference` and `.worktree/plan-703-finish-checklist-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add a Finish Checklist row to the Finish Command Reference section as a readout-backed entry.
- [x] Add README/product/quality notes that describe Finish Checklist command-map coverage without changing finish scoring or focus routing.
- [x] Add harness expectations that pin the row and local-only finish-readiness boundaries.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Finish Checklist scoring, focus routing, export, remote, and sampling boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Finish Checklist as a Finish Command Reference row. | Export readiness is a core beat-completion workflow for beginners and working producers, and the command map should surface the existing local finish-readiness scan without changing finish behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Finish Checklist Command Reference coverage. |
| 2026-06-25 | harness_builder | Added Finish Checklist as a Finish Command Reference row and pinned README/product/quality/harness coverage without changing finish scoring or focus routing. |
| 2026-06-25 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`. Runtime smoke covered 14/14 blueprints and 14/14 style profiles. |
| 2026-06-25 | review_judge | Review passed with no findings; scope stayed limited to Command Reference/docs/harness coverage and preserved Finish Checklist scoring, focus routing, export, remote, and sampling boundaries. |

## Completion Notes

- Finish Checklist now appears in the Finish Command Reference section as a readout-backed entry.
- README, product, quality, and harness coverage document existing Compose, Arrange, Mix, Master, Master Automation, and Handoff readiness, Priority Readout, focus command, direct card commands, and local Focus Result feedback.
- No Finish Checklist scoring, focus routing, project data, playback, render/export, remote, or sampling behavior changed.
