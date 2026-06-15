# plan-032-live-playback-edits

## Status

active

## Owner

project_lead / plan_keeper

## Goal

Make realtime playback follow project edits while it is running, so users can tweak patterns, arrangement, mixer, sound, BPM, and master choices without stopping and restarting.

## Context

Arrangement playback now follows the full song timeline, but the scheduler still captures the project object from the moment Play is pressed. Producers expect loop and arrangement playback to react to edits quickly, and beginners need to hear changes immediately to understand cause and effect.

## Scope

- Let realtime playback read the latest project state while scheduling future steps.
- Keep already-scheduled audio events stable; edits can take effect from the next scheduler window onward.
- Make BPM, selected Pattern preview, arrangement block/pattern changes, sound/mixer/master changes, and arrangement length changes affect running playback.
- Preserve Stop behavior, Space shortcut behavior, export behavior, and project save/load semantics.
- Update product docs, quality rules, and static QA expectations.

## Non-Goals

- No audio sampling, audio import, chopping, sampler tracks, or audio warping.
- No cancellation of already-triggered Web Audio nodes.
- No live collaborative sync or external MIDI/audio input.

## Files

- `src/audio/scheduler.ts`
- `src/ui/App.tsx`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/reviews/plan-032-live-playback-edits-review.md`

## Acceptance

- Realtime playback receives a latest-project getter instead of relying only on the initial Play snapshot.
- Pattern preview mode follows selected Pattern A/B/C changes while playing.
- Arrangement playback follows arrangement block/pattern/length changes on future scheduled steps.
- BPM and master output changes update future scheduling/output without stopping playback.
- Browser validation confirms editing Pattern mode while playing changes transport context without stopping, arrangement template changes alter running arrangement status, Space still toggles playback, and console errors are 0.
- `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check` pass.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-15 | Use a latest-project getter in the scheduler. | This keeps Web Audio scheduling centralized and avoids restarting playback on every edit. |
| 2026-06-15 | Apply edits to future scheduled steps only. | Already-started oscillators/noise buffers cannot be cleanly rewritten without a deeper voice-management engine. |

## Progress

- [x] Created plan/worktree.
- [x] Implement live playback edit updates.
- [x] Update docs and harness.
- [x] Run QA and browser validation.
- [x] Create review mirror and complete lifecycle.

## Progress Log

| Date | Role | Note |
|---|---|---|
| 2026-06-15 | project_lead | Created plan/worktree for live playback edit updates. |
| 2026-06-15 | harness_builder | Added latest-project scheduling in realtime playback and passed `getProject: () => projectRef.current` from the UI. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for live edit playback. |
| 2026-06-15 | quality_runner | Browser validation passed: Pattern preview changed from Pattern A to Pattern C while playing, arrangement template changed running playback from Intro/Pattern A to Hook/Pattern B, Space toggled playback, and console errors were 0. |
| 2026-06-15 | quality_runner | `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check` passed. |
| 2026-06-15 | review_judge | Created completion review mirror with no blocking findings. |
