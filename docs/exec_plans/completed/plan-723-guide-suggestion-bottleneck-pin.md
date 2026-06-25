# plan-723-guide-suggestion-bottleneck-pin

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Let users explicitly pin or unpin the Guide Bottleneck Focus command from the Quick Actions guide suggestion card, so the current weakest lane can stay close without searching.

## Non-Goals

- Do not change Guide Quick Start scoring, bottleneck derivation, or visible Guide strip behavior.
- Do not change Quick Actions filtering, ordering, Spotlight Enter behavior, pinned-command limits, recent-command behavior, or command execution semantics.
- Do not change the `guide-quick-start` or `guide-bottleneck-focus` command handlers.
- Do not change project schema, save/load, undo/redo, playback scheduling, render/export bytes, MIDI export, Handoff Pack, or Handoff Sheet.
- Do not add automatic fixes, command chains, tutorials, onboarding overlays, autoplay, auto-run, auto-save, auto-export, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Quick Actions, the guide suggestion card, and pinned command controls.
- `src/styles.css` owns Quick Actions guide suggestion layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` pin product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-723-guide-suggestion-bottleneck-pin` and `.worktree/plan-723-guide-suggestion-bottleneck-pin` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Derive the current `guide-bottleneck-focus` pinned state from existing pinned action ids.
- [x] Add explicit guide and bottleneck Pin/Unpin controls in the empty-search Quick Actions guide suggestion card.
- [x] Update product/docs language and QA harness expectations for the bottleneck pin control.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that the bottleneck pin control only routes through existing pinned-command handling and does not alter search ordering, Enter behavior, command handlers, project data, playback, export, remote behavior, or sampling scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Add an explicit bottleneck pin control beside the existing guide suggestion pin. | Producers can keep the current bottleneck command available for repeated passes, while beginners still see an explicit non-automatic choice. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Quick Actions guide suggestion bottleneck pin access. |
| 2026-06-25 | harness_builder | Added guide and bottleneck Pin/Unpin controls to the empty-search Quick Actions guide suggestion card using the existing pinned-command handler. |
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
- Quick Actions guide suggestion now exposes separate guide and bottleneck Pin/Unpin controls while preserving guide scoring, command ordering, command handlers, project data, playback, export, and sampling scope.
