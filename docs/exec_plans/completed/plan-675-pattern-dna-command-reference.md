# plan-675-pattern-dna-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Add Pattern DNA to the Create section of Command Reference as a readout-backed Quick Actions entry so users can discover existing local selected-Pattern layer, density, dynamics, variation, arrangement-use diagnostics, Focus readout, Pattern DNA focus command, direct card commands, and local Focus Result feedback.

## Non-Goals

- Do not change Pattern DNA derivation, card order, focus scoring, focus targets, result labels, or Quick Actions routing.
- Do not change Pattern A/B/C musical event data, arrangement data, selected Pattern state, project data, saved schema, undo history, playback, render/export, snapshots, Handoff Pack, or Handoff Sheet behavior.
- Do not add tutorials, macros, auto-run, hidden generation, automatic fixes, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Pattern DNA derivation, Focus readout, direct card focus commands, Quick Actions Pattern DNA focus command, and local Focus Result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-675-pattern-dna-command-reference` and `.worktree/plan-675-pattern-dna-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add Pattern DNA to the Create Command Reference section as `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Pattern DNA command-map coverage without expanding scope.
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

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Pattern DNA derivation, card order, focus routing, Quick Actions execution, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Add Pattern DNA to Create Command Reference as a readout-backed Quick Actions row. | Pattern DNA already provides local loop diagnostics and focus commands; the command map should expose it alongside Pattern Compare, Layer Starter, and other direct composition tools. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created for Pattern DNA Command Reference coverage. |
| 2026-06-21 | harness_builder | Added the Pattern DNA Create Command Reference row, README/product/quality coverage, and harness expectations without changing Pattern DNA behavior. |
| 2026-06-21 | quality_runner | QA passed: git diff --check, run_qa, typecheck, quality_gate, build, npm qa, and verify; runtime smoke passed 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-21 | review_judge | Review passed with no findings; only Command Reference/docs/harness coverage changed and Pattern DNA runtime behavior stayed unchanged. |

## Completion Notes

Pattern DNA now appears in the Create Command Reference section as `Quick Actions / Readout`, with README, product, quality, and harness coverage documenting that existing local selected-Pattern layer, density, dynamics, variation, arrangement-use diagnostics, Focus readout, Pattern DNA focus command, direct card commands, and local Focus Result feedback are discoverable without changing Pattern DNA behavior, project data, playback, export, sampling scope, or remote boundaries.
