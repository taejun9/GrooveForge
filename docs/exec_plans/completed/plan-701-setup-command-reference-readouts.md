# plan-701-setup-command-reference-readouts

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Tap Tempo, Tempo Nudge, Swing Feel, Key Retarget, and Style Quick Picks in the Create section of Command Reference as readout-backed Quick Actions entries so users can discover the local setup controls that shape BPM, groove feel, project key, and style direction before writing or exporting a beat.

## Non-Goals

- Do not change Tap Tempo history, delayed BPM commit behavior, Tempo Nudge calculation, Swing Feel derivation, Key Retarget logic, Style Quick Pick routing, result copy, or disabled-state behavior.
- Do not change style profiles, key options, scale definitions, Style Inspector, Key Compass, Groove Compass, Beat Blueprints, Pattern A/B/C musical events beyond existing explicit setup commands, arrangement, mixer, master, save/load, snapshots, undo/redo history, realtime playback, metronome, render/export, MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add automatic tempo detection, audio input analysis, auto-retargeting, auto-applying styles, hidden generation, sampling, imported audio, sampler devices, remote AI, remote analysis, plugin hosting, autoplay, auto-arrangement, auto-mixing, auto-mastering, auto-export, macros, command chains, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` owns Tap Tempo, Tempo Nudge, Swing Feel, Key Retarget, Style Quick Picks, Quick Actions routing, and local result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-701-setup-command-reference-readouts` and `.worktree/plan-701-setup-command-reference-readouts` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add Tap Tempo, Tempo Nudge, Swing Feel, Key Retarget, and Style Quick Picks Create Command Reference rows as `Quick Actions / Readout`.
- [x] Add README/product/quality notes that describe setup command-map coverage without changing setup behavior.
- [x] Add harness expectations that pin those rows and local-only setup boundaries.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Tap Tempo, Tempo Nudge, Swing Feel, Key Retarget, Style Quick Picks, project data, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark setup controls as readout-backed Create Command Reference rows. | BPM, groove feel, key, and style direction are first-session decisions for beginners and fast setup controls for working producers, so the command map should surface existing local setup commands without changing their behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for setup Command Reference readout coverage. |
| 2026-06-25 | harness_builder | Added Tap Tempo, Tempo Nudge, Swing Feel, Key Retarget, and Style Quick Picks as `Quick Actions / Readout` Create Command Reference rows and pinned README/product/quality/harness coverage without changing setup behavior. |
| 2026-06-25 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`. Runtime smoke covered 14/14 blueprints and 14/14 style profiles. |
| 2026-06-25 | review_judge | Review passed with no findings; scope stayed limited to Command Reference/docs/harness coverage and preserved setup handlers, project data, playback/export, remote, and sampling boundaries. |

## Completion Notes

- Tap Tempo, Tempo Nudge, Swing Feel, Key Retarget, and Style Quick Picks now appear in Create Command Reference as `Quick Actions / Readout`.
- README, product, quality, and harness coverage document existing local BPM pulse, BPM nudge, groove feel, key retarget, style direction commands, and result feedback.
- No Tap Tempo history, Tempo Nudge calculation, Swing Feel derivation, Key Retarget logic, Style Quick Pick routing, project data, playback/export, remote, or sampling behavior changed.
