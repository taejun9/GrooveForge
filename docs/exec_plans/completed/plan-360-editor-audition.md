# plan-360-editor-audition

## Status

complete

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat workstation that can satisfy working producers while staying approachable for first-time composers.

## Goal

Add UI-local editor audition controls so users can quickly hear selected Drums, 808, Synth, and Chord events while composing directly, without starting playback or introducing sampling/audio-recording scope.

## Non-Goals

- Do not change project schema, saved project files, undo/redo mechanics, realtime playback scheduling, render/export output, MIDI export, Handoff behavior, style profiles, or arrangement data.
- Do not add recording, audio input, sample import, sampler devices, MIDI output, clock sync, controller mapping, remote AI, accounts, analytics, cloud sync, autoplay, auto-export, or command chains.
- Do not use audition controls to mutate note, drum, chord, sound, mixer, or master data.

## Context Map

- `src/audio/scheduler.ts`
- `src/ui/editorAudition.ts`
- `src/ui/selectedEventQuickActions.ts`
- `src/ui/App.tsx`
- `src/ui/workstationComposePanels.tsx`
- `src/ui/workstationUiModel.ts`
- `src/styles.css`
- `vite.config.ts`
- `docs/architecture/harness.md`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- Keep feature work off `main`.
- Keep editor audition UI-local and out of saved project schema.
- Reuse built-in synthesis and current project sound/mixer posture.
- Keep audition explicit through visible controls or direct Quick Actions only.
- Preserve focused-input keyboard guards, Web MIDI permission behavior, playback, export, and all sample-free guarantees.
- QA and review are separate loops.

## Implementation Plan

- [x] Add a scheduler-level one-shot audition API for Drum, 808, Synth, and Chord events using the current built-in audio engine.
- [x] Add compact audition controls to selected Drum, selected Note, and Chord editor surfaces.
- [x] Add direct Quick Actions for selected-event audition commands with disabled states when no matching selection exists.
- [x] Update docs, quality rules, and harness expectations.
- [x] Run QA, typecheck, build/verify, review, complete plan, and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`

## Review Plan

QA completes before review starts. Review should verify that editor audition is explicit, UI-local, sample-free, non-mutating, uses current built-in sound/mixer posture, does not alter playback/export behavior, and does not add any remote, recording, sampler, or persistence scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add editor audition as one-shot built-in synthesis instead of playback autoplay. | Beginners need immediate sound feedback and producers need fast pitch/tone checks, but the feature must not change project data or require samples. |
| 2026-06-18 | Split editor audition and selected-event Quick Actions into dedicated Vite chunks. | The first build exposed a main chunk warning; splitting the new UI-local code removed the warning without raising `chunkSizeWarningLimit`. |
| 2026-06-18 | Keep browser visual QA blocked rather than work around sandbox policy. | Vite dev server listen failed with `EPERM`, and the escalation request was rejected by environment policy. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created in `codex/plan-360-editor-audition`. |
| 2026-06-18 | harness_builder | Added `playEditorAudition` for selected Drum, 808, Synth, and Chord one-shots using current built-in sound, mixer, and master posture. |
| 2026-06-18 | harness_builder | Added visible Audition controls plus direct Quick Actions for selected drum hits, notes, and chords. |
| 2026-06-18 | repo_cartographer | Updated product, quality, harness, README, and build-splitting docs to keep audition explicit, UI-local, sample-free, and out of schema/export/playback state. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. |
| 2026-06-18 | review_judge | Review found no blocking issue after moving editor audition and selected-event Quick Actions into dedicated chunks; browser visual QA remains blocked by local server sandbox policy. |
