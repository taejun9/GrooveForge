# plan-672-beat-map-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, and report completion progress after each task and every 10 completed plans.

## Goal

Mark Beat Map as a readout-backed Quick Actions entry in Command Reference so users can discover the existing local workflow stages, song/pattern metrics, export and stem metrics, producer-facing overview, Beat Map action commands, Next Move routing, and local result feedback from the Guide command map.

## Non-Goals

- Do not change Beat Map derivation, stage scoring, metric labels, action suggestions, or Next Move routing.
- Do not change Quick Actions command execution semantics.
- Do not change project data, saved schema, undo history, playback, render/export, snapshots, Handoff Pack, or Handoff Sheet behavior.
- Do not add tutorials, macros, auto-run, hidden generation, automatic fixes, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Beat Map derivation, action suggestions, Quick Actions Beat Map action commands, Next Move routing, and local result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-672-beat-map-command-reference` and `.worktree/plan-672-beat-map-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Update the Guide Command Reference row for Beat Map to show `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Beat Map command-map coverage without expanding scope.
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

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Beat Map derivation, stage scoring, action suggestions, Next Move routing, Quick Actions execution, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-21 | Treat Beat Map as a readout-backed Quick Actions command-reference entry. | The app already exposes local workflow stages, producer-facing metrics, action commands, Next Move routing, and local result feedback; the command map should make that visible without changing behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-21 | project_lead | Plan created for Beat Map Command Reference alignment. |
| 2026-06-21 | harness_builder | Updated Command Reference, README/product/quality notes, and harness expectations for Beat Map `Quick Actions / Readout` coverage without changing behavior. |
| 2026-06-21 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`; runtime smoke passed 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-21 | review_judge | Review passed with no findings: only the Command Reference row, docs, harness expectations, and this plan changed; Beat Map derivation, stage scoring, action suggestions, Next Move routing, project data, playback/export, sampling, and remote boundaries are preserved. |

## Completion Notes

Completed. Beat Map now appears in Command Reference as `Quick Actions / Readout`, and README/product/quality/harness expectations pin that this is discoverability coverage for existing local workflow stages, producer metrics, Beat Map action commands, Next Move routing, and result feedback only.
