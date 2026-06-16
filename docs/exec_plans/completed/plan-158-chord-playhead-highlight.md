# plan-158-chord-playhead-highlight

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add UI-local Chord Playhead Highlighting so the currently playing 16-step position is visible on Chord Editor slots during Song, Block, or Pattern playback.

## Non-Goals

- Do not change playback scheduling, audio synthesis, render/export output, project schema, save/load migration, chord event data, Pattern A/B/C event data, arrangement data, mixer, sound, master, snapshots, or Handoff state.
- Do not auto-select, auto-scroll, create, delete, retime, transpose, relabel, or rewrite chord events while playback runs.
- Do not add MIDI input, recording, sampling, imported audio, waveform display, remote AI, accounts, analytics, cloud sync, plugin hosting, or marker persistence.

## Context Map

- `src/ui/App.tsx`: playback snapshot state, Chord Editor rendering, current pattern step.
- `src/styles.css`: chord slot visual state.
- `README.md`: runtime and pattern/chord editing summaries.
- `docs/product/product.md`: Pattern editor and MVP capability descriptions.
- `docs/quality/rules.md`: UI-local chord playhead guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-158-chord-playhead-highlight` and `.worktree/plan-158-chord-playhead-highlight` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Chord Editor rendering, chord slot classes, and current-step derivation.
- [x] Pass UI-local current step into Chord Editor without changing chord data.
- [x] Render playing state on chord slots whose step range contains the current playback step.
- [x] Add contained styling and stable attributes for the playing chord state.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- Local browser smoke for Pattern playback showing a Chord Editor slot playhead state, no auto-selection, layout containment, and no console errors.

## Review Plan

QA completes before review starts. Review checks UI-local derivation from playback snapshots, no chord/event mutation, no scheduler/export/schema changes, no selection side effects, no layout regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Highlight chord slots that contain the current playback step instead of moving selection. | Users need chord timing context without losing the chord they are editing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for UI-local Chord Playhead Highlighting. |
| 2026-06-17 | harness_builder | Added playback-snapshot-derived chord slot playing state with `data-playing` and `aria-current` in the Chord Editor. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality guardrails, and harness expectations for Chord Playhead Highlighting. |
| 2026-06-17 | quality_runner | QA passed with `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`. |
| 2026-06-17 | review_judge | Browser smoke passed: Pattern playback kept `chord-slot-1` selected, moved playing state to `chord-slot-2`, reported no console errors, had no horizontal overflow, and cleared playing state after stop. |

## Completion Notes

Chord Playhead Highlighting is complete as UI-local state derived from realtime playback snapshots and chord step/length data. It does not change project schema, chord data, selection behavior, playback scheduling, render/export output, undo history, sampling scope, or remote/cloud boundaries.
