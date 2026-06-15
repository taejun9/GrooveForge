# plan-023-drum-microtiming

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 현직 작곡가도 만족할 수 있고, 작곡을 처음 해보는 사람도 사용하기 쉬운 데스크탑 앱으로 완성시켜줘.

## Goal

Add editable drum microtiming so programmed beats can push or lay back individual drum hits without leaving the beginner-friendly step workflow. Timing offsets must persist in project files, migrate safely for older patterns, affect realtime playback and WAV/stem export, work with undo/redo, and remain sample-free.

## Non-Goals

- No full piano-roll timing lane, probability engine, groove extraction, swing quantize menu, or audio warping.
- No sampling, audio import, chopping, sampler tracks, or external drum kits.
- No claim that microtiming replaces professional groove programming or human performance editing.

## Context Map

- `src/domain/workstation.ts`: pattern data, drum dynamics, clone/migration/validation helpers.
- `src/audio/scheduler.ts`: realtime drum event scheduling.
- `src/audio/render.ts`: offline drum rendering for mix and stems.
- `src/ui/App.tsx`: drum grid, selected drum-step inspector, undoable pattern edits.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA wording.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-023-drum-microtiming` and `.worktree/plan-023-drum-microtiming` for git repository work.
- Preserve the composition-first invariant: microtiming is musical event data, not imported audio.
- Existing `.grooveforge.json` files without drum timing data must migrate safely.

## Implementation Plan

- [x] Add `drumTimings` to pattern data with clone, empty-pattern, migration, and validation support.
- [x] Add timing helper functions that clamp offsets to a beginner-safe range.
- [x] Apply drum timing offsets in realtime playback.
- [x] Apply drum timing offsets in full-mix WAV and stem export.
- [x] Add selected drum-step timing controls with `Early`, `On`, `Late`, and ms input.
- [x] Update docs and static QA expectations.
- [x] Verify with automated QA, domain checks, and browser interaction.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- Browser check at the local Vite app: select an active drum step, set Late timing, verify readout/input, undo/redo, playback start/stop, export meter remains non-silent, and confirm no console errors.
- Domain check: project save/load round-trips drum timing, legacy projects migrate to zero timing arrays, malformed timing is rejected, and helper clamps to the supported timing range.

## Review Plan

QA completes before review starts. Review checks that microtiming migrates old projects, preserves Pattern A/B/C independence, affects both realtime/export paths, stays beginner-discoverable, and does not introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Implement drum microtiming after velocity, hat repeat, and sidechain. | Timing offsets are a high-leverage pro groove feature while still fitting the current step inspector for beginners. |
| 2026-06-15 | Use milliseconds clamped to +/-35 ms. | A small range is musically useful, easy to understand, and avoids obvious off-grid scheduling surprises. |
| 2026-06-15 | Reset timing to 0 ms when a step is turned off. | Clearing a hit should remove hidden groove state so beginners do not get surprising timing if they re-enable it later. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created for selected drum-step microtiming. |
| 2026-06-15 | harness_builder | Added `drumTimings` event data with default 0 ms arrays, clone support, project migration, and import validation. |
| 2026-06-15 | harness_builder | Added `normalizeDrumTimingMs` and `drumStepTimingMs` helpers with a +/-35 ms supported range. |
| 2026-06-15 | harness_builder | Realtime playback and offline full-mix/stem rendering now apply lane-specific drum timing offsets to kick, clap, hat, and perc hits. |
| 2026-06-15 | harness_builder | Added selected drum-step timing controls with `Early`, `On`, `Late`, ms input, readout text, and step-grid timing badges. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for drum microtiming. |
| 2026-06-15 | quality_runner | Domain validation passed: timing round-tripped through save/load, legacy files migrated to 0 ms, invalid +70 ms was rejected, helper clamped to +/-35 ms, and clone changes did not mutate the original pattern. |
| 2026-06-15 | quality_runner | Browser validation passed: Hat 3 selected with On grid timing, Late applied +15 ms and step badge, undo cleared the badge, redo restored it, reselect showed Late +15 ms, manual input set Early -22 ms, playback start/stop worked, export meter remained non-silent, and console error logs were empty. |
| 2026-06-15 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run verify`, and `git diff --check`. |

## Completion Notes

Drum microtiming is now editable local musical event data. Users can nudge selected drum hits Early, On grid, Late, or enter exact millisecond offsets; the timing persists through save/load, migrates old projects safely, affects realtime playback and WAV/stem export, and remains separate from sampling workflows.
