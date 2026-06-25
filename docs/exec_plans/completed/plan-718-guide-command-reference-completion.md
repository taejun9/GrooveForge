# plan-718-guide-command-reference-completion

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Update Command Reference discoverability for Guide Quick Start so users can find the completion score, Path/Session/Workflow breakdown, bottleneck label, guide suggestion, and pinned-command controls from the Guide command map.

## Non-Goals

- Do not change Command Reference opening, filtering, search, spotlight, or command execution.
- Do not change Guide Quick Start scoring, breakdown, bottleneck derivation, target priority, run behavior, or pinned-command behavior.
- Do not change project schema, save/load, undo/redo, playback scheduling, render/export bytes, MIDI export, Handoff Pack, Handoff Sheet, or Quick Actions execution.
- Do not add sampling, imported audio, audio clips, sampler devices, sample browsing, remote AI, accounts, analytics, cloud sync, platform compliance, or publishing/licensing claims.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference rows and Quick Actions guide suggestion rendering.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` pin product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-718-guide-command-reference-completion` and `.worktree/plan-718-guide-command-reference-completion` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Update the Command Reference Guide Quick Start row target to mention completion score, breakdown, bottleneck, and guide suggestion.
- [x] Update product/docs language so Guide Quick Start command-map coverage includes completion metadata.
- [x] Update QA harness expectations for the Command Reference row and docs contract.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Command Reference discoverability changes remain display-only, preserve command execution and Guide/Quick Actions behavior, and do not change project data, playback, export, remote behavior, or sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Expand Guide Quick Start Command Reference target text to include completion metadata. | Beginners and producers should be able to discover the new completion score, breakdown, and bottleneck readouts from the app's command map, not only from the visible guide strip. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Guide Quick Start Command Reference completion discoverability. |
| 2026-06-25 | harness_builder | Updated the Command Reference Guide Quick Start row target and aligned README, product, quality, and harness expectations. |
| 2026-06-25 | quality_runner | Full QA passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles. |
| 2026-06-25 | review_judge | Review found the change display-only with no behavior, schema, playback, export, package, remote, or sampling scope changes. |

## Completion Notes

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run qa` passed.
- `npm run verify` passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles.
- Command Reference now labels Guide Quick Start as a Path/session/workflow completion target while docs and QA pin the score, breakdown, bottleneck, suggestion, and pinned-command discoverability contract.
