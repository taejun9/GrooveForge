# plan-882-handoff-manifest-audit-reference-context

## Goal

Make the Command Reference Handoff Manifest Audit row expose planned WAV, stems, MIDI, and Handoff Sheet file readiness, latest receipt context, next missing delivery step, manifest status, package readiness, Handoff Pack follow-up, audition cue, and next manifest check already available from local Handoff Manifest Audit guidance.

## Scope

- Add static Handoff Manifest Audit Command Reference row context for planned-file readiness review before explicit exports.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Handoff Pack item statuses, file manifest derivation, Manifest Audit readiness derivation, receipt derivation, focus routing, Send Order, package checks, export handlers, file names, file contents, render/download behavior, Handoff Sheet text, project data, playback, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, automatic export, batch export, retries, ZIP/archive creation, native folder writing, background rendering, uploads, publishing/licensing claims, platform compliance claims, tutorials, macros, command chains, audio analysis changes, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Handoff Manifest Audit row from a compact target-only entry to a static context row that names planned WAV/stems/MIDI/Handoff Sheet readiness, latest export receipt context, next missing delivery step, manifest status, package readiness, Handoff Pack follow-up, focus route, audition cue, and next manifest check.
- Documented the row context in README, product docs, and quality rules so Handoff Manifest Audit discovery stays aligned with explicit local planned-file readiness behavior and manifest checks.
- Added QA expectations for the new docs, quality rule, row target, row context, and visible Command Reference target text.

## Decision Log

- Handoff Manifest Audit Command Reference rows should read as local planned-file readiness orientation before explicit export actions, not as automatic package creation or filesystem automation.
- Keep Handoff Manifest Audit Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
