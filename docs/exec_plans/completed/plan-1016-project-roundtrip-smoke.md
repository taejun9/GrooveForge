# plan-1016-project-roundtrip-smoke

## Goal

Strengthen the runtime smoke so every sample-free style and Beat Blueprint project is serialized, parsed back from the local GrooveForge project-file format, and proven exportable after the roundtrip.

## Product Fit

GrooveForge is meant for both working producers and first-time beat makers. Both groups need confidence that a local project file can be saved, reopened, and still produce the same beat, stems, and MIDI handoff artifacts without importing audio or relying on cloud state.

## Scope

- Extended `npm run harness:smoke` to validate `serializeProjectFile` and `parseProjectFile` for every supported style profile and every Beat Blueprint smoke project.
- Verified the roundtripped project preserves style, title, arrangement length, pattern counts, Pattern A/B/C data, mixer state, sound design, arrangement data, mixer track boundary, file names, export analysis, WAV headers, stem analysis, and MIDI bytes.
- Updated README, harness architecture, quality rules, and QA expectations so save/load roundtrip evidence is part of the runtime smoke contract.

## Non-Goals

- No UI behavior changes, project schema changes, save/open dialog changes, local draft changes, snapshot changes, playback changes, render/export algorithm changes, or package/distribution work.
- No media files written to disk, GUI launch, browser automation, Electron launch, network calls, sampling, imported audio, sampler devices, audio clips, remote AI, accounts, analytics, payments, or cloud sync.

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

`npm run harness:smoke` now proves 28/28 `.grooveforge.json` save/load roundtrips across 14 Beat Blueprints and 14 supported style-profile starts before WAV/stem/MIDI export checks. `npm run build` and `npm run verify` completed without a Vite large-chunk warning.

## Decision Log

- 2026-06-28: Use the existing runtime smoke instead of a separate command because sample-free project generation, render analysis, WAV/stem/MIDI checks, and project file roundtrip should prove the same first-session beat lifecycle together.
- 2026-06-28: Compare normalized project structures with stable key ordering so the smoke checks musical/project data preservation rather than object property insertion order after parse normalization.
- 2026-06-28: Completed after QA, typecheck, quality gate, runtime smoke, build, desktop smoke, full QA, and verify passed.

## Status

- Completed.
