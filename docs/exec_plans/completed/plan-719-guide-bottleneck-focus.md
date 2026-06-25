# plan-719-guide-bottleneck-focus

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Make the Guide Quick Start completion bottleneck directly actionable with an explicit UI-local focus control that routes to the lowest Path, Session, or Workflow lane through the existing Guide Quick Start handlers.

## Non-Goals

- Do not change Guide Quick Start completion scoring, breakdown scoring, bottleneck priority, or target derivation.
- Do not add automatic fixes, command chains, tutorials, onboarding overlays, autoplay, auto-run, auto-save, or auto-export.
- Do not change Quick Actions ordering, Spotlight Enter behavior, Pinned Commands, Recent Commands, or Command Reference filtering/search.
- Do not change project schema, save/load, undo/redo, playback scheduling, render/export bytes, MIDI export, Handoff Pack, or Handoff Sheet.
- Do not add sampling, imported audio, audio clips, sampler devices, sample browsing, remote AI, accounts, analytics, cloud sync, platform compliance, or publishing/licensing claims.

## Context Map

- `src/ui/workstationGuidancePanels.tsx` owns Guide Quick Start layout, completion score, breakdown, bottleneck label, and Path/Session/Workflow button handlers.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` pin product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-719-guide-bottleneck-focus` and `.worktree/plan-719-guide-bottleneck-focus` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add a small Guide Quick Start bottleneck focus model derived from the existing completion breakdown items.
- [x] Add an explicit bottleneck focus button that reuses the current Path, Session, or Workflow Guide Quick Start handler.
- [x] Update product/docs language and QA harness expectations for the new UI-local focus control.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that bottleneck focus remains explicit, UI-local, and routed only through existing Path, Session, or Workflow handlers, with no scoring, project data, playback, export, remote, or sampling scope changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Add explicit Guide bottleneck focus instead of changing completion scoring. | Beginners need a direct next-step button from the lowest completion lane, while producers should keep the same predictable Path/Session/Workflow routing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Guide Quick Start bottleneck focus. |
| 2026-06-25 | harness_builder | Added a UI-local bottleneck focus target and button that routes through existing Guide Quick Start Path, Session, or Workflow handlers. |
| 2026-06-25 | quality_runner | Full QA passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles. |
| 2026-06-25 | review_judge | Review found no scoring, command ranking, project schema, playback, export, package, remote, or sampling scope changes. |

## Completion Notes

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run qa` passed.
- `npm run verify` passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles.
- Guide Quick Start now exposes a bottleneck focus button for the lowest Path, Session, or Workflow completion lane while preserving existing scoring and routing semantics.
