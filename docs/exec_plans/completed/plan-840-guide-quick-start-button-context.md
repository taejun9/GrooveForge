# plan-840-guide-quick-start-button-context

## Goal

Make visible Guide Quick Start Decision, Bottleneck, Path, Session, and Workflow buttons expose destination, metric, audition, and next-check context before a beginner or producer runs a guide jump.

## Scope

- Add shared visible-button context for Guide Quick Start Decision and Bottleneck controls.
- Add shared visible-button context for direct Path, Session, and Workflow guide buttons.
- Derive context from existing Guide Quick Start decision, completion bottleneck, First Beat Path, Session Pass, Workflow Spotlight, and local result posture.
- Preserve guide scoring, completion scoring, bottleneck selection, jump/focus routing, Quick Actions, result strips, project data, playback, export, and sampler scope.
- Update documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to guide target derivation, priority scoring, completion scoring, bottleneck scoring, visible button text, jump/focus handlers, Quick Actions command ids, saved project schema, undo history, playback, export, sampler, imported audio, remote AI, accounts, analytics, or cloud sync.

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

- Added `guideQuickStartButtonContext` so visible Guide Quick Start Decision, Bottleneck, Path, Session, and Workflow buttons expose destination, metric, context, audition cue, and next-check text through matching `title` and `aria-label` attributes.
- Kept visible button text, guide scoring, completion scoring, bottleneck selection, and existing jump/focus handlers unchanged.
- Updated README, product principles, quality rules, and QA harness expectations to keep Guide Quick Start button context aligned with local-first, sample-secondary direct beat-making scope.

## Decision Log

- Guide Quick Start visible controls should expose the same pre-click posture as their post-click Result feedback so the first action remains explicit for beginners and scannable for producers.
