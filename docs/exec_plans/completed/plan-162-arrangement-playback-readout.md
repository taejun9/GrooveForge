# plan-162-arrangement-playback-readout

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a compact Arrangement Playback Readout in the Arrangement panel that states the selected editing block and the currently audible arrangement block so users can understand Song/Block playback context without changing edit focus.

## Non-Goals

- Do not change playback scheduling, audio synthesis, render/export output, project schema, save/load migration, Pattern A/B/C event data, arrangement data, mixer, sound, master, snapshots, or Handoff state.
- Do not auto-select, auto-scroll, create, delete, split, merge, retime, relabel, rewrite, or reorder arrangement blocks while playback runs.
- Do not change Arrangement Playhead Highlighting, Pattern Playback Readout, Playing Pattern Tabs, Pattern-aware editor playheads, Transport Position Readout, Section Locator Pads, or Song Form Overview playback context.
- Do not add count-in, marker persistence, sampling, imported audio, waveform display, remote AI, accounts, analytics, cloud sync, or plugin hosting.

## Context Map

- `src/ui/App.tsx`: playback snapshot state, selected arrangement block, playing arrangement block, Arrangement panel rendering.
- `src/styles.css`: Arrangement Playback Readout visual state.
- `README.md`: runtime and arrangement playback summary.
- `docs/product/product.md`: Arrangement panel and transport/editor playback behavior descriptions.
- `docs/quality/rules.md`: Arrangement Playback Readout guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-162-arrangement-playback-readout` and `.worktree/plan-162-arrangement-playback-readout` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Arrangement selected-block and playback snapshot rendering.
- [x] Add UI-local Arrangement Playback Readout text derived from selected arrangement block and playback snapshot arrangement index.
- [x] Style idle, matching, and mismatch readout states without layout shift.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Local browser smoke for idle, Song playback with a non-matching selected arrangement block, and Block playback with matching selected arrangement block.

## Review Plan

QA completes before review starts. Review checks UI-local derivation from playback snapshots plus selected arrangement block state, no selected block mutation, no arrangement or Pattern mutation, no scheduler/export/schema changes, no block/playhead regression, no layout regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add an Arrangement Playback Readout instead of changing selected block during playback. | Users need clarity about edit focus versus audible arrangement block without losing the block they are editing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Arrangement Playback Readout. |
| 2026-06-17 | harness_builder | Added `ArrangementPlaybackReadoutSummary` derived from selected arrangement block state and realtime playback arrangement index, with idle, matching, and mismatch states. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality guardrails, and harness expectations for Arrangement Playback Readout. |
| 2026-06-17 | quality_runner | QA passed with `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`. |
| 2026-06-17 | review_judge | Browser smoke passed: idle selected Block 2 showed `Arrangement idle`; Song playback showed `Editing Block 2 Verse` and `Hearing Block 1 Intro`; Block playback showed `Editing Block 2 Verse` and `Hearing Block 2 Verse`; no console errors or horizontal overflow. |

## Completion Notes

Arrangement Playback Readout is complete as UI-local state derived from realtime playback snapshots and selected arrangement block state. It clarifies edit-versus-audible block context without changing arrangement selection behavior, arrangement blocks, Pattern A/B/C data, playback scheduling, render/export output, undo history, project schema, sampling scope, or remote/cloud boundaries.
