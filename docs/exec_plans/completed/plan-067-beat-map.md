# plan-067-beat-map

## Status

Completed

## Owner

Team Forge

## User Request

Continue completing GrooveForge as a desktop beat workstation that can satisfy working composers while remaining easy for first-time composers.

## Goal

Add a Beat Map surface that turns the current project state into an explicit production path and readiness overview. The feature should help beginners see the next step in the beat-making workflow and help experienced producers quickly judge song length, Pattern A/B/C coverage, mix status, export state, and delivery readiness.

## Scope

- Add a deterministic local Beat Map summary derived from existing project state, arrangement data, Beat Readiness checks, export analysis, and stem analysis.
- Add a compact UI surface near Beat Blueprints, Beat Readiness, and Next Move.
- Include beginner-friendly stage progress without adding tutorial copy, accounts, remote AI, analytics, or hidden automation.
- Include producer-facing metrics such as bar count, arrangement blocks, Pattern A/B/C usage, stem readiness, mix health, and export/delivery status.
- Add one-click local actions for the most relevant next step using existing undoable project update paths.
- Update README, product docs, quality rules, harness expectations, exec plan, and review mirror.

## Non-Goals

- No AI generation, automatic background decisions, remote analysis, accounts, analytics, cloud sync, sampling, audio import, sampler tracks, plugin hosting, or hidden assets.
- No new project schema or persistence fields.
- No mutation from Beat Map cards themselves unless the user explicitly clicks an action button.
- No replacement of Beat Readiness, Next Move, Mix Coach, or existing arrangement controls.
- No claims about commercial release approval, platform loudness compliance, or professional mastering guarantees.

## Files

- `src/ui/App.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/active/plan-067-beat-map.md`
- `docs/reviews/plan-067-beat-map-review.md`

## Implementation Steps

- [x] Inspect current Beat Readiness, Next Move, Mix Coach, export, and arrangement UI paths.
- [x] Add Beat Map data helpers in the UI layer using existing deterministic analysis data.
- [x] Add a Beat Map section with beginner path stages, producer metrics, and explicit action buttons.
- [x] Route mutating actions through existing undoable update handlers.
- [x] Keep layout stable across desktop and narrower widths.
- [x] Update docs and static QA expectations.
- [x] Run automated QA, browser smoke, review, and completion flow.

## QA Plan

- [x] `python3 harness/scripts/run_qa.py` - passed.
- [x] `python3 harness/scripts/run_quality_gate.py` - passed.
- [x] `npm run typecheck` - passed.
- [x] `npm run build` - passed.
- [x] `npm run qa` - passed.
- [x] `npm run verify` - passed.
- [x] Browser smoke: Beat Map rendered at `http://127.0.0.1:5177/`, showed Start/Compose/Arrange/Polish/Deliver stages, showed song/pattern/export/stem metrics, ran the Beat Map Save Slot action, undo restored the previous snapshot count, console errors were empty, and horizontal overflow was false.

## Review Plan

Review starts only after QA passes. Confirm Beat Map is deterministic, read-only by default, explicit-click for actions, beginner/pro useful, sample-free, local-first, and does not weaken Beat Readiness, Next Move, Mix Coach, export, save/load, or undo/redo semantics.

## Decision Log

| date | decision | rationale |
|---|---|---|
| 2026-06-16 | Add Beat Map before deeper pro-only editing. | The current app has many powerful controls; a compact production path helps beginners navigate without reducing the producer-facing workstation surface. |

## Implementation Notes

- Added Beat Map summary helpers in `src/ui/App.tsx` that derive stage status, producer metrics, and action suggestions from local project state, Beat Readiness, export analysis, and stem analysis.
- Added a Beat Map UI row between Beat Readiness and Next Move.
- Beat Map action buttons reuse existing explicit handlers, including Blueprint, Pattern Fill, Pattern Chain, Chain Expand, Hook Lift, Mix Check, and Save Slot.
- Added layout CSS for desktop and narrower workspaces without adding a new project schema, background automation, sampling, imported audio, remote AI, analytics, accounts, or cloud sync.

## Review Summary

No findings. Beat Map is deterministic, read-only by default, uses explicit-click actions, and preserves Beat Readiness, Next Move, Mix Coach, playback, export, save/load, and undo/redo semantics.
