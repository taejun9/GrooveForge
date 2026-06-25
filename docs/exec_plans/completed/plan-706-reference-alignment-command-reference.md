# plan-706-reference-alignment-command-reference

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Add Reference Alignment to the Guide section of Command Reference as a readout-backed entry so users can discover the existing written-reference fit scan, listen cue, focus command, direct card commands, and local Focus Result feedback without importing reference audio or changing project data.

## Non-Goals

- Do not change Reference Alignment card derivation, card order, focus target derivation, Focus Result labels, or Quick Actions execution.
- Do not change Session Brief editing, Delivery Target, arrangement, Beat Readiness, deterministic export/stem analysis, Listening Pass, Production Snapshot, Handoff Pack, Handoff Sheet, save/load, snapshots, undo/redo history, realtime playback, render/export, or project schema.
- Do not add reference-track upload, waveform matching, audio analysis, sampling, imported audio, sampler devices, autoplay, tutorials, macros, command chains, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` owns Reference Alignment summaries, focus routing, Quick Actions commands, and local Focus Result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-706-reference-alignment-command-reference` and `.worktree/plan-706-reference-alignment-command-reference` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add a Reference Alignment row to the Guide Command Reference section as a readout-backed entry.
- [x] Add README/product/quality notes that describe Reference Alignment command-map coverage without changing derivation or focus routing.
- [x] Add harness expectations that pin the row and local-only Reference Alignment command-reference boundaries.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Reference Alignment derivation, focus routing, project data, playback, export, remote, and sampling boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Reference Alignment as a Guide Command Reference row. | Written-reference fit is already a local guide feature and should be discoverable from command search for beginners and working producers without changing audio or project behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Reference Alignment Command Reference coverage. |
| 2026-06-25 | harness_builder | Added Reference Alignment as a Guide Command Reference row and pinned README/product/quality/harness coverage without changing reference derivation, focus routing, playback, export, or sampling boundaries. |
| 2026-06-25 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`. Runtime smoke covered 14/14 blueprints and 14/14 style profiles. |
| 2026-06-25 | review_judge | Review passed with no findings; scope stayed limited to Reference Alignment Command Reference/docs/harness coverage and preserved Reference Alignment derivation, focus routing, project data, playback, export, remote, and sampling boundaries. |

## Completion Notes

- Command Reference now lists Reference Alignment in the Guide section as a `Quick Actions / Readout` row.
- README, product, quality, and harness coverage pin Reference Alignment command-map discoverability for written-reference fit, focus/card commands, and local Focus Result feedback.
- No Reference Alignment card derivation, focus routing, command execution, project data, playback, render/export, remote, or sampling behavior changed.
