# plan-229-export-smoke

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat-making mini DAW that can satisfy working producers while staying approachable for beginners. Keep sampling secondary and prove the direct beat workstation can make and export a sample-free beat.

## Goal

Add a Node runtime smoke harness that verifies the core sample-free 8-bar beat/export contract without needing a browser dev server. The smoke should execute the real TypeScript domain, render, and MIDI modules, build a sample-free 8-bar project, verify audible full-mix and stem analysis, verify WAV blob headers and file names, and verify MIDI bytes and file name.

## Non-Goals

- No browser automation, dev-server dependency, Electron launch, or GUI smoke.
- No new audio engine, rendering algorithm, playback scheduling, project schema, saved UI state, sampling, imported audio, sampler devices, audio clips, remote AI, plugin hosting, accounts, analytics, or cloud sync.
- No replacement of existing static QA, typecheck, or build commands.

## Context Map

- `src/domain/workstation.ts`: starter project, blueprints, pattern chains, arrangement totals, project data.
- `src/audio/render.ts`: deterministic export analysis, stem analysis, WAV blob generation, export file names.
- `src/audio/midi.ts`: MIDI file generation and file names.
- `harness/scripts/`: QA scripts and the new runtime smoke script/loader.
- `package.json`: validation scripts.
- `README.md`, `docs/quality/rules.md`, `docs/product/product.md`: durable command and product proof documentation.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-229-export-smoke` and `.worktree/plan-229-export-smoke` for git repository work.
- Keep the smoke local-only and deterministic; it must not write export artifacts or require network/browser permissions.

## Implementation Plan

- [x] Export pure WAV Blob helpers from the render module while preserving existing download behavior.
- [x] Add a small Node ESM loader for extensionless TypeScript imports under `src/`.
- [x] Add a runtime smoke script that constructs a sample-free 8-bar beat, verifies analysis, WAV, stem, and MIDI outputs, and fails loudly with actionable messages.
- [x] Wire `npm run harness:smoke` into `npm run verify`.
- [x] Update docs, quality gates, and static QA expectations.
- [x] Run QA, review, complete the plan, merge, push, and clean up.

## QA Plan

- `npm run harness:smoke`
- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser/dev-server smoke if the environment permits local server binding.

## Review Plan

QA completes before review starts. Review checks runtime smoke coverage, local-only behavior, no artifact writes, no schema/playback/render algorithm drift, no sampling-first drift, and compatibility with existing validation commands.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a Node runtime smoke harness instead of another UI-only affordance. | Browser smoke is blocked by localhost binding, and the product needs stronger evidence that the sample-free beat/export contract works. |
| 2026-06-17 | Use Node `--experimental-strip-types` plus a small local ESM loader instead of adding a transpiler dependency. | The smoke needs to execute real TypeScript modules while staying local, deterministic, and dependency-light. |
| 2026-06-17 | Expose pure WAV Blob helpers beside existing browser download handlers. | The runtime smoke can verify WAV headers and file names without triggering DOM downloads or writing media artifacts. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created after confirming static QA exists but no runtime harness currently executes the domain/render/MIDI export contract. |
| 2026-06-17 | harness_builder | Added `createMixWavBlob` and `createStemWavBlob`, preserving existing `exportWav` and `exportStems` click/download behavior. |
| 2026-06-17 | harness_builder | Added the TypeScript extension loader/register pair and `harness/scripts/run_runtime_smoke.mjs`. |
| 2026-06-17 | harness_builder | Wired `npm run harness:smoke` into `npm run verify` and documented the runtime smoke contract in README, product, harness, and quality docs. |
| 2026-06-17 | quality_runner | Passed `npm run harness:smoke`, `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, and `npm run verify`. |
| 2026-06-17 | quality_runner | Browser/dev-server smoke remained blocked by local server binding: `listen EPERM: operation not permitted 127.0.0.1:5173`; escalated `npm run dev -- --host 127.0.0.1` was rejected by policy. |
| 2026-06-17 | quality_runner | After moving this plan to completed and creating the review mirror, passed `python3 harness/scripts/run_qa.py`, `git diff --check`, and `npm run verify`. |

## Completion Notes

Implemented and QA passed. The runtime smoke is part of `npm run verify`; the completion review mirror is `docs/reviews/plan-229-export-smoke-review.md`. Browser/dev-server smoke remains blocked by local server binding in this environment.
