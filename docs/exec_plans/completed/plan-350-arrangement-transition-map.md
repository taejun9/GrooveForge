# plan-350-arrangement-transition-map

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop beat workstation that satisfies working producers while staying approachable for beginners.

## Goal

Add an Arrangement Transition Map: a UI-local, read-only scan of adjacent arrangement block transitions that shows pattern changes, energy movement, muted-layer changes, and transition posture. It should help producers spot weak drops/builds/turnarounds quickly and help beginners understand where a section change needs contrast, while exposing focus-only Quick Actions that jump to Arrange.

## Non-Goals

- Do not change arrangement block semantics, project schema, playback, render, WAV/stem/MIDI export, save/load, or existing arrangement edit handlers.
- Do not auto-write fills, auto-arrange sections, auto-mute layers, or change Pattern A/B/C musical events.
- Do not add sampling, imported audio, sampler devices, remote AI, accounts, analytics, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`
- `src/ui/workstationUiModel.ts`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Keep the feature UI-local and read-only except existing focus/result state.
- Quick Actions must be focus-only and must not mutate project data.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.

## Implementation Plan

- [x] Inspect existing Arrangement Mute Map, Song Form Overview, and Quick Actions focus patterns.
- [x] Add Arrangement Transition Map model derivation and UI inside the Arrange surface.
- [x] Add focus-only Quick Actions for the current transition and each transition card.
- [x] Update docs and QA expectations.
- [x] Run QA, review, move plan to completed, and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`

## Review Plan

QA completes before review starts. Review should verify the map derives only from existing arrangement blocks and playback snapshots, keeps focus state UI-local, and does not mutate arrangement, Pattern, playback, export, save/load, or schema behavior.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add Arrangement Transition Map as read-only UI-local guidance. | Transition quality is a practical producer concern and a beginner learning gap; deriving it from existing arrangement data avoids schema/audio risk. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created in `codex/plan-350-arrangement-transition-map`. |
| 2026-06-18 | harness_builder | Added Arrangement Transition Map UI, focus-only Quick Actions, responsive CSS, docs, and harness expectations. |
| 2026-06-18 | quality_runner | QA passed: `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. Browser visual verification was blocked by localhost bind sandbox policy and file URL Browser Use policy. |
| 2026-06-18 | review_judge | Reviewed post-QA diff; no findings requiring code changes. |

## Completion Notes

Implemented a read-only Arrangement Transition Map derived from existing arrangement blocks, Pattern A/B/C event counts, energy, muted tracks, and realtime playback index. Focus buttons and Quick Actions jump only to Arrange, keep focus state UI-local, and do not mutate arrangement data, playback, export, save/load, or project schema.
