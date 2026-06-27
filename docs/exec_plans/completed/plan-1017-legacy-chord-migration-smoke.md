# plan-1017-legacy-chord-migration-smoke

## Goal

Preserve legacy single-pattern chord events during project-file migration and add runtime smoke evidence that older local project files can still open, migrate to Pattern A/B/C, and export.

## Product Fit

GrooveForge must be dependable for working producers and first-time beat makers. If someone reopens an older local project, harmonic data should not disappear. Preserving legacy chord events keeps existing beat ideas intact while maintaining the current sample-free direct-composition project model.

## Scope

- Fixed legacy `parseProjectFile` migration so top-level `chordEvents` are migrated into the Pattern A/B/C clone when present.
- Added runtime smoke coverage for a legacy single-pattern `.grooveforge.json` project with chord events and missing newer optional fields.
- Verified migrated legacy projects preserve drums, 808/bass, Synth melody, chords, defaults, arrangement, mixer, project-file roundtrip, and WAV/stem/MIDI export behavior.
- Updated docs and QA expectations for legacy chord-event migration coverage.

## Non-Goals

- No project file version bump, new schema, UI behavior changes, save/open dialog changes, local draft changes, snapshot changes, playback algorithm changes, render/export algorithm changes, or package/distribution work.
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

`npm run harness:smoke` now proves 1/1 legacy single-pattern chord-event migration and 29/29 `.grooveforge.json` save/load roundtrips before WAV/stem/MIDI export checks. `npm run build` and `npm run verify` completed without a Vite large-chunk warning.

## Decision Log

- 2026-06-28: Treat top-level legacy `chordEvents` as musical project data, not disposable UI state, and migrate it into the cloned Pattern A/B/C data alongside drums, 808/bass, and melody notes.
- 2026-06-28: Kept the migration inside the existing project-file version because missing legacy chord preservation is a parser normalization fix, not a new saved schema.
- 2026-06-28: Completed after QA, typecheck, quality gate, runtime smoke, build, desktop smoke, full QA, and verify passed.

## Status

- Completed.
