# plan-824-composer-guide-focus-action

## Goal

Add a visible Composer Guide Focus Readout action so the current writing focus can be routed directly from the readout without changing guide scoring or project data.

## Scope

- Add a Focus Readout action button to Composer Guide.
- Route the button through the existing Composer Guide focus handler.
- Preserve existing card Focus buttons, Quick Actions, and Focus Result behavior.
- Update CSS, documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to Composer Guide scoring, card order, focus target derivation, or result labels.
- No project schema, undo history, playback, export, save/load, render, or remote behavior changes.
- No sampler, imported audio, sampling workflow, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed `git diff --check`.
- Passed `python3 harness/scripts/run_qa.py`.
- Passed `npm run typecheck`.
- Passed `python3 harness/scripts/run_quality_gate.py`.
- Passed `npm run build`.
- Passed `npm run qa`.
- Passed `npm run verify`.
- Note: Vite still reports the existing large chunk warning for the main index bundle.

## Decision Log

- The Focus Readout action should call the same `onFocus` handler as the visible Composer Guide cards so readout guidance remains explicit and UI-local.

## Review

- No issues found after QA.
- The readout action is disabled when no Composer Guide target exists and otherwise reuses the same UI-local focus handler as the existing Composer Guide cards.
- No guide scoring, saved project data, undo history, playback, export, remote AI, or sampler behavior changed.
