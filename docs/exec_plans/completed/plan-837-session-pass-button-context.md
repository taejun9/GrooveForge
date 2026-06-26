# plan-837-session-pass-button-context

## Goal

Make visible Session Pass Decision and Focus controls expose destination, session metric, audition, and next-check context before a beginner or producer clicks a Guided, Studio, Finish, or Delivery pass.

## Scope

- Add shared visible-button context for the Session Pass Decision Readout action.
- Add shared visible-button context for direct Session Pass Focus buttons.
- Derive context from existing Session Pass cards, summary labels, focus targets, and local pass posture.
- Preserve Session Pass scoring, visible labels, focus routing, Quick Actions, result strips, project data, playback, export, and sampler scope.
- Update documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to Session Pass card derivation, active-card selection, visible button text, focus handlers, Quick Actions command ids, saved project schema, undo history, playback, export, sampler, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Added `sessionPassButtonContext` so visible Session Pass Decision and Focus buttons expose destination, session metric, audition cue, and next-check context through matching `title` and `aria-label` attributes.
- Added local metric, audition, and next-check helpers derived from existing Session Pass card and summary posture.
- Updated README, product principles, quality rules, and QA harness expectations to keep visible Session Pass button context aligned with local-first, sample-secondary product scope.

## Decision Log

- Session Pass visible controls should carry the same practical pre-click posture as the post-click Focus Result: destination, session metric, audition cue, and next check.
