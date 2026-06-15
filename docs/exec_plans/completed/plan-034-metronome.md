# plan-034-metronome

## Status

active

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add a realtime metronome toggle to the transport so beginners can hear the beat grid and working beatmakers can program against an audible reference click while patterns and arrangements play.

## Non-Goals

- No audio recording, MIDI input, count-in, or loop-region editing.
- No metronome audio in WAV/stem export.
- No sampling, audio import, chopping, sampler tracks, or audio warping.

## Context Map

- `src/domain/workstation.ts`: project state, starter project, project file migration.
- `src/audio/scheduler.ts`: realtime playback scheduling.
- `src/ui/App.tsx`: transport UI and project update flow.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: durable product and QA rules.
- `harness/scripts/run_qa.py`: static guardrails.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep the product beat-first; metronome supports direct composition and must not add sample workflows.

## Implementation Plan

- [x] Add `metronomeEnabled` to project state with migration for older project files.
- [x] Schedule an accented realtime click on beat 1 and lighter clicks on beats 2-4 when enabled.
- [x] Add a transport toggle with clear status text and save/load persistence.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA and browser validation, then complete lifecycle.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser validation: toggle Metronome on/off, confirm transport status updates, playback remains stable, save/load migration remains valid, and console errors are 0.

## Review Plan

QA completes before review starts. Review checks that the metronome is realtime-only, saved in project state, migrated for older files, does not affect export/stems, and does not introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Store metronome as project state. | Users expect project playback settings to survive save/load, and live playback already reads current project state. |
| 2026-06-15 | Keep metronome out of WAV/stem export. | Click is a monitoring aid, not part of the beat audio. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created for realtime transport metronome. |
| 2026-06-15 | harness_builder | Added `metronomeEnabled` project state, migration defaulting older files to `false`, and save serialization for enabled projects. |
| 2026-06-15 | harness_builder | Added realtime accented beat-1 and lighter beat-2/3/4 click scheduling outside the export renderer. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for the metronome slice. |
| 2026-06-15 | quality_runner | Browser validation confirmed the Click toggle changes `aria-pressed`, playback remains stable with the click enabled, and console errors are 0. |
| 2026-06-15 | quality_runner | Domain compile check confirmed old project JSON migrates to `metronomeEnabled: false` and saved enabled projects serialize `metronomeEnabled: true`. |
| 2026-06-15 | quality_runner | `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check` passed. |
| 2026-06-15 | review_judge | Created completion review mirror with no blocking findings. |

## Completion Notes

Realtime transport metronome is implemented, saved in project state, migrated for older files, and kept out of WAV/stem export.
