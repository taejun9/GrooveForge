# plan-687-arrangement-playback-readout-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Arrangement Playback Readout in the Arrange section of Command Reference as a readout-backed Quick Actions entry so users can discover the existing edit-versus-heard block readout, selected arrangement block, audible arrangement block, Pattern A/B/C labels, bar context, visible Audible Arrangement Follow action, and Quick Actions Audible Arrangement Follow command.

## Non-Goals

- Do not change Arrangement Playback Readout derivation, realtime playback snapshots, selected arrangement block behavior, audible block tracking, or visible readout rendering.
- Do not change Audible Arrangement Follow derivation, follow routing, selected arrangement block or selected Pattern view-update handling, result metrics, audition cues, or next-check text.
- Do not change arrangement block data, Pattern A/B/C event data, loop scope, project data, saved schema, undo history, playback scheduling, render/export, snapshots, Handoff Pack, or Handoff Sheet behavior.
- Do not add automatic follow mode, auto-selecting during playback without a click, autoplay, tutorials, macros, command chains, auto-run, hidden generation, automatic arrangement, automatic export, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Arrangement Playback Readout, Audible Arrangement Follow, playback snapshots, and follow result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-687-arrangement-playback-readout-command-reference` and `.worktree/plan-687-arrangement-playback-readout-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Change the Arrangement Playback Readout Arrange Command Reference row to `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Arrangement Playback Readout command-map coverage without expanding scope.
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

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Arrangement Playback Readout derivation, audible block tracking, Audible Arrangement Follow routing, selected block behavior, arrangement data, Pattern A/B/C event data, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Arrangement Playback Readout as a readout-backed Command Reference row. | Arrangement Playback Readout already gives the edit-versus-heard block context that producers and beginners need while arranging; Command Reference should make that loop-awareness tool searchable beside Audible Arrangement Follow. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Arrangement Playback Readout Command Reference coverage. |
| 2026-06-25 | harness_builder | Marked Arrangement Playback Readout as `Quick Actions / Readout` in Command Reference and added README/product/quality/harness coverage without changing arrangement playback behavior. |
| 2026-06-25 | quality_runner | QA passed: git diff --check, run_qa, typecheck, quality_gate, build, npm qa, and verify; runtime smoke passed 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-25 | review_judge | Review passed with no findings; only Command Reference/docs/harness coverage changed and Arrangement Playback Readout runtime behavior stayed unchanged. |

## Completion Notes

- Arrangement Playback Readout now appears in Command Reference as `Quick Actions / Readout` with the existing edit-vs-heard Block target.
- README, product docs, quality rules, and harness expectations now describe the selected block, audible block, Pattern A/B/C labels, bar context, visible Audible Arrangement Follow action, and Quick Actions follow command.
- No Arrangement Playback Readout derivation, Audible Arrangement Follow routing, selected block behavior, arrangement data, Pattern A/B/C events, playback, export, sampling, remote AI, account, analytics, or cloud behavior changed.
