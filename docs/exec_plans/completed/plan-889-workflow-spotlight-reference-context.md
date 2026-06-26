# plan-889-workflow-spotlight-reference-context

## Goal

Make the Command Reference Workflow Spotlight row expose current command target, destination, visible command context, pinned command posture, Search Spotlight relation, explicit focus route, result feedback, audition cue, and next workflow check already available from local Workflow Spotlight guidance.

## Scope

- Add static Workflow Spotlight Command Reference row context for current command-target orientation.
- Keep the row discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Workflow Spotlight focus handling, pinned commands, Quick Actions execution, result labels, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, command chains, macros, tutorials, automatic command routing, automatic focus changes, automatic project edits, command ranking changes, remote AI, accounts, analytics, cloud sync, sampling, imported audio, reference audio import, waveform matching, audio analysis changes, autoplay, render/export changes, or schema changes.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Implementation Notes

- Added Workflow Spotlight Command Reference row context covering current command target, derived workflow zone, Decision Readout, visible jump route, Workflow Navigator counts, Search Spotlight relation, pinned command context, Jump Result feedback, audition cue, and next workflow check.
- Updated README, product docs, quality rules, and QA expectations so the context stays discoverable through Command Reference search, Search Spotlight, row title, and aria-label behavior.
- Preserved local current-command orientation only; no dynamic Command Reference state, command execution from reference rows, macros, command chains, automatic routing, project data changes, playback changes, export changes, remote behavior, or sampler scope changes.

## Decision Log

- Workflow Spotlight Command Reference rows should read as local current-command orientation, not as automation, macro execution, hidden command routing, or remote assistance.
