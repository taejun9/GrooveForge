# plan-714-quick-actions-guide-completion

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Expose the Guide Quick Start Beat Completion Score inside the Quick Actions guide suggestion card so users can scan current beat completeness from the command palette before running a guide jump, without mutating project data or expanding sampling scope.

## Non-Goals

- Do not add new Guide Quick Start actions, command chains, auto-run behavior, tutorials, onboarding overlays, automatic fixes, autoplay, auto-save, or auto-export.
- Do not change project schema, save/load, undo/redo, playback scheduling, render/export bytes, MIDI export, Handoff Pack, Handoff Sheet, or Command Reference behavior.
- Do not add sampling, imported audio, audio clips, sampler devices, sample browsing, remote AI, accounts, analytics, cloud sync, platform compliance, or publishing/licensing claims.

## Context Map

- `src/ui/workstationGuidancePanels.tsx` owns Guide Quick Start completion-score derivation.
- `src/ui/App.tsx` creates the `guide-quick-start` Quick Action target and command metadata.
- `src/ui/workstationShellPanels.tsx` renders the Quick Actions guide suggestion card.
- `src/styles.css` owns Quick Actions guide suggestion styling.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` pin product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-714-quick-actions-guide-completion` and `.worktree/plan-714-quick-actions-guide-completion` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Reuse/export Guide Quick Start completion-score derivation for Quick Actions metadata.
- [x] Render completion score/status/metric on the Quick Actions guide suggestion card without changing run or pin behavior.
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

QA completes before review starts. Review checks that Quick Actions only displays existing Guide Quick Start completion metadata, preserves explicit run/pin behavior, and does not change project data, playback, export, remote behavior, or sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Surface Beat Completion Score in the Quick Actions guide suggestion. | Beginners and producers often enter through the command palette; showing completeness there makes the current beat state scannable before any explicit guide run. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Quick Actions Guide Completion metadata. |
| 2026-06-25 | harness_builder | Added Guide Quick Start completion metadata to the Quick Actions guide suggestion card while preserving explicit Run and Pin/Unpin behavior. |
| 2026-06-25 | quality_runner | Ran git diff --check, run_qa.py, typecheck, quality gate, build, npm QA, and verify; all passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles. |
| 2026-06-25 | review_judge | Review found no issues: completion metadata remains display-only, Run and Pin/Unpin behavior stays explicit, and no domain, audio, export, or sampling scope changed. |

## Completion Notes

- Exported the existing Guide Quick Start Beat Completion Score derivation for Quick Actions metadata reuse.
- Displayed completion status and score in the Quick Actions guide suggestion card while keeping reason, metric, Run, and Pin/Unpin behavior explicit and unchanged.
- Updated README, product rules, quality rules, and QA harness expectations to pin the source/target/metric/completion/pin-state contract.
- QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`.
