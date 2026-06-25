# plan-722-guide-suggestion-bottleneck-check

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Make the Quick Actions guide suggestion card show what to check after running the bottleneck command, so the explicit Run Bottleneck path has the same feedback loop clarity as Run Guide.

## Non-Goals

- Do not change Guide Quick Start scoring, bottleneck derivation, or visible Guide strip behavior.
- Do not change Quick Actions filtering, ordering, Spotlight Enter behavior, pinned-command limits, recent-command behavior, or command execution semantics.
- Do not change the `guide-quick-start` or `guide-bottleneck-focus` command handlers.
- Do not change project schema, save/load, undo/redo, playback scheduling, render/export bytes, MIDI export, Handoff Pack, or Handoff Sheet.
- Do not add automatic fixes, command chains, tutorials, onboarding overlays, autoplay, auto-run, auto-save, auto-export, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Quick Actions, the guide suggestion card, and suggestion metadata parsing.
- `src/styles.css` owns Quick Actions guide suggestion layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` pin product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-722-guide-suggestion-bottleneck-check` and `.worktree/plan-722-guide-suggestion-bottleneck-check` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Derive bottleneck metric and after-run check text from the current `guide-bottleneck-focus` Quick Action detail.
- [x] Add display-only bottleneck metric/check lines and metadata to the empty-search Quick Actions guide suggestion card.
- [x] Update product/docs language and QA harness expectations for the bottleneck check readout.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that the bottleneck check readout is UI-only, derived from the current `guide-bottleneck-focus` Quick Action, and does not alter search ordering, Enter behavior, command handlers, project data, playback, export, remote behavior, or sampling scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Add a bottleneck check readout beside the existing guide suggestion controls. | The Run Bottleneck button should tell users what metric and next check to verify without changing command execution or guide scoring. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Quick Actions guide suggestion bottleneck check clarity. |
| 2026-06-25 | harness_builder | Added display-only bottleneck metric metadata and a bottleneck check line to the empty-search Quick Actions guide suggestion card. |
| 2026-06-25 | quality_runner | Full QA passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles. |
| 2026-06-25 | review_judge | Review found no command handler, search ordering, Enter behavior, project schema, playback, export, package, remote, or sampling scope changes. |

## Completion Notes

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed after updating the harness expectation for the new bottleneck check line.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed after the same harness expectation update.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run qa` passed.
- `npm run verify` passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles.
- Quick Actions guide suggestion now shows the bottleneck command metric and bottleneck after-run check without changing guide scoring, command ordering, handlers, project data, playback, export, or sampling scope.
