# plan-888-reference-alignment-reference-context

## Goal

Make the Command Reference Reference Alignment row expose written-reference fit, direction, arrangement form, mix posture, listen cue, handoff readiness, Reference Alignment focus route, direct alignment card commands, local Focus Result feedback, Delivery Target, export/stem/package readiness, audition cue, and next listening/handoff check already available from local Reference Alignment guidance.

## Scope

- Add static Reference Alignment Command Reference row context for written-reference and handoff orientation.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, reference-card derivation, card order, focus routing, manual Session Brief editing, Brief Compass, Session Brief Starter, Listening Pass, Handoff Sheet text, export handlers, file names, file contents, render/download behavior, project data, playback, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, reference audio import, waveform matching, media uploads, remote analysis, remote AI, automatic brief generation, vocal recording, lyric generation, automatic export, batch export, retries, ZIP/archive creation, native folder writing, background rendering, uploads, publishing/licensing claims, platform compliance claims, tutorials, macros, command chains, audio analysis changes, sampling, imported audio, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Implementation Notes

- Added Reference Alignment Command Reference row context covering written-reference fit, direction, arrangement form, mix posture, listen cue, handoff readiness, focus route, direct card commands, Focus Result feedback, Delivery Target, export/stem/package readiness, audition cue, and next listening/handoff check.
- Updated README, product docs, quality rules, and QA expectations so the context stays discoverable through Command Reference search, Search Spotlight, row title, and aria-label behavior.
- Preserved local written-reference orientation only; no reference audio import, waveform matching, remote analysis, command execution from reference rows, project data changes, playback changes, export changes, or sampler scope changes.

## Decision Log

- Reference Alignment Command Reference rows should read as local written-reference orientation, not as reference-track import, waveform matching, sampling, or remote analysis.
