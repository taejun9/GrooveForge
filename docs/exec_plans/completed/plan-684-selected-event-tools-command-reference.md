# plan-684-selected-event-tools-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Selected Event Tools in the Create section of Command Reference as a readout-backed Quick Actions entry so users can discover the existing selected-drum pocket readout, selected-note degree/role readout, selected-chord harmonic readout, direct selected-event edit commands, selected-event reset commands, velocity reset commands, audition commands, and local selected-event delete feedback.

## Non-Goals

- Do not change selected-drum, selected-note, or selected-chord readout derivation, command availability, edit handlers, reset handlers, velocity reset handlers, audition routing, delete behavior, or result metric derivation.
- Do not change Pattern A/B/C event data outside existing explicit selected-event edit actions, project data, saved schema, undo history, playback, render/export, snapshots, Handoff Pack, or Handoff Sheet behavior.
- Do not add new editing algorithms, tutorials, macros, command chains, auto-run, hidden generation, automatic arrangement, automatic export, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` and related workstation pattern UI files already own selected-drum, selected-note, selected-chord, selected-event reset, velocity reset, audition, and delete-result behavior.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-684-selected-event-tools-command-reference` and `.worktree/plan-684-selected-event-tools-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Change the Selected Event Tools Create Command Reference row to `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Selected Event Tools command-map coverage without expanding scope.
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

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that selected-drum, selected-note, selected-chord, selected-event reset, velocity reset, audition, delete feedback, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Selected Event Tools as a readout-backed Command Reference row. | Selected-event editing already combines local readouts with explicit Quick Actions commands; the command map should expose that direct manual editing surface for beginners and producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Selected Event Tools Command Reference coverage. |
| 2026-06-25 | harness_builder | Marked Selected Event Tools as `Quick Actions / Readout` in Command Reference and added README/product/quality/harness coverage without changing selected-event behavior. |
| 2026-06-25 | quality_runner | QA passed: git diff --check, run_qa, typecheck, quality_gate, build, npm qa, and verify; runtime smoke passed 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-25 | review_judge | Review passed with no findings; only Command Reference/docs/harness coverage changed and selected-event runtime behavior stayed unchanged. |

## Completion Notes

Selected Event Tools now appears in the Create Command Reference section as `Quick Actions / Readout`, with README, product, quality, and harness coverage documenting that selected-drum pocket readout, selected-note degree/role readout, selected-chord harmonic readout, direct selected-drum/note/chord edit commands, selected-event reset commands, velocity reset commands, audition commands, and local selected-event delete feedback are discoverable without changing readout derivation, command availability, edit handlers, reset handlers, velocity reset handlers, audition routing, delete feedback, project data, playback, export, sampling scope, or remote boundaries.
