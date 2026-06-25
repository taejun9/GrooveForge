# plan-694-style-goal-command-reference-readouts

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Style Goal Cues and Style Goal Actions in the Create section of Command Reference as readout-backed Quick Actions entries so users can discover direct style-writing cues, local cue/result feedback, existing Composer Action routing, and local action-result feedback from the command map.

## Non-Goals

- Do not change Style Goal scoring, card derivation, command derivation, cue target derivation, cue-result labels, result-action matching, or Style Goal Action result derivation.
- Do not change Composer Action derivation, Composer Action execution, Layer Starter, Drum Move, 808 Move, Melody Move, Chord Move, Pattern Chain, or arrangement action behavior.
- Do not change Pattern A/B/C event data outside explicit clicked actions, selected Pattern behavior, loop-scope behavior, playback start/stop, save/load, undo/redo, project schema, render/export, Handoff Pack, or Handoff Sheet behavior.
- Do not add sampling, imported audio, hidden generation, remote AI, remote analysis, plugin hosting, tutorials, macros, command chains, autoplay, auto-arrangement, auto-mixing, auto-mastering, auto-export, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` owns Style Goal cards, cue commands, cue result feedback, result-action routing, and Style Goal Action result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-694-style-goal-command-reference-readouts` and `.worktree/plan-694-style-goal-command-reference-readouts` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Change the Style Goal Cues Create Command Reference row to `Quick Actions / Readout`.
- [x] Change the Style Goal Actions Create Command Reference row to `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Style Goal command-map coverage without expanding scope.
- [x] Add harness expectations that pin both rows and direct-composition/local-only boundaries.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Style Goal cue routing, cue results, result-action routing, Style Goal Action results, Composer Action behavior, loop state, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Style Goal Cues and Style Goal Actions as readout-backed Command Reference rows. | Both already expose explicit Quick Actions plus local result feedback; the command map should make the guided style-writing loop discoverable for beginners and fast for producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Style Goal command-map readout coverage. |
| 2026-06-25 | harness_builder | Marked Style Goal Cues and Style Goal Actions as `Quick Actions / Readout` in Command Reference and added README/product/quality/harness coverage without changing Style Goal or Composer Action behavior. |
| 2026-06-25 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`; runtime smoke covered 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-25 | review_judge | Review passed with no findings; only Command Reference, docs, and harness coverage changed while Style Goal cue/action and Composer Action runtime behavior stayed unchanged. |

## Completion Notes

- Style Goal Cues and Style Goal Actions are marked as `Quick Actions / Readout` in the Create Command Reference.
- README, product, quality, and harness coverage describe direct style-writing cue commands, local Style Goal Cue Result feedback, matching result-action routing, direct Style Goal Action commands, and local Style Goal Action Result feedback.
- Style Goal scoring, cue routing, cue-result feedback, result-action matching, Style Goal Action result feedback, Composer Action routing, project data, playback, export, sampling scope, and remote boundaries remain unchanged.
