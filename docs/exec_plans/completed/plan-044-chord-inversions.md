# plan-044-chord-inversions

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱으로 완성시켜줘.

## Goal

Add beginner-safe chord inversion controls so chord progressions can use smoother voicings without leaving the direct beat-composition workflow. Chord inversion must be editable per chord event, saved/loaded, audible in realtime playback and WAV/stem export, undoable, migrated for older project files, and still sample-free.

## Non-Goals

- No sampling, audio import, chopping, sampler tracks, plugin hosting, MIDI recording, remote AI, or audio warping.
- No full piano-roll rewrite, advanced voice-leading engine, reharmonization assistant, chord extension browser, or automatic arrangement rewrite.
- No changes to drum, 808, melody, arrangement, mixer, master, or key-retarget behavior beyond preserving chord inversion data.

## Context Map

- `src/domain/workstation.ts`: `ChordEvent`, chord preset generation, project normalization, `chordPitches`.
- `src/audio/scheduler.ts`: realtime chord playback uses `chordPitches`.
- `src/audio/render.ts`: offline full-mix/stem chord rendering uses `chordPitches`.
- `src/ui/App.tsx`: chord event editor and undoable project updates.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`: product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-044-chord-inversions` and `.worktree/plan-044-chord-inversions` for git repository work.
- Inversions must remain local editable musical event data, not rendered samples or hidden audio assets.

## Implementation Plan

- [x] Add normalized per-chord inversion data with migration for older project files.
- [x] Make chord pitch generation apply inversion in realtime and offline render paths through the shared `chordPitches` helper.
- [x] Add compact chord inversion controls in the Chord editor and keep updates undoable.
- [x] Update docs and QA expectations.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- [x] `npm run typecheck`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `python3 harness/scripts/run_quality_gate.py`
- [x] `npm run verify`
- [x] `git diff --check`
- [x] Browser smoke test: changed the first chord inversion from Root to 1st, confirmed the chord badge/control updated, undo restored Root, playback started/stopped, export meter stayed non-silent, and console errors were empty.

## Review Plan

QA completes before review starts. Review checks that inversion persists in project data, migrates old files to root position, affects realtime/export chord pitches through the shared helper, remains undoable and beginner-safe, and does not introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Add per-chord inversion before a full voice-leading engine. | Inversions improve musical usefulness for producers and provide a simple beginner control without adding heavy theory or timeline complexity. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created to improve chord composition depth while keeping the app direct-composition first. |
| 2026-06-15 | harness_builder | Added `ChordEvent.inversion`, migration, chord pitch inversion, and compact Chord editor controls. |
| 2026-06-15 | doc_gardener | Updated product docs, quality rules, and static QA expectations for chord inversion. |
| 2026-06-15 | quality_runner | Ran typecheck, static QA, quality gate, verify, diff check, and Browser smoke. |
| 2026-06-15 | review_judge | Confirmed inversion remains editable musical event data and does not add sampling workflow drift. |

## Completion Notes

Implemented per-chord Root/1st/2nd inversion controls. Inversion migrates older chord events to Root, persists in project data, changes the shared chord pitch helper used by realtime playback and offline WAV/stem rendering, remains undoable, and keeps the workflow sample-free.
