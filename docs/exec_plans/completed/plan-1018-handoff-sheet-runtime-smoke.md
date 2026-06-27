# plan-1018-handoff-sheet-runtime-smoke

## Goal

Add runtime smoke evidence that GrooveForge's Handoff Sheet deliverable is generated from real project/render data for every supported style profile, Beat Blueprint, and legacy migration smoke case.

## Product Fit

GrooveForge is a direct beat workstation, not a sampling-first app. Producers and beginners both need the final local handoff package to be dependable after composing, arranging, mixing, and exporting. Checking the Handoff Sheet in the runtime smoke closes a delivery gap without changing the sample-free first product target.

## Scope

- Added `src/audio/handoff.ts` as the shared pure Handoff Sheet generator for UI export and runtime smoke checks.
- Imported the Handoff Sheet generator into `harness/scripts/run_runtime_smoke.mjs`.
- Validated Handoff Sheet file names, required sections, project identity, BPM/key/style, Delivery Target, Session Brief, arrangement blocks, export meter, and stem meter content for each smoke project.
- Kept the runtime smoke free of media-file writes, network calls, remote AI, sampling, sampler devices, and audio clips.
- Updated README, harness architecture, quality rules, and QA expectations so the documented harness matches the new Handoff Sheet checks.

## Non-Goals

- No Handoff Sheet UX redesign, copy rewrite, download behavior change, project schema change, render algorithm change, MIDI change, stem routing change, package/distribution work, Electron menu change, or browser automation.
- No cloud sync, accounts, analytics, payments, ads, remote AI, imported audio, sampler MVP work, or sample-pack browsing.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run harness:smoke`
- Passed: `npm run build`
- Passed: `npm run desktop:smoke`
- Passed: `npm run qa`
- Passed: `npm run verify`

`npm run harness:smoke` now proves 29/29 Handoff Sheet text deliverables after local project-file roundtrips, full-mix/stem WAV checks, MIDI checks, and legacy chord-event migration.

## Decision Log

- 2026-06-28: Focus the plan on final deliverable evidence because WAV, stems, MIDI, project roundtrip, desktop menu bridge, and legacy chord migration are already covered by previous runtime smoke plans.
- 2026-06-28: Moved pure Handoff Sheet generation to `src/audio/handoff.ts` so UI export and runtime smoke use the same text generator without importing browser/UI helper modules into Node smoke.
- 2026-06-28: Completed after QA, typecheck, quality gate, runtime smoke, build, desktop smoke, full QA, and verify passed.

## Status

- Completed.
