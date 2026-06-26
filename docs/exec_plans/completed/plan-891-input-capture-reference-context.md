# plan-891-input-capture-reference-context

## Goal

Make the Command Reference Create input rows expose Keyboard Capture posture, Capture Step Mode placement, MIDI Input status, Editor Audition target, local input/audition result feedback, audition cue, and next input check already available from local input guidance.

## Scope

- Add static Command Reference row context for Keyboard Capture, Capture Step Mode, MIDI Input, and Editor Audition.
- Keep the rows discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Keyboard Capture toggling, capture target/defaults, Capture Step Mode behavior, Web MIDI permission handling, MIDI arm/disarm behavior, Editor Audition one-shot synthesis, selected-event routing, project data, playback, export, and sampler scope.

## Non-Goals

- No recording, audio input, MIDI output, MIDI clock sync, automatic note capture, hidden note insertion, autoplay, dynamic Command Reference state, command execution from Command Reference rows, command chains, macros, sampler devices, imported audio, sampling, remote AI, accounts, analytics, cloud sync, render/export changes, or schema changes.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Implementation Notes

- Added Command Reference row context for Keyboard Capture, Capture Step Mode, MIDI Input, and Editor Audition in the Create section.
- Updated README, product docs, quality rules, and QA expectations so input/audition context stays discoverable through Command Reference search, Search Spotlight, row title, and aria-label behavior.
- Preserved explicit local input orientation only; no recording, audio input, MIDI output, hidden note insertion, automatic capture, command chains, project data changes beyond existing explicit handlers, playback changes, export changes, remote behavior, or sampler scope changes.

## Decision Log

- Input Capture Command Reference rows should read as explicit local input orientation, not as recording, automatic note capture, MIDI output, sampler, or remote assistance.
