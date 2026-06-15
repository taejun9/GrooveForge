# plan-036-event-chance

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add editable chance controls to 808, melody, and chord events so direct composition can create controlled variation beyond drums. Beginners can keep all events at 100%, while working beatmakers can set intentional bass fills, synth responses, and chord stabs that fire deterministically during playback and export.

## Non-Goals

- No audio sampling, sample import, chopping, sampler tracks, recording, MIDI input, plugin hosting, or audio warping.
- No nondeterministic render randomness; exported WAV/stem audio must remain reproducible from saved project data.
- No visual future-pass preview of which chance events will fire.

## Context Map

- `src/domain/workstation.ts`: event data types, migration, validation, deterministic chance helpers.
- `src/audio/scheduler.ts`: realtime 808, melody, and chord event gating.
- `src/audio/render.ts`: offline WAV/stem event gating.
- `src/ui/App.tsx`: Note Inspector and Chord editor Chance controls.
- `src/styles.css`: compact control row styling if needed.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product docs and quality gates.
- `harness/scripts/run_qa.py`: static validation expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Preserve the beat-first product boundary; this is local musical event data, not sampling.

## Implementation Plan

- [x] Add probability fields and normalization for bass notes, melody notes, and chord events.
- [x] Add deterministic `noteEventShouldPlay` and `chordEventShouldPlay` helpers shared by realtime and offline render.
- [x] Add Studio-mode Chance controls for selected 808/melody notes and per-chord events.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA, browser validation, review, and complete lifecycle.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Domain validation: older project JSON without note/chord probabilities migrates to 100%; 0% always skips; 100% always plays; same seed decisions remain stable.
- Browser validation: select a melody or 808 note, edit Chance, verify readout/control state, edit a chord Chance, and play with no console errors.

## Review Plan

QA completes before review starts. Review checks that chance data is pattern-scoped, migrated, undoable, deterministic for export, applied consistently to realtime/full-mix/stems, and keeps GrooveForge centered on direct beat creation.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Extend probability from drums to 808, melody, and chords. | The product model already treats note probability as first-class event data; this makes pattern variation useful beyond percussion without adding sampling. |
| 2026-06-15 | Keep chance gates deterministic. | Saved projects and exports must reproduce reliably for beat delivery and review. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created for 808/melody/chord event chance controls. |
| 2026-06-15 | harness_builder | Added 808, melody, and chord `probability` fields, old-project normalization to 100%, and deterministic chance helpers for realtime/export paths. |
| 2026-06-15 | harness_builder | Added Studio-mode Note Inspector chance controls and per-chord Chance controls. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for event chance. |
| 2026-06-15 | quality_runner | Domain validation confirmed older bass/melody/chord events migrate to 100%, 0% skips, 100% plays, and same seed decisions are stable. |
| 2026-06-15 | quality_runner | Browser validation confirmed Synth note Chance at 55%, 808 note Chance at 80%, Chord 1 Chance at 70%, playback stable, and console errors are 0. |
| 2026-06-15 | quality_runner | `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check` passed. |
| 2026-06-15 | review_judge | Created completion review mirror with no blocking findings. |

## Completion Notes

808, melody, and chord event chance is implemented as local pattern event data, migrated for old files, editable in Studio controls, and applied to realtime playback, WAV export, and stem export through deterministic gates.
