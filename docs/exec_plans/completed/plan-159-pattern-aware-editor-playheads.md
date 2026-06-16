# plan-159-pattern-aware-editor-playheads

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Make editor playhead highlights pattern-aware so drum, 808, Synth, and Chord editor playheads appear only when the realtime playback snapshot's Pattern A/B/C matches the currently selected editing Pattern.

## Non-Goals

- Do not change playback scheduling, audio synthesis, render/export output, project schema, save/load migration, Pattern A/B/C event data, arrangement data, mixer, sound, master, snapshots, or Handoff state.
- Do not auto-select, auto-scroll, create, delete, retime, transpose, relabel, or rewrite notes, drums, chords, or arrangement blocks while playback runs.
- Do not hide Arrangement Playhead Highlighting, Transport Position Readout, Section Locator Pads, or Song Form Overview playback context.
- Do not add count-in, marker persistence, sampling, imported audio, waveform display, remote AI, accounts, analytics, cloud sync, or plugin hosting.

## Context Map

- `src/ui/App.tsx`: playback snapshot state, selected Pattern A/B/C, editor playhead derivation, drum grid, NoteEditor, ChordEditor.
- `README.md`: runtime and editor playback summary.
- `docs/product/product.md`: Pattern editor and transport/editor playback behavior descriptions.
- `docs/quality/rules.md`: pattern-aware editor playhead guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-159-pattern-aware-editor-playheads` and `.worktree/plan-159-pattern-aware-editor-playheads` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect existing `currentPatternStep` usage across transport and editors.
- [x] Split playback step readout from selected-editor playhead state.
- [x] Pass the pattern-aware editor step to drum, 808, Synth, and Chord editor playhead rendering.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- Local browser smoke for Pattern playback confirming editor playheads still appear, and Song playback with a non-matching selected Pattern confirming editor playheads do not imply the wrong Pattern while Transport and Arrangement playback context remains visible.

## Review Plan

QA completes before review starts. Review checks UI-local derivation from playback snapshots plus selected Pattern A/B/C, no musical/event mutation, no scheduler/export/schema changes, no selection side effects, no arrangement playhead regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Show editor playheads only when `playbackPosition.pattern` matches `project.selectedPattern`. | The editor should not imply that the selected Pattern A/B/C is currently playing when Song/Block playback is on a different Pattern. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for pattern-aware editor playhead highlighting. |
| 2026-06-17 | harness_builder | Split `currentPlaybackStep` from `currentEditorStep` so transport still reports the active playback Pattern while editors highlight only matching selected Pattern playback. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality guardrails, and harness expectations for pattern-aware editor playheads. |
| 2026-06-17 | quality_runner | QA passed with `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`. |
| 2026-06-17 | review_judge | Browser smoke passed: Song playback with selected Pattern B and playing Pattern A showed zero editor playheads while arrangement context stayed visible; Pattern B playback showed drum, note, and chord playheads; stop cleared playheads; no console errors or horizontal overflow. |

## Completion Notes

Pattern-aware editor playheads are complete as UI-local state derived from realtime playback snapshots and selected Pattern A/B/C state. Drum, 808, Synth, and Chord editor highlights now appear only when the playing Pattern matches the selected editing Pattern. Transport Position Readout, Arrangement Playhead Highlighting, Section Locator Pads, and Song Form Overview continue to report the actually playing Pattern. The change does not alter project schema, musical events, selection behavior, playback scheduling, render/export output, undo history, sampling scope, or remote/cloud boundaries.
