# plan-870-stem-audition-reference-context

## Goal

Make the Command Reference Stem Audition Readout, Stem Audition Decision, and Stem Audition rows expose the full-mix, stem comparison, current audition posture, decision target, direct stem route, audition cue, and next-check context already available from local Stem Audition guidance.

## Scope

- Add static Stem Audition Command Reference row context for mix-stage full-mix and stem comparison.
- Keep the rows discoverable through existing Command Reference search, Search Spotlight, title, and aria-label behavior.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight behavior, Stem Audition readout derivation, decision routing, mixer solo/mute routing, direct pad routing, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, command execution from Command Reference rows, Stem Audition scoring changes, mixer-level changes outside explicit stem audition commands, automatic mix fixes, hidden mastering, automatic action runs, tutorials, macros, command chains, autoplay, auto-save, auto-export, audio analysis, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Updated the Command Reference Stem Audition Readout, Stem Audition Decision, and Stem Audition rows from compact target-only entries to static context rows that name full-mix posture, soloed-stem/manual audition state, mixer solo/mute posture, decision target, direct stem route, audition cue, and next check.
- Documented the row context in README, product docs, and quality rules so Stem Audition discovery stays aligned with local full-mix/stem comparison and explicit mixer solo/mute routing.
- Added QA expectations for the new docs, quality rule, row targets, and row contexts.

## Decision Log

- Stem Audition should read as local mix-stage orientation for full-mix and stem comparison rather than an automatic mixer, hidden mastering path, or sampling workflow.
- Keep Stem Audition Command Reference context static and read-only; it should improve discovery through existing search, Spotlight, title, and aria-label behavior without adding command execution from reference rows.
