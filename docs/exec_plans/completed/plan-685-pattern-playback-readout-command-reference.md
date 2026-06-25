# plan-685-pattern-playback-readout-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Pattern Playback Readout in the Create section of Command Reference as a readout-backed Quick Actions entry so users can discover the existing edit-vs-heard Pattern readout, selected editing Pattern, audible Pattern, local event-count context, visible Audible Pattern Follow action, and Quick Actions Audible Pattern Follow command.

## Non-Goals

- Do not change Pattern Playback Readout derivation, realtime playback snapshots, selected Pattern behavior, audible Pattern tracking, Audible Pattern Follow routing, follow result metrics, or Pattern A/B/C event counts.
- Do not change Pattern A/B/C event data, arrangement assignments, loop scope, project data, saved schema, undo history, playback scheduling, render/export, snapshots, Handoff Pack, or Handoff Sheet behavior.
- Do not add automatic follow mode, auto-selecting during playback without a click, tutorials, macros, command chains, auto-run, hidden generation, automatic arrangement, automatic export, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Pattern Playback Readout, Audible Pattern Follow, playback snapshots, and follow result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-685-pattern-playback-readout-command-reference` and `.worktree/plan-685-pattern-playback-readout-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Change the Pattern Playback Readout Create Command Reference row to `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Pattern Playback Readout command-map coverage without expanding scope.
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

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Pattern Playback Readout derivation, playback snapshots, selected Pattern behavior, Audible Pattern Follow routing, Pattern A/B/C event data, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Pattern Playback Readout as a readout-backed Command Reference row. | Pattern Playback Readout already gives local edit-vs-heard Pattern context and connects to explicit Audible Pattern Follow; the command map should expose that direct loop-awareness workflow for beginners and producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Pattern Playback Readout Command Reference coverage. |
| 2026-06-25 | harness_builder | Marked Pattern Playback Readout as `Quick Actions / Readout` in Command Reference and added README/product/quality/harness coverage without changing playback readout or follow behavior. |
| 2026-06-25 | quality_runner | QA passed: git diff --check, run_qa, typecheck, quality_gate, build, npm qa, and verify; runtime smoke passed 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-25 | review_judge | Review passed with no findings; only Command Reference/docs/harness coverage changed and Pattern Playback Readout runtime behavior stayed unchanged. |

## Completion Notes

Pattern Playback Readout now appears in the Create Command Reference section as `Quick Actions / Readout`, with README, product, quality, and harness coverage documenting that the existing edit-vs-heard Pattern readout, selected editing Pattern, audible Pattern, local event-count context, visible Audible Pattern Follow action, and Quick Actions Audible Pattern Follow command are discoverable without changing readout derivation, playback snapshots, selected Pattern behavior, follow routing, result metrics, project data, playback, export, sampling scope, or remote boundaries.
