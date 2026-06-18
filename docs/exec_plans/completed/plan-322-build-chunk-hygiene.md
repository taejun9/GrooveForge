# plan-322-build-chunk-hygiene

## Status

active

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Remove the production build large-chunk warning through real Vite/Rolldown chunk separation while preserving app behavior, project schema, playback, rendering, exports, and local-first beat-making scope.

## Non-Goals

- Do not hide the warning by setting `chunkSizeWarningLimit`.
- Do not change product behavior, UI semantics, project schema, save/load, undo/redo, playback, audio rendering, WAV/stem/MIDI export, Handoff behavior, Quick Actions, or local draft behavior.
- Do not add sampling, imported audio, plugin hosting, remote AI, accounts, analytics, cloud sync, packaging changes, or deployment changes.
- Do not work directly on `main`.

## Context Map

- `vite.config.ts`: Vite 8 / Rolldown code splitting groups.
- `src/ui/App.tsx`: current large workstation module that dominates the client entry chunk.
- `src/domain/workstation.ts`: pure domain model/helpers already intended for `workstation-core`.
- `README.md`, `docs/architecture/harness.md`, `docs/quality/rules.md`: build hygiene guardrails.
- `harness/scripts/run_qa.py`: static expectations for build configuration and docs.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Use `codex/plan-322-build-chunk-hygiene` and `.worktree/plan-322-build-chunk-hygiene` for repository work.

## Implementation Plan

- [x] Reproduce and inspect current production build chunk output.
- [x] Identify why eligible local modules do or do not split from the client entry chunk.
- [x] Apply the smallest real chunk-separation change that removes the warning without behavior changes.
- [x] Update docs and harness expectations if chunk names or validation criteria change.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `npm run build` with no large-chunk warning.
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost; otherwise record the environment blocker.

## Review Plan

QA completes before review starts. Review checks that build hygiene uses real code splitting, does not set `chunkSizeWarningLimit`, preserves `dist` output and sourcemaps, and does not alter app behavior, project data, playback, render/export, Handoff, sampling scope, or local-first boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Prioritize large-chunk warning removal as a desktop-app quality task. | The warning appears in repeated production builds and conflicts with the repository's build hygiene rule to use real chunk separation instead of suppressing warnings. |
| 2026-06-18 | Split `src/ui/App.tsx` model data and pure helper utilities into `workstation-ui-model` and `workstation-pattern-tools` chunks. | Vendor, audio, and domain chunks were already separated; the remaining warning came from the monolithic App entry, so the fix needed local UI module boundaries rather than a warning limit. |
| 2026-06-18 | Keep Browser smoke recorded as not run in this environment. | `npm run verify` covered runtime smoke, typecheck, and production build; the deferred tool search did not expose a callable in-app browser tool for localhost smoke in this session. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created on a dedicated worktree after main was clean at `1fbf634`. |
| 2026-06-18 | harness_builder | Reproduced the build warning, then extracted `src/ui/workstationUiModel.ts` and `src/ui/workstationPatternTools.ts` from `App.tsx` without changing project data, playback, render, export, Handoff, or local draft behavior. |
| 2026-06-18 | harness_builder | Added Vite/Rolldown groups for `workstation-ui-model` and `workstation-pattern-tools`, preserving `outDir: "dist"` and `sourcemap: true` and without adding `chunkSizeWarningLimit`. |
| 2026-06-18 | doc_gardener | Updated README, harness architecture, quality rules, and static QA expectations for the new UI chunks. |
| 2026-06-18 | quality_runner | QA passed: `npm run build` emitted `index-DdMTj-y1.js` at 498.90 kB with no large-chunk warning; `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run qa`, `npm run verify`, and `git diff --check` passed. |
| 2026-06-18 | review_judge | Reviewed build configuration, docs, harness expectations, and UI module extraction; no follow-up findings. |

## QA Results

| command | result |
|---|---|
| `npm run build` | passed; no large-chunk warning; app entry `index-DdMTj-y1.js` is 498.90 kB minified |
| `python3 harness/scripts/run_qa.py` | passed |
| `python3 harness/scripts/run_quality_gate.py` | passed |
| `npm run typecheck` | passed |
| `npm run qa` | passed |
| `npm run verify` | passed; runtime smoke covered 10/10 sample-free Beat Blueprints and 10/10 supported style profiles; production build had no large-chunk warning |
| `git diff --check` | passed |
| Browser smoke | not run; no callable in-app browser tool was exposed by deferred tool search in this session |

## Review Results

No findings. The change uses real Vite/Rolldown code splitting, keeps sourcemaps and `dist`, does not set `chunkSizeWarningLimit`, and does not change product behavior, project schema, playback, rendering, export, Handoff, local draft, sampling, remote AI, analytics, accounts, or cloud scope.
