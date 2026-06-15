# plan-070-handoff-sheet

## Status

Active

## Owner

Team Forge

## User Request

Continue completing GrooveForge as a desktop beat workstation that can satisfy working composers while remaining easy for first-time composers.

## Goal

Add a local Handoff Sheet export that turns the current beat, Delivery Target, Session Brief, arrangement, and deterministic render analysis into a plain text summary for collaboration, DAW handoff, and beginner review.

## Scope

- Add deterministic Handoff Sheet text generation from local project state, selected Delivery Target, Session Brief, arrangement bars, Pattern A/B/C usage, export analysis, and stem analysis.
- Add an explicit `Sheet` export action in the command strip and Quick Actions.
- Keep the export local, user-triggered, and free of platform compliance, publishing, licensing, or mastering guarantees.
- Preserve save/load, snapshots, undo/redo, realtime playback, WAV/stem/MIDI export, Beat Readiness, Beat Map, Next Move, Mix Coach, Delivery Target, and Session Brief semantics.
- Update README, product docs, quality rules, harness expectations, exec plan, and review mirror.

## Non-Goals

- No PDF/DOCX generation, cloud sharing, accounts, collaboration service, media upload, remote AI, remote analysis, analytics, payments, sampling, imported audio, plugin hosting, or publishing/legal/licensing conclusions.
- No mutation of musical events, arrangement, mixer, master, Session Brief, or Delivery Target from exporting the sheet.
- No LUFS/true-peak/platform-compliance claims.

## Files

- `src/ui/App.tsx`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/active/plan-070-handoff-sheet.md`
- `docs/reviews/plan-070-handoff-sheet-review.md`

## Implementation Steps

- [x] Inspect existing export, Quick Actions, Delivery Target, Session Brief, Beat Map, and analysis paths.
- [x] Add Handoff Sheet text/file helpers and explicit export handler.
- [x] Add command strip and Quick Actions entry for Sheet export.
- [x] Update docs and static QA expectations.
- [x] Run automated QA, browser smoke, review, and completion flow.

## QA Plan

- [x] `python3 harness/scripts/run_qa.py`
- [x] `python3 harness/scripts/run_quality_gate.py`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run qa`
- [x] `npm run verify`
- [x] Browser smoke: confirm Sheet export action exists, clicking it updates the export status, console errors are empty, and horizontal overflow is false. The in-app Browser does not support download events, so TypeScript/build/static QA cover the `.txt` download and content-generation paths.

## Review Plan

Review starts only after QA passes. Confirm the Handoff Sheet is deterministic, local-only, explicit-click, read-only over project state, useful for beginner/pro handoff, and does not introduce sampling, media upload, remote services, hidden automation, compliance claims, or export path regressions.

## Decision Log

| date | decision | rationale |
|---|---|---|
| 2026-06-16 | Add plain text Handoff Sheet before richer document formats. | It improves producer handoff and beginner review immediately while staying local, deterministic, lightweight, and separate from media/collaboration scope. |

## QA Results

| command | result |
|---|---|
| `python3 harness/scripts/run_qa.py` | pass |
| `python3 harness/scripts/run_quality_gate.py` | pass |
| `npm run typecheck` | pass |
| `npm run build` | pass |
| `npm run qa` | pass |
| `npm run verify` | pass |
| Browser smoke at `http://127.0.0.1:5178/` | pass with runtime limitation: Codex in-app Browser does not support download events, so smoke verified the Sheet button exists, click updates status to `Exported untitled-beat-handoff.txt`, console errors are 0, and horizontal overflow is false. Typecheck/build/static QA verify the `downloadTextFile` and `createHandoffSheet` code paths. |

## Implementation Notes

- Added local Handoff Sheet text generation from project title, style, BPM/key, Delivery Target, Session Brief, arrangement blocks, export meter, and stem meter state.
- Added a command-strip `Sheet` export button and Quick Actions export command.
- Kept Handoff Sheet export read-only over project state and separate from WAV/stem/MIDI export behavior.
- Updated README, product docs, quality rules, and static QA expectations.

## Review Result

No findings. Handoff Sheet export is local, explicit-click, deterministic from local state, and does not mutate the project or add sampling, media upload, remote services, compliance, licensing, or mastering claims.
