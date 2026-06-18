# plan-357-build-chunk-followup

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue building GrooveForge into a desktop beat workstation that can satisfy working producers while staying approachable for beginners.

## Goal

Remove the recurring production build large-chunk warning through real code separation, preserving all app behavior and the all-genre direct beat-workstation scope.

## Non-Goals

- Do not raise or disable `chunkSizeWarningLimit`.
- Do not change project schema, save/load migration, playback, audio rendering, WAV/stem/MIDI export, Handoff behavior, local draft behavior, or Quick Actions behavior.
- Do not add or promote sampling, imported audio, sampler devices, remote AI, accounts, analytics, payments, or cloud sync.
- Do not redesign the UI or change user-facing workflows beyond any required import/module boundaries.

## Context Map

- `src/ui/App.tsx`
- `src/ui/`
- `src/ui/workstationMixPanels.tsx`
- `src/ui/workstationComposePanels.tsx`
- `src/ui/workstationShellPanels.tsx`
- `src/styles.css`
- `vite.config.ts`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- Keep feature work off `main`.
- Split real modules from the oversized app entry instead of hiding the warning.
- Prefer pure UI/model/helper extraction that keeps runtime behavior identical.
- Keep chunk groups explicit and covered by harness expectations.
- QA and review are separate loops.

## Implementation Plan

- [x] Identify a high-yield App module boundary with minimal behavior risk.
- [x] Extract that boundary into one or more `src/ui/` modules.
- [x] Add/adjust Vite chunk group rules for the extracted module.
- [x] Update docs and harness expectations for the new chunk.
- [x] Run QA, typecheck, build, verify, and confirm build emits no large-chunk warning.
- [x] Complete plan and create review mirror.

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

QA completes before review starts. Review should verify the production build warning is actually removed, `chunkSizeWarningLimit` is not raised, extracted modules preserve behavior, and no product scope, sampling boundary, export, playback, save/load, or Quick Actions semantics changed.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Treat large-chunk warning as a completion-readiness regression. | The warning was previously fixed by plan-322 and has recurred as the workstation surface grew. |
| 2026-06-18 | Split render-only mix/master, compose/editor, and shell panels out of `src/ui/App.tsx`. | A mix-only split reduced the chunk but did not remove the warning; three panel chunks brought the app entry below the warning threshold without changing workflow behavior. |
| 2026-06-18 | Keep `src/ui/App.tsx` QA expectations as an App UI surface across extracted panel files. | Existing token checks described the visible App surface, so the harness now verifies those tokens across `App.tsx` plus the extracted panel modules. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created in `codex/plan-357-build-chunk-followup`. |
| 2026-06-18 | harness_builder | Added `workstationMixPanels.tsx`, `workstationComposePanels.tsx`, and `workstationShellPanels.tsx` render-only panel chunks. |
| 2026-06-18 | harness_builder | Added Vite/Rolldown groups for `workstation-mix-panels`, `workstation-compose-panels`, and `workstation-shell-panels`. |
| 2026-06-18 | quality_runner | `npm run build` now emits no large-chunk warning; app entry chunk is 497.73 kB after minification. |
| 2026-06-18 | quality_runner | QA passed: run_qa, quality_gate, runtime smoke, typecheck, build, npm qa, npm verify, and git diff check. |
| 2026-06-18 | review_judge | Post-QA review found no behavior, scope, sampling-boundary, export, playback, save/load, or Quick Actions regressions in the diff. |

## Completion Notes

Implemented real chunk separation without raising `chunkSizeWarningLimit`.

QA:

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`

Production build result: Vite completed without the large-chunk warning, with `dist/assets/index-C0BBv27G.js` at 497.73 kB after minification.
