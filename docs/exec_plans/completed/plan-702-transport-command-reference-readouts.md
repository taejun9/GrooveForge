# plan-702-transport-command-reference-readouts

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Mark Transport Position Readout, Loop Scope, and Metronome in the Desktop section of Command Reference as readout-backed transport entries so users can discover local Bar/Beat/Step context, Song/Block/Pattern loop audition, and realtime click controls while composing and checking a beat.

## Non-Goals

- Do not change Transport Position derivation, playback scheduling, loop-scope routing, metronome toggle behavior, metronome persistence, realtime click synthesis, result copy, or disabled-state behavior.
- Do not change Tap Tempo, Tempo Nudge, Swing Feel, Key Retarget, Pattern Cue/Switch/Use, Arrangement Block Cue/Jump, Section Locator, Transition Loop, Hook Loop, Topline Loop, Pattern A/B/C musical events, arrangement, mixer, master, save/load, snapshots, undo/redo history, render/export, MIDI export, Handoff Sheet, or Handoff Pack behavior.
- Do not add count-in, marker editing, audio input, beat detection, imported audio, sampling, sampler devices, remote AI, remote analysis, plugin hosting, autoplay, auto-arrangement, auto-mixing, auto-mastering, auto-export, macros, command chains, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/workstationShellPanels.tsx` owns Command Reference section rows.
- `src/ui/App.tsx` owns Transport Position Readout, loop-scope Quick Actions, Metronome Quick Action, playback scheduling, and local result feedback.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` hold user-facing, product, quality, and harness expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-702-transport-command-reference-readouts` and `.worktree/plan-702-transport-command-reference-readouts` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Add Transport Position Readout, Loop Scope, and Metronome Desktop Command Reference rows as readout-backed entries.
- [x] Add README/product/quality notes that describe transport command-map coverage without changing transport behavior.
- [x] Add harness expectations that pin those rows and local-only transport boundaries.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that only Command Reference/docs/harness coverage changed and that Transport Position, loop scope, Metronome, playback/export, sampling, and remote boundaries are preserved.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Mark Transport Position Readout, Loop Scope, and Metronome as Desktop Command Reference rows. | Hearing the correct loop against a visible grid and optional click is a core beat-making workflow for beginners and working producers, and the command map should surface those existing local controls without changing transport behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for transport Command Reference readout coverage. |
| 2026-06-25 | harness_builder | Added Transport Position Readout, Loop Scope, and Metronome as Desktop Command Reference rows and pinned README/product/quality/harness coverage without changing transport behavior. |
| 2026-06-25 | quality_runner | QA passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run build`, `npm run qa`, and `npm run verify`. Runtime smoke covered 14/14 blueprints and 14/14 style profiles. |
| 2026-06-25 | review_judge | Review passed with no findings; scope stayed limited to Command Reference/docs/harness coverage and preserved Transport Position, loop scope, Metronome, playback/export, remote, and sampling boundaries. |

## Completion Notes

- Transport Position Readout, Loop Scope, and Metronome now appear in the Desktop Command Reference.
- README, product, quality, and harness coverage document existing Bar/Beat/Step context, Song/Block/Pattern loop-scope controls, realtime metronome toggle, and result feedback.
- No transport derivation, playback scheduling, loop routing, metronome, project data, playback/export, remote, or sampling behavior changed.
