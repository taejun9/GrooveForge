# plan-834-first-beat-path-command-context

## Goal

Make First Beat Path Quick Actions expose destination, audition, and next-check context before a beginner or producer jumps to the next setup, compose, arrange, mix, or deliver stage.

## Scope

- Add shared command detail context for the current First Beat Path jump command and direct First Beat Path step commands.
- Derive command detail only from existing First Beat Path steps, summary counts, and existing First Beat Path follow-up cue helpers.
- Extend Quick Actions First Beat Path result metrics to reflect destination, audition, and next-check command context.
- Preserve First Beat Path step derivation, visible jump behavior, command ids, jump routing, project data, playback, export, and sampler scope.
- Update documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to First Beat Path scoring, next-step selection, visible UI labels, jump handlers, result labels, Quick Actions command ids, or saved project schema.
- No project schema, undo history, playback, export, render, sampler, imported audio, remote AI, accounts, analytics, or cloud sync changes.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Note: Vite reported the existing large chunk warning during build and verify.

## Implementation Notes

- Added `firstBeatPathCommandDetail` so the current First Beat Path jump command and direct setup, compose, arrange, mix, and deliver commands expose destination, audition cue, and next-check context before execution.
- Extended First Beat Path result metrics to carry the command detail destination, audition cue, and next-check feedback while preserving existing command ids and jump routing.
- Updated README, product principles, quality rules, and QA harness expectations to keep First Beat Path command context aligned with local-first, sample-secondary product scope.

## Decision Log

- First Beat Path command detail should reuse existing First Beat Path follow-up cue helpers so command-palette users see the same destination, audition, and next check that visible jump results already use after the jump.
