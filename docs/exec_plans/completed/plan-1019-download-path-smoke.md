# plan-1019-download-path-smoke

## Goal

Add durable smoke evidence that GrooveForge's local browser download path works for project JSON, mix WAV, stem WAVs, arrangement MIDI, and Handoff Sheet exports without writing media artifacts.

## Product Fit

GrooveForge's first product target ends in local deliverables. Producers need dependable files for DAW handoff, and beginners need export buttons that actually produce named downloads. This plan strengthens the final delivery path while keeping GrooveForge a direct beat-composition workstation with sampling as secondary optional scope.

## Scope

- Added `src/platform/downloads.ts` as a shared browser download helper for Blob, project JSON, and text downloads.
- Routed WAV/stem, MIDI, project-file, and Handoff Sheet export paths through the shared helper without changing generated file contents.
- Extended runtime smoke with a mocked DOM download check that verifies Blob URL creation, anchor filename/type metadata, click calls, URL revocation, MIME types, and non-empty Blob payloads for the local deliverable set.
- Updated README, harness architecture, quality rules, and QA expectations for the new download-path evidence.

## Non-Goals

- No browser automation, GUI launch, Electron launch, installer/signing/notarization, project schema change, render algorithm change, MIDI encoding change, Handoff Sheet copy rewrite, cloud sync, accounts, analytics, payments, ads, remote AI, imported audio, sample browsing, sampler MVP work, or media files written to disk.

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

`npm run harness:smoke` now proves 8/8 mocked Blob URL downloads for project JSON, mix WAV, 4 stem WAVs, arrangement MIDI, and Handoff Sheet files after the all-style runtime export checks.

## Decision Log

- 2026-06-28: Address the remaining delivery residual risk from plan-1018 by testing the shared browser download seam with a mocked DOM instead of adding brittle browser automation.
- 2026-06-28: Kept the smoke browserless and fileless by mocking `document.createElement`, `URL.createObjectURL`, and `URL.revokeObjectURL`; this verifies the local download contract without launching a browser or writing artifacts.
- 2026-06-28: Completed after QA, typecheck, quality gate, runtime smoke, build, desktop smoke, full QA, and verify passed.

## Status

- Completed.
