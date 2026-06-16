# plan-160-playing-pattern-tabs

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Show the actually playing Pattern A/B/C on the Pattern tabs during Song, Block, or Pattern playback so users can distinguish the selected editing Pattern from the currently audible Pattern.

## Non-Goals

- Do not change playback scheduling, audio synthesis, render/export output, project schema, save/load migration, Pattern A/B/C event data, arrangement data, mixer, sound, master, snapshots, or Handoff state.
- Do not auto-select, auto-scroll, create, delete, retime, transpose, relabel, or rewrite notes, drums, chords, or arrangement blocks while playback runs.
- Do not change Pattern-aware editor playhead behavior, Arrangement Playhead Highlighting, Transport Position Readout, Section Locator Pads, or Song Form Overview playback context.
- Do not add count-in, marker persistence, sampling, imported audio, waveform display, remote AI, accounts, analytics, cloud sync, or plugin hosting.

## Context Map

- `src/ui/App.tsx`: playback snapshot state, selected Pattern A/B/C, Pattern tab rendering.
- `src/styles.css`: Pattern tab selected/playing visual states.
- `README.md`: runtime and editor playback summary.
- `docs/product/product.md`: Pattern editor and transport/editor playback behavior descriptions.
- `docs/quality/rules.md`: Playing Pattern Tab guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-160-playing-pattern-tabs` and `.worktree/plan-160-playing-pattern-tabs` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Pattern tab rendering and playback snapshot Pattern state.
- [x] Add UI-local playing Pattern tab state without changing selected Pattern behavior.
- [x] Style selected, playing, and selected+playing tab states clearly.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- Local browser smoke for Song playback with a non-matching selected Pattern confirming the playing tab follows the audible Pattern while the selected editing tab stays selected, and Pattern playback confirming selected+playing state.

## Review Plan

QA completes before review starts. Review checks UI-local derivation from playback snapshots, no selected Pattern mutation, no musical/event mutation, no scheduler/export/schema changes, no editor playhead regression, no layout regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Mark Pattern tabs as playing from `playbackPosition.pattern`, independent of selected Pattern. | Users need a compact way to see the audible Pattern while editing another Pattern during Song or Block playback. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Playing Pattern Tabs. |
| 2026-06-17 | harness_builder | Added playback-snapshot-derived `playingPattern` state to Pattern tabs with independent `selected` and `playing` classes, `data-playing`, and `aria-current`. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality guardrails, and harness expectations for Playing Pattern Tabs. |
| 2026-06-17 | quality_runner | QA passed with `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`. |
| 2026-06-17 | review_judge | Browser smoke passed: with Pattern B selected, Song playback marked Pattern A as playing while Pattern B stayed selected; Pattern B loop marked Pattern B as selected and playing; stop cleared playing state; no console errors or horizontal overflow. |

## Completion Notes

Playing Pattern Tabs are complete as UI-local state derived from realtime playback snapshots. Pattern tabs now show the audible Pattern A/B/C independently from the selected editing Pattern. The change preserves Pattern-aware editor playheads, selected Pattern behavior, playback scheduling, render/export output, undo history, project schema, sampling scope, and remote/cloud boundaries.
