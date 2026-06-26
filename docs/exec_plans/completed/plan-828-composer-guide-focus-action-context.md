# plan-828-composer-guide-focus-action-context

## Goal

Make the Composer Guide Focus Readout action carry the same destination, metric, audition, and next-check context as the visible readout so users understand the action before clicking or when using assistive tooling.

## Scope

- Add a UI-local action context label to the Composer Guide Focus Readout summary.
- Use the context label for the Focus Readout action title and aria-label.
- Derive the label only from the existing Composer Guide focus card and readout metadata.
- Preserve Focus Readout metadata, Focus action routing, card Focus buttons, Quick Actions, and Focus Result behavior.
- Update documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to Composer Guide scoring, card order, focus target derivation, action routing, or result labels.
- No project schema, undo history, playback, export, save/load, render, or remote behavior changes.
- No sampler, imported audio, sampling workflow, remote AI, accounts, analytics, or cloud sync.

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

- Added `actionLabel` to the Composer Guide Focus Summary.
- Reused the Focus Readout destination, guide metric, audition cue, and next-check text inside the action title and `aria-label`.
- Documented the context-labeled action contract in product, quality, README, and harness expectations.

## Decision Log

- The action label should be generated in the same focus summary as the visible metadata so the button title, aria-label, and readout remain consistent.
- The Focus Readout action label remains UI-local because it is derived from existing Composer Guide cards and readout labels, not saved project data.
- QA completed before review and plan completion.
