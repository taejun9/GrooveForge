# plan-692-beat-blueprints-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Beat Blueprints in the Create section of Command Reference as a readout-backed Quick Actions entry so users can discover sample-free style starts, current-style Match, Preview Decision, Preview Listening Cue, direct Preview/Apply commands, and local Beat Blueprint Result feedback.

## Non-Goals

- Do not change Beat Blueprint definitions, supported styles, current-style match derivation, preview derivation, Preview Decision logic, Preview Listening Cue logic, direct Preview/Apply command generation, focus routing, result metrics, audition cues, or next-check text.
- Do not change Blueprint apply behavior, undo behavior, Pattern A/B/C event generation, arrangement template selection, sound preset selection, mixer/master defaults, project files, snapshots, realtime playback, WAV/stem/MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add auto-apply, command chains, hidden generation, autoplay, auto-export, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` owns Beat Blueprint preview/apply routing, Quick Actions commands, focus routing, and local result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-692-beat-blueprints-command-reference` and `.worktree/plan-692-beat-blueprints-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Change the Beat Blueprints Create Command Reference row to `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Beat Blueprints command-map coverage without expanding scope.
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

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Beat Blueprint definitions, preview/apply routing, result feedback, sample-free project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Beat Blueprints as a readout-backed Command Reference row. | Beat Blueprints already combine sample-free style starts, preview/readout, direct Quick Actions Preview/Apply commands, and local Result feedback; the command map should surface that first-beat and pro fast-start loop. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Beat Blueprints Command Reference coverage. |
| 2026-06-25 | harness_builder | Marked Beat Blueprints as `Quick Actions / Readout` in Command Reference and added README/product/quality/harness coverage without changing Blueprint behavior. |
| 2026-06-25 | quality_runner | QA passed: git diff --check, run_qa, typecheck, quality_gate, build, npm qa, and verify; runtime smoke passed 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-25 | review_judge | Review passed with no findings; only Command Reference/docs/harness coverage changed and Beat Blueprint runtime behavior stayed unchanged. |

## Completion Notes

- Beat Blueprints now appears as `Quick Actions / Readout` in the Create section of Command Reference.
- README, product, quality, and harness expectations now describe Beat Blueprints command-map coverage as sample-free all-style project starts with Match, Preview Decision, Preview Listening Cue, direct Preview/Apply commands, and local Result feedback.
- Beat Blueprint definitions, supported styles, preview/apply routing, focus routing, result feedback, sample-free project data, playback/export, sampling boundaries, and remote boundaries were not changed.
