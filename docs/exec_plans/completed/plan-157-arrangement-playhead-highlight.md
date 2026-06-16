# plan-157-arrangement-playhead-highlight

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add UI-local Arrangement Playhead Highlighting so the currently playing arrangement block is visible in the Arrangement Track, Section Locator Pads, and Song Form Overview during Song or Block playback.

## Non-Goals

- Do not change playback scheduling, audio synthesis, render/export output, project schema, save/load migration, arrangement data, Pattern A/B/C event data, mixer, sound, master, snapshots, or Handoff state.
- Do not auto-select, auto-scroll, rewrite, create, delete, reorder, retime, or relabel arrangement blocks while playback runs.
- Do not add marker persistence, count-in, waveform display, sampling, imported audio, recording, remote AI, accounts, analytics, cloud sync, or plugin hosting.

## Context Map

- `src/ui/App.tsx`: playback snapshot state, Arrangement panel, Section Locator Pads, Song Form Overview.
- `src/styles.css`: arrangement block, section locator, and song form segment states.
- `README.md`: runtime and arrangement capability summaries.
- `docs/product/product.md`: arrangement and MVP capability descriptions.
- `docs/quality/rules.md`: UI-local playback highlight guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-157-arrangement-playhead-highlight` and `.worktree/plan-157-arrangement-playhead-highlight` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current playback snapshot, arrangement block, Section Locator, and Song Form rendering paths.
- [x] Derive a UI-local playing arrangement block index from realtime playback snapshots.
- [x] Render playing state on Arrangement Track blocks, Section Locator Pads, and Song Form segments.
- [x] Add contained styling and stable test IDs/attributes for the playing state.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- Local browser smoke for Song playback showing a playing arrangement block, Section Locator and Song Form playhead state, no auto-selection, layout containment, and no console errors.

## Review Plan

QA completes before review starts. Review checks UI-local derivation from playback snapshots, no data mutation, no scheduler/export/schema changes, no selection side effects, no layout regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Highlight the current arrangement block rather than auto-selecting it. | Users need playback context without losing the block they are editing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for UI-local Arrangement Playhead Highlighting. |
| 2026-06-17 | harness_builder | Added playback-snapshot-derived playing state to Arrangement Track, Section Locator Pads, and Song Form Overview with `data-playing` attributes. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality guardrails, and QA expectations for Arrangement Playhead Highlighting. |
| 2026-06-17 | quality_runner | QA passed: `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`. |
| 2026-06-17 | review_judge | Browser smoke passed: playback moved highlight from selected Intro block 0 to playing Verse block 1 across Arrangement Track, Section Locator Pads, and Song Form Overview with no console errors or horizontal overflow. |

## Completion Notes

Arrangement Playhead Highlighting is complete as UI-local state derived from realtime playback snapshots. It does not change project schema, arrangement data, selection behavior, playback scheduling, render/export output, undo history, sampling scope, or remote/cloud boundaries.
