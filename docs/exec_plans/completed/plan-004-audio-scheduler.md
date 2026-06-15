# plan-004-audio-scheduler

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as a desktop app that can satisfy working composers while staying easy for first-time composers.

## Goal

Replace the buffer-only preview path with a realtime Web Audio scheduler, looped transport, and visible current-step feedback so the app behaves more like a beat workstation.

## Non-Goals

- Implement full DAW-grade audio editing.
- Add cloud sync, accounts, remote AI calls, plugin hosting, or sampling-first features.
- Add native/JUCE audio engine work.

## Requirements

- Playback schedules musical events ahead of the audio clock instead of rendering the whole preview buffer first.
- Transport can play/stop cleanly.
- Playback loops across a fixed number of bars.
- UI shows the current step while playing.
- Existing WAV export remains available.
- Beginner/Studio UI stays intact.

## Context Map

- `src/audio/render.ts`: offline render/export path.
- `src/audio/scheduler.ts`: realtime playback scheduler.
- `src/domain/workstation.ts`: project model and timing helpers.
- `src/ui/App.tsx`: transport state and current-step UI.
- `src/styles.css`: playhead and active-step styling.
- `harness/scripts/run_qa.py`: static checks for scheduler wiring.

## Constraints

- QA and review are separate loops.
- Do not create or use `docs/plan`.
- Keep sampling as an optional extension.
- No real user audio or copyrighted fixtures.

## Implementation Plan

- [x] Create task worktree and active plan.
- [x] Add shared timing helpers.
- [x] Add realtime audio scheduler with lookahead and loop handling.
- [x] Wire Play/Stop to realtime scheduler.
- [x] Add current-step highlight in drum grid and timeline readout.
- [x] Update QA checks and docs.
- [x] Run validation.
- [x] Complete plan and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`: passed.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run verify`: passed.
- Browser rendering check: passed. Play changed the transport to Stop, current step advanced from 3 to 7 to 12 during playback, and Stop returned the UI to Ready with no playhead.

## Review Plan

QA completed before review. Review mirror is recorded in `docs/reviews/plan-004-audio-scheduler-review.md`.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Add realtime scheduler before persistence or advanced editors. | Timing is a P0 requirement for any beat workstation and affects both beginner confidence and professional trust. |
| 2026-06-15 | Keep WAV export on the offline render path. | Realtime playback and deterministic export have different constraints; export should remain reproducible from project data. |
| 2026-06-15 | Drive UI playhead from scheduled musical steps, not from the audio rendering loop. | UI feedback should be a view of transport state and should not become the audio clock. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Opened plan for realtime scheduler and transport feedback. |
| 2026-06-15 | harness_builder | Added shared timing helpers, realtime Web Audio scheduler, UI playhead feedback, and QA checks. |
| 2026-06-15 | quality_runner | Ran QA, quality gate, typecheck, build, verify, and browser playback checks. |
| 2026-06-15 | review_judge | Created review mirror with no blocking findings. |

## Completion Notes

GrooveForge now uses realtime loop playback for the preview path. The transport exposes a two-bar loop readout, drum and note grids show the current step while playing, and WAV export remains on the offline render path.
