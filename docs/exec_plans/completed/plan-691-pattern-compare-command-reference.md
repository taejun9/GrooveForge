# plan-691-pattern-compare-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Pattern Compare in the Create section of Command Reference as a readout-backed Quick Actions entry so users can discover Pattern A/B/C cue/use cards, selected/cued Pattern context, selected-block placement context, direct Pattern Cue/Switch/Use commands, and local Pattern Compare Result feedback.

## Non-Goals

- Do not change Pattern Compare summary derivation, card ordering, Cue handlers, Use handlers, Switch handlers, selected/cued Pattern state handling, selected-block assignment behavior, result metrics, audition cues, or next-check text.
- Do not change Pattern Compare Decision, Pattern A/B/C musical event data, arrangement block data outside explicit Use actions, loop scope behavior, mixer, sound design, master state, project files, snapshots, realtime playback, WAV/stem/MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add automatic cueing, automatic arrangement, auto-selecting during playback without a click, autoplay, tutorials, macros, command chains, hidden generation, automatic export, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows and Pattern Compare card rendering.
- `src/ui/App.tsx` owns Pattern Compare Cue/Switch/Use routing and local result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-691-pattern-compare-command-reference` and `.worktree/plan-691-pattern-compare-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Change the Pattern Compare Create Command Reference row to `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Pattern Compare command-map coverage without expanding scope.
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

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Pattern Compare card summaries, Cue/Switch/Use handlers, Pattern Compare Result behavior, Pattern A/B/C data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Pattern Compare as a readout-backed Command Reference row. | Pattern Compare already combines local A/B/C posture cards, cue/use actions, selected-block context, direct Quick Actions commands, and Result feedback; the command map should surface that direct writing and arrangement loop for beginners and producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Pattern Compare Command Reference coverage. |
| 2026-06-25 | harness_builder | Marked Pattern Compare as `Quick Actions / Readout` in Command Reference and added README/product/quality/harness coverage without changing Pattern Compare behavior. |
| 2026-06-25 | quality_runner | QA passed: git diff --check, run_qa, typecheck, quality_gate, build, npm qa, and verify; runtime smoke passed 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-25 | review_judge | Review passed with no findings; only Command Reference/docs/harness coverage changed and Pattern Compare runtime behavior stayed unchanged. |

## Completion Notes

- Pattern Compare now appears as `Quick Actions / Readout` in the Create section of Command Reference.
- README, product, quality, and harness expectations now describe Pattern Compare command-map coverage as direct A/B/C cue/use and selected-block placement support.
- Pattern Compare summary derivation, card ordering, Cue/Switch/Use handlers, Pattern Compare Decision, Pattern Compare Result feedback, Pattern A/B/C data, playback/export, sampling boundaries, and remote boundaries were not changed.
