# plan-230-all-style-export-smoke

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat-making mini DAW that can satisfy working producers while staying approachable for beginners. Keep sampling secondary and prove that the direct beat workstation can make and export beats across supported genres.

## Goal

Extend the runtime smoke harness so it validates every supported style profile, not only one blueprint-backed style. The smoke should construct a sample-free 8-bar beat for each style from existing domain data, verify editable drum/808/synth/chord events, verify full-mix and stem export analysis, verify WAV bytes/file names, verify MIDI bytes/file name, and keep the checks local-only without writing media artifacts.

## Non-Goals

- No browser automation, dev-server dependency, Electron launch, or GUI smoke.
- No new product feature surface, UI copy, schema, audio engine, rendering algorithm, playback scheduling, sample import, imported audio, sampler devices, audio clips, remote AI, plugin hosting, accounts, analytics, or cloud sync.
- No replacement of existing QA, typecheck, build, or single-command verify behavior.

## Context Map

- `src/domain/workstation.ts`: supported `styleProfiles`, style pattern generation, starter project, arrangement chains, project timing.
- `src/audio/render.ts`: deterministic export analysis, stem analysis, WAV Blob helpers, file names.
- `src/audio/midi.ts`: MIDI byte generation and file name.
- `harness/scripts/run_runtime_smoke.mjs`: existing Node runtime smoke harness.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `docs/architecture/harness.md`: durable runtime smoke and all-genre proof documentation.
- `harness/scripts/run_qa.py`: static repository expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-230-all-style-export-smoke` and `.worktree/plan-230-all-style-export-smoke`.
- The smoke must derive style coverage from `styleProfiles` and must fail if any supported style cannot produce the sample-free beat/export contract.

## Implementation Plan

- [x] Refactor the runtime smoke script into reusable per-project/per-style checks.
- [x] Build a sample-free 8-bar smoke project for every `styleProfiles` entry using existing style pattern data and sound presets.
- [x] Keep the prior blueprint-backed drill smoke coverage while adding all-style style-profile coverage.
- [x] Update docs and static QA expectations for all-style runtime smoke coverage.
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

QA completes before review starts. Review checks that all supported styles are covered from domain data, the smoke remains local-only and artifact-free, existing blueprint smoke coverage remains, no schema/render/playback drift occurred, and sampling stays secondary.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Extend runtime smoke to all `styleProfiles`. | The product promise is all-genre beat creation; one drill blueprint smoke is useful but too narrow to prove that every supported style can export a sample-free beat. |
| 2026-06-17 | Validate every Beat Blueprint as well as every style profile. | Beat Blueprints are the fastest beginner entry point, while style profiles are the all-genre producer surface; both need to satisfy the same export contract. |
| 2026-06-17 | Build style smoke projects from `styleProfiles`, `createStylePatternSet`, `styleSoundPreset`, and `createPatternChain`. | This keeps the smoke tied to actual domain data instead of duplicating genre fixtures in the harness. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created after confirming runtime smoke currently validates one blueprint-backed drill project while the domain defines ten supported style profiles. |
| 2026-06-17 | harness_builder | Refactored `harness/scripts/run_runtime_smoke.mjs` into reusable per-case checks and added blueprint plus style-profile smoke cases. |
| 2026-06-17 | harness_builder | The smoke now validates 4/4 Beat Blueprints and 10/10 supported style profiles for sample-free 8-bar mix/stem/MIDI export coverage. |
| 2026-06-17 | doc_gardener | Updated README, product, quality, harness docs, and static QA expectations to describe all-style runtime smoke coverage. |
| 2026-06-17 | quality_runner | Passed `npm run harness:smoke`, `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `npm run qa`. |
| 2026-06-17 | quality_runner | Browser/dev-server smoke was not rerun for this harness-only change; prior environment attempts remain blocked by local server binding policy. |
| 2026-06-17 | quality_runner | After moving this plan to completed and creating the review mirror, passed `python3 harness/scripts/run_qa.py`, `git diff --check`, and `npm run verify`. |

## Completion Notes

Implemented and QA passed. The runtime smoke now validates every current style profile and Beat Blueprint through sample-free 8-bar mix/stem/MIDI export checks. The completion review mirror is `docs/reviews/plan-230-all-style-export-smoke-review.md`.
