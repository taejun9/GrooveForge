# plan-688-pattern-compare-decision-readout-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Pattern Compare Decision in the Create section of Command Reference as a readout-backed Quick Actions entry so users can discover the current Cue/Use recommendation, selected Pattern A/B/C context, selected-block placement context, visible readout action, Quick Actions Pattern Compare Decision command, and local Pattern Compare Result feedback.

## Non-Goals

- Do not change Pattern Compare Decision recommendation derivation, visible readout action behavior, Quick Actions routing, direct Pattern Cue/Switch/Use commands, disabled-state handling, result metrics, audition cues, or next-check text.
- Do not change Pattern Compare card ordering, Pattern Compare Result behavior, Pattern A/B/C event data, selected arrangement block assignment behavior, loop scope, project data, saved schema, undo history, playback scheduling, render/export, snapshots, Handoff Pack, or Handoff Sheet behavior.
- Do not add automatic cueing, automatic arrangement, auto-selecting during playback without a click, autoplay, tutorials, macros, command chains, auto-run, hidden generation, automatic export, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Pattern Compare Decision recommendations, Quick Actions routing, and local result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-688-pattern-compare-decision-readout-command-reference` and `.worktree/plan-688-pattern-compare-decision-readout-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Change the Pattern Compare Decision Create Command Reference row to `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Pattern Compare Decision command-map coverage without expanding scope.
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

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Pattern Compare Decision derivation, visible readout action, Quick Actions routing, direct Pattern Cue/Switch/Use commands, Pattern Compare Result behavior, Pattern A/B/C data, selected-block placement, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Pattern Compare Decision as a readout-backed Command Reference row. | Pattern Compare Decision already combines a UI-local recommendation, explicit readout action, Quick Actions command, and local result feedback; the command map should signal that readout-backed A/B/C decision loop clearly. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Pattern Compare Decision Command Reference coverage. |
| 2026-06-25 | harness_builder | Marked Pattern Compare Decision as `Quick Actions / Readout` in Command Reference and added README/product/quality/harness coverage without changing Pattern Compare behavior. |
| 2026-06-25 | quality_runner | QA passed: git diff --check, run_qa, typecheck, quality_gate, build, npm qa, and verify; runtime smoke passed 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-25 | review_judge | Review passed with no findings; only Command Reference/docs/harness coverage changed and Pattern Compare Decision runtime behavior stayed unchanged. |

## Completion Notes

- Pattern Compare Decision now appears in Command Reference as `Quick Actions / Readout` with the existing current Cue/Use recommendation target.
- README, product docs, quality rules, and harness expectations now describe the selected Pattern A/B/C context, selected-block placement context, visible readout action, Quick Actions command, and local Pattern Compare Result feedback.
- No Pattern Compare Decision derivation, visible readout action behavior, Quick Actions routing, direct Pattern Cue/Switch/Use commands, Pattern A/B/C events, selected-block placement behavior, playback, export, sampling, remote AI, account, analytics, or cloud behavior changed.
