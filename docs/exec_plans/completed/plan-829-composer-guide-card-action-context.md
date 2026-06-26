# plan-829-composer-guide-card-action-context

## Goal

Make each Composer Guide card Focus action carry the same writing-lane, destination, guide metric, audition, and next-check context as the Composer Guide Focus Readout so users can understand card-level focus actions before clicking or when using assistive tooling.

## Scope

- Add a UI-local card action context label for Composer Guide cards.
- Use the context label for each card Focus action title and aria-label.
- Derive the label only from existing Composer Guide cards, their focus target, and local Composer Guide summary metadata.
- Preserve card scoring, order, focus routing, Quick Actions, Focus Readout, Focus Result behavior, and project data.
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

- Added `composerGuideFocusActionLabel(card, summary)` as the shared action-context label.
- Reused the same label for the Composer Guide Focus Readout action and each Composer Guide card Focus button.
- Added card Focus button `aria-label` and title context for writing lane, destination, guide metric, audition cue, and next check.
- Updated README, product docs, quality rules, and QA harness expectations for card-level action context.

## Decision Log

- Card Focus action labels should be derived beside the existing Composer Guide summary so readout action and card action context stay aligned while remaining UI-local.
- The card Focus action label remains UI-local because it is derived from existing Composer Guide cards and local summary metadata, not saved project data.
- QA completed before review and plan completion.
