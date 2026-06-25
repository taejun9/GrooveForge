# plan-679-pattern-copy-clear-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Pattern Copy/Clear in the Create section of Command Reference as a readout-backed Quick Actions entry so users can discover the existing direct copy/clear commands and local Pattern Edit Result feedback.

## Non-Goals

- Do not change Pattern Copy/Clear command derivation, target selection, visible copy/clear handlers, Quick Actions execution, or Pattern Edit Result metric derivation.
- Do not change Pattern A/B/C event data outside existing explicit Copy or Clear actions, selected Pattern state, arrangement data, project data, saved schema, undo history, playback, render/export, snapshots, Handoff Pack, or Handoff Sheet behavior.
- Do not add tutorials, macros, command chains, auto-run, hidden generation, automatic arrangement, automatic export, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Pattern Copy/Clear command execution, copy/clear handlers, and Pattern Edit Result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-679-pattern-copy-clear-command-reference` and `.worktree/plan-679-pattern-copy-clear-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Change the Pattern Copy/Clear Create Command Reference row to `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Pattern Copy/Clear command-map coverage without expanding scope.
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

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Pattern Copy/Clear command derivation, handler behavior, result metrics, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Pattern Copy/Clear as a readout-backed Command Reference row. | Pattern Copy/Clear already has direct Quick Actions commands and local Pattern Edit Result feedback; the command map should expose that direct loop duplication/reset workflow consistently with adjacent Pattern tools. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Pattern Copy/Clear Command Reference coverage. |
| 2026-06-25 | harness_builder | Marked Pattern Copy/Clear as `Quick Actions / Readout` in Command Reference and added README/product/quality/harness coverage without changing Pattern Copy/Clear behavior. |
| 2026-06-25 | quality_runner | QA passed: git diff --check, run_qa, typecheck, quality_gate, build, npm qa, and verify; runtime smoke passed 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-25 | review_judge | Review passed with no findings; only Command Reference/docs/harness coverage changed and Pattern Copy/Clear runtime behavior stayed unchanged. |

## Completion Notes

Pattern Copy/Clear now appears in the Create Command Reference section as `Quick Actions / Readout`, with README, product, quality, and harness coverage documenting that direct selected-Pattern copy-to-slot commands, selected-Pattern clear, and local Pattern Edit Result feedback are discoverable without changing command derivation, copy/clear handlers, result metrics, undo semantics, project data, playback, export, sampling scope, or remote boundaries.
