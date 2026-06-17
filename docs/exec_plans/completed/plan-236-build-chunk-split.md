# plan-236-build-chunk-split

## Status

active

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that working producers can respect and first-time composers can use easily. Keep sampling secondary and keep the desktop app production build healthy.

## Goal

Remove the recurring Vite large client chunk warning by splitting stable vendor code away from the workstation app chunk using Vite 8 / Rolldown output code splitting. This should improve build hygiene and desktop startup posture without changing runtime behavior.

## Non-Goals

- Do not raise `chunkSizeWarningLimit` just to hide the warning.
- Do not refactor `src/ui/App.tsx`, change app UI behavior, change routing, or introduce lazy-loaded user flows.
- Do not change project schema, audio engine, playback, save/load, WAV/stem/MIDI export, Handoff behavior, sampling, imported audio, remote AI, plugin hosting, accounts, analytics, or cloud sync.

## Context Map

- `vite.config.ts`: current Vite build config.
- Local installed Vite/Rolldown types: `build.rolldownOptions.output.codeSplitting.groups`.
- `README.md`: public runtime/build summary.
- `docs/architecture/harness.md`: build/verification architecture.
- `docs/quality/rules.md`: build hygiene guardrails.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-236-build-chunk-split` and `.worktree/plan-236-build-chunk-split` for git repository work.

## Implementation Plan

- [x] Add Vite 8 `build.rolldownOptions.output.codeSplitting.groups` for React, lucide icons, and other node_modules vendor code.
- [x] Keep sourcemaps and existing build output directory behavior.
- [x] Update docs/static QA so future build work keeps real chunk splitting instead of only raising warning limits.
- [x] Verify that `npm run build` and `npm run verify` no longer emit the large chunk warning.
- [x] Run QA, then review the diff after QA passes.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run typecheck`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that build configuration uses supported local Vite/Rolldown code splitting, does not suppress the warning by raising the limit, preserves sourcemaps and output paths, does not change app/runtime behavior, and does not touch sampling, audio, render/export, project schema, or remote/cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Use `build.rolldownOptions.output.codeSplitting.groups` instead of `chunkSizeWarningLimit`. | The goal is actual bundle separation and build hygiene, not hiding the warning. |
| 2026-06-17 | Split React, lucide, and remaining vendor dependencies into stable vendor chunks. | These imports are stable third-party code and can be cached separately from the large workstation app implementation. |
| 2026-06-17 | Also split `src/audio` and `src/domain` code groups. | Vendor-only splitting left the app entry chunk above the Vite warning threshold, so local engine/core code needed stable group boundaries without changing runtime behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | repo_cartographer | Confirmed the recurring large chunk warning appears across many completed reviews and current `vite.config.ts` has no chunk split configuration. |
| 2026-06-17 | harness_builder | Confirmed local Vite 8 / Rolldown types support `build.rolldownOptions.output.codeSplitting.groups`. |
| 2026-06-17 | harness_builder | Added build chunk groups for React, lucide, remaining vendor, audio engine, and workstation core while preserving `dist` output and sourcemaps. |
| 2026-06-17 | doc_gardener | Updated README, harness architecture, quality rules, and static QA expectations for real build chunk splitting instead of warning suppression. |
| 2026-06-17 | quality_runner | QA passed: run_qa, diff-check, typecheck, npm qa, quality gate, build, and verify. `npm run build` and the build inside `npm run verify` emitted chunk output without the large chunk warning. |
| 2026-06-17 | review_judge | Reviewed the diff for Vite/Rolldown chunk splitting, preserved sourcemaps/outDir, no `chunkSizeWarningLimit`, and no runtime, schema, audio, export, sampling, or remote scope changes. |

## Completion Notes

Implemented production build chunk splitting through Vite 8 / Rolldown groups while preserving `outDir: "dist"` and `sourcemap: true`. The production build now emits separate `react-vendor`, `icons-vendor`, and `audio-engine` chunks with the app entry under the large chunk warning threshold. README, harness architecture, quality rules, and static QA now require real code splitting and reject `chunkSizeWarningLimit` in `vite.config.ts`.

No app UI behavior, project schema, playback, audio rendering, WAV/stem/MIDI export, Handoff behavior, sampling, imported audio, remote AI, accounts, analytics, or cloud sync behavior changed.
