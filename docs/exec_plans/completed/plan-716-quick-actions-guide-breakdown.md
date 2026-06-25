# plan-716-quick-actions-guide-breakdown

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Expose the Guide Quick Start Path/Session/Workflow completion breakdown inside the Quick Actions guide suggestion card so users can scan the current beat-completion bottleneck from the command palette before running the guide target.

## Non-Goals

- Do not change Guide Quick Start scoring weights, target priority, run behavior, command routing, pinned-command behavior, Quick Actions ordering, or Quick Actions filtering.
- Do not add onboarding overlays, tutorials, macros, command chains, auto-run behavior, automatic fixes, autoplay, auto-save, or auto-export.
- Do not change project schema, save/load, undo/redo, playback scheduling, render/export bytes, MIDI export, Handoff Pack, Handoff Sheet, or Command Reference execution.
- Do not add sampling, imported audio, audio clips, sampler devices, sample browsing, remote AI, accounts, analytics, cloud sync, platform compliance, or publishing/licensing claims.

## Context Map

- `src/ui/App.tsx` creates the `guide-quick-start` Quick Action target and command metadata.
- `src/ui/workstationShellPanels.tsx` parses and renders the Quick Actions guide suggestion card.
- `src/styles.css` owns Quick Actions guide suggestion layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` pin product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-716-quick-actions-guide-breakdown` and `.worktree/plan-716-quick-actions-guide-breakdown` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Derive Quick Actions guide suggestion breakdown text from the same Guide Quick Start completion-score source data.
- [x] Render the breakdown as a display-only line inside the Quick Actions guide suggestion card without changing Run or Pin/Unpin controls.
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

QA completes before review starts. Review checks that Quick Actions only displays existing Guide Quick Start completion breakdown metadata, preserves explicit run/pin behavior, and does not change project data, playback, export, remote behavior, or sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Surface Guide Quick Start completion breakdown in the Quick Actions guide suggestion. | Beginners and producers often enter through command search; showing Path/Session/Workflow readiness there makes the current direct beat-making bottleneck scannable before any explicit guide run. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Quick Actions Guide completion breakdown metadata. |
| 2026-06-25 | harness_builder | Added Guide Quick Start Path, Session, and Workflow completion breakdown metadata to the Quick Actions guide suggestion card while preserving explicit Run and Pin/Unpin behavior. |
| 2026-06-25 | quality_runner | Ran git diff --check, run_qa.py, typecheck, quality gate, build, npm QA, and verify; all passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles. |
| 2026-06-25 | review_judge | Review found no issues: suggestion breakdown metadata remains display-only, existing Quick Actions parsing excludes it from reason/metric text, and no project data, playback, export, remote, or sampling behavior changed. |

## Completion Notes

- Reused the Guide Quick Start completion breakdown derivation for Quick Actions guide suggestion metadata.
- Added a display-only breakdown line to the Quick Actions guide suggestion card.
- Preserved guide target selection, explicit Run and Pin/Unpin controls, Quick Actions filtering, and command execution.
- Updated README, product rules, quality rules, and QA harness expectations to pin the source/target/metric/completion/breakdown/pin-state contract.
- QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`.
