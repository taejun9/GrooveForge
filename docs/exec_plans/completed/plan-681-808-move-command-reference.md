# plan-681-808-move-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark 808 Move in the Create section of Command Reference as a readout-backed Quick Actions entry so users can discover the existing local 808 Move Preview, current 808 Bassline/Glide/Contour target, direct 808 Move command, and local 808 Move Result feedback.

## Non-Goals

- Do not change 808 Move preview derivation, target selection, 808 Bassline/Glide/Contour preset behavior, Quick Actions execution, pad handlers, or 808 Move Result metric derivation.
- Do not change Pattern A/B/C event data outside existing explicit 808 Bassline, 808 Glide, 808 Contour, or 808 Move actions, project data, saved schema, undo history, playback, render/export, snapshots, Handoff Pack, or Handoff Sheet behavior.
- Do not add new bass algorithms, tutorials, macros, command chains, auto-run, hidden generation, automatic arrangement, automatic export, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` and `src/ui/workstationPatternTools.ts` already own 808 Move preview, apply behavior, and result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-681-808-move-command-reference` and `.worktree/plan-681-808-move-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Change the 808 Move Create Command Reference row to `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe 808 Move command-map coverage without expanding scope.
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

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that 808 Move preview derivation, target selection, pad handlers, result metrics, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark 808 Move as a readout-backed Command Reference row. | 808 Move already has a local preview, explicit Quick Actions command, and result feedback; the command map should expose that direct low-end rhythm/glide/contour workflow for beginners and producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for 808 Move Command Reference coverage. |
| 2026-06-25 | harness_builder | Marked 808 Move as `Quick Actions / Readout` in Command Reference and added README/product/quality/harness coverage without changing 808 Move behavior. |
| 2026-06-25 | quality_runner | QA passed: git diff --check, run_qa, typecheck, quality_gate, build, npm qa, and verify; runtime smoke passed 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-25 | review_judge | Review passed with no findings; only Command Reference/docs/harness coverage changed and 808 Move runtime behavior stayed unchanged. |

## Completion Notes

808 Move now appears in the Create Command Reference section as `Quick Actions / Readout`, with README, product, quality, and harness coverage documenting that the existing local 808 Move Preview, current 808 Bassline/Glide/Contour target, direct 808 Move command, and local 808 Move Result feedback are discoverable without changing preview derivation, target selection, preset definitions, apply behavior, result metrics, project data, playback, export, sampling scope, or remote boundaries.
