# plan-693-composer-actions-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Composer Actions in the Create section of Command Reference as a readout-backed Quick Actions entry so users can discover style-aware writing moves, inline scope/impact/undo previews, direct Composer Action commands, and local Composer Action Result feedback.

## Non-Goals

- Do not change Composer Actions derivation, style priority scoring, thresholds, action copy, scope previews, impact previews, undo posture, direct command generation, result metrics, audition cues, or next-check text.
- Do not change Composer Actions run handling, Drum Foundation, 808 Bassline, Chord Progression, Melody Motif, Pattern Fill, Pattern Chain, arrangement template, Beat Blueprint, or Master Finish apply paths.
- Do not change Pattern A/B/C independence, Composer Guide, Beat Readiness, Beat Map, Production Snapshot, Key Compass, Groove Compass, Next Move, project files, snapshots, realtime playback, WAV/stem/MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add sampling, imported audio, remote AI, remote analysis, hidden generation, plugin hosting, songwriting guarantees, genre-authenticity claims, accounts, analytics, cloud sync, macros, command chains, autoplay, or auto-export.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` owns Composer Actions rendering, direct Quick Actions routing, and local result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-693-composer-actions-command-reference` and `.worktree/plan-693-composer-actions-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Change the Composer Actions Create Command Reference row to `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Composer Actions command-map coverage without expanding scope.
- [x] Add harness expectations that pin the row and direct-composition/local-only boundaries.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Composer Actions derivation, direct command routing, result feedback, explicit apply paths, Pattern A/B/C data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Composer Actions as a readout-backed Command Reference row. | Composer Actions already combine style-aware writing moves, previews, direct Quick Actions commands, and local Result feedback; the command map should surface that direct writing loop for beginners and producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Composer Actions Command Reference coverage. |
| 2026-06-25 | harness_builder | Marked Composer Actions as `Quick Actions / Readout` in Command Reference and added README/product/quality/harness coverage without changing Composer Actions behavior. |
| 2026-06-25 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`; runtime smoke covered 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-25 | review_judge | Review passed with no findings; only Command Reference, docs, and harness coverage changed while Composer Actions runtime behavior stayed unchanged. |

## Completion Notes

- Composer Actions is marked as `Quick Actions / Readout` in the Create Command Reference.
- README, product, quality, and harness coverage describe style-aware writing moves, inline scope/impact/undo previews, direct Composer Action commands, and local Composer Action Result feedback.
- Composer Actions derivation, run handling, apply paths, Pattern A/B/C data, playback, export, sampling scope, and remote boundaries remain unchanged.
