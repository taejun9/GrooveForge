# plan-686-audible-pattern-follow-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Audible Pattern Follow in the Create section of Command Reference as a readout-backed Quick Actions entry so users can discover the existing Pattern Playback Readout context, heard Pattern target, explicit visible follow action, Quick Actions Audible Pattern Follow command, and local follow result feedback.

## Non-Goals

- Do not change Audible Pattern Follow derivation, visible follow-control availability, Quick Actions routing, selected Pattern view-update handling, result metrics, audition cues, or next-check text.
- Do not change Pattern Playback Readout derivation, realtime playback snapshots, Pattern A/B/C event data, arrangement assignments, loop scope, project data, saved schema, undo history, playback scheduling, render/export, snapshots, Handoff Pack, or Handoff Sheet behavior.
- Do not add automatic follow mode, auto-selecting during playback without a click, autoplay, tutorials, macros, command chains, auto-run, hidden generation, automatic arrangement, automatic export, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` already owns Pattern Playback Readout, Audible Pattern Follow, playback snapshots, and follow result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-686-audible-pattern-follow-command-reference` and `.worktree/plan-686-audible-pattern-follow-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Change the Audible Pattern Follow Create Command Reference row to `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Audible Pattern Follow command-map coverage without expanding scope.
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

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Audible Pattern Follow derivation, visible follow-control availability, Quick Actions routing, selected Pattern behavior, Pattern Playback Readout derivation, Pattern A/B/C event data, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Audible Pattern Follow as a readout-backed Command Reference row. | Audible Pattern Follow already uses Pattern Playback Readout context plus explicit one-shot follow and local result feedback; the command map should expose that direct loop-awareness action for beginners and producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Audible Pattern Follow Command Reference coverage. |
| 2026-06-25 | harness_builder | Marked Audible Pattern Follow as `Quick Actions / Readout` in Command Reference and added README/product/quality/harness coverage without changing follow behavior. |
| 2026-06-25 | quality_runner | QA passed: git diff --check, run_qa, typecheck, quality_gate, build, npm qa, and verify; runtime smoke passed 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-25 | review_judge | Review passed with no findings; only Command Reference/docs/harness coverage changed and Audible Pattern Follow runtime behavior stayed unchanged. |

## Completion Notes

- Audible Pattern Follow now appears in Command Reference as `Quick Actions / Readout` with the existing heard Pattern target.
- README, product docs, quality rules, and harness expectations now describe the Pattern Playback Readout context, visible follow action, Quick Actions command, and local follow result feedback.
- No Audible Pattern Follow derivation, Quick Actions routing, Pattern Playback Readout logic, Pattern A/B/C data, playback, export, sampling, remote AI, account, analytics, or cloud behavior changed.
