# plan-700-style-inspector-command-reference-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Style Inspector in the Create section of Command Reference as a readout-backed Quick Actions entry so users can discover local genre-fit diagnostics, BPM/swing/bass/melody/sound posture, Style Goal Progress, Pattern density, Style Inspector focus commands, direct lane focus commands, and local Focus Result feedback from the command map.

## Non-Goals

- Do not change Style Inspector derivation, metric order, Style Goal Progress card order, Pattern density row order, focus routing, or result copy.
- Do not change style profiles, Style Quick Picks, style selection, Beat Blueprint preview/apply, Composer Actions, Style Goal Cues, Style Goal Actions, Key Retarget, Pattern A/B/C musical events, arrangement, mixer, master, save/load, snapshots, undo/redo history, realtime playback, render/export, MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add auto-applying styles, auto-writing notes, hidden generation, reference-track upload, audio analysis, stem separation, sampling, imported audio, sampler devices, remote AI, remote analysis, plugin hosting, autoplay, auto-arrangement, auto-mixing, auto-mastering, auto-export, macros, command chains, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` owns Style Inspector, Style Inspector Focus, Quick Actions, focus routing, and local result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-700-style-inspector-command-reference-readout` and `.worktree/plan-700-style-inspector-command-reference-readout` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add a Style Inspector Create Command Reference row as `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe Style Inspector command-map coverage without changing Style Inspector or style behavior.
- [x] Add harness expectations that pin the row and local-only Style Inspector boundaries.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Style Inspector, focus routing, style selection, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Style Inspector as a readout-backed Create Command Reference row. | Style direction is a first-order all-genre composition decision, and the command map should surface existing local diagnostics and focus commands for both beginners and working producers without changing style behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for Style Inspector Command Reference readout coverage. |
| 2026-06-25 | harness_builder | Added Style Inspector as a `Quick Actions / Readout` Create Command Reference row and pinned README/product/quality/harness coverage without changing Style Inspector, style selection, focus routing, or project behavior. |
| 2026-06-25 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`. Runtime smoke covered 14/14 blueprints and 14/14 style profiles. |
| 2026-06-25 | review_judge | Review passed with no findings; scope stayed limited to Command Reference/docs/harness coverage and preserved Style Inspector, style selection, focus routing, project data, playback/export, remote, and sampling boundaries. |

## Completion Notes

- Style Inspector now appears in Create Command Reference as `Quick Actions / Readout`.
- README, product, quality, and harness coverage document existing genre-fit diagnostics, BPM/swing/bass/melody/sound posture, Style Goal Progress, Pattern density, Style Inspector focus commands, direct lane focus commands, and Focus Result feedback.
- No Style Inspector derivation, style profile, style selection, focus routing, project data, playback/export, remote, or sampling behavior changed.
