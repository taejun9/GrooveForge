# plan-689-layer-starter-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Layer Starter in the Create section of Command Reference as a readout-backed Quick Actions entry so users can discover the selected Pattern Drums/808/Chords/Synth readiness, highest-priority missing/thin layer, visible Priority action, direct Layer Starter commands, Quick Actions Layer Starter command, and local Layer Starter Result feedback.

## Non-Goals

- Do not change Layer Starter readiness derivation, priority scoring, visible Priority action behavior, Quick Actions routing, direct layer-start commands, disabled-state handling, result metrics, audition cues, or next-check text.
- Do not change Drum Foundation, 808 Bassline, Chord Progression, Melody Motif, Pattern DNA, Pattern Compare, Pattern Clone, Pattern Stack, Composer Actions, Next Move, Beat Blueprint, direct event editing, project files, snapshots, realtime playback, WAV/stem/MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add hidden generation, automatic layer starts, command chains, auto-arrangement, autoplay, auto-export, audio analysis, sampling, imported audio, sampler devices, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows and Layer Starter rendering.
- `src/ui/App.tsx` already owns Layer Starter option derivation, Quick Actions routing, and local result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-689-layer-starter-command-reference` and `.worktree/plan-689-layer-starter-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Change the Layer Starter Create Command Reference row to `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Layer Starter command-map coverage without expanding scope.
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

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Layer Starter derivation, visible Priority action, Quick Actions routing, direct layer-start commands, Layer Starter Result behavior, Pattern A/B/C data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Layer Starter as a readout-backed Command Reference row. | Layer Starter already combines selected-layer readiness, a Priority Readout, visible one-click action, Quick Actions command, direct layer starts, and local result feedback; the command map should surface it as a readout-backed direct-composition tool. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Layer Starter Command Reference coverage. |
| 2026-06-25 | harness_builder | Marked Layer Starter as `Quick Actions / Readout` in Command Reference and added README/product/quality/harness coverage without changing Layer Starter behavior. |
| 2026-06-25 | quality_runner | QA passed: git diff --check, run_qa, typecheck, quality_gate, build, npm qa, and verify; runtime smoke passed 14/14 blueprints and 14/14 style profiles with the existing Vite large-chunk warning. |
| 2026-06-25 | review_judge | Review passed with no findings; only Command Reference/docs/harness coverage changed and Layer Starter runtime behavior stayed unchanged. |

## Completion Notes

- Layer Starter now appears in Command Reference as `Quick Actions / Readout` with the existing Drums/808/Chords/Synth target.
- README, product docs, quality rules, and harness expectations now describe selected Pattern layer readiness, the Priority Readout/action, direct layer-start commands, Quick Actions command, and local Layer Starter Result feedback.
- No Layer Starter readiness derivation, priority scoring, visible Priority action behavior, Quick Actions routing, direct layer starts, Pattern A/B/C data, playback, export, sampling, remote AI, account, analytics, or cloud behavior changed.
