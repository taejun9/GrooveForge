# plan-880-export-format-reference-context

## Goal

Make the Command Reference Export Format Readout row expose WAV format, duration, full-mix file, stem count, audible stems, MIDI scope, Handoff Sheet context, export-format priority, direct metric routes, Handoff Pack follow-up, audition cue, and next export check already available from local Handoff Export Format guidance.

## Scope

- Add static Export Format Readout Command Reference row context for deliverable-format review before explicit exports.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Export Format metric derivation, focus routing, direct metric commands, Handoff Pack, export handlers, file names, file contents, render/download behavior, Handoff Sheet text, project data, playback, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, configurable render settings, dither, normalization, automatic export, batch export, ZIP/archive creation, native folder writing, background rendering, uploads, tutorials, macros, command chains, audio analysis changes, platform-loudness guarantees, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Note: Vite reported the existing large chunk warning during `npm run build` and `npm run verify`.

## Implementation Notes

- Updated the Command Reference Export Format Readout row from a compact target-only entry to a static context row that names WAV format, duration, full-mix file, stem count, audible stems, MIDI scope, Handoff Sheet context, export-format priority, direct metric routes, Handoff Pack follow-up, audition cue, and next export check.
- Documented the row context in README, product docs, and quality rules so Export Format Readout discovery stays aligned with explicit local Handoff Export Format focus behavior and deliverable-format checks.
- Added QA expectations for the new docs, quality rule, row target, row context, and visible Command Reference target text.

## Decision Log

- Export Format Readout Command Reference rows should read as local deliverable-format orientation before explicit exports, not as automatic export setup or render execution.
- Keep Export Format Readout Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
