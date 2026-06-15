# plan-031-arrangement-playback

## Goal

Make realtime playback follow the arrangement timeline by default while preserving a fast Pattern preview mode for focused editing.

## Context

GrooveForge now has arrangement templates and per-block bar lengths. Export already follows total arrangement bars, but realtime Play still loops only the selected Pattern A/B/C for two bars. That makes the app feel inconsistent: users can arrange a full beat but cannot immediately hear that structure without exporting.

## Scope

- Add arrangement-aware realtime scheduling that maps playback bars to arrangement blocks and Pattern A/B/C assignments.
- Keep a Pattern preview mode for fast local editing.
- Update transport UI copy and status so users can see whether they are hearing the arrangement or the selected pattern.
- Keep stop/reset behavior, keyboard Space playback, mixer/sound/chord/drum scheduling, and export behavior intact.
- Update product docs, quality rules, and static QA expectations.

## Non-Goals

- No audio sampling, audio import, chopping, sampler tracks, or audio warping.
- No timeline drag playhead, loop region editing, punch-in, or live project edit rescheduling in this slice.
- No persistence of the playback mode in project files.

## Files

- `src/audio/scheduler.ts`
- `src/ui/App.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/reviews/plan-031-arrangement-playback-review.md`

## Acceptance

- Default realtime playback follows arrangement blocks, bar counts, and Pattern A/B/C assignments.
- Pattern preview mode still loops the selected pattern for two bars.
- Transport status clearly distinguishes Arrangement playback from Pattern preview and shows current section/pattern while playing.
- Space shortcut still toggles playback.
- Existing instrument, mixer, sidechain, chord, drum timing, and master handling remains active in realtime playback.
- Browser validation confirms Arrangement mode advances through the full arrangement, Pattern mode previews selected Pattern B, Stop resets status, and console errors are 0.
- `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check` pass.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-15 | Make Arrangement the default realtime playback mode. | The app should hear the same song structure it exports, which is closer to a finished beat workstation. |
| 2026-06-15 | Keep Pattern preview as a transport mode, not project data. | Pattern preview is a local editing preference and should not affect saved beat files or export semantics. |

## Progress

- [x] Created plan/worktree.
- [x] Implement arrangement playback mode.
- [x] Update docs and harness.
- [x] Run QA and browser validation.
- [x] Create review mirror.
- [x] Ready for merge lifecycle.

## Outcome

Realtime playback now defaults to the arrangement timeline. The scheduler maps bars through arrangement blocks, per-block bar counts, and Pattern A/B/C assignments, while the transport still offers a Pattern preview mode for fast selected-pattern looping. The transport status now shows section or pattern context while playing, Stop resets cleanly, and Space continues to toggle playback outside editable controls.
