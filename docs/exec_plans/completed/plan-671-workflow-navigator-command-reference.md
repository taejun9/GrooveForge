# plan-671-workflow-navigator-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, and report completion progress after each task and every 10 completed plans.

## Goal

Mark Workflow Navigator as a readout-backed Quick Actions entry in Command Reference so users can discover the existing local Compose, Arrange, Mix, and Deliver stage jumps, direct zone commands, readiness metrics, audition cues, next-check feedback, and local Jump Result feedback from the Guide command map.

## Non-Goals

- Do not change Workflow Navigator item derivation, item order, jump routing, result labels, or Workflow Spotlight behavior.
- Do not change Quick Actions command execution semantics.
- Do not change project data, saved schema, undo history, playback, render/export, snapshots, Handoff Pack, or Handoff Sheet behavior.
- Do not add tutorials, macros, auto-run, hidden generation, automatic fixes, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Workflow Navigator item derivation, visible jumps, direct zone commands, Workflow Spotlight jumps, and local Jump Result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-671-workflow-navigator-command-reference` and `.worktree/plan-671-workflow-navigator-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Update the Guide Command Reference row for Workflow Navigator to show `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Workflow Navigator command-map coverage without expanding scope.
- [x] Add harness expectations that pin the row and the direct-composition/local-only boundaries.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Workflow Navigator item derivation, jump routing, Workflow Spotlight behavior, Quick Actions execution, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Treat Workflow Navigator as a readout-backed Quick Actions command-reference entry. | The app already exposes local stage jumps, direct zone commands, readiness metrics, audition cues, next-check feedback, and local Jump Result feedback; the command map should make that visible without changing behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created for Workflow Navigator Command Reference alignment. |
| 2026-06-21 | harness_builder | Updated Command Reference, README/product/quality notes, and harness expectations for Workflow Navigator `Quick Actions / Readout` coverage without changing behavior. |
| 2026-06-21 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`; runtime smoke passed 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-21 | review_judge | Review passed with no findings: only the Command Reference row, docs, harness expectations, and this plan changed; Workflow Navigator derivation, jump routing, Workflow Spotlight behavior, project data, playback/export, sampling, and remote boundaries are preserved. |

## Completion Notes

Completed. Workflow Navigator now appears in Command Reference as `Quick Actions / Readout`, and README/product/quality/harness expectations pin that this is discoverability coverage for existing local stage jumps, direct zone commands, readiness metrics, audition cues, next-check feedback, and Jump Result feedback only.
