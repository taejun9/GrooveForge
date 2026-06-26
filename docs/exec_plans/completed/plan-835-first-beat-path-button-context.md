# plan-835-first-beat-path-button-context

## Goal

Make visible First Beat Path jump buttons expose destination, audition, and next-check context before a beginner or producer clicks a setup, compose, arrange, mix, or deliver jump.

## Scope

- Add shared visible-button context for First Beat Path step buttons.
- Derive button context from existing First Beat Path steps, summary counts, and direct check hints.
- Add button `title` and `aria-label` context without changing button labels, jump routing, result strips, path scoring, or saved project data.
- Update documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to First Beat Path scoring, next-step selection, visible step labels, jump handlers, Quick Actions command ids, result labels, saved project schema, undo history, playback, export, sampler, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Added `firstBeatPathButtonContext` so each visible First Beat Path step button exposes destination, path count, audition cue, and next-check context through matching `title` and `aria-label` attributes before a user clicks.
- Added `firstBeatPathButtonAuditionCue` to keep the pre-click button cue local and derived from the visible First Beat Path step.
- Updated README, product principles, quality rules, and QA harness expectations to keep visible First Beat Path button context aligned with local-first, sample-secondary product scope.

## Decision Log

- Visible First Beat Path step buttons should carry the same practical pre-click posture as command-palette actions: destination, path count, audition cue, and next check.
