# plan-838-mode-focus-button-context

## Goal

Make visible Mode Focus Decision and Jump controls expose destination, mode metric, audition, and next-check context before a beginner or producer clicks a Guided or Studio orientation jump.

## Scope

- Add shared visible-button context for the Mode Focus Decision Readout action.
- Add shared visible-button context for direct Mode Focus Jump buttons.
- Derive context from existing Mode Focus cards, summary labels, focus targets, and local orientation posture.
- Preserve Mode Focus scoring, visible labels, jump routing, Quick Actions, result strips, project data, playback, export, and sampler scope.
- Update documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to Mode Focus card derivation, active-card selection, visible button text, jump handlers, Quick Actions command ids, saved project schema, undo history, playback, export, sampler, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Added `modeFocusButtonContext` so visible Mode Focus Decision and Jump buttons expose destination, mode metric, audition cue, and next-check context through matching `title` and `aria-label` attributes.
- Added local metric, audition, and next-check helpers derived from existing Mode Focus card and Guided/Studio summary posture.
- Updated README, product principles, quality rules, and QA harness expectations to keep visible Mode Focus button context aligned with local-first, sample-secondary product scope.

## Decision Log

- Mode Focus visible controls should carry the same practical pre-click posture as the post-click Jump Result: destination, mode metric, audition cue, and next check.
