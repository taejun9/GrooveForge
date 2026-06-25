# plan-726-editor-audition-fallback

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge so working producers and first-time beat makers can both use it, keep the app centered on all-genre direct beat composition, report completion progress after each task, and report every 10 completed plans.

## Goal

Show a UI-local Editor Audition fallback result when a selected drum hit, 808/Synth note, or chord audition cannot start in the current runtime, so users still see the selected event, likely runtime cause, and the next direct-composition listening check instead of only a generic status line.

## Non-Goals

- Do not change the existing Web Audio one-shot scheduler, built-in sound design, mixer/master posture, or successful editor audition audio behavior.
- Do not change selected-event routing, selected-event state, Quick Actions command ids, command ordering, or visible audition button availability.
- Do not change project schema, save/load, local drafts, undo/redo, realtime playback state, render/export bytes, MIDI export, Handoff Pack, or Handoff Sheet.
- Do not add autoplay, loops, recording, audio input, sample import, sampler devices, MIDI output, clock sync, remote AI, accounts, analytics, cloud sync, macros, auto-save, or auto-export.

## Context Map

- `src/ui/editorAudition.ts` owns selected-event one-shot audition routing and runtime failure handling.
- `src/ui/App.tsx` owns Editor Audition Result state, success result derivation, and result strip rendering.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` pin product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-726-editor-audition-fallback` and `.worktree/plan-726-editor-audition-fallback` for git repository work.
- Preserve the product invariant that GrooveForge is an all-genre direct beat workstation and sampling remains optional extension scope.

## Implementation Plan

- [x] Return structured editor audition outcomes so failure can carry runtime detail without swallowing selected-event context.
- [x] Add failed Editor Audition Result derivation for selected drums, 808/Synth notes, and chords using the same selected-event metadata as success results.
- [x] Render the fallback result only after an explicit audition attempt fails, while keeping stale result clearing and project data unchanged.
- [x] Update product/docs language and QA harness expectations for Editor Audition fallback feedback.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that Editor Audition fallback feedback is UI-local, explicit, non-mutating, sample-free, and only appears after a failed selected-event audition attempt, while successful one-shot Web Audio audition, project data, playback, export, MIDI, Handoff, remote, and sampling boundaries remain unchanged.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-25 | Add failure-result feedback instead of changing Web Audio scheduling. | The scheduler already provides the intended one-shot audition path; users need clearer fallback context when a runtime blocks AudioContext startup. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-25 | project_lead | Plan created for explicit Editor Audition runtime fallback feedback. |
| 2026-06-25 | harness_builder | Added structured audition outcomes plus UI-local fallback Editor Audition Result labels for runtime-blocked one-shot audio startup. |
| 2026-06-25 | quality_runner | Full QA passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles. |
| 2026-06-25 | review_judge | Review found no successful audition audio path, project schema, undo/history, playback, render/export, MIDI, Handoff, remote, or sampling scope regressions. |

## Completion Notes

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run qa` passed.
- `npm run verify` passed, including sample-free runtime smoke across 14 blueprints and 14 style profiles.
- Editor Audition now returns structured success/failure outcomes and shows a UI-local fallback result when runtime audio startup blocks an explicit selected drum, 808/Synth note, or chord audition attempt.
- Successful one-shot Web Audio audition, selected-event routing, stale result clearing, project schema, save/load, undo/redo, realtime playback, render/export, MIDI export, Handoff, remote, and sampling boundaries remain unchanged.
