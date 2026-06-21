# plan-674-next-move-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Next Move as a readout-backed Quick Actions entry in Command Reference so users can discover existing local readiness/export-driven action recommendations, explicit action buttons, result metric, audition cue, next-check feedback, and local-only execution from the Guide command map.

## Non-Goals

- Do not change Next Move recommendation derivation, action ordering, action definitions, result metric derivation, audition cues, or next-check labels.
- Do not change Quick Actions command execution semantics.
- Do not change project data, saved schema, undo history, playback, render/export, snapshots, Handoff Pack, or Handoff Sheet behavior.
- Do not add tutorials, macros, auto-run, hidden generation, automatic fixes, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Next Move derivation, explicit action execution, result metric, audition cue, and next-check feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-674-next-move-command-reference` and `.worktree/plan-674-next-move-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Update the Guide Command Reference row for Next Move to show `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Next Move command-map coverage without expanding scope.
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

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Next Move derivation, action ordering, action definitions, result metric derivation, Quick Actions execution, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Treat Next Move as a readout-backed Quick Actions command-reference entry. | The app already exposes local action recommendations, explicit buttons, result metrics, audition cues, and next checks; the command map should make that visible without changing behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created for Next Move Command Reference alignment. |
| 2026-06-21 | harness_builder | Updated Command Reference, README/product/quality notes, and harness expectations for Next Move `Quick Actions / Readout` coverage without changing behavior. |
| 2026-06-21 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`; runtime smoke passed 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-21 | review_judge | Review passed with no findings: only the Command Reference row, docs, harness expectations, and this plan changed; Next Move derivation, action ordering, action definitions, result metric derivation, project data, playback/export, sampling, and remote boundaries are preserved. |

## Completion Notes

Completed. Next Move now appears in Command Reference as `Quick Actions / Readout`, and README/product/quality/harness expectations pin that this is discoverability coverage for existing local readiness/export-driven action recommendations, explicit action buttons, result metric, audition cue, and next-check feedback only.
