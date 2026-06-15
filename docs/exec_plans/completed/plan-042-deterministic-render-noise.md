# plan-042-deterministic-render-noise

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue making GrooveForge into a desktop beat-making app that can satisfy working producers while staying easy for first-time composers.

## Goal

Make offline WAV render, stem render, and export meter analysis reproducible from the same saved project data by replacing nondeterministic offline noise with deterministic project-seeded noise. The change should improve export trust without changing realtime performance requirements or introducing samples.

## Non-Goals

- No sampling, audio import, chopping, sampler tracks, plugin hosting, MIDI recording, remote AI, or audio warping.
- No LUFS, true-peak, dithering, or mastering-standards claim in this plan.
- No change to realtime Web Audio noise behavior beyond preserving existing playback stability.
- No new project-file fields unless deterministic render requires them.

## Context Map

- `src/audio/render.ts`: offline WAV/stem render path, export meter analysis, drum noise synthesis.
- `src/audio/scheduler.ts`: realtime playback path, intentionally not the focus of this slice.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA framing.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-042-deterministic-render-noise` and `.worktree/plan-042-deterministic-render-noise` for git repository work.
- Keep export reproducibility tied to musical/render-relevant project data, not transient UI mode or save timestamps.

## Implementation Plan

- [x] Add a stable render seed derived from render-relevant project fields.
- [x] Replace `Math.random()` in offline `addNoise` with deterministic seeded noise.
- [x] Keep realtime scheduler behavior unchanged.
- [x] Update docs and QA expectations around reproducible export meter/WAV/stem renders.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test: load the app, read export meter, toggle Guided/Studio mode without changing musical data, confirm export meter remains stable, start/stop playback, and confirm console errors are empty.

## Review Plan

QA completes before review starts. Review checks that offline render randomness no longer depends on `Math.random()`, seed inputs are render-relevant, metering/export paths share the deterministic render, realtime playback remains untouched, and no sampling-first drift is introduced.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Make offline drum noise deterministic before adding advanced mastering claims. | Producers need repeatable export/meter results from saved project data, and beginners need stable feedback while mixing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created after finding `Math.random()` in the offline render noise path, which weakens export reproducibility. |
| 2026-06-15 | harness_builder | Added render-relevant project seeding and deterministic offline noise samples for WAV, stem, and export meter render paths. |
| 2026-06-15 | quality_runner | Passed typecheck, static QA, quality gate, full verify, diff whitespace check, and browser smoke coverage for stable export meter, playback, and console health. |
| 2026-06-15 | review_judge | Confirmed realtime scheduler noise remains outside this slice and the offline render path no longer uses `Math.random()`. |

## Completion Notes

Completed. Offline drum noise now uses deterministic seeded samples derived from render-relevant project data. WAV export, stem export, and export meter analysis share that deterministic offline render path, while realtime playback behavior remains unchanged.

QA passed:

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test on `http://127.0.0.1:5173/`: export meter stayed exactly `Export meterLimiter activePeak-3.0 dBRMS-20.8 dBHeadroom 0.0 dBLimiter 0.00%43.0 sec` across Guided/Studio mode changes, playback started at `Intro 1.2`, Stop returned to `Ready`, and console warning/error logs were empty.
