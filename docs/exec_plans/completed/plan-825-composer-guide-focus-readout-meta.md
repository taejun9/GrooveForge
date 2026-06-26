# plan-825-composer-guide-focus-readout-meta

## Goal

Show Composer Guide Focus Readout destination and next-check metadata before the user clicks Focus, so beginners know where the writing pass will go and producers can scan the current gap faster.

## Scope

- Add UI-local destination and next-check metadata to the Composer Guide Focus Readout.
- Derive metadata only from the existing Composer Guide focus card and result helper data.
- Preserve the existing Focus Readout action, card Focus buttons, Quick Actions, and Focus Result behavior.
- Update CSS, documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to Composer Guide scoring, card order, focus target derivation, action routing, or result labels.
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

- The readout metadata should reuse existing Composer Guide focus helpers instead of introducing new scoring or routing logic.

## Review

- No issues found after QA.
- Composer Guide Focus Readout metadata is derived from the same selected or highest-priority guide card as the existing readout action.
- The metadata is UI-local and does not change guide scoring, saved project data, undo history, playback, export, remote AI, or sampler behavior.
