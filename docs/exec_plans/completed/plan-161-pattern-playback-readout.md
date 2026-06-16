# plan-161-pattern-playback-readout

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a compact Pattern Playback Readout in the Pattern editor that states the selected editing Pattern and the currently audible Pattern so beginners and producers can understand Song/Block playback context without changing edit focus.

## Non-Goals

- Do not change playback scheduling, audio synthesis, render/export output, project schema, save/load migration, Pattern A/B/C event data, arrangement data, mixer, sound, master, snapshots, or Handoff state.
- Do not auto-select, auto-scroll, create, delete, retime, transpose, relabel, or rewrite notes, drums, chords, Pattern tabs, or arrangement blocks while playback runs.
- Do not change Playing Pattern Tabs, Pattern-aware editor playheads, Arrangement Playhead Highlighting, Transport Position Readout, Section Locator Pads, or Song Form Overview playback context.
- Do not add count-in, marker persistence, sampling, imported audio, waveform display, remote AI, accounts, analytics, cloud sync, or plugin hosting.

## Context Map

- `src/ui/App.tsx`: playback snapshot state, selected Pattern A/B/C, playing Pattern, Pattern editor rendering.
- `src/styles.css`: Pattern playback readout visual state.
- `README.md`: runtime and editor playback summary.
- `docs/product/product.md`: Pattern editor and transport/editor playback behavior descriptions.
- `docs/quality/rules.md`: Pattern Playback Readout guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-161-pattern-playback-readout` and `.worktree/plan-161-pattern-playback-readout` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Pattern tab and playback snapshot rendering.
- [x] Add UI-local Pattern Playback Readout text derived from selected Pattern and playback snapshot Pattern.
- [x] Style idle, matching, and mismatch readout states without layout shift.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- Local browser smoke for idle, Song playback with a non-matching selected Pattern, and Pattern playback with matching selected Pattern.

## Review Plan

QA completes before review starts. Review checks UI-local derivation from playback snapshots plus selected Pattern A/B/C, no selected Pattern mutation, no musical/event mutation, no scheduler/export/schema changes, no tab/playhead regression, no layout regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a readout instead of changing Pattern selection during playback. | Users need clarity about edit focus versus audible Pattern without losing the Pattern they are editing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Pattern Playback Readout. |
| 2026-06-17 | harness_builder | Added `PatternPlaybackReadoutSummary` derived from selected Pattern, playback snapshot Pattern, and Pattern A/B/C event counts, with idle, matching, and mismatch states. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality guardrails, and harness expectations for Pattern Playback Readout. |
| 2026-06-17 | quality_runner | QA passed with `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`. |
| 2026-06-17 | review_judge | Browser smoke passed: idle selected Pattern B showed `Pattern idle`; Song playback showed `Editing Pattern B` and `Hearing Pattern A`; Pattern B playback showed `Editing Pattern B` and `Hearing Pattern B`; no console errors or horizontal overflow. |

## Completion Notes

Pattern Playback Readout is complete as UI-local state derived from realtime playback snapshots, selected Pattern A/B/C state, and Pattern event counts. It clarifies edit-versus-audible Pattern context without changing selected Pattern behavior, Pattern tabs, editor playheads, playback scheduling, render/export output, undo history, project schema, sampling scope, or remote/cloud boundaries.
