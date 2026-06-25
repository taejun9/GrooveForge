# plan-717-guide-completion-bottleneck

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Expose a read-only Guide Quick Start completion bottleneck label that identifies the lowest Path, Session, or Workflow readiness lane so users can immediately see the next direct beat-making focus after scanning the completion score.

## Non-Goals

- Do not change Guide Quick Start scoring weights, target priority, run behavior, command routing, pinned-command behavior, Quick Actions ordering, or Quick Actions filtering.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run behavior, automatic fixes, autoplay, auto-save, or auto-export.
- Do not change project schema, save/load, undo/redo, playback scheduling, render/export bytes, MIDI export, Handoff Pack, Handoff Sheet, or Command Reference execution.
- Do not add sampling, imported audio, audio clips, sampler devices, sample browsing, remote AI, accounts, analytics, cloud sync, platform compliance, or publishing/licensing claims.

## Context Map

- `src/ui/workstationGuidancePanels.tsx` derives and renders Guide Quick Start completion score and breakdown.
- `src/ui/App.tsx` creates the `guide-quick-start` Quick Action target and completion metadata.
- `src/ui/workstationShellPanels.tsx` renders the Quick Actions guide suggestion card.
- `src/styles.css` owns Guide Quick Start and Quick Actions guide suggestion layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` pin product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-717-guide-completion-bottleneck` and `.worktree/plan-717-guide-completion-bottleneck` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Derive a display-only bottleneck label from the same Path, Session, and Workflow completion breakdown items.
- [x] Render the bottleneck label in Guide Quick Start and pass it through the Quick Actions guide suggestion metadata.
- [x] Update docs and harness expectations to pin the UI-local, non-mutating, sample-free scope.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that bottleneck labels are derived from existing Guide Quick Start completion breakdown state, remain display-only, preserve existing scoring/routing, and do not change project data, playback, export, remote behavior, or sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Add a Guide Quick Start completion bottleneck label. | Completion percentages are useful, but beginners and producers need one explicit lowest lane to prioritize the next direct beat-making pass. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Guide Quick Start completion bottleneck. |
| 2026-06-25 | harness_builder | Added a read-only Guide Quick Start completion bottleneck label to the workstation strip and Quick Actions guide suggestion metadata. |
| 2026-06-25 | quality_runner | Ran git diff --check, run_qa.py, typecheck, quality gate, build, npm QA, and verify; all passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles. |
| 2026-06-25 | review_judge | Review found no issues: bottleneck labels are derived from existing completion breakdown items and no scoring, routing, project data, playback, export, remote, or sampling behavior changed. |

## Completion Notes

- Added a read-only completion bottleneck label derived from the lowest Path, Session, or Workflow breakdown lane.
- Displayed the bottleneck label in Guide Quick Start and included it in Quick Actions guide suggestion metadata.
- Preserved Guide scoring, guide target selection, explicit Run and Pin/Unpin controls, Quick Actions filtering, and command execution.
- Updated README, product rules, quality rules, and QA harness expectations to pin the completion/breakdown/bottleneck contract.
- QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`.
