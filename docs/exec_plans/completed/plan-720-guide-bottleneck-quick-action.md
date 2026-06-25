# plan-720-guide-bottleneck-quick-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Expose the Guide Quick Start bottleneck focus target as a direct Quick Actions command so producers can run it from command search while beginners keep the visible bottleneck focus button.

## Non-Goals

- Do not change Guide Quick Start completion scoring, breakdown scoring, bottleneck priority, or UI button behavior.
- Do not change Quick Actions ordering, Spotlight Enter behavior, pinned-command behavior, recent-command behavior, or the guide suggestion card target.
- Do not change Command Reference opening, filtering, search, or execution semantics.
- Do not change project schema, save/load, undo/redo, playback scheduling, render/export bytes, MIDI export, Handoff Pack, or Handoff Sheet.
- Do not add automatic fixes, command chains, tutorials, onboarding overlays, autoplay, auto-run, auto-save, auto-export, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx` owns Quick Actions command definitions and post-run result treatment.
- `src/ui/workstationGuidancePanels.tsx` owns Guide Quick Start completion breakdown and bottleneck derivation helpers.
- `src/ui/workstationShellPanels.tsx` owns Command Reference rows.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` pin product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-720-guide-bottleneck-quick-action` and `.worktree/plan-720-guide-bottleneck-quick-action` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Reuse the existing completion breakdown bottleneck derivation in Quick Actions.
- [x] Add a `guide-bottleneck-focus` Quick Action that routes only through the matching Path, Session, or Workflow handler.
- [x] Update command-map/product/quality docs and QA harness expectations for the command-palette bottleneck focus path.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that the new Quick Action is explicit, focus-only, derived from the existing bottleneck lane, and does not alter scoring, command ordering, saved data, playback, export, remote behavior, or sampling scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Add a separate bottleneck focus Quick Action instead of changing `guide-quick-start`. | The current guide command should keep its highest-priority target behavior, while bottleneck focus needs a command-palette path for the lowest completion lane. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Guide bottleneck Quick Action access and the 720-plan checkpoint. |
| 2026-06-25 | harness_builder | Added the `guide-bottleneck-focus` Quick Action, Command Reference row, focus-only result treatment, and aligned docs/harness expectations. |
| 2026-06-25 | quality_runner | Full QA passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles. |
| 2026-06-25 | review_judge | Review found no scoring, command ordering, project schema, playback, export, package, remote, or sampling scope changes. |
| 2026-06-25 | project_lead | 720-plan checkpoint reached after completion. |

## Completion Notes

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run qa` passed.
- `npm run verify` passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles.
- Guide Bottleneck Focus is now discoverable from Quick Actions and Command Reference while preserving the visible Guide Quick Start bottleneck button and existing Path, Session, or Workflow routing.
