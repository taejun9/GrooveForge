# plan-069-session-brief

## Status

Active

## Owner

Team Forge

## User Request

Continue completing GrooveForge as a desktop beat workstation that can satisfy working composers while remaining easy for first-time composers.

## Goal

Add a local Session Brief so beginners can write the intent of a beat and working producers can keep artist, vibe, reference, and handoff notes inside the project file.

## Scope

- Add a `sessionBrief` project field with safe migration for older files.
- Store artist, vibe, reference, and notes as bounded local text fields.
- Add a compact Session Brief UI near Delivery Targets and Beat Map.
- Make Beat Map reflect whether the current beat has a usable brief.
- Preserve save/load, snapshots, undo/redo, realtime playback, WAV/stem/MIDI export, Beat Readiness, Next Move, Mix Coach, and Delivery Target semantics.
- Update README, product docs, quality rules, harness expectations, exec plan, and review mirror.

## Non-Goals

- No cloud collaboration, accounts, sharing, comments, file uploads, remote AI, remote analysis, analytics, payments, sampling, imported audio, plugin hosting, or hidden automation.
- No copyrighted reference audio or embedded media.
- No legal, licensing, publishing, or platform-compliance conclusions.
- No destructive changes to musical events, arrangement, mixer, master, or export state from editing the brief.

## Files

- `src/domain/workstation.ts`
- `src/ui/App.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/active/plan-069-session-brief.md`
- `docs/reviews/plan-069-session-brief-review.md`

## Implementation Steps

- [x] Inspect current project state, migration, snapshot, Delivery Target, and Beat Map paths.
- [x] Add Session Brief types, defaults, bounds, normalization, and snapshot cloning.
- [x] Add Session Brief UI with controlled local project updates.
- [x] Integrate brief readiness into Beat Map metrics.
- [x] Update docs and static QA expectations.
- [x] Run automated QA, browser smoke, review, and completion flow.

## QA Plan

- [x] `python3 harness/scripts/run_qa.py`
- [x] `python3 harness/scripts/run_quality_gate.py`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run qa`
- [x] `npm run verify`
- [x] Browser smoke: confirm Session Brief renders, editing fields updates Beat Map brief status, undo restores the prior brief, console errors are empty, and horizontal overflow is false.

## Review Plan

Review starts only after QA passes. Confirm Session Brief is local-only, safely migrated, bounded, undoable, included in save/load and snapshots, read by Beat Map without audio/export side effects, and avoids remote services, sampling, media uploads, hidden automation, and compliance claims.

## Decision Log

| date | decision | rationale |
|---|---|---|
| 2026-06-16 | Add Session Brief after Delivery Targets. | Delivery Targets define the outcome; a session brief captures artist/vibe/reference/notes so both beginners and working producers can keep intent inside the project. |

## QA Results

| command | result |
|---|---|
| `python3 harness/scripts/run_qa.py` | pass |
| `python3 harness/scripts/run_quality_gate.py` | pass |
| `npm run typecheck` | pass |
| `npm run build` | pass |
| `npm run qa` | pass |
| `npm run verify` | pass |
| Browser smoke at `http://127.0.0.1:5177/` | pass: Session Brief rendered, 4/4 field edit made Beat Map Brief usable, undo restored notes to empty and summary to 3/4, console errors were 0, horizontal overflow was false. |

## Implementation Notes

- Added `sessionBrief` to local project state with default empty fields, bounded migration, snapshot cloning, save/load parsing, and legacy project migration.
- Added a compact Session Brief row after Delivery Targets for artist, vibe, reference, and notes.
- Added a Beat Map Brief metric so the production overview can reflect whether the beat has usable intent/handoff context.
- Updated README, product architecture, product docs, quality rules, and static QA expectations while preserving the direct-composition product boundary.

## Review Result

No findings. Session Brief is local project metadata, does not alter musical events or render paths, and keeps sampling/import/media/collaboration work out of scope.
