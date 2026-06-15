# plan-040-arrangement-track-mutes

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue making GrooveForge into a desktop beat-making app that can satisfy working producers while staying easy for first-time composers.

## Goal

Add arrangement block track mutes so users can make section-level drops and builds without editing the underlying Pattern A/B/C musical data. The selected block should be able to mute Drums, 808, Synth, or Chords, and the same mute decisions must affect realtime arrangement playback, WAV export, and stem export.

## Non-Goals

- No sampling, audio import, chopping, sampler tracks, plugin hosting, MIDI recording, or remote AI.
- No arrangement automation curves or per-step automation lanes in this plan.
- No mutation of stored Pattern A/B/C events when a block mute changes.
- No change to selected-pattern preview behavior.

## Context Map

- `src/domain/workstation.ts`: `ArrangementBlock` shape, templates, project migration, normalization.
- `src/audio/scheduler.ts`: realtime arrangement block lookup and step scheduling.
- `src/audio/render.ts`: offline WAV/stem render arrangement traversal.
- `src/ui/App.tsx`: arrangement editor UI and undoable block update path.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: durable product and QA framing.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-040-arrangement-track-mutes` and `.worktree/plan-040-arrangement-track-mutes` for git repository work.
- Keep block mutes as local deterministic project data and preserve legacy project migration.

## Implementation Plan

- [x] Add arrangement-mute track IDs, labels, and helpers to the domain model.
- [x] Migrate older arrangement blocks to no muted tracks and clone template/default blocks safely.
- [x] Apply block mutes in realtime arrangement playback without affecting selected-pattern preview.
- [x] Apply block mutes in full-mix WAV export and stem export.
- [x] Add selected-block mute controls to the arrangement editor.
- [x] Update docs and QA expectations.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test: toggle a selected block mute, confirm the UI/readout changes, export meter changes, undo restores, playback starts/stops, and console errors are empty.

## Review Plan

QA completes before review starts. Review checks that block mutes are selected-block scoped, undoable, migrated for older project files, applied consistently to realtime/WAV/stem paths, and do not mutate underlying Pattern A/B/C data or introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Add section-level track mutes instead of editing patterns for drops. | Producers expect fast section drops/builds, and beginners need a simple way to make arrangement blocks sound different without deleting musical events. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created after confirming arrangement blocks had pattern, bars, and energy but no per-track mute/drop controls. |
| 2026-06-15 | harness_builder | Added arrangement mute tracks to project data, migration, realtime scheduling, WAV/stem render, and selected-block UI controls. |
| 2026-06-15 | quality_runner | Passed typecheck, static QA, quality gate, full verify, diff whitespace check, and browser smoke coverage for mute toggle, undo, playback, and console health. |
| 2026-06-15 | review_judge | Reviewed scope against the beat-first product invariant and confirmed sampling remains a secondary non-goal. |

## Completion Notes

Completed. Selected arrangement blocks can now mute Drums, 808, Synth, or Chords without mutating Pattern A/B/C events. Legacy arrangement data normalizes to no muted tracks, duplicated blocks clone mute arrays, selected-pattern preview stays unmuted, and realtime arrangement playback plus full-mix WAV and stem export all read the same block mute decisions.

QA passed:

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test on `http://127.0.0.1:5173/`: four mute controls rendered once each, Drums mute set `aria-pressed=true`, selected block showed `1 mute`, export RMS changed from `-20.8 dB` to `-20.9 dB`, Pattern A/B/C event counts stayed `34/41/26`, Undo removed the mute, playback started at `Intro 1.2`, Stop returned to `Ready`, and console warning/error logs were empty.
