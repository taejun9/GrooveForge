# plan-887-session-brief-compass-reference-context

## Goal

Make the Command Reference Session Brief Compass row expose local direction, reference, artist/vocal context, handoff readiness cards, Brief Compass focus route, direct brief card commands, local Focus Result feedback, Delivery Target, export readiness, package readiness, audition cue, and next brief/handoff check already available from local Session Brief Compass guidance.

## Scope

- Add static Session Brief Compass Command Reference row context for brief and handoff orientation.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, compass card derivation, card order, focus routing, manual Session Brief editing, Session Brief Starter behavior, Handoff Sheet text, export handlers, file names, file contents, render/download behavior, project data, playback, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, automatic brief generation, remote AI, reference audio import, waveform matching, vocal recording, lyric generation, automatic export, batch export, retries, ZIP/archive creation, native folder writing, background rendering, uploads, publishing/licensing claims, platform compliance claims, tutorials, macros, command chains, audio analysis changes, sampling, imported audio, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build` (Vite reported the existing large chunk warning.)
- Passed: `npm run qa`
- Passed: `npm run verify` (14/14 sample-free 8-bar blueprints and 14/14 supported style profiles passed.)

## Implementation Notes

- Added static Session Brief Compass row context in Command Reference for local direction, reference, artist/vocal context, handoff readiness cards, Brief Compass focus route, direct brief card commands, local Focus Result feedback, Delivery Target, export readiness, package readiness, audition cue, and next brief/handoff check.
- Updated README, product docs, quality rules, and QA harness text expectations for the new row context.
- Preserved command execution, compass card derivation, card order, focus routing, manual Session Brief editing, Session Brief Starter behavior, Handoff Sheet text, export handlers, file contents, render/download behavior, and sampling boundaries.

## Decision Log

- Session Brief Compass Command Reference rows should read as local brief/handoff orientation, not as remote generation, reference import, or audio analysis.
