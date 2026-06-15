# plan-025-mixer-channel-eq

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 현직 작곡가도 만족할 수 있고, 작곡을 처음 해보는 사람도 사용하기 쉬운 데스크탑 앱으로 완성시켜줘.

## Goal

Add beginner-safe mixer channel EQ controls so each musical track can be cleaned up and brightened before mastering. The first slice is `Low cut` and `Air` per non-master channel, stored in project state and reflected in realtime playback, full-mix WAV export, and stem export.

## Non-Goals

- No full parametric EQ, compressor, reverb send, delay send, plugin hosting, or native DSP in this plan.
- No sampling, audio import, chopping, sampler tracks, or audio warping.
- No claim that the simple EQ approximation is a mastering-grade or standards-complete EQ.

## Context Map

- `src/domain/workstation.ts`: project state, mixer channel validation, starter project, project file migration.
- `src/ui/App.tsx`: mixer strip controls, undoable project updates.
- `src/audio/scheduler.ts`: realtime track mix routing.
- `src/audio/render.ts`: offline full-mix and stem rendering.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA wording.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-025-mixer-channel-eq` and `.worktree/plan-025-mixer-channel-eq` for git repository work.
- Keep sampling as an optional later module.
- Mixer controls must affect realtime playback, full-mix WAV export, and stem export when implemented.

## Implementation Plan

- [x] Add `lowCut` and `air` fields to mixer channel state with validation and older-project migration.
- [x] Add per-channel Low cut and Air controls to the Mixer UI for non-master channels.
- [x] Apply the same channel EQ intent in realtime scheduling and offline/stem rendering.
- [x] Update docs and static QA expectations.
- [x] Verify with automated QA, domain checks, and browser interaction.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- `git diff --check`
- Domain check: EQ values round-trip through save/load, older project files without EQ migrate safely, malformed EQ inputs are rejected or normalized safely, and stem export path keeps isolated tracks.
- Browser check at the local Vite app: adjust Synth Low cut and Air, verify readouts, undo/redo, playback start/stop, export meter non-silent, and no console errors.

## Review Plan

QA completes before review starts. Review checks that channel EQ is stored as mixer state, remains beginner-discoverable, affects realtime/export/stem paths, migrates old project files safely, and does not introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Add Low cut and Air before deeper compressor/saturation work. | These controls give immediate track-cleanup value without overwhelming beginners or overclaiming mastering behavior. |
| 2026-06-15 | Keep EQ on non-master mixer channels only. | The current master panel already owns ceiling/output choices; this plan should strengthen mixing before mastering. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created for beginner-safe mixer channel EQ. |
| 2026-06-15 | harness_builder | Added `lowCut` and `air` mixer state, validation, starter defaults, and older-project migration. |
| 2026-06-15 | harness_builder | Added non-master mixer Low cut and Air controls with undoable updates and readouts. |
| 2026-06-15 | harness_builder | Applied channel EQ intent to realtime scheduling and offline full-mix/stem rendering. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for channel low-cut/air EQ. |
| 2026-06-15 | quality_runner | Domain validation passed: EQ values round-tripped through project files, legacy mixer channels migrated to 0/0, malformed EQ input was rejected, and helper clamping behaved as expected. |
| 2026-06-15 | quality_runner | Browser validation passed: Synth Low cut/Air changed to 48%/72% through numeric inputs, readouts updated, undo/redo worked, playback start/stop worked, export meter stayed non-silent, mixer layout was visually checked, and console error logs were empty. |
| 2026-06-15 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run verify`, and `git diff --check`. |

## Completion Notes

Mixer channel EQ is implemented as beginner-safe `Low cut` and `Air` controls on non-master mixer strips. Values are persisted in mixer state, older project files migrate safely, and both realtime playback and offline full-mix/stem rendering use the same channel EQ intent.
