# plan-877-handoff-pack-reference-context

## Goal

Make the Command Reference Handoff Pack row expose WAV, stems, MIDI, Handoff Sheet, send order, manifest readiness, export receipt, package check, next export, audition cue, and next delivery check already available from local Handoff Pack guidance.

## Scope

- Add static Handoff Pack Command Reference row context for local deliverable set, send order, manifest/export receipt, package check, and next export posture.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Handoff Pack derivation, export button behavior, render/download handlers, manifest audit, send order, export receipt, package check, next export routing, project data, playback, render/export, Handoff Sheet contents, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, automatic export, batch export, ZIP/archive creation, uploads, sharing, cloud sync, accounts, payments, analytics, hidden generation, hidden mastering, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, audio analysis changes, sampling, imported audio, remote AI, or remote storage.

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

- Updated the Command Reference Handoff Pack row from a compact target-only entry to a static context row that names WAV, stems, MIDI, Handoff Sheet, handoff route, manifest readiness, latest export receipt, export format, package check, send order, next export, audition cue, and next delivery check.
- Documented the row context in README, product docs, and quality rules so Handoff Pack discovery stays aligned with explicit local export actions and handoff readiness checks.
- Added QA expectations for the new docs, quality rule, row target, row context, and visible Command Reference target text.

## Decision Log

- Handoff Pack Command Reference rows should read as local delivery orientation for explicit WAV/stem/MIDI/sheet export and handoff checks rather than automatic packaging, upload, or publishing.
- Keep Handoff Pack Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
