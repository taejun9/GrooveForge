# plan-724-guide-suggestion-pin-capacity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Show pinned-command capacity in the Quick Actions guide suggestion card so users know whether pinning the guide or bottleneck command may rotate the session pin list.

## Non-Goals

- Do not change Guide Quick Start scoring, bottleneck derivation, or visible Guide strip behavior.
- Do not change Quick Actions filtering, ordering, Spotlight Enter behavior, pinned-command limits, recent-command behavior, or command execution semantics.
- Do not change pinned-command storage, ordering, or eviction behavior.
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
- Use `codex/plan-724-guide-suggestion-pin-capacity` and `.worktree/plan-724-guide-suggestion-pin-capacity` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Derive guide suggestion pin capacity from the existing normalized pinned command list and `maxQuickActionPins`.
- [x] Add display-only pin capacity metadata and a pin behavior hint to the empty-search Quick Actions guide suggestion card.
- [x] Update product/docs language and QA harness expectations for the pin capacity readout.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that the pin capacity readout only reflects existing pinned-command state and does not alter pinned-command storage, ordering, eviction behavior, command handlers, project data, playback, export, remote behavior, or sampling scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Add a display-only pin capacity readout instead of changing pin behavior. | The current pinned-command handler intentionally keeps the newest limited set; users need clarity without changing established command-palette semantics. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Quick Actions guide suggestion pin capacity clarity. |
| 2026-06-25 | harness_builder | Added display-only pin capacity metadata and a session-local/rotation hint to the empty-search Quick Actions guide suggestion card. |
| 2026-06-25 | quality_runner | Full QA passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles. |
| 2026-06-25 | review_judge | Review found no pinned-command behavior, command handler, search ordering, Enter behavior, project schema, playback, export, package, remote, or sampling scope changes. |

## Completion Notes

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run qa` passed.
- `npm run verify` passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles.
- Quick Actions guide suggestion now shows pin capacity and a session-local/rotation hint without changing guide scoring, pinned-command behavior, command ordering, command handlers, project data, playback, export, or sampling scope.
