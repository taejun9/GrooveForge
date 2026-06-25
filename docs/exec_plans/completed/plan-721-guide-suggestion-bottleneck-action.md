# plan-721-guide-suggestion-bottleneck-action

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Expose the Guide Bottleneck Focus command from the empty-search Quick Actions guide suggestion card so users can run the current guide target or the lowest completion lane without typing a search query.

## Non-Goals

- Do not change Guide Quick Start scoring, bottleneck derivation, or visible Guide strip behavior.
- Do not change Quick Actions filtering, ordering, Spotlight Enter behavior, pinned-command limits, recent-command behavior, or command execution semantics.
- Do not change the `guide-quick-start` or `guide-bottleneck-focus` command handlers.
- Do not change project schema, save/load, undo/redo, playback scheduling, render/export bytes, MIDI export, Handoff Pack, or Handoff Sheet.
- Do not add automatic fixes, command chains, tutorials, onboarding overlays, autoplay, auto-run, auto-save, auto-export, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Quick Actions, the guide suggestion card, and suggestion metadata parsing.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` pin product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-721-guide-suggestion-bottleneck-action` and `.worktree/plan-721-guide-suggestion-bottleneck-action` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Derive a `guide-bottleneck-focus` suggestion action beside the existing `guide-quick-start` suggestion action.
- [x] Add an explicit secondary Run Bottleneck button and metadata in the guide suggestion card.
- [x] Update product/docs language and QA harness expectations for the recommendation card bottleneck action.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that the guide suggestion card change is UI-only, explicit, derived from current Quick Action definitions, and does not alter search ordering, Enter behavior, command handlers, project data, playback, export, remote behavior, or sampling scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Add a secondary guide suggestion bottleneck action instead of changing Quick Actions ordering. | The empty-search guide card can surface the lowest completion lane without affecting command search ranking or existing guide suggestion behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Guide suggestion bottleneck action access. |
| 2026-06-25 | harness_builder | Added a secondary Run Bottleneck button and bottleneck-command metadata to the empty-search Quick Actions guide suggestion card. |
| 2026-06-25 | quality_runner | Full QA passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles. |
| 2026-06-25 | review_judge | Review found no command handler, search ordering, Enter behavior, project schema, playback, export, package, remote, or sampling scope changes. |

## Completion Notes

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run qa` passed.
- `npm run verify` passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles.
- Quick Actions guide suggestion now exposes both the current Guide Quick Start command and the current Guide Bottleneck Focus command without changing command ordering or execution semantics.
