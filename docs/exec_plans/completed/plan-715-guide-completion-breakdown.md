# plan-715-guide-completion-breakdown

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Expose a compact Guide Quick Start Beat Completion breakdown for Path, Session, and Workflow readiness so users can see why the current completion score is high or low and choose the next direct beat-making focus without changing project data.

## Non-Goals

- Do not change Guide Quick Start scoring weights, target priority, run behavior, command routing, pinned-command behavior, or Quick Actions filtering.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run behavior, automatic fixes, autoplay, auto-save, or auto-export.
- Do not change project schema, save/load, undo/redo, playback scheduling, render/export bytes, MIDI export, Handoff Pack, Handoff Sheet, or Command Reference execution.
- Do not add sampling, imported audio, audio clips, sampler devices, sample browsing, remote AI, accounts, analytics, cloud sync, platform compliance, or publishing/licensing claims.

## Context Map

- `src/ui/workstationGuidancePanels.tsx` derives and renders Guide Quick Start decision, priority, context, and completion score.
- `src/styles.css` owns Guide Quick Start visual layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` pin product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-715-guide-completion-breakdown` and `.worktree/plan-715-guide-completion-breakdown` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add display-only completion breakdown items derived from the same Path, Session, and Workflow tones already used by Guide Quick Start.
- [x] Render the breakdown near the Beat Completion Score with compact labels that help users identify the next direct beat-making readiness lane.
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

QA completes before review starts. Review checks that the breakdown is derived from existing Guide Quick Start readiness state, remains display-only, preserves existing scoring and routing, and does not change project data, playback, export, remote behavior, or sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Add a compact completion breakdown below Guide Quick Start. | A single completion percent is useful, but beginners and producers need to see whether the missing work is Path, Session, or Workflow readiness before taking the next explicit beat-making action. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Guide Quick Start completion breakdown. |
| 2026-06-25 | harness_builder | Added read-only Path, Session, and Workflow completion breakdown cards under the Guide Quick Start Beat Completion Score. |
| 2026-06-25 | quality_runner | Ran git diff --check, run_qa.py, typecheck, quality gate, build, npm QA, and verify; all passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles. |
| 2026-06-25 | review_judge | Review found no issues: breakdown values are derived from existing Guide Quick Start readiness tones and no project data, playback, export, remote, or sampling behavior changed. |

## Completion Notes

- Added display-only Guide Quick Start completion breakdown cards for Path, Session, and Workflow readiness.
- Kept all guide run, decision, context, result, Quick Actions, and pinned-command behavior unchanged.
- Updated README, product rules, quality rules, and QA harness expectations to pin the UI-local completion breakdown contract.
- QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`.
