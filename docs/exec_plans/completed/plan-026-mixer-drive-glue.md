# plan-026-mixer-drive-glue

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 현직 작곡가도 만족할 수 있고, 작곡을 처음 해보는 사람도 사용하기 쉬운 데스크탑 앱으로 완성시켜줘.

## Goal

Add beginner-safe mixer dynamics and saturation controls so tracks can feel more produced before mastering. The first slice is `Drive` and `Glue` per non-master channel, stored in project state and reflected in realtime playback, full-mix WAV export, and stem export.

## Non-Goals

- No full compressor device graph, threshold/ratio/attack/release editor, multiband processing, send effects, plugin hosting, or native DSP in this plan.
- No sampling, audio import, chopping, sampler tracks, or audio warping.
- No claim that `Glue` is a standards-complete compressor model.

## Context Map

- `src/domain/workstation.ts`: mixer channel state, validation, starter project, project-file migration.
- `src/ui/App.tsx`: mixer strip controls and undoable project updates.
- `src/audio/scheduler.ts`: realtime track mix routing and per-source tone chain.
- `src/audio/render.ts`: offline full-mix and stem rendering.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA wording.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-026-mixer-drive-glue` and `.worktree/plan-026-mixer-drive-glue` for git repository work.
- Keep mixing and mastering separate.
- Preserve the composition-first product boundary; this is not sampling work.

## Implementation Plan

- [x] Add `drive` and `glue` fields to mixer channel state with validation and older-project migration.
- [x] Add per-channel Drive and Glue controls to the Mixer UI for non-master channels.
- [x] Apply the same channel dynamics/saturation intent in realtime scheduling and offline/stem rendering.
- [x] Update docs and static QA expectations.
- [x] Verify with automated QA, domain checks, and browser interaction.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- `git diff --check`
- Domain check: Drive/Glue values round-trip through project files, older project files without these fields migrate safely, malformed values are rejected, and stem render remains non-silent.
- Browser check at the local Vite app: adjust Synth Drive and Glue, verify readouts, undo/redo, playback start/stop, export meter non-silent, mixer layout, and no console errors.

## Review Plan

QA completes before review starts. Review checks that Drive/Glue are stored as mixer state, remain beginner-discoverable, affect realtime/export/stem paths, migrate old project files safely, keep master processing separate, and do not introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Add simple Drive and Glue controls before a full compressor UI. | This gives immediate track-polish value for producers while keeping the UI approachable for beginners. |
| 2026-06-15 | Keep Drive/Glue on non-master mixer channels only. | Mastering controls should stay separate from track-level mixing decisions. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created for beginner-safe mixer Drive/Glue controls. |
| 2026-06-15 | harness_builder | Added `drive` and `glue` mixer state, validation, starter defaults, and older-project migration. |
| 2026-06-15 | harness_builder | Added non-master mixer Drive and Glue controls with numeric percent inputs, undoable updates, and readouts. |
| 2026-06-15 | harness_builder | Applied Drive/Glue intent to realtime scheduling and offline full-mix/stem rendering. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for Drive/Glue mix controls. |
| 2026-06-15 | quality_runner | Domain validation passed: Drive/Glue values round-tripped through project files, legacy mixer channels migrated to 0/0, malformed Glue input was rejected, and helper clamping behaved as expected. |
| 2026-06-15 | quality_runner | Browser validation passed: Synth Drive/Glue changed to 44%/66%, paired ranges and readouts updated, undo/redo worked, playback start/stop worked, export meter stayed non-silent, stem export reported 4 stems, mixer layout was visually checked, and console error logs were empty. |
| 2026-06-15 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run verify`, and `git diff --check`. |

## Completion Notes

Mixer Drive/Glue controls are implemented as beginner-safe track-level saturation and simplified compression controls on non-master mixer strips. Values are persisted in mixer state, older project files migrate safely, and realtime playback plus offline full-mix/stem rendering use the same channel mix intent.
