# plan-683-chord-move-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Chord Move in the Create section of Command Reference as a readout-backed Quick Actions entry so users can discover the existing local Chord Move Preview, current Chord Pads/Rhythm/Voicing target, direct Chord Move command, and local Chord Move Result feedback.

## Non-Goals

- Do not change Chord Move preview derivation, target selection, Chord Pad/Rhythm/Voicing preset behavior, Quick Actions execution, pad handlers, or Chord Move Result metric derivation.
- Do not change Pattern A/B/C event data outside existing explicit Chord Pad, Chord Rhythm Pad, Chord Voicing Pad, or Chord Move actions, project data, saved schema, undo history, playback, render/export, snapshots, Handoff Pack, or Handoff Sheet behavior.
- Do not add new chord algorithms, tutorials, macros, command chains, auto-run, hidden generation, automatic arrangement, automatic export, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` and `src/ui/workstationPatternTools.ts` already own Chord Move preview, apply behavior, and result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-683-chord-move-command-reference` and `.worktree/plan-683-chord-move-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Change the Chord Move Create Command Reference row to `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Chord Move command-map coverage without expanding scope.
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

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Chord Move preview derivation, target selection, pad handlers, result metrics, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Chord Move as a readout-backed Command Reference row. | Chord Move already has a local preview, explicit Quick Actions command, and result feedback; the command map should expose that direct harmony workflow for beginners and producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Chord Move Command Reference coverage. |
| 2026-06-25 | harness_builder | Marked Chord Move as `Quick Actions / Readout` in Command Reference and added README/product/quality/harness coverage without changing Chord Move behavior. |
| 2026-06-25 | quality_runner | QA passed: git diff --check, run_qa, typecheck, quality_gate, build, npm qa, and verify; runtime smoke passed 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-25 | review_judge | Review passed with no findings; only Command Reference/docs/harness coverage changed and Chord Move runtime behavior stayed unchanged. |

## Completion Notes

Chord Move now appears in the Create Command Reference section as `Quick Actions / Readout`, with README, product, quality, and harness coverage documenting that the existing local Chord Move Preview, current Chord Pads/Rhythm/Voicing target, direct Chord Move command, and local Chord Move Result feedback are discoverable without changing preview derivation, target selection, preset definitions, apply behavior, result metrics, project data, playback, export, sampling scope, or remote boundaries.
