# plan-362-808-velocity

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat workstation that can satisfy working producers while staying approachable for first-time composers.

## Goal

Make 808/Bass note velocity first-class editable event data so MIDI controllers, direct 808 editing, realtime playback, WAV/stem export, save/load, and note copy/duplicate flows preserve low-end dynamics.

## Non-Goals

- Do not change track types, add audio import, sampling, sampler devices, recording, MIDI output, controller mapping, remote AI, accounts, analytics, cloud sync, macros, autoplay, or auto-export.
- Do not change melody/chord/drum velocity semantics beyond keeping shared selected-note controls coherent.
- Do not add a new 808 instrument or replace existing synth 808 sound design.

## Context Map

- `src/domain/workstation.ts`
- `src/audio/scheduler.ts`
- `src/audio/render.ts`
- `src/ui/App.tsx`
- `src/ui/workstationComposePanels.tsx`
- `src/ui/workstationPatternTools.ts`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- Keep feature work off `main`.
- Migrate old BassNote data to a safe default velocity.
- Preserve sample-free direct beat composition.
- Keep 808 velocity explicit, undoable, save/load compatible, and audible in realtime plus export.
- QA and review are separate loops.

## Implementation Plan

- [x] Add `velocity` to `BassNote` and migration/validation defaults.
- [x] Route 808 grid/manual notes, bassline/glide/contour pads, MIDI capture, copy/paste/duplicate, realtime playback, export, and editor audition through BassNote velocity.
- [x] Expose selected 808 velocity editing in the existing note editor controls.
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

QA completes before review starts. Review should verify that 808 velocity is first-class event data, migrated for old projects, editable for selected 808 notes, preserved by copy/duplicate/pads, reflected in realtime/export/editor audition, and still sample-free/local with no recording, sampler, cloud, remote AI, or hidden automation scope.

## QA Results

- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run harness:smoke` passed: 10/10 sample-free Beat Blueprints and 10/10 supported style profiles.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run qa` passed.
- `npm run verify` passed.
- `git diff --check` passed.
- Extra migration smoke passed: a serialized old project missing `BassNote.velocity` parsed back with default velocity `0.82`.
- Browser/dev-server visual QA was attempted but blocked by environment policy: `npm run dev -- --host 127.0.0.1 --port 5173` failed with `listen EPERM`, and escalated localhost server startup was rejected. No workaround was attempted.

## Review Summary

Post-QA review found no blocking issues. `BassNote.velocity` is first-class data with migration for old project files, new 808 notes from manual grid, Bassline Pads, Pattern Stack, Keyboard Capture, and Web MIDI receive velocity, selected 808 notes expose the shared velocity slider, copy/paste/duplicate preserve note shape by object copy, and realtime playback, editor audition, WAV/stem render, and arrangement MIDI export use BassNote velocity. The change remains local, sample-free, and does not add recording, sampler, imported audio, remote AI, cloud sync, analytics, accounts, autoplay, or hidden automation.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add 808 velocity to BassNote instead of treating it as UI-only display. | Working producers need low-end dynamics and MIDI controller expression; beginners keep safe defaults without extra setup. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created in `codex/plan-362-808-velocity`. |
| 2026-06-18 | harness_builder | Implemented first-class BassNote velocity across migration, defaults, MIDI capture, selected-note editing, realtime playback, editor audition, WAV/stem render, arrangement MIDI export, docs, and QA expectations. |
| 2026-06-18 | quality_runner | QA, quality gate, runtime smoke, typecheck, build, npm qa, npm verify, diff check, and migration smoke passed. Browser visual QA remained blocked by localhost listen policy. |
| 2026-06-18 | review_judge | Review completed after QA with no findings. |
