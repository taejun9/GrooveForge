# plan-074-transport-loop

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add explicit Transport Loop controls so users can audition the full arrangement, the selected arrangement block, or the selected Pattern loop without changing exported audio or project musical data. This should make repeated composition checks faster for working producers and clearer for beginners.

## Non-Goals

- No sampling, imported audio, audio clip, chopping, plugin hosting, remote AI, accounts, analytics, or cloud sync work.
- No project schema changes; loop scope is a local playback preference.
- No timeline drag selection, punch-in recording, audio recording, or export-region rendering.
- No changes to Pattern A/B/C event data, arrangement blocks, mixer/master state, WAV export, stem export, MIDI export, or Handoff Sheet semantics.

## Context Map

- `src/ui/App.tsx` owns transport state, command-strip buttons, selected arrangement block state, and Quick Actions.
- `src/audio/scheduler.ts` already supports playback `mode` and an optional `bars` value for loop length.
- `src/domain/workstation.ts` provides `normalizeArrangementBars`, `arrangementTotalBars`, and `barCountLabel` utilities.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md` describe the beat-first transport and QA boundaries.
- `harness/scripts/run_qa.py` enforces product wording and source-token expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Transport Loop must remain local, explicit, deterministic, and sample-free.

## Implementation Plan

- [x] Add local transport loop scope state and labels for Arrangement, Block, and Pattern loop playback.
- [x] Wire loop scope into `startRealtimePlayback` using existing playback mode and bars options.
- [x] Add compact transport controls plus Quick Actions for loop scope changes.
- [x] Keep status/readouts clear when playing and stopped.
- [x] Update docs, quality rules, and QA script expectations.

## QA Plan

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Dev-server HTTP 200 check if local server startup is available.

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Keep loop scope as local UI playback state, not project file data. | Loop audition is an editing preference and must not change save/load, export, stem, MIDI, or handoff semantics. |
| 2026-06-16 | Reuse scheduler `bars` option for selected-block and pattern loop lengths. | Existing scheduler already loops over the requested bar count, reducing risk to audio timing and render paths. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created from main after plan-073. |
| 2026-06-16 | harness_builder | Added local Song/Block/Pattern loop scope state, selected-block start bar playback offset, transport controls, and Quick Actions. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and QA expectations. |
| 2026-06-16 | quality_runner | `npm run typecheck`, `npm run build`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, and `npm run verify` passed. |
| 2026-06-16 | quality_runner | Worktree dev server returned HTTP 200 at `http://127.0.0.1:5182/`. |

## Completion Notes

Transport Loop is implemented as local UI playback state. The command strip now offers Song, Block, and Pattern loop choices; Quick Actions can set the same loop scope; and realtime playback passes a selected-block start bar plus bar length into the scheduler for Block loop audition. The change does not alter saved project data, Pattern A/B/C events, arrangement data, WAV/stem/MIDI export, or Handoff Sheet semantics.

Validation passed:

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `curl -I http://127.0.0.1:5182/` returned HTTP 200 for the worktree dev server.
