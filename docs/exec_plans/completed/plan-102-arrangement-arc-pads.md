# plan-102-arrangement-arc-pads

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that working composers/producers can respect and first-time composers can use easily.

## Goal

Add Arrangement Arc Pads so users can shape the full song-form energy and section posture from explicit local presets. Beginners should be able to turn a loop into a more finished arc quickly, while working producers can keep editing every arrangement block, Pattern A/B/C assignment, energy value, mute, and bar length manually.

## Non-Goals

- No sample import, sample packs, audio clips, sampler tracks, audio recording, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No mutation of Pattern A/B/C musical event data, mixer channels, sound design, master state, Delivery Target, Beat Readiness, Beat Map, Next Move, Project Snapshots, exports, MIDI, or Handoff Sheet semantics.
- No hidden auto-arrangement, randomness, genre-authenticity guarantee, publishing, licensing, or platform-compliance claims.
- No new project schema unless required; prefer transforming existing arrangement block fields.

## Context Map

- `src/ui/App.tsx`: arrangement templates, arrangement focus/moves, Structure Lens, Next Move actions, undoable arrangement update paths.
- `src/styles.css`: compact pad row styling conventions.
- `src/domain/workstation.ts`: `ArrangementBlock`, sections, pattern ids, migration and validation.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product framing and QA guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and code tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-102-arrangement-arc-pads` and `.worktree/plan-102-arrangement-arc-pads` for git repository work.
- Arrangement Arc Pads must be explicit-click local presets.
- Arc Pads must update only existing arrangement block fields: section, Pattern A/B/C assignment, energy, muted tracks, and bar length.
- Results must remain manually editable through the Arrangement panel.
- Realtime playback, WAV/stem export, MIDI export, Beat Readiness, Beat Map, Structure Lens, Next Move, project files, and Handoff Sheet behavior must continue to derive from local project state.

## Implementation Plan

- [x] Add Arrangement Arc Pad definitions, preview derivation, and a bounded project-transform helper.
- [x] Add an explicit `applyArrangementArcPad` handler using existing undoable project history.
- [x] Render compact Arrangement Arc Pads near Arrangement Focus/Structure Lens controls.
- [x] Update docs and QA expectations for sample-free full-song energy shaping.

## QA Plan

- [x] `npm run typecheck`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `npm run verify`
- [x] Browser smoke test: Arrangement Arc Pads render four options, applying one option changes arrangement sections/Pattern A/B/C/energy/mutes while mixer state remains available, manual arrangement controls remain available, console errors stay empty, and no horizontal overflow appears.
- [x] `npm run qa`
- [x] `git diff --check`

## Review Plan

QA completed before review. Review checked that Arrangement Arc Pads are explicit, local, undoable, bounded to arrangement block posture, manually editable afterward, and preserve realtime/export plus non-sampling product boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Arrangement Arc Pads after Drum Kit Pads. | Drum and tone starts are faster now; the next beginner/pro gap is turning editable patterns into a convincing song-form energy arc without importing audio or hiding generation. |
| 2026-06-16 | Transform existing arrangement block fields instead of adding schema. | Current playback/export/readiness surfaces already derive from arrangement blocks, so scoped presets improve workflow without migration risk. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for sample-free Arrangement Arc Pads. |
| 2026-06-16 | harness_builder | Added Arrangement Arc Pads, bounded arrangement-posture transform helpers, UI, styles, docs, and QA expectations. |
| 2026-06-16 | quality_runner | Passed typecheck, QA harness, verify, browser smoke on `http://127.0.0.1:5210/`, QA, and diff check. |
| 2026-06-16 | review_judge | Reviewed scope against arrangement-only posture mutation and optional-sampling boundary; no blocking findings. |

## Completion Notes

Arrangement Arc Pads were added as a direct beat-production arrangement feature. The implementation exposes Clean Arc, Hook Lift, Break Arc, and Club Rise local presets in the Arrangement panel, updates only existing arrangement block section, Pattern A/B/C assignment, bar length, energy, and muted-track posture through undoable project history, keeps manual arrangement controls editable, and preserves the sampling-as-optional-extension product boundary.
