# plan-823-beat-spine-decision-action

## Goal

Add an explicit Beat Spine Decision Readout action so the current recommended core-axis move can be run directly from the readout, while preserving existing Jump and Apply handlers.

## Scope

- Add a visible Decision Readout action button to Beat Spine.
- Route the button through the same existing Jump or Apply handlers used by Beat Spine cards.
- Keep Jump Result and Apply Result behavior UI-local and shared with existing card actions.
- Update CSS, documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to Beat Spine scoring, next-card selection, card order, or action derivation.
- No project schema, undo history, playback, export, save/load, render, or remote behavior changes.
- No sampler, imported audio, sampling workflow, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed `git diff --check`
- Passed `python3 harness/scripts/run_qa.py`
- Passed `npm run typecheck`
- Passed `python3 harness/scripts/run_quality_gate.py`
- Passed `npm run build`
- Passed `npm run qa`
- Passed `npm run verify`

Build note: Vite still reports the existing large chunk warning.

## Decision Log

- The Decision Readout action should only call the existing card Jump or Apply handler so one-click guidance remains explicit and auditable.

## Review

- Added a Beat Spine Decision Readout action that runs the current next card's existing Apply action or Jump action.
- Confirmed Jump Result and Apply Result behavior stays shared with card actions.
- Confirmed Beat Spine scoring, next-card selection, project schema, undo history, playback, export, and sampling boundaries are unchanged.
