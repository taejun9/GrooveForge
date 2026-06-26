# plan-836-beat-spine-button-context

## Goal

Make visible Beat Spine Jump and Apply controls expose destination, metric, audition, and next-check context before a beginner or producer clicks a core beat-making move.

## Scope

- Add shared visible-button context for Beat Spine Jump controls.
- Add shared visible-button context for Beat Spine Apply controls when an apply action is available.
- Derive context from existing Beat Spine cards/actions, summary counts, target labels, and existing Beat Spine result cue helpers.
- Preserve Beat Spine scoring, visible labels, jump/apply routing, Quick Actions, result strips, project data, playback, export, and sampler scope.
- Update documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to Beat Spine scoring, next-card selection, action derivation, visible button text, click handlers, Quick Actions command ids, saved project schema, undo history, playback, export, sampler, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Added `beatSpineJumpButtonContext` so visible Beat Spine Jump controls expose destination, beat-core metric, audition cue, and next-check context through matching `title` and `aria-label` attributes.
- Added `beatSpineApplyButtonContext` so visible Beat Spine Apply controls expose action, card posture, selected-Pattern scope, audition cue, and next-check context through matching `title` and `aria-label` attributes.
- Passed the current selected Pattern into `BeatSpine` only for UI-local button context so Apply cues match existing Beat Spine result helper language without changing project data or handlers.
- Updated README, product principles, quality rules, and QA harness expectations to keep visible Beat Spine button context aligned with local-first, sample-secondary product scope.

## Decision Log

- Beat Spine visible controls should carry the same practical pre-click posture as the post-click Jump and Apply result strips: destination or action, metric, audition cue, and next check.
