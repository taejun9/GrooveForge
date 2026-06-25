# plan-699-hook-topline-command-reference-readouts

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Hook Readiness and Topline Space in the Guide section of Command Reference as readout-backed Quick Actions entries so users can discover hook-quality checks, vocal/topline pocket checks, Priority Readouts, focus/cue/fix commands, and local Focus/Fix Result feedback from the command map.

## Non-Goals

- Do not change Hook Readiness derivation, card order, Priority Readout scoring, focus routing, cue routing, fix routing, or result copy.
- Do not change Topline Space derivation, card order, Priority Readout scoring, focus routing, cue routing, fix routing, or result copy.
- Do not change arrangement, Pattern A/B/C musical events, Beat Readiness, Listening Pass, Review Queue, Mix Coach, Handoff Pack, project schema, save/load, snapshots, undo/redo history, realtime playback, render/export, MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add vocal recording, lyrics, reference-track upload, audio analysis, stem separation, sampling, imported audio, sampler devices, hidden generation, remote AI, remote analysis, plugin hosting, autoplay, auto-arrangement, auto-mixing, auto-mastering, auto-export, macros, command chains, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` owns Hook Readiness, Topline Space, their Quick Actions, focus/cue/fix routing, and local result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-699-hook-topline-command-reference-readouts` and `.worktree/plan-699-hook-topline-command-reference-readouts` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add a Hook Readiness Guide Command Reference row as `Quick Actions / Readout`.
- [x] Add a Topline Space Guide Command Reference row as `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe hook/topline command-map coverage without changing hook/topline behavior.
- [x] Add harness expectations that pin both rows and local-only hook/topline boundaries.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Hook Readiness, Topline Space, focus/cue/fix routing, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Hook Readiness and Topline Space as readout-backed Guide Command Reference rows. | Hook strength and topline space are critical production checks for beginners and working producers, and the command map should surface those local checks without changing their behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Hook Readiness and Topline Space Command Reference readout coverage. |
| 2026-06-25 | harness_builder | Added Hook Readiness and Topline Space as `Quick Actions / Readout` Guide Command Reference rows and pinned README/product/quality/harness coverage without changing hook/topline behavior. |
| 2026-06-25 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`. Runtime smoke covered 14/14 blueprints and 14/14 style profiles. |
| 2026-06-25 | review_judge | Review passed with no findings; scope stayed limited to Command Reference/docs/harness coverage and preserved Hook Readiness, Topline Space, focus/cue/fix routing, project data, playback/export, remote, and sampling boundaries. |

## Completion Notes

- Hook Readiness and Topline Space now appear in Guide Command Reference as `Quick Actions / Readout`.
- README, product, quality, and harness coverage document existing hook-quality checks, vocal/topline pocket checks, Priority Readouts, focus/cue/fix commands, and Focus/Fix Result feedback.
- No Hook Readiness, Topline Space, focus/cue/fix routing, project data, playback/export, remote, or sampling behavior changed.
