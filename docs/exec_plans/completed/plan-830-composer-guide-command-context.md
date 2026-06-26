# plan-830-composer-guide-command-context

## Goal

Make Composer Guide Quick Actions expose the same writing-lane, destination, guide metric, audition, and next-check context as the visible Composer Guide Focus actions so command-palette users can understand a guide focus command before running it.

## Scope

- Add UI-local context detail for the current Composer Guide focus command and direct Composer Guide card commands.
- Derive command context only from existing Composer Guide cards, the current highest-priority guide card, and local Composer Guide summary metadata.
- Preserve command ids, command routing, focus result behavior, Composer Guide scoring, card order, project data, playback, export, and sampler scope.
- Update documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to Composer Guide scoring, card derivation, focus target routing, recommendations, or result labels.
- No project schema, undo history, playback, export, save/load, render, sampler, imported audio, remote AI, accounts, analytics, or cloud sync changes.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

Build note: Vite repeated the existing large chunk warning for the main app bundle.

## Implementation Notes

- Added `composerGuideFocusActionContext(card, summary)` as the shared source for destination, guide metric, audition cue, and next-check context.
- Added `composerGuideFocusCommandDetail(card, summary)` and used it for the current Composer Guide focus command and direct Composer Guide card commands.
- Updated Quick Actions Composer Guide result metrics to surface command detail context, guide metric, audition cue, and next-check feedback.
- Updated README, product docs, quality rules, and QA harness expectations for Composer Guide command detail context.

## Decision Log

- Command detail should reuse the same Composer Guide focus action context helper so visible buttons and command search describe the same destination, metric, audition, and next check.
- Composer Guide command detail remains UI-local because it derives from existing guide cards and summary metadata, not saved project data.
- QA completed before review and plan completion.
