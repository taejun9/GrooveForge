# plan-359-capture-step-mode

## Status

complete

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat workstation that can satisfy working producers while staying approachable for first-time composers.

## Goal

Add a UI-local Capture Step Mode for Desktop Keyboard Capture and Web MIDI Input so beginners can keep entering notes into the next empty step while producers can intentionally replace the currently selected step when correcting 808 or Synth phrases.

## Non-Goals

- Do not change project schema, saved project files, undo/redo mechanics, playback scheduling, render/export output, MIDI export, Handoff behavior, style profiles, note grids, or existing default note values beyond captured notes created through explicit Keyboard/MIDI input.
- Do not add audio recording, MIDI output, clock sync, controller mapping, automation recording, sampling, imported audio, sampler devices, remote AI, accounts, analytics, cloud sync, command chains, autoplay, or auto-export.
- Do not change focused-input keyboard guards, Web MIDI permission behavior, or the existing Keyboard Capture key map.

## Context Map

- `src/ui/App.tsx`
- `src/ui/workstationComposePanels.tsx`
- `src/ui/workstationPatternTools.ts`
- `src/ui/workstationUiModel.ts`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- Keep feature work off `main`.
- Keep Capture Step Mode UI-local and out of saved project schema.
- Route Keyboard Capture and Web MIDI Input through the same undoable note insertion path.
- Preserve existing next-empty-step behavior as the default.
- QA and review are separate loops.

## Implementation Plan

- [x] Add a `KeyboardCaptureStepMode` UI type and local App state with default `next-free`.
- [x] Route Keyboard Capture and MIDI Note On insertion through a shared step resolver that supports `next-free` and `replace-selected`.
- [x] Add a compact Capture Step Mode control to the Keyboard Capture panel and direct Quick Actions for both modes.
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

QA completes before review starts. Review should verify that Capture Step Mode stays UI-local, defaults to next-free, only affects explicit Keyboard Capture or armed MIDI Note On insertion, replaces only the selected target track step when requested, preserves focused-input guards and MIDI permission behavior, and avoids sampling/remote/cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add a UI-local capture step mode instead of changing the default capture behavior. | Beginners already benefit from next-empty-step entry; producers need a deliberate correction mode without surprising existing users. |
| 2026-06-18 | Keep `replace-selected` limited to explicit Keyboard Capture and armed MIDI Note On insertion for the selected target track. | This gives producers a correction path for 808/Synth phrases without changing project schema, saved files, playback, or default composition flow. |
| 2026-06-18 | Extract capture-step resolver and Quick Action creation into `workstationPatternTools`. | The production app entry stayed under the build warning threshold without changing the chunk limit. |
| 2026-06-18 | Record browser visual QA as unavailable. | The local dev server failed to bind to `127.0.0.1:5173` with `EPERM`, and the escalated retry was rejected by the approval reviewer. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created in `codex/plan-359-capture-step-mode`. |
| 2026-06-18 | harness_builder | Added UI-local Capture Step Mode state, shared step resolution, replacement insertion behavior, panel controls, Quick Actions, and Command Reference coverage. |
| 2026-06-18 | repo_cartographer | Updated README, product docs, quality rules, and harness expectations so Keyboard Capture and Web MIDI stay beat-first and sample-free by default. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run qa`, `npm run typecheck`, `npm run build`, `npm run verify`, and `git diff --check`; build produced no chunk warning and app entry was 499.75 kB. |
| 2026-06-18 | review_judge | Review found no blocking issues; only residual risk is that browser visual QA could not run because localhost binding was blocked. |
